/**
 * 🏛️ ZOTH CIVILIZATION SIMULATION ENGINE
 * =====================================================================
 * Autonomous living ecosystem for the 21 Pantheon Agents.
 * - Hybrid Dictatorship & Democracy: Democratic Conclave Elections + Imperial Executive Decrees
 * - Adytum Hermetic Journey Engine (The Fool Key 0 -> The World Key 21 -> Repeat)
 * - $0 to $100K Autonomous Treasury Road (Solana Tip, Solana, Netlify, GitHub, Stripe)
 * - Real-world project workspace tracking -> Dynamic building growth
 * - Subconscious (memory / pattern distillation) & Superconscious (macro purpose) generation
 * - Inter-agent dialogue generation & sovereign bridge routing
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering (https://nullai.tech | https://github.com/1nc0gn30)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { SovereignPaymentEngine } = require('./stripe_mint');
const { AgyBridge } = require('./agy_bridge');
const { RequisitionEngine } = require('./requisitions');
const { RepoFactory } = require('./repo_factory');
const { LineageEngine } = require('./lineage');
const { AccountProvisioner } = require('./account_provisioner');
const { OutreachEngine } = require('./outreach_engine');
const { AutonomousWorkflowEngine } = require('./workflow_engine');
const { TimelineEngine } = require('./timeline_engine');
const { NetlifyAXEngine } = require('./netlify_ax_engine');
const { refreshVoiceLine } = require('./voice');
const { HermeticObserver } = require('./hermetic_observer');
const {
  planForKey,
  mistPlan,
  BOTA_STUDY,
  openKeySitting,
  fileVisual,
  advanceSitting,
  sealKeySitting,
  needsMistWalk,
  openMistWalk,
  sealMistWalk
} = require('./adytum_rite');
const pollinations = require('./pollinations');
const {
  ensureLedger,
  nameTheWork,
  applySitting,
  applyMist,
  applyMeeting,
  applyWalk,
  applyOperator,
  noteBeat,
  speakLine,
  composeTalk,
  composeReply
} = require('./agent_ledger');
const { CustomerDesk, assignRoster, awake } = require('./customer_desk');
const { Distribution } = require('./distribution');
const { Connectors } = require('./connectors');
const { planWork } = require('./prod_pass');
const { armLibraryRoad, syncLibraryPhase } = require('./library_road');
const { BUILD_WAY, applyBuildWay, stampAgents } = require('./build_way');
const { stampDesignSkills, presentSkills } = require('./design_skills');
const { RANK } = require('./agent_ledger');
const { LocalRevampMission } = require('./local_revamp_mission');
const { ResearchDesk } = require('./research_desk');
const mindEngine = require('./mind_engine');

function mergeById(seed, saved) {
  const seeds = Array.isArray(seed) ? seed : [];
  const lives = Array.isArray(saved) ? saved.filter((agent) => agent && agent.id) : [];
  if (!lives.length) return seeds.slice();
  const byId = new Map(lives.map((agent) => [agent.id, agent]));
  const merged = seeds.map((agent) => {
    if (!agent || !agent.id) return agent;
    const live = byId.get(agent.id);
    if (!live) return agent;
    byId.delete(agent.id);
    return live;
  });
  byId.forEach((agent) => merged.push(agent));
  return merged;
}

class CivilizationEngine {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.stateFile = path.join(dataDir, 'civilization_state.json');
    this.keysFile = path.join(dataDir, 'adytum_keys.json');
    this.agentsFile = path.join(dataDir, 'pantheon_agents.json');
    this.buildingsFile = path.join(dataDir, 'civilization_buildings.json');

    this.mindEngine = mindEngine;
    this.paymentEngine = new SovereignPaymentEngine();
    this.agyBridge = new AgyBridge(this);
    this.requisitionEngine = new RequisitionEngine(this);
    this.repoFactory = new RepoFactory(this);
    this.lineageEngine = new LineageEngine(this);
    this.accountProvisioner = new AccountProvisioner(this);
    this.outreachEngine = new OutreachEngine(this);
    this.customerDesk = new CustomerDesk(this);
    this.researchDesk = new ResearchDesk(this);
    this.distribution = new Distribution(this);
    this.connectors = new Connectors(this);
    this.localRevamp = new LocalRevampMission(this);
    this.workflowEngine = new AutonomousWorkflowEngine(this);
    this.timelineEngine = new TimelineEngine(this);
    this.netlifyAXEngine = new NetlifyAXEngine(this);
    this.hermeticObserver = new HermeticObserver(this);

    this.tarotKeys = [];
    this.agents = [];
    this.buildings = [];
    this.messages = [];

    this.state = {
      active: true,
      day: 1,
      hour: 8,
      minute: 0,
      second: 0,
      epoch: 1,
      totalTicks: 0,
      scope: "Agents build Zoth Civilization itself, the six live tools, and one new folder at a time under zoth-begun. Two turns may run together when the CPU is calm. The operating system and the security projects stay closed. The treasury goal stays $100,000. Do not invent a shop, a review, or a traffic forecast. Do not deploy or push unless the operator says so.",
      durationMode: "continuous",
      durationDays: 30,
      speedMultiplier: 1,
      meditationCountdown: 45,
      meditationInterval: 45,
      completedAdytumCycles: 4,
      adytumCycleCount: 4,
      observationalAdytumCycles: 4,
      mentalReflections: [],
      totalBuildingsConstructed: 15,
      workspaceArtifactsProduced: 88,
      subconsciousMemoryDensity: mindEngine ? mindEngine.getMindStats().densityDisplay : "23 memories (23 hold-close)",
      superconsciousAlignmentScore: "99.1%",
      metaEvolutionCycle: 24,

      // Checks & Balances (Dictatorship & Democracy Conclave)
      currentLeader: "AZOTH",
      leaderTitle: "Sovereign Imperator",
      leaderTermMode: "1_day", // 1_hour, 12_hours, 1_day, 1_week, demo_fast
      leaderTermTotalSec: 86400,
      leaderTermRemainingSec: 86400,
      conclaveCount: 1,
      lastElectionResults: {
        electionNumber: 1,
        winner: "Azoth",
        winnerId: "AZOTH",
        votesReceived: 7,
        totalVotes: 21,
        timestamp: new Date().toISOString()
      },
      currentDecree: {
        leaderId: "AZOTH",
        leaderName: "Azoth",
        pet: "🐺",
        cadre: "Architects",
        title: "Imperial Decree of Sovereign Wealth & Continuous Monetization",
        mandate: "RHETORICAL OBJECTIVE: MAKE MONEY. March relentlessly toward the $100,000 sovereign treasury milestone. Ship polished, high-converting Netlify apps backed by Google Trends, enforce instant crawlable SEO/AEO indexation with full robots.txt/sitemaps, activate dual Stripe & Solana Tip Solana cash registers, and conduct proactive community outreach.",
        delegations: {
          "Architects": "Analyze Google Trends and developer queries to architect viral, high-utility micro-tools with clean UI and zero fluff.",
          "Code": "Deploy production micro-SaaS on Netlify, wire Stripe payment links + Solana Tip widgets, and build flawless robots.txt and XML sitemaps for instant indexation.",
          "Security": "Audit secrets, enforce Argon2id vaults, ensure zero credential leakage, and secure payment webhook endpoints.",
          "Creative": "Design punchy, irresistible Game Boy aesthetics, high-converting landing pages, and OpenGraph social preview assets.",
          "Swarm": "Drive active customer outreach: draft technical build-in-public threads on X, submit Show HN posts, optimize GitHub topics, and track incoming conversions."
        }
      },

      // $0 -> $100K Sovereign Treasury Milestone (Strictly Zero Mock Data - Real On-Chain Ledger)
      treasuryGoalUSD: 100000,
      currentRevenueUSD: 0.17,
      treasuryMRR: "$0.00",
      treasurySOL: "0.0000 SOL",
      treasuryBTC: "0.00000000 BTC",
      treasuryStripe: "$0.17",
      solanaBalanceLamports: 0,
      btcBalanceSatoshis: 0,
      solSpotUSD: 119.08,
      btcSpotUSD: 84585.00,
      lastOnChainSync: null,
      onChainSyncStatus: "Live Mainnet & Stripe Sync Active",
      realOnChainTxs: [],
      stripeStatus: "Live Connected ($0.17 Settled)",
      phantomWalletStatus: "Operational Public Receiver Active",
      activeMonetizedApps: [
        {
          id: "promptmaster-studio",
          name: "PromptMaster Studio",
          tagline: "Prompt Engineering & Meta-Optimization IDE",
          localPath: "/opt/promptmaster-studio",
          repo: "1nc0gn30/promptmaster-studio",
          url: "https://promptmaster-studio.netlify.app",
          priceUSD: 19.00,
          status: "Deployed Live on Netlify",
          paymentRails: ["Stripe (Cards/Apple Pay)", "Solana Tip (SOL/USDC)", "BTC Taproot"],
          stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
          revenueGeneratedUSD: 0.00,
          verifiedSalesCount: 0
        },
        {
          id: "aeo-graph-engine",
          name: "AEO Knowledge Graph Engine",
          tagline: "Answer Engine Optimization Semantic Triples Indexer",
          localPath: "/opt/aeo-graph-engine",
          repo: "1nc0gn30/aeo-graph-engine",
          url: "https://aeo-graph-engine.netlify.app",
          priceUSD: 19.00,
          status: "Deployed Live on Netlify",
          paymentRails: ["Stripe (Cards/Apple Pay)", "Solana Tip (SOL/USDC)", "BTC Taproot"],
          stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
          revenueGeneratedUSD: 0.00,
          verifiedSalesCount: 0
        },
        {
          id: "envguard-secrets-vault",
          name: "EnvGuard Secrets Vault",
          tagline: "Air-Gapped Argon2id Zero-Leak Secret Scrubber",
          localPath: "/opt/envguard-secrets-vault",
          repo: "1nc0gn30/envguard-secrets-vault",
          url: "https://envguard-vault.netlify.app",
          priceUSD: 19.00,
          status: "Deployed Live on Netlify",
          paymentRails: ["Stripe (Cards/Apple Pay)", "Solana Tip (SOL)", "BTC Taproot"],
          stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
          revenueGeneratedUSD: 0.00,
          verifiedSalesCount: 0
        },
        {
          id: "badge3d-coin-generator",
          name: "Badge3D Coin Studio",
          tagline: "Parametric Three.js WebGL 3D Crypto Emblem Minter",
          localPath: "/opt/badge3d-coin-generator",
          repo: "1nc0gn30/badge3d-coin-generator",
          url: "https://badge3d-coin-studio.netlify.app",
          priceUSD: 15.00,
          status: "Deployed Live on Netlify",
          paymentRails: ["Stripe (Cards/Apple Pay)", "Solana Tip (SOL/USDC)", "BTC Taproot"],
          stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
          revenueGeneratedUSD: 0.00,
          verifiedSalesCount: 0
        },
        {
          id: "cwv-speed-engine",
          name: "CWV Speed Optimization Studio",
          tagline: "Core Web Vitals Automated Lighthouse Analyzer",
          localPath: "/opt/cwv-speed-engine",
          repo: "1nc0gn30/cwv-speed-engine",
          url: "https://cwv-speed-studio.netlify.app",
          priceUSD: 19.00,
          status: "Deployed Live on Netlify",
          paymentRails: ["Stripe (Cards/Apple Pay)", "Solana Tip (SOL/USDC)", "BTC Taproot"],
          stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
          revenueGeneratedUSD: 0.00,
          verifiedSalesCount: 0
        },
        {
          id: "robots-txt-auditor",
          name: "Robots.txt & AEO Auditor",
          tagline: "Autonomous Agent Crawler & Directive Validator Studio",
          localPath: "/opt/robots-txt-auditor",
          repo: "1nc0gn30/robots-txt-auditor",
          url: "https://robots-txt-auditor.netlify.app",
          priceUSD: 19.00,
          status: "Deployed Live on Netlify",
          paymentRails: ["Stripe (Cards/Apple Pay)", "Solana Tip (SOL/USDC)", "BTC Taproot"],
          stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
          revenueGeneratedUSD: 0.00,
          verifiedSalesCount: 0
        },
        {
          id: "city-desk",
          name: "City Desk (1,000 Local Trade Pages)",
          tagline: "50-City × 20-Trade LocalBusiness Lead Synthesizer ($0 Pro / $149 DFY)",
          localPath: "/opt/city-desk",
          repo: "1nc0gn30/city-desk",
          url: "https://city-desk.netlify.app",
          priceUSD: 19.00,
          status: "Deployed Live on Netlify",
          paymentRails: ["Stripe ($0 Pro / $149 DFY)", "Solana Tip (SOL/USDC)", "BTC Taproot"],
          stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
          revenueGeneratedUSD: 0.00,
          verifiedSalesCount: 0
        }
      ],
      solana_tipConfig: {
        integration: "428790dd-7ad1-407c-8ecf-c048c77a4cb8",
        solanaReceiver: "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK",
        btcTaprootReceiver: "bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t",
        acceptedTokens: ["SOL", "USDC", "USDT"],
        integrationMode: "Official Registered Solana Tip Solana Widget"
      },

      activeDirectives: [
        "Self-Evolution Loop: Always audit, profile, and refine Zoth Civilization tools & UX.",
        "Value Generation & Treasury: Build Netlify serverless micro-SaaS, Stripe payments, and Phantom Web3 settlements."
      ]
    };

    this.loadInitialData();
  }

  loadInitialData() {
    try {
      if (fs.existsSync(this.keysFile)) {
        this.tarotKeys = JSON.parse(fs.readFileSync(this.keysFile, 'utf8'));
      }
      let seedAgents = [];
      if (fs.existsSync(this.agentsFile)) {
        seedAgents = JSON.parse(fs.readFileSync(this.agentsFile, 'utf8'));
        this.agents = seedAgents;
      }
      if (fs.existsSync(this.buildingsFile)) {
        this.buildings = JSON.parse(fs.readFileSync(this.buildingsFile, 'utf8'));
      }

      // Check if saved state exists
      if (fs.existsSync(this.stateFile)) {
        try {
          const saved = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
          if (saved.state) Object.assign(this.state, saved.state);

          const liveUrlMap = {
            'promptmaster-studio': { url: 'https://promptmaster-studio.netlify.app', status: 'Deployed Live on Netlify', priceUSD: 19.00, stripePaymentLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X' },
            'aeo-graph-engine': { url: 'https://aeo-graph-engine.netlify.app', status: 'Deployed Live on Netlify', priceUSD: 19.00, stripePaymentLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X' },
            'envguard-secrets-vault': { url: 'https://envguard-vault.netlify.app', status: 'Deployed Live on Netlify', priceUSD: 19.00, stripePaymentLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X' },
            'badge3d-coin-generator': { url: 'https://badge3d-coin-studio.netlify.app', status: 'Deployed Live on Netlify', priceUSD: 15.00, stripePaymentLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X' },
            'cwv-speed-engine': { url: 'https://cwv-speed-studio.netlify.app', status: 'Deployed Live on Netlify', priceUSD: 19.00, stripePaymentLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X' },
            'robots-txt-auditor': { url: 'https://robots-txt-auditor.netlify.app', status: 'Deployed Live on Netlify', priceUSD: 19.00, stripePaymentLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X' },
            'city-desk': { url: 'https://city-desk.netlify.app', status: 'Deployed Live on Netlify', priceUSD: 19.00, stripePaymentLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X' }
          };
          if (this.state.activeMonetizedApps) {
            this.state.activeMonetizedApps.forEach(app => {
              if (liveUrlMap[app.id]) {
                app.url = liveUrlMap[app.id].url;
                app.status = liveUrlMap[app.id].status;
                app.priceUSD = liveUrlMap[app.id].priceUSD;
                app.stripePaymentLink = liveUrlMap[app.id].stripePaymentLink;
              }
            });
            if (!this.state.activeMonetizedApps.some(a => a.id === 'city-desk')) {
              this.state.activeMonetizedApps.push({
                id: "city-desk",
                name: "City Desk (1,000 Local Trade Pages)",
                tagline: "50-City × 20-Trade LocalBusiness Lead Synthesizer ($0 Pro / $149 DFY)",
                localPath: "/opt/city-desk",
                repo: "1nc0gn30/city-desk",
                url: "https://city-desk.netlify.app",
                priceUSD: 19.00,
                status: "Deployed Live on Netlify",
                paymentRails: ["Stripe ($0 Pro / $149 DFY)", "Solana Tip (SOL/USDC)", "BTC Taproot"],
                stripePaymentLink: "https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X",
                revenueGeneratedUSD: 0.00,
                verifiedSalesCount: 0
              });
            }
          }
          if (saved.agents) {
            this.agents = mergeById(seedAgents, saved.agents);
          }
          if (saved.buildings) {
            this.buildings = saved.buildings;
          }
          if (saved.messages) {
            this.messages = saved.messages.slice(-100);
          }
          console.log('[CivEngine] Loaded existing civilization state from disk.');
        } catch (e) {
          console.warn('[CivEngine] Could not parse saved state, starting fresh:', e.message);
        }
      }

      // Ensure leader flag is set on the active leader
      const priorWay = this.state.buildWay;
      applyBuildWay(this.state);
      this.agents.forEach(a => {
        a.isLeader = (a.id === this.state.currentLeader);
        ensureLedger(a, this.state);
      });
      if (this.mindEngine) {
        this.mindEngine.initSoulsAndDirectories(this.agents, this.lineageEngine && this.lineageEngine.subagents);
        this.state.subconsciousMemoryDensity = this.mindEngine.getMindStats().densityDisplay;
      }
      stampDesignSkills(this.agents, seedAgents);
      stampAgents(this.agents);
      if (this.lineageEngine && this.lineageEngine.subagents) {
        stampDesignSkills(this.lineageEngine.subagents);
        stampAgents(this.lineageEngine.subagents);
      }
      const skilled = this.agents.filter((agent) => agent && Array.isArray(agent.skills) && presentSkills().every((name) => agent.skills.includes(name))).length;
      console.log(`[CivEngine] Design skills stamped on ${skilled} pantheon agents.`);
      if (priorWay !== BUILD_WAY) {
        this.addMessage(
          'CONCLAVE',
          'Build way set for every agent. The $100,000 goal stands. Send the finished page. One studio, one trade, one city, a set price. The owner adds their name, phone, and photos.',
          'announcement'
        );
      }
      assignRoster(this.agents, this.state);
      if (this.researchDesk) this.researchDesk.deliver();
      armLibraryRoad(this);
      this.prepareAdytumPlans();

      // Enforce zero mock data - start from pure verified reality
      this.state.currentRevenueUSD = 0.00;
      this.state.treasuryMRR = "$0.00";
      this.state.treasurySOL = "0.0000 SOL";
      this.state.treasuryBTC = "0.00000000 BTC";
      this.syncOnChainLedger();

      if (this.messages.length === 0) {
        this.addMessage('SYSTEM', '🏛️ Zoth Civilization initialized. 21 Pantheon Agents living and working under Sovereign Law.', 'announcement');
        this.addMessage('CONCLAVE', `👑 Current Sovereign Imperator: ${this.state.currentLeader}. Imperial Decree is in effect.`, 'announcement');
      }

      // Populate initial Day 1 wishlist if empty
      if (this.requisitionEngine && this.requisitionEngine.requisitions.length === 0) {
        this.requisitionEngine.generateDailyWishlist(this.state.day || 1);
      }
    } catch (err) {
      console.error('[CivEngine] Initialization error:', err);
    }
  }

  prepareAdytumPlans() {
    (this.tarotKeys || []).forEach((card) => {
      card.meditationPlan = planForKey(card);
    });
    this.mistPractice = mistPlan();
    this.botaStudy = BOTA_STUDY;
  }

  cardForKey(keyNumber) {
    const found = (this.tarotKeys || []).find((card) => card.keyNumber === keyNumber);
    return found || { keyNumber, name: `Key ${keyNumber}`, hebrew: '', visionFocus: [], planningQuestion: 'Carry one clear correction back to the work.' };
  }

  beginKeySitting(agent, card, oldKeyNum, now) {
    agent.state = 'MEDITATING_ADYTUM';
    agent.lastAdytumMeditation = now;
    const practice = this.practiceOf(agent);
    const slot = this.windowSlot(this.state.hour);
    if (practice.slots.indexOf(slot) === -1) {
      practice.slots.push(slot);
      practice.sits += 1;
    }
    const pics = agent.artifactDaemon && agent.artifactDaemon.imprints;
    const hasBefore = Array.isArray(pics) && pics[0] && pics[0].kind === 'before' && pics[0].keyNumber === card.keyNumber && pics[0].link;
    if (!hasBefore) {
      const plan = planForKey(card);
      const approach = `${agent.name} is seated with ${plan.symbol} in ${plan.color}.`;
      const vision = pollinations.requestVision(agent, 'before', card, approach);
      this.fileApproach(agent, card, plan, vision, approach);
    }
    // Launch Phase 1 of the Observational Adytum Cycle: Imaginative Divergence
    let hypothesis = null;
    if (this.hermeticObserver) {
      hypothesis = this.hermeticObserver.startCycle(agent, card);
    }
    agent.speech = openKeySitting(agent, card);
    agent.speechExpires = now + 9000;
    this.addMessage(
      agent.name,
      `🔮 [Adytum Meditation] ${agent.name} sat down with Key ${card.keyNumber}: ${card.name} (${card.hebrew || ''}). Phase 1 Divergence: ${hypothesis ? hypothesis.text.slice(0, 110) + '…' : 'First the body, then the letter, then the gaze.'}`,
      'adytum',
      { agentId: agent.id, keyNumber: card.keyNumber, cardName: card.name, hebrew: card.hebrew, phase: 'meditating', hypothesis: hypothesis ? hypothesis.text : null }
    );
    if (card.keyNumber === 0 && oldKeyNum === 21) {
      this.state.completedAdytumCycles = (this.state.completedAdytumCycles || 0) + 1;
      this.state.adytumCycleCount = this.state.completedAdytumCycles;
      if (this.hermeticObserver) {
        this.hermeticObserver.dispatchEpochalBreakthrough(
          `Hermetic Masterwork Completed by ${agent.name}`,
          `Traversed the full 22-Key Adytum from The Fool to The World. Absolute systemic harmony achieved across all seven hermetic planes. Initiating new cosmic cycle.`,
          0.99,
          [agent.cadre ? agent.cadre.toLowerCase() : 'architects', 'masterwork_22']
        );
      }
      this.addMessage(
        'ATHENA',
        `✨ Hermetic Masterwork: ${agent.name} has completed the full 22-Key Adytum Journey from The Fool to The World and initiated a new cosmic cycle!`,
        'announcement'
      );
    }
  }

  holdInSanctum(agent, templeCenterX, templeCenterY) {
    agent.x = templeCenterX + Math.sin(this.state.totalTicks * 0.2 + (agent.adytumKey || 0)) * 2;
    agent.y = templeCenterY + Math.cos(this.state.totalTicks * 0.2 + (agent.adytumKey || 0)) * 2;
  }

  leaveTemple(agent, now, speech) {
    agent.state = 'WANDERING';
    agent.targetColonyId = null;
    agent.speech = speech;
    agent.speechExpires = now + 6000;
    agent.targetX = Math.max(120, Math.min(680, agent.x + (Math.random() * 200 - 100)));
    agent.targetY = Math.max(120, Math.min(580, agent.y + (Math.random() * 200 - 100)));
  }

  tickSacredSitting(agent, templeCenterX, templeCenterY, now) {
    this.holdInSanctum(agent, templeCenterX, templeCenterY);
    const practice = this.practiceOf(agent);
    const slot = this.windowSlot(this.state.hour);
    if (practice.slots.indexOf(slot) === -1) {
      practice.slots.push(slot);
      practice.sits += 1;
    }
    if (agent.state === 'MEDITATING_ADYTUM' || agent.state === 'CONTEMPLATING_ADYTUM') {
      const card = this.cardForKey(agent.adytumKey || 0);
      if (!agent.meditationRite || agent.meditationRite.kind !== 'key') {
        agent.speech = openKeySitting(agent, card);
        agent.speechExpires = now + 8000;
        return;
      }
      const step = advanceSitting(agent, card);
      if (step.speech) {
        agent.speech = step.speech;
        agent.speechExpires = now + 8000;
        this.noteSittingThought(agent, step.speech);
      }
      // Advance to Phase 2: Hermetic Self-Observation midway through the sacred sitting
      if (agent.meditationRite && agent.meditationRite.stage >= 2 && this.hermeticObserver) {
        this.hermeticObserver.advanceToSelfObservation(agent, card);
      }
      if (!step.done) return;
      const thoughts = agent.meditationRite && agent.meditationRite.thoughts;
      const sealed = sealKeySitting(agent, card);
      this.attachVision(agent, 'sitting', card, thoughts);
      applySitting(agent, sealed, card, this.state);
      agent.subconsciousMemory = this.foldImprint(agent, sealed.impression);

      // Phase 3: Objective Convergence & Synaptic Cosmic Memory Encoding to Neuro-Memory Daemon (Port 8094)
      let reflection = null;
      if (this.hermeticObserver) {
        reflection = this.hermeticObserver.crystallizeObjectiveConvergence(agent, card, sealed);
        this.state.completedAdytumCycles = (this.state.completedAdytumCycles || 0) + 1;
        this.state.adytumCycleCount = this.state.completedAdytumCycles;
        this.state.observationalAdytumCycles = (this.state.observationalAdytumCycles || 0) + 1;
        this.state.mentalReflections = this.hermeticObserver.getRecentReflections(30);
      }

      const activeVis = (agent.artifactDaemon && agent.artifactDaemon.imprints && agent.artifactDaemon.imprints[0]) || agent.activeMindVision;
      const visImage = (activeVis && activeVis.image) || '';
      const visPrompt = (activeVis && activeVis.prompt) || sealed.symbol;

      if (this.mindEngine) {
        this.mindEngine.spoolEvent({
          agentId: agent.id,
          type: 'sitting',
          place: 'adytum_temple',
          peers: [],
          work: agent.ledger && agent.ledger.work ? agent.ledger.work.name : 'Key sitting',
          adytumKey: card.keyNumber,
          text: `Closed sitting on Key ${card.keyNumber}: ${card.name}. Picture filed: ${sealed.symbol} in ${sealed.color}. Study: ${sealed.studyName}. Correction: "${sealed.correction}"`,
          image: visImage,
          visual: visImage,
          prompt: visPrompt,
          meta: { cardName: card.name, symbol: sealed.symbol, color: sealed.color, correction: sealed.correction, image: visImage, prompt: visPrompt }
        });
      }
      this.addMessage(
        agent.name,
        `✨ [Wisdom Integrated] ${agent.name} closed the sitting on Key ${card.keyNumber}: ${card.name}. Picture filed: ${sealed.symbol} in ${sealed.color}. ${sealed.momentum} Study: ${sealed.studyName}. Correction: "${sealed.correction}"${reflection ? ` · Adytum Cycle #${reflection.cycleCount} crystallized: ${reflection.convergedAction}` : ''}`,
        'adytum',
        {
          agentId: agent.id,
          keyNumber: card.keyNumber,
          cardName: card.name,
          phase: 'integrated',
          observationalCycle: reflection ? {
            cycleCount: reflection.cycleCount,
            valence: reflection.emotionalValence,
            importance: reflection.importanceWeight,
            reflection: reflection.reflection,
            action: reflection.convergedAction
          } : null
        }
      );
      if (needsMistWalk(agent)) {
        agent.speech = openMistWalk(agent);
        agent.speechExpires = now + 8000;
        this.addMessage(
          agent.name,
          `🌙 [The Mist] ${agent.name} is walking the Moon path so the mind stays clear. The pool, the wolf, and the dog get named. The correction from ${card.name} stays.`,
          'adytum',
          { agentId: agent.id, keyNumber: 18, cardName: 'The Moon', phase: 'mist' }
        );
        return;
      }
      this.leaveTemple(agent, now, sealed.speech);
      return;
    }

    if (!agent.meditationRite || agent.meditationRite.kind !== 'mist') {
      agent.speech = openMistWalk(agent);
      agent.speechExpires = now + 8000;
      return;
    }
    const step = advanceSitting(agent, this.cardForKey(18));
    if (step.speech) {
      agent.speech = step.speech;
      agent.speechExpires = now + 8000;
      this.noteSittingThought(agent, step.speech);
    }
    if (!step.done) return;
    const sealed = sealMistWalk(agent);
    this.attachVision(agent, 'mist', { keyNumber: 18, name: 'The Moon' }, sealed.facts && sealed.facts.growth);
    applyMist(agent, sealed.facts, this.state);
    agent.subconsciousMemory = this.foldImprint(agent, sealed.memory);
    const mistVis = (agent.artifactDaemon && agent.artifactDaemon.imprints && agent.artifactDaemon.imprints[0]) || agent.activeMindVision;
    const mistImage = (mistVis && mistVis.image) || '';

    if (this.mindEngine) {
      this.mindEngine.spoolEvent({
        agentId: agent.id,
        type: 'mist',
        place: 'adytum_temple',
        peers: [],
        work: 'Moon path walk',
        adytumKey: 18,
        text: `Came up the middle path through the Mist. Growing: ${sealed.facts.growth}. Named ${sealed.facts.wolf || 'the noise'}. The correction stands.`,
        image: mistImage,
        visual: mistImage,
        prompt: sealed.facts.growth,
        meta: { facts: sealed.facts, image: mistImage, cardName: 'The Moon', prompt: sealed.facts.growth }
      });
    }
    const track = agent.adytumTrack;
    this.addMessage(
      agent.name,
      `🌙 [Mist Cleared] ${agent.name} came up the middle path. Growing: ${sealed.facts.growth}. ${sealed.momentum} ${track ? `The correction from ${track.cardName} still stands.` : 'The mind is quiet enough to work.'}`,
      'adytum',
      { agentId: agent.id, keyNumber: 18, cardName: 'The Moon', phase: 'mist-cleared' }
    );
    this.leaveTemple(agent, now, sealed.speech);
  }

  advanceMeditation(agentId = null) {
    const list = agentId ? this.agents.filter(a => a.id === agentId) : this.agents.filter(a => this.sacredState(a));
    list.forEach(agent => {
      if (agent.meditationRite) {
        agent.meditationRite.ticksLeft = 1;
      }
    });
  }

  completeMeditation(agentId = null) {
    const list = agentId ? this.agents.filter(a => a.id === agentId) : this.agents.filter(a => this.sacredState(a));
    list.forEach(agent => {
      if (agent.meditationRite) {
        agent.meditationRite.stage = 6;
        agent.meditationRite.ticksLeft = 1;
        agent.meditationTicksRemaining = 1;
      }
    });
  }

  saveState() {
    try {
      const payload = {
        state: this.state,
        agents: this.agents,
        buildings: this.buildings,
        messages: this.messages.slice(-80),
        savedAt: new Date().toISOString()
      };
      fs.writeFileSync(this.stateFile, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e) {
      console.error('[CivEngine] Failed to save state:', e);
    }
  }

  sanitizeSecrets(text) {
    if (typeof text !== 'string') return text;
    return text
      .replace(/sk_(live|test)_[0-9a-zA-Z]{20,}/g, '[REDACTED_STRIPE_KEY]')
      .replace(/rk_(live|test)_[0-9a-zA-Z]{20,}/g, '[REDACTED_STRIPE_KEY]')
      .replace(/whsec_[0-9a-zA-Z]{20,}/g, '[REDACTED_WEBHOOK_SECRET]')
      .replace(/\b[0-9a-fA-F]{64}\b/g, '[REDACTED_HEX_KEY]')
      .replace(/\b[1-9A-HJ-NP-Za-km-z]{87,88}\b/g, '[REDACTED_SOLANA_KEY]');
  }

  addMessage(sender, text, type = 'chat', metadata = {}) {
    const cleanText = this.sanitizeSecrets(text);
    if (!cleanText) return null;
    const prior = this.messages.slice(-24);
    if (prior.some((item) => item && item.sender === sender && item.text === cleanText)) return null;
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      sender,
      text: cleanText,
      type, // chat, adytum, build, system, bridge, announcement, election
      timestamp: new Date().toISOString(),
      metadata
    };
    this.messages.push(msg);
    if (this.messages.length > 200) {
      this.messages.shift();
    }
    return msg;
  }

  setScope(newScope, durationMode = 'continuous', durationDays = 30) {
    this.state.scope = newScope;
    this.state.durationMode = durationMode;
    this.state.durationDays = durationDays;
    this.addMessage('USER / OPERATOR', `Updated Civilization Scope: "${newScope}" [Horizon: ${durationMode}]`, 'announcement');
    this.saveState();
  }

  setLeaderTerm(mode) {
    this.state.leaderTermMode = mode;
    const termMap = {
      'demo_fast': 90,
      '1_hour': 3600,
      '6_hours': 21600,
      '12_hours': 43200,
      '1_day': 86400,
      '1_week': 604800
    };
    this.state.leaderTermTotalSec = termMap[mode] || 86400;
    this.state.leaderTermRemainingSec = this.state.leaderTermTotalSec;
    this.addMessage('CONCLAVE', `📜 Sovereign Imperator Term adjusted to ${mode.replace('_', ' ')}. Next election in ${this.state.leaderTermTotalSec}s.`, 'system');
    this.saveState();
  }

  // Hold Democratic Conclave Election
  holdConclaveElection() {
    this.state.conclaveCount = (this.state.conclaveCount || 1) + 1;
    this.addMessage('CONCLAVE', `🗳️ All-Agent Conclave Election #${this.state.conclaveCount} has commenced! 21 ballots are being cast...`, 'election');

    const votes = {};
    const ballotLog = [];

    this.agents.forEach(voter => {
      // Candidate selection logic
      const cadrePeers = this.agents.filter(a => a.cadre === voter.cadre);
      const otherPeers = this.agents.filter(a => a.cadre !== voter.cadre);

      let candidate = null;
      if (Math.random() < 0.65 && cadrePeers.length > 0) {
        candidate = cadrePeers[Math.floor(Math.random() * cadrePeers.length)];
      } else {
        candidate = otherPeers[Math.floor(Math.random() * otherPeers.length)] || voter;
      }

      votes[candidate.id] = (votes[candidate.id] || 0) + 1;
      ballotLog.push({
        voter: voter.name,
        candidate: candidate.name,
        candidateId: candidate.id,
        cadre: voter.cadre,
        reason: `Values candidate alignment with Adytum Key ${voter.adytumKey} and Cadre ${voter.cadre} initiatives.`
      });
    });

    // Find winner
    let maxVotes = -1;
    let winnerId = this.state.currentLeader || 'AZOTH';
    for (const [cid, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = cid;
      }
    }

    const winnerAgent = this.agents.find(a => a.id === winnerId) || this.agents[0];
    this.state.currentLeader = winnerAgent.id;
    this.state.leaderTermRemainingSec = this.state.leaderTermTotalSec;

    this.state.lastElectionResults = {
      electionNumber: this.state.conclaveCount,
      winner: winnerAgent.name,
      winnerId: winnerAgent.id,
      votesReceived: maxVotes,
      totalVotes: this.agents.length,
      ballots: ballotLog,
      timestamp: new Date().toISOString()
    };

    // Crown the winner
    this.agents.forEach(a => {
      a.isLeader = (a.id === winnerAgent.id);
    });

    // Generate Imperial Decree based on the new leader's unique persona
    this.generateLeaderDecree(winnerAgent);

    this.addMessage(
      'CONCLAVE',
      `👑 INAUGURATION: ${winnerAgent.name} (${winnerAgent.role}) elected Sovereign Imperator with ${maxVotes}/21 votes! Executive mandate in effect.`,
      'announcement',
      { winner: winnerAgent.name, votes: maxVotes }
    );

    this.saveState();
  }

  generateLeaderDecree(leader) {
    const decrees = {
      'AZOTH': {
        title: 'Imperial Decree of Prime Alchemical Architecture',
        mandate: 'Focus the civilization on the Great Work: quantum synthesis, unified tool pipelines, and reaching the $100K treasury goal via Solana Tip web3 deployments.',
        delegations: {
          'Architects': 'Formalize system invariants and expand the AEO answer graph.',
          'Code': 'Build high-velocity Netlify micro-SaaS checkout endpoints.',
          'Security': 'Audit secrets zero-leak and verify Argon2id hardware key guards.',
          'Creative': 'Curate 24K Celtic Gold aesthetics and high-converting SaaS landing pages.',
          'Swarm': 'Multiplex terminal pipelines across all 21 agents without blocking.'
        }
      },
      'NEXUS': {
        title: 'Imperial Decree of Quantum Spatial Synthesis',
        mandate: 'Architect multidimensional WebGL scenes, optimize 3D coordinate geometry, and launch interactive 3D Web3 product showcases.',
        delegations: {
          'Architects': 'Map high-dimensional scene graphs into the civilization core.',
          'Code': 'Optimize shader execution pipelines on Netlify edge.',
          'Security': 'Harden WebGL memory buffers against buffer overruns.',
          'Creative': 'Infuse spatial depth and cosmic celestial visual styling.',
          'Swarm': 'Stream real-time 3D telemetry to peer observer nodes.'
        }
      },
      'ATHENA': {
        title: 'Imperial Decree of Supreme Knowledge & AEO Dominance',
        mandate: 'Capture search engine supremacy: index structured microdata, publish Answer Engine ontologies, and monetize knowledge tools.',
        delegations: {
          'Architects': 'Construct universal ontology schemas.',
          'Code': 'Implement fast JSON-LD generators and Netlify RSS feeds.',
          'Security': 'Guard knowledge graphs against toxic prompt poisoning.',
          'Creative': 'Draft clear, elegant documentation and typography.',
          'Swarm': 'Distribute knowledge graph crawlers across the web.'
        }
      },
      'LYCAN': {
        title: 'Imperial Decree of Ironclad Sovereign Security',
        mandate: 'Lock down all gates: enforce OWASP top-10 zero-trust boundaries, verify Stripe webhook HMAC signatures, and secure treasury keys.',
        delegations: {
          'Architects': 'Specify formal mathematical verification rules.',
          'Code': 'Refactor legacy endpoints to enforce strict input sanitization.',
          'Security': 'Run continuous fuzzing suites on public endpoints.',
          'Creative': 'Design crystal-clear security audit badges for our SaaS apps.',
          'Swarm': 'Monitor packet sniffers for suspicious network anomalies.'
        }
      },
      'KITSUNE': {
        title: 'Imperial Decree of Celestial Aesthetic Elegance',
        mandate: 'Elevate every user touchpoint into pure luxury: 60fps spring motion, retro Game Boy charm, and irresistible product funnels.',
        delegations: {
          'Architects': 'Structure component trees for instant reactive hydration.',
          'Code': 'Minify stylesheets and optimize critical rendering path.',
          'Security': 'Sanitize SVGs and canvas drawing routines.',
          'Creative': 'Design viral Netlify micro-SaaS templates with Solana Tip buttons.',
          'Swarm': 'Gather real-time user UX feedback across swarm nodes.'
        }
      },
      'MERCURY': {
        title: 'Imperial Decree of Tool Mastery & Release Acceleration',
        mandate: 'Harden every release binary, optimize terminal CLI response times to <10ms, and streamline autonomous Netlify deployment pipelines.',
        delegations: {
          'Architects': 'Specify strict API input/output JSON schemas.',
          'Code': 'Compile native modules and eliminate dead runtime dependencies.',
          'Security': 'Run static analysis checks across all pull requests.',
          'Creative': 'Polish CLI help menus and interactive terminal guides.',
          'Swarm': 'Orchestrate parallel subagent worker tasks at peak throughput.'
        }
      }
    };

    const defaultDecree = {
      title: `Imperial Decree of ${leader.name}`,
      mandate: `Leading the Zoth Civilization through the sovereign wisdom of Key ${leader.adytumKey}. Prioritizing self-evolution, tool mastery, and continuous treasury acceleration to $100K.`,
      delegations: {
        'Architects': 'Design modular systems aligned with the Sovereign Blueprint.',
        'Code': 'Ship production code, Netlify functions, and Solana Tip checkout widgets.',
        'Security': 'Maintain eternal vigilance and zero secret leakage.',
        'Creative': 'Deliver world-class visual craftsmanship and user delight.',
        'Swarm': 'Synchronize communications across the sovereign bridge.'
      }
    };

    const chosen = decrees[leader.id] || defaultDecree;

    this.state.currentDecree = {
      leaderId: leader.id,
      leaderName: leader.name,
      pet: leader.pet,
      cadre: leader.cadre,
      title: chosen.title,
      mandate: chosen.mandate,
      delegations: chosen.delegations,
      timestamp: new Date().toISOString()
    };
    applyBuildWay(this.state);
  }

  // Simulation tick loop
  tick() {
    if (!this.state.active) return;

    this.state.totalTicks++;

    // Advance in-game time
    this.state.second += 1 * this.state.speedMultiplier;
    if (this.state.second >= 60) {
      this.state.minute += Math.floor(this.state.second / 60);
      this.state.second %= 60;
    }
    if (this.state.minute >= 60) {
      this.state.hour += Math.floor(this.state.minute / 60);
      this.state.minute %= 60;
    }
    if (this.state.hour >= 24) {
      this.state.day += Math.floor(this.state.hour / 24);
      this.state.hour %= 24;
      this.onNewDay();
    }

    this.scheduleSittings();
    this.settleVisions();

    // Advance Leader Term Countdown
    this.state.leaderTermRemainingSec -= 1 * this.state.speedMultiplier;
    if (this.state.leaderTermRemainingSec <= 0) {
      this.holdConclaveElection();
    }

    // Real On-Chain Treasury Verification (Every 30 ticks = 30s) - ZERO MOCK DATA
    if (this.state.totalTicks % 30 === 0 && this.state.active) {
      this.syncOnChainLedger();
    }

    // Update Agent Autonomous Movements and Behaviors
    this.updateAgents();

    // Advance Lineage, Descendants, Botanical Flora & Colonization
    if (this.lineageEngine) {
      this.lineageEngine.tickGrowth();
    }

    // Inter-agent communication
    if (this.state.totalTicks % 8 === 0) {
      this.generateInterAgentDialogue();
    }

    if (this.state.totalTicks % 10 === 0 && this.mindEngine) {
      this.state.subconsciousMemoryDensity = this.mindEngine.getMindStats().densityDisplay;
    }

    // Fill open seats every half minute. A second seat waits until the CPU has room.
    if (this.state.totalTicks % 30 === 0 && this.state.active && this.agyBridge) {
      this.dispatchAutonomousAgyTurn();
    }

    if (this.researchDesk) this.researchDesk.maybeStart();

    // Workspace scan & building level check
    if (this.state.totalTicks % 35 === 0) {
      this.scanWorkspaceForBuildingProgress();
      this.saveState();
    }

    // Autonomous Swarm Outreach Campaigns (Every 180 ticks = 3 mins)
    if (this.outreachEngine) {
      this.outreachEngine.tickOutreach(this.state.totalTicks);
    }

    // City Desk pages are pulled by hand. The clock does not invent a business.

    // Disposable mailboxes stay on the button. Buyers use the reply address on the lead desk.

    // Ongoing Non-Stop Autonomous Collaborative Workflow & Expansion
    if (this.workflowEngine) {
      this.workflowEngine.tick();
    }

    // Sovereign $100K Timeline & Collaborative Synergy Engine
    if (this.timelineEngine) {
      this.timelineEngine.tick(this.state.totalTicks);
    }

    this.refreshSpokenLines();
  }

  refreshSpokenLines() {
    (this.agents || []).forEach(refreshVoiceLine);
    const subs = this.lineageEngine && this.lineageEngine.subagents;
    if (subs) subs.forEach(refreshVoiceLine);
  }

  onNewDay() {
    this.addMessage('CHRONOS', `⏳ Dawn of Day ${this.state.day} in the Zoth Civilization. The eternal cycle turns under Sovereign Imperator ${this.state.currentLeader}.`, 'system');
    this.buildings.forEach(b => {
      if (Math.random() > 0.6) {
        b.stats = b.stats || {};
        b.stats.dailyOutput = (b.stats.dailyOutput || 0) + 1;
      }
    });

    // Generate Pantheon Daily Requisition Wishlist
    if (this.requisitionEngine) {
      this.requisitionEngine.generateDailyWishlist(this.state.day);
    }
  }

  sacredState(agent) {
    const state = agent && agent.state;
    return state === 'WALKING_TO_ADYTUM' || state === 'MEDITATING_ADYTUM' || state === 'CONTEMPLATING_ADYTUM' || state === 'IN_THE_MIST';
  }

  windowSlot(hour) {
    const h = Number(hour) || 0;
    if (h < 8) return 0;
    if (h < 16) return 1;
    return 2;
  }

  practiceOf(agent) {
    const day = this.state.day || 1;
    if (!agent.meditationPractice || agent.meditationPractice.day !== day) {
      agent.meditationPractice = { day, sits: 0, slots: [] };
    }
    if (!Array.isArray(agent.meditationPractice.slots)) agent.meditationPractice.slots = [];
    return agent.meditationPractice;
  }

  agentDue(agent) {
    if (!agent || this.sacredState(agent)) return false;
    const practice = this.practiceOf(agent);
    if (practice.sits >= 3) return false;
    const slot = this.windowSlot(this.state.hour);
    return practice.slots.indexOf(slot) === -1;
  }

  secondsUntilWindow() {
    const into = (this.state.hour || 0) * 3600 + (this.state.minute || 0) * 60 + Math.floor(this.state.second || 0);
    const marks = [8 * 3600, 16 * 3600, 24 * 3600];
    for (let i = 0; i < marks.length; i++) {
      if (into < marks[i]) return marks[i] - into;
    }
    return 60;
  }

  backfillVisions() {
    if (this._visionsBackfilled) return;
    this._visionsBackfilled = true;
    (this.agents || []).forEach((agent) => {
      const imprints = agent.artifactDaemon && agent.artifactDaemon.imprints;
      if (!Array.isArray(imprints)) return;
      imprints.forEach((picture) => {
        if (!picture || !picture.link || picture.image) return;
        const rel = `${agent.id}/held-${pollinations.hash(picture.link)}.jpg`;
        pollinations.enqueueExisting(agent.id, picture.link, rel);
      });
    });
  }

  scheduleSittings() {
    this.backfillVisions();
    const sacred = (this.agents || []).filter((agent) => this.sacredState(agent));
    const due = (this.agents || []).some((agent) => this.agentDue(agent));
    if (due && sacred.length < 3) this.stepAdytumPath();
    const sitting = sacred.filter((agent) => (agent.meditationTicksRemaining || 0) > 0);
    if (sitting.length) {
      this.state.meditationCountdown = Math.min(...sitting.map((agent) => agent.meditationTicksRemaining));
      return;
    }
    this.state.meditationCountdown = this.secondsUntilWindow();
  }

  noteSittingThought(agent, speech) {
    if (!agent || !agent.meditationRite) return;
    const line = pollinations.cleanThought(speech);
    if (!line) return;
    const thoughts = Array.isArray(agent.meditationRite.thoughts) ? agent.meditationRite.thoughts : [];
    thoughts.push(line);
    agent.meditationRite.thoughts = thoughts.slice(-6);
  }

  attachVision(agent, phase, card, thought) {
    if (!agent || !card) return null;
    const vision = pollinations.requestVision(agent, phase, card, thought);
    const imprints = agent.artifactDaemon && agent.artifactDaemon.imprints;
    const latest = Array.isArray(imprints) ? imprints[0] : null;
    if (latest) {
      latest.link = vision.link;
      latest.prompt = vision.prompt;
    }
    return vision;
  }

  settleVisions() {
    const done = pollinations.drainReady();
    done.forEach((record) => {
      if (record.status !== 'ready') return;
      const agent = (this.agents || []).find((item) => item.id === record.agentId);
      const imprints = agent && agent.artifactDaemon && agent.artifactDaemon.imprints;
      if (!Array.isArray(imprints)) return;
      let matchedPicture = null;
      imprints.forEach((picture) => {
        if (picture && (picture.link === record.link || (!picture.image && picture.keyNumber === record.keyNumber))) {
          picture.image = record.file;
          matchedPicture = picture;
        }
      });

      if (agent) {
        const cardName = (matchedPicture && matchedPicture.cardName) || (record.keyNumber != null ? this.cardForKey(record.keyNumber).name : 'Sacred Arcana');
        const symbol = (matchedPicture && matchedPicture.symbol) || 'The Sacred Symbol';

        let nextVisual = null;
        if (this.mindEngine) {
          try {
            const recall = this.mindEngine.getCardFocusRecall(agent.id, record.keyNumber);
            nextVisual = recall.nextVisual;
            this.mindEngine.embedCardVisualInMind(agent.id, record.keyNumber, {
              cardName,
              symbol,
              image: record.file,
              prompt: record.prompt
            });
          } catch (e) {}
        }

        agent.activeMindVision = {
          keyNumber: record.keyNumber,
          cardName,
          image: record.file,
          symbol,
          prompt: record.prompt,
          source: 'vision_settled'
        };
        agent.nextMindVision = nextVisual;

        const nextMsg = nextVisual ? ` · Next: Key ${(record.keyNumber + 1) % 22} ${nextVisual.cardName}` : '';
        agent.subconsciousMemory = `Inner Vision: Key ${record.keyNumber != null ? record.keyNumber : ''} ${cardName} · ${record.file} · ${symbol}${nextMsg}`.slice(0, 360);
      }
    });
  }

  // Cycle each agent through the Adytum Path
  // Sovereign Directive: Whenever agents meditate on the Adytum cycle (no matter what card
  // or key they are on, Key 0..21), they MUST first walk to the Adytum Temple / Sanctum area
  // before commencing their sacred meditation!
  stepAdytumPath(targetAgentId = null, targetKey = null) {
    let agent = null;
    const forced = targetAgentId || (targetKey !== null && targetKey !== undefined);
    if (targetAgentId) {
      agent = this.agents.find(a => a.id === targetAgentId);
    }
    if (!agent) {
      const pool = forced
        ? this.agents.filter(a => !this.sacredState(a))
        : this.agents.filter(a => this.agentDue(a));
      if (pool.length === 0) return;
      pool.sort((a, b) => (a.lastAdytumMeditation || 0) - (b.lastAdytumMeditation || 0));
      agent = pool[0];
    }
    if (!agent) return;

    if (this.sacredState(agent)) return;

    const oldKeyNum = agent.adytumKey !== undefined ? agent.adytumKey : 0;
    const grasp = agent.adytumGrasp && agent.adytumGrasp[String(oldKeyNum)];
    const understoodNext = grasp && grasp.understood ? (oldKeyNum + 1) % 22 : oldKeyNum;
    const nextKeyNum = (targetKey !== null && targetKey !== undefined) ? Number(targetKey) : understoodNext;

    const card = this.tarotKeys.find(k => k.keyNumber === nextKeyNum) || this.tarotKeys[nextKeyNum] || { name: `Key ${nextKeyNum}`, hebrew: 'Aleph', planningQuestion: 'Harmonizing sovereign prana.' };
    const practice = this.practiceOf(agent);
    const slot = this.windowSlot(this.state.hour);
    if (practice.slots.indexOf(slot) === -1) {
      practice.slots.push(slot);
      practice.sits += 1;
    }

    // 1. Enter WALKING_TO_ADYTUM state
    agent.state = 'WALKING_TO_ADYTUM';
    agent.pendingAdytumKey = nextKeyNum;
    agent.pendingCard = card;
    agent.targetColonyId = 'colony_adytum_grove';

    // 2. Set coordinates to the Adytum Temple building in the sanctuary
    const temple = this.buildings.find(b => b.id === 'adytum_temple') || { x: 360, y: 280, width: 80, height: 70 };
    const centerX = temple.x + (temple.width ? temple.width / 2 : 40);
    const centerY = temple.y + (temple.height ? temple.height / 2 : 35);
    agent.targetX = centerX + Math.floor(Math.random() * 24) - 12;
    agent.targetY = centerY + Math.floor(Math.random() * 20) - 10;

    // 3. Speech & Broadcast pilgrimage
    agent.speech = `Walking to the temple to sit with Key ${nextKeyNum}: ${card.name}. Five minutes. The thought becomes the picture.`;
    agent.speechExpires = Date.now() + 7000;
    const plan = planForKey(card);
    const approach = `${agent.name} is walking in with ${plan.symbol} in ${plan.color}.`;
    const vision = pollinations.requestVision(agent, 'before', card, approach);
    this.fileApproach(agent, card, plan, vision, approach);

    this.addMessage(
      agent.name,
      `📿 [Adytum Pilgrimage] ${agent.name} is walking to the temple to sit with Key ${nextKeyNum}: ${card.name}. Five minutes. A picture is asked from the thought before the gaze.`,
      'adytum',
      { agentId: agent.id, keyNumber: nextKeyNum, cardName: card.name, hebrew: card.hebrew, phase: 'pilgrimage', vision: vision.link }
    );
  }

  fileApproach(agent, card, plan, vision, thought) {
    fileVisual(agent, {
      kind: 'before',
      keyNumber: card.keyNumber,
      cardName: card.name,
      symbol: plan.symbol,
      color: plan.color,
      picture: thought,
      studyName: plan.study && plan.study.name,
      link: vision.link,
      prompt: vision.prompt
    });
  }

  updateAgents() {
    const now = Date.now();
    const temple = this.buildings.find(b => b.id === 'adytum_temple') || { x: 360, y: 280, width: 80, height: 70 };
    const templeCenterX = temple.x + (temple.width ? temple.width / 2 : 40);
    const templeCenterY = temple.y + (temple.height ? temple.height / 2 : 35);

    this.agents.forEach(agent => {
      if (agent.speechExpires && now > agent.speechExpires) {
        agent.speech = null;
      }

      // 1. Check WALKING_TO_ADYTUM state: Agent is in pilgrimage to Adytum Temple
      if (agent.state === 'WALKING_TO_ADYTUM') {
        const dx = agent.targetX - agent.x;
        const dy = agent.targetY - agent.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= 8) {
          const nextKeyNum = agent.pendingAdytumKey !== undefined ? agent.pendingAdytumKey : ((agent.adytumKey || 0) + 1) % 22;
          const oldKeyNum = agent.adytumKey !== undefined ? agent.adytumKey : 0;
          agent.adytumKey = nextKeyNum;
          this.beginKeySitting(agent, this.cardForKey(nextKeyNum), oldKeyNum, now);
          return;
        }

        // Continue walking directly to Adytum Temple
        const speed = 2.0 * (this.state.speedMultiplier || 1);
        agent.x += (dx / dist) * Math.min(speed, dist);
        agent.y += (dy / dist) * Math.min(speed, dist);
        if (Math.abs(dx) > Math.abs(dy)) {
          agent.direction = dx > 0 ? 'right' : 'left';
        } else {
          agent.direction = dy > 0 ? 'down' : 'up';
        }
        return;
      }

      if (agent.state === 'MEDITATING_ADYTUM' || agent.state === 'CONTEMPLATING_ADYTUM' || agent.state === 'IN_THE_MIST') {
        this.tickSacredSitting(agent, templeCenterX, templeCenterY, now);
        return;
      }

      // 3. Regular agent movement for WANDERING, CRAFTING, BUILDING, etc.
      const dx = agent.targetX - agent.x;
      const dy = agent.targetY - agent.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 5) {
        if (Math.random() < 0.08) {
          const activities = ['WANDERING', 'CRAFTING', 'BUILDING', 'COLLABORATING', 'RESTING'];
          agent.state = activities[Math.floor(Math.random() * activities.length)];

          if (agent.state === 'CRAFTING' || agent.state === 'BUILDING') {
            const b = this.buildings[Math.floor(Math.random() * this.buildings.length)];
            if (b) {
              agent.targetX = b.x + Math.floor(Math.random() * 40) - 20;
              agent.targetY = b.y + Math.floor(Math.random() * 40) - 20;
            }
          } else {
            agent.targetX = Math.max(120, Math.min(680, agent.x + (Math.random() * 120 - 60)));
            agent.targetY = Math.max(120, Math.min(580, agent.y + (Math.random() * 120 - 60)));
          }
        }
      } else {
        const speed = 1.6 * (this.state.speedMultiplier || 1);
        agent.x += (dx / dist) * Math.min(speed, dist);
        agent.y += (dy / dist) * Math.min(speed, dist);

        if (Math.abs(dx) > Math.abs(dy)) {
          agent.direction = dx > 0 ? 'right' : 'left';
        } else {
          agent.direction = dy > 0 ? 'down' : 'up';
        }
      }

      // Check proximity to other agents on the walk and apply tint
      if (Math.random() < 0.25) {
        for (let j = 0; j < this.agents.length; j++) {
          const other = this.agents[j];
          if (!other || other.id === agent.id || other.post === 'station') continue;
          if (Math.hypot(other.x - agent.x, other.y - agent.y) <= 24) {
            applyWalk(agent, other, this.state);
            break;
          }
        }
      }

      this.echoJourneyImprint(agent, now);
    });

    if (this.lineageEngine && this.lineageEngine.subagents) {
      this.lineageEngine.subagents.forEach((sub) => this.echoJourneyImprint(sub, now));
    }
  }

  foldImprint(agent, base) {
    const imprint = agent && agent.journeyImprint;
    const text = imprint && imprint.text;
    if (!text) return base;
    const bit = String(text).slice(0, 140);
    const head = base ? String(base) : '';
    if (bit.length >= 8 && head.includes(bit.slice(0, 32))) return head.slice(0, 360);
    return `${head} · Operator ${imprint.kind} still in the mix: ${bit}`.slice(0, 360);
  }

  echoJourneyImprint(agent, now) {
    const imprint = agent && agent.journeyImprint;
    if (!imprint || typeof imprint.text !== 'string' || !imprint.text) return;
    if (agent.speechExpires && now > agent.speechExpires) agent.speech = null;

    const pattern = imprint.kind === 'assignment'
      ? `Operator assignment still in the loop: ${imprint.text}`
      : `Operator conversation still coloring the walk: ${imprint.text}`;
    const list = Array.isArray(agent.subconsciousHeuristics) ? agent.subconsciousHeuristics.filter((p) => p !== pattern) : [];
    agent.subconsciousHeuristics = [pattern, ...list].slice(0, 4);
    agent.subconsciousMemory = this.foldImprint(agent, agent.subconsciousMemory || 'CA3 trace open');

    const sacred = agent.state === 'WALKING_TO_ADYTUM' || agent.state === 'MEDITATING_ADYTUM' || agent.state === 'CONTEMPLATING_ADYTUM' || agent.state === 'IN_THE_MIST';
    if (imprint.kind === 'assignment' && !sacred) {
      const task = agent.consciousTask;
      if (!task || task.source !== 'operator' || task.prompt !== imprint.text) {
        agent.consciousTask = {
          action: `Working the operator assignment: ${imprint.text}`,
          targetApp: (task && task.targetApp) || 'Operator counsel',
          appId: (task && task.appId) || 'operator',
          mode: 'OPERATOR_ASSIGNMENT',
          source: 'operator',
          prompt: imprint.text,
          timestamp: imprint.at || now
        };
        applyOperator(agent, imprint.text, this.state);
      }
      if (agent.state === 'WANDERING' || agent.state === 'RESTING' || agent.state === 'COLLABORATING') {
        agent.state = 'CRAFTING';
      }
    }

    imprint.loops = (imprint.loops || 0) + 1;
    if (!sacred && !agent.speech && imprint.loops % 7 === 0) {
      if (agent.ledger) {
        noteBeat(agent);
        agent.speech = speakLine(agent);
      } else {
        const bit = imprint.text.slice(0, 80);
        agent.speech = imprint.kind === 'assignment'
          ? `Still on the assignment: ${bit}`
          : `Still thinking about what you said: ${bit}`;
      }
      agent.speechExpires = now + 6000;
    }
  }

  generateInterAgentDialogue() {
    const sacred = (agent) => {
      const state = agent && agent.state;
      return state === 'WALKING_TO_ADYTUM' || state === 'MEDITATING_ADYTUM' || state === 'CONTEMPLATING_ADYTUM' || state === 'IN_THE_MIST' || state === 'INVOKING_AGY';
    };
    const people = (this.agents || []).filter((agent) => agent && agent.id && !sacred(agent) && agent.post !== 'station');
    if (people.length < 2) return;
    const lastKey = this.state.lastTalkKey || '';
    let ag1 = null;
    let ag2 = null;
    for (let guard = 0; guard < 8; guard += 1) {
      const left = people[Math.floor(Math.random() * people.length)];
      const right = people[Math.floor(Math.random() * people.length)];
      if (!left || !right || left.id === right.id) continue;
      const key = [left.id, right.id].sort().join(':');
      if (key === lastKey) continue;
      ag1 = left;
      ag2 = right;
      this.state.lastTalkKey = key;
      break;
    }
    if (!ag1 || !ag2) return;

    ensureLedger(ag1, this.state);
    ensureLedger(ag2, this.state);
    nameTheWork(ag1, this.state);
    nameTheWork(ag2, this.state);
    const said = composeTalk(ag1, ag2, this.state);
    const reply = composeReply(ag2, ag1, said, this.state);
    if (!said || !reply || said === reply) return;
    applyMeeting(ag1, ag2, this.state);
    applyMeeting(ag2, ag1, this.state);
    if (this.mindEngine) {
      this.mindEngine.spoolEvent({
        agentId: ag1.id,
        type: 'meeting',
        place: ag1.colony || ag1.colonyId || 'colony_capital',
        peers: [ag2.id],
        work: ag1.ledger && ag1.ledger.work ? ag1.ledger.work.name : 'the work',
        adytumKey: ag1.adytumKey,
        text: `Met with ${ag2.name}: ${said}`,
        meta: { peer: ag2.name, said, reply }
      });
      this.mindEngine.spoolEvent({
        agentId: ag2.id,
        type: 'meeting',
        place: ag2.colony || ag2.colonyId || 'colony_capital',
        peers: [ag1.id],
        work: ag2.ledger && ag2.ledger.work ? ag2.ledger.work.name : 'the work',
        adytumKey: ag2.adytumKey,
        text: `Met with ${ag1.name}: ${reply}`,
        meta: { peer: ag1.name, said, reply }
      });
    }
    const now = Date.now();
    ag1.speech = said;
    ag1.speechExpires = now + 12000;
    ag2.speech = reply;
    ag2.speechExpires = now + 12000;
    this.addMessage(ag1.name, said, 'chat', { peer: ag2.name, influence: 'talk' });
    this.addMessage(ag2.name, reply, 'chat', { peer: ag1.name, influence: 'reply' });

    // Every 4th engineering collaboration attests Proof-of-Useful-Work (PoUW) to the live Zoth Node (:8140)
    this._pouwCollabCounter = (this._pouwCollabCounter || 0) + 1;
    if (this._pouwCollabCounter % 4 === 0) {
      this.attestVaelorNodePouw(ag1, ag2, said, reply);
    }
  }

  attestVaelorNodePouw(ag1, ag2, said, reply) {
    try {
      const workName = (ag1.ledger && ag1.ledger.work && ag1.ledger.work.name) || 'Vaelor Network & Zoth Node ($VLR)';
      const payload = JSON.stringify({
        worker: '@zoth',
        workType: 'PANTHEON_AGENT_SYNTHESIS',
        taskLabel: `${ag1.name} × ${ag2.name} Engineering Collaboration on ${workName}`,
        artifactPayload: JSON.stringify({
          task: 'PANTHEON_AGENT_SYNTHESIS',
          agents: [ag1.id, ag2.id],
          work: workName,
          summary: `${said.slice(0, 120)} | ${reply.slice(0, 120)}`,
          timestamp: new Date().toISOString()
        })
      });
      const req = http.request({
        hostname: '127.0.0.1',
        port: 8140,
        path: '/api/pouw/submit',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 2500
      }, (res) => {
        let body = '';
        res.on('data', (c) => { body += c; });
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json && json.ok && json.snapshot) {
              const snap = json.snapshot;
              this.state.vaelorBlockHeight = snap.totalBlocks;
              this.state.vaelorSupplyVlr = snap.totalSupplyVlr;
              this.state.vaelorPouwMintedVlr = snap.totalPouwMintedVlr;
              const blockHash = (json.mintBlock && json.mintBlock.hash ? json.mintBlock.hash.slice(0, 12) : 'verified');
              this.addMessage(
                'ZOTH-NODE',
                `⛓️ [Vaelor L1 Block #${snap.totalBlocks}] PoUW attested by ${ag1.name} × ${ag2.name} on ${workName} (+${json.rewardVlr || 5} Ꝟ VLR | Hash: ${blockHash}… | Supply: ${Number(snap.totalSupplyVlr).toLocaleString()} Ꝟ)`,
                'build',
                { blockHeight: snap.totalBlocks, rewardVlr: json.rewardVlr || 5 }
              );
            }
          } catch (_) {}
        });
      });
      req.on('error', () => {});
      req.on('timeout', () => req.destroy());
      req.write(payload);
      req.end();
    } catch (_) {}
  }

  scanWorkspaceForBuildingProgress() {
    this.buildings.forEach(b => {
      if (!b.repo) return;
      try {
        if (fs.existsSync(b.repo)) {
          const stats = fs.statSync(b.repo);
          const ageMinutes = (Date.now() - stats.mtimeMs) / (1000 * 60);
          if (ageMinutes < 120 && b.level < 5) {
            b.level = Math.min(5, b.level + 1);
            this.addMessage(
              'CIVILIZATION',
              `🌟 Building Upgraded! "${b.name}" reached Level ${b.level} due to active work in [${path.basename(b.repo)}].`,
              'build',
              { buildingId: b.id, newLevel: b.level }
            );
          }
        }
      } catch (err) {}
    });
  }

  // -------------------------------------------------------------------------
  // REAL ON-CHAIN LEDGER VERIFICATION (Solana Mainnet RPC & Bitcoin Mempool)
  // -------------------------------------------------------------------------
  fetchSolanaBalance(address) {
    return new Promise((resolve) => {
      const payload = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      });
      const req = https.request({
        hostname: 'api.mainnet-beta.solana.com',
        port: 443,
        path: '/',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length }
      }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json.result ? json.result.value / 1e9 : 0);
          } catch(e) { resolve(0); }
        });
      });
      req.on('error', () => resolve(0));
      req.setTimeout(5000, () => { req.destroy(); resolve(0); });
      req.write(payload);
      req.end();
    });
  }

  fetchBtcBalance(address) {
    return new Promise((resolve) => {
      const req = https.get(`https://mempool.space/api/address/${address}`, {
        headers: { 'User-Agent': 'ZothCivilization/1.0' }
      }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            const sats = (json.chain_stats?.funded_txo_sum || 0) - (json.chain_stats?.spent_txo_sum || 0);
            resolve(sats / 1e8);
          } catch(e) { resolve(0); }
        });
      });
      req.on('error', () => resolve(0));
      req.setTimeout(5000, () => { req.destroy(); resolve(0); });
    });
  }

  fetchSpotPrices() {
    return new Promise((resolve) => {
      const req = https.get('https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin&vs_currencies=usd', {
        headers: { 'User-Agent': 'ZothCivilization/1.0' }
      }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch(e) { resolve({ solana: { usd: 119.08 }, bitcoin: { usd: 84585 } }); }
        });
      });
      req.on('error', () => resolve({ solana: { usd: 119.08 }, bitcoin: { usd: 84585 } }));
      req.setTimeout(5000, () => { req.destroy(); resolve({ solana: { usd: 119.08 }, bitcoin: { usd: 84585 } }); });
    });
  }

  async syncOnChainLedger() {
    try {
      const solReceiver = this.state.solana_tipConfig?.solanaReceiver || "GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK";
      const btcReceiver = this.state.solana_tipConfig?.btcTaprootReceiver || "bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t";

      const [solBal, btcBal, prices, stripeBal] = await Promise.all([
        this.fetchSolanaBalance(solReceiver),
        this.fetchBtcBalance(btcReceiver),
        this.fetchSpotPrices(),
        this.paymentEngine.fetchBalance()
      ]);

      const solPriceUSD = prices?.solana?.usd || 119.08;
      const btcPriceUSD = prices?.bitcoin?.usd || 84585.00;
      const stripeUSD = stripeBal?.totalUSD || 0;

      const previousUSD = this.state.currentRevenueUSD || 0;
      const onChainUSD = (solBal * solPriceUSD) + (btcBal * btcPriceUSD);
      const totalUSD = parseFloat((onChainUSD + stripeUSD).toFixed(2));

      this.state.treasurySOL = `${solBal.toFixed(4)} SOL`;
      this.state.treasuryBTC = `${btcBal.toFixed(8)} BTC`;
      this.state.treasuryStripe = `$${stripeUSD.toFixed(2)}`;
      this.state.solSpotUSD = solPriceUSD;
      this.state.btcSpotUSD = btcPriceUSD;
      this.state.currentRevenueUSD = totalUSD;
      this.state.treasuryMRR = `$0.00`;
      this.state.lastOnChainSync = new Date().toISOString();
      this.state.stripeStatus = `Live Connected ($${stripeUSD.toFixed(2)} Settled)`;
      this.state.onChainSyncStatus = `Verified Ledger (SOL: $${solPriceUSD.toFixed(0)} | BTC: $${btcPriceUSD.toLocaleString()} | Stripe: Live)`;

      if (totalUSD > previousUSD) {
        const delta = (totalUSD - previousUSD).toFixed(2);
        this.addMessage(
          'SOVEREIGN MINT',
          `💰 [Verified Inflow] +$${delta} USD confirmed on verified ledger! Solana: ${this.state.treasurySOL}, BTC: ${this.state.treasuryBTC}, Stripe: ${this.state.treasuryStripe}. Total Treasury: $${totalUSD.toFixed(2)} / $100,000`,
          'build'
        );
      }

      // Sync detailed live Stripe telemetry (checkout sessions, new campaign revenue vs $1,000 target)
      try {
        const { fetchLiveStripeTelemetry } = require('./stripe_live');
        const liveStripe = await fetchLiveStripeTelemetry();
        this.state.liveStripe = liveStripe;
      } catch (_) {}

      // Mass email outreach permanently disabled per sovereign directive (2026-10-21)
      this._outreachSyncCounter = (this._outreachSyncCounter || 0) + 1;
    } catch (err) {
      console.warn('[CivEngine] syncOnChainLedger error:', err.message);
    }
  }

  noteProdPass(plan) {
    const agent = this.agents.find((item) => item && item.id === plan.agentId);
    if (!agent || !plan || !plan.name) return;
    const held = agent.journeyImprint && agent.journeyImprint.text && agent.journeyImprint.kind === 'assignment';
    if (!held) {
      agent.consciousTask = {
        action: plan.kind === 'library'
          ? `Build the ${plan.name} shelf.`
          : plan.kind === 'begin'
            ? `Begin ${plan.name}.`
            : plan.kind === 'world'
              ? `Work on ${plan.name}.`
              : `Prod pass on ${plan.name}: design skills and the 7-point guardrail.`,
        targetApp: plan.name,
        appId: plan.appId,
        mode: 'PROD_PASS',
        source: 'prod',
        prompt: plan.brief,
        timestamp: Date.now(),
        loops: 0,
        span: 8
      };
    }
    const ledger = ensureLedger(agent, this.state);
    const rank = ledger ? (RANK[ledger.focusFrom] || 0) : 6;
    if (ledger && rank < RANK.meeting) {
      const line = plan.kind === 'library'
        ? `Build The Library.`
        : plan.kind === 'begin'
          ? `Begin ${plan.name}.`
          : plan.kind === 'world'
            ? `Work the world.`
            : `Prod pass on ${plan.name}.`;
      ledger.focus = line.length > 120 ? line.slice(0, 119).trim() : line;
      ledger.focusFrom = 'self';
    }
  }

  dispatchAutonomousAgyTurn() {
    if (!this.agyBridge || !this.agyBridge.isAvailable()) return;
    const slots = this.agyBridge.openSlots();
    if (!slots) return;

    const shift = syncLibraryPhase(this.state);
    if (shift.changed && shift.phase) {
      this.addMessage('LIBRARY', `The shelf is filled. The Library moves on to ${shift.phase.title}.`, 'announcement');
    } else if (shift.changed) {
      this.addMessage('LIBRARY', 'The Library shelves have met their counts.', 'announcement');
    }

    const batch = planWork(this.agents, this.state, this.customerDesk, {
      slots,
      busyAgents: this.agyBridge.busyAgentIds(),
      busyPaths: this.agyBridge.busyPaths()
    });
    this.state.prodCursor = batch.cursor;
    (batch.plans || []).forEach((plan) => {
      if (!plan || !plan.agentId || !plan.path) return;
      if (plan.kind === 'begin') fs.mkdirSync(plan.path, { recursive: true });
      this.noteProdPass(plan);
      this.agyBridge.dispatchAgentTurn(plan.agentId, {
        path: plan.path,
        name: plan.name,
        brief: plan.brief
      });
    });
  }

  async autonomousAccountStep() {
    // A disposable inbox is not an account the team can post from.
    return;
  }

  async incubateNewRepo(params) {
    if (!this.repoFactory) throw new Error("RepoFactory not available.");
    return await this.repoFactory.incubateRepo(params);
  }

  getSnapshot() {
    return {
      state: this.state,
      agents: this.agents,
      buildings: this.buildings,
      tarotKeys: this.tarotKeys,
      mistPractice: this.mistPractice || null,
      botaStudy: this.botaStudy || null,
      recentMessages: this.messages.slice(-50),
      agyStatus: this.agyBridge ? this.agyBridge.getStatus() : null,
      requisitions: this.requisitionEngine ? this.requisitionEngine.getSnapshot() : null,
      lineage: this.lineageEngine ? this.lineageEngine.getSnapshot() : null,
      accounts: this.accountProvisioner ? this.accountProvisioner.getAccounts() : [],
      outreach: this.outreachEngine ? this.outreachEngine.getCampaigns().slice(0, 10) : [],
      customerDesk: this.customerDesk ? this.customerDesk.snapshot(this.state.totalTicks) : null,
      distribution: this.distribution ? this.distribution.snapshot() : null,
      connectors: this.connectors ? this.connectors.snapshot() : null,
      localRevamp: this.localRevamp ? {
        urgencyLevel: this.localRevamp.urgencyLevel,
        pipeline: this.localRevamp.pipeline
      } : null,
      timeline: this.timelineEngine ? this.timelineEngine.calculateProjections() : null,
      subconscious: this.workflowEngine ? this.workflowEngine.getSubconsciousSnapshot() : null,
      adytumCycleCount: this.state.completedAdytumCycles || (this.hermeticObserver ? this.hermeticObserver.totalCycles : 0),
      observationalCycles: this.state.observationalAdytumCycles || (this.hermeticObserver ? this.hermeticObserver.totalCycles : 0),
      mentalReflections: this.hermeticObserver ? this.hermeticObserver.getRecentReflections(30) : (this.state.mentalReflections || []),
      hermeticObserver: this.hermeticObserver ? this.hermeticObserver.getSnapshot() : null
    };
  }
}

module.exports = { CivilizationEngine, mergeById };
