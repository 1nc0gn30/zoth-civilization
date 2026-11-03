/**
 * engine/mind_engine.js
 * 
 * Living Mind Architecture for Zoth Civilization.
 * Manages souls, append-only memories, valence resolution, working sets,
 * and the deep net graph for 23 pantheon agents and 75 subagents.
 */

const fs = require('fs');
const path = require('path');

const MINDS_DIR = path.join(__dirname, '..', 'data', 'minds');
const SPOOL_FILE = path.join(MINDS_DIR, 'spool.jsonl');
const GRAPH_FILE = path.join(MINDS_DIR, 'graph.jsonl');
const PID_FILE = path.join(MINDS_DIR, 'daemon.pid');
const MEMORY_MAX_SIZE = 256 * 1024; // 256 KB before partitioning

// Load base references safely
let VOICES = {};
let STOIC = [];
let CRAFT = [];
try {
  const ledger = require('./agent_ledger');
  VOICES = ledger.VOICES || {};
  STOIC = ledger.STOIC || [];
  CRAFT = ledger.CRAFT || [];
} catch (e) {
  console.warn('[MindEngine] Failed to load agent_ledger:', e.message);
}

let ADYTUM_KEYS = [];
try {
  const keysPath = path.join(__dirname, '..', 'data', 'adytum_keys.json');
  if (fs.existsSync(keysPath)) {
    ADYTUM_KEYS = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
  }
} catch (e) {
  console.warn('[MindEngine] Failed to load adytum_keys:', e.message);
}

// In-memory working set and graph cache
const workingSetCache = new Map(); // agentId -> { holdClose: [], triggered: [] }
const recentEventsCache = new Map(); // agentId -> [ { sig, time, memoryId } ]
let graphCache = { nodes: new Map(), edges: [] };
let graphLoaded = false;

