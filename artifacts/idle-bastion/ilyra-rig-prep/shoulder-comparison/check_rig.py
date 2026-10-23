"""Verify the bounded Unity re-export and package synchronized review media."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, hashlib
import numpy as np
R=Path(__file__).resolve().parent
P=R.parent
V=R/'preview'
v=json.loads((V/'validation.json').read_text())
old=json.loads((P/'preview/validation.json').read_text())
hashes=json.loads((R/'rig-baseline-hashes.json').read_text())
checks={k:v[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']}
checks['originalProjectAndPreviewUnchanged']=all(hashlib.sha256((P/f).read_bytes()).hexdigest()==h for f,h in hashes.items())
checks['sameJointPoses']=v['poses']==old['poses']
checks['sameRigCode']=all((P/'unity/Assets'/f).read_bytes()==(R/'unity/Assets'/f).read_bytes() for f in ['Editor/BuildIlyra.cs','IlyraJointTest.cs'])
a=np.array(Image.open(V/'joint-test/frame-00.png'))
b=np.array(Image.open(V/'joint-test/frame-24.png'))
rest=np.array(Image.open(R/'rest.png'))
checks['loopEndpointsExact']=np.array_equal(a,b)
checks['assemblyAlphaExact']=np.array_equal(a[:,:,3],rest[:,:,3])
checks['assemblyMeanRGBDifference']=float(np.abs(a[:,:,:3].astype(float)-rest[:,:,:3]).mean())
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',23)
frames=[]
contact=Image.new('RGB',(1250,900),'#e6e0d4')
for i in range(25):
 pair=Image.new('RGB',(768,680),'#e6e0d4')
 for side,base in enumerate([P/'preview',V]):
  im=Image.open(base/'joint-test'/f'frame-{i:02}.png').convert('RGBA')
  bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im)
  pair.paste(bg.resize((384,640),Image.Resampling.LANCZOS).convert('RGB'),(side*384,40))
  ImageDraw.Draw(pair).text((side*384+140,8),'Vorher' if side==0 else 'Nachher',font=font,fill='#243244')
  if side==1 and i in [0,3,6,15,18]:
   k=[0,3,6,15,18].index(i)
   # Upper arm/shoulder detail at rest, intermediates and both extremes.
   for arm,box in enumerate([(90,460,300,820),(468,460,678,820)]):
    crop=bg.crop(box).resize((245,420),Image.Resampling.LANCZOS)
    contact.paste(crop.convert('RGB'),(k*250,arm*450+30))
    ImageDraw.Draw(contact).text((k*250+5,arm*450+4),f'Pose {i} / '+('links' if arm==0 else 'rechts'),font=font,fill='#243244')
 frames.append(pair)
frames[0].save(V/'Ilyra-Schultervergleich.gif',save_all=True,append_images=frames[1:],duration=160,loop=0,optimize=False)
contact.save(V/'shoulder-extremes.jpg',quality=95)
(V/'rig-checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
assert checks['foldedTriangles']==0 and checks['samples']==25
assert all(checks[k] for k in ['originalProjectAndPreviewUnchanged','sameJointPoses','sameRigCode','loopEndpointsExact','assemblyAlphaExact'])
print(json.dumps(checks,indent=2))
