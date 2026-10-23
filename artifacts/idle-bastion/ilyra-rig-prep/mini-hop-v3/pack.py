from pathlib import Path
from PIL import Image
import json,hashlib,numpy as np
P=Path(__file__).resolve().parent;V=P/'preview';base=P.parent
check=json.loads((V/'validation.json').read_text(encoding='utf-8'));check={k:check[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']}
assert check['foldedTriangles']==0,check
count=96
first=np.array(Image.open(V/'frames/frame-000.png'));last=np.array(Image.open(V/'frames/frame-096.png'))
check['exactLoop']=bool(np.array_equal(first,last));assert check['exactLoop']
manifest={'width':768,'height':1280,'fps':30,'clips':{'hop':{'frames':count,'duration':3.2,'sheets':[]}}}
for start in range(0,count,8):
 atlas=Image.new('RGBA',(3072,2560))
 for f in range(start,min(start+8,count)):atlas.paste(Image.open(V/'frames'/f'frame-{f:03}.png'),((f-start)%4*768,(f-start)//4*1280))
 out=V/f'hop-{start//8:02}.webp';atlas.save(out,lossless=True,method=0)
 a=np.array(atlas);b=np.array(Image.open(out).convert('RGBA'));a[a[:,:,3]==0,:3]=0;b[b[:,:,3]==0,:3]=0;assert np.array_equal(a,b)
 manifest['clips']['hop']['sheets'].append(out.name)
check['losslessRGBA']=True
idle=json.loads((base/'hip-v1/preview/manifest.json').read_text(encoding='utf-8'))['clips']['idle'];idle['sheets']=['../../hip-v1/preview/'+s for s in idle['sheets']];manifest['clips']['idle']=idle
rest=np.array(Image.open(base/'hip-v1/preview/idle/frames/frame-000.png')).astype(float);a=last.astype(float)
check['returnMaxAlpha']=float(abs(a[:,:,3]-rest[:,:,3]).max());check['returnMaxComposite']=max(float(abs(a[:,:,:3]*a[:,:,3:]/255+bg*(1-a[:,:,3:]/255)-rest[:,:,:3]*rest[:,:,3:]/255-bg*(1-rest[:,:,3:]/255)).max()) for bg in [0,255]);assert check['returnMaxAlpha']<=1 and check['returnMaxComposite']<3
frames=[]
for i in range(65):
 f=min(count,round(i*1.5));im=Image.open(V/'frames'/f'frame-{f:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);frames.append(bg.convert('RGB').resize((384,640),Image.Resampling.LANCZOS))
frames[0].save(V/'Ilyra-Mini-Huepfer.gif',save_all=True,append_images=frames[1:],duration=[50]*64+[700],loop=0,optimize=False)
check['previousFilesChanged']=[f for f,h in json.loads((P/'baseline-hashes.json').read_text(encoding='utf-8')).items() if hashlib.sha256((base/f).read_bytes()).hexdigest()!=h];assert not check['previousFilesChanged'],check['previousFilesChanged']
check['newAtlasBytes']=sum((V/f).stat().st_size for f in manifest['clips']['hop']['sheets'])
(V/'checks.json').write_text(json.dumps(check,indent=2),encoding='utf-8');(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print(json.dumps(check,indent=2),flush=True)
