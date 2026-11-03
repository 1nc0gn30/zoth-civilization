#!/usr/bin/env node
/**
 * engine/memory_daemon.js
 * 
 * Living Memory & Deep Net Graph Daemon for Zoth Civilization.
 * Tails data/minds/spool.jsonl, appends markdown to data/minds/<ID>/memory.md,
 * and maintains the deep net graph in data/minds/graph.jsonl.
 * 
 * One instance only, pid file data/minds/daemon.pid, log /tmp/zoth_memory_daemon.log.
 * Does not listen on port 9393.
 */

const fs = require('fs');
const http = require('http');
const path = require('path');
const mindEngine = require('./mind_engine');

const MINDS_DIR = mindEngine.MINDS_DIR;
const SPOOL_FILE = mindEngine.SPOOL_FILE;
const PID_FILE = mindEngine.PID_FILE;
const CURSOR_FILE = path.join(MINDS_DIR, 'spool.cursor');
const LOG_FILE = '/tmp/zoth_memory_daemon.log';

function log(msg) {
  const line = `[${new Date().toISOString()}] [MemoryDaemon] ${msg}\n`;
  try {
    fs.appendFileSync(LOG_FILE, line, 'utf8');
  } catch (e) {}
  if (process.stdout && process.stdout.write) {
    process.stdout.write(line);
  }
}

// 1. Ensure single instance via PID file
mindEngine.ensureMindsDir();

if (fs.existsSync(PID_FILE)) {
  try {
    const rawPid = fs.readFileSync(PID_FILE, 'utf8').trim();
    const existingPid = parseInt(rawPid, 10);
    if (existingPid && existingPid !== process.pid) {
      try {
        process.kill(existingPid, 0); // check if running
        log(`Another daemon is already active (PID ${existingPid}). Exiting.`);
        process.exit(0);
      } catch (err) {
        log(`Found stale PID file for PID ${existingPid}. Overriding.`);
      }
    }
  } catch (e) {
    log(`PID check warning: ${e.message}`);
  }
}

fs.writeFileSync(PID_FILE, String(process.pid), 'utf8');
log(`Started Memory Daemon with PID ${process.pid}`);

// Cleanup on exit
function cleanup() {
  log('Shutting down Memory Daemon...');
  try {
    if (fs.existsSync(PID_FILE)) {
      const p = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
      if (p === process.pid) {
        fs.unlinkSync(PID_FILE);
      }
    }
  } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', () => {
  try {
    if (fs.existsSync(PID_FILE)) {
      const p = parseInt(fs.readFileSync(PID_FILE, 'utf8').trim(), 10);
      if (p === process.pid) {
        fs.unlinkSync(PID_FILE);
      }
    }
  } catch (e) {}
});

// Cache agent metadata for valence calculations
let agentMap = new Map();

function refreshAgentMap() {
  try {
    const stateFile = path.join(__dirname, '..', 'data', 'civilization_state.json');
    if (fs.existsSync(stateFile)) {
      const st = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      if (Array.isArray(st.agents)) {
        st.agents.forEach(a => { if (a && a.id) agentMap.set(a.id, a); });
      }
    }
  } catch (e) {}

  try {
    const pantheonFile = path.join(__dirname, '..', 'data', 'pantheon_agents.json');
    if (fs.existsSync(pantheonFile)) {
      const p = JSON.parse(fs.readFileSync(pantheonFile, 'utf8'));
      if (Array.isArray(p)) {
        p.forEach(a => { if (a && a.id && !agentMap.has(a.id)) agentMap.set(a.id, a); });
      }
    }
  } catch (e) {}

  try {
    const linFile = path.join(__dirname, '..', 'data', 'civilization_lineage.json');
    if (fs.existsSync(linFile)) {
      const lin = JSON.parse(fs.readFileSync(linFile, 'utf8'));
      if (Array.isArray(lin.subagents)) {
        lin.subagents.forEach(s => { if (s && s.id && !agentMap.has(s.id)) agentMap.set(s.id, s); });
      }
    }
  } catch (e) {}
}

refreshAgentMap();

// Initialize minds directory, souls, and graph if needed
try {
  const initRes = mindEngine.initSoulsAndDirectories();
  log(`Initialized minds: created ${initRes.createdSouls} souls, ${initRes.createdMemories} memories.`);
} catch (err) {
  log(`Error during initialization: ${err.message}`);
}

// Read current spool cursor
let spoolOffset = 0;
if (fs.existsSync(CURSOR_FILE)) {
  try {
    const cur = parseInt(fs.readFileSync(CURSOR_FILE, 'utf8').trim(), 10);
    if (!isNaN(cur) && cur >= 0) spoolOffset = cur;
  } catch (e) {}
}

// Thermal Guard: If starting with offset 0 and spool file is large, fast-forward to EOF
if (spoolOffset === 0 && fs.existsSync(SPOOL_FILE)) {
  try {
    const stats = fs.statSync(SPOOL_FILE);
    if (stats.size > 65536) {
      spoolOffset = stats.size;
      fs.writeFileSync(CURSOR_FILE, String(spoolOffset), 'utf8');
      log(`Fast-forwarded spool cursor to EOF (${spoolOffset} bytes) to prevent thermal spike.`);
    }
  } catch (e) {}
}

const ACTIVE_FOCUS_FILE = path.join(MINDS_DIR, 'active_mind_focus.json');
let activeFocusRegistry = {};
if (fs.existsSync(ACTIVE_FOCUS_FILE)) {
  try {
    activeFocusRegistry = JSON.parse(fs.readFileSync(ACTIVE_FOCUS_FILE, 'utf8'));
  } catch (e) {}
}

let lastVisualEngramSentAt = 0;

