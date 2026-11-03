const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const AUDIO_WAV = path.join(__dirname, 'audio_master.wav');
const OUT_DIR = path.join(ROOT_DIR, 'public', 'assets');
const OUT_MP4 = path.join(OUT_DIR, 'zoth-civilization-motion-edit.mp4');
const OUT_WEBM = path.join(OUT_DIR, 'zoth-civilization-motion-edit.webm');
const OUT_POSTER = path.join(OUT_DIR, 'zoth-civilization-motion-poster.jpg');

const CAPTURE_FPS = 30;
const OUT_FPS = 60;
const DURATION = 24.0;
const TOTAL_FRAMES = Math.round(CAPTURE_FPS * DURATION); // 720 frames -> 60fps MP4

function startStaticServer(port) {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.ttf': 'font/ttf'
  };
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const cleanUrl = req.url.split('?')[0];
      let filePath = path.join(ROOT_DIR, cleanUrl);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(ROOT_DIR, 'public', cleanUrl);
      }
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
    srv.listen(port, '127.0.0.1', () => resolve(srv));
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const HTTP_PORT = 9362;
  const CDP_PORT = 9363;
  const srv = await startStaticServer(HTTP_PORT);

  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--window-size=1920,1080',
    'about:blank'
  ]);

  await sleep(1300);
  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json`).then(r => r.json());
  const page = listRes.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    const timer = setTimeout(() => {
      ws.removeEventListener('message', handler);
      reject(new Error(`Timeout on ${method}`));
    }, 15000);
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        clearTimeout(timer);
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  console.log('Loading Motion Edit compositor page...');
  await send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/motion-edit/index.html` });

  // Wait for all 144 gameplay frames + fonts to preload
  for (let w = 0; w < 100; w++) {
    await sleep(150);
    const res = await send('Runtime.evaluate', { expression: 'Boolean(window.__IMAGES_READY)' });
    if (res && res.result && res.result.value === true) break;
  }
  console.log('All gameplay sequences & fonts preloaded! Starting deterministic render...');

  const ffArgs = [
    '-y',
    '-threads', '4',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(CAPTURE_FPS),
    '-i', '-',
    '-i', AUDIO_WAV,
    '-vf', 'scale=1920:1080',
    '-r', String(OUT_FPS),
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    OUT_MP4
  ];

  const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'ignore', 'pipe'] });
  let ffErr = '';
  ff.stderr.on('data', d => { ffErr += d.toString(); });
  ff.stdin.on('error', () => {});

  for (let f = 0; f < TOTAL_FRAMES; f++) {
    const t = f / CAPTURE_FPS;
    await send('Runtime.evaluate', { expression: `window.renderFrame(${t.toFixed(5)})` });
    const shot = await send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 94,
      clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }
    });
    const buf = Buffer.from(shot.data, 'base64');
    if (f === 15) {
      fs.writeFileSync(OUT_POSTER, buf);
    }
    const ok = ff.stdin.write(buf);
    if (!ok) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 120 === 0 || f === TOTAL_FRAMES - 1) {
      console.log(`Rendered frame ${f + 1}/${TOTAL_FRAMES} (${t.toFixed(1)}s / ${DURATION}s)`);
    }
  }

  ff.stdin.end();
  const code = await new Promise(r => ff.on('close', r));
  if (code !== 0) {
    console.error(ffErr);
    throw new Error(`ffmpeg exited with ${code}`);
  }
  console.log('MP4 rendered:', OUT_MP4);

  console.log('Encoding WebM companion...');
  await new Promise((resolve, reject) => {
    const wff = spawn('ffmpeg', [
      '-y',
      '-threads', '4',
      '-i', OUT_MP4,
      '-c:v', 'libvpx-vp9',
      '-b:v', '2.5M',
      '-crf', '28',
      '-deadline', 'realtime',
      '-cpu-used', '5',
      '-c:a', 'libopus',
      '-b:a', '128k',
      OUT_WEBM
    ], { stdio: 'ignore' });
    wff.on('close', c => c === 0 ? resolve() : reject(new Error(`webm exit ${c}`)));
  });
  console.log('WebM rendered:', OUT_WEBM);

  ws.close();
  chrome.kill();
  srv.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
