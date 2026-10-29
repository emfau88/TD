"""Isolated Frost study: original pixels plus Imagegen artwork, no gameplay writes."""
from pathlib import Path
from math import ceil
import json,hashlib
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent
A=ROOT/'assets'
LEVELS=[1,2,3,5,10,15,20,25]
N=Image.Resampling.NEAREST
CENTER=80.9168253968254
ANCHOR=166.4
SCALE=.63
MAPS=[list(range(10))+list(range(16,32)),list(range(16))+list(range(17,34)),list(range(39))]
records=[]
def hard(im):
 im=im.convert('RGBA');im.putalpha(im.getchannel('A').point(lambda a:255 if a>=192 else 0));return im
def fit(im,w,h):
 ratio=min(w/im.width,h/im.height)
 return im.resize((max(1,round(im.width*ratio)),max(1,round(im.height*ratio))),N)
def palette(im):
 a=im.getchannel('A');im=im.quantize(colors=32,method=Image.Quantize.FASTOCTREE,dither=Image.Dither.NONE).convert('RGBA');im.putalpha(a);return im
for level in LEVELS:
 if level<=3:
  base=Image.open(A/f'original/level-{level}-base.png').convert('RGBA')
  atlas=Image.open(A/f'original/level-{level}-attack.png').convert('RGBA')
  size=48 if level==1 else 64;cols=atlas.width//size;frames=MAPS[level-1]
  boxes=[atlas.crop((i%cols*size,i//cols*size,i%cols*size+size,i//cols*size+size)).getbbox() for i in frames]
  top=min(base.getbbox()[1],CENTER-size/2+min(b[1] for b in boxes if b))
  shift=ceil(100-top)
  compact=Image.new('RGBA',(64,192))
  top=base.getbbox()[1]
  compact.alpha_composite(base.crop((0,top,64,192)).resize((64,192-top-shift),N),(0,top+shift))
  crystal=Image.new('RGBA',(64,64));crystal.alpha_composite(atlas.crop((0,0,size,size)),((64-size)//2,(64-size)//2))
  y=13+(CENTER+shift-ANCHOR)*SCALE
  record=dict(level=level,originalStage=level,upperShift=shift,crystalY=y,attackSize=size,attackCols=cols,frameMap=frames,idleCount=[10,16,20][level-1])
 else:
  sourceName=f'sources/level-{level}-ice-edit.png' if level in [5,10] else f'sources/level-{level}-generated.png'
  src=hard(Image.open(ROOT/sourceName))
  # Largest transparent column gap separates pedestal from crystal.
  a=src.getchannel('A');xs=[x for x in range(src.width) if a.crop((x,0,x+1,src.height)).getbbox()]
  gap=max(zip(xs,xs[1:]),key=lambda p:p[1]-p[0]);split=(gap[0]+gap[1])//2
  body=src.crop((0,0,split,src.height));bodyBox=body.getbbox();body=body.crop(bodyBox)
  core=src.crop((split,0,src.width,src.height));coreBox=core.getbbox();core=core.crop(coreBox)
  body=palette(fit(body,64,82));compact=Image.new('RGBA',(64,192));compact.alpha_composite(body,((64-body.width)//2,192-body.height))
  maxsize={5:(28,44),10:(32,48),15:(34,50),20:(38,50),25:(40,52)}[level]
  core=palette(fit(core,*maxsize));crystal=Image.new('RGBA',(64,64));crystal.alpha_composite(core,((64-core.width)//2,(64-core.height)//2))
  # Same mounting height as the compact original third-tier core, set below.
  y=records[2]['crystalY']
  projectile=Image.new('RGBA',(32,32));bolt=fit(core,20,24);projectile.alpha_composite(bolt,((32-bolt.width)//2,(32-bolt.height)//2));projectile.save(A/f'compact/level-{level}-projectile.png',optimize=True)
  record=dict(level=level,crystalY=y,source=sourceName,split=split,sourceBodyBox=bodyBox,sourceCrystalBox=[coreBox[0]+split,coreBox[1],coreBox[2]+split,coreBox[3]],projectile=f'assets/compact/level-{level}-projectile.png')
 if level in [2,3]:
  # Separate Imagegen palette variants; original atlases remain intact.
  src=hard(Image.open(ROOT/f'sources/level-{level}-ice-edit.png'))
  a=src.getchannel('A');xs=[x for x in range(src.width) if a.crop((x,0,x+1,src.height)).getbbox()]
  gap=max(zip(xs,xs[1:]),key=lambda p:p[1]-p[0]);split=(gap[0]+gap[1])//2
  b=src.crop((0,0,split,src.height));b=b.crop(b.getbbox())
  c=src.crop((split,0,src.width,src.height));c=c.crop(c.getbbox())
  top=compact.getbbox()[1]
  compact=Image.new('RGBA',(64,192));compact.alpha_composite(palette(b.resize((64,192-top),N)),(0,top))
  size=(28,40 if level==2 else 52)
  c=palette(c.resize(size,N));crystal=Image.new('RGBA',(64,64));crystal.alpha_composite(c,((64-size[0])//2,(64-size[1])//2))
  bolt=fit(c,20,24);projectile=Image.new('RGBA',(32,32));projectile.alpha_composite(bolt,((32-bolt.width)//2,(32-bolt.height)//2));projectile.save(A/f'compact/level-{level}-projectile.png',optimize=True)
  record.update(paletteCorrected=True,source=f'sources/level-{level}-ice-edit.png',projectile=f'assets/compact/level-{level}-projectile.png')
 compact.save(A/f'compact/level-{level}-base.png',optimize=True)
 crystal.save(A/f'compact/level-{level}-crystal.png',optimize=True)
 record.update(base=f'assets/compact/level-{level}-base.png',crystal=f'assets/compact/level-{level}-crystal.png',baseBox=compact.getbbox(),crystalBox=crystal.getbbox())
 records.append(record)
metadata=dict(revision=1,baseCommit='823d2ea',levels=records,scale=.63,cellSize=40,baseY=13,baseOriginY=166.4/192,frameBase=[64,192],frameCrystal=[64,64],maxHeight=92,terrain=dict(grass=[128,64,64,64],horizontalPath=[384,64,64,64],tree=[833,384,62,64]),hashes={str(p.relative_to(A)).replace('\\','/'):hashlib.sha256(p.read_bytes()).hexdigest() for p in A.rglob('*.png')})
(ROOT/'manifest.json').write_text(json.dumps(metadata,indent=2),encoding='utf-8')
sheet=Image.new('RGBA',(8*112,166),(19,32,31,255));draw=ImageDraw.Draw(sheet)
font=ImageFont.truetype(str(A/'PixelifySans.ttf'),14);clear=ImageFont.truetype(str(A/'SpireClearDigits.ttf'),14)
for i,r in enumerate(records):
 x=i*112+56;b=Image.open(ROOT/r['base']);w=Image.open(ROOT/r['crystal'])
 sheet.alpha_composite(b,(x-32,-64))
 wy=ANCHOR+(r['crystalY']-13)/SCALE
 sheet.alpha_composite(w,(x-32,round(wy-32-64)))
 text=f"LEVEL {r['level']}";fonts=[clear if c in '258' else font for c in text];widths=[draw.textlength(c,font=f) for c,f in zip(text,fonts)];tx=x-sum(widths)/2
 for c,f,cw in zip(text,fonts,widths):draw.text((tx,152),c,font=f,fill='#eed9a4',anchor='ls');tx+=cw
sheet.resize((2688,498),N).save(ROOT/'comparison.png',optimize=True)
print(json.dumps([dict(level=r['level'],body=r['baseBox'],core=r['crystalBox'],mount=r['crystalY']) for r in records]))
