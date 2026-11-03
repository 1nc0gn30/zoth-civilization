/**
 * City Desk handoff queue.
 * Pages come from the catalog on disk: one trade, one city, one set price.
 * The clock does not invent a shop, a domain, or a review.
 * Paid dollars are the pages the operator marks paid.
 * Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'local_revamp_pipeline.json');
const CITIES_FILE = path.join(__dirname, '..', '..', 'city-desk', 'data.js');
const OFFERS_FILE = path.join(__dirname, '..', '..', 'city-desk', 'site', 'offers.json');
const { generateSpecHtml: renderAvantGardeSpec } = require('./spec_generator');

function looksInvented(record) {
  if (!record || record.kind === 'offer') return false;
  const url = String(record.currentSiteUrl || '');
  const name = String(record.businessName || '');
  if (/^https:\/\/www\.(apex|crown|heritage|prime|vanguard|precision|blue-ribbon|sovereign|pinnacle|summit)-/i.test(url)) return true;
  return /^(Apex|Crown|Heritage|Prime|Vanguard|Precision|Blue Ribbon|Sovereign|Pinnacle|Summit) /.test(name) && / of /.test(name);
}

function tradeLabel(service) {
  return String(service || 'trade').replace(/-/g, ' ');
}

function offerNote(row) {
  const trade = tradeLabel(row.service);
  const where = `${row.city}, ${row.state}`;
  const liveUrl = `https://city-desk.netlify.app${row.path}`;
  return {
    subject: `Finished ${trade} website page for ${where} (live preview ready)`,
    bodyText: [
      `I write one finished website page for one trade in one city, with zero monthly retainers and zero platform fees.`,
      `This page is built for a ${trade} owner in ${where}. You can inspect the live working page here:\n${liveUrl}`,
      `The page does not invent fake reviews or use your business name until you claim it. It includes a clean mobile-first layout, separate emergency vs. scheduled call paths, and Google LocalBusiness Schema.org structured data.`,
      `Three ways to claim it today:\n• Done-For-You Launch + Domain Connection ($149 one-time): https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X\n• Self-Serve Standalone HTML Bundle ($0 one-time): https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X\n• Full Custom Multi-Page Trade Build ($${row.price}): Reply directly to this email (contact@nullai.tech).`,
      `— 1nc0gn30 | 1nc0gn30 • NullAI (nullai.tech • nullai.tech)`
    ].join('\n\n')
  };
}

// 50 High-Converting US Mid-Size Cities with thriving local trade economies
const TARGET_CITIES = [
  { city: 'Norfolk', state: 'VA', metro: 'Hampton Roads' },
  { city: 'Virginia Beach', state: 'VA', metro: 'Coastal Virginia' },
  { city: 'Richmond', state: 'VA', metro: 'Central Virginia' },
  { city: 'Raleigh', state: 'NC', metro: 'Research Triangle' },
  { city: 'Charlotte', state: 'NC', metro: 'Piedmont' },
  { city: 'Charleston', state: 'SC', metro: 'Lowcountry' },
  { city: 'Savannah', state: 'GA', metro: 'Coastal Georgia' },
  { city: 'Tampa', state: 'FL', metro: 'Tampa Bay' },
  { city: 'Orlando', state: 'FL', metro: 'Central Florida' },
  { city: 'Jacksonville', state: 'FL', metro: 'First Coast' },
  { city: 'Nashville', state: 'TN', metro: 'Middle Tennessee' },
  { city: 'Knoxville', state: 'TN', metro: 'East Tennessee' },
  { city: 'Chattanooga', state: 'TN', metro: 'Scenic City' },
  { city: 'Louisville', state: 'KY', metro: 'Bluegrass' },
  { city: 'Lexington', state: 'KY', metro: 'Horse Country' },
  { city: 'Columbus', state: 'OH', metro: 'Central Ohio' },
  { city: 'Cincinnati', state: 'OH', metro: 'Queen City' },
  { city: 'Cleveland', state: 'OH', metro: 'Lake Erie' },
  { city: 'Indianapolis', state: 'IN', metro: 'Circle City' },
  { city: 'Grand Rapids', state: 'MI', metro: 'West Michigan' },
  { city: 'Milwaukee', state: 'WI', metro: 'Lake Michigan' },
  { city: 'Madison', state: 'WI', metro: 'Capital City' },
  { city: 'Minneapolis', state: 'MN', metro: 'Twin Cities' },
  { city: 'Des Moines', state: 'IA', metro: 'Hawkeye Metro' },
  { city: 'Omaha', state: 'NE', metro: 'Gateway' },
  { city: 'Kansas City', state: 'MO', metro: 'Heart of America' },
  { city: 'St. Louis', state: 'MO', metro: 'Gateway Arch' },
  { city: 'Little Rock', state: 'AR', metro: 'Central Arkansas' },
  { city: 'Tulsa', state: 'OK', metro: 'Green Country' },
  { city: 'Oklahoma City', state: 'OK', metro: 'OKC Metro' },
  { city: 'Fort Worth', state: 'TX', metro: 'Metroplex' },
  { city: 'Austin', state: 'TX', metro: 'Hill Country' },
  { city: 'San Antonio', state: 'TX', metro: 'Alamo City' },
  { city: 'El Paso', state: 'TX', metro: 'Sun City' },
  { city: 'Albuquerque', state: 'NM', metro: 'Duke City' },
  { city: 'Tucson', state: 'AZ', metro: 'Sonoran' },
  { city: 'Mesa', state: 'AZ', metro: 'East Valley' },
  { city: 'Scottsdale', state: 'AZ', metro: 'Valley of the Sun' },
  { city: 'Colorado Springs', state: 'CO', metro: 'Pikes Peak' },
  { city: 'Fort Collins', state: 'CO', metro: 'Northern Colorado' },
  { city: 'Boise', state: 'ID', metro: 'Treasure Valley' },
  { city: 'Salt Lake City', state: 'UT', metro: 'Wasatch Front' },
  { city: 'Reno', state: 'NV', metro: 'Biggest Little City' },
  { city: 'Spokane', state: 'WA', metro: 'Inland Northwest' },
  { city: 'Tacoma', state: 'WA', metro: 'South Sound' },
  { city: 'Eugene', state: 'OR', metro: 'Emerald Valley' },
  { city: 'Salem', state: 'OR', metro: 'Willamette Valley' },
  { city: 'Sacramento', state: 'CA', metro: 'River City' },
  { city: 'Fresno', state: 'CA', metro: 'Central Valley' },
  { city: 'Bakersfield', state: 'CA', metro: 'Kern County' }
];

// Target Business Niches with high commercial margin & urgent online upgrade need
const TRADE_NICHES = [
  {
    niche: 'Valet & Luxury Transport',
    category: 'AutoRental',
    schemaType: 'AutomotiveBusiness',
    painPoints: ['Clunky text-only bookings', 'No live fleet showcase', 'Zero mobile responsiveness', 'No VIP client proof'],
    revampHook: 'Seamless online event quote intake, fleet showcase, and instant VIP booking portal.',
    videoVibe: 'Cinematic night-city headlights, high-contrast gold & obsidian, sleek vehicle gliding to venue curbside.'
  },
  {
    niche: 'Roofing & Storm Restoration',
    category: 'HomeAndConstructionBusiness',
    schemaType: 'RoofingContractor',
    painPoints: ['Generic stock photos', 'No instant storm damage estimate intake', 'Missing local service area schema', 'Slow load time'],
    revampHook: 'Rapid storm-damage photo uploader, warranty badges, and verified neighborhood project map.',
    videoVibe: 'Drone aerial descent over crisp architectural shingles, sun-bursting rain clouds, bold guarantee badge.'
  },
  {
    niche: 'Mobile Auto Detailing & Ceramic Coating',
    category: 'AutomotiveBusiness',
    schemaType: 'AutoRepair',
    painPoints: ['Asking customers to come to a shop instead of mobile', 'Complex pricing walls', 'Unlabeled blurry photos', 'No calendar sync'],
    revampHook: 'Driveway-direct package selector, gloss-meter comparison slider, and 60-second mobile booking.',
    videoVibe: 'Hydrophobic water beading off mirror-finish black paint, high-speed foam cannon spray, neon rim reflection.'
  },
  {
    niche: 'HVAC Heating & Cooling',
    category: 'HomeAndConstructionBusiness',
    schemaType: 'HVACBusiness',
    painPoints: ['Cluttered service list', 'Missing emergency 24/7 call path', 'Unclear seasonal tune-up pricing', 'No technician badge'],
    revampHook: 'Dual Emergency vs. Seasonal Tune-up dispatch router, transparent visit pricing, and licensed tech badges.',
    videoVibe: 'Frost transitioning to glowing heat coils, digital smart thermostat click, fresh airflow particle sweep.'
  },
  {
    niche: 'Custom Landscaping & Hardscapes',
    category: 'HomeAndConstructionBusiness',
    schemaType: 'LandscapeCompany',
    painPoints: ['Unorganized Facebook photos', 'No seasonal maintenance packages', 'Vague service boundaries', 'No walkthrough scheduler'],
    revampHook: 'Before-and-after patio transformation slider, seasonal cleanup package calculator, and 3D stone design preview.',
    videoVibe: 'Sunset lighting over illuminated flagstone fire pit, lush emerald lawn sweep, water feature ripples.'
  },
  {
    niche: 'Residential & Commercial Painting',
    category: 'HomeAndConstructionBusiness',
    schemaType: 'HousePainter',
    painPoints: ['Bids sent in fragmented text threads', 'No room-by-room price guide', 'Outdated logo', 'No color palette visualizer'],
    revampHook: 'Interior/Exterior walkthrough estimator, color palette showcase, and 3-year peeling warranty seal.',
    videoVibe: 'Ultra-crisp razor-sharp paint lines, smooth roller glide on architectural wall, vivid modern room reveal.'
  },
  {
    niche: 'Pest & Wildlife Control',
    category: 'HomeAndConstructionBusiness',
    schemaType: 'PestControlService',
    painPoints: ['Scary text walls without clear treatment plans', 'No eco-friendly/pet-safe badges', 'Missing city coverage map'],
    revampHook: 'Pet-safe extermination guarantee, transparent 3-step eradication protocol, and recurring seasonal guard plan.',
    videoVibe: 'High-tech radar sweep over home perimeter, green eco-shield barrier locking in, calm pest-free living space.'
  },
  {
    niche: 'Junk Removal & Hauling',
    category: 'HomeAndConstructionBusiness',
    schemaType: 'GarbageDump',
    painPoints: ['Unclear truck load pricing', 'No photo-quote uploader', 'Clients fear hidden dump fees'],
    revampHook: 'Transparent quarter/half/full truck pricing guide, instant pile photo estimator, and same-day hauling clock.',
    videoVibe: 'Fast-forward cleanout of cluttered garage into empty spotless floor, truck tailgate slamming shut with authority.'
  }
];

class LocalRevampMission {
  constructor(civEngine) {
    this.engine = civEngine;
    this.catalog = this.readCatalog();
    this.pipeline = this.loadPipeline();
    this.urgencyLevel = 'GROWTH';
    this.settle();
  }

  readCatalog() {
    try {
      const rows = JSON.parse(fs.readFileSync(OFFERS_FILE, 'utf8'));
      return Array.isArray(rows) ? rows.filter((row) => row && row.path && row.city && row.price) : [];
    } catch (err) {
      return [];
    }
  }

  loadPipeline() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      }
    } catch (e) {
      console.warn('[LocalRevamp] Failed to load pipeline, initializing clean:', e.message);
    }
    return {
      version: 1,
      totalScouted: 0,
      totalRevamped: 0,
      totalPitched: 0,
      totalValuePipeline: 0,
      records: []
    };
  }

  _loadResendConfig() {
    let apiKey = process.env.RESEND_API_KEY;
    let fromEmail = process.env.RESEND_FROM_EMAIL;
    const envPath = path.join(__dirname, '..', '.env.sovereign');
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        const mKey = content.match(/RESEND_API_KEY=([^\r\n]+)/);
        if (mKey) {
          apiKey = mKey[1].trim();
          process.env.RESEND_API_KEY = apiKey;
        }
        const mFrom = content.match(/RESEND_FROM_EMAIL=([^\r\n]+)/);
        if (mFrom) {
          fromEmail = mFrom[1].trim();
          process.env.RESEND_FROM_EMAIL = fromEmail;
        }
      } catch (e) {}
    }
    return {
      apiKey: apiKey ? apiKey.trim() : null,
      fromEmail: fromEmail ? fromEmail.trim() : 'outreach@nullai.tech'
    };
  }

  async sendOutreachEmail(recordId, targetEmail = null, senderEmail = null) {
    throw new Error('Mass email outreach is permanently disabled per sovereign directive.');
  }

  async _disabled_sendOutreachEmail(recordId, targetEmail = null, senderEmail = null) {
    const record = this.pipeline.records.find(r => r.id === recordId);
    if (!record) throw new Error(`Record ${recordId} not found`);

    const config = this._loadResendConfig();
    if (!config.apiKey) throw new Error('RESEND_API_KEY not configured in environment or .env.sovereign');

    if (looksInvented(record) || record.kind !== 'offer') {
      throw new Error('That card is not an offer you can send.');
    }
    const to = String(targetEmail || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      throw new Error('Type the owner email. Nothing goes to a guessed address.');
    }

    const from = senderEmail || config.fromEmail || 'outreach@nullai.tech';
    const emailData = record.outreachEmail || {};

    const payload = JSON.stringify({
      from: `1nc0gn30 <${from}>`,
      to: [to],
      reply_to: from,
      subject: emailData.subject || `Modern spec redesign for ${record.businessName}`,
      text: emailData.bodyText,
      html: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px;">
        ${(emailData.bodyText || '').split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
      </div>`
    });

    return new Promise((resolve, reject) => {
      const https = require('https');
      const req = https.request({
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let resBody = '';
        res.on('data', chunk => { resBody += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(resBody);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              record.status = 'PITCHED';
              record.pitchedAt = new Date().toISOString();
              record.recipientEmail = to;
              record.resendId = parsed.id;
              this.pipeline.totalPitched = (this.pipeline.totalPitched || 0) + 1;
              this.savePipeline();
              if (this.engine && typeof this.engine.addMessage === 'function') {
                this.engine.addMessage(
                  'OUTREACH',
                  `Sent the ${record.city} page offer to ${to}.`,
                  'announcement'
                );
              }
              resolve({ success: true, resendId: parsed.id, record });
            } else {
              reject(new Error(parsed.message || `Resend HTTP ${res.statusCode}: ${resBody}`));
            }
          } catch (e) {
            reject(new Error(`Failed to parse Resend response: ${e.message}`));
          }
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }

  savePipeline() {
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.pipeline, null, 2));
    } catch (e) {
      console.error('[LocalRevamp] Error saving pipeline:', e.message);
    }
  }

  setUrgencyLevel(level) {
    if (['FLASH', 'GROWTH', 'SOVEREIGN'].includes(level)) {
      this.urgencyLevel = level;
      return true;
    }
    return false;
  }

  getPriceForTier(complexity = 'standard') {
    if (this.urgencyLevel === 'FLASH') {
      return { price: 100, label: 'Flash Close $100', tier: 'Tier 1 — Essential Revamp' };
    }
    if (this.urgencyLevel === 'SOVEREIGN' || complexity === 'enterprise') {
      return { price: 1000, label: 'Sovereign Suite $1,000', tier: 'Tier 3 — Total Brand Takeover' };
    }
    // Growth standard
    return complexity === 'high' 
      ? { price: 500, label: 'Growth Rebrand $500', tier: 'Tier 2 — Advanced Rebrand & Video' }
      : { price: 300, label: 'Studio Rebrand $300', tier: 'Tier 2 — Studio Rebrand & Video' };
  }

  recount() {
    const records = this.pipeline.records || [];
    const paid = records.filter((row) => row.status === 'WON');
    this.pipeline.catalogSize = this.catalog.length;
    this.pipeline.totalScouted = records.length;
    this.pipeline.totalPitched = records.filter((row) => row.status === 'PITCHED' || row.status === 'WON').length;
    this.pipeline.totalValuePipeline = paid.reduce((sum, row) => sum + (row.pricing ? Number(row.pricing.price) || 0 : 0), 0);
  }

  settle() {
    const records = Array.isArray(this.pipeline.records) ? this.pipeline.records : [];
    const fiction = records.filter(looksInvented);
    const kept = records.filter((row) => !looksInvented(row) && row.kind === 'offer').map((row) => {
      const catRow = this.catalog.find((c) => c.path === row.path) || {
        service: row.niche,
        city: row.city,
        state: row.state,
        path: row.path,
        price: (row.pricing && row.pricing.price) || 900
      };
      row.liveUrl = `https://city-desk.netlify.app${row.path}`;
      row.stripeDfyUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
      row.stripeProUrl = 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
      row.outreachEmail = offerNote(catRow);
      return row;
    });
    const changed = fiction.length > 0 || kept.length !== records.length;
    this.pipeline.archivedFiction = (this.pipeline.archivedFiction || 0) + fiction.length;
    this.pipeline.records = kept.slice(0, 12);
    this.recount();
    if (changed) this.savePipeline();

    const priorityTargets = [
      { city: 'Virginia Beach', niche: 'hvac' },
      { city: 'Virginia Beach', niche: 'fencing-and-decks' },
      { city: 'Virginia Beach', niche: 'electricians' },
      { city: 'Norfolk', niche: 'plumbers' },
      { city: 'Norfolk', niche: 'roofers' },
      { city: 'Norfolk', niche: 'hvac' },
      { city: 'Chesapeake', niche: 'landscaping' },
      { city: 'Chesapeake', niche: 'painters' },
      { city: 'Chesapeake', niche: 'concrete' }
    ];
    for (const pt of priorityTargets) {
      if (this.pipeline.records.length >= 12) break;
      this.nextOffer({ city: pt.city, niche: pt.niche, quiet: true });
    }
    let guard = 0;
    while (this.pipeline.records.length < 12 && guard < 12) {
      guard += 1;
      if (!this.nextOffer({ quiet: true })) break;
    }
    this.savePipeline();
  }

  /**
   * Pull the next real City Desk page. One trade, one city, one price.
   */
  nextOffer(opts = {}) {
    const used = new Set((this.pipeline.records || []).map((row) => row.path).filter(Boolean));
    const wantCity = opts.city ? String(opts.city).toLowerCase() : '';
    const wantNiche = opts.niche ? String(opts.niche).toLowerCase() : '';
    const row = this.catalog.find((offer) => {
      if (!offer.path || used.has(offer.path)) return false;
      if (wantCity && String(offer.city).toLowerCase() !== wantCity) return false;
      if (wantNiche && !`${offer.service} ${tradeLabel(offer.service)}`.toLowerCase().includes(wantNiche)) return false;
      return true;
    });
    if (!row) return null;
    const trade = tradeLabel(row.service);
    const id = `offer_${String(row.path).replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '')}`;
    const record = {
      id,
      kind: 'offer',
      businessName: `${trade} page for ${row.city}, ${row.state}`,
      niche: trade,
      city: row.city,
      state: row.state,
      path: row.path,
      specPreviewUrl: `/desk${row.path}`,
      liveUrl: `https://city-desk.netlify.app${row.path}`,
      stripeDfyUrl: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
      stripeProUrl: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
      currentSiteUrl: '',
      status: 'READY',
      pricing: { price: row.price, label: `$${row.price}`, dfyPrice: 149, proPrice: 19, tier: 'City Desk page' },
      revampHook: `One page for a ${trade} owner in ${row.city}. The owner already does the work.`,
      videoVibe: '',
      outreachEmail: offerNote(row),
      scoutedAt: new Date().toISOString(),
      scoutedBy: 'City Desk catalog'
    };
    this.pipeline.records.unshift(record);
    this.pipeline.records = this.pipeline.records.slice(0, 12);
    this.recount();
    this.savePipeline();
    if (!opts.quiet && this.engine && typeof this.engine.addMessage === 'function') {
      this.engine.addMessage(
        'DESK',
        `Page ready: ${trade} in ${row.city}, ${row.state}, $${row.price} ($149 DFY). Hand it to an owner who already does the work.`,
        'build',
        { targetId: id, city: row.city }
      );
    }
    return record;
  }

  scoutTarget(specifiedCity = null, specifiedNiche = null) {
    const city = specifiedCity && specifiedCity.city ? specifiedCity.city : '';
    const niche = specifiedNiche
      ? (typeof specifiedNiche === 'string' ? specifiedNiche : (specifiedNiche.niche || ''))
      : '';
    return this.nextOffer({ city, niche });
  }

  /**
   * Generate 15-Second Claude Motion Graphics Showreel Prompt Recipe
   */
  generateShowreelPrompt(businessName, city, trade) {
    return [
      `# 15s Product Showreel: ${businessName} (${city.city}, ${city.state})`,
      `**Style**: High-contrast modern cinematic motion graphics (Claude Opus 5.5 / Revid.ai standard).`,
      `**Duration**: Exactly 15.0 seconds @ 60 FPS.`,
      `**Palette**: Deep obsidian (#08090C), Electric Gold/Cyan accent (#F59E0B / #38BDF8), Crisp Platinum (#F8FAFC).`,
      ``,
      `### Timeline Breakdown`,
      `- **0.0s – 3.5s | Scene 1: Kinetic Brand Ignition**`,
      `  * Bold typography flashes: "${businessName}".`,
      `  * Subtitle lockup: "The Premier ${trade.niche} Standard in ${city.city}."`,
      `  * Visual: Conic light beam flares across screen with dark glass aurora burst.`,
      ``,
      `- **3.5s – 8.0s | Scene 2: Trade Excellence & Core Hook**`,
      `  * "${trade.revampHook}"`,
      `  * 3 Bento cards glide into 3D isometric view showcasing speed, craft, and guaranteed quality.`,
      `  * Visual vibe: ${trade.videoVibe}`,
      ``,
      `- **8.0s – 12.0s | Scene 3: Hyper-Local Trust & Verified Authority**`,
      `  * Serving ${city.city}, ${city.metro} & Surrounding Communities.`,
      `  * 5.0 Star Rating Badge & Google Verified AEO Structured Entity badge.`,
      ``,
      `- **12.0s – 15.0s | Scene 4: Instant Action CTA**`,
      `  * Final Hero Stamp: "Ready for the Next Level?"`,
      `  * Call / Book Online button pulses with glowing border resonance.`
    ].join('\n');
  }

  /**
   * Generate Value-First Cold Outreach Email Pitch
   */
  generateOutreachEmail(businessName, city, trade, pricing, recordId) {
    return {
      subject: `Quick question regarding ${businessName} website in ${city.city} (made you a free revamp + video)`,
      previewText: `I rebuilt your website and generated a 15-second motion showreel for ${city.city}...`,
      bodyText: [
        `Hi ${businessName} Team,`,
        ``,
        `I was looking through local ${trade.niche} services in ${city.city} and came across your current site. I noticed it was feeling a bit dated and was missing critical modern commodities like mobile-first speed, clean typography, and Google AEO search schema.`,
        ``,
        `Rather than just pitching you with words, my engineering studio took the initiative and completely built out a high-converting, modern spec redesign for ${businessName}:`,
        ``,
        `👉 Live Redesign Preview: https://zoth.nullai.tech/revamp/preview/${recordId}`,
        `🎬 15-Second Motion Video Showreel: Embedded directly at the top of the preview`,
        ``,
        `What we built for you:`,
        `• 100% Mobile Responsive layout with pure CSS glassmorphic aesthetic & Bento service grid`,
        `• 15s High-Energy Motion Showreel video ready to use on Instagram, Facebook, and your site`,
        `• Google SGE & Perplexity AEO Schema.org knowledge graph for top ${city.city} search citation`,
        `• Direct click-to-call and instant quote intake paths designed to convert visitors into clients`,
        ``,
        `If you love it, the entire codebase, domain connection, video showreel, and deployment are yours for a flat ${pricing.label} (${pricing.tier} — one-time fee, zero monthly retainers).`,
        ``,
        `If you want to claim it, reply directly to this email or let me know and we will point it to your domain in under 15 minutes. If not interested, no worries at all—feel free to keep the preview link!`,
        ``,
        `Best regards,`,
        `1nc0gn30 | 1nc0gn30 (@1nc0gn30)`,
        `Zoth Studio • NullAI Platform`,
        `https://nullai.tech • https://nullai.tech`
      ].join('\n')
    };
  }

  /**
   * Build Avant-Garde HTML Spec Redesign Document
   */
  generateSpecHtml(record) {
    if (!record || record.kind === 'offer') {
      const page = record && typeof record.specPreviewUrl === 'string' && /^\/desk\/[a-z0-9/_-]+$/.test(record.specPreviewUrl)
        ? record.specPreviewUrl
        : '/desk/';
      return `<!DOCTYPE html><meta charset="utf-8"><title>City Desk</title><p>Open the City Desk page. This preview does not invent a shop.</p><p><a href="${page}">${page}</a></p>`;
    }
    return renderAvantGardeSpec(record);
  }
}

module.exports = { LocalRevampMission, TARGET_CITIES, TRADE_NICHES };
