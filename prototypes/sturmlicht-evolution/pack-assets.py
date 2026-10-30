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
original_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in ORIGINAL.glob('Tower 05*')}
records=[]
def save(sprite,path):
    a=sprite.getchannel('A')
    sprite=sprite.quantize(colors=32,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert('RGBA');sprite.putalpha(a)
    sprite.save(path,optimize=True)
for level in LEVELS:
    if level<=3:
        base=Image.open(ORIGINAL/'Tower 05.png').convert('RGBA').crop(((level-1)*64,0,level*64,128))
        weapon=Image.open(ORIGINAL/f'Tower 05 - Level 0{level} - Weapon.png').convert('RGBA').crop((0,0,96,96))
        # Keep the stone parapet/body envelope equal across original stages.
        shift=36-base.getbbox()[1]
        compact=Image.new('RGBA',(64,128));compact.alpha_composite(base.crop((0,0,64,64)),(0,shift))
        compact.alpha_composite(base.crop((0,64,64,128)).resize((64,64-shift),NN),(0,64+shift))
        compact.save(OUT/f'level-{level}-base.png');weapon.save(OUT/f'level-{level}-weapon.png')
        atlas=Image.open(ORIGINAL/f'Tower 05 - Level 0{level} - Projectile.png').convert('RGBA');size=level*32
        poses=[atlas.crop((f*size,0,(f+1)*size,size)) for f in range(12)]
        projectile=max(poses,key=lambda im:sum(1 for a in im.getchannel('A').getdata() if a>=128))
        projectile.save(OUT/f'level-{level}-projectile.png')
        mount=-14
    else:
        raw=Image.open(HERE/f'sources/level-{level}-generated.png').convert('RGBA')
        raw.putalpha(raw.getchannel('A').point(lambda a:255 if a>=192 else 0))
        alpha=raw.getchannel('A');bands=[]
        for x in range(raw.width):
            if not alpha.crop((x,0,x+1,raw.height)).getbbox():continue
            if not bands or x>bands[-1][-1]+1:bands.append([x])
            else:bands[-1].append(x)
        gaps=sorted(range(len(bands)-1),key=lambda j:bands[j+1][0]-bands[j][-1],reverse=True)[:2]
        assert len(gaps)==2 and all(bands[j+1][0]-bands[j][-1]>raw.width*.06 for j in gaps)
        cuts=[0]+[j+1 for j in sorted(gaps)]+[len(bands)]
        bands=[sum(bands[a:b],[]) for a,b in zip(cuts,cuts[1:])]
        parts=[]
        for b in bands:
            part=raw.crop((b[0],0,b[-1]+1,raw.height));parts.append(part.crop(part.getbbox()))
        compact=Image.new('RGBA',(64,128));compact.alpha_composite(parts[0].resize((64,92),NN),(0,36))
        weapon=Image.new('RGBA',(96,96));emitter=parts[1];emitter.thumbnail((36,38),NN);weapon.alpha_composite(emitter,((96-emitter.width)//2,(96-emitter.height)//2))
        stone_size={5:18,10:21,15:24,20:27,25:28}[level]
        projectile=Image.new('RGBA',(48,48));spark=parts[2].transpose(Image.Transpose.ROTATE_270);spark.thumbnail((stone_size,stone_size),NN);projectile.alpha_composite(spark,((48-spark.width)//2,(48-spark.height)//2))
        save(compact,OUT/f'level-{level}-base.png');save(weapon,OUT/f'level-{level}-weapon.png');save(projectile,OUT/f'level-{level}-projectile.png')
        mount=-14
    records.append(dict(kind=5,level=level,weaponY=mount,originY=.8,weaponScale=.63,originalStage=level if level<=3 else 0,
        base=f'assets/compact/level-{level}-base.png',weapon=f'assets/compact/level-{level}-weapon.png',projectile=f'assets/compact/level-{level}-projectile.png'))
assert all(hashlib.sha256((ORIGINAL/name).read_bytes()).hexdigest()==h for name,h in original_hashes.items())
metadata=dict(levels=records,scale=.63,nativeBase=[64,128],nativeWeapon=[96,96],baseY=13,originalHashes=original_hashes,
    provenance='Original stages 1–3, lower facade shortened; original weapon frames retained; upright emitter, same .63 scale for every level. Built-in Imagegen parts for 5–25; nearest-neighbour native-grid packaging; new projectiles normalized to the upward-facing renderer axis; no color filters or original overwrites.')
(HERE/'manifest.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
sheet=Image.new('RGBA',(8*104,190),(19,32,31,255));d=ImageDraw.Draw(sheet)
font=ImageFont.truetype(str(ROOT/'prototypes/waldwaechter-evolution/assets/PixelifySans.ttf'),12)
digits=ImageFont.truetype(str(ROOT/'prototypes/waldwaechter-evolution/assets/SpireClearDigits.ttf'),12)
for i,r in enumerate(records):
    x=i*104+52;b=Image.open(HERE/r['base']);w=Image.open(HERE/r['weapon']);p=Image.open(HERE/r['projectile'])
    sheet.alpha_composite(b,(x-32,0));ws=r['weaponScale']/.63;size=round(96*ws);w=w.resize((size,size),NN)
    sheet.alpha_composite(w,(x-size//2,round(102.4+(r['weaponY']-13)/.63-size/2)))
    pw=max(1,round(p.width*(24/p.width if r['level']<=3 else .85)));ph=max(1,round(p.height*(24/p.width if r['level']<=3 else .85)));p=p.resize((pw,ph),NN);sheet.alpha_composite(p,(x-p.width//2,128))
    label='LEVEL '+str(r['level']);fonts=[digits if c in '258' else font for c in label]
    widths=[d.textlength(c,font=f) for c,f in zip(label,fonts)];cursor=x-sum(widths)/2
    for c,f,width in zip(label,fonts,widths):
        d.text((cursor,168),c,fill='#eed9a4',font=f);cursor+=width
sheet.resize((2496,570),NN).save(HERE/'comparison.png')
print(json.dumps(records,indent=2))
