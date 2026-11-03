"""Procedural Hermetic + Chiptune + Telemetry Audio Score for Zoth Civilization (24.0s, -14.0 LUFS)."""

import math
from sfx import synth, dsp

SEED = 42
TARGET_LUFS = -14.0
TIMELINE = "/opt/zoth-civilization/motion-edit/timeline.json"
OUT = "/opt/zoth-civilization/motion-edit/audio_master.wav"


def bass_pulse(freq, dur=0.36):
    """Punchy analog saw+sub bass note for beat-driven momentum."""
    n = int(dur * synth.SR)
    s1 = dsp.saw(freq, n)
    s2 = dsp.sine(freq * 0.5, n)
    raw = [0.55 * a + 0.75 * b for a, b in zip(s1, s2)]
    filt = dsp.svf(raw, lambda i: 180 + 950 * math.exp(-i / (0.09 * synth.SR)), q=1.1, mode="lp")
    out = []
    for i, v in enumerate(filt):
        tt = i / synth.SR
        env = min(1.0, tt / 0.006) * math.exp(-tt / 0.22)
        out.append(math.tanh(1.5 * v * env))
    return out


def chip_arp(freqs, step_s=0.09, duty=0.25):
    """16-bit Game Boy style pulse arpeggio for the Pixel World & Telemetry transitions."""
    out = []
    for f in freqs:
        n = int(step_s * synth.SR)
        p = dsp.pulse(f, n, width=duty)
        for k in range(n):
            tt = k / synth.SR
            env = min(1.0, tt / 0.003) * math.exp(-tt / (step_s * 0.85))
            out.append(p[k] * env * 0.45)
    return out


