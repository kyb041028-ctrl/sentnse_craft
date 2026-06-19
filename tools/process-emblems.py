#!/usr/bin/env python3
"""Crop world emblems from source sheet, remove white bg, export icons."""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "emblems"
PUBLIC_OUT = ROOT / "public" / "assets" / "emblems"

SRC_SHEET = Path(
    r"C:\Users\포키\.cursor\projects\c-Users-OneDrive-Desktop-sentence-craft\assets"
    r"\c__Users____AppData_Roaming_Cursor_User_workspaceStorage_29e8d9867b740c82b5d38e51c644afd1_images"
    r"_ChatGPT_Image_2026__6__19_____01_51_08-a3812289-4989-4f69-b0b8-7711cd913977.png"
)
SRC = SRC_SHEET
SRC_ALIEN = Path(
    r"C:\Users\포키\.cursor\projects\c-Users-OneDrive-Desktop-sentence-craft\assets"
    r"\c__Users____AppData_Roaming_Cursor_User_workspaceStorage_29e8d9867b740c82b5d38e51c644afd1_images"
    r"_ChatGPT_Image_2026__6__19_____02_02_09-113ba868-559f-44d2-8e0f-f231daa33e62.png"
)

SHEET_NAMES = [
    ("reform-emblem", 0),
    ("order-emblem", 1),
    ("square-emblem", 2),
]

SINGLE_NAMES = [
    ("alien-emblem", SRC_ALIEN),
]


def is_white(r: int, g: int, b: int, a: int = 255, threshold: int = 238) -> bool:
    if a < 12:
        return True
    return r >= threshold and g >= threshold and b >= threshold


def content_bbox(img: Image.Image, pad: int = 8) -> tuple[int, int, int, int]:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    min_x, min_y, max_x, max_y = w, h, 0, 0
    found = False
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if not is_white(r, g, b, a):
                found = True
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
    if not found:
        return 0, 0, w, h
    return (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(w, max_x + pad + 1),
        min(h, max_y + pad + 1),
    )


def remove_white_bg(img: Image.Image, threshold: int = 238, feather: int = 1) -> Image.Image:
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_white(r, g, b, a, threshold):
                px[x, y] = (r, g, b, 0)
            else:
                # soften near-white fringe
                near = r >= threshold - 18 and g >= threshold - 18 and b >= threshold - 18
                if near:
                    dist = max(r, g, b) - threshold + 18
                    alpha = max(0, min(255, int(255 * (1 - dist / 24))))
                    px[x, y] = (r, g, b, min(a, alpha))
    if feather:
        alpha = rgba.split()[3]
        alpha = alpha.filter(ImageFilter.GaussianBlur(feather))
        rgba.putalpha(alpha)
    return rgba


def sharpen_for_ui(img: Image.Image) -> Image.Image:
    rgb = img.convert("RGB")
    rgb = ImageEnhance.Contrast(rgb).enhance(1.08)
    rgb = ImageEnhance.Sharpness(rgb).enhance(1.15)
    out = rgb.convert("RGBA")
    out.putalpha(img.split()[3])
    return out


def crop_third(img: Image.Image, index: int) -> Image.Image:
    w, h = img.size
    third = w // 3
    # slight overlap trim between banners
    margin = int(third * 0.04)
    x0 = index * third + (margin if index else 0)
    x1 = (index + 1) * third - (margin if index < 2 else 0)
    return img.crop((x0, 0, x1, h))


def emblem_symbol_crop(img: Image.Image) -> Image.Image:
    """Focus on banner + central sigil for small UI icons."""
    w, h = img.size
    x0 = int(w * 0.12)
    x1 = int(w * 0.88)
    y0 = int(h * 0.08)
    y1 = int(h * 0.92)
    return img.crop((x0, y0, x1, y1))


def make_icon(img: Image.Image, size: int) -> Image.Image:
    emblem = emblem_symbol_crop(img)
    bbox = content_bbox(emblem, pad=0)
    emblem = emblem.crop(bbox)
    ew, eh = emblem.size
    pad = max(2, size // 16)
    inner = size - pad * 2
    scale = min(inner / ew, inner / eh)
    nw = max(1, int(ew * scale))
    nh = max(1, int(eh * scale))
    resized = emblem.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - nw) // 2
    oy = (size - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
    canvas = sharpen_for_ui(canvas)
    if size <= 32:
        rgb = canvas.convert("RGB")
        rgb = ImageEnhance.Contrast(rgb).enhance(1.14)
        rgb = ImageEnhance.Sharpness(rgb).enhance(1.2)
        out = rgb.convert("RGBA")
        out.putalpha(canvas.split()[3])
        canvas = out
    return canvas


def save_emblem_set(name: str, transparent: Image.Image) -> None:
    for base in (OUT, PUBLIC_OUT):
        base.mkdir(parents=True, exist_ok=True)
        main_path = base / f"{name}.png"
        transparent.save(main_path, optimize=True)
        print(f"Saved {main_path} ({transparent.size[0]}x{transparent.size[1]})")
        for sz in (32, 64):
            icon = make_icon(transparent, sz)
            icon_path = base / f"{name}-{sz}.png"
            icon.save(icon_path, optimize=True)
            print(f"Saved {icon_path}")


def process_rgba_emblem(name: str, raw: Image.Image) -> None:
    bbox = content_bbox(raw, pad=10)
    cropped = raw.crop(bbox)
    transparent = sharpen_for_ui(remove_white_bg(cropped))
    save_emblem_set(name, transparent)


def main() -> None:
    if not SRC_SHEET.exists():
        raise SystemExit(f"Source not found: {SRC_SHEET}")

    sheet = Image.open(SRC_SHEET)
    print(f"Sheet source: {sheet.size}")
    for name, idx in SHEET_NAMES:
        process_rgba_emblem(name, crop_third(sheet, idx))

    for name, src in SINGLE_NAMES:
        if not src.exists():
            raise SystemExit(f"Source not found: {src}")
        img = Image.open(src)
        print(f"Single source ({name}): {img.size}")
        process_rgba_emblem(name, img)

    print("Done.")


if __name__ == "__main__":
    main()
