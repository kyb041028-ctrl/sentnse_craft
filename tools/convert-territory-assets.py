from PIL import Image
from pathlib import Path

ASSETS = Path(r"C:\Users\포키\.cursor\projects\c-Users-OneDrive-Desktop-sentence-craft\assets")
ROOT = Path(__file__).resolve().parents[1] / "public" / "assets" / "territories"
BANNERS = ROOT / "banners"
EMBLEMS = ROOT / "emblems"
BANNERS.mkdir(parents=True, exist_ok=True)
EMBLEMS.mkdir(parents=True, exist_ok=True)


def find_suffix(suffix: str) -> Path:
    matches = list(ASSETS.glob(f"*{suffix}.png"))
    if not matches:
        raise FileNotFoundError(f"Missing source for suffix: {suffix}")
    return matches[0]


MAPPING = {
    "banners": {
        "reform": "02_38_15-9a94a73f-9e0c-4fa9-a1f5-2529032b46d6",
        "centrist": "02_38_04-64d49401-538d-4e17-ac7e-c9ab4fa80570",
        "order": "02_38_10-34d03f1f-ac6d-4c26-ae14-52abf0a8ac08",
        "alien": "02_38_07-9ce6a0ef-6e80-45f8-8869-d0416c929a2b",
    },
    "emblems": {
        "reform": "02_57_14-cae59132-ffb2-4ec1-ab9d-3e98130f65f6",
        "centrist": "02_57_11-4b6cbabd-58cf-4b24-a4be-85560ea7d1e2",
        "order": "02_57_08-5444ef9c-dee4-4d45-82ad-025ba4de628f",
        "alien": "02_57_05-1eb958fd-2b4c-4940-8a51-172a8076d966",
    },
}

for folder, items in MAPPING.items():
    out_dir = BANNERS if folder == "banners" else EMBLEMS
    for name, suffix in items.items():
        src = find_suffix(suffix)
        dst = out_dir / f"{name}.webp"
        img = Image.open(src)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")
        img.save(dst, "WEBP", quality=92, method=6)
        print(f"OK {dst} ({img.size[0]}x{img.size[1]})")

print("DONE")
