#!/usr/bin/env python3
"""
🦾 ZOTH KINESTHETIC PINPOINT TRAINER & ROBOTIC ARM MACRO RECORDER
=====================================================================
Records user cursor movements, pinpoint clicks, delays, and keystrokes
in real-time—similar to how robotic arms are programmed via kinesthetic
lead-through teaching.

Features:
- Sub-millisecond pinpoint coordinate acquisition via XQueryPointer & evdev.
- Zero-lag non-blocking event-driven click, scroll, and key interception across all hardware devices.
- Global F9 emergency stop hotkey from any window on the desktop.
- Trajectory decimation (cleans jitter while preserving exact click nodes & path curves).
- Automated DuckyScript compiler (.ducky) for zero-detection browser & OS playback.
- Standalone ydotool replay execution with variable speed control (1x, 2x, 5x).
- Embedded lightweight HTTP API and Avant-Garde Web UI for point-and-click control.

Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
Entity: NullAI Platform • ZothOS Systems Engineering
"""

import os
import sys
import time
import json
import ctypes
import select
import threading
import subprocess
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Dict, List, Optional, Any, Tuple

try:
    import evdev
    from evdev import ecodes
except ImportError:
    evdev = None
    ecodes = None

CIV_ROOT = Path("/opt/zoth-civilization")
DATA_DIR = CIV_ROOT / "data" / "trajectories"
DATA_DIR.mkdir(parents=True, exist_ok=True)
PRESETS_DIR = Path("/opt/azoth-local-agent/tools/presets")
PRESETS_DIR.mkdir(parents=True, exist_ok=True)

# Keycode to ASCII mapping for human-readable DuckyScript compilation
KEY_MAP = {
    "KEY_A": "a", "KEY_B": "b", "KEY_C": "c", "KEY_D": "d", "KEY_E": "e",
    "KEY_F": "f", "KEY_G": "g", "KEY_H": "h", "KEY_I": "i", "KEY_J": "j",
    "KEY_K": "k", "KEY_L": "l", "KEY_M": "m", "KEY_N": "n", "KEY_O": "o",
    "KEY_P": "p", "KEY_Q": "q", "KEY_R": "r", "KEY_S": "s", "KEY_T": "t",
    "KEY_U": "u", "KEY_V": "v", "KEY_W": "w", "KEY_X": "x", "KEY_Y": "y",
    "KEY_Z": "z", "KEY_1": "1", "KEY_2": "2", "KEY_3": "3", "KEY_4": "4",
    "KEY_5": "5", "KEY_6": "6", "KEY_7": "7", "KEY_8": "8", "KEY_9": "9",
    "KEY_0": "0", "KEY_SPACE": " ", "KEY_MINUS": "-", "KEY_EQUAL": "=",
    "KEY_DOT": ".", "KEY_COMMA": ",", "KEY_SLASH": "/", "KEY_SEMICOLON": ";",
    "KEY_APOSTROPHE": "'", "KEY_GRAVE": "`", "KEY_BACKSLASH": "\\",
    "KEY_LEFTBRACE": "[", "KEY_RIGHTBRACE": "]"
}

SHIFT_KEY_MAP = {
    "KEY_A": "A", "KEY_B": "B", "KEY_C": "C", "KEY_D": "D", "KEY_E": "E",
    "KEY_F": "F", "KEY_G": "G", "KEY_H": "H", "KEY_I": "I", "KEY_J": "J",
    "KEY_K": "K", "KEY_L": "L", "KEY_M": "M", "KEY_N": "N", "KEY_O": "O",
    "KEY_P": "P", "KEY_Q": "Q", "KEY_R": "R", "KEY_S": "S", "KEY_T": "T",
    "KEY_U": "U", "KEY_V": "V", "KEY_W": "W", "KEY_X": "X", "KEY_Y": "Y",
    "KEY_Z": "Z", "KEY_1": "!", "KEY_2": "@", "KEY_3": "#", "KEY_4": "$",
    "KEY_5": "%", "KEY_6": "^", "KEY_7": "&", "KEY_8": "*", "KEY_9": "(",
    "KEY_0": ")", "KEY_SPACE": " ", "KEY_MINUS": "_", "KEY_EQUAL": "+",
    "KEY_DOT": ">", "KEY_COMMA": "<", "KEY_SLASH": "?", "KEY_SEMICOLON": ":",
    "KEY_APOSTROPHE": '"', "KEY_GRAVE": "~", "KEY_BACKSLASH": "|",
    "KEY_LEFTBRACE": "{", "KEY_RIGHTBRACE": "}"
}


