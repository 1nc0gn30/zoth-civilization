/**
 * One local voice for in-world conversation.
 * zoth-model, through its chat template, on two threads.
 * A 256 context and a one-line cap keep the reply under a second once warm.
 */

const http = require('http');

const MODEL = process.env.ZOTH_TALK_MODEL || 'hermes3-teknium:latest';
const HOST = '127.0.0.1';
const PORT = Number(process.env.OLLAMA_PORT) || 11434;
const SYSTEM = 'You are an autonomous Pantheon agent on Zoth Prime (powered by Hermes-3 Teknium). Speak one sharp, technical sentence in character.';

const OPTIONS = {
  num_thread: 4,
  num_ctx: 512,
  num_predict: 36,
  num_batch: 64,
  temperature: 0.55,
  top_k: 25,
  stop: ['\n', '<|im_end|>']
};

let busy = false;
const queue = [];

function clean(text) {
  let line = String(text || '')
    .replace(/<\|.*?\|>/g, ' ')
    .replace(/"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  line = line.replace(/^(reply|answer)\s*:\s*/i, '');
  if (/can(?:not|'t) assist|as an ai|language model/i.test(line)) return '';
  const sentence = line.match(/^(.{1,170}?[.!?])(?:\s|$)/);
  if (sentence) line = sentence[1];
  else line = line.replace(/\b(and|or|the|a|to|of|for|with)\s*$/i, '').trim();
  if (line && !/[.!?]$/.test(line)) line += '.';
  if (line.length < 8) return '';
  return line.slice(0, 170);
}

function chat(messages, predict) {
  const options = predict ? Object.assign({}, OPTIONS, { num_predict: predict }) : OPTIONS;
  const payload = JSON.stringify({
    model: MODEL,
    messages,
    stream: false,
    keep_alive: '2m',
    options
  });
  return new Promise((resolve) => {
    let settled = false;
    const finish = (line) => {
      if (settled) return;
      settled = true;
      resolve(line);
    };
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 3500
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          finish('');
          return;
        }
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const content = data.message && data.message.content;
          finish(clean(content));
        } catch (err) {
          finish('');
        }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      finish('');
    });
    req.on('error', () => finish(''));
    req.write(payload);
    req.end();
  });
}

function pump() {
  if (busy || !queue.length) return;
  busy = true;
  const job = queue.shift();
  chat(job.messages, job.predict).then((line) => {
    job.resolve(line);
    busy = false;
    pump();
  });
}

function enqueue(messages, predict) {
  if (queue.length >= 1) return Promise.resolve('');
  return new Promise((resolve) => {
    queue.push({ messages, predict, resolve });
    pump();
  });
}

function speakAs(agent, heard) {
  if (!agent) return Promise.resolve('');
  const name = String(agent.name || 'Agent').slice(0, 40);
  const role = String(agent.role || agent.cadre || 'pantheon agent').slice(0, 60);
  const line = String(heard || '').replace(/\s+/g, ' ').trim().slice(0, 160);
  if (!line) return Promise.resolve('');
  return enqueue([
    { role: 'system', content: SYSTEM },
    { role: 'user', content: `You are ${name}, ${role}. 1nc0gn30 says: ${line} Answer in one sentence, 12 words or fewer.` }
  ]);
}

function warmTalk() {
  return enqueue([
    { role: 'system', content: SYSTEM },
    { role: 'user', content: 'Say ready.' }
  ], 8);
}

module.exports = { speakAs, warmTalk, MODEL, clean };
