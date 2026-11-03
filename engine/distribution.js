/**
 * Distribution team for PromptMaster.
 * They keep real posts ready. The operator sends them from an account they own.
 * This desk does not open throwaway inboxes or post as someone else.
 */

const fs = require('fs');
const path = require('path');
const { APP_PROFILES } = require('./outreach_engine');
const { ensureLedger, RANK } = require('./agent_ledger');

const OFFER_ID = 'promptmaster-studio';

const TEAM = [
  { id: 'RADICAL-MINION', place: 'Hacker News', kind: 'show_hn' },
  { id: 'PIXEL-NEKO', place: 'X', kind: 'x' },
  { id: 'KITSUNE', place: 'Someone you already know', kind: 'note' }
];

function clip(text, max) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  return value.slice(0, max - 1).trim();
}

function buildPosts() {
  const app = APP_PROFILES[OFFER_ID];
  if (!app) return [];
  const show = TEAM[0];
  const x = TEAM[1];
  const note = TEAM[2];
  return [
    {
      id: 'dist_show_hn',
      ownerId: show.id,
      place: show.place,
      kind: show.kind,
      title: `Show HN: ${app.name} – prompts stay in the browser (${app.price})`,
      body: [
        `I built ${app.name}. ${app.coreHook}`,
        'It runs in the browser. There is no account and no server-side prompt store.',
        `Live: ${app.url}`,
        `Source: ${app.repo}`,
        `Pay if it fits: ${app.stripeLink} (${app.price})`
      ].join('\n\n'),
      status: 'ready'
    },
    {
      id: 'dist_x',
      ownerId: x.id,
      place: x.place,
      kind: x.kind,
      title: `${app.name} on X`,
      body: `${app.name} keeps the prompt in the browser: lint, a cleaner version, and a token cost. No server in the middle. ${app.price}. ${app.url} ${app.stripeLink}`,
      status: 'ready'
    },
    {
      id: 'dist_note',
      ownerId: note.id,
      place: note.place,
      kind: note.kind,
      title: `A note for someone who already writes prompts`,
      body: `${app.name}: ${app.coreHook} It is ${app.price}. ${app.url} Pay here if it fits: ${app.stripeLink}`,
      status: 'ready'
    },
    {
      id: 'dist_citydesk_boise_hvac',
      ownerId: 'GHOSTBYTE',
      place: 'City Desk',
      kind: 'offer',
      title: 'HVAC shops in Boise, ID ($1,100)',
      body: 'One page for an HVAC owner in Boise, ID who already does the work. Set price $1,100. Includes the page and the handoff sheet. No ads, no fake reviews, no rank promise. The owner keeps the words.',
      status: 'ready'
    },
    {
      id: 'dist_citydesk_boise_plumbers',
      ownerId: 'GHOSTBYTE',
      place: 'City Desk',
      kind: 'offer',
      title: 'Plumbers in Boise, ID ($900)',
      body: 'One page for a plumbing owner in Boise, ID who already does the work. Set price $900. Emergency and scheduled paths separated, Ada County service windows clear. Includes the page and the handoff sheet.',
      status: 'ready'
    },
    {
      id: 'dist_citydesk_boise_painters',
      ownerId: 'GHOSTBYTE',
      place: 'City Desk',
      kind: 'offer',
      title: 'Painters in Boise, ID ($800)',
      body: 'One page for a painting owner in Boise, ID who already does the work. Set price $800. Interior and exterior split, room rate estimates, Boise/Meridian/Eagle service area. Includes the page and the handoff sheet.',
      status: 'ready'
    },
    {
      id: 'dist_citydesk_norfolk_aeo',
      ownerId: 'ATHENA',
      place: 'City Desk',
      kind: 'offer',
      title: 'AEO Knowledge Graph Engine in Norfolk, VA ($850)',
      body: 'One production-ready AEO entity graph and distribution storefront for an established business in Norfolk, VA. Set price $850. Zero fake reviews, zero ranking promises, fully compliant schema, and direct owner attribution. Includes handoff sheet.',
      status: 'ready'
    }
  ];
}

class Distribution {
  constructor(civEngine) {
    this.civ = civEngine;
    this.file = path.join(civEngine.dataDir, 'distribution.json');
    this.posts = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.file)) {
        const saved = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        this.posts = Array.isArray(saved.posts) ? saved.posts.slice(0, 12) : [];
      }
    } catch (err) {
      this.posts = [];
    }
    if (!this.posts.length) {
      this.posts = buildPosts();
      this.save();
    }
  }

  save() {
    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify({ posts: this.posts }, null, 2), 'utf8');
  }

  readyFor(agentId) {
    return this.posts.find((post) => post.ownerId === agentId && post.status === 'ready') || null;
  }

  action(agent) {
    const post = agent ? this.readyFor(agent.id) : null;
    const line = post
      ? `${post.place} post for PromptMaster is ready. Send it from your own account.`
      : 'Distribution queue is clear. The next PromptMaster post waits until you can sign in.';
    const ledger = ensureLedger(agent, this.civ && this.civ.state);
    const rank = ledger ? (RANK[ledger.focusFrom] || 0) : 6;
    if (ledger && rank < RANK.meeting) {
      ledger.focus = clip(line, 120);
      ledger.focusFrom = 'self';
    }
    return line;
  }

  setStatus(id, status) {
    if (status !== 'ready' && status !== 'posted') throw new Error('Unknown post status.');
    const post = this.posts.find((item) => item.id === id);
    if (!post) throw new Error('No such post.');
    post.status = status;
    post.updatedAt = new Date().toISOString();
    this.save();
    return post;
  }

  snapshot() {
    const agents = (this.civ && this.civ.agents) || [];
    const known = new Map();
    TEAM.forEach((m) => known.set(m.id, { id: m.id, place: m.place }));
    this.posts.forEach((p) => {
      if (p.ownerId && !known.has(p.ownerId)) {
        known.set(p.ownerId, { id: p.ownerId, place: p.place || 'Desk' });
      }
    });
    return {
      team: Array.from(known.values()).map((member) => {
        const agent = agents.find((item) => item && item.id === member.id);
        return { id: member.id, name: agent ? agent.name : member.id, place: member.place };
      }),
      posts: this.posts.map((post) => ({
        id: post.id,
        ownerId: post.ownerId,
        place: post.place,
        title: post.title,
        body: post.body,
        status: post.status
      }))
    };
  }
}

module.exports = { Distribution, TEAM };
