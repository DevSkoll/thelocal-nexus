#!/usr/bin/env python3
"""Render TheLocal.nexus app icons from a single geometric mark.

Matches the header tile: terracotta rounded square, white slab-serif L.
Do not use an image model for this — the letter has to be exact.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "src" / "app"
PUBLIC_BRANDS = ROOT / "public" / "brands"

NAVY = (0x00, 0x28, 0x68, 255)
RED = (0xBF, 0x0A, 0x30, 255)
WHITE = (255, 255, 255, 255)

# viewBox 0..32 — keep in sync with the SVG path below.
SVG = """\
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="TheLocal">
  <rect width="32" height="32" rx="7" fill="#BF0A30"/>
  <path fill="#FFFFFF" d="M9 7.5h9.2v3.4h-4.4V20.4H24v4.1H9z"/>
</svg>
"""


def draw_mark(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    s = size / 32.0
    radius = 7 * s
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=RED)
    # Slab-serif L (same path as SVG, scaled).
    # M9 7.5 h9.2 v3.4 h-4.4 V20.4 H24 v4.1 H9 z
    l = [
        (9 * s, 7.5 * s),
        (18.2 * s, 7.5 * s),
        (18.2 * s, 10.9 * s),
        (13.8 * s, 10.9 * s),
        (13.8 * s, 20.4 * s),
        (24 * s, 20.4 * s),
        (24 * s, 24.5 * s),
        (9 * s, 24.5 * s),
    ]
    draw.polygon(l, fill=WHITE)
    return img


def main() -> None:
    APP.mkdir(parents=True, exist_ok=True)
    PUBLIC_BRANDS.mkdir(parents=True, exist_ok=True)

    svg_bytes = SVG.encode("utf-8")
    (APP / "icon.svg").write_bytes(svg_bytes)
    (PUBLIC_BRANDS / "thelocal-mark.svg").write_bytes(svg_bytes)

    master = draw_mark(512)
    master.save(PUBLIC_BRANDS / "thelocal-mark.png", "PNG")

    apple = master.resize((180, 180), Image.Resampling.LANCZOS)
    apple.save(APP / "apple-icon.png", "PNG")

    icon32 = master.resize((32, 32), Image.Resampling.LANCZOS)
    icon32.save(APP / "icon.png", "PNG")

    master.save(
        APP / "favicon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )
    print("wrote", APP / "favicon.ico")
    print("wrote", APP / "icon.svg")
    print("wrote", APP / "icon.png")
    print("wrote", APP / "apple-icon.png")
    print("wrote", PUBLIC_BRANDS / "thelocal-mark.svg")
    print("wrote", PUBLIC_BRANDS / "thelocal-mark.png")


if __name__ == "__main__":
    main()
