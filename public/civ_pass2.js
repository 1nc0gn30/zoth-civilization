/* ZOTH CIVILIZATION: UI pass 2
   - Realm map: living 2D map of cities, halls, roads and animated agent sprites
   - Event FX: heralds, toasts, coin bursts and sounds for decrees, elections,
     sales, conclaves and city migrations
   - Pantheon sprites: animated state rings on the dock avatars
   - Stream overlay: clean 1080p view for OBS (?overlay=1, or Shift+O)
   Read-only: listens to civ:snapshot / civ:sse from app.js, never calls write APIs. */
(function () {
  'use strict';
  const qs = new URLSearchParams(location.search);
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const now = () => performance.now();

  // ── Sound (reuses HermeticAudio and its SFX toggle) ─────────────────────
  const sfx = (name, arg) => {
    const A = window.HermeticAudio;
    if (!A || (A.isEnabled && !A.isEnabled()) || document.body.classList.contains('z-overlay-mute')) return;
    try { if (typeof A[name] === 'function') A[name](arg); } catch (_) {}
  };

  // ── FX layer (particles) ─────────────────────────────────────────────────
  const fx = document.createElement('canvas');
  fx.className = 'z-fx-layer';
  fx.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fx);
  const fctx = fx.getContext('2d');
  let parts = [];
  function sizeFx() { const r = devicePixelRatio || 1; fx.width = innerWidth * r; fx.height = innerHeight * r; fctx.setTransform(r, 0, 0, r, 0, 0); }
  addEventListener('resize', sizeFx); sizeFx();
  function burst(kind, x, y, n) {
    if (reduceMotion) return;
    x = x == null ? innerWidth / 2 : x; y = y == null ? innerHeight * 0.38 : y;
    const col = kind === 'coin' ? ['#FFD97A', '#F5B83D', '#FFF3C4'] : kind === 'election' ? ['#C084FC', '#FFD97A', '#F0ABFC'] : ['#7DD3FC', '#A78BFA', '#FFD97A'];
    for (let i = 0; i < (n || 60); i++) {
      const a = Math.random() * Math.PI * 2, s = 2 + Math.random() * 6;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - (kind === 'coin' ? 4 : 2), life: 1, r: kind === 'coin' ? 3 + Math.random() * 3 : 1.5 + Math.random() * 2.5, c: col[i % col.length], coin: kind === 'coin', spin: Math.random() * 6 });
    }
  }
  function stepFx() {
    fctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0);
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.vy += p.coin ? 0.22 : 0.06; p.vx *= 0.985; p.life -= p.coin ? 0.012 : 0.018; p.spin += 0.2;
      fctx.globalAlpha = Math.max(0, p.life);
      fctx.fillStyle = p.c;
      if (p.coin) { fctx.beginPath(); fctx.ellipse(p.x, p.y, p.r * Math.abs(Math.cos(p.spin)) + 0.6, p.r, 0, 0, Math.PI * 2); fctx.fill(); }
      else { fctx.shadowColor = p.c; fctx.shadowBlur = 8; fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); fctx.fill(); fctx.shadowBlur = 0; }
    }
    fctx.globalAlpha = 1;
  }

  // ── Toasts + herald ──────────────────────────────────────────────────────
  const toastBox = document.createElement('div');
  toastBox.className = 'z-toasts'; toastBox.setAttribute('role', 'log'); toastBox.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastBox);
  function toast(kind, title, body, color) {
    const t = document.createElement('div');
    t.className = `z-toast z-toast-${kind}`;
    if (color) t.style.setProperty('--z-accent', color);
    t.innerHTML = `<span class="z-toast-glyph" aria-hidden="true">${{ decree: '📜', election: '👑', coin: '🪙', conclave: '🗳', warp: '🌀', voice: '💬', link: '📡' }[kind] || '✦'}</span><div><b>${esc(title)}</b>${body ? `<p>${esc(body)}</p>` : ''}</div>`;
    toastBox.prepend(t);
    while (toastBox.children.length > 5) toastBox.lastChild.remove();
    setTimeout(() => { t.classList.add('z-out'); setTimeout(() => t.remove(), 500); }, kind === 'voice' ? 5200 : 7000);
  }
  const herald = document.createElement('div');
  herald.className = 'z-herald'; herald.hidden = true; herald.setAttribute('role', 'status');
  document.body.appendChild(herald);
  let heraldTimer = 0;
  function proclaim(kind, kicker, title, sub) {
    herald.className = `z-herald z-herald-${kind}`;
    herald.innerHTML = `<div class="z-herald-kicker">${esc(kicker)}</div><div class="z-herald-title">${esc(title)}</div>${sub ? `<div class="z-herald-sub">${esc(sub)}</div>` : ''}<i class="z-herald-rule"></i>`;
    herald.hidden = false; void herald.offsetWidth; herald.classList.add('z-in');
    clearTimeout(heraldTimer);
    heraldTimer = setTimeout(() => { herald.classList.remove('z-in'); setTimeout(() => { herald.hidden = true; }, 600); }, 5200);
  }

  // ── Realm map ────────────────────────────────────────────────────────────
  const COLONY_NAMES = { colony_capital: 'Capital', colony_nova_zoth: 'Nova Zoth', colony_sol_crypta: 'Sol Crypta', colony_adytum_grove: 'Adytum', colony_hex_bastion: 'HexForge', colony_east_reach: 'East Reach', colony_west_march: 'West March', colony_high_lantern: 'High Lantern', colony_south_kiln: 'South Kiln' };
  const STATE_COLOR = { BUILDING: '#F5B83D', OPTIMIZING_APP: '#38BDF8', CODING: '#38BDF8', CRAFTING: '#F97316', MEDITATING: '#A78BFA', TALKING: '#F472B6', VOTING: '#FFD97A', RESTING: '#6B7280', WANDERING: '#93C5FD' };
  const map = document.createElement('section');
  map.className = 'z-realm hud-hidden'; map.setAttribute('aria-label', 'Realm map');
  // Start collapsed on phones (it covered the main panel) unless the user chose otherwise.
  try {
    const pref = localStorage.getItem('zoth.realmMap.collapsed');
    if (pref === '1' || (pref === null && innerWidth < 700)) map.classList.add('z-collapsed');
  } catch (e) { if (innerWidth < 700) map.classList.add('z-collapsed'); }
  map.innerHTML = `<header><span class="z-realm-title">Realm Map</span><span class="z-realm-meta" id="zRealmMeta">—</span><button type="button" data-act="grow" title="Expand map (M)" aria-label="Expand map">⤢</button><button type="button" data-act="hide" title="Hide map" aria-label="Hide map">–</button></header><canvas aria-label="Map of cities and agents"></canvas><div class="z-realm-tip" hidden></div>`;
  document.body.appendChild(map);
  const mc = map.querySelector('canvas'), mctx = mc.getContext('2d'), tip = map.querySelector('.z-realm-tip');
  const sprites = new Map();   // id -> {x,y,tx,ty,trail,color,name,state,leader,speech}
  let buildings = [], bounds = { x0: 40, y0: 60, x1: 640, y1: 540 }, hoverId = null, leaderId = '';
  const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.2 + 0.2, p: Math.random() * 6 }));
  map.addEventListener('click', (e) => {
    const act = e.target.closest('button') && e.target.closest('button').dataset.act;
    if (act === 'grow') map.classList.toggle('z-big');
    if (act === 'hide') { map.classList.toggle('z-collapsed'); try { localStorage.setItem('zoth.realmMap.collapsed', map.classList.contains('z-collapsed') ? '1' : '0'); } catch (e) { /* private mode */ } }
    if (act) { sizeMap(); sfx('playClick', 640); }
  });
  function sizeMap() { const r = devicePixelRatio || 1, w = mc.clientWidth || 360, h = mc.clientHeight || 230; mc.width = w * r; mc.height = h * r; mctx.setTransform(r, 0, 0, r, 0, 0); }
  new ResizeObserver(sizeMap).observe(mc);
  const proj = (x, y) => {
    const w = mc.clientWidth, h = mc.clientHeight, pad = 18;
    const sx = (w - pad * 2) / Math.max(1, bounds.x1 - bounds.x0), sy = (h - pad * 2) / Math.max(1, bounds.y1 - bounds.y0), s = Math.min(sx, sy);
    const ox = (w - (bounds.x1 - bounds.x0) * s) / 2, oy = (h - (bounds.y1 - bounds.y0) * s) / 2;
    return [ox + (x - bounds.x0) * s, oy + (y - bounds.y0) * s, s];
  };
  function pick(ev) {
    const r = mc.getBoundingClientRect(), mx = ev.clientX - r.left, my = ev.clientY - r.top;
    let best = null, bd = 14;
    sprites.forEach((sp, id) => { const [px, py] = proj(sp.x, sp.y); const d = Math.hypot(px - mx, py - my); if (d < bd) { bd = d; best = id; } });
    return best;
  }
  mc.addEventListener('mousemove', (ev) => {
    hoverId = pick(ev);
    const sp = hoverId && sprites.get(hoverId);
    if (sp) { tip.hidden = false; tip.style.left = `${ev.offsetX + 12}px`; tip.style.top = `${ev.offsetY + 8}px`; tip.innerHTML = `<b style="color:${esc(sp.color)}">${esc(sp.name)}</b> · ${esc(String(sp.state).replace(/_/g, ' ').toLowerCase())}${sp.speech ? `<br><i>“${esc(sp.speech.slice(0, 90))}”</i>` : ''}`; }
    else tip.hidden = true;
  });
  mc.addEventListener('mouseleave', () => { hoverId = null; tip.hidden = true; });
  mc.addEventListener('click', (ev) => {
    const id = pick(ev); if (!id) return;
    const btn = document.querySelector(`#dockAvatars [data-agent-id="${CSS.escape(id)}"]`);
    if (btn) btn.click();
  });

  function drawMap(t) {
    if (map.classList.contains('z-collapsed') || !mc.clientWidth) return;
    const w = mc.clientWidth, h = mc.clientHeight;
    const g = mctx.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.75);
    g.addColorStop(0, '#1a1435'); g.addColorStop(0.6, '#0d0b1f'); g.addColorStop(1, '#05050c');
    mctx.fillStyle = g; mctx.fillRect(0, 0, w, h);
    for (const s of stars) { mctx.globalAlpha = 0.25 + 0.35 * Math.sin(t / 900 + s.p) ** 2; mctx.fillStyle = '#cbd5ff'; mctx.fillRect(s.x * w, s.y * h, s.s, s.s); }
    mctx.globalAlpha = 1;
    // hermetic grid
    mctx.strokeStyle = 'rgba(212,175,55,0.07)'; mctx.lineWidth = 1;
    for (let gx = 0; gx < w; gx += 24) { mctx.beginPath(); mctx.moveTo(gx, 0); mctx.lineTo(gx, h); mctx.stroke(); }
    for (let gy = 0; gy < h; gy += 24) { mctx.beginPath(); mctx.moveTo(0, gy); mctx.lineTo(w, gy); mctx.stroke(); }
    // city territories from agent clusters
    const cities = {};
    const labelBoxes = [];
    // Place a label where it doesn't overlap one already drawn; returns false to skip it.
    const placeLabel = (text, x, y, font) => {
      mctx.font = font;
      const tw = mctx.measureText(text).width, th = 11;
      for (const [dx, dy] of [[0, 0], [0, 14], [0, -14], [tw * 0.6, 0], [-tw * 0.6, 0], [0, 28], [0, -28]]) {
        const bx = x + dx - tw / 2 - 2, by = y + dy - th, bw = tw + 4, bh = th + 3;
        if (bx < 2 || bx + bw > w - 2 || by < 2 || by + bh > h - 2) continue;
        if (labelBoxes.some((o) => bx < o[0] + o[2] && bx + bw > o[0] && by < o[1] + o[3] && by + bh > o[1])) continue;
        labelBoxes.push([bx, by, bw, bh]);
        mctx.lineWidth = 3; mctx.strokeStyle = 'rgba(8,6,20,0.85)'; mctx.lineJoin = 'round';
        mctx.strokeText(text, x + dx, y + dy); mctx.fillText(text, x + dx, y + dy);
        return true;
      }
      return false;
    };
    sprites.forEach((sp) => { const c = cities[sp.colony] || (cities[sp.colony] = { x: 0, y: 0, n: 0 }); c.x += sp.x; c.y += sp.y; c.n++; });
    Object.entries(cities).forEach(([cid, c]) => {
      const [px, py, s] = proj(c.x / c.n, c.y / c.n), rad = Math.max(22, 26 * s + c.n * 5);
      const tg = mctx.createRadialGradient(px, py, 2, px, py, rad);
      tg.addColorStop(0, 'rgba(167,139,250,0.20)'); tg.addColorStop(1, 'rgba(167,139,250,0)');
      mctx.fillStyle = tg; mctx.beginPath(); mctx.arc(px, py, rad, 0, Math.PI * 2); mctx.fill();
      mctx.fillStyle = 'rgba(233,213,255,0.85)'; mctx.textAlign = 'center';
      placeLabel((COLONY_NAMES[cid] || cid.replace(/^colony_/, '')).toUpperCase(), px, py - rad + 10, '600 10px "Plus Jakarta Sans", system-ui, sans-serif');
    });
    // roads: each hall to its nearest neighbour
    mctx.setLineDash([3, 5]); mctx.strokeStyle = 'rgba(245,184,61,0.28)'; mctx.lineWidth = 1.2;
    buildings.forEach((b, i) => {
      let best = null, bd = Infinity;
      buildings.forEach((o, j) => { if (i === j) return; const d = Math.hypot(o.cx - b.cx, o.cy - b.cy); if (d < bd) { bd = d; best = o; } });
      if (best) { const [ax, ay] = proj(b.cx, b.cy), [bx, by] = proj(best.cx, best.cy); mctx.beginPath(); mctx.moveTo(ax, ay); mctx.lineTo(bx, by); mctx.stroke(); }
    });
    mctx.setLineDash([]);
    // halls
    buildings.forEach((b) => {
      const [px, py, s] = proj(b.cx, b.cy), r = Math.max(4, Math.min(10, (b.w || 60) * s * 0.12));
      mctx.save(); mctx.translate(px, py); mctx.rotate(Math.PI / 4);
      mctx.fillStyle = b.color || '#D4AF37'; mctx.shadowColor = b.color || '#D4AF37'; mctx.shadowBlur = 10;
      mctx.fillRect(-r, -r, r * 2, r * 2); mctx.shadowBlur = 0;
      mctx.strokeStyle = b.accent || 'rgba(255,255,255,0.6)'; mctx.lineWidth = 1; mctx.strokeRect(-r - 2, -r - 2, r * 2 + 4, r * 2 + 4);
      mctx.restore();
      if (map.classList.contains('z-big')) { mctx.font = '10px "Plus Jakarta Sans", system-ui'; mctx.fillStyle = 'rgba(255,243,196,0.8)'; mctx.textAlign = 'center'; mctx.fillText(b.name.slice(0, 26), px, py + r + 12); }
    });
    // agents: lerp toward target, trails, halos, crown, speech pip
    sprites.forEach((sp, id) => {
      const k = reduceMotion ? 1 : 0.08;
      sp.x += (sp.tx - sp.x) * k; sp.y += (sp.ty - sp.y) * k;
      if (!sp.trail.length || Math.hypot(sp.trail[sp.trail.length - 1][0] - sp.x, sp.trail[sp.trail.length - 1][1] - sp.y) > 2) { sp.trail.push([sp.x, sp.y]); if (sp.trail.length > 14) sp.trail.shift(); }
      const [px, py] = proj(sp.x, sp.y);
      sp.trail.forEach(([tx, ty], i) => { const [qx, qy] = proj(tx, ty); mctx.globalAlpha = (i / sp.trail.length) * 0.35; mctx.fillStyle = sp.color; mctx.beginPath(); mctx.arc(qx, qy, 1.4, 0, Math.PI * 2); mctx.fill(); });
      mctx.globalAlpha = 1;
      const bob = reduceMotion ? 0 : Math.sin(t / 260 + sp.phase) * 1.4;
      const ring = STATE_COLOR[sp.state] || '#93C5FD';
      const pulse = 7 + Math.sin(t / 380 + sp.phase) * 2;
      mctx.strokeStyle = ring; mctx.globalAlpha = 0.55; mctx.lineWidth = 1.5;
      mctx.beginPath(); mctx.arc(px, py + bob, pulse, 0, Math.PI * 2); mctx.stroke(); mctx.globalAlpha = 1;
      mctx.fillStyle = sp.color; mctx.shadowColor = sp.color; mctx.shadowBlur = id === hoverId ? 16 : 8;
      mctx.beginPath(); mctx.arc(px, py + bob, id === hoverId ? 5.2 : 4, 0, Math.PI * 2); mctx.fill(); mctx.shadowBlur = 0;
      if (sp.leader) { mctx.font = '11px serif'; mctx.textAlign = 'center'; mctx.fillText('👑', px, py + bob - 9); }
      if (sp.speech && sp.speechUntil > Date.now()) { mctx.fillStyle = '#F472B6'; mctx.beginPath(); mctx.arc(px + 6, py + bob - 6, 2.2, 0, Math.PI * 2); mctx.fill(); }
      if (map.classList.contains('z-big') || id === hoverId) { mctx.font = '600 9px "JetBrains Mono", monospace'; mctx.fillStyle = 'rgba(255,255,255,0.85)'; mctx.textAlign = 'center'; mctx.fillText(sp.name, px, py + bob + 14); }
    });
    // vignette frame
    mctx.strokeStyle = 'rgba(212,175,55,0.35)'; mctx.lineWidth = 1; mctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  // ── Pantheon sprite rings on the dock ────────────────────────────────────
  function decorateDock(agentsList) {
    const dock = $('dockAvatars'); if (!dock) return;
    agentsList.forEach((a) => {
      const btn = dock.querySelector(`[data-agent-id="${CSS.escape(a.id)}"]`); if (!btn) return;
      if (!btn.querySelector('.z-sprite')) { const s = document.createElement('span'); s.className = 'z-sprite'; s.setAttribute('aria-hidden', 'true'); btn.prepend(s); }
      btn.style.setProperty('--z-agent', a.color || '#A78BFA');
      btn.dataset.zstate = String(a.state || '').toLowerCase();
      btn.classList.toggle('z-is-leader', String(a.id).toUpperCase() === leaderId);
      btn.classList.toggle('z-is-speaking', !!(a.speech && (!a.speechExpires || a.speechExpires > Date.now())));
    });
  }

  // ── Stream overlay ───────────────────────────────────────────────────────
  const ov = document.createElement('div');
  ov.className = 'z-ov'; ov.setAttribute('aria-hidden', 'true');
  ov.innerHTML = `<div class="z-ov-brand"><span>ZOTH CIVILIZATION</span><b class="z-ov-live"><i></i>LIVE</b></div>
    <div class="z-ov-spot" id="zOvSpot" hidden></div>
    <div class="z-ov-lower"><div class="z-ov-leader" id="zOvLeader">—</div><div class="z-ov-decree" id="zOvDecree">Awaiting decree…</div>
      <div class="z-ov-goal"><span id="zOvGoalText">$0 / $100,000</span><i><em id="zOvGoal"></em></i></div>
      <div class="z-ov-ticker"><div id="zOvTicker"></div></div></div>`;
  document.body.appendChild(ov);
  function setOverlay(on) {
    document.body.classList.toggle('z-overlay', on);
    if (on) { map.classList.remove('z-collapsed'); if (qs.get('map') === 'big') map.classList.add('z-big'); }
    if (qs.get('transparent') === '1') document.body.classList.toggle('z-overlay-transparent', on);
    if (qs.get('mute') === '1') document.body.classList.add('z-overlay-mute');
    sizeMap(); dispatchEvent(new Event('resize'));
    if (on && qs.get('view') !== 'surface') orbitForStream(0);
  }
  // OBS default: orbital god view with a slow spin (append &view=surface to keep the walk camera).
  function orbitForStream(tries) {
    const w = window.sphereWorld;
    if (!w || typeof w.resetOrbit !== 'function') { if (tries < 20) setTimeout(() => orbitForStream(tries + 1), 500); return; }
    try {
      if (typeof w.exitAvatarMode === 'function') w.exitAvatarMode(); else w.resetOrbit();
      if (!w.autoSpin && typeof w.toggleAutoSpin === 'function') w.toggleAutoSpin();
    } catch (_) {}
    if (tries === 0) [3000, 7000].forEach((ms) => setTimeout(() => {
      if (!document.body.classList.contains('z-overlay')) return;
      try { if (typeof w.exitAvatarMode === 'function') w.exitAvatarMode(); } catch (_) {}
    }, ms));
  }
  addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag) || e.target.isContentEditable) return;
    if (e.shiftKey && (e.key === 'O' || e.key === 'o')) { setOverlay(!document.body.classList.contains('z-overlay')); e.preventDefault(); }
    else if (!e.shiftKey && !e.ctrlKey && !e.metaKey && (e.key === 'm' || e.key === 'M') && document.body.classList.contains('z-overlay')) { map.classList.toggle('z-big'); sizeMap(); }
  });
  if (qs.get('overlay') === '1' || location.hash === '#overlay') setOverlay(true);
  let spotIdx = 0;
  function rotateSpotlight(agentsList) {
    const talkers = agentsList.filter((a) => a.speech && String(a.speech).trim().length > 8);
    const el = $('zOvSpot'); if (!el || !talkers.length) { if (el) el.hidden = true; return; }
    const a = talkers[spotIdx++ % talkers.length];
    el.hidden = false; el.style.setProperty('--z-agent', a.color || '#A78BFA');
    el.innerHTML = `<div class="z-ov-spot-orb"></div><div><b>${esc(a.name)}</b><small>${esc(a.role || '')}${a.colonyId ? ' · ' + esc(COLONY_NAMES[a.colonyId] || '') : ''}</small><p>“${esc(String(a.speech).slice(0, 180))}”</p></div>`;
    el.classList.remove('z-flip'); void el.offsetWidth; el.classList.add('z-flip');
  }

  // ── Snapshot diffing → events ────────────────────────────────────────────
  let prev = null, lastAgents = [], primed = false;
  const seenMsg = new Set();
  window.addEventListener('civ:snapshot', (e) => {
    const d = e.detail || {}, s = d.state || {};
    const agentsList = Array.isArray(d.agents) ? d.agents : lastAgents;
    lastAgents = agentsList;
    leaderId = String(s.currentLeader || leaderId || '').toUpperCase();
    if (Array.isArray(d.buildings) && d.buildings.length) {
      buildings = d.buildings.map((b) => ({ name: b.name || b.id, color: b.color, accent: b.accent, w: b.width, cx: (b.x || 0) + (b.width || 0) / 2, cy: (b.y || 0) + (b.height || 0) / 2 }));
    }
    const xs = [], ys = [];
    buildings.forEach((b) => { xs.push(b.cx); ys.push(b.cy); });
    agentsList.forEach((a) => {
      if (typeof a.x !== 'number') return;
      xs.push(a.x); ys.push(a.y);
      let sp = sprites.get(a.id);
      if (!sp) { sp = { x: a.x, y: a.y, trail: [], phase: Math.random() * 6 }; sprites.set(a.id, sp); }
      Object.assign(sp, { tx: a.x, ty: a.y, color: a.color || '#A78BFA', name: a.name || a.id, state: a.state, colony: a.colonyId || 'wild', leader: String(a.id).toUpperCase() === leaderId });
      if (a.speech && a.speech !== sp.speech) { sp.speech = a.speech; sp.speechUntil = Date.now() + 8000; }
    });
    if (xs.length) bounds = { x0: Math.min(...xs) - 30, y0: Math.min(...ys) - 30, x1: Math.max(...xs) + 30, y1: Math.max(...ys) + 30 };
    const meta = $('zRealmMeta');
    if (meta) meta.textContent = `${new Set(agentsList.map((a) => a.colonyId)).size} cities · ${agentsList.length} souls · ${buildings.length} halls`;
    decorateDock(agentsList);

    // overlay lower-third
    if (s.currentLeader) {
      const dec = s.currentDecree || {};
      $('zOvLeader').textContent = `👑 ${s.leaderTitle || 'Imperator'} ${dec.leaderName || s.currentLeader}`;
      $('zOvDecree').textContent = dec.title ? `${dec.title}${dec.mandate ? ' · ' + dec.mandate : ''}` : 'Awaiting decree…';
      const rev = Number(s.currentRevenueUSD || 0), goal = Number(s.treasuryGoalUSD || 100000);
      $('zOvGoalText').textContent = `$${rev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / $${goal.toLocaleString()}`;
      $('zOvGoal').style.width = `${Math.max(0.6, Math.min(100, (rev / goal) * 100))}%`;
    }
    if (Array.isArray(d.recentMessages)) {
      const items = d.recentMessages.slice(-8).map((m) => `<span><b>${esc(m.sender)}</b> ${esc(String(m.text || '').slice(0, 140))}</span>`).join('<i>✦</i>');
      const tk = $('zOvTicker'); if (tk && tk.dataset.k !== String(d.recentMessages.length) + (d.recentMessages[d.recentMessages.length - 1] || {}).id) { tk.dataset.k = String(d.recentMessages.length) + (d.recentMessages[d.recentMessages.length - 1] || {}).id; tk.innerHTML = items + '<i>✦</i>' + items; }
      d.recentMessages.forEach((m) => {
        if (!m || !m.id || seenMsg.has(m.id)) return;
        seenMsg.add(m.id);
        if (primed && document.body.classList.contains('z-overlay') && /decree|announce|system/i.test(m.type || '')) toast('voice', m.sender, String(m.text || '').slice(0, 140));
      });
    }

    if (prev && primed) {
      const ps = prev.state || {};
      const dec = s.currentDecree || {}, pdec = ps.currentDecree || {};
      if (s.currentLeader && ps.currentLeader && s.currentLeader !== ps.currentLeader) {
        proclaim('election', 'A new sovereign rises', `${s.leaderTitle || 'Imperator'} ${dec.leaderName || s.currentLeader}`, 'The pantheon has chosen');
        burst('election'); sfx('playElection');
      } else if (dec.title && dec.title !== pdec.title) {
        proclaim('decree', 'Imperial decree', dec.title, dec.mandate || '');
        burst('spark', null, null, 40); sfx('playColonyWarp', 300);
      }
      const rev = Number(s.currentRevenueUSD || 0), prevRev = Number(ps.currentRevenueUSD || 0);
      if (rev > prevRev + 0.004) {
        toast('coin', `+$${(rev - prevRev).toFixed(2)} to the treasury`, `$${rev.toFixed(2)} of $${Number(s.treasuryGoalUSD || 100000).toLocaleString()}`, '#FFD97A');
        const goalBar = document.querySelector('.z-goal'); const r = goalBar ? goalBar.getBoundingClientRect() : null;
        burst('coin', r ? r.left + r.width * Math.min(1, rev / Number(s.treasuryGoalUSD || 100000)) + 8 : innerWidth - 220, r ? r.top : 80, 46); sfx('playCoin');
      }
      if (Number(s.conclaveCount || 0) > Number(ps.conclaveCount || 0)) { toast('conclave', 'Conclave convened', `Conclave #${s.conclaveCount} is in session`, '#C084FC'); sfx('playClick', 520); }
      const prevCol = new Map((prev.agents || []).map((a) => [a.id, a.colonyId]));
      agentsList.forEach((a) => {
        const pc = prevCol.get(a.id);
        if (pc && a.colonyId && pc !== a.colonyId) toast('warp', `${a.name} migrates`, `${COLONY_NAMES[pc] || pc} → ${COLONY_NAMES[a.colonyId] || a.colonyId}`, a.color);
      });
    }
    prev = { state: JSON.parse(JSON.stringify(s)), agents: agentsList.map((a) => ({ id: a.id, colonyId: a.colonyId })) };
    if (!primed) setTimeout(() => { primed = true; }, 1500);
  });
  window.addEventListener('civ:sse', (e) => {
    const up = !!(e.detail && e.detail.up);
    document.body.classList.toggle('z-link-down', !up);
    if (!up && primed) toast('link', 'Stream reconnecting', 'Live updates paused; retrying…', '#F87171');
  });

  // ── Modal polish: entrance animation + focus handling for existing modals ─
  const lastFocus = new WeakMap();
  new MutationObserver((muts) => {
    muts.forEach((m) => {
      const el = m.target;
      if (!el.classList || !el.classList.contains('modal-overlay')) return;
      const open = getComputedStyle(el).display !== 'none' && (el.classList.contains('active') || el.classList.contains('open') || el.style.display === 'flex' || el.style.display === 'block');
      if (open && !el.dataset.zOpen) {
        el.dataset.zOpen = '1'; lastFocus.set(el, document.activeElement);
        el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
        const f = el.querySelector('input,select,textarea,button:not(.modal-close-btn)') || el.querySelector('button');
        if (f) setTimeout(() => f.focus({ preventScroll: true }), 60);
        sfx('playClick', 760);
      } else if (!open && el.dataset.zOpen) {
        delete el.dataset.zOpen; const lf = lastFocus.get(el); if (lf && lf.focus) lf.focus({ preventScroll: true });
      }
    });
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class', 'style'] });

  // ── Frame loop ───────────────────────────────────────────────────────────
  let spotT = 0;
  function frame(t) {
    stepFx(); drawMap(t);
    if (document.body.classList.contains('z-overlay') && t - spotT > 9000) { spotT = t; rotateSpotlight(lastAgents); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.zothPass2 = { toast, proclaim, burst, setOverlay };
})();
