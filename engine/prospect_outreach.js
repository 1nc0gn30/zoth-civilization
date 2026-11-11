/**
 * Real-World Audited Local Trade Outreach Engine
 * Dispatches hyper-personalized website audit + live City Desk preview emails
 * to verified new local trade businesses via Resend API.
 * Strictly excludes any previous/settled clients.
 */

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env.sovereign');
const DISPATCH_LOG_FILE = path.join(__dirname, '..', 'data', 'outreach_dispatches.json');
const PIPELINE_FILE = path.join(__dirname, '..', 'data', 'local_revamp_pipeline.json');

// Prospect data is operator-local and never committed. It lives in the
// gitignored file data/prospects.local.json:
//   { "doNotContact": ["owner@example.com"], "prospects": [ { businessName, email, city, state, trade, ... } ] }
const PROSPECTS_FILE = path.join(__dirname, '..', 'data', 'prospects.local.json');

function loadLocalProspects() {
  try {
    const raw = JSON.parse(fs.readFileSync(PROSPECTS_FILE, 'utf8'));
    return {
      doNotContact: Array.isArray(raw.doNotContact) ? raw.doNotContact : [],
      prospects: Array.isArray(raw.prospects) ? raw.prospects : []
    };
  } catch (e) {
    return { doNotContact: [], prospects: [] };
  }
}

function saveLocalProspects(prospects) {
  const current = loadLocalProspects();
  fs.mkdirSync(path.dirname(PROSPECTS_FILE), { recursive: true });
  fs.writeFileSync(PROSPECTS_FILE, JSON.stringify({ doNotContact: current.doNotContact, prospects }, null, 2));
}

const _local = loadLocalProspects();
// Never contact existing/settled clients
const DO_NOT_CONTACT = new Set(_local.doNotContact.map((e) => String(e).toLowerCase()));
const VERIFIED_PROSPECTS = _local.prospects;

