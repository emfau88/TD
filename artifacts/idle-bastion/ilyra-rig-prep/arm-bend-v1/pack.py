from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,numpy as np
P=Path(__file__).resolve().parent;V=P/'preview';B=P.parent;(V/'crops').mkdir(exist_ok=True)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',21);small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
checks={};box=(90,620,530,1070)
def composite(im):
 bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im.convert('RGBA'));return bg.convert('RGB')
for name in ['before','after']:
 d=json.loads((V/name/'validation.json').read_text(encoding='utf-8'));checks[name]={k:d[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio']}
 for angle in range(91):
  im=Image.open(V/name/'frames'/f'frame-{angle:03}.png').convert('RGBA').crop(box);out=V/'crops'/f'{name}-{angle:03}.webp';im.save(out,lossless=True,method=1)
  a=np.array(im);b=np.array(Image.open(out).convert('RGBA'));a[a[:,:,3]==0,:3]=0;b[b[:,:,3]==0,:3]=0;assert np.array_equal(a,b)
 checks[name]['cropLossless']=True
assert checks['after']['foldedTriangles']==0,checks['after']
a=np.array(Image.open(V/'before/frames/frame-000.png')).astype(float);b=np.array(Image.open(V/'after/frames/frame-000.png')).astype(float)
checks['neutralMaxAlphaDifference']=float(abs(a[:,:,3]-b[:,:,3]).max());checks['neutralCompositeMAE']=float(abs(a[:,:,:3]*a[:,:,3:]/255-b[:,:,:3]*b[:,:,3:]/255).mean());checks['neutralChangedPixels']=int(np.any(a!=b,axis=2).sum())
ref=np.array(Image.open(V/'after/frames/frame-000.png'));outside=np.ones(ref.shape[:2],dtype=bool);outside[650:1160,85:560]=False;stationary=0
for angle in range(91):
 ar=np.array(Image.open(V/'after/frames'/f'frame-{angle:03}.png'));stationary=max(stationary,int(np.any(ar[outside]!=ref[outside],axis=1).sum()))
checks['changedPixelsOutsideArmArea']=stationary;assert stationary==0
sheet=Image.new('RGB',(1040,330),'#e6e0d4');draw=ImageDraw.Draw(sheet)
for j,a in enumerate([0,30,60,90]):
 draw.text((j*260+10,7),str(a)+'°',font=font,fill='#1a2b3e');im=composite(Image.open(V/'crops'/f'after-{a:03}.webp')).resize((260,266),Image.Resampling.LANCZOS);sheet.paste(im,(j*260,38))
draw.text((10,306),'Überarbeiteter Arm · zusätzliche Beugung ab Ruhepose',font=small,fill='#1a2b3e');sheet.save(V/'Winkelvergleich.png')
frames=[];angles=list(range(0,91,3))+list(range(87,-1,-3))
for a in angles:
 sheet=Image.new('RGB',(640,390),'#e6e0d4');draw=ImageDraw.Draw(sheet)
 for j,(name,label) in enumerate([('before','Bisher'),('after','Neue Armgrundlage')]):
  draw.text((j*320+10,7),label,font=font,fill='#1a2b3e');im=composite(Image.open(V/'crops'/f'{name}-{a:03}.webp')).resize((320,327),Image.Resampling.LANCZOS);sheet.paste(im,(j*320,37))
 draw.text((10,365),f'{a}° Beugung ab Ruhepose',font=small,fill='#1a2b3e');frames.append(sheet)
durations=[80]*len(frames);durations[0]=500;durations[30]=700;durations[-1]=500
frames[0].save(V/'Ilyra-Armbeuge.gif',save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=False)
hashes=json.loads((P/'baseline-hashes.json').read_text(encoding='utf-8'));checks['previousFilesChanged']=[f for f,h in hashes.items() if hashlib.sha256((B/f).read_bytes()).hexdigest()!=h];assert not checks['previousFilesChanged']
checks['cropBytes']=sum(f.stat().st_size for f in (V/'crops').glob('*.webp'));(V/'checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8');print(json.dumps(checks,indent=2))
