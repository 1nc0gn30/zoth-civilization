/**
 * B2B SEO / Web Agency & Technical Consultant Outreach Engine
 * Pitches the $0 All-Access Sovereign Pro Bundle (44 Developer, AEO, Core Web Vitals,
 * Robots.txt & Schema.org Tools) and $0 standalone tools to digital agencies.
 */

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env.sovereign');
const DISPATCH_LOG_FILE = path.join(__dirname, '..', 'data', 'outreach_dispatches.json');

// Agency prospect data is operator-local and never committed. It lives in the
// gitignored file data/agency_prospects.local.json: { "prospects": [ ... ] }
const AGENCY_FILE = path.join(__dirname, '..', 'data', 'agency_prospects.local.json');

function loadAgencyProspects() {
  try {
    const raw = JSON.parse(fs.readFileSync(AGENCY_FILE, 'utf8'));
    return Array.isArray(raw.prospects) ? raw.prospects : [];
  } catch (e) {
    return [];
  }
}

const AGENCY_PROSPECTS = loadAgencyProspects();

function loadResendCredentials() {
  let apiKey = process.env.RESEND_API_KEY;
  let fromEmail = process.env.RESEND_FROM_EMAIL || '1nc0gn30@outreach.nullai.tech';
  if (fs.existsSync(ENV_PATH)) {
    const raw = fs.readFileSync(ENV_PATH, 'utf8');
    const mk = raw.match(/^RESEND_API_KEY=([^\r\n]+)/m);
    if (mk) apiKey = mk[1].trim().replace(/^["']|["']$/g, '');
    const mf = raw.match(/^RESEND_FROM_EMAIL=([^\r\n]+)/m);
    if (mf) fromEmail = mf[1].trim().replace(/^["']|["']$/g, '');
  }
  return { apiKey, fromEmail };
}

function buildAgencyEmail(a) {
  const agencyName = a.agencyName || a.businessName || 'Agency';
  const finding = a.finding || a.auditNotes || `I saw ${agencyName} builds custom websites and technical SEO campaigns in ${a.city || 'your market'}.`;
  const bundleStripeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const aeoStripeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const cwvStripeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const turnkey5PageUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const customSwarmUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';

  const subject = `Quick note for ${agencyName} + AEO / Technical SEO Pro Toolkit & White-Label Builds`;

  const text = [
    `Hi ${agencyName} team,`,
    finding,
    `I'm an independent systems engineer in Virginia (1nc0gn30 • NullAI) and I just shipped a suite of 44 zero-backend, in-browser technical SEO, AEO (AI Engine Optimization), and developer auditing tools built specifically for agencies and technical consultants:\n\n• AEO Knowledge Graph Engine (Schema.org @graph + FAQPage synthesizer for Perplexity/ChatGPT/Google SGE): https://aeo-graph-engine.netlify.app\n• Robots.txt & AI Crawler Security Auditor (GPTBot, ClaudeBot, PerplexityBot validator): https://robots-txt-auditor.netlify.app\n• CWV Speed Optimization Studio (Core Web Vitals LCP/CLS/INP fix generator): https://cwv-speed-studio.netlify.app\n• City Desk (1,000-page deterministic local trade static site generator): https://city-desk.netlify.app\n• Full 44-Tool Storefront & Custom Engineering Catalog: https://1nc0gn30.github.io/`,
    `Every tool runs 100% client-side in your browser with zero monthly subscriptions (use promo code FOUNDER25 for 25% off any option):\n\n1) All-Access Sovereign Pro Bundle (Lifetime Pro license to all 72 tools — $0 one-time vs $299 regular):\n${bundleStripeUrl}\n\n2) White-Label Turnkey 5-Page Client Website + Full Schema.org AI Graph ($09 flat rate, 72h delivery, $0/mo):\n${turnkey5PageUrl}\n\n3) Custom Autonomous AI Agent Swarm, Custom MCP Server or White-Label SaaS Build ($997 flat rate, 5-day delivery):\n${customSwarmUrl}\n\n4) Individual Pro Tool License ($0 one-time lifetime):\n• AEO Knowledge Graph Engine Pro ($0): ${aeoStripeUrl}\n• CWV Speed Studio Pro ($0): ${cwvStripeUrl}`,
    `Feel free to test the live tools in your browser anytime, or reply directly if you want to collaborate on white-label technical builds (Stripe or Solana/USDC at GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK supported).`,
    `Best regards,\n1nc0gn30\n1nc0gn30 • NullAI (https://1nc0gn30.github.io • nullai.tech)\ncontact@nullai.tech`
  ].join('\n\n');

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#1c1917;max-width:620px;margin:0 auto;padding:16px;">
  <p>Hi <strong>${agencyName}</strong> team,</p>
  <p>${finding}</p>
  <p>I'm an independent systems engineer (1nc0gn30 • NullAI) and I built a suite of <strong>44 client-side Technical SEO, AEO (AI Engine Optimization), and Web Performance tools</strong> that your team can use right in the browser on client audits with zero monthly SaaS subscriptions:</p>
  <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px;padding:14px 16px;margin:16px 0;">
    <ul style="margin:0;padding-left:18px;color:#292524;font-size:14px;">
      <li><strong><a href="https://aeo-graph-engine.netlify.app" style="color:#9a3412;">AEO Knowledge Graph Engine</a>:</strong> Instant Schema.org <code>@graph</code> + <code>FAQPage</code> JSON-LD generator for Perplexity, ChatGPT Search & Google SGE.</li>
      <li><strong><a href="https://robots-txt-auditor.netlify.app" style="color:#9a3412;">Robots.txt & AI Crawler Auditor</a>:</strong> Audit & generate directives for GPTBot, ClaudeBot, PerplexityBot & Googlebot.</li>
      <li><strong><a href="https://cwv-speed-studio.netlify.app" style="color:#9a3412;">CWV Speed Optimization Studio</a>:</strong> Core Web Vitals (LCP, CLS, INP) diagnostic & patch generator.</li>
      <li><strong><a href="https://city-desk.netlify.app" style="color:#9a3412;">City Desk Local Trade Engine</a>:</strong> 1,000-page deterministic local trade site synthesizer.</li>
      <li><strong><a href="https://1nc0gn30.github.io/" style="color:#9a3412;">Full 44-Tool Catalog & White-Label Builds</a>:</strong> Inspect all 44 live browser-native tools.</li>
    </ul>
  </div>
  <p>You can test all of them free in the browser, or lock in agency licensing and white-label engineering below (promo code <strong>FOUNDER25</strong> takes 25% off at Stripe checkout):</p>
  <div style="border:1px solid #d6d3d1;border-radius:8px;padding:14px 16px;background:#ffffff;margin:12px 0;">
    <strong style="color:#1c1917;font-size:15px;">⚡ Option 1: All-Access Sovereign Pro Bundle (All 72 Tools — $0 One-Time Lifetime)</strong>
    <p style="margin:4px 0 10px 0;font-size:13px;color:#57534e;">Unlocks standalone production exports across all 44 SEO, AEO, Core Web Vitals, Security, and AI Developer tools forever ($0/mo).</p>
    <a href="${bundleStripeUrl}" style="display:inline-block;background:#292524;color:#ffffff;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13px;">💳 Unlock All 44 Pro Tools ($0 Lifetime)</a>
    <span style="display:block;margin-top:8px;font-size:12px;color:#57534e;">Or single-tool Pro licenses ($0): <a href="${aeoStripeUrl}" style="color:#9a3412;">AEO Graph Engine ($0)</a> · <a href="${cwvStripeUrl}" style="color:#9a3412;">CWV Speed Studio ($0)</a></span>
  </div>
  <div style="border:2px solid #d97706;border-radius:8px;padding:14px 16px;background:#fffbeb;margin:12px 0;">
    <strong style="color:#92400e;font-size:15px;">🚀 Option 2: White-Label Turnkey 5-Page Client Website + AI Search Graph ($09 Flat Rate)</strong>
    <p style="margin:4px 0 10px 0;font-size:13px;color:#44403c;">Need overflow fulfillment for a client site? We build a custom 5-page 100/100 PageSpeed site + full Schema.org graph + 24/7 AI Quote Bot in 72 hours that you can resell for $2,500+.</p>
    <a href="${turnkey5PageUrl}" style="display:inline-block;background:#d97706;color:#ffffff;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13px;">⚡ Order White-Label 5-Page Build ($09)</a>
  </div>
  <div style="border:2px solid #0284c7;border-radius:8px;padding:14px 16px;background:#f0f9ff;margin:12px 0;">
    <strong style="color:#0369a1;font-size:15px;">🤖 Option 3: Custom Autonomous AI Agent Swarm, MCP Server or SaaS MVP ($997 Flat Rate)</strong>
    <p style="margin:4px 0 10px 0;font-size:13px;color:#334155;">5-day custom engineering sprint: bespoke multi-agent workflow, custom Claude/Cursor MCP server, or white-label web app with 100% source code handoff.</p>
    <a href="${customSwarmUrl}" style="display:inline-block;background:#0284c7;color:#ffffff;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13px;">🛠️ Reserve 5-Day Custom AI Build ($997)</a>
  </div>
  <p style="margin-top:20px;font-size:13px;color:#57534e;border-top:1px solid #e7e5e4;padding-top:12px;">
    <strong>1nc0gn30</strong><br>
    1nc0gn30 • NullAI • <a href="https://1nc0gn30.github.io" style="color:#9a3412;">1nc0gn30.github.io</a> • <a href="https://nullai.tech" style="color:#9a3412;">nullai.tech</a><br>
    Reply directly to: <a href="mailto:contact@nullai.tech" style="color:#9a3412;">contact@nullai.tech</a>
  </p>
</div>`;

  return { subject, text, html };
}

async function dispatchAgencyBatch() {
  // Mass email outreach permanently disabled per sovereign directive (2026-10-21)
  return { attempted: 0, sentCount: 0, disabled: true, reason: 'Mass email outreach permanently disabled', results: [] };
}

async function _disabled_dispatchAgencyBatch() {
  const { apiKey, fromEmail } = loadResendCredentials();
  if (!apiKey) throw new Error('Missing RESEND_API_KEY');

  let log = { sent: [] };
  if (fs.existsSync(DISPATCH_LOG_FILE)) {
    try { log = JSON.parse(fs.readFileSync(DISPATCH_LOG_FILE, 'utf8')); } catch (e) {}
  }
  const alreadySent = new Set((log.sent || []).map(x => String(x.email).toLowerCase()));

  const cooldownPath = path.join(__dirname, "..", "data", "resend_cooldown.json");
  if (fs.existsSync(cooldownPath)) {
    try {
      const cd = JSON.parse(fs.readFileSync(cooldownPath, "utf8"));
      if (cd.cooldownUntil && cd.cooldownUntil > Date.now()) {
        return { attempted: 0, sentCount: 0, totalHistoricalSent: log.sent.length, skippedCooldown: true, cooldownUntil: new Date(cd.cooldownUntil).toISOString(), results: [] };
      }
    } catch (e) {}
  }
  const candidates = AGENCY_PROSPECTS.filter(a => !alreadySent.has(a.email.toLowerCase()));
  const results = [];

  for (const a of candidates) {
    const { subject, text, html } = buildAgencyEmail(a);
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `1nc0gn30 <${fromEmail}>`,
          to: [a.email],
          reply_to: 'contact@nullai.tech',
          subject,
          text,
          html
        })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        const entry = {
          resendId: data.id,
          sentAt: new Date().toISOString(),
          businessName: a.agencyName,
          email: a.email,
          city: a.city,
          trade: 'seo-agency-bundle',
          currentUrl: a.url,
          previewUrl: 'https://aeo-graph-engine.netlify.app'
        };
        log.sent.push(entry);
        results.push({ ok: true, ...entry });
      } else {
        const errMsg = data.message || JSON.stringify(data);
        results.push({ ok: false, email: a.email, error: errMsg });
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, 2000));
        } else if (/monthly_quota/i.test(errMsg)) {
          fs.writeFileSync(cooldownPath, JSON.stringify({ cooldownUntil: Date.now() + 15 * 60 * 1000, reason: errMsg, updatedAt: new Date().toISOString() }, null, 2));
          break;
        }
      }
    } catch (err) {
      results.push({ ok: false, email: a.email, error: err.message });
    }
    await new Promise(r => setTimeout(r, 650));
  }

  fs.writeFileSync(DISPATCH_LOG_FILE, JSON.stringify(log, null, 2));
  return { attempted: candidates.length, sentCount: results.filter(r => r.ok).length, totalHistoricalSent: log.sent.length, results };
}

module.exports = {
  AGENCY_PROSPECTS,
  AGENCY_FILE,
  loadAgencyProspects,
  dispatchAgencyBatch
};
