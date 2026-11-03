#!/usr/bin/env python3
"""
🌐 GOOGLE AI STUDIO BROWSER AUTOMATOR & ZIP EXTRACTOR
=====================================================================
Automates Google AI Studio App Builder (https://aistudio.google.com/apps):
1. Navigates to AI Studio Apps in the sandboxed Chrome browser.
2. If login is required, leaves window open for 1-time Google sign-in.
3. Automatically inputs the bespoke Design Director prompt into the prompt box.
4. Submits the prompt so Google AI Studio builds the app in the cloud.
5. Allows agents to proceed with other tasks while AI Studio generates.
6. Downloads the generated ZIP file, unzips it into `builds/<slug>/`,
   and finishes it up with our Design Director & Guardrail standards!

Author: 1nc0gn30 / 1nc0gn30 (@1nc0gn30)
Entity: NullAI Platform • ZothOS
"""

import os
import sys
import time
import zipfile
import subprocess
from pathlib import Path
from typing import Optional, Dict, Any

# Connect to azoth-local-agent browser engine
AZOTH_ROOT = Path("/opt/azoth-local-agent")
if str(AZOTH_ROOT) not in sys.path:
    sys.path.insert(0, str(AZOTH_ROOT))

from tools.browser import get_browser

CIV_ROOT = Path("/opt/zoth-civilization")
BUILDS_DIR = CIV_ROOT / "builds"
DOWNLOADS_DIR = AZOTH_ROOT / "sandbox" / "downloads"


def build_app_prompt(business: Dict[str, Any]) -> str:
    name = business.get("name", "Crown Valet of Virginia Beach")
    niche = business.get("niche", "Valet & Luxury Transport")
    city = business.get("city", "Virginia Beach")
    state = business.get("state", "VA")
    hook = business.get("hook", "Curbside luxury vehicle dispatch and VIP private event valet management.")

    return f"""Build a complete, standalone, production-ready, avant-garde website for {name} ({niche} in {city}, {state}).

Core Hook: {hook}

Design Standards (Design Director & Avant-Garde UI):
- Distinctive Typography: Use "Syne" (weights 700/800) for headlines via Google Fonts. Body in "Plus Jakarta Sans". Eyebrows in "JetBrains Mono" (uppercase, letter-spacing 0.22em).
- Zero emojis in production UI headers or buttons. Use minimal SVG icons.
- Deep obsidian dark theme (#08090C) with refined Gold (#D4AF37) accents (under 10% surface).
- Real In-Browser Utility:
  1. Interactive Client-Side Quote & Dispatch Estimator where users select services and calculate itemized estimates in real time.
  2. 15-Second Claude Motion Graphics Canvas (#showreelCanvas) running at 60 FPS with particle grid, rotating Gold Diamond anchor shape, and 4 timed scenes (Ignition, Mastery, Authority, CTA) with play/pause and scrubber controls.
  3. Asymmetric Bento Grid highlighting verified response, licensed coverage, and upfront pricing.
  4. Valid Schema.org JSON-LD LocalBusiness graph in <head>.
- Output all HTML, CSS, and JS complete with zero placeholder comments."""


