#!/usr/bin/env python3
"""
Sovereign Stripe Product Artwork Synchronizer
=============================================
Safely reads STRIPE_SECRET_KEY from ~/.config/zoth-vault/stripe.env (outside all git repos)
or environment variable STRIPE_SECRET_KEY, uploads all 16 bespoke 1200x1200 product cards
from public/assets/stripe-products/<slug>.png to Stripe's File API (purpose=product_image),
creates public Stripe CDN file_links, and updates every Stripe Product's images[0] so
all Stripe Payment Links display their exact branded artwork.
"""

import json
import os
import re
import sys
import urllib.parse
import urllib.request
import urllib.error
import uuid
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
VAULT_ENV = Path.home() / ".config" / "zoth-vault" / "stripe.env"
FALLBACK_ENV = REPO_ROOT / ".env.sovereign"
STRIPE_LINKS_JSON = REPO_ROOT / "data" / "stripe_links.json"
ASSETS_DIR = REPO_ROOT / "public" / "assets" / "stripe-products"


def load_stripe_key() -> str:
    for var in ("STRIPE_PAYMENT_LINK_API_KEY", "STRIPE_SECRET_KEY"):
        env_key = os.environ.get(var, "").strip().strip("\"'")
        if env_key:
            return env_key
    for path in (VAULT_ENV, Path.home() / ".bashrc", Path.home() / ".zshrc", Path.home() / ".profile", FALLBACK_ENV):
        if path.exists():
            text = path.read_text(encoding="utf-8", errors="ignore")
            for var in ("STRIPE_PAYMENT_LINK_API_KEY", "STRIPE_SECRET_KEY"):
                m = re.search(rf"^(?:export\s+)?{var}=([^\r\n#]+)", text, re.MULTILINE)
                if m:
                    key = m.group(1).strip().strip("\"'")
                    if key:
                        return key
    return ""


def stripe_request(method: str, url: str, key: str, data: bytes = None, content_type: str = None) -> dict:
    headers = {
        "Authorization": f"Bearer {key}",
        "User-Agent": "ZothSovereignStripeSync/1.0",
    }
    if content_type:
        headers["Content-Type"] = content_type
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="ignore")
        try:
            err_obj = json.loads(raw)
            msg = err_obj.get("error", {}).get("message", raw)
        except Exception:
            msg = raw
        raise RuntimeError(f"Stripe HTTP {e.code}: {msg}")


def upload_stripe_product_image(key: str, png_path: Path) -> str:
    """Uploads a PNG to https://files.stripe.com/v1/files and creates a public file_link URL."""
    boundary = f"----ZothStripeBoundary{uuid.uuid4().hex}"
    file_bytes = png_path.read_bytes()
    parts = [
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="purpose"\r\n\r\n'
        f"product_image\r\n".encode("utf-8"),
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{png_path.name}"\r\n'
        f"Content-Type: image/png\r\n\r\n".encode("utf-8")
        + file_bytes
        + f"\r\n--{boundary}--\r\n".encode("utf-8"),
    ]
    body = b"".join(parts)
    file_obj = stripe_request(
        "POST",
        "https://files.stripe.com/v1/files",
        key,
        data=body,
        content_type=f"multipart/form-data; boundary={boundary}",
    )
    file_id = file_obj["id"]

    # Create or fetch public file_link on Stripe CDN
    form = urllib.parse.urlencode({"file": file_id}).encode("utf-8")
    link_obj = stripe_request(
        "POST",
        "https://api.stripe.com/v1/file_links",
        key,
        data=form,
        content_type="application/x-www-form-urlencoded",
    )
    return link_obj["url"]


def update_product_image(key: str, product_id: str, image_url: str) -> dict:
    # First clear existing images array then set images[0] so old wrong images are completely replaced
    form = urllib.parse.urlencode({"images[0]": image_url}).encode("utf-8")
    return stripe_request(
        "POST",
        f"https://api.stripe.com/v1/products/{product_id}",
        key,
        data=form,
        content_type="application/x-www-form-urlencoded",
    )


