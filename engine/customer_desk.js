/**
 * Warm leads and who is actually working.
 * The operator sends the note. Nothing here emails a stranger or opens a repo.
 */

const fs = require('fs');
const path = require('path');
const { APP_PROFILES } = require('./outreach_engine');
const { ensureLedger, noteBeat, speakLine } = require('./agent_ledger');
const { insideFence } = require('./work_fence');

const ROSTER = {
  VIGIL: { role: 'bench', offerId: 'aeo-graph-engine' },
  GHOSTBYTE: { role: 'bench', offerId: 'envguard-secrets-vault' },
  AQUILA: { role: 'bench', offerId: 'cwv-speed-engine' },
  MERCURY: { role: 'bench', offerId: 'promptmaster-studio' },
  KRAKEN: { role: 'finder', offerId: 'launch-pack' },
  AETHER: { role: 'finder', offerId: 'offer-page' },
  ATHENA: { role: 'oncall', offerId: 'aeo-graph-engine' },
  KITSUNE: { role: 'oncall', offerId: 'offer-page' },
  'PIXEL-NEKO': { role: 'distributor', offerId: 'promptmaster-studio' },
  'RADICAL-MINION': { role: 'distributor', offerId: 'promptmaster-studio' },
  KITSUNE: { role: 'distributor', offerId: 'promptmaster-studio' },
  IGNIS: { role: 'oncall', offerId: 'badge3d-coin-generator' },
  CHRONOS: { role: 'oncall', offerId: 'robots-txt-auditor' },
  AZOTH: { role: 'oncall', offerId: 'promptmaster-studio' },
  DRACO: { role: 'oncall', offerId: 'crawler-pass' },
  THOTH: { role: 'researcher', offerId: '' },
  SESHAT: { role: 'researcher', offerId: '' }
};

const EXTRA = [
  {
    id: 'launch-pack',
    name: 'Launch note pack',
    price: '$0',
    blurb: 'Three short notes you can send yourself: one to the person, one public line, and one for a friend who might care.',
    url: 'https://launch-better.nullai.tech',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    kind: 'service'
  },
  {
    id: 'offer-page',
    name: 'One-page offer',
    price: '$0',
    blurb: 'A single page of plain words for something you already sell, so a warm lead can understand it in one read.',
    url: 'https://city-desk.netlify.app',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    kind: 'service'
  },
  {
    id: 'crawler-pass',
    name: 'Crawler pass',
    price: '$0',
    blurb: 'A written pass on which crawlers to allow. You run it in the robots auditor. The desk does not fetch the site.',
    url: 'https://robots-txt-auditor.netlify.app',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    kind: 'service'
  },
  {
    id: 'city-desk-page',
    name: 'City Desk page ($149 Done-For-You / $700–$1,500 Custom)',
    price: '$149 DFY / $700–$1,500',
    blurb: 'A finished page for one trade in one city, live on City Desk. The owner adds their name, phone, and photos, or claims the $149 Done-For-You launch with domain connection.',
    url: 'https://city-desk.netlify.app',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    kind: 'service'
  }
];

const MARKET_OFFER = 'promptmaster-studio';

const MATCHES = [
  [/secret|api key|\.env|vault|leak/i, 'envguard-secrets-vault'],
  [/speed|slow|vital|lcp|inp|\bcls\b/i, 'cwv-speed-engine'],
  [/robot|crawler|gptbot|sitemap/i, 'robots-txt-auditor'],
  [/coin|badge|medallion|3d print/i, 'badge3d-coin-generator'],
  [/schema|\baeo\b|json-ld|perplexity/i, 'aeo-graph-engine'],
  [/prompt/i, 'promptmaster-studio'],
  [/painter|plumb|hvac|roofer|electrician|garage door|landscap|city desk/i, 'city-desk-page'],
  [/landing|one-page|one page|blurb/i, 'offer-page'],
  [/thread|show hn|launch post/i, 'launch-pack']
];

function clip(text, max) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trim();
}

function services() {
  const tools = Object.keys(APP_PROFILES).map((id) => {
    const app = APP_PROFILES[id];
    return {
      id,
      name: app.name,
      price: app.price,
      blurb: app.coreHook,
      url: app.url,
      stripeLink: app.stripeLink,
      kind: 'tool'
    };
  });
  return tools.concat(EXTRA);
}

function offerById(id) {
  return services().find((offer) => offer.id === id) || null;
}

function marketBrief() {
  const offer = offerById(MARKET_OFFER);
  if (!offer) return null;
  return {
    offerId: offer.id,
    name: offer.name,
    price: offer.price,
    url: offer.url,
    stripeLink: offer.stripeLink,
    who: 'People who already write prompts for work: a studio, a solo operator, or someone on a team.',
    line: clip(`${offer.name}: ${offer.blurb} It is ${offer.price}. ${offer.url} Pay here if it fits: ${offer.stripeLink}`, 700),
    roles: 'Mercury sells this. Kraken and Aether wait for a real name. Pixel-Neko, Radical-Minion, and Kitsune keep posts ready for accounts you own. Thoth and Seshat read the public record every half hour and leave one dated fact on each bench. The fact sits under the assignment. They do not edit the apps. Everyone else hardens the other five live apps. You send the note.'
  };
}

