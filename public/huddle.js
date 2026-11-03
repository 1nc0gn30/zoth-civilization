/**
 * Huddle cards. Three or more people standing together on the sphere
 * get one card. Opening it plays each person's spoken line, then keeps
 * listening for the next line they actually change.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root && root.document) {
    root.HuddleDeck = api;
    if (root.document.readyState === 'loading') {
      root.document.addEventListener('DOMContentLoaded', () => api.mount());
    } else {
      api.mount();
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const RADIUS = 6;
  const MIN_SIZE = 3;
  const MAX_SIZE = 4;

  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  function clusterHuddles(points, radius, minSize, maxSize) {
    const list = (points || []).filter((point) => point && point.id);
    const reach = (radius || RADIUS) * (radius || RADIUS);
    const floor = minSize || MIN_SIZE;
    const cap = maxSize || MAX_SIZE;
    const parent = list.map((_, index) => index);
    function find(index) {
      while (parent[index] !== index) {
        parent[index] = parent[parent[index]];
        index = parent[index];
      }
      return index;
    }
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (dist2(list[i], list[j]) <= reach) parent[find(i)] = find(j);
      }
    }
    const groups = new Map();
    list.forEach((point, index) => {
      const root = find(index);
      if (!groups.has(root)) groups.set(root, []);
      groups.get(root).push(point);
    });
    const out = [];
    groups.forEach((members) => {
      if (members.length < floor) return;
      if (members.length <= cap) {
        out.push(members.slice());
        return;
      }
      const pool = members.slice();
      while (pool.length >= floor && out.length < 4) {
        let best = 0;
        let bestCount = -1;
        for (let i = 0; i < pool.length; i++) {
          let count = 0;
          for (let j = 0; j < pool.length; j++) {
            if (i !== j && dist2(pool[i], pool[j]) <= reach) count += 1;
          }
          if (count > bestCount) {
            bestCount = count;
            best = i;
          }
        }
        if (bestCount < floor - 1) break;
        const seed = pool[best];
        const near = pool
          .filter((point) => point !== seed && dist2(point, seed) <= reach)
          .sort((a, b) => dist2(a, seed) - dist2(b, seed))
          .slice(0, cap - 1);
        const group = [seed].concat(near);
        if (group.length >= floor) out.push(group);
        const drop = new Set(group.map((point) => point.id));
        for (let i = pool.length - 1; i >= 0; i--) {
          if (drop.has(pool[i].id)) pool.splice(i, 1);
        }
      }
    });
    return out.slice(0, 4);
  }

  function topicOf(members) {
    const counts = new Map();
    members.forEach((member) => {
      const topic = String(member.targetApp || member.hall || member.cadre || 'the walk').trim() || 'the walk';
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });
    let best = 'the walk';
    let bestCount = 0;
    counts.forEach((count, topic) => {
      if (count > bestCount) {
        bestCount = count;
        best = topic;
      }
    });
    return best;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const state = {
    mounted: false,
    openKey: '',
    heard: new Set(),
    queue: [],
    playing: false,
    source: null,
    audio: null,
    voiceReady: null,
    stamp: ''
  };

  function dock() { return document.getElementById('huddleDock'); }
  function stage() { return document.getElementById('huddleStage'); }

  function memberKey(member) {
    return `${member.id}|${member.voiceAt || 0}|${member.voiceLine || ''}`;
  }

  function stopAudio() {
    state.queue = [];
    state.playing = false;
    if (state.source) {
      try { state.source.stop(); } catch (err) { /* already ended */ }
      state.source = null;
    }
  }

  function closeStage() {
    const panel = stage();
    if (panel) panel.hidden = true;
    state.openKey = '';
    stopAudio();
  }

  function appendLine(member) {
    const list = document.getElementById('huddleTranscript');
    if (!list || !member || !member.voiceLine) return;
    const row = document.createElement('p');
    row.className = 'huddle-line';
    const who = document.createElement('strong');
    who.textContent = member.name || member.id;
    const voice = document.createElement('span');
    voice.textContent = member.voiceId ? ` · ${member.voiceId}` : '';
    const said = document.createElement('span');
    said.textContent = ` ${member.voiceLine}`;
    row.append(who, voice, said);
    list.appendChild(row);
    list.scrollTop = list.scrollHeight;
  }

  function noteVoice(text) {
    const note = document.getElementById('huddleVoiceNote');
    if (!note) return;
    if (!text) {
      note.hidden = true;
      note.textContent = '';
      return;
    }
    note.hidden = false;
    note.textContent = text;
  }

  async function refreshVoiceReady() {
    try {
      const res = await fetch('/api/voice/status');
      const data = await res.json();
      state.voiceReady = !!(data && data.ready);
    } catch (err) {
      state.voiceReady = false;
    }
    if (state.voiceReady === false) {
      noteVoice('The lines are live. The local voice is still starting, so this huddle stays as text until it answers.');
    } else {
      noteVoice('');
    }
  }

  function audioContext() {
    if (!state.audio) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      state.audio = new Ctx();
    }
    if (state.audio.state === 'suspended') state.audio.resume();
    return state.audio;
  }

  async function pump() {
    if (state.playing || !state.queue.length || !state.openKey) return;
    if (state.voiceReady === null) {
      state.playing = true;
      await refreshVoiceReady();
      state.playing = false;
      if (!state.openKey) return;
    }
    if (state.voiceReady === false) await refreshVoiceReady();
    const member = state.queue.shift();
    appendLine(member);
    if (!state.voiceReady || !member.voiceLine) {
      pump();
      return;
    }
    state.playing = true;
    try {
      const res = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: member.voiceLine,
          voiceId: member.voiceId || 'af_heart'
        })
      });
      if (!res.ok || !state.openKey) {
        state.voiceReady = false;
        noteVoice('The lines are live. The voice service did not answer, so this huddle stays on the page as text.');
        state.playing = false;
        pump();
        return;
      }
      const bytes = await res.arrayBuffer();
      const ctx = audioContext();
      if (!ctx || !state.openKey) {
        state.playing = false;
        return;
      }
      const buffer = await ctx.decodeAudioData(bytes.slice(0));
      if (!state.openKey) {
        state.playing = false;
        return;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      state.source = source;
      source.onended = () => {
        if (state.source === source) state.source = null;
        state.playing = false;
        pump();
      };
      source.start();
    } catch (err) {
      state.playing = false;
      noteVoice('The lines are live. This line could not be spoken, so it stays in the transcript.');
      pump();
    }
  }

  function enqueue(member) {
    const key = memberKey(member);
    if (!member.voiceLine || state.heard.has(key)) return;
    state.heard.add(key);
    state.queue.push(member);
    pump();
  }

  function openStage(members) {
    const panel = stage();
    if (!panel) return;
    const ordered = members.slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const key = ordered.map((member) => member.id).join('|');
    const same = state.openKey === key;
    state.openKey = key;
    panel.hidden = false;
    const title = document.getElementById('huddleStageTitle');
    const kicker = document.getElementById('huddleStageKicker');
    const topic = document.getElementById('huddleStageTopic');
    const cast = document.getElementById('huddleStageCast');
    if (kicker) kicker.textContent = `${ordered.length} together`;
    if (title) title.textContent = ordered.map((member) => member.name).join(', ');
    if (topic) topic.textContent = topicOf(ordered);
    if (cast) {
      cast.textContent = ordered.map((member) => `${member.name} · ${member.voiceId || 'voice'}`).join('   ');
    }
    if (!same) {
      const list = document.getElementById('huddleTranscript');
      if (list) list.textContent = '';
      state.heard = new Set();
      state.voiceReady = null;
      stopAudio();
      ordered.forEach(enqueue);
    }
  }

  function renderCards(groups) {
    const root = dock();
    if (!root) return;
    const stamp = groups.map((group) => group.map((member) => member.id).sort().join(',')).join(';');
    const topics = groups.map(topicOf).join('|');
    const next = `${stamp}::${topics}`;
    if (next === state.stamp) return;
    state.stamp = next;
    root.textContent = '';
    groups.forEach((group) => {
      const ordered = group.slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'huddle-card';
      const title = document.createElement('strong');
      title.textContent = `${ordered.length} together · ${topicOf(ordered)}`;
      const names = document.createElement('span');
      names.textContent = ordered.map((member) => member.name).join(', ');
      button.append(title, names);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openStage(ordered);
      });
      root.appendChild(button);
    });
  }

  function sync() {
    const world = window.sphereWorld;
    if (!world || typeof world.crowdPoints !== 'function') return;
    let points = [];
    try { points = world.crowdPoints() || []; } catch (err) { points = []; }
    const groups = clusterHuddles(points, RADIUS, MIN_SIZE, MAX_SIZE);
    renderCards(groups);
    if (!state.openKey) return;
    const live = groups.find((group) => group.map((member) => member.id).sort().join('|') === state.openKey.split('|').sort().join('|'));
    const source = live || points.filter((point) => state.openKey.split('|').indexOf(point.id) !== -1);
    source.forEach((member) => enqueue(member));
  }

  function mount() {
    if (state.mounted || !document.getElementById('huddleStage')) return;
    state.mounted = true;
    const close = document.getElementById('huddleStageClose');
    if (close) close.addEventListener('click', closeStage);
    const panel = stage();
    if (panel) {
      panel.addEventListener('click', (event) => {
        if (event.target === panel) closeStage();
      });
    }
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && panel && !panel.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closeStage();
      }
    }, true);
  }

  return { clusterHuddles, topicOf, sync, mount, openStage, closeStage };
});
