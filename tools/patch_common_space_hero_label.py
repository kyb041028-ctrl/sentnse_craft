"""Remove top-left '1단계' style label from common-space-hero.png by local inpaint (sampled fill + soft edge)."""
from __future__ import annotations

from pathlib import Path

from PIL import Image


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    path = root / "public" / "territories" / "common-space-hero.png"
    if not path.is_file():
        raise SystemExit(f"missing: {path}")

    im = Image.open(path).convert("RGBA")
    w, h = im.size
    # Top-left parchment label — approximate box for 1024-wide assets
    x0, y0, x1, y1 = 0, 0, int(w * 0.22), int(h * 0.11)
    sx0 = min(x1 + 8, w - 40)
    sx1 = min(sx0 + max(120, w // 4), w)
    sy0, sy1 = 0, min(int(h * 0.12), h)
    samples: list[tuple[int, int, int]] = []
    for x in range(sx0, sx1):
        for y in range(sy0, sy1):
            samples.append(im.getpixel((x, y))[:3])
    avg = tuple(sum(c[i] for c in samples) // len(samples) for i in range(3))

    px = im.load()
    for x in range(x0, x1):
        for y in range(y0, y1):
            r, g, b, a = px[x, y]
            dx = min(x - x0, x1 - 1 - x) if x1 > x0 else 0
            dy = min(y - y0, y1 - 1 - y) if y1 > y0 else 0
            edge = min(dx, dy, 10)
            t = min(1.0, edge / 10.0)
            nr = int(avg[0] * (1 - t) + r * t)
            ng = int(avg[1] * (1 - t) + g * t)
            nb = int(avg[2] * (1 - t) + b * t)
            px[x, y] = (nr, ng, nb, a)

    im.save(path, "PNG", optimize=True)
    print("OK", path, "bbox", (x0, y0, x1, y1), "avg", avg)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
