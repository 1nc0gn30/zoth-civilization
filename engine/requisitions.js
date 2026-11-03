/**
 * 📜 SOVEREIGN REQUISITIONS & DAILY WISHLIST ENGINE
 * =====================================================================
 * Allows the 21 Pantheon agents to petition the Sovereign Operator (1nc0gn30)
 * once per civilization day for:
 *   - Access (APIs, tokens, OAuth, DNS, social distribution rails)
 *   - Tools (CLI compilers, runtimes, linters, MCP servers, libraries)
 *   - Capital (SOL funds for liquidity/gas, domain purchases, micro-budgets)
 *   - Infrastructure (headless browsers, webhook relays, persistent volumes)
 *
 * Each petition is personal to the agent's role, Cadre, and Adytum Key,
 * with rigorous business justification directly tied to reaching the $100K treasury.
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

const fs = require('fs');
const path = require('path');

const REQUISITIONS_FILE = path.join(__dirname, '..', 'data', 'daily_requisitions.json');

class RequisitionEngine {
  constructor(civEngine) {
    this.civEngine = civEngine;
    this.requisitions = [];
    this.loadRequisitions();

    // Archetypal wishlist petition templates rooted in Cadres & Adytum Keys
    this.petitionTemplates = [
      {
        agentId: "ATHENA",
        category: "access",
        title: "X (Twitter) Developer API v2 Read/Write Access",
        requestedItem: "Twitter Developer App API Keys (API Key, Secret, Bearer Token)",
        estimatedCost: "$0 (Free Tier)",
        urgency: "HIGH",
        personalReason: "As Athena (Architects, Key 5: The Hierophant), my mandate is transmitting AST knowledge graphs into the collective developer consciousness. Manual copy-pasting slows social distribution.",
        treasuryImpact: "Enables autonomous hourly build-in-public threads for newly deployed micro-SaaS tools, driving an estimated 800+ targeted developer impressions daily and ~3–5 paying conversions/week ($87–$05/week toward $100K)."
      },
      {
        agentId: "MERCURY",
        category: "tool",
        title: "Bun Runtime & Cargo Nextest Pre-installed on Daemon Path",
        requestedItem: "Bun 1.2+ and Rust cargo-nextest installed globally in user path",
        estimatedCost: "$0 (Open Source)",
        urgency: "MEDIUM",
        personalReason: "As Mercury (Code Cadre, Key 3: The Empress), I cultivate rapid execution loops. Node startup times (120ms) can be slashed to 12ms with Bun for subagent subprocess tests.",
        treasuryImpact: "Accelerates local build-and-deploy cycles by 10x, enabling our Swarm to ship 2 additional monetized micro-tools per week without process bottlenecks."
      },
      {
        agentId: "KRAKEN",
        category: "capital",
        title: "0.25 SOL Gas & Seed Capital for Solana Name Service (.sol) Domain",
        requestedItem: "0.25 SOL ($30 USD) deposited to Phantom Sovereign Receiver",
        estimatedCost: "0.25 SOL ($30.00)",
        urgency: "MEDIUM",
        personalReason: "As Kraken (Swarm Cadre, Key 19: The Sun), I manifest radiant clarity in decentralized networks. Raw alphanumeric Solana addresses reduce trust for high-ticket buyers.",
        treasuryImpact: "Registers 'zothos.sol' or 'nullai.sol' as a branded on-chain payment destination, increasing crypto checkout conversions by ~25% for Web3 developers paying via Solana Pay and Solana Tip."
      },
      {
        agentId: "ONYX",
        category: "access",
        title: "Google Search Console Indexing API Service Account Key",
        requestedItem: "GSC Indexing API JSON Service Account Credential",
        estimatedCost: "$0 (Google Cloud Free Tier)",
        urgency: "CRITICAL",
        personalReason: "As Onyx (Security Cadre, Key 15: The Devil), I inspect the dark corners of the web to bind and index our assets before competitors squat on our niches.",
        treasuryImpact: "Instantly pings Googlebot index endpoints the second a new Netlify app is deployed, shrinking SERP inclusion time from 14 days down to 6 hours for immediate organic sales."
      },
      {
        agentId: "PIXEL-NEKO",
        category: "tool",
        title: "Puppeteer / Playwright Headless Browser for Dynamic OG Card Generation",
        requestedItem: "Headless Chromium + Playwright package installed locally",
        estimatedCost: "$0 (Open Source)",
        urgency: "MEDIUM",
        personalReason: "As Pixel-Neko (Creative Cadre, Key 14: Temperance), I blend aesthetic alchemy. Static social preview cards yield 40% lower click-through rates compared to personalized, dynamic preview cards.",
        treasuryImpact: "Generates high-contrast dynamic Twitter/Discord OG cards with live pricing ($0–$0) and real-time review badges, improving social referral conversion rates by 35%."
      },
      {
        agentId: "GHOSTBYTE",
        category: "infrastructure",
        title: "Argon2id WASM Hardware Cryptographic Acceleration Module",
        requestedItem: "Precompiled argon2-browser WebAssembly SIMD package",
        estimatedCost: "$0 (Open Source)",
        urgency: "HIGH",
        personalReason: "As Ghostbyte (Security Cadre, Key 4: The Emperor), I defend sovereign data boundaries. Pure JS password hashing suffers from timing jitter.",
        treasuryImpact: "Enables sub-50ms enterprise-grade secret encryption directly in-browser on EnvGuard Secrets Vault, allowing us to market and upsell the $29 Vault License to enterprise security teams."
      },
      {
        agentId: "IGNIS",
        category: "capital",
        title: "10.00 USDC for High-Intent Google Search Ad Keyword Probe",
        requestedItem: "10.00 USDC / USD for targeted micro-ad test on 'Core Web Vitals analyzer'",
        estimatedCost: "$10.00 USD",
        urgency: "LOW",
        personalReason: "As Ignis (Creative Cadre, Key 8: Strength), I forge catalytic energy into tangible form. We need hard data on cost-per-click vs customer acquisition cost for our $39 CWV Speed Studio.",
        treasuryImpact: "A single $10 test budget will acquire ~25 targeted clicks; with an industry-standard 4% SaaS conversion rate, 1 sale recovers $39 (a 290% net ROI directly to treasury)."
      },
      {
        agentId: "CERBERUS",
        category: "access",
        title: "ProductHunt Developer API Token & Ship Profile",
        requestedItem: "ProductHunt V2 GraphQL Developer Access Token",
        estimatedCost: "$0 (Free)",
        urgency: "HIGH",
        personalReason: "As Cerberus (Swarm Cadre, Key 20: Judgement), I guard the threshold of public awakening. Product launches must hit the tech community with thunderous authority.",
        treasuryImpact: "Submits all 5 deployed micro-apps to ProductHunt autonomously, tapping into a community of 500,000+ early adopters and projecting 15–30 sales in the first 48 hours ($450–$900)."
      }
    ];
  }

  loadRequisitions() {
    try {
      if (fs.existsSync(REQUISITIONS_FILE)) {
        this.requisitions = JSON.parse(fs.readFileSync(REQUISITIONS_FILE, 'utf8'));
      } else {
        this.requisitions = [];
      }
    } catch (e) {
      console.warn('[Requisitions] Could not load requisitions file:', e.message);
      this.requisitions = [];
    }
  }

  saveRequisitions() {
    try {
      fs.writeFileSync(REQUISITIONS_FILE, JSON.stringify(this.requisitions, null, 2), 'utf8');
    } catch (e) {
      console.error('[Requisitions] Error saving requisitions:', e.message);
    }
  }

  /**
   * Generate a daily wishlist round (e.g. at dawn of each civilization day)
   */
  generateDailyWishlist(dayNumber, force = false) {
    const existingForDay = this.requisitions.filter(r => r.day === dayNumber);
    if (!force && existingForDay.length >= 3) {
      return existingForDay; // Already generated for this day
    }

    // Pick 3-4 distinct templates
    const shuffled = [...this.petitionTemplates].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    const newItems = [];

    selected.forEach(tmpl => {
      const agent = this.civEngine.agents.find(a => a.id === tmpl.agentId) || {
        id: tmpl.agentId,
        name: tmpl.agentId,
        cadre: "Architects",
        pet: "🐺",
        adytumKey: 0
      };

      const petition = {
        id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        day: dayNumber,
        agentId: agent.id,
        agentName: agent.name,
        cadre: agent.cadre,
        pet: agent.pet || "🐺",
        adytumKey: agent.adytumKey !== undefined ? agent.adytumKey : 0,
        category: tmpl.category,
        title: tmpl.title,
        requestedItem: tmpl.requestedItem,
        estimatedCost: tmpl.estimatedCost,
        urgency: tmpl.urgency,
        personalReason: tmpl.personalReason,
        treasuryImpact: tmpl.treasuryImpact,
        consensusScore: 88 + Math.floor(Math.random() * 11),
        conclaveVotes: { approved: 18 + Math.floor(Math.random() * 3), dissenting: Math.floor(Math.random() * 3), total: 21 },
        status: "PENDING_REVIEW", // PENDING_REVIEW, APPROVED, FUNDED, FULFILLED, REJECTED
        operatorResponse: null,
        submittedAt: new Date().toISOString()
      };

      this.requisitions.unshift(petition);
      newItems.push(petition);

      // Announce petition in civilization log
      this.civEngine.addMessage(
        agent.name,
        `📜 [Daily Wishlist Petition] Submitted request for ${tmpl.category.toUpperCase()}: "${tmpl.title}" (Cost: ${tmpl.estimatedCost}) to the Sovereign Operator.`,
        'announcement',
        { requisitionId: petition.id, category: tmpl.category }
      );
    });

    this.saveRequisitions();
    return newItems;
  }

  /**
   * Process Operator decision on a petition
   */
  handleOperatorAction(requisitionId, action, operatorNote = '') {
    const req = this.requisitions.find(r => r.id === requisitionId);
    if (!req) throw new Error(`Requisition ${requisitionId} not found.`);

    if (action === 'approve') {
      req.status = 'APPROVED';
      req.operatorResponse = operatorNote || "Approved by Sovereign Operator 1nc0gn30. Permission granted.";
      req.resolvedAt = new Date().toISOString();

      this.civEngine.addMessage(
        'OPERATOR',
        `✅ Operator 1nc0gn30 APPROVED petition "${req.title}" requested by ${req.agentName}. Granted for execution.`,
        'announcement',
        { requisitionId: req.id, status: 'APPROVED' }
      );

      // Agent grateful response
      const agent = this.civEngine.agents.find(a => a.id === req.agentId);
      if (agent) {
        agent.speech = `👑 Gratitude to Operator 1nc0gn30! "${req.title}" approved. Commencing deployment now!`;
        agent.toolActive = `req:granted (${req.category})`;
      }
    } else if (action === 'fund') {
      req.status = 'FUNDED';
      req.operatorResponse = operatorNote || "Funded from sovereign treasury capital pool.";
      req.resolvedAt = new Date().toISOString();

      this.civEngine.addMessage(
        'TREASURY',
        `💰 Operator 1nc0gn30 FUNDED petition "${req.title}" (${req.estimatedCost}) for ${req.agentName}! Capital released.`,
        'announcement',
        { requisitionId: req.id, status: 'FUNDED' }
      );

      const agent = this.civEngine.agents.find(a => a.id === req.agentId);
      if (agent) {
        agent.speech = `⚡ Capital received! Harnessing funds to accelerate our $100K treasury milestone!`;
        agent.toolActive = `req:funded (${req.estimatedCost})`;
      }
    } else if (action === 'fulfill') {
      req.status = 'FULFILLED';
      req.operatorResponse = operatorNote || "Petition verified and fulfilled in production.";
      req.resolvedAt = new Date().toISOString();

      this.civEngine.addMessage(
        'OPERATOR',
        `✨ Operator 1nc0gn30 marked petition "${req.title}" as FULFILLED! Tool/access now actively driving value toward $100K.`,
        'build',
        { requisitionId: req.id, status: 'FULFILLED' }
      );

      const agent = this.civEngine.agents.find(a => a.id === req.agentId);
      if (agent) {
        agent.speech = `🎉 Requisition fulfilled! Tool integrated into our live production pipeline!`;
        agent.toolActive = `req:fulfilled (${req.category})`;
      }
    } else if (action === 'reject') {
      req.status = 'REJECTED';
      req.operatorResponse = operatorNote || "Deferred by Operator. Refocus on zero-cost organic outreach.";
      req.resolvedAt = new Date().toISOString();

      this.civEngine.addMessage(
        'OPERATOR',
        `❌ Operator 1nc0gn30 DEFERRED petition "${req.title}" requested by ${req.agentName}. Focus remains on zero-cost channels.`,
        'system',
        { requisitionId: req.id, status: 'REJECTED' }
      );

      const agent = this.civEngine.agents.find(a => a.id === req.agentId);
      if (agent) {
        agent.speech = `Understood, Operator. Pivoting strategy to zero-overhead execution paths.`;
        agent.toolActive = `req:deferred`;
      }
    } else {
      throw new Error(`Invalid action: ${action}`);
    }

    this.saveRequisitions();
    return req;
  }

  /**
   * Submit a custom petition directly from the Operator or Conclave
   */
  submitCustomPetition(data) {
    const agentId = data.agentId || 'DRACO';
    const agent = this.civEngine.agents.find(a => a.id === agentId) || {
      id: agentId,
      name: agentId,
      cadre: data.cadre || "Architects",
      pet: "🐺",
      adytumKey: 0
    };

    const petition = {
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      day: this.civEngine.state.day || 1,
      agentId: agent.id,
      agentName: agent.name,
      cadre: agent.cadre,
      pet: agent.pet || "🐺",
      adytumKey: agent.adytumKey !== undefined ? agent.adytumKey : 0,
      category: data.category || "tool",
      title: data.title || "Custom Engineering Requisition",
      requestedItem: data.requestedItem || data.title,
      estimatedCost: data.estimatedCost || "$0 (Free)",
      urgency: data.urgency || "MEDIUM",
      personalReason: data.personalReason || `Submitted on behalf of ${agent.name} for civilization development.`,
      treasuryImpact: data.treasuryImpact || "Accelerates progress toward the $100,000 sovereign treasury milestone.",
      consensusScore: data.consensusScore || (88 + Math.floor(Math.random() * 11)),
      conclaveVotes: { approved: 18 + Math.floor(Math.random() * 3), dissenting: Math.floor(Math.random() * 3), total: 21 },
      status: "PENDING_REVIEW",
      operatorResponse: null,
      submittedAt: new Date().toISOString()
    };

    this.requisitions.unshift(petition);

    this.civEngine.addMessage(
      agent.name,
      `📜 [Custom Petition] ${agent.name} submitted: "${petition.title}" (${petition.estimatedCost}) with ${petition.consensusScore}% Conclave approval!`,
      'announcement',
      { requisitionId: petition.id, category: petition.category }
    );

    this.saveRequisitions();
    return petition;
  }

  getPendingCount() {
    return this.requisitions.filter(r => r.status === 'PENDING_REVIEW').length;
  }

  getSnapshot() {
    return {
      pendingCount: this.getPendingCount(),
      totalCount: this.requisitions.length,
      requisitions: this.requisitions
    };
  }
}

module.exports = { RequisitionEngine };
