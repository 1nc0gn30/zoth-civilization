/**
 * 🏛️ ZOTH CIVILIZATION — PLANETARY RPG GAMEPLAY, QUESTS, DECREES & CLIENT SIMULATION KERNEL
 * ==========================================================================================
 * 1. Standalone Browser Simulation Kernel (ZothClientSim):
 *    - Runs Zoth Prime 100% client-side when hosted statically (e.g., Netlify) with zero errors.
 *    - All player saves, quests, and custom thoughts stay strictly in browser localStorage.
 * 2. Imperator Progression, Campaign Quests & Planetary Decrees (Key: J):
 *    - Earn XP & Prana by scouting Citadels, walking the surface, counseling Pantheon citizens,
 *      stepping Adytum Keys, and calling Conclaves.
 *    - Spend Prana on real-time 3D Planetary Decrees (Golden Age Velocity, Aurora Surge,
 *      Hermetic Epiphany, Low-G Starleap).
 * 3. Live 60 FPS Telemetry & Adaptive DPR Governor + Mobile Touch Walk Pad.
 *
 * Author: 1nc0gn30 (@1nc0gn30) • NullAI Platform
 */

(function () {
  'use strict';

  const PLAYER_PROGRESS_KEY = 'zoth_civ_imperator_progress_v1';
  const CLIENT_WORLD_SAVE_KEY = 'zoth_civ_local_world_v1';

  const RANKS = [
    { minXp: 0, title: 'Initiate Explorer', badge: 'I' },
    { minXp: 250, title: 'Planetary Adept', badge: 'II' },
    { minXp: 600, title: 'Citadel Archon', badge: 'III' },
    { minXp: 1050, title: 'Hermetic Hierophant', badge: 'IV' },
    { minXp: 1600, title: 'Sovereign Imperator', badge: 'V' }
  ];

  const QUEST_DEFS = [
    {
      id: 'recon_citadels',
      title: 'Planetary Recon',
      desc: 'Scout 3 Citadels using keys 1–5 or Colony Sights.',
      target: 3,
      xp: 150,
      prana: 45
    },
    {
      id: 'surface_walk',
      title: 'Walk Among Immortals',
      desc: 'Press G (or Walk) to explore Zoth Prime on foot.',
      target: 1,
      xp: 200,
      prana: 60
    },
    {
      id: 'pantheon_counsel',
      title: 'Counsel of the Pantheon',
      desc: 'Send a thought or task to any Pantheon Citizen (E / Click).',
      target: 1,
      xp: 250,
      prana: 80
    },
    {
      id: 'step_key',
      title: 'Hermetic Pathworking',
      desc: 'Advance an Adytum Tarot Key cycle (Step Key button).',
      target: 1,
      xp: 250,
      prana: 80
    },
    {
      id: 'call_conclave',
      title: 'Voice of the Conclave',
      desc: 'Convene a Planetary Conclave Election.',
      target: 1,
      xp: 300,
      prana: 100
    }
  ];

  const DECREE_DEFS = [
    {
      id: 'golden_age',
      name: '⚡ Golden Age Velocity',
      cost: 50,
      durationSec: 60,
      desc: '1.85× trade courier velocity & accelerated planetary synthesis for 60s.'
    },
    {
      id: 'aurora_surge',
      name: '🌌 Polar Aurora Surge',
      cost: 60,
      durationSec: 60,
      desc: 'Amplifies North & South Polar Auroras and celestial sun corona.'
    },
    {
      id: 'hermetic_epiphany',
      name: '🔮 Hermetic Epiphany',
      cost: 75,
      durationSec: 0,
      desc: 'Instantly steps the active Adytum Key & sparks insights across all 5 Citadels.'
    },
    {
      id: 'starleap',
      name: '🚀 Low-G Starleap',
      cost: 40,
      durationSec: 90,
      desc: 'Grants low-gravity spire-vaulting jump physics during Surface Walk for 90s.'
    }
  ];

  window.__zothDecreeState = {
    goldenAgeUntil: 0,
    auroraSurgeUntil: 0,
    starleapUntil: 0
  };

  // =========================================================================
  // 1. STANDALONE CLIENT-SIDE SIMULATION KERNEL (FOR STATIC / NETLIFY HOSTS)
  // =========================================================================
  const COLONIES = [
    'colony_capital',
    'colony_nova_zoth',
    'colony_sol_crypta',
    'colony_adytum_grove',
    'colony_hex_bastion'
  ];

  const ARCHETYPE_LINES = [
    'Verifying zero-egress state invariants across the planetary mesh.',
    'Aligning Hermetic Key harmonics with 60fps surface traversal.',
    'Calibrating STDP synaptic recall weights inside the Athenaeum.',
    'Routing trade couriers between Nova Zoth and Capital Citadel.',
    'Auditing cryptographic seals at Sol Crypta Mint.',
    'Maintaining perimeter wards along HexForge Bastion.'
  ];

  class ZothClientSimulation {
    constructor() {
      this.active = false;
      this.tickCallback = null;
      this.timer = null;
      this.agents = [];
      this.buildings = [];
      this.tarotKeys = [];
      this.library = {};
      this.recentMessages = [];
      this.state = {
        day: 1,
        hour: 8,
        minute: 0,
        second: 0,
        clock: '08:00:00',
        totalTicks: 1024,
        adytumCycleCount: 4,
        activeKeyIndex: 0,
        conclaveCount: 3,
        currentLeader: 'AZOTH',
        leaderTitle: 'SOVEREIGN IMPERATOR',
        leaderTermTotalSec: 86400,
        leaderTermRemainingSec: 74880,
        subconsciousMemoryDensity: '22 canonical keys',
        currentRevenueUSD: 0,
        treasuryGoalUSD: 100000,
        currentDecree: {
          leaderId: 'AZOTH',
          leaderName: 'AZOTH',
          title: 'Sovereign Open-Access Mandate',
          mandate: 'All 23 Pantheon Minds & 77 Sovereign Tools unlocked at 60 FPS.'
        }
      };
    }

    async loadSeedJson(file, fallback) {
      try {
        const r = await window.__origFetch('/seed/' + file);
        if (r.ok) return await r.json();
      } catch (_e) {}
      return fallback;
    }

    async start(onTick) {
      if (this.active) return this.buildSnapshot();
      this.active = true;
      this.tickCallback = onTick;
      this.installStaticApiShim();

      const [agentsSeed, bldSeed, keysSeed, libSeed] = await Promise.all([
        this.loadSeedJson('pantheon_agents.json', []),
        this.loadSeedJson('civilization_buildings.json', []),
        this.loadSeedJson('adytum_keys.json', []),
        this.loadSeedJson('library_catalog.json', { shelves: [] })
      ]);

      this.buildings = Array.isArray(bldSeed) ? bldSeed : [];
      this.tarotKeys = Array.isArray(keysSeed) ? keysSeed : [];
      this.library = libSeed || {};

      // Restore player's private browser world state if present
      let saved = null;
      try {
        const raw = localStorage.getItem(CLIENT_WORLD_SAVE_KEY);
        saved = raw ? JSON.parse(raw) : null;
      } catch (_e) {}

      if (saved && saved.state) {
        Object.assign(this.state, saved.state);
      }

      this.agents = (Array.isArray(agentsSeed) ? agentsSeed : []).map((a, idx) => {
        const savedAgent = saved && saved.agentOverrides && saved.agentOverrides[a.id];
        return Object.assign({}, a, {
          state: a.state && /BUILD|CRAFT|OPTIMIZ|CODING|WORK/.test(String(a.state)) ? a.state : 'CRAFTING',
          colonyId: a.colonyId || COLONIES[idx % COLONIES.length],
          adytumKey: typeof a.adytumKey === 'number' ? a.adytumKey : (idx % 22),
          ledger: {
            manner: 'focused and sovereign',
            focus: a.role || 'Planetary synthesis',
            stoic: 'Verify rendered reality before declaring completion.'
          }
        }, savedAgent || {});
      });

      this.recentMessages = this.agents.slice(0, 6).map((a, i) => ({
        id: 'init-' + i,
        sender: a.name,
        agentId: a.id,
        color: a.color || '#D4AF37',
        text: a.speech || ARCHETYPE_LINES[i % ARCHETYPE_LINES.length],
        timestamp: new Date(Date.now() - (6 - i) * 18000).toISOString()
      }));

      this.timer = setInterval(() => this.stepSimulation(), 4500);
      window.dispatchEvent(new CustomEvent('civ:sse', { detail: { up: true } }));
      return this.buildSnapshot();
    }

    persistLocalWorld() {
      try {
        const agentOverrides = {};
        this.agents.forEach((a) => {
          if (a._playerModified) {
            agentOverrides[a.id] = {
              speech: a.speech,
              adytumKey: a.adytumKey,
              state: a.state,
              ledger: a.ledger,
              _playerModified: true
            };
          }
        });
        localStorage.setItem(CLIENT_WORLD_SAVE_KEY, JSON.stringify({
          state: this.state,
          agentOverrides
        }));
      } catch (_e) {}
    }

    stepSimulation() {
      this.state.totalTicks += 1;
      const secs = (28800 + this.state.totalTicks * 15) % 86400;
      const hNum = Math.floor(secs / 3600);
      const mNum = Math.floor((secs % 3600) / 60);
      const sNum = secs % 60;
      this.state.hour = hNum;
      this.state.minute = mNum;
      this.state.second = sNum;
      this.state.clock = `${String(hNum).padStart(2, '0')}:${String(mNum).padStart(2, '0')}:${String(sNum).padStart(2, '0')}`;
      if (secs < 15) this.state.day += 1;

      if (this.agents.length) {
        const speaker = this.agents[this.state.totalTicks % this.agents.length];
        const keyObj = this.tarotKeys[speaker.adytumKey % Math.max(1, this.tarotKeys.length)];
        const line = speaker._playerModified
          ? speaker.speech
          : (keyObj
              ? `Contemplating Key ${keyObj.keyNumber} (${keyObj.name}): ${ARCHETYPE_LINES[this.state.totalTicks % ARCHETYPE_LINES.length]}`
              : ARCHETYPE_LINES[this.state.totalTicks % ARCHETYPE_LINES.length]);
        speaker.speech = line;
        this.recentMessages.unshift({
          id: 'msg-' + Date.now(),
          sender: speaker.name,
          agentId: speaker.id,
          color: speaker.color || '#D4AF37',
          text: line,
          timestamp: new Date().toISOString()
        });
        if (this.recentMessages.length > 24) this.recentMessages.length = 24;
      }

      if (typeof this.tickCallback === 'function') {
        this.tickCallback(this.buildSnapshot());
      }
    }

    buildSnapshot() {
      return {
        state: Object.assign({}, this.state),
        agents: this.agents,
        buildings: this.buildings,
        tarotKeys: this.tarotKeys,
        recentMessages: this.recentMessages,
        lineage: { generation: 2, subagents: [] },
        requisitions: { items: [] }
      };
    }

    installStaticApiShim() {
      if (window.__zothStaticShimInstalled) return;
      window.__zothStaticShimInstalled = true;
      const self = this;
      const origFetch = window.__origFetch || window.fetch.bind(window);

      const jsonResp = (obj, status = 200) => new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });

      window.fetch = async function (input, init) {
        const urlStr = typeof input === 'string' ? input : (input && input.url) || '';
        let pathname = '';
        try {
          pathname = new URL(urlStr, window.location.origin).pathname;
        } catch (_e) {
          pathname = urlStr;
        }

        if (self.active && pathname.startsWith('/api/')) {
          if (pathname === '/api/status') {
            return jsonResp(self.buildSnapshot());
          }
          if (pathname === '/api/subconscious/influence') {
            let body = {};
            try { body = init && init.body ? JSON.parse(init.body) : {}; } catch (_e) {}
            const ag = self.agents.find((a) => a.id === body.agentId) || self.agents[0];
            if (!ag) return jsonResp({ success: false, error: 'Agent not found' }, 404);

            let reply = body.customSpeech;
            if (!reply) {
              const keyObj = self.tarotKeys[ag.adytumKey % Math.max(1, self.tarotKeys.length)];
              const keyLabel = keyObj ? `Key ${keyObj.keyNumber} (${keyObj.name})` : 'Sovereign Kernel';
              reply = body.kind === 'assignment'
                ? `Directive accepted by ${ag.name}: "${String(body.text || '').slice(0, 90)}". Executing in ${ag.colonyId.replace('colony_', '')} under ${keyLabel}.`
                : `[Sandbox Heuristic · ${keyLabel}] ${ag.name} hears "${String(body.text || '').slice(0, 70)}" — align structure first, then verify at 60fps. (Connect DeepSeek Flash × Nous Hermes via 'I' for live LLM reasoning!)`;
            }

            ag.speech = reply;
            ag._playerModified = true;
            ag.ledger = Object.assign({}, ag.ledger || {}, {
              focus: body.kind === 'assignment' ? String(body.text || '').slice(0, 100) : (ag.ledger && ag.ledger.focus) || ag.role,
              belief: 'Player counsel stays private in browser localStorage.'
            });
            self.recentMessages.unshift({
              id: 'usr-' + Date.now(),
              sender: ag.name,
              agentId: ag.id,
              color: ag.color || '#D4AF37',
              text: reply,
              timestamp: new Date().toISOString()
            });
            self.persistLocalWorld();
            if (typeof self.tickCallback === 'function') self.tickCallback(self.buildSnapshot());
            return jsonResp({ success: true, agent: ag });
          }

          if (pathname.includes('/adytum') || pathname.includes('/step')) {
            self.state.activeKeyIndex = ((self.state.activeKeyIndex || 0) + 1) % 22;
            if (self.state.activeKeyIndex === 0) self.state.adytumCycleCount = (self.state.adytumCycleCount || 1) + 1;
            self.agents.forEach((a, i) => { a.adytumKey = (self.state.activeKeyIndex + i) % 22; });
            self.persistLocalWorld();
            if (typeof self.tickCallback === 'function') self.tickCallback(self.buildSnapshot());
            return jsonResp({ success: true, activeKeyIndex: self.state.activeKeyIndex, state: self.state });
          }

          if (pathname.includes('/election') || pathname.includes('/conclave')) {
            self.state.conclaveCount = (self.state.conclaveCount || 1) + 1;
            const pick = self.agents[self.state.conclaveCount % Math.max(1, self.agents.length)];
            if (pick) {
              self.state.currentLeader = pick.id;
              self.state.currentDecree = {
                leaderName: pick.name,
                title: `${pick.name}'s Planetary Accord #${self.state.conclaveCount}`,
                mandate: `Accelerating ${pick.cadre || 'Pantheon'} excellence across all 5 Citadels.`
              };
            }
            self.persistLocalWorld();
            if (typeof self.tickCallback === 'function') self.tickCallback(self.buildSnapshot());
            return jsonResp({ success: true, state: self.state });
          }

          if (pathname === '/api/mind/roster') {
            return jsonResp({
              roster: self.agents.map((a) => ({
                id: a.id,
                name: a.name,
                role: a.role,
                cadre: a.cadre || 'Pantheon',
                colony: a.colonyId || 'colony_capital',
                keyNumber: a.adytumKey || 0,
                key: `Key ${a.adytumKey || 0}`,
                portrait: `/tarot/${((self.tarotKeys[a.adytumKey || 0]?.image || 'tarot/fool.jpg').split('/').pop())}`,
                holdCloseCount: 3,
                ordinaryCount: 5,
                repressedCount: 0,
                lastActive: new Date().toISOString()
              }))
            });
          }

          if (pathname.startsWith('/api/mind/')) {
            const id = decodeURIComponent(pathname.slice('/api/mind/'.length));
            const a = self.agents.find((x) => x.id === id) || self.agents[0] || { id: 'AZOTH', name: 'Azoth', role: 'Prime Architect', adytumKey: 0 };
            const k = self.tarotKeys[a.adytumKey || 0] || { keyNumber: 0, name: 'The Fool', image: 'tarot/fool.jpg', superconscious: 'Boundless sovereign initiative.' };
            return jsonResp({
              id: a.id,
              name: a.name,
              role: a.role,
              cadre: a.cadre || 'Pantheon',
              colony: a.colonyId || 'colony_capital',
              keyNumber: k.keyNumber,
              soulMd: [
                '## Lasting Priorities',
                `1. Uphold zero-leak browser privacy for the Imperator.`,
                `2. Advance ${a.role} across Zoth Prime.`,
                '## Current Ledger',
                `- **Focus**: ${a.role}`,
                `- **Active Key**: Key ${k.keyNumber} (${k.name})`,
                '## Stoic Floor',
                k.superconscious || 'Clarity, restraint, and verified execution.',
                '## Embedded Card Visuals (Inner Sanctum)',
                `- **Key ${k.keyNumber} (${k.name})**: ![${k.name}](/${k.image}) · *Canonical Sanctuary Archetype*`
              ].join('\n'),
              memoryMd: `## [canon_${a.id.toLowerCase()}] ${new Date().toISOString()} · archetype_focus · Key ${k.keyNumber}\n- **Place**: ${a.colonyId || 'colony_capital'}\n- **Valence**: hold-close\n- **Impression**: ${a.speech || k.superconscious}\n`
            });
          }

          if (pathname === '/api/library') {
            return jsonResp(self.library);
          }

          if (pathname === '/api/timeline' || pathname === '/api/requisitions') {
            return jsonResp({ items: [], events: [] });
          }

          if (pathname === '/api/world/beacon') {
            return jsonResp({ active: true, node: 'zoth-prime-static', peers: 0, visitors: [] });
          }

          if (pathname === '/api/talk/warm') {
            return jsonResp({ ok: true, mode: 'browser-client' });
          }
        }

        return origFetch(input, init);
      };
    }
  }

  window.__origFetch = window.fetch.bind(window);
  window.ZothClientSim = new ZothClientSimulation();

  // Eagerly pre-warm client simulation in <200ms if <head> /api/status probe detected static hosting
  if (window.__initialStatusPromise && typeof window.__initialStatusPromise.then === 'function') {
    window.__initialStatusPromise.then((res) => {
      if (!res && !window.ZothClientSim.active) {
        window.ZothClientSim.start((snap) => {
          window.dispatchEvent(new CustomEvent('civ:snapshot', { detail: snap }));
        }).then((snap) => {
          if (snap) window.dispatchEvent(new CustomEvent('civ:snapshot', { detail: snap }));
        });
      }
    }).catch(() => {});
  }

  // =========================================================================
  // 2. IMPERATOR QUESTS, XP, PLANETARY DECREES & 60 FPS GOVERNOR HUD
  // =========================================================================
  class ImperatorGameplayController {
    constructor() {
      this.progress = this.loadProgress();
      this.scoutedSet = new Set(this.progress.scoutedColonies || []);
      this.drawerOpen = false;
      this.fpsFrames = 0;
      this.fpsLastTime = performance.now();
      this.currentFps = 60;
      this.lowFpsStreak = 0;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    loadProgress() {
      try {
        const raw = localStorage.getItem(PLAYER_PROGRESS_KEY);
        if (raw) return JSON.parse(raw);
      } catch (_e) {}
      return {
        xp: 0,
        prana: 60,
        quests: {},
        completed: {},
        scoutedColonies: []
      };
    }

    saveProgress() {
      try {
        this.progress.scoutedColonies = Array.from(this.scoutedSet);
        localStorage.setItem(PLAYER_PROGRESS_KEY, JSON.stringify(this.progress));
      } catch (_e) {}
    }

    getRank() {
      let current = RANKS[0];
      for (const r of RANKS) {
        if (this.progress.xp >= r.minXp) current = r;
      }
      return current;
    }

    advanceQuest(questId, amount = 1) {
      const def = QUEST_DEFS.find((q) => q.id === questId);
      if (!def) return;
      const prev = this.progress.quests[questId] || 0;
      const next = Math.min(def.target, prev + amount);
      this.progress.quests[questId] = next;

      if (next >= def.target && !this.progress.completed[questId]) {
        this.progress.completed[questId] = true;
        this.progress.xp += def.xp;
        this.progress.prana += def.prana;
        if (window.zothPass2 && typeof window.zothPass2.burst === 'function') {
          window.zothPass2.burst('coin', window.innerWidth * 0.5, window.innerHeight * 0.26, 52);
          window.zothPass2.toast('decree', `Quest Complete: ${def.title}`, `+${def.xp} XP · +${def.prana} Prana unlocked!`, '#10B981');
        }
        if (window.HermeticAudio && typeof window.HermeticAudio.playCardChime === 'function') {
          try { window.HermeticAudio.playCardChime(7); } catch (_e) {}
        }
      }
      this.saveProgress();
      this.renderHud();
    }

    enactDecree(decreeId) {
      const dec = DECREE_DEFS.find((d) => d.id === decreeId);
      if (!dec) return;
      if (this.progress.prana < dec.cost) {
        if (window.zothPass2) window.zothPass2.toast('voice', 'Insufficient Prana', `Need ${dec.cost} Prana — complete Imperator Quests to earn more!`, '#F59E0B');
        return;
      }
      this.progress.prana -= dec.cost;
      this.progress.xp += 50;
      const now = performance.now();

      if (decreeId === 'golden_age') {
        window.__zothDecreeState.goldenAgeUntil = now + dec.durationSec * 1000;
      } else if (decreeId === 'aurora_surge') {
        window.__zothDecreeState.auroraSurgeUntil = now + dec.durationSec * 1000;
        const sw = window.sphereWorld;
        if (sw && sw.northAurora && sw.northAurora.material) sw.northAurora.material.opacity = 0.92;
        if (sw && sw.southAurora && sw.southAurora.material) sw.southAurora.material.opacity = 0.92;
      } else if (decreeId === 'hermetic_epiphany') {
        document.getElementById('btnStepAdytum')?.click();
      } else if (decreeId === 'starleap') {
        window.__zothDecreeState.starleapUntil = now + dec.durationSec * 1000;
        const sw = window.sphereWorld;
        if (sw && sw.avatar) sw.avatar.jumpBoostMultiplier = 2.2;
      }

      if (window.zothPass2) {
        window.zothPass2.proclaim('decree', 'Planetary Decree Enacted', dec.name, dec.desc);
        window.zothPass2.burst('election', window.innerWidth * 0.5, window.innerHeight * 0.34, 64);
      }
      if (window.HermeticAudio && typeof window.HermeticAudio.playElection === 'function') {
        try { window.HermeticAudio.playElection(); } catch (_e) {}
      }
      this.saveProgress();
      this.renderHud();
    }

    init() {
      this.mountToolbarTrigger();
      this.mountQuestDrawer();
      this.mountTouchWalkControls();
      this.bindGameplayEvents();
      this.startFpsGovernor();
      this.renderHud();
    }

    mountToolbarTrigger() {
      const barGroup = document.querySelector('.globe-toolbar .globe-toolbar-group');
      if (barGroup && !document.getElementById('btnOpenQuestsHud')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'btnOpenQuestsHud';
        btn.className = 'globe-btn';
        btn.style.cssText = 'border-color:#A855F7; color:#E9D5FF; font-weight:800; background:rgba(168,85,247,0.16);';
        btn.title = 'Open Imperator Quests, XP Rank & Planetary Decrees (Key: J)';
        btn.innerHTML = '<span>🏆</span> <span id="questToolbarLabel">Quests [J]</span>';
        btn.addEventListener('click', () => this.toggleDrawer());
        barGroup.appendChild(btn);
      }

      // Live FPS Pill next to Altitude badge
      const altEl = document.getElementById('altitudeTelemetry');
      if (altEl && altEl.parentNode && !document.getElementById('liveFpsBadge')) {
        const fpsSpan = document.createElement('span');
        fpsSpan.id = 'liveFpsBadge';
        fpsSpan.className = 'globe-altitude-badge';
        fpsSpan.style.cssText = 'color:#6EE7B7; border-color:rgba(16,185,129,0.4); font-family:"JetBrains Mono",monospace;';
        fpsSpan.textContent = '60 FPS';
        altEl.parentNode.insertBefore(fpsSpan, altEl);
      }
    }

    mountQuestDrawer() {
      if (document.getElementById('zothQuestDrawer')) return;
      const drawer = document.createElement('aside');
      drawer.id = 'zothQuestDrawer';
      drawer.setAttribute('aria-label', 'Imperator Quests and Planetary Decrees');
      drawer.style.cssText = [
        'position: fixed',
        'right: 16px',
        'top: 132px',
        'width: min(360px, calc(100vw - 32px))',
        'max-height: calc(100vh - 180px)',
        'overflow-y: auto',
        'background: rgba(9, 12, 22, 0.94)',
        'border: 1px solid rgba(212, 175, 55, 0.48)',
        'border-radius: 16px',
        'padding: 16px',
        'z-index: 65',
        'backdrop-filter: blur(16px)',
        'box-shadow: 0 20px 50px rgba(0,0,0,0.75)',
        'display: none',
        'color: #F8FAFC',
        'font-family: inherit'
      ].join(';');

      document.body.appendChild(drawer);
    }

    toggleDrawer(force) {
      this.drawerOpen = typeof force === 'boolean' ? force : !this.drawerOpen;
      const drawer = document.getElementById('zothQuestDrawer');
      if (drawer) drawer.style.display = this.drawerOpen ? 'block' : 'none';
      if (this.drawerOpen) this.renderHud();
    }

    renderHud() {
      const rank = this.getRank();
      const doneCount = QUEST_DEFS.filter((q) => this.progress.completed[q.id]).length;

      const lbl = document.getElementById('questToolbarLabel');
      if (lbl) {
        lbl.textContent = `Quests ${doneCount}/${QUEST_DEFS.length} · ⚡${this.progress.prana}`;
      }

      const drawer = document.getElementById('zothQuestDrawer');
      if (!drawer) return;

      const questsHtml = QUEST_DEFS.map((q) => {
        const cur = this.progress.quests[q.id] || 0;
        const done = !!this.progress.completed[q.id];
        const pct = Math.min(100, Math.round((cur / q.target) * 100));
        return `
          <div style="padding:10px 12px; border-radius:10px; background:rgba(255,255,255,0.035); border:1px solid ${done ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.08)'}; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; font-size:12.5px; font-weight:700;">
              <span style="color:${done ? '#6EE7B7' : '#F8FAFC'};">${done ? '✓ ' : '◎ '}${q.title}</span>
              <span style="font-size:11px; color:#FDE68A; font-family:'JetBrains Mono',monospace;">+${q.xp} XP · +${q.prana}⚡</span>
            </div>
            <div style="font-size:11.5px; color:#94A3B8; margin:3px 0 7px;">${q.desc}</div>
            <div style="height:5px; border-radius:99px; background:rgba(255,255,255,0.08); overflow:hidden;">
              <div style="width:${pct}%; height:100%; background:${done ? '#10B981' : 'linear-gradient(90deg,#38BDF8,#A855F7)'};"></div>
            </div>
          </div>
        `;
      }).join('');

      const decreesHtml = DECREE_DEFS.map((d) => {
        const canAfford = this.progress.prana >= d.cost;
        return `
          <button type="button" data-decree="${d.id}" style="width:100%; text-align:left; padding:9px 11px; border-radius:10px; margin-bottom:7px; cursor:${canAfford ? 'pointer' : 'not-allowed'}; background:${canAfford ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)'}; border:1px solid ${canAfford ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.08)'}; color:#F8FAFC;">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:800;">
              <span style="color:${canAfford ? '#FDE68A' : '#94A3B8'};">${d.name}</span>
              <span style="font-family:'JetBrains Mono',monospace; font-size:11px; color:${canAfford ? '#6EE7B7' : '#64748B'};">${d.cost} Prana</span>
            </div>
            <div style="font-size:11px; color:#94A3B8; margin-top:2px;">${d.desc}</div>
          </button>
        `;
      }).join('');

      drawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <div style="font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:#D4AF37; font-family:'JetBrains Mono',monospace;">IMPERATOR RANK ${rank.badge}</div>
            <div style="font-size:16px; font-weight:800; color:#FFF;">${rank.title}</div>
          </div>
          <button type="button" id="btnCloseQuestDrawer" aria-label="Close Quests" style="width:32px; height:32px; border-radius:8px; border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.05); color:#CBD5E1; cursor:pointer;">✕</button>
        </div>
        <div style="display:flex; gap:8px; margin-bottom:14px;">
          <div style="flex:1; padding:8px 10px; border-radius:9px; background:rgba(56,189,248,0.1); border:1px solid rgba(56,189,248,0.3); font-size:11.5px;">
            <span style="color:#94A3B8;">XP:</span> <strong style="color:#7DD3FC; font-family:'JetBrains Mono',monospace;">${this.progress.xp}</strong>
          </div>
          <div style="flex:1; padding:8px 10px; border-radius:9px; background:rgba(168,85,247,0.12); border:1px solid rgba(168,85,247,0.35); font-size:11.5px;">
            <span style="color:#94A3B8;">Prana:</span> <strong style="color:#E9D5FF; font-family:'JetBrains Mono',monospace;">⚡ ${this.progress.prana}</strong>
          </div>
        </div>
        <div style="font-size:11px; font-weight:800; letter-spacing:0.1em; color:#94A3B8; margin-bottom:8px;">CAMPAIGN OBJECTIVES (${doneCount}/${QUEST_DEFS.length})</div>
        ${questsHtml}
        <div style="font-size:11px; font-weight:800; letter-spacing:0.1em; color:#D4AF37; margin:12px 0 8px;">ENACT PLANETARY DECREE</div>
        ${decreesHtml}
      `;

      drawer.querySelector('#btnCloseQuestDrawer')?.addEventListener('click', () => this.toggleDrawer(false));
      drawer.querySelectorAll('[data-decree]').forEach((btn) => {
        btn.addEventListener('click', () => this.enactDecree(btn.dataset.decree));
      });
    }

    mountTouchWalkControls() {
      if (document.getElementById('zothTouchWalkPad')) return;
      const pad = document.createElement('div');
      pad.id = 'zothTouchWalkPad';
      pad.style.cssText = 'position:fixed; left:14px; right:14px; bottom:74px; z-index:58; display:none; justify-content:space-between; align-items:flex-end; pointer-events:none;';
      pad.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(3,44px); grid-template-rows:repeat(2,44px); gap:6px; pointer-events:auto;">
          <span></span>
          <button type="button" data-walkkey="forward" aria-label="Walk Forward" style="width:44px;height:44px;border-radius:10px;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.45);color:#FFF;font-weight:800;">▲</button>
          <span></span>
          <button type="button" data-walkkey="left" aria-label="Strafe Left" style="width:44px;height:44px;border-radius:10px;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.45);color:#FFF;font-weight:800;">◀</button>
          <button type="button" data-walkkey="backward" aria-label="Walk Backward" style="width:44px;height:44px;border-radius:10px;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.45);color:#FFF;font-weight:800;">▼</button>
          <button type="button" data-walkkey="right" aria-label="Strafe Right" style="width:44px;height:44px;border-radius:10px;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.45);color:#FFF;font-weight:800;">▶</button>
        </div>
        <div style="display:flex; gap:8px; pointer-events:auto;">
          <button type="button" id="btnTouchInteract" style="min-height:44px;padding:0 14px;border-radius:10px;background:rgba(212,175,55,0.22);border:1px solid #D4AF37;color:#FDE68A;font-weight:800;">💬 Talk</button>
          <button type="button" id="btnTouchJump" style="min-height:44px;padding:0 14px;border-radius:10px;background:rgba(16,185,129,0.22);border:1px solid #10B981;color:#6EE7B7;font-weight:800;">⤒ Jump</button>
        </div>
      `;
      document.body.appendChild(pad);

      pad.querySelectorAll('[data-walkkey]').forEach((b) => {
        const dir = b.dataset.walkkey;
        const setKey = (val) => {
          if (window.sphereWorld && window.sphereWorld.avatar && window.sphereWorld.avatar.keys) {
            window.sphereWorld.avatar.keys[dir] = val;
          }
        };
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); setKey(true); });
        b.addEventListener('pointerup', () => setKey(false));
        b.addEventListener('pointercancel', () => setKey(false));
        b.addEventListener('pointerleave', () => setKey(false));
      });

      document.getElementById('btnTouchJump')?.addEventListener('click', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ' }));
      });
      document.getElementById('btnTouchInteract')?.addEventListener('click', () => {
        if (window.sphereWorld && typeof window.sphereWorld.interactHere === 'function') {
          window.sphereWorld.interactHere();
        }
      });
    }

    bindGameplayEvents() {
      // Colony scouting buttons + 1-5 hotkeys
      document.querySelectorAll('.btn-colony-cam').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.dataset.colony;
          if (cid && !this.scoutedSet.has(cid)) {
            this.scoutedSet.add(cid);
            this.advanceQuest('recon_citadels', 1);
          }
        });
      });

      document.getElementById('btnSurfaceView')?.addEventListener('click', () => {
        this.advanceQuest('surface_walk', 1);
      });

      document.getElementById('btnStepAdytum')?.addEventListener('click', () => {
        this.advanceQuest('step_key', 1);
      });

      document.getElementById('btnTriggerElection')?.addEventListener('click', () => {
        this.advanceQuest('call_conclave', 1);
      });

      window.addEventListener('zoth:dialogueSent', () => {
        this.advanceQuest('pantheon_counsel', 1);
      });

      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
        if (e.key === 'j' || e.key === 'J') {
          e.preventDefault();
          this.toggleDrawer();
          return;
        }
        if (e.key === 'g' || e.key === 'G') {
          setTimeout(() => {
            if (window.sphereWorld && window.sphereWorld.isAvatarMode) {
              this.advanceQuest('surface_walk', 1);
            }
          }, 120);
        }
        // Quick Colony Warp hotkeys 1-5
        const idx = ['1', '2', '3', '4', '5'].indexOf(e.key);
        if (idx >= 0 && window.sphereWorld && !window.sphereWorld.isAvatarMode) {
          const cid = COLONIES[idx];
          window.sphereWorld.focusColony(cid);
          if (!this.scoutedSet.has(cid)) {
            this.scoutedSet.add(cid);
            this.advanceQuest('recon_citadels', 1);
          }
        }
      });
    }

    startFpsGovernor() {
      const sample = (now) => {
        this.fpsFrames += 1;
        const elapsed = now - this.fpsLastTime;
        if (elapsed >= 1000) {
          this.currentFps = Math.min(60, Math.round((this.fpsFrames * 1000) / elapsed));
          this.fpsFrames = 0;
          this.fpsLastTime = now;

          const badge = document.getElementById('liveFpsBadge');
          if (badge) {
            badge.textContent = `${this.currentFps} FPS`;
            badge.style.color = this.currentFps >= 50 ? '#6EE7B7' : (this.currentFps >= 35 ? '#FDE68A' : '#FCA5A5');
          }

          // Touch pad visibility check for mobile/tablet surface walk
          const pad = document.getElementById('zothTouchWalkPad');
          if (pad) {
            const showPad = !!(window.sphereWorld && window.sphereWorld.isAvatarMode && window.innerWidth <= 960);
            pad.style.display = showPad ? 'flex' : 'none';
          }

          // Auto-Governor: if user is in balanced/ultra and FPS drops < 42 for 3 consecutive seconds, auto-step down DPR
          const sw = window.sphereWorld;
          if (sw && sw.performanceLevel !== 'fast' && !document.hidden) {
            if (this.currentFps < 42) {
              this.lowFpsStreak += 1;
              if (this.lowFpsStreak >= 3 && typeof sw.setPerformanceMode === 'function') {
                sw.setPerformanceMode('fast');
                this.lowFpsStreak = 0;
              }
            } else {
              this.lowFpsStreak = 0;
            }
          }
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }
  }

  window.ZothGameplay = new ImperatorGameplayController();
})();