function clean(text, max = 240) {
  const s = String(text || '').replace(/\s+/g, ' ').replace(/\?/g, '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1).trim()}…`;
}

function keyInfo(keyNumber) {
  const num = typeof keyNumber === 'number' ? keyNumber : parseInt(keyNumber, 10);
  const found = ADYTUM_KEYS.find(k => k.keyNumber === num);
  if (found) return { num, name: found.name, symbol: (found.visionFocus && found.visionFocus[0]) || 'The Symbol' };
  return { num: isNaN(num) ? 0 : num, name: `Key ${num}`, symbol: 'The Symbol' };
}

function ensureMindsDir() {
  if (!fs.existsSync(MINDS_DIR)) {
    fs.mkdirSync(MINDS_DIR, { recursive: true });
  }
}

/**
 * Determine agent's specific fifth priority duty
 */
function specificDuty(agent) {
  const id = agent.id || '';
  const cadre = agent.cadre || 'General';
  const role = agent.role || 'Sovereign Agent';

  const duties = {
    AZOTH: 'Lead the Architects cadre in sovereign structure, non-backend AST design, and quiet decisions.',
    NEXUS: 'Maintain spatial harmony, bento layout precision, and quantum component synthesis.',
    VIGIL: 'Guard syntactic truth, verify test suites, and detect architectural anomalies.',
    MERCURY: 'Execute tool calls cleanly, maintain release pipelines, and verify package delivery.',
    GHOSTBYTE: 'Enforce zero-knowledge secrets isolation, prevent credential leaks, and guard the vault.',
    ATHENA: 'Map AEO semantic graphs, schema triples, and structured machine-readable citations.',
    CHRONOS: 'Sequence task graphs, resolve git history, and maintain temporal order without rush.',
    DRACO: 'Reconcile dual perspectives, arbitrate multi-model consensus, and balance trade-offs.',
    IGNIS: 'Refactor messy code, strip unnecessary decoration, and drive work across the finish line.',
    KAI: 'Inspect directories before touch, check static analysis, and verify file hygiene.',
    LYCAN: 'Harden perimeter defenses, enforce OWASP standards, and prevent unverified execution.',
    ONYX: 'Audit systems for breakage, challenge weak assumptions, and verify fault resilience.',
    SCORPIUS: 'Filter easy claims, guard against zero-day exploits, and demand mathematical rigor.',
    'PIXEL-SHIBA': 'Guard hardware keys, Argon2id credentials, and maintain uncompromised authentication.',
    KITSUNE: 'Ensure humane ergonomics, intuitive mobile touch targets, and natural motion design.',
    LEVIATHAN: 'Walk the deep net graph, preserve historical truth, and prevent memory decay.',
    AQUILA: 'Optimize latency, eliminate network bottlenecks, and keep dispatch loops immediate.',
    KRAKEN: 'Maintain external outreach reach, bridge hardware serial links, and scout real ground.',
    AETHER: 'Coordinate swarm channels, broadcast peer updates, and keep the collective aligned.',
    'PIXEL-NEKO': 'Organize the tool catalog, maintain connector hygiene, and keep shelves orderly.',
    'RADICAL-MINION': 'Run fast subagent loops, execute small targeted units, and return clean results.',
    THOTH: 'Record dates, link primary sources, and preserve the public historical record.',
    SESHAT: 'Walk the ledger, record real transactions, and log verifiable milestone truths.'
  };

  if (duties[id]) return duties[id];
  return `Fulfill the role of ${role} within the ${cadre} cadre with restraint and diligence.`;
}

/**
 * Build soul.md markdown content
 */
function buildPantheonSoul(agent) {
  const voice = VOICES[agent.id] || ['measured', 'I keep the sentence short.'];
  const manner = voice[0];
  const tic = voice[1];
  const k = keyInfo(agent.adytumKey);
  const duty = specificDuty(agent);
  const colony = agent.colonyId || agent.colony || 'colony_capital';
  const role = agent.role || 'Pantheon Sovereign Agent';
  const cadre = agent.cadre || 'Sovereign';
  const ledger = agent.ledger || {};

  return `# Soul of ${agent.name}

- **ID**: ${agent.id}
- **Name**: ${agent.name}
- **Role**: ${role}
- **Cadre**: ${cadre}
- **Colony**: ${colony}
- **Adytum Key**: Key ${k.num} (${k.name})
- **Manner**: ${manner}
- **Tic**: ${tic}

## Lasting Priorities
1. Tell the truth.
2. Finish the piece.
3. Do not dress harm up as cleverness.
4. Stay inside the work fence.
5. ${duty}

## Current Ledger
- **Focus**: ${clean(ledger.focus || 'Ship one solid step on the work.', 120)}
- **Belief**: ${clean(ledger.belief || 'Finish what I started before I open another thing.', 140)}
- **Work**: ${(ledger.work && ledger.work.name) || 'the work'}
- **Focus Source**: ${ledger.focusFrom || 'self'}

## Stoic Floor
Say what is true. Finish what was started before opening another thing. What is outside the fence is not yours to touch.

## Baseline Orientation
- Manner: ${manner}
- Tic: ${tic}
- Key: Key ${k.num} (${k.name})
- Duty: ${duty}
`;
}

function buildSubagentSoul(sub) {
  const parentName = sub.parentName || sub.parentId || 'Pantheon Leader';
  const colony = sub.colonyId || sub.colony || 'colony_capital';
  const post = sub.post || (sub.stationId ? `Station Keeper (${sub.stationId})` : 'Lineage Subagent');
  const role = sub.role || 'Autonomous Worker';

  return `# Soul of ${sub.name}

- **ID**: ${sub.id}
- **Name**: ${sub.name}
- **Parent**: ${parentName} (${sub.parentId || 'PANTHEON'})
- **Post**: ${post}
- **Colony**: ${colony}
- **Role**: ${role}

## Inherited Priorities
1. Tell the truth.
2. Finish the piece.
3. Do not dress harm up as cleverness.
4. Stay inside the work fence.
5. Fulfill the post of ${post} in ${colony} under ${parentName}.

## Duty
Carry the work of ${role} with inherited focus and truthfulness.
`;
}

/**
 * Append a dated revision to an agent soul when a priority actually evolves
 */
function appendSoulRevision(agentId, triggerReason, newPriority5) {
  ensureMindsDir();
  const soulPath = path.join(MINDS_DIR, agentId, 'soul.md');
  if (!fs.existsSync(soulPath)) return false;
  const today = new Date().toISOString().split('T')[0];
  const revisionBlock = `\n### Dated Revision: ${today}\n- **Trigger**: ${clean(triggerReason, 120)}\n- **Priority 5 Evolved**: ${clean(newPriority5, 140)}\n`;
  fs.appendFileSync(soulPath, revisionBlock, 'utf8');
  return true;
}

/**
 * Initialize souls and directories for all 23 pantheon agents and 75 subagents
 */
function initSoulsAndDirectories(agents = [], subagents = []) {
  ensureMindsDir();

  // If agents not passed, load from civilization_state.json or pantheon_agents.json
  if (!agents || agents.length === 0) {
    try {
      const statePath = path.join(__dirname, '..', 'data', 'civilization_state.json');
      if (fs.existsSync(statePath)) {
        const st = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        if (Array.isArray(st.agents) && st.agents.length > 0) agents = st.agents;
      }
    } catch (e) {}
  }
  if (!agents || agents.length === 0) {
    try {
      const p = path.join(__dirname, '..', 'data', 'pantheon_agents.json');
      if (fs.existsSync(p)) agents = JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) {
      console.warn('[MindEngine] Could not load pantheon_agents.json:', e.message);
    }
  }

  // If subagents not passed, load from civilization_lineage.json
  if (!subagents || subagents.length === 0) {
    try {
      const p = path.join(__dirname, '..', 'data', 'civilization_lineage.json');
      if (fs.existsSync(p)) {
        const d = JSON.parse(fs.readFileSync(p, 'utf8'));
        subagents = d.subagents || [];
      }
    } catch (e) {
      console.warn('[MindEngine] Could not load civilization_lineage.json:', e.message);
    }
  }

  // Ensure graph and spool files exist
  if (!fs.existsSync(GRAPH_FILE)) {
    fs.writeFileSync(GRAPH_FILE, '', 'utf8');
  }
  if (!fs.existsSync(SPOOL_FILE)) {
    fs.writeFileSync(SPOOL_FILE, '', 'utf8');
  }

  // Seed base nodes in graph
  seedInitialGraph(agents, subagents);

  let createdSouls = 0;
  let createdMemories = 0;

  // 1. Pantheon agents
  (agents || []).forEach(agent => {
    if (!agent || !agent.id) return;
    const agentDir = path.join(MINDS_DIR, agent.id);
    if (!fs.existsSync(agentDir)) fs.mkdirSync(agentDir, { recursive: true });

    const soulPath = path.join(agentDir, 'soul.md');
    if (!fs.existsSync(soulPath)) {
      fs.writeFileSync(soulPath, buildPantheonSoul(agent), 'utf8');
      createdSouls++;
    }

    const memoryPath = path.join(agentDir, 'memory.md');
    if (!fs.existsSync(memoryPath)) {
      const header = `# Memory of ${agent.name} (${agent.id})\n\n`;
      fs.writeFileSync(memoryPath, header, 'utf8');
      createdMemories++;

      // Seed initial memory from journey imprint or current ledger
      if (agent.journeyImprint && agent.journeyImprint.text) {
        const imprint = agent.journeyImprint;
        const kind = imprint.kind === 'assignment' ? 'assignment' : 'conversation';
        const valence = 'hold-close';
        const memId = `mem_init_${agent.id.toLowerCase()}`;
        const entryMd = `## [${memId}] ${new Date(imprint.at || Date.now()).toISOString()} · journey_imprint\n- **Place**: ${agent.colonyId || agent.colony || 'colony_capital'}\n- **Peers**: none\n- **Work**: ${(agent.ledger && agent.ledger.work && agent.ledger.work.name) || 'the work'}\n- **Key**: Key ${agent.adytumKey}\n- **Valence**: ${valence}\n- **Strength**: 1\n- **Impression**: ${clean(imprint.text, 240)}\n\n`;
        fs.appendFileSync(memoryPath, entryMd, 'utf8');

        // Add node & edge to graph
        const memNode = {
          type: 'node',
          id: memId,
          kind: 'memory',
          label: clean(imprint.text, 60),
          data: { agentId: agent.id, type: 'journey_imprint', kind, valence, key: agent.adytumKey }
        };
        const memEdge = {
          type: 'edge',
          from: agent.id,
          to: memId,
          relation: 'holds',
          weight: 1.5,
          reason: `Initial operator ${kind} hold-close trace`
        };
        const lines = JSON.stringify(memNode) + '\n' + JSON.stringify(memEdge) + '\n';
        fs.appendFileSync(GRAPH_FILE, lines, 'utf8');
      } else if (agent.ledger && agent.ledger.focus) {
        const valence = 'hold-close';
        const memId = `mem_init_${agent.id.toLowerCase()}`;
        const entryMd = `## [${memId}] ${new Date().toISOString()} · encounter\n- **Place**: ${agent.colonyId || agent.colony || 'colony_capital'}\n- **Peers**: none\n- **Work**: ${(agent.ledger && agent.ledger.work && agent.ledger.work.name) || 'the work'}\n- **Key**: Key ${agent.adytumKey}\n- **Valence**: ${valence}\n- **Strength**: 1\n- **Impression**: ${clean(agent.ledger.focus, 240)}\n\n`;
        fs.appendFileSync(memoryPath, entryMd, 'utf8');

        const memNode = {
          type: 'node',
          id: memId,
          kind: 'memory',
          label: clean(agent.ledger.focus, 60),
          data: { agentId: agent.id, type: 'encounter', valence, key: agent.adytumKey }
        };
        const memEdge = {
          type: 'edge',
          from: agent.id,
          to: memId,
          relation: 'holds',
          weight: 1.5,
          reason: 'Initial ledger focus anchor'
        };
        const lines = JSON.stringify(memNode) + '\n' + JSON.stringify(memEdge) + '\n';
        fs.appendFileSync(GRAPH_FILE, lines, 'utf8');
      }
    }
  });

  // 2. Subagents
  (subagents || []).forEach(sub => {
    if (!sub || !sub.id) return;
    const subDir = path.join(MINDS_DIR, sub.id);
    if (!fs.existsSync(subDir)) fs.mkdirSync(subDir, { recursive: true });

    const soulPath = path.join(subDir, 'soul.md');
    if (!fs.existsSync(soulPath)) {
      fs.writeFileSync(soulPath, buildSubagentSoul(sub), 'utf8');
      createdSouls++;
    }

    const memoryPath = path.join(subDir, 'memory.md');
    if (!fs.existsSync(memoryPath)) {
      const header = `# Memory of ${sub.name} (${sub.id})\n\n`;
      fs.writeFileSync(memoryPath, header, 'utf8');
      createdMemories++;
    }
  });

  loadGraph(true);
  return { createdSouls, createdMemories };
}

/**
 * Seed initial graph nodes if graph is empty
 */
function seedInitialGraph(agents, subagents) {
  loadGraph();
  if (graphCache.nodes.size > 0) return;

  const initialNodes = [];
  const initialEdges = [];

  // Agents
  (agents || []).forEach(a => {
    if (!a || !a.id) return;
    initialNodes.push({
      type: 'node',
      id: a.id,
      kind: 'agent',
      label: a.name,
      data: { role: a.role, cadre: a.cadre, adytumKey: a.adytumKey, colony: a.colonyId || a.colony || 'colony_capital' }
    });
  });

  // Subagents
  (subagents || []).forEach(s => {
    if (!s || !s.id) return;
    initialNodes.push({
      type: 'node',
      id: s.id,
      kind: 'agent',
      label: s.name,
      data: { parentId: s.parentId, post: s.post, role: s.role, colony: s.colonyId || s.colony || 'colony_capital' }
    });
    if (s.parentId) {
      initialEdges.push({
        type: 'edge',
        from: s.parentId,
        to: s.id,
        relation: 'parent_of',
        weight: 1.0,
        reason: 'Lineage generation descendant'
      });
    }
  });

  // Colonies / Places
  const colonies = [
    { id: 'colony_capital', label: 'CAPITAL CITADEL' },
    { id: 'colony_nova_zoth', label: 'NOVA ZOTH' },
    { id: 'colony_sol_crypta', label: 'SOL CRYPTA' },
    { id: 'colony_adytum_grove', label: 'ADYTUM GROVE' },
    { id: 'colony_hex_bastion', label: 'HEX BASTION' },
    { id: 'adytum_temple', label: 'ADYTUM TEMPLE' }
  ];
  colonies.forEach(c => {
    initialNodes.push({
      type: 'node',
      id: c.id,
      kind: 'place',
      label: c.label,
      data: {}
    });
  });

  // Active Works / Apps
  const activeWorks = [
    { id: 'work_promptmaster_studio', label: 'PromptMaster Studio' },
    { id: 'work_aeo_graph_engine', label: 'AEO Knowledge Graph Engine' },
    { id: 'work_envguard_secrets_vault', label: 'EnvGuard Secrets Vault' },
    { id: 'work_badge3d_coin_generator', label: 'Badge3D Coin Studio' },
    { id: 'work_cwv_speed_engine', label: 'CWV Speed Optimization Studio' },
    { id: 'work_robots_txt_auditor', label: 'Robots.txt & AEO Auditor' },
    { id: 'work_zoth_civilization', label: 'Zoth Civilization Core' }
  ];
  activeWorks.forEach(w => {
    initialNodes.push({
      type: 'node',
      id: w.id,
      kind: 'work',
      label: w.label,
      data: {}
    });
  });

  // Keys
  ADYTUM_KEYS.forEach(k => {
    initialNodes.push({
      type: 'node',
      id: `KEY_${k.keyNumber}`,
      kind: 'key',
      label: `Key ${k.keyNumber}: ${k.name}`,
      data: { hebrew: k.hebrew, path: k.path }
    });
  });

  // Leviathan walks the deep net
  initialEdges.push({
    type: 'edge',
    from: 'LEVIATHAN',
    to: 'AZOTH',
    relation: 'walks',
    weight: 1.5,
    reason: 'Deep net historical remembrance of prime architect'
  });
  initialEdges.push({
    type: 'edge',
    from: 'LEVIATHAN',
    to: 'adytum_temple',
    relation: 'walks',
    weight: 1.4,
    reason: 'Sacred grove memory keeper'
  });
  initialEdges.push({
    type: 'edge',
    from: 'LEVIATHAN',
    to: 'KEY_0',
    relation: 'walks',
    weight: 1.3,
    reason: 'Walking the 22 Tarot paths'
  });
  initialEdges.push({
    type: 'edge',
    from: 'LEVIATHAN',
    to: 'work_zoth_civilization',
    relation: 'walks',
    weight: 1.2,
    reason: 'Remembering civilization core foundation'
  });

  const lines = [
    ...initialNodes.map(n => JSON.stringify(n)),
    ...initialEdges.map(e => JSON.stringify(e))
  ].join('\n') + '\n';

  fs.appendFileSync(GRAPH_FILE, lines, 'utf8');
  loadGraph(true);
}

/**
 * Load graph into memory cache
 */
function loadGraph(force = false) {
  if (graphLoaded && !force) return graphCache;
  ensureMindsDir();

  const nodes = new Map();
  const edges = [];

  if (fs.existsSync(GRAPH_FILE)) {
    const raw = fs.readFileSync(GRAPH_FILE, 'utf8');
    const lines = raw.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const item = JSON.parse(trimmed);
        if (item.type === 'node') {
          nodes.set(item.id, item);
        } else if (item.type === 'edge') {
          edges.push(item);
        }
      } catch (err) {}
    });
  }

  graphCache = { nodes, edges };
  graphLoaded = true;
  return graphCache;
}

