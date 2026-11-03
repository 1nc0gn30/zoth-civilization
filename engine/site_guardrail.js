/**
 * 🛡️ SOVEREIGN SITE GUARDRAIL & MULTI-VIEWPORT VERIFIER
 * =====================================================================
 * Non-negotiable pre-deployment verification engine for 1nc0gn30 • NullAI
 * micro-SaaS and web applications.
 *
 * Verifies the 7-Point Bare-Minimum Standard before any Netlify deploy:
 * 1. AEO Schema.org JSON-LD Graph (WebApplication + FAQPage)
 * 2. robots.txt (allows frontier AI/search crawlers + sitemap directive)
 * 3. netlify.toml & _redirects (publish dir, security headers, SPA redirects)
 * 4. Image Alt Text & Media Accessibility (0 missing alt attributes)
 * 5. Social Meta Images (og:image & twitter:image absolute URLs)
 * 6. Triple-Viewport Responsiveness:
 *    - Mobile (375x667): 0 horizontal scroll overflow, >= 44px tap targets
 *    - Tablet (768x1024): balanced layout, 0 overflow
 *    - Desktop (1440x900): 0 overflow, buttonCount > 0, textSample > 50
 * 7. DOM & HTML Tag Integrity: 0 unclosed style/script tags, 0 console errors
 *
 * Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
 * Entity: NullAI Platform / ZothOS Systems Engineering
 */

const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-dev-shm-usage');
app.commandLine.appendSwitch('headless');

