"""V2: continuous, premultiplied bidirectional sampling of the accepted poses.

The original generator, key art and V1 exports remain reproducible and untouched.
Only the animation renderer changes; no new painted/generated poses.
"""
import json
import math
import hashlib
import cv2
import numpy as np
from PIL import Image, ImageSequence
from build_previews import HERE, SPECS, inputs, xx, yy, N, backdrop, sprite, text, BG, GOLD

HEAD_BOXES={'mara-hip':(24,0,40,32),'mara-hair':(26,0,40,32),'ilyra-hip':(26,0,46,31)}

def flow_pair(a,b):
    ai,ag=inputs(a);bi,bg=inputs(b)
    # A consistent reconstruction footprint on every frame prevents the cycle
    # from pulsing between razor-sharp keys and softer fractional positions.
    ai=cv2.GaussianBlur(ai,(0,0),1.5)
    bi=cv2.GaussianBlur(bi,(0,0),1.5)
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    # Match larger shapes instead of individual noisy highlights.
    ag=cv2.GaussianBlur(ag,(0,0),2);bg=cv2.GaussianBlur(bg,(0,0),2)
    ab=dis.calc(ag,bg,None);ba=dis.calc(bg,ag,None)
    weight=np.clip((51-yy/4)/7,0,1)[:,:,None]
    return ai,bi,cv2.GaussianBlur(ab,(0,0),3)*weight,cv2.GaussianBlur(ba,(0,0),3)*weight


def warp(source,flow,t):
    mx,my=xx.copy(),yy.copy()
    for _ in range(5):
        v=cv2.remap(flow,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
        mx=xx-t*v[:,:,0];my=yy-t*v[:,:,1]
    return cv2.remap(source,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_CONSTANT)


def rgba(value):
    # Area sampling preserves fractional coverage instead of binary pixel pops.
    value=cv2.resize(value,(64,64),interpolation=cv2.INTER_AREA)
    value=np.clip(value*1.6-cv2.GaussianBlur(value,(0,0),.65)*.6,0,1)
    value[:,:,:3]=np.minimum(value[:,:,:3],value[:,:,3:])
    alpha=value[:,:,3:];rgb=np.divide(value[:,:,:3],alpha,out=np.zeros_like(value[:,:,:3]),where=alpha>1e-5)
    return Image.fromarray(np.clip(np.concatenate((rgb,alpha),axis=2)*255+.5,0,255).astype(np.uint8))


def render_pair(pair,t,base,name):
    ai,bi,ab,ba=pair
    # Both source poses reach the same intermediate geometry. No t=.5 switch.
    f=rgba((1-t)*warp(ai,ab,t)+t*warp(bi,ba,1-t))
    # Reuse the same head pixels rather than morphing independently drawn eyes,
    # facial highlights and hair edges. The free raised arm stays outside this
    # box in Hair Adjust. Hip/arm key silhouettes and timing are unchanged.
    head=HEAD_BOXES[name]
    f.paste(base.crop(head),head[:2])
    f.paste(base.crop((0,51,64,64)),(0,51))
    if name=='ilyra-hip':f.paste(base.crop((0,0,26,64)),(0,0))
    return f


def save(name,spec,frames,durations):
    out=HERE/name/'stable';out.mkdir(exist_ok=True)
    for i,f in enumerate(frames):f.save(out/f'{i:03d}.png')
    base=backdrop(name,spec,sum(durations));renders=[]
    for f in frames:
        im=base.copy();sprite(im,f,(290,243));sprite(im,f,(195,576),4);renders.append(im.convert('RGB'))
    # One deterministic palette per loop; no per-frame quantisation or dithering.
    palette_source=Image.new('RGB',(390*len(renders),680))
    for i,im in enumerate(renders):palette_source.paste(im,(390*i,0))
    palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
    filename=spec['file'].replace('.gif','-V2.gif')
    encoded[0].save(HERE/filename,save_all=True,append_images=encoded[1:],duration=durations,loop=0,optimize=False,disposal=1)
    with Image.open(HERE/filename) as gif:
        actual=[f.info['duration'] for f in ImageSequence.Iterator(gif)]
    indices=np.linspace(0,len(frames)-2,21).astype(int)
    sheet=Image.new('RGBA',(7*152,3*190),BG)
    for i,j in enumerate(indices):
        x,y=i%7*152,i//7*190;text(sheet,(x+8,y+8),f'{j:02d}',11,GOLD);sprite(sheet,frames[j],(x+76,y+180),3)
    sheet.convert('RGB').save(out/'contact-sheet.png')
    manifest=dict(version=2,previewOnly=True,sampledFrames=len(frames),durationsMs=durations,
        gif=filename,gifFrames=len(actual),gifDurationsMs=actual,loopMs=sum(actual),
        gifBytes=(HERE/filename).stat().st_size,sourceKeys=[hashlib.sha256((HERE/name/'keys'/f'{i:02d}.png').read_bytes()).hexdigest() for i in range(7)],
        method='Stable reference head; continuous bidirectional optical flow for body/arms; premultiplied bilinear warp, consistent reconstruction and area sampling; shared palette without dithering',
        fixedBootsY=51,fixedSpearRight=26 if name=='ilyra-hip' else None)
    manifest['fixedHeadBox']=HEAD_BOXES[name]
    (out/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    return manifest


def build(name,spec):
    keys=[Image.open(HERE/name/'keys'/f'{i:02d}.png').convert('RGBA') for i in range(7)]
    pairs=[flow_pair(keys[i],keys[(i+1)%7]) for i in range(7)]
    frames=[render_pair(pairs[0],0,keys[0],name)];durations=[650]
    for i,total in enumerate(spec['transitions']):
        pair=pairs[i]
        ticks=total//10;count=math.ceil(total/50)
        cuts=[round(j*ticks/count)*10 for j in range(count+1)]
        for j in range(1,count+1):
            t=j/count
            frames.append(render_pair(pair,t,keys[0],name));durations.append(cuts[j]-cuts[j-1])
    durations[-1]+=spec['end'];frames[-1]=frames[0].copy()
    return save(name,spec,frames,durations)


if __name__=='__main__':
    for name,spec in SPECS.items():print(name,json.dumps(build(name,spec)))
