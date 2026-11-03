/**
 * Meditation pictures from Pollinations.
 * The public image link needs no key. One download runs at a time.
 * Prompts are the agent's own thought. They do not carry lesson text,
 * file paths, or secrets.
 */

const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'data', 'meditations');
const queue = [];
const ready = [];
let running = false;

function cleanThought(text) {
  return String(text || '')
    .replace(/https?:\S+/gi, '')
    .replace(/\/home\/\S+/g, '')
    .replace(/[A-Za-z0-9_]{24,}/g, '')
    .replace(/\?/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 360);
}

function hash(text) {
  let h = 2166136261;
  const s = String(text || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildPrompt(agent, phase, card, thought) {
  const name = (agent && (agent.name || agent.id)) || 'the sitter';
  const manner = agent && agent.ledger && agent.ledger.manner ? `${name} is ${agent.ledger.manner}.` : `${name} is sitting.`;
  const where = phase === 'before'
    ? 'Before the sitting. The picture is still forming.'
    : phase === 'mist'
      ? 'A moon path. The picture is climbing out of dark water.'
      : 'The sitting is holding one picture.';
  const key = card && card.name ? `Key ${card.keyNumber}: ${card.name}.` : '';
  const body = cleanThought(thought);
  return [manner, where, key, body, 'One original painting. No letters. No watermark.']
    .filter(Boolean)
    .join(' ')
    .slice(0, 700);
}

function visionLink(prompt, seed) {
  const query = `width=768&height=768&nologo=true&model=flux&seed=${seed}`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${query}`;
}

function requestVision(agent, phase, card, thought) {
  const prompt = buildPrompt(agent, phase, card, thought);
  const seed = hash(`${agent && agent.id}|${phase}|${card && card.keyNumber}|${prompt.slice(0, 80)}`);
  const link = visionLink(prompt, seed);
  const id = (agent && agent.id) || 'agent';
  const rel = `${id}/${phase}-k${card && card.keyNumber != null ? card.keyNumber : 0}-${seed}.jpg`;
  const dest = path.join(OUT_DIR, rel);

  // If already saved on disk, mark ready immediately
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    const record = {
      agentId: id,
      phase,
      keyNumber: card && card.keyNumber,
      prompt,
      link,
      file: `/meditations/${rel}`,
      rel,
      status: 'ready'
    };
    ready.push(record);
    return { prompt, link, file: record.file, status: 'ready' };
  }

  const record = {
    agentId: id,
    phase,
    keyNumber: card && card.keyNumber,
    prompt,
    link,
    file: `/meditations/${rel}`,
    rel,
    status: 'pending'
  };
  queue.push(record);
  pump();
  return { prompt, link, file: record.file, status: 'pending' };
}

function drainReady() {
  return ready.splice(0, ready.length);
}

const GAP_MS = 1200;

function enqueueExisting(agentId, link, rel) {
  if (!link || queue.some((item) => item.link === link)) return;
  queue.push({
    agentId,
    phase: 'retry',
    link,
    rel,
    file: `/meditations/${rel}`,
    status: 'pending',
    attempts: 0
  });
  pump();
}

function synthesizeProcedural(record, dest) {
  try {
    const { execSync } = require('child_process');
    const scriptPath = path.join(__dirname, 'procedural_vision.py');
    const kNum = record.keyNumber != null ? record.keyNumber : 0;
    const cName = record.cardName || `Key ${kNum}`;
    const sym = record.symbol || (record.prompt ? record.prompt.slice(0, 60).replace(/["'`$\\]/g, '') : 'Sacred Archetype');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    execSync(`python3 "${scriptPath}" "${dest}" ${kNum} "${cName}" "${sym}"`, { stdio: 'ignore' });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      record.status = 'ready';
      ready.push(record);
      console.log(`[vision] Generated procedural sacred vision for ${record.agentId} Key ${kNum}`);
      return true;
    }
  } catch (procErr) {
    console.warn(`[vision] procedural fallback error: ${procErr.message}`);
  }
  return false;
}

