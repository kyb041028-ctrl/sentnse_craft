"""
Make near-black pixels transparent in PNGs (for overlay assets).

Default targets: public/territories/belt-stage-1..4.png and common-space-hero.png

  python tools/png_black_to_transparent.py
  python tools/png_black_to_transparent.py --rgb-max 28 --soft-band 24 path/to/a.png

Re-run with different --rgb-max if edges look jagged (lower) or dark art gets holes (higher).
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError as e:
    raise SystemExit("Install Pillow: pip install Pillow") from e


def rgba_from_pixel(pixel):
    if len(pixel) == 4:
        return pixel
    if len(pixel) == 3:
        return (*pixel, 255)
    raise ValueError(f"Unexpected mode pixel len {len(pixel)}")


def black_to_transparent(
    path: Path,
    *,
    rgb_max: int,
    soft_band: int,
) -> None:
    """
    rgb_max: pixel is fully transparent if R,G,B are all <= this (0-255).
    soft_band: above rgb_max, fade alpha linearly until rgb_max+soft_band (smoother edges).
    """
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    px = img.load()
    hi = rgb_max + soft_band

    for y in range(h):
        for x in range(w):
            r, g, b, a = rgba_from_pixel(px[x, y])
            m = max(r, g, b)
            if m <= rgb_max:
                px[x, y] = (r, g, b, 0)
            elif soft_band > 0 and m < hi:
                # keep color, reduce alpha for fringe pixels
                t = (m - rgb_max) / soft_band
                new_a = int(round(a * t))
                px[x, y] = (r, g, b, new_a)
            else:
                px[x, y] = (r, g, b, a)

    img.save(path, "PNG", optimize=True)
    print(f"OK {path.name}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Turn near-black PNG background to transparency (overwrites files).")
    parser.add_argument("--rgb-max", type=int, default=32, help="R,G,B all <= this → fully transparent (0-255).")
    parser.add_argument("--soft-band", type=int, default=18, help="Pixels up to rgb_max+this fade alpha for softer edges.")
    parser.add_argument(
        "paths",
        nargs="*",
        help="PNG files to process. If omitted, processes default belt + common-space hero assets.",
    )
    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1] / "public" / "territories"
    if args.paths:
        paths = [Path(p).resolve() for p in args.paths]
    else:
        paths = [root / f"belt-stage-{i}.png" for i in range(1, 5)]
        paths.append(root / "common-space-hero.png")

    for p in paths:
        if not p.is_file():
            print(f"SKIP (missing): {p}", file=sys.stderr)
            continue
        black_to_transparent(p, rgb_max=args.rgb_max, soft_band=args.soft_band)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
