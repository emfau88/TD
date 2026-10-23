from pathlib import Path
from PIL import Image,ImageDraw
import json,hashlib,subprocess
import numpy as np

P=Path(__file__).resolve().parent;V=P/'preview';F=V/'frames'
e=json.loads((V/'validation.json').read_text(encoding='utf-8'))
checks={k:e[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio']}
assert checks['foldedTriangles']==0
a=np.array(Image.open(F/'frame-000.png'));b=np.array(Image.open(F/'frame-180.png'))
checks['exactLoop']=bool(np.array_equal(a,b));assert checks['exactLoop']
r=json.loads((V/'rig-checks.json').read_text(encoding='utf-8'));assert r['maxWristError']<.01
checks['contactIK']=r
manifest={'width':768,'height':1280,'fps':30,'frames':180,'duration':6,'sheets':[]}
for start in range(0,180,8):
    atlas=Image.new('RGBA',(3072,2560))
    for f in range(start,min(start+8,180)):
        atlas.paste(Image.open(F/f'frame-{f:03}.png'),((f-start)%4*768,(f-start)//4*1280))
    out=V/f'hip-sway-{start//8:02}.webp';atlas.save(out,lossless=True,method=0)
    original=np.array(atlas);decoded=np.array(Image.open(out).convert('RGBA'))
    original[original[:,:,3]==0,:3]=0;decoded[decoded[:,:,3]==0,:3]=0
    assert np.array_equal(original,decoded)
    manifest['sheets'].append(out.name)
checks['losslessAtlases']=True
# Stable global GIF palette; a warm opaque background preserves fine alpha edges.
gifframes=P/'gif-frames';gifframes.mkdir(exist_ok=True)
for i in range(120):
    f=round(i*1.5);im=Image.open(F/f'frame-{f:03}.png').convert('RGBA')
    bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im)
    bg.convert('RGB').resize((480,800),Image.Resampling.LANCZOS).save(gifframes/f'{i:03}.png')
subprocess.run(['ffmpeg','-y','-v','error','-framerate','20','-i',str(gifframes/'%03d.png'),'-vf','palettegen=stats_mode=full','-frames:v','1',str(P/'palette.png')],check=True)
subprocess.run(['ffmpeg','-y','-v','error','-framerate','20','-i',str(gifframes/'%03d.png'),'-i',str(P/'palette.png'),'-lavfi','paletteuse=dither=bayer:bayer_scale=4','-loop','0',str(V/'Ilyra-Hand-an-der-Huefte.gif')],check=True)
gif=Image.open(V/'Ilyra-Hand-an-der-Huefte.gif');checks['gifFrames']=gif.n_frames
checks['gifBytes']=(V/'Ilyra-Hand-an-der-Huefte.gif').stat().st_size
checks['gifDurationMs']=sum((gif.seek(i) or gif.info.get('duration',0)) for i in range(gif.n_frames))
assert checks['gifDurationMs']==6000
sheet=Image.new('RGB',(5*307,552),'#e6e0d4');d=ImageDraw.Draw(sheet)
for k,f in enumerate([0,36,72,108,144]):
    im=Image.open(F/f'frame-{f:03}.png').convert('RGBA').resize((307,512),Image.Resampling.LANCZOS)
    sheet.paste(im,(k*307,32),im);d.text((k*307+15,10),f'{f/30:.1f} s',fill='#182331')
sheet.save(V/'keyframes.jpg',quality=95)
checks['sourcePreserved']=hashlib.sha256((P.parent/'preview/ilyra-hand-on-hip.png').read_bytes()).hexdigest()==hashlib.sha256((P.parents[1]/'hip-v1/unity/Assets/HipBaseV2/IlyraHipBase.png').read_bytes()).hexdigest()
assert checks['sourcePreserved']
(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(V/'checks.json').write_text(json.dumps(checks,indent=2),encoding='utf-8')
print(json.dumps(checks,indent=2))
