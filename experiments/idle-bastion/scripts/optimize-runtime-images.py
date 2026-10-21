"""Rebuild lossless runtime derivatives; original art remains untouched.
Requires Pillow with WebP support. Run from any directory; --check verifies only.
"""
from pathlib import Path
from io import BytesIO
import argparse
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
IDLE = ROOT / "experiments/idle-bastion"
OUT = IDLE / "assets/runtime"
SOURCES = {
    "mara-atlas.webp": IDLE / "assets/mara-tavern/mara-atlas.png",
    "mara-reactions.webp": IDLE / "assets/tavern-ui/mara-reactions.png",
    "ilyra-atlas.webp": IDLE / "assets/ilyra-tavern/ilyra-atlas.png",
    "ilyra-reactions.webp": IDLE / "assets/ilyra-tavern/ilyra-reactions.png",
    "room.webp": IDLE / "assets/tavern-ui/room.png",
    "mara-game.webp": ROOT / "public/assets/Hero Mara.png",
}
PORTRAITS = {
    "mara-portrait.webp": (SOURCES["mara-atlas.webp"], (82, 0, 252, 200)),
    "ilyra-portrait.webp": (SOURCES["ilyra-atlas.webp"], (140, 8, 310, 208)),
}

def main():
    check = argparse.ArgumentParser()
    check.add_argument("--check", action="store_true")
    args = check.parse_args()
    if not args.check:
        OUT.mkdir(exist_ok=True)
    for name in [*SOURCES, *PORTRAITS]:
        source, crop = (SOURCES[name], None) if name in SOURCES else PORTRAITS[name]
        with Image.open(source) as original:
            expected = original.convert("RGBA")
        if crop:
            expected = expected.crop(crop)
        target = OUT / name
        if args.check:
            data = target.read_bytes()
        else:
            buffer = BytesIO()
            expected.save(buffer, "WEBP", lossless=True, method=6, exact=True)
            data = buffer.getvalue()
        with Image.open(BytesIO(data)) as encoded:
            actual = encoded.convert("RGBA")
        assert expected.size == actual.size and expected.tobytes() == actual.tobytes(), name
        if not args.check:
            target.write_bytes(data)
        print(f"{name}: {len(data):,} bytes; exact RGBA verified")

if __name__ == "__main__":
    main()
