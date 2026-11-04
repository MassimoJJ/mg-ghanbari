#!/usr/bin/env python3
"""
Generates the 1200x630 Open Graph share cards in assets/og/.

Run locally after adding or changing a project:  python scripts/make-og.py
The output is committed, so the Netlify build does not need Python.
"""
import os
import re
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "og")
W, H = 1200, 630

FONT_BOLD = r"C:\Windows\Fonts\arialbd.ttf"
FONT_REG = r"C:\Windows\Fonts\arial.ttf"

PAGES = ["index.html"]
for d in ("apps", "ai"):
    for f in sorted(os.listdir(os.path.join(ROOT, d))):
        if f.endswith(".html"):
            PAGES.append(f"{d}/{f}")


def text_of(page):
    s = open(os.path.join(ROOT, page), encoding="utf-8", errors="ignore").read()
    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S)
    title = re.sub(r"<[^>]+>", "", h1.group(1)).strip() if h1 else page
    title = re.sub(r"\s+", " ", title)
    m = re.search(r'<div class="detail-hero">\s*<img src="([^"]+)"', s)
    if not m:
        m = re.search(r'<img src="(assets/[^"]+|\.\./assets/[^"]+)"', s)
    img = m.group(1) if m else None
    if img:
        img = img.split("?")[0]
        img = img.replace("../", "") if page.count("/") == 1 else img
    return title, img


def cover(im, w, h):
    sw, sh = im.size
    scale = max(w / sw, h / sh)
    im = im.resize((max(1, int(sw * scale)), max(1, int(sh * scale))), Image.LANCZOS)
    left = (im.size[0] - w) // 2
    top = (im.size[1] - h) // 2
    return im.crop((left, top, left + w, top + h))


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = (cur + " " + word).strip()
        if draw.textlength(trial, font=font) <= max_w or not cur:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    if cur:
        lines.append(cur)
    return lines


def build(page):
    title, img = text_of(page)
    if page == "index.html":
        title = "MG Ghanbari"
        img = "assets/hero.jpg" if os.path.exists(os.path.join(ROOT, "assets/hero.jpg")) else None

    if img and os.path.exists(os.path.join(ROOT, img)):
        base = cover(Image.open(os.path.join(ROOT, img)).convert("RGB"), W, H)
    else:
        base = Image.new("RGB", (W, H), (12, 12, 12))

    # darken towards the bottom so the type always reads
    shade = Image.new("L", (1, H))
    for y in range(H):
        t = y / H
        shade.putpixel((0, y), int(255 * max(0.0, (t - 0.18)) ** 1.6 * 0.95))
    shade = shade.resize((W, H))
    base = Image.composite(Image.new("RGB", (W, H), (5, 5, 6)), base, shade)

    d = ImageDraw.Draw(base)
    f_title = ImageFont.truetype(FONT_BOLD, 64)
    f_kicker = ImageFont.truetype(FONT_BOLD, 21)
    f_domain = ImageFont.truetype(FONT_REG, 20)

    lines = wrap(d, title, f_title, W - 130)
    if len(lines) > 2:
        f_title = ImageFont.truetype(FONT_BOLD, 52)
        lines = wrap(d, title, f_title, W - 130)

    y = H - 96 - len(lines) * 72
    for line in lines:
        d.text((66, y), line, font=f_title, fill=(255, 255, 255))
        y += 72

    # gold rule + signature
    d.rectangle([66, H - 78, 138, H - 75], fill=(230, 180, 92))
    sub = "3D & VFX  ·  AI AUTOMATION  ·  APPS" if page == "index.html" else "MG GHANBARI"
    d.text((156, H - 86), sub, font=f_kicker, fill=(230, 180, 92))
    dom = "mg-ghanbari.netlify.app"
    d.text((W - 66 - d.textlength(dom, font=f_domain), H - 84), dom, font=f_domain, fill=(150, 150, 150))

    slug = "home" if page == "index.html" else page.replace("/", "-").replace(".html", "")
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, slug + ".jpg")
    base.save(path, quality=88, optimize=True)
    return slug, title


if __name__ == "__main__":
    for p in PAGES:
        slug, title = build(p)
        print(f"{slug:46} {title}")