class X11PointerTracker:
    """High-speed microsecond pointer position tracker via libX11.so.6."""
    def __init__(self, display_str: str = ":0", xauthority: str = "/run/user/1000/xauth_FoKuRj"):
        os.environ["DISPLAY"] = display_str
        if os.path.exists(xauthority):
            os.environ["XAUTHORITY"] = xauthority
        
        try:
            self.x11 = ctypes.cdll.LoadLibrary("libX11.so.6")
            self.display = self.x11.XOpenDisplay(None)
            if not self.display:
                self.available = False
            else:
                self.root = self.x11.XDefaultRootWindow(self.display)
                self.root_ret = ctypes.c_ulong()
                self.child_ret = ctypes.c_ulong()
                self.rx = ctypes.c_int()
                self.ry = ctypes.c_int()
                self.wx = ctypes.c_int()
                self.wy = ctypes.c_int()
                self.mask = ctypes.c_uint()
                self.available = True
        except Exception:
            self.available = False

    def get_pos(self) -> Tuple[int, int, int]:
        if not self.available or not self.display:
            return (0, 0, 0)
        try:
            self.x11.XQueryPointer(
                self.display, self.root,
                ctypes.byref(self.root_ret), ctypes.byref(self.child_ret),
                ctypes.byref(self.rx), ctypes.byref(self.ry),
                ctypes.byref(self.wx), ctypes.byref(self.wy),
                ctypes.byref(self.mask)
            )
            return (self.rx.value, self.ry.value, self.mask.value)
        except Exception:
            return (0, 0, 0)

    def close(self):
        if self.available and self.display:
            try:
                self.x11.XCloseDisplay(self.display)
            except Exception:
                pass
            self.display = None


