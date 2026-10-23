"""Build the layer overview and verify the exported preparation package."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib,zipfile
import numpy as np
P=Path(__file__).resolve().parent
data=json.loads((P/'art/assembly.json').read_text())
names=data['backToFront']
labels=['Umhang','Hinteres Haar','Oberschenkel bildlinks','Oberschenkel bildrechts','Hüfte / Unterlage','Rockbahn bildlinks','Rockbahn bildrechts','Mittlere Stoffbahn','Oberkörper / Arme / Hände','Kopf / Grundgesicht','Haarsträhne bildlinks','Haarsträhne bildrechts','Vorderhaar / Brille']
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',21)
sheet=Image.new('RGB',(1200,1400),'#18202a');draw=ImageDraw.Draw(sheet)
for i,(name,label) in enumerate(zip(names,labels)):
    x=(i%4)*300;y=(i//4)*350
    im=Image.open(P/'layers'/f'{name}.png');im=im.crop(im.getbbox());im.thumbnail((260,290),Image.Resampling.LANCZOS)
    tile=Image.new('RGBA',(280,302),'#e6e0d4');tile.alpha_composite(im,((280-im.width)//2,(302-im.height)//2))
    sheet.paste(tile.convert('RGB'),(x+10,y+10));draw.text((x+12,y+321),label,font=font,fill='#e5edf7')
sheet.save(P/'preview/layers.jpg',quality=93)
# Keep preliminary exported parts outside the active layer directory.
obsolete=[f for f in (P/'layers').glob('*.png') if f.stem not in names]
archive=P/'art/first-assembly-layers'
if obsolete:
    archive.mkdir(exist_ok=True)
    for f in obsolete:
        target=archive/f.name
        if not target.exists():f.rename(target)
checks={'layers':len(names),'canvas':data['canvas'],'psbSignature':(P/'Ilyra.psb').read_bytes()[:6].hex()}
composite=Image.new('RGBA',tuple(data['canvas']))
for n in names:composite.alpha_composite(Image.open(P/'layers'/f'{n}.png'))
checks['layerCompositeExact']=np.array_equal(np.array(composite),np.array(Image.open(P/'preview/rest.png')))
validation=P/'preview/validation.json'
if validation.exists():
    v=json.loads(validation.read_text());checks['unity']={k:v[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio','minLayer']}
    a=np.array(Image.open(P/'preview/joint-test/frame-00.png'));b=np.array(Image.open(P/'preview/joint-test/frame-24.png'))
    checks['jointTestEndMatchesStart']=np.array_equal(a,b)
    base=np.array(Image.open(P/'preview/rest.png'))
    checks['unityVsAssemblyMaxAlphaDifference']=int(np.abs(a[:,:,3].astype(int)-base[:,:,3]).max())
    checks['unityVsAssemblyMeanAbsRGBDifference']=float(np.abs(a[:,:,:3].astype(float)-base[:,:,:3]).mean())
    imgs=[]
    for f in sorted((P/'preview/joint-test').glob('frame-*.png')):
        im=Image.open(f).convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im)
        bg=bg.resize((384,640),Image.Resampling.LANCZOS).convert('RGB');imgs.append(bg)
    imgs[0].save(P/'preview/Ilyra-Gelenkprobe.gif',save_all=True,append_images=imgs[1:],duration=160,loop=0,optimize=False)
(P/'preview/package-checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print(json.dumps(checks,indent=2))
if '--zip' in __import__('sys').argv:
    roots=['art','layers','preview','unity/Assets','unity/Packages','unity/ProjectSettings']
    files=[f for root in roots for f in (P/root).rglob('*') if f.is_file()]
    files += [P/f for f in ['Ilyra.psb','rig-map.json','prepare.py','setup_unity.py','finish.py','README.md','unity/.gitignore'] if (P/f).exists()]
    with zipfile.ZipFile(P/'Ilyra-Rigging-Paket.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for f in files:z.write(f,'Ilyra-Rigging/'+f.relative_to(P).as_posix())
    print('ZIP MB:',round((P/'Ilyra-Rigging-Paket.zip').stat().st_size/1024**2,1))
