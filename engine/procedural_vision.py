#!/usr/bin/env python3
"""
Sacred B.O.T.A. Tarot Hermetic Procedural Generator
Generates authentic 768x768 sacred geometry and archetypal meditation paintings
for Zoth Civilization agents when network image generation is unavailable.
"""

import sys
import math
import os
from PIL import Image, ImageDraw, ImageFilter

COLOR_MAP = {
    0: ((255, 250, 180), (40, 35, 10)),   # Pale Yellow (Air)
    1: ((255, 220, 40), (45, 35, 5)),     # Yellow (Mercury)
    2: ((40, 120, 240), (10, 20, 50)),    # Blue (Moon)
    3: ((40, 180, 80), (10, 40, 20)),     # Green (Venus)
    4: ((220, 30, 30), (50, 10, 10)),     # Scarlet (Aries)
    5: ((240, 90, 30), (50, 20, 10)),     # Red-Orange (Taurus)
    6: ((245, 140, 30), (50, 30, 10)),    # Orange (Gemini)
    7: ((250, 180, 30), (50, 38, 10)),    # Amber (Cancer)
    8: ((180, 220, 40), (35, 45, 10)),    # Yellow-Green (Leo)
    9: ((140, 210, 50), (25, 45, 10)),    # Green-Yellow (Virgo)
    10: ((160, 60, 220), (35, 10, 50)),   # Violet (Jupiter)
    11: ((20, 190, 120), (5, 45, 25)),    # Emerald (Libra)
    12: ((30, 100, 230), (5, 20, 50)),    # Blue (Water)
    13: ((20, 160, 170), (5, 35, 40)),    # Blue-Green (Scorpio)
    14: ((40, 110, 235), (10, 25, 55)),   # Blue (Sagittarius)
    15: ((120, 50, 220), (30, 10, 50)),   # Blue-Violet (Capricorn)
    16: ((230, 35, 35), (55, 10, 10)),    # Scarlet (Mars)
    17: ((175, 75, 235), (40, 15, 55)),   # Violet (Aquarius)
    18: ((200, 40, 120), (45, 10, 30)),   # Red-Violet (Pisces)
    19: ((255, 150, 20), (55, 30, 5)),    # Orange (Sun)
    20: ((240, 50, 40), (55, 15, 10)),    # Glowing Red (Fire)
    21: ((75, 40, 180), (20, 10, 45)),    # Indigo (Saturn)
}

def generate_painting(dest_path, key_num=18, card_name="The Moon", symbol="Sacred Archetype", seed=42):
    key_num = int(key_num) % 22
    primary_rgb, bg_dark = COLOR_MAP.get(key_num, ((212, 175, 55), (15, 14, 20)))
    gold_rgb = (212, 175, 55)

    img = Image.new('RGB', (768, 768), color=bg_dark)
    draw = ImageDraw.Draw(img)

    # 1. Concentric Radial Aurora Wash
    center_x, center_y = 384, 384
    for r in range(360, 40, -15):
        alpha = int(255 * (1.0 - (r / 380.0)) * 0.4)
        ring_color = (
            int(primary_rgb[0] * 0.4 + bg_dark[0] * 0.6),
            int(primary_rgb[1] * 0.4 + bg_dark[1] * 0.6),
            int(primary_rgb[2] * 0.4 + bg_dark[2] * 0.6)
        )
        draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=ring_color)

    # Subtle blur on the background aura
    img = img.filter(ImageFilter.GaussianBlur(radius=8))
    draw = ImageDraw.Draw(img)

    # 2. Sacred Geometry: 12-Ray Solar Star / Hexagram Core
    num_rays = 12 if key_num in [0, 19, 10] else 8
    outer_r = 280
    inner_r = 140
    for i in range(num_rays):
        angle = (2 * math.pi / num_rays) * i
        x1 = center_x + math.cos(angle) * outer_r
        y1 = center_y + math.sin(angle) * outer_r
        x2 = center_x + math.cos(angle + math.pi) * inner_r
        y2 = center_y + math.sin(angle + math.pi) * inner_r
        draw.line([x1, y1, center_x, center_y], fill=(primary_rgb[0], primary_rgb[1], primary_rgb[2]), width=2)

    # 3. Outer Sacred Double Rings
    draw.ellipse([center_x - 300, center_y - 300, center_x + 300, center_y + 300], outline=gold_rgb, width=3)
    draw.ellipse([center_x - 312, center_y - 312, center_x + 312, center_y + 312], outline=(100, 85, 30), width=1)
    draw.ellipse([center_x - 220, center_y - 220, center_x + 220, center_y + 220], outline=primary_rgb, width=2)

    # 4. Central Sanctuary Altar / Diamond Portal
    diamond_r = 110
    diamond_pts = [
        (center_x, center_y - diamond_r),
        (center_x + diamond_r, center_y),
        (center_x, center_y + diamond_r),
        (center_x - diamond_r, center_y)
    ]
    draw.polygon(diamond_pts, outline=gold_rgb, fill=(bg_dark[0] + 20, bg_dark[1] + 20, bg_dark[2] + 25))

    # Inner Spirit Flame Core
    flame_r = 45
    draw.ellipse([center_x - flame_r, center_y - flame_r, center_x + flame_r, center_y + flame_r], fill=primary_rgb)
    draw.ellipse([center_x - 20, center_y - 20, center_x + 20, center_y + 20], fill=(255, 255, 240))

    # 5. Pillars of Duality (left Jachin / right Boaz style for keys)
    draw.rectangle([60, 140, 80, 628], fill=(30, 32, 40), outline=gold_rgb, width=2)
    draw.rectangle([688, 140, 708, 628], fill=(30, 32, 40), outline=gold_rgb, width=2)

    # Border Arch
    draw.rectangle([24, 24, 744, 744], outline=gold_rgb, width=2)
    draw.rectangle([28, 28, 740, 740], outline=(60, 50, 20), width=1)

    os.makedirs(os.path.dirname(os.path.abspath(dest_path)), exist_ok=True)
    img.save(dest_path, 'JPEG', quality=92)
    print(f"[ProceduralVision] Successfully generated {dest_path} for Key {key_num}: {card_name}")

if __name__ == '__main__':
    dest = sys.argv[1] if len(sys.argv) > 1 else '/tmp/tarot.jpg'
    k_num = int(sys.argv[2]) if len(sys.argv) > 2 else 18
    name = sys.argv[3] if len(sys.argv) > 3 else 'The Moon'
    sym = sys.argv[4] if len(sys.argv) > 4 else 'Sacred Archetype'
    generate_painting(dest, k_num, name, sym)
