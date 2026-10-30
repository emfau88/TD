from pathlib import Path
import json,hashlib
from PIL import Image
root=Path(__file__).resolve().parent
repo=root.parents[1];m=json.loads((root/'manifest.json').read_text())
for name,digest in m['originalHashes'].items():assert hashlib.sha256((repo/'public/assets'/name).read_bytes()).hexdigest()==digest
for r in m['levels']:
 b=Image.open(root/r['base']).convert('RGBA');w=Image.open(root/r['weapon']).convert('RGBA');p=Image.open(root/r['projectile']).convert('RGBA')
 assert b.size==(64,128) and w.size==(96,96)
 bb,wb=b.getbbox(),w.getbbox();bottom=13+(bb[3]-102.4)*.63;top=min(13+(bb[1]-102.4)*.63,r['weaponY']+(wb[1]-48)*.63)
 assert bottom-top<=58 and (bb[2]-bb[0])*.63<=40.32
 assert (wb[2]-wb[0])*.63<=24 and r['weaponY']+(wb[3]-48)*.63<bottom
 assert set(b.getchannel('A').getdata())<={0,255} and set(w.getchannel('A').getdata())<={0,255}
 if r['level']>3:assert p.size==(48,48) and max(p.getbbox()[2]-p.getbbox()[0],p.getbbox()[3]-p.getbbox()[1])*.85<=24
 print('Level',r['level'],'height',round(bottom-top,2),'width',round((bb[2]-bb[0])*.63,2))
print('8 tiers valid; original hashes unchanged; no building growth; separated base / emitter / projectile.')
