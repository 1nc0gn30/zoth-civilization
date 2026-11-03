/* ZOTH CIVILIZATION — live HUD: decree banner, goal bar, SSE pulse.
   Read-only: listens to civ:snapshot / civ:sse events emitted by app.js. */
(function () {
  'use strict';
  const header = document.querySelector('.header-bar');
  const nav = header && header.querySelector('.nav-tabs');
  if (!header || !nav) return;

  const goal = document.createElement('div');
  goal.className = 'z-goal';
  goal.setAttribute('role', 'progressbar');
  goal.setAttribute('aria-label', 'Treasury progress toward $100K');
  goal.innerHTML = '<i style="width:0%"></i>';

  const bar = document.createElement('div');
  bar.className = 'z-decree';
  bar.id = 'zDecreeBanner';
  bar.setAttribute('role', 'status');
  bar.setAttribute('aria-live', 'polite');
  bar.innerHTML = `
    <span class="z-decree-crown" aria-hidden="true">👑</span>
    <span class="z-decree-leader" id="zLeader">—</span>
    <span class="z-term" title="Term remaining"><i id="zTermFill" style="width:0%"></i></span>
    <span class="z-chip" id="zTermText">term —</span>
    <span class="z-decree-sep"></span>
    <span class="z-decree-title" id="zDecree">Awaiting decree…</span>
    <span class="z-chip z-opt" title="Agents by activity"><span aria-hidden="true">⚒</span><b id="zBusy">0</b> working</span>
    <span class="z-chip z-opt" title="Subconscious memories"><span aria-hidden="true">🜍</span><b id="zMem">—</b></span>
    <span class="z-chip z-opt" title="Conclaves held"><span aria-hidden="true">🗳</span><b id="zConclave">0</b></span>
    <span class="z-chip" title="Live stream link"><span class="feed-live" id="zLive"><i></i>LIVE</span></span>`;
  nav.before(bar);
  header.appendChild(goal);

  const $ = id => document.getElementById(id);
  const last = {};
  function set(id, text) {
    const el = $(id);
    if (!el || last[id] === text) return;
    const had = id in last;
    last[id] = text;
    el.textContent = text;
    if (had) { el.classList.remove('z-bump'); void el.offsetWidth; el.classList.add('z-bump'); }
  }
  function fmtDur(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`;
  }

  window.addEventListener('civ:snapshot', e => {
    const d = e.detail || {};
    const s = d.state;
    if (s) {
      const dec = s.currentDecree || {};
      const leaderName = dec.leaderName && String(dec.leaderId || '').toUpperCase() === String(s.currentLeader || '').toUpperCase()
        ? dec.leaderName : (s.currentLeader || '—');
      set('zLeader', `${s.leaderTitle || 'Imperator'} · ${leaderName}`);
      const decEl = $('zDecree');
      const title = dec.title || 'No decree yet';
      const mandate = dec.mandate || '';
      const key = title + '|' + mandate;
      if (decEl && last.zDecree !== key) {
        last.zDecree = key;
        decEl.innerHTML = '';
        decEl.appendChild(document.createTextNode(title));
        if (mandate) { const em = document.createElement('em'); em.textContent = ' — ' + mandate; decEl.appendChild(em); }
        decEl.title = title + (mandate ? '\n' + mandate : '');
      }
      const tot = Number(s.leaderTermTotalSec) || 0, rem = Number(s.leaderTermRemainingSec) || 0;
      if (tot > 0) {
        $('zTermFill').style.width = `${Math.min(100, (rem / tot) * 100).toFixed(1)}%`;
        set('zTermText', `${fmtDur(rem)} left`);
      }
      set('zConclave', String(s.conclaveCount || 0));
      if (s.subconsciousMemoryDensity) set('zMem', String(s.subconsciousMemoryDensity).replace(/\s*\(.*\)/, ''));
      const rev = Number(s.currentRevenueUSD || 0), g = Number(s.treasuryGoalUSD || 100000);
      const pct = Math.min(100, (rev / g) * 100);
      goal.firstChild.style.width = `${Math.max(pct, 0.4)}%`;
      goal.setAttribute('aria-valuenow', pct.toFixed(3));
      goal.title = `$${rev.toFixed(2)} of $${g.toLocaleString()} (${pct.toFixed(3)}%)`;
    }
    if (Array.isArray(d.agents) && d.agents.length) {
      const busy = d.agents.filter(a => /BUILD|CRAFT|OPTIMIZ|CODING|WORK/.test(String(a.state || ''))).length;
      set('zBusy', `${busy}/${d.agents.length}`);
    }
  });

  window.addEventListener('civ:sse', e => {
    const up = !!(e.detail && e.detail.up);
    ['zLive', 'feedLive'].forEach(id => { const el = $(id); if (el) el.classList.toggle('is-down', !up); });
    const z = $('zLive'); if (z) z.lastChild.textContent = up ? 'LIVE' : 'RECONNECTING';
  });
})();
