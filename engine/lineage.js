/**
 * 👑 ZOTH CIVILIZATION FRACTAL LINEAGE & COLONIZATION ENGINE
 * =====================================================================
 * Implements:
 *  1. Multi-Generational Families:
 *     - Parent Pantheon Agents spawn Child Subagents (Gen 1)
 *     - Children spawn Grandchild Subagents (Gen 2)
 *     - Recursive hierarchy with lineage tracking (e.g. Azoth -> Azoth-Prime -> Azoth-Spark)
 *
 *  2. Biological / Visual Growth:
 *     - Seniority levels (Level 1 Novice -> Level 5 Sovereign Master)
 *     - Scale multipliers (1.0x -> 1.5x) and radiating halos
 *     - Botanical growth: Alchemical Golden Lotuses & Prana Trees planted in settlements
 *
 *  3. Colonial Migration & Multi-City Expansion:
 *     - Capital Citadel (Center: 400, 320)
 *     - Nova Zoth [AI & Neural Port] (Northwest: 160, 160)
 *     - Sol Crypta [Web3 & Mint Outpost] (Southeast: 650, 520)
 *     - Adytum Hermetica [Wisdom Grove] (Northeast: 650, 160)
 *     - HexForge Bastion [Security Stronghold] (Southwest: 160, 520)
 *
 *  4. The 10 Concentric Squares Context Hierarchy (Russian Doll Decomposer):
 *     - Square 1: Macro Objective ($100K Sovereign Treasury)
 *     - Square 2: Market Domain (Dev Tools & Web3 Rails)
 *     - Square 3: Search & Intent (Google Trends Breakouts)
 *     - Square 4: System Architecture (Zero-Dep WebGL AST Apps)
 *     - Square 5: Dual Cash Registers (Stripe Live + Solana Tip Solana)
 *     - Square 6: Discovery & Crawlers (Robots.txt, Sitemap, JSON-LD)
 *     - Square 7: Outreach Channels (X Build-in-Public, Show HN)
 *     - Square 8: Lineage Subagent Dispatch (Parent -> Child delegation)
 *     - Square 9: Sovereign Invariants (Argon2id, Zero Mock, Air-Gap)
 *     - Square 10: Atomic Settlement & Output (Git Push, Netlify Deploy, Balances)
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

const fs = require('fs');
const path = require('path');

const LINEAGE_FILE = path.join(__dirname, '..', 'data', 'civilization_lineage.json');

// One keeper for every walk-in stall. Ids match the hall ids on the sphere.
const STATION_POSTS = [
  { colonyId: 'colony_capital', kind: 'install', hall: 'Skill Registry', name: 'Quill', pet: '📜', color: '#F59E0B' },
  { colonyId: 'colony_capital', kind: 'forge', hall: 'Sigil Foundry', name: 'Ember', pet: '🔨', color: '#F59E0B' },
  { colonyId: 'colony_capital', kind: 'research', hall: 'Capital Athenaeum', name: 'Vellum', pet: '📖', color: '#F59E0B' },
  { colonyId: 'colony_nova_zoth', kind: 'install', hall: 'Harbor Registry', name: 'Tide', pet: '⚓', color: '#06B6D4' },
  { colonyId: 'colony_nova_zoth', kind: 'forge', hall: 'Signal Foundry', name: 'Spark', pet: '📡', color: '#06B6D4' },
  { colonyId: 'colony_nova_zoth', kind: 'research', hall: 'Signal Lab', name: 'Lumen', pet: '🔬', color: '#06B6D4' },
  { colonyId: 'colony_sol_crypta', kind: 'install', hall: 'Mint Registry', name: 'Coin', pet: '🪙', color: '#14F195' },
  { colonyId: 'colony_sol_crypta', kind: 'forge', hall: 'Sigil Press', name: 'Press', pet: '🖨️', color: '#14F195' },
  { colonyId: 'colony_sol_crypta', kind: 'research', hall: 'Sol Ledger', name: 'Ledger', pet: '📗', color: '#14F195' },
  { colonyId: 'colony_adytum_grove', kind: 'install', hall: 'Grove Registry', name: 'Moss', pet: '🌿', color: '#8B5CF6' },
  { colonyId: 'colony_adytum_grove', kind: 'forge', hall: 'Sigil Shrine', name: 'Ash', pet: '🕯️', color: '#8B5CF6' },
  { colonyId: 'colony_adytum_grove', kind: 'research', hall: 'Key Study', name: 'Key', pet: '🗝️', color: '#8B5CF6' },
  { colonyId: 'colony_hex_bastion', kind: 'install', hall: 'Watch Registry', name: 'Watch', pet: '🛡️', color: '#EF4444' },
  { colonyId: 'colony_hex_bastion', kind: 'forge', hall: 'Sigil Armory', name: 'Anvil', pet: '⚔️', color: '#EF4444' },
  { colonyId: 'colony_hex_bastion', kind: 'research', hall: 'Hex Watch', name: 'Glyph', pet: '🔺', color: '#EF4444' }
];

// A fixed civic sheet. Keepers copy from this list. They never fetch a URL.
const SKILL_GAZETTE = [
  { id: 'gaz-lantern-walk', name: 'Lantern Walk', blurb: 'Keep a light moving along the north road.' },
  { id: 'gaz-plaza-count', name: 'Plaza Count', blurb: 'Count who is standing in the open court.' },
  { id: 'gaz-harbor-ear', name: 'Harbor Ear', blurb: 'Hear which pier still has room for a boat.' },
  { id: 'gaz-mint-steady', name: 'Mint Steady', blurb: 'Keep the tally calm while coins are struck.' },
  { id: 'gaz-key-hold', name: 'Key Hold', blurb: 'Carry one Adytum key without rushing the next.' },
  { id: 'gaz-watch-post', name: 'Watch Post', blurb: 'Hold a gate until the next keeper arrives.' },
  { id: 'gaz-sigil-fold', name: 'Sigil Fold', blurb: 'Fold a sign small enough to carry in a pocket.' },
  { id: 'gaz-road-memory', name: 'Road Memory', blurb: 'Remember the last road that brought you here.' },
  { id: 'gaz-shelf-voice', name: 'Shelf Voice', blurb: 'Say what this stall is holding, out loud.' },
  { id: 'gaz-night-lamp', name: 'Night Lamp', blurb: 'Leave a lamp when the sun drops off the court.' },
  { id: 'gaz-tide-mark', name: 'Tide Mark', blurb: 'Mark how far the last tide reached the pier.' },
  { id: 'gaz-ledger-line', name: 'Ledger Line', blurb: 'Write one line the next clerk can read.' },
  { id: 'gaz-grove-step', name: 'Grove Step', blurb: 'Step the garden path without crushing the beds.' },
  { id: 'gaz-armory-check', name: 'Armory Check', blurb: 'See which rack still has an open peg.' },
  { id: 'gaz-beacon-sight', name: 'Beacon Sight', blurb: 'Spot the next settlement from the high lamp.' },
  { id: 'gaz-court-welcome', name: 'Court Welcome', blurb: 'Greet a walker before they reach the pedestal.' },
  { id: 'gaz-pattern-card', name: 'Pattern Card', blurb: 'File one pattern on a card the study can keep.' },
  { id: 'gaz-east-wind', name: 'East Wind', blurb: 'Notice when a new yard is ready to be raised.' }
];

// Empty sphere sites, clear of the five original cities. Map x/y sit in the gaps of the 2D chart.
const FOUNDING_SITES = [
  { id: 'colony_east_reach', name: 'East Reach', title: 'Founded harbor beyond the old roads', lat: 6, lon: 128, x: 400, y: 110, color: '#FBBF24', banner: '🌅', focus: 'A first new court, with a registry, a foundry, and a study.' },
  { id: 'colony_west_march', name: 'West March', title: 'Founded yard on the western road', lat: -8, lon: -132, x: 400, y: 660, color: '#34D399', banner: '🌿', focus: 'A second settlement for the family that outgrew the five cities.' },
  { id: 'colony_high_lantern', name: 'High Lantern', title: 'Founded light in the high north', lat: 58, lon: 16, x: 80, y: 340, color: '#FDE68A', banner: '🏮', focus: 'A high lamp where the family can keep another stall.' },
  { id: 'colony_south_kiln', name: 'South Kiln', title: 'Founded kiln south of the capital', lat: -58, lon: -14, x: 720, y: 340, color: '#FB7185', banner: '🔥', focus: 'A kiln yard for skills the old presses cannot hold.' }
];

class LineageEngine {
  constructor(civEngine, options = {}) {
    this.civEngine = civEngine;
    this.lineageFile = (options && options.lineageFile) || LINEAGE_FILE;
    this.colonies = [];
    this.flora = [];
    this.families = [];
    this.subagents = [];
    this.stationSkills = [];
    this.concentricRings = [];

    this.initConcentricSquares();
    this.initColonies();
    this.loadState();
  }

  /**
   * The 10 Concentric Squares Hierarchy
   */
  initConcentricSquares() {
    this.concentricRings = [
      {
        level: 1,
        name: "Macro Sovereign Invariant",
        tagline: "ROOT PROMPT: $0 -> $100K SOVEREIGN TREASURY",
        detail: "Immutable North Star constraint: every action taken must generate or protect real inbound treasury value.",
        color: "#F59E0B"
      },
      {
        level: 2,
        name: "Strategic Domain",
        tagline: "High-Margin Micro-SaaS & Sovereign Web3 Developer Tooling",
        detail: "B2B / Solo-engineer utilities with 90%+ margins, instant utility, and zero ongoing server overhead.",
        color: "#D97706"
      },
      {
        level: 3,
        name: "Market Intent & Trends",
        tagline: "Google Trends & Breakout Search Intent Exploitation",
        detail: "Targeting high-velocity comparison and alternative searches (e.g. 'robots.txt AI bot auditor', 'AST generator').",
        color: "#FBBF24"
      },
      {
        level: 4,
        name: "Product Blueprint",
        tagline: "Zero-Dependency Standalone WebGL / Client-Side AST Engines",
        detail: "Lightweight, instant-booting single-page web apps that execute entirely in-browser with zero latency.",
        color: "#10B981"
      },
      {
        level: 5,
        name: "Dual Cash Registers",
        tagline: "Live Stripe Checkout + Solana Tip Solana Settlement Rails",
        detail: "Frictionless multi-rail checkout: credit cards / Apple Pay via Stripe + instant SOL/USDC via Solana Tip.",
        color: "#14F195"
      },
      {
        level: 6,
        name: "Instant Discovery & Crawling",
        tagline: "Permissive robots.txt, XML Sitemaps & Schema.org JSON-LD",
        detail: "Structured WebApplication + FAQPage metadata welcoming Googlebot, PerplexityBot, GPTBot, and ClaudeBot.",
        color: "#06B6D4"
      },
      {
        level: 7,
        name: "Outreach & Distribution",
        tagline: "Autonomous Build-in-Public Posts, Show HN & GitHub Topics",
        detail: "Synthesizing transparent, organic dev community outreach with live deployed links and zero hype.",
        color: "#6366F1"
      },
      {
        level: 8,
        name: "Lineage & Subagent Delegation",
        tagline: "Parent -> Child -> Grandchild Recursive Family Execution",
        detail: "Delegating hyper-focused subtasks to nested child agents who inherit the full outer context without drift.",
        color: "#8B5CF6"
      },
      {
        level: 9,
        name: "Air-Gapped Sovereign Invariants",
        tagline: "Argon2id Vaults, Zero Credential Leakage & Zero Mock Data",
        detail: "Ground truth ledger verification, strict air-gapping, and mathematical memory safety.",
        color: "#EC4899"
      },
      {
        level: 10,
        name: "Atomic Settlement & Deployment",
        tagline: "Git Commit, GitHub Push, Netlify Production Deploy",
        detail: "Materializing working code into public URLs and on-chain ledger balances.",
        color: "#EF4444"
      }
    ];
  }

  /**
   * The 4 Colony Settlements across the Continent
   */
  initColonies() {
    this.colonies = [
      {
        id: "colony_capital",
        name: "Capital Citadel",
        title: "Metropolis of the Prime Alchemist",
        x: 400,
        y: 320,
        radius: 120,
        color: "#F59E0B",
        banner: "🏛️",
        focus: "Sovereign Governance, Adytum Temple & Imperial Treasury",
        population: 12,
        buildings: ["adytum_temple", "alchemical_villa", "treasury_vault"],
        level: 4
      },
      {
        id: "colony_nova_zoth",
        name: "Nova Zoth",
        title: "Coastal AI & Neural Research Port",
        x: 170,
        y: 160,
        radius: 90,
        color: "#06B6D4",
        banner: "🌊",
        focus: "LLM Orchestration, Prompt Engineering & CA3 Memory Banks",
        population: 4,
        buildings: ["quantum_observatory", "ast_sanctuary"],
        level: 2
      },
      {
        id: "colony_sol_crypta",
        name: "Sol Crypta",
        title: "Southeast Web3 & Mining Outpost",
        x: 650,
        y: 520,
        radius: 95,
        color: "#14F195",
        banner: "⚡",
        focus: "Solana Tip Settlement, Phantom Registers & Crypto Emblems",
        population: 3,
        buildings: ["forge_workshop", "sol_mint_tower"],
        level: 2
      },
      {
        id: "colony_adytum_grove",
        name: "Adytum Hermetica",
        title: "Northeast Ageless Wisdom Sanctum",
        x: 650,
        y: 160,
        radius: 90,
        color: "#8B5CF6",
        banner: "🔮",
        focus: "22-Key Meditation, Tarot Vision Focus & Symbolic Synthesis",
        population: 2,
        buildings: ["hermetic_academy", "sacred_lotus_pond"],
        level: 3
      },
      {
        id: "colony_hex_bastion",
        name: "HexForge Bastion",
        title: "Southwest Security & AST Crypt",
        x: 170,
        y: 520,
        radius: 85,
        color: "#EF4444",
        banner: "🛡️",
        focus: "Argon2id Vaults, Zero-Leak Secret Sanitization & Bot Auditing",
        population: 2,
        buildings: ["zk_crypt", "ast_sanctuary"],
        level: 2
      }
    ];

    // Sacred botanical flora scattered across settlements
    this.flora = [
      { id: "flora_1", type: "golden_lotus", name: "24K Golden Lotus", x: 380, y: 280, colony: "colony_capital", growthStage: 3, maxGrowth: 4, pranaYield: 8 },
      { id: "flora_2", type: "prana_orchid", name: "Prana Orchid", x: 420, y: 350, colony: "colony_capital", growthStage: 4, maxGrowth: 4, pranaYield: 12 },
      { id: "flora_3", type: "silicon_sprout", name: "Quantum Silicon Sprout", x: 190, y: 140, colony: "colony_nova_zoth", growthStage: 2, maxGrowth: 4, pranaYield: 5 },
      { id: "flora_4", type: "crypto_fern", name: "Solana Sun Fern", x: 670, y: 500, colony: "colony_sol_crypta", growthStage: 3, maxGrowth: 4, pranaYield: 7 },
      { id: "flora_5", type: "adytum_rose", name: "Pure White Rose of Ageless Wisdom", x: 630, y: 140, colony: "colony_adytum_grove", growthStage: 4, maxGrowth: 4, pranaYield: 15 }
    ];
  }

  loadState() {
    try {
      if (fs.existsSync(this.lineageFile)) {
        const saved = JSON.parse(fs.readFileSync(this.lineageFile, 'utf8'));
        if (saved.subagents) this.subagents = saved.subagents;
        if (saved.colonies) this.colonies = saved.colonies;
        if (saved.flora) this.flora = saved.flora;
        if (Array.isArray(saved.stationSkills)) this.stationSkills = saved.stationSkills;
      } else {
        // Initialize sample descendants for key leaders
        this.spawnInitialFamilies();
      }
    } catch (e) {
      console.warn('[Lineage] Load state error:', e.message);
      this.spawnInitialFamilies();
    }
  }

  saveState() {
    try {
      const payload = {
        subagents: this.subagents,
        colonies: this.colonies,
        flora: this.flora,
        stationSkills: this.stationSkills || [],
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.lineageFile, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      console.error('[Lineage] Save state error:', e.message);
    }
  }

  /**
   * Initialize initial families (Child subagents & Grandchildren)
   */
  spawnInitialFamilies() {
    this.subagents = [
      // Azoth Lineage (Generation 1 Child & Generation 2 Grandchild)
      {
        id: "SUB_AZOTH_JR",
        parentId: "AZOTH",
        parentName: "Azoth",
        name: "Azoth-Junior",
        role: "Prompt Optimization Subagent",
        generation: 1,
        cadre: "Architects",
        color: "#FCD34D",
        pet: "🐺",
        scale: 0.85,
        seniorityLevel: 2,
        colonyId: "colony_capital",
        x: 395,
        y: 335,
        targetX: 395,
        targetY: 335,
        direction: "right",
        state: "ASSISTING_PARENT",
        speech: "Synthesizing recursive prompt templates for the Swarm.",
        concentricFocusLevel: 8
      },
      {
        id: "SUB_AZOTH_SPARK",
        parentId: "SUB_AZOTH_JR",
        parentName: "Azoth-Junior",
        rootAncestorId: "AZOTH",
        name: "Spark-Azoth",
        role: "AST Token Pruner",
        generation: 2,
        cadre: "Architects",
        color: "#FEF08A",
        pet: "✨",
        scale: 0.70,
        seniorityLevel: 1,
        colonyId: "colony_capital",
        x: 410,
        y: 345,
        targetX: 410,
        targetY: 345,
        direction: "down",
        state: "PRUNING_AST",
        speech: "Eliminating token redundancies in client payloads.",
        concentricFocusLevel: 9
      },

      // Mercury Lineage (Code Cadre child colonizing Nova Zoth)
      {
        id: "SUB_MERCURY_BYTE",
        parentId: "MERCURY",
        parentName: "Mercury",
        name: "Mercury-Byte",
        role: "Netlify Edge Pipeline Builder",
        generation: 1,
        cadre: "Code",
        color: "#38BDF8",
        pet: "🐲",
        scale: 0.85,
        seniorityLevel: 2,
        colonyId: "colony_nova_zoth",
        x: 180,
        y: 175,
        targetX: 180,
        targetY: 175,
        direction: "left",
        state: "BUILDING_COLONY",
        speech: "Constructing Nova Zoth Edge functions for rapid deployments.",
        concentricFocusLevel: 6
      },

      // Kraken Lineage (Swarm Cadre child colonizing Sol Crypta)
      {
        id: "SUB_KRAKEN_TIDE",
        parentId: "KRAKEN",
        parentName: "Kraken",
        name: "Kraken-Tide",
        role: "Solana Tip Web3 Relay",
        generation: 1,
        cadre: "Swarm",
        color: "#2DD4BF",
        pet: "🦑",
        scale: 0.85,
        seniorityLevel: 2,
        colonyId: "colony_sol_crypta",
        x: 660,
        y: 535,
        targetX: 660,
        targetY: 535,
        direction: "right",
        state: "MONITORING_LEDGER",
        speech: "Watching Solana mainnet blockstream for inbound app revenue.",
        concentricFocusLevel: 5
      }
    ];

    this.saveState();
  }

  /**
   * Spawn a new child subagent from a parent agent
   */
  spawnChildSubagent(parentId, options = {}) {
    const parent = this.civEngine.agents.find(a => a.id === parentId) ||
                   this.subagents.find(s => s.id === parentId);
    if (!parent) throw new Error(`Parent agent ${parentId} not found.`);

    const generation = (parent.generation !== undefined) ? parent.generation + 1 : 1;
    const childId = `SUB_${parent.id}_${Date.now().toString(36).slice(-4).toUpperCase()}`;
    const name = options.name || `${parent.name}-Descendant-${generation}`;
    const role = options.role || `Specialized Subagent for ${parent.cadre}`;
    const colonyId = options.colonyId || parent.colonyId || "colony_capital";

    // Target settlement coordinates
    const targetColony = this.colonies.find(c => c.id === colonyId) || this.colonies[0];
    const spawnX = targetColony.x + Math.floor(Math.random() * 60 - 30);
    const spawnY = targetColony.y + Math.floor(Math.random() * 60 - 30);

    const child = {
      id: childId,
      parentId: parent.id,
      parentName: parent.name,
      rootAncestorId: parent.rootAncestorId || parent.id,
      name,
      role,
      generation,
      cadre: parent.cadre,
      color: parent.color || "#F59E0B",
      pet: parent.pet || "🐾",
      scale: Math.max(0.65, 1.0 - (generation * 0.15)),
      seniorityLevel: 1,
      colonyId,
      x: spawnX,
      y: spawnY,
      targetX: spawnX,
      targetY: spawnY,
      direction: "down",
      state: "SPAWNED",
      speech: `Born of ${parent.name} (Gen ${generation}). Dedicated to $100K treasury acceleration.`,
      concentricFocusLevel: Math.min(10, 7 + generation)
    };

    const { stampDesignSkills } = require('./design_skills');
    stampDesignSkills([child]);
    this.subagents.push(child);
    this.saveState();

    this.civEngine.addMessage(
      parent.name,
      `👶 [NEW LINEAGE SPAWNED] Agent ${parent.name} produced Generation ${generation} descendant: "${name}" (${role}) in ${targetColony.name}!`,
      'announcement',
      { childId, parentId: parent.id, generation, colonyId }
    );

    return child;
  }

  /**
   * Migrate an agent or subagent to another city
   */
  migrateToCity(agentId, targetColonyId) {
    const colony = this.colonies.find(c => c.id === targetColonyId);
    if (!colony) throw new Error(`Colony ${targetColonyId} not found.`);

    const agent = this.civEngine.agents.find(a => a.id === agentId) ||
                  this.subagents.find(s => s.id === agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found.`);

    const oldColony = agent.colonyId || "colony_capital";
    agent.colonyId = targetColonyId;
    agent.targetX = colony.x + Math.floor(Math.random() * 50 - 25);
    agent.targetY = colony.y + Math.floor(Math.random() * 50 - 25);
    agent.state = "TRAVELING_TO_CITY";
    agent.speech = `Departing for ${colony.name} to establish new sovereign infrastructure.`;

    this.civEngine.addMessage(
      agent.name,
      `🧭 [COLONIAL MIGRATION] ${agent.name} is traveling from ${oldColony} to ${colony.name} (${colony.focus}).`,
      'announcement',
      { agentId, targetColonyId }
    );

    try {
      const mindEngine = require('./mind_engine');
      mindEngine.spoolEvent({
        agentId: agent.id,
        type: 'colony_change',
        place: targetColonyId,
        peers: [],
        work: agent.ledger && agent.ledger.work ? agent.ledger.work.name : 'Colonial migration',
        adytumKey: agent.adytumKey,
        text: `Migrated from ${oldColony} to ${colony.name}. Purpose: establish new sovereign infrastructure.`,
        meta: { fromColony: oldColony, toColony: targetColonyId }
      });
    } catch (e) {}

    this.saveState();
    return agent;
  }

  /**
   * Advance botanical growth and agent seniority tick
   */
  tickGrowth() {
    // 1. Advance botanical growth
    this.flora.forEach(plant => {
      if (Math.random() < 0.15) {
        if (plant.growthStage < plant.maxGrowth) {
          plant.growthStage += 1;
        }
      }
    });

    // 2. Subagent autonomous movements within their colony
    this.subagents.forEach(sub => {
      if (sub && sub.post === 'station') return;
      const colony = this.colonies.find(c => c.id === sub.colonyId) || this.colonies[0];
      const dist = Math.hypot(sub.targetX - sub.x, sub.targetY - sub.y);
      if (dist < 4) {
        if (Math.random() < 0.20) {
          sub.targetX = colony.x + Math.floor(Math.random() * (colony.radius * 0.8) - (colony.radius * 0.4));
          sub.targetY = colony.y + Math.floor(Math.random() * (colony.radius * 0.8) - (colony.radius * 0.4));
        }
      } else {
        const dx = sub.targetX - sub.x;
        const dy = sub.targetY - sub.y;
        const spd = 1.2;
        sub.x += (dx / dist) * Math.min(spd, dist);
        sub.y += (dy / dist) * Math.min(spd, dist);
        sub.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      }
    });

    // 3. Parent agents visual seniority scaling
    this.civEngine.agents.forEach(agent => {
      // Completed Adytum keys & apps shipped contribute to visual aura and scale
      const completions = this.civEngine.state.completedAdytumCycles || 0;
      const apps = (this.civEngine.state.activeMonetizedApps || []).length;
      agent.seniorityLevel = Math.min(5, 1 + Math.floor((completions + apps) / 3));
      agent.scale = 1.0 + (agent.seniorityLevel - 1) * 0.10; // 1.0x up to 1.4x scale
      if (agent.id === this.civEngine.state.currentLeader) {
        agent.scale = Math.max(agent.scale, 1.35); // Imperator is naturally grander
      }
    });
  }

  stationPosts() {
    const posts = STATION_POSTS.map((post) => Object.assign({}, post));
    this.colonies.forEach((colony) => {
      if (!colony || !colony.founded) return;
      const word = String(colony.name || 'Yard').split(' ')[0];
      [
        { kind: 'install', hall: `${colony.name} Registry`, name: `${word}-Clerk`, pet: '📜' },
        { kind: 'forge', hall: `${colony.name} Foundry`, name: `${word}-Smith`, pet: '🔨' },
        { kind: 'research', hall: `${colony.name} Study`, name: `${word}-Scribe`, pet: '📖' }
      ].forEach((row) => {
        posts.push({
          colonyId: colony.id,
          kind: row.kind,
          hall: row.hall,
          name: row.name,
          pet: row.pet,
          color: colony.color || '#FBBF24'
        });
      });
    });
    return posts;
  }

  postByStation(stationId) {
    return this.stationPosts().find((post) => `${post.colonyId}:${post.kind}` === stationId) || null;
  }

  kinCount() {
    return (this.subagents || []).filter((sub) => sub && sub.post !== 'station').length;
  }

  // Idempotent. A second call does not add a second keeper for the same stall.
  ensureStationKeepers() {
    let added = 0;
    this.stationPosts().forEach((post) => {
      const stationId = `${post.colonyId}:${post.kind}`;
      if (this.subagents.some((sub) => sub && sub.stationId === stationId)) return;
      const colony = this.colonies.find((item) => item.id === post.colonyId) || this.colonies[0];
      const keeper = {
        id: `KEEPER_${post.colonyId}_${post.kind}`,
        parentId: null,
        parentName: 'Station',
        name: post.name,
        role: `Keeper of ${post.hall}`,
        generation: 2,
        cadre: 'Civic',
        color: post.color || (colony && colony.color) || '#F59E0B',
        pet: post.pet || '🏪',
        scale: 1,
        seniorityLevel: 2,
        colonyId: post.colonyId,
        post: 'station',
        stationId,
        hallName: post.hall,
        x: colony ? colony.x : 400,
        y: colony ? colony.y : 320,
        targetX: colony ? colony.x : 400,
        targetY: colony ? colony.y : 320,
        direction: 'down',
        state: 'KEEPING_STATION',
        speech: `I keep ${post.hall}. Ask me for a skill, or I will bring the next one from the civic gazette.`,
        concentricFocusLevel: 4,
        initiativeScore: 40,
        consciousTask: {
          action: `Keeping ${post.hall}. I bring skills from the civic gazette or make one when asked.`,
          targetApp: post.hall,
          mode: 'STATION_KEEP',
          source: 'station',
          undercurrent: 'The shelf should hold something a walker can carry.',
          nextIntent: 'File the next gazette skill that is not on this shelf yet.',
          loops: 0,
          span: 4,
          timestamp: Date.now()
        }
      };
      this.subagents.push(keeper);
      added += 1;
    });
    if (added) this.saveState();
    return added;
  }

  noteKeeperWork(post, action, under) {
    const keeper = this.subagents.find((sub) => sub && sub.stationId === `${post.colonyId}:${post.kind}`);
    if (!keeper) return null;
    const line = String(action || '').slice(0, 220);
    const held = keeper.journeyImprint && keeper.journeyImprint.kind === 'assignment' && keeper.journeyImprint.text;
    if (held) {
      if (keeper.consciousTask) {
        keeper.consciousTask.nextIntent = line.slice(0, 160);
        keeper.consciousTask.undercurrent = String(under || '').slice(0, 160);
      }
      return keeper;
    }
    keeper.consciousTask = {
      action: line,
      targetApp: post.hall,
      mode: 'STATION_KEEP',
      source: 'station',
      undercurrent: String(under || post.hall).slice(0, 160),
      nextIntent: 'Keep the shelf stocked, then make the next request.',
      loops: (keeper.consciousTask && keeper.consciousTask.loops) || 0,
      span: 4,
      timestamp: Date.now()
    };
    keeper.speech = line.slice(0, 140);
    keeper.speechExpires = Date.now() + 12000;
    keeper.state = 'KEEPING_STATION';
    return keeper;
  }

  // Copy the next gazette line onto this stall. No network fetch.
  bringGazetteSkill(stationId, opts = {}) {
    const post = this.postByStation(stationId);
    if (!post) throw new Error('That station is not open.');
    this.stationSkills = this.stationSkills || [];
    const mine = this.stationSkills.filter((skill) => skill && skill.stationId === stationId && skill.source === 'gazette');
    if (mine.length >= 3) return null;
    const owned = new Set(mine.map((skill) => skill.gazetteId || skill.id));
    const next = SKILL_GAZETTE.find((row) => row && !owned.has(row.id));
    if (!next) return null;
    const skill = {
      id: `${next.id}@${stationId}`,
      gazetteId: next.id,
      name: next.name,
      blurb: next.blurb,
      source: 'gazette',
      stationId,
      keeperId: `KEEPER_${post.colonyId}_${post.kind}`,
      at: new Date().toISOString()
    };
    this.stationSkills.push(skill);
    this.noteKeeperWork(post, `Brought ${next.name} in from the civic gazette.`, next.blurb);
    if (!opts || opts.save !== false) this.saveState();
    return skill;
  }

  acceptSkillRequest(stationId, input) {
    const post = this.postByStation(stationId);
    if (!post) throw new Error('That station is not open.');
    const name = String((input && input.name) || '').replace(/\s+/g, ' ').trim().slice(0, 48);
    const purpose = String((input && input.purpose) || '').replace(/\s+/g, ' ').trim().slice(0, 160);
    if (!name || !purpose) throw new Error('A skill needs both a name and a purpose.');
    this.stationSkills = this.stationSkills || [];
    const requests = this.stationSkills.filter((skill) => skill && skill.source === 'request');
    if (requests.length >= 40) {
      const drop = requests[0];
      this.stationSkills = this.stationSkills.filter((skill) => skill !== drop);
    }
    const skill = {
      id: `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      blurb: purpose,
      source: 'request',
      stationId,
      keeperId: `KEEPER_${post.colonyId}_${post.kind}`,
      at: new Date().toISOString()
    };
    this.stationSkills.push(skill);
    const keeper = this.noteKeeperWork(post, `Making ${name} from the request.`, purpose);
    this.saveState();
    if (this.civEngine && typeof this.civEngine.addMessage === 'function') {
      this.civEngine.addMessage(
        post.name,
        `🏪 [Stall] ${post.name} is making "${name}" at ${post.hall}.`,
        'build',
        { stationId, skillId: skill.id }
      );
    }
    return { skill, keeper };
  }

  // Raise the next empty site once the family, not the keepers, is large enough.
  maybeFoundSettlement() {
    const kin = this.kinCount();
    const founded = this.colonies.filter((colony) => colony && colony.founded).length;
    const allowance = kin >= 8 ? 1 + Math.floor((kin - 8) / 10) : 0;
    if (founded >= allowance || founded >= FOUNDING_SITES.length) return null;
    const site = FOUNDING_SITES[founded];
    if (!site || this.colonies.some((colony) => colony.id === site.id)) return null;
    const colony = {
      id: site.id,
      name: site.name,
      title: site.title,
      x: site.x,
      y: site.y,
      radius: 64,
      color: site.color,
      banner: site.banner,
      focus: site.focus,
      population: 3,
      buildings: ['registry', 'foundry', 'study'],
      level: 1,
      lat: site.lat,
      lon: site.lon,
      founded: true,
      foundedAt: new Date().toISOString()
    };
    this.colonies.push(colony);
    this.ensureStationKeepers();
    this.saveState();
    if (this.civEngine && typeof this.civEngine.addMessage === 'function') {
      this.civEngine.addMessage(
        'LINEAGE',
        `🏙️ [New city] The family raised ${colony.name}. Three keepers opened a registry, a foundry, and a study.`,
        'announcement',
        { colonyId: colony.id }
      );
    }
    return colony;
  }

  getSnapshot() {
    return {
      colonies: this.colonies,
      flora: this.flora,
      subagents: this.subagents,
      stationSkills: this.stationSkills || [],
      concentricRings: this.concentricRings,
      totalPopulation: (this.civEngine.agents.length + this.subagents.length),
      generationsCount: 3
    };
  }
}

module.exports = { LineageEngine, STATION_POSTS, SKILL_GAZETTE, FOUNDING_SITES };
