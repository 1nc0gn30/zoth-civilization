/**
 * 🎵 ZOTH CIVILIZATION — PROCEDURAL HERMETIC AUDIO SYNTHESIZER
 * =====================================================================
 * Zero-dependency Web Audio API procedural sound engine:
 * - Authentic 8-bit & 16-bit Game Boy / cyber-hermetic chiptune sound effects
 * - UI navigation blips & colony warp sweeps
 * - Adytum Key meditation bell chimes (pure harmonic sines)
 * - Treasury & Solana coin jingles
 * - Imperial Conclave fanfare
 * - Safe user-interaction audio context unlock & volume limiter
 *
 * Author: 1nc0gn30 / 1nc0gn30 • NullAI
 * Entity: ZothOS Systems Engineering
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.HermeticAudio = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let audioCtx = null;
  let isEnabled = true;
  let masterGain = null;

  // Check saved state
  try {
    const saved = localStorage.getItem('zoth_audio_enabled');
    if (saved !== null) {
      isEnabled = saved === 'true';
    }
  } catch (e) {}

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        try {
          audioCtx = new AudioContextClass();
          masterGain = audioCtx.createGain();
          masterGain.gain.setValueAtTime(0.18, audioCtx.currentTime); // pleasant ambient volume
          masterGain.connect(audioCtx.destination);
        } catch (e) {}
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Register clean user-gesture unlock
  const unlockAudio = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    ['pointerdown', 'keydown', 'click'].forEach(evt => window.removeEventListener(evt, unlockAudio, true));
  };
  ['pointerdown', 'keydown', 'click'].forEach(evt => window.addEventListener(evt, unlockAudio, { once: true, capture: true }));

  const HermeticAudio = {
    isEnabled: () => isEnabled,

    toggle: function () {
      isEnabled = !isEnabled;
      try {
        localStorage.setItem('zoth_audio_enabled', String(isEnabled));
      } catch (e) {}
      if (isEnabled) {
        getAudioContext();
        HermeticAudio.playClick(880);
      }
      return isEnabled;
    },

    setVolume: function (vol) {
      if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), audioCtx.currentTime);
      }
    },

    // 1. Subtle UI Button Click (Crisp Square Blip)
    playClick: function (freq = 660) {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    },

    // 2. Colony Warp Camera Travel (Sci-Fi Resonant Sweep)
    playColonyWarp: function (baseFreq = 260) {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.22);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.4);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(3200, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.42);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.46);
    },

    // 3. Adytum Key Meditation Step (Pure Celestial Harmonic Bell)
    playKeyStep: function () {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 sacred chord

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        const startTime = now + idx * 0.05;
        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.75);
      });
    },

    // 4. Treasury Coin Jingle (Solana & Stripe Web3 Ding)
    playCoin: function () {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'square';
      osc2.type = 'square';

      // Classic 16-bit double ping: B5 (987.77 Hz) -> E6 (1318.51 Hz)
      osc1.frequency.setValueAtTime(987.77, now);
      osc2.frequency.setValueAtTime(1318.51, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(masterGain);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.36);
    },

    // 5. Imperial Conclave Fanfare
    playElection: function () {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Majestic triad sequence: G4, C5, E5, G5
      const notes = [392.00, 523.25, 659.25, 783.99];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        const startTime = now + idx * 0.07;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.01, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.52);
      });
    },

    // 6. View Mode Toggle
    playModeToggle: function () {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.11);
    },

    // 7. Procedural Surface Footstep & Golden Stairway Acoustics
    _stepIndex: 0,
    playFootstep: function (opts) {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;
      const o = opts || {};
      const stairElev = Number(o.stairElevation) || 0;
      const inHall = !!o.inHall;
      const sprint = !!o.sprint;
      this._stepIndex = (this._stepIndex + 1) % 2;
      const altRatio = this._stepIndex === 0 ? 1.0 : 1.07;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      if (stairElev > 0.08) {
        // Ascending the Golden Stairway to Zoth / Belvedere steps:
        // Harmonic marble chime whose fundamental scales with altitude (+0m -> +9.72m)
        const baseFreq = (240 + Math.min(stairElev, 10) * 34) * altRatio;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.18, now + 0.055);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq * 2.1, now);
        filter.Q.setValueAtTime(2.4, now);

        gain.gain.setValueAtTime(0.055, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);
      } else if (inHall) {
        // Inside a Civic Hall: crisp architectural stone reflection
        const baseFreq = (sprint ? 168 : 148) * altRatio;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(72, now + 0.05);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(920, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.065);
      } else {
        // Outdoor colony plaza / grass: warm low-pass tactile footstep
        const baseFreq = (sprint ? 118 : 98) * altRatio;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(44, now + 0.045);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, now);

        gain.gain.setValueAtTime(0.045, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.055);
      }

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    },

    // 8. Emergent Pair-Programming / Hall Synthesis Chime
    playPairChime: function () {
      if (!isEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4 major celestial arpeggio
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + i * 0.045;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.07, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.38);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    }
  };

  return HermeticAudio;
});

