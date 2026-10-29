from pathlib import Path
import json,hashlib,math
from PIL import Image
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
m=json.loads((HERE/'manifest.json').read_text(encoding='utf-8'))
assert [r['level'] for r in m['levels']]==[1,2,3,5,10,15,20,25]
assert all(hashlib.sha256((ROOT/'public/assets'/n).read_bytes()).hexdigest()==v for n,v in m['originalHashes'].items())
results=[]
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
 # Physical idle weapon in every aim; new recoil included in the envelope.
 scale=r['weaponScale'];recoil=0 if r['level']<=3 else 2.2
 for a in range(360):
  rotated=w.rotate(a,Image.Resampling.NEAREST);box=rotated.getbbox()
  top=r['weaponY']+(box[1]-64)*scale-recoil
  floor=13+(128-102.4)*.63
  assert floor-top<=58,(r['level'],a,floor-top)
  assert r['weaponY']+(box[3]-64)*scale+recoil<=floor,(r['level'],a,'extends below footing')
 top=min(13+(b.getbbox()[1]-102.4)*.63,r['weaponY']+(w.getbbox()[1]-64)*scale)
 height=13+(128-102.4)*.63-top
 assert height<=58,(r['level'],height)
 results.append(dict(level=r['level'],restHeight=round(height,2),baseWidth=round((b.getbbox()[2]-b.getbbox()[0])*.63,2)))
print(json.dumps(dict(originalAtlases='unchanged',levels=results,idleWeaponAngles=2880),indent=2))