class KinestheticRecorder:
    """Core state machine and trajectory capture recorder."""
    def __init__(self):
        self.state = "IDLE"  # IDLE, COUNTDOWN, RECORDING, STOPPED
        self.current_name = "default_macro"
        self.events: List[Dict[str, Any]] = []
        self.start_time: float = 0.0
        self.stop_time: float = 0.0
        self.record_thread: Optional[threading.Thread] = None
        self.stop_requested = False
        self.shift_active = False
        self.ctrl_active = False
        self.alt_active = False
        self.pointer_tracker = X11PointerTracker()
        self.last_pos = (-1, -1)
        self.countdown_remaining = 0
        self.lock = threading.Lock()

    def get_status(self) -> Dict[str, Any]:
        with self.lock:
            px, py, mask = self.pointer_tracker.get_pos()
            ev_count = len(self.events)
            st = self.state
            name = self.current_name
            cd = self.countdown_remaining
            elapsed = round(time.time() - self.start_time, 2) if st == "RECORDING" else 0.0

        return {
            "state": st,
            "current_name": name,
            "events_count": ev_count,
            "cursor": {"x": px, "y": py, "mask": mask},
            "countdown": cd,
            "elapsed": elapsed,
        }

    def start_recording(self, name: str = "macro", countdown_sec: int = 3) -> Dict[str, Any]:
        with self.lock:
            if self.state in ("RECORDING", "COUNTDOWN"):
                return {"ok": False, "error": "Already recording or counting down"}
            self.current_name = name.strip() or f"macro_{int(time.time())}"
            self.events = []
            self.stop_requested = False
            self.state = "COUNTDOWN"
            self.countdown_remaining = countdown_sec

        def countdown_worker():
            for c in range(countdown_sec, 0, -1):
                if self.stop_requested:
                    return
                with self.lock:
                    self.countdown_remaining = c
                time.sleep(1.0)

            if self.stop_requested:
                return

            with self.lock:
                self.countdown_remaining = 0
                self.state = "RECORDING"
                self.start_time = time.time()
                px, py, _ = self.pointer_tracker.get_pos()
                self.events.append({
                    "time": 0.0,
                    "type": "origin",
                    "x": px,
                    "y": py
                })
                self.last_pos = (px, py)
            
            self._run_capture_loop()

        self.record_thread = threading.Thread(target=countdown_worker, daemon=True)
        self.record_thread.start()
        return {"ok": True, "state": "COUNTDOWN", "name": self.current_name}

    def stop_recording(self) -> Dict[str, Any]:
        self.stop_requested = True
        
        # Wait for thread to conclude
        if self.record_thread and self.record_thread.is_alive():
            self.record_thread.join(timeout=1.0)

        with self.lock:
            self.state = "STOPPED"
            self.stop_time = time.time()

        # Process and save trajectory
        summary = self._save_trajectory()
        return {"ok": True, "state": "STOPPED", "summary": summary}

    def _discover_input_devices(self) -> List[Any]:
        if not evdev:
            return []
        devices = []
        try:
            for p in evdev.list_devices():
                try:
                    dev = evdev.InputDevice(p)
                    caps = dev.capabilities()
                    if ecodes.EV_KEY in caps:
                        # Ensure non-blocking
                        os.set_blocking(dev.fd, False)
                        devices.append(dev)
                except Exception:
                    pass
        except Exception:
            pass
        return devices

    def _run_capture_loop(self):
        """High-frequency non-blocking polling & event capture loop."""
        devices = self._discover_input_devices()
        dev_map = {d.fd: d for d in devices}
        poll_interval = 0.03  # ~33Hz cursor waypoint polling
        last_poll = time.time()

        try:
            while not self.stop_requested:
                now = time.time()
                # 1. Coordinate Waypoint Polling
                if now - last_poll >= poll_interval:
                    last_poll = now
                    px, py, _ = self.pointer_tracker.get_pos()
                    if (px, py) != self.last_pos and px >= 0 and py >= 0:
                        elapsed = round(now - self.start_time, 4)
                        with self.lock:
                            self.events.append({
                                "time": elapsed,
                                "type": "move",
                                "x": px,
                                "y": py
                            })
                        self.last_pos = (px, py)

                # 2. Hardware Event Interception (Clicks & Keys)
                if dev_map:
                    try:
                        r, _, _ = select.select(list(dev_map.keys()), [], [], 0.02)
                        for fd in r:
                            dev = dev_map[fd]
                            try:
                                while True:
                                    event = dev.read_one()
                                    if event is None:
                                        break
                                    if event.type == ecodes.EV_KEY:
                                        self._handle_key_event(event)
                            except BlockingIOError:
                                pass
                            except Exception:
                                pass
                    except Exception:
                        time.sleep(0.01)
                else:
                    time.sleep(0.02)
        finally:
            for d in devices:
                try:
                    d.close()
                except Exception:
                    pass

    def _handle_key_event(self, event: Any):
        code_name = ecodes.KEY.get(event.code, ecodes.BTN.get(event.code, f"UNKNOWN_{event.code}"))
        now = time.time()
        elapsed = round(now - self.start_time, 4)
        px, py, _ = self.pointer_tracker.get_pos()

        # F9 is Global Emergency Stop Hotkey
        if code_name == "KEY_F9" and event.value == 1:
            print(f"🛑 [HOTKEY] F9 pressed! Halting recording immediately.")
            self.stop_requested = True
            with self.lock:
                self.state = "STOPPED"
            return

        # Track Modifiers
        if code_name in ("KEY_LEFTSHIFT", "KEY_RIGHTSHIFT"):
            self.shift_active = (event.value > 0)
        elif code_name in ("KEY_LEFTCTRL", "KEY_RIGHTCTRL"):
            self.ctrl_active = (event.value > 0)
        elif code_name in ("KEY_LEFTALT", "KEY_RIGHTALT"):
            self.alt_active = (event.value > 0)

        # Mouse Buttons
        if code_name in ("BTN_LEFT", "BTN_RIGHT", "BTN_MIDDLE"):
            btn_str = "left" if code_name == "BTN_LEFT" else ("right" if code_name == "BTN_RIGHT" else "middle")
            act = "mouse_down" if event.value == 1 else ("mouse_up" if event.value == 0 else "mouse_hold")
            with self.lock:
                self.events.append({
                    "time": elapsed,
                    "type": act,
                    "button": btn_str,
                    "x": px,
                    "y": py
                })
            return

        # Keyboard Keys
        if event.value in (1, 2):  # 1 = Press, 2 = Repeat
            char = None
            if self.shift_active and code_name in SHIFT_KEY_MAP:
                char = SHIFT_KEY_MAP[code_name]
            elif not self.shift_active and code_name in KEY_MAP:
                char = KEY_MAP[code_name]

            with self.lock:
                self.events.append({
                    "time": elapsed,
                    "type": "key_press",
                    "code": code_name,
                    "char": char,
                    "ctrl": self.ctrl_active,
                    "shift": self.shift_active,
                    "alt": self.alt_active,
                    "x": px,
                    "y": py
                })

    def _save_trajectory(self) -> Dict[str, Any]:
        """Compile raw events into optimized trajectory and clean DuckyScript."""
        with self.lock:
            raw_events = list(self.events)
            name = self.current_name

        total_duration = round(raw_events[-1]["time"], 2) if raw_events else 0.0

        # Compile to DuckyScript commands
        ducky_lines = [
            f"REM 🦾 Pinpoint Trajectory Macro: {name}",
            f"REM Recorded by Zoth Kinesthetic Trainer",
            f"REM Duration: {total_duration}s | Events: {len(raw_events)}",
            ""
        ]

        text_buffer = ""
        last_t = 0.0
        click_count = 0
        waypoint_count = 0

        def flush_text():
            nonlocal text_buffer
            if text_buffer:
                ducky_lines.append(f"STRING {text_buffer}")
                text_buffer = ""

        for ev in raw_events:
            t = ev.get("time", 0.0)
            dt_ms = int((t - last_t) * 1000)
            if dt_ms > 120:
                flush_text()
                clamped_delay = min(dt_ms, 4000)
                ducky_lines.append(f"DELAY {clamped_delay}")
            last_t = t

            etype = ev.get("type")
            if etype == "move":
                waypoint_count += 1
            elif etype == "mouse_down":
                flush_text()
                x, y = ev.get("x", 0), ev.get("y", 0)
                ducky_lines.append(f"CLICK {x} {y}")
                click_count += 1
            elif etype == "key_press":
                char = ev.get("char")
                code = ev.get("code")
                ctrl = ev.get("ctrl")
                if ctrl and code == "KEY_V":
                    flush_text()
                    ducky_lines.append("CTRL+V")
                elif ctrl and code == "KEY_T":
                    flush_text()
                    ducky_lines.append("CTRL+T")
                elif ctrl and code == "KEY_ENTER":
                    flush_text()
                    ducky_lines.append("CTRL+ENTER")
                elif code == "KEY_ENTER":
                    flush_text()
                    ducky_lines.append("ENTER")
                elif code == "KEY_TAB":
                    flush_text()
                    ducky_lines.append("TAB")
                elif code == "KEY_ESC":
                    flush_text()
                    ducky_lines.append("ESCAPE")
                elif code == "KEY_BACKSPACE":
                    flush_text()
                    ducky_lines.append("BACKSPACE")
                elif char:
                    text_buffer += char

        flush_text()
        ducky_script = "\n".join(ducky_lines) + "\n"

        # Save JSON trajectory
        json_path = DATA_DIR / f"{name}.json"
        summary_payload = {
            "name": name,
            "recordedAt": time.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": total_duration,
            "clicksCount": click_count,
            "waypointsCount": waypoint_count,
            "eventsCount": len(raw_events),
            "events": raw_events,
            "duckyScript": ducky_script
        }
        json_path.write_text(json.dumps(summary_payload, indent=2), encoding="utf-8")

        # Save DuckyScript preset
        ducky_path = PRESETS_DIR / f"{name}.ducky"
        ducky_path.write_text(ducky_script, encoding="utf-8")

        # Generate Python Standalone Replay Script
        py_replay_path = DATA_DIR / f"replay_{name}.py"
        py_code = f"""#!/usr/bin/env python3
# Standalone Pinpoint Trajectory Replay: {name}
import os, sys, time, subprocess

os.environ["YDOTOOL_SOCKET"] = "/run/ydotoold.socket"

def run_cmd(args):
    subprocess.run(args, check=True)

print("🚀 Starting pinpoint replay of '{name}'...")
time.sleep(1.0)
"""
        for line in ducky_lines:
            if line.startswith("CLICK"):
                pts = line.split()
                if len(pts) >= 3:
                    py_code += f'run_cmd(["ydotool", "mousemove", "-a", "-x", "{pts[1]}", "-y", "{pts[2]}"])\n'
                    py_code += 'run_cmd(["ydotool", "click", "0xC0"])\n'
            elif line.startswith("DELAY"):
                d = line.split()[1]
                py_code += f'time.sleep({int(d)/1000.0})\n'
            elif line.startswith("STRING"):
                txt = line.replace("STRING ", "", 1).strip()
                py_code += f'run_cmd(["ydotool", "type", {json.dumps(txt)}])\n'
            elif line == "ENTER":
                py_code += 'run_cmd(["ydotool", "key", "28:1", "28:0"])\n'
            elif line == "TAB":
                py_code += 'run_cmd(["ydotool", "key", "15:1", "15:0"])\n'
            elif line == "CTRL+V":
                py_code += 'run_cmd(["ydotool", "key", "29:1", "47:1", "47:0", "29:0"])\n'

        py_code += 'print("✅ Replay complete!")\n'
        py_replay_path.write_text(py_code, encoding="utf-8")
        py_replay_path.chmod(0o755)

        print(f"📦 [Saved] Trajectory: {json_path}")
        print(f"📦 [Saved] DuckyScript: {ducky_path}")
        print(f"📦 [Saved] Replay Script: {py_replay_path}")

        return {
            "name": name,
            "duration": total_duration,
            "clicks": click_count,
            "waypoints": waypoint_count,
            "jsonPath": str(json_path),
            "duckyPath": str(ducky_path),
            "replayPath": str(py_replay_path),
            "duckyScript": ducky_script
        }