function loadResendCredentials() {
  let apiKey = process.env.RESEND_API_KEY;
  let fromEmail = process.env.RESEND_FROM_EMAIL || '1nc0gn30@outreach.1nc0gn30.si';
  if (fs.existsSync(ENV_PATH)) {
    const raw = fs.readFileSync(ENV_PATH, 'utf8');
    const mk = raw.match(/^RESEND_API_KEY=([^\r\n]+)/m);
    if (mk) apiKey = mk[1].trim().replace(/^["']|["']$/g, '');
    const mf = raw.match(/^RESEND_FROM_EMAIL=([^\r\n]+)/m);
    if (mf) fromEmail = mf[1].trim().replace(/^["']|["']$/g, '');
  }
  return { apiKey, fromEmail };
}

const VALID_CITY_SLUGS = new Set([
  'boise-id','spokane-wa','tacoma-wa','eugene-or','salem-or','bend-or','reno-nv','tucson-az','albuquerque-nm','el-paso-tx',
  'lubbock-tx','amarillo-tx','corpus-christi-tx','shreveport-la','lafayette-la','mobile-al','huntsville-al','montgomery-al',
  'jackson-ms','little-rock-ar','fayetteville-ar','tulsa-ok','wichita-ks','des-moines-ia','cedar-rapids-ia','omaha-ne',
  'sioux-falls-sd','fargo-nd','billings-mt','madison-wi','green-bay-wi','grand-rapids-mi','ann-arbor-mi','fort-wayne-in',
  'virginia-beach-va','norfolk-va','toledo-oh','dayton-oh','akron-oh','lexington-ky','knoxville-tn','chattanooga-tn',
  'greenville-sc','savannah-ga','augusta-ga','chesapeake-va','springfield-mo','fort-collins-co','provo-ut','gainesville-fl'
]);
const STATE_FALLBACK_SLUGS = {
  FL: 'gainesville-fl', GA: 'savannah-ga', SC: 'greenville-sc', NC: 'greenville-sc', VA: 'virginia-beach-va', MD: 'virginia-beach-va',
  TN: 'knoxville-tn', KY: 'lexington-ky', OH: 'dayton-oh', IN: 'fort-wayne-in', MI: 'grand-rapids-mi', WI: 'madison-wi',
  IL: 'madison-wi', MO: 'springfield-mo', KS: 'wichita-ks', OK: 'tulsa-ok', AR: 'little-rock-ar', MS: 'jackson-ms',
  AL: 'huntsville-al', LA: 'lafayette-la', TX: 'el-paso-tx', NM: 'albuquerque-nm', AZ: 'tucson-az', NV: 'reno-nv',
  CA: 'reno-nv', OR: 'eugene-or', WA: 'tacoma-wa', ID: 'boise-id', UT: 'provo-ut', CO: 'fort-collins-co',
  MT: 'billings-mt', ND: 'fargo-nd', SD: 'sioux-falls-sd', NE: 'omaha-ne', IA: 'des-moines-ia', MN: 'sioux-falls-sd',
  PA: 'akron-oh', NY: 'akron-oh', NJ: 'virginia-beach-va', CT: 'virginia-beach-va', MA: 'virginia-beach-va'
};

function sanitizeDisplayBrand(p) {
  let raw = String(p.businessName || '').trim();
  const host = String(p.currentUrl || '').replace(/^https?:\/\/(www\.)?/i, '').split('/')[0].toLowerCase();
  const badRe = /(#1|near\s+me|near\s+you|\bin\s+[a-z\s]{3,}|^(mysite|locations|main\s*home|hour\s*service\]?|home|welcome|plumbers?|roofers?|roofing\s+contractor|electricians?|dentists?|med\s*spa|painting\s+company|auto\s+repair|junk\s+removal|property\s+management|moving\s+company)$)/i;
  if (!raw || raw.length < 3 || raw.length > 44 || badRe.test(raw)) {
    if (host) {
      let base = host.split('.')[0].replace(/[-_]+/g, ' ');
      const words = ['plumbing','plumbers','plumber','roofing','roofers','roofer','hvac','heating','cooling','electric','electrical','dental','dentistry','dentist','smiles','medspa','aesthetics','wellness','garagedoors','garagedoor','doors','painting','painters','landscaping','landscape','lawn','pestcontrol','pest','autorepair','automotive','auto','properties','property','management','realty','rentals','junkremoval','junk','hauling','cleaning','cleaners','maids','detailing','detailers','grooming','petsalon','moving','movers','fitness','training','gym','services','service','solutions','company','pros','pro','inc','llc'];
      for (const w of words) base = base.replace(new RegExp(`(${w})`, 'gi'), ' $1 ');
      base = base.replace(/\s+/g, ' ').trim();
      if (base.length >= 3) {
        return base.split(' ').map(w => /^(llc|inc|hvac|ac|pm|az|tx|fl|ca|nc|sc|ga|tn|va|md|pa|nj|ny|oh|mi|il|wi|mn|mo|ks|co|ut|wa|or|nv)$/i.test(w) ? w.toUpperCase() : (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join(' ');
      }
    }
  }
  return raw;
}

function buildEmailForProspect(p) {
  const cleanBiz = sanitizeDisplayBrand(p);
  p.businessName = cleanBiz;
  const computedSlug = (p.city && p.state)
    ? `${String(p.city).toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${String(p.state).toLowerCase()}`
    : '';
  const rawSlug = p.citySlug
    ? (p.state && !String(p.citySlug).toLowerCase().endsWith('-' + String(p.state).toLowerCase()) ? `${p.citySlug}-${String(p.state).toLowerCase()}` : p.citySlug)
    : computedSlug;
  const safeCitySlug = rawSlug || STATE_FALLBACK_SLUGS[String(p.state || '').toUpperCase()] || 'virginia-beach-va';
  const basePreview = `https://city-desk-studio.netlify.app/cities/${safeCitySlug}/${p.trade}/`;
  const cleanPhone = (p.phone && !/\(214\)\s*748-3648|\(999\)\s*999-9999/.test(p.phone)) ? p.phone : '';
  const previewUrl = `${basePreview}?biz=${encodeURIComponent(cleanBiz)}&phone=${encodeURIComponent(cleanPhone)}&email=${encodeURIComponent(p.email || '')}&city=${encodeURIComponent((p.city || '') + (p.state ? ', ' + p.state : ''))}&site=${encodeURIComponent(p.currentUrl || '')}`;
  const tradeLabel = p.tradeLabel || (p.trade ? p.trade.charAt(0).toUpperCase() + p.trade.slice(1).replace(/-/g, ' ') : 'Local Service');
  const findingText = p.specificFinding || p.auditNotes || `I reviewed ${p.currentUrl} in ${p.city} and prepared a high-speed standalone ${p.city} ${tradeLabel.toLowerCase()} page with pre-wired Schema.org LocalBusiness JSON-LD and an instant quote calculator.`;
  const impulse7Url = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const dfyStripeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const htmlStripeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const aiReceptionistUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const turnkey5PageUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const deposit99Url = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';

  const subject = `Quick note on ${cleanBiz}'s website + live ${p.city} ${tradeLabel} preview`;

  const text = [
    `Hi ${cleanBiz} team,`,
    findingText,
    `Because I build fast, zero-retainer sites & AI lead tools for local business owners, I put together a live working ${p.city}, ${p.state} ${tradeLabel.toLowerCase()} page you can test on your phone or desktop right now:\n${previewUrl}`,
    `What is already built into this page:\n• Sub-second mobile load speed (100/100 Core Web Vitals)\n• Pre-wired Google LocalBusiness Schema.org JSON-LD markup for ${p.city}, ${p.state}\n• Interactive 60-second instant quote calculator with $0 monthly platform fees`,
    `If you'd like to grab or launch this setup for ${cleanBiz} today (no sales call required):\n\n★ $7 FLASH STARTER — Instant AI Search & Lead Booster Pack ($7 one-time, $0/mo):\n${impulse7Url}\n(Instant 1-click download of your customized Google/ChatGPT LocalBusiness Schema.org JSON-LD graph, llms.txt AI index file, 60-second quote calculator snippet, and the full standalone mobile-first HTML page for ${cleanBiz} for just $7.)\n\n1) Done-For-You 1-Page Custom Launch + Domain Setup ($149 one-time, $0/mo):\n${dfyStripeUrl}\n(I customize the page with ${cleanBiz}'s logo, phone ${cleanPhone || ''}, photos, and connect your domain within 24 hours.)\n\n2) 24/7 Custom AI Receptionist, Instant Quote Bot & SMS Lead Capture Setup ($299 one-time, $0/mo — 48h delivery):\n${aiReceptionistUrl}\n(Answers customer questions 24/7, calculates instant quotes on your site, and texts every lead directly to your phone.)\n\n3) Turnkey 5-Page Custom Website + Google Maps & AI Search Dominance Package ($499 one-time, $0/mo — 72h delivery):\n${turnkey5PageUrl}\n(Or start with a $99 Risk-Free Kickoff Deposit and pay the balance only after approving your live 5-page preview: ${deposit99Url})`,
    `Or reply directly to this email if you have any questions or want me to drop the $7 AI Search & Quote snippet onto your existing site (Stripe, Apple Pay, Cash App, or Solana/USDC at GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK supported).`,
    `Best regards,\n1nc0gn30\n1nc0gn30 (https://1nc0gn30.github.io • 1nc0gn30.si)\ncontact@1nc0gn30.si`
  ].join('\n\n');

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.62;color:#171614;max-width:620px;margin:0 auto;padding:20px;background:#ffffff;">
  <div style="border-bottom:2px solid #171614;padding-bottom:10px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:baseline;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#8f3217;">CITY DESK · LOCAL WEB & AI ARCHITECTURE BRIEF</span>
    <span style="font-size:11px;color:#5c564c;font-family:monospace;">${p.city}, ${p.state}</span>
  </div>
  <p style="margin:0 0 14px;font-size:15px;">Hi <strong>${cleanBiz}</strong> team,</p>
  <p style="margin:0 0 14px;font-size:15px;color:#292524;">${findingText}</p>
  <p style="margin:0 0 18px;font-size:15px;color:#292524;">Because I build fast, zero-retainer websites and 24/7 AI quote bots for local business owners, I assembled a live working <strong>${p.city}, ${p.state} ${tradeLabel}</strong> preview with <strong>${cleanBiz}</strong> pre-wired that you can test on your phone or desktop right now:</p>
  <div style="background:#f4f0ea;border:1px solid #d8d1c5;border-left:4px solid #8f3217;border-radius:8px;padding:18px;margin:20px 0;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8f3217;margin-bottom:6px;">LIVE STAGING SPEC · PREPARED FOR ${cleanBiz.toUpperCase()}</div>
    <p style="margin:0 0 14px;font-size:13.5px;color:#44403c;">Includes sub-second mobile load speed (100/100 Core Web Vitals), pre-wired Google & ChatGPT <code>LocalBusiness</code> Schema.org JSON-LD for ${p.city}, and an interactive 60-second written quote ledger with <strong>$0/month platform fees</strong>.</p>
    <a href="${previewUrl}" style="display:inline-block;background:#171614;color:#f7f3ec;font-weight:700;font-size:14px;text-decoration:none;padding:12px 20px;border-radius:6px;">Open Live ${p.city} ${tradeLabel} Preview &rarr;</a>
    <div style="margin-top:8px;font-size:11.5px;color:#5c564c;word-break:break-all;">Direct URL: <a href="${previewUrl}" style="color:#8f3217;">${previewUrl}</a></div>
  </div>
  <p style="margin:18px 0 12px;font-size:14.5px;color:#171614;font-weight:600;">If you would like to grab the code or have my desk launch this for ${cleanBiz} (no sales call required, flat one-time pricing):</p>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:12px 0 20px;">
    <tr>
      <td style="padding:14px 16px;background:#171614;color:#f7f3ec;border-radius:8px;border:1px solid #16a34a;">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4ade80;margin-bottom:4px;">★ FLASH STARTER · INSTANT SELF-SERVE DOWNLOAD</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;margin-bottom:4px;">$7 Instant AI Search & Standalone HTML Pack <span style="font-weight:400;font-size:12px;color:#a8a29e;">(One-Time · $0/mo)</span></div>
        <p style="margin:0 0 12px;font-size:13px;color:#d6d3d1;line-height:1.5;">Immediate 1-click browser download after checkout containing your custom <strong>${p.city} LocalBusiness Schema.org JSON-LD graph</strong>, <code>llms.txt</code> AI search index, <strong>60-second quote calculator snippet</strong>, and the full standalone mobile-first HTML page for <strong>${cleanBiz}</strong>.</p>
        <a href="${impulse7Url}" style="display:inline-block;background:#15803d;color:#ffffff;font-weight:700;text-decoration:none;padding:9px 16px;border-radius:6px;font-size:13px;">Unlock & Download $7 AI + HTML Pack &rarr;</a>
      </td>
    </tr>
    <tr><td style="height:10px;"></td></tr>
    <tr>
      <td style="padding:14px 16px;background:#fafaf9;border:1px solid #d6d3d1;border-radius:8px;">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8f3217;margin-bottom:4px;">OPTION 1 · TURNKEY 48-HOUR DOMAIN DEPLOYMENT</div>
        <div style="font-size:15px;font-weight:700;color:#171614;margin-bottom:4px;">Done-For-You 1-Page Custom Launch — $149 <span style="font-weight:400;font-size:12px;color:#5c564c;">(One-Time · $0/mo)</span></div>
        <p style="margin:0 0 10px;font-size:13px;color:#44403c;line-height:1.5;">I customize the page with ${cleanBiz}'s logo, direct phone (${cleanPhone || 'your line'}), photos, and connect your domain within 48 hours. Zero monthly hosting or agency retainer.</p>
        <a href="${dfyStripeUrl}" style="display:inline-block;background:#8f3217;color:#ffffff;font-weight:700;text-decoration:none;padding:8px 15px;border-radius:6px;font-size:12.5px;">Order $149 Done-For-You Launch &rarr;</a>
      </td>
    </tr>
    <tr><td style="height:10px;"></td></tr>
    <tr>
      <td style="padding:14px 16px;background:#fafaf9;border:1px solid #d6d3d1;border-radius:8px;">
        <div style="font-size:10.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5c564c;margin-bottom:4px;">OPTION 2 & 3 · AI VOICE/SMS RECEPTIONIST OR 5-PAGE BUILD</div>
        <p style="margin:0 0 10px;font-size:13px;color:#44403c;line-height:1.5;">Need 24/7 missed-call SMS text-back + instant quote bot (<strong>$299 one-time</strong>) or a complete <strong>5-Page Custom Website + Google Maps & AI Search Authority Build ($499 one-time)</strong>?</p>
        <a href="${aiReceptionistUrl}" style="display:inline-block;background:#171614;color:#ffffff;font-weight:700;text-decoration:none;padding:8px 13px;border-radius:6px;font-size:12px;margin-right:6px;margin-bottom:4px;">24/7 AI Receptionist ($299)</a>
        <a href="${turnkey5PageUrl}" style="display:inline-block;background:#292524;color:#ffffff;font-weight:700;text-decoration:none;padding:8px 13px;border-radius:6px;font-size:12px;margin-right:6px;margin-bottom:4px;">5-Page Turnkey Site ($499)</a>
        <a href="${deposit99Url}" style="display:inline-block;background:#ffffff;border:1px solid #8f3217;color:#8f3217;font-weight:700;text-decoration:none;padding:7px 12px;border-radius:6px;font-size:12px;margin-bottom:4px;">Or Start w/ $99 Kickoff Deposit</a>
      </td>
    </tr>
  </table>
  <p style="font-size:12.5px;color:#5c564c;margin:0 0 16px;">Full engineering catalog & live browser tools: <a href="https://1nc0gn30.github.io/" style="color:#8f3217;font-weight:600;">1nc0gn30.github.io</a> (Stripe, Apple Pay, Cash App & Solana/USDC accepted).</p>
  <div style="margin-top:20px;font-size:12.5px;color:#5c564c;border-top:1px solid #e7e5e4;padding-top:12px;">
    <strong style="color:#171614;">1nc0gn30</strong> · Principal AI Systems Architect<br>
    1nc0gn30 • <a href="https://1nc0gn30.si" style="color:#8f3217;">1nc0gn30.si</a> • <a href="https://1nc0gn30.github.io" style="color:#8f3217;">1nc0gn30.github.io</a><br>
    Direct Line / Reply: <a href="mailto:contact@1nc0gn30.si" style="color:#8f3217;">contact@1nc0gn30.si</a> · (948) 204-7987
  </div>
</div>`;

  return { subject, text, html, previewUrl };
}

async function dispatchBatch(limitOrOpts = 15) {
  // Mass email outreach permanently disabled per sovereign directive (2026-10-21)
  return { attempted: 0, sentCount: 0, disabled: true, reason: 'Mass email outreach permanently disabled', results: [] };
}

async function _disabled_dispatchBatch(limitOrOpts = 15) {
  const limit = typeof limitOrOpts === 'object' && limitOrOpts !== null ? (limitOrOpts.limit || 15) : Number(limitOrOpts || 15);
  const { apiKey, fromEmail } = loadResendCredentials();
  if (!apiKey) throw new Error('Missing RESEND_API_KEY in .env.sovereign');

  let log = { sent: [] };
  if (fs.existsSync(DISPATCH_LOG_FILE)) {
    try { log = JSON.parse(fs.readFileSync(DISPATCH_LOG_FILE, 'utf8')); } catch (e) {}
  }
  const alreadySent = new Set((log.sent || []).map(x => String(x.email).toLowerCase()));

  const candidates = VERIFIED_PROSPECTS.filter(p => {
    const em = String(p.email).toLowerCase();
    return !DO_NOT_CONTACT.has(em) && !alreadySent.has(em);
  }).slice(0, limit);

  const cooldownPath = path.join(__dirname, "..", "data", "resend_cooldown.json");
  if (fs.existsSync(cooldownPath)) {
    try {
      const cd = JSON.parse(fs.readFileSync(cooldownPath, "utf8"));
      if (cd.cooldownUntil && cd.cooldownUntil > Date.now()) {
        return { attempted: 0, sentCount: 0, totalHistoricalSent: log.sent.length, skippedCooldown: true, cooldownUntil: new Date(cd.cooldownUntil).toISOString(), results: [] };
      }
    } catch (e) {}
  }

  const results = [];
  for (const p of candidates) {
    const { subject, text, html, previewUrl } = buildEmailForProspect(p);
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `1nc0gn30 <${fromEmail}>`,
          to: [p.email],
          reply_to: 'contact@1nc0gn30.si',
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
          businessName: p.businessName,
          email: p.email,
          city: p.city,
          state: p.state,
          trade: p.trade,
          currentUrl: p.currentUrl,
          previewUrl,
          hasSchema: p.hasSchema
        };
        log.sent.push(entry);
        results.push({ ok: true, ...entry });
      } else {
        const errMsg = data.message || JSON.stringify(data);
        results.push({ ok: false, email: p.email, error: errMsg });
        if (res.status === 429) {
          await new Promise(r => setTimeout(r, 2000));
        } else if (/monthly_quota/i.test(errMsg)) {
          fs.writeFileSync(cooldownPath, JSON.stringify({ cooldownUntil: Date.now() + 15 * 60 * 1000, reason: errMsg, updatedAt: new Date().toISOString() }, null, 2));
          break;
        }
      }
    } catch (err) {
      results.push({ ok: false, email: p.email, error: err.message });
    }
    // Polite spacing under 2 req/sec Resend limit (650ms)
    await new Promise(r => setTimeout(r, 650));
  }

  fs.mkdirSync(path.dirname(DISPATCH_LOG_FILE), { recursive: true });
  fs.writeFileSync(DISPATCH_LOG_FILE, JSON.stringify(log, null, 2));

  // Sync pitched status into local_revamp_pipeline.json so dashboard reflects real outreach
  if (fs.existsSync(PIPELINE_FILE)) {
    try {
      const pipe = JSON.parse(fs.readFileSync(PIPELINE_FILE, 'utf8'));
      for (const r of results.filter(x => x.ok)) {
        const match = (pipe.records || []).find(rec => rec.path === `/cities/${ VERIFIED_PROSPECTS.find(vp => vp.email === r.email)?.citySlug }/${r.trade}/`);
        if (match) {
          match.status = 'PITCHED';
          match.pitchedAt = r.sentAt;
          match.recipientEmail = r.email;
          match.resendId = r.resendId;
          match.auditedBusiness = r.businessName;
          match.auditedUrl = r.currentUrl;
        }
      }
      pipe.totalPitched = (pipe.records || []).filter(rec => rec.status === 'PITCHED' || rec.status === 'WON').length;
      fs.writeFileSync(PIPELINE_FILE, JSON.stringify(pipe, null, 2));
    } catch (e) {}
  }

  return {
    attempted: candidates.length,
    sentCount: results.filter(r => r.ok).length,
    totalHistoricalSent: log.sent.length,
    results
  };
}

function buildFollowUpEmailForProspect(p) {
  const selfServeStripeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const dfyStripeUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const deposit99Url = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
  const previewUrl = p.previewUrl || `https://city-desk-studio.netlify.app/cities/${p.citySlug || (String(p.city || 'local').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + String(p.state || 'us').toLowerCase())}/${p.trade || 'plumbers'}/?biz=${encodeURIComponent(p.businessName || '')}&phone=${encodeURIComponent(p.phone || '')}&email=${encodeURIComponent(p.email || '')}&city=${encodeURIComponent((p.city || '') + (p.state ? ', ' + p.state : ''))}`;
  const subject = `Re: ${p.businessName} — keeping your ${p.city} interactive quote preview live?`;

  const text = `Hi ${p.businessName} team,

Quick follow-up — I still have your custom ${p.city}${p.state ? ', ' + p.state : ''} interactive quote estimator & Schema.org AI search upgrade staged here:

Live Preview:
${previewUrl}

Before I rotate out unclaimed ${p.city} staging slots after 48 hours, let me know if you want to keep it:
1. $149 Done-For-You Launch (we wire it to your domain, phone & email within 24h): ${dfyStripeUrl}
2. $49 Self-Serve Source Code (instant ZIP + JSON-LD download): ${selfServeStripeUrl}
3. $99 Custom 5-Page Kickoff Deposit: ${deposit99Url}

Reply directly to this email if you want any adjustments to your pricing ranges or service areas first.

Best,
1nc0gn30
1nc0gn30 • https://1nc0gn30.si
Direct: contact@1nc0gn30.si · (948) 204-7987`;

  const html = `<div style="font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;color:#171614;line-height:1.65;background:#f6f3ec;border:1px solid #d8d0c2;border-radius:10px;padding:24px;">
  <div style="margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #171614;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#8f3217;">48-HOUR STAGING HOLD · ${(p.city || '').toUpperCase()}${p.state ? ', ' + p.state.toUpperCase() : ''}</span>
  </div>
  <p style="margin:0 0 12px;font-size:15px;">Hi <strong>${p.businessName}</strong> team,</p>
  <p style="margin:0 0 14px;font-size:14.5px;color:#292524;">Quick check-in — we still have the interactive 60-second quote estimator and Google/AI search Schema.org upgrade staged for <strong>${p.businessName}</strong>:</p>
  <div style="background:#ffffff;border:1px solid #d8d0c2;border-left:4px solid #8f3217;border-radius:8px;padding:16px;margin:16px 0;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8f3217;margin-bottom:6px;">LIVE PERSONALIZED DEMO</div>
    <p style="margin:0 0 12px;font-size:13.5px;color:#44403c;">Test the interactive ${p.city} quote slider and mobile tap-to-dispatch bar pre-filled for <strong>${p.businessName}</strong>:</p>
    <a href="${previewUrl}" style="display:inline-block;background:#8f3217;color:#ffffff;font-weight:700;text-decoration:none;padding:10px 18px;border-radius:6px;font-size:13.5px;">Open Live Preview for ${p.businessName} &rarr;</a>
  </div>
  <p style="margin:0 0 12px;font-size:14px;color:#292524;">If you'd like us to lock this in for your domain before we rotate out unclaimed ${p.city} previews, you can activate directly below:</p>
  <div style="background:#fff7ed;border:1.5px solid #8f3217;border-radius:8px;padding:14px 16px;margin-bottom:14px;">
    <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8f3217;margin-bottom:6px;">ONE-TIME ACTIVATION OPTIONS (ZERO MONTHLY RETAINER)</div>
    <div style="margin-top:8px;">
      <a href="${dfyStripeUrl}" style="display:inline-block;background:#8f3217;color:#ffffff;font-weight:700;text-decoration:none;padding:8px 14px;border-radius:6px;font-size:12.5px;margin-right:6px;margin-bottom:6px;">$149 Done-For-You 24h Launch &rarr;</a>
      <a href="${selfServeStripeUrl}" style="display:inline-block;background:#171614;color:#ffffff;font-weight:700;text-decoration:none;padding:8px 13px;border-radius:6px;font-size:12px;margin-right:6px;margin-bottom:6px;">$49 Source Code ZIP</a>
      <a href="${deposit99Url}" style="display:inline-block;background:#ffffff;border:1px solid #8f3217;color:#8f3217;font-weight:700;text-decoration:none;padding:7px 12px;border-radius:6px;font-size:12px;margin-bottom:6px;">$99 5-Page Build Deposit</a>
    </div>
  </div>
  <p style="font-size:13px;color:#5c564c;margin:0 0 14px;">Or simply reply to this email if you'd like me to adjust your ${p.city} service rates or phone routing first.</p>
  <div style="margin-top:16px;font-size:12px;color:#5c564c;border-top:1px solid #e7e5e4;padding-top:10px;">
    <strong style="color:#171614;">1nc0gn30</strong> · Principal AI Systems Architect · <a href="https://1nc0gn30.si" style="color:#8f3217;">1nc0gn30.si</a> · (948) 204-7987
  </div>
</div>`;

  return { subject, text, html, previewUrl };
}

async function dispatchFollowUpBatch(limit = 40, minAgeHours = 24) {
  // Mass email outreach permanently disabled per sovereign directive (2026-10-21)
  return { attempted: 0, sentCount: 0, disabled: true, reason: 'Mass email outreach permanently disabled', results: [] };
}

async function _disabled_dispatchFollowUpBatch(limit = 40, minAgeHours = 24) {
  const { apiKey, fromEmail } = loadResendCredentials();
  if (!apiKey) throw new Error('Missing RESEND_API_KEY in .env.sovereign');

  let log = { sent: [], followUpsSent: [] };
  if (fs.existsSync(DISPATCH_LOG_FILE)) {
    try {
      log = JSON.parse(fs.readFileSync(DISPATCH_LOG_FILE, 'utf8'));
      if (!Array.isArray(log.followUpsSent)) log.followUpsSent = [];
    } catch (e) {}
  }

  const alreadyFollowedUp = new Set((log.followUpsSent || []).map(x => String(x.email).toLowerCase()));
  const minAgeMs = minAgeHours * 3600 * 1000;
  const now = Date.now();

  const eligible = (log.sent || []).filter(item => {
    if (!item || !item.email || !item.sentAt) return false;
    const em = String(item.email).toLowerCase();
    if (DO_NOT_CONTACT.has(em) || alreadyFollowedUp.has(em)) return false;
    const age = now - new Date(item.sentAt).getTime();
    return age >= minAgeMs;
  }).slice(0, limit);

  const results = [];
  for (const item of eligible) {
    const { subject, text, html, previewUrl } = buildFollowUpEmailForProspect(item);
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `1nc0gn30 <${fromEmail}>`,
          to: [item.email],
          reply_to: 'contact@1nc0gn30.si',
          subject,
          text,
          html
        })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        const entry = {
          resendId: data.id,
          followUpSentAt: new Date().toISOString(),
          originalSentAt: item.sentAt,
          businessName: item.businessName,
          email: item.email,
          city: item.city,
          state: item.state,
          trade: item.trade,
          previewUrl
        };
        log.followUpsSent.push(entry);
        results.push({ ok: true, ...entry });
      } else {
        results.push({ ok: false, email: item.email, error: data.message || JSON.stringify(data) });
      }
    } catch (err) {
      results.push({ ok: false, email: item.email, error: err.message });
    }
    await new Promise(r => setTimeout(r, 650));
  }

  fs.writeFileSync(DISPATCH_LOG_FILE, JSON.stringify(log, null, 2));
  return {
    attempted: eligible.length,
    sentCount: results.filter(r => r.ok).length,
    totalFollowUpsSent: log.followUpsSent.length,
    results
  };
}

module.exports = {
  VERIFIED_PROSPECTS,
  PROSPECTS_FILE,
  loadLocalProspects,
  saveLocalProspects,
  dispatchBatch,
  dispatchFollowUpBatch,
  buildEmailForProspect,
  buildFollowUpEmailForProspect
};