def main() -> int:
    key = load_stripe_key()
    if not key:
        print("❌ No STRIPE_SECRET_KEY found in ~/.config/zoth-vault/stripe.env")
        print("   Run: zoth-stripe-key")
        return 1

    masked = key[:8] + "..." + key[-4:] if len(key) > 12 else "***"
    print(f"🔐 Testing Stripe API connection with key {masked}...")
    try:
        stripe_request("GET", "https://api.stripe.com/v1/products?limit=1", key)
    except Exception as e:
        print(f"❌ Stripe authentication failed: {e}")
        return 1

    print("✅ Stripe authentication verified! Synchronizing product artwork...")
    catalog = json.loads(STRIPE_LINKS_JSON.read_text(encoding="utf-8"))

    updated_ids = set()
    uploaded_urls = {}

    for slug, info in catalog.items():
        if not isinstance(info, dict) or "productId" not in info:
            continue
        product_id = info["productId"]
        png_path = ASSETS_DIR / f"{slug}.png"
        if not png_path.exists():
            print(f"⚠️ Missing local artwork for {slug}: {png_path}")
            continue

        try:
            print(f"⬆️  [{slug}] Uploading {png_path.name} -> Stripe product {product_id}...")
            cdn_url = upload_stripe_product_image(key, png_path)
            uploaded_urls[slug] = cdn_url
            prod = update_product_image(key, product_id, cdn_url)
            updated_ids.add(product_id)
            plink = info.get("paymentLink") or info.get("paymentLinkUrl") or ""
            print(f"   ✅ Updated '{prod.get('name', slug)}' ({product_id}) -> {plink}")
        except Exception as e:
            print(f"   ❌ Failed to update {slug} ({product_id}): {e}")

    # Also check all active products on the Stripe account for any duplicate Zoth/Tool products not in stripe_links.json
    try:
        all_prods = stripe_request("GET", "https://api.stripe.com/v1/products?limit=100&active=true", key)
        for p in all_prods.get("data", []):
            pid = p.get("id")
            if pid in updated_ids:
                continue
            pname = (p.get("name") or "").lower()
            matched_slug = None
            if "zothos" in pname or "zoth os" in pname:
                matched_slug = "zoth-os-pro"
            elif "zoth studio" in pname:
                matched_slug = "zoth-studio-pro"
            elif "all-access" in pname or "bundle" in pname:
                matched_slug = "zoth-all-access-bundle"
            elif "aeo" in pname:
                matched_slug = "aeo-graph-engine"
            elif "envguard" in pname:
                matched_slug = "envguard-secrets-vault"
            elif "badge3d" in pname or "coin" in pname:
                matched_slug = "badge3d-coin-generator"
            elif "cwv" in pname or "core web vitals" in pname:
                matched_slug = "cwv-speed-engine"
            elif "promptmaster" in pname:
                matched_slug = "promptmaster-studio"
            elif "robots" in pname:
                matched_slug = "robots-txt-auditor"
            elif "dfy" in pname or "149" in pname:
                matched_slug = "city-desk-dfy"
            elif "city desk" in pname or "city-desk" in pname:
                matched_slug = "city-desk-pro"
            elif "receptionist" in pname:
                matched_slug = "ai-receptionist-299"
            elif "5-page" in pname or "499" in pname:
                matched_slug = "custom-5page-launch-499"
            elif "swarm" in pname or "997" in pname:
                matched_slug = "custom-ai-swarm-997"
            elif "deposit" in pname or "kickoff" in pname:
                matched_slug = "custom-build-deposit-99"

            if matched_slug and matched_slug in uploaded_urls:
                update_product_image(key, pid, uploaded_urls[matched_slug])
                updated_ids.add(pid)
                print(f"   ✅ Also updated extra Stripe product '{p.get('name')}' ({pid}) -> {matched_slug}.png")
    except Exception as e:
        print(f"⚠️ Note scanning additional products: {e}")

    print(f"\n🎉 Done! {len(updated_ids)} Stripe products updated with bespoke 24K Gold & Obsidian artwork.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