/**
 * Dispatch an episodic visual engram to neuro-memory-daemon on port 8094.
 * Rate-limited (max 1 per 350ms) to conserve loopback sockets and prevent CPU burn.
 */
function dispatchVisualEngramToNeuroMemory(agentId, kNum, cardName, symbol, image, nextCardName, nextImage) {
  if (!image) return;
  const now = Date.now();
  if (now - lastVisualEngramSentAt < 350) return;
  lastVisualEngramSentAt = now;

  const payload = {
    text: `[Visual Engram] Agent ${agentId} focused inner mind on Tarot Key ${kNum} (${cardName}). Archetype symbol: "${symbol}". Inner visual synthesized: ${image}. Next contemplative progression: Key ${(kNum + 1) % 22} (${nextCardName}).`,
    tags: ['meditation_visual', 'tarot_key', `key_${kNum}`, agentId.toLowerCase(), 'inner_sanctum'],
    importance: 0.90,
    category: 'episodic',
    perspective: 'first_person',
    agent_id: agentId,
    metadata: {
      type: 'meditation_visual',
      agentId,
      keyNumber: kNum,
      cardName,
      symbol,
      image,
      nextKey: (kNum + 1) % 22,
      nextCardName,
      nextImage,
      timestamp: new Date().toISOString()
    }
  };

  try {
    const dataStr = JSON.stringify(payload);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8094,
      path: '/api/memories',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      },
      timeout: 2000
    }, (res) => {
      res.resume();
    });
    req.on('error', () => {});
    req.on('timeout', () => { req.destroy(); });
    req.write(dataStr);
    req.end();
  } catch (err) {}
}

function syncMindFocus(evt) {
  if (!evt || !evt.agentId) return;
  const agentId = evt.agentId;
  const kNum = evt.adytumKey !== null && evt.adytumKey !== undefined ? Number(evt.adytumKey) : 0;
  const recall = mindEngine.getCardFocusRecall(agentId, kNum);

  const curName = (recall.currentVisual && recall.currentVisual.cardName) || (evt.meta && evt.meta.cardName) || `Key ${kNum}`;
  const curSymbol = (recall.currentVisual && recall.currentVisual.symbol) || (evt.meta && evt.meta.symbol) || 'The Sacred Symbol';
  const curImg = (recall.currentVisual && recall.currentVisual.image) || evt.image || evt.visual || '';
  const nextName = (recall.nextVisual && recall.nextVisual.cardName) || `Key ${(kNum + 1) % 22}`;
  const nextImg = (recall.nextVisual && recall.nextVisual.image) || '';

  activeFocusRegistry[agentId] = {
    agentId,
    currentKey: kNum,
    cardName: curName,
    symbol: curSymbol,
    image: curImg,
    nextKey: (kNum + 1) % 22,
    nextCardName: nextName,
    nextImage: nextImg,
    lastFocusedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(ACTIVE_FOCUS_FILE, JSON.stringify(activeFocusRegistry, null, 2), 'utf8');
  } catch (e) {}

  dispatchVisualEngramToNeuroMemory(agentId, kNum, curName, curSymbol, curImg, nextName, nextImg);
}

let lineBuffer = '';

function tailSpool() {
  if (!fs.existsSync(SPOOL_FILE)) return;

  let fd = null;
  try {
    const stats = fs.statSync(SPOOL_FILE);
    if (stats.size < spoolOffset) {
      // File was truncated or rotated
      spoolOffset = 0;
      lineBuffer = '';
    }

    if (stats.size === spoolOffset) {
      return; // No new data
    }

    const maxChunk = 65536; // 64 KB max per tick to prevent CPU exhaustion
    const bytesToRead = Math.min(stats.size - spoolOffset, maxChunk);
    const buf = Buffer.alloc(bytesToRead);
    fd = fs.openSync(SPOOL_FILE, 'r');
    fs.readSync(fd, buf, 0, bytesToRead, spoolOffset);
    fs.closeSync(fd);
    fd = null;

    spoolOffset += bytesToRead;
    fs.writeFileSync(CURSOR_FILE, String(spoolOffset), 'utf8');

    const chunk = lineBuffer + buf.toString('utf8');
    const lines = chunk.split('\n');
    lineBuffer = lines.pop(); // Incomplete line held for next turn

    let processedCount = 0;
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        const evt = JSON.parse(trimmed);
        const agent = agentMap.get(evt.agentId) || null;
        const res = mindEngine.processEvent(evt, agent);
        if (res) {
          processedCount++;
          log(`Event processed: [${res.memoryId}] agent=${evt.agentId} type=${evt.type} valence=${res.valence} strength=${res.strength}`);
          if (evt.type === 'card_focus' || evt.type === 'meditation_visual' || evt.type === 'sitting') {
            syncMindFocus(evt);
          }
        }
      } catch (parseErr) {
        log(`Spool line parse error: ${parseErr.message} on line: ${trimmed.slice(0, 80)}`);
      }
    }

    if (processedCount > 0) {
      const stats = mindEngine.getMindStats();
      log(`Mind state: ${stats.totalMemories} memories (${stats.holdCloseCount} hold-close, ${stats.repressedCount} repressed), ${stats.totalNodes} nodes, ${stats.totalEdges} edges.`);
    }
  } catch (err) {
    if (fd !== null) {
      try { fs.closeSync(fd); } catch (e) {}
    }
    log(`Error tailing spool: ${err.message}`);
  }
}

// Run initial tail
tailSpool();

// Polling timer every 1500ms (throttled to avoid thermal spikes)
const pollTimer = setInterval(tailSpool, 1500);

// Periodically refresh agent cache every 30 seconds
const refreshTimer = setInterval(refreshAgentMap, 30000);

log('Memory Daemon is running and listening on spool.jsonl.');
