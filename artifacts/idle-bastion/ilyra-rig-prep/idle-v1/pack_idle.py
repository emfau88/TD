"""Lossless WebP atlases from Unity PNGs, compact GIF and targeted audit."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np
import hashlib,json,sys
P=Path(__file__).resolve().parent;V=P/'preview';F=V/'frames'
data=json.loads((V/'validation.json').read_text())
report={k:data[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']}
baseline=json.loads((P/'baseline-hashes.json').read_text())
report['previousShoulderVariantUnchanged']=all(hashlib.sha256((P.parent/f).read_bytes()).hexdigest()==h for f,h in baseline.items())
first=np.array(Image.open(F/'frame-000.png'));last=np.array(Image.open(F/'frame-180.png'))
report['loopEndpointsExact']=np.array_equal(first,last)
report['blinkOutsideEyePatchesExact']=True
original=np.array(Image.open(P.parent/'art/head-jaw-source.png'))
for state in ['half','closed']:
 edited=np.array(Image.open(P/'art'/f'head-{state}-registered.png'))
 difference=np.any(original!=edited,axis=2);yy,xx=np.where(difference)
 report['blink'+state.title()+'ChangedBounds']=[int(xx.min()),int(yy.min()),int(xx.max()+1),int(yy.max()+1)]
 report['blinkOutsideEyePatchesExact'] &= bool(not difference[:542].any() and not difference[698:].any() and not difference[:,560:695].any())
manifest=dict(width=768,height=1280,fps=30,frames=180,duration=6,columns=4,rows=2,perSheet=8,sheets=[])
exact=True
for start in range(0,180,8):
 atlas=Image.new('RGBA',(768*4,1280*2));ims=[]
 for i in range(start,min(start+8,180)):
  im=Image.open(F/f'frame-{i:03}.png').convert('RGBA');ims.append(im)
  atlas.paste(im,((i-start)%4*768,(i-start)//4*1280))
 name=f'idle-{start//8:02}.webp'
 if '--verify-existing' not in sys.argv:atlas.save(V/name,lossless=True,method=4)
 decoded=Image.open(V/name).convert('RGBA')
 for i,im in enumerate(ims):
  actual=np.array(decoded.crop((i%4*768,i//4*1280,(i%4+1)*768,(i//4+1)*1280)))
  expected=np.array(im)
  # RGB under alpha zero has no visual meaning; Unity exports it as zero.
  # libwebp may change hidden RGB under fully transparent pixels only.
  actual[actual[:,:,3]==0,:3]=0;expected[expected[:,:,3]==0,:3]=0
  exact &= np.array_equal(actual,expected)
 manifest['sheets'].append(dict(file=name,first=start,count=len(ims),bytes=(V/name).stat().st_size))
 print(name,flush=True)
report['atlasVisibleRGBAExact']=bool(exact);report['webpTotalBytes']=sum(s['bytes'] for s in manifest['sheets'])
report['webpHiddenRGBNote']='Fully transparent RGB is normalized for comparison; alpha and all visible RGB must match exactly.'
(V/'manifest.json').write_text(json.dumps(manifest,indent=2))
gif=[]
for f in range(120):
 im=Image.open(F/f'frame-{round(f*1.5):03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im)
 gif.append(bg.resize((384,640),Image.Resampling.LANCZOS).convert('RGB'))
gif[0].save(V/'Ilyra-Idle.gif',save_all=True,append_images=gif[1:],duration=50,loop=0,optimize=False)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
samples=[0,35,61,85,87,90,110,145]
sheet=Image.new('RGB',(4*384,2*680),'#e6e0d4')
for j,f in enumerate(samples):
 im=Image.open(F/f'frame-{f:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im)
 x=j%4*384;y=j//4*680;sheet.paste(bg.resize((384,640),Image.Resampling.LANCZOS).convert('RGB'),(x,y+40));ImageDraw.Draw(sheet).text((x+12,y+8),f'{f/30:.2f} s',font=font,fill='#1d3349')
sheet.save(V/'poses.jpg',quality=94)
(V/'checks.json').write_text(json.dumps(report,indent=2))
assert report['samples']==181 and report['foldedTriangles']==0
assert all(report[k] for k in ['previousShoulderVariantUnchanged','loopEndpointsExact','blinkOutsideEyePatchesExact','atlasVisibleRGBAExact'])
print(json.dumps(report,indent=2))