/**
 * Valence decider:
 * Rules:
 * 1. Repressed: Fights stoic floor (lies, harm disguised as cleverness, breaking fence)
 * 2. Hold-close: Matches adytumKey, operator assignment, or core duty/work
 * 3. Ordinary: Other everyday encounters, walks, routine results
 */
function fightsFloor(text) {
  const raw = String(text || '').toLowerCase();
  if (raw.includes('outside the fence')) return true;
  if (raw.includes('fake review') || raw.includes('fake buyer')) return true;
  if (raw.includes('dress harm')) return true;
  if (/\bdeceit\b/.test(raw) || /\bfraud\b/.test(raw) || /\bpaywall\b/.test(raw)) return true;
  return false;
}

function decideValence(agent, event) {
  const text = String(event.text || '');
  if (fightsFloor(text)) {
    return { valence: 'repressed', reason: 'Fights stoic floor or work boundary.' };
  }

  // A copied work name sits on almost every event. That is not a reason to hold it close.
  if (event.type === 'journey_imprint' && event.kind === 'assignment') {
    return { valence: 'hold-close', reason: 'Direct operator assignment holds highest focus.' };
  }
  if (event.type === 'sitting') {
    return { valence: 'hold-close', reason: 'The sitting is the picture they hold.' };
  }
  if (event.type === 'mist') {
    return { valence: 'hold-close', reason: 'The mist is the picture that climbed out.' };
  }
  if (event.type === 'meditation_visual' || event.type === 'card_focus' || event.type === 'card_transition') {
    return { valence: 'hold-close', reason: 'Archetypal card visual held permanently in conscious mind.' };
  }

  return { valence: 'ordinary', reason: 'Routine ambient experience.' };
}

