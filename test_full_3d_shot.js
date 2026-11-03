const { spawn } = require('child_process');
const fs = require('fs');

async function main() {
  const PORT = 9349;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--window-size=1600,1000',
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

  // Hide 2D HUD overlays temporarily so we can see the full 3D viewport clearly
  await send('Runtime.evaluate', {
    expression: `
      document.querySelector('.app-header')?.style.setProperty('display', 'none', 'important');
      document.querySelector('.cross-banner')?.style.setProperty('display', 'none', 'important');
      document.querySelector('.globe-toolbar')?.style.setProperty('display', 'none', 'important');
      document.querySelector('.crt-overlay')?.style.setProperty('display', 'none', 'important');
      document.getElementById('avatarControlsBanner')?.style.setProperty('display', 'none', 'important');
      document.getElementById('toolShelf')?.style.setProperty('display', 'none', 'important');
      document.getElementById('globeHint')?.style.setProperty('display', 'none', 'important');
      if (window.sphereWorld) {
        window.sphereWorld.autoSpin = false;
        if (window.sphereWorld.controls) window.sphereWorld.controls.autoRotate = false;
        window.sphereWorld.onResize();
      }
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // 1. Full Orbital View
  const orbitShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots-enhanced/full_globe_clean.png', Buffer.from(orbitShot.data, 'base64'));

  // 2. Focus Capital Citadel
  await send('Runtime.evaluate', {
    expression: 'if (window.sphereWorld) window.sphereWorld.focusColony("colony_capital");'
  });
  await new Promise(r => setTimeout(r, 1600));
  const capShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots-enhanced/clean_capital.png', Buffer.from(capShot.data, 'base64'));

  // 3. Focus Adytum Hermetica
  await send('Runtime.evaluate', {
    expression: 'if (window.sphereWorld) window.sphereWorld.focusColony("colony_adytum_grove");'
  });
  await new Promise(r => setTimeout(r, 1600));
  const adytumShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots-enhanced/clean_adytum.png', Buffer.from(adytumShot.data, 'base64'));

  // 4. Focus Nova Zoth
  await send('Runtime.evaluate', {
    expression: 'if (window.sphereWorld) window.sphereWorld.focusColony("colony_nova_zoth");'
  });
  await new Promise(r => setTimeout(r, 1600));
  const novaShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots-enhanced/clean_nova_zoth.png', Buffer.from(novaShot.data, 'base64'));

  // 5. Focus Sol Crypta
  await send('Runtime.evaluate', {
    expression: 'if (window.sphereWorld) window.sphereWorld.focusColony("colony_sol_crypta");'
  });
  await new Promise(r => setTimeout(r, 1600));
  const solShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots-enhanced/clean_sol_crypta.png', Buffer.from(solShot.data, 'base64'));

  // 6. Focus HexForge Bastion
  await send('Runtime.evaluate', {
    expression: 'if (window.sphereWorld) window.sphereWorld.focusColony("colony_hex_bastion");'
  });
  await new Promise(r => setTimeout(r, 1600));
  const hexShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots-enhanced/clean_hex_bastion.png', Buffer.from(hexShot.data, 'base64'));

  // 7. Walk mode view
  await send('Runtime.evaluate', {
    expression: `
      if (window.sphereWorld) {
        window.sphereWorld.enterAvatarMode();
      }
    `
  });
  await new Promise(r => setTimeout(r, 1800));
  const walkShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('shots-enhanced/clean_walk.png', Buffer.from(walkShot.data, 'base64'));

  ws.close();
  chrome.kill();
  console.log('Clean 3D shots captured for all colonies and walk mode!');
}
main().catch(err => { console.error(err); process.exit(1); });
