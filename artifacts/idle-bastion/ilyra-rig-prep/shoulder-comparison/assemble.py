"""Register the Imagegen shoulder edit while retaining all approved other pixels.

This only assembles the static artwork revision. It does not repaint animation
frames, change motion, or deform the old bitmap to simulate new anatomy.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np
import hashlib,json,shutil
R=Path(__file__).resolve().parent
P=R.parent
original=P/'art/torso-continuous-source.png'
old=np.array(Image.open(original).convert('RGBA'))
new=np.array(Image.open(R/'torso-source.png').convert('RGBA'))
assert old.shape==new.shape==(1536,1024,4)
# Static edit-region selection follows the inner arm edge; central costume,
# neck, clasps and lower arms are retained from the existing source layer.
yy,xx=np.indices(old.shape[:2],dtype=float)
edge=np.interp(yy,[240,270,380,440,500,620,700,770,820],[235,237,245,240,231,252,222,206,198])
def smooth(v):
 v=np.clip(v,0,1);return v*v*(3-2*v)
left=smooth((edge-xx)/12)
right=smooth((xx-(1024-edge))/12)
mask=np.maximum(left,right)*smooth((yy-250)/25)*(1-smooth((yy-760)/65))
mix=mask[:,:,None]
# Blend in premultiplied alpha only at the static edit boundary, avoiding
# matte colors from transparent pixels. All pixels outside it remain exact.
a=old.astype(float)/255;b=new.astype(float)/255
alpha=a[:,:,3:4]*(1-mix)+b[:,:,3:4]*mix
premul=a[:,:,:3]*a[:,:,3:4]*(1-mix)+b[:,:,:3]*b[:,:,3:4]*mix
rgb=np.divide(premul,alpha,out=np.zeros_like(premul),where=alpha>0)
result=np.rint(np.concatenate([rgb,alpha],axis=2)*255).clip(0,255).astype('uint8')
result[mask==0]=old[mask==0]
Image.fromarray(result).save(R/'torso-selected.png')
Image.fromarray(np.rint(mask*255).astype('uint8')).save(R/'edit-region.png')
baseline={str(f.relative_to(P)):hashlib.sha256(f.read_bytes()).hexdigest() for f in [P/'preview/rest.png',P/'Ilyra.psb',P/'art/torso-continuous-source.png',*list((P/'layers').glob('*.png'))]}
# Reuse the exact original registration and PSB packing in an isolated output.
source=(P/'prepare.py').read_text(encoding='utf-8')
source=source.replace("P=Path(__file__).resolve().parent", "P=Path(__file__).resolve().parent.parent\nR=Path(__file__).resolve().parent")
source=source.replace("OUT=P/'layers'", "OUT=R/'layers'").replace("PRE=P/'preview'", "PRE=R")
source=source.replace("P/'art/torso-continuous-source.png'", "R/'torso-selected.png'")
source=source.replace("P/'art/assembly.json'", "R/'assembly.json'").replace("P/'Ilyra.psb'", "R/'Ilyra.psb'")
exec(compile(source,str(P/'prepare.py'),'exec'),{'__file__':str(R/'assemble.py')})
shutil.copy2(P/'preview/rest-light.png',R/'before.png')
shutil.copy2(R/'rest-light.png',R/'after.png')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',30)
compare=Image.new('RGB',(1100,920),'#e6e0d4');draw=ImageDraw.Draw(compare)
for i,(file,label) in enumerate([('before.png','Vorher'),('after.png','Nachher')]):
 im=Image.open(R/file).crop((80,140,688,1000));im.thumbnail((530,840),Image.Resampling.LANCZOS)
 compare.paste(im,(i*550+(550-im.width)//2,70));draw.text((i*550+24,20),label,font=font,fill='#172537')
compare.save(R/'comparison.png')
after=np.array(Image.open(R/'rest.png'));before=np.array(Image.open(P/'preview/rest.png'))
delta=np.any(after!=before,axis=2);ys,xs=np.where(delta)
report={'sourceOutsideEditRegionExact':bool(np.array_equal(result[mask==0],old[mask==0])),
 'fullFigureChangedBounds':[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)],
 'unchangedOtherLayers':all(hashlib.sha256((P/'layers'/f.name).read_bytes()).hexdigest()==hashlib.sha256(f.read_bytes()).hexdigest() for f in (R/'layers').glob('*.png') if f.stem!='TorsoArmsHands'),
 'originalFilesUnchanged':all(hashlib.sha256((P/f).read_bytes()).hexdigest()==h for f,h in baseline.items()),
 'baselineHashes':baseline,'newRigTestPerformed':False}
(R/'checks.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print({k:v for k,v in report.items() if k!='baselineHashes'})