function finderWatchLine() {
  const offer = offerById(MARKET_OFFER);
  const name = offer ? offer.name : 'PromptMaster Studio';
  const price = offer ? offer.price : '$0';
  return `Watching for people who already write prompts for work. ${name} is ${price}. Prompts stay in the browser.`;
}

function matchOffer(need, requestedId) {
  if (requestedId && requestedId !== 'auto') {
    const picked = offerById(requestedId);
    if (picked) return picked;
  }
  const text = String(need || '');
  for (let i = 0; i < MATCHES.length; i++) {
    if (MATCHES[i][0].test(text)) {
      const found = offerById(MATCHES[i][1]);
      if (found) return found;
    }
  }
  return offerById('launch-pack');
}

function draftNote(lead, offer, replyTo) {
  const name = lead.name || 'there';
  const where = lead.where ? `Good to meet you on ${lead.where}. ` : '';
  const price = offer.price ? ` It is ${offer.price}.` : '';
  const link = offer.url ? ` ${offer.url}` : '';
  const pay = offer.stripeLink ? ` Pay here if it fits: ${offer.stripeLink}` : '';
  const from = replyTo ? ` Reply to ${replyTo}.` : '';
  return clip(
    `${name} — ${where}you mentioned ${lead.need}. ${offer.name}: ${offer.blurb}${price}${link}${pay} If it is the wrong fit, say so and I will point at a smaller one.${from}`,
    700
  );
}

function postedPath(state, offerId) {
  const apps = state && Array.isArray(state.activeMonetizedApps) ? state.activeMonetizedApps : [];
  const app = apps.find((item) => item && item.id === offerId);
  if (!app || !app.localPath) return '';
  if (!/deployed|live/i.test(String(app.status || ''))) return '';
  if (!insideFence(app.localPath, state)) return '';
  return app.localPath;
}

function assignRoster(agents, state) {
  const list = (agents || []).filter((agent) => agent && agent.id && !agent.parentId);
  const resting = [];
  list.forEach((agent) => {
    const spec = ROSTER[agent.id] || { role: 'rest', offerId: '' };
    const offer = spec.offerId ? offerById(spec.offerId) : null;
    agent.duty = {
      role: spec.role,
      offerId: spec.offerId || '',
      offerName: offer ? offer.name : '',
      toolPath: spec.role === 'bench' ? postedPath(state, spec.offerId) : '',
      label: spec.role === 'bench'
        ? 'On the app'
        : spec.role === 'finder'
          ? 'Finding buyers'
          : spec.role === 'distributor'
            ? 'Posting the offer'
            : spec.role === 'researcher'
              ? 'Reading the public record'
              : spec.role === 'oncall'
                ? 'Helps when a lead matches'
                : 'Comes and goes',
      visitSlot: 0,
      visitMod: 8
    };
    if (spec.role === 'rest') resting.push(agent);
  });
  resting.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  resting.forEach((agent, index) => {
    agent.duty.visitSlot = index % 8;
    agent.duty.visitMod = 8;
  });
  return list.map((agent) => agent.duty);
}

function awake(agent, tick, desk) {
  if (!agent || !agent.duty) return true;
  const role = agent.duty.role;
  if (role === 'bench' || role === 'finder' || role === 'distributor' || role === 'researcher') return true;
  const open = desk && typeof desk.openLeads === 'function' ? desk.openLeads() : [];
  if (role === 'oncall') {
    return open.some((lead) => lead.offerId === agent.duty.offerId);
  }
  const mod = agent.duty.visitMod || 8;
  const slot = Math.floor((tick || 0) / 12) % mod;
  return agent.duty.visitSlot === slot;
}

function rankOf(from) {
  if (from === 'operator') return 6;
  if (from === 'sitting') return 5;
  if (from === 'meeting') return 4;
  return 0;
}

