/**
 * Prod passes for the live apps other than PromptMaster.
 * One agent, one app, one step. The seller and anyone holding a live line stay put.
 */

const fs = require('fs');
const { insideFence, CIV } = require('./work_fence');
const { libraryBrief } = require('./library_road');
const { skillLine } = require('./design_skills');

const PROD_APP_IDS = [
  'promptmaster-studio',
  'aeo-graph-engine',
  'envguard-secrets-vault',
  'cwv-speed-engine',
  'badge3d-coin-generator',
  'robots-txt-auditor',
  'vaelor-network'
];

const SACRED = new Set([
  'WALKING_TO_ADYTUM',
  'MEDITATING_ADYTUM',
  'CONTEMPLATING_ADYTUM',
  'IN_THE_MIST',
  'INVOKING_AGY'
]);

function held(agent) {
  const imprint = agent && agent.journeyImprint;
  return !!(imprint && imprint.text && (imprint.kind === 'assignment' || imprint.kind === 'conversation'));
}

function ownsLead(agent, desk) {
  if (!desk || typeof desk.openLeads !== 'function') return false;
  return desk.openLeads().some((lead) => lead && lead.ownerId === agent.id);
}

function prodAgents(agents, desk) {
  return (agents || []).filter((agent) => {
    if (!agent || !agent.id || agent.parentId || agent.post === 'station') return false;
    if (SACRED.has(agent.state)) return false;
    if (held(agent)) return false;
    if (agent.duty && (agent.duty.role === 'distributor' || agent.duty.role === 'researcher')) return false;
    if (agent.duty && agent.duty.role === 'finder' && ownsLead(agent, desk)) return false;
    return true;
  }).sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function prodApps(state) {
  const posted = state && Array.isArray(state.activeMonetizedApps) ? state.activeMonetizedApps : [];
  const found = [];
  PROD_APP_IDS.forEach((id) => {
    let app = posted.find((item) => item && item.id === id && item.localPath);
    if (!app && id === 'vaelor-network') {
      app = {
        id: 'vaelor-network',
        name: 'Vaelor Network & Zoth Node ($VLR)',
        localPath: '/opt/vaelor-network'
      };
    }
    if (!app) return;
    if (!fs.existsSync(app.localPath)) return;
    if (!insideFence(app.localPath, state)) return;
    found.push({
      id: app.id,
      name: app.name || id,
      path: app.localPath
    });
  });
  return found;
}

function prodBrief(agent, app) {
  return [
    `Prod pass on ${app.name}.`,
    skillLine(agent),
    'This directory is one live tool. Fix one real gap in the tool itself: a broken control, a missing alt, sideways scroll, a false claim, or a guardrail file that is absent.',
    'The guardrail is a schema graph, robots.txt, netlify headers and redirects, alt text, absolute social images, no horizontal overflow at 375, 768, and 1440, and no broken tags or console errors.',
    'Do not add a city page, a local-business doorway, or a handoff sheet in this app.',
    'Finish the change in this turn. Launching a check is not the finished step.',
    'If you change layout or type, read design-director first and look at the rendered page before you call it done.',
    'Do not deploy. Do not push. Do not open a repo.'
  ].join(' ');
}

function sellerReady(agents) {
  const mercury = (agents || []).find((agent) => agent && agent.id === 'MERCURY');
  if (!mercury || SACRED.has(mercury.state)) return null;
  return mercury;
}

function worldBrief(agent) {
  return [
    'One concrete step on the Zoth Civilization walk, voice, or a screen the operator already uses.',
    skillLine(agent),
    'City Desk is already generated in /opt/city-desk and mounted from that site folder.',
    'Do not write a new city page or a handoff sheet in this repo.',
    'Finish the step in this turn. A launched check is not a finished step.',
    'Keep the treasury goal at $100,000.',
    'Do not deploy. Do not push. Do not stop the running server.'
  ].join(' ');
}

/**
 * Fill the open seats.
 * One seat is the world, or the Library once that roadmap is open.
 * A second seat, when the machine has room, is a live tool.
 * The same agent and the same folder are never seated twice.
 * The Boise handoff folder is not a seat. The finished pages are the product.
 */
function planWork(agents, state, desk, ctx) {
  const slots = Math.min(2, Math.max(0, Number(ctx && ctx.slots) || 0));
  const heldCursor = (state && state.prodCursor) || 0;
  if (!slots) return { cursor: heldCursor, plans: [] };
  const busyAgents = new Set((ctx && ctx.busyAgents) || []);
  const busyPaths = new Set((ctx && ctx.busyPaths) || []);
  const people = prodAgents(agents, desk).filter((agent) => !busyAgents.has(agent.id));
  if (!people.length) return { cursor: heldCursor, plans: [] };

  let cursor = heldCursor + 1;
  const takenAgents = new Set();
  const takenPaths = new Set(busyPaths);
  const plans = [];

  function take(agent, plan) {
    if (!agent || takenAgents.has(agent.id) || takenPaths.has(plan.path)) return false;
    if (!insideFence(plan.path, state)) return false;
    takenAgents.add(agent.id);
    takenPaths.add(plan.path);
    plans.push(Object.assign({ agentId: agent.id, cursor }, plan));
    return true;
  }

  function nextPerson() {
    return people.find((agent) => !takenAgents.has(agent.id)) || null;
  }

  const menu = cursor % 3;
  const libraryOn = !!(state && state.libraryRoad && state.libraryRoad.active);
  const pickLibrarian = () => {
    const prefer = ['ATHENA', 'DRACO', 'CHRONOS'];
    for (let i = 0; i < prefer.length; i += 1) {
      const found = people.find((agent) => agent.id === prefer[i] && !takenAgents.has(agent.id));
      if (found) return found;
    }
    return null;
  };
  const seatLibrary = () => {
    const keeper = pickLibrarian();
    if (!keeper || !libraryOn) return false;
    return take(keeper, {
      kind: 'library',
      path: CIV,
      name: (state.libraryRoad && state.libraryRoad.title) || 'The Library',
      brief: libraryBrief(state)
    });
  };
  const seatWorld = (person) => take(person, {
    kind: 'world',
    path: CIV,
    name: 'Zoth Civilization',
    brief: worldBrief(person)
  });
  const seatTool = (person) => {
    const apps = prodApps(state).filter((app) => !takenPaths.has(app.path));
    if (!apps.length) return false;
    const app = apps[cursor % apps.length];
    return take(person, {
      kind: 'prod',
      appId: app.id,
      path: app.path,
      name: app.name,
      brief: prodBrief(person, app)
    });
  };

  if (slots >= 2) {
    const librarySeated = seatLibrary();
    if (!librarySeated) seatWorld(nextPerson());
    seatTool(nextPerson());
  } else if (libraryOn && menu !== 1) {
    if (!seatLibrary()) seatWorld(nextPerson());
  } else if (menu === 2) {
    seatTool(nextPerson());
  } else if (menu === 1) {
    seatTool(nextPerson());
  } else {
    seatWorld(nextPerson());
  }

  if (!plans.length) {
    const person = nextPerson();
    const apps = prodApps(state);
    if (person && apps.length) {
      const app = apps[cursor % apps.length];
      take(person, {
        kind: 'prod',
        appId: app.id,
        path: app.path,
        name: app.name,
        brief: prodBrief(person, app)
      });
    }
  }

  return { cursor, plans };
}

/**
 * Every fourth turn keeps Mercury on the PromptMaster sale.
 * The other turns walk the remaining agents across the other live apps.
 */
function planTurn(agents, state, desk) {
  const cursor = ((state && state.prodCursor) || 0) + 1;
  const sell = cursor % 4 === 0 ? sellerReady(agents) : null;
  if (sell) {
    return { kind: 'sell', agentId: sell.id, cursor };
  }
  const people = prodAgents(agents, desk);
  const apps = prodApps(state);
  if (!people.length || !apps.length) {
    const fallback = sellerReady(agents);
    return fallback ? { kind: 'sell', agentId: fallback.id, cursor } : { kind: 'none', cursor };
  }
  const app = apps[cursor % apps.length];
  const agent = people[Math.floor(cursor / apps.length) % people.length];
  return {
    kind: 'prod',
    agentId: agent.id,
    cursor,
    appId: app.id,
    name: app.name,
    path: app.path,
    brief: prodBrief(agent, app)
  };
}

module.exports = {
  PROD_APP_IDS,
  prodAgents,
  prodApps,
  prodBrief,
  planTurn,
  planWork
};
