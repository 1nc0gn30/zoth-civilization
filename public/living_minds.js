/* ==========================================================================
   LIVING MINDS — The Reliquary of Minds
   Fast roster (/api/mind/roster) + per-mind dossier (/api/mind/:id).
   Never touches the 27 MB /api/mind/graph payload.
   ========================================================================== */
(function () {
  'use strict';

  const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  const HEBREW = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];
  const HEBREW_NAME = ['Aleph', 'Beth', 'Gimel', 'Daleth', 'Heh', 'Vav', 'Zain', 'Cheth', 'Teth', 'Yod', 'Kaph', 'Lamed', 'Mem', 'Nun', 'Samekh', 'Ayin', 'Peh', 'Tzaddi', 'Qoph', 'Resh', 'Shin', 'Tav'];
  const TAROT = ['The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor', 'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit', 'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance', 'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'];
  const LIVE_MS = 10 * 60 * 1000;

  const $ = (id) => document.getElementById(id);
  const state = {
    roster: [], loaded: false, loading: null,
    cadre: 'all', query: '', selected: null,
    detail: null, memLimit: 40, valence: 'all', tab: 'soul',
    reqId: 0,
  };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clean = (s) => String(s || '')
    .replace(/\*\*/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ').trim();
  const fmt = (n) => (Number(n) || 0).toLocaleString('en-US');
  const human = (s) => clean(String(s || '').replace(/^colony_/, '').replace(/[_-]+/g, ' ')).replace(/\b\w/g, (c) => c.toUpperCase());
  const keyNum = (s) => { const m = /Key\s*(\d+)/i.exec(String(s || '')); return m ? Number(m[1]) : null; };
  const cardName = (s) => { const m = /\(([^)]+)\)/.exec(String(s || '')); return m ? m[1] : ''; };

  function ago(iso) {
    const t = Date.parse(iso); if (!t) return '';
    const s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.round(s / 60) + 'm ago';
    if (s < 86400) return Math.round(s / 3600) + 'h ago';
    return Math.round(s / 86400) + 'd ago';
  }
  function stamp(iso) {
    const d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  }

  async function getJSON(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(url + ' → ' + r.status);
    return r.json();
  }

  /* ---------------- Soul / memory parsing ---------------- */
  function section(md, title) {
    const re = new RegExp('^##\\s+' + title + '\\s*$([\\s\\S]*?)(?=^##\\s|(?![\\s\\S]))', 'mi');
    const m = re.exec(md); return m ? m[1].trim() : '';
  }
  function parseSoul(md) {
    md = String(md || '');
    const priorities = section(md, 'Lasting Priorities').split('\n').map((l) => l.replace(/^\s*\d+\.\s*/, '')).map(clean).filter(Boolean);
    const ledger = [];
    section(md, 'Current Ledger').split('\n').forEach((l) => {
      const m = /^\s*-\s*\*\*([^*]+)\*\*:\s*(.*)$/.exec(l);
      if (m && clean(m[2])) ledger.push([clean(m[1]), clean(m[2])]);
    });
    const floor = clean(section(md, 'Stoic Floor'));
    const visions = [];
    section(md, 'Embedded Card Visuals \\(Inner Sanctum\\)').split('\n').forEach((l) => {
      const m = /\*\*Key\s+(\d+)\s*\(([^)]+)\)\*\*:\s*!\[[^\]]*\]\(([^)]*)\)\s*(?:·\s*\*([^*]*)\*)?/.exec(l);
      if (m && m[3]) visions.push({ key: Number(m[1]), card: m[2], image: m[3], symbol: clean(m[4] || '') });
    });
    visions.sort((a, b) => a.key - b.key);
    return { priorities, ledger, floor, visions };
  }
  function parseMemories(md) {
    const out = [];
    String(md || '').split(/^##\s+/m).forEach((block) => {
      const head = /^\[([^\]]+)\]\s+(\S+)\s+·\s+([^·\n]+?)(?:\s+·\s+(Key\s+\d+))?\s*$/m.exec(block);
      if (!head) return;
      const f = {};
      block.split('\n').forEach((l) => { const m = /^\s*-\s*\*\*([^*]+)\*\*:\s*(.*)$/.exec(l); if (m) f[m[1].toLowerCase()] = m[2]; });
      const img = /\]\(([^)]+)\)/.exec(f.visual || '');
      out.push({
        id: head[1], at: head[2], kind: clean(head[3]).replace(/_/g, ' '), key: keyNum(head[4] || f.key),
        place: f.place || '', peers: clean(f.peers || ''), valence: clean(f.valence || 'ordinary').toLowerCase(),
        text: clean(f.impression || f.vision || ''), image: img ? img[1] : '', card: (/!\[([^\]]*)\]/.exec(f.visual || '') || [])[1] || '',
      });
    });
    return out.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }

  /* ---------------- Masthead ---------------- */
  function renderMast() {
    const r = state.roster;
    const hold = r.reduce((s, m) => s + (m.holdCloseCount || 0), 0);
    const rep = r.reduce((s, m) => s + (m.repressedCount || 0), 0);
    const ord = r.reduce((s, m) => s + (m.ordinaryCount || 0), 0);
    const total = hold + rep + ord;
    $('lmEyebrowCount').textContent = r.length + ' sovereigns';
    $('lmEyebrowMem').textContent = fmt(total) + ' memories';
    $('mindStatHoldClose').textContent = fmt(hold);
    $('mindStatOrdinary').textContent = fmt(ord);
    $('mindStatRepressed').textContent = fmt(rep);
    $('mindStatTotalMinds').textContent = r.length;
    const bar = $('lmRibbonBar');
    const segs = bar.querySelectorAll('.seg');
    [hold, ord, rep].forEach((v, i) => { segs[i].style.flex = String(Math.max(v, total * 0.004)); });
    bar.setAttribute('aria-label', `Hold-close ${hold}, ordinary ${ord}, repressed ${rep}`);
  }

  /* ---------------- Roster ---------------- */
  function renderChips() {
    const counts = {};
    state.roster.forEach((m) => { const c = m.cadre || 'Unaligned'; counts[c] = (counts[c] || 0) + 1; });
    const cadres = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    $('lmCadreChips').innerHTML = ['all'].concat(cadres).map((c) =>
      `<button type="button" class="lm-chip${state.cadre === c ? ' is-on' : ''}" data-cadre="${esc(c)}" aria-pressed="${state.cadre === c}">${c === 'all' ? 'All' : esc(c)}<span class="n">${c === 'all' ? state.roster.length : counts[c]}</span></button>`
    ).join('');
  }
  function filtered() {
    const q = state.query.toLowerCase();
    return state.roster.filter((m) => {
      if (state.cadre !== 'all' && (m.cadre || 'Unaligned') !== state.cadre) return false;
      if (!q) return true;
      return [m.name, m.id, m.role, m.colony, m.cadre, m.key].join(' ').toLowerCase().includes(q);
    });
  }
  function renderRoster() {
    const list = filtered();
    const ol = $('lmRosterList');
    if (!list.length) { ol.innerHTML = '<li class="lm-empty">No mind answers to that name.</li>'; return; }
    const now = Date.now();
    const st = ol.scrollTop, sl = ol.scrollLeft;
    const hadFocus = document.activeElement && document.activeElement.closest && document.activeElement.closest('.lm-item');
    const focusId = hadFocus ? hadFocus.dataset.id : null;
    ol.innerHTML = list.map((m) => {
      const live = now - Date.parse(m.lastActive) < LIVE_MS;
      const k = Number.isInteger(m.keyNumber) ? ROMAN[m.keyNumber] : '';
      return `<li><button type="button" class="lm-item" data-id="${esc(m.id)}" aria-current="${state.selected === m.id}" title="${esc(m.name)}: ${esc(m.role)}">
        <span class="lm-item-thumb">${m.portrait ? `<img src="${esc(m.portrait)}" alt="Meditation painting of ${esc(m.name)}" loading="lazy" decoding="async">` : ''}</span>
        ${live ? '<span class="lm-item-live" title="Active in the last ten minutes" aria-label="Active now"></span>' : ''}
        <span style="min-width:0"><span class="lm-item-name">${esc(m.name)}</span><span class="lm-item-role">${esc(m.role)}</span></span>
        <span class="lm-item-key" aria-label="Key ${m.keyNumber}">${k}</span>
      </button></li>`;
    }).join('');
    ol.scrollTop = st; ol.scrollLeft = sl;
    if (focusId) { const f = ol.querySelector(`.lm-item[data-id="${CSS.escape(focusId)}"]`); if (f) f.focus({ preventScroll: true }); }
  }

  /* ---------------- Dossier ---------------- */
  function renderHero(m) {
    const k = Number.isInteger(m.keyNumber) ? m.keyNumber : keyNum(m.key);
    const img = $('lmPortrait');
    img.classList.remove('is-in');
    if (m.portrait) {
      img.onload = () => img.classList.add('is-in');
      img.onerror = () => {
        img.src = `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
            <rect width="400" height="400" fill="#0C0A16"/>
            <circle cx="200" cy="200" r="160" stroke="#E9C46A" stroke-width="2" fill="none" opacity="0.4"/>
            <circle cx="200" cy="200" r="110" stroke="#5EEAD4" stroke-width="1.5" fill="none" opacity="0.3"/>
            <polygon points="200,60 320,270 80,270" stroke="#E9C46A" stroke-width="1.5" fill="none" opacity="0.5"/>
            <polygon points="200,340 320,130 80,130" stroke="#A78BFA" stroke-width="1.5" fill="none" opacity="0.5"/>
            <text x="200" y="195" font-family="sans-serif" font-size="28" font-weight="bold" fill="#E9C46A" text-anchor="middle">${k != null ? ROMAN[k] : '✶'}</text>
            <text x="200" y="225" font-family="sans-serif" font-size="12" fill="#BDB6CF" text-anchor="middle">PROCEDURAL SIGIL</text>
          </svg>
        `)}`;
        img.classList.add('is-in');
      };
      img.src = m.portrait;
      img.alt = `${m.name}'s most recent meditation painting`;
      if (img.complete && img.naturalWidth) img.classList.add('is-in');
    } else { img.removeAttribute('src'); img.alt = ''; }
    $('lmNumeral').textContent = k != null ? ROMAN[k] : '';
    $('lmHebrew').textContent = k != null ? HEBREW[k] : '';
    $('lmHebrew').setAttribute('title', k != null ? HEBREW_NAME[k] : '');
    $('lmKeyLine').innerHTML = k != null
      ? `<span>Key ${k}</span><span>${esc(cardName(m.key) || '')}</span><span>${HEBREW_NAME[k]}</span>`
      : '<span>Unkeyed</span>';
    const idBox = document.querySelector('#mindAtlas .lm-identity');
    idBox.classList.remove('is-swap'); void idBox.offsetWidth; idBox.classList.add('is-swap');
    $('lmName').textContent = m.name;
    $('lmRole').textContent = m.role || '';
    const meta = [];
    if (m.cadre) meta.push(`<li><b>${esc(m.cadre)}</b> cadre</li>`);
    if (m.colony) meta.push(`<li>${esc(human(m.colony))}</li>`);
    if (m.lastActive) meta.push(`<li>Last stirred ${esc(ago(m.lastActive))}</li>`);
    $('lmMeta').innerHTML = meta.join('');
    if (m.tic) {
      $('lmTic').textContent = '“' + clean(m.tic) + '”';
      $('lmManner').textContent = m.manner ? 'Manner: ' + clean(m.manner) : '';
      $('lmQuote').hidden = false;
    } else $('lmQuote').hidden = true;
    $('lmStatMem').textContent = fmt(m.memoryCount);
    $('lmStatHold').textContent = fmt(m.holdCloseCount);
    $('lmStatRep').textContent = fmt(m.repressedCount);
    $('lmMemTabCount').textContent = fmt(m.memoryCount);
  }

  function renderSoul() {
    const p = $('lmPanelSoul');
    const d = state.detail;
    if (!d) { p.innerHTML = '<p class="lm-note">Opening the soul…</p>'; return; }
    const s = d.parsed;
    const m = state.roster.find((x) => x.id === state.selected) || {};
    const ledger = s.ledger.slice();
    if (m.focus && !ledger.some(([k]) => /focus/i.test(k))) ledger.unshift(['Focus', clean(m.focus)]);
    p.innerHTML = `<div class="lm-soul">
      <div><h4 class="lm-h">Lasting priorities</h4>
        ${s.priorities.length ? `<ol class="lm-priorities">${s.priorities.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>` : '<p class="lm-note">No priorities written.</p>'}
      </div>
      <div><h4 class="lm-h">Current ledger</h4>
        ${ledger.length ? `<dl class="lm-ledger">${ledger.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : '<p class="lm-note">The ledger is blank.</p>'}
      </div>
      ${s.floor ? `<figure class="lm-floor"><h4 class="lm-h">Stoic floor</h4><p>${esc(s.floor)}</p></figure>` : ''}
    </div>`;
  }

  function renderMemory() {
    const ol = $('lmTimeline');
    const d = state.detail;
    if (!d) {
      ol.innerHTML = `<li class="lm-note lm-loading-state"><span class="lm-pulse-dot"></span> <strong>Reading memory stream:</strong> Loading records from <code>data/minds/spool.jsonl</code> for ${esc(state.selected)}…</li>`;
      return;
    }
    const v = state.valence;
    const items = d.memories.filter((x) => v === 'all' || x.valence === v);
    if (!items.length) {
      ol.innerHTML = `<li class="lm-empty-state">
        <div class="lm-empty-kicker">LEDGER RECORD EMPTY (${esc(v.toUpperCase())})</div>
        <p class="lm-empty-desc">
          ${v === 'repressed'
            ? `<strong>Why this is blank:</strong> No repressed impressions exist in ${esc(state.selected)}'s active mental working set. Repression occurs when an agent experiences cognitive dissonance during cross-cadre Conclave debates.`
            : `<strong>Why this is blank:</strong> Zero ${esc(v)} impressions found in recent memory spool. Memories are created when ${esc(state.selected)} steps an Adytum Key, executes an AGY CLI run, or converses with the Imperator.`}
        </p>
      </li>`;
    } else {
      ol.innerHTML = items.map((x) => {
        const cls = x.valence === 'hold-close' ? 'hold' : x.valence === 'repressed' ? 'rep' : 'ord';
        return `<li class="lm-mem is-${cls}">
          <i class="dot ${cls}" aria-hidden="true"></i>
          <div style="min-width:0">
            <div class="lm-mem-head"><time datetime="${esc(x.at)}">${esc(stamp(x.at))}</time><span class="lm-mem-kind">${esc(x.kind)}</span>${x.key != null ? `<span>Key ${ROMAN[x.key] || x.key}</span>` : ''}${x.place ? `<span>${esc(human(x.place))}</span>` : ''}</div>
            <p class="lm-mem-text">${esc(x.text) || '<span class="lm-note">An impression without words.</span>'}</p>
            ${x.peers && x.peers !== 'none' ? `<div class="lm-mem-peers">With ${esc(x.peers.split(/,\s*/).map(human).join(', '))}</div>` : ''}
          </div>
          ${x.image ? `<button type="button" class="lm-mem-thumb" data-img="${esc(x.image)}" data-cap="${esc(x.card)}" data-key="${x.key != null ? x.key : ''}" aria-label="Open the ${esc(x.card || 'vision')} painting"><img src="${esc(x.image)}" alt="${esc(x.card || 'Vision')} painting" loading="lazy"></button>` : ''}
        </li>`;
      }).join('');
    }
    const panel = $('lmPanelMemory');
    let more = panel.querySelector('.lm-more');
    const total = (state.roster.find((m) => m.id === state.selected) || {}).memoryCount || 0;
    if (state.memLimit < 120 && d.memories.length >= state.memLimit && total > d.memories.length) {
      if (!more) { more = document.createElement('button'); more.type = 'button'; more.className = 'lm-more'; panel.appendChild(more); }
      more.textContent = `Read further back (${fmt(d.memories.length)} of ${fmt(total)})`;
    } else if (more) more.remove();
  }

  function renderVisions() {
    const box = $('lmVisions');
    const d = state.detail;
    if (!d) {
      box.innerHTML = `<p class="lm-note lm-loading-state"><span class="lm-pulse-dot"></span> <strong>Querying meditation archive:</strong> Loading from <code>data/civilization_state.json</code> for ${esc(state.selected)}…</p>`;
      return;
    }
    const m = state.roster.find((x) => x.id === state.selected) || {};
    const gallery = d.raw.gallery || [];
    const soulSym = {};
    d.parsed.visions.forEach((v) => { soulSym[v.key] = v.symbol; });
    const paintings = gallery.filter((g) => g.kind === 'painting');
    const sigilByKey = new Map();
    gallery.filter((g) => g.kind === 'sigil' && g.key != null).forEach((g) => { if (!sigilByKey.has(g.key)) sigilByKey.set(g.key, g); });
    const sigils = [...sigilByKey.values()].sort((a, b) => a.key - b.key);
    $('lmVisTabCount').textContent = paintings.length || '';
    const card = (g) => (g.key != null && TAROT[g.key]) || clean(String(g.card || '').replace(/^Key\s*\d+:\s*/i, '')) || 'Untitled';
    const STAGE = { sitting: 'Sitting', held: 'Held image', mist: 'Through the Mist', before: 'Before the sitting' };
    let html = '';
    if (paintings.length) {
      html += `<div class="lm-vis-head"><h4 class="lm-h">Paintings</h4><p class="lm-note">What ${esc(m.name || 'this mind')} saw with eyes closed, painted and filed. Newest first.</p></div>
      <div class="lm-visions-grid">${paintings.map((g, i) => `<button type="button" class="lm-vision${i === 0 ? ' is-feature' : ''}${g.key === m.keyNumber ? ' is-current' : ''}" data-img="${esc(g.url)}" data-cap="${esc(card(g))}" data-key="${g.key != null ? g.key : ''}" data-sym="${esc(soulSym[g.key] || STAGE[g.stage] || '')}">
        <div class="lm-vision-frame"><div><img src="${esc(g.url)}" alt="${esc(m.name || '')}'s painting${g.key != null ? ' of Key ' + g.key + ', ' + esc(card(g)) : ''}" loading="lazy" decoding="async"></div></div>
        <div class="lm-vision-cap"><span class="lm-vision-num">${g.key != null ? ROMAN[g.key] : '·'}</span><span class="lm-vision-name">${esc(card(g))}</span><span class="lm-vision-sym">${esc(STAGE[g.stage] || g.stage)} · ${esc(stamp(g.at))}</span></div>
      </button>`).join('')}</div>`;
    } else {
      html += `<div class="lm-empty-state">
        <div class="lm-empty-kicker">ON-DEMAND PROCEDURAL MODE</div>
        <p class="lm-empty-desc">
          <strong>Why no pre-computed canvases are listed:</strong> ${esc(m.name || 'This mind')} has not completed a FLUX neural painting generation run for their current key. The server serves on-demand procedural sacred geometry sigils via <code>engine/procedural_vision.py</code> until an Adytum contemplation sitting is executed.
        </p>
      </div>`;
    }
    if (sigils.length) {
      html += `<div class="lm-vis-head lm-vis-head--sigils"><h4 class="lm-h">Key sigils · ${sigils.length} of 22</h4><p class="lm-note">Procedural sacred-geometry renders, one per Key sat with.</p></div>
      <div class="lm-sigils">${sigils.map((g) => `<button type="button" class="lm-sigil${g.key === m.keyNumber ? ' is-current' : ''}" data-img="${esc(g.url)}" data-cap="${esc(card(g))}" data-key="${g.key}" data-sym="${esc(soulSym[g.key] || '')}" title="Key ${g.key}: ${esc(card(g))}">
        <span class="lm-sigil-disc"><img src="${esc(g.url)}" alt="Sigil for Key ${g.key}, ${esc(card(g))}" loading="lazy" decoding="async"></span><span class="lm-sigil-num">${ROMAN[g.key]}</span>
      </button>`).join('')}</div>`;
    }
    box.innerHTML = html;
  }

  function renderWorking() {
    const p = $('lmPanelWorking');
    const d = state.detail;
    if (!d) {
      p.innerHTML = `<p class="lm-note lm-loading-state"><span class="lm-pulse-dot"></span> <strong>Reading active working memory set:</strong> Loading graph cursor for ${esc(state.selected)}…</li>`;
      return;
    }
    const m = state.roster.find((x) => x.id === state.selected) || {};
    const ws = d.raw.workingSet || {};
    const row = (x) => `<li><span class="k">${x.key != null && ROMAN[x.key] ? ROMAN[x.key] : '·'}</span><span>${esc(clean(x.text))}<small>${esc((x.valence || '').replace('-', ' '))}${x.strength ? ' · strength ' + x.strength : ''}${x.visual && x.visual.card ? ' · ' + esc(x.visual.card) : ''}</small></span></li>`;
    const hc = ws.holdClose || [], tr = ws.triggered || [];
    p.innerHTML = `<p class="lm-note" style="margin:0 0 22px;max-width:70ch">What this mind would recall right now: the memories it holds close, and the ones its present work has triggered.</p>
    <div class="lm-working">
      <div><h4 class="lm-h">Held close · ${hc.length}</h4>${hc.length ? `<ol>${hc.map(row).join('')}</ol>` : `<div class="lm-empty-state"><p class="lm-empty-desc"><strong>Why nothing is held close:</strong> ${esc(m.name || 'This mind')} currently holds no high-salience impressions in its immediate recall buffer. Assign work via surface dialogue or run an AGY turn to populate active working memory.</p></div>`}</div>
      <div><h4 class="lm-h">Triggered by the present · ${tr.length}</h4>${tr.length ? `<ol>${tr.map(row).join('')}</ol>` : `<div class="lm-empty-state"><p class="lm-empty-desc"><strong>Why nothing is triggered:</strong> No latent memories match current contextual tokens. Stepping an Adytum Key or initiating conversation activates recall nodes.</p></div>`}</div>
    </div>`;
  }

  function renderPanels() { renderSoul(); renderMemory(); renderVisions(); renderWorking(); }

  function setTab(tab, focus) {
    state.tab = tab;
    document.querySelectorAll('#mindAtlas .lm-tab').forEach((b) => {
      const on = b.dataset.tab === tab;
      b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
      const panel = $(b.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
      if (on && focus) b.focus();
    });
  }

  async function select(id, opts) {
    const m = state.roster.find((x) => x.id === id);
    if (!m) return;
    state.selected = id;
    if (!opts || !opts.keepLimit) state.memLimit = 40;
    try { sessionStorage.setItem('lm.selected', id); } catch (e) { /* storage blocked */ }
    document.querySelectorAll('#lmRosterList .lm-item').forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === id)));
    if (!opts || !opts.keepLimit) { renderHero(m); state.detail = null; renderPanels(); }
    const my = ++state.reqId;
    try {
      const j = await getJSON(`/api/mind/${encodeURIComponent(id)}?limit=${state.memLimit}`);
      if (my !== state.reqId || !j.success) return;
      const raw = j.mind;
      state.detail = { raw, parsed: parseSoul(raw.soul), memories: parseMemories(raw.recentMemorySample) };
      renderPanels();
    } catch (e) {
      if (my !== state.reqId) return;
      $('lmPanelSoul').innerHTML = '<p class="lm-note">This mind could not be opened just now. Choose it again in a moment.</p>';
    }
  }

  /* ---------------- Lightbox ---------------- */
  function openLightbox(src, card, key, sym) {
    const dlg = $('lmLightbox');
    $('lmLightboxImg').src = src;
    $('lmLightboxImg').alt = card ? `Painting of ${card}` : 'Vision painting';
    const k = key !== '' && key != null ? Number(key) : null;
    $('lmLightboxCap').innerHTML = `${k != null ? `<b>${ROMAN[k]}</b>` : ''}${esc(card || 'Vision')}${sym ? ` <span style="color:var(--lm-text-3)">· ${esc(sym)}</span>` : ''}`;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }

  /* ---------------- Wiring ---------------- */
  let wired = false;
  function wire() {
    if (wired) return; wired = true;
    $('lmSearch').addEventListener('input', (e) => { state.query = e.target.value.trim(); renderRoster(); });
    $('lmCadreChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cadre]'); if (!b) return;
      state.cadre = b.dataset.cadre; renderChips(); renderRoster();
    });
    const list = $('lmRosterList');
    list.addEventListener('click', (e) => { const b = e.target.closest('.lm-item'); if (b) select(b.dataset.id); });
    list.addEventListener('keydown', (e) => {
      const items = [...list.querySelectorAll('.lm-item')];
      const i = items.indexOf(document.activeElement); if (i < 0) return;
      const next = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!next) return;
      e.preventDefault();
      const t = items[(i + next + items.length) % items.length]; t.focus(); select(t.dataset.id);
    });
    const tabs = document.querySelector('#mindAtlas .lm-tabs');
    tabs.addEventListener('click', (e) => { const b = e.target.closest('.lm-tab'); if (b) setTab(b.dataset.tab); });
    tabs.addEventListener('keydown', (e) => {
      const order = ['soul', 'memory', 'visions', 'working'];
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return;
      e.preventDefault(); setTab(order[(order.indexOf(state.tab) + d + order.length) % order.length], true);
    });
    $('lmValenceChips').addEventListener('click', (e) => {
      const b = e.target.closest('[data-valence]'); if (!b) return;
      state.valence = b.dataset.valence;
      $('lmValenceChips').querySelectorAll('.lm-chip').forEach((c) => { c.classList.toggle('is-on', c === b); c.setAttribute('aria-pressed', String(c === b)); });
      renderMemory();
    });
    $('lmPanelMemory').addEventListener('click', (e) => {
      if (e.target.closest('.lm-more')) { state.memLimit = Math.min(120, state.memLimit + 40); select(state.selected, { keepLimit: true }); return; }
      const t = e.target.closest('.lm-mem-thumb'); if (t) openLightbox(t.dataset.img, t.dataset.cap, t.dataset.key);
    });
    $('lmVisions').addEventListener('click', (e) => {
      const v = e.target.closest('.lm-vision, .lm-sigil'); if (v) openLightbox(v.dataset.img, v.dataset.cap, v.dataset.key, v.dataset.sym);
    });
    $('lmReliquary').addEventListener('click', () => {
      const img = $('lmPortrait'); if (img.src) openLightbox(img.src, $('lmName').textContent, null);
    });
    const dlg = $('lmLightbox');
    $('lmLightboxClose').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && dlg.open) { e.preventDefault(); dlg.close(); } }, true);
  }

  async function loadRoster(force) {
    if (state.loading && !force) return state.loading;
    state.loading = (async () => {
      try {
        const j = await getJSON('/api/mind/roster');
        state.roster = (j.roster || []).map((m) => {
          const nm = clean(m.name);
          const name = !nm || nm === m.id ? m.id.toLowerCase().replace(/(^|[-_ ])(\w)/g, (x, s, c) => s + c.toUpperCase()) : nm;
          return Object.assign({}, m, { name, role: clean(m.role) || (m.cadre ? m.cadre + ' cadre' : 'Wandering sovereign, role not yet written') });
        });
        state.loaded = true;
        renderMast(); renderChips(); renderRoster();
      } catch (e) {
        const errTxt = e && e.message ? e.message : 'Connection timeout';
        $('lmRosterList').innerHTML = `<li class="lm-fallback-item">
          <div class="lm-fallback-banner">
            <span class="lm-fallback-tag">SPOOL STREAM RETRYING</span>
            <p class="lm-fallback-msg"><strong>Why this fallback is showing:</strong> The roster endpoint (<code>/api/mind/roster</code>) reported: <em>${esc(errTxt)}</em>. The server is indexing 23 sovereign agents from <code>data/minds/graph.jsonl</code>.</p>
            <button type="button" class="lm-fallback-btn" id="btnRetryLmRoster">⚡ Reconnect to Mind Spool</button>
          </div>
        </li>`;
        const retryBtn = $('btnRetryLmRoster');
        if (retryBtn) retryBtn.addEventListener('click', () => loadRoster(true));
        state.loaded = false;
      } finally { state.loading = null; }
    })();
    return state.loading;
  }

  let pulse = null, lastTotal = 0;
  function startPulse() {
    if (pulse) return;
    pulse = setInterval(async () => {
      const view = $('view-living-minds');
      if (!view || !view.classList.contains('active') || document.hidden) { clearInterval(pulse); pulse = null; return; }
      await loadRoster(true);
      const total = state.roster.reduce((s, m) => s + (m.memoryCount || 0), 0);
      if (lastTotal && total > lastTotal) {
        const e = $('lmEyebrowMem'); e.classList.add('is-bump'); setTimeout(() => e.classList.remove('is-bump'), 1600);
        const m = state.roster.find((x) => x.id === state.selected);
        if (m && state.tab !== 'memory') { $('lmStatMem').textContent = fmt(m.memoryCount); $('lmMemTabCount').textContent = fmt(m.memoryCount); }
      }
      lastTotal = total;
    }, 45000);
  }

  async function open() {
    if (!$('mindAtlas')) return;
    wire();
    await loadRoster(state.loaded); // refresh quietly on every visit
    if (!state.roster.length) return;
    let want = state.selected;
    if (!want) { try { want = sessionStorage.getItem('lm.selected'); } catch (e) { /* ignore */ } }
    if (!want || !state.roster.some((m) => m.id === want)) want = (state.roster.find((m) => m.id === 'AZOTH') || state.roster[0]).id;
    if (want !== state.selected || !state.detail) select(want);
    lastTotal = state.roster.reduce((s, m) => s + (m.memoryCount || 0), 0);
    startPulse();
  }

  window.LivingMinds = { open, select, _parseSoul: parseSoul, _parseMemories: parseMemories };
  if (document.getElementById('view-living-minds') && document.getElementById('view-living-minds').classList.contains('active')) {
    document.addEventListener('DOMContentLoaded', open);
  }
})();
