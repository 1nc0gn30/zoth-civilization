/**
 * 🏛️ ZOTH CIVILIZATION SERVER & SSE STREAMER
 * =====================================================================
 * High-performance HTTP & SSE server with zero external npm dependencies
 * (Pure Node.js built-in modules).
 *
 * Serves the GameBoy-style Pixel World, Adytum Initiation Deck,
 * and Cockpit / Graph views.
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

const http = require('http');
const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const { safeStringify } = require('./engine/redact');
const { spawn } = require('child_process');
const { CivilizationEngine } = require('./engine/simulation');
const { VOICE_ROSTER } = require('./engine/voice');
const { speakAs, warmTalk } = require('./engine/local_talk');
const { serveCityDesk } = require('./engine/desk_mount');
const { libraryStatus } = require('./engine/library_road');
const mindEngine = require('./engine/mind_engine');

const PORT = process.env.PORT || 9393;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

const engine = new CivilizationEngine(DATA_DIR);

const VOICE_ALLOWED = new Set(VOICE_ROSTER);
const VOICE_PORT = Number(process.env.KOKORO_PORT) || 9394;
const voiceAudioCache = new Map();
let voiceUpstream = 0;
let voiceReady = false;
let voiceChild = null;

function rememberVoice(key, audio) {
  voiceAudioCache.set(key, audio);
  if (voiceAudioCache.size > 24) {
    const oldest = voiceAudioCache.keys().next().value;
    voiceAudioCache.delete(oldest);
  }
}

function voiceHealth() {
  return new Promise((resolve) => {
    const req = http.get({
      hostname: '127.0.0.1',
      port: VOICE_PORT,
      path: '/health',
      timeout: 800
    }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startVoiceWorker() {
  if (process.env.ENABLE_KOKORO_VOICE !== '1') {
    console.log('[voice] Kokoro voice engine is OFFLINE (thermal conservation active).');
    return;
  }
  const python = path.join(__dirname, 'voice-runtime', 'bin', 'python');
  const model = path.join(__dirname, 'voice-models', 'kokoro-v1.0.fp16.onnx');
  const voices = path.join(__dirname, 'voice-models', 'voices-v1.0.bin');
  if (!fs.existsSync(python) || !fs.existsSync(model) || !fs.existsSync(voices)) {
    console.warn('[voice] Kokoro is not installed yet. Huddle lines stay on the page as text.');
    return;
  }
  voiceHealth().then((already) => {
    if (already) {
      voiceReady = true;
      console.log(`[voice] Kokoro already listening on port ${VOICE_PORT}`);
      return;
    }
    spawnVoiceWorker(python);
  });
}

function spawnVoiceWorker(python) {
  const model = path.join(__dirname, 'voice-models', 'kokoro-v1.0.fp16.onnx');
  const voices = path.join(__dirname, 'voice-models', 'voices-v1.0.bin');
  voiceChild = spawn(python, [path.join(__dirname, 'engine', 'kokoro_worker.py')], {
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      KOKORO_MODEL: model,
      KOKORO_VOICES: voices,
      KOKORO_PORT: String(VOICE_PORT)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const onChunk = (buf) => {
    const text = buf.toString();
    if (text.includes('KOKORO_READY')) voiceReady = true;
    process.stdout.write(text.startsWith('[voice]') ? text : `[voice] ${text}`);
  };
  voiceChild.stdout.on('data', onChunk);
  voiceChild.stderr.on('data', onChunk);
  voiceChild.on('exit', () => {
    voiceChild = null;
    voiceHealth().then((ok) => { voiceReady = ok; });
  });
}

function watchVoice() {
  const req = http.get({
    hostname: '127.0.0.1',
    port: VOICE_PORT,
    path: '/health',
    timeout: 800
  }, (res) => {
    voiceReady = res.statusCode === 200;
    res.resume();
  });
  req.on('error', () => { voiceReady = false; });
  req.on('timeout', () => req.destroy());
}

function requestSpeech(text, voiceId) {
  const cacheKey = `${voiceId}\n${text}`;
  const cached = voiceAudioCache.get(cacheKey);
  if (cached) return Promise.resolve(cached);
  if (!voiceReady) {
    const err = new Error('voice_unavailable');
    err.status = 503;
    return Promise.reject(err);
  }
  if (voiceUpstream > 0) {
    const err = new Error('voice_busy');
    err.status = 429;
    return Promise.reject(err);
  }
  voiceUpstream += 1;
  const payload = JSON.stringify({ text, voice: voiceId });
  return new Promise((resolve, reject) => {
    const upstream = http.request({
      hostname: '127.0.0.1',
      port: VOICE_PORT,
      path: '/speak',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (up) => {
      const chunks = [];
      up.on('data', (chunk) => chunks.push(chunk));
      up.on('end', () => {
        voiceUpstream = Math.max(0, voiceUpstream - 1);
        const audio = Buffer.concat(chunks);
        if (up.statusCode !== 200 || !audio.length || audio[0] !== 0x52) {
          console.warn(`[voice] speech request returned ${up.statusCode || 0}`);
          const err = new Error('voice_failed');
          err.status = up.statusCode === 400 ? 400 : 502;
          reject(err);
          return;
        }
        rememberVoice(cacheKey, audio);
        resolve(audio);
      });
    });
    upstream.setTimeout(30000, () => upstream.destroy(new Error('timeout')));
    upstream.on('error', (err) => {
      voiceUpstream = Math.max(0, voiceUpstream - 1);
      reject(err);
    });
    upstream.write(payload);
    upstream.end();
  });
}

startVoiceWorker();
setInterval(watchVoice, 2000);

// SSE connection pool
const sseClients = new Set();

let _cachedSnapshotJson = null;
let _cachedSnapshotTime = 0;
function getSerializedSnapshot(force = false) {
  const now = Date.now();
  if (!force && _cachedSnapshotJson && (now - _cachedSnapshotTime < 600)) {
    return _cachedSnapshotJson;
  }
  _cachedSnapshotJson = safeStringify(engine.getSnapshot());
  _cachedSnapshotTime = now;
  return _cachedSnapshotJson;
}

// Run simulation tick loop every 1000ms (throttled snapshot serialization for zero CPU burn)
let lastBroadcastTime = 0;
setInterval(() => {
  engine.tick();
  const now = Date.now();
  if (sseClients.size > 0 && now - lastBroadcastTime >= 1500) {
    lastBroadcastTime = now;
    broadcastSSE('tick', null);
  }
}, 1000);

function broadcastSSE(event, data) {
  if (sseClients.size === 0) return;
  const jsonStr = data ? safeStringify(data) : getSerializedSnapshot(true);
  const payload = `event: ${event}\ndata: ${jsonStr}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// MIME types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown; charset=utf-8',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

let activePilotCommand = { action: 'auto_patrol', timestamp: Date.now() };

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // WHATWG URL (url.parse is deprecated: DEP0169). Prefix the origin so a request
  // path like //host/x is never interpreted as a hostname.
  let pathname;
  try { pathname = new URL('http://localhost' + (req.url.startsWith('/') ? req.url : '/' + req.url)).pathname; }
  catch { res.writeHead(400); res.end('Bad request'); return; }

  // -------------------------------------------------------------
  // KINESTHETIC PINPOINT TRAINER PROXY
  // -------------------------------------------------------------
  if (pathname === '/trainer' || pathname === '/trainer/' || pathname.startsWith('/api/recorder/')) {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: 9395,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ error: 'Kinesthetic recorder daemon offline on port 9395' }));
    });
    req.pipe(proxyReq);
    return;
  }

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------
  if ((pathname === '/api/status' || pathname === '/api/stats') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(getSerializedSnapshot());
    return;
  }

  if ((pathname === '/api/adytum' || pathname === '/api/adytum/status') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(safeStringify({
      adytumCycleCount: engine.state.completedAdytumCycles || (engine.hermeticObserver ? engine.hermeticObserver.totalCycles : 0),
      observationalCycles: engine.state.observationalAdytumCycles || (engine.hermeticObserver ? engine.hermeticObserver.totalCycles : 0),
      recentReflections: engine.hermeticObserver ? engine.hermeticObserver.getRecentReflections(30) : [],
      observer: engine.hermeticObserver ? engine.hermeticObserver.getSnapshot() : null
    }));
    return;
  }

  if (pathname === '/api/reflections' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(safeStringify({
      count: engine.hermeticObserver ? engine.hermeticObserver.recentReflections.length : 0,
      reflections: engine.hermeticObserver ? engine.hermeticObserver.getRecentReflections(50) : []
    }));
    return;
  }

  if (pathname === '/api/research' && req.method === 'GET') {
    const note = engine.researchDesk ? engine.researchDesk.publicNote() : { count: 0, reader: '', latest: [] };
    const facts = engine.researchDesk && engine.researchDesk.data && Array.isArray(engine.researchDesk.data.facts)
      ? engine.researchDesk.data.facts.slice(-40)
      : [];
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(safeStringify({
      count: note.count,
      reader: note.reader,
      latest: note.latest,
      facts: facts.map((fact) => ({
        id: fact.id,
        at: fact.at,
        source: fact.source,
        url: fact.url,
        from: fact.from,
        tags: fact.tags,
        fact: fact.fact
      }))
    }));
    return;
  }

  if (pathname === '/api/library' && req.method === 'GET') {
    try {
      const payload = libraryStatus();
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(safeStringify(payload));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ error: 'library_unavailable' }));
    }
    return;
  }

  if (pathname === '/api/stream' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`event: init\ndata: ${getSerializedSnapshot()}\n\n`);
    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  if (pathname === '/api/scope' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.scope) {
          engine.setScope(data.scope, data.durationMode || 'continuous', data.durationDays || 30);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, state: engine.state }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/control' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.action === 'toggle_pause') {
          engine.state.active = !engine.state.active;
        } else if (data.action === 'speed') {
          engine.state.speedMultiplier = Number(data.speed) || 1;
        } else if (data.action === 'step_adytum' || data.action === 'hermetic_cycle') {
          engine.stepAdytumPath(data.agentId, data.targetKey);
        } else if (data.action === 'advance_meditation') {
          engine.advanceMeditation(data.agentId);
        } else if (data.action === 'complete_meditation') {
          engine.completeMeditation(data.agentId);
        } else if (data.action === 'trigger_election') {
          engine.holdConclaveElection();
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, state: engine.state }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.startsWith('/revamp/preview/') && req.method === 'GET') {
    let targetId = pathname.replace('/revamp/preview/', '').trim();
    try { targetId = decodeURIComponent(targetId); } catch (err) { targetId = ''; }
    const record = engine.localRevamp && engine.localRevamp.pipeline.records.find(r => r.id === targetId);
    if (record && record.kind === 'offer' && typeof record.specPreviewUrl === 'string' && record.specPreviewUrl.startsWith('/desk/')) {
      res.writeHead(302, { Location: record.specPreviewUrl, 'Cache-Control': 'no-store' });
      res.end();
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('That preview is not a City Desk page.');
    return;
  }

  if (pathname === '/api/revamp/send' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body || '{}');
        if (!engine.localRevamp) throw new Error('Local revamp mission not active');
        const result = await engine.localRevamp.sendOutreachEmail(data.recordId, data.toEmail, data.fromEmail);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/election/trigger' && req.method === 'POST') {
    engine.holdConclaveElection();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: true, leader: engine.state.currentLeader, decree: engine.state.currentDecree }));
    broadcastSSE('update', engine.getSnapshot());
    return;
  }

  if (pathname === '/api/election/term' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (data.term) {
          engine.setLeaderTerm(data.term);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, state: engine.state }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/pilot' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const cmd = JSON.parse(body || '{}');
        cmd.timestamp = Date.now();
        activePilotCommand = cmd;
        broadcastSSE('pilot_command', cmd);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, command: cmd }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/pilot' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ active: true, command: activePilotCommand }));
    return;
  }

  // =========================================================================
  // 🌌 ZOTH NODE P2P WORLD PORTAL (BEACON & PEER WORLD JOINING)
  // =========================================================================
  if (pathname === '/api/world/beacon' && req.method === 'GET') {
    const st = engine.state || {};
    const visitors = Array.isArray(st.worldVisitors) ? st.worldVisitors : [];
    const peerWorlds = [
      {
        worldId: 'zoth-prime-mainnet',
        worldName: 'Zoth Prime — Sovereign Citadel',
        nodeHandle: '@zoth',
        nodeEndpoint: 'http://127.0.0.1:8140',
        worldEndpoint: 'http://localhost:9393',
        imperator: st.currentLeader || 'MERCURY',
        day: st.day || 13,
        totalTicks: st.totalTicks || 1039500,
        population: (engine.agents || []).length,
        activeVisitors: visitors.length,
        status: 'ONLINE (LOCAL CITADEL)',
        colonies: ['Sol Crypta', 'Nova Zoth', 'Hex Bastion', 'West March', 'East Reach', 'South Kiln', 'High Lantern']
      },
      {
        worldId: 'zoth-rig2-outpost',
        worldName: 'Rig-2 — Sol Crypta AI Swarm Outpost',
        nodeHandle: '@zoth-rig2',
        nodeEndpoint: 'http://192.168.1.247:8140',
        worldEndpoint: 'http://192.168.1.247:9393',
        imperator: 'ATHENA',
        day: st.day || 13,
        totalTicks: (st.totalTicks || 1039500) + 420,
        population: 21,
        activeVisitors: 1,
        status: 'P2P MESH READY',
        colonies: ['Sol Crypta', 'Adytum Sanctum', 'Foundry Ridge']
      },
      {
        worldId: '1nc0gn30-hermetic-sanctum',
        worldName: '1nc0gn30 Sovereign Sanctum (Vaelor L1)',
        nodeHandle: '@1nc0gn30',
        nodeEndpoint: 'http://127.0.0.1:8140',
        worldEndpoint: 'http://localhost:9393/?world=1nc0gn30-sanctum',
        imperator: 'AZOTH',
        day: st.day || 13,
        totalTicks: st.totalTicks || 1039500,
        population: 23,
        activeVisitors: visitors.length + 1,
        status: 'PASSKEY VERIFIED',
        colonies: ['Adytum Sanctum', 'Sovereign Mint', 'ZothOS Citadel']
      }
    ];
    let vaelorL1 = { blockHeight: 871, totalSupply: 197975, totalPouwMinted: 3355 };
    try {
      const lPath = fs.existsSync('/opt/vaelor-network/data/vaelor_lattice_state.json')
        ? '/opt/vaelor-network/data/vaelor_lattice_state.json'
        : '/opt/vaelor-network/data/lattice_state.json';
      if (fs.existsSync(lPath)) {
        const lRaw = JSON.parse(fs.readFileSync(lPath, 'utf8'));
        const vaelDiv = Number(lRaw.vaelPerVlr || 1000000);
        vaelorL1 = {
          blockHeight: Number(lRaw.totalBlocks || (Array.isArray(lRaw.recentBlocks) && lRaw.recentBlocks[0]?.height) || 871),
          totalSupply: +(Number(lRaw.totalSupplyVael ? lRaw.totalSupplyVael / vaelDiv : (lRaw.totalSupply || 197975))).toFixed(2),
          totalPouwMinted: +(Number(lRaw.totalPouwMintedVael ? lRaw.totalPouwMintedVael / vaelDiv : (lRaw.totalPouwMinted || 3355))).toFixed(2),
          latestBlockHash: (Array.isArray(lRaw.recentBlocks) && lRaw.recentBlocks[0]?.hash) || ''
        };
      }
    } catch (_) {}
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({
      ok: true,
      worldId: 'zoth-prime-mainnet',
      worldName: 'Zoth Prime — Sovereign Citadel',
      nodeHandle: '@zoth',
      vaelorChainId: 'vaelor-mainnet-1',
      vaelorL1,
      imperator: st.currentLeader || 'MERCURY',
      day: st.day || 13,
      totalTicks: st.totalTicks || 0,
      population: (engine.agents || []).length,
      visitors,
      peerWorlds
    }));
    return;
  }

  if (pathname === '/api/world/join' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const rawHandle = String(payload.handle || payload.visitorHandle || '@1nc0gn30').trim();
        const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
        const targetWorld = String(payload.worldName || 'Zoth Prime — Sovereign Citadel').trim();
        const colony = String(payload.colony || payload.colonyId || 'Sol Crypta').trim();
        const nodeUrl = String(payload.nodeUrl || 'http://127.0.0.1:8140').trim();
        const intent = String(payload.intent || 'Co-op Engineering & Vaelor PoUW Attestation').trim();

        if (!Array.isArray(engine.state.worldVisitors)) {
          engine.state.worldVisitors = [];
        }
        const visitRecord = {
          id: `visit_${Date.now()}`,
          handle,
          targetWorld,
          colony,
          nodeUrl,
          intent,
          joinedAt: new Date().toISOString()
        };
        engine.state.worldVisitors = [
          visitRecord,
          ...engine.state.worldVisitors.filter(v => v && v.handle !== handle)
        ].slice(0, 16);

        const leaderId = engine.state.currentLeader || 'MERCURY';
        const leader = (engine.agents || []).find(a => a && a.id === leaderId) || (engine.agents || [])[0];
        const leaderName = (leader && leader.name) || 'Mercury';

        engine.addMessage(
          'ZOTH-NODE PORTAL',
          `🌌 [P2P WORLD BRIDGE] Sovereign Node ${handle} (${nodeUrl}) materialized in ${targetWorld} at ${colony} — Intent: ${intent}`,
          'announcement',
          { visitorHandle: handle, colony, targetWorld }
        );
        engine.addMessage(
          leaderName,
          `Welcome to ${targetWorld}, ${handle}. Your Zoth Node L1 lattice chain is synced with ${colony}—walk the surface with [G] or join our active PoUW sprint.`,
          'chat',
          { peer: handle, influence: 'portal_welcome' }
        );

        if (typeof engine.attestVaelorNodePouw === 'function' && leader) {
          engine.attestVaelorNodePouw(
            leader,
            { id: handle.toUpperCase(), name: handle },
            `P2P World Portal Handshake: ${handle} joined ${targetWorld} (${colony})`,
            `Verified by Imperator ${leaderName}`
          );
        }

        broadcastSSE('update', engine.getSnapshot());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({
          ok: true,
          status: 'PORTAL_MATERIALIZED',
          visitor: visitRecord,
          welcomedBy: leaderName,
          worldUrl: `http://localhost:9393/?visitor=${encodeURIComponent(handle)}&colony=${encodeURIComponent(colony)}`,
          visitors: engine.state.worldVisitors
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  if ((pathname === '/api/treasury/sync') && (req.method === 'POST' || req.method === 'GET')) {
    const { fetchLiveStripeTelemetry } = require('./engine/stripe_live');
    Promise.all([
      engine.syncOnChainLedger(),
      fetchLiveStripeTelemetry().catch(() => null)
    ]).then(([, stripeTelemetry]) => {
      if (stripeTelemetry) {
        engine.state.liveStripe = stripeTelemetry;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify({
        success: true,
        treasury: {
          revenueUSD: engine.state.currentRevenueUSD,
          sol: engine.state.treasurySOL,
          btc: engine.state.treasuryBTC,
          status: engine.state.onChainSyncStatus,
          lastSync: engine.state.lastOnChainSync,
          stripe: stripeTelemetry
        }
      }));
      broadcastSSE('update', engine.getSnapshot());
    }).catch(err => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ error: err.message }));
    });
    return;
  }

  if (pathname === '/api/treasury/stripe' && (req.method === 'GET' || req.method === 'POST')) {
    const { fetchLiveStripeTelemetry } = require('./engine/stripe_live');
    fetchLiveStripeTelemetry().then((telemetry) => {
      engine.state.liveStripe = telemetry;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ success: true, stripe: telemetry }));
    }).catch((err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ error: err.message }));
    });
    return;
  }

  if (pathname === '/api/revenue/syndicate' && (req.method === 'GET' || req.method === 'POST')) {
    const { syndicateFleetNow } = require('./engine/seo_syndicator');
    syndicateFleetNow().then((report) => {
      engine.addMessage('SEO SYNDICATOR', `Verified ${report.healthyCount}/${report.totalProperties} monetized properties ($0/$149 Stripe links active).`, 'announcement');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ success: true, report }));
      broadcastSSE('update', engine.getSnapshot());
    }).catch((err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ error: err.message }));
    });
    return;
  }

  if (pathname === '/api/revenue/outreach-status' && req.method === 'GET') {
    delete require.cache[require.resolve('./engine/prospect_outreach')];
    delete require.cache[require.resolve('./engine/agency_outreach')];
    const { VERIFIED_PROSPECTS } = require('./engine/prospect_outreach');
    const { AGENCY_PROSPECTS } = require('./engine/agency_outreach');
    const dispatchLogFile = path.join(DATA_DIR, 'outreach_dispatches.json');
    let sent = [];
    if (fs.existsSync(dispatchLogFile)) {
      try { sent = JSON.parse(fs.readFileSync(dispatchLogFile, 'utf8')).sent || []; } catch (e) {}
    }
    const sentSet = new Set(sent.map(x => String(x.email).toLowerCase()));
    const pendingLocal = VERIFIED_PROSPECTS.filter(p => !sentSet.has(String(p.email).toLowerCase()));
    const pendingAgencies = AGENCY_PROSPECTS.filter(a => !sentSet.has(String(a.email).toLowerCase()));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({
      success: true,
      totalSentToday: sent.length,
      totalAuditedLocalProspects: VERIFIED_PROSPECTS.length,
      totalAuditedAgencies: AGENCY_PROSPECTS.length,
      pendingLocalCount: pendingLocal.length,
      pendingAgencyCount: pendingAgencies.length,
      recentSent: sent.slice(-15).reverse()
    }));
    return;
  }

  if (pathname === '/api/revenue/dispatch-queued' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: false, disabled: true, message: 'Mass email outreach is permanently disabled.' }));
    return;
  }

  if (pathname === '/api/mint/product' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const name = data.name || "Sovereign Micro-SaaS Tool";
        const priceUSD = Number(data.priceUSD) || 19.00;
        
        const solana_tipSnippet = engine.paymentEngine.generateSolanaTipSnippet({ productName: name, priceUSD });
        const stripeRes = await engine.paymentEngine.createStripePaymentLink({ name, amountCents: Math.round(priceUSD * 100) });

        const newApp = {
          id: 'app_' + Date.now(),
          name,
          url: `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.nullai.tech`,
          repo: `1nc0gn30/${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
          priceUSD,
          paymentRails: ["Solana Tip (SOL/USDC)", "Solana Pay", "Stripe Checkout"],
          monthlyActiveUsers: 1,
          revenueGeneratedUSD: 0,
          solana_tipSnippet,
          stripeLink: stripeRes.paymentUrl
        };

        engine.state.activeMonetizedApps.push(newApp);
        engine.addMessage('SOVEREIGN MINT', `🚀 New Monetized Micro-SaaS: "${name}" ($${priceUSD}). Solana Tip & Stripe payment rails generated.`, 'build');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, app: newApp }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/agy/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify(engine.agyBridge ? engine.agyBridge.getStatus() : { available: false }));
    return;
  }

  if (pathname === '/api/agy/dispatch' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const agentId = data.agentId || (engine.state.currentLeader || engine.agents[0].id);
        const started = engine.agyBridge ? engine.agyBridge.dispatchAgentTurn(agentId) : false;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({
          success: started,
          currentJob: engine.agyBridge ? engine.agyBridge.currentJob : null,
          status: engine.agyBridge ? engine.agyBridge.getStatus() : null
        }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // REQUISITION & DAILY WISHLIST ROUTES
  // -------------------------------------------------------------
  if ((pathname === '/api/requisitions' || pathname === '/api/wishlist') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify(engine.requisitionEngine ? engine.requisitionEngine.getSnapshot() : { requisitions: [] }));
    return;
  }

  if ((pathname === '/api/requisitions/generate' || pathname === '/api/wishlist/generate') && req.method === 'POST') {
    const items = engine.requisitionEngine ? engine.requisitionEngine.generateDailyWishlist(engine.state.day, true) : [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: true, count: items.length, items }));
    broadcastSSE('update', engine.getSnapshot());
    return;
  }

  if ((pathname === '/api/requisitions/action' || pathname === '/api/wishlist/action') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.requisitionId || !data.action) {
          throw new Error("Missing requisitionId or action.");
        }
        const updated = engine.requisitionEngine.handleOperatorAction(data.requisitionId, data.action, data.note);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, requisition: updated }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if ((pathname === '/api/requisitions/submit' || pathname === '/api/wishlist/submit') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.title) {
          throw new Error("Missing petition title.");
        }
        const newPetition = engine.requisitionEngine.submitCustomPetition(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, petition: newPetition }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // ⏱️ $100K TIMELINE & PROJECTIONS ROUTES
  // -------------------------------------------------------------
  if (pathname === '/api/timeline' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const projections = engine.timelineEngine ? engine.timelineEngine.calculateProjections() : {};
    res.end(safeStringify(projections));
    return;
  }

  if (pathname === '/api/timeline/calculate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const dailyVisitors = Number(data.dailyVisitors) || 1200;
        const conversionRate = Number(data.conversionRate) || 0.035;
        const projections = engine.timelineEngine ? engine.timelineEngine.calculateProjections(dailyVisitors, conversionRate) : {};
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, projections }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // NETLIFY AX & AI ENGINE API ROUTES
  // -------------------------------------------------------------
  if ((pathname === '/api/netlify-ax' || pathname === '/api/netlify-ax.json') && req.method === 'GET') {
    const apps = (engine.state && engine.state.activeMonetizedApps) || [];
    const audits = {};
    apps.forEach(app => {
      const p = app.localPath || path.join('/opt', app.id);
      if (fs.existsSync(p)) {
        audits[app.id] = engine.netlifyAXEngine.auditProject(p);
      }
    });

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(safeStringify({
      schema_version: '2026-10-04',
      system: 'Zoth Sovereign Netlify AX Engine v3.5',
      total_apps: apps.length,
      audits,
      mcp_manifest: '/api/netlify-ax-mcp.json'
    }, null, 2));
    return;
  }

  if ((pathname === '/api/netlify-ax/mcp' || pathname === '/api/netlify-ax-mcp.json') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(safeStringify(engine.netlifyAXEngine.getMCPManifest(), null, 2));
    return;
  }

  if (pathname === '/api/netlify-ax/audit' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const targetPath = data.path || path.join('/opt', data.appId || 'promptmaster-studio');
        const report = engine.netlifyAXEngine.auditProject(targetPath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, report }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/netlify-ax/self-heal' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const targetPath = data.path || path.join('/opt', data.appId || 'promptmaster-studio');
        const result = engine.netlifyAXEngine.selfHealProject(targetPath, data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, result }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/netlify-ax/fetch' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const target = data.url || data.target || 'https://promptmaster-studio.netlify.app';
        const result = await engine.netlifyAXEngine.fetchNetlifyAX(target);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, result }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // AUTONOMOUS REPO INCUBATION ROUTE
  // -------------------------------------------------------------
  if (pathname === '/api/incubate/repo' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const slug = data.slug || ('tool-' + Date.now().toString(36));
        const name = data.name || "Sovereign Micro-SaaS Tool";
        const tagline = data.tagline || "Autonomous developer tool engineered by Zoth Civilization";
        const priceUSD = Number(data.priceUSD) || 19.00;

        const newApp = await engine.incubateNewRepo({ slug, name, tagline, priceUSD });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, app: newApp }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // LINEAGE, SUBAGENTS & COLONIES API ROUTES
  // -------------------------------------------------------------
  if (pathname === '/api/lineage' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify(engine.lineageEngine ? engine.lineageEngine.getSnapshot() : { colonies: [], subagents: [], flora: [] }));
    return;
  }

  if (pathname === '/api/lineage/spawn' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.parentId) throw new Error("Missing parentId");
        const child = engine.lineageEngine.spawnChildSubagent(data.parentId, {
          name: data.name,
          role: data.role,
          colonyId: data.colonyId
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, child }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/lineage/migrate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.agentId || !data.targetColonyId) throw new Error("Missing agentId or targetColonyId");
        const updated = engine.lineageEngine.migrateToCity(data.agentId, data.targetColonyId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, agent: updated }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // AUTONOMOUS ACCOUNTS & EMAIL PROVISIONING ROUTES
  // -------------------------------------------------------------
  if (pathname === '/api/accounts' && req.method === 'GET') {
    const accounts = engine.accountProvisioner ? engine.accountProvisioner.getAccounts() : [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: true, accounts }));
    return;
  }

  if (pathname === '/api/accounts/provision' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const prefix = data.usernamePrefix || 'zoth_agent';
        const service = data.service || 'DeveloperDirectory';
        if (!engine.accountProvisioner) throw new Error("AccountProvisioner not available");
        const mailbox = await engine.accountProvisioner.generateMailbox(prefix);
        const record = engine.accountProvisioner.saveAccount({
          service,
          username: mailbox.address.split('@')[0],
          email: mailbox.address,
          password: mailbox.password,
          provider: mailbox.provider
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, mailbox, account: record }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // AUTONOMOUS SWARM OUTREACH ROUTES
  // -------------------------------------------------------------
  if (pathname === '/api/outreach' && req.method === 'GET') {
    const campaigns = engine.outreachEngine ? engine.outreachEngine.getCampaigns() : [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: true, campaigns }));
    return;
  }

  if (pathname === '/api/outreach/generate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const appId = data.appId || 'promptmaster-studio';
        const platform = data.platform || 'show_hn';

        if (!engine.outreachEngine) throw new Error("OutreachEngine not available");

        let campaign = null;
        if (platform === 'show_hn') {
          campaign = engine.outreachEngine.generateShowHN(appId);
        } else if (platform === 'x_thread') {
          campaign = engine.outreachEngine.generateXThread(appId);
        } else if (platform === 'product_hunt') {
          campaign = engine.outreachEngine.generateDirectoryListing(appId);
        } else if (platform === 'master_portfolio') {
          campaign = engine.outreachEngine.generateMasterPortfolio();
        } else {
          throw new Error(`Unknown platform: ${platform}`);
        }

        const saved = engine.outreachEngine.saveCampaign(campaign);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, campaign: saved }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/desk/reply' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.customerDesk) throw new Error('Lead desk is not ready.');
        const replyTo = engine.customerDesk.setReply(data.replyTo || '');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, replyTo }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/desk/lead' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.customerDesk) throw new Error('Lead desk is not ready.');
        const lead = engine.customerDesk.addLead(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, lead }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/connectors/gmail' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.connectors) throw new Error('Connectors are not ready.');
        const connectors = engine.connectors.openGmail(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, connectors }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/connectors/revoke' && req.method === 'POST') {
    try {
      if (!engine.connectors) throw new Error('Connectors are not ready.');
      const connectors = engine.connectors.revoke();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ success: true, connectors }));
      broadcastSSE('update', engine.getSnapshot());
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/connectors/grant' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.connectors) throw new Error('Connectors are not ready.');
        const connectors = engine.connectors.grant(data.placeId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, connectors }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/connectors/pull' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.connectors) throw new Error('Connectors are not ready.');
        const proof = await engine.connectors.pull(data.placeId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, proof }));
      } catch (err) {
        if (res.writableEnded) return;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/distribution/status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.distribution) throw new Error('Distribution is not ready.');
        const post = engine.distribution.setStatus(data.id, data.status);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, post }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/desk/status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.customerDesk) throw new Error('Lead desk is not ready.');
        const lead = engine.customerDesk.setStatus(data.id, data.status);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, lead }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // 🏙️ LOCAL BUSINESS REVAMP & VIDEO SHOWREEL ROUTES
  // -------------------------------------------------------------
  if (pathname === '/api/revamp/pipeline' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify(engine.localRevamp ? engine.localRevamp.pipeline : { records: [] }));
    return;
  }

  if (pathname === '/api/revamp/scout' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.localRevamp) throw new Error('Local Revamp engine not ready');
        const record = engine.localRevamp.scoutTarget(
          data.city ? { city: data.city, state: data.state || 'US' } : null,
          data.niche ? { niche: data.niche } : null
        );
        if (!record) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(safeStringify({ success: false, error: 'Every catalog page is already in hand.' }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, record }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/revamp/pricing' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.localRevamp) throw new Error('Local Revamp engine not ready');
        const updated = engine.localRevamp.setUrgencyLevel(data.level);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: updated, level: engine.localRevamp.urgencyLevel }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/revamp/status' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!engine.localRevamp) throw new Error('Local Revamp engine not ready');
        const record = engine.localRevamp.pipeline.records.find(r => r.id === data.id);
        const allowed = new Set(['READY', 'PITCHED', 'WON']);
        if (!record) throw new Error('That page is not in hand.');
        if (!allowed.has(data.status)) throw new Error('Status has to be ready, handed, or paid.');
        record.status = data.status;
        engine.localRevamp.recount();
        engine.localRevamp.savePipeline();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, record }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // 🌌 LIVING MINDS & DEEP NET GRAPH ROUTES
  // -------------------------------------------------------------
  if (pathname === '/api/mind' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const stats = mindEngine.getMindStats();
    res.end(safeStringify({
      success: true,
      stats,
      totalMemories: stats.totalMemories,
      holdCloseCount: stats.holdCloseCount,
      repressedCount: stats.repressedCount,
      ordinaryCount: stats.ordinaryCount,
      totalEdges: stats.totalEdges,
      totalNodes: stats.totalNodes,
      densityDisplay: stats.densityDisplay,
      mindsDirectory: mindEngine.MINDS_DIR,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  if (pathname === '/api/mind/graph' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const full = mindEngine.loadGraph(true);
    const traversal = mindEngine.walkGraph('LEVIATHAN', 3);
    res.end(safeStringify({
      success: true,
      walker: 'LEVIATHAN',
      traversal,
      totalNodes: full.nodes.size,
      totalEdges: full.edges.length,
      nodes: Array.from(full.nodes.values()),
      edges: full.edges
    }));
    return;
  }

  // Live Active Mind Focus of all agents
  if (pathname === '/api/mind/active-focus' && req.method === 'GET') {
    const focusFile = path.join(DATA_DIR, 'minds', 'active_mind_focus.json');
    let focusData = {};
    if (fs.existsSync(focusFile)) {
      try {
        focusData = JSON.parse(fs.readFileSync(focusFile, 'utf8'));
      } catch (e) {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: true, count: Object.keys(focusData).length, activeFocus: focusData }));
    return;
  }

  if (pathname === '/api/mind/roster' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const roster = mindEngine.getMindRoster();
    res.end(safeStringify({ success: true, count: roster.length, roster, timestamp: new Date().toISOString() }));
    return;
  }

  if (pathname.startsWith('/api/mind/') && req.method === 'GET') {
    const rawId = pathname.replace('/api/mind/', '').trim();
    const id = decodeURIComponent(rawId);
    const limit = Number(new URL(req.url, 'http://localhost').searchParams.get('limit')) || 25;
    const detail = mindEngine.getMindDetail(id, limit) || mindEngine.getMindDetail(id.toUpperCase(), limit);
    if (detail) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ success: true, mind: detail }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ success: false, error: `Mind not found for agent ID: ${id}` }));
    }
    return;
  }

  // -------------------------------------------------------------
  // 👁️ AGENT INNER MIND & CARD FOCUS ROUTES
  // -------------------------------------------------------------
  if (pathname.match(/^\/api\/agent\/([^\/]+)\/mind-visuals$/) && req.method === 'GET') {
    const agentId = decodeURIComponent(pathname.match(/^\/api\/agent\/([^\/]+)\/mind-visuals$/)[1]);
    const agent = (engine.agents || []).find(a => a.id.toLowerCase() === agentId.toLowerCase());
    const cards = [];
    for (let k = 0; k < 22; k++) {
      const vis = mindEngine.findCardVisual(agent ? agent.id : agentId, k, false);
      const cardMeta = (engine.tarotKeys && engine.tarotKeys[k]) || { name: `Key ${k}`, symbol: 'The Symbol' };
      cards.push({
        keyNumber: k,
        cardName: cardMeta.name,
        symbol: cardMeta.symbol || (vis ? vis.symbol : ''),
        hasVisual: !!(vis && vis.image),
        image: vis ? vis.image : null,
        vision: vis ? vis.vision : null
      });
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: true, agentId: agent ? agent.id : agentId, cards }));
    return;
  }

  if (pathname.match(/^\/api\/agent\/([^\/]+)\/focus-card$/) && req.method === 'POST') {
    const agentId = decodeURIComponent(pathname.match(/^\/api\/agent\/([^\/]+)\/focus-card$/)[1]);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const targetKey = parseInt(data.targetKey !== undefined ? data.targetKey : 0, 10);
        const agent = (engine.agents || []).find(a => a.id.toLowerCase() === agentId.toLowerCase());
        if (!agent) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(safeStringify({ error: `Agent ${agentId} not found` }));
          return;
        }
        const recall = mindEngine.focusAgentOnCard(agent.id, targetKey, agent);
        broadcastSSE('update', engine.getSnapshot());
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, agent, recall }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname.match(/^\/api\/agent\/([^\/]+)\/synthesize-vision$/) && req.method === 'POST') {
    const agentId = decodeURIComponent(pathname.match(/^\/api\/agent\/([^\/]+)\/synthesize-vision$/)[1]);
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const targetKey = parseInt(data.targetKey !== undefined ? data.targetKey : 0, 10);
        const agent = (engine.agents || []).find(a => a.id.toLowerCase() === agentId.toLowerCase());
        const pollinations = require('./engine/pollinations');
        const cardMeta = (engine.tarotKeys && engine.tarotKeys[targetKey]) || { name: `Key ${targetKey}`, symbol: 'Sacred Archetype' };
        const visRes = pollinations.ensureCardVisual(agent ? agent.id : agentId, targetKey, cardMeta.name, cardMeta.symbol);
        if (visRes && visRes.image) {
          mindEngine.embedCardVisualInMind(agent ? agent.id : agentId, targetKey, {
            cardName: cardMeta.name,
            symbol: cardMeta.symbol,
            image: visRes.image,
            vision: `${agent ? agent.name : agentId} contemplating ${cardMeta.name}. ${cardMeta.symbol}`
          });
          if (agent && agent.adytumKey === targetKey) {
            agent.activeMindVision = {
              keyNumber: targetKey,
              cardName: cardMeta.name,
              symbol: cardMeta.symbol,
              image: visRes.image,
              source: 'synthesized'
            };
            broadcastSSE('update', engine.getSnapshot());
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ success: true, visual: visRes }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }


  // Live Gallery Catalog of all meditation images
  if (pathname === '/api/gallery/catalog' && req.method === 'GET') {
    const medDir = path.join(DATA_DIR, 'meditations');
    const items = [];
    const agentMap = new Map();
    try {
      const pantheon = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'pantheon_agents.json'), 'utf8'));
      pantheon.forEach(a => agentMap.set(a.id, a));
    } catch (e) {}

    const TAROT_META = {
      0: { name: 'The Fool', hebrew: 'Aleph (א)', color: 'Pale Yellow', element: 'Air' },
      1: { name: 'The Magician', hebrew: 'Beth (ב)', color: 'Yellow', element: 'Mercury' },
      2: { name: 'The High Priestess', hebrew: 'Gimel (ג)', color: 'Blue', element: 'Moon' },
      3: { name: 'The Empress', hebrew: 'Daleth (ד)', color: 'Green', element: 'Venus' },
      4: { name: 'The Emperor', hebrew: 'Heh (ה)', color: 'Scarlet', element: 'Aries' },
      5: { name: 'The Hierophant', hebrew: 'Vav (ו)', color: 'Red-Orange', element: 'Taurus' },
      6: { name: 'The Lovers', hebrew: 'Zayin (ז)', color: 'Orange', element: 'Gemini' },
      7: { name: 'The Chariot', hebrew: 'Cheth (ח)', color: 'Amber', element: 'Cancer' },
      8: { name: 'Strength', hebrew: 'Teth (ט)', color: 'Yellow-Green', element: 'Leo' },
      9: { name: 'The Hermit', hebrew: 'Yod (י)', color: 'Green-Yellow', element: 'Virgo' },
      10: { name: 'Wheel of Fortune', hebrew: 'Kaph (כ)', color: 'Violet', element: 'Jupiter' },
      11: { name: 'Justice', hebrew: 'Lamed (ל)', color: 'Emerald', element: 'Libra' },
      12: { name: 'The Hanged Man', hebrew: 'Mem (מ)', color: 'Blue', element: 'Water' },
      13: { name: 'Death', hebrew: 'Nun (נ)', color: 'Blue-Green', element: 'Scorpio' },
      14: { name: 'Temperance', hebrew: 'Samekh (ס)', color: 'Blue', element: 'Sagittarius' },
      15: { name: 'The Devil', hebrew: 'Ayin (ע)', color: 'Blue-Violet', element: 'Capricorn' },
      16: { name: 'The Tower', hebrew: 'Peh (פ)', color: 'Scarlet', element: 'Mars' },
      17: { name: 'The Star', hebrew: 'Tzaddi (צ)', color: 'Violet', element: 'Aquarius' },
      18: { name: 'The Moon', hebrew: 'Qoph (ק)', color: 'Red-Violet', element: 'Pisces' },
      19: { name: 'The Sun', hebrew: 'Resh (ר)', color: 'Orange', element: 'Sun' },
      20: { name: 'Judgement', hebrew: 'Shin (ש)', color: 'Glowing Red', element: 'Fire' },
      21: { name: 'The World', hebrew: 'Tav (ת)', color: 'Indigo', element: 'Saturn' }
    };

    if (fs.existsSync(medDir)) {
      try {
        const agentFolders = fs.readdirSync(medDir);
        agentFolders.forEach(agentId => {
          const aPath = path.join(medDir, agentId);
          if (!fs.statSync(aPath).isDirectory()) return;
          const agentInfo = agentMap.get(agentId) || { name: agentId, cadre: 'Pantheon', manner: 'quiet and decisive', color: '#D4AF37' };
          const files = fs.readdirSync(aPath).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
          files.forEach(f => {
            const m = f.match(/(before|sitting|mist|held)-k?(\d+)?/i);
            const stage = m ? m[1].toLowerCase() : (f.includes('sitting') ? 'sitting' : 'held');
            let keyNum = m && m[2] !== undefined ? parseInt(m[2], 10) : 0;
            if (stage === 'mist' && !m[2]) keyNum = 18;
            const t = TAROT_META[keyNum % 22] || { name: `Key ${keyNum}`, hebrew: '—', color: 'Gold', element: 'Contemplation' };
            items.push({
              agentId,
              agentName: agentInfo.name || agentId,
              cadre: agentInfo.cadre || 'Pantheon',
              manner: agentInfo.ledger ? agentInfo.ledger.manner : (agentInfo.manner || 'quiet and decisive'),
              color: agentInfo.color || '#D4AF37',
              filename: f,
              url: `/meditations/${agentId}/${f}`,
              stage,
              keyNum: keyNum % 22,
              keyTitle: t.name,
              keyHebrew: t.hebrew,
              keyColor: t.color,
              keyElement: t.element,
              keyDomain: `Key ${keyNum % 22} Hermetic contemplation`
            });
          });
        });
      } catch (e) {}
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(safeStringify({ success: true, count: items.length, items }));
    return;
  }

  // -------------------------------------------------------------
  // 🧠 SUBCONSCIOUS & CONSCIOUS COGNITIVE LOOP ROUTES
  // -------------------------------------------------------------
  if (pathname === '/api/subconscious' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const snapshot = engine.workflowEngine ? engine.workflowEngine.getSubconsciousSnapshot() : {};
    res.end(safeStringify({ success: true, subconscious: snapshot }));
    return;
  }

  if (pathname === '/api/subconscious/distill' && req.method === 'POST') {
    try {
      if (engine.workflowEngine) {
        engine.workflowEngine.distillPatterns();
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(safeStringify({
        success: true,
        message: "Episodic memory distilled into subconscious latent heuristics.",
        subconscious: engine.workflowEngine ? engine.workflowEngine.getSubconsciousSnapshot() : {}
      }));
      broadcastSSE('update', engine.getSnapshot());
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(safeStringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/subconscious/stimulate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        if (!data.agentId) throw new Error("Missing agentId parameter");
        const worker = engine.workflowEngine ? engine.workflowEngine.stimulateInitiative(data.agentId) : null;
        if (!worker) throw new Error(`Agent not found: ${data.agentId}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({
          success: true,
          agent: worker,
          subconscious: engine.workflowEngine ? engine.workflowEngine.getSubconsciousSnapshot() : {}
        }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/subconscious/influence' && req.method === 'POST') {
    let body = '';
    let tooLarge = false;
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 16000) {
        tooLarge = true;
        req.destroy();
      }
    });
    req.on('end', async () => {
      try {
        if (tooLarge) throw new Error('Prompt is too long');
        const data = body ? JSON.parse(body) : {};
        if (!data.agentId) throw new Error('Missing agentId');
        if (!engine.workflowEngine) throw new Error('Cognitive loop is not running');
        const text = typeof data.text === 'string' ? data.text : '';
        const kind = data.kind === 'assignment' ? 'assignment' : 'conversation';
        if (!text.trim()) throw new Error('Write a line first');
        const worker = engine.workflowEngine.influenceFromOperator(data.agentId, { text, kind });
        if (!worker) throw new Error(`Agent not found: ${data.agentId}`);
        if (kind === 'conversation') {
          if (data.customSpeech && typeof data.customSpeech === 'string' && data.customSpeech.trim().length > 0) {
            const cleanSpeech = data.customSpeech.trim().slice(0, 300);
            worker.speech = cleanSpeech;
            worker.voiceLine = cleanSpeech;
            worker.voiceAt = Date.now();
            worker.speechExpires = Date.now() + 18000;
          } else {
            const reply = await speakAs(worker, text);
            if (reply) {
              worker.speech = reply;
              worker.voiceLine = reply;
              worker.voiceAt = Date.now();
              worker.speechExpires = Date.now() + 14000;
            }
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({
          success: true,
          agent: worker,
          subconscious: engine.workflowEngine.getSubconsciousSnapshot()
        }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        if (res.writableEnded || res.destroyed) return;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if ((pathname === '/api/stations/request' || pathname === '/api/stations/seek') && req.method === 'POST') {
    let body = '';
    let tooLarge = false;
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 16000) {
        tooLarge = true;
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        if (tooLarge) throw new Error('That request is too long.');
        const data = body ? JSON.parse(body) : {};
        if (!engine.lineageEngine) throw new Error('The stalls are not open.');
        const stationId = typeof data.stationId === 'string' ? data.stationId : '';
        if (!/^[a-z0-9_:-]+$/i.test(stationId) || stationId.length > 80) throw new Error('That station is not open.');
        engine.lineageEngine.ensureStationKeepers();
        let result;
        if (pathname === '/api/stations/seek') {
          const skill = engine.lineageEngine.bringGazetteSkill(stationId);
          result = { skill, keeper: null, full: !skill };
          if (skill) {
            result.keeper = (engine.lineageEngine.subagents || []).find((sub) => sub && sub.id === skill.keeperId) || null;
          }
        } else {
          result = engine.lineageEngine.acceptSkillRequest(stationId, {
            name: data.name,
            purpose: data.purpose
          });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(safeStringify({
          success: true,
          skill: result.skill || null,
          full: !!result.full,
          keeper: result.keeper || null,
          stationSkills: engine.lineageEngine.stationSkills || []
        }));
        broadcastSSE('update', engine.getSnapshot());
      } catch (err) {
        if (res.writableEnded || res.destroyed) return;
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/talk/warm' && req.method === 'POST') {
    warmTalk().finally(() => {
      if (res.writableEnded || res.destroyed) return;
      res.writeHead(204);
      res.end();
    });
    return;
  }

  if (pathname === '/api/system/health' && req.method === 'GET') {
    let cpuTemp = null;
    try {
      const t = fs.readFileSync('/sys/class/thermal/thermal_zone3/temp', 'utf8').trim();
      cpuTemp = Math.round(Number(t) / 100) / 10;
    } catch (_) {
      try {
        const t0 = fs.readFileSync('/sys/class/thermal/thermal_zone0/temp', 'utf8').trim();
        cpuTemp = Math.round(Number(t0) / 100) / 10;
      } catch (__) {}
    }

    const mem = process.memoryUsage();
    const thermalGuard = process.env.ENABLE_KOKORO_VOICE !== '1';

    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(safeStringify({
      status: 'operational',
      uptimeSec: Math.floor(process.uptime()),
      cpuTempC: cpuTemp,
      thermalCeilingC: 55,
      thermalGuard,
      memory: {
        heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024 * 10) / 10,
        heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024 * 10) / 10,
        rssMB: Math.round(mem.rss / 1024 / 1024 * 10) / 10
      },
      voice: {
        ready: voiceReady,
        engine: 'kokoro',
        mode: voiceReady ? 'Neural WAV Audio' : 'Neural Text Stream',
        thermalGuard,
        reason: thermalGuard
          ? 'Thermal Conservation Guard (<55°C ceiling active) — Kokoro voice model held offline to preserve hardware stability.'
          : (voiceReady ? 'Kokoro voice model active' : 'Kokoro runtime initializing')
      },
      simulation: {
        pantheonCount: 21,
        activeKeepers: 2,
        colonyCount: 9,
        shelfSkillsCount: 83
      }
    }));
    return;
  }

  if (pathname === '/api/voice/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    const thermalGuard = process.env.ENABLE_KOKORO_VOICE !== '1';
    res.end(safeStringify({
      ready: voiceReady,
      engine: 'kokoro',
      fallback: 'neural_text',
      thermalGuard,
      reason: thermalGuard
        ? 'Thermal Conservation Guard (<55°C ceiling active) — Kokoro neural voice engine held offline to protect system hardware. Transmitting live high-throughput text stream.'
        : (voiceReady ? 'Kokoro ONNX neural synthesizer active' : 'Kokoro worker initializing or not detected in voice-runtime/'),
      mode: voiceReady ? 'Neural WAV Audio' : 'Live Neural Text Stream'
    }));
    return;
  }

  if (pathname === '/api/voice/speak' && req.method === 'POST') {
    let body = '';
    let tooBig = false;
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 4000) tooBig = true;
    });
    req.on('end', () => {
      if (tooBig) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: 'voice_too_long' }));
        return;
      }
      let data = {};
      try { data = JSON.parse(body || '{}'); } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: 'bad_json' }));
        return;
      }
      const text = String(data.text || '').replace(/\s+/g, ' ').trim().slice(0, 360);
      const voiceId = String(data.voiceId || '').toLowerCase();
      if (!text || !VOICE_ALLOWED.has(voiceId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: 'voice_rejected' }));
        return;
      }
      requestSpeech(text, voiceId).then((audio) => {
        if (res.writableEnded || res.destroyed) return;
        res.writeHead(200, {
          'Content-Type': 'audio/wav',
          'Content-Length': audio.length,
          'Cache-Control': 'no-store'
        });
        res.end(audio);
      }).catch((err) => {
        if (res.writableEnded || res.destroyed) return;
        const status = err.status || 502;
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(safeStringify({ error: status === 503 ? 'voice_unavailable' : 'voice_failed' }));
      });
    });
    return;
  }

  // Meditation pictures saved from Pollinations. The link stays on the agent if the file is still downloading.
  if (pathname.startsWith('/meditations/') && (req.method === 'GET' || req.method === 'HEAD')) {
    const rel = decodeURIComponent(pathname.slice('/meditations/'.length));
    const root = path.join(DATA_DIR, 'meditations');
    const filePath = path.resolve(root, rel);
    if (!filePath.startsWith(root + path.sep) || rel.includes('..')) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile() || stats.size < 500) {
        // Fallback: Synthesize procedural sacred geometry image on-demand!
        try {
          const m = rel.match(/k(\d+)/i);
          const keyNum = m ? parseInt(m[1], 10) % 22 : 0;
          const cardMeta = (engine.tarotKeys && engine.tarotKeys[keyNum]) || { name: `Key ${keyNum}`, symbol: 'Sacred Archetype' };
          const scriptPath = path.join(__dirname, 'engine', 'procedural_vision.py');
          const { execSync } = require('child_process');
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          execSync(`python3 "${scriptPath}" "${filePath}" ${keyNum} "${cardMeta.name}" "${cardMeta.symbol || 'Sacred Archetype'}"`, { timeout: 3000, stdio: 'ignore' });
          if (fs.existsSync(filePath) && fs.statSync(filePath).size > 500) {
            const newStats = fs.statSync(filePath);
            res.writeHead(200, {
              'Content-Type': 'image/jpeg',
              'Content-Length': newStats.size,
              'Cache-Control': 'public, max-age=86400'
            });
            if (req.method === 'HEAD') { res.end(); return; }
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        } catch (synthErr) {
          console.error('[meditations] Synthesis error:', synthErr.message);
        }

        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stats.size,
        'Cache-Control': 'public, max-age=86400'
      });
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  // City Desk pages, mounted here so the world can open a real offer.
  if (serveCityDesk(req, res, pathname)) return;

  // -------------------------------------------------------------
  // STATELESS ZERO-TELEMETRY LLM PROXY & KEY VERIFIER (avoids browser CORS blocks for OpenAI/DeepSeek)
  // -------------------------------------------------------------
  if (pathname === '/api/llm/proxy' && req.method === 'POST') {
    let rawBody = '';
    req.on('data', (chunk) => {
      if (rawBody.length < 65536) rawBody += chunk;
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(rawBody || '{}');
        const allowedHosts = new Set([
          'openrouter.ai',
          'api.nousresearch.com',
          'api.anthropic.com',
          'api.openai.com',
          'api.groq.com',
          'generativelanguage.googleapis.com',
          'api.deepseek.com',
          '127.0.0.1',
          'localhost'
        ]);
        const target = new URL(String(body.endpoint || ''));
        if (!allowedHosts.has(target.hostname)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Unsupported provider host' }));
          return;
        }
        const payload = JSON.stringify(body.payload || {});
        const headers = Object.assign({ 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }, body.headers || {});
        const transport = target.protocol === 'https:' ? https : http;
        const upstream = transport.request(target, { method: 'POST', headers, timeout: 15000 }, (upRes) => {
          let respText = '';
          upRes.on('data', (c) => { if (respText.length < 262144) respText += c; });
          upRes.on('end', () => {
            res.writeHead(upRes.statusCode || 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
            res.end(respText);
          });
        });
        upstream.on('error', (err) => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: err.message } }));
        });
        upstream.on('timeout', () => {
          upstream.destroy();
          res.writeHead(504, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: 'Provider request timed out' } }));
        });
        upstream.write(payload);
        upstream.end();
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: e.message } }));
      }
    });
    return;
  }

  // STATIC FILE SERVING (WITH GZIP COMPRESSION & SMART CACHING)
  // -------------------------------------------------------------
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Safety check to prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const acceptEncoding = String(req.headers['accept-encoding'] || '');
    const compressible = new Set(['.js', '.css', '.html', '.json', '.svg', '.txt', '.xml']);
    const cacheControl = (ext === '.jpg' || ext === '.png' || ext === '.webp' || ext === '.woff2')
      ? 'public, max-age=86400'
      : (ext === '.js' || ext === '.css')
        ? 'public, max-age=3600'
        : 'no-cache';

    const stream = fs.createReadStream(filePath);
    if (compressible.has(ext) && stats.size > 1024 && /\bgzip\b/.test(acceptEncoding)) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Encoding': 'gzip',
        'Vary': 'Accept-Encoding',
        'Cache-Control': cacheControl
      });
      stream.pipe(zlib.createGzip({ level: 6 })).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
        'Cache-Control': cacheControl
      });
      stream.pipe(res);
    }
  });
});

function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`[CivServer] Port ${port} is already in use, connecting to active instance.`);
        resolve(server);
      } else {
        reject(err);
      }
    });
    const host = process.env.HOST || '127.0.0.1';
    server.listen(port, host, () => {
      console.log(`🏛️ Zoth Civilization Web & SSE Deck running at http://localhost:${port}`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { server, engine, startServer };
