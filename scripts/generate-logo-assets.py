#!/usr/bin/env python3
"""Generate Azadari Setup logo PNGs and favicon from a vector-like draw path."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "public" / "icons"
APP = ROOT / "src" / "app"
FAVICON = APP / "favicon.ico"
APP_ICON = APP / "icon.png"
APPLE_ICON = APP / "apple-icon.png"

BG = (10, 10, 10, 255)
FG = (245, 242, 235, 255)
ACCENT = (196, 163, 90, 255)
MUTED = (245, 242, 235, 170)


def draw_logo(size: int, *, maskable_safe: bool = False) -> Image.Image:
    """Draw the Azadari mark onto a square RGBA canvas."""
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)

    # Keep artwork inside the maskable safe zone (~80%) when needed.
    pad = size * 0.18 if maskable_safe else size * 0.12
    left, top = pad, pad
    right, bottom = size - pad, size - pad
    w, h = right - left, bottom - top
    cx = left + w / 2

    # Soft outer ring — evokes a gathering / circle of remembrance
    ring_w = max(2, int(size * 0.035))
    inset = size * 0.04
    d.ellipse(
        [left - inset, top - inset, right + inset, bottom + inset],
        outline=MUTED,
        width=ring_w,
    )

    # Crescent (night majlis) — two overlapping circles
    cres_cy = top + h * 0.22
    cres_r = w * 0.16
    outer = [
        cx - cres_r,
        cres_cy - cres_r,
        cx + cres_r,
        cres_cy + cres_r,
    ]
    d.ellipse(outer, fill=ACCENT)
    # Cutout shifted right to form a crescent
    cut_dx = cres_r * 0.45
    cut_r = cres_r * 0.78
    d.ellipse(
        [
            cx - cut_r + cut_dx,
            cres_cy - cut_r,
            cx + cut_r + cut_dx,
            cres_cy + cut_r,
        ],
        fill=BG,
    )

    # Open book — two pages meeting at the spine
    book_top = top + h * 0.42
    book_bottom = top + h * 0.88
    book_left = left + w * 0.08
    book_right = right - w * 0.08
    spine_x = cx
    mid_y = (book_top + book_bottom) / 2

    # Left page (slightly arched outer edge)
    left_page = [
        (spine_x, book_top),
        (book_left + w * 0.06, book_top + h * 0.04),
        (book_left, mid_y),
        (book_left + w * 0.06, book_bottom - h * 0.04),
        (spine_x, book_bottom),
        (spine_x - w * 0.02, mid_y),
    ]
    d.polygon(left_page, fill=FG)

    # Right page
    right_page = [
        (spine_x, book_top),
        (book_right - w * 0.06, book_top + h * 0.04),
        (book_right, mid_y),
        (book_right - w * 0.06, book_bottom - h * 0.04),
        (spine_x, book_bottom),
        (spine_x + w * 0.02, mid_y),
    ]
    d.polygon(right_page, fill=FG)

    # Spine shadow / fold
    spine_w = max(1, int(size * 0.012))
    d.line([(spine_x, book_top), (spine_x, book_bottom)], fill=BG, width=spine_w)

    # Lyric lines on each page
    line_color = (10, 10, 10, 200)
    line_w = max(1, int(size * 0.018))
    for page_side, x0, x1 in (
        ("L", book_left + w * 0.14, spine_x - w * 0.08),
        ("R", spine_x + w * 0.08, book_right - w * 0.14),
    ):
        for i, t in enumerate((0.28, 0.44, 0.60)):
            y = book_top + (book_bottom - book_top) * t
            # Slightly shorter bottom line
            shorten = 0 if i < 2 else (x1 - x0) * 0.22
            if page_side == "L":
                d.line([(x0 + shorten, y), (x1, y)], fill=line_color, width=line_w)
            else:
                d.line([(x0, y), (x1 - shorten, y)], fill=line_color, width=line_w)

    return img


def render(size: int, *, maskable_safe: bool = False, scale: int = 4) -> Image.Image:
    """Draw at high resolution and downsample for smoother edges."""
    hi = draw_logo(size * scale, maskable_safe=maskable_safe)
    return hi.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)

    icon_512 = render(512, maskable_safe=True)
    icon_192 = render(192, maskable_safe=True)
    icon_512.save(ICONS / "icon-512.png", optimize=True)
    icon_192.save(ICONS / "icon-192.png", optimize=True)

    mark = render(256, maskable_safe=False)
    mark.save(ICONS / "logo-256.png", optimize=True)

    # App Router icons (Next.js picks these up automatically)
    app_icon = render(32, maskable_safe=True)
    apple = render(180, maskable_safe=True)
    app_icon.save(APP_ICON, optimize=True)
    apple.save(APPLE_ICON, optimize=True)

    # Classic favicon — largest first, Pillow derives the ICO directory
    fav = render(48, maskable_safe=True)
    fav.save(FAVICON, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    print(f"Wrote {ICONS / 'icon-192.png'}")
    print(f"Wrote {ICONS / 'icon-512.png'}")
    print(f"Wrote {ICONS / 'logo-256.png'}")
    print(f"Wrote {APP_ICON}")
    print(f"Wrote {APPLE_ICON}")
    print(f"Wrote {FAVICON}")


if __name__ == "__main__":
    main()
