"""Mechanical sprite packaging only: crop generated parts, align to original
frames/mount, nearest-neighbour pixel grid, bounded palette and binary alpha.
Original game assets are copied/cropped losslessly and never overwritten."""
from pathlib import Path
import hashlib, json, shutil
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
ASSETS = HERE / "assets"
ASSETS.mkdir(exist_ok=True)
SOURCE = REPO / "public" / "assets"
NEAREST = Image.Resampling.NEAREST
records = []
for stage, level in enumerate([1, 4, 7]):
    base_source = Image.open(SOURCE / "Tower 01.png").convert("RGBA")
    base = base_source.crop((stage * 64, 0, stage * 64 + 64, 128))
    weapon = Image.open(SOURCE / f"Tower 01 - Level 0{stage+1} - Weapon.png").convert("RGBA").crop((0, 0, 96, 96))
    base.save(ASSETS / f"level-{level}-base.png")
    weapon.save(ASSETS / f"level-{level}-weapon.png")
    records.append(dict(level=level, original=True, baseBox=base.getbbox(), weaponBox=weapon.getbbox()))

# Full-resolution generators are retained in sources; only these runtime copies
# lose alpha fringes. No recoloring, filters, or procedural ornament generation.
for level, split, mount_y, top, weapon_size in [
    (10, 760, 522, 12, (56, 46)),
    (15, 796, 485, 12, (60, 50)),
    (20, 796, 420, 12, (64, 54)),
]:
    image = Image.open(HERE / "sources" / f"level-{level}-generated.png").convert("RGBA")
    image.putalpha(image.getchannel("A").point(lambda a: 255 if a >= 192 else 0))
    left = Image.open(HERE / "sources" / f"level-{level}-compact-base.png").convert("RGBA")
    left.putalpha(left.getchannel("A").point(lambda a: 255 if a >= 192 else 0))
    box = left.getbbox()
    left = left.crop(box)
    # Keep the original mount at source base y45 (weapon center y48, offset -2.74).
    local_mount = mount_y - box[1]
    base = Image.new("RGBA", (64, 128))
    base.alpha_composite(left.crop((0, 0, left.width, local_mount)).resize((64, 45-top), NEAREST), (0, top))
    base.alpha_composite(left.crop((0, local_mount, left.width, left.height)).resize((64, 83), NEAREST), (0, 45))
    right = image.crop((split, 0, image.width, image.height))
    wbox = right.getbbox()
    right = right.crop(wbox).resize(weapon_size, NEAREST)
    weapon = Image.new("RGBA", (96, 96))
    weapon.alpha_composite(right, (48-weapon_size[0]//2, 48-weapon_size[1]//2))
    for part, sprite in [("base", base), ("weapon", weapon)]:
        alpha = sprite.getchannel("A")
        sprite = sprite.quantize(colors=32, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).convert("RGBA")
        sprite.putalpha(alpha)
        sprite.save(ASSETS / f"level-{level}-{part}.png", optimize=True)
    records.append(dict(level=level, original=False, sourceBaseBox=box,
                        sourceWeaponBox=[wbox[0]+split,wbox[1],wbox[2]+split,wbox[3]],
                        sourceMountY=mount_y, compactBaseSource=f"sources/level-{level}-compact-base.png", baseBox=base.getbbox(), weaponBox=weapon.getbbox()))

shutil.copy2(SOURCE / "Grass Tileset.png", ASSETS / "terrain.png")
metadata = dict(baseCommit="ff65d67b943d35d55f3e6518274ddf78760f88ab",
    nativeFrames=dict(base=[64,128],weapon=[96,96]),
    mount=dict(baseY=13,baseOrigin=[.5,.8],weaponY=-23,weaponOrigin=[.5,.5]),
    scale=.63,cellSize=40,worldHeight=640,levels=records,
    terrain=dict(grass=[128,64,64,64],horizontalPath=[384,64,64,64],tree=[833,384,62,64]),
    provenance="Imagegen designs; deterministic crop/alignment/palette/alpha packaging. Original levels are exact source-frame copies.",
    hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ASSETS.glob("*.png")})
(HERE / "manifest.json").write_text(json.dumps(metadata,indent=2),encoding="utf-8")

# A technical contact sheet of the assembled native frames, not a concept mockup.
sheet = Image.new("RGBA",(6*112,180),(19,32,31,255))
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype(str(ASSETS/"PixelifySans.ttf"),14)
for i,level in enumerate([1,4,7,10,15,20]):
    x=i*112+56
    base=Image.open(ASSETS/f"level-{level}-base.png").convert("RGBA")
    weapon=Image.open(ASSETS/f"level-{level}-weapon.png").convert("RGBA")
    sheet.alpha_composite(base,(x-32,20))
    sheet.alpha_composite(weapon,(x-48,17))
    draw.text((x,156),f"LEVEL {level}",font=font,fill="#eed9a4",anchor="mt")
sheet.resize((2016,540),NEAREST).save(HERE/"comparison.png",optimize=True)
print(json.dumps(records,indent=2))