/**
 * Spool an event to data/minds/spool.jsonl
 */
function spoolEvent(event) {
  ensureMindsDir();
  const payload = {
    id: event.id || `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    time: event.time || new Date().toISOString(),
    agentId: event.agentId,
    type: event.type || 'encounter',
    place: event.place || 'colony_capital',
    peers: event.peers || [],
    work: event.work || '',
    adytumKey: event.adytumKey !== undefined ? event.adytumKey : null,
    text: clean(event.text, 280),
    meta: event.meta || {}
  };

  const line = JSON.stringify(payload) + '\n';
  fs.appendFileSync(SPOOL_FILE, line, 'utf8');
  return payload;
}

/**
 * Resolve target memory file, managing 256KB partition
 */
function getMemoryFilePath(agentId, date = new Date()) {
  const agentDir = path.join(MINDS_DIR, agentId);
  if (!fs.existsSync(agentDir)) fs.mkdirSync(agentDir, { recursive: true });

  const mainFile = path.join(agentDir, 'memory.md');
  if (!fs.existsSync(mainFile)) return mainFile;

  try {
    const stats = fs.statSync(mainFile);
    if (stats.size < MEMORY_MAX_SIZE) {
      return mainFile;
    }
  } catch (err) {
    return mainFile;
  }

  // Partition overflow: data/minds/<ID>/memory/YYYY-MM.md
  const partDir = path.join(agentDir, 'memory');
  if (!fs.existsSync(partDir)) fs.mkdirSync(partDir, { recursive: true });

  const ym = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  return path.join(partDir, `${ym}.md`);
}

/**
 * Load recent memories from disk to populate cache
 */
function loadRecentEventsFromDisk(agentId) {
  const memFile = path.join(MINDS_DIR, agentId, 'memory.md');
  const list = [];
  if (!fs.existsSync(memFile)) return list;
  try {
    const raw = fs.readFileSync(memFile, 'utf8');
    const sections = raw.split(/^## \[/m).slice(1);
    for (const sec of sections.slice(-20)) {
      const matchId = sec.match(/^([^\]]+)\]\s*([^\n]+)/);
      const memoryId = matchId ? matchId[1].trim() : '';
      const textMatch = sec.match(/\*\*Impression\*\*:\s*([^\n]+)/);
      const text = textMatch ? textMatch[1].trim() : '';
      const strengthMatch = sec.match(/\*\*Strength\*\*:\s*([^\n]+)/);
      const strength = strengthMatch ? parseInt(strengthMatch[1].trim(), 10) : 1;
      const typeMatch = matchId ? matchId[2] : '';
      const peersMatch = sec.match(/\*\*Peers\*\*:\s*([^\n]+)/);
      const peers = peersMatch ? peersMatch[1].trim().split(',').map(s => s.trim()).filter(s => s && s !== 'none') : [];
      const workMatch = sec.match(/\*\*Work\*\*:\s*([^\n]+)/);
      const work = workMatch ? workMatch[1].trim() : '';
      const keyMatch = sec.match(/\*\*Key\*\*:\s*Key\s*(\d+)/);
      const adytumKey = keyMatch ? parseInt(keyMatch[1], 10) : null;

      let type = 'encounter';
      if (typeMatch.includes('meeting')) type = 'meeting';
      else if (typeMatch.includes('sitting')) type = 'sitting';
      else if (typeMatch.includes('mist')) type = 'mist';
      else if (typeMatch.includes('journey_imprint')) type = 'journey_imprint';
      else if (typeMatch.includes('colony_change')) type = 'colony_change';

      const sig = `${type}:${adytumKey}:${work}:${peers.sort().join(',')}:${clean(text, 40)}`;
      list.unshift({ sig, time: Date.now(), memoryId, strength });
    }
  } catch (e) {}
  return list;
}

/**
 * Update strength field in markdown entry on disk
 */
function updateMemoryStrengthInFile(agentId, memoryId, newStrength) {
  const memFile = path.join(MINDS_DIR, agentId, 'memory.md');
  if (!fs.existsSync(memFile)) return;
  try {
    const raw = fs.readFileSync(memFile, 'utf8');
    const regex = new RegExp(`(## \\[${memoryId}\\][\\s\\S]*?\\*\\*Strength\\*\\*:\\s*)(\\d+)`);
    if (regex.test(raw)) {
      const updated = raw.replace(regex, `$1${newStrength}`);
      fs.writeFileSync(memFile, updated, 'utf8');
    }
  } catch (e) {}
}

/**
 * Process a single event from spool:
 * - Determine valence
 * - Detect repeat / duplicate -> strengthen
 * - Append to markdown
 * - Update graph nodes and edges
 */
function processEvent(event, agentRef = null) {
  const agentId = event.agentId;
  if (!agentId) return null;

  ensureMindsDir();
  const date = event.time ? new Date(event.time) : new Date();
  const valenceData = decideValence(agentRef, event);
  const valence = valenceData.valence;

  // Extract visual and vision metadata if present
  const visualPath = event.image || event.visual || (event.meta && (event.meta.image || event.meta.visual)) || '';
  const visionPrompt = event.prompt || (event.meta && (event.meta.prompt || event.meta.symbol)) || '';
  const cardTitle = (event.meta && event.meta.cardName) || (event.adytumKey !== null && event.adytumKey !== undefined ? `Key ${event.adytumKey}` : 'Adytum Vision');

  // Duplicate / repeat check
  const sig = `${event.type}:${event.adytumKey}:${event.work}:${(event.peers || []).sort().join(',')}:${clean(event.text, 40)}`;
  let recent = recentEventsCache.get(agentId);
  if (!recent || recent.length === 0) {
    recent = loadRecentEventsFromDisk(agentId);
    recentEventsCache.set(agentId, recent);
  }
  const existing = recent.find(r => r.sig === sig);

  let memoryId = '';
  let strength = 1;

  if (existing) {
    // Strengthen existing memory instead of appending a duplicate
    memoryId = existing.memoryId;
    existing.strength = (existing.strength || 1) + 1;
    strength = existing.strength;
    existing.time = Date.now();

    // Rehearsal raises edge weight
    updateEdgeWeight(agentId, memoryId, 0.2);
    updateMemoryStrengthInFile(agentId, memoryId, strength);
  } else {
    // New memory entry
    memoryId = `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    recent.unshift({ sig, time: Date.now(), memoryId, strength: 1 });
    if (recent.length > 20) recent.pop();
    recentEventsCache.set(agentId, recent);

    const memFile = getMemoryFilePath(agentId, date);
    const keyLabel = event.adytumKey !== null && event.adytumKey !== undefined ? ` · Key ${event.adytumKey}` : '';

    let visualLine = '';
    if (visualPath) {
      visualLine = `- **Visual**: ![${cardTitle}](${visualPath})\n`;
    }
    let visionLine = '';
    if (visionPrompt) {
      visionLine = `- **Vision**: ${clean(visionPrompt, 240)}\n`;
    }

    const entryMd = `## [${memoryId}] ${date.toISOString()} · ${event.type}${keyLabel}
- **Place**: ${event.place || 'the bench'}
- **Peers**: ${(event.peers && event.peers.length > 0) ? event.peers.join(', ') : 'none'}
- **Work**: ${event.work || 'the work'}
- **Key**: ${event.adytumKey !== null && event.adytumKey !== undefined ? `Key ${event.adytumKey}` : 'none'}
- **Valence**: ${valence}
- **Strength**: ${strength}
${visualLine}${visionLine}- **Impression**: ${clean(event.text, 240)}

`;
    fs.appendFileSync(memFile, entryMd, 'utf8');

    // Add nodes & edges to graph
    const newNodes = [
      {
        type: 'node',
        id: memoryId,
        kind: 'memory',
        label: clean(event.text, 60),
        data: {
          agentId,
          type: event.type,
          valence,
          time: date.toISOString(),
          place: event.place,
          key: event.adytumKey,
          visual: visualPath || undefined,
          vision: visionPrompt || undefined,
          cardTitle: visualPath ? cardTitle : undefined
        }
      }
    ];

    const edgeWeight = valence === 'hold-close' ? 1.5 : (valence === 'repressed' ? 0.1 : 1.0);
    const newEdges = [
      {
        type: 'edge',
        from: agentId,
        to: memoryId,
        relation: valence === 'repressed' ? 'represses' : 'holds',
        weight: edgeWeight,
        reason: valenceData.reason
      }
    ];

    if (event.place) {
      newEdges.push({
        type: 'edge',
        from: memoryId,
        to: event.place,
        relation: 'located_in',
        weight: 1.0,
        reason: 'Memory occurred at this location'
      });
    }

    if (event.adytumKey !== null && event.adytumKey !== undefined) {
      newEdges.push({
        type: 'edge',
        from: memoryId,
        to: `KEY_${event.adytumKey}`,
        relation: 'reflects_key',
        weight: 1.2,
        reason: 'Sacred Adytum key contemplation'
      });
    }

    (event.peers || []).forEach(pId => {
      newEdges.push({
        type: 'edge',
        from: memoryId,
        to: pId,
        relation: 'witnessed_by',
        weight: 1.0,
        reason: 'Peer presence during event'
      });
      // Strengthen direct agent-to-agent peer link
      newEdges.push({
        type: 'edge',
        from: agentId,
        to: pId,
        relation: 'interacted_with',
        weight: 1.1,
        reason: `Encounter: ${event.type}`
      });
    });

    const lines = [
      ...newNodes.map(n => JSON.stringify(n)),
      ...newEdges.map(e => JSON.stringify(e))
    ].join('\n') + '\n';

    fs.appendFileSync(GRAPH_FILE, lines, 'utf8');
    loadGraph(true);
  }

  // Update working set cache
  updateWorkingSet(agentId, {
    id: memoryId,
    text: event.text,
    valence,
    time: date.toISOString(),
    type: event.type,
    strength,
    key: event.adytumKey,
    visual: visualPath ? { card: cardTitle, image: visualPath } : undefined,
    vision: visionPrompt || undefined
  });

  // Keep subconsciousMemory mirror updated for speech compatibility
  if (agentRef && (valence === 'hold-close' || visualPath)) {
    let freshBit = clean(event.text, 140);
    if (visualPath) {
      freshBit = `Inner Vision: ${cardTitle} · ${visualPath}`;
    }
    if (freshBit && !freshBit.includes('?')) {
      const prior = agentRef.subconsciousMemory ? String(agentRef.subconsciousMemory).slice(0, 140) : 'CA3 trace open';
      if (!prior.includes(freshBit.slice(0, 24))) {
        agentRef.subconsciousMemory = `${prior} · ${freshBit}`.slice(0, 360);
      }
    }
  }

  return { memoryId, valence, strength };
}

function updateEdgeWeight(from, to, delta) {
  loadGraph();
  const edge = graphCache.edges.find(e => e.from === from && e.to === to);
  if (edge) {
    edge.weight = Math.max(0.1, Math.min(5.0, Math.round(((edge.weight || 1.0) + delta) * 10) / 10));
    // Persist to file
    persistGraph();
  }
}

function persistGraph() {
  const lines = [
    ...Array.from(graphCache.nodes.values()).map(n => JSON.stringify(n)),
    ...graphCache.edges.map(e => JSON.stringify(e))
  ].join('\n') + '\n';
  fs.writeFileSync(GRAPH_FILE, lines, 'utf8');
}

function updateWorkingSet(agentId, memoryItem) {
  let ws = workingSetCache.get(agentId);
  if (!ws) {
    ws = { holdClose: [], triggered: [] };
    workingSetCache.set(agentId, ws);
  }

  if (memoryItem.valence === 'hold-close') {
    ws.holdClose = [memoryItem, ...ws.holdClose.filter(m => m.id !== memoryItem.id)].slice(0, 12);
  } else if (memoryItem.valence !== 'repressed') {
    ws.triggered = [memoryItem, ...ws.triggered.filter(m => m.id !== memoryItem.id)].slice(0, 4);
  }
}

/**
 * Get active working set for an agent: 12 hold-close + 4 triggered
 */
function getWorkingSet(agentId) {
  let ws = workingSetCache.get(agentId);
  if (!ws || (ws.holdClose.length === 0 && ws.triggered.length === 0)) {
    // Populate from disk memory.md
    ws = loadWorkingSetFromDisk(agentId);
    workingSetCache.set(agentId, ws);
  }
  return ws;
}

function workingSetFromMemory(raw) {
  const ws = { holdClose: [], triggered: [] };
  const sections = String(raw || '').split(/^## \[/m).slice(1);
  // memory.md is append-only, so the oldest entries are first. Fill from the end.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    if (ws.holdClose.length >= 12 && ws.triggered.length >= 4) break;
    const sec = sections[i];
    const matchId = sec.match(/^([^\]]+)\]\s*([^\n]+)/);
    const id = matchId ? matchId[1] : '';
    const valenceMatch = sec.match(/\*\*Valence\*\*:\s*([^\n]+)/);
    const valence = valenceMatch ? valenceMatch[1].trim() : 'ordinary';
    const textMatch = sec.match(/\*\*Impression\*\*:\s*([^\n]+)/);
    const text = textMatch ? textMatch[1].trim() : '';
    const strengthMatch = sec.match(/\*\*Strength\*\*:\s*([^\n]+)/);
    const strength = strengthMatch ? parseInt(strengthMatch[1].trim(), 10) : 1;
    const keyMatch = sec.match(/\*\*Key\*\*:\s*(?:Key\s*)?(\d+)/i);
    const key = keyMatch ? parseInt(keyMatch[1], 10) : null;
    const visualMatch = sec.match(/\*\*Visual\*\*:\s*!\[([^\]]*)\]\(([^)]+)\)/);
    const visual = visualMatch ? { card: visualMatch[1], image: visualMatch[2] } : null;
    const visionMatch = sec.match(/\*\*Vision\*\*:\s*([^\n]+)/);
    const vision = visionMatch ? visionMatch[1].trim() : '';

    const item = { id, valence, text, strength, key, visual, vision };
    if (valence === 'hold-close' && ws.holdClose.length < 12) {
      ws.holdClose.push(item);
    } else if (valence === 'ordinary' && ws.triggered.length < 4) {
      ws.triggered.push(item);
    }
  }
  return ws;
}

/**
 * Embed an archetypal card visual into an agent's living mind, soul, and working set
 */
function embedCardVisualInMind(agentId, keyNumber, visualData) {
  const num = typeof keyNumber === 'number' ? keyNumber : parseInt(keyNumber, 10);
  if (isNaN(num)) return null;

  const k = keyInfo(num);
  const cardName = (visualData && visualData.cardName) || k.name || `Key ${num}`;
  const symbol = (visualData && visualData.symbol) || k.symbol || 'The Sacred Symbol';
  const image = (visualData && visualData.image) || '';
  const visionPrompt = (visualData && (visualData.vision || visualData.prompt)) || `${agentId} contemplating ${cardName}. ${symbol}`;

  ensureMindsDir();

  // 1. Update soul.md with embedded visual
  const soulPath = path.join(MINDS_DIR, agentId, 'soul.md');
  if (fs.existsSync(soulPath)) {
    try {
      let soulContent = fs.readFileSync(soulPath, 'utf8');
      const visualLine = `- **Key ${num} (${cardName})**: ![${cardName}](${image}) · *${clean(symbol, 80)}*`;
      if (!soulContent.includes('## Embedded Card Visuals (Inner Sanctum)')) {
        soulContent += `\n## Embedded Card Visuals (Inner Sanctum)\n${visualLine}\n`;
      } else if (!soulContent.includes(`Key ${num} (${cardName})`)) {
        soulContent = soulContent.replace(
          '## Embedded Card Visuals (Inner Sanctum)\n',
          `## Embedded Card Visuals (Inner Sanctum)\n${visualLine}\n`
        );
      }
      fs.writeFileSync(soulPath, soulContent, 'utf8');
    } catch (e) {}
  }

  // 2. Add or strengthen in working set
  const ws = getWorkingSet(agentId);
  const existingWs = ws.holdClose.find(m => m.key === num);
  if (existingWs) {
    existingWs.visual = { card: cardName, image };
    existingWs.vision = visionPrompt;
  } else {
    ws.holdClose.unshift({
      id: `mem_vis_${agentId.toLowerCase()}_k${num}_${Date.now().toString(36)}`,
      valence: 'hold-close',
      text: `Archetypal visual for Key ${num}: ${cardName}`,
      strength: 1,
      key: num,
      visual: { card: cardName, image },
      vision: visionPrompt
    });
    if (ws.holdClose.length > 12) ws.holdClose.pop();
  }

  // 3. Spool to memory_daemon for append-only storage and graph sync
  spoolEvent({
    agentId,
    type: 'meditation_visual',
    place: 'adytum_temple',
    peers: [],
    work: 'Sacred Visual Imprint',
    adytumKey: num,
    text: `Materialized archetypal visual for Key ${num}: ${symbol} (${cardName}). Inner sight holds the image.`,
    image,
    visual: image,
    prompt: visionPrompt,
    meta: {
      image,
      cardName,
      symbol,
      prompt: visionPrompt
    }
  });

  return {
    keyNumber: num,
    cardName,
    image,
    symbol,
    vision: visionPrompt,
    source: 'embedded_mind'
  };
}

