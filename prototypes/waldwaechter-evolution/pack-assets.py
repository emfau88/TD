"""Build isolated comparison assets. Original files remain untouched.
Imagegen sources supply new artwork; packaging uses nearest-neighbour only.
The compact variant shifts the upper assembly and shortens its lower body.
"""
from pathlib import Path
import hashlib, json, shutil
from math import ceil
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
ASSETS = HERE / "assets"
SOURCE = REPO / "public" / "assets"
NEAREST = Image.Resampling.NEAREST
LEVELS = [1, 2, 3, 5, 10, 15, 20, 25]
for folder in [ASSETS, ASSETS/"reference", ASSETS/"compact"]:
    folder.mkdir(exist_ok=True)
source_records = {}
for stage, old_level in enumerate([1, 4, 7]):
    base = Image.open(SOURCE/"Tower 01.png").convert("RGBA").crop((stage*64,0,stage*64+64,128))
    weapon = Image.open(SOURCE/f"Tower 01 - Level 0{stage+1} - Weapon.png").convert("RGBA").crop((0,0,96,96))
    base.save(ASSETS/f"level-{old_level}-base.png")
    weapon.save(ASSETS/f"level-{old_level}-weapon.png")
    source_records[old_level] = dict(originalStage=stage+1)

def opaque_source(path):
    image = Image.open(path).convert("RGBA")
    image.putalpha(image.getchannel("A").point(lambda a: 255 if a >= 192 else 0))
    return image

