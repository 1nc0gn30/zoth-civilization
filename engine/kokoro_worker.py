#!/usr/bin/env python3
"""Local Kokoro voice. One small model, many preset voices, CPU only."""

import io
import json
import os

import numpy as np
import onnxruntime as ort
import soundfile as sf
from http.server import BaseHTTPRequestHandler, HTTPServer

ort.set_default_logger_severity(3)
from kokoro_onnx import Kokoro

MODEL = os.environ.get("KOKORO_MODEL", "/opt/zoth-civilization/voice-models/kokoro-v1.0.fp16.onnx")
VOICES = os.environ.get("KOKORO_VOICES", "/opt/zoth-civilization/voice-models/voices-v1.0.bin")
PORT = int(os.environ.get("KOKORO_PORT", "9394"))

kokoro = Kokoro(MODEL, VOICES)
VOICE_IDS = set(np.load(VOICES).files)


def lang_for(voice):
    if voice.startswith(("bf_", "bm_")):
        return "en-gb"
    return "en-us"


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        return

    def _json(self, code, obj):
        try:
            body = json.dumps(obj).encode("utf-8")
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        clean_path = self.path.split("?", 1)[0]
        if clean_path not in ("/health", "/api/stats", "/api/health", "/stats"):
            self._json(404, {"error": "not_found"})
            return
        self._json(200, {"ready": True, "voices": len(VOICE_IDS), "engine": "kokoro-onnx"})

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/speak":
            self._json(404, {"error": "not_found"})
            return
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0 or length > 4000:
            self._json(413, {"error": "voice_too_long"})
            return
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self._json(400, {"error": "bad_json"})
            return
        text = " ".join(str(data.get("text") or "").split())[:360]
        voice = str(data.get("voice") or data.get("voiceId") or "").lower()
        if not text or voice not in VOICE_IDS:
            self._json(400, {"error": "voice_rejected"})
            return
        try:
            samples, rate = kokoro.create(text, voice=voice, speed=1.0, lang=lang_for(voice))
        except Exception as err:
            print(f"KOKORO_FAIL {type(err).__name__}: {err}", flush=True)
            self._json(500, {"error": "voice_failed"})
            return
        buf = io.BytesIO()
        sf.write(buf, samples, rate, format="WAV")
        audio = buf.getvalue()
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(audio)))
        self.end_headers()
        self.wfile.write(audio)


def main():
    server = HTTPServer(("127.0.0.1", PORT), Handler)
    print(f"KOKORO_READY port={PORT} voices={len(VOICE_IDS)}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
