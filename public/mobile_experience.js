/* ==========================================================================
   ZOTH CIVILIZATION v5.2 — MOBILE & DESKTOP COMMAND SHELL CONTROLLER
   - Unified Command Drawer (Desktop right slide-over / Mobile bottom sheet)
   - Desktop View Options Popover (reduces 18 top-bar buttons -> clean 8)
   - Native 5-tab Mobile Bottom Navigation Bar + Floating Mobile World Controls
   - Clear 🌍 Orbit exit pill in mobile Walk mode + auto-scroll Living Minds dossier
   - Auto-hides #zothStarSystemBar whenever Walk mode or ANY world drawer opens
   - Auto-resizes Cockpit Graph & Three.js canvas on view switches
   - Collapses Wishlist Civic Skill Shelf on mobile for fast scanning
   ========================================================================== */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  function triggerBtn(id) {
    const el = $(id);
    if (el) el.click();
  }

  function switchView(viewId) {
    const tabBtn = document.querySelector(`.nav-tabs .tab-btn[data-view="${viewId}"]`);
    if (tabBtn) tabBtn.click();
    syncActiveViewState(viewId);

    // Ensure canvas-backed views (Cockpit Graph, 3D World, Adytum) measure cleanly
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    });
  }

  function getActiveView() {
    const active = document.querySelector('.view-section.active');
    if (!active) return 'pixel-world';
    return active.id.replace(/^view-/, '');
  }

  function syncActiveViewState(forcedView) {
    const view = forcedView || getActiveView();
    document.body.classList.toggle('z4-on-world', view === 'pixel-world');

    // Reset scroll position to top when switching pages
    const sec = document.getElementById(`view-${view}`);
    if (sec && view !== 'pixel-world') sec.scrollTop = 0;

    document.querySelectorAll('#zothMobileBottomNav .zmb-tab[data-mview]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-mview') === view);
    });

    const moreTab = $('zmbMoreBtn');
    if (moreTab) {
      const primary = new Set(['pixel-world', 'adytum-chamber', 'living-minds', 'conclave-treasury']);
      moreTab.classList.toggle('is-active', !primary.has(view));
    }

    document.querySelectorAll('#zothCommandSheet .zcs-view-btn').forEach((btn) => {
      btn.classList.toggle('is-active', btn.getAttribute('data-view') === view);
    });
  }

  /* ---------- 1. Track Open World Drawers (prevent overlap with Planet Bar) ---------- */
  function syncDrawerOpenState() {
    const selectors = [
      '.z-realm:not(.hud-hidden)',
      '.floating-dialogue-feed:not(.hud-hidden)',
      '.quick-dock:not(.hud-hidden)',
      '#huddleDock:not(.is-collapsed)',
      '#worldEncounter:not([hidden])',
      '#civicPanel:not([hidden])',
      '#zothQuestDrawer.is-open'
    ];
    let anyOpen = selectors.some((sel) => !!document.querySelector(sel));
    const dlg = $('avatarDialogueBox');
    if (dlg && getComputedStyle(dlg).display !== 'none') anyOpen = true;
    document.body.classList.toggle('z4-drawer-open', anyOpen);
  }

  function watchWorldDrawers() {
    const world = document.querySelector('#view-pixel-world .pixel-world-container');
    if (!world || typeof MutationObserver === 'undefined') return;
    const obs = new MutationObserver(() => syncDrawerOpenState());
    obs.observe(world, { subtree: true, attributes: true, attributeFilter: ['class', 'hidden', 'style'] });
    setInterval(syncDrawerOpenState, 600);
  }

  /* ---------- 2. Header Command Drawer Button ---------- */
  function injectHeaderCommandButton() {
    const stats = document.querySelector('.header-stats');
    if (!stats || $('btnZothCommandDrawer')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btnZothCommandDrawer';
    btn.className = 'btn-ctrl';
    btn.setAttribute('aria-label', 'Open Zoth Command Menu');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span aria-hidden="true">☰</span><span>Menu</span>';
    btn.addEventListener('click', () => toggleCommandSheet(true));
    stats.appendChild(btn);
  }

  /* ---------- 3. Desktop View Options Popover (declutters top world bar) ---------- */
  function buildDesktopViewOptions() {
    const toolbar = document.querySelector('.world-top .globe-toolbar');
    const container = document.querySelector('#view-pixel-world .pixel-world-container');
    if (!toolbar || !container || $('btnDesktopWorldSettings')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btnDesktopWorldSettings';
    btn.className = 'globe-btn';
    btn.title = 'World Display & Audio Settings';
    btn.innerHTML = '<span>⚙️</span> View';
    toolbar.appendChild(btn);

    const pop = document.createElement('div');
    pop.id = 'zothDesktopViewPopover';
    pop.innerHTML = `
      <div class="zmp-grid">
        <button type="button" class="zmp-btn" data-proxy="btnToggle3DMode">🪐 3D / 2D</button>
        <button type="button" class="zmp-btn" data-proxy="btnAutoSpin">🔄 Auto-Spin</button>
        <button type="button" class="zmp-btn" data-proxy="btnDayNight">☀️ Day / Night</button>
        <button type="button" class="zmp-btn" data-proxy="btnToggleAudio">🔊 Audio SFX</button>
        <button type="button" class="zmp-btn" data-proxy="btnToggleTurbo60">⚡ 60 FPS</button>
        <button type="button" class="zmp-btn" data-proxy="btnCamFollowImperator">👑 Imperator</button>
        <button type="button" class="zmp-btn" data-proxy="btnOpenGameIntro">🎮 Guide & AI</button>
        <button type="button" class="zmp-btn" data-proxy="btnResetGlobeCam">🌍 Reset Cam</button>
      </div>
    `;
    container.appendChild(pop);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      pop.classList.toggle('is-open');
    });

    pop.querySelectorAll('[data-proxy]').forEach((b) => {
      b.addEventListener('click', () => {
        triggerBtn(b.getAttribute('data-proxy'));
        pop.classList.remove('is-open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!pop.contains(e.target) && e.target !== btn) {
        pop.classList.remove('is-open');
      }
    });
  }

  /* ---------- 4. Unified Command Drawer / Mobile Bottom Sheet ---------- */
  function buildCommandSheet() {
    if ($('zothCommandSheet')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'zothCommandBackdrop';
    backdrop.addEventListener('click', () => toggleCommandSheet(false));

    const sheet = document.createElement('aside');
    sheet.id = 'zothCommandSheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', 'Zoth Civilization Command Menu');

    sheet.innerHTML = `
      <div class="zcs-handle" aria-hidden="true"></div>
      <div class="zcs-head">
        <h2 class="zcs-title"><span aria-hidden="true">🜂</span> Command Deck</h2>
        <button type="button" class="zcs-close" id="btnCloseCommandSheet" aria-label="Close Command Menu">✕</button>
      </div>
      <div class="zcs-body">
        <div>
          <p class="zcs-section-label">Live Realm Telemetry</p>
          <div class="zcs-status-strip">
            <div class="zcs-stat">
              <div class="zcs-stat-k">Imperator</div>
              <div class="zcs-stat-v" id="zcsLeaderVal">AZOTH</div>
            </div>
            <div class="zcs-stat">
              <div class="zcs-stat-k">Treasury Goal</div>
              <div class="zcs-stat-v" id="zcsTreasuryVal">$0.00 / $100K</div>
            </div>
            <div class="zcs-stat">
              <div class="zcs-stat-k">World Clock</div>
              <div class="zcs-stat-v" id="zcsClockVal">DAY 1 • 08:00</div>
            </div>
            <div class="zcs-stat">
              <div class="zcs-stat-k">AGY / Adytum</div>
              <div class="zcs-stat-v" id="zcsAgyVal">IDLE · 4 CYCLES</div>
            </div>
          </div>
        </div>

        <div>
          <p class="zcs-section-label">All Civilization Views</p>
          <div class="zcs-grid">
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="pixel-world">🪐 3D Planet World</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="adytum-chamber">🔮 Adytum Chamber</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="living-minds">🌌 Living Minds</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="conclave-treasury">👑 Conclave & $100K</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="cockpit-graph">🛰️ Cockpit Graph</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="timeline-deck">⏱️ $100K Timeline</button>
            <a href="/gallery.html" class="zcs-action-btn">🖼️ Meditation Gallery</a>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="daily-wishlist">📜 Wishlist</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="fractal-lineage">🌳 Lineage & 10 Sq</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="mission-control">📡 Mission Control</button>
            <button type="button" class="zcs-action-btn zcs-view-btn" data-view="library">📚 Library</button>
          </div>
        </div>

        <div>
          <p class="zcs-section-label">Gameplay & Sovereign Actions</p>
          <div class="zcs-grid">
            <button type="button" class="zcs-action-btn is-gold" id="zcsQuestsBtn">🏆 Quests & Decrees</button>
            <button type="button" class="zcs-action-btn is-cyan" data-proxy="btnOpenGameIntro">🔑 AI Keys & Guide</button>
            <button type="button" class="zcs-action-btn is-emerald" data-proxy="btnDispatchAgy">⚡ Run AGY Turn</button>
            <button type="button" class="zcs-action-btn" data-proxy="btnTriggerElection">🗳️ Call Conclave</button>
            <button type="button" class="zcs-action-btn" data-proxy="btnStepAdytum">🔮 Step Adytum Key</button>
            <button type="button" class="zcs-action-btn" data-proxy="btnWatchMotionEdit">🎬 Motion Edit</button>
            <button type="button" class="zcs-action-btn" data-proxy="btnOpenWorldPortalModal">🌌 Zoth Node Portal</button>
            <button type="button" class="zcs-action-btn" id="zcsBuildExportBtn">🛠️ Build & Export</button>
            <button type="button" class="zcs-action-btn" data-proxy="btnPause">⏯️ Play / Pause</button>
            <button type="button" class="zcs-action-btn" data-proxy="btnSpeed">⏩ Sim Speed</button>
          </div>
        </div>

        <div>
          <p class="zcs-section-label">100% Free & Open Access · Support</p>
          <div class="zcs-grid">
            <a href="https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X" target="_blank" rel="noopener noreferrer" class="zcs-action-btn is-gold">☕ Buy Us a Coffee</a>
            <button type="button" class="zcs-action-btn is-emerald" id="zcsCopySolBtn">◎ Copy SOL Tip</button>
          </div>
        </div>

        <div>
          <p class="zcs-section-label">Cross Banner of the 4 Elements</p>
          <div class="zcs-elements-row">
            <span class="zcs-elem-chip">🜂 Fire · Yod</span>
            <span class="zcs-elem-chip">🜁 Air · Vav</span>
            <span class="zcs-elem-chip">🜄 Water · Heh</span>
            <span class="zcs-elem-chip">🜃 Earth · Heh Final</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);

    $('btnCloseCommandSheet').addEventListener('click', () => toggleCommandSheet(false));

    sheet.querySelectorAll('.zcs-view-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        toggleCommandSheet(false);
        switchView(viewId);
      });
    });

    sheet.querySelectorAll('[data-proxy]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-proxy');
        toggleCommandSheet(false);
        triggerBtn(targetId);
      });
    });

    $('zcsQuestsBtn')?.addEventListener('click', () => {
      toggleCommandSheet(false);
      switchView('pixel-world');
      setTimeout(() => {
        const qBtn = document.getElementById('btnOpenQuestsHud') || document.getElementById('btnOpenQuestDrawer') || document.querySelector('[title*="Quest"]');
        if (qBtn) qBtn.click();
      }, 80);
    });

    $('zcsBuildExportBtn')?.addEventListener('click', () => {
      toggleCommandSheet(false);
      if (typeof window.openSovereignGeneratorModal === 'function') {
        window.openSovereignGeneratorModal();
      }
    });

    $('zcsCopySolBtn')?.addEventListener('click', function () {
      const addr = 'GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).catch(() => {});
      }
      this.textContent = '✓ Copied SOL!';
      setTimeout(() => { this.textContent = '◎ Copy SOL Tip'; }, 2200);
    });
  }

  function syncSheetTelemetry() {
    const leader = $('headerLeaderText')?.textContent?.replace(/^IMPERATOR:\s*/i, '') || 'AZOTH';
    const treasury = $('headerTreasurySum')?.textContent || '$0.00 / $100K';
    const clock = $('civClockText')?.textContent || 'DAY 1 • 08:00';
    const agy = ($('agyStatusText')?.textContent || 'IDLE')
      .replace(/^AGY:\s*/i, '')
      .replace(/\s*\(\d+\s*runs?\)/i, '')
      .trim() || 'IDLE';
    const adytum = $('adytumBadgeText')?.textContent?.replace(/^ADYTUM:\s*/i, '') || '4 CYCLES';

    if ($('zcsLeaderVal')) $('zcsLeaderVal').textContent = leader;
    if ($('zcsTreasuryVal')) $('zcsTreasuryVal').textContent = treasury;
    if ($('zcsClockVal')) $('zcsClockVal').textContent = clock;
    if ($('zcsAgyVal')) $('zcsAgyVal').textContent = `${agy} · ${adytum}`;
  }

  function toggleCommandSheet(open) {
    const sheet = $('zothCommandSheet');
    const backdrop = $('zothCommandBackdrop');
    const trigger = $('btnZothCommandDrawer');
    if (!sheet || !backdrop) return;
    const next = typeof open === 'boolean' ? open : !sheet.classList.contains('is-open');
    if (next) syncSheetTelemetry();
    sheet.classList.toggle('is-open', next);
    backdrop.classList.toggle('is-open', next);
    if (trigger) trigger.setAttribute('aria-expanded', String(next));
  }

  /* ---------- 5. Native 5-Tab Mobile Bottom Navigation ---------- */
  function buildMobileBottomNav() {
    if ($('zothMobileBottomNav')) return;
    const nav = document.createElement('nav');
    nav.id = 'zothMobileBottomNav';
    nav.setAttribute('aria-label', 'Mobile Primary Navigation');
    nav.innerHTML = `
      <button type="button" class="zmb-tab is-active" data-mview="pixel-world">
        <span class="zmb-ico" aria-hidden="true">🪐</span>
        <span class="zmb-lbl">World</span>
      </button>
      <button type="button" class="zmb-tab" data-mview="adytum-chamber">
        <span class="zmb-ico" aria-hidden="true">🔮</span>
        <span class="zmb-lbl">Adytum</span>
      </button>
      <button type="button" class="zmb-tab" data-mview="living-minds">
        <span class="zmb-ico" aria-hidden="true">🌌</span>
        <span class="zmb-lbl">Minds</span>
      </button>
      <button type="button" class="zmb-tab" data-mview="conclave-treasury">
        <span class="zmb-ico" aria-hidden="true">👑</span>
        <span class="zmb-lbl">Conclave</span>
      </button>
      <button type="button" class="zmb-tab" id="zmbMoreBtn">
        <span class="zmb-ico" aria-hidden="true">☰</span>
        <span class="zmb-lbl">More</span>
      </button>
    `;
    document.body.appendChild(nav);

    nav.querySelectorAll('.zmb-tab[data-mview]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeMobilePopover();
        switchView(btn.getAttribute('data-mview'));
      });
    });

    $('zmbMoreBtn').addEventListener('click', () => {
      closeMobilePopover();
      toggleCommandSheet(true);
    });
  }

  /* ---------- 6. Floating Mobile 3D World Controls & Popovers ---------- */
  let activePopover = null;

  function closeMobilePopover() {
    const pop = $('zothMobilePopover');
    if (pop) pop.classList.remove('is-open');
    activePopover = null;
  }

  function openMobilePopover(kind) {
    const pop = $('zothMobilePopover');
    if (!pop) return;
    if (activePopover === kind && pop.classList.contains('is-open')) {
      closeMobilePopover();
      return;
    }
    activePopover = kind;

    if (kind === 'colonies') {
      pop.innerHTML = `
        <div class="zmp-grid">
          <button type="button" class="zmp-btn" data-col="colony_capital">🏛️ Capital Citadel</button>
          <button type="button" class="zmp-btn" data-col="colony_nova_zoth">🌊 Nova Zoth</button>
          <button type="button" class="zmp-btn" data-col="colony_sol_crypta">⚡ Sol Crypta</button>
          <button type="button" class="zmp-btn" data-col="colony_adytum_grove">🔮 Adytum Grove</button>
          <button type="button" class="zmp-btn" data-col="colony_hex_bastion">🛡️ HexForge</button>
          <button type="button" class="zmp-btn" data-proxy="btnCamFollowImperator">👑 Follow Imperator</button>
          <button type="button" class="zmp-btn" data-proxy="btnResetGlobeCam">🌍 Orbital Reset</button>
          <button type="button" class="zmp-btn" id="zmpCloseBtn">✕ Close</button>
        </div>
      `;
      pop.querySelectorAll('[data-col]').forEach((b) => {
        b.addEventListener('click', () => {
          const orig = document.querySelector(`.btn-colony-cam[data-colony="${b.getAttribute('data-col')}"]`);
          if (orig) orig.click();
          closeMobilePopover();
        });
      });
    } else {
      pop.innerHTML = `
        <div class="zmp-grid">
          <button type="button" class="zmp-btn" id="zmpQuestsBtn">🏆 Quests & Decrees</button>
          <button type="button" class="zmp-btn" data-proxy="hudToggleMap">🗺️ Realm Map</button>
          <button type="button" class="zmp-btn" data-proxy="hudToggleDock">👥 Agent Roster</button>
          <button type="button" class="zmp-btn" data-proxy="hudToggleChatter">💬 Live Chatter</button>
          <button type="button" class="zmp-btn" data-proxy="btnToggle3DMode">🪐 3D / 2D</button>
          <button type="button" class="zmp-btn" data-proxy="btnAutoSpin">🔄 Auto-Spin</button>
          <button type="button" class="zmp-btn" data-proxy="btnDayNight">☀️ Day / Night</button>
          <button type="button" class="zmp-btn" data-proxy="btnToggleAudio">🔊 Audio SFX</button>
        </div>
      `;
      $('zmpQuestsBtn')?.addEventListener('click', () => {
        closeMobilePopover();
        const qBtn = document.getElementById('btnOpenQuestsHud') || document.getElementById('btnOpenQuestDrawer') || document.querySelector('[title*="Quest"]');
        if (qBtn) qBtn.click();
      });
    }

    pop.querySelectorAll('[data-proxy]').forEach((b) => {
      b.addEventListener('click', () => {
        triggerBtn(b.getAttribute('data-proxy'));
        closeMobilePopover();
        setTimeout(syncDrawerOpenState, 60);
      });
    });
    $('zmpCloseBtn')?.addEventListener('click', closeMobilePopover);
    pop.classList.add('is-open');
  }

  function buildMobileWorldControls() {
    const container = document.querySelector('#view-pixel-world .pixel-world-container');
    if (!container || $('zothMobileWorldBar')) return;

    const bar = document.createElement('div');
    bar.id = 'zothMobileWorldBar';
    bar.innerHTML = `
      <div class="zmw-group">
        <button type="button" class="zmw-pill is-active" id="zmwOrbitBtn">👑 Orbit</button>
        <button type="button" class="zmw-pill is-emerald" id="zmwWalkBtn">🎮 Walk</button>
      </div>
      <div class="zmw-group">
        <button type="button" class="zmw-pill" id="zmwColoniesBtn">🏛️ Sights ▾</button>
        <button type="button" class="zmw-pill" id="zmwToolsBtn" aria-label="World Tools">⚙️</button>
      </div>
    `;

    const popover = document.createElement('div');
    popover.id = 'zothMobilePopover';

    container.appendChild(bar);
    container.appendChild(popover);

    $('zmwOrbitBtn').addEventListener('click', () => {
      closeMobilePopover();
      triggerBtn('btnGodsView');
      triggerBtn('btnExitAvatarMode');
      setWalkUiState(false);
    });

    $('zmwWalkBtn').addEventListener('click', () => {
      closeMobilePopover();
      triggerBtn('btnSurfaceView');
      setWalkUiState(true);
    });

    $('zmwColoniesBtn').addEventListener('click', () => openMobilePopover('colonies'));
    $('zmwToolsBtn').addEventListener('click', () => openMobilePopover('tools'));
  }

  function setWalkUiState(isWalking) {
    const walking = !!isWalking;
    document.body.classList.toggle('z4-walk-mode', walking);
    const walkBtn = $('zmwWalkBtn');
    const orbitBtn = $('zmwOrbitBtn');
    if (walkBtn) walkBtn.classList.toggle('is-active', walking);
    if (orbitBtn) {
      orbitBtn.classList.toggle('is-active', !walking);
      orbitBtn.textContent = walking ? '🌍 Orbit' : '👑 Orbit';
      orbitBtn.setAttribute('aria-label', walking ? 'Exit Walk Mode to Orbital View' : 'Orbital View');
    }
    // Keep native civ_gameplay_engine #zothTouchWalkPad cleanly synced
    const pad = $('zothTouchWalkPad');
    if (pad) {
      pad.style.display = (walking && window.innerWidth <= 900) ? 'flex' : 'none';
    }
  }

  /* ---------- 7. Collapsible Civic Skill Shelf on Mobile Wishlist ---------- */
  function enhanceWishlistShelf() {
    const shelfGrid = document.getElementById('civicShelfGrid') || document.querySelector('#view-daily-wishlist .shelf-grid');
    if (!shelfGrid || $('btnToggleMobileShelf')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'btnToggleMobileShelf';
    btn.className = 'z5-shelf-toggle';
    const collapsedByDefault = window.innerWidth <= 900;
    if (collapsedByDefault) shelfGrid.classList.add('z5-collapsed-list');
    btn.innerHTML = collapsedByDefault
      ? '<span>🏪 Civic Skill Shelf</span><span>Show Skills ▾</span>'
      : '<span>🏪 Civic Skill Shelf</span><span>Hide Skills ▴</span>';

    btn.addEventListener('click', () => {
      const hidden = shelfGrid.classList.toggle('z5-collapsed-list');
      btn.innerHTML = hidden
        ? '<span>🏪 Civic Skill Shelf</span><span>Show Skills ▾</span>'
        : '<span>🏪 Civic Skill Shelf</span><span>Hide Skills ▴</span>';
    });
    shelfGrid.parentNode.insertBefore(btn, shelfGrid);
  }

  /* ---------- 8. Global Sync & Listeners ---------- */
  function bindGlobalSync() {
    document.querySelectorAll('.nav-tabs .tab-btn[data-view]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const viewId = btn.getAttribute('data-view');
        setTimeout(() => {
          syncActiveViewState(viewId);
          window.dispatchEvent(new Event('resize'));
        }, 40);
      });
    });

    $('btnSurfaceView')?.addEventListener('click', () => setWalkUiState(true));
    $('btnGodsView')?.addEventListener('click', () => setWalkUiState(false));
    $('btnExitAvatarMode')?.addEventListener('click', () => setWalkUiState(false));

    // On mobile, tapping a Sovereign card in Living Minds scrolls their dossier cleanly into view
    const lmList = $('lmRosterList');
    if (lmList) {
      lmList.addEventListener('click', (e) => {
        if (window.innerWidth > 900) return;
        const item = e.target && e.target.closest ? e.target.closest('.lm-item') : null;
        if (!item) return;
        setTimeout(() => {
          const dossier = document.querySelector('#view-living-minds .lm-dossier');
          if (dossier) dossier.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 90);
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleCommandSheet(false);
        closeMobilePopover();
        $('zothDesktopViewPopover')?.classList.remove('is-open');
      }
    });
  }

  function init() {
    injectHeaderCommandButton();
    buildDesktopViewOptions();
    buildCommandSheet();
    buildMobileBottomNav();
    buildMobileWorldControls();
    enhanceWishlistShelf();
    watchWorldDrawers();
    bindGlobalSync();
    syncActiveViewState();

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      syncDrawerOpenState();
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