function pump() {
  if (running || queue.length === 0) return;
  running = true;
  const record = queue.shift();
  const dest = path.join(OUT_DIR, record.rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  // If already on disk, no need to download again
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    record.status = 'ready';
    ready.push(record);
    running = false;
    setTimeout(pump, 200);
    return;
  }

  download(record.link, dest, 0).then(() => {
    record.status = 'ready';
    ready.push(record);
  }).catch((err) => {
    record.attempts = (record.attempts || 0) + 1;
    record.error = err && err.message ? err.message : 'image failed';
    
    // Immediate procedural hermetic synthesis fallback
    const ok = synthesizeProcedural(record, dest);
    if (!ok) {
      record.status = 'link';
      ready.push(record);
      console.warn(`[vision] ${record.agentId} ${record.phase} kept the link: ${record.error}`);
    }
  }).finally(() => {
    running = false;
    setTimeout(pump, GAP_MS);
  });
}

function download(url, dest, hops) {
  return new Promise((resolve, reject) => {
    if (hops > 3) {
      reject(new Error('too many redirects'));
      return;
    }
    let lib = https;
    try {
      lib = new URL(url).protocol === 'http:' ? http : https;
    } catch (err) {
      reject(err);
      return;
    }
    const req = lib.get(url, { headers: { 'User-Agent': 'zoth-civilization-meditation' } }, (res) => {
      const code = res.statusCode || 0;
      if (code >= 300 && code < 400 && res.headers.location) {
        res.resume();
        const next = new URL(res.headers.location, url).href;
        download(next, dest, hops + 1).then(resolve, reject);
        return;
      }
      if (code !== 200) {
        res.resume();
        reject(new Error(`status ${code}`));
        return;
      }
      const chunks = [];
      let size = 0;
      res.on('data', (chunk) => {
        size += chunk.length;
        if (size > 4 * 1024 * 1024) {
          req.destroy();
          reject(new Error('image too large'));
          return;
        }
        chunks.push(chunk);
      });
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (body.length < 32 || body[0] !== 0xff || body[1] !== 0xd8) {
          reject(new Error('not a jpeg'));
          return;
        }
        fs.writeFileSync(dest, body);
        resolve(dest);
      });
    });
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.on('error', reject);
  });
}

function ensureCardVisual(agentId, keyNumber, cardName, symbol) {
  const kNum = typeof keyNumber === 'number' ? keyNumber : (parseInt(keyNumber, 10) || 0);
  const id = agentId || 'agent';
  const cName = cardName || `Key ${kNum}`;
  const sym = symbol || 'Sacred Archetype';
  const agentDir = path.join(OUT_DIR, id);
  fs.mkdirSync(agentDir, { recursive: true });

  // 1. Check if any file for this key already exists in agent's dir
  try {
    const files = fs.readdirSync(agentDir);
    const existing = files.find(f => f.includes(`-k${kNum}-`) || f.includes(`k${kNum}.`) || f.includes(`k${kNum}_`));
    if (existing && fs.statSync(path.join(agentDir, existing)).size > 1000) {
      return {
        agentId: id,
        keyNumber: kNum,
        cardName: cName,
        symbol: sym,
        image: `/meditations/${id}/${existing}`,
        path: path.join(agentDir, existing),
        status: 'ready'
      };
    }
  } catch (e) {}

  // 2. Synthesize locally with procedural generator
  const filename = `sitting-k${kNum}-${Date.now().toString(36)}.jpg`;
  const dest = path.join(agentDir, filename);
  const record = {
    agentId: id,
    keyNumber: kNum,
    cardName: cName,
    symbol: sym,
    prompt: `${id} meditating on ${cName}. ${sym}`,
    rel: `${id}/${filename}`
  };

  const ok = synthesizeProcedural(record, dest);
  if (ok) {
    return {
      agentId: id,
      keyNumber: kNum,
      cardName: cName,
      symbol: sym,
      image: `/meditations/${id}/${filename}`,
      path: dest,
      status: 'ready'
    };
  }

  return null;
}

module.exports = {
  OUT_DIR,
  cleanThought,
  requestVision,
  enqueueExisting,
  drainReady,
  hash,
  ensureCardVisual,
  synthesizeProcedural
};
