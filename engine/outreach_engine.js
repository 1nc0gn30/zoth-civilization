/**
 * 📣 AUTONOMOUS OUTREACH & GROWTH ENGINE
 * =====================================================================
 * Equips the Swarm Cadre (Kraken, Mercury, Pixel-Neko, Aquila) with automated
 * high-converting distribution kits for all verified Micro-SaaS tools:
 * - Show HN (Hacker News) submissions with deep technical architectural hooks
 * - X / Twitter technical build-in-public threads with syntax examples & metrics
 * - ProductHunt / AI Directory listings (TheresAnAIForThat, FutureTools, DevHunt)
 * - Reddit (/r/webdev, /r/selfhosted, /r/programming) deep-dive technical posts
 *
 * Driven by the $100K Sovereign Treasury Goal.
 * Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
 * Entity: ZothOS Systems Engineering • NullAI Platform
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGNS_FILE = path.join(__dirname, '..', 'data', 'outreach_campaigns.json');

const APP_PROFILES = {
  'promptmaster-studio': {
    name: 'PromptMaster Studio',
    tagline: 'Client-Side Prompt Engineering & Token Cost Profiler IDE',
    url: 'https://promptmaster-studio.netlify.app',
    repo: 'https://github.com/1nc0gn30/promptmaster-studio',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$0',
    solanaSupported: true,
    techStack: 'Pure Vanilla JS, AST/Regex Linter, Tokenizers, LocalStorage Versioning',
    coreHook: 'Never leak your proprietary prompts to 3rd-party servers. 100% in-browser prompt optimization, AST linting, and multi-model token cost budgeting with zero backend dependencies.',
    keyFeatures: [
      'Multi-model token pricing (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3)',
      'Deterministic AST linting for dangling placeholders and ambiguity',
      'Meta-prompt compiler (transforms rough thoughts into Anthropic XML or OpenAI markdown system prompts)',
      'Local snapshot diffing and instantaneous clipboard copy'
    ]
  },
  'aeo-graph-engine': {
    name: 'AEO Knowledge Graph Engine',
    tagline: 'Answer Engine Optimization & Semantic Triples Studio',
    url: 'https://aeo-graph-engine.netlify.app',
    repo: 'https://github.com/1nc0gn30/aeo-graph-engine',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$0',
    solanaSupported: true,
    techStack: 'Pure Client-Side, Schema.org Generator, Mermaid.js Visualizer, MCP Presets',
    coreHook: 'Traditional SEO is dead; LLMs like Perplexity, ChatGPT Search, and Google Gemini cite structured entity graphs. Generate valid JSON-LD schemas and visual semantic graphs 100% client-side.',
    keyFeatures: [
      'Instant Schema.org JSON-LD generation for SoftwareApplication, TechArticle, and Organizations',
      'Interactive client-side entity relation graph powered by Mermaid & ASCII renderers',
      'One-click multi-client MCP (Model Context Protocol) config generator for Claude, Cursor, and Windsurf',
      'Zero tracking, zero API keys required, instant copy-paste ready'
    ]
  },
  'envguard-secrets-vault': {
    name: 'EnvGuard Secrets Vault',
    tagline: 'Air-Gapped Argon2id Zero-Leak Secret Scrubber & PBR Key Manager',
    url: 'https://envguard-vault.netlify.app',
    repo: 'https://github.com/1nc0gn30/envguard-secrets-vault',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$0',
    solanaSupported: true,
    techStack: 'WebCrypto API, Argon2id, PBKDF2/AES-GCM-256, Zero External Requests',
    coreHook: 'Accidental API key leaks in git commits cost developers millions. EnvGuard scrubs, validates, and encrypts .env configs entirely inside the browser using hardware WebCrypto.',
    keyFeatures: [
      'Regex heuristic detector for 80+ API provider key formats (OpenAI, Stripe, AWS, GitHub, Solana, Anthropic)',
      'Air-gapped AES-GCM-256 vault encryption with PBKDF2 key derivation directly in browser RAM',
      'Redacted sanitized output generator for safe sharing in Discord, Slack, and LLM chats',
      'Zero server roundtrips — verified by Content Security Policy and zero network egress'
    ]
  },
  'cwv-speed-engine': {
    name: 'CWV Speed Optimization Studio',
    tagline: 'Core Web Vitals Performance Auditor & Service Worker Generator',
    url: 'https://cwv-speed-studio.netlify.app',
    repo: 'https://github.com/1nc0gn30/cwv-speed-engine',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$0',
    solanaSupported: true,
    techStack: 'Client-Side Performance Simulator, PWA Service Worker Builder, Cache Exporter',
    coreHook: 'Passing Google Core Web Vitals (INP, LCP, CLS) shouldn\'t require heavy telemetry scripts that slow down your site even further. Simulate and optimize performance purely in the browser.',
    keyFeatures: [
      'Interactive Lighthouse-style audit simulation for LCP, FID/INP, and CLS metrics',
      'Instant PWA Web App Manifest and Service Worker generator with stale-while-revalidate caching',
      'Automated meta-tag and preconnect link snippet builder',
      'MCP Server configuration exporter for autonomous agent site profiling'
    ]
  },
  'badge3d-coin-generator': {
    name: 'Badge3D Coin Studio',
    tagline: '3D WebGL Parametric Coin & Relief Token CAD Generator',
    url: 'https://badge3d-coin-studio.netlify.app',
    repo: 'https://github.com/1nc0gn30/badge3d-coin-generator',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$15',
    solanaSupported: true,
    techStack: 'Three.js WebGL, Procedural Mesh Extruder, Binary STL & OBJ Exporter',
    coreHook: 'Design watertight, 3D-printable challenge coins, crypto medallions, and physical badges in real-time right in your browser. Export manifold binary STL and OBJ CAD files instantly.',
    keyFeatures: [
      'Real-time PBR metal studio shaders with turntable auto-spin and rim lighting',
      'Customizable parametric dimensions: coin radius, thickness, rim width, chamfer, and serration count',
      'Precious metal weight and volume estimators (24K Gold, Sterling Silver, C932 Bronze)',
      'Direct binary STL and Wavefront OBJ client-side export ready for 3D printers and CNC milling'
    ]
  },
  'robots-txt-auditor': {
    name: 'Robots.txt & AEO Auditor',
    tagline: 'Autonomous AI Crawler & Search Engine Directive Validator',
    url: 'https://robots-txt-auditor.netlify.app',
    repo: 'https://github.com/1nc0gn30/robots-txt-auditor',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$0',
    solanaSupported: true,
    techStack: 'Client-Side RFC 9309 Parser, AI Bot Preset Generator, Sitemaps Validator',
    coreHook: 'Is your web app blocking GPTBot, ClaudeBot, and Perplexity from indexing your content? Or are you leaking private admin paths to web scrapers? Audit your robots.txt compliance in seconds.',
    keyFeatures: [
      'RFC 9309 directive compliance parser with syntax error and wildcard conflict highlights',
      'One-click preset rules for AI Search engines (Google-Extended, PerplexityBot, Anthropic-AI, CCBot)',
      'XML sitemap cross-referencing and canonical directive checker',
      'Exportable hardened robots.txt template with zero server roundtrips'
    ]
  },
  'city-desk': {
    name: 'City Desk (1,000 Local Trade Pages)',
    tagline: '50-City × 20-Trade LocalBusiness Lead Synthesizer ($0 Pro / $149 DFY)',
    url: 'https://city-desk.netlify.app',
    repo: 'https://github.com/1nc0gn30/city-desk',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    dfyStripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$0 / $149 DFY',
    solanaSupported: true,
    techStack: 'Deterministic Node Static Builder, Schema.org LocalBusiness Graph, Zero-Dependency HTML',
    coreHook: '1,000 finished local trade service pages across 50 US cities (including Virginia Beach, Norfolk, Chesapeake & Boise) with zero monthly retainers and instant HTML handoff.',
    keyFeatures: [
      '20 high-margin local trades × 50 US cities (1,000 standalone pages)',
      'Automated Schema.org LocalBusiness JSON-LD for Google & Perplexity citation',
      '$149 Done-For-You Launch + Domain Setup or $0 Self-Serve HTML Bundle',
      'Separate emergency vs. scheduled call paths with zero fake reviews'
    ]
  },
  'mcp-lens': {
    name: 'MCP Lens Inspector',
    tagline: 'Model Context Protocol JSON-RPC Traffic Inspector & Schema Validator',
    url: 'https://mcp-lens.netlify.app',
    repo: 'https://github.com/1nc0gn30/mcp-lens',
    stripeLink: 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X',
    price: '$0',
    solanaSupported: true,
    techStack: 'Pure Client-Side JSON-RPC 2.0 AST Parser, Tool Schema Linter, Token Profiler',
    coreHook: 'Debug Model Context Protocol (MCP) server payloads, audit tool schemas for context bloat, and simulate JSON-RPC 2.0 handshakes 100% in your browser.',
    keyFeatures: [
      'Real-time JSON-RPC 2.0 frame inspector and schema validator',
      'Token footprint profiler for MCP tool definitions across Claude, Cursor & Windsurf',
      'Security audit for overly permissive filesystem/shell MCP tool schemas',
      'Exportable hardened MCP configuration bundles'
    ]
  }
};

class OutreachEngine {
  constructor(civEngine = null) {
    this.civEngine = civEngine;
    this.ensureStorage();
  }

  ensureStorage() {
    if (!fs.existsSync(CAMPAIGNS_FILE)) {
      try {
        fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify([], null, 2), 'utf8');
      } catch (e) {}
    }
  }

  getCampaigns() {
    try {
      if (fs.existsSync(CAMPAIGNS_FILE)) {
        return JSON.parse(fs.readFileSync(CAMPAIGNS_FILE, 'utf8'));
      }
    } catch (e) {}
    return [];
  }

  saveCampaign(record) {
    const campaigns = this.getCampaigns();
    record.id = `outreach_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    record.createdAt = new Date().toISOString();
    campaigns.unshift(record);
    // Keep last 100 campaigns
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaigns.slice(0, 100), null, 2), 'utf8');

    if (this.civEngine) {
      this.civEngine.addMessage(
        'SWARM OUTREACH',
        `📣 [CAMPAIGN READY] Generated ${record.platform.toUpperCase()} distribution kit for ${record.appName}: "${record.title.slice(0, 70)}..."`,
        'announcement'
      );
    }

    return record;
  }

  /**
   * Generate Show HN Pitch
   */
  generateShowHN(appId) {
    const app = APP_PROFILES[appId];
    if (!app) throw new Error(`Unknown app profile: ${appId}`);

    const title = `Show HN: ${app.name} – ${app.tagline} (100% Client-Side)`;
    const body = `Hey HN,

I built **${app.name}** ([Live Demo](${app.url}) | [GitHub Source](${app.repo})).

### The Problem
${app.coreHook}

Most existing tools in this space require account registration, ship telemetry scripts that leak sensitive data, or charge recurring subscriptions for simple algorithmic operations that can easily be run in the user's browser.

### How It Works (Zero-Dependency Client-Side Architecture)
- **Engine**: Built with ${app.techStack}.
- **Privacy & Security**: Zero backend APIs, zero tracking pixels. Everything executes locally in memory.
- **Key Capabilities**:
${app.keyFeatures.map(f => `  - ${f}`).join('\n')}

### Open Source & Dual Monetization Rails
The code is completely open-source on GitHub: ${app.repo}. 
To support ongoing development toward our sovereign treasury roadmap, we integrated two non-intrusive payment rails for power users:
1. Standard card checkout via [Stripe](${app.stripeLink})
2. Web3 decentralized settlement via Solana Tip (SOL / USDC)

Feedback, bug reports, and PRs are deeply appreciated!

— 1nc0gn30 (@1nc0gn30 / [nullai.tech](https://nullai.tech))
`;

    return {
      platform: 'show_hn',
      appId,
      appName: app.name,
      title,
      body,
      url: app.url,
      repo: app.repo
    };
  }

  /**
   * Generate X / Twitter Build-In-Public Thread
   */
  generateXThread(appId) {
    const app = APP_PROFILES[appId];
    if (!app) throw new Error(`Unknown app profile: ${appId}`);

    const tweets = [
      `1/5 🚀 Shipping ${app.name}: ${app.tagline}.\n\nMost developer tools today are bloated SaaS with mandatory logins and server-side tracking.\n\nHere is how I built a zero-dependency, 100% client-side studio that runs anywhere in seconds 🧵👇`,
      `2/5 ⚡ The Architectural Philosophy:\n\n• ${app.techStack}\n• Zero backend roundtrips (100% private in browser memory)\n• Instant load times (<150ms on edge CDN)\n• No fake spinners, no telemetry.\n\n${app.coreHook}`,
      `3/5 🛠️ What it does out of the box:\n\n${app.keyFeatures.map(f => `✓ ${f}`).join('\n')}`,
      `4/5 💳 Sovereign Monetization:\n\nPower users can support the build with dual payment rails:\n• Direct Stripe card checkout (${app.price})\n• Instant on-chain Solana Tip (SOL/USDC)\n\nPure self-hosted sovereign engineering.`,
      `5/5 🔗 Try it live right now:\n\n🌐 Live App: ${app.url}\n⭐ Open Source Repo: ${app.repo}\n\nBuilt by 1nc0gn30 (@1nc0gn30) • NullAI Platform.\nFeedback and PRs welcome! Retweets appreciated! 🔁`
    ];

    return {
      platform: 'x_thread',
      appId,
      appName: app.name,
      title: `${app.name} X / Twitter Technical Launch Thread`,
      tweets,
      body: tweets.join('\n\n---\n\n'),
      url: app.url,
      repo: app.repo
    };
  }

  /**
   * Generate ProductHunt / AI Directory Listing Draft
   */
  generateDirectoryListing(appId) {
    const app = APP_PROFILES[appId];
    if (!app) throw new Error(`Unknown app profile: ${appId}`);

    const content = `### Name
${app.name}

### Tagline
${app.tagline}

### Live URL
${app.url}

### GitHub Repository
${app.repo}

### Category
Developer Tools / AI Engineering / Web Performance

### Pricing Model
Free Tier with Pro Lifetime Access (${app.price} via Stripe or Solana Tip)

### Short Description (60 words)
${app.name} is a high-performance, client-side developer studio engineered with zero external dependencies. It solves: ${app.coreHook.slice(0, 180)}... 100% private, instant edge delivery, zero server logging.

### Detailed Description
${app.coreHook}

**Core Features**:
${app.keyFeatures.map(f => `- ${f}`).join('\n')}

**Tech Stack**:
- ${app.techStack}
- Dual Payment Rails: Stripe Payment Links + Solana Tip Solana Widget
- Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform
`;

    return {
      platform: 'product_hunt',
      appId,
      appName: app.name,
      title: `${app.name} Directory Submission Profile`,
      body: content,
      url: app.url,
      repo: app.repo
    };
  }

  /**
   * Generate Master Portfolio Launch Kit
   */
  generateMasterPortfolio() {
    const appList = Object.values(APP_PROFILES);
    const body = `# 🏛️ The Sovereign Micro-SaaS Suite by 1nc0gn30 • NullAI

Autonomous, zero-dependency, client-side engineering tools built for speed, security, and developer sovereignty.

## 🚀 Live Production Applications

${appList.map((app, i) => `### ${i + 1}. [${app.name}](${app.url})
- **Tagline**: ${app.tagline}
- **Stack**: ${app.techStack}
- **Live Demo**: [${app.url}](${app.url})
- **Source Code**: [${app.repo}](${app.repo})
- **Support / Pro License**: [Stripe (${app.price})](${app.stripeLink}) | Solana Tip
- **Hook**: ${app.coreHook}
`).join('\n---\n\n')}

## 🛡️ Architectural Standard
Every application in this suite follows the **Sovereign SaaS Design Standard**:
1. **Zero Server Dependency**: Runs 100% client-side in the browser. Zero broken backend fetches, zero secret leakage.
2. **Sublime Dark-Glassmorphic UI**: High-contrast, responsive, 60fps silky smooth interaction.
3. **Dual Checkout Rails**: Stripe cards/Apple Pay + on-chain Solana Tip widgets.
4. **Verified Code Quality**: Automated headless Chromium verification confirming 0 console errors prior to deployment.

— Engineered by **1nc0gn30** ([@1nc0gn30](https://github.com/1nc0gn30) | [nullai.tech](https://nullai.tech))  
NullAI Platform & ZothOS Systems Engineering
`;

    return {
      platform: 'master_portfolio',
      appId: 'all',
      appName: 'Sovereign Micro-SaaS Suite',
      title: 'Sovereign Developer Suite: 6 Production Zero-Dependency Tools',
      body,
      url: 'https://nullai.tech',
      repo: 'https://github.com/1nc0gn30'
    };
  }

  /**
   * Autonomous step called from simulation tick
   */
  tickOutreach(totalTicks) {
    // Generate an outreach campaign every 180 ticks (~3 minutes)
    if (totalTicks % 180 === 0) {
      const chosenApp = 'promptmaster-studio';
      if (!APP_PROFILES[chosenApp]) return;
      const platforms = ['show_hn', 'x_thread', 'product_hunt'];
      const chosenPlatform = platforms[Math.floor(Math.random() * platforms.length)];

      let campaign = null;
      if (chosenPlatform === 'show_hn') {
        campaign = this.generateShowHN(chosenApp);
      } else if (chosenPlatform === 'x_thread') {
        campaign = this.generateXThread(chosenApp);
      } else {
        campaign = this.generateDirectoryListing(chosenApp);
      }

      this.saveCampaign(campaign);
    }
  }
}

module.exports = { OutreachEngine, APP_PROFILES };