class CustomerDesk {
  constructor(civEngine) {
    this.civ = civEngine;
    this.file = path.join(civEngine.dataDir, 'customer_desk.json');
    this.data = { replyTo: '', leads: [] };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        this.data.replyTo = typeof saved.replyTo === 'string' ? saved.replyTo : '';
        this.data.leads = Array.isArray(saved.leads) ? saved.leads.slice(0, 40) : [];
      }
    } catch (err) {
      this.data = { replyTo: '', leads: [] };
    }
  }

  save() {
    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2), 'utf8');
  }

  openLeads() {
    return this.data.leads.filter((lead) => lead.status === 'drafted' || lead.status === 'sent');
  }

  setReply(address) {
    const value = clip(address, 120);
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      throw new Error('That reply address does not look like email.');
    }
    this.data.replyTo = value;
    this.save();
    return value;
  }

  pickFinder() {
    const agents = (this.civ && this.civ.agents) || [];
    const finders = agents.filter((agent) => agent.duty && agent.duty.role === 'finder');
    if (!finders.length) return agents[0] || null;
    finders.sort((a, b) => {
      const load = (agent) => this.openLeads().filter((lead) => lead.ownerId === agent.id).length;
      return load(a) - load(b);
    });
    return finders[0];
  }

  hold(agent, text) {
    const ledger = ensureLedger(agent, this.civ && this.civ.state);
    if (!ledger) return;
    if (rankOf(ledger.focusFrom) >= 5) return;
    ledger.focus = clip(text, 120);
    ledger.focusFrom = 'meeting';
  }

  release(lead) {
    const agents = (this.civ && this.civ.agents) || [];
    const owner = agents.find((agent) => agent.id === lead.ownerId);
    if (!owner || !owner.ledger) return;
    const mark = `Warm lead: ${lead.name}`;
    if (owner.ledger.focusFrom === 'meeting' && String(owner.ledger.focus || '').indexOf(mark) === 0) {
      const offer = owner.duty && owner.duty.offerName ? owner.duty.offerName : 'the next warm name';
      owner.ledger.focus = `Waiting on the next buyer for ${offer}.`;
      owner.ledger.focusFrom = 'self';
    }
  }

  addLead(input) {
    const name = clip(input && input.name, 60);
    const need = clip(input && input.need, 180);
    if (!name || !need) throw new Error('A name and what they need are required.');
    if (this.civ && this.civ.agents) assignRoster(this.civ.agents, this.civ.state);
    const offer = matchOffer(need, input && input.offerId);
    const lead = {
      id: `lead_${Date.now().toString(36)}`,
      name,
      where: clip(input && input.where, 40),
      need,
      note: clip(input && input.note, 240),
      offerId: offer.id,
      offerName: offer.name,
      price: offer.price,
      status: 'drafted',
      draft: draftNote({ name, where: clip(input && input.where, 40), need }, offer, this.data.replyTo),
      ownerId: '',
      ownerName: '',
      createdAt: new Date().toISOString()
    };
    const owner = this.pickFinder();
    if (owner) {
      lead.ownerId = owner.id;
      lead.ownerName = owner.name;
      this.hold(owner, `Warm lead: ${name}. ${need}`);
      const sacred = owner.state === 'WALKING_TO_ADYTUM' || owner.state === 'MEDITATING_ADYTUM' || owner.state === 'CONTEMPLATING_ADYTUM' || owner.state === 'IN_THE_MIST';
      if (!sacred) {
        noteBeat(owner);
        owner.speech = speakLine(owner);
        owner.speechExpires = Date.now() + 12000;
      }
      if (this.civ) {
        this.civ.addMessage(owner.name, lead.draft, 'chat', { leadId: lead.id, offerId: offer.id });
      }
    }
    this.data.leads.unshift(lead);
    this.data.leads = this.data.leads.slice(0, 40);
    this.save();
    return lead;
  }

  setStatus(id, status) {
    const allowed = ['drafted', 'sent', 'paid', 'quiet'];
    if (!allowed.includes(status)) throw new Error('Unknown lead status.');
    const lead = this.data.leads.find((item) => item.id === id);
    if (!lead) throw new Error('No such lead.');
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    if (status === 'paid' || status === 'quiet') this.release(lead);
    this.save();
    return lead;
  }

  finderAction(agent) {
    const mine = this.openLeads().filter((lead) => lead.ownerId === agent.id);
    if (!mine.length) {
      const line = finderWatchLine();
      const ledger = ensureLedger(agent, this.civ && this.civ.state);
      if (ledger && rankOf(ledger.focusFrom) < 4) {
        ledger.focus = clip(line, 120);
        ledger.focusFrom = 'self';
      }
      return `${line} The note waits for a real name, and you send it.`;
    }
    const lead = mine[0];
    return `Note ready for ${lead.name}: ${lead.need}`;
  }

  snapshot(tick) {
    const agents = (this.civ && this.civ.agents) || [];
    return {
      replyTo: this.data.replyTo,
      market: marketBrief(),
      services: services().map((offer) => ({
        id: offer.id,
        name: offer.name,
        price: offer.price,
        blurb: offer.blurb,
        url: offer.url,
        kind: offer.kind
      })),
      leads: this.data.leads.slice(0, 20),
      research: this.civ && this.civ.researchDesk ? this.civ.researchDesk.publicNote() : null,
      roster: agents.filter((agent) => agent && agent.duty).map((agent) => ({
        id: agent.id,
        name: agent.name,
        role: agent.duty.role,
        label: agent.duty.label,
        offerName: agent.duty.offerName,
        awake: awake(agent, tick, this)
      }))
    };
  }
}

module.exports = {
  CustomerDesk,
  MARKET_OFFER,
  services,
  marketBrief,
  matchOffer,
  draftNote,
  assignRoster,
  awake
};