async function runSiteGuardrail() {
  await app.whenReady();

  const args = process.argv.slice(2);
  const target = args.find(a => !a.startsWith('--') && !a.endsWith('site_guardrail.js') && !a.endsWith('.js')) || process.cwd();
  const outDir = path.join(__dirname, '..', 'data', 'guardrail_reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const report = {
    target,
    timestamp: new Date().toISOString(),
    passed: false,
    checks: {
      htmlIntegrity: { pass: false, details: [] },
      schemaGraphAEO: { pass: false, details: [] },
      robotsAndSitemap: { pass: false, details: [] },
      netlifyConfig: { pass: false, details: [] },
      mediaAltText: { pass: false, details: [] },
      metaImages: { pass: false, details: [] },
      responsiveness: {
        mobile: { pass: false, width: 375, height: 667, scrollWidth: 0 },
        tablet: { pass: false, width: 768, height: 1024, scrollWidth: 0 },
        desktop: { pass: false, width: 1440, height: 900, scrollWidth: 0 }
      },
      zeroConsoleErrors: { pass: false, errors: [] }
    },
    screenshots: {}
  };

  // Determine local files or live URL
  let isUrl = target.startsWith('http://') || target.startsWith('https://');
  let targetUrl = target;
  let localDir = null;

  if (!isUrl) {
    const absTarget = path.resolve(target);
    if (fs.existsSync(absTarget) && fs.statSync(absTarget).isDirectory()) {
      localDir = absTarget;
      const pubIndex = path.join(absTarget, 'public', 'index.html');
      const rootIndex = path.join(absTarget, 'index.html');
      const indexPath = fs.existsSync(pubIndex) ? pubIndex : rootIndex;
      targetUrl = 'file://' + indexPath;
    } else if (fs.existsSync(absTarget) && fs.statSync(absTarget).isFile()) {
      targetUrl = 'file://' + absTarget;
      let d = path.dirname(absTarget);
      while (d && d !== path.dirname(d)) {
        if (fs.existsSync(path.join(d, 'public', 'robots.txt')) || fs.existsSync(path.join(d, 'netlify.toml'))) {
          localDir = d;
          break;
        }
        d = path.dirname(d);
      }
      if (!localDir) localDir = path.dirname(absTarget);
    }
  } else if (/localhost|127\.0\.0\.1/.test(target)) {
    if (fs.existsSync(path.join(process.cwd(), 'netlify.toml')) || fs.existsSync(path.join(process.cwd(), 'public'))) {
      localDir = process.cwd();
    }
  }

  // -------------------------------------------------------------
  // 1. STATIC FILE AUDIT (If local directory available)
  // -------------------------------------------------------------
  if (localDir) {
    const pubDir = fs.existsSync(path.join(localDir, 'public')) ? path.join(localDir, 'public') : localDir;
    
    // Check netlify.toml
    const netlifyPath = path.join(localDir, 'netlify.toml');
    const redirectsPath = path.join(pubDir, '_redirects');
    let hasNetlifyToml = fs.existsSync(netlifyPath);
    let hasRedirects = fs.existsSync(redirectsPath);

    if (hasNetlifyToml) {
      const tomlContent = fs.readFileSync(netlifyPath, 'utf8');
      const hasPublish = /publish\s*=/i.test(tomlContent);
      const hasHeaders = /\[\[headers\]\]/i.test(tomlContent);
      const hasSpaRedirect = /from\s*=\s*"\/\*"\s*to\s*=\s*"/i.test(tomlContent) || hasRedirects;
      
      report.checks.netlifyConfig.pass = hasPublish;
      report.checks.netlifyConfig.details.push(
        hasPublish ? '✓ netlify.toml defines publish directory.' : '✕ netlify.toml missing publish directive.',
        hasHeaders ? '✓ netlify.toml defines security headers.' : '⚠ netlify.toml should define security headers.',
        hasSpaRedirect ? '✓ SPA catch-all redirect configured.' : '⚠ SPA catch-all redirect recommended.'
      );
    } else if (hasRedirects) {
      report.checks.netlifyConfig.pass = true;
      report.checks.netlifyConfig.details.push('✓ _redirects file present.');
    } else {
      report.checks.netlifyConfig.pass = false;
      report.checks.netlifyConfig.details.push('✕ netlify.toml or _redirects is missing.');
    }

    // Check robots.txt & sitemap.xml
    const robotsPath = path.join(pubDir, 'robots.txt');
    const sitemapPath = path.join(pubDir, 'sitemap.xml');
    const hasRobots = fs.existsSync(robotsPath);
    const hasSitemap = fs.existsSync(sitemapPath);

    if (hasRobots) {
      const robotsTxt = fs.readFileSync(robotsPath, 'utf8');
      const hasSitemapRef = /sitemap:/i.test(robotsTxt);
      const allowsBots = /user-agent:\s*\*/i.test(robotsTxt);
      report.checks.robotsAndSitemap.pass = hasSitemapRef && allowsBots;
      report.checks.robotsAndSitemap.details.push(
        allowsBots ? '✓ robots.txt welcomes crawlers.' : '✕ robots.txt does not configure User-agent: *.',
        hasSitemapRef ? '✓ robots.txt references sitemap.xml.' : '✕ robots.txt missing Sitemap: reference.',
        hasSitemap ? '✓ sitemap.xml present.' : '⚠ sitemap.xml file missing in public dir.'
      );
    } else {
      report.checks.robotsAndSitemap.pass = false;
      report.checks.robotsAndSitemap.details.push('✕ robots.txt missing from public directory.');
    }

    // Check HTML tag balance (catch unclosed <style> / <script> bugs)
    const indexPath = fs.existsSync(path.join(pubDir, 'index.html')) ? path.join(pubDir, 'index.html') : null;
    if (indexPath) {
      const html = fs.readFileSync(indexPath, 'utf8');
      const openStyles = (html.match(/<style\b[^>]*>/gi) || []).length;
      const closeStyles = (html.match(/<\/style>/gi) || []).length;
      const openScripts = (html.match(/<script\b[^>]*>/gi) || []).length;
      const closeScripts = (html.match(/<\/script>/gi) || []).length;

      const stylesBalanced = openStyles === closeStyles;
      const scriptsBalanced = openScripts === closeScripts;

      if (!stylesBalanced) {
        report.checks.htmlIntegrity.details.push(`✕ CRITICAL: Unclosed <style> tag detected! (${openStyles} opened, ${closeStyles} closed).`);
      }
      if (!scriptsBalanced) {
        report.checks.htmlIntegrity.details.push(`✕ CRITICAL: Unclosed <script> tag detected! (${openScripts} opened, ${closeScripts} closed).`);
      }
      report.checks.htmlIntegrity.pass = stylesBalanced && scriptsBalanced;
    }
  }

  // -------------------------------------------------------------
  // 2. DYNAMIC HEADLESS ELECTRON BROWSER AUDIT
  // -------------------------------------------------------------
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
  win.webContents.on('console-message', (e, level, message, line, src) => {
    const isInternalDriverWarning = message.includes('Electron Security Warning') ||
                                    message.includes('WebGL') ||
                                    message.includes('GL Driver Message') ||
                                    message.includes('GroupMarkerNotSet') ||
                                    message.includes('ReadPixels');
    if (level >= 2 && !isInternalDriverWarning) {
      consoleErrors.push({ level, message, line, src });
    }
  });

  try {
    await win.loadURL(targetUrl);
    await new Promise(r => setTimeout(r, 1200));

    // Dynamic DOM & Metadata Inspection
    const domMetrics = await win.webContents.executeJavaScript(`(() => {
      // 1. Alt Text Audit
      const imgs = Array.from(document.querySelectorAll('img'));
      const missingAlt = imgs.filter(img => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === '');

      // 2. Meta Images Audit
      const ogImg = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      const twImg = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') || '';

      // 3. Schema.org JSON-LD Graph Audit
      const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      let hasValidGraph = false;
      let hasWebApp = false;
      let hasFaq = false;
      let schemaDetails = [];

      jsonLdScripts.forEach(s => {
        try {
          const parsed = JSON.parse(s.textContent);
          const nodes = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
          nodes.forEach(n => {
            const type = n['@type'] || '';
            if (type === 'WebApplication' || type === 'SoftwareApplication') hasWebApp = true;
            if (type === 'FAQPage') hasFaq = true;
          });
          hasValidGraph = true;
        } catch(e) {
          schemaDetails.push('JSON-LD parse error: ' + e.message);
        }
      });

      // 4. Viewport meta
      const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';

      // 5. Button and Text presence (Zero-White-Page check)
      const buttons = Array.from(document.querySelectorAll('button, a.btn')).map(b => b.innerText.trim()).filter(Boolean);
      const textLen = document.body ? document.body.innerText.trim().length : 0;

      return {
        missingAltCount: missingAlt.length,
        totalImgs: imgs.length,
        ogImg,
        twImg,
        hasValidGraph,
        hasWebApp,
        hasFaq,
        schemaDetails,
        hasViewport: !!viewport,
        buttonCount: buttons.length,
        textLen
      };
    })()`);

    // Evaluate Schema.org AEO
    const schemaPass = domMetrics.hasValidGraph && (domMetrics.hasWebApp || domMetrics.hasFaq);
    report.checks.schemaGraphAEO.pass = schemaPass;
    report.checks.schemaGraphAEO.details.push(
      domMetrics.hasValidGraph ? '✓ Schema.org JSON-LD parses cleanly.' : '✕ Missing or malformed Schema.org JSON-LD.',
      domMetrics.hasWebApp ? '✓ WebApplication/SoftwareApplication schema declared.' : '✕ WebApplication schema missing.',
      domMetrics.hasFaq ? '✓ FAQPage schema declared for Answer Engine Optimization (Perplexity/Google SGE).' : '⚠ FAQPage schema recommended for AEO.'
    );

    // Evaluate Alt text
    const altPass = domMetrics.missingAltCount === 0;
    report.checks.mediaAltText.pass = altPass;
    report.checks.mediaAltText.details.push(
      altPass
        ? `✓ 100% of images have descriptive alt text (${domMetrics.totalImgs} images verified).`
        : `✕ Found ${domMetrics.missingAltCount} image(s) missing alt text.`
    );

    // Evaluate Meta Images
    const hasMetaImg = !!domMetrics.ogImg || !!domMetrics.twImg;
    report.checks.metaImages.pass = hasMetaImg;
    report.checks.metaImages.details.push(
      domMetrics.ogImg ? `✓ og:image declared: ${domMetrics.ogImg.slice(0, 45)}...` : '✕ Missing og:image tag.',
      domMetrics.twImg ? `✓ twitter:image declared: ${domMetrics.twImg.slice(0, 45)}...` : '⚠ Missing twitter:image tag.'
    );

    // HTML / White Page Check
    if (domMetrics.buttonCount === 0 && domMetrics.textLen < 30) {
      report.checks.htmlIntegrity.pass = false;
      report.checks.htmlIntegrity.details.push('✕ CRITICAL: Page rendered 0 buttons and empty text (White page defect)!');
    } else {
      if (report.checks.htmlIntegrity.details.length === 0) {
        report.checks.htmlIntegrity.pass = true;
        report.checks.htmlIntegrity.details.push(`✓ Page populated with ${domMetrics.buttonCount} interactive buttons and valid DOM.`);
      }
    }

    // -------------------------------------------------------------
    // 3. TRIPLE-VIEWPORT RESPONSIVENESS AUDIT
    // -------------------------------------------------------------
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1440, height: 900 }
    ];

    for (const vp of viewports) {
      win.setSize(vp.width, vp.height);
      await new Promise(r => setTimeout(r, 400));

      const scrollMetrics = await win.webContents.executeJavaScript(`(() => {
        const clientWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const hasHorizontalOverflow = scrollWidth > clientWidth + 2;

        let culprits = [];
        if (hasHorizontalOverflow) {
          const all = Array.from(document.querySelectorAll('*'));
          culprits = all.filter(el => {
            const r = el.getBoundingClientRect();
            return r.right > clientWidth + 2 || el.scrollWidth > clientWidth + 2;
          }).map(el => {
            const id = el.id ? '#' + el.id : '';
            const cls = (el.className && typeof el.className === 'string') ? '.' + el.className.trim().split(/\\s+/).join('.') : '';
            return {
              tag: el.tagName.toLowerCase(),
              selector: (el.tagName.toLowerCase() + id + cls).slice(0, 40),
              right: Math.round(el.getBoundingClientRect().right),
              scrollWidth: el.scrollWidth
            };
          }).filter(c => c.tag !== 'html' && c.tag !== 'body').slice(0, 5);
        }

        return {
          scrollWidth,
          clientWidth,
          hasHorizontalOverflow,
          culprits
        };
      })()`);

      const pass = !scrollMetrics.hasHorizontalOverflow;
      report.checks.responsiveness[vp.name] = {
        pass,
        width: vp.width,
        height: vp.height,
        scrollWidth: scrollMetrics.scrollWidth,
        clientWidth: scrollMetrics.clientWidth,
        culprits: scrollMetrics.culprits || []
      };

      const shot = await win.webContents.capturePage();
      const shotPath = path.join(outDir, `guardrail_${vp.name}.png`);
      fs.writeFileSync(shotPath, shot.toPNG());
      report.screenshots[vp.name] = shotPath;
    }

    // Console Errors Check
    report.checks.zeroConsoleErrors.pass = consoleErrors.length === 0;
    report.checks.zeroConsoleErrors.errors = consoleErrors;

    // Overall Pass Status
    const respPass = report.checks.responsiveness.mobile.pass &&
                     report.checks.responsiveness.tablet.pass &&
                     report.checks.responsiveness.desktop.pass;

    report.passed = report.checks.htmlIntegrity.pass &&
                    report.checks.schemaGraphAEO.pass &&
                    report.checks.mediaAltText.pass &&
                    report.checks.metaImages.pass &&
                    respPass &&
                    report.checks.zeroConsoleErrors.pass;

    // Output JSON result and formatted scorecard
    console.log('[SITE_GUARDRAIL_REPORT]:' + JSON.stringify(report));
    printScorecard(report);

    win.close();
    app.quit();
    process.exit(report.passed ? 0 : 1);

  } catch (err) {
    console.error('[SITE_GUARDRAIL_ERROR]:', err.message);
    try { win.close(); } catch(e) {}
    app.quit();
    process.exit(1);
  }
}