class AiStudioAutomator:
    def __init__(self):
        self.browser = get_browser()

    def ensure_authenticated(self, timeout_sec: int = 120) -> bool:
        """Ensure the browser is logged into Google AI Studio."""
        page = self.browser.current_page()
        current_url = page.url

        if "accounts.google.com" in current_url:
            print("\n" + "="*65)
            print("🔑 GOOGLE SIGN-IN REQUIRED")
            print("Please complete sign-in in the open Chrome window on your screen.")
            print(f"Waiting up to {timeout_sec} seconds for login completion...")
            print("="*65 + "\n")

            start = time.time()
            while time.time() - start < timeout_sec:
                time.sleep(2)
                try:
                    p = self.browser.current_page()
                    if "aistudio.google.com" in p.url and "signin" not in p.url:
                        print("✅ Google Sign-in detected! Connected to Google AI Studio.")
                        return True
                except Exception:
                    pass
            print("⚠️ Login timed out.")
            return False

        if "aistudio.google.com" in current_url:
            return True

        # Navigate to aistudio.google.com/apps
        res = self.browser.navigate("https://aistudio.google.com/apps")
        page = self.browser.current_page()
        if "accounts.google.com" in page.url:
            return self.ensure_authenticated(timeout_sec)
        return True

    def submit_app_prompt(self, business: Dict[str, Any]) -> Dict[str, Any]:
        """Submit the prompt to https://aistudio.google.com/apps."""
        print(f"\n[AI Studio] Navigating to https://aistudio.google.com/apps...")
        self.browser.navigate("https://aistudio.google.com/apps")
        time.sleep(3)

        if not self.ensure_authenticated():
            return {"ok": False, "error": "User not authenticated to Google AI Studio"}

        page = self.browser.current_page()
        prompt_text = build_app_prompt(business)

        print(f"[AI Studio] Finding prompt input area on {page.url}...")
        
        # Selectors commonly used in AI Studio Apps input interface
        input_selectors = [
            "textarea",
            "input[placeholder*='prompt' i]",
            "input[placeholder*='describe' i]",
            "div[contenteditable='true']",
            "[role='textbox']",
            ".prompt-textarea",
            "mat-input-element",
        ]

        target_sel = None
        for sel in input_selectors:
            try:
                el = page.query_selector(sel)
                if el and el.is_visible():
                    target_sel = sel
                    break
            except Exception:
                pass

        if not target_sel:
            # Fallback to smart click / scan
            print("⚠️ Could not locate standard prompt input. Attempting keyboard typing...")
            page.keyboard.press("Tab")
            time.sleep(0.5)

        if target_sel:
            print(f"[AI Studio] Typing prompt into '{target_sel}'...")
            page.fill(target_sel, prompt_text)
            time.sleep(1)
        else:
            print("[AI Studio] Typing prompt into focused element...")
            page.keyboard.type(prompt_text, delay=5)
            time.sleep(1)

        # Look for submit/run/create button
        submit_selectors = [
            "button[type='submit']",
            "button:has-text('Create')",
            "button:has-text('Generate')",
            "button:has-text('Run')",
            "button:has-text('Build')",
            "button[aria-label*='Send' i]",
            "button[aria-label*='Run' i]",
            ".send-button",
        ]

        submitted = False
        for s_sel in submit_selectors:
            try:
                btn = page.query_selector(s_sel)
                if btn and btn.is_visible():
                    btn.click()
                    submitted = True
                    print(f"[AI Studio] Clicked submit button: '{s_sel}'")
                    break
            except Exception:
                pass

        if not submitted:
            # Try Enter or Ctrl+Enter
            print("[AI Studio] Pressing Enter / Ctrl+Enter to submit...")
            page.keyboard.press("Control+Enter")
            time.sleep(1)
            page.keyboard.press("Enter")

        slug = business.get("name", "app").lower().replace(" ", "-")
        print(f"\n🚀 [AI Studio] Prompt submitted successfully for {business.get('name')}!")
        print("AI Studio is now compiling the full application in the cloud.")
        print("You can continue with other tasks while it generates.\n")

        return {
            "ok": True,
            "status": "GENERATING",
            "slug": slug,
            "url": page.url,
            "submittedAt": time.time(),
        }

    def check_and_download_zip(self, slug: str, wait_timeout: int = 300) -> Optional[Path]:
        """Check for completion and download the generated ZIP."""
        page = self.browser.current_page()
        print(f"[AI Studio] Polling for generation completion & Download ZIP button...")

        download_selectors = [
            "button:has-text('Download')",
            "button:has-text('Export')",
            "button:has-text('ZIP')",
            "a[download]",
            "button[aria-label*='Download' i]",
            "button[aria-label*='Export' i]",
        ]

        start = time.time()
        while time.time() - start < wait_timeout:
            for d_sel in download_selectors:
                try:
                    btn = page.query_selector(d_sel)
                    if btn and btn.is_visible():
                        print(f"🎯 [AI Studio] Found download button '{d_sel}'! Triggering download...")
                        
                        # Wait for download event
                        with page.expect_download(timeout=30000) as download_info:
                            btn.click()
                        
                        download = download_info.value
                        dest_zip = DOWNLOADS_DIR / f"{slug}.zip"
                        download.save_as(str(dest_zip))
                        print(f"📦 [AI Studio] ZIP downloaded successfully to: {dest_zip}")
                        return dest_zip
                except Exception:
                    pass

            time.sleep(5)

        print("[AI Studio] Wait timed out before download button appeared.")
        return None

    def unzip_and_polish(self, zip_path: Path, slug: str) -> Path:
        """Unzip the archive into builds/<slug> and run guardrails."""
        target_dir = BUILDS_DIR / slug
        target_dir.mkdir(parents=True, exist_ok=True)

        print(f"\n📂 [AI Studio] Unzipping {zip_path.name} to {target_dir}...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(target_dir)

        print(f"✅ Unzipped! Files present in {target_dir}:")
        for f in target_dir.glob("*"):
            print(f"   - {f.name} ({f.stat().st_size} bytes)")

        # Run guardrail verification
        print("\n🛡️ [Guardrail] Running site guardrail check on extracted build...")
        guardrail_script = CIV_ROOT / "engine" / "site_guardrail.js"
        if guardrail_script.exists():
            try:
                cmd = f"node {guardrail_script} {target_dir}"
                res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
                print(res.stdout or res.stderr)
            except Exception as e:
                print(f"Guardrail note: {e}")

        return target_dir


if __name__ == "__main__":
    automator = AiStudioAutomator()
    sample = {
        "name": "Crown Valet of Virginia Beach",
        "niche": "Valet & Luxury Transport",
        "city": "Virginia Beach",
        "state": "VA",
        "hook": "Curbside luxury vehicle dispatch and VIP private event valet management across Virginia Beach."
    }

    # Step 1: Submit prompt
    res = automator.submit_app_prompt(sample)
    print("Action result:", res)