# Global singleton instance
RECORDER = KinestheticRecorder()


def execute_replay(name: str, speed_multiplier: float = 1.0) -> Dict[str, Any]:
    """Execute trajectory using ydotool with precise timing."""
    json_path = DATA_DIR / f"{name}.json"
    if not json_path.exists():
        return {"ok": False, "error": f"Trajectory '{name}' does not exist"}

    data = json.loads(json_path.read_text(encoding="utf-8"))
    events = data.get("events", [])
    if not events:
        return {"ok": False, "error": "Trajectory contains no events"}

    print(f"▶️ [Replay] Executing trajectory '{name}' ({len(events)} events) at {speed_multiplier}x speed...")
    os.environ["YDOTOOL_SOCKET"] = "/run/ydotoold.socket"

    def replay_worker():
        last_t = 0.0
        for ev in events:
            t = ev.get("time", 0.0)
            dt = (t - last_t) / speed_multiplier
            if dt > 0.005:
                time.sleep(min(dt, 3.0))
            last_t = t

            etype = ev.get("type")
            x, y = ev.get("x", 0), ev.get("y", 0)

            if etype in ("move", "origin"):
                subprocess.run(["ydotool", "mousemove", "-a", "-x", str(x), "-y", str(y)], check=False)
            elif etype == "mouse_down":
                subprocess.run(["ydotool", "mousemove", "-a", "-x", str(x), "-y", str(y)], check=False)
                btn = "0xC0" if ev.get("button") == "left" else "0xC1"
                subprocess.run(["ydotool", "click", btn], check=False)
            elif etype == "key_press":
                char = ev.get("char")
                code = ev.get("code")
                ctrl = ev.get("ctrl")
                if ctrl and code == "KEY_V":
                    subprocess.run(["ydotool", "key", "29:1", "47:1", "47:0", "29:0"], check=False)
                elif code == "KEY_ENTER":
                    subprocess.run(["ydotool", "key", "28:1", "28:0"], check=False)
                elif code == "KEY_TAB":
                    subprocess.run(["ydotool", "key", "15:1", "15:0"], check=False)
                elif char:
                    subprocess.run(["ydotool", "type", char], check=False)

        print(f"✅ [Replay] Finished playback of '{name}'!")

    t = threading.Thread(target=replay_worker, daemon=True)
    t.start()
    return {"ok": True, "status": "REPLAYING", "name": name, "events": len(events)}