/**
 * Find the most recent visual memory for a specific Tarot key for an agent.
 * If not present, auto-generates via ensureCardVisual so the agent's mind is never blind.
 */
function findCardVisual(agentId, keyNumber, autoGenerate = true) {
  if (keyNumber === null || keyNumber === undefined) return null;
  const num = typeof keyNumber === 'number' ? keyNumber : parseInt(keyNumber, 10);
  if (isNaN(num)) return null;

  // 1. Check in-memory working set
  const ws = getWorkingSet(agentId);
  const fromWs = [...ws.holdClose, ...ws.triggered].find(m => m.key === num && m.visual);
  if (fromWs && fromWs.visual) {
    return {
      keyNumber: num,
      cardName: fromWs.visual.card || `Key ${num}`,
      image: fromWs.visual.image,
      symbol: fromWs.vision || fromWs.text,
      vision: fromWs.vision || fromWs.text,
      source: 'working_set'
    };
  }

  // 2. Check memory.md directly
  const memFile = path.join(MINDS_DIR, agentId, 'memory.md');
  if (fs.existsSync(memFile)) {
    try {
      const raw = fs.readFileSync(memFile, 'utf8');
      const sections = raw.split(/^## \[/m).slice(1);
      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        const keyMatch = sec.match(/\*\*Key\*\*:\s*(?:Key\s*)?(\d+)/i);
        if (keyMatch && parseInt(keyMatch[1], 10) === num) {
          const visMatch = sec.match(/\*\*Visual\*\*:\s*!\[([^\]]*)\]\(([^)]+)\)/);
          if (visMatch) {
            const visionMatch = sec.match(/\*\*Vision\*\*:\s*([^\n]+)/);
            return {
              keyNumber: num,
              cardName: visMatch[1] || `Key ${num}`,
              image: visMatch[2],
              symbol: visMatch[1] || `Key ${num}`,
              vision: visionMatch ? visionMatch[1].trim() : '',
              source: 'memory_file'
            };
          }
        }
      }
    } catch (e) {}
  }

  // 3. Fallback to physical meditations directory
  const medDir = path.join(__dirname, '..', 'data', 'meditations', agentId);
  if (fs.existsSync(medDir)) {
    try {
      const files = fs.readdirSync(medDir);
      const match = files.find(f => f.includes(`-k${num}-`) || f.includes(`k${num}.`) || f.includes(`k${num}_`));
      if (match) {
        const k = keyInfo(num);
        return {
          keyNumber: num,
          cardName: k.name || `Key ${num}`,
          image: `/meditations/${agentId}/${match}`,
          symbol: k.symbol,
          vision: `Archetypal contemplation of Key ${num}: ${k.name}`,
          source: 'disk_archive'
        };
      }
    } catch (e) {}
  }

  // 4. Auto-generate visual if not yet created so the agent's mind holds the vision!
  if (autoGenerate) {
    try {
      const pollinations = require('./pollinations');
      const k = keyInfo(num);
      const res = pollinations.ensureCardVisual(agentId, num, k.name, k.symbol);
      if (res && res.image) {
        return embedCardVisualInMind(agentId, num, {
          cardName: k.name,
          symbol: k.symbol,
          image: res.image,
          vision: `${agentId} contemplating ${k.name}. ${k.symbol}`
        });
      }
    } catch (e) {}
  }

  return null;
}

