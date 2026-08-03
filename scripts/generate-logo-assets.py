#!/usr/bin/env python3
"""Resize the selected Azadari logo source into PWA / favicon / app icons."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ICONS = ROOT / "public" / "icons"
APP = ROOT / "src" / "app"
SOURCE = ICONS / "logo-source.png"

FAVICON = APP / "favicon.ico"
APP_ICON = APP / "icon.png"
APPLE_ICON = APP / "apple-icon.png"


def load_source() -> Image.Image:
    if not SOURCE.exists():
        raise SystemExit(f"Missing logo source: {SOURCE}")
    return Image.open(SOURCE).convert("RGBA")


def resize(src: Image.Image, size: int) -> Image.Image:
    return src.resize((size, size), Image.Resampling.LANCZOS)


def main() -> None:
    ICONS.mkdir(parents=True, exist_ok=True)
    src = load_source()

    icon_512 = resize(src, 512)
    icon_192 = resize(src, 192)
    logo_256 = resize(src, 256)
    icon_512.save(ICONS / "icon-512.png", optimize=True)
    icon_192.save(ICONS / "icon-192.png", optimize=True)
    logo_256.save(ICONS / "logo-256.png", optimize=True)

    # Keep a clean SVG-sized PNG for the header as well
    logo_64 = resize(src, 128)
    logo_64.save(ICONS / "logo.png", optimize=True)

    resize(src, 32).save(APP_ICON, optimize=True)
    resize(src, 180).save(APPLE_ICON, optimize=True)

    fav = resize(src, 48)
    fav.save(FAVICON, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

    print(f"Source: {SOURCE}")
    print(f"Wrote {ICONS / 'icon-192.png'}")
    print(f"Wrote {ICONS / 'icon-512.png'}")
    print(f"Wrote {ICONS / 'logo-256.png'}")
    print(f"Wrote {ICONS / 'logo.png'}")
    print(f"Wrote {APP_ICON}")
    print(f"Wrote {APPLE_ICON}")
    print(f"Wrote {FAVICON}")


if __name__ == "__main__":
    main()
