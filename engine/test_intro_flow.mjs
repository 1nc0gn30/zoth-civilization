import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 9555;
const OUT_DIR = '/tmp/civ_intro_test';
fs.mkdirSync(OUT_DIR, { recursive: true });

const chrome = spawn('google-chrome', [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--autoplay-policy=no-user-gesture-required',
  '--mute-audio',
  '--renderer-process-limit=2',
  '--window-size=1440,900',
  `--user-data-dir=/tmp/civ-chrome-${PORT}`,
  'about:blank'
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, seq = 0;
const pending = new Map();
const consoleErrors = [];

async function connect() {
  for (let i = 0; i < 60 && !ws; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) {
        ws = new WebSocket(page.webSocketDebuggerUrl);
        break;
      }
    } catch {
      await sleep(200);
    }
  }
  if (!ws) throw new Error('Could not connect to Chrome CDP');

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  ws.onmessage = (event) => {
    const m = JSON.parse(event.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
    if (m.method === 'Runtime.consoleAPICalled') {
      const txt = m.params.args.map((a) => a.value ?? a.description).join(' ');
      console.log(`[CONSOLE ${m.params.type.toUpperCase()}]`, txt);
      if (m.params.type === 'error') consoleErrors.push(txt);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      console.log('[EXCEPTION THROWN]', m.params.exceptionDetails?.text, m.params.exceptionDetails?.exception?.description);
    }
  };
}

const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++seq;
  pending.set(id, resolve);
  ws.send(JSON.stringify({ id, method, params }));
});

const evaluate = async (expr) => {
  const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return res.result?.result?.value;
};

async function shot(filename) {
  const r = await send('Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  if (r?.result?.data) {
    fs.writeFileSync(path.join(OUT_DIR, filename), Buffer.from(r.result.data, 'base64'));
    console.log(`Saved screenshot: ${path.join(OUT_DIR, filename)}`);
  } else {
    console.warn(`Screenshot failed for ${filename}:`, r?.error);
  }
}

async function run() {
  try {
    await connect();
    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://127.0.0.1:9393/' });
    console.log('Navigated to http://127.0.0.1:9393/');
    await sleep(3500);

    // 1. Verify Intro Engine presence (wait up to 15s)
    let hasIntro = false;
    for (let i = 0; i < 30; i++) {
      hasIntro = await evaluate('typeof window.ZothGameIntro !== "undefined"');
      if (hasIntro) break;
      await sleep(500);
    }
    console.log('window.ZothGameIntro present:', hasIntro);

    // 2. Open Step 1 (Prologue)
    await evaluate('window.ZothGameIntro && window.ZothGameIntro.open(1)');
    await sleep(600);
    await shot('step1_prologue.jpg');

    // 3. Open Step 2 (Providers & Key Hub)
    await evaluate('window.ZothGameIntro && window.ZothGameIntro.setStep(2)');
    await sleep(600);
    await shot('step2_providers.jpg');

    // 4. Open Step 3 (Tactical Gameplan & Controls Deck)
    await evaluate('window.ZothGameIntro && window.ZothGameIntro.setStep(3)');
    await sleep(600);
    await shot('step3_controls.jpg');

    // 5. Close Intro & Verify 3D Globe with 60 FPS Turbo Active
    await evaluate('window.ZothGameIntro && window.ZothGameIntro.close()');
    await sleep(1500);
    await shot('globe_3d_turbo.jpg');

    // 6. Check state and toolbar buttons
    const toolbarInfo = await evaluate(`({
      hasGuideBtn: !!document.getElementById('btnOpenGameIntro'),
      hasTurboBtn: !!document.getElementById('btnToggleTurbo60'),
      turboText: document.getElementById('turboBadge')?.textContent,
      perfMode: window.sphereWorld ? window.sphereWorld.perfLevel : null,
      dialogueReady: typeof window.ZothGameIntro?.askCitizen === 'function'
    })`);
    console.log('Toolbar & Engine verification:', JSON.stringify(toolbarInfo, null, 2));
    console.log('Console Errors count:', consoleErrors.length);
    if (consoleErrors.length > 0) {
      console.log('Console Errors:', consoleErrors);
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    if (ws) ws.close();
    chrome.kill('SIGTERM');
  }
}

run();
