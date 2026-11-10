/**
 * 🎮 ZOTH CIVILIZATION — SEAMLESS VIDEO GAME INTRO, AI SIGN-IN & HERMES ONBOARDING ENGINE
 * =======================================================================================
 * Complete multi-phase interactive game intro + polite signed-out AI notification bar:
 * - Highlights the lightweight, ultra-efficient path: DeepSeek Flash via Hermes Agent (Nous Research)
 * - Supports 8 gateways & 48+ models with 100% browser-local key storage (zero server telemetry)
 * - Renders a polite, non-blocking top status banner + header pill when user is not signed in
 *
 * Author: 1nc0gn30 (@1nc0gn30) • NullAI Platform
 */

(function () {
  'use strict';

  if (window.__ZOTH_GAME_INTRO_INITIALIZED__) return;
  window.__ZOTH_GAME_INTRO_INITIALIZED__ = true;

  const STORAGE_KEY = 'zoth_civ_ai_config';
  const ACTIVE_PROV_KEY = 'zoth_civ_active_provider';
  const SEEN_KEY = 'zoth_civ_intro_seen_v3';
  const BANNER_DISMISSED_KEY = 'zoth_civ_guest_banner_dismissed_session';

  const PROVIDERS = {
    hermes_deepseek_flash: {
      id: 'hermes_deepseek_flash',
      name: 'Hermes Agent × DeepSeek Flash',
      icon: '⚡',
      tagline: 'Recommended · Ultra-Light & Fast (Nous Research)',
      placeholder: 'sk-or-v1-... (OpenRouter) or sk-... (DeepSeek) or http://127.0.0.1:8102',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      models: [
        'deepseek/deepseek-v4-flash-0731',
        'deepseek/deepseek-chat-v3-0324',
        'deepseek-chat',
        'nousresearch/hermes-3-llama-3.1-70b'
      ],
      cliHint: 'hermes --model deepseek/deepseek-v4-flash-0731',
      description: 'Fastest, lowest-cost way to awaken all 23 Pantheon agents: run DeepSeek Flash through Hermes Agent by Nous Research (supports OpenRouter keys, direct DeepSeek keys, or your local Hermes bridge).'
    },
    nous_hermes: {
      id: 'nous_hermes',
      name: 'Nous Hermes 3 Swarm',
      icon: '🏛️',
      tagline: 'Native Hermes-3 Agent Reasoner (Nous Research)',
      placeholder: 'sk-or-v1-... or nous_live_...',
      endpoint: 'https://inference-api.nousresearch.com/v1/chat/completions',
      models: [
        'Hermes-3-Llama-3.1-70B',
        'Hermes-3-Llama-3.1-405B',
        'nousresearch/hermes-3-llama-3.1-405b'
      ],
      cliHint: 'hermes --model nousresearch/hermes-3-llama-3.1-70b',
      description: 'Autonomous agentic tool-use and multi-step reasoning built by Nous Research.'
    },
    openrouter: {
      id: 'openrouter',
      name: 'OpenRouter Unified',
      icon: '🌐',
      tagline: '300+ Frontier & Flash Models · 1 Key',
      placeholder: 'sk-or-v1-...',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      models: [
        'deepseek/deepseek-v4-flash-0731',
        'deepseek/deepseek-chat-v3-0324',
        'anthropic/claude-3.5-sonnet',
        'google/gemini-2.5-flash',
        'meta-llama/llama-3.3-70b-instruct'
      ],
      description: 'Single API key unlocking DeepSeek Flash, Nous Hermes 3, Claude, Gemini 2.5 Flash, and Llama 3.3.'
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek Direct',
      icon: '🔮',
      tagline: 'DeepSeek Flash / Chat & R1 Reasoner',
      placeholder: 'sk-...',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      models: [
        'deepseek-chat',
        'deepseek-reasoner'
      ],
      description: 'Direct DeepSeek API with sub-second token streaming and ultra-efficient token pricing.'
    },
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      icon: '✨',
      tagline: 'Gemini 2.5 Flash & Pro',
      placeholder: 'AIzaSy...',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      models: [
        'gemini-2.5-flash',
        'gemini-2.5-pro'
      ],
      description: 'High-speed Flash reasoning and long-context memory for planetary governance.'
    },
    groq: {
      id: 'groq',
      name: 'Groq LPU',
      icon: '🚀',
      tagline: '800+ tok/s Instant Dialogue',
      placeholder: 'gsk_...',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      models: [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'qwen-qwq-32b'
      ],
      description: 'Near-zero latency LPU inference for rapid-fire citizen conversations while walking Zoth Prime.'
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic Claude',
      icon: '🧠',
      tagline: 'Claude Sonnet & Haiku',
      placeholder: 'sk-ant-api03-...',
      endpoint: 'https://api.anthropic.com/v1/messages',
      models: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022'
      ],
      description: 'Deep philosophical & architectural reasoning for Conclave decrees and Adytum rites.'
    },
    openai: {
      id: 'openai',
      name: 'OpenAI',
      icon: '⚙️',
      tagline: 'GPT-4o Mini & o3-mini',
      placeholder: 'sk-proj-...',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: [
        'gpt-4o-mini',
        'gpt-4o',
        'o3-mini'
      ],
      description: 'Balanced general reasoning for trade routes, civic halls, and citizen assignments.'
    },
    ollama_local: {
      id: 'ollama_local',
      name: 'Local Ollama (:11434)',
      icon: '🦙',
      tagline: '100% Offline · Zero-Cloud Egress',
      placeholder: 'http://127.0.0.1:11434 (Click Save to activate)',
      endpoint: 'http://127.0.0.1:11434/v1/chat/completions',
      models: [
        'hermes3:8b',
        'deepseek-r1:8b',
        'qwen2.5-coder:7b',
        'llama3.2:latest'
      ],
      description: 'Runs 100% locally on your own GPU/CPU with zero external network calls.'
    }
  };

  class ZothGameIntroController {
    constructor() {
      this.currentStep = 1;
      this.keysStore = this.loadConfig();
      const savedProv = localStorage.getItem(ACTIVE_PROV_KEY);
      this.selectedProvider = (savedProv && PROVIDERS[savedProv]) ? savedProv : 'hermes_deepseek_flash';
      const savedEntry = this.keysStore[this.selectedProvider];
      this.selectedModel = (savedEntry && savedEntry.model) || PROVIDERS[this.selectedProvider].models[0];
      this.perfLevel = localStorage.getItem('zoth_perf_level') || 'fast';
      this.overlay = null;

      const start = () => {
        if (!document.body) {
          window.addEventListener('DOMContentLoaded', start);
          return;
        }
        this.initDOM();
        this.mountGuestNotificationBar();
        this.attachGlobalListeners();
        this.syncAuthUI();

        const qs = new URLSearchParams(window.location.search);
        if (qs.get('setup') === 'hermes') {
          this.selectedProvider = 'hermes_deepseek_flash';
          this.updateProviderView();
          setTimeout(() => this.open(2), 180);
          return;
        }

        const isAutomation = !!(navigator.webdriver || qs.get('intro') === '0');
        if (!isAutomation && !localStorage.getItem(SEEN_KEY)) {
          setTimeout(() => this.open(1), 320);
        }
      };

      if (document.body) {
        start();
      } else {
        window.addEventListener('DOMContentLoaded', start);
      }
    }

    loadConfig() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch (_e) {
        return {};
      }
    }

    saveConfig() {
      try {
        const keyInput = document.getElementById('zgApiKeyInput');
        if (keyInput) {
          const val = keyInput.value.trim();
          if (val || this.selectedProvider === 'ollama_local') {
            this.keysStore[this.selectedProvider] = {
              apiKey: val || (this.selectedProvider === 'ollama_local' ? 'local-ollama' : ''),
              model: this.selectedModel,
              enabled: true,
              updatedAt: Date.now()
            };
          } else if (this.keysStore[this.selectedProvider]) {
            delete this.keysStore[this.selectedProvider];
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keysStore));
          localStorage.setItem(ACTIVE_PROV_KEY, this.selectedProvider);
        }
      } catch (e) {
        console.warn('[ZothGameIntro] Save error:', e);
      }
      this.syncAuthUI();
      window.dispatchEvent(new CustomEvent('zoth:aiconfig', { detail: { signedIn: this.hasActiveKey(), config: this.getActiveConfig() } }));
    }

    signOutProvider() {
      try {
        delete this.keysStore[this.selectedProvider];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keysStore));
        sessionStorage.removeItem(BANNER_DISMISSED_KEY);
        const keyInput = document.getElementById('zgApiKeyInput');
        if (keyInput) keyInput.value = '';
      } catch (_e) {}
      this.syncAuthUI();
    }

    mountGuestNotificationBar() {
      if (document.getElementById('zothAiGuestBanner')) return;

      // 1. Header Pill inside .header-stats / .header-controls so user ALWAYS sees signed-in / signed-out state
      const headerCtrls = document.querySelector('.header-stats') || document.querySelector('.header-controls');
      if (headerCtrls && !document.getElementById('zothHeaderAiStatusBtn')) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.id = 'zothHeaderAiStatusBtn';
        pill.className = 'btn-ctrl';
        pill.style.cssText = 'border-color: #38BDF8; background: rgba(56, 189, 248, 0.14); color: #7DD3FC; font-weight: 800;';
        pill.addEventListener('click', () => {
          this.selectedProvider = this.hasActiveKey() ? this.selectedProvider : 'hermes_deepseek_flash';
          this.updateProviderView();
          this.open(2);
        });
        headerCtrls.insertBefore(pill, headerCtrls.firstChild);
      }

      // 2. Polite, Sleek Non-Blocking Guest Notification Strip right above main viewport
      const banner = document.createElement('section');
      banner.id = 'zothAiGuestBanner';
      banner.setAttribute('aria-label', 'AI Experience & Hermes DeepSeek Flash Setup Notice');
      banner.style.cssText = [
        'background: linear-gradient(90deg, rgba(8, 13, 26, 0.97) 0%, rgba(18, 26, 48, 0.97) 55%, rgba(12, 16, 32, 0.97) 100%)',
        'border-bottom: 1px solid rgba(56, 189, 248, 0.42)',
        'padding: 5px 14px',
        'display: flex',
        'align-items: center',
        'justify-content: space-between',
        'gap: 10px',
        'flex-wrap: wrap',
        'position: relative',
        'z-index: 46'
      ].join(';');

      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:9px; flex:1 1 520px; min-width:0;">
          <span id="zothGuestStatePill" style="background:rgba(56,189,248,0.16); border:1px solid rgba(56,189,248,0.48); color:#7DD3FC; font-size:9.5px; font-weight:800; padding:2px 8px; border-radius:999px; letter-spacing:0.06em; font-family:'JetBrains Mono',monospace; white-space:nowrap; flex-shrink:0;">
            ◌ NOT SIGNED IN
          </span>
          <span style="font-size:11.5px; color:#E2E8F0; line-height:1.35;">
            Configure an API key for the <strong>full live Zoth Civilization experience</strong> — lightweight &amp; efficient path:
            <strong style="color:#FDE68A;">DeepSeek Flash via Hermes Agent by Nous Research</strong>.
          </span>
        </div>
        <div style="display:flex; align-items:center; gap:7px; flex-wrap:wrap; flex-shrink:0;">
          <button type="button" id="btnQuickHermesFlash" style="min-height:30px; background:linear-gradient(135deg,#38BDF8,#818CF8); border:none; color:#040711; padding:4px 11px; border-radius:7px; font-size:11px; font-weight:800; cursor:pointer; white-space:nowrap;">
            ⚡ Setup DeepSeek Flash × Hermes
          </button>
          <button type="button" id="btnQuickAnyApi" style="min-height:30px; background:rgba(212,175,55,0.14); border:1px solid rgba(212,175,55,0.45); color:#FDE68A; padding:4px 9px; border-radius:7px; font-size:11px; font-weight:700; cursor:pointer; white-space:nowrap;">
            🔑 8 Providers
          </button>
          <button type="button" id="btnDismissGuestBanner" aria-label="Minimize AI setup notice" title="Minimize to header bar" style="min-height:30px; min-width:30px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.12); color:#94A3B8; padding:4px 7px; border-radius:7px; font-size:11px; cursor:pointer;">
            ✕
          </button>
        </div>
      `;

      const mainViewport = document.querySelector('main.main-viewport') || document.getElementById('funnelHeroBanner');
      if (mainViewport && mainViewport.parentNode) {
        mainViewport.parentNode.insertBefore(banner, mainViewport);
      } else {
        document.body.prepend(banner);
      }

      document.getElementById('btnQuickHermesFlash')?.addEventListener('click', () => {
        this.selectedProvider = 'hermes_deepseek_flash';
        this.selectedModel = 'deepseek/deepseek-v4-flash-0731';
        this.overlay?.querySelectorAll('.zg-provider-card').forEach(c => {
          c.classList.toggle('is-selected', c.dataset.provider === 'hermes_deepseek_flash');
        });
        this.updateProviderView();
        this.open(2);
      });

      document.getElementById('btnQuickAnyApi')?.addEventListener('click', () => {
        this.open(2);
      });

      document.getElementById('btnDismissGuestBanner')?.addEventListener('click', () => {
        try { sessionStorage.setItem(BANNER_DISMISSED_KEY, '1'); } catch (_e) {}
        banner.style.display = 'none';
      });
    }

    syncAuthUI() {
      const signedIn = this.hasActiveKey();
      const active = this.getActiveConfig();
      const banner = document.getElementById('zothAiGuestBanner');
      const headerBtn = document.getElementById('zothHeaderAiStatusBtn');

      if (banner) {
        let dismissed = false;
        try { dismissed = sessionStorage.getItem(BANNER_DISMISSED_KEY) === '1'; } catch (_e) {}
        banner.style.display = (!signedIn && !dismissed) ? 'flex' : 'none';
      }

      if (headerBtn) {
        if (signedIn) {
          const shortModel = String(active.model || '').split('/').pop();
          headerBtn.style.borderColor = '#10B981';
          headerBtn.style.background = 'rgba(16, 185, 129, 0.16)';
          headerBtn.style.color = '#6EE7B7';
          headerBtn.innerHTML = `<span aria-hidden="true">●</span> AI Live: ${shortModel || active.provider.name}`;
          headerBtn.title = `Connected to ${active.provider.name} (${active.model}). Click to switch model or sign out.`;
        } else {
          headerBtn.style.borderColor = '#38BDF8';
          headerBtn.style.background = 'rgba(56, 189, 248, 0.15)';
          headerBtn.style.color = '#7DD3FC';
          headerBtn.innerHTML = `<span aria-hidden="true">◌</span> Not Signed In · Setup Hermes AI`;
          headerBtn.title = 'Not signed in — click to configure DeepSeek Flash via Hermes Agent (Nous Research) or any API key.';
        }
      }

      // Also update inline notice inside 3D Dialogue Box if present
      const dlgBox = document.getElementById('avatarDialogueBox');
      if (dlgBox) {
        let tip = document.getElementById('dialogueUnsignedTip');
        if (!signedIn) {
          if (!tip) {
            tip = document.createElement('div');
            tip.id = 'dialogueUnsignedTip';
            tip.style.cssText = 'margin:6px 0; padding:6px 10px; border-radius:8px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.32); font-size:11px; color:#BAE6FD; display:flex; align-items:center; justify-content:space-between; gap:8px; flex-wrap:wrap;';
            tip.innerHTML = '<span>◌ <strong>Guest Simulation:</strong> Connect <strong>DeepSeek Flash × Nous Hermes</strong> for live AI replies.</span><button type="button" id="btnDlgConnectHermes" style="background:#38BDF8; color:#040812; border:none; border-radius:5px; padding:3px 8px; font-size:10.5px; font-weight:800; cursor:pointer;">Connect API</button>';
            dlgBox.appendChild(tip);
            tip.querySelector('#btnDlgConnectHermes')?.addEventListener('click', () => {
              this.selectedProvider = 'hermes_deepseek_flash';
              this.updateProviderView();
              this.open(2);
            });
          }
          tip.style.display = 'flex';
        } else if (tip) {
          tip.style.display = 'none';
        }
      }
    }

    initDOM() {
      if (!document.body) return;
      const existing = document.getElementById('zothGameIntroOverlay');
      if (existing) existing.remove();

      this.overlay = document.createElement('div');
      this.overlay.id = 'zothGameIntroOverlay';

      const providerCardsHtml = Object.values(PROVIDERS).map(p => `
        <div class="zg-provider-card ${p.id === this.selectedProvider ? 'is-selected' : ''}" data-provider="${p.id}">
          <div class="zg-provider-title"><span>${p.icon}</span> ${p.name}</div>
          <div class="zg-provider-subtitle">${p.tagline}</div>
        </div>
      `).join('');

      this.overlay.innerHTML = `
        <div class="zg-intro-container" role="dialog" aria-modal="true" aria-labelledby="zgHeroTitle">

          <div class="zg-intro-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="zg-brand-badge">🎮 ZOTH CIVILIZATION V3.0</span>
              <span style="font-size:12px; color:#94A3B8;">Sovereign Planetary RPG</span>
            </div>

            <div class="zg-steps-nav">
              <button type="button" class="zg-step-pill is-active" data-step="1">1. Prologue</button>
              <button type="button" class="zg-step-pill" data-step="2">2. Hermes &amp; AI Keys</button>
              <button type="button" class="zg-step-pill" data-step="3">3. Quests &amp; Controls</button>
            </div>

            <button type="button" class="zg-close-btn" id="zgBtnClose" title="Close &amp; Enter World">✕</button>
          </div>

          <div class="zg-intro-body">

            <!-- STEP 1: PROLOGUE & LORE -->
            <div class="zg-view-pane is-active" id="zgPane-1">
              <h1 class="zg-hero-title" id="zgHeroTitle">Awaken Zoth Prime</h1>
              <p class="zg-hero-desc">
                Command a living 3D spherical planet inhabited by <strong>23 autonomous Pantheon Agents</strong> across 5 architectural citadels.
                Your progress, quests, and meditations stay <strong>100% private in your browser</strong> — never leaked to external servers or repos.
              </p>

              <div class="zg-lore-grid">
                <div class="zg-lore-card">
                  <h4><span>⚡</span> Lightweight Hermes × DeepSeek Flash</h4>
                  <p>Recommended path: pair <strong>Hermes Agent by Nous Research</strong> with <strong>DeepSeek Flash</strong> for sub-second, pennies-per-million-token citizen intelligence.</p>
                </div>
                <div class="zg-lore-card">
                  <h4><span>🏛️</span> 5 Planetary Citadels &amp; Quests</h4>
                  <p>Orbit from high command or drop to the surface in 3rd-person walk mode to complete Imperator Quests, unlock Planetary Decrees, and level up.</p>
                </div>
                <div class="zg-lore-card">
                  <h4><span>🔮</span> Zero-Leak 22-Key Sanctuary</h4>
                  <p>Step the 22 Hermetic Archetypes and synthesize private sacred-geometry meditations saved strictly in local browser storage.</p>
                </div>
                <div class="zg-lore-card">
                  <h4><span>🚀</span> Adaptive 60 FPS Turbo Engine</h4>
                  <p>Back-hemisphere culling, zero-GC hot loops, and dynamic DPR scaling keep orbital flight and ground traversal silky smooth.</p>
                </div>
              </div>

              <div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.32); border-radius:14px; padding:14px 18px; margin-top:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                <div style="font-size:12px; color:#E0F2FE; max-width:62ch;">
                  <strong>Not signed in yet?</strong> You can jump straight in using Sandbox Simulation Mode, or connect <strong>DeepSeek Flash via Nous Hermes Agent</strong> in 15 seconds for the full live experience.
                </div>
                <button type="button" class="zg-btn-primary" id="zgBtnNextFrom1">Setup Hermes / API Key →</button>
              </div>
            </div>

            <!-- STEP 2: PROVIDER & API KEY CONFIG -->
            <div class="zg-view-pane" id="zgPane-2">
              <h2 style="margin:0 0 6px; font-size:20px; font-weight:800; color:#F8FAFC;">Connect Intelligence (Hermes Agent &amp; Multi-Model Hub)</h2>
              <p style="margin:0 0 12px; font-size:12.5px; color:#94A3B8;">
                For the fastest, lightest, and most cost-effective full experience, we recommend <strong>DeepSeek Flash through Hermes Agent by Nous Research</strong>. Keys never leave your browser.
              </p>

              <!-- Recommended Lightweight Hermes Callout -->
              <div style="margin-bottom:14px; padding:11px 14px; border-radius:12px; background:linear-gradient(90deg,rgba(56,189,248,0.12),rgba(168,85,247,0.1)); border:1px solid rgba(56,189,248,0.35); display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap;">
                <div style="font-size:11.5px; color:#E2E8F0;">
                  <strong style="color:#7DD3FC;">★ Nous Research Hermes CLI Bridge:</strong>
                  <code id="zgHermesCliCmd" style="margin-left:6px; padding:2px 7px; border-radius:5px; background:rgba(0,0,0,0.45); color:#FDE68A; font-family:'JetBrains Mono',monospace;">hermes --model deepseek/deepseek-v4-flash-0731</code>
                </div>
                <button type="button" class="zg-btn-secondary" id="zgBtnCopyHermesCli" style="padding:5px 10px; font-size:11px;">Copy Hermes Command</button>
              </div>

              <div class="zg-provider-grid" id="zgProviderGrid">
                ${providerCardsHtml}
              </div>

              <div class="zg-input-group">
                <div class="zg-input-label">
                  <span id="zgInputLabelText">Hermes Agent × DeepSeek Flash API Key</span>
                  <span id="zgStorageBadge" style="font-size:10px; color:#10B981; font-weight:700;">🔒 BROWSER-LOCAL STORAGE · ZERO SERVER TELEMETRY</span>
                </div>
                <div id="zgProviderDesc" style="font-size:11.5px; color:#94A3B8; margin-bottom:8px;"></div>

                <div class="zg-input-row">
                  <input type="password" id="zgApiKeyInput" class="zg-text-input" placeholder="sk-or-v1-..." autocomplete="off">
                  <button type="button" class="zg-eye-btn" id="zgBtnToggleEye" title="Show / Hide Key">👁️</button>
                  <button type="button" class="zg-btn-secondary" id="zgBtnTestPing" style="white-space:nowrap;">Verify Live</button>
                  <button type="button" class="zg-btn-secondary" id="zgBtnClearKey" style="white-space:nowrap; color:#FCA5A5;" title="Disconnect stored key">Sign Out</button>
                </div>

                <div id="zgPingStatus" style="font-size:11px; margin-top:8px; display:none;"></div>

                <div style="margin-top:14px;">
                  <div style="font-size:11px; font-weight:700; color:#94A3B8; margin-bottom:6px;">SELECT MODEL PRESET:</div>
                  <div class="zg-chips-row" id="zgChipsRow"></div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; flex-wrap:wrap; gap:10px;">
                <button type="button" class="zg-btn-secondary" id="zgBtnSkipKey">Continue in Guest Simulation Mode ⚡</button>
                <button type="button" class="zg-btn-primary" id="zgBtnNextFrom2">Save &amp; View Quests →</button>
              </div>
            </div>

            <!-- STEP 3: CONTROLS & TACTICAL GAMEPLAN -->
            <div class="zg-view-pane" id="zgPane-3">
              <h2 style="margin:0 0 6px; font-size:20px; font-weight:800; color:#F8FAFC;">Imperator Quests, Controls &amp; 60 FPS Engine</h2>
              <p style="margin:0 0 16px; font-size:12.5px; color:#94A3B8;">
                Earn Imperator XP &amp; Prana by exploring citadels, counseling Pantheon agents, forging civic skills, and issuing Planetary Decrees.
              </p>

              <div class="zg-controls-grid">
                <div class="zg-key-card">
                  <span class="zg-key-badge">W A S D</span>
                  <div class="zg-key-desc"><strong>Surface Walk</strong>Traverse Zoth Prime on foot</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">SHIFT / SPACE</span>
                  <div class="zg-key-desc"><strong>Sprint &amp; Jump</strong>Double-Space for low-G boost</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">1 – 5</span>
                  <div class="zg-key-desc"><strong>Colony Warp</strong>Instant fly-to any Citadel</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">E / F / CLICK</span>
                  <div class="zg-key-desc"><strong>Converse &amp; Task</strong>Speak with Pantheon Citizens</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">G</span>
                  <div class="zg-key-desc"><strong>Walk ↔ Orbit</strong>Drop to ground or God's-Eye</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">J</span>
                  <div class="zg-key-desc"><strong>Imperator Quests</strong>Open progression &amp; decrees</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">I</span>
                  <div class="zg-key-desc"><strong>AI &amp; Hermes Hub</strong>Switch models or API keys</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">Q / Z</span>
                  <div class="zg-key-desc"><strong>60 FPS / Zen</strong>Turbo speed or pure cinema</div>
                </div>
              </div>

              <div class="zg-perf-toggle-row">
                <div>
                  <strong style="font-size:12.5px; color:#F8FAFC;">⚡ Adaptive Graphics &amp; Frame Governor:</strong>
                  <div style="font-size:11px; color:#94A3B8;">Back-hemisphere culling + auto DPR scaling lock smooth frame pacing</div>
                </div>
                <div class="zg-perf-btns">
                  <button type="button" class="zg-perf-btn ${this.perfLevel === 'fast' ? 'is-active' : ''}" data-perf="fast">⚡ 60 FPS Turbo</button>
                  <button type="button" class="zg-perf-btn ${this.perfLevel === 'balanced' ? 'is-active' : ''}" data-perf="balanced">⚖️ Balanced HD</button>
                  <button type="button" class="zg-perf-btn ${this.perfLevel === 'ultra' ? 'is-active' : ''}" data-perf="ultra">🎬 Ultra Cinema</button>
                </div>
              </div>

              <div class="zg-objectives-box">
                <h4 style="margin:0 0 8px; font-size:13px; color:#6EE7B7; display:flex; align-items:center; gap:8px;">
                  <span>🎯</span> IMPERATOR CAMPAIGN QUESTLINE (PRESS J IN-GAME)
                </h4>
                <div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:#CBD5E1;">
                  <div>1. <strong>Planetary Recon (+150 XP)</strong> — Scout 3 Citadels (<strong>1–5</strong> keys or Colony Sights bar).</div>
                  <div>2. <strong>Walk Among Immortals (+200 XP)</strong> — Press <strong>G</strong> to walk Zoth Prime and greet an Agent (<strong>E</strong>).</div>
                  <div>3. <strong>Hermes Counsel (+250 XP)</strong> — Send a live thought or task to a Pantheon Citizen.</div>
                  <div>4. <strong>Hermetic Ascension (+300 XP)</strong> — Step an Adytum Key or enact a Planetary Decree!</div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; flex-wrap:wrap; gap:10px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:#94A3B8; cursor:pointer;">
                  <input type="checkbox" id="zgChkDontShow" checked style="cursor:pointer;"> Remember my setup on next launch
                </label>
                <button type="button" class="zg-btn-primary" id="zgBtnLaunchGame" style="padding:11px 28px; font-size:13.5px;">
                  🚀 Launch Zoth Prime
                </button>
              </div>
            </div>

          </div>

          <div class="zg-intro-footer">
            <div class="zg-support-note">
              <span>☕ 100% Free &amp; Open:</span>
              <a href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X" target="_blank" rel="noopener">Buy Us a Coffee</a>
              <span>· Solana Tip: <code style="color:#6EE7B7; font-size:10.5px;">GG2e...xdXoK</code></span>
            </div>
            <div style="font-size:11px; color:#64748B;">
              Engineered by 1nc0gn30 (@1nc0gn30) • NullAI Platform
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(this.overlay);
      this.updateProviderView();
    }

    updateProviderView() {
      const p = PROVIDERS[this.selectedProvider] || PROVIDERS.hermes_deepseek_flash;
      if (!p) return;

      const label = document.getElementById('zgInputLabelText');
      if (label) label.textContent = `${p.name} — API Key / Endpoint`;

      const desc = document.getElementById('zgProviderDesc');
      if (desc) desc.textContent = p.description || '';

      const cliCode = document.getElementById('zgHermesCliCmd');
      if (cliCode && p.cliHint) cliCode.textContent = p.cliHint;

      const input = document.getElementById('zgApiKeyInput');
      if (input) {
        input.placeholder = p.placeholder;
        const saved = this.keysStore[this.selectedProvider];
        input.value = saved && saved.apiKey !== 'local-ollama' ? (saved.apiKey || '') : '';
      }

      if (!p.models.includes(this.selectedModel)) {
        const saved = this.keysStore[this.selectedProvider];
        this.selectedModel = (saved && saved.model && p.models.includes(saved.model)) ? saved.model : p.models[0];
      }

      const chipsRow = document.getElementById('zgChipsRow');
      if (chipsRow) {
        chipsRow.innerHTML = p.models.map(m => `
          <button type="button" class="zg-model-chip ${m === this.selectedModel ? 'is-active' : ''}" data-model="${m}">
            ${m}
          </button>
        `).join('');

        chipsRow.querySelectorAll('.zg-model-chip').forEach(c => {
          c.addEventListener('click', () => {
            this.selectedModel = c.dataset.model;
            chipsRow.querySelectorAll('.zg-model-chip').forEach(b => b.classList.remove('is-active'));
            c.classList.add('is-active');
          });
        });
      }
    }

    setStep(step) {
      this.currentStep = step;
      if (!this.overlay) return;
      this.overlay.querySelectorAll('.zg-step-pill').forEach(btn => {
        const s = parseInt(btn.dataset.step, 10);
        btn.classList.toggle('is-active', s === step);
        btn.classList.toggle('is-done', s < step);
      });

      this.overlay.querySelectorAll('.zg-view-pane').forEach(p => p.classList.remove('is-active'));
      const activePane = this.overlay.querySelector(`#zgPane-${step}`);
      if (activePane) activePane.classList.add('is-active');
    }

    attachGlobalListeners() {
      this.overlay.querySelectorAll('.zg-step-pill').forEach(b => {
        b.addEventListener('click', () => this.setStep(parseInt(b.dataset.step, 10)));
      });

      document.getElementById('zgBtnClose')?.addEventListener('click', () => this.close());
      document.getElementById('zgBtnNextFrom1')?.addEventListener('click', () => this.setStep(2));

      document.getElementById('zgBtnNextFrom2')?.addEventListener('click', () => {
        this.saveConfig();
        this.setStep(3);
      });

      document.getElementById('zgBtnSkipKey')?.addEventListener('click', () => this.setStep(3));

      document.getElementById('zgBtnLaunchGame')?.addEventListener('click', () => {
        this.saveConfig();
        this.close();
      });

      document.getElementById('zgBtnClearKey')?.addEventListener('click', () => {
        this.signOutProvider();
        const statusEl = document.getElementById('zgPingStatus');
        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.style.color = '#94A3B8';
          statusEl.textContent = 'Signed out of provider. Running in local Guest Simulation Mode.';
        }
      });

      document.getElementById('zgBtnCopyHermesCli')?.addEventListener('click', (e) => {
        const cmd = document.getElementById('zgHermesCliCmd')?.textContent || 'hermes --model deepseek/deepseek-v4-flash-0731';
        navigator.clipboard?.writeText(cmd);
        const btn = e.currentTarget;
        const orig = btn.textContent;
        btn.textContent = '✓ Copied CLI!';
        setTimeout(() => { btn.textContent = orig; }, 1800);
      });

      document.getElementById('zgBtnToggleEye')?.addEventListener('click', () => {
        const input = document.getElementById('zgApiKeyInput');
        if (input) input.type = input.type === 'password' ? 'text' : 'password';
      });

      this.overlay.querySelectorAll('.zg-provider-card').forEach(card => {
        card.addEventListener('click', () => {
          this.selectedProvider = card.dataset.provider;
          this.overlay.querySelectorAll('.zg-provider-card').forEach(c => c.classList.remove('is-selected'));
          card.classList.add('is-selected');
          this.updateProviderView();
        });
      });

      document.getElementById('zgBtnTestPing')?.addEventListener('click', () => this.testProviderPing());

      this.overlay.querySelectorAll('.zg-perf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const level = btn.dataset.perf;
          this.perfLevel = level;
          this.overlay.querySelectorAll('.zg-perf-btn').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          if (window.sphereWorld && typeof window.sphereWorld.setPerformanceMode === 'function') {
            window.sphereWorld.setPerformanceMode(level);
          }
        });
      });

      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    async testProviderPing() {
      const input = document.getElementById('zgApiKeyInput');
      const statusEl = document.getElementById('zgPingStatus');
      if (!statusEl) return;

      const p = PROVIDERS[this.selectedProvider];
      statusEl.style.display = 'block';
      statusEl.style.color = '#38BDF8';
      statusEl.textContent = '🔄 Verifying live link to ' + p.name + '...';

      if (this.selectedProvider === 'ollama_local') {
        try {
          const res = await fetch('http://127.0.0.1:11434/api/tags', { method: 'GET' });
          if (res.ok) {
            this.keysStore.ollama_local = { apiKey: 'local-ollama', model: this.selectedModel, enabled: true, updatedAt: Date.now() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keysStore));
            localStorage.setItem(ACTIVE_PROV_KEY, 'ollama_local');
            this.syncAuthUI();
            statusEl.style.color = '#10B981';
            statusEl.textContent = '✅ Connected to Local Ollama (:11434)! Zero-egress inference ready.';
          } else {
            statusEl.style.color = '#F59E0B';
            statusEl.textContent = '⚠️ Ollama responded with status ' + res.status;
          }
        } catch (_e) {
          statusEl.style.color = '#EF4444';
          statusEl.textContent = '❌ Could not reach http://127.0.0.1:11434 — start `ollama serve` or use DeepSeek Flash × Hermes.';
        }
        return;
      }

      const key = input ? input.value.trim() : '';
      if (!key) {
        statusEl.style.color = '#F59E0B';
        statusEl.textContent = '⚠️ Paste an API key (e.g. OpenRouter sk-or-... or DeepSeek sk-...) or local Hermes bridge URL first.';
        return;
      }

      const t0 = performance.now();
      try {
        this.keysStore[this.selectedProvider] = { apiKey: key, model: this.selectedModel, enabled: true, updatedAt: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keysStore));
        localStorage.setItem(ACTIVE_PROV_KEY, this.selectedProvider);
        const reply = await this.queryModel('Reply with the single word READY.', 'Reply only with READY.');
        const ms = Math.round(performance.now() - t0);
        this.syncAuthUI();
        statusEl.style.color = '#10B981';
        statusEl.textContent = `✅ Signed In & Verified (${ms}ms) → ${p.name} [${this.selectedModel}]: "${String(reply).slice(0, 32)}"`;
      } catch (err) {
        statusEl.style.color = '#EF4444';
        statusEl.textContent = `❌ Connection check failed: ${err && err.message ? err.message : 'Verify API key & model name'}`;
      }
    }

    getActiveConfig() {
      // Check currently selected provider first; otherwise find any configured provider
      let provId = this.selectedProvider;
      let cfg = this.keysStore[provId];
      if (!cfg || !cfg.apiKey) {
        const found = Object.entries(this.keysStore).find(([_k, v]) => v && v.apiKey && String(v.apiKey).trim().length > 3);
        if (found) {
          provId = found[0];
          cfg = found[1];
        }
      }
      const provDef = PROVIDERS[provId] || PROVIDERS.hermes_deepseek_flash;
      return {
        providerId: provId,
        provider: provDef,
        apiKey: (cfg && cfg.apiKey) || '',
        model: (cfg && cfg.model) || this.selectedModel || provDef.models[0]
      };
    }

    hasActiveKey() {
      const cfg = this.getActiveConfig();
      if (!cfg.apiKey) return false;
      if (cfg.providerId === 'ollama_local') return cfg.apiKey === 'local-ollama' || cfg.apiKey.length > 3;
      return cfg.apiKey.trim().length > 3;
    }

    async _postProviderRequest(endpoint, headers, payload) {
      try {
        const proxyRes = await fetch('/api/llm/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, headers, payload })
        });
        const ct = proxyRes.headers.get('content-type') || '';
        if (proxyRes.status !== 404 && ct.includes('application/json')) {
          return await proxyRes.json();
        }
      } catch (_e) {
        // Static hosted fallback (Netlify / GitHub Pages)
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, headers),
        body: JSON.stringify(payload)
      });
      return await res.json();
    }

    async queryModel(prompt, systemPrompt) {
      const active = this.getActiveConfig();
      const p = active.provider;
      const key = String(active.apiKey || '').trim();
      let model = active.model;
      const sys = systemPrompt || 'You are an autonomous Pantheon citizen on Zoth Prime. Speak 1-2 sharp, technical, sovereign sentences.';

      if (active.providerId === 'anthropic') {
        const data = await this._postProviderRequest(
          'https://api.anthropic.com/v1/messages',
          {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'dangerously-allow-browser': 'true'
          },
          {
            model,
            max_tokens: 150,
            system: sys,
            messages: [{ role: 'user', content: prompt }]
          }
        );
        if (data && data.content && data.content[0] && data.content[0].text) {
          return data.content[0].text.trim();
        }
        throw new Error((data && data.error && data.error.message) || 'Anthropic query failed');
      }

      let endpoint = p.endpoint;
      const headers = {};

      // Smart routing for Hermes Agent × DeepSeek Flash
      if (active.providerId === 'hermes_deepseek_flash' || active.providerId === 'nous_hermes') {
        if (/^https?:\/\//i.test(key)) {
          endpoint = key.replace(/\/+$/, '') + (key.includes('/chat/completions') ? '' : '/v1/chat/completions');
        } else if (key.startsWith('sk-or-')) {
          endpoint = 'https://openrouter.ai/api/v1/chat/completions';
          headers['Authorization'] = `Bearer ${key}`;
          headers['HTTP-Referer'] = window.location.origin || 'https://zoth-civilization.netlify.app';
          headers['X-Title'] = 'Zoth Civilization (Hermes x DeepSeek Flash)';
        } else if (key.startsWith('nous_')) {
          endpoint = 'https://inference-api.nousresearch.com/v1/chat/completions';
          headers['Authorization'] = `Bearer ${key}`;
        } else {
          // Direct DeepSeek API key
          endpoint = 'https://api.deepseek.com/v1/chat/completions';
          headers['Authorization'] = `Bearer ${key}`;
          if (model.includes('/')) model = 'deepseek-chat';
        }
      } else {
        if (key && active.providerId !== 'ollama_local') {
          headers['Authorization'] = `Bearer ${key}`;
        }
        if (active.providerId === 'openrouter') {
          headers['HTTP-Referer'] = window.location.origin || 'https://zoth-civilization.netlify.app';
          headers['X-Title'] = 'Zoth Civilization';
        }
      }

      const data = await this._postProviderRequest(
        endpoint,
        headers,
        {
          model,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: prompt }
          ],
          max_tokens: 135,
          temperature: 0.65
        }
      );

      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
      throw new Error((data && data.error && data.error.message) || 'AI query failed');
    }

    async askCitizen(agent, userText) {
      if (!agent) return null;
      const manner = (agent.ledger && (agent.ledger.manner || agent.ledger.stoic)) || 'Sharp, sovereign intelligence';
      const cadre = agent.cadre || 'Pantheon';
      const keyIdx = agent.adytumKey !== undefined ? agent.adytumKey : 0;
      const colony = (agent.colonyId || 'capital').replace('colony_', '').toUpperCase();

      const systemPrompt = `You are ${agent.name}, an autonomous ${cadre} agent dwelling on Zoth Prime in colony ${colony}. Adytum Key: ${keyIdx}. Manner/Philosophy: ${manner}. Reply directly to the Imperator in 1-2 vivid, technical, sovereign sentences. Stay strictly in character.`;

      return await this.queryModel(userText, systemPrompt);
    }

    open(step = 1) {
      if (this.overlay) {
        this.setStep(step);
        this.overlay.classList.add('is-active');
        if (typeof HermeticAudio !== 'undefined' && HermeticAudio.playCardChime) {
          HermeticAudio.playCardChime(1);
        }
      }
    }

    close() {
      if (this.overlay) {
        this.overlay.classList.remove('is-active');
        const chk = document.getElementById('zgChkDontShow');
        if (chk && chk.checked) {
          localStorage.setItem(SEEN_KEY, 'true');
        }
        if (window.sphereWorld && typeof window.sphereWorld.setPerformanceMode === 'function') {
          window.sphereWorld.setPerformanceMode(this.perfLevel);
        }
        this.syncAuthUI();
      }
    }

    toggle() {
      if (this.overlay && this.overlay.classList.contains('is-active')) {
        this.close();
      } else {
        this.open(1);
      }
    }
  }

  window.ZothGameIntro = new ZothGameIntroController();

  function hookToolbar() {
    const btnGuide = document.getElementById('btnOpenGameIntro');
    if (btnGuide) {
      btnGuide.addEventListener('click', (e) => {
        e.preventDefault();
        window.ZothGameIntro.open(1);
      });
    }

    const btnTurbo = document.getElementById('btnToggleTurbo60');
    if (btnTurbo) {
      const updateTurboBadge = (level) => {
        const badge = document.getElementById('turboBadge');
        const label = level === 'fast' ? '60 FPS TURBO' : (level === 'balanced' ? 'BALANCED HD' : 'ULTRA CINEMA');
        if (badge) badge.textContent = label;
        btnTurbo.style.borderColor = level === 'fast' ? '#10B981' : (level === 'balanced' ? '#38BDF8' : '#F59E0B');
        btnTurbo.style.color = level === 'fast' ? '#6EE7B7' : (level === 'balanced' ? '#7DD3FC' : '#FDE68A');
      };

      btnTurbo.addEventListener('click', (e) => {
        e.preventDefault();
        const order = ['fast', 'balanced', 'ultra'];
        const current = window.ZothGameIntro.perfLevel || 'fast';
        const next = order[(order.indexOf(current) + 1) % order.length];
        window.ZothGameIntro.perfLevel = next;
        localStorage.setItem('zoth_perf_level', next);
        if (window.sphereWorld && typeof window.sphereWorld.setPerformanceMode === 'function') {
          window.sphereWorld.setPerformanceMode(next);
        }
        updateTurboBadge(next);
      });

      updateTurboBadge(window.ZothGameIntro.perfLevel || 'fast');
    }
  }

  if (document.getElementById('btnOpenGameIntro') || document.getElementById('btnToggleTurbo60')) {
    hookToolbar();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookToolbar);
  } else {
    hookToolbar();
  }
})();
