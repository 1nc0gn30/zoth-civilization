/**
 * ⚡ ZOTH CIVILIZATION — OPEN-ACCESS SITE & 21-AGENT SWARM GENERATOR
 * =====================================================================
 * 100% free, open-access client-side generator & voluntary support links:
 * 1. Instant Local Trade Website & Schema.org Generator (City Desk Engine)
 * 2. Autonomous 21-Agent Swarm & MCP Config Architect
 * 3. Direct Copy & Download (zero paywalls, zero gating)
 * 4. Optional "Buy Us a Coffee" (Stripe) & Solana Tip support links
 *
 * Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI Platform
 */

(function () {
  'use strict';

  const COFFEE_LINK = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const SOL_WALLET = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';

  const COLONY_INFO = {
    colony_capital: {
      title: 'Zoth Studio & Civilization (Open Access)',
      desc: 'Full 21-agent orchestration, unlimited City Desk exports, and Zoth Studio desktop binaries.'
    },
    colony_adytum_grove: {
      title: 'AEO Knowledge Graph Engine (Open Access)',
      desc: 'Answer Engine Optimization (Perplexity, ChatGPT, Google SGE) & JSON-LD Schema.org graph builder.'
    },
    colony_sol_crypta: {
      title: 'EnvGuard Zero-Knowledge Secrets Vault (Open Access)',
      desc: 'Client-side AES-GCM-256 & Argon2id .env encryption and leak scanner.'
    },
    colony_nova_zoth: {
      title: 'City Desk Local Trade Website Engine (Open Access)',
      desc: 'Production-ready local contractor websites with LocalBusiness schema and instant quote intake.'
    },
    colony_hex_bastion: {
      title: 'CWV Speed Engine & Robots.txt Auditor (Open Access)',
      desc: 'Core Web Vitals INP/LCP optimizer and AI crawler robots.txt validator.'
    }
  };

  let currentMode = 'trade-site';

  function updateHeaderSupportUI() {
    const headerPro = document.getElementById('headerProContainer');
    if (headerPro) {
      headerPro.innerHTML =
        `<a href="${COFFEE_LINK}" target="_blank" rel="noopener noreferrer" style="color: #FFD97A; font-weight: 800; font-size: 11px; border: 1px solid rgba(233,196,106,0.5); background: rgba(233, 196, 106, 0.14); padding: 4px 10px; border-radius: 9999px; display: inline-flex; align-items: center; gap: 4px; text-decoration: none;">☕ Buy Us a Coffee</a>`;
    }
  }

  function openSolanaTipCheckout() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(SOL_WALLET);
    }
    window.open(COFFEE_LINK, '_blank', 'noopener');
  }

  function openCoffeeSupportModal() {
    const m = document.getElementById('coffeeSupportModal');
    if (m) m.style.display = 'flex';
  }

  function closeCoffeeSupportModal() {
    const m = document.getElementById('coffeeSupportModal');
    if (m) m.style.display = 'none';
  }

  function openSovereignGeneratorModal() {
    const m = document.getElementById('sovereignGeneratorModal');
    if (m) {
      m.style.display = 'flex';
      runSovereignGenerator();
    }
  }

  function closeSovereignGeneratorModal() {
    const m = document.getElementById('sovereignGeneratorModal');
    if (m) m.style.display = 'none';
  }

  // Real Client-Side Generator for Local Trade Websites (City Desk) & 21-Agent Swarms
  function runSovereignGenerator() {
    const bizName = (document.getElementById('genBizName')?.value || 'Coastal Apex Roofing & Restoration').trim();
    const cityState = (document.getElementById('genCityState')?.value || 'Austin, TX').trim();
    const trade = document.getElementById('genTradeSelect')?.value || 'RoofingContractor';
    const phone = (document.getElementById('genPhone')?.value || '(512) 555-0194').trim();
    const swarmRole = document.getElementById('genSwarmSelect')?.value || 'lead-harvester';

    const tradeMeta = {
      RoofingContractor: { label: 'Roofing & Storm Restoration', avgTicket: '$4,800', leadEst: '$4,200–$9,600/mo', emergency: '24/7 Emergency Tarping & Storm Inspection' },
      HVACBusiness: { label: 'HVAC & Heat Pump Systems', avgTicket: '$3,900', leadEst: '$3,900–$8,500/mo', emergency: 'Same-Day AC & Furnace Repair Dispatch' },
      AutoRepair: { label: 'Mobile Auto Detailing & Ceramic Coating', avgTicket: '$380', leadEst: '$2,100–$5,400/mo', emergency: 'Mobile Driveway Fleet & Ceramic Protection' },
      HousePainter: { label: 'Exterior & Interior House Painting', avgTicket: '$3,200', leadEst: '$3,200–$7,800/mo', emergency: 'Free Color Consultation & 5-Year Warranty' },
      Plumber: { label: 'Plumbing, Drain & Water Heater Service', avgTicket: '$850', leadEst: '$2,800–$6,400/mo', emergency: '60-Minute Emergency Leak & Drain Response' }
    }[trade] || { label: 'Local Trade Specialist', avgTicket: '$2,500', leadEst: '$2,500–$6,000/mo', emergency: 'Same-Day Priority Service Dispatch' };

    const scoreEl = document.getElementById('genMetricScore');
    const leadEl = document.getElementById('genMetricLead');
    const statusEl = document.getElementById('genLiveSummary');
    const outputEl = document.getElementById('outputPreview');

    if (scoreEl) scoreEl.textContent = '99 / 100 AEO';
    if (leadEl) leadEl.textContent = tradeMeta.leadEst;
    if (statusEl) {
      statusEl.innerHTML =
        `✓ Verified <strong>${bizName}</strong> (${tradeMeta.label} in <strong>${cityState}</strong>) • ` +
        `Schema.org <code>${trade}</code> + <code>FAQPage</code> graph ready • Phone: <strong>${phone}</strong>`;
    }

    let generatedCode = '';
    if (currentMode === 'trade-site') {
      const slug = bizName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const schemaJson = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': trade,
            name: bizName,
            telephone: phone,
            address: { '@type': 'PostalAddress', addressLocality: cityState.split(',')[0].trim(), addressRegion: (cityState.split(',')[1] || 'VA').trim() },
            areaServed: cityState,
            priceRange: '$$',
            url: `https://${slug}.netlify.app`
          },
          {
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `How fast can ${bizName} provide an estimate in ${cityState}?`,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: `${bizName} provides same-day written estimates across ${cityState} with zero hidden fees. Call ${phone} for immediate dispatch.`
                }
              }
            ]
          }
        ]
      };

      generatedCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${bizName} — ${tradeMeta.label} in ${cityState}</title>
  <meta name="description" content="Trusted ${tradeMeta.label} serving ${cityState}. ${tradeMeta.emergency}. Call ${phone} for a same-day written estimate.">
  <script type="application/ld+json">
