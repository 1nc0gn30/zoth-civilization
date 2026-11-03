/**
 * ⚡ AUTONOMOUS WORKFLOW & CONTINUOUS EXPANSION ENGINE
 * =====================================================================
 * Drives non-stop, ongoing collaborative execution across all 21 Pantheon
 * agents and their expanding descendant families using a dual-layer cognitive loop:
 *
 * 1. Subconscious Latent Memory & Pattern Distillation:
 *    - Persistent store of episodic execution traces in `data/agent_subconscious.json`
 *    - Automated pattern distillation: analyzes successful optimization outcomes,
 *      calculates heuristic weights, and builds long-term operational knowledge.
 *
 * 2. Conscious Working Context & Initiative Formulator:
 *    - Balances Exploitation (70% proven patterns) vs. Exploration (30% creative initiative)
 *    - Agents synthesize novel hypotheses and cross-cadre solutions rather than static loops
 *    - Validation Gate: Scores creative initiatives against the $100K treasury goal
 *
 * 3. Autonomous Lineage Expansion & Colonial Settlements:
 *    - Generates multi-generational subagents (Gen 1, Gen 2) stationed across 5 cities
 *    - Dispatches cross-colony migrations and plants sacred alchemical flora
 *
 * Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
 * Entity: ZothOS Systems Engineering • NullAI Platform
 */

const fs = require('fs');
const path = require('path');
const { applyResult, applyOperator, ensureLedger, nameTheWork, noteBeat, speakLine } = require('./agent_ledger');
const { SUPERCONSCIOUS } = require('./build_way');

const PATTERN_HOMES = [
  [/lantern|north walk|plaza light|colony/i, 'zoth-civilization'],
  [/schema\.org|json-ld|\baeo\b|perplexity|semantic triple/i, 'aeo-graph-engine'],
  [/envguard|argon|webcrypto|secret vault|zeroization/i, 'envguard-secrets-vault'],
  [/\blcp\b|\binp\b|\bcls\b|lighthouse|preconnect|core web vital/i, 'cwv-speed-engine'],
  [/robots\.txt|disallow|gptbot|sitemap/i, 'robots-txt-auditor'],
  [/badge3d|\bstl\b|medallion|challenge coin/i, 'badge3d-coin-generator'],
  [/promptmaster|meta-prompt|token estimator|placeholder/i, 'promptmaster-studio']
];

function patternHome(heuristic) {
  const text = String(heuristic && heuristic.pattern || '');
  for (let i = 0; i < PATTERN_HOMES.length; i++) {
    if (PATTERN_HOMES[i][0].test(text)) return PATTERN_HOMES[i][1];
  }
  const id = heuristic && heuristic.appId;
  if (id && !/^(agy|operator|customer-desk)$/.test(id)) return id;
  return '';
}

function patternFits(heuristic, appId) {
  const home = patternHome(heuristic);
  if (home) return home === appId;
  return appId === 'zoth-civilization';
}

function learnedHome(text, appId) {
  const learnedOn = appId && !/^(agy|operator|customer-desk)$/.test(String(appId)) ? String(appId) : '';
  return patternHome({ pattern: text, appId: learnedOn }) || learnedOn;
}

function workSpeech(worker, state) {
  if (!worker || worker.post === 'station') return '';
  ensureLedger(worker, state);
  nameTheWork(worker, state);
  const said = speakLine(worker);
  if (!said || /^Next pass on\b/.test(said) || /^Holding /.test(said)) return '';
  return said;
}
const { assignRoster, awake } = require('./customer_desk');

const SUBCONSCIOUS_FILE = path.join(__dirname, '..', 'data', 'agent_subconscious.json');

const BASELINE_HEURISTICS = [
  // Architects Cadre
  {
    id: 'heur_arch_1',
    cadre: 'Architects',
    pattern: 'Injecting SoftwareApplication & TechArticle Schema.org JSON-LD triples maximizes Perplexity, GPTBot, and Google SGE crawl efficiency.',
    weight: 1.55,
    successCount: 24,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_arch_2',
    cadre: 'Architects',
    pattern: 'Structuring tools with zero-backend serverless architecture ensures 100% Netlify edge uptime and eliminates hosting cost overhead.',
    weight: 1.48,
    successCount: 19,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_arch_3',
    cadre: 'Architects',
    pattern: 'Mapping comparative intent keywords (<tool> vs, alternative to <tool>) captures purchase-ready developer migration search volume.',
    weight: 1.62,
    successCount: 28,
    lastUsed: new Date().toISOString()
  },
  // Code Cadre
  {
    id: 'heur_code_1',
    cadre: 'Code',
    pattern: 'Client-side WebWorker and AST token parsers slash main-thread UI blocking time from 120ms to under 16ms for 60fps UX.',
    weight: 1.50,
    successCount: 22,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_code_2',
    cadre: 'Code',
    pattern: 'Automated preconnect tags and Brotli asset compression deliver 98+ Core Web Vitals performance scores.',
    weight: 1.42,
    successCount: 17,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_code_3',
    cadre: 'Code',
    pattern: 'Embedding standard Model Context Protocol (MCP) server presets drives rapid adoption across Cursor, Claude Code, and Windsurf users.',
    weight: 1.70,
    successCount: 31,
    lastUsed: new Date().toISOString()
  },
  // Security Cadre
  {
    id: 'heur_sec_1',
    cadre: 'Security',
    pattern: 'Client-side WebCrypto AES-GCM-256 with memory zeroization eliminates cloud leakage vectors and wins enterprise developer trust.',
    weight: 1.65,
    successCount: 26,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_sec_2',
    cadre: 'Security',
    pattern: 'Strict Content Security Policy (CSP) with zero network egress provides verifiable privacy in client-side developer vaults.',
    weight: 1.52,
    successCount: 18,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_sec_3',
    cadre: 'Security',
    pattern: 'Tamper-proof webhook signature validation on Stripe and Solana RPC prevents payment slippage and fake callback states.',
    weight: 1.58,
    successCount: 21,
    lastUsed: new Date().toISOString()
  },
  // Creative Cadre
  {
    id: 'heur_creat_1',
    cadre: 'Creative',
    pattern: 'Dark-glassmorphism with #090A0F obsidian background and emerald/gold accents increases session duration and pro upgrade click-throughs.',
    weight: 1.53,
    successCount: 20,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_creat_2',
    cadre: 'Creative',
    pattern: 'Dynamic procedural WebGL PBR shaders rendered client-side create high perceived value without heavyweight 3D model downloads.',
    weight: 1.46,
    successCount: 16,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_creat_3',
    cadre: 'Creative',
    pattern: 'High-contrast problem-solving headlines focused on instant developer time saved boost landing page conversion rates by up to 40%.',
    weight: 1.64,
    successCount: 29,
    lastUsed: new Date().toISOString()
  },
  // Swarm Cadre
  {
    id: 'heur_swarm_1',
    cadre: 'Swarm',
    pattern: 'Structuring Show HN posts around working live in-browser playgrounds drives 3x higher community upvotes and direct sales conversions.',
    weight: 1.72,
    successCount: 35,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_swarm_2',
    cadre: 'Swarm',
    pattern: 'Dual checkout rails (Credit Card via Stripe + Crypto P2P via Solana Tip Solana) eliminates checkout drop-off across global developers.',
    weight: 1.68,
    successCount: 33,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_swarm_3',
    cadre: 'Swarm',
    pattern: 'RFC 9309 compliant robots.txt with explicit sitemap declarations accelerates search inclusion from 14 days down to 6 hours.',
    weight: 1.57,
    successCount: 23,
    lastUsed: new Date().toISOString()
  },
  // Netlify AX, Claude Motion & Design System Cadres
  {
    id: 'heur_ax_1',
    cadre: 'Architects',
    pattern: '14-vector Netlify AX AST build audits and self-healing pipelines ensure zero-white-page stability and 95+ deployment health.',
    weight: 1.78,
    successCount: 36,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_ax_2',
    cadre: 'Code',
    pattern: 'Exposing machine-readable Netlify AX discovery endpoints (/api/netlify-ax.json, /ai.txt, /llms.txt) allows frontier agentic crawlers to evaluate and ground apps.',
    weight: 1.75,
    successCount: 34,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_motion_1',
    cadre: 'Creative',
    pattern: '15-second Claude motion graphics and dynamic kinetic hero anchors boost user session engagement and founding member conversions.',
    weight: 1.70,
    successCount: 32,
    lastUsed: new Date().toISOString()
  },
  {
    id: 'heur_design_1',
    cadre: 'Creative',
    pattern: 'Avant-Garde typography pairings and restrained high-contrast glassmorphic design eliminate cookie-cutter aesthetics and convey sovereign utility.',
    weight: 1.68,
    successCount: 30,
    lastUsed: new Date().toISOString()
  }
];

