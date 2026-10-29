"""Prototype asset and occlusion checks; no game code or save writes."""
import hashlib,json
from math import hypot
from pathlib import Path
from PIL import Image,ImageChops
ROOT=Path(__file__).resolve().parent
REPO=ROOT.parents[1]
manifest=json.loads((ROOT/'manifest.json').read_text())
levels=manifest['levels']
assert [r['level'] for r in levels]==[1,2,3,5,10,15,20,25]
for stage,level in enumerate([1,2,3]):
 expected=Image.open(REPO/'public/assets/Tower 01.png').convert('RGBA').crop((stage*64,0,stage*64+64,128))
 assert Image.open(ROOT/f'assets/reference/level-{level}-base.png').convert('RGBA').tobytes()==expected.tobytes()
 expected=Image.open(REPO/f'public/assets/Tower 01 - Level 0{stage+1} - Weapon.png').convert('RGBA').crop((0,0,96,96))
 assert Image.open(ROOT/f'assets/compact/level-{level}-weapon.png').convert('RGBA').tobytes()==expected.tobytes()
for r in levels:
 for key,size in [('base',(64,128)),('weapon',(96,96)),('referenceBase',(64,128)),('referenceWeapon',(96,96))]:
  im=Image.open(ROOT/r[key]).convert('RGBA')
  assert im.size==size,(r['level'],key)
  assert set(im.getchannel('A').getdata())<={0,255},'Soft alpha'
 box=Image.open(ROOT/r['base']).getbbox()
 assert box[0]==0 and box[2:]==(64,128) and box[1]>=36,'Growing compact building'
 top=min(box[1],-2.742857+r['upperShift']+Image.open(ROOT/r['weapon']).getbbox()[1])
 assert 128-top<=92.001,'Assembled tower exceeds height budget'
 assert Image.open(ROOT/r['weapon']).tobytes()==Image.open(ROOT/r['referenceWeapon']).tobytes(),'Weapon distorted'
 weapon=Image.open(ROOT/r['weapon']).convert('RGBA')
 radius=max(hypot(x+.5-48,y+.5-48) for y in range(96) for x in range(96) if weapon.getpixel((x,y))[3])
 assert radius<=32,'Weapon grows beyond original base width'
 assert abs((r['weaponY']+23)/.63-r['upperShift'])<1e-8,'Mount shifted independently'
for name,expected in manifest['hashes'].items():
 assert hashlib.sha256((ROOT/'assets'/name).read_bytes()).hexdigest()==expected,name

# Alpha coverage with the actual scale, origins, mounts and 40-world-unit row
# spacing. Supersampling measures geometry; it does not generate artwork.
def mask(record,mode,y,weapon_only=False):
 result=Image.new('L',(720,800))
 for part in (['weapon'] if weapon_only else ['base','weapon']):
  key=part if mode=='compact' else ('referenceBase' if part=='base' else 'referenceWeapon')
  alpha=Image.open(ROOT/record[key]).convert('RGBA').getchannel('A')
  if part=='base': x0,y0=80-32*.63,y+13-102.4*.63
  else: x0,y0=80-48*.63,y+(record['weaponY'] if mode=='compact' else -23)-48*.63
  alpha=alpha.resize((round(alpha.width*.63*4),round(alpha.height*.63*4)),Image.Resampling.NEAREST)
  layer=Image.new('L',result.size);layer.paste(alpha,(round(x0*4),round(y0*4)))
  result=ImageChops.lighter(result,layer)
 return result
def count(image): return image.histogram()[255]
results=[]
for rear in levels:
 amounts={}
 for mode in ['reference','compact']:
  back=mask(rear,mode,90)
  # Worst front level, rather than comparing only matching skins.
  amounts[mode]=max(count(ImageChops.multiply(back,mask(front,mode,130)))/count(back) for front in levels)
  if mode=='compact':
   weapon=mask(rear,mode,90,True)
   assert all(count(ImageChops.multiply(weapon,mask(front,mode,130)))==0 for front in levels),'Rear static weapon occluded'
 assert amounts['compact']<amounts['reference'],rear['level']
 results.append(dict(level=rear['level'],hiddenBeforePercent=round(amounts['reference']*100,2),hiddenAfterPercent=round(amounts['compact']*100,2)))
report=dict(result='pass',levels=8,bodyWorldHeight=92*.63,referenceMaxBodyWorldHeight=116*.63,rowSpacing=40,all64FrontRearPairsKeepRearRestWeaponVisible=True,occlusion=results)
(ROOT/'geometry-check.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))

# Original flight/attack/impact strips remain exact; no accidental resampling.
for stage in [1,2,3]:
 for part in ['projectile','weapon']:
  copied=ROOT/f'assets/shooting/original-{stage}-{part}.png'
  original=REPO/f'public/assets/Tower 01 - Level 0{stage} - {part.title()}.png'
  assert copied.read_bytes()==original.read_bytes(),copied
assert (ROOT/'assets/shooting/impact.png').read_bytes()==(REPO/'public/assets/Tower 01 - Weapon - Impact.png').read_bytes()
for name,width in [('steel-arrow.png',5),('arrow-15.png',5),('arrow-20.png',6),('arrow-25.png',7)]:
 arrow=Image.open(ROOT/'assets/shooting'/name).convert('RGBA')
 assert arrow.size==(8,40) and set(arrow.getchannel('A').getdata())<={0,255}
 assert arrow.getbbox()[2]-arrow.getbbox()[0]<=width
assert (ROOT/'assets/SpireClearDigits.ttf').read_bytes()==(REPO/'experiments/idle-bastion/assets/ui/fonts/SpireClearDigits.ttf').read_bytes()
print('Original attack/flight/impact strips, bounded steel arrow and clear digit font: pass')
