from pathlib import Path
from PIL import Image,ImageDraw
import json,subprocess,numpy as np
P=Path(__file__).resolve().parent;V=P/'preview';F=V/'frames';old=P.parent/'motion/preview'
ev=json.loads((V/'validation.json').read_text(encoding='utf-8'))
check={k:ev[k] for k in ['samples','trianglesChecked','foldedTriangles','minAreaRatio']};assert check['foldedTriangles']==0
first=np.array(Image.open(F/'frame-000.png'));last=np.array(Image.open(F/'frame-180.png'))
check['exactLoop']=bool(np.array_equal(first,last));assert check['exactLoop']
changed=[];bounds=[]
for f in range(181):
    a=np.array(Image.open(F/f'frame-{f:03}.png'));b=np.array(Image.open(old/'frames'/f'frame-{f:03}.png'))
    d=np.any(a!=b,axis=2)
    ys,xs=np.where(d)
    if len(xs):
        changed.append(f);bounds.append([int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())])
        assert xs.min()>=290 and xs.max()<495 and ys.min()>=225 and ys.max()<300,(f,bounds[-1])
check['changedFrames']=changed;check['differenceBounds']=bounds;check['outsideEyesPixelIdentical']=True
manifest={'width':768,'height':1280,'fps':30,'frames':180,'duration':6,'sheets':[]}
for start in range(0,180,8):
    name=f'hip-sway-{start//8:02}.webp'
    if any(start<=f<start+8 for f in changed):
        atlas=Image.new('RGBA',(3072,2560))
        for f in range(start,min(start+8,180)):atlas.paste(Image.open(F/f'frame-{f:03}.png'),((f-start)%4*768,(f-start)//4*1280))
        out=V/name;atlas.save(out,lossless=True,method=0)
        a=np.array(atlas);b=np.array(Image.open(out).convert('RGBA'));a[a[:,:,3]==0,:3]=0;b[b[:,:,3]==0,:3]=0;assert np.array_equal(a,b)
        manifest['sheets'].append(name)
    else:manifest['sheets'].append('../../motion/preview/'+name)
check['losslessAtlases']=True
G=P/'gif-frames';G.mkdir(exist_ok=True)
for i in range(120):
    im=Image.open(F/f'frame-{round(i*1.5):03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);bg.convert('RGB').resize((384,640),Image.Resampling.LANCZOS).save(G/f'{i:03}.png')
subprocess.run(['ffmpeg','-y','-v','error','-framerate','20','-i',str(G/'%03d.png'),'-vf','palettegen=stats_mode=full','-frames:v','1',str(P/'palette.png')],check=True)
gif=V/'Ilyra-Hueftpose-mit-Blinzeln.gif'
subprocess.run(['ffmpeg','-y','-v','error','-framerate','20','-i',str(G/'%03d.png'),'-i',str(P/'palette.png'),'-lavfi','paletteuse=dither=bayer:bayer_scale=4','-loop','0',str(gif)],check=True)
subprocess.run(['ffmpeg','-y','-v','error','-framerate','20','-i',str(G/'%03d.png'),'-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-movflags','+faststart',str(V/'Ilyra-Hueftpose-mit-Blinzeln.mp4')],check=True)
g=Image.open(gif);check['gifFrames']=g.n_frames;check['gifBytes']=gif.stat().st_size;check['gifDurationMs']=sum((g.seek(i) or g.info.get('duration',0)) for i in range(g.n_frames));assert check['gifDurationMs']==6000 and check['gifBytes']<10*1024*1024
sheet=Image.new('RGB',(5*270,220),'#e6e0d4');d=ImageDraw.Draw(sheet)
for k,f in enumerate([53,55,58,61,63]):
    im=Image.open(F/f'frame-{f:03}.png').convert('RGBA').crop((290,210,500,380)).resize((270,218))
    sheet.paste(im,(k*270,0),im)
sheet.save(V/'blink-detail.png')
(V/'checks.json').write_text(json.dumps(check,indent=2),encoding='utf-8');(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in check.items() if k!='differenceBounds'},indent=2))
