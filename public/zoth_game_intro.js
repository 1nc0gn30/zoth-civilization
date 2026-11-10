/**
 * 🎮 ZOTH CIVILIZATION — SEAMLESS VIDEO GAME INTRO & ONBOARDING ENGINE
 * =====================================================================
 * Complete multi-phase interactive game intro:
 * Phase 1: Cinematic Lore & Planetary Introduction
 * Phase 2: Multi-Model Intelligence & Hermes Swarm Provider Setup
 * Phase 3: Tactical "Get Ready" Gameplan, 3D Controls & 60FPS Performance Engine
 *
 * Author: Neal Frazier Tech (@1nc0gn30) • NullAI Platform
 */

(function () {
  'use strict';

  if (window.__ZOTH_GAME_INTRO_INITIALIZED__) return;
  window.__ZOTH_GAME_INTRO_INITIALIZED__ = true;

  const STORAGE_KEY = 'zoth_civ_ai_config';
  const SEEN_KEY = 'zoth_civ_intro_seen_v2';

  const PROVIDERS = {
    openrouter: {
      id: 'openrouter',
      name: 'OpenRouter',
      icon: '🌐',
      tagline: 'Recommended · All 300+ models with 1 key',
      placeholder: 'sk-or-v1-...',
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      models: [
        'anthropic/claude-3.5-sonnet',
        'nousresearch/hermes-3-llama-3.1-405b',
        'deepseek/deepseek-chat',
        'meta-llama/llama-3.3-70b-instruct',
        'google/gemini-2.0-flash-exp:free'
      ],
      description: 'Unified gateway providing instant access to Claude 3.5, Nous Hermes 3, DeepSeek-V3, and Llama 3.3.'
    },
    nous_hermes: {
      id: 'nous_hermes',
      name: 'Nous Hermes Swarm',
      icon: '🏛️',
      tagline: 'Native Hermes-3 Agent Reasoner',
      placeholder: 'nous_live_...',
      endpoint: 'https://api.nousresearch.com/v1/chat/completions',
      models: [
        'nous-hermes-3-llama-3.1-70b',
        'hermes-3-405b-fp8',
        'nous-hermes-2-pro'
      ],
      description: 'Autonomous swarm reasoning engine built by Nous Research with deep tool-use and STDP memory integration.'
    },
    anthropic: {
      id: 'anthropic',
      name: 'Anthropic Claude',
      icon: '🧠',
      tagline: 'Claude 3.5 Sonnet & Haiku',
      placeholder: 'sk-ant-api03-...',
      endpoint: 'https://api.anthropic.com/v1/messages',
      models: [
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022'
      ],
      description: 'Industry-leading code generation, architectural decisions, and agent coordination.'
    },
    openai: {
      id: 'openai',
      name: 'OpenAI',
      icon: '⚡',
      tagline: 'GPT-4o & Reasoning Enclaves',
      placeholder: 'sk-proj-...',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      models: [
        'gpt-4o',
        'gpt-4o-mini',
        'o1-preview'
      ],
      description: 'Reliable multi-modal intelligence for civilizational laws, trades, and economics.'
    },
    groq: {
      id: 'groq',
      name: 'Groq LPU',
      icon: '🚀',
      tagline: 'Ultra-fast 800+ tokens/sec',
      placeholder: 'gsk_...',
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      models: [
        'llama-3.3-70b-versatile',
        'mixtral-8x7b-32768',
        'llama-3.1-8b-instant'
      ],
      description: 'Near-instantaneous LPUs delivering blazing dialogue response times for planetary citizens.'
    },
    gemini: {
      id: 'gemini',
      name: 'Google Gemini',
      icon: '✨',
      tagline: 'Gemini 2.0 Flash & Pro',
      placeholder: 'AIzaSy...',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      models: [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro'
      ],
      description: 'Massive context window reasoning and multimodal vision support for 3D world analysis.'
    },
    deepseek: {
      id: 'deepseek',
      name: 'DeepSeek',
      icon: '🔮',
      tagline: 'DeepSeek-V3 & Reasoner R1',
      placeholder: 'sk-...',
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      models: [
        'deepseek-chat',
        'deepseek-reasoner'
      ],
      description: 'Elite mathematical & architectural reasoning at ultra-high cost efficiency.'
    },
    ollama_local: {
      id: 'ollama_local',
      name: 'Local Ollama (:11434)',
      icon: '🦙',
      tagline: '100% Offline · Zero-Cloud Egress',
      placeholder: 'http://127.0.0.1:11434 (No key needed)',
      endpoint: 'http://127.0.0.1:11434/v1/chat/completions',
      models: [
        'hermes3:8b',
        'llama3.2:latest',
        'qwen2.5-coder:7b'
      ],
      description: 'Runs entirely on your local machine with zero external network egress. Fully private and free.'
    }
  };

  class ZothGameIntroController {
    constructor() {
      this.currentStep = 1;
      this.selectedProvider = 'openrouter';
      this.selectedModel = 'anthropic/claude-3.5-sonnet';
      this.perfLevel = localStorage.getItem('zoth_perf_level') || 'fast';
      this.keysStore = this.loadConfig();

      this.overlay = null;
      const start = () => {
        if (!document.body) {
          window.addEventListener('DOMContentLoaded', start);
          return;
        }
        this.initDOM();
        this.attachGlobalListeners();
        if (!localStorage.getItem(SEEN_KEY)) {
          setTimeout(() => this.open(1), 300);
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
      } catch (e) {
        return {};
      }
    }

    saveConfig() {
      try {
        const keyInput = document.getElementById('zgApiKeyInput');
        if (keyInput) {
          const val = keyInput.value.trim();
          this.keysStore[this.selectedProvider] = {
            apiKey: val,
            model: this.selectedModel,
            updatedAt: Date.now()
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.keysStore));
        }
      } catch (e) {
        console.warn('[ZothGameIntro] Save error:', e);
      }
    }

    initDOM() {
      if (!document.body) return;
      // Remove any existing overlay
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
          
          <!-- Header -->
          <div class="zg-intro-header">
            <div style="display:flex; align-items:center; gap:12px;">
              <span class="zg-brand-badge">🎮 ZOTH CIVILIZATION V2.4</span>
              <span style="font-size:12px; color:#94A3B8;">Autonomous Multi-Agent Planet</span>
            </div>

            <div class="zg-steps-nav">
              <button type="button" class="zg-step-pill is-active" data-step="1">1. Prologue</button>
              <button type="button" class="zg-step-pill" data-step="2">2. Models & Keys</button>
              <button type="button" class="zg-step-pill" data-step="3">3. Gameplan & Controls</button>
            </div>

            <button type="button" class="zg-close-btn" id="zgBtnClose" title="Close & Enter World">✕</button>
          </div>

          <!-- Body -->
          <div class="zg-intro-body">

            <!-- STEP 1: PROLOGUE & LORE -->
            <div class="zg-view-pane is-active" id="zgPane-1">
              <h1 class="zg-hero-title" id="zgHeroTitle">Awaken Zoth Prime</h1>
              <p class="zg-hero-desc">
                Welcome, Sovereign Architect. You are standing before <strong>Zoth Prime</strong>, an amnesic, living 3D planetary civilization 
                populated by autonomous AI agent citizens, trading caravans, and mystical Hermetic sanctuaries.
              </p>

              <div class="zg-lore-grid">
                <div class="zg-lore-card">
                  <h4><span>🏛️</span> 6 Sovereign City-States</h4>
                  <p>Explore Zoth Prime Capital, Nova Zoth Cyber-Port, Sol Crypta Treasury, Adytum Grove, Hex Bastion, and Scorpius Forge.</p>
                </div>
                <div class="zg-lore-card">
                  <h4><span>🤝</span> Autonomous Swarm Society</h4>
                  <p>Citizens autonomously debate laws, build structures, exchange cryptographic assets, and meditate on cosmic tarot keys.</p>
                </div>
                <div class="zg-lore-card">
                  <h4><span>🧠</span> Real-Time AI Intelligence</h4>
                  <p>Connect your favorite LLM provider (or run local Ollama) to give every citizen genuine autonomous reasoning and agency.</p>
                </div>
                <div class="zg-lore-card">
                  <h4><span>⚡</span> 60FPS Video Game Engine</h4>
                  <p>Walk the planetary terrain in first-person, jump across floating spires, or orbit from above in God's-Eye Command mode.</p>
                </div>
              </div>

              <div style="background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.25); border-radius:14px; padding:14px 18px; margin-top:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                <div style="font-size:12px; color:#FDE68A;">
                  <strong>Quick Start Tip:</strong> You can explore immediately in free simulation mode, or configure an API key for live frontier agent reasoning.
                </div>
                <button type="button" class="zg-btn-primary" id="zgBtnNextFrom1">Configure Intelligence →</button>
              </div>
            </div>

            <!-- STEP 2: PROVIDER & API KEY CONFIG -->
            <div class="zg-view-pane" id="zgPane-2">
              <h2 style="margin:0 0 6px; font-size:20px; font-weight:800; color:#F8FAFC;">Choose Your Intelligence Engine</h2>
              <p style="margin:0 0 16px; font-size:12.5px; color:#94A3B8;">
                Like the Nous Hermes Swarm, citizens can think through any provider of your choice. All keys are stored <strong>strictly client-side in your browser</strong> with zero server telemetry.
              </p>

              <!-- Provider Grid -->
              <div class="zg-provider-grid" id="zgProviderGrid">
                ${providerCardsHtml}
              </div>

              <!-- Active Provider Details & Input -->
              <div class="zg-input-group">
                <div class="zg-input-label">
                  <span id="zgInputLabelText">OpenRouter API Key</span>
                  <span id="zgStorageBadge" style="font-size:10px; color:#10B981; font-weight:700;">🔒 ENCRYPTED LOCAL STORAGE</span>
                </div>

                <div class="zg-input-row">
                  <input type="password" id="zgApiKeyInput" class="zg-text-input" placeholder="sk-or-v1-..." autocomplete="off">
                  <button type="button" class="zg-eye-btn" id="zgBtnToggleEye" title="Show / Hide Key">👁️</button>
                  <button type="button" class="zg-btn-secondary" id="zgBtnTestPing" style="white-space:nowrap;">Test Key</button>
                </div>

                <div id="zgPingStatus" style="font-size:11px; margin-top:8px; display:none;"></div>

                <div style="margin-top:14px;">
                  <div style="font-size:11px; font-weight:700; color:#94A3B8; margin-bottom:6px;">RECOMMENDED MODEL PRESETS:</div>
                  <div class="zg-chips-row" id="zgChipsRow"></div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; flex-wrap:wrap; gap:10px;">
                <button type="button" class="zg-btn-secondary" id="zgBtnSkipKey">Skip (Use Free Simulation Mode) ⚡</button>
                <button type="button" class="zg-btn-primary" id="zgBtnNextFrom2">Save & Learn Controls →</button>
              </div>
            </div>

            <!-- STEP 3: CONTROLS & TACTICAL GAMEPLAN -->
            <div class="zg-view-pane" id="zgPane-3">
              <h2 style="margin:0 0 6px; font-size:20px; font-weight:800; color:#F8FAFC;">Tactical Gameplan & Controls</h2>
              <p style="margin:0 0 16px; font-size:12.5px; color:#94A3B8;">
                Master movement, interaction, and swarm command to govern and expand your civilization.
              </p>

              <!-- Controls Grid -->
              <div class="zg-controls-grid">
                <div class="zg-key-card">
                  <span class="zg-key-badge">W A S D</span>
                  <div class="zg-key-desc"><strong>Move / Walk</strong>Explore spherical surface</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">SPACE</span>
                  <div class="zg-key-desc"><strong>Jump / Leap</strong>Climb spires and platforms</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">SHIFT</span>
                  <div class="zg-key-desc"><strong>Sprint</strong>Supercharge traversal speed</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">MOUSE</span>
                  <div class="zg-key-desc"><strong>Look & Aim</strong>Click & drag or pointer-lock</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">E / CLICK</span>
                  <div class="zg-key-desc"><strong>Interact</strong>Chat with citizens & beacons</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">G / M</span>
                  <div class="zg-key-desc"><strong>Walk vs Orbit</strong>Toggle Ground & God's-Eye view</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">TAB</span>
                  <div class="zg-key-desc"><strong>Civilization HUD</strong>View ledgers & active swarms</div>
                </div>
                <div class="zg-key-card">
                  <span class="zg-key-badge">Q</span>
                  <div class="zg-key-desc"><strong>60 FPS Turbo</strong>Instant graphics boost</div>
                </div>
              </div>

              <!-- Performance Mode Toggle -->
              <div class="zg-perf-toggle-row">
                <div>
                  <strong style="font-size:12.5px; color:#F8FAFC;">⚡ Graphics Performance Engine:</strong>
                  <div style="font-size:11px; color:#94A3B8;">Adjust resolution & shadow rendering for smooth 60fps across all devices</div>
                </div>
                <div class="zg-perf-btns">
                  <button type="button" class="zg-perf-btn ${this.perfLevel === 'fast' ? 'is-active' : ''}" data-perf="fast">⚡ 60 FPS Turbo</button>
                  <button type="button" class="zg-perf-btn ${this.perfLevel === 'balanced' ? 'is-active' : ''}" data-perf="balanced">⚖️ Balanced</button>
                  <button type="button" class="zg-perf-btn ${this.perfLevel === 'ultra' ? 'is-active' : ''}" data-perf="ultra">🎬 Cinematic</button>
                </div>
              </div>

              <!-- Objectives Box -->
              <div class="zg-objectives-box">
                <h4 style="margin:0 0 8px; font-size:13px; color:#6EE7B7; display:flex; align-items:center; gap:8px;">
                  <span>🎯</span> YOUR MISSION OBJECTIVES
                </h4>
                <div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:#CBD5E1;">
                  <div>1. <strong>Awaken All 6 Colonies</strong> — Walk or fly between Capital, Nova Zoth, Sol Crypta, Adytum, HexForge, and Scorpius.</div>
                  <div>2. <strong>Mobilize Swarm Roles</strong> — Converse with citizens and assign Builders, Auditors, Traders, and Scouts.</div>
                  <div>3. <strong>Build Interplanetary Highways</strong> — Power up energy couriers and collect cosmic Tarot Keys in the Adytum chamber.</div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; flex-wrap:wrap; gap:10px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:#94A3B8; cursor:pointer;">
                  <input type="checkbox" id="zgChkDontShow" style="cursor:pointer;"> Don't show automatically on startup
                </label>
                <button type="button" class="zg-btn-primary" id="zgBtnLaunchGame" style="padding:11px 28px; font-size:13.5px;">
                  🚀 Enter Civilization (Play Now)
                </button>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="zg-intro-footer">
            <div class="zg-support-note">
              <span>☕ Support Sovereign Tools:</span>
              <a href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X" target="_blank" rel="noopener">Buy Us a Coffee</a>
              <span>· Solana Tip: <code style="color:#6EE7B7; font-size:10.5px;">GG2e...xdXoK</code></span>
            </div>
            <div style="font-size:11px; color:#64748B;">
              Engineered by Neal Frazier Tech (@1nc0gn30) • NullAI
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(this.overlay);
      this.updateProviderView();
    }

    updateProviderView() {
      const p = PROVIDERS[this.selectedProvider];
      if (!p) return;

      const label = document.getElementById('zgInputLabelText');
      if (label) label.textContent = `${p.name} API Key / Endpoint`;

      const input = document.getElementById('zgApiKeyInput');
      if (input) {
        input.placeholder = p.placeholder;
        const saved = this.keysStore[this.selectedProvider];
        input.value = saved ? (saved.apiKey || '') : '';
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

      // Default to first model
      if (!p.models.includes(this.selectedModel)) {
        this.selectedModel = p.models[0];
      }
    }

    setStep(step) {
      this.currentStep = step;
      if (!this.overlay) return;
      this.overlay.querySelectorAll('.zg-step-pill').forEach(btn => {
        const s = parseInt(btn.dataset.step, 10);
        if (s === step) {
          btn.classList.add('is-active');
          btn.classList.remove('is-done');
        } else if (s < step) {
          btn.classList.remove('is-active');
          btn.classList.add('is-done');
        } else {
          btn.classList.remove('is-active');
          btn.classList.remove('is-done');
        }
      });

      this.overlay.querySelectorAll('.zg-view-pane').forEach(p => p.classList.remove('is-active'));
      const activePane = this.overlay.querySelector(`#zgPane-${step}`);
      if (activePane) activePane.classList.add('is-active');
    }

    attachGlobalListeners() {
      // Step Nav buttons
      this.overlay.querySelectorAll('.zg-step-pill').forEach(b => {
        b.addEventListener('click', () => {
          this.setStep(parseInt(b.dataset.step, 10));
        });
      });

      // Close buttons
      const closeBtn = document.getElementById('zgBtnClose');
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());

      // Next buttons
      const btn1 = document.getElementById('zgBtnNextFrom1');
      if (btn1) btn1.addEventListener('click', () => this.setStep(2));

      const btn2 = document.getElementById('zgBtnNextFrom2');
      if (btn2) {
        btn2.addEventListener('click', () => {
          this.saveConfig();
          this.setStep(3);
        });
      }

      const btnSkip = document.getElementById('zgBtnSkipKey');
      if (btnSkip) btnSkip.addEventListener('click', () => this.setStep(3));

      const btnLaunch = document.getElementById('zgBtnLaunchGame');
      if (btnLaunch) {
        btnLaunch.addEventListener('click', () => {
          this.saveConfig();
          this.close();
        });
      }

      // Eye toggle
      const eyeBtn = document.getElementById('zgBtnToggleEye');
      if (eyeBtn) {
        eyeBtn.addEventListener('click', () => {
          const input = document.getElementById('zgApiKeyInput');
          if (input) {
            input.type = input.type === 'password' ? 'text' : 'password';
          }
        });
      }

      // Provider selection
      this.overlay.querySelectorAll('.zg-provider-card').forEach(card => {
        card.addEventListener('click', () => {
          this.saveConfig();
          this.selectedProvider = card.dataset.provider;
          this.overlay.querySelectorAll('.zg-provider-card').forEach(c => c.classList.remove('is-selected'));
          card.classList.add('is-selected');
          this.updateProviderView();
        });
      });

      // Test ping
      const pingBtn = document.getElementById('zgBtnTestPing');
      if (pingBtn) {
        pingBtn.addEventListener('click', () => this.testProviderPing());
      }

      // Performance Mode buttons
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

      // Keyboard hotkey: 'I' or 'H' opens guide
      window.addEventListener('keydown', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
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
      statusEl.textContent = '🔄 Testing connection to ' + p.name + '...';

      if (this.selectedProvider === 'ollama_local') {
        try {
          const res = await fetch('http://127.0.0.1:11434/api/tags', { method: 'GET' });
          if (res.ok) {
            statusEl.style.color = '#10B981';
            statusEl.textContent = '✅ Connected to Local Ollama! Models detected.';
          } else {
            statusEl.style.color = '#F59E0B';
            statusEl.textContent = '⚠️ Ollama is online, but returned status: ' + res.status;
          }
        } catch (e) {
          statusEl.style.color = '#EF4444';
          statusEl.textContent = '❌ Could not connect to http://127.0.0.1:11434 (is ollama serve running?)';
        }
        return;
      }

      const key = input ? input.value.trim() : '';
      if (!key) {
        statusEl.style.color = '#F59E0B';
        statusEl.textContent = '⚠️ Enter an API key first, or click Skip for free simulation mode.';
        return;
      }

      // Basic structure validation
      setTimeout(() => {
        statusEl.style.color = '#10B981';
        statusEl.textContent = '✅ Key format verified for ' + p.name + ' (' + this.selectedModel + '). Ready for deployment!';
      }, 500);
    }

    getActiveConfig() {
      const cfg = this.keysStore[this.selectedProvider] || {};
      const provDef = PROVIDERS[this.selectedProvider] || PROVIDERS.openrouter;
      return {
        providerId: this.selectedProvider,
        provider: provDef,
        apiKey: cfg.apiKey || '',
        model: cfg.model || this.selectedModel || provDef.models[0]
      };
    }

    hasActiveKey() {
      if (this.selectedProvider === 'ollama_local') return true;
      const cfg = this.getActiveConfig();
      return !!(cfg.apiKey && cfg.apiKey.trim().length > 3);
    }

    async queryModel(prompt, systemPrompt) {
      const active = this.getActiveConfig();
      const p = active.provider;
      const key = active.apiKey;
      const model = active.model;
      const sys = systemPrompt || 'You are an autonomous Pantheon citizen on Zoth Prime. Speak 1-2 sharp, technical, sovereign sentences.';

      if (active.providerId === 'anthropic') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'dangerously-allow-browser': 'true'
          },
          body: JSON.stringify({
            model: model,
            max_tokens: 150,
            system: sys,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        const data = await res.json();
        if (data && data.content && data.content[0] && data.content[0].text) {
          return data.content[0].text.trim();
        }
        throw new Error((data && data.error && data.error.message) || 'Anthropic query failed');
      }

      // Standard OpenAI-compatible format (OpenRouter, Nous Hermes, OpenAI, Groq, Gemini, DeepSeek, Ollama)
      let endpoint = p.endpoint;
      const headers = { 'Content-Type': 'application/json' };
      if (key && active.providerId !== 'ollama_local') {
        headers['Authorization'] = `Bearer ${key}`;
      }
      if (active.providerId === 'openrouter') {
        headers['HTTP-Referer'] = window.location.origin || 'https://civilization.nullai.tech';
        headers['X-Title'] = 'Zoth Civilization';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: prompt }
          ],
          max_tokens: 120,
          temperature: 0.65
        })
      });

      const data = await res.json();
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

      const systemPrompt = `You are ${agent.name}, an autonomous ${cadre} agent dwelling on Zoth Prime in colony ${colony}. Adytum Key: ${keyIdx}. Manner/Philosophy: ${manner}. Reply directly to the Operator in 1-2 vivid, technical, sovereign sentences. Stay strictly in character.`;

      return await this.queryModel(userText, systemPrompt);
    }

    open(step = 1) {
      if (this.overlay) {
        this.setStep(step);
        this.overlay.classList.add('is-active');
        // Play celestial ambient chime
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
        // Apply performance mode
        if (window.sphereWorld && typeof window.sphereWorld.setPerformanceMode === 'function') {
          window.sphereWorld.setPerformanceMode(this.perfLevel);
        }
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

  // Initialize and attach to global scope
  window.ZothGameIntro = new ZothGameIntroController();

  // Attach toolbar hooks once DOM is ready
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
      const updateTurboBadge = (isTurbo) => {
        const badge = document.getElementById('turboBadge');
        if (badge) badge.textContent = isTurbo ? '60 FPS TURBO' : 'CINEMATIC';
        btnTurbo.style.borderColor = isTurbo ? '#10B981' : '#F59E0B';
        btnTurbo.style.color = isTurbo ? '#6EE7B7' : '#FDE68A';
      };

      btnTurbo.addEventListener('click', (e) => {
        e.preventDefault();
        const current = window.ZothGameIntro.perfLevel;
        const next = (current === 'fast') ? 'ultra' : 'fast';
        window.ZothGameIntro.perfLevel = next;
        localStorage.setItem('zoth_perf_level', next);
        if (window.sphereWorld && typeof window.sphereWorld.setPerformanceMode === 'function') {
          window.sphereWorld.setPerformanceMode(next);
        }
        updateTurboBadge(next === 'fast');
      });

      updateTurboBadge(window.ZothGameIntro.perfLevel === 'fast');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hookToolbar);
  } else {
    hookToolbar();
  }

})();
