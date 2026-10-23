from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np,json,hashlib,sys
P=Path(__file__).resolve().parent;V=P/'preview'
groups=[('original',V,84),('balanced',V/'balanced-arms',84),('idle',V/'balanced-arms/idle',180)]
checks={};manifest={'width':768,'height':1280,'fps':30,'perSheet':8,'columns':4,'clips':{}}
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',23)
def composite(im):
 bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);return bg.convert('RGB')
for name,base,count in groups:
 data=json.loads((base/'validation.json').read_text(encoding='utf-8'))
 first=np.array(Image.open(base/'frames/frame-000.png'));last=np.array(Image.open(base/'frames'/f'frame-{count:03}.png'))
 check={k:data[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']};check['endpointsExact']=np.array_equal(first,last)
 clip={'frames':count,'duration':count/30,'sheets':[]};exact=True
 for start in range(0,count,8):
  atlas=Image.new('RGBA',(3072,2560));originals=[]
  for f in range(start,min(count,start+8)):
   im=Image.open(base/'frames'/f'frame-{f:03}.png').convert('RGBA');originals.append(im);atlas.paste(im,((f-start)%4*768,(f-start)//4*1280))
  out=V/f'{name}-{start//8:02}.webp'
  if '--verify-existing' not in sys.argv:atlas.save(out,lossless=True,method=2)
  decoded=Image.open(out).convert('RGBA')
  for i,im in enumerate(originals):
   a=np.array(im);b=np.array(decoded.crop((i%4*768,i//4*1280,(i%4+1)*768,(i//4+1)*1280)));a[a[:,:,3]==0,:3]=0;b[b[:,:,3]==0,:3]=0;exact &= np.array_equal(a,b)
  clip['sheets'].append(out.name)
 check['visibleRGBAExact']=bool(exact);checks[name]=check;manifest['clips'][name]=clip
 print(name,check,flush=True)
 assert check['endpointsExact'] and exact and check['foldedTriangles']==0
originalIdle=P.parent/'idle-v1/preview/frames/frame-000.png'
checks['originalJoinsApprovedIdle']=np.array_equal(np.array(Image.open(originalIdle)),np.array(Image.open(V/'frames/frame-000.png')))
checks['balancedHeadJoinsBalancedIdle']=np.array_equal(np.array(Image.open(V/'balanced-arms/frames/frame-084.png')),np.array(Image.open(V/'balanced-arms/idle/frames/frame-000.png')))
a=np.array(Image.open(V/'balanced-arms/frames/frame-084.png')).astype(float);b=np.array(Image.open(V/'balanced-arms/idle/frames/frame-000.png')).astype(float)
visual=[]
for bg in [0,255]:
 ca=a[:,:,:3]*a[:,:,3:]/255+bg*(1-a[:,:,3:]/255);cb=b[:,:,:3]*b[:,:,3:]/255+bg*(1-b[:,:,3:]/255);visual.append(float(np.abs(ca-cb).max()))
ja=json.loads((V/'balanced-arms/validation.json').read_text(encoding='utf-8'))['poses'][0]['joints'];jb=json.loads((V/'balanced-arms/idle/validation.json').read_text(encoding='utf-8'))['poses'][0]['joints']
delta=max(abs(a[k]-b[k]) for a,b in zip(ja,jb) for k in ['x','y','endX','endY'])
checks['returnRounding']={'maxJointDifferencePixels':delta,'maxAlphaDifference':float(np.abs(a[:,:,3]-b[:,:,3]).max()),'maxCompositedRGBDifference':max(visual),'changedPixels':int(np.any(a!=b,axis=2).sum())}
checks['balancedReturnWithinRounding']=delta<.001 and checks['returnRounding']['maxAlphaDifference']<=1 and max(visual)<3
hashes=json.loads((P/'baseline-hashes.json').read_text(encoding='utf-8'));checks['approvedIdleUnchanged']=all(hashlib.sha256((P.parent/f).read_bytes()).hexdigest()==h for f,h in hashes.items())
checks['armProportions']={}
for name,folder in [('before',V),('after',V/'balanced-arms')]:
 joints=json.loads((folder/'validation.json').read_text(encoding='utf-8'))['poses'][0]['joints']
 def dist(a,b):return float(np.hypot(joints[a]['x']-joints[b]['x'],joints[a]['y']-joints[b]['y']))
 checks['armProportions'][name]={'upperLeft':dist(4,5),'forearmLeft':dist(5,6),'wristLeftY':joints[6]['y'],'wristRightY':joints[9]['y'],'handLength':float(np.hypot(joints[6]['endX']-joints[6]['x'],joints[6]['endY']-joints[6]['y']))}
checks['totalAtlasBytes']=sum((V/f).stat().st_size for c in manifest['clips'].values() for f in c['sheets'])
gif=[]
for f in range(56):
 im=Image.open(V/'balanced-arms/frames'/f'frame-{round(f*1.5):03}.png').convert('RGBA');gif.append(composite(im).resize((384,640),Image.Resampling.LANCZOS))
gif.append(composite(Image.open(V/'balanced-arms/frames/frame-084.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS))
gif[0].save(V/'Ilyra-Kopfreaktion.gif',save_all=True,append_images=gif[1:],duration=[50]*56+[700],loop=0,optimize=False)
pair=Image.new('RGB',(768,680),'#e6e0d4')
for i,base in enumerate([V,V/'balanced-arms']):
 im=composite(Image.open(base/'frames/frame-000.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS);pair.paste(im,(i*384,40));ImageDraw.Draw(pair).text((i*384+20,8),'Bisher' if i==0 else 'Kürzere Arme',font=font,fill='#24364a')
pair.save(V/'arm-comparison.jpg',quality=95)
poses=Image.new('RGB',(384*4,680),'#e6e0d4')
for i,f in enumerate([0,18,30,60]):
 im=composite(Image.open(V/'balanced-arms/frames'/f'frame-{f:03}.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS);poses.paste(im,(i*384,40));ImageDraw.Draw(poses).text((i*384+20,8),f'{f/30:.2f} s',font=font,fill='#24364a')
poses.save(V/'poses.jpg',quality=95)
(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');(V/'checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
assert all(checks[k] for k in ['originalJoinsApprovedIdle','balancedReturnWithinRounding','approvedIdleUnchanged'])
print(json.dumps(checks,indent=2))
