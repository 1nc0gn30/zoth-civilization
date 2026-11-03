const { spawn } = require('child_process');

async function main() {
  const PORT = 9346;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json`).then(r => r.json());
  const page = listRes.find(p => p.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = msgId++;
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');
  await send('Page.navigate', { url: 'http://127.0.0.1:9393' });
  await new Promise(r => setTimeout(r, 3000));

  // Enter walk mode
  await send('Runtime.evaluate', {
    expression: 'if (window.sphereWorld) { window.sphereWorld.enterAvatarMode(); }'
  });
  await new Promise(r => setTimeout(r, 2000));

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync('shots-test/walk_view.png', Buffer.from(shot.data, 'base64'));

  // Focus Adytum
  await send('Runtime.evaluate', {
    expression: 'if (window.sphereWorld) { window.sphereWorld.focusColony("colony_adytum_grove"); }'
  });
  await new Promise(r => setTimeout(r, 2000));
  const shotAdytum = await send('Page.captureScreenshot', { format: 'png' });
  require('fs').writeFileSync('shots-test/adytum_view.png', Buffer.from(shotAdytum.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Screenshots saved successfully!');
}
main().catch(err => { console.error(err); process.exit(1); });
