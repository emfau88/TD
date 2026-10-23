"""Register only the enlarged hand from the imagegen edit, preserving the original skin."""
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
from scipy.ndimage import label, binary_dilation
import numpy as np, json, hashlib

P=Path(__file__).resolve().parent
B=P.parent
U=B.parent/'hip-v1/unity/Assets/HipHandSizeV2'
U.mkdir(parents=True,exist_ok=True)
old=Image.open(B/'preview/ilyra-hand-on-hip.png').convert('RGBA')
new=Image.open(P/'source/hand-size-generated.png').convert('RGBA')
assert old.size==new.size==(971,1619)
# Selection of the connected white glove, including its outline. No new pixels
# are painted here; all replacement pixels come from the targeted image edit.
def hand_mask(im):
    a=np.array(im).astype(int); rgb=a[:,:,:3]
    region=np.zeros(a.shape[:2],bool);region[925:1080,231:432]=True
    white=(rgb.min(2)>115)&((rgb.max(2)-rgb.min(2))<85)&region
    labels,n=label(white)
    seed=labels[990,280];assert seed>0
    component=labels==seed
    assert 9000<component.sum()<20000,component.sum()
    return component
a=hand_mask(old);b=hand_mask(new)
mask=Image.fromarray((binary_dilation(a|b,iterations=4)*255).astype('uint8')).filter(ImageFilter.GaussianBlur(.7))
out=Image.composite(new,old,mask)
out.save(U/'IlyraHipHandSize.png')
mask.save(P/'selection-mask.png')
d=np.any(np.array(old)!=np.array(out),axis=2);yy,xx=np.where(d)
report={'sourceSize':list(old.size),'beforeWhiteGlovePixels':int(a.sum()),'afterWhiteGlovePixels':int(b.sum()),'whiteGloveAreaRatio':float(b.sum()/a.sum()),'changedPixels':int(d.sum()),'differenceBounds':[int(xx.min()),int(yy.min()),int(xx.max()),int(yy.max())],'outsideSelectionIdentical':bool(np.all(np.array(old)[np.array(mask)==0]==np.array(out)[np.array(mask)==0]))}
assert xx.min()>220 and xx.max()<440 and yy.min()>915 and yy.max()<1090
(P/'source-checks.json').write_text(json.dumps(report,indent=2))
sheet=Image.new('RGB',(1000,500),'#e6e0d4');dr=ImageDraw.Draw(sheet)
for i,im in enumerate([old,out]):
    c=im.crop((200,900,450,1150)).resize((500,500));sheet.paste(c,(i*500,0),c)
    dr.text((10+i*500,10),'VORHER' if i==0 else 'NACHHER',fill='black')
sheet.save(P/'hand-detail.png')
preserve=[B/'preview/ilyra-hand-on-hip.png',B/'blink-v1/preview/Ilyra-Hueftpose-mit-Blinzeln.gif',B/'transition-v1/hand-fix/preview/Ilyra-Ruhe-zur-Huefte-Handkorrektur.gif']
assets=U.parent
preserve += [assets/'HipBaseV2/IlyraHipBase.png',assets/'HipBaseV2/IlyraHipBase.png.meta',assets/'HipBaseBlink/IlyraHandOnHipBlink.unity',assets/'HipBaseBlink/IlyraHandOnHipBlink.anim',assets/'HipBaseBlink/IlyraHandOnHipBlink.controller']
(P/'preserved-hashes.json').write_text(json.dumps({str(f.resolve()):hashlib.sha256(f.read_bytes()).hexdigest() for f in preserve},indent=2))
print(json.dumps(report))