for level, split, mount_y, weapon_size in [
    (5,820,387,(52,44)), (10,760,522,(56,46)),
    (15,796,485,(60,50)), (20,796,420,(64,54)),
    (25,820,385,(60,48))
]:
    source_path = HERE/"sources"/f"level-{level}-generated.png"
    image = opaque_source(source_path)
    compact_source = HERE/"sources"/f"level-{level}-compact-base.png"
    left = opaque_source(compact_source) if compact_source.exists() else image.crop((0,0,split,image.height))
    box = left.getbbox()
    left = left.crop(box)
    local_mount = mount_y-box[1]
    base = Image.new("RGBA",(64,128))
    base.alpha_composite(left.crop((0,0,left.width,local_mount)).resize((64,33),NEAREST),(0,12))
    base.alpha_composite(left.crop((0,local_mount,left.width,left.height)).resize((64,83),NEAREST),(0,45))
    right = image.crop((split,0,image.width,image.height))
    wbox = right.getbbox()
    right = right.crop(wbox).resize(weapon_size,NEAREST)
    weapon = Image.new("RGBA",(96,96))
    weapon.alpha_composite(right,(48-weapon_size[0]//2,48-weapon_size[1]//2))
    for part,sprite in [("base",base),("weapon",weapon)]:
        alpha=sprite.getchannel("A")
        sprite=sprite.quantize(colors=32,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert("RGBA")
        sprite.putalpha(alpha)
        sprite.save(ASSETS/f"level-{level}-{part}.png",optimize=True)
    source_records[level] = dict(
        generated=True, sourceBase=str((compact_source if compact_source.exists() else source_path).relative_to(HERE)).replace("\\","/"),
        sourceBaseBox=box,sourceMountY=mount_y,
        sourceWeaponBox=[wbox[0]+split,wbox[1],wbox[2]+split,wbox[3]])

records=[]
for level, old_level in zip(LEVELS,[1,4,7,5,10,15,20,25]):
    base=Image.open(ASSETS/f"level-{old_level}-base.png").convert("RGBA")
    weapon=Image.open(ASSETS/f"level-{old_level}-weapon.png").convert("RGBA")
    original_box=base.getbbox()
    # The level-1 arrow projects above its platform. Include it in the height
    # budget rather than letting the early stage obscure the rear row.
    weapon_top_in_base=-2.742857+weapon.getbbox()[1]
    compact_top=36+max(0,ceil(original_box[1]-weapon_top_in_base))
    shift=compact_top-original_box[1]
    # Ground remains at row128. Upper pixels and weapon move together; only the
    # lower facade changes height. Weapons retain their exact pixels/proportions.
    compact=Image.new("RGBA",(64,128))
    compact.alpha_composite(base.crop((0,0,64,64)),(0,shift))
    compact.alpha_composite(base.crop((0,64,64,128)).resize((64,64-shift),NEAREST),(0,64+shift))
    for folder,sprite in [("reference",base),("compact",compact)]:
        sprite.save(ASSETS/folder/f"level-{level}-base.png",optimize=True)
        weapon.save(ASSETS/folder/f"level-{level}-weapon.png",optimize=True)
    records.append(dict(level=level,previousLevel=old_level,**source_records[old_level],
        referenceBox=original_box,baseBox=compact.getbbox(),weaponBox=weapon.getbbox(),
        upperShift=shift,weaponY=-23+shift*.63,
        referenceBase=f"assets/reference/level-{level}-base.png",
        referenceWeapon=f"assets/reference/level-{level}-weapon.png",
        base=f"assets/compact/level-{level}-base.png",
        weapon=f"assets/compact/level-{level}-weapon.png"))

shutil.copy2(SOURCE/"Grass Tileset.png",ASSETS/"terrain.png")
# Extract one independent arrow per generated material tier. No painted pixels
# or colour filters: only source cropping, nearest-neighbour and palette packing.
for level,name,expected,width in [(10,"steel-arrows-generated.png",3,5),(15,"projectile-15-generated.png",4,5),(20,"projectile-20-generated.png",5,6),(25,"projectile-25-generated.png",6,7)]:
    raw=opaque_source(HERE/"sources"/name)
    alpha=raw.getchannel("A")
    columns=[x for x in range(raw.width) if alpha.crop((x,0,x+1,raw.height)).getbbox()]
    bands=[]
    for x in columns:
        if not bands or x>bands[-1][-1]+1: bands.append([x])
        else: bands[-1].append(x)
    assert len(bands)==expected, (level,len(bands),"Expected separate source arrows")
    one=raw.crop((bands[1][0],0,bands[1][-1]+1,raw.height))
    one=one.crop(one.getbbox()).resize((width,40),NEAREST)
    alpha=one.getchannel("A")
    one=one.quantize(colors=24,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert("RGBA")
    one.putalpha(alpha)
    frame=Image.new("RGBA",(8,40));frame.alpha_composite(one,((8-width)//2,0))
    frame.save(ASSETS/"shooting"/("steel-arrow.png" if level==10 else f"arrow-{level}.png"),optimize=True)
metadata=dict(revision=3,baseCommit="0658f8a",
    nativeFrames=dict(base=[64,128],weapon=[96,96]),
    mount=dict(baseY=13,baseOrigin=[.5,.8],weaponY=-23,weaponOrigin=[.5,.5]),
    scale=.63,cellSize=40,worldHeight=640,levels=records,
    compact=dict(minBaseTop=36,maxAssembledHeight=92,bodyCut=64),
    terrain=dict(grass=[128,64,64,64],horizontalPath=[384,64,64,64],tree=[833,384,62,64]),
    provenance="Imagegen designs for new skins; deterministic native-grid packaging. Original early designs retained; prototype-only shorter lower bodies, exact weapon pixels.",
    hashes={str(p.relative_to(ASSETS)).replace("\\","/"):hashlib.sha256(p.read_bytes()).hexdigest() for p in ASSETS.rglob("*.png")})
(HERE/"manifest.json").write_text(json.dumps(metadata,indent=2),encoding="utf-8")

# Actual packed pixel frames, not a newly painted promotional comparison.
sheet=Image.new("RGBA",(8*112,166),(19,32,31,255))
draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype(str(ASSETS/"PixelifySans.ttf"),14)
clear=ImageFont.truetype(str(ASSETS/"SpireClearDigits.ttf"),14)
def label(text,x,y):
    fonts=[clear if c in "258" else font for c in text]
    widths=[draw.textlength(c,font=f) for c,f in zip(text,fonts)]
    cursor=x-sum(widths)/2
    for c,f,w in zip(text,fonts,widths):
        draw.text((cursor,y),c,font=f,fill="#eed9a4",anchor="ls")
        cursor+=w
for i,record in enumerate(records):
    x=i*112+56
    base=Image.open(HERE/record["base"]).convert("RGBA")
    weapon=Image.open(HERE/record["weapon"]).convert("RGBA")
    sheet.alpha_composite(base,(x-32,0))
    sheet.alpha_composite(weapon,(x-48,round(-2.742857+record["upperShift"])))
    label(f'LEVEL {record["level"]}',x,152)
sheet.resize((2688,498),NEAREST).save(HERE/"comparison.png",optimize=True)
print(json.dumps([dict(level=r["level"],height=r["baseBox"][3]-r["baseBox"][1],shift=r["upperShift"],weaponY=r["weaponY"]) for r in records]))