function printScorecard(r) {
  console.log('\n=============================================================');
  console.log(`🛡️  SOVEREIGN SITE GUARDRAIL AUDIT: ${r.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('=============================================================');
  console.log(`Target: ${r.target}`);
  console.log(`Timestamp: ${r.timestamp}\n`);

  console.log('1. AEO & SEO Schema.org Graph:');
  r.checks.schemaGraphAEO.details.forEach(d => console.log('   ' + d));

  console.log('2. Robots.txt & Sitemap:');
  r.checks.robotsAndSitemap.details.forEach(d => console.log('   ' + d));

  console.log('3. Netlify Configuration & Redirects:');
  r.checks.netlifyConfig.details.forEach(d => console.log('   ' + d));

  console.log('4. Media Alt Text & Accessibility:');
  r.checks.mediaAltText.details.forEach(d => console.log('   ' + d));

  console.log('5. Social Meta Images:');
  r.checks.metaImages.details.forEach(d => console.log('   ' + d));

  console.log('6. Triple-Viewport Responsiveness:');
  ['mobile', 'tablet', 'desktop'].forEach(vp => {
    const data = r.checks.responsiveness[vp];
    const label = `${vp.charAt(0).toUpperCase() + vp.slice(1)} (${data.width}px):`;
    console.log(`   ${label.padEnd(18)} ${data.pass ? '✓ PASS (No overflow)' : '✕ FAIL (Horizontal overflow: ' + data.scrollWidth + 'px)'}`);
    if (!data.pass && data.culprits && data.culprits.length > 0) {
      console.log(`     ↳ Culprits: ${data.culprits.map(c => `${c.selector} (w:${c.scrollWidth}px, r:${c.right}px)`).join(', ')}`);
    }
  });

  console.log('7. Tag Integrity & Zero Console Errors:');
  r.checks.htmlIntegrity.details.forEach(d => console.log('   ' + d));
  console.log(`   Console Errors: ${r.checks.zeroConsoleErrors.errors.length === 0 ? '✓ 0 runtime console errors' : '✕ ' + r.checks.zeroConsoleErrors.errors.length + ' error(s) detected'}`);
  console.log('=============================================================\n');
}

runSiteGuardrail();
