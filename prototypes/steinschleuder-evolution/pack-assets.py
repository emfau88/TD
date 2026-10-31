"""Package Imagegen sprites on the native grid; never alter original atlases.
Only alpha threshold, crop, nearest-neighbour resize, palette packing and assembly.
"""
from pathlib import Path
from math import ceil
import hashlib,json
from PIL import Image,ImageDraw,ImageFont
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]; ORIGINAL=ROOT/'public/assets'; OUT=HERE/'assets/compact'
OUT.mkdir(parents=True,exist_ok=True)
NN=Image.Resampling.NEAREST
LEVELS=[1,2,3,5,10,15,20,25]
original_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ORIGINAL.glob('Tower 03*')}
records=[]
def save(sprite,path):
    a=sprite.getchannel('A')
    sprite=sprite.quantize(colors=32,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert('RGBA');sprite.putalpha(a)
    sprite.save(path,optimize=True)
for level in LEVELS:
    if level<=3:
        base=Image.open(ORIGINAL/'Tower 03.png').convert('RGBA').crop(((level-1)*64,0,level*64,128))
        weapon=Image.open(ORIGINAL/f'Tower 03 - Level 0{level} - Weapon.png').convert('RGBA').crop((0,0,96,96))
        top=min(base.getbbox()[1],-2.742857+weapon.getbbox()[1])
        shift=ceil(36-top)
        compact=Image.new('RGBA',(64,128));compact.alpha_composite(base.crop((0,0,64,64)),(0,shift))
        compact.alpha_composite(base.crop((0,64,64,128)).resize((64,64-shift),NN),(0,64+shift))
        compact.save(OUT/f'level-{level}-base.png');weapon.save(OUT/f'level-{level}-weapon.png')
        projectile=Image.open(ORIGINAL/f'Tower 03 - Level 0{level} - Projectile.png').convert('RGBA').crop((0,0,10,10))
        projectile.save(OUT/f'level-{level}-projectile.png')
        mount=-23+shift*.63
    else:
        raw=Image.open(HERE/(f'sources/level-{level}-matched.png' if level==10 else f'sources/level-{level}-generated.png')).convert('RGBA')
        raw.putalpha(raw.getchannel('A').point(lambda a:255 if a>=192 else 0))
        alpha=raw.getchannel('A');bands=[]
        for x in range(raw.width):
            if not alpha.crop((x,0,x+1,raw.height)).getbbox():continue
            if not bands or x>bands[-1][-1]+1:bands.append([x])
            else:bands[-1].append(x)
        assert len(bands)==3,(level,len(bands))
        parts=[]
        for b in bands:
            part=raw.crop((b[0],0,b[-1]+1,raw.height));parts.append(part.crop(part.getbbox()))
        compact=Image.new('RGBA',(64,128));compact.alpha_composite(parts[0].resize((64,84),NN),(0,44))
        weapon=Image.new('RGBA',(96,96));weapon.alpha_composite(parts[1].resize((56,50),NN),(20,23))
        stone_size={5:12,10:14,15:15,20:16,25:16}[level]
        projectile=Image.new('RGBA',(20,20));projectile.alpha_composite(parts[2].resize((stone_size,stone_size),NN),((20-stone_size)//2,(20-stone_size)//2))
        save(compact,OUT/f'level-{level}-base.png');save(weapon,OUT/f'level-{level}-weapon.png');save(projectile,OUT/f'level-{level}-projectile.png')
        mount=13+(74-102.4)*.63
    records.append(dict(kind=3,level=level,weaponY=mount,originY=.8,originalStage=level if level<=3 else 0,
        base=f'assets/compact/level-{level}-base.png',weapon=f'assets/compact/level-{level}-weapon.png',projectile=f'assets/compact/level-{level}-projectile.png'))
assert all(hashlib.sha256((ORIGINAL/name).read_bytes()).hexdigest()==h for name,h in original_hashes.items())
metadata=dict(levels=records,scale=.63,nativeBase=[64,128],nativeWeapon=[96,96],baseY=13,originalHashes=original_hashes,
    provenance='Original stages 1–3, lower facade shortened. Built-in Imagegen parts for 5–25; nearest-neighbour native-grid packaging, no color filters or original overwrites.')
(HERE/'manifest.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
sheet=Image.new('RGBA',(8*104,190),(19,32,31,255));d=ImageDraw.Draw(sheet)
font=ImageFont.truetype(str(ROOT/'prototypes/waldwaechter-evolution/assets/PixelifySans.ttf'),12)
for i,r in enumerate(records):
    x=i*104+52;b=Image.open(HERE/r['base']);w=Image.open(HERE/r['weapon']);p=Image.open(HERE/r['projectile'])
    sheet.alpha_composite(b,(x-32,0));sheet.alpha_composite(w,(x-48,round(102.4+(r['weaponY']-13)/.63-48)))
    sheet.alpha_composite(p,(x-p.width//2,138));d.text((x,174),'LEVEL '+str(r['level']),fill='#eed9a4',font=font,anchor='mm')
sheet.resize((2496,570),NN).save(HERE/'comparison.png')
print(json.dumps(records,indent=2))
