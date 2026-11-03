/**
 * B2B SEO / Web Agency & Technical Consultant Outreach Engine
 * Pitches the $0 All-Access Sovereign Pro Bundle (44 Developer, AEO, Core Web Vitals,
 * Robots.txt & Schema.org Tools) and $0 standalone tools to digital agencies.
 */

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env.sovereign');
const DISPATCH_LOG_FILE = path.join(__dirname, '..', 'data', 'outreach_dispatches.json');

const AGENCY_PROSPECTS = [
  {
    agencyName: 'The Omni Shot',
    city: 'Austin, TX',
    url: 'https://theomnishot.com',
    email: 'aleks@theomnishot.com',
    finding: 'I saw The Omni Shot focuses on full-stack SEO, local map packs, and AI visibility optimization (GEO) for Central Texas businesses.'
  },
  {
    agencyName: 'Blackhawk Digital Marketing',
    city: 'Austin, TX',
    url: 'https://blackhawkdm.com',
    email: 'hello@blackhawkdm.com',
    finding: 'I saw Blackhawk Digital Marketing specializes in local & technical SEO for service-based companies and clinics in Austin.'
  },
  {
    agencyName: 'Digitech Web Design Austin',
    city: 'Austin, TX',
    url: 'https://digitechwebdesignaustin.com',
    email: 'info@digitechaustin.com',
    finding: 'While checking digitechwebdesignaustin.com today, I noticed a template placeholder email ("youremail@website.com") still visible in your site source alongside info@digitechaustin.com, and saw your focus on AI Digital Marketing & SEO.'
  },
  {
    agencyName: 'Hooten Design + Technology',
    city: 'Denver, CO',
    url: 'https://hootendesign.com',
    email: 'scott@hooten.agency',
    finding: 'I saw Hooten Design + Technology focuses on senior-led technical SEO, custom web engineering, and generative AI search readiness in Denver.'
  },
  {
    agencyName: 'Peakxel Studio',
    city: 'Fort Collins / Denver, CO',
    url: 'https://peakxelstudio.com',
    email: 'infopeakxel@gmail.com',
    finding: 'While checking peakxelstudio.com today, I noticed a placeholder email ("name@company.com") in the page source and saw your focus on high-performance Next.js development and technical SEO.'
  },
  {
    agencyName: 'Perry SEO',
    city: 'Raleigh, NC',
    url: 'https://perryseo.com',
    email: 'grafton@perryseo.com',
    finding: 'While checking perryseo.com today, I noticed a placeholder email ("you@company.com") in the page source and saw your focus on technical SEO audits and structured data implementation in Raleigh.'
  },
  {
    agencyName: 'Bryant Digital',
    city: 'Virginia Beach, VA',
    url: 'https://bryantdigital.com',
    email: 'hello@bryantdigital.com',
    finding: 'I saw Bryant Digital builds performance-driven websites and digital strategy right here in Virginia Beach.'
  },
  {
    agencyName: 'VISIONEFX',
    city: 'Virginia Beach, VA',
    url: 'https://visionefx.net',
    email: 'rick@visionefx.net',
    finding: 'I saw VISIONEFX builds custom websites, e-commerce solutions, and regional SEO campaigns across Virginia Beach and Hampton Roads.'
  },
  {
    agencyName: 'Loud Canvas Media',
    city: 'Richmond, VA',
    url: 'https://loudcanvas.com',
    email: 'samuel@loudcanvas.com',
    finding: 'I saw Loud Canvas Media specializes in custom website architecture, responsive design, and long-term technical SEO management.'
  },
  {
    agencyName: 'Synchronicity Web Design',
    city: 'Charlotte, NC',
    url: 'https://synchronicitydesigns.com',
    email: 'contact@synchronicitydesigns.com',
    finding: 'I saw Synchronicity Web Design engineers custom growth-oriented websites and technical SEO systems in Charlotte.'
  },
  {
    agencyName: 'S+S Marketing',
    city: 'Nashville, TN',
    url: 'https://sandsmktg.com',
    email: 'shea@sandsmktg.com',
    finding: 'I saw S+S Marketing builds custom WordPress and Shopify sites paired with local growth strategies in Nashville.'
  },
  {
    agencyName: '323 Design Group',
    city: 'Nashville, TN',
    url: 'https://323design.com',
    email: 'sales@323design.com',
    finding: 'I saw 323 Design Group specializes in in-house web development, branding, and organic SEO & AI search marketing in Nashville.'
  },
  {
    agencyName: 'Nora Kramer Designs',
    city: 'Tampa, FL',
    url: 'https://norakramerdesigns.com',
    email: 'nora@norakramerdesigns.com',
    finding: 'I saw Nora Kramer Designs provides boutique web design paired with strategic local SEO consulting in the Tampa Bay area.'
  },
  {
    agencyName: 'Holy City Web Design',
    city: 'Charleston, SC',
    url: 'https://holycityweb.com',
    email: 'hello@holycityweb.com',
    finding: 'I saw Holy City Web Design builds fast, findable local websites for Charleston businesses.'
  },
  {
    agencyName: 'Whitefox Design Studio',
    city: 'Charleston, SC',
    url: 'https://whitefox-design.com',
    email: 'jessica@whitefoxdesignstudio.com',
    finding: 'I saw Whitefox Design Studio creates custom website designs and brand identities in Mount Pleasant and Charleston.'
  },
  {
    agencyName: 'Ciphers Digital Marketing',
    city: 'Phoenix / Gilbert, AZ',
    url: 'https://ciphersdigital.com',
    email: 'mike@ciphersdigital.com',
    finding: 'I saw Ciphers Digital Marketing focuses on SEO-first web design, local SEO, and AI search optimization (ChatGPT / Google AI Overviews) in Phoenix.'
  },
  {
    agencyName: 'Logic Inbound',
    city: 'Seattle, WA',
    url: 'https://www.logicinbound.com',
    email: 'sales@logicinbound.com',
    finding: 'I saw Logic Inbound specializes in technical SEO, conversion optimization, and web design in Seattle.'
  },
  {
    agencyName: 'Seattle Organic SEO',
    city: 'Seattle, WA',
    url: 'https://seattleorganicseo.com',
    email: 'hello@seattleorganicseo.com',
    finding: 'I saw Seattle Organic SEO focuses on organic search positioning and local business lead generation in Seattle.'
  },
  {
    agencyName: 'Bizango Web Design',
    city: 'Seattle, WA',
    url: 'https://www.bizango.com',
    email: 'hello@bizango.com',
    finding: 'I saw Bizango builds custom websites and digital marketing campaigns for Seattle businesses.'
  },
  {
    agencyName: 'Brilliance Northwest',
    city: 'Portland, OR',
    url: 'https://www.brilliancenw.com',
    email: 'info@brilliancenw.com',
    finding: 'I saw Brilliance Northwest provides full-service custom web development and technical local SEO in Portland.'
  },
  {
    agencyName: 'Diviner Agency',
    city: 'Portland, OR',
    url: 'https://diviner.agency',
    email: 'chris@diviner.agency',
    finding: 'I saw Diviner Agency focuses on technical SEO and Generative Engine Optimization (GEO / AEO) in Portland.'
  },
  {
    agencyName: 'Trajectory Web Design',
    city: 'Atlanta, GA',
    url: 'https://trajectorywebdesign.com',
    email: 'hello@trajectorywebdesign.com',
    finding: 'I saw Trajectory Web Design delivers strategy-first web design, custom development, and SEO in Atlanta.'
  },
  {
    agencyName: 'M16 Marketing',
    city: 'Atlanta, GA',
    url: 'https://m16marketing.com',
    email: 'support@m16marketing.com',
    finding: 'I saw M16 Marketing provides web design, development, and strategic SEO services in Atlanta.'
  },
  {
    agencyName: 'JSL Marketing & Web Design',
    city: 'Dallas, TX',
    url: 'https://jsl.marketing',
    email: 'info@jsl.marketing',
    finding: 'I saw JSL Marketing & Web Design builds custom SEO-friendly websites and branding in Dallas.'
  },
  {
    agencyName: 'Bless Web Designs',
    city: 'Dallas, TX',
    url: 'https://blesswebdesigns.com',
    email: 'sales@blesswebdesigns.com',
    finding: 'I saw Bless Web Designs focuses on AI-friendly web design, custom development, and local SEO in Dallas.'
  },
  {
    agencyName: 'The Lyon Brand',
    city: 'Salt Lake City, UT',
    url: 'https://www.thelyonbrand.com',
    email: 'cole@thelyonbrand.com',
    finding: 'I saw The Lyon Brand specializes in conversion-first web design and local home-service SEO in Salt Lake City.'
  },
  {
    agencyName: 'Searchbloom',
    city: 'Salt Lake City, UT',
    url: 'https://www.searchbloom.com',
    email: 'hello@searchbloom.com',
    finding: 'I saw Searchbloom provides technical search engine optimization and local SEO engineering in the Salt Lake City metro.'
  },
  {
    agencyName: 'Ignite Visibility',
    city: 'San Diego, CA',
    url: 'https://ignitevisibility.com',
    email: 'opportunity@ignitevisibility.com',
    finding: 'I saw Ignite Visibility leads multi-location SEO, digital strategy, and conversion optimization out of San Diego.'
  },
  {
    agencyName: 'eSEOspace',
    city: 'San Diego, CA',
    url: 'https://eseospace.com',
    email: 'hello@eseospace.com',
    finding: 'I saw eSEOspace delivers custom web design, development, and technical SEO across San Diego and Denver.'
  },
  {
    agencyName: '3 Media Web',
    city: 'Boston, MA',
    url: 'https://www.3mediaweb.com',
    email: 'marlboro@3mediaweb.com',
    finding: 'I saw 3 Media Web builds B2B digital experiences, custom websites, and technical SEO strategies in the Boston metro.'
  },
  {
    agencyName: 'Web Tonic',
    city: 'Miami, FL',
    url: 'https://webtonic.io',
    email: 'miami@webtonic.io',
    finding: 'I saw Web Tonic specializes in SEO, digital growth, and custom web design in Miami and San Diego.'
  },
  {
    agencyName: 'Alliance Interactive',
    city: 'Washington, DC / Miami, FL',
    url: 'https://www.allianceinteractive.com',
    email: 'info@allianceinteractive.com',
    finding: 'I saw Alliance Interactive delivers custom B2B web design, technical development, and search engine optimization.'
  },
  {
    agencyName: 'Real Digital Marketing',
    city: 'Nashville, TN',
    url: 'https://realdigitalmarketing.co',
    email: 'info@realdigitalmarketing.co',
    finding: 'I saw Real Digital Marketing builds custom websites and local SEO campaigns for businesses in Nashville.'
  },
  {
    agencyName: 'Four Eyes',
    city: 'Charlotte, NC',
    url: 'https://www.foureyes.com',
    email: 'hello@foureyes.com',
    finding: 'I saw Four Eyes provides custom web design, development, and technical digital strategy in Charlotte.'
  },
  {
    agencyName: 'CC Communications',
    city: 'Charlotte, NC',
    url: 'https://www.cccommunications.com',
    email: 'sales@cccom.com',
    finding: 'I saw CC Communications builds custom websites and digital marketing solutions in Charlotte.'
  },
  {
    agencyName: 'NEWMEDIA.COM',
    city: 'Denver, CO / Charlotte, NC',
    url: 'https://newmedia.com',
    email: 'info@newmedia.com',
    finding: 'I saw NEWMEDIA.COM delivers full-service web design, performance engineering, and technical SEO.'
  },
  {
    agencyName: 'Smart 1 Marketing',
    city: 'Columbus, OH',
    url: 'https://smart1marketing.com',
    email: 'info@smart1marketing.com',
    finding: 'I saw Smart 1 Marketing provides digital strategy, SEO, and custom web builds in Columbus.'
  },
  {
    agencyName: 'ForeFront Web',
    city: 'Columbus, OH',
    url: 'https://www.forefrontweb.com',
    email: 'info@forefrontweb.com',
    finding: 'I saw ForeFront Web specializes in custom web design and technical SEO engineering in the Columbus metro.'
  },
  {
    agencyName: 'The Media Captain',
    city: 'Columbus, OH',
    url: 'https://www.themediacaptain.com',
    email: 'info@themediacaptain.com',
    finding: 'I saw The Media Captain builds eCommerce & local websites alongside in-house SEO campaigns in Columbus.'
  },
  {
    agencyName: 'Digitaleer',
    city: 'Phoenix, AZ',
    url: 'https://www.digitaleer.com',
    email: 'info@digitaleer.com',
    finding: 'I saw Digitaleer specializes in technical SEO, Schema architecture, and search marketing in Phoenix.'
  },
  {
    agencyName: 'Got Leads, LLC',
    city: 'Tampa, FL',
    url: 'https://www.digitalmarketingagencyintampa.com',
    email: 'dina@gotleadstampa.com',
    finding: 'I saw Got Leads delivers local SEO and lead-generation web design for businesses in the Tampa metro.'
  },
  {
    agencyName: 'Inflow',
    city: 'Tampa, FL / Denver, CO',
    url: 'https://www.goinflow.com',
    email: 'info@goinflow.com',
    finding: 'I saw Inflow provides technical SEO audits, conversion rate optimization, and digital growth engineering.'
  },
  {
    agencyName: 'Optimize Locale',
    city: 'Phoenix, AZ',
    url: 'https://optimizelocale.com',
    email: 'hello@optimizelocale.com',
    finding: 'I saw Optimize Locale focuses on local SEO, technical site optimization, and digital growth in Phoenix.'
  },
  {
    agencyName: 'Phoenix Peak SEO',
    city: 'Phoenix, AZ',
    url: 'https://phoenixpeakseo.com',
    email: 'clay@phoenixpeakseo.com',
    finding: 'I saw Phoenix Peak SEO builds local search visibility and high-converting service pages in the Phoenix metro.'
  },
  {
    agencyName: 'Think Designs, LLC',
    city: 'Raleigh, NC',
    url: 'https://www.thinkdesignsllc.com',
    email: 'info@thinkdesignsllc.com',
    finding: 'I saw Think Designs delivers custom web design, development, and SEO marketing in Raleigh.'
  },
  {
    agencyName: 'NC Digital Web Design',
    city: 'Raleigh, NC',
    url: 'https://ncdigitalwebdesign.com',
    email: 'info@ncdigitalwebdesign.com',
    finding: 'I saw NC Digital Web Design builds fast, SEO-ready websites for businesses across Raleigh and North Carolina.'
  },
  {
    agencyName: 'Doug Brown Design',
    city: 'Raleigh, NC',
    url: 'https://www.dougbrowndesign.com',
    email: 'dbrown@dougbrowndesign.com',
    finding: 'I saw Doug Brown Design provides custom web design and digital branding in Raleigh.'
  },
  {
    agencyName: 'Pure Design Group',
    city: 'Seattle, WA',
    url: 'https://www.puredesigngroup.com',
    email: 'info@puredesigngroup.com',
    finding: 'I saw Pure Design Group delivers custom web design, development, and local SEO in Seattle.'
  },
  {
    agencyName: 'GGD Creative',
    city: 'Seattle, WA',
    url: 'https://ggdcreative.com',
    email: 'heather@ggdcreative.com',
    finding: 'I saw GGD Creative builds custom websites and brand systems for businesses in the Seattle metro.'
  },
  {
    agencyName: 'Ecomm Boom',
    city: 'Minneapolis, MN',
    url: 'https://ecommboom.com',
    email: 'alicia@ecommboom.com',
    finding: 'I saw Ecomm Boom drives eCommerce and digital marketing growth for brands in Minneapolis.'
  },
  {
    agencyName: 'Perrill',
    city: 'Minneapolis, MN',
    url: 'https://www.perrill.com',
    email: 'sales@perrill.com',
    finding: 'I saw Perrill is a full-service digital marketing, web development, and technical SEO agency in Minneapolis.'
  },
  {
    agencyName: 'Thoughtprocess Interactive',
    city: 'St. Louis, MO',
    url: 'https://www.thoughtprocessinteractive.com',
    email: 'info@thinktpi.com',
    finding: 'I saw Thoughtprocess Interactive builds custom web experiences and digital marketing strategies in the St. Louis metro.'
  },
  {
    agencyName: '96 Creative Labs',
    city: 'St. Louis, MO',
    url: 'https://96creativelabs.com',
    email: 'hello@96creativelabs.com',
    finding: 'I saw 96 Creative Labs provides custom web design, branding, and digital growth in St. Louis.'
  },
  {"businessName":"HireAWiz Web Design & SEO Agency","email":"info@hireawiz.com","city":"Orlando, FL","currentUrl":"https://hireawiz.com","auditNotes":"Offers local SEO & web design in Orlando — prime agency partner for the $0 All-Access Sovereign Pro Bundle (44 browser-native AEO, Schema, and CWV audit tools)."},
  {"businessName":"57 Clicks Marketing Agency","email":"contact@57clicks.com","city":"Orlando, FL","currentUrl":"https://57clicks.com","auditNotes":"Florida SEO & web design agency — can white-label the $0 AEO Knowledge Graph Engine and $0 CWV Speed Studio across unlimited client audits."},
  {"businessName":"Dooley Design Group","email":"connect@dooleydesigngroup.com","city":"San Antonio, TX","currentUrl":"https://dooleydesigngroup.com","auditNotes":"San Antonio web design & digital agency — ideal fit for the $0 All-Access Sovereign Pro Bundle (zero recurring SaaS fees)."},
  {"businessName":"HeliumStudio","email":"contact@heliumstudio.com","city":"Richmond, VA","currentUrl":"https://heliumstudio.com","auditNotes":"Richmond web design agency — prime agency partner for the $0 All-Access Sovereign Pro Bundle (44 browser-native AEO, Schema, and CWV audit tools)."}
];

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
  dispatchAgencyBatch
};
