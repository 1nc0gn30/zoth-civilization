const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const PORT = 9348;
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

  const outDir = 'shots-enhanced';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const colonies = [
    { id: 'colony_capital', name: 'capital' },
    { id: 'colony_nova_zoth', name: 'nova_zoth' },
    { id: 'colony_sol_crypta', name: 'sol_crypta' },
    { id: 'colony_adytum_grove', name: 'adytum' },
    { id: 'colony_hex_bastion', name: 'hex_bastion' }
  ];

  for (const col of colonies) {
    await send('Runtime.evaluate', {
      expression: `if (window.sphereWorld) { window.sphereWorld.focusColony("${col.id}"); }`
    });
    await new Promise(r => setTimeout(r, 1800));
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, `${col.name}.png`), Buffer.from(shot.data, 'base64'));
  }

  // Now enter walk mode and hide the top modal banner so we get a pure scenic view!
  await send('Runtime.evaluate', {
    expression: `
      if (window.sphereWorld) {
        window.sphereWorld.enterAvatarMode();
        const banner = document.getElementById('avatarControlsBanner');
        if (banner) banner.style.opacity = '0.35';
      }
    `
  });
  await new Promise(r => setTimeout(r, 2000));
  const walkShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'walk_scenery.png'), Buffer.from(walkShot.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('All colony and walk scenery screenshots saved successfully!');
}
main().catch(err => { console.error(err); process.exit(1); });
