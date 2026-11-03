const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT_ROOT = path.join(__dirname, '..', 'motion-edit', 'gameplay_frames');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function ensureServer() {
  try {
    const res = await fetch('http://127.0.0.1:9393/api/status');
    if (res.ok) return null;
  } catch (_) {}
  console.log('Starting Zoth Civilization server.js on 127.0.0.1:9393...');
  const srv = spawn('node', [path.join(__dirname, '..', 'server.js')], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, ENABLE_KOKORO_VOICE: '0' },
    stdio: 'ignore',
    detached: true
  });
  srv.unref();
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const r = await fetch('http://127.0.0.1:9393/api/status');
      if (r.ok) {
        console.log('Zoth Civilization server is UP on 127.0.0.1:9393!');
        return srv;
      }
    } catch (_) {}
  }
  throw new Error('Failed to start Zoth Civilization server on 9393');
}

async function main() {
  await ensureServer();
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  const PORT = 9357;
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--mute-audio',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--window-size=1920,1080',
    'about:blank'
  ]);

  await sleep(1400);

  const listRes = await fetch(`http://127.0.0.1:${PORT}/json`).then(r => r.json());
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

  console.log('[1/6] Loading Zoth Civilization at http://127.0.0.1:9393 ...');
  await send('Page.navigate', { url: 'http://127.0.0.1:9393' });
  await sleep(3200);

  // Switch 3D loop to deterministic manual stepping so SwiftShader doesn't saturate the renderer thread!
  await send('Runtime.evaluate', {
    expression: `
      if (window.streamPilot && window.streamPilot.releaseWheel) {
        window.streamPilot.releaseWheel();
      }
      if (window.sphereWorld) {
        const sw = window.sphereWorld;
        if (sw.animFrameId) cancelAnimationFrame(sw.animFrameId);
        sw._origAnimate = sw.animate.bind(sw);
        sw._onFrame = () => {};
        window.step3D = () => {
          const origRAF = window.requestAnimationFrame;
          window.requestAnimationFrame = () => 0;
          try { sw._origAnimate(); } finally { window.requestAnimationFrame = origRAF; }
        };
        sw.onResize();
        window.step3D();
      }
    `
  });

  async function captureSeq(seqName, count, stepFn) {
    const dir = path.join(OUT_ROOT, seqName);
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Capturing ${seqName} (${count} frames)...`);
    for (let i = 0; i < count; i++) {
      await stepFn(i, count);
      const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
      const file = path.join(dir, `frame_${String(i).padStart(4, '0')}.jpg`);
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
    }
    console.log(`  -> Completed ${seqName}`);
  }

  // =========================================================================
  // SEQ 01: 3D ORBITAL GOD'S EYE VIEW OF ZOTH PRIME (24 frames)
  // =========================================================================
  await send('Runtime.evaluate', {
    expression: `
      if (window.sphereWorld) {
        const sw = window.sphereWorld;
        sw.returnToGodsEye();
        sw.closeEncounter && sw.closeEncounter();
        sw.closeDialogue && sw.closeDialogue();
        sw.cameraTransition = null;
        window.step3D && window.step3D();
      }
    `
  });

  await captureSeq('seq01_orbit', 24, async (i, total) => {
    const angle = -0.55 + (i / total) * 1.45;
    const dist = 160 - Math.sin((i / total) * Math.PI) * 24;
    const y = 36 + Math.cos((i / total) * Math.PI * 1.2) * 18;
    await send('Runtime.evaluate', {
      expression: `
        if (window.sphereWorld) {
          const sw = window.sphereWorld;
          sw.isAvatarMode = false;
          sw.viewMode = 'orbit';
          sw.cameraTransition = null;
          sw.camera.position.set(Math.sin(${angle}) * ${dist}, ${y}, Math.cos(${angle}) * ${dist});
          sw.camera.up.set(0, 1, 0);
          sw.camera.lookAt(0, -4, 0);
          if (sw.controls) {
            sw.controls.target.set(0, -4, 0);
            sw.controls.update();
          }
          if (${i} === 2) sw.spawnSpeechBubble('Azoth', 'Zoth Prime telemetry synchronized across 5 colonies.');
          if (${i} === 12) sw.spawnSpeechBubble('GhostByte', 'Zero-trust perimeter locked. Shipping v3.3 artifacts.');
          window.step3D && window.step3D();
        }
      `
    });
  });

  // =========================================================================
  // SEQ 02: 3D COLONY FLYOVERS (Capital Citadel -> Adytum Grove -> Sol Crypta) (24 frames)
  // =========================================================================
  await captureSeq('seq02_colonies', 24, async (i) => {
    const colId = i < 8 ? 'colony_capital' : (i < 16 ? 'colony_adytum_grove' : 'colony_sol_crypta');
    const isSwitch = (i === 0 || i === 8 || i === 16);
    await send('Runtime.evaluate', {
      expression: `
        if (window.sphereWorld) {
          const sw = window.sphereWorld;
          if (${isSwitch}) {
            sw.focusColony("${colId}");
            if (sw.cameraTransition) {
              sw.camera.position.copy(sw.cameraTransition.endPos);
              sw.camera.up.copy(sw.cameraTransition.endUp);
              sw.camera.lookAt(sw.cameraTransition.endTarget);
              sw.cameraTransition = null;
              if (sw.pendingLocal) {
                sw.local = sw.pendingLocal;
                sw.pendingLocal = null;
              }
            }
          }
          if (sw.local) {
            sw.local.yaw += 0.085;
            sw.local.dist = 24 + Math.sin(${i} * 0.3) * 2.5;
            sw.updateLocalOrbit();
          }
          window.step3D && window.step3D();
        }
      `
    });
  });

  // =========================================================================
  // SEQ 03: 3D SURFACE WALK POV & LIVE IN-WORLD AGENT DIALOGUE (24 frames)
  // =========================================================================
  await send('Runtime.evaluate', {
    expression: `
      if (window.sphereWorld) {
        const sw = window.sphereWorld;
        sw.closeEncounter && sw.closeEncounter();
        sw.enterAvatarMode();
        if (sw.cameraTransition) {
          sw.camera.position.copy(sw.cameraTransition.endPos);
          sw.camera.up.copy(sw.cameraTransition.endUp);
          sw.camera.lookAt(sw.cameraTransition.endTarget);
          sw.cameraTransition = null;
        }
        window.step3D && window.step3D();
      }
    `
  });

  await captureSeq('seq03_surface_walk', 24, async (i) => {
    await send('Runtime.evaluate', {
      expression: `
        if (window.sphereWorld) {
          const sw = window.sphereWorld;
          if (${i} < 12 && sw.avatar) {
            sw.avatar.keys.forward = true;
            sw.avatar.forward = sw.rotateForward(sw.avatar.forward, sw.avatar.normal, 0.03 * Math.sin(${i} * 0.4));
            sw.updateAvatar(0.14);
          } else if (${i} === 12) {
            if (sw.avatar) sw.avatar.keys.forward = false;
            sw.walkToAgent('azoth');
            if (sw.cameraTransition) {
              sw.camera.position.copy(sw.cameraTransition.endPos);
              sw.camera.up.copy(sw.cameraTransition.endUp);
              sw.camera.lookAt(sw.cameraTransition.endTarget);
              sw.cameraTransition = null;
            }
            const ent = sw.entityById('azoth');
            if (ent && ent.userData && ent.userData.agent) {
              sw.openDialogue(ent.userData.agent);
            }
          } else if (${i} >= 13 && sw.avatar) {
            sw.cameraTransition = null;
            sw.avatar.forward = sw.rotateForward(sw.avatar.forward, sw.avatar.normal, 0.015);
            sw.updateAvatar(0.06);
          }
          window.step3D && window.step3D();
        }
      `
    });
  });

  await send('Runtime.evaluate', {
    expression: `
      if (window.sphereWorld) {
        window.sphereWorld.closeDialogue && window.sphereWorld.closeDialogue();
        window.sphereWorld.returnToGodsEye();
      }
    `
  });

  // =========================================================================
  // SEQ 04: 16-BIT GAME BOY TOP-DOWN PIXEL WORLD (24 frames)
  // =========================================================================
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('btnToggle3DMode');
        const globe = document.getElementById('globeCanvasContainer');
        if (btn && globe && globe.style.display !== 'none') {
          btn.click();
        }
      })()
    `
  });
  await sleep(300);

  await captureSeq('seq04_pixel_world', 24, async () => {
    await sleep(45);
  });

  // =========================================================================
  // SEQ 05: ADYTUM INITIATION CHAMBER & 21-AGENT COCKPIT GRAPH (24 frames)
  // =========================================================================
  await captureSeq('seq05_adytum_cockpit', 24, async (i) => {
    if (i === 0) {
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.tab-btn[data-view="adytum-chamber"]')?.click();`
      });
      await sleep(250);
    } else if (i === 12) {
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.tab-btn[data-view="cockpit-graph"]')?.click();`
      });
      await sleep(250);
    } else {
      await sleep(35);
    }
  });

  // =========================================================================
  // SEQ 06: LIVING MINDS & SOVEREIGN CONCLAVE / $100K TREASURY (24 frames)
  // =========================================================================
  await captureSeq('seq06_living_conclave', 24, async (i) => {
    if (i === 0) {
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.tab-btn[data-view="living-minds"]')?.click();`
      });
      await sleep(250);
    } else if (i === 12) {
      await send('Runtime.evaluate', {
        expression: `document.querySelector('.tab-btn[data-view="conclave-treasury"]')?.click();`
      });
      await sleep(250);
    } else {
      await sleep(35);
    }
  });

  ws.close();
  chrome.kill();
  console.log('All 6 gameplay sequences (144 HD frames) captured successfully into:', OUT_ROOT);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
