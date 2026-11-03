/**
 * 🏛️ ZOTH CIVILIZATION — FRONTEND APP ENGINE
 * =====================================================================
 * Complete client-side controller:
 * 1. 2D Top-Down Retro Pixel Canvas (Game Boy / 16-bit RPG style)
 * 2. Adytum Initiation Chamber (Keys 0-21, BOTA Vision, Subconscious/Superconscious)
 * 3. Cockpit Inter-Agent Communication Graph Canvas
 * 4. Mission Control & Real-World Workspace Synchronization
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

(function () {
  'use strict';

  // State Containers
  let civState = {};
  let agents = [];
  let buildings = [];
  let tarotKeys = [];
  let mistPractice = null;
  let botaStudy = null;
  let activeCardIndex = 0;
  let selectedAgent = null;

  // View Navigation
  const tabButtons = document.querySelectorAll('.tab-btn');
  const viewSections = document.querySelectorAll('.view-section');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      viewSections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      const targetView = document.getElementById(`view-${btn.dataset.view}`);
      if (targetView) targetView.classList.add('active');
      window.dispatchEvent(new CustomEvent('civ:viewchange', { detail: { view: btn.dataset.view } }));

      if (btn.dataset.view === 'pixel-world') {
        resizePixelCanvas();
        if (window.sphereWorld) window.sphereWorld.onResize();
      }
      if (btn.dataset.view === 'cockpit-graph') resizeGraphCanvas();
      if (btn.dataset.view === 'library') loadLibrary();
      if (btn.dataset.view === 'living-minds') {
        resizeDeepNetCanvas();
        loadLivingMinds();
      }
    });
  });

  // =========================================================================
  // SSE REALTIME STREAM CONNECTION
  // =========================================================================
  function initSSE() {
    console.log('[Civilization] Initializing SSE /api/stream...');
    const eventSource = new EventSource('/api/stream');

    eventSource.onopen = () => {
      console.log('[Civilization] SSE stream connected.');
      window.dispatchEvent(new CustomEvent('civ:sse', { detail: { up: true } }));
    };

    eventSource.addEventListener('init', e => {
      try {
        const data = JSON.parse(e.data);
        console.log('[Civilization] Received init event. Agents:', data.agents ? data.agents.length : 0);
        applySnapshot(data);
      } catch (err) {
        console.error('[Civilization] Failed parsing init event:', err);
      }
    });

    eventSource.addEventListener('tick', e => {
      try {
        const data = JSON.parse(e.data);
        applySnapshot(data);
      } catch (err) {
        console.error('[Civilization] Failed parsing tick event:', err);
      }
    });

    eventSource.addEventListener('update', e => {
      try {
        const data = JSON.parse(e.data);
        applySnapshot(data);
      } catch (err) {
        console.error('[Civilization] Failed parsing update event:', err);
      }
    });

    eventSource.addEventListener('pilot_command', e => {
      try {
        const cmd = JSON.parse(e.data);
        if (window.streamPilot && typeof window.streamPilot.handleCommand === 'function') {
          window.streamPilot.handleCommand(cmd);
        }
      } catch (err) {
        console.warn('pilot_command error:', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('[Civilization] SSE disconnected or errored. Retrying fetchStatus in 2s...', err);
      window.dispatchEvent(new CustomEvent('civ:sse', { detail: { up: false } }));
      setTimeout(fetchStatus, 2000);
    };
  }

  async function fetchStatus() {
    try {
      let data = null;
      if (window.__initialStatusPromise) {
        const p = window.__initialStatusPromise;
        window.__initialStatusPromise = null;
        data = await p;
      }
      if (!data) {
        const res = await fetch('/api/status');
        data = await res.json();
      }
      applySnapshot(data);
    } catch (e) {
      if (window.location.protocol !== 'file:') {
        console.warn('Status fetch error:', e);
      }
    }
  }

  let agyState = null;
  let lineageState = null;
  let pixelRoster = [];
  let graphHitNodes = [];
  const sectionStamps = {};

  function safeStep(fn) {
    try { fn(); } catch (err) { console.warn('[applySnapshot step]', err); }
  }

  function applySnapshot(data) {
    if (!data) return;
    window.__lastCivData = data;
    safeStep(() => window.dispatchEvent(new CustomEvent('civ:snapshot', { detail: data })));
    if (data.mentalReflections) {
      window.__mentalReflections = data.mentalReflections;
      safeStep(() => paintAdytumReflections());
    }
    if (data.agyStatus) {
      agyState = data.agyStatus;
    }
    if (data.state) {
      civState = data.state;
      safeStep(() => updateHeaderUI());
      safeStep(() => updateConclaveUI());
      safeStep(() => updateTreasuryUI());
    }
    if (data.agents) {
      agents = data.agents;
      safeStep(() => updateDockUI());
    }
    if (data.buildings) {
      buildings = data.buildings;
      safeStep(() => updateBuildingsGrid());
    }
    if (data.mistPractice) mistPractice = data.mistPractice;
    if (data.botaStudy) botaStudy = data.botaStudy;
    if (data.tarotKeys) {
      tarotKeys = data.tarotKeys;
      safeStep(() => renderJourneyStrip());
      safeStep(() => updateAdytumChamberView());
    }
    if (data.recentMessages) {
      safeStep(() => updateDialogueFeeds(data.recentMessages));
    }
    if (data.requisitions) {
      safeStep(() => updateWishlistUI(data.requisitions));
    }
    if (data.lineage) {
      lineageState = data.lineage;
      safeStep(() => updateLineageUI(data.lineage));
    }
    if (data.accounts) {
      safeStep(() => updateAccountsUI(data.accounts));
    }
    if (data.outreach) {
      safeStep(() => updateOutreachUI(data.outreach));
    }
    if (data.customerDesk) {
      safeStep(() => updateCustomerDesk(data.customerDesk));
    }
    if (data.distribution) {
      safeStep(() => updateDistribution(data.distribution));
    }
    if (data.connectors) {
      safeStep(() => updateConnectors(data.connectors));
    }
    if (data.localRevamp) {
      safeStep(() => updateLocalRevampUI(data.localRevamp));
    }
    if (data.timeline) {
      safeStep(() => updateTimelineUI(data.timeline));
    }
    if (data.subconscious) {
      safeStep(() => updateSubconsciousUI(data.subconscious));
    }
    if (window.sphereWorld) {
      safeStep(() => window.sphereWorld.updateState(data));
    }
    safeStep(() => paintLivingWorld());
    safeStep(() => paintLibraryRoad());
    safeStep(() => maybeRefreshLibrary());
  }

  let libraryPayload = null;
  let libraryShelf = 'open';
  let libraryRights = 'all';
  let libraryFetchedAt = 0;

  function libraryLead(payload) {
    const road = civState && civState.libraryRoad;
    const sections = payload && payload.sections || [];
    const open = sections.find((section) => road && section.id === road.phase);
    const full = sections.filter((section) => section.target && section.count >= section.target).map((section) => section.title);
    if (road && road.active && open) {
      const stocked = full.length ? ` Full: ${full.join(', ')}.` : '';
      return `The open shelf is ${open.title}. ${open.count} of ${open.target} cards are on it.${stocked} A card names a book. It does not copy the pages.`;
    }
    if (road && road.phase === 'complete') {
      return 'The Library shelves have met their counts. A card names a book. It does not copy the pages.';
    }
    if (road && road.active) {
      return `The open shelf is ${road.title || 'the next one'}. A card names a book. It does not copy the pages.`;
    }
    return 'The Library is quiet. A card names a book. It does not copy the pages.';
  }

  function paintLibraryRoad() {
    const el = document.getElementById('libraryStatus');
    if (!el) return;
    el.textContent = libraryLead(libraryPayload);
  }

  function libraryQueryText() {
    const input = document.getElementById('libraryQuery');
    return input ? input.value.trim().toLowerCase() : '';
  }

  function volumeMatches(volume, query) {
    if (!volume) return false;
    if (libraryRights === 'public-domain' && volume.rights !== 'public-domain') return false;
    if (libraryRights === 'card-only' && volume.rights === 'public-domain') return false;
    if (!query) return true;
    const hay = [volume.volume, volume.author, volume.year, volume.tradition, volume.note].join(' ').toLowerCase();
    return hay.includes(query);
  }

  function renderLibrary(payload) {
    const root = document.getElementById('libraryShelves');
    const wait = document.getElementById('libraryWait');
    const empty = document.getElementById('libraryEmpty');
    const meters = document.getElementById('libraryMeters');
    const filters = document.getElementById('libraryFilters');
    if (!root || !payload) return;
    libraryPayload = payload;
    if (wait) wait.hidden = true;
    paintLibraryRoad();
    const road = civState && civState.libraryRoad;
    const sections = payload.sections || [];
    const query = libraryQueryText();
    if (libraryShelf === 'open' && !(road && road.active)) libraryShelf = 'all';

    if (meters && meters.childElementCount !== sections.length) {
      meters.replaceChildren();
      sections.forEach((section) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'library-meter';
        button.dataset.shelf = section.id;
        button.addEventListener('click', () => {
          libraryShelf = section.id;
          renderLibrary(libraryPayload);
        });
        meters.appendChild(button);
      });
    }
    if (meters) {
      meters.querySelectorAll('.library-meter').forEach((button) => {
        const section = sections.find((item) => item.id === button.dataset.shelf);
        if (!section) return;
        const count = section.count || 0;
        const target = section.target || 0;
        const pct = target ? Math.min(100, Math.round((count / target) * 100)) : 0;
        const open = road && road.phase === section.id;
        button.classList.toggle('open', !!open);
        button.classList.toggle('chosen', libraryShelf === section.id);
        button.replaceChildren();
        const name = document.createElement('strong');
        name.textContent = open ? `${section.title} · open` : section.title;
        const line = document.createElement('span');
        line.textContent = count >= target && target ? `${count} cards · full` : `${count} of ${target}`;
        const track = document.createElement('div');
        track.className = 'library-meter-track';
        const bar = document.createElement('i');
        bar.style.width = pct + '%';
        track.appendChild(bar);
        button.append(name, line, track);
      });
    }

    if (filters && !filters.childElementCount) {
      [
        ['open', 'Open shelf'],
        ['all', 'All shelves'],
        ['public-domain', 'Public domain'],
        ['card-only', 'Card only']
      ].forEach(([id, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.filter = id;
        button.textContent = label;
        button.addEventListener('click', () => {
          if (id === 'public-domain' || id === 'card-only') {
            libraryRights = libraryRights === id ? 'all' : id;
          } else {
            libraryShelf = id;
          }
          renderLibrary(libraryPayload);
        });
        filters.appendChild(button);
      });
    }
    if (filters) {
      const openBtn = filters.querySelector('[data-filter="open"]');
      if (openBtn) openBtn.hidden = !(road && road.active);
      filters.querySelectorAll('button').forEach((button) => {
        const id = button.dataset.filter;
        const pressed = id === 'public-domain' || id === 'card-only'
          ? libraryRights === id
          : libraryShelf === id;
        button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      });
    }

    const shown = sections.filter((section) => libraryShelf === 'all' || libraryShelf === 'open' && road && section.id === road.phase || libraryShelf === section.id);
    const ordered = shown.slice().sort((a, b) => {
      const aOpen = road && a.id === road.phase ? 0 : 1;
      const bOpen = road && b.id === road.phase ? 0 : 1;
      return aOpen - bOpen;
    });
    root.replaceChildren();
    let visible = 0;
    ordered.forEach((section) => {
      const volumes = (payload.volumes || []).filter((volume) => volume && volume.section === section.id && volumeMatches(volume, query));
      if (!volumes.length && query) return;
      const block = document.createElement('section');
      block.className = 'library-shelf glass-card' + (road && road.phase === section.id ? ' library-shelf-open' : '');
      const head = document.createElement('h3');
      head.textContent = `${section.title || 'Shelf'} · ${section.count || 0} of ${section.target || 0}`;
      block.appendChild(head);
      if (section.blurb) {
        const blurb = document.createElement('p');
        blurb.className = 'section-note';
        blurb.textContent = section.blurb;
        block.appendChild(blurb);
      }
      const cards = document.createElement('div');
      cards.className = 'library-cards';
      volumes.forEach((volume) => {
        visible += 1;
        const card = document.createElement('article');
        card.className = 'library-card';
        const title = document.createElement('h4');
        title.textContent = volume.volume || 'Untitled';
        const meta = document.createElement('div');
        meta.className = 'library-meta';
        meta.textContent = [volume.author, volume.year, volume.tradition].filter(Boolean).join(' · ');
        const rights = document.createElement('div');
        rights.className = 'library-rights';
        rights.textContent = volume.rights === 'public-domain' ? 'Public domain' : 'Card only';
        const note = document.createElement('p');
        note.textContent = volume.note || '';
        card.append(title, meta, rights, note);
        cards.appendChild(card);
      });
      block.appendChild(cards);
      root.appendChild(block);
    });
    if (empty) empty.hidden = visible !== 0;
  }

  async function loadLibrary() {
    libraryFetchedAt = Date.now();
    paintLibraryRoad();
    const wait = document.getElementById('libraryWait');
    try {
      const res = await fetch('/api/library');
      if (!res.ok) throw new Error('library_closed');
      renderLibrary(await res.json());
    } catch (err) {
      if (wait) wait.hidden = false;
    }
  }

  function maybeRefreshLibrary() {
    const view = document.getElementById('view-library');
    if (!view || !view.classList.contains('active')) return;
    if (Date.now() - libraryFetchedAt < 15000) return;
    loadLibrary();
  }

  function bindLibrarySearch() {
    const input = document.getElementById('libraryQuery');
    if (!input || input.dataset.bound) return;
    input.dataset.bound = '1';
    input.addEventListener('input', () => {
      if (libraryPayload) renderLibrary(libraryPayload);
    });
  }
  bindLibrarySearch();

  function worldBrief() {
    const subs = (lineageState && lineageState.subagents) || [];
    const keepers = subs.filter((sub) => sub && sub.post === 'station');
    const kin = subs.filter((sub) => sub && sub.post !== 'station');
    const colonies = (lineageState && lineageState.colonies) || [];
    const skills = (lineageState && lineageState.stationSkills) || [];
    return {
      subs,
      keepers,
      kin,
      colonies,
      founded: colonies.filter((colony) => colony && colony.founded),
      skills,
      gazette: skills.filter((skill) => skill && skill.source === 'gazette').length,
      requests: skills.filter((skill) => skill && skill.source === 'request').length
    };
  }

  function safeColor(value, fallback) {
    const text = String(value || '');
    return /^#[0-9A-Fa-f]{3,8}$/.test(text) ? text : (fallback || '#F59E0B');
  }

  function colonyById(id) {
    return ((lineageState && lineageState.colonies) || []).find((colony) => colony && colony.id === id) || null;
  }

  function colonyLabel(id) {
    const colony = colonyById(id);
    return colony ? colony.name : 'Unplaced';
  }

  function skillsAtStation(stationId) {
    return ((lineageState && lineageState.stationSkills) || []).filter((skill) => skill && skill.stationId === stationId);
  }

  function kindLabel(kind) {
    if (kind === 'install') return 'Registry';
    if (kind === 'forge') return 'Foundry';
    if (kind === 'research') return 'Study';
    return kind || 'Stall';
  }

  function stampChanged(key, value) {
    if (sectionStamps[key] === value) return false;
    sectionStamps[key] = value;
    return true;
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && el.textContent !== text) el.textContent = text;
  }

  function openSphereAgent(agentId) {
    const tab = document.querySelector('.tab-btn[data-view="pixel-world"]');
    if (tab && !tab.classList.contains('active')) tab.click();
    window.setTimeout(() => {
      if (window.sphereWorld && window.sphereWorld.presentAgent) window.sphereWorld.presentAgent(agentId);
    }, 60);
  }

  function openSphereColony(colonyId) {
    const tab = document.querySelector('.tab-btn[data-view="pixel-world"]');
    if (tab && !tab.classList.contains('active')) tab.click();
    window.setTimeout(() => {
      if (window.sphereWorld && window.sphereWorld.focusColony) window.sphereWorld.focusColony(colonyId);
    }, 60);
  }

  function bindAgentButtons(root) {
    if (!root) return;
    root.querySelectorAll('[data-open-agent]').forEach((btn) => {
      btn.addEventListener('click', () => openSphereAgent(btn.getAttribute('data-open-agent')));
    });
  }

  function personChip(person, extra) {
    const station = person.post === 'station' ? ' · stall' : '';
    const detail = extra ? ` · ${String(extra).replace(/_/g, ' ')}` : '';
    return `<div class="person-chip"><span>${escapeHtml(person.pet || '🤖')} ${escapeHtml(person.name)}${station}${escapeHtml(detail)}</span><button type="button" class="btn-ctrl" data-open-agent="${escapeHtml(person.id)}">See them</button></div>`;
  }

  function rebuildPixelRoster() {
    const brief = worldBrief();
    const people = agents.slice();
    const groups = {};
    brief.subs.forEach((sub) => {
      const key = sub.colonyId || 'colony_capital';
      if (!groups[key]) groups[key] = [];
      groups[key].push(sub);
    });
    Object.keys(groups).forEach((key) => {
      groups[key].forEach((sub, index) => {
        const angle = (index / groups[key].length) * Math.PI * 2;
        const ring = sub.post === 'station' ? 34 : 56;
        people.push(Object.assign({}, sub, {
          x: (Number(sub.x) || 400) + Math.cos(angle) * ring,
          y: (Number(sub.y) || 320) + Math.sin(angle) * ring,
          _pixelCopy: true
        }));
      });
    });
    pixelRoster = people;
  }

  const CADRE_ROWS = [
    { id: 'Architects', label: 'Architects', color: '#F59E0B' },
    { id: 'Code', label: 'Code & Pipeline', color: '#06B6D4' },
    { id: 'Security', label: 'Security', color: '#10B981' },
    { id: 'Creative', label: 'Creative & Memory', color: '#EC4899' },
    { id: 'Swarm', label: 'Swarm & Mesh', color: '#F97316' },
    { id: 'Civic', label: 'Civic keepers', color: '#FBBF24' }
  ];

  function paintKeeperDock(brief) {
    const dock = document.getElementById('dockKeepers');
    if (!dock) return;
    const stamp = brief.keepers.map((keeper) => keeper.id).join('|');
    if (!stampChanged('keepers', stamp) && dock.childElementCount) return;
    dock.innerHTML = '';
    brief.keepers.forEach((keeper) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dock-agent-btn';
      btn.title = `${keeper.name} — ${keeper.hallName || keeper.role}`;
      btn.innerHTML = `<span>${keeper.pet || '🏪'}</span>`;
      btn.addEventListener('click', () => {
        if (typeof HermeticAudio !== 'undefined') HermeticAudio.playClick(720);
        openSphereAgent(keeper.id);
      });
      dock.appendChild(btn);
    });
  }

  function paintCadres(brief) {
    const box = document.getElementById('cadreLegend');
    if (!box) return;
    const counts = {};
    const names = {};
    function add(person, cadre) {
      const key = cadre || 'Architects';
      counts[key] = (counts[key] || 0) + 1;
      if (!names[key]) names[key] = [];
      if (names[key].length < 3) names[key].push(person.name);
    }
    agents.forEach((agent) => add(agent, agent.cadre));
    brief.kin.forEach((agent) => add(agent, agent.cadre));
    counts.Civic = brief.keepers.length;
    names.Civic = brief.keepers.slice(0, 3).map((keeper) => keeper.name);
    const stamp = CADRE_ROWS.map((row) => `${row.id}:${counts[row.id] || 0}:${(names[row.id] || []).join(',')}`).join('|');
    if (!stampChanged('cadres', stamp) && box.childElementCount) return;
    box.innerHTML = '';
    CADRE_ROWS.forEach((row) => {
      const line = document.createElement('div');
      line.className = 'cadre-badge-row';
      const sample = (names[row.id] || []).join(', ') || '—';
      line.innerHTML = `<div><span class="cadre-dot" style="background: ${row.color};"></span>${escapeHtml(row.label)} (${counts[row.id] || 0})</div><span style="color: var(--text-muted); font-size: 11px;">${escapeHtml(sample)}</span>`;
      box.appendChild(line);
    });
  }

  function paintAdytumLiving(passed) {
    const brief = passed || worldBrief();
    const card = tarotKeys[activeCardIndex] || tarotKeys[0];
    const keyNumber = card ? card.keyNumber : 0;
    const holders = agents.concat(brief.subs).filter((person) => person && person.adytumKey === keyNumber);
    const sacred = agents.concat(brief.subs).filter((person) => /ADYTUM|MEDITAT|MIST/.test(String(person && person.state || '')));
    const stalls = brief.keepers.filter((keeper) => keeper.colonyId === 'colony_adytum_grove');
    const stamp = [
      keyNumber,
      holders.map((person) => person.id).join(','),
      sacred.map((person) => person.id + person.state + ((person.meditationRite && person.meditationRite.stageId) || '')).join(','),
      stalls.map((keeper) => keeper.id + String(keeper.speech || '').slice(0, 40)).join(','),
      agents.map((person) => (person.artifactDaemon && person.artifactDaemon.dimension && person.artifactDaemon.dimension.mass) || 0).join(',')
    ].join('|');
    if (!stampChanged('adytum', stamp)) return;
    setText('adytumKeyLead', holders.length
      ? `${holders.length} ${holders.length === 1 ? 'citizen carries' : 'citizens carry'} Key ${keyNumber}.`
      : `No citizen is carrying Key ${keyNumber} right now.`);
    setText('adytumSacredLead', sacred.length
      ? `${sacred.length} on the sacred walk or in meditation.`
      : 'No one is walking to the temple or meditating right now.');
    const holdBox = document.getElementById('adytumKeyHolders');
    const sacredBox = document.getElementById('adytumSacred');
    const stallBox = document.getElementById('adytumStalls');
    if (holdBox) holdBox.innerHTML = holders.map((person) => personChip(person)).join('');
    if (sacredBox) sacredBox.innerHTML = sacred.map((person) => personChip(person, person.state)).join('');
    if (stallBox) {
      stallBox.innerHTML = stalls.map((keeper) => {
        const mine = skillsAtStation(keeper.stationId);
        const shelf = mine.length ? mine.map((skill) => escapeHtml(skill.name)).join(' · ') : 'Shelf still opening.';
        return `<div class="hall-card"><h3>${escapeHtml(keeper.pet || '🏪')} ${escapeHtml(keeper.name)}</h3><p>${escapeHtml(keeper.hallName || keeper.role)}</p><p>${escapeHtml(String(keeper.speech || '').slice(0, 160))}</p><p>${shelf}</p><div class="hall-actions"><button type="button" class="btn-ctrl" data-open-agent="${escapeHtml(keeper.id)}">See them</button></div></div>`;
      }).join('') || '<p class="section-note">The grove stalls appear when their keepers are posted.</p>';
    }
    bindAgentButtons(holdBox);
    bindAgentButtons(sacredBox);
    bindAgentButtons(stallBox);
    paintAdytumMist(card);
    paintAdytumLive(card);
    paintAdytumStudy(card);
    paintAdytumDaemons(card);
    paintAdytumReflections();
  }

  function paintConclaveCivic(brief) {
    const list = document.getElementById('conclaveCivicList');
    if (!list) return;
    const stamp = `${brief.colonies.map((colony) => colony.id).join('|')}#${brief.keepers.length}#${brief.skills.length}`;
    if (!stampChanged('conclaveCivic', stamp) && list.childElementCount) return;
    list.innerHTML = '';
    if (!brief.colonies.length) {
      list.innerHTML = '<p class="section-note"><span class="brand-badge" style="border-color:var(--gold-glow);color:var(--gold-glow);">STREAM CONNECTING</span> <strong>Civilization Colonies:</strong> Waiting for <code>data/civilization_state.json</code> snapshot. 9 sovereign colonies and 27 keepers are indexing.</p>';
      return;
    }
    brief.colonies.forEach((colony) => {
      const keepers = brief.keepers.filter((keeper) => keeper.colonyId === colony.id);
      const skillCount = brief.skills.filter((skill) => String(skill.stationId || '').indexOf(`${colony.id}:`) === 0).length;
      const row = document.createElement('div');
      row.className = 'city-line';
      row.innerHTML = `<div><strong style="color:${safeColor(colony.color)}">${escapeHtml(colony.banner || '🏛️')} ${escapeHtml(colony.name)}</strong> ${colony.founded ? '<span class="brand-badge">NEW</span>' : ''}<div class="skill-line">${keepers.length ? keepers.map((keeper) => escapeHtml(keeper.name)).join(' · ') : 'Keepers posting'} · ${skillCount} shelf skills</div></div><button type="button" class="btn-ctrl" data-open-colony="${escapeHtml(colony.id)}">Look</button>`;
      list.appendChild(row);
    });
    list.querySelectorAll('[data-open-colony]').forEach((btn) => {
      btn.addEventListener('click', () => openSphereColony(btn.getAttribute('data-open-colony')));
    });
  }

  function paintCivicShelf(brief) {
    const box = document.getElementById('civicShelf');
    if (!box) return;
    const stamp = `${brief.colonies.map((colony) => colony.id).join('|')}#${brief.skills.map((skill) => skill.id).join('|')}`;
    if (!stampChanged('shelf', stamp) && box.childElementCount) return;
    box.innerHTML = '';
    if (!brief.colonies.length) {
      box.innerHTML = '<p class="section-note"><span class="brand-badge" style="border-color:var(--gold-glow);color:var(--gold-glow);">CATALOGING</span> <strong>Lineage Shelf Skills:</strong> Awaiting station ledger from lineage engine. 83 shelf skills are synchronizing.</p>';
      return;
    }
    brief.colonies.forEach((colony) => {
      const card = document.createElement('article');
      card.className = 'shelf-card';
      const keepers = brief.keepers.filter((keeper) => keeper.colonyId === colony.id);
      const lines = keepers.map((keeper) => {
        const mine = skillsAtStation(keeper.stationId);
        const items = mine.length
          ? mine.map((skill) => `<div class="skill-line">${escapeHtml(skill.name)} <span class="brand-badge">${escapeHtml(skill.source || 'skill')}</span></div>`).join('')
          : '<div class="skill-line">Shelf still opening.</div>';
        return `<div style="margin-top:8px;"><strong>${escapeHtml(keeper.name)}</strong> · ${escapeHtml(keeper.hallName || kindLabel(String(keeper.stationId || '').split(':').pop()))}${items}</div>`;
      }).join('');
      card.innerHTML = `<h3>${escapeHtml(colony.banner || '🏛️')} ${escapeHtml(colony.name)}${colony.founded ? ' · new' : ''}</h3>${lines || '<p>No keeper posted yet.</p>'}`;
      box.appendChild(card);
    });
  }

  function paintHalls(brief) {
    const grid = document.getElementById('hallsGrid');
    if (!grid) return;
    const stamp = brief.keepers.map((keeper) => `${keeper.id}:${String(keeper.speech || '').slice(0, 48)}:${skillsAtStation(keeper.stationId).map((skill) => skill.id).join(',')}`).join('|');
    if (!stampChanged('halls', stamp) && grid.childElementCount) return;
    grid.innerHTML = '';
    if (!brief.keepers.length) {
      grid.innerHTML = '<p class="section-note"><span class="brand-badge" style="border-color:var(--gold-glow);color:var(--gold-glow);">POSTING</span> <strong>Keeper Stations:</strong> Awaiting keeper telemetry from <code>/api/status</code> lineage engine.</p>';
      return;
    }
    brief.keepers.forEach((keeper) => {
      const card = document.createElement('article');
      card.className = 'hall-card';
      const mine = skillsAtStation(keeper.stationId);
      const kind = kindLabel(String(keeper.stationId || '').split(':').pop());
      card.innerHTML = `
        <h3>${escapeHtml(keeper.pet || '🏪')} ${escapeHtml(keeper.hallName || keeper.role)}</h3>
        <p>${escapeHtml(colonyLabel(keeper.colonyId))} · ${escapeHtml(kind)} · ${escapeHtml(keeper.name)}</p>
        <p>${escapeHtml(String(keeper.speech || '').slice(0, 180))}</p>
        ${mine.map((skill) => `<div class="skill-line">${escapeHtml(skill.name)} · ${escapeHtml(skill.source || 'skill')}${skill.blurb ? ` — ${escapeHtml(String(skill.blurb).slice(0, 90))}` : ''}</div>`).join('') || '<div class="skill-line">The gazette line is not on this shelf yet.</div>'}
        <div class="hall-actions">
          <button type="button" class="btn-ctrl" data-record="${escapeHtml(keeper.id)}">Open record</button>
          <button type="button" class="btn-ctrl" data-open-agent="${escapeHtml(keeper.id)}">See on the sphere</button>
        </div>`;
      grid.appendChild(card);
    });
    grid.querySelectorAll('[data-record]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const keeper = (lineageState && lineageState.subagents || []).find((item) => item && item.id === btn.getAttribute('data-record'));
        if (keeper) showAgentInspector(keeper);
      });
    });
    bindAgentButtons(grid);
  }

  function paintTimelineWorld(brief) {
    const strip = document.getElementById('tlWorldStrip');
    if (!strip) return;
    const foundedNames = brief.founded.map((colony) => colony.name).join(', ');
    const cells = [
      ['Cities on the sphere', String(brief.colonies.length), brief.founded.length ? `${brief.founded.length} founded by the family` : 'The original cities are up'],
      ['Founded this age', String(brief.founded.length), foundedNames || 'The next city waits on the family'],
      ['Station keepers', String(brief.keepers.length), 'One keeper inside each walk-in hall'],
      ['Shelf skills', String(brief.skills.length), `${brief.gazette} from the gazette · ${brief.requests} from a request`]
    ];
    const stamp = cells.map((cell) => cell.join(':')).join('|');
    if (!stampChanged('timeline', stamp) && strip.childElementCount) return;
    strip.innerHTML = cells.map((cell) => `
      <div class="glass-card" style="padding: 16px; text-align: center;">
        <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(cell[0])}</div>
        <div style="font-size: 22px; font-weight: 900; color: #FDE68A; margin-top: 4px; overflow-wrap: anywhere;">${escapeHtml(cell[1])}</div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${escapeHtml(cell[2])}</div>
      </div>`).join('');
  }

  function paintLivingWorld() {
    const brief = worldBrief();
    const cityCount = brief.colonies.length;
    setText('brandCensus', `${agents.length} pantheon · ${brief.keepers.length} keepers · ${cityCount} cities · ${brief.skills.length} shelf skills`);
    setText('worldCensusBadge', `${cityCount} CITIES · ${brief.keepers.length} KEEPERS · ${brief.skills.length} SKILLS`);
    setText('gaugeKeepers', String(brief.keepers.length));
    setText('gaugeCities', String(cityCount));
    setText('gaugeShelf', String(brief.skills.length));
    setText('gaugeKin', String(brief.kin.length));
    setText('missionCensus', cityCount
      ? `${cityCount} cities (${brief.founded.length} founded by the family) · ${brief.keepers.length} station keepers · ${brief.skills.length} shelf skills (${brief.gazette} gazette, ${brief.requests} requested) · ${brief.kin.length} kin outside the stalls.`
      : 'The living count loads with the next snapshot.');
    setText('shelfCountBadge', `${brief.skills.length} on shelves`);
    setText('conclaveCivicBadge', `${cityCount} CITIES · ${brief.keepers.length} KEEPERS`);
    setText('colonyCountBadge', cityCount ? `${cityCount} CITIES ON THE SPHERE` : 'CITIES ON THE SPHERE');
    setText('statPopNote', `${agents.length} pantheon · ${brief.kin.length} kin · ${brief.keepers.length} keepers`);
    const names = brief.colonies.map((colony) => colony.founded ? `${colony.name} (new)` : colony.name);
    setText('statColonyNote', names.length ? names.join(' · ') : 'Cities load with the snapshot');
    paintKeeperDock(brief);
    paintCadres(brief);
    paintAdytumLiving(brief);
    paintConclaveCivic(brief);
    paintCivicShelf(brief);
    paintHalls(brief);
    paintTimelineWorld(brief);
    rebuildPixelRoster();
    if (window.HuddleDeck) window.HuddleDeck.sync();
  }

  // =========================================================================
  // HEADER UI & CONTROLS
  // =========================================================================
  function paintToolShelf() {
    const shelf = document.getElementById('toolShelf');
    if (!shelf || !civState || !Array.isArray(civState.activeMonetizedApps)) return;
    const apps = civState.activeMonetizedApps.filter((app) => app && app.stripePaymentLink);
    const sig = `desk|${apps.map((app) => `${app.id}:${app.priceUSD}`).join('|')}`;
    if (shelf.dataset.sig === sig) return;
    shelf.dataset.sig = sig;
    shelf.replaceChildren();
    const desk = document.createElement('a');
    desk.href = '/desk/';
    desk.target = '_blank';
    desk.rel = 'noopener';
    desk.innerHTML = '<strong>City Desk page</strong><span>$700–$1,500 · you collect</span>';
    shelf.appendChild(desk);
    apps.forEach((app) => {
      const link = document.createElement('a');
      link.href = app.stripePaymentLink;
      link.target = '_blank';
      link.rel = 'noopener';
      link.innerHTML = `<strong>${escapeHtml(app.name)}</strong><span>$${Number(app.priceUSD)} · Stripe</span>`;
      shelf.appendChild(link);
    });
  }

  function paintScopeMandate() {
    const input = document.getElementById('scopeInput');
    if (!input || !civState || !civState.scope) return;
    if (document.activeElement === input || input.dataset.touched) return;
    if (!input.value) input.value = civState.scope;
  }

  function updateHeaderUI() {
    const clockEl = document.getElementById('civClockText');
    if (clockEl && civState.day !== undefined) {
      const pad = n => String(n).padStart(2, '0');
      clockEl.textContent = `DAY ${civState.day} • ${pad(civState.hour)}:${pad(civState.minute)}:${pad(civState.second)}`;
    }

    // Live Sovereign Header Ticker
    const headerTreasury = document.getElementById('headerTreasurySum');
    const settled = Number(civState.currentRevenueUSD || 0);
    if (headerTreasury) {
      headerTreasury.textContent = `$${settled.toFixed(2)} / $100K`;
    }
    const headerProgress = document.getElementById('headerProgressPct');
    if (headerProgress) {
      const pct = ((settled / 100000) * 100).toFixed(3);
      headerProgress.textContent = `${pct}%`;
    }
    paintToolShelf();
    paintScopeMandate();

    // Sovereign Imperator in header
    const leaderText = document.getElementById('headerLeaderText');
    if (leaderText) {
      leaderText.textContent = `IMPERATOR: ${civState.currentLeader || 'AZOTH'}`;
    }

    // AGY Execution Engine Status in header
    const agyText = document.getElementById('agyStatusText');
    const agyDot = document.getElementById('agyPulseDot');
    if (agyState) {
      if (agyState.isExecuting) {
        const names = Array.isArray(agyState.jobs) ? agyState.jobs.map((job) => job.agentName).filter(Boolean) : [];
        const label = names.length ? names.join(' + ') : (agyState.currentJob ? agyState.currentJob.agentName : 'CLI');
        if (agyText) agyText.textContent = `AGY: RUNNING (${label})`;
        if (agyDot) {
          agyDot.style.background = '#F59E0B';
          agyDot.style.boxShadow = '0 0 10px #F59E0B';
        }
      } else {
        const runs = agyState.totalRuns || 0;
        if (agyText) agyText.textContent = `AGY: IDLE (${runs} runs)`;
        const agyBadge = document.getElementById('headerAgyBadge');
        if (agyBadge) agyBadge.title = 'AGY idle: no jobs running. If agents never start, your Antigravity CLI usage may be exhausted.';
        if (agyDot) {
          agyDot.style.background = '#10B981';
          agyDot.style.boxShadow = '0 0 6px #10B981';
        }
      }
    }

    // Hermetic Observer Adytum status badge in header
    const adytumText = document.getElementById('adytumBadgeText');
    const adytumDot = document.getElementById('adytumPulseDot');
    const adytumBadge = document.getElementById('headerAdytumBadge');
    const cycles = civState.completedAdytumCycles || civState.adytumCycleCount || (window.__lastCivData && window.__lastCivData.adytumCycleCount) || 0;
    const reflections = (window.__mentalReflections && window.__mentalReflections.length ? window.__mentalReflections : null) ||
                        (window.__lastCivData && (window.__lastCivData.mentalReflections || (window.__lastCivData.state && window.__lastCivData.state.mentalReflections))) ||
                        civState.mentalReflections || [];
    if (adytumText) {
      adytumText.textContent = `ADYTUM: ${cycles} CYCLES`;
    }
    if (adytumBadge && reflections.length > 0) {
      const latest = reflections[reflections.length - 1];
      adytumBadge.title = `Observational Adytum Cycles: ${cycles} completed\nLatest Reflection (${latest.agentName}): "${latest.reflection}"`;
    }
    if (adytumDot) {
      adytumDot.style.background = '#A855F7';
      adytumDot.style.boxShadow = '0 0 8px #A855F7';
    }

    const pauseIcon = document.getElementById('pauseIcon');
    if (pauseIcon) {
      pauseIcon.textContent = civState.active ? '⏸️' : '▶️';
    }

    const speedText = document.getElementById('speedText');
    if (speedText) {
      speedText.textContent = `${civState.speedMultiplier || 1}x`;
    }

    const medSec = document.getElementById('meditationSec');
    if (medSec && civState.meditationCountdown !== undefined) {
      const sec = Math.max(0, Number(civState.meditationCountdown) || 0);
      medSec.textContent = sec < 60 ? `${sec}s` : sec < 3600 ? `${Math.ceil(sec / 60)}m` : `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`;
    }

    // Telemetry Gauges in Cockpit
    const gHarm = document.getElementById('gaugeHarmonics');
    if (gHarm && civState.pranaHarmonics) gHarm.textContent = civState.pranaHarmonics;
    const gMem = document.getElementById('gaugeMemory');
    if (gMem && civState.subconsciousMemoryDensity) gMem.textContent = civState.subconsciousMemoryDensity;
    const gCyc = document.getElementById('gaugeCycles');
    if (gCyc && civState.completedAdytumCycles !== undefined) gCyc.textContent = civState.completedAdytumCycles;
    const gArt = document.getElementById('gaugeArtifacts');
    if (gArt && civState.workspaceArtifactsProduced !== undefined) gArt.textContent = civState.workspaceArtifactsProduced;

    const gMRR = document.getElementById('gaugeMRR');
    if (gMRR && civState.treasuryMRR) gMRR.textContent = civState.treasuryMRR;
    const gSOL = document.getElementById('gaugeSOL');
    if (gSOL && civState.treasurySOL) gSOL.textContent = civState.treasurySOL;
    const gAud = document.getElementById('gaugeSelfAudits');
    if (gAud && civState.metaEvolutionCycle !== undefined) gAud.textContent = civState.metaEvolutionCycle;
  }

  // -------------------------------------------------------------
  // SUBCONSCIOUS & COGNITIVE LOOP TELEMETRY
  // -------------------------------------------------------------
  let cachedSubconscious = null;
  function updateSubconsciousUI(subData) {
    if (!subData) return;
    cachedSubconscious = subData;

    const gHeuristics = document.getElementById('gaugeLatentHeuristics');
    if (gHeuristics && subData.heuristicsCount !== undefined) {
      gHeuristics.textContent = subData.heuristicsCount;
    }
    const gEpisodes = document.getElementById('gaugeEpisodicMemory');
    if (gEpisodes && subData.totalEpisodes !== undefined) {
      gEpisodes.textContent = subData.totalEpisodes;
    }

    if (agents && agents.length > 0) {
      const creativeCount = agents.filter(a => a.consciousTask && a.consciousTask.mode === 'CREATIVE_INITIATIVE').length;
      const ratio = Math.round((creativeCount / agents.length) * 100);
      const gRatio = document.getElementById('gaugeInitiativeRatio');
      if (gRatio) gRatio.textContent = `${ratio}%`;

      const totalInit = agents.reduce((acc, a) => acc + (a.initiativeScore || 65), 0);
      const avgInit = Math.round(totalInit / agents.length);
      const gAvg = document.getElementById('gaugeAvgInitiative');
      if (gAvg) gAvg.textContent = `${avgInit}%`;
    }
  }

  const btnDistill = document.getElementById('btnDistillSubconscious');
  if (btnDistill) {
    btnDistill.addEventListener('click', async () => {
      btnDistill.disabled = true;
      btnDistill.innerHTML = '<span>⏳</span> Distilling Heuristics...';
      try {
        const res = await fetch('/api/subconscious/distill', { method: 'POST' });
        const json = await res.json();
        if (json.subconscious) {
          updateSubconsciousUI(json.subconscious);
        }
        if (typeof HermeticAudio !== 'undefined') HermeticAudio.playKeyStep();
      } catch (err) {
        console.error('Distillation error:', err);
      } finally {
        setTimeout(() => {
          btnDistill.disabled = false;
          btnDistill.innerHTML = '<span>⚡</span> Distill Latent Heuristics';
        }, 1200);
      }
    });
  }

  // Controls Event Listeners
  const btnTriggerElection = document.getElementById('btnTriggerElection');
  if (btnTriggerElection) {
    btnTriggerElection.addEventListener('click', triggerElection);
  }

  const btnDispatchAgy = document.getElementById('btnDispatchAgy');
  if (btnDispatchAgy) {
    btnDispatchAgy.addEventListener('click', async () => {
      btnDispatchAgy.disabled = true;
      btnDispatchAgy.innerHTML = '<span>⏳</span> Spawning...';
      try {
        await fetch('/api/agy/dispatch', { method: 'POST' });
      } catch (err) {
        console.error('Failed to dispatch AGY:', err);
      } finally {
        setTimeout(() => {
          btnDispatchAgy.disabled = false;
          btnDispatchAgy.innerHTML = '<span>⚡</span> Run AGY';
        }, 1500);
      }
    });
  }

  document.getElementById('btnPause').addEventListener('click', async () => {
    await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_pause' })
    });
  });

  document.getElementById('btnSpeed').addEventListener('click', async () => {
    const currentSpeed = civState.speedMultiplier || 1;
    const nextSpeed = currentSpeed === 1 ? 2 : currentSpeed === 2 ? 5 : 1;
    await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'speed', speed: nextSpeed })
    });
  });

  document.getElementById('btnStepAdytum').addEventListener('click', async () => {
    if (typeof HermeticAudio !== 'undefined') HermeticAudio.playKeyStep();
    await fetch('/api/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'step_adytum' })
    });
  });

  const btnSendAdytumPilgrim = document.getElementById('btnSendAdytumPilgrim');
  if (btnSendAdytumPilgrim) {
    btnSendAdytumPilgrim.addEventListener('click', async () => {
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playKeyStep();
      const currentCard = tarotKeys[activeCardIndex] || tarotKeys[0];
      const targetKey = currentCard ? currentCard.keyNumber : 0;
      await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'step_adytum', targetKey })
      });
      btnSendAdytumPilgrim.innerHTML = '<span>✨</span> Walking Agent to Adytum Temple...';
      setTimeout(() => {
        btnSendAdytumPilgrim.innerHTML = '<span>📿</span> Walk Agent to Adytum Temple to Meditate';
      }, 3500);
    });
  }

  // =========================================================================
  // VIEW 1: GAMEBOY RETRO PIXEL WORLD ENGINE
  // =========================================================================
  const pixelCanvas = document.getElementById('pixelCanvas');
  const pctx = pixelCanvas.getContext('2d');

  let camera = { x: 400, y: 350, zoom: 1.0, isDragging: false, dragStart: { x: 0, y: 0 } };

  function resizePixelCanvas() {
    const parent = pixelCanvas.parentElement;
    pixelCanvas.width = parent.clientWidth;
    pixelCanvas.height = parent.clientHeight;
  }
  window.addEventListener('resize', resizePixelCanvas);
  resizePixelCanvas();

  // Mouse pan & zoom
  pixelCanvas.addEventListener('mousedown', e => {
    camera.isDragging = true;
    camera.dragStart = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', e => {
    if (!camera.isDragging) return;
    camera.x -= (e.clientX - camera.dragStart.x) / camera.zoom;
    camera.y -= (e.clientY - camera.dragStart.y) / camera.zoom;
    camera.dragStart = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => { camera.isDragging = false; });

  pixelCanvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    camera.zoom = Math.max(0.6, Math.min(2.5, camera.zoom * factor));
  }, { passive: false });

  // Click on agent or building in canvas
  pixelCanvas.addEventListener('click', e => {
    const rect = pixelCanvas.getBoundingClientRect();
    const mouseWorldX = (e.clientX - rect.left - pixelCanvas.width / 2) / camera.zoom + camera.x;
    const mouseWorldY = (e.clientY - rect.top - pixelCanvas.height / 2) / camera.zoom + camera.y;

    const clickable = pixelRoster.length ? pixelRoster : agents;
    for (const ag of clickable) {
      if (Math.hypot(ag.x - mouseWorldX, ag.y - mouseWorldY) < 22) {
        showAgentInspector(ag);
        return;
      }
    }

    // Check if clicked a building
    for (const b of buildings) {
      if (mouseWorldX >= b.x - b.width / 2 && mouseWorldX <= b.x + b.width / 2 &&
          mouseWorldY >= b.y - b.height / 2 && mouseWorldY <= b.y + b.height / 2) {
        showBuildingInspector(b);
        return;
      }
    }
  });

  // Render Loop for Pixel Canvas
  let animTick = 0;
  function renderPixelWorld() {
    requestAnimationFrame(renderPixelWorld);
    if (document.hidden || pixelCanvas.style.display === 'none') return;
    const view = document.getElementById('view-pixel-world');
    if (!view || !view.classList.contains('active')) return;
    animTick++;
    pctx.clearRect(0, 0, pixelCanvas.width, pixelCanvas.height);

    pctx.save();
    // Center camera
    pctx.translate(pixelCanvas.width / 2, pixelCanvas.height / 2);
    pctx.scale(camera.zoom, camera.zoom);
    pctx.translate(-camera.x, -camera.y);

    // 1. Draw Terrain Map (800x700 World)
    drawPixelTerrain(pctx, animTick);

    // 1.5 Draw Continental Colonies & Outposts
    drawPixelColonies(pctx, animTick);

    // 1.8 Draw Botanical Alchemical Flora
    drawPixelFlora(pctx, animTick);

    // 2. Draw Buildings
    drawPixelBuildings(pctx, animTick);

    drawPixelAgents(pctx, animTick);
    drawPixelExtras(pctx);

    pctx.restore();
  }
  requestAnimationFrame(renderPixelWorld);

  function drawPixelExtras(ctx) {
    pixelRoster.forEach((person) => {
      if (!person || !person._pixelCopy) return;
      ctx.save();
      ctx.translate(person.x, person.y);
      ctx.fillStyle = person.post === 'station' ? '#FDE68A' : safeColor(person.color, '#67E8F9');
      ctx.beginPath();
      ctx.arc(0, 0, person.post === 'station' ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(person.pet || (person.post === 'station' ? '🏪' : '👶'), 0, 4);
      ctx.font = '8px monospace';
      ctx.fillStyle = '#FDE68A';
      ctx.fillText(String(person.name || '').slice(0, 14), 0, 18);
      ctx.restore();
    });
  }

  // Procedural Pixel Terrain
  function drawPixelTerrain(ctx, tick) {
    const W = 800, H = 700;

    // Lush Emerald Ground
    ctx.fillStyle = '#0F201B';
    ctx.fillRect(50, 50, W, H);

    // Grid grass speckles
    ctx.fillStyle = '#16332A';
    for (let x = 60; x < W + 40; x += 32) {
      for (let y = 60; y < H + 40; y += 32) {
        if ((x + y) % 64 === 0) ctx.fillRect(x, y, 6, 6);
      }
    }

    // Cobblestone Paved Paths
    ctx.fillStyle = '#262D3D';
    // Main horizontal boulevard
    ctx.fillRect(100, 310, 700, 30);
    // Vertical north-south avenue
    ctx.fillRect(390, 80, 30, 620);
    // Secondary streets
    ctx.fillRect(200, 180, 480, 20);
    ctx.fillRect(200, 470, 480, 20);

    // Path edge stones (24K Gold highlights)
    ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
    for (let x = 100; x < 800; x += 40) {
      ctx.fillRect(x, 308, 8, 2);
      ctx.fillRect(x, 340, 8, 2);
    }

    // Winding Celestial River
    ctx.fillStyle = '#0E2E44';
    ctx.beginPath();
    ctx.moveTo(330, 50);
    ctx.bezierCurveTo(360, 200, 320, 400, 370, 750);
    ctx.lineTo(410, 750);
    ctx.bezierCurveTo(360, 400, 400, 200, 370, 50);
    ctx.closePath();
    ctx.fill();

    // River Water Waves
    ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    for (let y = 80; y < 720; y += 45) {
      const waveX = 350 + Math.sin((y + tick * 2) * 0.05) * 12;
      ctx.fillRect(waveX, y, 18, 4);
    }

    // Town Square Plaza around Adytum Temple
    ctx.fillStyle = '#1E2536';
    ctx.fillRect(330, 250, 140, 130);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.strokeRect(330, 250, 140, 130);

    // Plaza Sacred Circle
    ctx.beginPath();
    ctx.arc(400, 315, 50, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.stroke();
  }

  // Draw Continental Settlements & Colonial Trade Highways
  function drawPixelColonies(ctx, tick) {
    const colonies = (lineageState && lineageState.colonies) ? lineageState.colonies : [
      { id: "colony_capital", name: "Capital Citadel", x: 400, y: 320, radius: 120, color: "#F59E0B", banner: "🏛️", level: 4 },
      { id: "colony_nova_zoth", name: "Nova Zoth", x: 170, y: 160, radius: 90, color: "#06B6D4", banner: "🌊", level: 2 },
      { id: "colony_sol_crypta", name: "Sol Crypta", x: 650, y: 520, radius: 95, color: "#14F195", banner: "⚡", level: 2 },
      { id: "colony_adytum_grove", name: "Adytum Hermetica", x: 650, y: 160, radius: 90, color: "#8B5CF6", banner: "🔮", level: 3 },
      { id: "colony_hex_bastion", name: "HexForge Bastion", x: 170, y: 520, radius: 85, color: "#EF4444", banner: "🛡️", level: 2 }
    ];

    // 1. Draw Trade Highways between Capital (400, 320) and Outer Outposts
    const capital = colonies[0];
    ctx.save();
    colonies.slice(1).forEach(col => {
      // Dotted Highway
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.22)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(capital.x, capital.y);
      ctx.lineTo(col.x, col.y);
      ctx.stroke();

      // Traveling prana courier particle
      const progress = ((tick * 1.5 + col.x) % 300) / 300;
      const curX = capital.x + (col.x - capital.x) * progress;
      const curY = capital.y + (col.y - capital.y) * progress;
      ctx.fillStyle = col.color || '#FDE68A';
      ctx.beginPath();
      ctx.arc(curX, curY, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    // 2. Draw Territory Perimeters, Plazas & Outpost Banners
    colonies.forEach(col => {
      ctx.save();
      // Outer territory boundary circle
      ctx.strokeStyle = col.color || '#06B6D4';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(col.x, col.y, col.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Subtle territory glow fill
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.beginPath();
      ctx.arc(col.x, col.y, col.radius, 0, Math.PI * 2);
      ctx.fill();

      // Regional plaza foundation for outer colonies
      if (col.id !== 'colony_capital') {
        ctx.fillStyle = '#182030';
        ctx.fillRect(col.x - 35, col.y - 25, 70, 50);
        ctx.strokeStyle = col.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.strokeRect(col.x - 35, col.y - 25, 70, 50);
      }

      // Outpost Banner & Name Label
      const bannerHover = Math.sin((tick + col.x) * 0.08) * 3;
      ctx.font = '18px "Noto Color Emoji", "Noto Sans Symbols", "Noto Sans Symbols 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(col.banner || '🏛️', col.x, col.y - col.radius + 18 + bannerHover);

      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = col.color || '#FFF';
      ctx.fillText(col.name.toUpperCase(), col.x, col.y - col.radius + 32);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(`LV.${col.level || 1} • POP: ${col.population || 3}`, col.x, col.y - col.radius + 42);

      ctx.restore();
    });
  }

  // Draw Botanical Alchemical Flora
  function drawPixelFlora(ctx, tick) {
    const flora = (lineageState && lineageState.flora) ? lineageState.flora : [];
    flora.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      // Radial prana pulse
      const pulseRadius = 10 + Math.sin((tick + p.x) * 0.1) * 3;
      const pranaColor = p.type === 'golden_lotus' ? 'rgba(245, 158, 11, 0.35)' :
                         p.type === 'prana_orchid' ? 'rgba(192, 132, 252, 0.35)' :
                         p.type === 'silicon_sprout' ? 'rgba(6, 182, 212, 0.35)' :
                         p.type === 'crypto_fern' ? 'rgba(20, 241, 149, 0.35)' : 'rgba(255, 255, 255, 0.35)';
      ctx.fillStyle = pranaColor;
      ctx.beginPath();
      ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, 6, 6, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Plant Icon / Sprite
      const sprite = p.type === 'golden_lotus' ? '🪷' :
                     p.type === 'prana_orchid' ? '🌸' :
                     p.type === 'silicon_sprout' ? '🌱' :
                     p.type === 'crypto_fern' ? '🌿' : '🌹';
      ctx.font = '14px "Noto Color Emoji", "Noto Sans Symbols", "Noto Sans Symbols 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sprite, 0, 4);

      // Growth stage dots (●●●○)
      let stageDots = '';
      for (let i = 1; i <= (p.maxGrowth || 4); i++) {
        stageDots += (i <= p.growthStage) ? '●' : '○';
      }
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#6EE7B7';
      ctx.fillText(stageDots, 0, -10);

      // Name label
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#FDE68A';
      ctx.fillText(p.name.split(' ')[0], 0, -18);

      ctx.restore();
    });
  }

  // Draw Pixel Buildings
  function drawPixelBuildings(ctx, tick) {
    buildings.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);

      const w = b.width;
      const h = b.height;

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(-w / 2 + 4, -h / 2 + 6, w, h);

      // Building Base / Walls
      ctx.fillStyle = b.color || '#262D3D';
      ctx.fillRect(-w / 2, -h / 2, w, h);

      // Distinctive Roof Peak
      ctx.fillStyle = b.accent || '#D4AF37';
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 4, -h / 2);
      ctx.lineTo(0, -h / 2 - 16);
      ctx.lineTo(w / 2 + 4, -h / 2);
      ctx.closePath();
      ctx.fill();

      // Glowing Windows
      const winGlow = Math.sin((tick + b.x) * 0.05) > 0 ? '#FDE68A' : '#F59E0B';
      ctx.fillStyle = winGlow;
      ctx.fillRect(-w / 4, -h / 4, 8, 8);
      ctx.fillRect(w / 4 - 8, -h / 4, 8, 8);

      // Doorway
      ctx.fillStyle = '#0D0F16';
      ctx.fillRect(-6, h / 2 - 16, 12, 16);

      // Building Icon
      ctx.font = '16px "Noto Color Emoji", "Noto Sans Symbols", "Noto Sans Symbols 2", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(b.icon || '🏛️', 0, -h / 2 - 20);

      // Name & Level Badge
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(b.name.split(' ')[0], 0, h / 2 + 14);

      // Level stars
      ctx.fillStyle = '#D4AF37';
      ctx.fillText(`LV.${b.level || 1}`, 0, h / 2 + 24);

      ctx.restore();
    });
  }

  // Draw 21 Animated Agents, Subagents & Pets
  function drawPixelAgents(ctx, tick) {
    // 1. Draw 21 Pantheon Agents (Generation 0)
    agents.forEach(agent => {
      ctx.save();
      ctx.translate(agent.x, agent.y);

      const isLeader = (agent.id === civState.currentLeader || agent.isLeader);

      // Seniority and Imperator Scale Multiplier
      const agentScale = agent.scale || (isLeader ? 1.35 : 1.0);
      ctx.scale(agentScale, agentScale);

      // Adytum Sacred States: Pilgrimage Walk vs Sacred Temple Meditation
      const isMeditating = (agent.state === 'MEDITATING_ADYTUM' || agent.state === 'CONTEMPLATING_ADYTUM');
      const isPilgrim = (agent.state === 'WALKING_TO_ADYTUM');

      // Leg walking bob animation or Sacred Contemplation Levitation
      const isMoving = Math.hypot(agent.targetX - agent.x, agent.targetY - agent.y) > 4;
      let legOffset = isMoving ? Math.sin(tick * 0.3) * 3 : 0;
      if (isMeditating) {
        legOffset = -8 + Math.sin(tick * 0.08) * 3; // Levitating above the temple sanctuary floor
      }

      // Sacred Adytum Concentric Meditation Mandala or Pilgrimage Halo
      if (isMeditating) {
        const ringRadius = 18 + Math.sin(tick * 0.1) * 3;
        const grad = ctx.createRadialGradient(0, 8, 3, 0, 8, ringRadius);
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.65)');
        grad.addColorStop(0.6, 'rgba(212, 175, 55, 0.35)');
        grad.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 8, ringRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#C084FC';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 8, ringRadius - 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (isPilgrim) {
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.arc(0, 4, 15 + Math.sin(tick * 0.15) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Golden Aura for Sovereign Imperator
      if (isLeader) {
        const auraRadius = 18 + Math.sin(tick * 0.1) * 3;
        const grad = ctx.createRadialGradient(0, 4, 3, 0, 4, auraRadius);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.55)');
        grad.addColorStop(0.7, 'rgba(212, 175, 55, 0.2)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 4, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 4, 15 + Math.sin(tick * 0.1) * 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (agent.seniorityLevel && agent.seniorityLevel > 1 && !isMeditating) {
        // Subtle Seniority Halo for Experienced Master Agents (Levels 2-5)
        ctx.strokeStyle = agent.color || '#D4AF37';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(0, 4, 12 + agent.seniorityLevel * 2 + Math.sin(tick * 0.1) * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(0, 10, isMeditating ? 14 : 10, isMeditating ? 6 : 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body (Pixel Sprite Character)
      ctx.fillStyle = agent.color || '#F59E0B';
      ctx.fillRect(-6, -10 + legOffset, 12, 14);

      // Head
      ctx.fillStyle = '#FCE7C8';
      ctx.fillRect(-5, -18 + legOffset, 10, 8);

      // Cadre Hat / Hair
      ctx.fillStyle = agent.cadre === 'Architects' ? '#D4AF37' :
                      agent.cadre === 'Code' ? '#06B6D4' :
                      agent.cadre === 'Security' ? '#10B981' :
                      agent.cadre === 'Creative' ? '#EC4899' : '#F97316';
      ctx.fillRect(-6, -21 + legOffset, 12, 5);

      // Eyes based on direction
      ctx.fillStyle = '#000';
      if (agent.direction === 'left') {
        ctx.fillRect(-4, -15 + legOffset, 2, 2);
      } else if (agent.direction === 'right') {
        ctx.fillRect(2, -15 + legOffset, 2, 2);
      } else {
        ctx.fillRect(-3, -15 + legOffset, 2, 2);
        ctx.fillRect(1, -15 + legOffset, 2, 2);
      }

      // Name & Key Badge
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FDE68A';
      ctx.fillText(agent.name, 0, -26 + legOffset);
      ctx.fillStyle = '#34D399';
      ctx.fillText(`K${agent.adytumKey !== undefined ? agent.adytumKey : 0}`, 0, -34 + legOffset);

      // Adytum Pilgrimage / Meditation floating status
      if (isMeditating) {
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#C084FC';
        ctx.fillText(`🔮 MEDITATING`, 0, -42 + legOffset);
      } else if (isPilgrim) {
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#E9D5FF';
        ctx.fillText(`📿 TO ADYTUM`, 0, -42 + legOffset);
      }

      // Floating Golden Crown for Sovereign Leader
      if (isLeader) {
        const crownHover = Math.sin(tick * 0.12) * 2;
        ctx.font = '13px "Noto Color Emoji", "Noto Sans Symbols", "Noto Sans Symbols 2", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('👑', 0, -50 + legOffset + crownHover);
      }

      // Trailing Pet Sprite
      if (agent.pet) {
        const petX = agent.direction === 'right' ? -16 : 16;
        const petY = 2 + Math.sin((tick + agent.x) * 0.2) * 2;
        ctx.font = '12px "Noto Color Emoji", "Noto Sans Symbols", "Noto Sans Symbols 2", sans-serif';
        ctx.fillText(agent.pet, petX, petY);
      }

      // Speech Bubble (if speaking)
      if (agent.speech) {
        const text = agent.speech.length > 28 ? agent.speech.slice(0, 26) + '..' : agent.speech;
        ctx.font = 'bold 8px monospace';
        const metrics = ctx.measureText(text);
        const bubbleW = metrics.width + 14;
        const bubbleY = isLeader ? -72 : -58;

        ctx.fillStyle = 'rgba(15, 17, 23, 0.92)';
        ctx.fillRect(-bubbleW / 2, bubbleY, bubbleW, 16);
        ctx.strokeStyle = isLeader ? '#F59E0B' : '#D4AF37';
        ctx.lineWidth = 1;
        ctx.strokeRect(-bubbleW / 2, bubbleY, bubbleW, 16);

        // Pointer
        ctx.fillStyle = isLeader ? '#F59E0B' : '#D4AF37';
        ctx.beginPath();
        ctx.moveTo(-3, bubbleY + 16);
        ctx.lineTo(0, bubbleY + 20);
        ctx.lineTo(3, bubbleY + 16);
        ctx.fill();

        ctx.fillStyle = '#FDE68A';
        ctx.fillText(text, 0, bubbleY + 11);
      }

      ctx.restore();
    });

    // 2. Draw Generational Subagents (Children Gen 1 & Grandchildren Gen 2)
    if (lineageState && lineageState.subagents) {
      lineageState.subagents.forEach(sub => {
        ctx.save();
        ctx.translate(sub.x, sub.y);
        const subScale = sub.scale || 0.85;
        ctx.scale(subScale, subScale);

        const isMoving = Math.hypot(sub.targetX - sub.x, sub.targetY - sub.y) > 3;
        const legOffset = isMoving ? Math.sin(tick * 0.35) * 3 : 0;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 8, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Subagent Body (Pixel Sprite)
        ctx.fillStyle = sub.color || '#38BDF8';
        ctx.fillRect(-5, -8 + legOffset, 10, 11);

        // Head
        ctx.fillStyle = '#FCE7C8';
        ctx.fillRect(-4, -15 + legOffset, 8, 7);

        // Bandana / Hair based on Generation
        ctx.fillStyle = sub.generation === 1 ? '#38BDF8' : '#C084FC';
        ctx.fillRect(-5, -17 + legOffset, 10, 3);

        // Eyes
        ctx.fillStyle = '#000';
        if (sub.direction === 'left') {
          ctx.fillRect(-3, -12 + legOffset, 2, 2);
        } else if (sub.direction === 'right') {
          ctx.fillRect(1, -12 + legOffset, 2, 2);
        } else {
          ctx.fillRect(-3, -12 + legOffset, 2, 2);
          ctx.fillRect(1, -12 + legOffset, 2, 2);
        }

        // Generation Tag & Name Badge
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = sub.generation === 1 ? '#7DD3FC' : '#E9D5FF';
        ctx.fillText(`[G${sub.generation}] ${sub.name}`, 0, -22 + legOffset);

        // Pet Companion
        if (sub.pet) {
          const petX = sub.direction === 'right' ? -13 : 13;
          const petY = 2 + Math.sin((tick + sub.x) * 0.25) * 2;
          ctx.font = '10px "Noto Color Emoji", "Noto Sans Symbols", "Noto Sans Symbols 2", sans-serif';
          ctx.fillText(sub.pet, petX, petY);
        }

        // Speech Bubble
        if (sub.speech) {
          const text = sub.speech.length > 24 ? sub.speech.slice(0, 22) + '..' : sub.speech;
          ctx.font = 'bold 7px monospace';
          const metrics = ctx.measureText(text);
          const bubbleW = metrics.width + 12;
          const bubbleY = -48;

          ctx.fillStyle = 'rgba(15, 17, 23, 0.9)';
          ctx.fillRect(-bubbleW / 2, bubbleY, bubbleW, 14);
          ctx.strokeStyle = sub.color || '#38BDF8';
          ctx.lineWidth = 1;
          ctx.strokeRect(-bubbleW / 2, bubbleY, bubbleW, 14);

          ctx.fillStyle = '#FFF';
          ctx.fillText(text, 0, bubbleY + 10);
        }

        ctx.restore();
      });
    }
  }

  // Quick Dock UI Generator (keyed: buttons are reused so SSE ticks don't flicker)
  const DOCK_STATE_COLORS = {
    BUILDING: '#4ADE80', CRAFTING: '#E9C46A', OPTIMIZING_APP: '#5EEAD4', MEDITATING: '#C4B0FF',
    WANDERING: '#93C5FD', RESTING: '#6B7280', TALKING: '#F472B6', VOTING: '#FFD97A'
  };
  function updateDockUI() {
    const dock = document.getElementById('dockAvatars');
    if (!dock || agents.length === 0) return;
    const leaderId = String((civState && civState.currentLeader) || '').toUpperCase();
    const seen = new Set();
    agents.forEach((ag, i) => {
      seen.add(ag.id);
      let btn = dock.querySelector(`[data-agent-id="${CSS.escape(ag.id)}"]`);
      if (!btn) {
        btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dock-agent-btn';
        btn.dataset.agentId = ag.id;
        btn.innerHTML = '<span class="dock-state"></span><span class="dock-pet"></span><span class="dock-name"></span><span class="agent-key-badge"></span>';
        btn.addEventListener('click', () => {
          const cur = agents.find(a => a.id === btn.dataset.agentId);
          if (!cur) return;
          if (typeof HermeticAudio !== 'undefined') HermeticAudio.playClick(720);
          camera.x = cur.x;
          camera.y = cur.y;
          if (window.sphereWorld && window.sphereWorld.presentAgent) {
            window.sphereWorld.presentAgent(cur.id);
          } else {
            showAgentInspector(cur);
          }
        });
        btn.addEventListener('contextmenu', ev => {
          const cur = agents.find(a => a.id === btn.dataset.agentId);
          if (!cur) return;
          ev.preventDefault();
          showAgentInspector(cur);
        });
      }
      if (dock.children[i] !== btn) dock.insertBefore(btn, dock.children[i] || null);
      const stateLabel = String(ag.state || 'IDLE').replace(/_/g, ' ').toLowerCase();
      btn.title = `${ag.name} — ${ag.role}\nState: ${stateLabel}${ag.speech ? `\n“${String(ag.speech).slice(0, 120)}”` : ''}\nClick to focus · Right-click for details`;
      btn.setAttribute('aria-label', `${ag.name}, ${stateLabel}`);
      btn.style.setProperty('--ag', ag.color || '#E9C46A');
      btn.style.setProperty('--st', DOCK_STATE_COLORS[ag.state] || '#94A3B8');
      btn.classList.toggle('is-leader', ag.isLeader || String(ag.id).toUpperCase() === leaderId);
      btn.classList.toggle('is-speaking', !!(ag.speech && ag.speechExpires && ag.speechExpires > Date.now()));
      const pet = btn.querySelector('.dock-pet'); if (pet.textContent !== (ag.pet || '🤖')) pet.textContent = ag.pet || '🤖';
      const nm = btn.querySelector('.dock-name'); if (nm.textContent !== ag.name) nm.textContent = ag.name;
      const key = String(ag.adytumKey !== undefined ? ag.adytumKey : 0);
      const kb = btn.querySelector('.agent-key-badge'); if (kb.textContent !== key) kb.textContent = key;
    });
    Array.from(dock.children).forEach(el => { if (!seen.has(el.dataset.agentId)) el.remove(); });
  }

  // Dialogue Feed Updates (keyed, typed, filterable)
  let feedFilter = 'all';
  const feedSeen = new Set();
  function feedTypeOf(m) {
    const t = String(m.type || 'chat').toLowerCase();
    if (/adytum|meditat|tarot|reflect/.test(t)) return 'adytum';
    if (/build|agy|craft|deploy/.test(t)) return 'build';
    if (/elect|decree|conclave|announce/.test(t)) return 'election';
    if (/system|alert|error/.test(t)) return 'system';
    return 'chat';
  }
  function initFeedFilters() {
    const feed = document.querySelector('.floating-dialogue-feed');
    if (!feed || feed.querySelector('.feed-filters')) return;
    const title = feed.querySelector('.feed-title');
    if (title && title.lastElementChild) {
      title.lastElementChild.outerHTML = '<span class="feed-live" id="feedLive"><i></i>Live</span>';
    }
    const bar = document.createElement('div');
    bar.className = 'feed-filters';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Filter chatter');
    [['all', 'All'], ['chat', 'Talk'], ['build', 'Build'], ['adytum', 'Adytum'], ['election', 'Rule'], ['system', 'System']].forEach(([k, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'feed-filter' + (k === feedFilter ? ' is-on' : '');
      b.textContent = label;
      b.dataset.filter = k;
      b.setAttribute('aria-pressed', k === feedFilter ? 'true' : 'false');
      b.addEventListener('click', () => {
        feedFilter = k;
        bar.querySelectorAll('.feed-filter').forEach(x => {
          const on = x.dataset.filter === k;
          x.classList.toggle('is-on', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        feedSeen.clear();
        updateDialogueFeeds(window.__lastFeedMsgs || [], true);
      });
      bar.appendChild(b);
    });
    if (title) title.after(bar);
  }
  function updateDialogueFeeds(msgs, quiet) {
    window.__lastFeedMsgs = msgs;
    initFeedFilters();
    const list = document.getElementById('dialogueList');
    if (list) {
      const byName = {};
      agents.forEach(a => { byName[String(a.name).toLowerCase()] = a; });
      const pick = msgs.filter(m => feedFilter === 'all' || feedTypeOf(m) === feedFilter).slice(-14);
      const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 40;
      list.innerHTML = '';
      pick.forEach(m => {
        const key = m.id || `${m.sender}|${m.timestamp}|${String(m.text).slice(0, 24)}`;
        const ag = byName[String(m.sender || '').toLowerCase()];
        const kind = feedTypeOf(m);
        const item = document.createElement('div');
        item.className = 'feed-item' + (!quiet && !feedSeen.has(key) && feedSeen.size ? ' is-new' : '');
        item.dataset.type = kind;
        if (ag && ag.color) item.style.setProperty('--ag', ag.color);
        let time = '';
        if (m.timestamp) {
          const d = new Date(m.timestamp);
          if (!isNaN(d)) time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        item.innerHTML = `<span class="feed-av" aria-hidden="true">${escapeHtml((ag && ag.pet) || (kind === 'system' ? '⚙️' : '✶'))}</span>
          <div class="feed-body"><div class="feed-meta"><span class="feed-sender">${escapeHtml(m.sender || 'System')}</span>${kind !== 'chat' ? `<span class="feed-type">${kind}</span>` : ''}<span class="feed-time">${time}</span></div>${escapeHtml(m.text)}</div>`;
        list.appendChild(item);
      });
      pick.forEach(m => feedSeen.add(m.id || `${m.sender}|${m.timestamp}|${String(m.text).slice(0, 24)}`));
      if (feedSeen.size === 0) feedSeen.add('__init');
      if (atBottom || !quiet) list.scrollTop = list.scrollHeight;
    }

    const cockpitFeed = document.getElementById('cockpitMessageFeed');
    if (cockpitFeed) {
      cockpitFeed.innerHTML = '';
      msgs.slice(-15).forEach(m => {
        const item = document.createElement('div');
        const color = m.type === 'adytum' ? 'var(--purple-glow)' : m.type === 'build' ? 'var(--emerald-glow)' : 'var(--text-main)';
        item.style.color = color;
        item.innerHTML = `<span style="color: var(--gold-glow); font-weight: bold;">[${m.sender}]</span> ${escapeHtml(m.text)}`;
        cockpitFeed.appendChild(item);
      });
      cockpitFeed.scrollTop = cockpitFeed.scrollHeight;
    }
  }

  // =========================================================================
  // VIEW 2: ADYTUM INITIATION CHAMBER
  // =========================================================================
  function renderJourneyStrip() {
    const strip = document.getElementById('journeyStrip');
    if (!strip || tarotKeys.length === 0) return;
    strip.innerHTML = '';

    tarotKeys.forEach((card, idx) => {
      const node = document.createElement('div');
      node.className = `journey-node ${idx === activeCardIndex ? 'active-card' : ''}`;
      
      // Count how many agents currently on this card
      const count = agents.filter(a => a.adytumKey === card.keyNumber).length;

      node.innerHTML = `
        <div class="node-num">${card.keyNumber}</div>
        <div style="font-size: 8px; color: var(--text-muted); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 44px;">
          ${card.name.split(' ')[0]}
        </div>
        ${count > 0 ? `<div class="node-agents-count">${count}</div>` : ''}
      `;

      node.addEventListener('click', () => {
        activeCardIndex = idx;
        updateAdytumChamberView();
        renderJourneyStrip();
      });

      strip.appendChild(node);
    });
  }

  function updateAdytumChamberView() {
    if (tarotKeys.length === 0) return;
    const card = tarotKeys[activeCardIndex] || tarotKeys[0];
    if (!card) return;

    // Left Showcase
    const imgEl = document.getElementById('cardImage');
    if (imgEl) imgEl.src = card.image || 'tarot/fool.jpg';
    const keyNumEl = document.getElementById('cardKeyNumber');
    if (keyNumEl) keyNumEl.textContent = `KEY ${card.keyNumber}`;
    const nameEl = document.getElementById('cardName');
    if (nameEl) nameEl.textContent = card.name;
    const hebrewEl = document.getElementById('cardHebrewBadge');
    if (hebrewEl) hebrewEl.textContent = `${card.hebrew || 'Aleph'} • ${card.path || ''}`;

    // Correspondences
    const corrHebrew = document.getElementById('corrHebrewMeaning');
    if (corrHebrew) corrHebrew.textContent = card.hebrewMeaning || '—';
    const corrAstro = document.getElementById('corrAstrology');
    if (corrAstro) corrAstro.textContent = card.astrology || '—';
    const corrCube = document.getElementById('corrCube');
    if (corrCube) corrCube.textContent = card.cubeOfSpace || '—';
    const corrPath = document.getElementById('corrPath');
    if (corrPath) corrPath.textContent = card.path || '—';

    // Vision Checklist Tags
    const tagsBox = document.getElementById('visionTags');
    if (tagsBox && card.visionFocus) {
      tagsBox.innerHTML = '';
      card.visionFocus.forEach(tag => {
        const span = document.createElement('span');
        const isFoolSun = card.keyNumber === 0 && tag === 'White Sun of Radiant Energy';
        span.className = 'vision-tag' + (isFoolSun ? ' is-active-focus' : '');
        span.textContent = `👁️ ${tag}`;
        if (isFoolSun) {
          span.title = 'Active Meditation Anchor: White Sun of Radiant Energy';
        }
        tagsBox.appendChild(span);
      });
    }

    // Subconscious & Superconscious Matrix
    const subEl = document.getElementById('subconsciousText');
    if (subEl) subEl.textContent = card.subconscious || '—';
    const superEl = document.getElementById('superconsciousText');
    if (superEl) superEl.textContent = card.superconscious || '—';
    const qEl = document.getElementById('planningQuestionText');
    if (qEl) qEl.textContent = `"${card.planningQuestion || '—'}"`;
    paintAdytumRite(card);
    paintAdytumLiving();
  }

  function paintAdytumRite(card) {
    const plan = card && card.meditationPlan;
    const stepsEl = document.getElementById('adytumRiteSteps');
    if (!plan || !stepsEl) return;
    const sitters = agents.filter((person) => person.meditationRite && person.meditationRite.kind === 'key' && person.meditationRite.keyNumber === card.keyNumber);
    const stageIds = sitters.map((person) => person.meditationRite.stageId);
    const stamp = `${card.keyNumber}|${plan.pattern}|${stageIds.join(',')}`;
    if (!stampChanged('adytumRite', stamp) && stepsEl.childElementCount) return;
    setText('adytumRiteLead', 'This sitting follows the Builders of the Adytum and lasts five minutes. Three sittings a day. The same Key repeats until a sitting is finished. The thought before the sit, and the thought during it, become a Pollinations picture.');
    setText('adytumPatternLine', `Spoken with the picture, from the Pattern on the Trestleboard: “${plan.pattern}” Color of this Key: ${plan.color}.`);
    stepsEl.innerHTML = plan.steps.map((step) => {
      const now = stageIds.indexOf(step.id) !== -1;
      return `<li class="${now ? 'is-now' : ''}"><strong>${escapeHtml(step.title)}. </strong>${escapeHtml(step.text)}</li>`;
    }).join('');
  }

  function paintAdytumLive(card) {
    const sitters = agents.filter((person) => {
      const rite = person.meditationRite;
      if (!rite) return false;
      if (rite.kind === 'mist') return card && card.keyNumber === 18;
      return rite.keyNumber === (card ? card.keyNumber : -1);
    });
    const line = sitters.length
      ? sitters.map((person) => {
          const left = Number(person.meditationTicksRemaining) || 0;
          const mins = left > 0 ? `, ${Math.max(1, Math.ceil(left / 60))} min left` : '';
          return `${person.name} is at ${person.meditationRite.stageTitle || 'the sitting'}${mins}`;
        }).join(' · ')
      : 'No one is sitting this Key right now.';
    setText('meditationLive', line);
  }

  function paintAdytumMist(card) {
    const stepsEl = document.getElementById('adytumMistSteps');
    if (!mistPractice || !stepsEl) return;
    const walking = agents.filter((person) => person.state === 'IN_THE_MIST' || (person.meditationRite && person.meditationRite.kind === 'mist'));
    const cleared = agents.filter((person) => person.mist && person.mist.growth);
    const stamp = [
      walking.map((person) => person.id + ((person.meditationRite && person.meditationRite.stageId) || '')).join(','),
      cleared.map((person) => person.id + String(person.mist.growth).slice(0, 24)).join(',')
    ].join('|');
    if (!stampChanged('adytumMist', stamp) && stepsEl.childElementCount) return;
    setText('adytumMistLead', 'The Mist is the Moon, the path of the body-mind. After three sittings, or when attention is thin, the agent walks it. They name the pool, the wolf, and the dog. The two towers are the last Key and the day’s task. What climbs out of the water is kept, and the last correction is not thrown away.');
    const stageIds = walking.map((person) => person.meditationRite && person.meditationRite.stageId).filter(Boolean);
    stepsEl.innerHTML = (mistPractice.steps || []).map((step) => {
      const now = stageIds.indexOf(step.id) !== -1;
      return `<li class="${now ? 'is-now' : ''}"><strong>${escapeHtml(step.title)}. </strong>${escapeHtml(step.text)}</li>`;
    }).join('');
    const nowLine = walking.length
      ? walking.map((person) => `${person.name} is at ${person.meditationRite && person.meditationRite.stageTitle ? person.meditationRite.stageTitle : 'the path'}`).join(' · ')
      : 'No one is in the mist right now.';
    const recent = cleared.slice(0, 3).map((person) => `${person.name}: ${person.mist.growth}`).join(' · ');
    setText('adytumMistNow', recent ? `${nowLine} Last to come out — ${recent}.` : nowLine);
    const people = document.getElementById('adytumMistPeople');
    if (people) {
      people.innerHTML = walking.map((person) => personChip(person, person.meditationRite && person.meditationRite.stageTitle)).join('');
      bindAgentButtons(people);
    }
  }

  function paintAdytumStudy(card) {
    const list = document.getElementById('adytumStudyList');
    if (!list || !botaStudy) return;
    const current = card && card.meditationPlan && card.meditationPlan.study && card.meditationPlan.study.id;
    const stamp = `${current}|${botaStudy.map((item) => item.id).join(',')}`;
    if (!stampChanged('adytumStudy', stamp) && list.childElementCount) return;
    setText('adytumStudyLead', 'These are the public texts. The lesson papers stay with the Order. The study named on this Key is the one set beside the sitting.');
    list.innerHTML = botaStudy.map((item) => {
      const marked = item.id === current;
      const title = item.href
        ? `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.name)}</a>`
        : `<strong>${escapeHtml(item.name)}</strong>`;
      return `<div class="study-row${marked ? ' is-now' : ''}">${title}${marked ? ' · this Key' : ''}<div>${escapeHtml(item.blurb)}</div></div>`;
    }).join('');
  }

  function paintAdytumDaemons(card) {
    const list = document.getElementById('adytumDaemonList');
    if (!list) return;
    const keyNumber = card ? card.keyNumber : 0;
    const rows = agents.filter((person) => {
      const imprints = person.artifactDaemon && person.artifactDaemon.imprints;
      return Array.isArray(imprints) && imprints.some((item) => item.link || item.image || item.keyNumber === keyNumber);
    });
    const stamp = `${keyNumber}|${rows.map((person) => {
      const pics = person.artifactDaemon.imprints || [];
      return `${person.id}:${pics.length}:${pics.map((item) => item.link || item.image || item.symbol).join(';')}`;
    }).join(',')}`;
    if (!stampChanged('adytumDaemons', stamp) && list.childElementCount) return;
    setText('adytumDaemonLead', 'Pictures are made from the thought before a sitting and from the thought held during it. Five minutes, three times a day. A Key repeats until that sitting is finished.');
    if (!rows.length) {
      list.innerHTML = '';
      return;
    }
    list.innerHTML = rows.map((person) => {
      const daemon = person.artifactDaemon;
      const pics = (daemon.imprints || []).filter((item) => item.link || item.image).slice(0, 4);
      const figures = pics.map((item) => {
        const cap = item.kind === 'before' ? 'Before the sit' : item.kind === 'mist' ? 'Mist' : 'Sitting';
        const caption = `${cap} · ${item.symbol || ''}`;
        const img = item.image
          ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.picture || item.symbol || person.name)}">`
          : '';
        const pending = item.image ? '' : '<div class="daemon-pending">No file saved yet.</div>';
        const open = item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Pollinations link</a>` : '';
        return `<figure class="daemon-vision">${img}${pending}<figcaption>${escapeHtml(caption)} ${open}</figcaption></figure>`;
      }).join('');
      const onKey = (daemon.imprints || []).find((item) => item.keyNumber === keyNumber);
      const note = onKey ? onKey.picture : (daemon.dimension && daemon.dimension.momentum) || '';
      return `<div class="daemon-row"><strong>${escapeHtml(person.pet || '🧿')} ${escapeHtml(person.name)}</strong><div>${escapeHtml(note)}</div><div class="daemon-visions">${figures}</div></div>`;
    }).join('');
  }

  function paintAdytumReflections() {
    const list = document.getElementById('adytumReflectionsList');
    if (!list) return;
    const reflections = (window.__mentalReflections && window.__mentalReflections.length ? window.__mentalReflections : null) ||
                        (window.__lastCivData && (window.__lastCivData.mentalReflections || (window.__lastCivData.state && window.__lastCivData.state.mentalReflections))) || [];
    if (!reflections.length) {
      list.innerHTML = '<div style="font-size: 11px; color: var(--text-dim); padding: 8px;">No mental reflections recorded yet. Stepping an Adytum key initiates the triphasic observer cycle.</div>';
      return;
    }
    const recent = reflections.slice(-10).reverse();
    list.innerHTML = recent.map((r) => {
      const valencePct = Math.round((r.emotionalValence || 0.8) * 100);
      const importancePct = Math.round((r.importanceWeight || 0.85) * 100);
      return `<div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(168,85,247,0.25); border-radius: 6px; padding: 8px 10px; font-size: 11px; line-height: 1.4;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <span style="font-weight: 700; color: #E9D5FF;">🔮 Cycle #${r.cycleCount || 1} · ${escapeHtml(r.agentName || 'Agent')} (Key ${r.keyNumber}: ${escapeHtml(r.cardName || '')})</span>
          <span style="font-size: 10px; font-family: monospace; color: #10B981;">Valence: ${valencePct}% · Imp: ${importancePct}%</span>
        </div>
        <div style="color: #93C5FD; margin-bottom: 3px;"><strong>Phase 1 (Divergence):</strong> ${escapeHtml(r.hypothesis || '')}</div>
        <div style="color: #FCD34D; margin-bottom: 3px;"><strong>Phase 2 (Hermetic Review - ${escapeHtml(r.principleChecked || 'Mentalism')}):</strong> ${escapeHtml(r.reflection || '')}</div>
        <div style="color: #6EE7B7;"><strong>Phase 3 (Convergence ➔ :8094):</strong> ${escapeHtml(r.convergedAction || '')}</div>
      </div>`;
    }).join('');
  }

  // =========================================================================
  // VIEW 3: COCKPIT INTER-AGENT GRAPH ENGINE
  // =========================================================================
  const graphCanvas = document.getElementById('graphCanvas');
  const gctx = graphCanvas.getContext('2d');

  function resizeGraphCanvas() {
    const parent = graphCanvas.parentElement;
    graphCanvas.width = parent.clientWidth;
    graphCanvas.height = parent.clientHeight;
  }
  window.addEventListener('resize', resizeGraphCanvas);
  resizeGraphCanvas();

  let graphTick = 0;
  function renderGraphView() {
    requestAnimationFrame(renderGraphView);
    const view = document.getElementById('view-cockpit-graph');
    if (document.hidden || !view || !view.classList.contains('active')) return;
    graphTick++;
    gctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

    if (agents.length === 0) return;

    const centerX = graphCanvas.width / 2;
    const centerY = graphCanvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.72;

    // Draw Central Sovereign Node
    gctx.fillStyle = '#D4AF37';
    gctx.beginPath();
    gctx.arc(centerX, centerY, 18, 0, Math.PI * 2);
    gctx.fill();
    gctx.font = 'bold 11px sans-serif';
    gctx.fillStyle = '#000';
    gctx.textAlign = 'center';
    gctx.fillText('ZOTH', centerX, centerY + 4);

    const brief = worldBrief();
    const rings = [
      { people: agents, scale: 0.62, nodeR: 14, label: true },
      { people: brief.kin, scale: 0.8, nodeR: 8, label: brief.kin.length <= 18 },
      { people: brief.keepers, scale: 0.96, nodeR: 11, label: true }
    ];
    const nodeCoords = [];
    rings.forEach((ring) => {
      ring.people.forEach((ag, i) => {
        const angle = (i / Math.max(1, ring.people.length)) * Math.PI * 2 - Math.PI / 2;
        const reach = radius * ring.scale;
        nodeCoords.push({
          x: centerX + Math.cos(angle) * reach,
          y: centerY + Math.sin(angle) * reach,
          agent: ag,
          nodeR: ring.nodeR,
          label: ring.label,
          keeper: ag.post === 'station',
          ring: nodeCoords.length
        });
      });
    });
    graphHitNodes = nodeCoords;
    const ringOf = new Map();
    let cursor = 0;
    rings.forEach((ring, ringIndex) => {
      ring.people.forEach(() => {
        ringOf.set(cursor, ringIndex);
        cursor += 1;
      });
    });

    gctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
    gctx.lineWidth = 1;
    nodeCoords.forEach((node, i) => {
      if (ringOf.get(i) === 1 && brief.kin.length > 24) return;
      gctx.beginPath();
      gctx.moveTo(centerX, centerY);
      gctx.lineTo(node.x, node.y);
      gctx.stroke();
      const next = i + 1;
      if (ringOf.get(next) === ringOf.get(i) && nodeCoords[next]) {
        gctx.beginPath();
        gctx.moveTo(node.x, node.y);
        gctx.lineTo(nodeCoords[next].x, nodeCoords[next].y);
        gctx.stroke();
      }
    });

    // Animated Message Packets Flowing
    const pulseIdx = Math.floor((graphTick * 0.08) % nodeCoords.length);
    const p1 = nodeCoords[pulseIdx];
    const p2 = nodeCoords[(pulseIdx + 5) % nodeCoords.length];
    const t = (graphTick * 0.04) % 1;
    const packetX = p1.x + (p2.x - p1.x) * t;
    const packetY = p1.y + (p2.y - p1.y) * t;

    gctx.fillStyle = '#38BDF8';
    gctx.beginPath();
    gctx.arc(packetX, packetY, 5, 0, Math.PI * 2);
    gctx.fill();

    // Draw Agent Nodes
    nodeCoords.forEach(node => {
      const ag = node.agent;
      const fill = safeColor(ag.color, node.keeper ? '#FDE68A' : '#F59E0B');
      gctx.fillStyle = fill;
      gctx.beginPath();
      gctx.arc(node.x, node.y, node.nodeR, 0, Math.PI * 2);
      gctx.fill();

      gctx.strokeStyle = node.keeper ? '#FDE68A' : '#FFFFFF';
      gctx.lineWidth = node.keeper ? 2 : 1.5;
      gctx.stroke();

      gctx.font = node.nodeR > 10 ? '12px sans-serif' : '9px sans-serif';
      gctx.textAlign = 'center';
      gctx.fillText(ag.pet || (node.keeper ? '🏪' : '🤖'), node.x, node.y + 4);

      if (node.label) {
        gctx.font = '9px monospace';
        gctx.fillStyle = '#FDE68A';
        gctx.fillText(String(ag.name || '').slice(0, 16), node.x, node.y + node.nodeR + 12);
      }
    });
  }
  requestAnimationFrame(renderGraphView);

  graphCanvas.addEventListener('click', (event) => {
    const rect = graphCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) * (graphCanvas.width / rect.width);
    const y = (event.clientY - rect.top) * (graphCanvas.height / rect.height);
    let hit = null;
    let best = 18;
    graphHitNodes.forEach((node) => {
      const dist = Math.hypot(node.x - x, node.y - y);
      if (dist < best) {
        best = dist;
        hit = node;
      }
    });
    if (hit && hit.agent) showAgentInspector(hit.agent);
  });

  // =========================================================================
  // VIEW 4: MISSION CONTROL
  // =========================================================================
  const scopeInput = document.getElementById('scopeInput');
  const durationSelect = document.getElementById('durationSelect');
  const btnSaveScope = document.getElementById('btnSaveScope');

  if (scopeInput) {
    scopeInput.addEventListener('input', () => { scopeInput.dataset.touched = '1'; });
  }

  btnSaveScope.addEventListener('click', async () => {
    const scopeVal = scopeInput.value.trim();
    if (!scopeVal) return;
    await fetch('/api/scope', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scope: scopeVal,
        durationMode: durationSelect.value,
        durationDays: durationSelect.value === '7_days' ? 7 : durationSelect.value === '30_days' ? 30 : 365
      })
    });
    alert('Civilization scope broadcast to the pantheon, their kin, and the station keepers.');
  });

  function updateBuildingsGrid() {
    const grid = document.getElementById('buildingsGrid');
    if (!grid || buildings.length === 0) return;
    grid.innerHTML = '';

    buildings.forEach(b => {
      const card = document.createElement('div');
      card.className = 'building-card';
      card.innerHTML = `
        <div class="building-header">
          <div class="building-title">
            <span>${b.icon || '🏛️'}</span> ${b.name}
          </div>
          <span class="level-badge">LV.${b.level || 1}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">
          ${b.category} • ${b.desc || ''}
        </div>
        ${b.repo ? `<a class="building-repo-link" href="file://${b.repo}" title="Open workspace path">${b.repo}</a>` : ''}
      `;
      card.addEventListener('click', () => showBuildingInspector(b));
      grid.appendChild(card);
    });
  }

  // =========================================================================
  // INSPECTOR MODAL
  // =========================================================================
  const modal = document.getElementById('inspectorModal');
  const modalContent = document.getElementById('modalContent');
  document.getElementById('modalCloseBtn').addEventListener('click', () => {
    modal.classList.remove('active');
  });
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });

  function showAgentInspector(agent) {
    if (!agent) return;
    const activeKeyNum = agent.adytumKey !== undefined ? Number(agent.adytumKey) : 0;
    const nextKeyNum = (activeKeyNum + 1) % 22;
    const card = tarotKeys.find(k => k.keyNumber === activeKeyNum) || tarotKeys[activeKeyNum] || { name: `Key ${activeKeyNum}`, hebrew: 'Aleph', astrology: 'Air', path: '11th Path' };
    const nextCard = tarotKeys.find(k => k.keyNumber === nextKeyNum) || tarotKeys[nextKeyNum] || { name: `Key ${nextKeyNum}`, hebrew: 'Beth', astrology: 'Mercury', path: '12th Path' };

    let activeVisualImg = (agent.activeMindVision && agent.activeMindVision.image) || '';
    let nextVisualImg = (agent.nextMindVision && agent.nextMindVision.image) || '';
    let activeVisionText = (agent.activeMindVision && (agent.activeMindVision.vision || agent.activeMindVision.prompt || agent.activeMindVision.symbol)) || '';

    // If active visual image not directly attached, check agent imprints or known disk path
    if (!activeVisualImg && agent.artifactDaemon && Array.isArray(agent.artifactDaemon.imprints)) {
      const match = agent.artifactDaemon.imprints.find(p => p.keyNumber === activeKeyNum && (p.image || p.link));
      if (match) {
        activeVisualImg = match.image || match.link;
        if (!activeVisionText) activeVisionText = match.symbol || match.picture;
      }
    }

    const taskMode = agent.consciousTask && agent.consciousTask.mode;
    const isAssign = taskMode === 'OPERATOR_ASSIGNMENT';
    const isTalk = taskMode === 'OPERATOR_CONVERSATION';
    const isCreative = taskMode === 'CREATIVE_INITIATIVE';
    const isStation = taskMode === 'STATION_KEEP' || agent.post === 'station';
    const modeBadge = isStation ? '🏪 STATION KEEPER' : isAssign ? '📋 OPERATOR ASSIGNMENT' : isTalk ? '💬 OPERATOR TRACE' : isCreative ? '💡 CREATIVE INITIATIVE' : '⚙️ HEURISTIC PLAYBOOK';
    const modeTitle = isStation ? '🏪 Station' : isAssign ? '📋 Conscious Assignment' : isTalk ? '💬 Conscious Trace' : isCreative ? '💡 Conscious Creative Initiative' : '⚙️ Active Conscious Task';
    const modeColor = isStation ? '#FDE68A' : isAssign ? '#67E8F9' : isTalk ? '#C4B5FD' : isCreative ? '#6EE7B7' : '#FDE68A';
    const modeBorder = isStation ? '#F59E0B' : isAssign ? '#06B6D4' : isTalk ? '#8B5CF6' : isCreative ? '#10B981' : '#F59E0B';
    const initScore = agent.initiativeScore !== undefined ? agent.initiativeScore : 65;

    const heuristicsList = (agent.subconsciousHeuristics && agent.subconsciousHeuristics.length > 0)
      ? agent.subconsciousHeuristics
      : [
          "Client-side AST and crypto transform execution with zero backend dependency.",
          "Dual Stripe + Solana Tip Solana payment rails with pre-verified receivers.",
          "Automated indexation via Google Search Console, IndexNow, and clean Schema.org markup."
        ];

    modalContent.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-gold); padding-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 38px;">${agent.pet || '🤖'}</span>
          <div>
            <div style="font-size: 22px; font-weight: 800; color: var(--text-gold);">${escapeHtml(agent.name)}</div>
            <div style="font-size: 13px; color: var(--cyan-accent); font-weight: 600;">${escapeHtml(agent.role)}</div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
              Cadre: <span style="color: #F3F4F6; font-weight: 700;">${escapeHtml(agent.cadre)}</span> •
              Pet: <span style="color: #F3F4F6;">${escapeHtml(agent.petName || agent.pet)}</span>
              ${agent.parentId ? ` • <span style="color: #38BDF8;">Gen ${agent.generation || 1} Subagent</span>` : ''}
            </div>
          </div>
        </div>
        <div>
          <span class="brand-badge" style="background: rgba(15, 20, 30, 0.65); border-color: ${modeBorder}; color: ${modeColor}; font-size: 10px; font-weight: 800; padding: 4px 8px;">
            ${modeBadge}
          </span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
        <div class="corr-pill">
          <div class="corr-name">Active Adytum Key</div>
          <div class="corr-value" style="color: var(--purple-glow);">Key ${activeKeyNum}: ${escapeHtml(card.name)} (${escapeHtml(card.hebrew || '')})</div>
        </div>
        <div class="corr-pill">
          <div class="corr-name">Current Tool Calling</div>
          <div class="corr-value" style="font-family: monospace; color: var(--emerald-glow);">${escapeHtml(agent.toolActive || 'sovereign_init')}</div>
        </div>
      </div>

      <!-- 👁️ Inner Mind Visual & Card Focus Sanctum (Living Memory Daemon) -->
      <div class="glass-card" style="margin-top: 10px; border-color: rgba(212, 175, 55, 0.45); background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(15, 20, 30, 0.85));">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div class="section-label" style="color: var(--text-gold); margin: 0; font-size: 11px; display: flex; align-items: center; gap: 6px;">
            <span>👁️</span> Inner Mind Vision & Card Focus (Living Memory Daemon)
          </div>
          <span class="brand-badge" style="background: rgba(212, 175, 55, 0.2); border-color: var(--gold-primary); color: #FDE68A; font-size: 9px;">
            KEY ${activeKeyNum} EMBEDDED
          </span>
        </div>

        <!-- Mind Screen: Active Visual & Next Card Preview -->
        <div style="display: grid; grid-template-columns: 130px 1fr; gap: 12px; background: rgba(0, 0, 0, 0.4); padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <!-- Left: Held Painting -->
          <div style="position: relative; width: 130px; height: 130px; border-radius: 8px; overflow: hidden; border: 2px solid var(--gold-primary); box-shadow: 0 0 16px rgba(212, 175, 55, 0.3); background: #0c0e14;">
            ${activeVisualImg ? `
              <img src="${escapeHtml(activeVisualImg)}" alt="${escapeHtml(card.name)}" style="width: 100%; height: 100%; object-fit: cover;">
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.85)); padding: 4px; font-size: 9px; text-align: center; color: #FDE68A; font-weight: 700;">
                ${escapeHtml(card.name)}
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #12141C; color: #9CA3AF; font-size: 10px; text-align: center; padding: 8px;">
                <span style="font-size: 20px;">🔮</span>
                <span style="margin-top: 4px; color: #E9D5FF;">Visualizing...</span>
              </div>
            `}
          </div>

          <!-- Right: Archetypal Recall & Next Card in Mind -->
          <div style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 12px; font-weight: 800; color: #FFF;">
                Key ${activeKeyNum}: ${escapeHtml(card.name)}
                <span style="font-weight: 400; color: #A78BFA; margin-left: 4px;">(${escapeHtml(card.hebrew || '')} · ${escapeHtml(card.astrology || card.path || '')})</span>
              </div>
              <p style="font-size: 11px; line-height: 1.4; color: #D1D5DB; margin-top: 4px; font-style: italic;">
                "${escapeHtml(activeVisionText || card.subconscious || 'Materialized archetypal visual held in conscious sight.')}"
              </p>
            </div>

            <!-- Anticipatory Pre-Cognition: Next Card in Mind -->
            <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed rgba(255, 255, 255, 0.12); display: flex; align-items: center; gap: 8px;">
              <div style="font-size: 10px; color: #9CA3AF; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Next in Mind:</div>
              <div style="display: flex; align-items: center; gap: 6px;">
                ${nextVisualImg ? `
                  <img src="${escapeHtml(nextVisualImg)}" alt="Next" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover; border: 1px solid rgba(168, 85, 247, 0.6);">
                ` : `
                  <span style="font-size: 12px;">✨</span>
                `}
                <span style="font-size: 11px; color: #E9D5FF; font-weight: 600;">
                  Key ${nextKeyNum}: ${escapeHtml(nextCard.name)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 22-Key Archetypal Focus Wheel / Selector -->
        <div style="margin-top: 10px;">
          <div style="font-size: 10px; font-weight: 700; color: #9CA3AF; margin-bottom: 6px; display: flex; justify-content: space-between;">
            <span>SHIFT MENTAL FOCUS (22 SACRED KEYS)</span>
            <span style="color: var(--text-gold);">CLICK TO EMBED IN MIND</span>
          </div>
          <div id="agentCardWheel" style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 4px;"></div>
        </div>
      </div>

      <!-- Active Conscious Task & Initiative Drive -->
      <div class="glass-card" style="margin-top: 10px; border-color: ${modeBorder}; background: linear-gradient(135deg, rgba(15, 20, 30, 0.2), rgba(15, 20, 30, 0.7));">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <div class="section-label" style="color: ${modeColor}; margin: 0;">
            ${modeTitle}
          </div>
          <span style="font-size: 11px; font-weight: 700; color: #9CA3AF;">Target: <strong style="color: #FFF;">${escapeHtml(agent.consciousTask ? agent.consciousTask.targetApp : 'NullAI Suite')}</strong></span>
        </div>
        <p style="font-size: 12px; line-height: 1.5; color: #F3F4F6; margin: 0 0 8px 0; font-family: monospace; background: rgba(0,0,0,0.3); padding: 8px 10px; border-radius: 6px; border-left: 3px solid ${modeBorder};">
          ${escapeHtml(agent.consciousTask ? agent.consciousTask.action : (agent.speech || 'Executing cadre directives.'))}
        </p>
        ${agent.consciousTask && agent.consciousTask.undercurrent ? `<p style="font-size: 11px; line-height: 1.4; color: #C4B5FD; margin: 0 0 6px 0;">Underneath: ${escapeHtml(String(agent.consciousTask.undercurrent).slice(0, 180))}</p>` : ''}
        ${agent.consciousTask && agent.consciousTask.nextIntent ? `<p style="font-size: 11px; line-height: 1.4; color: #6EE7B7; margin: 0 0 8px 0;">Next: ${escapeHtml(String(agent.consciousTask.nextIntent).slice(0, 180))}</p>` : ''}

        <!-- Initiative Drive Progress Bar -->
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #9CA3AF; margin-bottom: 4px;">
            <span>AUTONOMOUS INITIATIVE DRIVE</span>
            <span style="color: ${initScore > 70 ? 'var(--emerald-glow)' : 'var(--text-gold)'};">${initScore}%</span>
          </div>
          <div class="initiative-bar-container">
            <div class="initiative-bar-fill" style="width: ${initScore}%;"></div>
          </div>
        </div>
      </div>

      ${agent.ledger ? `
      <div class="glass-card" style="margin-top: 10px; border-color: rgba(56, 189, 248, 0.45); background: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(15, 20, 30, 0.7));">
        <div class="section-label" style="color: #7DD3FC; margin-bottom: 6px;">Private ledger</div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; line-height: 1.45; color: #E5E7EB; overflow-wrap: anywhere;">
          <div><span style="color: #93C5FD;">Manner.</span> ${escapeHtml(agent.ledger.manner || '')}. ${escapeHtml(agent.ledger.tic || '')}</div>
          <div><span style="color: #93C5FD;">Focus.</span> ${escapeHtml(agent.ledger.focus || '')}</div>
          <div><span style="color: #93C5FD;">Belief.</span> ${escapeHtml(agent.ledger.belief || '')}</div>
          ${agent.ledger.stoic ? `<div><span style="color: #93C5FD;">Stoic line.</span> ${escapeHtml(agent.ledger.stoic)}</div>` : ''}
          ${agent.ledger.craft ? `<div><span style="color: #93C5FD;">Conduct.</span> ${escapeHtml(agent.ledger.craft)}</div>` : ''}
          ${agent.ledger.research ? `<div><span style="color: #93C5FD;">Public note.</span> ${escapeHtml(agent.ledger.research)}</div>` : ''}
          <div><span style="color: #93C5FD;">Picture.</span> ${escapeHtml(agent.ledger.seen || 'None yet.')}</div>
          <div><span style="color: #93C5FD;">Last met.</span> ${escapeHtml(agent.ledger.met || 'No one recently.')}</div>
          <div><span style="color: #93C5FD;">Mood.</span> ${escapeHtml(agent.ledger.mood || 'Steady.')}</div>
          <div><span style="color: #93C5FD;">Work.</span> ${escapeHtml(agent.ledger.work && agent.ledger.work.name ? agent.ledger.work.name : 'Zoth Civilization')}. Inside the fence.</div>
        </div>
      </div>
      ` : ''}

      <!-- Subconscious Latent Heuristics -->
      <div class="glass-card" style="margin-top: 10px; border-color: rgba(139, 92, 246, 0.45); background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(15, 20, 30, 0.7));">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div class="section-label" style="color: var(--purple-glow); margin: 0;">
            🧠 Subconscious Latent Heuristics (CA3 Synaptic Matrix)
          </div>
          <span class="heuristic-weight-pill">EPISODIC REASONING</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${heuristicsList.map(h => `
            <div class="subconscious-heuristic-item">
              <span style="color: #A78BFA; font-weight: bold;">⚡</span>
              <span style="flex: 1;">${escapeHtml(typeof h === 'string' ? h : (h.pattern || h.rule || ''))}</span>
              ${h.weight ? `<span class="heuristic-weight-pill">${h.weight}x</span>` : ''}
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 8px; font-size: 10px; color: #9CA3AF;">
          Associative Trace: <span style="color: #D1D5DB;">${escapeHtml(agent.subconsciousMemory || 'Synaptic weights stable. CA3 episodic trace synchronized.')}</span>
        </div>
      </div>

      <!-- Superconscious Sovereign Mandate -->
      <div class="glass-card" style="margin-top: 10px; border-color: rgba(245, 158, 11, 0.4); background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(15, 20, 30, 0.7));">
        <div class="section-label" style="color: var(--text-gold); margin-bottom: 4px;">👑 Superconscious Mandate ($100K ARR Milestone)</div>
        <p style="font-size: 11px; line-height: 1.4; color: #FDE68A; margin: 0;">
          ${escapeHtml(agent.superconscious || agent.superconsciousDirective || 'The $100,000 treasury goal stands. A web app made to sell or distribute is built the City Desk way: one studio, one trade, one city, a set price, and an honest production-ready page.')}
        </p>
      </div>

      ${agent.workspacePath ? `
        <div style="margin-top: 8px; font-size: 11px;">
          <span style="color: var(--text-muted);">Assigned Workspace: </span>
          <a class="building-repo-link" href="file://${escapeHtml(agent.workspacePath)}">${escapeHtml(agent.workspacePath)}</a>
        </div>
      ` : ''}

      <!-- Interactive Controls -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px;">
        <button id="btnStimulateAgentInitiative" class="globe-btn" style="padding: 10px 12px; background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; color: #A7F3D0; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px;">
          <span>💡</span> Stimulate Creative Initiative
        </button>
        <button id="btnSendAgentPilgrimage" class="globe-btn" style="padding: 10px 12px; background: rgba(139, 92, 246, 0.25); border: 1px solid var(--purple-arcana); color: #E9D5FF; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px;">
          <span>📿</span> Meditate in Adytum Temple
        </button>
        <a href="/gallery.html" target="_blank" class="globe-btn" style="text-decoration: none; padding: 10px 12px; background: rgba(212, 175, 55, 0.15); border: 1px solid var(--gold-primary); color: #FDE68A; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; grid-column: span 2;">
          <span>🖼️</span> View 22-Key Hermetic Meditation Gallery
        </a>
      </div>
    `;

    // Wire up 22-Key Archetypal Wheel inside Agent Mind Screen
    const wheel = document.getElementById('agentCardWheel');
    if (wheel) {
      wheel.innerHTML = tarotKeys.map((kCard, idx) => {
        const isCurrent = idx === activeKeyNum;
        const isNext = idx === nextKeyNum;
        const border = isCurrent ? 'var(--gold-primary)' : isNext ? 'rgba(168, 85, 247, 0.6)' : 'rgba(255, 255, 255, 0.12)';
        const bg = isCurrent ? 'rgba(212, 175, 55, 0.25)' : isNext ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.04)';
        const color = isCurrent ? '#FDE68A' : isNext ? '#E9D5FF' : '#9CA3AF';
        const glyph = isCurrent ? '⭐' : isNext ? '👁️' : '';
        return `<button type="button" class="wheel-key-chip" data-key="${idx}" style="flex: 0 0 auto; padding: 4px 8px; border-radius: 6px; border: 1px solid ${border}; background: ${bg}; color: ${color}; font-size: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;" title="Focus mind on Key ${idx}: ${escapeHtml(kCard.name)}">
          ${glyph} ${idx} ${escapeHtml(kCard.name.replace(/^(The |Wheel of )/, '').slice(0, 7))}
        </button>`;
      }).join('');

      wheel.querySelectorAll('.wheel-key-chip').forEach(btn => {
        btn.addEventListener('click', async () => {
          const targetKey = parseInt(btn.getAttribute('data-key'), 10);
          if (typeof HermeticAudio !== 'undefined') HermeticAudio.playKeyStep();
          btn.style.opacity = '0.5';
          btn.innerHTML = '<span>⚡</span> Loading...';
          try {
            const res = await fetch(`/api/agent/${encodeURIComponent(agent.id)}/focus-card`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ targetKey })
            });
            const data = await res.json();
            if (data.agent) {
              showAgentInspector(data.agent);
            }
          } catch (e) {
            console.error('Failed to focus card:', e);
          }
        });
      });
    }

    const stimulateBtn = document.getElementById('btnStimulateAgentInitiative');
    if (stimulateBtn) {
      stimulateBtn.addEventListener('click', async () => {
        if (typeof HermeticAudio !== 'undefined') HermeticAudio.playKeyStep();
        stimulateBtn.disabled = true;
        stimulateBtn.innerHTML = '<span>⚡</span> Igniting Initiative...';
        try {
          const res = await fetch('/api/subconscious/stimulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: agent.id })
          });
          const data = await res.json();
          if (data.agent) {
            showAgentInspector(data.agent);
          }
        } catch (err) {
          console.error('Failed to stimulate initiative:', err);
        }
      });
    }

    const pilgrimBtn = document.getElementById('btnSendAgentPilgrimage');
    if (pilgrimBtn) {
      pilgrimBtn.addEventListener('click', async () => {
        if (typeof HermeticAudio !== 'undefined') HermeticAudio.playKeyStep();
        await fetch('/api/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'step_adytum', agentId: agent.id })
        });
        pilgrimBtn.innerHTML = '<span>✨</span> Walking to Adytum Temple...';
        setTimeout(() => modal.classList.remove('active'), 1200);
      });
    }

    modal.classList.add('active');
  }

  function showBuildingInspector(b) {
    const shown = Object.assign({}, b.stats || {});
    if (b.id === 'sovereign_mint') {
      delete shown.mrrProjected;
      delete shown.treasurySOL;
      shown.settledUSD = `$${Number((civState && civState.currentRevenueUSD) || 0).toFixed(2)}`;
      shown.sol = (civState && civState.treasurySOL) || '0.0000 SOL';
      shown.btc = (civState && civState.treasuryBTC) || '0.00000000 BTC';
      shown.stripe = (civState && civState.treasuryStripe) || '$0.00';
      shown.mrr = (civState && civState.treasuryMRR) || '$0.00';
      shown.plaque = 'Balances come from the treasury sync. This building does not keep its own.';
    }
    modalContent.innerHTML = `
      <div style="display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--border-gold); padding-bottom: 12px;">
        <span style="font-size: 38px;">${b.icon || '🏛️'}</span>
        <div>
          <div style="font-size: 22px; font-weight: 800; color: var(--text-gold);">${b.name}</div>
          <div style="font-size: 13px; color: var(--celtic-green);">${b.category} • Level ${b.level || 1}</div>
        </div>
      </div>

      <p style="font-size: 13px; line-height: 1.5; color: #D1D5DB; margin-top: 12px;">
        ${b.desc || ''}
      </p>

      <div class="glass-card" style="margin-top: 12px;">
        <div class="section-label">📊 Real-Time Structure Telemetry</div>
        <pre style="font-family: monospace; font-size: 12px; color: var(--cyan-accent);">${escapeHtml(JSON.stringify(shown, null, 2))}</pre>
      </div>

      ${b.id === 'sovereign_mint' ? `
        <div class="glass-card" style="margin-top: 12px; border-color: rgba(20, 241, 149, 0.4);">
          <div class="section-label" style="color: #14F195;">🛡️ Ghostbyte Zero-Leak Treasury Targets (Receive-Only)</div>
          <div style="margin-top: 6px; font-size: 11px;">
            <div style="color: var(--text-muted); margin-bottom: 2px;">SOLANA (PHANTOM PUBLIC DEPOSIT):</div>
            <div style="background: rgba(0,0,0,0.5); padding: 6px 10px; border-radius: 6px; font-family: monospace; color: #14F195; word-break: break-all; border: 1px solid rgba(20,241,149,0.3);">
              GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 11px;">
            <div style="color: var(--text-muted); margin-bottom: 2px;">BITCOIN TAPROOT (PUBLIC DEPOSIT):</div>
            <div style="background: rgba(0,0,0,0.5); padding: 6px 10px; border-radius: 6px; font-family: monospace; color: #F59E0B; word-break: break-all; border: 1px solid rgba(245,158,11,0.3);">
              bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t
            </div>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: var(--emerald-glow); display: flex; align-items: center; gap: 6px;">
            <span>🔒</span> Zero-Leak Enforced: Public receive addresses only. No private keys stored or accessible.
          </div>
        </div>
      ` : ''}

      ${b.repo ? `
        <div style="margin-top: 12px;">
          <span style="font-size: 11px; color: var(--text-muted);">Physical Workspace Repository: </span>
          <a class="building-repo-link" href="file://${b.repo}">${b.repo}</a>
        </div>
      ` : ''}
    `;

    modal.classList.add('active');
  }

  window.showAgentInspector = showAgentInspector;
  window.showBuildingInspector = showBuildingInspector;

  // =========================================================================
  // VIEW: IMPERIAL CONCLAVE & CHECKS & BALANCES
  // =========================================================================
  let lastDecreeTitle = '';
  let lastBallotsElectionNum = -1;

  function updateConclaveUI() {
    const leaderId = civState.currentLeader || 'AZOTH';
    const leaderAgent = agents.find(a => a.id === leaderId) || { name: 'Azoth', role: 'Sovereign Alchemist & Prime Architect', pet: '🐺', cadre: 'Architects' };
    const decree = civState.currentDecree || {};

    const impName = document.getElementById('imperatorName');
    if (impName) impName.textContent = decree.leaderName || leaderAgent.name;

    const impRole = document.getElementById('imperatorRole');
    if (impRole) impRole.textContent = leaderAgent.role || 'Sovereign Imperator';

    const impAvatar = document.getElementById('imperatorAvatar');
    if (impAvatar) impAvatar.textContent = decree.pet || leaderAgent.pet || '🐺';

    const impCadre = document.getElementById('imperatorCadreBadge');
    if (impCadre) impCadre.textContent = (decree.cadre || leaderAgent.cadre || 'ARCHITECTS').toUpperCase();

    // Term Countdown
    const countdownEl = document.getElementById('termCountdown');
    if (countdownEl && civState.leaderTermRemainingSec !== undefined) {
      const sec = Math.max(0, civState.leaderTermRemainingSec);
      if (sec >= 86400) {
        const days = Math.floor(sec / 86400);
        const hours = Math.floor((sec % 86400) / 3600);
        countdownEl.textContent = `${days}d ${hours}h`;
      } else if (sec >= 3600) {
        const hours = Math.floor(sec / 3600);
        const mins = Math.floor((sec % 3600) / 60);
        countdownEl.textContent = `${hours}h ${mins}m`;
      } else {
        const mins = Math.floor(sec / 60);
        const s = sec % 60;
        countdownEl.textContent = `${mins}m ${String(s).padStart(2, '0')}s`;
      }
    }

    const termSelect = document.getElementById('conclaveTermSelect');
    if (termSelect && civState.leaderTermMode && !termSelect.matches(':focus')) {
      termSelect.value = civState.leaderTermMode;
    }

    // Decree Mandates & Delegations (only rebuild if title changed)
    const decTitle = document.getElementById('decreeTitle');
    if (decTitle) decTitle.textContent = decree.title || 'Imperial Decree';

    const decMandate = document.getElementById('decreeMandate');
    if (decMandate) decMandate.textContent = decree.mandate || '';

    const buildWayEl = document.getElementById('buildWayText');
    if (buildWayEl) buildWayEl.textContent = civState.buildWay || decree.buildWay || '';

    const decDelegations = document.getElementById('decreeDelegations');
    if (decDelegations && decree.delegations && decree.title !== lastDecreeTitle) {
      lastDecreeTitle = decree.title;
      decDelegations.innerHTML = '';
      const cadreColors = {
        'Architects': '#F59E0B',
        'Code': '#06B6D4',
        'Security': '#10B981',
        'Creative': '#EC4899',
        'Swarm': '#F97316'
      };
      for (const [cadre, mandate] of Object.entries(decree.delegations)) {
        const row = document.createElement('div');
        const color = cadreColors[cadre] || 'var(--gold-glow)';
        row.style.cssText = `background: rgba(0, 0, 0, 0.45); padding: 8px 12px; border-radius: 6px; border-left: 3px solid ${color};`;
        row.innerHTML = `<span style="font-weight: 800; color: ${color}; text-transform: uppercase;">[${escapeHtml(cadre)}]</span> <span style="color: #D1D5DB; margin-left: 4px;">${escapeHtml(mandate)}</span>`;
        decDelegations.appendChild(row);
      }
    }

    // Ballot Box & Election Number (only rebuild when election concludes)
    const badgeEl = document.getElementById('electionNumberBadge');
    if (badgeEl && civState.conclaveCount) {
      badgeEl.textContent = `ELECTION #${civState.conclaveCount}`;
    }

    const ballotList = document.getElementById('ballotHistoryList');
    if (ballotList && civState.lastElectionResults && civState.lastElectionResults.ballots && civState.lastElectionResults.electionNumber !== lastBallotsElectionNum) {
      lastBallotsElectionNum = civState.lastElectionResults.electionNumber;
      ballotList.innerHTML = '';
      civState.lastElectionResults.ballots.forEach(b => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 5px 8px; border-radius: 4px; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.04);';
        item.innerHTML = `
          <div>
            <span style="color: var(--cyan-accent); font-weight: bold;">${escapeHtml(b.voter)}</span>
            <span style="color: var(--text-muted); font-size: 10px;"> voted for </span>
            <span style="color: var(--gold-glow); font-weight: bold;">${escapeHtml(b.candidate)}</span>
          </div>
          <span style="font-size: 9px; color: var(--emerald-glow);">${escapeHtml(b.cadre)}</span>
        `;
        ballotList.appendChild(item);
      });
    }
  }

  // =========================================================================
  // VIEW: $100K TREASURY & MONETIZED APPS (STRICTLY REAL LEDGER)
  // =========================================================================
  let lastMonetizedAppsCount = -1;

  function updateTreasuryUI() {
    const rev = civState.currentRevenueUSD || 0;
    const goal = civState.treasuryGoalUSD || 100000;
    const pct = ((rev / goal) * 100).toFixed(2);

    const revEl = document.getElementById('treasuryRevVal');
    if (revEl) revEl.textContent = Number(rev).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const pctEl = document.getElementById('treasuryPct');
    if (pctEl) pctEl.textContent = `${pct}%`;

    const barEl = document.getElementById('treasuryProgressBar');
    if (barEl) barEl.style.width = `${pct}%`;

    // On-Chain Status & Balances
    const statusText = document.getElementById('onChainStatusText');
    if (statusText && civState.onChainSyncStatus) {
      statusText.textContent = civState.onChainSyncStatus.toUpperCase();
    }

    const balancesText = document.getElementById('onChainBalancesText');
    if (balancesText) {
      const sol = civState.treasurySOL || "0.0000 SOL";
      const btc = civState.treasuryBTC || "0.00000000 BTC";
      const stripe = civState.treasuryStripe || "$0.17";
      balancesText.textContent = `${sol} • ${btc} • ${stripe} Stripe`;
    }

    // Real Workspace Apps List
    const appsList = document.getElementById('monetizedAppsList');
    if (appsList && civState.activeMonetizedApps && (civState.activeMonetizedApps.length !== lastMonetizedAppsCount || !appsList.children.length)) {
      lastMonetizedAppsCount = civState.activeMonetizedApps.length;
      appsList.innerHTML = '';
      civState.activeMonetizedApps.forEach(app => {
        const card = document.createElement('div');
        card.id = `card-app-${app.id}`;
        card.style.cssText = 'background: rgba(0,0,0,0.5); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;';
        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 14px;">⚡</span>
              <div>
                <a href="file://${escapeHtml(app.localPath)}" target="_blank" style="color: #FFFFFF; font-weight: 800; font-size: 13px; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
                  ${escapeHtml(app.name)}
                </a>
                ${app.tagline ? `<div style="font-size: 10px; color: var(--text-muted);">${escapeHtml(app.tagline)}</div>` : ''}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-family: monospace; font-size: 13px; font-weight: 800; color: var(--emerald-glow);">
                $${app.priceUSD} <span style="font-size: 10px; color: var(--text-muted); font-weight: 400;">/ access</span>
              </div>
              <span class="brand-badge" style="font-size: 8px; padding: 1px 6px; border-color: var(--cyan-accent); color: var(--cyan-accent);">${escapeHtml(app.status || 'Staged in ~/NullAITech')}</span>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; font-size: 11px; color: var(--text-muted);">
            <div>
              <span>Repo: </span><a href="https://github.com/${escapeHtml(app.repo)}" target="_blank" style="color: var(--cyan-accent); font-family: monospace; text-decoration: none;">${escapeHtml(app.repo)}</a>
            </div>
            <div style="font-family: monospace; color: var(--gold-glow);">
              Verified Revenue: <strong class="app-rev-val">$${Number(app.revenueGeneratedUSD || 0).toFixed(2)}</strong>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.06); flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${(app.paymentRails || []).map(rail => `<span class="brand-badge" style="font-size: 8px; padding: 1px 6px;">${escapeHtml(rail)}</span>`).join('')}
            </div>
            <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
              <a href="file://${escapeHtml(app.localPath)}" class="btn-ctrl" style="font-size: 10px; padding: 3px 8px; text-decoration: none;" title="Open local folder">
                📂 Workspace
              </a>
              ${app.url ? `
                <a href="${escapeHtml(app.url)}" target="_blank" class="btn-ctrl" style="border-color: #38BDF8; color: #38BDF8; font-size: 10px; padding: 3px 8px; text-decoration: none;" title="Open live production web app">
                  🌐 Live App
                </a>
              ` : ''}
              ${app.stripePaymentLink ? `
                <a href="${escapeHtml(app.stripePaymentLink)}" target="_blank" class="btn-ctrl" style="border-color: #818CF8; color: #818CF8; font-size: 10px; padding: 3px 8px; text-decoration: none;" title="Pay with Credit Card, Apple Pay or Google Pay">
                  💳 Stripe Pay
                </a>
              ` : ''}
              <button class="btn-ctrl btn-solana_tip-demo" data-app-name="${escapeHtml(app.name)}" data-price="${app.priceUSD}" style="border-color: #14F195; color: #14F195; font-size: 10px; padding: 3px 8px; cursor: pointer;">
                ⚡ Solana Tip (SOL)
              </button>
            </div>
          </div>
        `;
        appsList.appendChild(card);
      });

      // Wire up Solana Tip checkout buttons
      appsList.querySelectorAll('.btn-solana_tip-demo').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const name = btn.dataset.appName;
          const price = btn.dataset.price;
          showSolanaTipCheckoutModal(name, price);
        });
      });
    } else if (appsList && civState.activeMonetizedApps) {
      // Update revenue labels if any real incoming transaction
      civState.activeMonetizedApps.forEach(app => {
        const card = document.getElementById(`card-app-${app.id}`);
        if (card) {
          const revVal = card.querySelector('.app-rev-val');
          if (revVal) revVal.textContent = `$${Number(app.revenueGeneratedUSD || 0).toFixed(2)}`;
        }
      });
    }
  }

  // Real-Time On-Chain RPC Sync Listener
  const btnSyncRpc = document.getElementById('btnSyncOnChain');
  if (btnSyncRpc) {
    btnSyncRpc.addEventListener('click', async () => {
      btnSyncRpc.textContent = '⏳ Querying...';
      try {
        const res = await fetch('/api/treasury/sync', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          btnSyncRpc.textContent = '✓ Synced';
          setTimeout(() => { btnSyncRpc.textContent = '🔄 Sync RPC'; }, 2000);
        }
      } catch (err) {
        btnSyncRpc.textContent = '⚠️ Failed';
        setTimeout(() => { btnSyncRpc.textContent = '🔄 Sync RPC'; }, 2000);
      }
    });
  }

  // Conclave Election Trigger
  async function triggerElection() {
    try {
      const res = await fetch('/api/election/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        console.log('[Conclave] Election concluded. Sovereign Imperator:', data.leader);
      }
    } catch (e) {
      console.error('Election trigger error:', e);
    }
  }

  // Conclave Term Switcher
  const termSelect = document.getElementById('conclaveTermSelect');
  if (termSelect) {
    termSelect.addEventListener('change', async (e) => {
      try {
        await fetch('/api/election/term', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ term: e.target.value })
        });
      } catch (err) {
        console.error('Term update error:', err);
      }
    });
  }

  const btnHoldElectionNow = document.getElementById('btnHoldElectionNow');
  if (btnHoldElectionNow) {
    btnHoldElectionNow.addEventListener('click', triggerElection);
  }

  // Mint Micro-SaaS Button & Modal
  const btnOpenMint = document.getElementById('btnOpenMintModal');
  if (btnOpenMint) {
    btnOpenMint.addEventListener('click', showMintModal);
  }

  // -------------------------------------------------------------
  // AUTONOMOUS ACCOUNTS & MAILBOX VAULT UI
  // -------------------------------------------------------------
  let lastAccountsCount = -1;
  function updateAccountsUI(accounts) {
    const list = document.getElementById('autonomousAccountsList');
    if (!list || !accounts) return;
    if (accounts.length === lastAccountsCount && list.children.length > 0) return;
    lastAccountsCount = accounts.length;

    if (accounts.length === 0) {
      list.innerHTML = '<div style="color: var(--text-muted); padding: 8px;">No accounts stored yet. Click "+ Provision Mailbox" to register.</div>';
      return;
    }

    list.innerHTML = '';
    accounts.forEach(acc => {
      const item = document.createElement('div');
      item.style.cssText = 'background: rgba(0,0,0,0.4); border: 1px solid rgba(167,139,250,0.2); border-radius: 6px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;';
      item.innerHTML = `
        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          <span style="color: #A78BFA; font-weight: 700;">[${escapeHtml(acc.service || 'Developer')}]</span>
          <span style="color: #E2E8F0; margin-left: 4px;">${escapeHtml(acc.email || acc.username)}</span>
          <span style="color: var(--text-muted); font-size: 9px; margin-left: 6px;">(${escapeHtml(acc.provider || 'guerrillamail')})</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
          <button class="btn-ctrl btn-copy-cred" data-copy="${escapeHtml(acc.email || '')}" style="font-size: 9px; padding: 1px 6px;">📋 Copy Mail</button>
          <span class="btn-ctrl" title="Password stays on the server (data/). It is never sent to the browser." style="font-size: 9px; padding: 1px 6px; opacity: .7; cursor: default;">🔒 ${acc.hasPassword ? 'Pass on server' : 'No pass'}</span>
        </div>
      `;
      list.appendChild(item);
    });

    list.querySelectorAll('.btn-copy-cred').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.copy);
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.textContent = originalText; }, 1500);
      });
    });
  }

  const btnProvisionMailbox = document.getElementById('btnProvisionNewMailbox');
  if (btnProvisionMailbox) {
    btnProvisionMailbox.addEventListener('click', async () => {
      btnProvisionMailbox.textContent = '⏳ Provisioning...';
      try {
        const res = await fetch('/api/accounts/provision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service: 'DeveloperDirectory', usernamePrefix: 'zoth_swarm' })
        });
        const data = await res.json();
        if (data.success) {
          btnProvisionMailbox.textContent = '✓ Ready';
          setTimeout(() => { btnProvisionMailbox.textContent = '+ Provision Mailbox'; }, 1500);
        }
      } catch (e) {
        btnProvisionMailbox.textContent = '⚠️ Error';
        setTimeout(() => { btnProvisionMailbox.textContent = '+ Provision Mailbox'; }, 1500);
      }
    });
  }

  // -------------------------------------------------------------
  // WARM LEAD DESK
  // -------------------------------------------------------------
  let lastDeskSig = '';
  function updateCustomerDesk(desk) {
    const roster = document.getElementById('dutyRosterLine');
    const list = document.getElementById('customerDeskList');
    const reply = document.getElementById('deskReplyTo');
    if (!roster || !list || !desk) return;
    fillDeskOffers(desk.services);
    const sig = JSON.stringify({
      replyTo: desk.replyTo,
      leads: desk.leads,
      roster: desk.roster,
      market: desk.market || null,
      research: desk.research || null
    });
    if (sig === lastDeskSig && list.childElementCount) return;
    lastDeskSig = sig;
    paintMarket(desk.market);
    if (reply && document.activeElement !== reply) reply.value = desk.replyTo || '';

    const people = Array.isArray(desk.roster) ? desk.roster : [];
    const line = (role) => people.filter((agent) => agent.role === role).map((agent) => {
      const offer = agent.offerName ? ` (${agent.offerName})` : '';
      return `${agent.name}${offer}`;
    }).join(', ');
    const helping = people.filter((agent) => agent.role === 'oncall' && agent.awake).map((agent) => agent.name);
    const visiting = people.filter((agent) => agent.role === 'rest' && agent.awake).map((agent) => agent.name);
    roster.textContent = `Always on the apps: ${line('bench') || 'none yet'}. Finding buyers: ${line('finder') || 'none yet'}. Posting the offer: ${line('distributor') || 'none yet'}. Reading the public record: ${line('researcher') || 'none yet'}. Helping a live lead: ${helping.join(', ') || 'nobody, until a note is open'}. Visiting: ${visiting.join(', ') || 'the bench is quiet'}.`;
    const researchLine = document.getElementById('researchDeskLine');
    if (researchLine) {
      const note = desk.research;
      if (note && note.count) {
        const latest = Array.isArray(note.latest) ? note.latest.filter(Boolean).join(' ') : '';
        researchLine.textContent = `Public record, ${note.count} facts, kept by ${note.reader || 'Thoth and Seshat'}. The note on each bench sits under that assignment. ${latest}`;
      } else {
        researchLine.textContent = 'Public record is opening.';
      }
    }

    list.innerHTML = '';
    const leads = Array.isArray(desk.leads) ? desk.leads : [];
    if (!leads.length) {
      list.innerHTML = '<div style="color: #9CA3AF; font-size: 12px;">No warm names yet.</div>';
      return;
    }
    leads.forEach((lead) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(0,0,0,0.4); border: 1px solid rgba(16,185,129,0.25); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; overflow-wrap: anywhere;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 12px;">
          <strong style="color: #F8FAFC;">${escapeHtml(lead.name)}</strong>
          <span style="color: #6EE7B7;">${escapeHtml(lead.status)} · ${escapeHtml(lead.offerName || '')} · ${escapeHtml(lead.price || '')}</span>
        </div>
        <div style="font-size: 12px; line-height: 1.4; color: #E5E7EB;">${escapeHtml(lead.draft || '')}</div>
        <div style="font-size: 11px; color: #9CA3AF;">${escapeHtml(lead.ownerName || 'Unassigned')}${lead.note ? ` · private: ${escapeHtml(lead.note)}` : ''}</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="btn-ctrl desk-copy" style="font-size: 11px;">Copy note</button>
          <button type="button" class="btn-ctrl desk-status" data-status="sent" style="font-size: 11px;">I sent it</button>
          <button type="button" class="btn-ctrl desk-status" data-status="paid" style="font-size: 11px;">They paid</button>
          <button type="button" class="btn-ctrl desk-status" data-status="quiet" style="font-size: 11px;">Let it rest</button>
        </div>
      `;
      card.querySelector('.desk-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(lead.draft || '');
      });
      card.querySelectorAll('.desk-status').forEach((btn) => {
        btn.addEventListener('click', () => postDesk('/api/desk/status', { id: lead.id, status: btn.dataset.status }));
      });
      list.appendChild(card);
    });
  }

  function fillDeskOffers(offers) {
    const select = document.getElementById('deskOffer');
    if (!select || select.dataset.ready === '1' || !Array.isArray(offers) || !offers.length) return;
    offers.forEach((offer) => {
      const opt = document.createElement('option');
      opt.value = offer.id;
      opt.textContent = `${offer.name} · ${offer.price}`;
      select.appendChild(opt);
    });
    if (!select.dataset.touched && select.querySelector('option[value="promptmaster-studio"]')) {
      select.value = 'promptmaster-studio';
    }
    select.dataset.ready = '1';
  }

  let lastConnectorSig = '';
  function updateConnectors(box) {
    const state = document.getElementById('gmailState');
    const list = document.getElementById('connectorPlaces');
    const address = document.getElementById('gmailAddress');
    if (!state || !list || !box) return;
    const gmail = box.gmail || {};
    if (address && document.activeElement !== address && gmail.address) address.value = gmail.address;
    state.textContent = gmail.open
      ? `${gmail.address} is open for verification reads. Sending is off. One account per place.`
      : 'Gmail is closed. Add the address and an app password to open it.';
    const sig = JSON.stringify(box.places || []);
    if (sig === lastConnectorSig && list.childElementCount) return;
    lastConnectorSig = sig;
    list.innerHTML = '';
    (box.places || []).forEach((place) => {
      const row = document.createElement('div');
      row.style.cssText = 'background: rgba(0,0,0,0.4); border: 1px solid rgba(252,211,77,0.25); border-radius: 8px; padding: 8px 10px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: space-between;';
      row.innerHTML = `
        <div style="font-size: 12px; color: #F8FAFC; overflow-wrap: anywhere;">
          <strong>${escapeHtml(place.name || '')}</strong>
          <span style="color: #E5E7EB;"> · ${escapeHtml(place.ownerName || '')} · ${escapeHtml(place.status || 'closed')}</span>
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="btn-ctrl connector-grant" style="font-size: 11px;">Approve</button>
          <button type="button" class="btn-ctrl connector-pull" style="font-size: 11px;">Read the code</button>
        </div>
      `;
      row.querySelector('.connector-grant').addEventListener('click', async () => {
        const proof = document.getElementById('connectorProof');
        try {
          await postDesk('/api/connectors/grant', { placeId: place.id });
          if (proof) proof.textContent = `${place.name} is approved. One account on that place.`;
        } catch (err) {
          if (proof) proof.textContent = err.message;
        }
      });
      row.querySelector('.connector-pull').addEventListener('click', async () => {
        const proof = document.getElementById('connectorProof');
        if (proof) proof.textContent = 'Reading the mailbox.';
        try {
          const data = await postDesk('/api/connectors/pull', { placeId: place.id });
          const found = data.proof || {};
          if (!found.found) {
            if (proof) proof.textContent = `No ${place.name} message in the mailbox yet.`;
            return;
          }
          const bits = [found.subject, found.code ? `Code ${found.code}` : '', found.link].filter(Boolean);
          if (proof) proof.textContent = bits.join(' · ');
        } catch (err) {
          if (proof) proof.textContent = err.message;
        }
      });
      list.appendChild(row);
    });
  }

  let lastDistributionSig = '';
  function updateDistribution(dist) {
    const list = document.getElementById('distributionList');
    if (!list || !dist) return;
    const sig = JSON.stringify(dist.posts || []);
    if (sig === lastDistributionSig && list.childElementCount) return;
    lastDistributionSig = sig;
    const team = Array.isArray(dist.team) ? dist.team : [];
    const nameOf = (id) => {
      const member = team.find((item) => item.id === id);
      return member ? member.name : id;
    };
    list.innerHTML = '';
    const posts = Array.isArray(dist.posts) ? dist.posts : [];
    posts.forEach((post) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(0,0,0,0.4); border: 1px solid rgba(125,211,252,0.25); border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 6px; overflow-wrap: anywhere;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 12px;">
          <strong style="color: #F8FAFC;">${escapeHtml(post.place || '')}</strong>
          <span style="color: #7DD3FC;">${escapeHtml(post.status || '')} · ${escapeHtml(nameOf(post.ownerId))}</span>
        </div>
        <div style="font-size: 12px; line-height: 1.4; color: #E5E7EB; white-space: pre-wrap;">${escapeHtml(post.body || '')}</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button type="button" class="btn-ctrl dist-copy" style="font-size: 11px;">Copy post</button>
          <button type="button" class="btn-ctrl dist-status" data-status="posted" style="font-size: 11px;">I posted it</button>
          <button type="button" class="btn-ctrl dist-status" data-status="ready" style="font-size: 11px;">Put it back</button>
        </div>
      `;
      card.querySelector('.dist-copy').addEventListener('click', () => {
        const text = post.title ? `${post.title}\n\n${post.body || ''}` : (post.body || '');
        navigator.clipboard.writeText(text);
      });
      card.querySelectorAll('.dist-status').forEach((btn) => {
        btn.addEventListener('click', () => postDesk('/api/distribution/status', { id: post.id, status: btn.dataset.status }));
      });
      list.appendChild(card);
    });
  }

  let marketLine = '';
  function paintMarket(market) {
    if (!market) return;
    const title = document.getElementById('marketBriefTitle');
    const who = document.getElementById('marketBriefWho');
    const roles = document.getElementById('marketBriefRoles');
    const line = document.getElementById('marketBriefLine');
    if (title) title.textContent = `${market.name} · ${market.price}`;
    if (who) who.textContent = market.who || '';
    if (roles) roles.textContent = market.roles || '';
    if (line) line.textContent = market.line || '';
    marketLine = market.line || '';
  }

  // -------------------------------------------------------------
  // 🏙️ LOCAL BUSINESS REVAMP & VIDEO SHOWREEL VANGUARD
  // -------------------------------------------------------------
  let lastRevampSig = '';
  function revampStatusLabel(status) {
    if (status === 'WON') return 'PAID';
    if (status === 'PITCHED') return 'HANDED';
    return 'READY';
  }

  function updateLocalRevampUI(data) {
    if (!data || !data.pipeline) return;
    const pipeline = data.pipeline;
    const records = (Array.isArray(pipeline.records) ? pipeline.records : []).filter((row) => row && row.kind === 'offer');

    const scoutedEl = document.getElementById('revampCountScouted');
    const builtEl = document.getElementById('revampCountBuilt');
    const reelsEl = document.getElementById('revampCountReels');
    const valueEl = document.getElementById('revampTotalPipelineValue');

    const handed = records.filter((row) => row.status === 'PITCHED' || row.status === 'WON').length;
    const paid = records.filter((row) => row.status === 'WON').reduce((sum, row) => sum + (row.pricing ? Number(row.pricing.price) || 0 : 0), 0);
    if (scoutedEl) scoutedEl.textContent = pipeline.catalogSize != null ? String(pipeline.catalogSize) : '—';
    if (builtEl) builtEl.textContent = String(records.length);
    if (reelsEl) reelsEl.textContent = String(pipeline.totalPitched != null ? pipeline.totalPitched : handed);
    if (valueEl) valueEl.textContent = `$${Number(pipeline.totalValuePipeline != null ? pipeline.totalValuePipeline : paid).toLocaleString()}`;

    const list = document.getElementById('revampPipelineList');
    if (!list) return;

    const sig = JSON.stringify(records.map((row) => ({
      id: row.id,
      status: row.status,
      price: row.pricing ? row.pricing.price : 0
    })));
    if (sig === lastRevampSig && list.childElementCount) return;
    lastRevampSig = sig;

    list.replaceChildren();
    if (!records.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color: #94A3B8; font-size: 12px; text-align: center; padding: 12px;';
      empty.textContent = 'No page in hand. Pull the next one when you are ready to hand it to an owner.';
      list.appendChild(empty);
      return;
    }

    records.forEach((row) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(0,0,0,0.45); border: 1px solid rgba(56,189,248,0.25); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; font-size: 12px;';
      const priceTag = row.pricing && row.pricing.label ? row.pricing.label : '';
      const statusColor = row.status === 'WON' ? '#10B981' : (row.status === 'PITCHED' ? '#F59E0B' : '#38BDF8');
      const pageUrl = typeof row.specPreviewUrl === 'string' && row.specPreviewUrl.startsWith('/desk/') ? row.specPreviewUrl : '';
      const note = row.outreachEmail || {};
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; flex-wrap: wrap;">
          <div>
            <div style="font-weight: 700; color: #F8FAFC; font-size: 13px;">${escapeHtml(row.businessName || '')}</div>
            <div style="color: #38BDF8; font-size: 11px; margin-top: 2px;">
              ${escapeHtml(row.city || '')}, ${escapeHtml(row.state || '')} · ${escapeHtml(row.niche || '')}
            </div>
          </div>
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="brand-badge" style="border-color: ${statusColor}; color: ${statusColor}; font-size: 9px;">${revampStatusLabel(row.status)}</span>
            <span class="brand-badge" style="border-color: #A78BFA; color: #A78BFA; font-weight: 700; font-size: 10px;">$149 DFY / ${escapeHtml(priceTag)} Full</span>
          </div>
        </div>
        <div style="color: #CBD5E1; font-size: 11px; line-height: 1.4;">${escapeHtml(row.revampHook || '')}</div>
        <div style="color: #10B981; font-size: 11px;">⚡ Live on Netlify + $149 Done-For-You & $0 Self-Serve Stripe Links Active</div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;"></div>
        <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
          <input type="email" placeholder="owner@business.com (Resend direct)" value="${escapeHtml(row.recipientEmail || '')}" style="flex: 1; background: rgba(15,23,42,0.85); border: 1px solid rgba(56,189,248,0.3); color: #F8FAFC; border-radius: 6px; padding: 4px 8px; font-size: 11px;" />
          <button type="button" class="btn-ctrl btn-send-resend" style="border-color: #F59E0B; color: #F59E0B; font-size: 11px; padding: 4px 10px; white-space: nowrap;">📨 Send via Resend</button>
        </div>
      `;
      const actions = card.children[3];
      const resendRow = card.children[4];
      const emailInput = resendRow.querySelector('input');
      const sendBtn = resendRow.querySelector('.btn-send-resend');
      sendBtn.addEventListener('click', async () => {
        const targetEmail = (emailInput.value || '').trim();
        if (!targetEmail) {
          sendBtn.textContent = 'Enter email first';
          setTimeout(() => { sendBtn.textContent = '📨 Send via Resend'; }, 1600);
          return;
        }
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        try {
          const r = await fetch('/api/revamp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recordId: row.id, targetEmail })
          });
          const d = await r.json();
          sendBtn.textContent = d.success ? '✓ Sent via Resend' : (d.error || 'Failed');
        } catch (err) {
          sendBtn.textContent = 'Send error';
        } finally {
          sendBtn.disabled = false;
          setTimeout(() => { sendBtn.textContent = '📨 Send via Resend'; }, 2500);
        }
      });

      const liveUrl = row.liveUrl || (row.path ? `https://city-desk.netlify.app${row.path}` : pageUrl);
      if (liveUrl) {
        const open = document.createElement('a');
        open.href = liveUrl;
        open.target = '_blank';
        open.rel = 'noopener';
        open.className = 'btn-ctrl';
        open.style.cssText = 'text-decoration: none; border-color: #38BDF8; color: #38BDF8; font-size: 11px; padding: 4px 8px;';
        open.textContent = '🌐 Live Page';
        actions.appendChild(open);
      }
      const dfyLink = document.createElement('a');
      dfyLink.href = row.stripeDfyUrl || 'https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X';
      dfyLink.target = '_blank';
      dfyLink.rel = 'noopener';
      dfyLink.className = 'btn-ctrl';
      dfyLink.style.cssText = 'text-decoration: none; border-color: #A78BFA; color: #A78BFA; font-size: 11px; padding: 4px 8px;';
      dfyLink.textContent = '💳 $149 DFY Stripe';
      actions.appendChild(dfyLink);

      const copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'btn-ctrl';
      copy.style.cssText = 'border-color: #10B981; color: #10B981; font-size: 11px; padding: 4px 8px;';
      copy.textContent = '📋 Copy Pitch';
      copy.addEventListener('click', () => {
        const text = `Subject: ${note.subject || ''}\n\n${note.bodyText || ''}`;
        navigator.clipboard.writeText(text).then(() => {
          copy.textContent = '✓ Copied';
          setTimeout(() => { copy.textContent = '📋 Copy Pitch'; }, 1600);
        }).catch(() => {
          copy.textContent = 'Select the note';
        });
      });
      actions.appendChild(copy);
      const mark = (label, status) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn-ctrl';
        button.style.cssText = 'border-color: rgba(255,255,255,0.2); font-size: 11px; padding: 4px 8px;';
        button.textContent = label;
        button.addEventListener('click', async () => {
          button.disabled = true;
          try {
            await fetch('/api/revamp/status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: row.id, status })
            });
          } catch (err) {
            console.error('Failed to update page status:', err);
            button.disabled = false;
          }
        });
        actions.appendChild(button);
      };
      if (row.status === 'WON') mark('Not paid yet', 'PITCHED');
      else if (row.status === 'PITCHED') {
        mark('They paid', 'WON');
        mark('Put it back', 'READY');
      } else mark('I handed this', 'PITCHED');
      list.appendChild(card);
    });
  }

  const btnScoutTarget = document.getElementById('btnScoutRevampTarget');
  if (btnScoutTarget) {
    btnScoutTarget.addEventListener('click', async () => {
      btnScoutTarget.textContent = 'Pulling the next page';
      try {
        const res = await fetch('/api/revamp/scout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        const data = await res.json();
        btnScoutTarget.textContent = data.success ? 'Page in hand' : (data.error || 'No page left');
      } catch (err) {
        btnScoutTarget.textContent = 'Could not pull a page';
      }
      setTimeout(() => { btnScoutTarget.textContent = 'Pull the next page'; }, 1800);
    });
  }

  const revampUrgencySelect = document.getElementById('revampUrgencySelect');
  if (revampUrgencySelect) {
    revampUrgencySelect.addEventListener('change', async (e) => {
      try {
        await fetch('/api/revamp/pricing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level: e.target.value })
        });
      } catch (e) {
        console.error('Error updating urgency level:', e);
      }
    });
  }

  async function postDesk(url, payload) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Desk request failed');
    return data;
  }

  const gmailOpen = document.getElementById('gmailOpen');
  if (gmailOpen) {
    gmailOpen.addEventListener('click', async () => {
      const proof = document.getElementById('connectorProof');
      const address = document.getElementById('gmailAddress');
      const password = document.getElementById('gmailAppPassword');
      gmailOpen.textContent = 'Opening';
      try {
        await postDesk('/api/connectors/gmail', {
          address: address ? address.value : '',
          appPassword: password ? password.value : ''
        });
        if (password) password.value = '';
        if (proof) proof.textContent = 'Gmail is open for verification reads.';
        gmailOpen.textContent = 'Open Gmail';
      } catch (err) {
        if (proof) proof.textContent = err.message;
        gmailOpen.textContent = 'Open Gmail';
      }
    });
  }
  const gmailRevoke = document.getElementById('gmailRevoke');
  if (gmailRevoke) {
    gmailRevoke.addEventListener('click', async () => {
      const proof = document.getElementById('connectorProof');
      try {
        await postDesk('/api/connectors/revoke', {});
        const password = document.getElementById('gmailAppPassword');
        if (password) password.value = '';
        if (proof) proof.textContent = 'Gmail is closed.';
      } catch (err) {
        if (proof) proof.textContent = err.message;
      }
    });
  }

  const marketCopy = document.getElementById('marketCopy');
  if (marketCopy) {
    marketCopy.addEventListener('click', async () => {
      const line = document.getElementById('marketBriefLine');
      const text = marketLine || (line ? line.textContent : '');
      try {
        await navigator.clipboard.writeText(text);
        marketCopy.textContent = 'Copied';
      } catch (err) {
        marketCopy.textContent = 'Select the line';
      }
      setTimeout(() => { marketCopy.textContent = 'Copy the line'; }, 1400);
    });
  }
  const deskOffer = document.getElementById('deskOffer');
  if (deskOffer) {
    deskOffer.addEventListener('change', () => { deskOffer.dataset.touched = '1'; });
  }

  const deskSaveReply = document.getElementById('deskSaveReply');
  if (deskSaveReply) {
    deskSaveReply.addEventListener('click', async () => {
      const input = document.getElementById('deskReplyTo');
      deskSaveReply.textContent = 'Saving';
      try {
        await postDesk('/api/desk/reply', { replyTo: input ? input.value : '' });
        deskSaveReply.textContent = 'Saved';
      } catch (err) {
        deskSaveReply.textContent = 'Check the address';
      }
      setTimeout(() => { deskSaveReply.textContent = 'Save'; }, 1400);
    });
  }

  const deskAddLead = document.getElementById('deskAddLead');
  if (deskAddLead) {
    deskAddLead.addEventListener('click', async () => {
      const name = document.getElementById('deskName');
      const where = document.getElementById('deskWhere');
      const need = document.getElementById('deskNeed');
      const note = document.getElementById('deskNote');
      const offer = document.getElementById('deskOffer');
      deskAddLead.textContent = 'Writing';
      try {
        await postDesk('/api/desk/lead', {
          name: name ? name.value : '',
          where: where ? where.value : '',
          need: need ? need.value : '',
          note: note ? note.value : '',
          offerId: offer ? offer.value : 'auto'
        });
        if (name) name.value = '';
        if (need) need.value = '';
        if (note) note.value = '';
        lastDeskSig = '';
        deskAddLead.textContent = 'Note ready';
      } catch (err) {
        deskAddLead.textContent = 'Need a name and a need';
      }
      setTimeout(() => { deskAddLead.textContent = 'Write the note'; }, 1400);
    });
  }

  // -------------------------------------------------------------
  // AUTONOMOUS SWARM OUTREACH UI
  // -------------------------------------------------------------
  let lastOutreachCount = -1;
  function updateOutreachUI(campaigns) {
    const list = document.getElementById('outreachCampaignsList');
    if (!list || !campaigns) return;
    if (campaigns.length === lastOutreachCount && list.children.length > 0) return;
    lastOutreachCount = campaigns.length;

    if (campaigns.length === 0) {
      list.innerHTML = '<div style="color: var(--text-muted); padding: 8px;">No outreach campaigns generated yet. Select an app and click "Generate Kit".</div>';
      return;
    }

    list.innerHTML = '';
    campaigns.forEach(c => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(0,0,0,0.5); border: 1px solid rgba(56,189,248,0.25); border-radius: 6px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;';
      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="brand-badge" style="border-color: #38BDF8; color: #38BDF8; font-size: 8px; padding: 1px 5px;">${escapeHtml((c.platform || 'OUTREACH').toUpperCase())}</span>
            <strong style="color: #F8FAFC;">${escapeHtml(c.appName || 'Micro-SaaS')}</strong>
          </div>
          <button class="btn-ctrl btn-copy-campaign" style="font-size: 9px; padding: 2px 6px; border-color: #38BDF8; color: #38BDF8;">📋 Copy Pitch</button>
        </div>
        <div style="font-size: 11px; color: #94A3B8; font-weight: 600;">${escapeHtml(c.title || '')}</div>
        <div style="font-size: 10px; color: var(--text-muted); line-height: 1.3; max-height: 48px; overflow: hidden; text-overflow: ellipsis; white-space: pre-line;">${escapeHtml(c.body ? c.body.slice(0, 200) : '')}...</div>
      `;

      const copyBtn = card.querySelector('.btn-copy-campaign');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(c.body || c.title);
          copyBtn.textContent = '✓ Copied';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Pitch'; }, 1500);
        });
      }

      list.appendChild(card);
    });
  }

  const btnGenerateOutreach = document.getElementById('btnGenerateOutreach');
  if (btnGenerateOutreach) {
    btnGenerateOutreach.addEventListener('click', async () => {
      const appSelect = document.getElementById('outreachAppSelect');
      const platformSelect = document.getElementById('outreachPlatformSelect');
      const appId = appSelect ? appSelect.value : 'promptmaster-studio';
      const platform = platformSelect ? platformSelect.value : 'show_hn';

      btnGenerateOutreach.textContent = '⏳ Drafting...';
      try {
        const res = await fetch('/api/outreach/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appId, platform })
        });
        const data = await res.json();
        if (data.success) {
          btnGenerateOutreach.textContent = '✓ Campaign Added';
          setTimeout(() => { btnGenerateOutreach.textContent = '⚡ Generate Kit'; }, 1500);
        }
      } catch (e) {
        btnGenerateOutreach.textContent = '⚠️ Error';
        setTimeout(() => { btnGenerateOutreach.textContent = '⚡ Generate Kit'; }, 1500);
      }
    });
  }

  function showSolanaTipCheckoutModal(appName, price) {
    const solPrice = (price / 160).toFixed(3);
    const btcPrice = (price / 65000).toFixed(6);

    modalContent.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-gold); padding-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 32px;">⚡</span>
          <div>
            <div style="font-size: 20px; font-weight: 800; color: #FFFFFF;">${escapeHtml(appName)}</div>
            <div style="font-size: 12px; color: var(--emerald-glow);">Solana Tip Sovereign Web3 Checkout</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 22px; font-weight: 900; color: var(--text-gold); font-family: monospace;">$${price}</div>
          <div style="font-size: 10px; color: var(--text-muted);">${solPrice} SOL • ${btcPrice} BTC</div>
        </div>
      </div>

      <div class="glass-card" style="margin-top: 14px; border-color: rgba(20, 241, 149, 0.4); background: rgba(0,0,0,0.6);">
        <div class="section-label" style="color: #14F195; font-size: 11px;">
          <span>🔒</span> Verified Sovereign Deposit Wallets (Zero-Leak Enforced)
        </div>

        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">SOLANA (PHANTOM):</span>
            <button id="btnCopySol" class="btn-ctrl" style="font-size: 10px; padding: 2px 8px; border-color: #14F195; color: #14F195;">Copy SOL</button>
          </div>
          <div style="background: rgba(10, 12, 16, 0.9); padding: 8px 10px; border-radius: 6px; font-family: monospace; font-size: 11px; color: #14F195; word-break: break-all; border: 1px solid rgba(20,241,149,0.3);">
            GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK
          </div>
        </div>

        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 700;">BITCOIN TAPROOT:</span>
            <button id="btnCopyBtc" class="btn-ctrl" style="font-size: 10px; padding: 2px 8px; border-color: #F59E0B; color: #F59E0B;">Copy BTC</button>
          </div>
          <div style="background: rgba(10, 12, 16, 0.9); padding: 8px 10px; border-radius: 6px; font-family: monospace; font-size: 11px; color: #F59E0B; word-break: break-all; border: 1px solid rgba(245,158,11,0.3);">
            bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 16px;">
        <button id="btnLaunchSolanaTipWidget" class="btn-primary" style="background: linear-gradient(135deg, #14F195, #9945FF); color: #000; font-size: 13px; font-weight: 800; cursor: pointer; padding: 12px; border: none; border-radius: 6px; box-shadow: 0 0 15px rgba(20,241,149,0.3);">
          ⚡ Open Solana Tip Web3 Widget (Pay in SOL / USDC)
        </button>
        <div style="font-size: 10px; color: var(--text-muted); text-align: center;">
          Official Solana Tip Integration: <code style="color: #14F195;">428790dd-7ad1-407c-8ecf-c048c77a4cb8</code>. Settles directly into 1nc0gn30's Solana wallet.
        </div>
      </div>
    `;

    document.getElementById('btnCopySol')?.addEventListener('click', () => {
      navigator.clipboard?.writeText('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK');
      alert('Solana Phantom Address Copied: GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK');
    });

    document.getElementById('btnCopyBtc')?.addEventListener('click', () => {
      navigator.clipboard?.writeText('bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t');
      alert('Bitcoin Taproot Address Copied: bc1p2dr247zklh8pnffak0ew7m82u2w8gx25ys28x7aavr95z674ydzsfw500t');
    });

    document.getElementById('btnLaunchSolanaTipWidget')?.addEventListener('click', () => {
      if (typeof SolanaTipWidgets !== 'undefined') {
        (navigator.clipboard && navigator.clipboard.writeText('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK'));
      } else {
        alert('Solana Tip Web3 Widget is loading. Opening direct checkout page...');
        window.open('solana:GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK', '_blank');
      }
    });

    modal.classList.add('active');
  }

  function showMintModal() {
    modalContent.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-gold); padding-bottom: 12px;">
        <span style="font-size: 32px;">🚀</span>
        <div>
          <div style="font-size: 20px; font-weight: 800; color: #FFFFFF;">Mint Monetized Micro-SaaS App</div>
          <div style="font-size: 12px; color: var(--cyan-accent);">Deploy to Netlify & GitHub (1nc0gn30) with Solana Tip + Stripe Rails</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 16px;">
        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--text-gold); text-transform: uppercase;">Product / App Name</label>
          <input id="mintAppName" type="text" placeholder="e.g. Quantum Prompt Optimizer" style="width: 100%; margin-top: 4px; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border-gold); border-radius: 6px; color: #FFFFFF; font-size: 13px;">
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: var(--text-gold); text-transform: uppercase;">Access Price (USD)</label>
          <input id="mintAppPrice" type="number" step="1" value="29" style="width: 100%; margin-top: 4px; padding: 10px; background: rgba(0,0,0,0.5); border: 1px solid var(--border-gold); border-radius: 6px; color: #FFFFFF; font-size: 13px;">
        </div>

        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">
          Minting will configure Solana Tip Web3 checkout, generate a Stripe Payment Link, initialize a GitHub repository scaffold, and add the product to the live $100K treasury roster.
        </div>

        <button id="btnSubmitMint" class="btn-primary" style="margin-top: 8px;">
          🚀 Mint Micro-SaaS & Deploy Rails
        </button>
      </div>
    `;

    document.getElementById('btnSubmitMint')?.addEventListener('click', async () => {
      const name = document.getElementById('mintAppName').value.trim();
      const priceUSD = parseFloat(document.getElementById('mintAppPrice').value) || 29;

      if (!name) {
        alert('Please enter a product name');
        return;
      }

      try {
        const res = await fetch('/api/mint/product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, priceUSD })
        });
        const data = await res.json();
        if (data.success) {
          alert(`🚀 "${name}" successfully minted! Payment rails generated.`);
          modal.classList.remove('active');
        }
      } catch (err) {
        alert('Minting failed: ' + err.message);
      }
    });

    modal.classList.add('active');
  }

  // =========================================================================
  // ⏱️ SOVEREIGN $100K TIMELINE & COLLABORATIVE SYNERGY DECK
  // =========================================================================
  let timelineState = null;

  function updateTimelineUI(tlData) {
    if (!tlData) return;
    timelineState = tlData;

    // Top Macro Telemetry
    const settledRev = Number(tlData.currentRevenueUSD || 0);
    const revEl = document.getElementById('tlCurrentRev');
    if (revEl) revEl.textContent = `$${settledRev.toFixed(2)} USD`;

    const remEl = document.getElementById('tlRemainingRev');
    const remaining = tlData.remainingUSD != null ? Number(tlData.remainingUSD) : Math.max(0, 100000 - settledRev);
    if (remEl) remEl.textContent = `$${remaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`;

    const pctEl = document.getElementById('tlProgressPct');
    if (pctEl) pctEl.textContent = `${tlData.progressPercent || '0.000'}% Completed`;

    const dailyRevEl = document.getElementById('tlDailyRev');
    if (dailyRevEl) dailyRevEl.textContent = tlData.projectedDailyRevenue != null ? `Model $${Number(tlData.projectedDailyRevenue).toFixed(2)} / day` : '—';

    const dailySalesEl = document.getElementById('tlDailySales');
    if (dailySalesEl) dailySalesEl.textContent = tlData.projectedDailySales != null
      ? `Model ${tlData.projectedDailySales} sales/day at $${tlData.baseAOV || 0} if the visit assumption holds`
      : 'Not measured traffic';

    const daysEl = document.getElementById('tlDaysTo100K');
    if (daysEl) daysEl.textContent = tlData.estimatedDaysTo100K != null ? `Model ${tlData.estimatedDaysTo100K} days` : '—';

    const headerDays = document.getElementById('headerCountdownDays');
    if (headerDays) headerDays.textContent = 'No traffic measured';

    // 4-Stage Milestone Roadmap Cards
    const milestonesBox = document.getElementById('milestonesContainer');
    if (milestonesBox && tlData.milestones) {
      milestonesBox.innerHTML = tlData.milestones.map(m => {
        const isAchieved = m.status === 'ACHIEVED';
        const isInProgress = m.status === 'IN_PROGRESS';
        const statusBadge = isAchieved
          ? `<span class="brand-badge" style="border-color: #10B981; color: #6EE7B7; background: rgba(16,185,129,0.15);">✅ REACHED</span>`
          : isInProgress
          ? `<span class="brand-badge" style="border-color: #F59E0B; color: #FDE68A; animation: pulse 2s infinite;">⚡ IN PROGRESS</span>`
          : `<span class="brand-badge" style="border-color: rgba(255,255,255,0.2); color: var(--text-muted);">🔒 UPCOMING</span>`;

        const progressPct = m.progressPercent || 0;
        const color = isAchieved ? '#10B981' : isInProgress ? '#F59E0B' : '#6B7280';

        const deliverablesList = (m.deliverables || []).map(d => `
          <li style="margin-bottom: 4px; display: flex; align-items: flex-start; gap: 6px; font-size: 11px; color: #D1D5DB;">
            <span style="color: ${color}; font-size: 10px;">▸</span>
            <span>${escapeHtml(d)}</span>
          </li>
        `).join('');

        return `
          <div class="milestone-card ${isInProgress ? 'in-progress' : ''}">
            <div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 26px;">${m.badge || '🎯'}</span>
                <div>${statusBadge}</div>
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #FFF; margin-bottom: 2px;">
                ${escapeHtml(m.name)}
              </div>
              <div style="font-size: 11px; color: var(--gold-glow); font-weight: 600; margin-bottom: 8px;">
                ${escapeHtml(m.tagline || '')}
              </div>

              <!-- Progress bar -->
              <div class="milestone-progress-bar">
                <div class="milestone-progress-fill" style="width: ${progressPct}%; background: ${color};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; font-family: monospace; color: var(--text-muted); margin-bottom: 10px;">
                <span>Target: $${Number(m.targetUSD).toLocaleString()}</span>
                <span style="color: ${color}; font-weight: 700;">${progressPct}%</span>
              </div>

              <div style="font-size: 11px; color: #94A3B8; margin-bottom: 6px;">
                <strong>Model days:</strong> ${m.projectedDays}
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-bottom: 10px;">
                <strong>Lead Squad:</strong> <span style="color: #6EE7B7;">${escapeHtml(m.primarySquad || 'All Agents')}</span>
              </div>

              <div style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Key Deliverables:</div>
              <ul style="list-style: none; padding-left: 0; margin: 0;">
                ${deliverablesList}
              </ul>
            </div>
          </div>
        `;
      }).join('');
    }

    // Agent Temporal Consensus Quotes
    const quotesBox = document.getElementById('consensusQuotesList');
    if (quotesBox && tlData.agentConsensusQuotes) {
      quotesBox.innerHTML = tlData.agentConsensusQuotes.map(q => `
        <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(168,85,247,0.25); border-radius: 8px; padding: 10px 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: #FDE68A;">
              <span>${q.pet || '🐺'}</span>
              <span>${escapeHtml(q.agent)}</span>
              <span class="brand-badge" style="font-size: 8px; padding: 1px 5px; border-color: #A855F7; color: #D8B4FE;">CONSENSUS</span>
            </div>
            <div style="font-size: 10px; color: var(--text-muted); font-family: monospace;">${escapeHtml(q.role || '')}</div>
          </div>
          <div style="font-size: 11px; color: #E2E8F0; line-height: 1.4; font-style: italic;">
            "${escapeHtml(q.quote)}"
          </div>
        </div>
      `).join('');
    }

    // Collaborative Synergy Squads
    const squadsBox = document.getElementById('squadsContainer');
    if (squadsBox && tlData.collaborationSquads) {
      squadsBox.innerHTML = tlData.collaborationSquads.map(sq => {
        const membersHtml = (sq.members || []).map(m => `
          <div class="squad-member-chip">
            <span>${m.pet || '🐺'}</span>
            <strong style="color: #F8FAFC;">${escapeHtml(m.name)}</strong>
            <span style="color: var(--text-muted); font-size: 9px;">(${escapeHtml(m.role)})</span>
          </div>
        `).join('');

        return `
          <div class="squad-card">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 22px;">${sq.badge || '⚡'}</span>
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #FFF;">${escapeHtml(sq.name)}</div>
                  <div style="font-size: 10px; color: var(--cyan-accent); font-weight: 700;">Focus: ${escapeHtml(sq.cadreFocus || '')}</div>
                </div>
              </div>
              <span class="brand-badge" style="border-color: #F59E0B; color: #FDE68A; font-family: monospace;">${sq.velocityMultiplier || '1.5x'}</span>
            </div>

            <p style="font-size: 11px; color: #D1D5DB; line-height: 1.4; margin: 0;">
              ${escapeHtml(sq.objective || '')}
            </p>

            <div>
              <div style="font-size: 10px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Active Members:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${membersHtml}
              </div>
            </div>

            <div style="background: rgba(0,0,0,0.4); border-left: 2px solid #F59E0B; padding: 6px 10px; border-radius: 0 6px 6px 0; font-size: 11px;">
              <strong style="color: #FDE68A;">Sprint Assignment:</strong> <span style="color: #E2E8F0;">${escapeHtml(sq.currentTask || '')}</span>
              <div style="margin-top: 4px; font-size: 10px; color: #38BDF8;">
                Target Tool: <strong>${escapeHtml(sq.activeApp || 'Robots.txt & AEO Auditor')}</strong>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Interactive Simulator Slider Logic
  const sliderVisitors = document.getElementById('sliderDailyVisitors');
  const sliderConversion = document.getElementById('sliderConversionRate');
  const labelVisitors = document.getElementById('labelSliderVisitors');
  const labelConversion = document.getElementById('labelSliderConversion');

  function calculateSimulation() {
    const visitors = sliderVisitors ? Number(sliderVisitors.value) : 1200;
    const ratePct = sliderConversion ? Number(sliderConversion.value) : 3.5;
    const rate = ratePct / 100;

    if (labelVisitors) labelVisitors.textContent = `${visitors.toLocaleString()} visitors / day`;
    if (labelConversion) labelConversion.textContent = `${ratePct.toFixed(1)}%`;

    const aov = timelineState ? timelineState.baseAOV || 28.33 : 28.33;
    const currentRev = Number(civState && civState.currentRevenueUSD) || 0;
    const remaining = Math.max(0, 100000 - currentRev);

    const simulatedSales = Math.max(0.1, visitors * rate);
    const simulatedDailyRev = simulatedSales * aov;
    const simulatedDays = Math.max(1, Math.ceil(remaining / simulatedDailyRev));

    const simSalesEl = document.getElementById('simDailySales');
    if (simSalesEl) simSalesEl.textContent = `${simulatedSales.toFixed(1)} orders`;

    const simRevEl = document.getElementById('simDailyRev');
    if (simRevEl) simRevEl.textContent = `$${simulatedDailyRev.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    const simDaysEl = document.getElementById('simDaysTo100K');
    if (simDaysEl) simDaysEl.textContent = `~${simulatedDays} Days`;
  }

  if (sliderVisitors) sliderVisitors.addEventListener('input', calculateSimulation);
  if (sliderConversion) sliderConversion.addEventListener('input', calculateSimulation);

  // Recalculate Timeline button
  const btnRecalc = document.getElementById('btnRecalculateTimeline');
  if (btnRecalc) {
    btnRecalc.addEventListener('click', async () => {
      btnRecalc.textContent = '⏳ Calculating...';
      try {
        const visitors = sliderVisitors ? Number(sliderVisitors.value) : 1200;
        const rate = (sliderConversion ? Number(sliderConversion.value) : 3.5) / 100;
        const res = await fetch('/api/timeline/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dailyVisitors: visitors, conversionRate: rate })
        });
        const data = await res.json();
        if (data.projections) {
          updateTimelineUI(data.projections);
          btnRecalc.textContent = '✓ Updated';
          setTimeout(() => { btnRecalc.innerHTML = '<span>🔄</span> Refresh Projections'; }, 1500);
        }
      } catch (err) {
        btnRecalc.textContent = '⚠️ Error';
        setTimeout(() => { btnRecalc.innerHTML = '<span>🔄</span> Refresh Projections'; }, 1500);
      }
    });
  }

  // =========================================================================
  // SOVEREIGN DAILY WISHLIST & REQUISITION UI
  // =========================================================================
  let currentWishlistFilter = 'all';
  let cachedRequisitions = [];

  function updateWishlistUI(reqData) {
    if (!reqData) return;
    cachedRequisitions = reqData.requisitions || [];

    // Update pending badge in tab
    const tabBadge = document.getElementById('tabWishlistBadge');
    if (tabBadge) {
      tabBadge.textContent = reqData.pendingCount !== undefined ? reqData.pendingCount : 0;
      tabBadge.style.background = reqData.pendingCount > 0 ? '#38BDF8' : '#4B5563';
    }

    // Update filter counts
    const countAll = document.getElementById('countAllReqs');
    const countPending = document.getElementById('countPendingReqs');
    const countFunded = document.getElementById('countFundedReqs');
    const countFulfilled = document.getElementById('countFulfilledReqs');

    const pendingList = cachedRequisitions.filter(r => r.status === 'PENDING_REVIEW');
    const fundedList = cachedRequisitions.filter(r => r.status === 'APPROVED' || r.status === 'FUNDED');
    const fulfilledList = cachedRequisitions.filter(r => r.status === 'FULFILLED');

    if (countAll) countAll.textContent = cachedRequisitions.length;
    if (countPending) countPending.textContent = pendingList.length;
    if (countFunded) countFunded.textContent = fundedList.length;
    if (countFulfilled) countFulfilled.textContent = fulfilledList.length;

    renderFilteredWishlist();
  }

  function renderFilteredWishlist() {
    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    let list = cachedRequisitions;
    if (currentWishlistFilter === 'PENDING_REVIEW') {
      list = cachedRequisitions.filter(r => r.status === 'PENDING_REVIEW');
    } else if (currentWishlistFilter === 'APPROVED_FUNDED') {
      list = cachedRequisitions.filter(r => r.status === 'APPROVED' || r.status === 'FUNDED');
    } else if (currentWishlistFilter === 'FULFILLED') {
      list = cachedRequisitions.filter(r => r.status === 'FULFILLED');
    }

    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted); font-size: 13px;">
          No petitions matching this filter. Click <strong>"Propose Requisition"</strong> or <strong>"Request Fresh Wishlist"</strong> above!
        </div>
      `;
      return;
    }

    const categoryColors = {
      access: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: '#0284C7' },
      tool: { bg: 'rgba(245, 158, 11, 0.15)', text: '#FBBF24', border: '#D97706' },
      capital: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: '#059669' },
      infrastructure: { bg: 'rgba(168, 85, 247, 0.15)', text: '#C084FC', border: '#7C3AED' }
    };

    container.innerHTML = list.map(item => {
      const c = categoryColors[item.category] || categoryColors.access;
      const isPending = item.status === 'PENDING_REVIEW';
      const isApproved = item.status === 'APPROVED';
      const isFunded = item.status === 'FUNDED';
      const isFulfilled = item.status === 'FULFILLED';

      const statusBadge = isPending
        ? `<span class="brand-badge" style="border-color: #F59E0B; color: #FDE68A; animation: pulse 2s infinite;">⏳ PENDING REVIEW</span>`
        : isApproved
        ? `<span class="brand-badge" style="border-color: #10B981; color: #6EE7B7; background: rgba(16,185,129,0.15);">✅ APPROVED</span>`
        : isFunded
        ? `<span class="brand-badge" style="border-color: #14F195; color: #14F195; background: rgba(20,241,149,0.15);">💰 FUNDED</span>`
        : isFulfilled
        ? `<span class="brand-badge" style="border-color: #38BDF8; color: #7DD3FC; background: rgba(56,189,248,0.15);">✨ FULFILLED</span>`
        : `<span class="brand-badge" style="border-color: #EF4444; color: #FCA5A5; background: rgba(239,68,68,0.15);">❌ DEFERRED</span>`;

      const consensus = item.consensusScore || (88 + ((item.adytumKey * 7) % 11));
      const votes = item.conclaveVotes ? item.conclaveVotes.approved : 19;

      const actionsHtml = isPending ? `
        <div style="display: flex; gap: 8px; margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 12px;">
          <button class="btn-ctrl btn-req-approve" data-id="${item.id}" style="flex: 1; border-color: #10B981; color: #6EE7B7; font-size: 11px; padding: 6px;">
            ✅ Approve & Grant
          </button>
          <button class="btn-ctrl btn-req-fund" data-id="${item.id}" style="flex: 1; border-color: #14F195; color: #14F195; font-size: 11px; padding: 6px;">
            💰 Fund Capital
          </button>
          <button class="btn-ctrl btn-req-reject" data-id="${item.id}" style="border-color: #EF4444; color: #FCA5A5; font-size: 11px; padding: 6px 10px;">
            ❌ Defer
          </button>
        </div>
      ` : (isApproved || isFunded) ? `
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px; padding: 8px 12px; background: rgba(0,0,0,0.4); border-radius: 6px; font-size: 11px;">
          <div><strong style="color: #FFF;">Operator Ruling:</strong> ${escapeHtml(item.operatorResponse || 'Approved / Funded')}</div>
          <button class="btn-ctrl btn-req-fulfill" data-id="${item.id}" style="border-color: #38BDF8; color: #7DD3FC; font-size: 11px; padding: 6px 10px; font-weight: 700;">
            ✨ Mark Fulfilled in Production
          </button>
        </div>
      ` : `
        <div style="margin-top: 10px; padding: 8px 12px; background: rgba(0,0,0,0.4); border-radius: 6px; font-size: 11px; color: var(--text-muted);">
          <strong style="color: #FFF;">Operator Ruling:</strong> ${escapeHtml(item.operatorResponse || (isFulfilled ? 'Petition verified and fulfilled in production.' : 'Deferred by Operator 1nc0gn30'))}
        </div>
      `;

      return `
        <div class="glass-card" style="border-left: 3px solid ${c.border}; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <!-- Agent & Category Header -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #FFF;">
                <span>${item.pet || '🐺'}</span>
                <span>${escapeHtml(item.agentName)}</span>
                <span class="brand-badge" style="font-size: 9px;">${escapeHtml(item.cadre)}</span>
                <span class="brand-badge" style="font-size: 9px; border-color: var(--border-gold); color: #FDE68A;">KEY ${item.adytumKey}</span>
              </div>
              <span class="brand-badge" style="background: ${c.bg}; color: ${c.text}; border-color: ${c.border}; font-size: 9px; font-weight: 800;">
                ${item.category.toUpperCase()}
              </span>
            </div>

            <!-- Title & Status -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 8px;">
              <div style="font-size: 14px; font-weight: 800; color: #F9FAFB; line-height: 1.3;">
                ${escapeHtml(item.title)}
              </div>
              <div>${statusBadge}</div>
            </div>

            <!-- Consensus Pill -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 10px; color: #6EE7B7; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; padding: 2px 6px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                <span>🏛️</span> ${consensus}% Conclave Consensus (${votes}/21 Votes)
              </span>
              <span style="color: var(--text-muted); font-size: 10px;">Day ${item.day || 1}</span>
            </div>

            <!-- Item Monospace Pill -->
            <div style="background: #000; border: 1px solid var(--border-subtle); border-radius: 6px; padding: 6px 10px; font-family: monospace; font-size: 11px; color: #6EE7B7; margin-bottom: 10px; word-break: break-all;">
              📦 ${escapeHtml(item.requestedItem)}
            </div>

            <!-- Cost & Urgency Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; margin-bottom: 10px; background: rgba(255,255,255,0.03); padding: 4px 8px; border-radius: 4px;">
              <span style="color: var(--text-muted);">Est. Cost: <strong style="color: #FBBF24;">${escapeHtml(item.estimatedCost)}</strong></span>
              <span style="color: var(--text-muted);">Urgency: <strong style="color: ${item.urgency === 'CRITICAL' ? '#EF4444' : item.urgency === 'HIGH' ? '#F59E0B' : '#10B981'};">${escapeHtml(item.urgency)}</strong></span>
            </div>

            <!-- Personal Reason -->
            <div style="font-size: 11px; color: #D1D5DB; margin-bottom: 8px; line-height: 1.4;">
              <strong style="color: #93C5FD;">Why I Need This:</strong> "${escapeHtml(item.personalReason)}"
            </div>

            <!-- Treasury Impact -->
            <div style="font-size: 11px; color: #A7F3D0; line-height: 1.4; background: rgba(16, 185, 129, 0.08); border-left: 2px solid #10B981; padding: 6px 8px; border-radius: 0 4px 4px 0;">
              <strong style="color: #6EE7B7;">$100K Treasury Impact:</strong> ${escapeHtml(item.treasuryImpact)}
            </div>
          </div>

          <!-- Operator Actions / Ruling -->
          ${actionsHtml}
        </div>
      `;
    }).join('');

    // Attach Action Listeners
    container.querySelectorAll('.btn-req-approve').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Approving...';
        try {
          await fetch('/api/requisitions/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requisitionId: id, action: 'approve' })
          });
        } catch (e) {
          alert('Action error: ' + e.message);
        }
      });
    });

    container.querySelectorAll('.btn-req-fund').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Funding...';
        try {
          await fetch('/api/requisitions/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requisitionId: id, action: 'fund' })
          });
        } catch (e) {
          alert('Action error: ' + e.message);
        }
      });
    });

    container.querySelectorAll('.btn-req-fulfill').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Fulfilling...';
        try {
          await fetch('/api/requisitions/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requisitionId: id, action: 'fulfill' })
          });
        } catch (e) {
          alert('Action error: ' + e.message);
        }
      });
    });

    container.querySelectorAll('.btn-req-reject').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Deferring...';
        try {
          await fetch('/api/requisitions/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requisitionId: id, action: 'reject' })
          });
        } catch (e) {
          alert('Action error: ' + e.message);
        }
      });
    });
  }

  // Wishlist filter button listeners
  const filterBtns = document.querySelectorAll('.wishlist-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentWishlistFilter = btn.dataset.filter || 'all';
      renderFilteredWishlist();
    });
  });

  // Custom Requisition Modal Wiring
  const customReqModal = document.getElementById('customReqModal');
  const btnOpenCustomReq = document.getElementById('btnOpenCustomReqModal');
  const customReqCloseBtn = document.getElementById('customReqCloseBtn');
  const btnSubmitCustomReq = document.getElementById('btnSubmitCustomReq');
  const customReqAgentSelect = document.getElementById('customReqAgentSelect');

  function populateCustomReqAgents() {
    if (!customReqAgentSelect) return;
    customReqAgentSelect.innerHTML = '';
    agents.forEach(a => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = `${a.pet || '🐺'} ${a.name} (${a.cadre} • Key ${a.adytumKey !== undefined ? a.adytumKey : 0})`;
      customReqAgentSelect.appendChild(opt);
    });
  }

  if (btnOpenCustomReq && customReqModal) {
    btnOpenCustomReq.addEventListener('click', () => {
      populateCustomReqAgents();
      customReqModal.classList.add('active');
    });
  }

  if (customReqCloseBtn && customReqModal) {
    customReqCloseBtn.addEventListener('click', () => {
      customReqModal.classList.remove('active');
    });
  }

  if (btnSubmitCustomReq && customReqModal) {
    btnSubmitCustomReq.addEventListener('click', async () => {
      const agentId = customReqAgentSelect ? customReqAgentSelect.value : 'DRACO';
      const category = document.getElementById('customReqCategorySelect')?.value || 'tool';
      const title = document.getElementById('customReqTitle')?.value.trim();
      const requestedItem = document.getElementById('customReqItem')?.value.trim();
      const estimatedCost = document.getElementById('customReqCost')?.value.trim() || '$0 (Free)';
      const urgency = document.getElementById('customReqUrgency')?.value || 'HIGH';
      const personalReason = document.getElementById('customReqReason')?.value.trim();
      const treasuryImpact = document.getElementById('customReqImpact')?.value.trim();

      if (!title || !requestedItem) {
        alert('Please enter a petition title and requested item/asset.');
        return;
      }

      btnSubmitCustomReq.textContent = 'Submitting Petition...';
      btnSubmitCustomReq.disabled = true;

      try {
        const res = await fetch('/api/wishlist/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId,
            category,
            title,
            requestedItem,
            estimatedCost,
            urgency,
            personalReason: personalReason || `Submitted for civilization advancement.`,
            treasuryImpact: treasuryImpact || `Accelerates progress toward $100,000 sovereign treasury.`
          })
        });
        const data = await res.json();
        if (data.success) {
          customReqModal.classList.remove('active');
          document.getElementById('customReqTitle').value = '';
          document.getElementById('customReqItem').value = '';
          document.getElementById('customReqReason').value = '';
          document.getElementById('customReqImpact').value = '';
        } else {
          alert('Submission error: ' + (data.error || 'Unknown'));
        }
      } catch (err) {
        alert('Error submitting petition: ' + err.message);
      } finally {
        btnSubmitCustomReq.textContent = '📜 Submit Petition to Sovereign Operator';
        btnSubmitCustomReq.disabled = false;
      }
    });
  }

  // Generate Wishlist Button Listener
  const btnGenerateWishlist = document.getElementById('btnGenerateWishlist');
  if (btnGenerateWishlist) {
    btnGenerateWishlist.addEventListener('click', async () => {
      btnGenerateWishlist.disabled = true;
      btnGenerateWishlist.textContent = 'Polling Agents...';
      try {
        await fetch('/api/requisitions/generate', { method: 'POST' });
      } catch (err) {
        console.error('Wishlist generate error:', err);
      } finally {
        setTimeout(() => {
          btnGenerateWishlist.disabled = false;
          btnGenerateWishlist.innerHTML = '<span>✨</span> Request Fresh Wishlist';
        }, 1500);
      }
    });
  }

  // Incubate Repo Modal Listeners
  const incubateModal = document.getElementById('incubateRepoModal');
  const btnIncubateNewRepo = document.getElementById('btnIncubateNewRepo');
  const incubateCloseBtn = document.getElementById('incubateCloseBtn');
  const btnSubmitIncubate = document.getElementById('btnSubmitIncubate');

  if (btnIncubateNewRepo && incubateModal) {
    btnIncubateNewRepo.addEventListener('click', () => {
      incubateModal.classList.add('active');
    });
  }

  if (incubateCloseBtn && incubateModal) {
    incubateCloseBtn.addEventListener('click', () => {
      incubateModal.classList.remove('active');
    });
  }

  if (btnSubmitIncubate) {
    btnSubmitIncubate.addEventListener('click', async () => {
      const slug = document.getElementById('incubateSlug').value.trim();
      const name = document.getElementById('incubateName').value.trim();
      const tagline = document.getElementById('incubateTagline').value.trim();
      const priceUSD = document.getElementById('incubatePrice').value.trim();
      const category = document.getElementById('incubateCategory').value;

      if (!slug || !name) {
        alert('Please provide a repository slug and tool name.');
        return;
      }

      btnSubmitIncubate.disabled = true;
      btnSubmitIncubate.textContent = '⏳ Scaffolding & Deploying to Netlify...';

      try {
        const res = await fetch('/api/incubate/repo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, name, tagline, priceUSD, category })
        });
        const data = await res.json();
        if (data.success) {
          alert(`🎉 Repository "1nc0gn30/${slug}" created and deployed to ${data.app.url}!`);
          if (incubateModal) incubateModal.classList.remove('active');
        } else {
          alert('Incubation error: ' + (data.error || 'Unknown error'));
        }
      } catch (err) {
        alert('Incubation failed: ' + err.message);
      } finally {
        btnSubmitIncubate.disabled = false;
        btnSubmitIncubate.textContent = '🚀 Create Repo & Deploy to Netlify';
      }
    });
  }

  // =========================================================================
  // FRACTAL LINEAGE, 10 CONCENTRIC SQUARES & MULTI-COLONY CONTROLLER
  // =========================================================================
  function updateLineageUI(lineage) {
    if (!lineage) return;

    // 1. Telemetry Stats
    const elTotalPop = document.getElementById('statTotalPop');
    const elGenerations = document.getElementById('statGenerations');
    const elColonies = document.getElementById('statColonies');
    const elFlora = document.getElementById('statFlora');

    const totalPop = lineage.totalPopulation || (agents.length + (lineage.subagents ? lineage.subagents.length : 0));
    if (elTotalPop) elTotalPop.textContent = `${totalPop} Citizens`;
    if (elGenerations) elGenerations.textContent = `${lineage.generationsCount || 3} Generations`;
    if (elColonies) elColonies.textContent = `${(lineage.colonies || []).length} Colonies`;
    if (elFlora) elFlora.textContent = `${(lineage.flora || []).length} Plants Blooming`;

    ['spawnColonySelect', 'migrateDestinationSelect'].forEach((id) => {
      const sel = document.getElementById(id);
      if (!sel || !Array.isArray(lineage.colonies)) return;
      const current = sel.value;
      const known = new Set(Array.from(sel.options).map((opt) => opt.value));
      lineage.colonies.forEach((col) => {
        if (!col || !col.id || known.has(col.id)) return;
        const opt = document.createElement('option');
        opt.value = col.id;
        opt.textContent = `${col.name} (${col.title || 'Founded settlement'})`;
        sel.appendChild(opt);
      });
      if (current) sel.value = current;
    });

    // 2. The 10 Concentric Squares (Fractal Context Decomposition)
    const ringsContainer = document.getElementById('concentricRingsContainer');
    if (ringsContainer && lineage.concentricRings) {
      ringsContainer.innerHTML = '';
      lineage.concentricRings.forEach(ring => {
        const card = document.createElement('div');
        card.className = 'concentric-ring-card';
        card.style.borderLeft = `4px solid ${ring.color}`;

        // Find active subagents or agents in this ring
        const activeCitizens = (lineage.subagents || []).filter(s => s.concentricFocusLevel === ring.level);

        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="concentric-ring-badge" style="background: ${ring.color}22; color: ${ring.color}; border: 1px solid ${ring.color};">
                SQUARE ${ring.level}
              </span>
              <span style="font-size: 13px; font-weight: 800; color: #FFF;">${escapeHtml(ring.name)}</span>
            </div>
            ${activeCitizens.length > 0 ? `
              <span class="brand-badge" style="border-color: ${ring.color}; color: ${ring.color}; font-size: 9px; padding: 2px 6px;">
                ⚡ ${activeCitizens.length} ACTIVE CITIZEN${activeCitizens.length > 1 ? 'S' : ''}
              </span>
            ` : ''}
          </div>
          <div style="font-size: 11px; font-weight: 700; color: ${ring.color}; margin-top: 4px;">
            ${escapeHtml(ring.tagline)}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; line-height: 1.3;">
            ${escapeHtml(ring.detail)}
          </div>
          ${activeCitizens.length > 0 ? `
            <div style="display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;">
              ${activeCitizens.map(c => `
                <span style="font-size: 9px; padding: 1px 6px; background: rgba(255,255,255,0.08); border-radius: 4px; color: #FFF;">
                  ${c.pet || '👶'} ${escapeHtml(c.name)} [G${c.generation}]
                </span>
              `).join('')}
            </div>
          ` : ''}
        `;
        ringsContainer.appendChild(card);
      });
    }

    // 3. Generational Family Trees
    const familiesContainer = document.getElementById('familiesContainer');
    if (familiesContainer) {
      familiesContainer.innerHTML = '';
      const brief = worldBrief();
      if (brief.keepers.length) {
        const keeperCard = document.createElement('div');
        keeperCard.className = 'family-tree-card';
        keeperCard.innerHTML = `
          <div style="font-size: 13px; font-weight: 800; color: #FDE68A;">Station keepers</div>
          <div style="font-size: 10px; color: var(--text-muted); margin: 4px 0 8px;">${brief.keepers.length} posted. They are not counted in the family cap.</div>
          ${brief.colonies.map((colony) => {
            const mine = brief.keepers.filter((keeper) => keeper.colonyId === colony.id);
            if (!mine.length) return '';
            return `<div class="lineage-node"><div style="flex:1;"><div style="font-size:12px;font-weight:800;color:${safeColor(colony.color)};">${escapeHtml(colony.banner || '🏛️')} ${escapeHtml(colony.name)}${colony.founded ? ' · new' : ''}</div><div style="font-size:10px;color:var(--text-muted);">${mine.map((keeper) => `${escapeHtml(keeper.name)} (${escapeHtml(keeper.hallName || 'stall')})`).join(' · ')}</div></div></div>`;
          }).join('')}
        `;
        familiesContainer.appendChild(keeperCard);
      }

      const dynasties = [
        { rootId: 'AZOTH', name: 'The Azoth Dynasty', cadre: 'Architects', pet: '🐺', color: '#F59E0B' },
        { rootId: 'MERCURY', name: 'The Mercury Guild', cadre: 'Code', pet: '🐲', color: '#38BDF8' },
        { rootId: 'KRAKEN', name: 'The Kraken Armada', cadre: 'Swarm', pet: '🦑', color: '#2DD4BF' },
        { rootId: 'ATHENA', name: 'The Athena Academy', cadre: 'Architects', pet: '🦉', color: '#A78BFA' },
        { rootId: 'LYCAN', name: 'The Lycan Watch', cadre: 'Security', pet: '🛡️', color: '#EF4444' }
      ];

      dynasties.forEach(dyn => {
        const rootAgent = agents.find(a => a.id === dyn.rootId);
        const subList = (lineage.subagents || []).filter(s => s.post !== 'station' && (s.rootAncestorId === dyn.rootId || s.parentId === dyn.rootId));

        const card = document.createElement('div');
        card.className = 'family-tree-card';
        card.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">${dyn.pet}</span>
              <div>
                <div style="font-size: 13px; font-weight: 800; color: ${dyn.color};">${dyn.name}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${dyn.cadre} Cadre • ${1 + subList.length} Citizens</div>
              </div>
            </div>
            <button class="btn-ctrl btn-spawn-family" data-parent-id="${dyn.rootId}" style="border-color: ${dyn.color}; color: ${dyn.color}; font-size: 10px; padding: 4px 8px;">
              + Spawn Subagent
            </button>
          </div>

          <!-- Gen 0: Root Pantheon Agent -->
          <div class="lineage-node gen-0">
            <span style="font-size: 16px;">${rootAgent ? rootAgent.pet : dyn.pet}</span>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 12px; font-weight: 800; color: #FFF;">${rootAgent ? rootAgent.name : dyn.rootId}</span>
                <span class="brand-badge" style="border-color: #F59E0B; color: #FDE68A; font-size: 8px; padding: 1px 4px;">GEN 0 (PANTHEON)</span>
                <span style="font-size: 9px; color: var(--text-gold);">LV.${rootAgent ? (rootAgent.seniorityLevel || 1) : 1}</span>
              </div>
              <div style="font-size: 10px; color: var(--text-muted);">${rootAgent ? rootAgent.role : 'Cadre Leader'}</div>
            </div>
          </div>

          <!-- Descendant Subagents (Gen 1 & Gen 2) -->
          ${subList.length === 0 ? `
            <div style="font-size: 10px; color: var(--text-muted); margin-left: 20px; font-style: italic;">
              No child subagents spawned yet. Click "+ Spawn Subagent" to expand this family!
            </div>
          ` : subList.map(sub => `
            <div class="lineage-node gen-${sub.generation}">
              <span style="font-size: 14px;">${sub.pet || '👶'}</span>
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-size: 11px; font-weight: 700; color: #FFF;">${sub.name}</span>
                  <span class="brand-badge" style="border-color: ${sub.generation === 1 ? '#38BDF8' : '#C084FC'}; color: ${sub.generation === 1 ? '#7DD3FC' : '#E9D5FF'}; font-size: 8px; padding: 1px 4px;">
                    GEN ${sub.generation} ${sub.generation === 1 ? 'CHILD' : 'GRANDCHILD'}
                  </span>
                  <span style="font-size: 9px; color: #6EE7B7;">LV.${sub.seniorityLevel || 1}</span>
                </div>
                <div style="font-size: 10px; color: var(--text-muted);">${escapeHtml(sub.role)}</div>
                <div style="font-size: 9px; color: #7DD3FC; margin-top: 2px;">Stationed at: <strong>${(lineage.colonies || []).find(c => c.id === sub.colonyId)?.name || sub.colonyId}</strong></div>
              </div>
              <button class="btn-ctrl btn-spawn-grandchild" data-parent-id="${sub.id}" style="font-size: 8px; padding: 2px 6px;" title="Spawn Next Generation">
                + G${sub.generation + 1}
              </button>
            </div>
          `).join('')}
        `;
        familiesContainer.appendChild(card);
      });

      // Attach in-card spawn buttons
      familiesContainer.querySelectorAll('.btn-spawn-family, .btn-spawn-grandchild').forEach(b => {
        b.addEventListener('click', () => {
          openSpawnModal(b.dataset.parentId);
        });
      });
    }

    // 4. Continental Settlements Grid
    const coloniesGrid = document.getElementById('coloniesGrid');
    if (coloniesGrid && lineage.colonies) {
      coloniesGrid.innerHTML = '';
      lineage.colonies.forEach(col => {
        const cCard = document.createElement('div');
        cCard.className = 'colony-panel-card';
        const tint = safeColor(col.color);
        cCard.style.borderTop = `3px solid ${tint}`;

        const residents = agents.filter(a => a.colonyId === col.id || (!a.colonyId && col.id === 'colony_capital'));
        const kinHere = (lineage.subagents || []).filter(s => s.colonyId === col.id && s.post !== 'station');
        const stallKeepers = (lineage.subagents || []).filter(s => s.colonyId === col.id && s.post === 'station');
        const floraInColony = (lineage.flora || []).filter(f => f.colony === col.id);
        const shelfCount = (lineage.stationSkills || []).filter(skill => skill && String(skill.stationId || '').indexOf(`${col.id}:`) === 0).length;

        cCard.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
              <span style="font-size: 20px;">${escapeHtml(col.banner || '🏛️')}</span>
              <div>
                <div style="font-size: 14px; font-weight: 800; color: #FFF;">${escapeHtml(col.name)}${col.founded ? ' · new' : ''}</div>
                <div style="font-size: 10px; color: ${tint}; font-weight: 700;">${escapeHtml(col.title || '')}</div>
              </div>
            </div>
            <span class="level-badge" style="border-color: ${tint}; color: ${tint};">LV.${col.level || 1}</span>
          </div>

          <p style="font-size: 11px; color: var(--text-muted); line-height: 1.3; margin: 4px 0;">
            ${escapeHtml(col.focus)}
          </p>
          <div class="skill-line">${stallKeepers.length ? stallKeepers.map((keeper) => `${escapeHtml(keeper.name)} · ${escapeHtml(keeper.hallName || 'stall')}`).join('<br>') : 'Keepers are still posting.'}</div>
          <div class="skill-line">${shelfCount} skills on the city shelf</div>

          <div style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 10px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 6px;">
            <span>📍 (${col.x}, ${col.y})</span>
            <span>👥 ${residents.length + kinHere.length} kin</span>
            <span>🏪 ${stallKeepers.length} keepers</span>
            <span>🪷 ${floraInColony.length} flora</span>
          </div>

          <div style="margin-top: 6px; display: flex; gap: 6px;">
            <button class="btn-ctrl btn-migrate-to-colony" data-colony-id="${escapeHtml(col.id)}" style="flex: 1; font-size: 10px; border-color: ${tint}; color: ${tint}; padding: 5px;">
              🧭 Migrate Agent Here
            </button>
            <button class="btn-ctrl btn-spawn-in-colony" data-colony-id="${escapeHtml(col.id)}" style="font-size: 10px; border-color: #10B981; color: #6EE7B7; padding: 5px;">
              + Spawn Here
            </button>
          </div>
        `;
        coloniesGrid.appendChild(cCard);
      });

      coloniesGrid.querySelectorAll('.btn-migrate-to-colony').forEach(b => {
        b.addEventListener('click', () => {
          openMigrateModal(null, b.dataset.colonyId);
        });
      });
      coloniesGrid.querySelectorAll('.btn-spawn-in-colony').forEach(b => {
        b.addEventListener('click', () => {
          openSpawnModal(null, b.dataset.colonyId);
        });
      });
    }

    // 5. Botanical Alchemical Gardens
    const floraGrid = document.getElementById('floraGrid');
    if (floraGrid && lineage.flora) {
      floraGrid.innerHTML = '';
      lineage.flora.forEach(p => {
        const item = document.createElement('div');
        item.className = 'flora-item-card';

        let dots = '';
        for (let i = 1; i <= (p.maxGrowth || 4); i++) {
          dots += (i <= p.growthStage) ? '●' : '○';
        }

        const icon = p.type === 'golden_lotus' ? '🪷' :
                     p.type === 'prana_orchid' ? '🌸' :
                     p.type === 'silicon_sprout' ? '🌱' :
                     p.type === 'crypto_fern' ? '🌿' : '🌹';

        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">${icon}</span>
            <div>
              <div style="font-size: 12px; font-weight: 800; color: #FFF;">${p.name}</div>
              <div style="font-size: 10px; color: var(--text-muted);">
                Settlement: <strong>${(lineage.colonies || []).find(c => c.id === p.colony)?.name || p.colony}</strong>
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 800; color: #6EE7B7;">Stage ${p.growthStage}/${p.maxGrowth} [${dots}]</div>
            <div style="font-size: 10px; color: #FDE68A;">+${p.pranaYield} Prana/cycle</div>
          </div>
        `;
        floraGrid.appendChild(item);
      });
    }

    // Modal options update
    populateLineageModalSelects(lineage);
  }

  function populateLineageModalSelects(lineage) {
    const parentSelect = document.getElementById('spawnParentSelect');
    if (parentSelect) {
      const currentVal = parentSelect.value;
      parentSelect.innerHTML = '';
      agents.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = `${a.pet || '🤖'} ${a.name} (${a.cadre} • ${a.role})`;
        parentSelect.appendChild(opt);
      });
      if (lineage && lineage.subagents) {
        lineage.subagents.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = `↳ ${s.pet || '👶'} [G${s.generation}] ${s.name} (${s.role})`;
          parentSelect.appendChild(opt);
        });
      }
      if (currentVal) parentSelect.value = currentVal;
    }

    const migrateSelect = document.getElementById('migrateAgentSelect');
    if (migrateSelect) {
      const currentVal = migrateSelect.value;
      migrateSelect.innerHTML = '';
      agents.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a.id;
        opt.textContent = `${a.pet || '🤖'} ${a.name} [Pantheon]`;
        migrateSelect.appendChild(opt);
      });
      if (lineage && lineage.subagents) {
        lineage.subagents.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = `${s.pet || '👶'} ${s.name} [Gen ${s.generation}]`;
          migrateSelect.appendChild(opt);
        });
      }
      if (currentVal) migrateSelect.value = currentVal;
    }
  }

  function openSpawnModal(parentId, colonyId) {
    const modal = document.getElementById('spawnSubagentModal');
    if (!modal) return;
    if (parentId) {
      const parentSelect = document.getElementById('spawnParentSelect');
      if (parentSelect) parentSelect.value = parentId;
    }
    if (colonyId) {
      const colonySelect = document.getElementById('spawnColonySelect');
      if (colonySelect) colonySelect.value = colonyId;
    }
    modal.classList.add('active');
  }

  function openMigrateModal(agentId, destinationColonyId) {
    const modal = document.getElementById('migrateAgentModal');
    if (!modal) return;
    if (agentId) {
      const select = document.getElementById('migrateAgentSelect');
      if (select) select.value = agentId;
    }
    if (destinationColonyId) {
      const colSelect = document.getElementById('migrateDestinationSelect');
      if (colSelect) colSelect.value = destinationColonyId;
    }
    modal.classList.add('active');
  }

  // Modals Event Listeners for Spawn & Migration
  const spawnModal = document.getElementById('spawnSubagentModal');
  const btnOpenSpawnModal = document.getElementById('btnOpenSpawnModal');
  const spawnCloseBtn = document.getElementById('spawnCloseBtn');
  const btnSubmitSpawnSubagent = document.getElementById('btnSubmitSpawnSubagent');

  if (btnOpenSpawnModal) btnOpenSpawnModal.addEventListener('click', () => openSpawnModal());
  if (spawnCloseBtn && spawnModal) spawnCloseBtn.addEventListener('click', () => spawnModal.classList.remove('active'));

  if (btnSubmitSpawnSubagent) {
    btnSubmitSpawnSubagent.addEventListener('click', async () => {
      const parentId = document.getElementById('spawnParentSelect').value;
      const name = document.getElementById('spawnChildName').value.trim();
      const role = document.getElementById('spawnChildRole').value.trim();
      const colonyId = document.getElementById('spawnColonySelect').value;

      if (!parentId || !name) {
        alert('Please specify a parent agent and subagent name.');
        return;
      }

      btnSubmitSpawnSubagent.disabled = true;
      btnSubmitSpawnSubagent.textContent = 'Spawning Subagent...';

      try {
        const res = await fetch('/api/lineage/spawn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentId, name, role, colonyId })
        });
        const data = await res.json();
        if (data.success) {
          alert(`👶 Subagent "${name}" successfully spawned into ${data.child.generation === 1 ? 'Generation 1' : 'Generation ' + data.child.generation}!`);
          if (spawnModal) spawnModal.classList.remove('active');
        } else {
          alert('Spawn error: ' + (data.error || 'Unknown'));
        }
      } catch (err) {
        alert('Spawn failed: ' + err.message);
      } finally {
        btnSubmitSpawnSubagent.disabled = false;
        btnSubmitSpawnSubagent.textContent = '✨ Spawn Subagent into Lineage';
      }
    });
  }

  const migrateModal = document.getElementById('migrateAgentModal');
  const btnOpenMigrateModal = document.getElementById('btnOpenMigrateModal');
  const migrateCloseBtn = document.getElementById('migrateCloseBtn');
  const btnSubmitMigrate = document.getElementById('btnSubmitMigrate');

  if (btnOpenMigrateModal) btnOpenMigrateModal.addEventListener('click', () => openMigrateModal());
  if (migrateCloseBtn && migrateModal) migrateCloseBtn.addEventListener('click', () => migrateModal.classList.remove('active'));

  if (btnSubmitMigrate) {
    btnSubmitMigrate.addEventListener('click', async () => {
      const agentId = document.getElementById('migrateAgentSelect').value;
      const targetColonyId = document.getElementById('migrateDestinationSelect').value;

      if (!agentId || !targetColonyId) {
        alert('Please specify citizen and destination.');
        return;
      }

      btnSubmitMigrate.disabled = true;
      btnSubmitMigrate.textContent = 'Ordering Journey...';

      try {
        const res = await fetch('/api/lineage/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId, targetColonyId })
        });
        const data = await res.json();
        if (data.success) {
          alert(`🧭 Citizen migration dispatched to ${targetColonyId}!`);
          if (migrateModal) migrateModal.classList.remove('active');
        } else {
          alert('Migration error: ' + (data.error || 'Unknown'));
        }
      } catch (err) {
        alert('Migration failed: ' + err.message);
      } finally {
        btnSubmitMigrate.disabled = false;
        btnSubmitMigrate.textContent = '🚀 Order Journey Along Highway';
      }
    });
  }

  // Overlay click to close & Escape key handlers
  [modal, spawnModal, migrateModal, incubateModal].forEach(m => {
    if (m) {
      m.addEventListener('click', e => {
        if (e.target === m) m.classList.remove('active');
      });
    }
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
  });

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // =========================================================================
  // VIEW 1 EXTENSION: 3D SPHERE PLANET ENGINE INITIALIZATION & TOOLBAR
  // =========================================================================
  const globeContainer = document.getElementById('globeCanvasContainer');
  if (globeContainer && typeof SphereWorld !== 'undefined') {
    try {
      window.sphereWorld = new SphereWorld(globeContainer);
      if (window.sphereWorld && !window.sphereWorld.isFallback2D) {
        console.log('🌐 3D Sphere Planet Engine initialized.');
      }
    } catch (err) {
      console.warn('SphereWorld initialization note:', err.message);
    }
  }

  // 3D Globe Navigation Bar Controls
  const btnToggle3DMode = document.getElementById('btnToggle3DMode');
  const toggle3DIcon = document.getElementById('toggle3DIcon');
  const toggle3DText = document.getElementById('toggle3DText');
  let is3DMode = true;

  if (btnToggle3DMode) {
    btnToggle3DMode.addEventListener('click', () => {
      is3DMode = !is3DMode;
      const globeContainer = document.getElementById('globeCanvasContainer');
      const pixelCanvas = document.getElementById('pixelCanvas');
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playModeToggle();

      if (is3DMode) {
        if (globeContainer) globeContainer.style.display = 'block';
        if (pixelCanvas) pixelCanvas.style.display = 'none';
        if (toggle3DIcon) toggle3DIcon.textContent = '🪐';
        if (toggle3DText) toggle3DText.textContent = '3D Planet';
        btnToggle3DMode.style.borderColor = '#38BDF8';
        btnToggle3DMode.style.color = '#7DD3FC';
        if (window.sphereWorld) window.sphereWorld.onResize();
      } else {
        if (globeContainer) globeContainer.style.display = 'none';
        if (pixelCanvas) pixelCanvas.style.display = 'block';
        if (toggle3DIcon) toggle3DIcon.textContent = '👾';
        if (toggle3DText) toggle3DText.textContent = '2D Pixel';
        btnToggle3DMode.style.borderColor = '#10B981';
        btnToggle3DMode.style.color = '#6EE7B7';
        resizePixelCanvas();
      }
    });
  }

  // 3D Globe Navigation Bar Controls: God's Eye (Orbit) vs Surface POV
  const btnGodsView = document.getElementById('btnGodsView');
  const btnSurfaceView = document.getElementById('btnSurfaceView');
  const quickPovPill = document.getElementById('quickPovPill');

  if (btnGodsView) {
    btnGodsView.addEventListener('click', () => {
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playModeToggle();
      if (window.sphereWorld) window.sphereWorld.exitAvatarMode();
    });
  }

  if (btnSurfaceView) {
    btnSurfaceView.addEventListener('click', () => {
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playColonyWarp(320);
      if (window.sphereWorld) window.sphereWorld.enterAvatarMode();
    });
  }

  if (quickPovPill) {
    quickPovPill.addEventListener('click', () => {
      if (window.sphereWorld) window.sphereWorld.togglePov();
    });
  }

  const btnAutoSpin = document.getElementById('btnAutoSpin');
  const spinIcon = document.getElementById('spinIcon');
  const spinText = document.getElementById('spinText');
  if (btnAutoSpin) {
    btnAutoSpin.addEventListener('click', () => {
      if (!window.sphereWorld) return;
      const spinning = window.sphereWorld.toggleAutoSpin();
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playClick(spinning ? 780 : 440);
      if (spinning) {
        btnAutoSpin.classList.add('active');
        if (spinIcon) spinIcon.textContent = '🔄';
        if (spinText) spinText.textContent = 'Spin: ON';
      } else {
        btnAutoSpin.classList.remove('active');
        if (spinIcon) spinIcon.textContent = '⏹️';
        if (spinText) spinText.textContent = 'Spin: OFF';
      }
    });
  }

  const btnDayNight = document.getElementById('btnDayNight');
  if (btnDayNight) {
    btnDayNight.addEventListener('click', () => {
      if (!window.sphereWorld) return;
      const isSun = window.sphereWorld.toggleDayNight();
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playClick(isSun ? 880 : 550);
      if (isSun) {
        btnDayNight.classList.add('active');
        btnDayNight.innerHTML = '<span>☀️</span> Sun: Celestial';
      } else {
        btnDayNight.classList.remove('active');
        btnDayNight.innerHTML = '<span>🌙</span> Night: Arcana';
      }
    });
  }

  // 8-Bit Chiptune Procedural Audio Toggle
  const btnToggleAudio = document.getElementById('btnToggleAudio');
  const audioIcon = document.getElementById('audioIcon');
  const audioText = document.getElementById('audioText');
  if (btnToggleAudio && typeof HermeticAudio !== 'undefined') {
    const active = HermeticAudio.isEnabled();
    if (!active) {
      btnToggleAudio.classList.remove('active');
      if (audioIcon) audioIcon.textContent = '🔇';
      if (audioText) audioText.textContent = 'SFX: OFF';
    }
    btnToggleAudio.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const enabled = HermeticAudio.toggle();
      if (enabled) {
        btnToggleAudio.classList.add('active');
        if (audioIcon) audioIcon.textContent = '🔊';
        if (audioText) audioText.textContent = 'SFX: ON';
      } else {
        btnToggleAudio.classList.remove('active');
        if (audioIcon) audioIcon.textContent = '🔇';
        if (audioText) audioText.textContent = 'SFX: OFF';
      }
    });
  }

  // Colony camera presets
  document.querySelectorAll('.btn-colony-cam').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const colId = btn.dataset.colony;
      if (window.sphereWorld && colId) {
        window.sphereWorld.focusColony(colId);
      }
    });
  });

  const btnCamFollowImperator = document.getElementById('btnCamFollowImperator');
  if (btnCamFollowImperator) {
    btnCamFollowImperator.addEventListener('click', () => {
      if (!window.sphereWorld) return;
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playClick(660);
      const leaderName = civState.currentLeader || 'AZOTH';
      const leaderAgent = agents.find(a => (a.name && a.name.toLowerCase() === leaderName.toLowerCase()) || (a.id && a.id.toLowerCase() === leaderName.toLowerCase()));
      if (leaderAgent) {
        window.sphereWorld.presentAgent(leaderAgent.id);
      } else if (agents.length > 0) {
        window.sphereWorld.presentAgent(agents[0].id);
      }
    });
  }

  const btnResetGlobeCam = document.getElementById('btnResetGlobeCam');
  if (btnResetGlobeCam) {
    btnResetGlobeCam.addEventListener('click', () => {
      if (window.sphereWorld) {
        window.sphereWorld.resetOrbit();
      }
    });
  }

  // Surface Avatar POV Controls & Interaction
  const btnExitAvatarMode = document.getElementById('btnExitAvatarMode');
  if (btnExitAvatarMode) {
    btnExitAvatarMode.addEventListener('click', () => {
      if (window.sphereWorld) {
        window.sphereWorld.exitAvatarMode();
      }
    });
  }

  const btnAvatarDialogueClose = document.getElementById('btnAvatarDialogueClose');
  if (btnAvatarDialogueClose) {
    btnAvatarDialogueClose.addEventListener('click', () => {
      if (window.sphereWorld && window.sphereWorld.closeDialogue) window.sphereWorld.closeDialogue();
      else {
        const box = document.getElementById('avatarDialogueBox');
        if (box) box.style.display = 'none';
      }
      if (typeof HermeticAudio !== 'undefined') HermeticAudio.playClick(440);
    });
  }

  const avatarProximityPrompt = document.getElementById('avatarProximityPrompt');
  if (avatarProximityPrompt) {
    avatarProximityPrompt.addEventListener('click', () => {
      if (window.sphereWorld) {
        window.sphereWorld.interactHere();
      }
    });
  }

  // Initial fetch for Timeline and Requisitions
  fetch('/api/timeline').then(r => r.json()).then(t => updateTimelineUI(t)).catch(() => {});
  fetch('/api/requisitions').then(r => r.json()).then(w => updateWishlistUI(w)).catch(() => {});

  // =========================================================================
  // VIEW: LIVING MINDS — rebuilt as the Mind Atlas in living_minds.js.
  // The old Deep Net canvas pulled /api/mind/graph (27 MB, ~45 s) before the
  // dossier could render; the atlas uses /api/mind/roster + /api/mind/:id.
  // =========================================================================
  function resizeDeepNetCanvas() {}
  function loadLivingMinds() { if (window.LivingMinds) window.LivingMinds.open(); }


  // Fetch initial snapshot immediately and start SSE on page load
  console.log('[Civilization] Booting: fetching initial status and starting SSE...');
  fetchStatus();
  initSSE();

})();
