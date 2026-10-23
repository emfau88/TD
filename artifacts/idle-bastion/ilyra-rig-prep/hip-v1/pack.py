from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import numpy as np,json,hashlib
from concurrent.futures import ThreadPoolExecutor
P=Path(__file__).resolve().parent;V=P/'preview';base=P.parent
manifest={'width':768,'height':1280,'fps':30,'clips':{}};checks={}
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',19)
def comp(im):
    bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);return bg.convert('RGB')
def pack(group):
    name,count=group;folder=V/name
    d=json.loads((folder/'validation.json').read_text(encoding='utf-8'));check={k:d[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']}
    a=np.array(Image.open(folder/'frames/frame-000.png'));b=np.array(Image.open(folder/'frames'/f'frame-{count:03}.png'))
    check['exactLoop']=bool(np.array_equal(a,b));assert check['exactLoop'] and d['foldedTriangles']==0,(name,check)
    c={'frames':count,'duration':count/30,'sheets':[]}
    for start in range(0,count,8):
        atlas=Image.new('RGBA',(3072,2560))
        for f in range(start,min(start+8,count)):atlas.paste(Image.open(folder/'frames'/f'frame-{f:03}.png'),((f-start)%4*768,(f-start)//4*1280))
        out=V/f'{name}-{start//8:02}.webp';atlas.save(out,lossless=True,method=0)
        a=np.array(atlas);b=np.array(Image.open(out).convert('RGBA'));a[a[:,:,3]==0,:3]=0;b[b[:,:,3]==0,:3]=0;assert np.array_equal(a,b)
        c['sheets'].append(out.name)
    check['losslessRGBA']=True
    if name!='idle':
        frames=[comp(Image.open(folder/'frames'/f'frame-{round(i*1.5):03}.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS) for i in range(100)]
        frames.append(comp(Image.open(folder/'frames/frame-150.png').convert('RGBA')).resize((384,640),Image.Resampling.LANCZOS))
        frames[0].save(V/f'Ilyra-Huefte-{name}.gif',save_all=True,append_images=frames[1:],duration=[50]*100+[700],loop=0,optimize=False)
    print(name,check,flush=True);return name,c,check
with ThreadPoolExecutor(max_workers=3) as pool:
    for name,c,check in pool.map(pack,[('left',150),('right',150),('both',150),('idle',180)]):manifest['clips'][name]=c;checks[name]=check
rest=np.array(Image.open(V/'idle/frames/frame-000.png')).astype(float)
for name in ['left','right','both']:
    a=np.array(Image.open(V/name/'frames/frame-150.png')).astype(float);check=checks[name]
    check['returnMaxAlpha']=float(abs(a[:,:,3]-rest[:,:,3]).max());check['returnMaxComposite']=max(float(abs(a[:,:,:3]*a[:,:,3:]/255+bg*(1-a[:,:,3:]/255)-rest[:,:,:3]*rest[:,:,3:]/255-bg*(1-rest[:,:,3:]/255)).max()) for bg in [0,255])
    assert check['returnMaxAlpha']<=1 and check['returnMaxComposite']<3
hashes=json.loads((P/'baseline-hashes.json').read_text(encoding='utf-8-sig'));checks['previousFilesChanged']=[f for f,h in hashes.items() if hashlib.sha256((base/f).read_bytes()).hexdigest().upper()!=h];assert not checks['previousFilesChanged']
frames=[]
for i in range(101):
    f=min(150,round(i*1.5));sheet=Image.new('RGB',(960,569),'#e6e0d4');draw=ImageDraw.Draw(sheet)
    for j,(name,label) in enumerate([('left','Hand links im Bild'),('right','Hand rechts im Bild'),('both','Beide Hände')]):
        im=comp(Image.open(V/name/'frames'/f'frame-{f:03}.png').convert('RGBA')).resize((320,533),Image.Resampling.LANCZOS);sheet.paste(im,(j*320,36));draw.text((j*320+12,7),label,font=font,fill='#24364a')
    frames.append(sheet)
frames[0].save(V/'Ilyra-Huefte-Vergleich.gif',save_all=True,append_images=frames[1:],duration=[50]*100+[700],loop=0,optimize=False)
frames[40].save(V/'Kontaktposen.png')
checks['totalAtlasBytes']=sum((V/f).stat().st_size for c in manifest['clips'].values() for f in c['sheets'])
(V/'checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8');(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print(json.dumps(checks,indent=2),flush=True)