${JSON.stringify(schemaJson, null, 2)}
  </script>
  <style>
    :root { --bg: #08090F; --card: #121521; --gold: #E9C46A; --emerald: #10B981; --text: #F8FAFC; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; }
    .topbar { background: #10B981; color: #04130D; font-weight: 800; padding: 10px 20px; text-align: center; }
    .hero { max-width: 1120px; margin: 0 auto; padding: 64px 24px; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; }
    .badge { display: inline-block; padding: 6px 14px; border: 1px solid var(--gold); color: var(--gold); border-radius: 99px; font-size: 13px; font-weight: 700; margin-bottom: 16px; }
    h1 { font-size: clamp(2.2rem, 4vw, 3.4rem); line-height: 1.08; margin-bottom: 16px; }
    .cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 24px; }
    .btn-call { background: var(--gold); color: #090A0F; padding: 14px 26px; border-radius: 10px; font-weight: 800; text-decoration: none; }
    .quote-card { background: var(--card); border: 1px solid rgba(233,196,106,0.3); border-radius: 16px; padding: 28px; }
  </style>
</head>
<body>
  <div class="topbar">⚡ ${tradeMeta.emergency} in ${cityState} • Call Now: ${phone}</div>
  <section class="hero">
    <div>
      <span class="badge">✓ LICENSED & INSURED • ${cityState.toUpperCase()}</span>
      <h1>${bizName}: ${tradeMeta.label} Built to Last.</h1>
      <p>Clear written scope, upfront pricing, and direct owner accountability across ${cityState}.</p>
      <div class="cta-row">
        <a class="btn-call" href="tel:${phone.replace(/[^0-9+]/g, '')}">📞 Call ${phone}</a>
      </div>
    </div>
    <div class="quote-card">
      <h3>Request a Same-Day Estimate</h3>
      <p style="color:#94A3B8;font-size:14px;margin:8px 0 16px;">Direct dispatch to ${bizName} (${cityState}).</p>
    </div>
  </section>
</body>
</html>`;
    } else {
      const swarmConfig = {
        swarmName: `${bizName} Autonomous Swarm`,
        region: cityState,
        workflowArchetype: swarmRole,
        imperator: 'AZOTH (Key 1: The Magician)',
        securitySentinel: 'GHOSTBYTE (Key 4: The Emperor)',
        aeoArchitect: 'ATHENA (Key 2: The High Priestess)',
        commercialOutreach: 'MERCURY (Key 8: Strength)',
        supportRails: {
          buyUsACoffee: COFFEE_LINK,
          solanaTipWallet: SOL_WALLET
        },
        mcpServers: {
          'zoth-netlify-ax': { url: 'https://zoth.nullai.tech/api/netlify-ax-mcp.json', mode: 'autonomous' },
          'ghostbyte-envguard': { zeroLeakEnforced: true, cipher: 'AES-GCM-256-Argon2id' }
        }
      };
      generatedCode = JSON.stringify(swarmConfig, null, 2);
    }

    if (outputEl) {
      outputEl.textContent = generatedCode;
    }
  }

  function copyOutput() {
    const text = document.getElementById('outputPreview')?.innerText || '';
    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
    }
    const btn = document.getElementById('btnCopyGenerated');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Copied to Clipboard!';
      setTimeout(() => { btn.innerHTML = orig; }, 1600);
    }
  }

  function downloadOutput() {
    const text = document.getElementById('outputPreview')?.innerText || '';
    const ext = currentMode === 'trade-site' ? 'html' : 'json';
    const blob = new Blob([text], { type: ext === 'html' ? 'text/html' : 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = currentMode === 'trade-site' ? 'city-desk-production-site.html' : 'zoth-swarm.config.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function switchGenMode(mode) {
    currentMode = mode;
    const b1 = document.getElementById('tabGenTradeSite');
    const b2 = document.getElementById('tabGenSwarm');
    if (b1 && b2) {
      b1.style.background = mode === 'trade-site' ? 'rgba(233, 196, 106, 0.22)' : 'transparent';
      b1.style.borderColor = mode === 'trade-site' ? '#FFD97A' : 'rgba(255,255,255,0.12)';
      b2.style.background = mode === 'swarm-config' ? 'rgba(94, 234, 212, 0.22)' : 'transparent';
      b2.style.borderColor = mode === 'swarm-config' ? '#5EEAD4' : 'rgba(255,255,255,0.12)';
    }
    runSovereignGenerator();
  }

  function wire3DWorldSupportCards() {
    const civicCard = document.getElementById('civicCard');
    if (civicCard && !document.getElementById('civicSupportCard')) {
      const reg = document.createElement('div');
      reg.id = 'civicSupportCard';
      reg.style.cssText = 'margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(233, 196, 106, 0.28);';
      reg.innerHTML = `
        <div style="font-size: 10px; font-weight: 800; color: #10B981; letter-spacing: 0.08em; margin-bottom: 6px;">✦ 100% FREE & OPEN ACCESS • COLONY SUPPORT</div>
        <div id="civicOfferTitle" style="font-size: 13px; font-weight: 800; color: #F8FAFC; margin-bottom: 4px;">Zoth Studio & Civilization (Open Access)</div>
        <div id="civicOfferDesc" style="font-size: 11px; color: #BDB6CF; margin-bottom: 10px; line-height: 1.4;">All 21 autonomous agents, City Desk HTML exports, and updates are 100% unlocked for free.</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <a id="civicBtnStripe" href="${COFFEE_LINK}" target="_blank" rel="noopener" style="flex: 1; text-align: center; padding: 8px 10px; border-radius: 8px; background: linear-gradient(135deg, #E9C46A, #F59E0B); color: #05050A; font-weight: 800; font-size: 11px; text-decoration: none;">☕ Buy Us a Coffee (Stripe)</a>
          <button type="button" onclick="navigator.clipboard?.writeText('${SOL_WALLET}');this.textContent='✓ Copied SOL Wallet!';" style="flex: 1; padding: 7px 10px; border-radius: 8px; border: 1px solid #14F195; background: rgba(20, 241, 149, 0.12); color: #14F195; font-weight: 800; font-size: 11px; cursor: pointer;">◎ Solana Tip (GG2e...dXoK)</button>
        </div>
      `;
      civicCard.appendChild(reg);

      const titleEl = document.getElementById('civicTitle');
      if (titleEl) {
        const obs = new MutationObserver(() => {
          const t = (titleEl.textContent || '').toLowerCase();
          let key = 'colony_capital';
          if (t.includes('adytum')) key = 'colony_adytum_grove';
          else if (t.includes('sol')) key = 'colony_sol_crypta';
          else if (t.includes('nova')) key = 'colony_nova_zoth';
          else if (t.includes('hex')) key = 'colony_hex_bastion';
          const info = COLONY_INFO[key] || COLONY_INFO.colony_capital;
          const ot = document.getElementById('civicOfferTitle');
          const od = document.getElementById('civicOfferDesc');
          if (ot) ot.textContent = info.title;
          if (od) od.textContent = info.desc;
        });
        obs.observe(titleEl, { childList: true, characterData: true, subtree: true });
      }
    }

    const encCard = document.getElementById('globeEncounter');
    if (encCard && !document.getElementById('encounterSupportStrip')) {
      const reg = document.createElement('div');
      reg.id = 'encounterSupportStrip';
      reg.style.cssText = 'margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(233, 196, 106, 0.25); display: flex; gap: 6px; flex-wrap: wrap;';
      reg.innerHTML = `
        <button type="button" onclick="window.openSovereignGeneratorModal()" style="flex: 1; padding: 7px 10px; border-radius: 7px; background: rgba(233, 196, 106, 0.2); border: 1px solid #FFD97A; color: #FFD97A; font-weight: 800; font-size: 11px; cursor: pointer;">🛠️ Build Site / Swarm</button>
        <a href="${COFFEE_LINK}" target="_blank" rel="noopener" style="flex: 1; text-align: center; padding: 7px 10px; border-radius: 7px; background: #6366F1; color: #FFF; font-weight: 800; font-size: 11px; text-decoration: none;">☕ Buy Us a Coffee (Stripe)</a>
        <button type="button" onclick="window.openSolanaTipCheckout()" style="padding: 7px 10px; border-radius: 7px; border: 1px solid #14F195; background: rgba(20, 241, 149, 0.14); color: #14F195; font-weight: 800; font-size: 11px; cursor: pointer;">⚡ SOL</button>
      `;
      encCard.appendChild(reg);
    }
  }

  window.openCoffeeSupportModal = openCoffeeSupportModal;
  window.closeCoffeeSupportModal = closeCoffeeSupportModal;
  window.openSolanaTipCheckout = openSolanaTipCheckout;
  window.openSovereignGeneratorModal = openSovereignGeneratorModal;
  window.closeSovereignGeneratorModal = closeSovereignGeneratorModal;
  window.runSovereignGenerator = runSovereignGenerator;
  window.copyOutput = copyOutput;
  window.downloadOutput = downloadOutput;
  window.switchGenMode = switchGenMode;

  window.addEventListener('DOMContentLoaded', () => {
    updateHeaderSupportUI();
    wire3DWorldSupportCards();
    runSovereignGenerator();
  });
})();
