from pathlib import Path
import json,hashlib,math
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
m=json.loads((HERE/'manifest.json').read_text(encoding='utf-8'))
assert [r['level'] for r in m['levels']]==[1,2,3,5,10,15,20,25]
assert all(hashlib.sha256((ROOT/'public/assets'/n).read_bytes()).hexdigest()==v for n,v in m['originalHashes'].items())
results=[];poses=0
for r in m['levels']:
 b=Image.open(HERE/r['base']).convert('RGBA');w=Image.open(HERE/r['weapon']).convert('RGBA');p=Image.open(HERE/r['projectile']).convert('RGBA')
 assert b.size==(64,128) and w.size==(128,128)
 assert b.getbbox()[3]==128
 assert set(b.getchannel('A').getdata())<={0,255}
 assert set(w.getchannel('A').getdata())<={0,255}
 assert b.getbbox()[1]>=36
 if r['level']<=3:
  original=Image.open(ROOT/'public/assets'/f"Tower 04 - Level 0{r['level']} - Weapon.png").convert('RGBA').crop((0,0,128,128))
  assert original.tobytes()==w.tobytes(),'original weapon pixels changed'
 else:
  assert len(set(b.getdata()))<=33 and len(set(w.getdata()))<=33
  assert p.getbbox()[2]-p.getbbox()[0]<=16
 # Compact masonry stays <=58. Original arms may overhang the roof; checking only
 # the idle frame previously missed the released projectile in attack frame 5.
 scale=r['weaponScale'];recoil=0 if r['level']<=3 else 2.2
 floor=13+(128-102.4)*.63
 assert (128-b.getbbox()[1])*.63<=58
 frames=[w]
 if r['level']<=3:
  roof=102.4+(r['weaponY']-13)/.63
  assert 64<=roof<=66,(r['level'],'hinge must sit in the roof centre',roof)
  atlas=Image.open(ROOT/'public/assets'/f"Tower 04 - Level 0{r['level']} - Weapon.png").convert('RGBA')
  frames=[atlas.crop((i*128,0,(i+1)*128,128)) for i in range(17)]
 max_height=0
 for frame,sprite in enumerate(frames):
  for a in range(360):
   rotated=sprite.rotate(a,Image.Resampling.NEAREST);box=rotated.getbbox()
   top=r['weaponY']+(box[1]-64)*scale-recoil
   max_height=max(max_height,floor-top);poses+=1
   limit=(68 if frame==0 else 74) if r['level']<=3 else 58
   assert floor-top<=limit,(r['level'],frame,a,floor-top)
   assert r['weaponY']+(box[3]-64)*scale+recoil<=floor,(r['level'],frame,a,'extends below footing')
 top=min(13+(b.getbbox()[1]-102.4)*.63,r['weaponY']+(w.getbbox()[1]-64)*scale)
 height=13+(128-102.4)*.63-top
 assert height<=58,(r['level'],height)
 results.append(dict(level=r['level'],restHeight=round(height,2),maxRotatedFrameHeight=round(max_height,2),baseWidth=round((b.getbbox()[2]-b.getbbox()[0])*.63,2)))
print(json.dumps(dict(originalAtlases='unchanged',levels=results,weaponFrameAngles=poses),indent=2))
