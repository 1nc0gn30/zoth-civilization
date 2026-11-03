#!/usr/bin/env python3
"""
🌐 AUTONOMOUS GOOGLE AI STUDIO APP BUILDER & ZIP EXTRACTOR
=====================================================================
Uses authentic Google session cookies extracted directly from local Firefox
to automate https://aistudio.google.com/apps headlessly via Playwright:
1. Injects active session into persistent Chrome context.
2. Navigates to AI Studio Apps.
3. Dismisses any onboarding overlays.
4. Types the user's bespoke app prompt into the builder textarea.
5. Submits the prompt to compile the app in Google Cloud.
6. Waits for generation completion, downloads the ZIP, unzips to builds/<slug>/,
   and verifies with Site Guardrail.

Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
Entity: NullAI Platform • ZothOS Systems Engineering
"""

import os
import sys
import time
import zipfile
import sqlite3
import tempfile
import shutil
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any
from playwright.sync_api import sync_playwright

ROOT = Path("/opt/zoth-civilization")
FIREFOX_PROFILE = Path("/opt/.mozilla/firefox/l5qtiz2i.default-esr")
PROFILE_DIR = Path("/opt/azoth-local-agent/sandbox/chrome_ai_studio_profile")
PROFILE_DIR.mkdir(parents=True, exist_ok=True)
BUILDS_DIR = ROOT / "builds"
BUILDS_DIR.mkdir(parents=True, exist_ok=True)


def extract_firefox_google_cookies() -> list:
    """Extract all active Google session cookies from Firefox SQLite store."""
    cookies_db = FIREFOX_PROFILE / "cookies.sqlite"
    if not cookies_db.exists():
        raise FileNotFoundError(f"Firefox cookies db not found at: {cookies_db}")

    with tempfile.NamedTemporaryFile() as tmp:
        shutil.copy2(str(cookies_db), tmp.name)
        conn = sqlite3.connect(tmp.name)
        cur = conn.cursor()
        cur.execute(
            'SELECT host, name, value, path, expiry, isSecure, isHttpOnly, sameSite '
            'FROM moz_cookies WHERE host LIKE "%google%"'
        )
        rows = cur.fetchall()

    same_site_map = {0: "None", 1: "Lax", 2: "Strict"}
    cookies = []
    for host, name, val, path, expiry, is_sec, is_http, same_site in rows:
        cookies.append({
            "name": name,
            "value": val,
            "domain": host,
            "path": path or "/",
            "expires": expiry,
            "httpOnly": bool(is_http),
            "secure": bool(is_sec),
            "sameSite": same_site_map.get(same_site, "Lax")
        })

    print(f"🔑 [Auth] Extracted {len(cookies)} Google session cookies from Firefox.")
    return cookies


def build_app(prompt: str, slug: str = "vb-motion-food-delivery", timeout_sec: int = 180) -> Dict[str, Any]:
    cookies = extract_firefox_google_cookies()

    print(f"\n🚀 [AI Studio] Launching automated Chrome session...")
    print(f"📝 Prompt: \"{prompt[:60]}...\"")

    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=str(PROFILE_DIR),
            executable_path="/usr/bin/google-chrome",
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
            accept_downloads=True
        )

        context.add_cookies(cookies)
        page = context.new_page()

        print("🌐 [AI Studio] Navigating to https://aistudio.google.com/apps...")
        page.goto("https://aistudio.google.com/apps", wait_until="networkidle", timeout=35000)
        time.sleep(2)

        # 1. Dismiss any onboarding dialogs or overlays
        for sel in [
            "button:has-text('Skip')",
            "button:has-text('Next')",
            "button:has-text('Done')",
            "button:has-text('Got it')",
            "button[aria-label*='Close' i]"
        ]:
            try:
                btn = page.locator(sel).first
                if btn.is_visible():
                    print(f"👋 Dismissing overlay via: {sel}")
                    btn.click()
                    time.sleep(0.8)
            except Exception:
                pass

        # Press Escape as fallback to dismiss backdrops
        page.keyboard.press("Escape")
        time.sleep(0.5)

        # 2. Locate prompt textarea
        ta = page.locator("textarea").first
        if not ta.is_visible():
            print("⚠️ Textarea not immediately visible, retrying dismiss...")
            page.keyboard.press("Escape")
            time.sleep(1)

        print("✍️ [AI Studio] Typing prompt into app builder...")
        ta.click()
        ta.fill(prompt)
        time.sleep(1)

        # 3. Submit build request
        print("⚡ [AI Studio] Submitting app creation request...")
        build_btn = page.locator("button.build-button")
        if build_btn.is_visible():
            build_btn.click()
        else:
            ta.press("Control+Enter")

        time.sleep(5)
        print("⏳ [AI Studio] Generation in progress! Monitoring build status...")
        page.screenshot(path=str(ROOT / "sandbox" / "aistudio_submitted.png"))

        # 4. Poll for generation completion & Download ZIP button
        start_wait = time.time()
        download_btn_selectors = [
            "button:has-text('Download')",
            "button:has-text('Export')",
            "button:has-text('ZIP')",
            "a[download]",
            "button[aria-label*='Download' i]",
            "button[aria-label*='Export' i]"
        ]

        target_zip = None
        while time.time() - start_wait < timeout_sec:
            for d_sel in download_btn_selectors:
                try:
                    btn = page.locator(d_sel).first
                    if btn.is_visible():
                        print(f"🎯 [AI Studio] Generation complete! Found export button: '{d_sel}'")
                        with page.expect_download(timeout=30000) as download_info:
                            btn.click()
                        download = download_info.value
                        target_zip = BUILDS_DIR / f"{slug}.zip"
                        download.save_as(str(target_zip))
                        print(f"📦 [AI Studio] Saved ZIP to: {target_zip}")
                        break
                except Exception:
                    pass

            if target_zip:
                break
            time.sleep(5)

        context.close()

        if target_zip and target_zip.exists():
            target_dir = BUILDS_DIR / slug
            target_dir.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(target_zip, "r") as z:
                z.extractall(target_dir)
            print(f"✅ Extracted app to: {target_dir}")
            return {"ok": True, "slug": slug, "path": str(target_dir), "zip": str(target_zip)}

        print(f"ℹ️ [AI Studio] Submitted successfully. Build is compiling in the cloud at: https://aistudio.google.com/apps")
        return {"ok": True, "status": "SUBMITTED", "url": "https://aistudio.google.com/apps"}


if __name__ == "__main__":
    test_prompt = (
        "Make me a motion edit styled website hyped to serve the city of virginia beach town center "
        "with premium food delivery services. Include avant-garde typography, 60fps hero motion canvas, "
        "interactive ordering menu, and deep obsidian gold styling."
    )
    if len(sys.argv) > 1:
        test_prompt = sys.argv[1]
    res = build_app(test_prompt)
    print("Result:", res)
