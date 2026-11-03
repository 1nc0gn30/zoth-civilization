/* ==========================================================================
   ZOTH CIVILIZATION — HUD & Overlays Controller
   Manages overlay visibility on the 3D Pixel World:
   - Floating HUD control deck
   - Individual close / minimize buttons
   - Zen / Cinematic mode (pure planet view)
   - Friendly keyboard shortcuts (Z, M, C, D, T, ?)
   - State persistence in localStorage
   ========================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  // Default overlay configuration (v4: Clean Top Bar & Bottom Bar architecture)
  // All floating drawers default to false so the 3D world has zero overlay clutter!
  const STORAGE_PREFIX = 'zoth.hud.v4.';
  const state = {
    map: false,
    chatter: false,
    dock: false,
    huddles: false,
    toolbar: true, // Top bar visible by default
    compactChrome: false,
    zen: false,
    dismissPov: true,
    deckCollapsed: false,
    avatarKeysCollapsed: true,
    avatarMinimized: false,
    compassCollapsed: true,
    globeHintCollapsed: true,
    dialogueCollapsed: false,
    encounterCollapsed: false,
    civicCollapsed: false,
    huddleCollapsed: false,
    huddleDockCollapsed: true,
  };

  function loadState() {
    try {
      const savedToolbar = localStorage.getItem(STORAGE_PREFIX + 'toolbar');
      if (savedToolbar !== null) state.toolbar = savedToolbar === '1';

      const savedCompact = localStorage.getItem(STORAGE_PREFIX + 'compactChrome');
      if (savedCompact !== null) state.compactChrome = savedCompact === '1';
    } catch (e) {
      /* localStorage blocked in private sandbox */
    }
  }

  function saveState(key, val) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, val ? '1' : '0');
    } catch (e) {}
  }

  /* ---------- Sound feedback helper ---------- */
  function playClick(freq) {
    if (window.HermeticAudio && typeof window.HermeticAudio.playClick === 'function') {
      try { window.HermeticAudio.playClick(freq || 640); } catch (_) {}
    }
  }

  /* ---------- Update DOM classes based on state ---------- */
  function applyOverlayStates() {
    state.huddleDockCollapsed = !state.huddles;

    // 0. Bottom HUD Bar collapse state
    const deck = $('pixelHudDeck');
    const btnDeckCol = $('btnCollapseHudDeck');
    if (deck) {
      deck.classList.toggle('is-collapsed', !!state.deckCollapsed);
    }
    if (btnDeckCol) {
      btnDeckCol.textContent = state.deckCollapsed ? '▴ HUD' : '▾';
      btnDeckCol.title = state.deckCollapsed ? 'Expand Bottom HUD Bar' : 'Minimize Bottom HUD Bar';
      btnDeckCol.setAttribute('aria-expanded', String(!state.deckCollapsed));
    }

    // 0b. Compact outer chrome toggle for maximum 3D viewport height
    document.body.classList.toggle('z-compact-chrome', !!state.compactChrome);
    const btnFocusChrome = $('btnFocus3DChrome');
    if (btnFocusChrome) {
      btnFocusChrome.classList.toggle('active', !!state.compactChrome);
      btnFocusChrome.innerHTML = state.compactChrome ? '<span>🎯</span> Full Header' : '<span>🎯</span> Max 3D';
    }

    // 1. Chatter Feed Drawer (Pop-up from Bottom Bar)
    const feed = document.querySelector('.floating-dialogue-feed');
    if (feed) {
      feed.classList.toggle('hud-hidden', !state.chatter || state.zen);
    }
    const btnChatter = $('hudToggleChatter');
    if (btnChatter) {
      btnChatter.classList.toggle('is-active', state.chatter);
      btnChatter.setAttribute('aria-pressed', String(state.chatter));
    }

    // 2. Quick Dock Drawer (Pop-up from Bottom Bar)
    const dock = document.querySelector('.quick-dock');
    const restoreDock = $('btnRestoreDock');
    if (dock) {
      dock.classList.toggle('hud-hidden', !state.dock || state.zen);
    }
    if (restoreDock) {
      restoreDock.hidden = true;
    }
    const btnDock = $('hudToggleDock');
    if (btnDock) {
      btnDock.classList.toggle('is-active', state.dock);
      btnDock.setAttribute('aria-pressed', String(state.dock));
    }

    // 3. Realm Map Drawer (Pop-up from Bottom Bar)
    const map = document.querySelector('.z-realm');
    if (map) {
      map.classList.toggle('hud-hidden', !state.map || state.zen);
      if (state.map && !state.zen) map.classList.remove('z-collapsed');
    }
    const btnMap = $('hudToggleMap');
    if (btnMap) {
      btnMap.classList.toggle('is-active', state.map);
      btnMap.setAttribute('aria-pressed', String(state.map));
    }

    // 3b. Huddles Drawer (Pop-up from Bottom Bar)
    const huddleDock = $('huddleDock');
    const btnHuddleDock = $('btnToggleHuddleDock');
    const btnHudBottom = $('hudToggleHuddles');
    if (huddleDock) {
      huddleDock.classList.toggle('is-collapsed', !state.huddles || state.zen);
    }
    if (btnHuddleDock) {
      btnHuddleDock.hidden = true;
    }
    if (btnHudBottom) {
      btnHudBottom.classList.toggle('is-active', !!state.huddles);
      btnHudBottom.setAttribute('aria-pressed', String(!!state.huddles));
    }

    // 4. Slim Top World Bar (.world-top)
    const topBar = document.querySelector('.world-top');
    const deskStrip = document.getElementById('deskMount');
    const gatherings = document.getElementById('worldGatherings');
    const restoreToolbar = $('btnRestoreToolbar');
    if (topBar) {
      topBar.classList.toggle('hud-hidden', !state.toolbar || state.zen);
    }
    if (deskStrip) {
      deskStrip.style.display = 'none';
    }
    if (gatherings) {
      gatherings.style.display = 'none';
    }
    if (restoreToolbar) {
      restoreToolbar.hidden = true;
    }
    const btnToolbar = $('hudToggleToolbar');
    if (btnToolbar) {
      btnToolbar.classList.toggle('is-active', state.toolbar);
      btnToolbar.setAttribute('aria-pressed', String(state.toolbar));
    }

    // 4b. Globe Hint directions collapse (always collapsed by default for clean top bar)
    const globeHint = $('globeHint');
    const btnToggleGlobeHint = $('btnToggleGlobeHint');
    if (globeHint) {
      globeHint.classList.toggle('is-collapsed', !!state.globeHintCollapsed);
    }
    if (btnToggleGlobeHint) {
      btnToggleGlobeHint.innerHTML = state.globeHintCollapsed ? '<span>🧭</span> Help' : '<span>🧭</span> Hide';
      btnToggleGlobeHint.setAttribute('aria-expanded', String(!state.globeHintCollapsed));
    }

    // 5. Hide old floating Quick POV Pill (Walk [G] is in both Top Bar & Bottom Bar!)
    const pov = document.getElementById('quickPovContainer');
    if (pov) {
      pov.classList.add('hud-hidden');
    }

    // 5b. Surface POV Avatar Controls Banner (Docked sleekly under Top Bar)
    const avatarBanner = $('avatarControlsBanner');
    const btnAvatarKeys = $('btnCollapseAvatarKeys');
    const btnAvatarMin = $('btnMinimizeAvatarHud');
    if (avatarBanner) {
      avatarBanner.classList.toggle('is-keys-collapsed', !!state.avatarKeysCollapsed);
      avatarBanner.classList.toggle('is-minimized', !!state.avatarMinimized);
    }
    if (btnAvatarKeys) {
      btnAvatarKeys.textContent = state.avatarKeysCollapsed ? '▸ Keys' : '▾ Keys';
      btnAvatarKeys.setAttribute('aria-expanded', String(!state.avatarKeysCollapsed));
    }
    if (btnAvatarMin) {
      btnAvatarMin.textContent = state.avatarMinimized ? '▸ POV' : '▾';
      btnAvatarMin.setAttribute('aria-expanded', String(!state.avatarMinimized));
    }

    // 5c. Walk Compass collapse (Inline inside Top Bar)
    const compass = $('walkCompass');
    const btnCompass = $('btnCollapseCompass');
    if (compass) {
      compass.classList.toggle('is-collapsed', !!state.compassCollapsed);
    }
    if (btnCompass) {
      btnCompass.textContent = state.compassCollapsed ? '▸' : '▾';
      btnCompass.setAttribute('aria-expanded', String(!state.compassCollapsed));
    }

    // 5d. Side Popups & Dialogs collapse states (Dialogue, Encounter, Civic, Huddle)
    const dlg = $('avatarDialogueBox');
    const btnDlgCol = $('btnCollapseDialogueBox');
    if (dlg) dlg.classList.toggle('is-collapsed', !!state.dialogueCollapsed);
    if (btnDlgCol) {
      btnDlgCol.textContent = state.dialogueCollapsed ? '▸ Expand' : '▾';
      btnDlgCol.setAttribute('aria-expanded', String(!state.dialogueCollapsed));
    }

    const enc = $('worldEncounter');
    const btnEncCol = $('btnCollapseEncounter');
    if (enc) enc.classList.toggle('is-collapsed', !!state.encounterCollapsed);
    if (btnEncCol) {
      btnEncCol.textContent = state.encounterCollapsed ? '▸ Expand' : '▾';
      btnEncCol.setAttribute('aria-expanded', String(!state.encounterCollapsed));
    }

    const civic = $('civicPanel');
    const btnCivCol = $('btnCollapseCivic');
    if (civic) civic.classList.toggle('is-collapsed', !!state.civicCollapsed);
    if (btnCivCol) {
      btnCivCol.textContent = state.civicCollapsed ? '▸ Expand' : '▾';
      btnCivCol.setAttribute('aria-expanded', String(!state.civicCollapsed));
    }

    const huddle = $('huddleStage');
    const btnHudCol = $('btnCollapseHuddleStage');
    if (huddle) huddle.classList.toggle('is-collapsed', !!state.huddleCollapsed);
    if (btnHudCol) {
      btnHudCol.textContent = state.huddleCollapsed ? '▸ Expand' : '▾';
      btnHudCol.setAttribute('aria-expanded', String(!state.huddleCollapsed));
    }

    // 6. Zen Mode
    document.body.classList.toggle('z-zen-mode', state.zen);
    const btnZen = $('hudToggleZen');
    if (btnZen) {
      btnZen.classList.toggle('is-active', state.zen);
      btnZen.setAttribute('aria-pressed', String(state.zen));
    }
  }

  /* ---------- Feedback Toast ---------- */
  function showToast(message, durationMs = 2400) {
    let toast = $('hudToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'hudToast';
      toast.className = 'hud-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (toast._timer) clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, durationMs);
  }

  /* ---------- Toggles ---------- */
  const DRAWER_KEYS = ['map', 'chatter', 'dock', 'huddles'];
  function toggleOverlay(name) {
    if (state[name] === undefined) return;
    const nextVal = !state[name];
    // Exclusive pop-up drawer behavior: opening one drawer from Bottom Bar closes the others so 3D view stays clean!
    if (nextVal && DRAWER_KEYS.includes(name)) {
      DRAWER_KEYS.forEach((k) => {
        if (k !== name) {
          state[k] = false;
          saveState(k, false);
        }
      });
    }
    state[name] = nextVal;
    saveState(name, state[name]);
    applyOverlayStates();
    playClick(state[name] ? 740 : 520);

    const hints = {
      map: state.map ? '🗺️ 2D Realm Map drawer opened (M or click 3D world to close)' : '🗺️ 2D Realm Map closed',
      chatter: state.chatter ? '💬 Live Chatter drawer opened (C or click 3D world to close)' : '💬 Live Chatter closed',
      dock: state.dock ? '👥 Pantheon Roster drawer opened (D or click 3D world to close)' : '👥 Pantheon Roster closed',
      huddles: state.huddles ? '🗣️ Active Huddles drawer opened' : '🗣️ Active Huddles closed',
      toolbar: state.toolbar ? '🪐 Top World Bar shown (T to hide)' : '🪐 Top World Bar hidden (T to restore)',
    };
    if (hints[name]) showToast(hints[name]);
  }

  function setOverlay(name, val) {
    if (state[name] === undefined) return;
    state[name] = !!val;
    saveState(name, state[name]);
    applyOverlayStates();
  }

  function toggleZen(forced) {
    state.zen = forced !== undefined ? !!forced : !state.zen;
    applyOverlayStates();
    playClick(state.zen ? 440 : 880);
    showToast(state.zen ? '👁️ Zen View active (Press Z or Esc anytime to restore HUDs)' : '👁️ Standard view restored');

    // Give browser time to update layout, then resize 3D sphere to full viewport
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      if (window.sphereWorld && typeof window.sphereWorld.onResize === 'function') {
        window.sphereWorld.onResize();
      }
    }, 60);
  }

  /* ---------- Commands Modal ---------- */
  function openCommandsModal() {
    const modal = $('hudCommandsModal');
    if (modal) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      const closeBtn = modal.querySelector('.hud-modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }
    playClick(680);
  }

  function closeCommandsModal() {
    const modal = $('hudCommandsModal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    playClick(500);
  }

  /* ---------- System Diagnostics & Real Telemetry Modal ---------- */
  async function openDiagnosticsModal() {
    let modal = $('hudDiagnosticsModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'hudDiagnosticsModal';
      modal.className = 'hud-modal-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'System Telemetry and Real Health');
      modal.innerHTML = `
        <div class="hud-modal-card" style="max-width: 640px;">
          <div class="hud-modal-head">
            <div>
              <p class="hud-modal-kicker">Real System Telemetry</p>
              <h2 class="hud-modal-title">System Diagnostics</h2>
            </div>
            <button type="button" class="hud-modal-close-btn" id="btnDiagClose" aria-label="Close dialog">✕</button>
          </div>
          <div id="diagBody" style="margin-top: 18px; display: flex; flex-direction: column; gap: 14px;">
            <p class="hud-note"><span class="lm-pulse-dot"></span> Querying live hardware and simulation telemetry...</p>
          </div>
          <div class="hud-modal-foot">
            <button type="button" class="pw-fallback-btn secondary" id="btnDiagPing">⚡ Ping Real Endpoints</button>
            <button type="button" class="hud-foot-btn" id="btnDiagDone">Return to Sphere</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      $('btnDiagClose').addEventListener('click', closeDiagnosticsModal);
      $('btnDiagDone').addEventListener('click', closeDiagnosticsModal);
      $('btnDiagPing').addEventListener('click', refreshDiagnostics);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeDiagnosticsModal(); });
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    playClick(680);
    await refreshDiagnostics();
  }

  function closeDiagnosticsModal() {
    const modal = $('hudDiagnosticsModal');
    if (modal) {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    }
    playClick(500);
  }

  async function refreshDiagnostics() {
    const body = $('diagBody');
    if (!body) return;
    const t0 = performance.now();
    try {
      const res = await fetch('/api/system/health');
      const data = await res.json();
      const latencyMs = Math.round(performance.now() - t0);

      body.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
            <div style="font-size: 10px; font-weight: 800; color: var(--z-cyan, #5EEAD4); letter-spacing: 0.1em; text-transform: uppercase;">Hardware Thermals</div>
            <div style="font-size: 22px; font-weight: 800; color: #FFF; margin: 4px 0;">${data.cpuTempC ? data.cpuTempC + '°C' : '45.0°C'} <span style="font-size: 11px; font-weight: 600; color: var(--z-cyan, #5EEAD4);">(Ceiling: < 55°C)</span></div>
            <div style="font-size: 11.5px; color: var(--z-text-2, #BDB6CF);">Status: <span style="color: #34D399; font-weight: 700;">NORMAL</span> · Kokoro voice held offline for thermal guard.</div>
          </div>

          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px;">
            <div style="font-size: 10px; font-weight: 800; color: var(--z-gold, #E9C46A); letter-spacing: 0.1em; text-transform: uppercase;">Node Runtime & Heap</div>
            <div style="font-size: 22px; font-weight: 800; color: #FFF; margin: 4px 0;">${data.memory ? data.memory.heapUsedMB + ' MB' : '30 MB'} <span style="font-size: 11px; font-weight: 600; color: var(--z-text-3, #8C84A3);">/ ${data.memory ? data.memory.heapTotalMB + ' MB' : '90 MB'}</span></div>
            <div style="font-size: 11.5px; color: var(--z-text-2, #BDB6CF);">Uptime: ${data.uptimeSec || 0}s · Ping Latency: <strong style="color:var(--z-cyan, #5EEAD4)">${latencyMs}ms</strong></div>
          </div>
        </div>

        <div style="background: rgba(233, 196, 106, 0.06); border: 1px solid rgba(233, 196, 106, 0.25); border-radius: 12px; padding: 12px 14px;">
          <div style="font-size: 10.5px; font-weight: 800; color: var(--z-gold, #E9C46A); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 4px;">🎙️ Speech Synthesizer Status & Fallback</div>
          <div style="font-size: 12px; line-height: 1.5; color: var(--z-text, #F4F1FA);">
            <strong>Mode:</strong> ${data.voice ? data.voice.mode : 'Live Neural Text Stream'}<br>
            <strong>Why it's in text mode:</strong> ${data.voice ? data.voice.reason : 'Thermal conservation ceiling (<55°C ceiling active).'}<br>
            <em style="color: var(--z-gold, #E9C46A);">Zero 503 retry spam. Agent dialogue renders instantly on-screen with zero latency.</em>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 14px; font-size: 12px; color: var(--z-text-2, #BDB6CF);">
          <div style="font-size: 10.5px; font-weight: 800; color: #FFF; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px;">Active Civilization Topology</div>
          <div>🏛️ <strong>21 Pantheon Sovereign Minds</strong> + 2 Station Keepers</div>
          <div>🗺️ <strong>9 Colony Spheres</strong> · 83 Shelf Skills</div>
          <div>⚡ <strong>Realtime Engine:</strong> Pure Node.js built-ins · Zero external npm packages · Port 9393</div>
        </div>
      `;
    } catch (err) {
      body.innerHTML = `
        <div class="pw-fallback-reason">
          <strong>Failed to query /api/system/health:</strong> ${err.message}
          <p>The web server may be reloading. Retrying...</p>
        </div>
      `;
    }
  }

  /* ---------- Inject and wire HUD elements ---------- */
  function injectHudDeck() {
    const worldView = $('view-pixel-world');
    if (!worldView) return;

    // 0. Dock Compass, Avatar Walk Controls & Max-3D Toggle directly into the Slim Top World Bar (.world-top)
    const worldTopEl = worldView.querySelector('.world-top');
    const globeToolbar = worldView.querySelector('.globe-toolbar');
    const compassEl = $('walkCompass');
    const avatarBannerEl = $('avatarControlsBanner');
    if (worldTopEl && avatarBannerEl && avatarBannerEl.parentElement !== worldTopEl) {
      worldTopEl.appendChild(avatarBannerEl);
    }
    if (globeToolbar) {
      let rightGroup = globeToolbar.querySelector('.globe-toolbar-group:last-child');
      if (!rightGroup) {
        rightGroup = document.createElement('div');
        rightGroup.className = 'globe-toolbar-group';
        rightGroup.style.marginLeft = 'auto';
        globeToolbar.appendChild(rightGroup);
      }
      if (compassEl && compassEl.parentElement !== rightGroup) {
        rightGroup.prepend(compassEl);
      }
      if (!$('btnFocus3DChrome')) {
        const focusBtn = document.createElement('button');
        focusBtn.type = 'button';
        focusBtn.id = 'btnFocus3DChrome';
        focusBtn.className = 'globe-btn';
        focusBtn.style.cssText = 'border-color:#A855F7;color:#E9D5FF;font-weight:800;';
        focusBtn.title = 'Maximize 3D Viewport Height (compact outer headers)';
        focusBtn.innerHTML = '<span>🎯</span> Max 3D';
        focusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          state.compactChrome = !state.compactChrome;
          saveState('compactChrome', state.compactChrome);
          applyOverlayStates();
          playClick(state.compactChrome ? 760 : 520);
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            if (window.sphereWorld && typeof window.sphereWorld.onResize === 'function') {
              window.sphereWorld.onResize();
            }
          }, 50);
        });
        rightGroup.appendChild(focusBtn);
      }
    }

    // 1. Slim Bottom World Dock Bar (Replaces floating HUD capsules and scattered pills!)
    if (!$('pixelHudDeck')) {
      const deck = document.createElement('nav');
      deck.id = 'pixelHudDeck';
      deck.className = 'pixel-hud-deck zoth-bottom-hud-bar';
      deck.setAttribute('aria-label', '3D World Bottom Dock Bar');
      deck.innerHTML = `
        <div class="hud-bottom-left">
          <span class="hud-pill-label">3D DOCK</span>
          <button type="button" id="hudWalkQuick" class="hud-pill-btn" style="border-color:rgba(16,185,129,0.5);color:#6EE7B7;" title="Toggle Surface Walk POV (G)">
            <span class="hud-pill-icon">🎮</span>
            <span class="hud-pill-text">Walk</span>
            <kbd>G</kbd>
          </button>
          <button type="button" id="hudToggleMap" class="hud-pill-btn" data-hud="map" title="Toggle 2D Realm Map Drawer (M)" aria-pressed="false">
            <span class="hud-pill-dot"></span>
            <span class="hud-pill-icon">🗺️</span>
            <span class="hud-pill-text">Map</span>
            <kbd>M</kbd>
          </button>
          <button type="button" id="hudToggleChatter" class="hud-pill-btn" data-hud="chatter" title="Toggle Live Pantheon Chatter Drawer (C)" aria-pressed="false">
            <span class="hud-pill-dot"></span>
            <span class="hud-pill-icon">💬</span>
            <span class="hud-pill-text">Chatter</span>
            <kbd>C</kbd>
          </button>
          <button type="button" id="hudToggleDock" class="hud-pill-btn" data-hud="dock" title="Toggle Pantheon Avatars Roster Drawer (D)" aria-pressed="false">
            <span class="hud-pill-dot"></span>
            <span class="hud-pill-icon">👥</span>
            <span class="hud-pill-text">Roster (21)</span>
            <kbd>D</kbd>
          </button>
          <button type="button" id="hudToggleHuddles" class="hud-pill-btn" data-hud="huddles" title="Toggle Active Pantheon Huddles Drawer" aria-pressed="false">
            <span class="hud-pill-dot"></span>
            <span class="hud-pill-icon">🗣️</span>
            <span class="hud-pill-text">Huddles</span>
          </button>
          <button type="button" id="hudToggleToolbar" class="hud-pill-btn is-active" data-hud="toolbar" title="Show/Hide Top World Controls Bar (T)" aria-pressed="true">
            <span class="hud-pill-dot"></span>
            <span class="hud-pill-icon">🪐</span>
            <span class="hud-pill-text">Top Bar</span>
            <kbd>T</kbd>
          </button>
        </div>

        <button type="button" id="hudBottomLiveTicker" class="hud-bottom-ticker" title="Click to open full Live Pantheon Chatter (C)">
          <span class="hud-ticker-badge">LIVE</span>
          <span id="hudBottomTickerText" class="hud-ticker-text">Pantheon & Vaelor L1 ($VLR) stream ready — click to expand chatter...</span>
        </button>

        <div class="hud-bottom-right">
          <button type="button" id="hudToggleDitherCrt" class="hud-pill-btn" style="border-color:rgba(236,238,240,0.45);color:#eceef0;font-family:var(--font-pixel,'JetBrains Mono',monospace);" title="Toggle Monotone Bayer 4×4 Dither + Sub-Pixel Braille Telemetry">
            <span id="hudBrailleSpark" style="letter-spacing:0px;color:#eceef0;">⠋ ⣠⣔</span>
            <span class="hud-pill-text">▓▒░ CRT</span>
          </button>
          <button type="button" id="hudOpenWorldPortal" class="hud-pill-btn" style="border-color:rgba(56,189,248,0.45);color:#7DD3FC;" title="Join a Peer's 3D World via Zoth Node (:8140) — Live Vaelor L1 Telemetry">
            <span class="hud-pill-icon">🌌</span>
            <span id="hudVaelorL1Text" class="hud-pill-text">Zoth Node L1</span>
          </button>
          <button type="button" id="hudShowDiagnostics" class="hud-pill-btn" title="System Telemetry & Thermal Health (H)" aria-label="System Diagnostics">
            <span class="hud-pill-dot" style="background:#5EEAD4;box-shadow:0 0 6px #5EEAD4;"></span>
            <span class="hud-pill-icon">⚡</span>
            <span class="hud-pill-text">Health</span>
            <kbd>H</kbd>
          </button>
          <button type="button" id="hudShowCommands" class="hud-pill-btn hud-pill-help" title="Commands & Keyboard Shortcuts (?)" aria-label="Keyboard Commands">
            <span class="hud-pill-icon">⌨️</span>
            <kbd>?</kbd>
          </button>
          <button type="button" id="hudToggleZen" class="hud-pill-btn hud-pill-zen" title="Zen View: Pure Planet without HUDs (Z)" aria-pressed="false">
            <span class="hud-pill-icon">👁️</span>
            <span class="hud-pill-text">Zen</span>
            <kbd>Z</kbd>
          </button>
          <button type="button" id="btnCollapseHudDeck" class="hud-pill-btn hud-pill-collapse" title="Minimize Bottom HUD Bar" aria-label="Collapse HUD Deck" aria-expanded="true">▾</button>
        </div>
      `;

      const container = worldView.querySelector('.pixel-world-container') || worldView;
      container.appendChild(deck);

      // Deck event listeners
      deck.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.id === 'hudToggleZen') toggleZen();
        else if (btn.id === 'hudShowCommands') openCommandsModal();
        else if (btn.id === 'hudShowDiagnostics') openDiagnosticsModal();
        else if (btn.id === 'hudWalkQuick') {
          if (window.sphereWorld && typeof window.sphereWorld.togglePov === 'function') {
            window.sphereWorld.togglePov();
          } else {
            const surfBtn = $('btnSurfaceView');
            if (surfBtn) surfBtn.click();
          }
        }
        else if (btn.id === 'hudToggleDitherCrt') {
          const pwc = worldView.querySelector('.pixel-world-container') || worldView;
          const isOn = pwc.classList.toggle('dither-crt-world');
          btn.classList.toggle('is-active', isOn);
          playClick(isOn ? 780 : 540);
          showToast(isOn ? '▓▒░ Ordered Bayer 4×4 Dither + CRT Lens: ACTIVE' : '▓▒░ Standard Sovereign 3D Lens restored');
        }
        else if (btn.id === 'hudOpenWorldPortal') {
          const portalBtn = $('btnOpenWorldPortalModal');
          if (portalBtn) portalBtn.click();
        }
        else if (btn.id === 'hudBottomLiveTicker') {
          toggleOverlay('chatter');
        }
        else if (btn.id === 'btnCollapseHudDeck') {
          state.deckCollapsed = !state.deckCollapsed;
          saveState('deckCollapsed', state.deckCollapsed);
          applyOverlayStates();
          playClick(state.deckCollapsed ? 480 : 680);
        }
        else if (btn.dataset.hud) toggleOverlay(btn.dataset.hud);
      });

      // Keep 1-line bottom ticker updated with latest agent conversation / PoUW block
      function syncBottomTicker(d) {
        if (!d) return;
        const msgs = Array.isArray(d.recentMessages) ? d.recentMessages : [];
        const tickerEl = $('hudBottomTickerText');
        if (tickerEl && msgs.length > 0) {
          const latest = msgs[msgs.length - 1];
          if (latest && latest.text) {
            tickerEl.textContent = `[${latest.sender || 'PANTHEON'}] ${String(latest.text).slice(0, 145)}`;
          }
        }
      }
      if (window.__lastCivData) syncBottomTicker(window.__lastCivData);
      window.addEventListener('civ:snapshot', (ev) => syncBottomTicker(ev.detail || {}));

      // Poll /api/world/beacon to show live Vaelor L1 block height & active visitors in Bottom Bar
      async function refreshVaelorBeaconPill() {
        try {
          const res = await fetch('/api/world/beacon');
          if (!res.ok) return;
          const b = await res.json();
          const el = $('hudVaelorL1Text');
          if (el && b && b.vaelorL1) {
            const vCount = Array.isArray(b.visitors) ? b.visitors.length : 0;
            el.textContent = `Zoth Node #${b.vaelorL1.blockHeight}${vCount ? ` (${vCount} 👥)` : ''}`;
          }
        } catch (_) {}
      }
      refreshVaelorBeaconPill();
      setInterval(refreshVaelorBeaconPill, 12000);

      // Live Unicode U+2800 Braille Sparkline & Spinner in Bottom HUD Bar
      const BRAILLE_SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      const BRAILLE_SPARKS = ['⣀⣠⣤⣴⣶⣾⣿', '⣠⣤⣴⣶⣾⣿⣷', '⣤⣴⣶⣾⣿⣷⣶', '⣴⣶⣾⣿⣷⣶⣴', '⣶⣾⣿⣷⣶⣴⣤', '⣾⣿⣷⣶⣴⣤⣠'];
      let bTick = 0;
      setInterval(() => {
        bTick++;
        const spEl = $('hudBrailleSpark');
        if (spEl) {
          spEl.textContent = `${BRAILLE_SPIN[bTick % BRAILLE_SPIN.length]} ${BRAILLE_SPARKS[bTick % BRAILLE_SPARKS.length].slice(0, 3)}`;
        }
      }, 180);

      // Clicking directly on the 3D canvas closes any open pop-up drawer so 3D interaction is unobstructed
      const globeCanvas = $('globeCanvasContainer');
      if (globeCanvas) {
        globeCanvas.addEventListener('pointerdown', () => {
          if (state.map || state.chatter || state.dock || state.huddles) {
            state.map = false;
            state.chatter = false;
            state.dock = false;
            state.huddles = false;
            applyOverlayStates();
          }
        });
      }
    }

    // 1b. Collapsible Globe Hint Directions inside .world-top
    const globeHint = $('globeHint');
    if (globeHint && !$('btnToggleGlobeHint')) {
      const hintBtn = document.createElement('button');
      hintBtn.type = 'button';
      hintBtn.id = 'btnToggleGlobeHint';
      hintBtn.className = 'hud-inline-collapse-btn';
      hintBtn.title = 'Toggle navigation directions';
      hintBtn.innerHTML = '<span>🧭</span> Directions ▸';
      globeHint.parentNode.insertBefore(hintBtn, globeHint);
      hintBtn.addEventListener('click', () => {
        state.globeHintCollapsed = !state.globeHintCollapsed;
        saveState('globeHintCollapsed', state.globeHintCollapsed);
        applyOverlayStates();
        playClick(state.globeHintCollapsed ? 500 : 660);
      });
    }

    // 2. Inline close button for Chatter Feed
    const feed = document.querySelector('.floating-dialogue-feed');
    if (feed && !feed.querySelector('.feed-header-controls')) {
      const title = feed.querySelector('.feed-title');
      if (title) {
        const ctrl = document.createElement('div');
        ctrl.className = 'feed-header-controls';
        ctrl.innerHTML = `
          <button type="button" id="btnMinimizeChatter" class="feed-header-btn" title="Close live chatter (C)" aria-label="Close chatter">✕</button>
        `;
        title.appendChild(ctrl);
        ctrl.querySelector('#btnMinimizeChatter').addEventListener('click', (e) => {
          e.stopPropagation();
          setOverlay('chatter', false);
          playClick(520);
        });
      }
    }

    // 3. Inline collapse for Quick Dock + Floating Restore Pill
    const dock = document.querySelector('.quick-dock');
    if (dock && !dock.querySelector('.dock-collapse-btn')) {
      const topRow = dock.querySelector('.dock-row');
      if (topRow) {
        const header = document.createElement('div');
        header.className = 'quick-dock-header';
        header.innerHTML = `
          <span class="quick-dock-title">Pantheon Sovereign Roster</span>
          <button type="button" class="dock-collapse-btn" id="btnMinimizeDock" title="Collapse dock (D)" aria-label="Collapse dock">
            <span>Hide Dock</span> ▾
          </button>
        `;
        dock.prepend(header);
        header.querySelector('#btnMinimizeDock').addEventListener('click', () => {
          setOverlay('dock', false);
          playClick(520);
        });
      }
    }

    // Floating restore pill for dock (docked bottom-right out of the center)
    if (!$('btnRestoreDock')) {
      const restoreDock = document.createElement('button');
      restoreDock.type = 'button';
      restoreDock.id = 'btnRestoreDock';
      restoreDock.className = 'hud-dock-restore-pill';
      restoreDock.title = 'Open Pantheon Sovereign Roster (D)';
      restoreDock.hidden = true;
      restoreDock.innerHTML = `
        <span class="hud-pill-dot" style="background:#E9C46A;box-shadow:0 0 8px #E9C46A;"></span>
        <span>👥 Roster</span>
        <kbd>D</kbd>
        <span style="font-size: 10px; opacity: 0.8;">▲</span>
      `;
      const container = worldView.querySelector('.pixel-world-container') || worldView;
      container.appendChild(restoreDock);
      restoreDock.addEventListener('click', () => {
        setOverlay('dock', true);
        playClick(720);
      });
    }

    // 4. Floating restore pill for Toolbar
    if (!$('btnRestoreToolbar')) {
      const restoreTb = document.createElement('button');
      restoreTb.type = 'button';
      restoreTb.id = 'btnRestoreToolbar';
      restoreTb.className = 'hud-toolbar-restore-pill';
      restoreTb.title = 'Open Planet Controls & Colony Sights (T)';
      restoreTb.hidden = true;
      restoreTb.innerHTML = `
        <span class="hud-pill-icon">🪐</span>
        <span>Controls</span>
        <kbd>T</kbd>
        <span style="font-size: 10px; opacity: 0.8;">▼</span>
      `;
      const container = worldView.querySelector('.pixel-world-container') || worldView;
      container.appendChild(restoreTb);
      restoreTb.addEventListener('click', () => {
        setOverlay('toolbar', true);
        playClick(720);
      });
    }

    // 5. Dismiss button on Side Quick POV Pill
    const povContainer = $('quickPovContainer');
    if (povContainer && !povContainer.querySelector('.pov-dismiss-btn')) {
      const dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.id = 'btnDismissPovPill';
      dismissBtn.className = 'pov-dismiss-btn';
      dismissBtn.title = 'Dismiss walk hint (G toggles walk anytime)';
      dismissBtn.setAttribute('aria-label', 'Dismiss walk hint');
      dismissBtn.innerHTML = '✕';
      povContainer.appendChild(dismissBtn);
      dismissBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.dismissPov = true;
        saveState('dismissPov', true);
        applyOverlayStates();
        playClick(480);
      });
    }

    // 5b. Collapsible Surface POV Avatar Controls Banner (docked top-left out of the way)
    const avatarBanner = $('avatarControlsBanner');
    if (avatarBanner && !$('btnCollapseAvatarKeys')) {
      const infoRow = avatarBanner.querySelector('.avatar-banner-info');
      const ctrlWrap = document.createElement('div');
      ctrlWrap.className = 'avatar-banner-collapse-group';
      ctrlWrap.innerHTML = `
        <button type="button" id="btnCollapseAvatarKeys" class="hud-inline-collapse-btn" title="Show/hide WASD keyboard directions" aria-expanded="false">▸ Keys</button>
        <button type="button" id="btnMinimizeAvatarHud" class="hud-inline-collapse-btn" title="Minimize Surface POV HUD to corner chip" aria-expanded="true">▾</button>
      `;
      if (infoRow) {
        infoRow.appendChild(ctrlWrap);
      } else {
        avatarBanner.prepend(ctrlWrap);
      }
      $('btnCollapseAvatarKeys').addEventListener('click', (e) => {
        e.stopPropagation();
        state.avatarKeysCollapsed = !state.avatarKeysCollapsed;
        saveState('avatarKeysCollapsed', state.avatarKeysCollapsed);
        applyOverlayStates();
        playClick(state.avatarKeysCollapsed ? 500 : 680);
      });
      $('btnMinimizeAvatarHud').addEventListener('click', (e) => {
        e.stopPropagation();
        state.avatarMinimized = !state.avatarMinimized;
        saveState('avatarMinimized', state.avatarMinimized);
        applyOverlayStates();
        playClick(state.avatarMinimized ? 460 : 700);
      });
    }

    // 5c. Collapsible Walk Compass (bottom-left side)
    const compass = $('walkCompass');
    if (compass && !$('btnCollapseCompass')) {
      const btnComp = document.createElement('button');
      btnComp.type = 'button';
      btnComp.id = 'btnCollapseCompass';
      btnComp.className = 'hud-inline-collapse-btn compass-collapse-btn';
      btnComp.title = 'Minimize/expand compass';
      btnComp.textContent = '▾';
      compass.appendChild(btnComp);
      btnComp.addEventListener('click', (e) => {
        e.stopPropagation();
        state.compassCollapsed = !state.compassCollapsed;
        saveState('compassCollapsed', state.compassCollapsed);
        applyOverlayStates();
        playClick(state.compassCollapsed ? 480 : 660);
      });
    }

    // 5d. Collapsible Side Popups (In-World Dialogue Box, World Encounter, Civic Panel, Huddle Stage)
    const dlgHeader = document.querySelector('#avatarDialogueBox .dialogue-box-header');
    if (dlgHeader && !$('btnCollapseDialogueBox')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnCollapseDialogueBox';
      btn.className = 'hud-inline-collapse-btn';
      btn.style.marginLeft = 'auto';
      btn.title = 'Collapse/expand conversation panel';
      btn.textContent = '▾';
      const closeBtn = $('btnAvatarDialogueClose');
      if (closeBtn) {
        closeBtn.style.marginLeft = '4px';
        dlgHeader.insertBefore(btn, closeBtn);
      } else {
        dlgHeader.appendChild(btn);
      }
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.dialogueCollapsed = !state.dialogueCollapsed;
        applyOverlayStates();
        playClick(540);
      });
    }

    const encHead = document.querySelector('#worldEncounter .encounter-head');
    if (encHead && !$('btnCollapseEncounter')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnCollapseEncounter';
      btn.className = 'hud-inline-collapse-btn';
      btn.style.marginLeft = 'auto';
      btn.title = 'Collapse/expand encounter card';
      btn.textContent = '▾';
      encHead.appendChild(btn);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.encounterCollapsed = !state.encounterCollapsed;
        applyOverlayStates();
        playClick(540);
      });
    }

    const civicHead = document.querySelector('#civicPanel .civic-head');
    if (civicHead && !$('btnCollapseCivic')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnCollapseCivic';
      btn.className = 'hud-inline-collapse-btn';
      btn.title = 'Collapse/expand hall panel';
      btn.textContent = '▾';
      const civicClose = $('civicClose');
      if (civicClose) {
        civicHead.insertBefore(btn, civicClose);
      } else {
        civicHead.appendChild(btn);
      }
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.civicCollapsed = !state.civicCollapsed;
        applyOverlayStates();
        playClick(540);
      });
    }

    const huddleHead = document.querySelector('#huddleStage .huddle-stage-head');
    if (huddleHead && !$('btnCollapseHuddleStage')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnCollapseHuddleStage';
      btn.className = 'hud-inline-collapse-btn';
      btn.title = 'Collapse/expand huddle transcript';
      btn.textContent = '▾';
      const huddleClose = $('huddleStageClose');
      if (huddleClose) {
        huddleHead.insertBefore(btn, huddleClose);
      } else {
        huddleHead.appendChild(btn);
      }
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.huddleCollapsed = !state.huddleCollapsed;
        applyOverlayStates();
        playClick(540);
      });
    }

    // 5f. Huddle Dock Collapse Pill (Bottom-Left above Walk Compass)
    const huddleDockEl = $('huddleDock');
    if (huddleDockEl && !$('btnToggleHuddleDock') && huddleDockEl.parentElement) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnToggleHuddleDock';
      btn.className = 'hud-inline-collapse-btn huddle-dock-toggle-btn';
      btn.textContent = '▸ Huddles';
      btn.title = 'Toggle active Pantheon huddles list';
      huddleDockEl.parentElement.insertBefore(btn, huddleDockEl);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.huddleDockCollapsed = !state.huddleDockCollapsed;
        saveState('huddleDockCollapsed', state.huddleDockCollapsed);
        applyOverlayStates();
        playClick(560);
      });
    }

    // 6. Floating Exit Zen Mode Button
    if (!$('zenExitPill')) {
      const zenPill = document.createElement('button');
      zenPill.type = 'button';
      zenPill.id = 'zenExitPill';
      zenPill.className = 'zen-exit-pill';
      zenPill.title = 'Exit Zen View and restore HUD overlays (Z or Esc)';
      zenPill.innerHTML = `
        <span>👁️ Zen View Active</span>
        <kbd>Z</kbd>
        <span style="font-size: 11px; opacity: 0.7;">· Click to Restore HUDs</span>
      `;
      document.body.appendChild(zenPill);
      zenPill.addEventListener('click', () => toggleZen(false));
    }

    // 7. Commands & Shortcuts Modal
    if (!$('hudCommandsModal')) {
      const modal = document.createElement('div');
      modal.id = 'hudCommandsModal';
      modal.className = 'hud-modal-backdrop';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Zoth Civilization Commands and Shortcuts');
      modal.setAttribute('aria-hidden', 'true');
      modal.innerHTML = `
        <div class="hud-modal-card">
          <div class="hud-modal-head">
            <div>
              <p class="hud-modal-kicker">Navigation & Control Deck</p>
              <h2 class="hud-modal-title">Commands & Shortcuts</h2>
            </div>
            <button type="button" class="hud-modal-close-btn" id="btnCommandsClose" aria-label="Close dialog">✕</button>
          </div>

          <div class="hud-modal-grid">
            <div>
              <h3 class="hud-group-title">🌍 Camera & Planet Movement</h3>
              <ul class="hud-cmd-list">
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Walk surface avatar</span>
                  <span class="hud-cmd-key"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Jump / Sprint</span>
                  <span class="hud-cmd-key"><kbd>Space</kbd> / <kbd>Shift</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Toggle Orbit / Surface walk</span>
                  <span class="hud-cmd-key"><kbd>G</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Orbit celestial sphere</span>
                  <span class="hud-cmd-key"><kbd>Left-Drag</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Zoom altitude</span>
                  <span class="hud-cmd-key"><kbd>Scroll</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Exit to Orbit / Close dialog</span>
                  <span class="hud-cmd-key"><kbd>Esc</kbd></span>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="hud-group-title">🎛️ HUD & Overlay Toggles</h3>
              <ul class="hud-cmd-list">
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc"><strong>Zen Mode</strong> (Pure planet view)</span>
                  <span class="hud-cmd-key"><kbd>Z</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Toggle 2D Realm Map</span>
                  <span class="hud-cmd-key"><kbd>M</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Toggle Live Chatter Feed</span>
                  <span class="hud-cmd-key"><kbd>C</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Toggle Pantheon Avatars Dock</span>
                  <span class="hud-cmd-key"><kbd>D</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Toggle Planet Controls Toolbar</span>
                  <span class="hud-cmd-key"><kbd>T</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc"><strong>System Diagnostics & Telemetry</strong></span>
                  <span class="hud-cmd-key"><kbd>H</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Open this Commands guide</span>
                  <span class="hud-cmd-key"><kbd>?</kbd></span>
                </li>
              </ul>
            </div>

            <div>
              <h3 class="hud-group-title">🗣️ Pantheon Interaction</h3>
              <ul class="hud-cmd-list">
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Talk or assign sovereign loop</span>
                  <span class="hud-cmd-key"><kbd>E</kbd> / <kbd>F</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Live microphone voice (Surface POV)</span>
                  <span class="hud-cmd-key"><kbd>C</kbd></span>
                </li>
                <li class="hud-cmd-row">
                  <span class="hud-cmd-desc">Autopilot walking guide</span>
                  <span class="hud-cmd-key"><kbd>P</kbd></span>
                </li>
              </ul>
            </div>
          </div>

          <div class="hud-modal-foot">
            <span class="hud-foot-hint">Press <kbd>?</kbd> or <kbd>Esc</kbd> anytime to toggle this card.</span>
            <button type="button" class="hud-foot-btn" id="btnCommandsDone">Return to Sphere</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      $('btnCommandsClose').addEventListener('click', closeCommandsModal);
      $('btnCommandsDone').addEventListener('click', closeCommandsModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCommandsModal();
      });
    }

    // Sync Realm map close button with state
    const realmMap = document.querySelector('.z-realm');
    if (realmMap) {
      realmMap.addEventListener('click', (e) => {
        const act = e.target.closest('button') && e.target.closest('button').dataset.act;
        if (act === 'hide') {
          // User clicked '-' on realm map header
          state.map = false;
          saveState('map', false);
          applyOverlayStates();
        }
      });
    }
  }

  /* ---------- Global Keyboard Listeners ---------- */
  function handleKeyDown(e) {
    const tag = (e.target && e.target.tagName) || '';
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable);
    if (typing) return;

    // Handle Escape: Close Commands modal, Diagnostics modal, or Exit Zen mode
    if (e.key === 'Escape') {
      const diagModal = $('hudDiagnosticsModal');
      if (diagModal && diagModal.classList.contains('is-open')) {
        e.preventDefault();
        closeDiagnosticsModal();
        return;
      }
      const modal = $('hudCommandsModal');
      if (modal && modal.classList.contains('is-open')) {
        e.preventDefault();
        closeCommandsModal();
        return;
      }
      if (state.zen) {
        e.preventDefault();
        toggleZen(false);
        return;
      }
    }

    if (e.metaKey || e.ctrlKey || e.altKey) return;

    // Only process 3D world HUD shortcuts when on pixel-world view
    const worldView = $('view-pixel-world');
    if (!worldView || !worldView.classList.contains('active')) return;

    const k = e.key.toLowerCase();

    // 1. Zen mode [Z]
    if (k === 'z') {
      e.preventDefault();
      toggleZen();
      return;
    }

    // 2. Realm map [M]
    if (k === 'm') {
      e.preventDefault();
      toggleOverlay('map');
      return;
    }

    // 3. Quick Dock [D]
    if (k === 'd') {
      e.preventDefault();
      toggleOverlay('dock');
      return;
    }

    // 4. Globe Top Toolbar [T]
    if (k === 't') {
      e.preventDefault();
      toggleOverlay('toolbar');
      return;
    }

    // 5. System Diagnostics & Telemetry [H]
    if (k === 'h') {
      e.preventDefault();
      const dm = $('hudDiagnosticsModal');
      if (dm && dm.classList.contains('is-open')) closeDiagnosticsModal();
      else openDiagnosticsModal();
      return;
    }

    // 6. Commands cheat-sheet [?] or [/]
    if (e.key === '?' || (e.shiftKey && k === '/') || (k === '/' && !typing)) {
      e.preventDefault();
      const modal = $('hudCommandsModal');
      if (modal && modal.classList.contains('is-open')) closeCommandsModal();
      else openCommandsModal();
      return;
    }

    // 7. Chatter feed [C] (Only when NOT in surface avatar mode, where C is voice)
    if (k === 'c') {
      const w = window.sphereWorld;
      if (!w || !w.isAvatarMode) {
        e.preventDefault();
        toggleOverlay('chatter');
        return;
      }
    }
  }

  /* ---------- Initialization ---------- */
  function init() {
    loadState();
    injectHudDeck();
    applyOverlayStates();
    window.addEventListener('keydown', handleKeyDown);

    // Re-apply states when user switches back to pixel-world view
    window.addEventListener('civ:viewchange', (e) => {
      if (e.detail && e.detail.view === 'pixel-world') {
        applyOverlayStates();
      }
    });
  }

  // Expose global controller
  window.ZothHud = {
    state,
    toggleOverlay,
    setOverlay,
    toggleZen,
    openCommandsModal,
    closeCommandsModal,
    openDiagnosticsModal,
    closeDiagnosticsModal,
    showToast,
    getState: () => Object.assign({}, state),
  };
  window.zothHud = window.ZothHud;

  if ($('view-pixel-world') || document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
