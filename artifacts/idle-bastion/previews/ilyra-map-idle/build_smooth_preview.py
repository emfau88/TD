"""V2 rendering: preserve the existing poses, sample their thin gold shaft,
and add motion-interpolated frames. No newly designed character artwork.
Python + Pillow + numpy + opencv-python; production files are read-only.
"""
from pathlib import Path
import hashlib
import json
import runpy
import cv2
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
OUT = HERE / 'v2'
(OUT / 'frames').mkdir(parents=True, exist_ok=True)
original = runpy.run_path(str(HERE / 'build_preview.py'))
old = original['frames']
source = original['source']
scale = original['SCALE']
# Projected shaft endpoints, beneath the crystal and at the butt of the spear.
# The planted segment stays at x=21 in frames 2..5, as in the approved loop.
SHAFTS = [((21,23),(21,54)), ((18,20),(24,42)), ((21,22),(21,54)),
          ((21,22),(21,54)), ((21,22),(21,54)), ((21,22),(21,54)),
          ((21,24),(23,51)), ((21,24),(21,54))]

def shaft_color(i, y):
    """Sample actual gold from the source footprint instead of a single dark edge."""
    a,b = SHAFTS[i]
    x = a[0]+(b[0]-a[0])*(y-a[1])/max(1,b[1]-a[1])
    sx = original['ANCHOR_X'][i] + (x+.5-32)/scale
    sy = original['FEET'][i] + (y+.5-56)/scale
    colors=[]
    for dy in [-2,-1,0,1,2]:
        for dx in range(-10,11):
            xx,yy=int(sx+dx),int(sy+dy)
            if not (0<=xx<384 and 0<=yy<512): continue
            r,g,b,alpha=source.getpixel((i%4*384+xx,i//4*512+yy))
            if alpha>=200 and r>120 and g>65 and b<90 and r>g*1.15 and g>b*1.45:
                colors.append((r,g,b))
    if not colors: return (230,151,27)
    # Upper half preserves the highlight that otherwise falls between sample centres.
    colors.sort(key=lambda c:c[0]+c[1])
    return tuple(int(v) for v in np.median(colors[len(colors)//2:],axis=0))

def fix_shaft(frame, endpoints, colors):
    im=frame.copy(); mask=Image.new('1',im.size)
    a,b=endpoints
    for y in range(round(a[1]),round(b[1])+1):
        x=round(a[0]+(b[0]-a[0])*(y-a[1])/max(1,b[1]-a[1]))
        if not (0<=x<64 and 0<=y<64): continue
        r,g,blue,alpha=im.getpixel((x,y))
        # Preserve the gripping hand, glove, gold cap and already bright highlights.
        hand=min(r,g,blue)>135 or r>155 and g>80 and blue>75
        if alpha and not hand:
            color=colors(y)
            im.putpixel((x,y),(*color,255));mask.putpixel((x,y),1)
    return im,mask

keys=[]; masks=[]
for i,f in enumerate(old):
    fixed,mask=fix_shaft(f,SHAFTS[i],lambda y,i=i:shaft_color(i,y))
    keys.append(fixed);masks.append(mask)
    outside=np.asarray(mask)==0
    assert np.array_equal(np.asarray(f)[outside],np.asarray(fixed)[outside])
    fixed.save(OUT/f'key-{i:02d}.png')

N=256
xx,yy=np.meshgrid(np.arange(N,dtype=np.float32),np.arange(N,dtype=np.float32))
def inputs(frame):
    rgba=np.asarray(frame.resize((N,N),Image.Resampling.NEAREST)).astype(np.float32)/255
    alpha=rgba[:,:,3:]
    premult=np.concatenate((rgba[:,:,:3]*alpha,alpha),axis=2)
    gray=cv2.cvtColor((rgba[:,:,:3]*255).astype(np.uint8),cv2.COLOR_RGB2GRAY)
    # Include the silhouette, so dark cape/outline pixels also participate in motion.
    gray=np.clip((gray*.75+60)*alpha[:,:,0],0,255).astype(np.uint8)
    return premult,gray
def warp(image,flow,amount):
    mx,my=xx.copy(),yy.copy()
    # Inverse advection, rather than dissolving unaligned silhouettes.
    for _ in range(4):
        f=cv2.remap(flow,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
        mx=xx-amount*f[:,:,0];my=yy-amount*f[:,:,1]
    return cv2.remap(image,mx,my,cv2.INTER_NEAREST,borderMode=cv2.BORDER_CONSTANT)
def intermediates(a,b,index):
    ai,ag=inputs(a);bi,bg=inputs(b)
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    forward=dis.calc(ag,bg,None);backward=dis.calc(bg,ag,None)
    out=[]
    for t in [1/3,2/3]:
        # Choose the nearer source pose instead of blending two silhouettes.
        # This keeps hard pixel edges and avoids translucent doubled limbs.
        value=warp(ai,forward,t) if t<.5 else warp(bi,backward,1-t)
        # Pixel-centre sampling at the real 64px map size; no display blur.
        value=cv2.resize(value,(64,64),interpolation=cv2.INTER_NEAREST)
        alpha=value[:,:,3:]
        rgb=np.divide(value[:,:,:3],alpha,out=np.zeros_like(value[:,:,:3]),where=alpha>1e-5)
        rgba=np.concatenate((np.clip(rgb*255,0,255),np.where(alpha>=.5,255,0)),axis=2).astype(np.uint8)
        frame=Image.fromarray(rgba)
        endpoints=tuple(tuple(float(x*(1-t)+y*t) for x,y in zip(p,q)) for p,q in zip(SHAFTS[index],SHAFTS[(index+1)%8]))
        # Keep the sampled gold material consistent throughout motion as well.
        frame,_=fix_shaft(frame,endpoints,lambda y,t=t,i=index:tuple(round(x*(1-t)+z*t) for x,z in zip(shaft_color(i,y),shaft_color((i+1)%8,y))))
        out.append(frame)
    return out

frames=[keys[0]];phase_ids=[0];durations=[650];transition_ms=[200,200,220,380,340,280,220,260]
for i,total in enumerate(transition_ms):
    steps=intermediates(keys[i],keys[(i+1)%8],i)+[keys[(i+1)%8]]
    ticks=total//10
    times=[ticks//3*10,(ticks-ticks//3*2)*10,ticks//3*10]
    for frame,ms in zip(steps,times):
        frames.append(frame);phase_ids.append((i+1)%8);durations.append(ms)
durations[-1]+=450
assert sum(durations)==3200
assert frames[0].tobytes()==frames[-1].tobytes()
for i,f in enumerate(frames):
    f.save(OUT/'frames'/f'{i:02d}.png')
    bounds=f.getbbox();assert bounds and 0<bounds[0]<bounds[2]<64 and 0<bounds[1]<bounds[3]<64,(i,bounds)
atlas=Image.new('RGBA',(8*64,3*64))
for i,f in enumerate(frames[:-1]):atlas.paste(f,(i%8*64,i//8*64))
atlas.save(OUT/'idle-preview-v2.png')
base=original['base'].copy()
ImageDraw.Draw(base).rectangle((16,65,374,96),fill=original['BG'])
original['text'](base,(18,69),'8 Posen + 16 Zwischenbilder · 3,2 s',13,original['MUTED'])
renders=[]
for frame,i in zip(frames,phase_ids):
    im=base.copy();original['shadow'](im,(290,243))
    original['sprite'](im,frame,(290,243));original['sprite'](im,frame,(195,576),4)
    original['text'](im,(195,630),original['PHASES'][i],15,original['GOLD'],True,anchor='mm')
    renders.append(im.convert('RGB'))
palette_source=Image.new('RGB',(390*len(renders),680))
for i,im in enumerate(renders):palette_source.paste(im,(390*i,0))
palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
encoded[0].save(HERE/'Ilyra-Speer-Idle-Handy-v2.gif',save_all=True,append_images=encoded[1:],duration=durations,loop=0,optimize=False,disposal=1)
renders[13].save(OUT/'preview.png')
sheet=Image.new('RGBA',(8*152,3*190),original['BG'])
for i,f in enumerate(frames[:-1]):
    x,y=i%8*152,i//8*190
    original['text'](sheet,(x+8,y+8),f'{i:02d}'+(' · KEY' if i%3==0 else ' · tween'),11,original['GOLD'])
    original['sprite'](sheet,f,(x+76,y+180),3)
sheet.convert('RGB').save(OUT/'contact-sheet.png')
manifest={'previewOnly':True,'method':'bidirectional DIS flow with nearest-source inverse advection, no crossfade; original key poses except shaft footprint sampling',
          'originalKeyPoses':8,'intermediateFrames':16,'gifFrames':len(frames),'loopMs':sum(durations),'durationsMs':durations,
          'keysUnchangedOutsideShaft':True,'keyChangedPixels':[int(np.asarray(m).sum()) for m in masks],
          'endpointsIdentical':frames[0].tobytes()==frames[-1].tobytes(),'frameSize':[64,64],'foot':[32,56],
          'gifBytes':(HERE/'Ilyra-Speer-Idle-Handy-v2.gif').stat().st_size,'sourceSha256':hashlib.sha256((HERE/'source/poses.png').read_bytes()).hexdigest()}
(OUT/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps(manifest))
