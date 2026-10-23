from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np,json,hashlib
P=Path(__file__).resolve().parent;V=P/'preview';base=P.parent
manifest={'width':768,'height':1280,'fps':30,'clips':{}};checks={}
for name,folder,count in [('touch',V,96),('idle',V/'idle',180)]:
    d=json.loads((folder/'validation.json').read_text())
    checks[name]={k:d[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']}
    a=np.array(Image.open(folder/'frames/frame-000.png'));b=np.array(Image.open(folder/'frames'/f'frame-{count:03}.png'))
    checks[name]['exactLoop']=bool(np.array_equal(a,b));assert checks[name]['exactLoop'] and d['foldedTriangles']==0
    c={'frames':count,'duration':count/30,'sheets':[]}
    for start in range(0,count,8):
        atlas=Image.new('RGBA',(3072,2560))
        for f in range(start,min(start+8,count)):
            atlas.paste(Image.open(folder/'frames'/f'frame-{f:03}.png'),((f-start)%4*768,(f-start)//4*1280))
        out=V/f'{name}-{start//8:02}.webp';atlas.save(out,lossless=True,method=1)
        a=np.array(atlas);b=np.array(Image.open(out).convert('RGBA'));a[a[:,:,3]==0,:3]=0;b[b[:,:,3]==0,:3]=0
        assert np.array_equal(a,b);c['sheets'].append(out.name)
    checks[name]['losslessRGBA']=True;manifest['clips'][name]=c
    print(name,checks[name],flush=True)

a=np.array(Image.open(V/'frames/frame-096.png')).astype(float);b=np.array(Image.open(V/'idle/frames/frame-000.png')).astype(float)
checks['returnMaxAlpha']=float(abs(a[:,:,3]-b[:,:,3]).max())
checks['returnMaxComposite']=max(float(abs(a[:,:,:3]*a[:,:,3:]/255+bg*(1-a[:,:,3:]/255)-b[:,:,:3]*b[:,:,3:]/255-bg*(1-b[:,:,3:]/255)).max()) for bg in [0,255])
assert checks['returnMaxAlpha']<=1 and checks['returnMaxComposite']<3
hashes=json.loads((P/'baseline-hashes.json').read_text(encoding='utf-8-sig'))
checks['previousFilesChanged']=[f for f,h in hashes.items() if hashlib.sha256((base/f).read_bytes()).hexdigest().upper()!=h]
assert not checks['previousFilesChanged']
def comp(im):
    bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);return bg.convert('RGB')
frames=[comp(Image.open(V/'frames'/f'frame-{round(i*1.5):03}.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS) for i in range(64)]
frames.append(comp(Image.open(V/'frames/frame-096.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS))
frames[0].save(V/'Ilyra-Beruehrung.gif',save_all=True,append_images=frames[1:],duration=[50]*64+[800],loop=0,optimize=False)
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22);poses=Image.new('RGB',(1536,676),'#e6e0d4')
for i,f in enumerate([0,12,30,66]):
    im=comp(Image.open(V/'frames'/f'frame-{f:03}.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS)
    poses.paste(im,(i*384,36));ImageDraw.Draw(poses).text((i*384+15,5),f'{f/30:.2f} s',font=font,fill='#24364a')
poses.save(V/'poses.jpg',quality=95)
checks['totalAtlasBytes']=sum((V/f).stat().st_size for c in manifest['clips'].values() for f in c['sheets'])
(V/'checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8');(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(checks,indent=2),flush=True)
