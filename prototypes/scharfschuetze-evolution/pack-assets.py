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
original_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ORIGINAL.glob('Tower 04*')}
records=[]
def save(sprite,path):
    a=sprite.getchannel('A')
    sprite=sprite.quantize(colors=32,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert('RGBA');sprite.putalpha(a)
    sprite.save(path,optimize=True)
for level in LEVELS:
    if level<=3:
        base=Image.open(ORIGINAL/'Tower 04.png').convert('RGBA').crop(((level-1)*64,0,level*64,128))
        weapon=Image.open(ORIGINAL/f'Tower 04 - Level 0{level} - Weapon.png').convert('RGBA').crop((0,0,128,128))
        # Keep the stone parapet/body envelope equal across original stages.
        shift=36-base.getbbox()[1]
        compact=Image.new('RGBA',(64,128));compact.alpha_composite(base.crop((0,0,64,64)),(0,shift))
        compact.alpha_composite(base.crop((0,64,64,128)).resize((64,64-shift),NN),(0,64+shift))
        compact.save(OUT/f'level-{level}-base.png');weapon.save(OUT/f'level-{level}-weapon.png')
        projectile=Image.open(ORIGINAL/f'Tower 04 - Level 0{level} - Projectile.png').convert('RGBA').crop((0,0,*[(8,8),(15,12),(10,10)][level-1]))
        projectile.save(OUT/f'level-{level}-projectile.png')
        mount=-.5
    else:
        raw=Image.open(HERE/f'sources/level-{level}-generated.png').convert('RGBA')
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
        weapon=Image.new('RGBA',(128,128));weapon.alpha_composite(parts[1].resize((32,62),NN),(48,33))
        stone_size={5:10,10:11,15:12,20:13,25:14}[level]
        projectile=Image.new('RGBA',(20,20));projectile.alpha_composite(parts[2].resize((stone_size,stone_size),NN),((20-stone_size)//2,(20-stone_size)//2))
        save(compact,OUT/f'level-{level}-base.png');save(weapon,OUT/f'level-{level}-weapon.png');save(projectile,OUT/f'level-{level}-projectile.png')
        mount=13+(74-102.4)*.63
    records.append(dict(kind=4,level=level,weaponY=mount,originY=.8,weaponScale=.53 if level<=3 else .63,originalStage=level if level<=3 else 0,
        base=f'assets/compact/level-{level}-base.png',weapon=f'assets/compact/level-{level}-weapon.png',projectile=f'assets/compact/level-{level}-projectile.png'))
assert all(hashlib.sha256((ORIGINAL/name).read_bytes()).hexdigest()==h for name,h in original_hashes.items())
metadata=dict(levels=records,scale=.63,nativeBase=[64,128],nativeWeapon=[128,128],baseY=13,originalHashes=original_hashes,
    provenance='Original stages 1–3, lower facade shortened; original weapon frames retained, render scale .53 for safe aim envelope. Built-in Imagegen parts for 5–25; nearest-neighbour native-grid packaging, no color filters or original overwrites.')
(HERE/'manifest.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
sheet=Image.new('RGBA',(8*104,190),(19,32,31,255));d=ImageDraw.Draw(sheet)
font=ImageFont.truetype(str(ROOT/'prototypes/waldwaechter-evolution/assets/PixelifySans.ttf'),12)
digits=ImageFont.truetype(str(ROOT/'prototypes/waldwaechter-evolution/assets/SpireClearDigits.ttf'),12)
for i,r in enumerate(records):
    x=i*104+52;b=Image.open(HERE/r['base']);w=Image.open(HERE/r['weapon']);p=Image.open(HERE/r['projectile'])
    sheet.alpha_composite(b,(x-32,0));ws=r['weaponScale']/.63;size=round(128*ws);w=w.resize((size,size),NN)
    sheet.alpha_composite(w,(x-size//2,round(102.4+(r['weaponY']-13)/.63-size/2)))
    sheet.alpha_composite(p,(x-p.width//2,138))
    label='LEVEL '+str(r['level']);fonts=[digits if c in '258' else font for c in label]
    widths=[d.textlength(c,font=f) for c,f in zip(label,fonts)];cursor=x-sum(widths)/2
    for c,f,width in zip(label,fonts,widths):
        d.text((cursor,168),c,fill='#eed9a4',font=f);cursor+=width
sheet.resize((2496,570),NN).save(HERE/'comparison.png')
print(json.dumps(records,indent=2))
