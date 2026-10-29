"""Prototype invariants: source preservation, bounded geometry, clear rear cores."""
from pathlib import Path
import hashlib,json,colorsys
from PIL import Image
R=Path(__file__).resolve().parent;REPO=R.parents[1];A=R/'assets'
m=json.loads((R/'manifest.json').read_text())
assert [r['level'] for r in m['levels']]==[1,2,3,5,10,15,20,25]
bounds=[]
for r in m['levels']:
 b=Image.open(R/r['base']).convert('RGBA');c=Image.open(R/r['crystal']).convert('RGBA')
 assert b.size==(64,192) and c.size==(64,64)
 for im in [b,c]:assert set(im.getchannel('A').getdata())<={0,255}
 bb=b.getbbox();cb=c.getbbox();assert bb[3]==192 and bb[0]>=0 and bb[2]<=64
 bodyTop=13+(bb[1]-166.4)*.63
 crystalTop=r['crystalY']+(cb[1]-32)*.63
 crystalBottom=r['crystalY']+(cb[3]-32)*.63+.9
 # Include every preserved source animation frame in the conservative envelope.
 if r.get('originalStage'):
  n=r['originalStage'];atlas=Image.open(A/f'original/level-{n}-attack.png').convert('RGBA');size=r['attackSize'];cols=r['attackCols']
  for f in r['frameMap']:
   assert (f//cols+1)*size<=atlas.height
   box=atlas.crop((f%cols*size,f//cols*size,(f%cols+1)*size,(f//cols+1)*size)).getbbox()
   assert box
   crystalTop=min(crystalTop,r['crystalY']+(box[1]-size/2)*.63)
   crystalBottom=max(crystalBottom,r['crystalY']+(box[3]-size/2)*.63)
 top=min(bodyTop,crystalTop);bottom=13+(192-166.4)*.63
 assert bottom-top<=92*.63+1e-5,(r['level'],bottom-top)
 bounds.append(dict(level=r['level'],top=top,coreBottom=crystalBottom,height=round(bottom-top,4)))
 if r['level']!=1:
  im=Image.open(R/r['projectile']).convert('RGBA');assert im.size==(32,32)
  assert set(im.getchannel('A').getdata())<={0,255}
 if r['level'] in [2,3,5,10]:
  for im in [b,c]:
   for red,green,blue,alpha in im.getdata():
    h,s,v=colorsys.rgb_to_hsv(red/255,green/255,blue/255)
    assert not(alpha and .055<h<.43 and s>.45 and v>.5),'Warm/green magic leaked into the cool tiers'
for n in [1,2,3]:
 original=Image.open(REPO/'public/assets/Tower 02.png').convert('RGBA').crop(((n-1)*64,0,n*64,192))
 assert original.tobytes()==Image.open(A/f'original/level-{n}-base.png').convert('RGBA').tobytes()
 for role,name in [('Weapon','attack'),('Projectile','projectile'),('Projectile - Impact','impact')]:
  assert (REPO/f'public/assets/Tower 02 - Level 0{n} - {role}.png').read_bytes()==(A/f'original/level-{n}-{name}.png').read_bytes()
for name,digest in m['hashes'].items():assert hashlib.sha256((A/name).read_bytes()).hexdigest()==digest,name
# Conservative bounding rectangles suffice: even source animation bounds clear the front silhouettes.
for rear in bounds:
 for front in bounds:assert rear['coreBottom']<40+front['top'],(rear,front)
wm=json.loads((R.parent/'waldwaechter-evolution/manifest.json').read_text())
for rear in bounds:
 for w in wm['levels']:
  bb=w['baseBox'];wb=w['weaponBox']
  top=min(13+(bb[1]-102.4)*.63,w['weaponY']+(wb[1]-48)*.63)
  assert rear['coreBottom']<40+top,(rear['level'],w['level'])
report=dict(result='pass',levels=8,frostPairs=64,mixedPairs=64,maxHeightWorld=92*.63,allRearCrystalsClear=True,originalAtlasesUnchanged=True,geometry=bounds)
(R/'geometry-check.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2))