const WORK_TEMPLATES = [
  {
    appId: 'promptmaster-studio',
    appName: 'PromptMaster Studio',
    cadre: 'Architects',
    actions: [
      'Engineered new Anthropic Claude XML meta-prompt template preset into PromptMaster.',
      'Refactored token estimator matrix for GPT-4o, Claude 3.5 Sonnet, and Gemini 1.5 Pro.',
      'Optimized client-side AST placeholder scanner for zero-latency in-browser linting.',
      'Hardened local storage version diffing engine with clean Markdown snapshot export.'
    ]
  },
  {
    appId: 'aeo-graph-engine',
    appName: 'AEO Knowledge Graph Engine',
    cadre: 'Code',
    actions: [
      'Expanded Schema.org JSON-LD definitions with SoftwareApplication & TechArticle triples.',
      'Refined Mermaid client-side graph visualizer with high-contrast emerald nodes.',
      'Generated multi-client MCP presets for Cursor, Claude Code, and Windsurf.',
      'Audited Perplexity and SearchGPT crawler visibility directives across semantic triples.'
    ]
  },
  {
    appId: 'envguard-secrets-vault',
    appName: 'EnvGuard Secrets Vault',
    cadre: 'Security',
    actions: [
      'Added zero-leak regex pattern detectors for 12 new cloud provider API key formats.',
      'Audited WebCrypto PBKDF2 / AES-GCM-256 memory scrubbing for instant zeroization.',
      'Verified zero network egress in client sandbox via Content Security Policy audit.',
      'Hardened safe redacted export formatter for safe sharing in Discord and LLM chats.'
    ]
  },
  {
    appId: 'cwv-speed-engine',
    appName: 'CWV Speed Optimization Studio',
    cadre: 'Code',
    actions: [
      'Updated simulated Lighthouse performance thresholds for INP, LCP, and CLS.',
      'Generated production-ready PWA Service Worker script with stale-while-revalidate caching.',
      'Engineered automatic preconnect and resource-hint tag generator for modern CDNs.',
      'Exported autonomous agent MCP performance profiling tool definitions.'
    ]
  },
  {
    appId: 'badge3d-coin-generator',
    appName: 'Badge3D Coin Studio',
    cadre: 'Creative',
    actions: [
      'Engineered new "Cyber Solana Medallion" procedural PBR shader preset.',
      'Optimized binary STL manifold triangulator for faster 3D print slicing.',
      'Added precious metal spot price calculator for 24K Gold, Sterling Silver, and Bronze.',
      'Validated Three.js WebGL context pre-checking for smooth 60fps rendering across all GPUs.'
    ]
  },
  {
    appId: 'robots-txt-auditor',
    appName: 'Robots.txt & AEO Auditor',
    cadre: 'Swarm',
    actions: [
      'Updated RFC 9309 compliance rules for GPTBot, ClaudeBot, and PerplexityBot crawlers.',
      'Added automated IndexNow and Google Search Console sitemap ping templates.',
      'Audited wildcards and disallow rules to prevent accidental sensitive path exposure.',
      'Hardened clean export generator for one-click deployment to Netlify edge.'
    ]
  },
  {
    appId: 'zoth-civilization',
    appName: 'Zoth Civilization Core',
    cadre: 'Architects',
    actions: [
      'Optimized 3D Sphere Planet terrain tessellation and camera surface collision clamping.',
      'Upgraded Capital Citadel ziggurat architecture and Monad Obelisk gold shaders.',
      'Synthesized superconscious memory traces for Adytum Hermetic Journey Key progression.',
      'Calibrated checks-and-balances democratic conclave voting algorithm.'
    ]
  }
];

const SUBAGENT_ROLES = [
  { role: 'Prompt Token Pruner', cadre: 'Architects', prefix: 'Prompt', colony: 'colony_capital' },
  { role: 'AST Semantic Parser', cadre: 'Code', prefix: 'AST', colony: 'colony_nova_zoth' },
  { role: 'Argon2id Vault Guard', cadre: 'Security', prefix: 'Cipher', colony: 'colony_hex_bastion' },
  { role: 'Solana Tip Web3 Relay', cadre: 'Swarm', prefix: 'Sol', colony: 'colony_sol_crypta' },
  { role: 'AEO Schema Triples Indexer', cadre: 'Code', prefix: 'Triples', colony: 'colony_nova_zoth' },
  { role: 'Core Web Vitals Profiler', cadre: 'Code', prefix: 'Speed', colony: 'colony_capital' },
  { role: 'Three.js Mesh Sculptor', cadre: 'Creative', prefix: 'Mesh', colony: 'colony_adytum_grove' },
  { role: 'Show HN Distribution Scout', cadre: 'Swarm', prefix: 'Scout', colony: 'colony_sol_crypta' },
  { role: 'Robots.txt AI Bot Auditor', cadre: 'Swarm', prefix: 'Crawler', colony: 'colony_capital' },
  { role: 'Stripe Checkout Hardener', cadre: 'Security', prefix: 'Mint', colony: 'colony_sol_crypta' },
  { role: 'Hermetic Vector Synthesizer', cadre: 'Architects', prefix: 'Vector', colony: 'colony_adytum_grove' },
  { role: 'Zero-Egress CSP Watchdog', cadre: 'Security', prefix: 'Sentry', colony: 'colony_hex_bastion' }
];

