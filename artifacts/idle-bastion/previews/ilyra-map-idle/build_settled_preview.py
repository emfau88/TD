"""V3: longer moving hip accent and a planted return, using the existing pose rig.
Preview only. Rebuild with Python, Pillow, numpy and opencv-python.
"""
from pathlib import Path
import json
import runpy
import cv2
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
OUT = HERE/'v3'
(OUT/'frames').mkdir(parents=True,exist_ok=True)
v2 = runpy.run_path(str(HERE/'build_smooth_preview.py'))
art = v2['original']
keys = [f.copy() for f in v2['keys']]
# The frontal return is not a walking action. Reuse its settled lower-body layer
# from the original idle, rather than morphing three different foot separations.
LEG_Y = 45
for i in [5,6,7]:
    keys[i].paste(keys[0].crop((24,LEG_Y,64,64)),(24,LEG_Y))

def transition(index):
    a,b=keys[index],keys[(index+1)%8]
    ai,ag=v2['inputs'](a);bi,bg=v2['inputs'](b)
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    forward=dis.calc(ag,bg,None);backward=dis.calc(bg,ag,None)
    if index>=5:
        # Ease the motion field to zero above the fixed lower-body layer.
        weight=np.clip((LEG_Y-1-v2['yy']/4)/9,0,1)
        weight=np.where(v2['xx']/4>=24,weight,1)
        forward*=weight[:,:,None];backward*=weight[:,:,None]
    out=[]
    for t in [1/3,2/3]:
        value=v2['warp'](ai,forward,t) if t<.5 else v2['warp'](bi,backward,1-t)
        value=cv2.resize(value,(64,64),interpolation=cv2.INTER_NEAREST)
        alpha=value[:,:,3:]
        rgb=np.divide(value[:,:,:3],alpha,out=np.zeros_like(value[:,:,:3]),where=alpha>1e-5)
        frame=Image.fromarray(np.concatenate((np.clip(rgb*255,0,255),np.where(alpha>=.5,255,0)),axis=2).astype(np.uint8))
        shafts=v2['SHAFTS']
        ends=tuple(tuple(float(x*(1-t)+y*t) for x,y in zip(p,q)) for p,q in zip(shafts[index],shafts[(index+1)%8]))
        frame,_=v2['fix_shaft'](frame,ends,lambda y:tuple(round(x*(1-t)+z*t) for x,z in zip(v2['shaft_color'](index,y),v2['shaft_color']((index+1)%8,y))))
        if index>=5:
            frame.paste(keys[0].crop((24,LEG_Y,64,64)),(24,LEG_Y))
        out.append(frame)
    return out

def hip_arc(amount):
    # A localized two-pixel hip arc; planted spear, grip and feet stay fixed.
    # This changes rig sampling, not the source character or costume.
    xx,yy=np.meshgrid(np.arange(64,dtype=np.float32),np.arange(64,dtype=np.float32))
    torso=np.clip((xx-23)/5,0,1)*np.clip((54-yy)/7,0,1)
    hip=np.maximum(0,1-np.abs(yy-40)/13)*torso
    cape=np.maximum(0,1-np.abs(yy-37)/13)*np.clip((xx-37)/7,0,1)
    dx=amount*(hip+.25*cape)
    dy=-.35*amount*hip
    pixels=cv2.remap(np.asarray(keys[3]),xx-dx,yy-dy,cv2.INTER_NEAREST,borderMode=cv2.BORDER_CONSTANT)
    return Image.fromarray(pixels)

frames=[keys[0]];durations=[650];phases=[0];tags=['idle']
def append(frame,ms,phase,tag):
    frames.append(frame);durations.append(ms);phases.append(phase);tags.append(tag)
for index,total in enumerate([200,200,220,380,340,280,220,260]):
    steps=transition(index)+[keys[(index+1)%8]]
    ticks=total//10
    times=[ticks//3*10,(ticks-ticks//3*2)*10,ticks//3*10]
    for frame,ms in zip(steps,times):append(frame,ms,(index+1)%8,'return' if index>=5 else 'gesture')
    if index==2:
        for amount in [.6,1.2,1.8,2.2,1.8,1.2,.6,0]:
            append(hip_arc(amount),90,3,'hip-arc')
durations[-1]+=450
assert sum(durations)==3920 and frames[0].tobytes()==frames[-1].tobytes()
for i,f in enumerate(frames):f.save(OUT/'frames'/f'{i:02d}.png')
base=art['base'].copy()
ImageDraw.Draw(base).rectangle((16,65,374,96),fill=art['BG'])
art['text'](base,(18,69),'V3 · Hüftakzent & fester Stand · 3,92 s',13,art['MUTED'])
renders=[]
for frame,phase in zip(frames,phases):
    im=base.copy();art['shadow'](im,(290,243))
    art['sprite'](im,frame,(290,243));art['sprite'](im,frame,(195,576),4)
    art['text'](im,(195,630),art['PHASES'][phase],15,art['GOLD'],True,anchor='mm')
    renders.append(im.convert('RGB'))
palette_source=Image.new('RGB',(390*len(renders),680))
for i,im in enumerate(renders):palette_source.paste(im,(390*i,0))
palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
gif=HERE/'Ilyra-Speer-Idle-Handy-v3.gif'
encoded[0].save(gif,save_all=True,append_images=encoded[1:],duration=durations,loop=0,optimize=False,disposal=1)
renders[13].save(OUT/'preview.png')
sheet=Image.new('RGBA',(8*152,4*190),art['BG'])
for i,f in enumerate(frames[:-1]):
    x,y=i%8*152,i//8*190
    art['text'](sheet,(x+8,y+8),f'{i:02d} · {tags[i]}',11,art['GOLD'])
    art['sprite'](sheet,f,(x+76,y+180),3)
sheet.convert('RGB').save(OUT/'contact-sheet.png')
manifest=dict(previewOnly=True,loopMs=sum(durations),durationsMs=durations,tags=tags,
              frames=len(frames),hipArcAddedMs=720,hipArcMaxPixels=2.2,
              returnFixedLowerBody=[24,LEG_Y,64,64],returnStartFrame=23,
              frameSize=[64,64],foot=[32,56],gifBytes=gif.stat().st_size,
              method='existing pose rig; localized hip arc and fixed idle lower-body layer on frontal return',
              sourceSha256=v2['manifest']['sourceSha256'])
(OUT/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps(manifest))