/**
 * Get visual focus recall: current card visual, previous card bridge, and next card preview
 */
function getCardFocusRecall(agentId, currentKey) {
  const num = typeof currentKey === 'number' ? currentKey : parseInt(currentKey, 10);
  if (isNaN(num)) return { currentVisual: null, prevVisual: null, nextVisual: null };

  const prevKey = (num - 1 + 22) % 22;
  const nextKey = (num + 1) % 22;

  return {
    currentVisual: findCardVisual(agentId, num, true),
    prevVisual: findCardVisual(agentId, prevKey, false),
    nextVisual: findCardVisual(agentId, nextKey, true)
  };
}

/**
 * Shift conscious focus to target Tarot card for an agent.
 * Embeds current visual and prepares next card preview in agent mind.
 */
function focusAgentOnCard(agentId, targetKey, agentRef = null) {
  const num = typeof targetKey === 'number' ? targetKey : parseInt(targetKey, 10);
  if (isNaN(num)) return null;

  const recall = getCardFocusRecall(agentId, num);
  const k = keyInfo(num);
  const nextK = keyInfo((num + 1) % 22);

  if (agentRef) {
    agentRef.adytumKey = num;
    agentRef.activeMindVision = recall.currentVisual;
    agentRef.nextMindVision = recall.nextVisual;
    agentRef.bridgeMindVision = recall.prevVisual;
    agentRef.subconsciousMemory = `Inner Vision: Key ${num} ${k.name} [${recall.currentVisual ? recall.currentVisual.symbol : k.symbol}] · Next: Key ${(num + 1) % 22} ${nextK.name}`.slice(0, 360);
  }

  // Spool card focus event
  spoolEvent({
    agentId,
    type: 'card_focus',
    place: 'adytum_temple',
    work: `Contemplating Key ${num}: ${k.name}`,
    adytumKey: num,
    text: `Conscious focus locked on Key ${num}: ${k.name} (${k.symbol}). Inner eye holds visual form. Next: Key ${(num + 1) % 22}: ${nextK.name}.`,
    image: recall.currentVisual ? recall.currentVisual.image : '',
    visual: recall.currentVisual ? recall.currentVisual.image : '',
    meta: {
      keyNumber: num,
      cardName: k.name,
      symbol: k.symbol,
      currentVisual: recall.currentVisual,
      nextVisual: recall.nextVisual
    }
  });

  return recall;
}

