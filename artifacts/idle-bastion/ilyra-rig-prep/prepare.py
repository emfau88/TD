"""Register purpose-drawn rig components. No painted fill or alpha thresholding.

The continuous shoulder/arm and forearm/hand artwork is intentional: separate
bones will share one mesh at each joint instead of exposing cut sprite edges.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import json, struct, cv2

P=Path(__file__).resolve().parent
W,H=768,1280
OUT=P/'layers'; OUT.mkdir(exist_ok=True)
PRE=P/'preview'; PRE.mkdir(exist_ok=True)
sheets={n:Image.open(P/'art'/f'{n}-kit-source.png').convert('RGBA') for n in ['body','head','lower']}
sheets['torso']=Image.open(P/'art/torso-continuous-source.png').convert('RGBA')
sheets['jaw']=Image.open(P/'art/head-jaw-source.png').convert('RGBA')
layers={}; specs=[]

def put(name,source,box,scale,anchor,target,size=None):
    im=sheets[source].crop(box)
    # Hair islands have overlapping rectangular bounding boxes on the sheet.
    # Select the intended connected island, preserving its original alpha edges.
    if name in ['HairBack','HairFrontGoggles']:
        a=np.array(im)
        _,labels,stats,_=cv2.connectedComponentsWithStats((a[:,:,3]>16).astype('uint8'),8)
        keep=1+np.argmax(stats[1:,cv2.CC_STAT_AREA])
        support=cv2.dilate((labels==keep).astype('uint8'),np.ones((11,11),np.uint8))>0
        a[~support]=0;im=Image.fromarray(a)
    size=size or (round(im.width*scale),round(im.height*scale))
    sx,sy=size[0]/im.width,size[1]/im.height
    pos=(round(target[0]-(anchor[0]-box[0])*sx),round(target[1]-(anchor[1]-box[1])*sy))
    im=im.resize(size,Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(W,H));canvas.alpha_composite(im,pos)
    layers[name]=canvas
    specs.append(dict(name=name,source=source,crop=box,size=size,position=pos,sourceAnchor=anchor,target=target))

# Image-left/right names are explicit; they are not anatomical left/right.
put('CapeBack','lower',(872,502,1525,988),.9,(1053,520),(252,510),size=(600,500))
put('HairBack','head',(437,50,1104,920),1,(770,55),(384,160),size=(485,770))
put('ThighImageLeft','lower',(508,46,736,458),.94,(630,80),(290,900))
put('ThighImageRight','lower',(804,46,1030,458),.94,(900,80),(478,900))
put('Pelvis','lower',(60,88,464,416),.86,(260,253),(384,850))
put('SkirtImageLeft','lower',(21,513,352,1000),.75,(330,530),(384,810))
put('SkirtImageRight','lower',(517,510,848,998),.75,(540,530),(384,810))
put('SkirtCenter','lower',(1205,57,1337,480),.8,(1271,65),(384,821))
put('TorsoArmsHands','torso',(0,0,1024,1536),.56,(512,903),(384,850))
put('Head','jaw',(205,115,1045,1005),.264,(630,995),(384,435))
put('HairLockImageLeft','head',(70,487,358,1003),.49,(277,510),(294,363))
put('HairLockImageRight','head',(1192,484,1467,1007),.49,(1263,510),(474,363))
put('HairFrontGoggles','head',(1060,76,1525,481),.62,(1290,160),(384,225))

order=list(layers)
assembled=Image.new('RGBA',(W,H))
for name in order:
    assembled.alpha_composite(layers[name]); layers[name].save(OUT/f'{name}.png')
assembled.save(PRE/'rest.png')
for label,color in [('light','#e6e0d4'),('dark','#18202a')]:
    bg=Image.new('RGBA',(W,H),color);bg.alpha_composite(assembled);bg.convert('RGB').save(PRE/f'rest-{label}.png')
(P/'art/assembly.json').write_text(json.dumps(dict(canvas=[W,H],backToFront=order,parts=specs),indent=2),encoding='utf-8')

# Photoshop Large Document v2: RGBA layers retain full-canvas registration.
u16=lambda x:struct.pack('>H',x)
u32=lambda x:struct.pack('>I',x)
u64=lambda x:struct.pack('>Q',x)
records=bytearray();channels=bytearray()
for name in reversed(order):
    im=layers[name];l,t,r,b=im.getbbox();a=np.array(im.crop((l,t,r,b)));count=(r-l)*(b-t)
    rec=struct.pack('>iiiiH',t,l,b,r,4)
    for cid in [-1,0,1,2]:rec+=struct.pack('>hQ',cid,count+2)
    label=bytes([len(name)])+name.encode();label+=b'\0'*((-len(label))%4)
    extra=u32(0)+u32(0)+label
    records+=rec+b'8BIMnorm'+bytes([255,0,0,0])+u32(len(extra))+extra
    for c in [3,0,1,2]:channels+=u16(0)+a[:,:,c].tobytes()
info=struct.pack('>h',len(order))+records+channels
if len(info)%2:info+=b'\0'
lm=u64(len(info))+info+u32(0)
header=b'8BPS'+u16(2)+b'\0'*6+u16(4)+u32(H)+u32(W)+u16(8)+u16(3)+u32(0)+u32(0)
a=np.array(assembled);merged=u16(0)+b''.join(a[:,:,c].tobytes() for c in [0,1,2,3])
(P/'Ilyra.psb').write_bytes(header+u64(len(lm))+lm+merged)
print(f'Prepared {len(order)} layers at {W}x{H}, with original alpha retained.')