def score(mix, tl):
    dur = tl["duration"]

    # 1. Warm Hermetic harmonic pad (D Dorian / D Minor 9 -> Bb Maj7 -> G Min9 -> A7sus4 -> D Maj9 resolve)
    chords = [
        (0.0,  [146.83, 220.00, 261.63, 329.63, 440.00]),  # Dm9 (Orbital Awakening)
        (4.0,  [116.54, 174.61, 220.00, 293.66, 349.23]),  # BbMaj7 (3D Colonies)
        (8.8,  [146.83, 220.00, 293.66, 349.23, 440.00]),  # Dm (Surface Walk POV Drop)
        (14.0, [196.00, 293.66, 349.23, 440.00, 587.33]),  # Gm9 (16-Bit Pixel World & Adytum)
        (18.0, [110.00, 220.00, 277.18, 329.63, 392.00]),  # A7 (Conclave & $100K Treasury)
        (21.0, [146.83, 220.00, 293.66, 369.99, 440.00]),  # D Major / Hermetic Gold Resolve
    ]
    vol = synth.envelope([
        (0.0, 0.42),
        (3.8, 0.52),
        (8.5, 0.35),
        (8.8, 0.62),
        (14.0, 0.55),
        (20.8, 0.65),
        (23.8, 0.25),
    ])
    pad_l, pad_r = synth.pad(dur, chords, volume=vol, detune=0.75, tremolo=0.28, xfade=0.45)
    mix.put_stereo(0.0, pad_l, pad_r, gain=0.48)

    # 2. Driving pulse bassline on 125 BPM grid (0.48s per beat)
    spb = 60.0 / 125.0
    roots = [
        (0.0, 4.0, 73.42),    # D2
        (4.0, 8.8, 58.27),    # Bb1
        (8.8, 14.0, 73.42),   # D2
        (14.0, 18.0, 98.00),  # G2
        (18.0, 21.0, 55.00),  # A1
        (21.0, 23.2, 73.42),  # D2
    ]
    t = 0.0
    beat_idx = 0
    while t < 23.0:
        root_f = 73.42
        for s0, s1, rf in roots:
            if s0 <= t < s1:
                root_f = rf
                break
        # More energetic bass after 4.0s and especially on the 8.8s Surface Walk drop
        gain = 0.36 if t < 4.0 else (0.58 if 8.8 <= t < 21.0 else 0.45)
        octave = 2.0 if (beat_idx % 2 == 1 and t >= 8.8) else 1.0
        mix.put(t, bass_pulse(root_f * octave, dur=0.34), gain=gain)
        if beat_idx % 2 == 1 and t >= 4.0:
            mix.put(t, synth.click(freq=2400, dur=0.035), gain=0.18, pan=0.15)
        t += spb
        beat_idx += 1

    # 3. Scene transitions, risers, impacts, and telemetry cues
    # Scene 1: 0.0s Hook Impact + Hero Anchor ignition
    mix.put(0.02, synth.impact(dur=1.1), gain=0.75)
    mix.put(0.08, synth.chime([293.66, 440.0, 587.33, 880.0], dur=1.6, tau=0.65), gain=0.38)
    mix.typing(0.35, 1.85, 28, gain=(0.14, 0.22))

    # Scene 2: 4.0s 3D Colonies Flyover + Bento PiP pops
    mix.put(3.75, synth.whoosh(0.45, 280, 2200, peak=0.65), gain=0.55, pan=-0.3)
    mix.put(4.00, synth.pop(330, 660, dur=0.16), gain=0.45, pan=-0.25)
    mix.put(5.55, synth.whoosh(0.38, 1800, 420, peak=0.55), gain=0.42, pan=0.3)
    mix.put(5.65, synth.pop(440, 880, dur=0.16), gain=0.45, pan=0.0)
    mix.put(7.15, synth.whoosh(0.38, 360, 2400, peak=0.60), gain=0.42, pan=-0.2)
    mix.put(7.25, synth.pop(523.25, 1046.5, dur=0.16), gain=0.45, pan=0.25)

    # Big Riser into Scene 3 (Surface Walk POV Drop at 8.8s)
    mix.put(7.40, synth.riser(1.40, f0=240, f1=4800), gain=0.58)
    mix.put(8.80, synth.impact(dur=1.25), gain=0.88)
    mix.put(8.85, synth.chime([293.66, 440.0, 659.25, 880.0], dur=1.8, tau=0.75), gain=0.42)
    mix.typing(9.20, 10.60, 24, gain=(0.14, 0.22))
    # Agent dialogue lock-in at 11.2s
    mix.put(11.15, synth.pop(392.0, 784.0, dur=0.18), gain=0.48, pan=-0.15)
    mix.put(11.35, synth.blip(587.33, dur=0.32, tau=0.12), gain=0.36, pan=0.15)
    mix.put(11.55, synth.blip(880.00, dur=0.38, tau=0.14), gain=0.38, pan=0.2)

    # Scene 4: 14.0s 16-Bit Game Boy Pixel World + Adytum Tarot + Cockpit
    mix.put(13.80, synth.whoosh(0.42, 400, 2800, peak=0.65), gain=0.55, pan=0.25)
    mix.put(14.00, chip_arp([293.66, 349.23, 440.0, 587.33, 698.46, 880.0], step_s=0.085), gain=0.52, pan=-0.2)
    mix.put(15.95, synth.whoosh(0.35, 2200, 480, peak=0.55), gain=0.45, pan=-0.25)
    mix.put(16.05, synth.chime([432.0, 528.0, 639.0, 864.0], dur=1.5, tau=0.6), gain=0.38)

    # Scene 5: 18.0s Conclave & $100,000 Treasury Counter Roll
    mix.put(17.85, synth.whoosh(0.38, 300, 2100, peak=0.6), gain=0.50)
    for k in range(14):
        tk = 18.15 + k * 0.12
        mix.put(tk, synth.click(freq=1400 + k * 110, dur=0.04), gain=0.26, pan=-0.3 + 0.04 * k)
    mix.put(19.90, synth.chime([440.0, 554.37, 659.25, 880.0], dur=1.4, tau=0.55), gain=0.44)

    # Scene 6: 21.0s Final Brand Lockup & Sovereign Resolve
    mix.put(20.30, synth.riser(0.70, f0=320, f1=3600), gain=0.45)
    mix.put(21.00, synth.impact(dur=1.1), gain=0.72)
    mix.put(21.02, synth.chime([293.66, 369.99, 440.0, 587.33, 739.99, 880.0], dur=2.6, tau=1.05), gain=0.52)
    mix.put(21.45, chip_arp([293.66, 369.99, 440.0, 587.33, 739.99, 880.0], step_s=0.095), gain=0.35, pan=0.1)
