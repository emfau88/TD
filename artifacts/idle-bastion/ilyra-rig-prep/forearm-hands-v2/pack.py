from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, hashlib, math
import numpy as np

P=Path(__file__).resolve().parent; V=P/'preview'; OLD=P.parent/'head-reaction-v1'
manifest={'fps':30,'width':768,'height':1280,'clips':{}}
checks={}
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',24)
def composite(im):
    bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);return bg.convert('RGB')
for name,count in [('head',84),('idle',180)]:
    folder=V/name
    data=json.loads((folder/'validation.json').read_text())
    first=np.array(Image.open(folder/'frames/frame-000.png'))
    last=np.array(Image.open(folder/'frames'/f'frame-{count:03}.png'))
    checks[name]={k:data[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']}
    checks[name]['exactLoop']=bool(np.array_equal(first,last))
    assert checks[name]['exactLoop'] and data['foldedTriangles']==0
    sheets=[]
    for start in range(0,count,8):
        atlas=Image.new('RGBA',(3072,2560))
        for i in range(start,min(start+8,count)):
            atlas.paste(Image.open(folder/'frames'/f'frame-{i:03}.png'),((i-start)%4*768,(i-start)//4*1280))
        out=V/f'{name}-{start//8:02}.webp';atlas.save(out,lossless=True,method=2)
        a=np.array(atlas);b=np.array(Image.open(out).convert('RGBA'))
        a[a[:,:,3]==0,:3]=0;b[b[:,:,3]==0,:3]=0
        assert np.array_equal(a,b)
        sheets.append(out.name)
    checks[name]['losslessRGBA']=True
    manifest['clips'][name]={'frames':count,'duration':count/30,'sheets':sheets}
    print(name,checks[name],flush=True)

oldData=json.loads((OLD/'preview/balanced-arms/validation.json').read_text())
newData=json.loads((V/'head/validation.json').read_text())
def lengths(data):
    j=data['poses'][0]['joints']
    def d(a,b):return math.hypot(j[a]['x']-j[b]['x'],j[a]['y']-j[b]['y'])
    return {'upper':d(4,5),'forearm':d(5,6),'hand':math.hypot(j[6]['endX']-j[6]['x'],j[6]['endY']-j[6]['y']),'elbow':[j[5]['x'],j[5]['y']],'wristY':j[6]['y'],'fingerEndY':j[6]['endY']}
checks['proportions']={'before':lengths(oldData),'after':lengths(newData)}
checks['elbowAnchorDelta']=max(abs(a-b) for a,b in zip(checks['proportions']['before']['elbow'],checks['proportions']['after']['elbow']))
assert checks['elbowAnchorDelta']<.001
hashes=json.loads((P/'baseline-hashes.json').read_text(encoding='utf-8-sig'))
changed=[f for f,h in hashes.items() if hashlib.sha256((OLD/f).read_bytes()).hexdigest().upper()!=h]
checks['previousFilesChanged']=changed
assert not changed,changed

a=np.array(Image.open(V/'head/frames/frame-084.png')).astype(float)
b=np.array(Image.open(V/'idle/frames/frame-000.png')).astype(float)
checks['returnMaxAlpha']=float(abs(a[:,:,3]-b[:,:,3]).max())
checks['returnMaxComposite']=max(float(abs(a[:,:,:3]*a[:,:,3:]/255+bg*(1-a[:,:,3:]/255)-b[:,:,:3]*b[:,:,3:]/255-bg*(1-b[:,:,3:]/255)).max()) for bg in [0,255])
assert checks['returnMaxAlpha']<=1 and checks['returnMaxComposite']<3

def pair(frame):
    img=Image.new('RGB',(768,680),'#e6e0d4')
    for i,base in enumerate([OLD/'preview/balanced-arms',V/'head']):
        im=composite(Image.open(base/'frames'/f'frame-{frame:03}.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS)
        img.paste(im,(i*384,40));ImageDraw.Draw(img).text((i*384+14,8),'Vorher' if i==0 else 'Unterarme + Hände angepasst',font=font,fill='#24364a')
    return img
pair(0).save(V/'comparison.jpg',quality=95)
gif=[pair(round(i*1.5)) for i in range(56)]+[pair(84)]
gif[0].save(V/'Vergleich-Kopfreaktion.gif',save_all=True,append_images=gif[1:],duration=[50]*56+[900],loop=0,optimize=False)
details=Image.new('RGB',(1200,720),'#e6e0d4')
for k,f in enumerate([0,18,30,60]):
    im=composite(Image.open(V/'head/frames'/f'frame-{f:03}.png').convert('RGBA'))
    details.paste(im.crop((95,730,295,1210)).resize((300,720)),(k*300,0))
details.save(V/'joint-details.jpg',quality=95)
(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(V/'checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print(json.dumps(checks,indent=2),flush=True)