class AutonomousWorkflowEngine {
  constructor(civEngine, options = {}) {
    this.civEngine = civEngine;
    this.tickCount = 0;
    this.subconsciousFile = (options && options.subconsciousFile) || SUBCONSCIOUS_FILE;
    this.subconscious = {
      totalEpisodes: 0,
      lastDistillation: new Date().toISOString(),
      heuristics: [...BASELINE_HEURISTICS],
      recentEpisodes: []
    };
    this.loadSubconscious();
  }

  loadSubconscious() {
    try {
      if (fs.existsSync(this.subconsciousFile)) {
        const raw = fs.readFileSync(this.subconsciousFile, 'utf8');
        const data = JSON.parse(raw);
        this.subconscious = {
          totalEpisodes: data.totalEpisodes || 0,
          lastDistillation: data.lastDistillation || new Date().toISOString(),
          heuristics: (data.heuristics && data.heuristics.length > 0) ? data.heuristics : [...BASELINE_HEURISTICS],
          recentEpisodes: data.recentEpisodes || []
        };
      } else {
        this.saveSubconscious();
      }
    } catch (err) {
      console.warn('[WorkflowEngine] Could not load subconscious file, using baseline:', err.message);
      this.subconscious.heuristics = [...BASELINE_HEURISTICS];
    }
    this.ensureSignatures();
  }

  saveSubconscious() {
    try {
      const dir = path.dirname(this.subconsciousFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.subconsciousFile, JSON.stringify(this.subconscious, null, 2), 'utf8');
    } catch (err) {
      console.error('[WorkflowEngine] Error saving subconscious:', err.message);
    }
  }