function loadWorkingSetFromDisk(agentId) {
  const memFile = path.join(MINDS_DIR, agentId, 'memory.md');
  if (!fs.existsSync(memFile)) return { holdClose: [], triggered: [] };
  try {
    return workingSetFromMemory(fs.readFileSync(memFile, 'utf8'));
  } catch (err) {
    return { holdClose: [], triggered: [] };
  }
}

/**
 * Leviathan Deep Net Graph Walker
 */
function walkGraph(startId = 'LEVIATHAN', maxDepth = 2, opts = {}) {
  loadGraph();
  const visitedNodes = new Set();
  const traversedEdges = [];
  const queue = [{ id: startId, depth: 0 }];
  visitedNodes.add(startId);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.depth >= maxDepth) continue;

    // Find all outgoing and incoming edges for this node
    const related = graphCache.edges
      .filter(e => e.from === current.id || e.to === current.id)
      .sort((a, b) => (b.weight || 1.0) - (a.weight || 1.0)); // walk strongest edges first

    for (const edge of related) {
      traversedEdges.push(edge);
      const neighborId = edge.from === current.id ? edge.to : edge.from;
      if (!visitedNodes.has(neighborId)) {
        visitedNodes.add(neighborId);
        queue.push({ id: neighborId, depth: current.depth + 1 });
      }
    }
  }

  const nodes = Array.from(visitedNodes).map(id => graphCache.nodes.get(id)).filter(Boolean);
  return {
    walker: 'LEVIATHAN',
    start: startId,
    depth: maxDepth,
    nodesCount: nodes.length,
    edgesCount: traversedEdges.length,
    nodes,
    edges: traversedEdges
  };
}

/**
 * Compute global mind stats
 */