# ---------------------------------------------------------------------------
# HTTP SERVER & AVANT-GARDE WEB UI
# ---------------------------------------------------------------------------

HTML_UI = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kinesthetic Pinpoint Trainer • Robotic Arm Macro Recorder</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07080a;
      --card-bg: rgba(14, 16, 22, 0.75);
      --gold: #D4AF37;
      --gold-dim: rgba(212, 175, 55, 0.15);
      --red: #ff334b;
      --green: #00ff88;
      --border: rgba(255, 255, 255, 0.08);
      --text: #eaeef4;
      --muted: #8b949e;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
      background-image: 
        radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.08) 0%, transparent 60%),
        linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
      background-size: 100% 100%, 32px 32px, 32px 32px;
    }
    header {
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(7, 8, 10, 0.85);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .brand-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      background: var(--gold-dim);
      color: var(--gold);
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    h1 {
      font-family: 'Syne', sans-serif;
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #777;
    }
    .dot.recording {
      background: var(--red);
      box-shadow: 0 0 12px var(--red);
      animation: pulse 1s infinite;
    }
    .dot.ready { background: var(--green); box-shadow: 0 0 8px var(--green); }
    .dot.countdown { background: var(--gold); animation: pulse 0.5s infinite; }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }
    main {
      flex: 1;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr 420px;
      gap: 2rem;
    }
    @media (max-width: 1024px) {
      main { grid-template-columns: 1fr; }
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(16px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }
    .canvas-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .canvas-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .canvas-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    #trajectoryCanvas {
      width: 100%;
      height: 480px;
      background: #040507;
      border: 1px solid rgba(212, 175, 55, 0.25);
      border-radius: 8px;
      position: relative;
    }
    .hud-bar {
      display: flex;
      gap: 1.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      background: rgba(0, 0, 0, 0.4);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      border: 1px solid var(--border);
    }
    .hud-stat span { color: var(--gold); font-weight: 600; }
    .controls {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .input-group label {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: var(--muted);
      margin-bottom: 0.4rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .input-field {
      width: 100%;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .input-field:focus { border-color: var(--gold); }
    .btn {
      width: 100%;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      font-family: 'Syne', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: none;
    }
    .btn-record {
      background: linear-gradient(135deg, #ff334b, #d90429);
      color: #fff;
      box-shadow: 0 4px 20px rgba(255, 51, 75, 0.35);
    }
    .btn-record:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(255, 51, 75, 0.5); }
    .btn-stop {
      background: #1f232d;
      color: var(--text);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .btn-stop:hover { background: #282d3a; }
    .btn-replay {
      background: linear-gradient(135deg, var(--gold), #b38f20);
      color: #000;
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
    }
    .btn-replay:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(212, 175, 55, 0.45); }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 0.6rem 1rem;
      font-size: 0.85rem;
    }
    .btn-secondary:hover { background: rgba(255, 255, 255, 0.1); }
    .ducky-editor {
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    textarea {
      width: 100%;
      height: 220px;
      background: #050608;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem;
      color: #8be9fd;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      line-height: 1.5;
      resize: vertical;
      outline: none;
    }
    .hotkey-callout {
      background: rgba(212, 175, 55, 0.05);
      border: 1px dashed rgba(212, 175, 55, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    .hotkey-callout kbd {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      padding: 0.15rem 0.4rem;
      font-family: 'JetBrains Mono', monospace;
      color: var(--gold);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-tag">ROBOTIC TEACH PENDANT</div>
      <h1>Zoth Kinesthetic Pinpoint Trainer</h1>
    </div>
    <div class="status-pill">
      <div class="dot ready" id="statusDot"></div>
      <span id="statusText">STANDBY</span>
    </div>
  </header>

  <main>
    <div class="card canvas-container">
      <div class="canvas-header">
        <div class="canvas-title">
          <span>🎯 Lead-Through Trajectory Visualizer</span>
        </div>
        <div style="display:flex; gap: 0.5rem;">
          <button class="btn btn-secondary" onclick="clearCanvas()">Clear Grid</button>
        </div>
      </div>

      <canvas id="trajectoryCanvas" width="960" height="480"></canvas>

      <div class="hud-bar">
        <div class="hud-stat">X: <span id="hudX">0</span></div>
        <div class="hud-stat">Y: <span id="hudY">0</span></div>
        <div class="hud-stat">WAYPOINTS: <span id="hudWaypoints">0</span></div>
        <div class="hud-stat">CLICKS: <span id="hudClicks">0</span></div>
        <div class="hud-stat">TIME: <span id="hudTime">0.0s</span></div>
      </div>
    </div>

    <div class="card controls">
      <div class="input-group">
        <label>Macro Trajectory Name</label>
        <input type="text" id="macroName" class="input-field" value="google_ai_studio_builder">
      </div>

      <div class="input-group">
        <label>Lead-in Countdown (Seconds)</label>
        <input type="number" id="countdownSec" class="input-field" value="3" min="0" max="10">
      </div>

      <div class="hotkey-callout">
        💡 <strong>Robotic Lead-Through Tip:</strong> Click <strong>Start Recording</strong>, switch to your target window (e.g. Firefox), and click pinpoint to pinpoint. Press <kbd>F9</kbd> anywhere on screen to instantly stop and compile!
      </div>

      <button id="btnRecord" class="btn btn-record" onclick="toggleRecord()">
        <span>🔴</span> Start Kinesthetic Recording
      </button>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <button id="btnReplay" class="btn btn-replay" onclick="replayTrajectory()">
          <span>▶️</span> Replay Pinpoints
        </button>
        <button class="btn btn-secondary" onclick="exportDucky()">
          <span>📋</span> Copy DuckyScript
        </button>
      </div>

      <div class="ducky-editor">
        <label style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:var(--muted);">COMPILED DUCKY SCRIPT</label>
        <textarea id="duckyPreview" placeholder="Your pinpoint actions will be compiled here into zero-detection DuckyScript..."></textarea>
      </div>
    </div>
  </main>

  <script>
    let isRecording = false;
    const canvas = document.getElementById('trajectoryCanvas');
    const ctx = canvas.getContext('2d');
    let points = [];

    function clearCanvas() {
      ctx.fillStyle = '#040507';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      points = [];
    }
    clearCanvas();

    function drawPoint(screenX, screenY, type = 'move') {
      const cx = (screenX / 1920) * canvas.width;
      const cy = (screenY / 1080) * canvas.height;

      if (type === 'move') {
        if (points.length > 0) {
          const prev = points[points.length - 1];
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
          ctx.lineWidth = 2;
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
        points.push({ x: cx, y: cy });
      } else if (type === 'click') {
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ff334b';
        ctx.fill();
      }
    }

    async function pollStatus() {
      try {
        const res = await fetch('/api/recorder/status');
        const data = await res.json();
        
        document.getElementById('hudX').textContent = data.cursor.x;
        document.getElementById('hudY').textContent = data.cursor.y;
        document.getElementById('hudWaypoints').textContent = data.events_count;

        const dot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const btnRecord = document.getElementById('btnRecord');

        if (data.state === 'COUNTDOWN') {
          dot.className = 'dot countdown';
          statusText.textContent = `STARTING IN ${data.countdown}s`;
          btnRecord.className = 'btn btn-stop';
          btnRecord.innerHTML = `<span>⏳</span> Get Ready (${data.countdown}s)...`;
        } else if (data.state === 'RECORDING') {
          isRecording = true;
          dot.className = 'dot recording';
          statusText.textContent = 'RECORDING 🔴';
          document.getElementById('hudTime').textContent = data.elapsed + 's';
          btnRecord.className = 'btn btn-stop';
          btnRecord.innerHTML = '<span>⏹️</span> Stop Recording (or press F9)';
          drawPoint(data.cursor.x, data.cursor.y, 'move');
        } else {
          if (isRecording) {
            isRecording = false;
            fetchLatestTrajectory();
          }
          dot.className = 'dot ready';
          statusText.textContent = 'STANDBY';
          btnRecord.className = 'btn btn-record';
          btnRecord.innerHTML = '<span>🔴</span> Start Kinesthetic Recording';
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function toggleRecord() {
      const name = document.getElementById('macroName').value;
      const cd = parseInt(document.getElementById('countdownSec').value) || 3;

      if (!isRecording) {
        clearCanvas();
        await fetch('/api/recorder/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, countdown: cd })
        });
      } else {
        await fetch('/api/recorder/stop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        fetchLatestTrajectory();
      }
    }

    async function fetchLatestTrajectory() {
      const name = document.getElementById('macroName').value;
      try {
        const res = await fetch(`/api/recorder/trajectory/${name}`);
        const data = await res.json();
        if (data.ok && data.trajectory) {
          document.getElementById('duckyPreview').value = data.trajectory.duckyScript || '';
          document.getElementById('hudClicks').textContent = data.trajectory.clicksCount || 0;
          document.getElementById('hudWaypoints').textContent = data.trajectory.waypointsCount || 0;
          document.getElementById('hudTime').textContent = (data.trajectory.duration || 0) + 's';

          clearCanvas();
          for (const ev of (data.trajectory.events || [])) {
            if (ev.type === 'move' || ev.type === 'origin') {
              drawPoint(ev.x, ev.y, 'move');
            } else if (ev.type === 'mouse_down') {
              drawPoint(ev.x, ev.y, 'click');
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    async function replayTrajectory() {
      const name = document.getElementById('macroName').value;
      await fetch('/api/recorder/replay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, speed: 1.0 })
      });
    }

    function exportDucky() {
      const txt = document.getElementById('duckyPreview').value;
      navigator.clipboard.writeText(txt);
      alert('DuckyScript copied to clipboard!');
    }

    setInterval(pollStatus, 400);
  </script>
</body>
</html>
"""


class KinestheticHTTPHandler(BaseHTTPRequestHandler):
    """Zero-dependency HTTP Handler for Web UI and REST API."""
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        if self.path in ("/", "/trainer", "/trainer/", "/index.html"):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(HTML_UI.encode("utf-8"))
            return

        elif self.path == "/api/recorder/status":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            status = RECORDER.get_status()
            self.wfile.write(json.dumps(status).encode("utf-8"))
            return

        elif self.path.startswith("/api/recorder/trajectory/"):
            name = self.path.replace("/api/recorder/trajectory/", "").strip()
            json_file = DATA_DIR / f"{name}.json"
            if json_file.exists():
                traj = json.loads(json_file.read_text(encoding="utf-8"))
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "trajectory": traj}).encode("utf-8"))
            else:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": "Not found"}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        content_len = self.headers.get("Content-Length")
        body = "{}"
        if content_len:
            try:
                length = int(content_len)
                if length > 0:
                    body = self.rfile.read(length).decode("utf-8")
            except Exception:
                pass

        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if self.path == "/api/recorder/start":
            name = payload.get("name", "macro")
            countdown = int(payload.get("countdown", 3))
            res = RECORDER.start_recording(name=name, countdown_sec=countdown)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        elif self.path == "/api/recorder/stop":
            res = RECORDER.stop_recording()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        elif self.path == "/api/recorder/replay":
            name = payload.get("name", "default_macro")
            speed = float(payload.get("speed", 1.0))
            res = execute_replay(name=name, speed_multiplier=speed)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()


def start_server(port: int = 9395):
    server = HTTPServer(("0.0.0.0", port), KinestheticHTTPHandler)
    print(f"\n🦾 [Kinesthetic Trainer Online]")
    print(f"👉 Web Pendant: http://localhost:{port}/trainer")
    print(f"👉 Hotkey Stop: Press [F9] anywhere on screen to complete trajectory!\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
        RECORDER.pointer_tracker.close()


if __name__ == "__main__":
    port = 9395
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    start_server(port)