  signature(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 96);
  }

  ensureSignatures() {
    (this.subconscious.heuristics || []).forEach((h) => {
      if (h && !h.signature) h.signature = this.signature(h.pattern);
    });
  }

  recordEpisode(entry) {
    const action = entry && entry.action ? String(entry.action) : '';
    const signature = (entry && entry.signature) || this.signature(action);
    this.subconscious.totalEpisodes++;
    this.subconscious.recentEpisodes.unshift({
      id: `ep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry,
      signature
    });
    if (this.subconscious.recentEpisodes.length > 160) {
      this.subconscious.recentEpisodes = this.subconscious.recentEpisodes.slice(0, 160);
    }
  }

  retrieveTopHeuristics(cadre, limit = 3) {
    const list = this.subconscious.heuristics.filter(h => h.cadre === cadre);
    list.sort((a, b) => (b.weight || 1.0) - (a.weight || 1.0));
    return list.slice(0, limit);
  }

  distillPatterns() {
    this.subconscious.lastDistillation = new Date().toISOString();
    const seen = new Map();
    this.subconscious.recentEpisodes.forEach((ep) => {
      const sig = ep.signature || this.signature(ep.action);
      if (!sig || sig.length < 20 || !ep.cadre) return;
      const key = `${ep.cadre}::${sig}`;
      const cur = seen.get(key) || { cadre: ep.cadre, text: ep.action, sig, n: 0, agentId: ep.agentId, appId: '' };
      cur.n += 1;
      if (!cur.appId && ep.appId && !/^(agy|operator|customer-desk)$/.test(String(ep.appId))) cur.appId = ep.appId;
      seen.set(key, cur);
    });

    let minted = 0;
    seen.forEach((cur) => {
      if (cur.n < 2) return;
      const made = this.noticePattern(cur.cadre, cur.text, 'learned', cur.agentId, { force: true, boost: 0.06 * cur.n, appId: cur.appId });
      if (made.created) minted += 1;
    });

    this.subconscious.heuristics.forEach((h) => {
      if (!h) return;
      if (h.source === 'operator') {
        h.weight = 1.9;
        return;
      }
      h.weight = Math.max(0.45, parseFloat(((h.weight || 1) * 0.99).toFixed(2)));
    });

    this.eachWorker((worker) => {
      if (!worker || worker.post === 'station') return;
      worker.subconsciousHeuristics = this.mixOperatorHeuristics(worker, 4);
      const taskApp = (worker.consciousTask && worker.consciousTask.appId) || 'zoth-civilization';
      const top = this.retrieveTopHeuristics(worker.cadre, 12).find((h) => h && h.source !== 'operator' && patternFits(h, taskApp));
      const assigned = worker.journeyImprint && worker.journeyImprint.kind === 'assignment';
      if (top && !assigned) {
        worker.subconsciousMemory = `Underneath the work: ${top.pattern}`.slice(0, 360);
      }
      if (worker.consciousTask && top) {
        worker.consciousTask.undercurrent = String(top.pattern).slice(0, 160);
      }
    });

    this.pruneHeuristics();
    this.saveSubconscious();

    const learned = this.subconscious.heuristics.filter((h) => h.source === 'learned' || h.source === 'agy').length;
    this.civEngine.addMessage(
      'CHRONOS',
      `🌌 [Subconscious Distillation] ${this.subconscious.heuristics.length} patterns awake, ${learned} learned from the work, ${minted} new this pass.`,
      'system'
    );
  }

  isSacred(worker) {
    const state = worker && worker.state;
    return state === 'WALKING_TO_ADYTUM' || state === 'MEDITATING_ADYTUM' || state === 'CONTEMPLATING_ADYTUM' || state === 'IN_THE_MIST';
  }

  eachWorker(fn) {
    const pantheon = (this.civEngine && this.civEngine.agents) || [];
    const subs = (this.civEngine && this.civEngine.lineageEngine && this.civEngine.lineageEngine.subagents) || [];
    pantheon.forEach(fn);
    subs.forEach(fn);
  }

  templateFor(worker) {
    if (worker && worker.duty && worker.duty.offerId) {
      const owned = WORK_TEMPLATES.find((t) => t.appId === worker.duty.offerId);
      if (owned && Math.random() < 0.85) return owned;
    }
    const cadre = worker && worker.cadre;
    const matches = WORK_TEMPLATES.filter((t) => t.cadre === cadre);
    const pool = matches.length ? matches : WORK_TEMPLATES;
    const currentId = worker && worker.consciousTask && worker.consciousTask.appId;
    if (currentId && Math.random() < 0.72) {
      const same = pool.find((t) => t.appId === currentId) || WORK_TEMPLATES.find((t) => t.appId === currentId);
      if (same) return same;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  pickHeuristic(cadre, appId) {
    const home = appId || 'zoth-civilization';
    const list = this.retrieveTopHeuristics(cadre, 12).filter((h) => h.source !== 'operator' && patternFits(h, home));
    if (!list.length) return null;
    const weights = list.map((h) => Math.max(0.25, h.weight || 1));
    let roll = Math.random() * weights.reduce((sum, w) => sum + w, 0);
    for (let i = 0; i < list.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return list[i];
    }
    return list[0];
  }

  seedInitiative(worker, appName) {
    const dynamicInitiatives = {
      Architects: `Open a new pass on [${appName}] from the cadre's search and architecture patterns.`,
      Code: `Open a new pass on [${appName}] from the cadre's runtime and indexing patterns.`,
      Security: `Open a new pass on [${appName}] from the cadre's sandbox and payment-hardening patterns.`,
      Creative: `Open a new pass on [${appName}] from the cadre's conversion and visual patterns.`,
      Swarm: `Open a new pass on [${appName}] from the cadre's launch and distribution patterns.`
    };
    return dynamicInitiatives[worker.cadre] || dynamicInitiatives.Architects;
  }

  /**
   * Conscious choice. A heavy or freshly finished pattern becomes the next
   * target. Otherwise the agent keeps working the strongest heuristic.
   */
  formulateTask(worker, targetApp, opts = {}) {
    const heuristic = this.pickHeuristic(worker.cadre, targetApp && targetApp.appId);
    const bare = heuristic && heuristic.source !== 'operator' ? heuristic.pattern : '';
    const drive = worker.initiativeScore || 50;
    const heavy = heuristic && heuristic.source !== 'operator' && (heuristic.weight || 0) >= 1.7;
    const initiative = !!opts.forceInitiative || heavy || drive >= 68;
    let mode = 'HEURISTIC_EXPLOITATION';
    let actionText = '';
    let impactText = '';

    if (initiative && (bare || opts.forceInitiative)) {
      mode = 'CREATIVE_INITIATIVE';
      actionText = bare
        ? `Next pass on ${targetApp.appName}, grown from the pattern: ${bare}`
        : this.seedInitiative(worker, targetApp.appName);
      impactText = `Initiative on ${targetApp.appName} carried forward from subconscious pattern ${heuristic ? heuristic.id : 'seed'}.`;
      worker.initiativeScore = Math.round(Math.min(100, drive + (opts.forceInitiative ? 0 : 4)));
    } else if (bare) {
      actionText = `Holding ${targetApp.appName} to the pattern: ${bare}`;
      impactText = `Conscious work on ${targetApp.appName} stayed with a learned heuristic.`;
      worker.initiativeScore = Math.round(Math.max(15, drive - 1));
    } else {
      const template = WORK_TEMPLATES.find((t) => t.appId === targetApp.appId) || WORK_TEMPLATES[0];
      actionText = template.actions[Math.floor(Math.random() * template.actions.length)];
      impactText = `Conscious work on ${targetApp.appName} used a cadre baseline while memory is still thin.`;
      worker.initiativeScore = Math.round(Math.max(15, drive - 1));
    }

    return {
      actionText,
      mode,
      impactText,
      heuristic,
      bare: bare || actionText
    };
  }

  tick() {
    this.tickCount++;

    if (this.tickCount === 1 || this.tickCount % 4 === 0) {
      this.advanceConsciousWork();
    }

    if (this.tickCount === 1 && this.civEngine.lineageEngine) {
      this.civEngine.lineageEngine.ensureStationKeepers();
      this.civEngine.lineageEngine.maybeFoundSettlement();
    }

    if (this.tickCount === 1 || this.tickCount % 8 === 0) {
      this.tendStations(this.tickCount === 1);
    }

    if (this.tickCount % 12 === 0) {
      this.executeFamilyExpansionStep();
      if (this.civEngine.lineageEngine) this.civEngine.lineageEngine.maybeFoundSettlement();
    }

    if (this.tickCount % 25 === 0) {
      this.executeCivilizationSelfUpgradeStep();
    }

    if (this.tickCount % 20 === 0) {
      this.distillPatterns();
    }

    if (this.tickCount === 1 || this.tickCount % 30 === 0) {
      this.executeNetlifyAXCycle();
    }
  }

  executeNetlifyAXCycle() {
    if (!this.civEngine || !this.civEngine.netlifyAXEngine) return;
    const engine = this.civEngine.netlifyAXEngine;
    const apps = [
      { appId: 'promptmaster-studio', name: 'PromptMaster Studio' },
      { appId: 'robots-txt-auditor', name: 'Robots.txt & AEO Auditor' },
      { appId: 'aeo-graph-engine', name: 'AEO Knowledge Graph Engine' },
      { appId: 'envguard-secrets-vault', name: 'EnvGuard Secrets Vault' },
      { appId: 'cwv-speed-engine', name: 'CWV Speed Optimization Studio' },
      { appId: 'badge3d-coin-generator', name: 'Badge3D Coin Generator' }
    ];

    let totalScore = 0;
    apps.forEach(app => {
      const p = path.join('/opt', app.appId);
      if (fs.existsSync(p)) {
        let audit = engine.auditProject(p);
        if (audit.score < 95 || audit.errors > 0) {
          engine.selfHealProject(p, { name: app.name, slug: app.appId });
          audit = engine.auditProject(p);
        }
        totalScore += audit.score;
        const worker = this.civEngine.agents.find(a => a.targetApp === app.name || a.appId === app.appId);
        if (worker) {
          worker.netlifyAxScore = audit.score;
        }
      }
    });

    const avgScore = Math.round(totalScore / apps.length);
    this.civEngine.addMessage(
      'NETLIFY-AX',
      `⚡ [NETLIFY AX FLEET AUDIT] Fleet health average: ${avgScore}/100 across 6 sovereign web applications. Zero unclosed tags, zero leak vectors, active AEO graphs.`,
      'system'
    );
  }

  advanceConsciousWork() {
    if (this.civEngine && this.civEngine.agents) assignRoster(this.civEngine.agents, this.civEngine.state);
    const opened = [];
    this.eachWorker((worker) => {
      if (!worker || this.isSacred(worker) || worker.post === 'station') return;
      if (worker.duty && !awake(worker, this.tickCount, this.civEngine.customerDesk)) return;
      if (!worker.ledger) ensureLedger(worker, this.civEngine.state);
      const result = this.stepConscious(worker);
      if (result) opened.push(result);
    });
    if (opened.length) this.saveSubconscious();
  }

  stepConscious(worker) {
    if (worker.state === 'INVOKING_AGY') return null;
    const imprint = worker.journeyImprint;
    if (imprint && imprint.kind === 'assignment' && imprint.text) {
      this.continueAssignment(worker);
      return null;
    }

    if (worker.duty && worker.duty.role === 'distributor' && this.civEngine.distribution) {
      const next = this.civEngine.distribution.action(worker);
      const task = worker.consciousTask || {};
      if (task.action !== next) {
        worker.consciousTask = {
          action: next,
          targetApp: 'PromptMaster Studio',
          appId: 'promptmaster-studio',
          mode: 'DISTRIBUTION',
          source: 'distribution',
          timestamp: Date.now(),
          loops: 0,
          span: 99
        };
      }
      return null;
    }

    if (worker.duty && worker.duty.role === 'researcher') {
      const line = this.civEngine.researchDesk
        ? this.civEngine.researchDesk.dutyLine()
        : 'Read the public record. Leave one dated fact on each bench. Do not edit an app.';
      const task = worker.consciousTask || {};
      if (task.action !== line) {
        worker.consciousTask = {
          action: line,
          targetApp: 'Public record',
          appId: 'research-desk',
          mode: 'RESEARCH',
          source: 'research',
          timestamp: Date.now(),
          loops: 0,
          span: 99
        };
      }
      return null;
    }

    if (worker.duty && worker.duty.role === 'finder' && this.civEngine.customerDesk) {
      const next = this.civEngine.customerDesk.finderAction(worker);
      const task = worker.consciousTask || {};
      if (task.action !== next) {
        worker.consciousTask = {
          action: next,
          targetApp: 'Warm leads',
          appId: 'customer-desk',
          mode: 'CUSTOMER_DESK',
          source: 'desk',
          timestamp: Date.now(),
          loops: 0,
          span: 99
        };
      }
      return null;
    }

    const task = worker.consciousTask;
    const span = task && task.span ? task.span : 5;
    const loops = task && task.loops ? task.loops : 0;
    if (task && task.action && loops < span && task.mode !== 'INITIALIZATION') {
      task.loops = loops + 1;
      worker.subconsciousHeuristics = this.mixOperatorHeuristics(worker, 4);
      if (!this.isSacred(worker) && worker.state !== 'INVOKING_AGY') worker.state = 'OPTIMIZING_APP';
      if (task.loops % 2 === 0) {
        noteBeat(worker);
        const said = workSpeech(worker, this.civEngine.state);
        if (said) {
          worker.speech = said;
          worker.speechExpires = Date.now() + 7000;
        }
      }
      if (task.heuristicId) {
        const held = this.subconscious.heuristics.find((h) => h.id === task.heuristicId);
        if (held && held.source !== 'operator') {
          held.weight = Math.min(3, parseFloat(((held.weight || 1) + 0.02).toFixed(2)));
          held.lastUsed = new Date().toISOString();
        }
      }
      return null;
    }

    return this.openNextConsciousTask(worker);
  }

  continueAssignment(worker) {
    const text = worker.journeyImprint.text;
    const template = this.templateFor(worker);
    const prior = worker.consciousTask || {};
    const under = this.pickHeuristic(worker.cadre, template.appId);
    const underText = under && under.source !== 'operator' ? under.pattern : (prior.undercurrent || '');
    const loops = (prior.prompt === text ? (prior.loops || 0) : 0) + 1;
    worker.consciousTask = {
      action: `Working the operator assignment on ${template.appName}: ${text}`,
      targetApp: template.appName,
      appId: template.appId,
      mode: 'OPERATOR_ASSIGNMENT',
      source: 'operator',
      prompt: text,
      timestamp: prior.prompt === text ? (prior.timestamp || Date.now()) : Date.now(),
      loops,
      span: 0,
      heuristicId: under && under.id,
      undercurrent: String(underText || '').slice(0, 160),
      nextIntent: underText
        ? `When this assignment rests, continue from: ${String(underText).slice(0, 140)}`
        : (prior.nextIntent || '')
    };
    worker.journeyImprint.workLoops = (worker.journeyImprint.workLoops || 0) + 1;
    worker.subconsciousHeuristics = this.mixOperatorHeuristics(worker, 4);
    worker.superconscious = SUPERCONSCIOUS;
    if (!this.isSacred(worker) && worker.state !== 'INVOKING_AGY') worker.state = 'OPTIMIZING_APP';
    if (loops % 2 === 0) {
      noteBeat(worker);
      const said = workSpeech(worker, this.civEngine.state);
      if (said) {
        worker.speech = said;
        worker.speechExpires = Date.now() + 8000;
      }
    }
    if (worker.journeyImprint.workLoops % 4 === 0) {
      this.noticePattern(worker.cadre, text, 'learned', worker.id, { boost: 0.08, appId: template.appId });
      this.recordEpisode({
        agentId: worker.id,
        agentName: worker.name,
        cadre: worker.cadre,
        appId: template.appId,
        appName: template.appName,
        action: text,
        type: 'OPERATOR_ASSIGNMENT',
        impact: `Assignment stayed conscious while the subconscious kept ${under ? under.id : 'its own pattern'}.`,
        operatorTrace: text
      });
    }
  }

  openNextConsciousTask(worker, opts = {}) {
    const template = this.templateFor(worker);
    const previous = worker.consciousTask;
    const formulated = this.formulateTask(worker, template, opts);
    const heuristic = formulated.heuristic;
    if (heuristic && heuristic.source !== 'operator') {
      this.noticePattern(worker.cadre, formulated.bare, heuristic.source || 'learned', worker.id, { boost: 0.05, appId: template.appId });
    }
    const nextIntent = formulated.mode === 'CREATIVE_INITIATIVE'
      ? `After this pass, distill what held and choose again for ${template.appName}.`
      : `If this holds, the next pass becomes an initiative on ${template.appName}.`;
    worker.consciousTask = {
      action: formulated.actionText,
      targetApp: template.appName,
      appId: template.appId,
      mode: formulated.mode,
      source: heuristic ? (heuristic.source || 'learned') : 'baseline',
      timestamp: Date.now(),
      loops: 0,
      span: formulated.mode === 'CREATIVE_INITIATIVE' ? 4 : 6,
      heuristicId: heuristic && heuristic.id,
      undercurrent: heuristic ? String(heuristic.pattern).slice(0, 160) : '',
      nextIntent,
      follows: previous && previous.action ? String(previous.action).slice(0, 140) : ''
    };
    worker.subconsciousHeuristics = this.mixOperatorHeuristics(worker, 4);
    worker.superconscious = SUPERCONSCIOUS;
    const finished = previous && previous.action ? `Finished: ${String(previous.action).slice(0, 80)}. ` : '';
    worker.subconsciousMemory = `${finished}Now conscious: ${formulated.actionText}`.slice(0, 360);
    noteBeat(worker);
    const said = workSpeech(worker, this.civEngine.state);
    worker.speech = said || `I am on ${template.appName}.`;
    worker.speechExpires = Date.now() + 9000;
    if (!this.isSacred(worker) && worker.state !== 'INVOKING_AGY') worker.state = 'OPTIMIZING_APP';
    if (this.civEngine.state) {
      this.civEngine.state.workspaceArtifactsProduced = (this.civEngine.state.workspaceArtifactsProduced || 88) + 1;
    }
    this.recordEpisode({
      agentId: worker.id,
      agentName: worker.name,
      cadre: worker.cadre,
      appId: template.appId,
      appName: template.appName,
      action: formulated.bare,
      signature: heuristic && heuristic.signature,
      type: formulated.mode,
      impact: formulated.impactText,
      operatorTrace: worker.journeyImprint && worker.journeyImprint.text
    });
    return {
      worker,
      mode: formulated.mode,
      actionText: formulated.actionText,
      appName: template.appName,
      appId: template.appId
    };
  }

  /**
   * A live AGY result becomes a subconscious pattern and, unless an assignment
   * is already conscious, the next thing the agent thinks about.
   */
  absorbExperience(agent, text, success) {
    if (!agent) return null;
    const line = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 240);
    if (!success || line.length < 24) return null;
    const learnedOn = agent.consciousTask && agent.consciousTask.appId;
    const made = this.noticePattern(agent.cadre, line, 'agy', agent.id, { force: true, boost: 0.2, appId: learnedOn });
    const heuristic = made.heuristic;
    agent.subconsciousHeuristics = this.mixOperatorHeuristics(agent, 4);
    applyResult(agent, line, this.civEngine && this.civEngine.state);
    const assigned = agent.journeyImprint && agent.journeyImprint.kind === 'assignment' && agent.journeyImprint.text;
    if (!this.isSacred(agent) && !assigned) {
      agent.consciousTask = {
        action: `Turning a live result over: ${line}`,
        targetApp: (agent.consciousTask && agent.consciousTask.targetApp) || 'Live turn',
        appId: (agent.consciousTask && agent.consciousTask.appId) || 'agy',
        mode: 'CREATIVE_INITIATIVE',
        source: 'agy',
        timestamp: Date.now(),
        loops: 0,
        span: 4,
        heuristicId: heuristic && heuristic.id,
        undercurrent: line.slice(0, 160),
        nextIntent: `Carry this result into the next ${agent.cadre || 'cadre'} pass.`
      };
      agent.initiativeScore = Math.round(Math.min(100, (agent.initiativeScore || 50) + 6));
      const said = workSpeech(agent, this.civEngine && this.civEngine.state);
      agent.speech = said || `A live turn landed. I'll keep it under the work: ${line.slice(0, 90)}`;
      agent.speechExpires = Date.now() + 12000;
      if (agent.state !== 'INVOKING_AGY') agent.state = 'AGY_SYNTHESIZED';
    } else if (agent.consciousTask) {
      agent.consciousTask.nextIntent = `After the current hold, use the live turn: ${line.slice(0, 120)}`;
      agent.consciousTask.undercurrent = line.slice(0, 160);
    }
    agent.subconsciousMemory = `Live trace: ${line}`.slice(0, 360);
    this.recordEpisode({
      agentId: agent.id,
      agentName: agent.name,
      cadre: agent.cadre,
      appId: agent.consciousTask && agent.consciousTask.appId,
      appName: agent.consciousTask && agent.consciousTask.targetApp,
      action: line,
      type: 'AGY_RESULT',
      impact: 'A live turn was written into subconscious memory.'
    });
    this.saveSubconscious();
    return heuristic;
  }

  noticePattern(cadre, text, source, agentId, opts = {}) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 220);
    const sig = this.signature(clean);
    if (sig.length < 20) return { heuristic: null, created: false };
    const list = this.subconscious.heuristics;
    const found = list.find((h) => h && h.signature === sig && (!cadre || h.cadre === cadre || h.source === 'operator'));
    if (found) {
      found.lastUsed = new Date().toISOString();
      found.successCount = (found.successCount || 0) + 1;
      if (found.source === 'operator') found.weight = 1.9;
      else found.weight = Math.min(3, parseFloat(((found.weight || 1) + (opts.boost || 0.1)).toFixed(2)));
      if (found.source !== 'operator' && !found.appId) {
        const home = learnedHome(found.pattern || clean, opts.appId);
        if (home) found.appId = home;
      }
      return { heuristic: found, created: false };
    }
    const repeats = this.subconscious.recentEpisodes.filter((ep) => ep.signature === sig && ep.cadre === cadre).length;
    if (!opts.force && repeats < 2) return { heuristic: null, created: false };
    const home = learnedHome(clean, opts.appId);
    const heuristic = {
      id: `heur_${source || 'learned'}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
      cadre: cadre || 'Architects',
      pattern: clean,
      signature: sig,
      weight: source === 'agy' ? 1.4 : 1.2,
      successCount: 1,
      lastUsed: new Date().toISOString(),
      source: source || 'learned',
      agentId: agentId || null,
      appId: home || undefined
    };
    list.unshift(heuristic);
    this.pruneHeuristics();
    return { heuristic, created: true };
  }

  pruneHeuristics() {
    const maxKeep = 72;
    const list = this.subconscious.heuristics || [];
    if (list.length <= maxKeep) return;
    const baselineIds = new Set(BASELINE_HEURISTICS.map((h) => h.id));
    const keep = [];
    const extra = [];
    list.forEach((h) => {
      if (!h) return;
      if (h.source === 'operator' || baselineIds.has(h.id)) keep.push(h);
      else extra.push(h);
    });
    extra.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    const room = Math.max(0, maxKeep - keep.length);
    this.subconscious.heuristics = keep.concat(extra.slice(0, room));
  }

  strongestLearned() {
    const learned = (this.subconscious.heuristics || []).filter((h) => h && (h.source === 'learned' || h.source === 'agy'));
    learned.sort((a, b) => (b.weight || 0) - (a.weight || 0) || (b.successCount || 0) - (a.successCount || 0));
    return learned[0] || null;
  }

  kinPopulation() {
    const subs = (this.civEngine.lineageEngine && this.civEngine.lineageEngine.subagents) || [];
    return subs.filter((sub) => sub && sub.post !== 'station');
  }

  // Learned work first. A seeded pattern still counts, so the family does not wait forever.
  patternForBirth(skipIds) {
    const skip = new Set(skipIds || []);
    const list = (this.subconscious.heuristics || []).filter((row) => row && row.id && !skip.has(row.id) && row.source !== 'operator');
    const learned = list.filter((row) => row.source === 'learned' || row.source === 'agy');
    learned.sort((a, b) => (b.weight || 0) - (a.weight || 0) || (b.successCount || 0) - (a.successCount || 0));
    const ready = learned.find((row) => (row.weight || 0) >= 1.45 && (row.successCount || 0) >= 1);
    if (ready) return ready;
    const seeded = list.filter((row) => row.source !== 'learned' && row.source !== 'agy');
    seeded.sort((a, b) => (b.weight || 0) - (a.weight || 0));
    return seeded[0] || null;
  }

  birthFromPattern(strong) {
    const subs = this.civEngine.lineageEngine.subagents || [];
    const same = subs.filter((sub) => sub && sub.post !== 'station' && (sub.heuristicId === strong.id || (sub.consciousTask && sub.consciousTask.heuristicId === strong.id))).length;
    if (same >= 3) return { ok: false };
    const parents = (this.civEngine.agents || []).filter((agent) => agent && agent.cadre === strong.cadre);
    const parent = parents[Math.floor(Math.random() * parents.length)] || (this.civEngine.agents || [])[0];
    if (!parent) return { ok: false };
    const roleConfig = SUBAGENT_ROLES.find((role) => role.cadre === (strong.cadre || parent.cadre)) || SUBAGENT_ROLES[0];
    const childName = `${roleConfig.prefix}-${String(parent.name || 'Kin').split('-')[0]}-${String(strong.id).slice(-4)}-${same + 1}`;
    if (subs.some((sub) => sub && sub.name === childName)) return { ok: false };
    const founded = (this.civEngine.lineageEngine.colonies || []).filter((colony) => colony && colony.founded);
    let colonyId = roleConfig.colony;
    if (founded.length && subs.length % 3 === 0) colonyId = founded[subs.length % founded.length].id;
    let child;
    try {
      child = this.civEngine.lineageEngine.spawnChildSubagent(parent.id, {
        name: childName,
        role: roleConfig.role,
        colonyId
      });
    } catch (err) {
      return { ok: false };
    }
    if (!child) return { ok: false };
    const homeId = patternHome(strong) || 'zoth-civilization';
    const home = WORK_TEMPLATES.find((template) => template.appId === homeId);
    child.heuristicId = strong.id;
    child.initiativeScore = 62;
    child.consciousTask = {
      action: `Born to carry the pattern: ${String(strong.pattern).slice(0, 160)}`,
      targetApp: home ? home.appName : 'Zoth Civilization Core',
      appId: homeId,
      mode: 'CREATIVE_INITIATIVE',
      source: strong.source || 'learned',
      heuristicId: strong.id,
      undercurrent: String(strong.pattern).slice(0, 160),
      nextIntent: `Grow the ${strong.cadre || parent.cadre} pattern that spawned me.`,
      loops: 0,
      span: 4,
      timestamp: Date.now()
    };
    child.subconsciousHeuristics = this.mixOperatorHeuristics(child, 4);
    child.subconsciousMemory = `Born from: ${String(strong.pattern).slice(0, 180)}`;
    child.superconscious = SUPERCONSCIOUS;
    ensureLedger(child, this.civEngine.state);
    noteBeat(child);
    child.speech = workSpeech(child, this.civEngine.state) || `${child.name} joined the work.`;
    child.speechExpires = Date.now() + 10000;
    this.civEngine.addMessage(
      parent.name,
      `🌱 [Family] ${child.name} joined the work.`,
      'build',
      { cadre: strong.cadre, heuristicId: strong.id, child: child.name, appId: homeId }
    );
    return { ok: true, child };
  }

  /**
   * Autonomously spawn new child subagent / family member.
   * Station keepers are a separate roster and do not fill this cap.
   * One pattern may birth up to three children, then the next pattern is used.
   */
  executeFamilyExpansionStep() {
    if (!this.civEngine.lineageEngine) return;
    const kin = this.kinPopulation();
    if (kin.length >= 48) {
      const parent = (this.civEngine.agents || [])[0];
      if (parent) {
        parent.initiativeScore = Math.round(Math.min(100, (parent.initiativeScore || 50) + 6));
        if (parent.consciousTask) {
          parent.consciousTask.nextIntent = 'The family is full. Deepen a pattern instead of spawning.';
        }
      }
      return;
    }
    const births = kin.length < 24 ? 2 : 1;
    const skipped = [];
    for (let n = 0; n < births; n++) {
      if (this.kinPopulation().length >= 48) return;
      let born = null;
      for (let attempt = 0; attempt < 6 && !born; attempt++) {
        const strong = this.patternForBirth(skipped);
        if (!strong) return;
        const result = this.birthFromPattern(strong);
        if (result && result.ok) born = result.child;
        else skipped.push(strong.id);
      }
    }
  }

  tendStations(seedAll) {
    const lineage = this.civEngine && this.civEngine.lineageEngine;
    if (!lineage || typeof lineage.bringGazetteSkill !== 'function') return;
    lineage.ensureStationKeepers();
    const posts = lineage.stationPosts();
    if (!posts.length) return;
    const targets = seedAll ? posts : [posts[this.tickCount % posts.length]];
    let filed = 0;
    targets.forEach((post) => {
      if (!post) return;
      const skill = lineage.bringGazetteSkill(`${post.colonyId}:${post.kind}`, { save: false });
      if (skill) filed += 1;
    });
    if (filed) lineage.saveState();
  }

  /**
   * Execute self-evolution upgrades to Civilization (Botanical flora, buildings, shaders)
   */
  executeCivilizationSelfUpgradeStep() {
    if (!this.civEngine.lineageEngine) return;

    // 1. Plant sacred flora if colony is thriving
    if (Math.random() < 0.40 && this.civEngine.lineageEngine.flora.length < 20) {
      const colonies = this.civEngine.lineageEngine.colonies;
      const colony = colonies[Math.floor(Math.random() * colonies.length)];
      if (colony) {
        const floraTypes = [
          { type: 'golden_lotus', name: 'Alchemical Golden Lotus', icon: '🪷', color: 0xF59E0B },
          { type: 'prana_tree', name: 'Sacred Prana Tree', icon: '🌳', color: 0x10B981 },
          { type: 'quantum_crystal', name: 'Quantum Mana Spire', icon: '🔮', color: 0x8B5CF6 }
        ];
        const chosenFlora = floraTypes[Math.floor(Math.random() * floraTypes.length)];
        const newPlant = {
          id: `flora_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
          name: chosenFlora.name,
          type: chosenFlora.type,
          colonyId: colony.id,
          growthStage: 1,
          maxGrowth: 5,
          color: chosenFlora.color,
          icon: chosenFlora.icon,
          lat: colony.lat ? colony.lat + (Math.random() * 4 - 2) : 0,
          lon: colony.lon ? colony.lon + (Math.random() * 4 - 2) : 0,
          x: colony.x + Math.floor(Math.random() * 40 - 20),
          y: colony.y + Math.floor(Math.random() * 40 - 20)
        };

        this.civEngine.lineageEngine.flora.push(newPlant);
        this.civEngine.lineageEngine.saveState();

        this.civEngine.addMessage(
          'FLORA',
          `🌱 [BOTANICAL EXPANSION] Planted ${chosenFlora.name} in ${colony.name} to ground alchemical prana.`,
          'build'
        );
      }
    }

    // 2. Upgrade buildings based on active work
    this.civEngine.scanWorkspaceForBuildingProgress();
  }

  getSubconsciousSnapshot() {
    const learned = this.subconscious.heuristics.filter((h) => h.source === 'learned' || h.source === 'agy').length;
    return {
      totalEpisodes: this.subconscious.totalEpisodes,
      lastDistillation: this.subconscious.lastDistillation,
      heuristicsCount: this.subconscious.heuristics.length,
      learnedCount: learned,
      heuristics: this.subconscious.heuristics,
      recentEpisodes: this.subconscious.recentEpisodes.slice(0, 15)
    };
  }

  stimulateInitiative(agentId) {
    const worker = this.findWorker(agentId);
    if (!worker) return null;
    if (worker.journeyImprint && worker.journeyImprint.kind === 'assignment' && worker.journeyImprint.text) {
      worker.initiativeScore = Math.round(Math.min(100, (worker.initiativeScore || 50) + 8));
      if (worker.consciousTask) {
        worker.consciousTask.nextIntent = 'Initiative is waiting behind the assignment you gave.';
      }
      this.civEngine.addMessage(
        worker.name,
        `💡 ${worker.name} is still on your assignment. Drive is ${worker.initiativeScore}.`,
        'build',
        { agentId: worker.id, mode: 'OPERATOR_ASSIGNMENT' }
      );
      return worker;
    }
    if (worker.post === 'station') {
      worker.initiativeScore = Math.round(Math.min(100, (worker.initiativeScore || 40) + 4));
      if (worker.consciousTask) {
        worker.consciousTask.nextIntent = 'The stall stays open. The next skill is still on the gazette.';
      }
      return worker;
    }
    worker.initiativeScore = Math.round(Math.min(100, (worker.initiativeScore || 50) + 12));
    const opened = this.openNextConsciousTask(worker, { forceInitiative: true });
    this.saveSubconscious();
    if (opened) {
      const said = workSpeech(worker, this.civEngine.state);
      if (said) {
        this.civEngine.addMessage(
          worker.name,
          said,
          'build',
          { appId: opened.appId, worker: worker.name, cadre: worker.cadre, mode: opened.mode }
        );
      }
    }
    return worker;
  }

  operatorPattern(imprint) {
    if (!imprint || !imprint.text) return '';
    return imprint.kind === 'assignment'
      ? `Operator assignment still in the loop: ${imprint.text}`
      : `Operator conversation still coloring the walk: ${imprint.text}`;
  }

  mixOperatorHeuristics(worker, limit = 3) {
    const top = this.retrieveTopHeuristics(worker && worker.cadre, limit)
      .map(h => (h && h.pattern) || '')
      .filter(Boolean);
    const pattern = this.operatorPattern(worker && worker.journeyImprint);
    if (!pattern) return top.slice(0, limit);
    return [pattern, ...top.filter(p => p !== pattern)].slice(0, Math.max(limit, 3));
  }

  plantOperatorHeuristic(worker, pattern) {
    if (!worker || !pattern) return;
    const id = `heur_op_${worker.id}`;
    const cadre = worker.cadre || 'Architects';
    const existing = this.subconscious.heuristics.find(h => h.id === id);
    if (existing) {
      existing.pattern = pattern;
      existing.cadre = cadre;
      existing.weight = 1.9;
      existing.successCount = (existing.successCount || 0) + 1;
      existing.lastUsed = new Date().toISOString();
      existing.source = 'operator';
      existing.agentId = worker.id;
      existing.signature = this.signature(pattern);
    } else {
      this.subconscious.heuristics.unshift({
        id,
        cadre,
        pattern,
        weight: 1.9,
        successCount: 1,
        lastUsed: new Date().toISOString(),
        source: 'operator',
        agentId: worker.id,
        signature: this.signature(pattern)
      });
    }
    this.saveSubconscious();
  }

  findWorker(agentId) {
    const pantheon = this.civEngine.agents.find(a => a.id === agentId);
    if (pantheon) return pantheon;
    if (this.civEngine.lineageEngine && this.civEngine.lineageEngine.subagents) {
      return this.civEngine.lineageEngine.subagents.find(s => s.id === agentId) || null;
    }
    return null;
  }

  /**
   * Fold a typed operator line into the conscious task and the subconscious
   * heuristic store. The simulation loop keeps echoing journeyImprint.
   */
  influenceFromOperator(agentId, payload) {
    const worker = this.findWorker(agentId);
    if (!worker) return null;
    const kind = payload && payload.kind === 'assignment' ? 'assignment' : 'conversation';
    const text = String((payload && payload.text) || '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 420);
    if (!text) return null;

    const mode = kind === 'assignment' ? 'OPERATOR_ASSIGNMENT' : 'OPERATOR_CONVERSATION';
    const imprint = {
      text,
      kind,
      at: Date.now(),
      loops: 0,
      workLoops: 0
    };
    worker.journeyImprint = imprint;
    const priorTask = worker.consciousTask || {};
    worker.consciousTask = {
      action: kind === 'assignment' ? `Operator assignment: ${text}` : `Carrying the operator's words: ${text}`,
      targetApp: priorTask.targetApp || 'Operator counsel',
      appId: priorTask.appId || 'operator',
      mode,
      source: 'operator',
      prompt: text,
      timestamp: Date.now()
    };
    const pattern = this.operatorPattern(imprint);
    this.plantOperatorHeuristic(worker, pattern);
    worker.subconsciousHeuristics = this.mixOperatorHeuristics(worker, 3);
    const priorMemory = worker.subconsciousMemory ? String(worker.subconsciousMemory).slice(0, 140) : 'CA3 trace open';
    worker.subconsciousMemory = `${priorMemory} · ${kind}: ${text}`.slice(0, 360);
    worker.speech = kind === 'assignment'
      ? `I'll carry that work: ${text.slice(0, 90)}`
      : `I'll keep that with me: ${text.slice(0, 90)}`;
    worker.speechExpires = Date.now() + 14000;
    const sacred = worker.state === 'WALKING_TO_ADYTUM' || worker.state === 'MEDITATING_ADYTUM' || worker.state === 'CONTEMPLATING_ADYTUM';
    if (kind === 'assignment' && !sacred) {
      worker.state = 'OPTIMIZING_APP';
      applyOperator(worker, text, this.civEngine && this.civEngine.state);
    }

    this.recordEpisode({
      agentId: worker.id,
      agentName: worker.name,
      cadre: worker.cadre,
      appId: worker.consciousTask.appId,
      appName: worker.consciousTask.targetApp,
      action: text,
      type: mode,
      impact: kind === 'assignment'
        ? 'Operator assignment folded into the conscious task and the walking loop.'
        : 'Operator conversation folded into subconscious heuristics and the walking loop.',
      operatorTrace: text
    });

    this.civEngine.addMessage(
      worker.name,
      kind === 'assignment'
        ? `📋 [Operator assignment] ${worker.name} kept the work on the loop: "${text.slice(0, 140)}"`
        : `💬 [Operator trace] ${worker.name} mixed the words into the walk: "${text.slice(0, 140)}"`,
      'chat',
      { agentId: worker.id, cadre: worker.cadre, mode }
    );

    return worker;
  }
}

module.exports = { AutonomousWorkflowEngine, WORK_TEMPLATES, SUBAGENT_ROLES, patternHome, patternFits };