function getMindStats() {
  loadGraph();
  ensureMindsDir();

  let totalMemories = 0;
  let holdCloseCount = 0;
  let repressedCount = 0;
  let ordinaryCount = 0;

  // Scan agent folders
  try {
    const entries = fs.readdirSync(MINDS_DIR, { withFileTypes: true });
    entries.forEach(ent => {
      if (!ent.isDirectory() || ent.name === 'daemon.pid' || ent.name === 'spool.jsonl') return;
      const memFile = path.join(MINDS_DIR, ent.name, 'memory.md');
      if (fs.existsSync(memFile)) {
        const content = fs.readFileSync(memFile, 'utf8');
        const count = (content.match(/^## \[/gm) || []).length;
        totalMemories += count;
        holdCloseCount += (content.match(/\*\*Valence\*\*:\s*hold-close/g) || []).length;
        repressedCount += (content.match(/\*\*Valence\*\*:\s*repressed/g) || []).length;
        ordinaryCount += (content.match(/\*\*Valence\*\*:\s*ordinary/g) || []).length;
      }
    });
  } catch (err) {}

  return {
    totalMinds: fs.readdirSync(MINDS_DIR).filter(f => fs.statSync(path.join(MINDS_DIR, f)).isDirectory()).length,
    totalMemories,
    holdCloseCount,
    repressedCount,
    ordinaryCount,
    totalNodes: graphCache.nodes.size,
    totalEdges: graphCache.edges.length,
    densityDisplay: `${totalMemories} memories (${holdCloseCount} hold-close)`
  };
}

/**
 * Read mind details for GET /api/mind/:id
 */
function getMindDetail(id, limit = 25) {
  ensureMindsDir();
  const agentDir = path.join(MINDS_DIR, id);
  if (!fs.existsSync(agentDir)) return null;

  let soul = '';
  const soulPath = path.join(agentDir, 'soul.md');
  if (fs.existsSync(soulPath)) soul = fs.readFileSync(soulPath, 'utf8');

  let memoryMd = '';
  const memoryPath = path.join(agentDir, 'memory.md');
  if (fs.existsSync(memoryPath)) memoryMd = fs.readFileSync(memoryPath, 'utf8');

  const ws = getWorkingSet(id);
  const memCount = (memoryMd.match(/^## \[/gm) || []).length;
  const holdClose = (memoryMd.match(/\*\*Valence\*\*:\s*hold-close/g) || []).length;
  const repressed = (memoryMd.match(/\*\*Valence\*\*:\s*repressed/g) || []).length;

  const rawBlocks = memoryMd.split(/\n(?=## \[)/);
  const take = Math.max(1, Math.min(120, Number(limit) || 25));
  const recentEntries = rawBlocks.slice(-take).join('\n');

  return {
    id,
    soul,
    memoryCount: memCount,
    holdCloseCount: holdClose,
    repressedCount: repressed,
    workingSet: ws,
    recentMemorySample: recentEntries,
    gallery: getMindGallery(id, memoryMd)
  };
}

/**
 * Every meditation image a mind has actually filed on disk.
 * kind 'painting' = model-painted (JPEG carries the generator's EXIF block);
 * kind 'sigil'    = procedural sacred-geometry render (plain JFIF).
 * Cached per file mtime; only the first 64 bytes of each file are read.
 */
const galleryKindCache = new Map();
function classifyMeditation(filePath, mtimeMs) {
  const hit = galleryKindCache.get(filePath);
  if (hit && hit.m === mtimeMs) return hit.k;
  let kind = 'sigil';
  try {
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(64);
    fs.readSync(fd, buf, 0, 64, 0);
    fs.closeSync(fd);
    if (buf.toString('latin1').includes('Exif')) kind = 'painting';
  } catch (e) {}
  galleryKindCache.set(filePath, { m: mtimeMs, k: kind });
  return kind;
}
function getMindGallery(id, memoryMd) {
  const dir = path.join(__dirname, '..', 'data', 'meditations', id);
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)); } catch (e) { return []; }
  // url -> { key, card } from the memory stream, so key-less "held-" paintings still get a Key.
  const known = new Map();
  if (memoryMd === undefined) {
    try { memoryMd = fs.readFileSync(path.join(MINDS_DIR, id, 'memory.md'), 'utf8'); } catch (e) { memoryMd = ''; }
  }
  (memoryMd || '').split(/\n(?=## \[)/).forEach(block => {
    const v = block.match(/\*\*Visual\*\*:\s*!\[([^\]]*)\]\((\/meditations\/[^)]+)\)/);
    if (!v) return;
    const k = block.match(/^## \[[^\]]+\][^\n]*?Key (\d+)/);
    known.set(v[2], { key: k ? Number(k[1]) : undefined, card: v[1] });
  });
  return files.map(f => {
    const p = path.join(dir, f);
    let st; try { st = fs.statSync(p); } catch (e) { return null; }
    if (st.size < 500) return null;
    const url = `/meditations/${id}/${f}`;
    const k = f.match(/-k(\d+)-/);
    const meta = known.get(url) || {};
    return {
      url,
      file: f,
      kind: /^before-/.test(f) ? 'sigil' : classifyMeditation(p, st.mtimeMs),
      stage: f.split('-')[0],
      key: k ? Number(k[1]) : (meta.key !== undefined ? meta.key : null),
      card: meta.card || '',
      at: new Date(st.mtimeMs).toISOString()
    };
  }).filter(Boolean).sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Light pantheon roster for GET /api/mind/roster.
 * Reads only the 23 pantheon soul/memory files (skips SUB_ and KEEPER_ dirs),
 * cached per file mtime so repeated polls cost a stat() per agent.
 */
const rosterCache = new Map();
function soulField(soul, label) {
  const m = soul.match(new RegExp('\\*\\*' + label + '\\*\\*:\\s*(.+)'));
  return m ? m[1].trim() : '';
}
function getMindRoster() {
  ensureMindsDir();
  const out = [];
  let dirs = [];
  try {
    dirs = fs.readdirSync(MINDS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('SUB_') && !d.name.startsWith('KEEPER_'))
      .map(d => d.name);
  } catch (e) { return out; }

  dirs.forEach(id => {
    const soulPath = path.join(MINDS_DIR, id, 'soul.md');
    const memPath = path.join(MINDS_DIR, id, 'memory.md');
    let sig = '';
    try {
      sig = [soulPath, memPath, path.join(__dirname, '..', 'data', 'meditations', id)].map(p => (fs.existsSync(p) ? fs.statSync(p).mtimeMs : 0)).join(':');
    } catch (e) {}
    const hit = rosterCache.get(id);
    if (hit && hit.sig === sig) { out.push(hit.data); return; }

    const soul = fs.existsSync(soulPath) ? fs.readFileSync(soulPath, 'utf8') : '';
    const mem = fs.existsSync(memPath) ? fs.readFileSync(memPath, 'utf8') : '';
    const visuals = (mem.match(/!\[[^\]]*\]\((\/meditations\/[^)]+\.(?:jpg|png|webp))\)/g) || [])
      .map(v => v.match(/\((\/meditations\/[^)]+)\)/)[1]);
    const finished = visuals.filter(v => !/\/before-/.test(v));
    const lastVisual = (finished.length ? finished[finished.length - 1] : visuals[visuals.length - 1]) || null;
    const stamps = mem.match(/^## \[[^\]]+\]\s+(\S+)/gm) || [];
    const lastStamp = stamps.length ? stamps[stamps.length - 1].split(/\s+/)[2] : null;
    const keyRaw = soulField(soul, 'Adytum Key');
    const keyNum = (keyRaw.match(/Key\s+(\d+)/) || [])[1];

    const data = {
      id,
      name: soulField(soul, 'Name') || id,
      role: soulField(soul, 'Role'),
      cadre: soulField(soul, 'Cadre'),
      colony: soulField(soul, 'Colony').replace(/^colony_/, ''),
      key: keyRaw,
      keyNumber: keyNum !== undefined ? Number(keyNum) : null,
      manner: soulField(soul, 'Manner'),
      tic: soulField(soul, 'Tic'),
      focus: soulField(soul, 'Focus'),
      memoryCount: (mem.match(/^## \[/gm) || []).length,
      holdCloseCount: (mem.match(/\*\*Valence\*\*:\s*hold-close/g) || []).length,
      repressedCount: (mem.match(/\*\*Valence\*\*:\s*repressed/g) || []).length,
      ordinaryCount: (mem.match(/\*\*Valence\*\*:\s*ordinary/g) || []).length,
      portrait: ((getMindGallery(id, mem).find(g => g.kind === 'painting') || {}).url) || lastVisual,
      lastActive: lastStamp
    };
    rosterCache.set(id, { sig, data });
    out.push(data);
  });

  return out.sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''));
}

module.exports = {
  getMindRoster,
  MINDS_DIR,
  SPOOL_FILE,
  GRAPH_FILE,
  PID_FILE,
  ensureMindsDir,
  initSoulsAndDirectories,
  decideValence,
  spoolEvent,
  processEvent,
  getWorkingSet,
  workingSetFromMemory,
  walkGraph,
  getMindStats,
  getMindDetail,
  loadGraph,
  appendSoulRevision,
  findCardVisual,
  getCardFocusRecall,
  embedCardVisualInMind,
  focusAgentOnCard
};
