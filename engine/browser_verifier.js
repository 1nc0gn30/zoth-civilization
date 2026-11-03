/**
 * 🧪 BROWSER VERIFIER ENGINE — Automated Headless UI/UX Audit
 * =====================================================================
 * Uses headless Chromium / Electron to verify every deployed web app:
 * - Loads URL in clean 1440x900 viewport
 * - Listens for console errors, unhandled rejections, and CSP blocks
 * - Verifies essential conversion elements (Stripe link, Solana Tip widget, Schema.org)
 * - Captures high-res verification screenshot
 * - Returns structured JSON audit result
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('headless');

async function runVerification() {
  await app.whenReady();

  const args = process.argv;
  const targetUrl = args.find(a => a.startsWith('http://') || a.startsWith('https://') || a.startsWith('file://')) || 'https://robots-txt-auditor.netlify.app';
  const screenshotPath = args.find(a => a.endsWith('.png')) || path.join(__dirname, '..', 'data', 'verified_app.png');

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      offscreen: true,
      contextIsolation: true
    }
  });

  const consoleErrors = [];
  const consoleLogs = [];

  win.webContents.on('console-message', (e, level, message, line, src) => {
    consoleLogs.push({ level, message });
    // Filter out harmless Electron security warnings
    if (level >= 2 && !message.includes('Electron Security Warning')) {
      consoleErrors.push({ level, message, line, src });
    }
  });

  try {
    await win.loadURL(targetUrl);
    // Allow scripts, fonts, and stylesheets to stabilize
    await new Promise(r => setTimeout(r, 1500));

    // Capture verification screenshot
    const image = await win.webContents.capturePage();
    if (screenshotPath) {
      const dir = path.dirname(screenshotPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(screenshotPath, image.toPNG());
    }

    // Inspect DOM & interactive elements
    const pageMetrics = await win.webContents.executeJavaScript(`(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
      const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
      const stripeLinks = links.filter(l => l.includes('buy.stripe.com'));
      const hasSolanaTip = !!document.querySelector('button[onclick*="Solana Tip"]') || !!document.querySelector('script[src*="solana_tip"]');
      const hasJsonLd = !!document.querySelector('script[type="application/ld+json"]');
      
      return {
        title: document.title,
        buttonCount: buttons.length,
        buttons: buttons.slice(0, 8),
        stripeLinks,
        hasSolanaTip,
        hasJsonLd,
        textSample: document.body.innerText.substring(0, 180).replace(/\\s+/g, ' ')
      };
    })()`);

    const result = {
      targetUrl,
      verified: consoleErrors.length === 0,
      timestamp: new Date().toISOString(),
      pageMetrics,
      consoleErrors,
      screenshotPath
    };

    console.log('[BROWSER_VERIFIED]:' + JSON.stringify(result));
    win.close();
    app.quit();
    process.exit(0);
  } catch (err) {
    console.error('[BROWSER_VERIFY_ERROR]:' + JSON.stringify({ targetUrl, error: err.message }));
    try { win.close(); } catch(e) {}
    app.quit();
    process.exit(1);
  }
}

runVerification();
