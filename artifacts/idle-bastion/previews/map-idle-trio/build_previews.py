"""Pack Imagegen key poses and render isolated mobile GIFs. No production writes.
Python + Pillow + numpy + scipy + opencv-python. Run from any working directory.
"""
from pathlib import Path
import hashlib
import json
import cv2
import numpy as np
from scipy.ndimage import label
from PIL import Image, ImageDraw, ImageFont, ImageSequence

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
BG='#101c24'; PANEL='#1a2a35'; INK='#f3e7cf'; GOLD='#d2b67c'; MUTED='#b6c8cc'
SPECS={
 'mara-hip':dict(title='Mara · Hip Shift',file='Mara-Hip-Shift-Handy.gif',scale=.09,transitions=[240,260,320,600,400,320,310],end=300),
 'mara-hair':dict(title='Mara · Hair Adjust',file='Mara-Hair-Adjust-Handy.gif',scale=.09,transitions=[260,320,300,460,320,260,280],end=350),
 'ilyra-hip':dict(title='Ilyra · Hip Shift',file='Ilyra-Hip-Shift-Handy.gif',scale=.095,transitions=[320,360,440,650,400,360,370],end=350),
}
def text(im,xy,value,size=14,color=INK,bold=False,anchor=None):
    font=ImageFont.truetype('C:/Windows/Fonts/'+('segoeuib.ttf' if bold else 'segoeui.ttf'),size)
    ImageDraw.Draw(im).text(xy,value,font=font,fill=color,anchor=anchor)
def sprite(im,f,foot,scale=1):
    im.alpha_composite(f.resize((64*scale,64*scale),Image.Resampling.NEAREST),(foot[0]-32*scale,foot[1]-56*scale))
def runtime(actor):
    if actor=='ilyra':return Image.open(ROOT/'experiments/idle-bastion/assets/ilyra/ilyra-atlas.png').convert('RGBA').crop((0,0,64,64))
    src=Image.open(ROOT/'experiments/idle-bastion/assets/runtime/mara-game.webp').convert('RGBA')
    # Exact art.ts/maraDestination(0): source [85,27,191,269], destination [20,18,27,38].
    f=Image.new('RGBA',(64,64));piece=src.crop((85,27,276,296)).resize((27,38),Image.Resampling.NEAREST)
    piece.putalpha(piece.getchannel('A').point(lambda a:255 if a>=128 else 0));f.paste(piece,(20,18));return f

def pack(name,spec):
    source=Image.open(HERE/name/('source/poses-v2.png' if name=='mara-hip' else 'source/poses.png')).convert('RGBA')
    keys=[];anchors=[]
    for i in range(7):
        cell=source.crop((i%4*384,i//4*512,i%4*384+384,i//4*512+512))
        cell.putalpha(cell.getchannel('A').point(lambda a:255 if a>=200 else 0))
        a=np.asarray(cell)[:,:,3]>0;ys,xs=np.where(a);fy=int(ys.max()+1)
        footcols=np.flatnonzero(a[fy-7:fy].sum(0)>2)
        labs,n=label(np.isin(np.arange(384),footcols))
        groups=sorted([np.flatnonzero(labs==j) for j in range(1,n+1)],key=len,reverse=True)[:2]
        fx=float(np.mean([g.mean() for g in groups]));scale=spec['scale']
        f=cell.transform((64,64),Image.Transform.AFFINE,(1/scale,0,fx-32/scale,0,1/scale,fy-56/scale),resample=Image.Resampling.NEAREST)
        keys.append(f);anchors.append([fx,fy])
    # Stable boot layer prevents generated key differences from becoming foot slides.
    for f in keys[1:]:f.paste(keys[0].crop((0,51,64,64)),(0,51))
    if name=='ilyra-hip':
        # Thin gold can fall between nearest-neighbour centres. Sample the actual
        # source footprint for its one-pixel core, preserving the white glove.
        fx,fy=anchors[0];scale=spec['scale']
        for y in range(21,50):
            x=23 if y<32 else 24
            r,g,b,a=keys[0].getpixel((x,y))
            if not a or min(r,g,b)>150:continue
            sx=round(fx+(x+.5-32)/scale);sy=round(fy+(y+.5-56)/scale)
            colors=[]
            for dx in range(-8,9):
                for dy in range(-2,3):
                    sr,sg,sb,sa=source.getpixel((sx+dx,sy+dy))
                    if sa>=200 and sr>150 and sg>80 and sb<120 and sr>sg*1.1:colors.append((sr,sg,sb))
            if colors:
                colors.sort(key=lambda c:c[0]+c[1])
                color=tuple(int(v) for v in np.median(colors[len(colors)//2:],axis=0))
                keys[0].putpixel((x,y),(*color,255))
        for f in keys[1:]:f.paste(keys[0].crop((0,0,26,64)),(0,0))
    return keys,anchors

N=256
xx,yy=np.meshgrid(np.arange(N,dtype=np.float32),np.arange(N,dtype=np.float32))
def inputs(f):
    rgba=np.asarray(f.resize((N,N),Image.Resampling.NEAREST)).astype(np.float32)/255
    alpha=rgba[:,:,3:];premult=np.concatenate((rgba[:,:,:3]*alpha,alpha),axis=2)
    gray=cv2.cvtColor((rgba[:,:,:3]*255).astype(np.uint8),cv2.COLOR_RGB2GRAY)
    return premult,np.clip((gray*.75+60)*alpha[:,:,0],0,255).astype(np.uint8)
def warp(im,flow,t):
    mx,my=xx.copy(),yy.copy()
    for _ in range(4):
        f=cv2.remap(flow,mx,my,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
        mx=xx-t*f[:,:,0];my=yy-t*f[:,:,1]
    return cv2.remap(im,mx,my,cv2.INTER_NEAREST,borderMode=cv2.BORDER_CONSTANT)
def between(a,b):
    ai,ag=inputs(a);bi,bg=inputs(b)
    dis=cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    forward=dis.calc(ag,bg,None);backward=dis.calc(bg,ag,None)
    weight=np.clip((51-yy/4)/7,0,1)[:,:,None]
    forward*=weight;backward*=weight
    out=[]
    for t in [1/3,2/3]:
        value=warp(ai,forward,t) if t<.5 else warp(bi,backward,1-t)
        value=cv2.resize(value,(64,64),interpolation=cv2.INTER_NEAREST)
        alpha=value[:,:,3:];rgb=np.divide(value[:,:,:3],alpha,out=np.zeros_like(value[:,:,:3]),where=alpha>1e-5)
        f=Image.fromarray(np.concatenate((np.clip(rgb*255,0,255),np.where(alpha>=.5,255,0)),axis=2).astype(np.uint8))
        f.paste(a.crop((0,51,64,64)),(0,51));out.append(f)
    return out
def backdrop(name,spec,ms):
    base=Image.new('RGBA',(390,680),BG);d=ImageDraw.Draw(base)
    text(base,(18,16),'SPIRE  /  ANIMATIONSPROBE',11,GOLD,True)
    text(base,(18,36),spec['title'],24,bold=True)
    text(base,(18,69),f'7 Posen + Zwischenbilder · {ms/1000:g} s',13,MUTED)
    for box in [(16,100,374,296),(16,310,374,610)]:d.rounded_rectangle(box,radius=9,fill=PANEL,outline='#45606a')
    text(base,(28,111),'KARTENMASSSTAB · 1×',12,GOLD,True)
    grass=Image.open(ROOT/'public/assets/Grass Tileset.png').convert('RGBA').crop((128,64,192,128)).resize((40,40),Image.Resampling.NEAREST)
    world=Image.new('RGBA',(356,130))
    for y in range(0,130,40):
        for x in range(0,356,40):world.alpha_composite(grass,(x,y))
    tower=Image.open(ROOT/'public/assets/Tower 01.png').convert('RGBA').crop((0,0,64,128)).resize((40,81),Image.Resampling.NEAREST)
    weapon=Image.open(ROOT/'public/assets/Tower 01 - Level 01 - Weapon.png').convert('RGBA').crop((0,0,96,96)).resize((60,60),Image.Resampling.NEAREST)
    world.alpha_composite(tower,(158,8));world.alpha_composite(weapon,(148,6));base.alpha_composite(world,(17,139))
    sprite(base,runtime(name.split('-')[0]),(100,243))
    text(base,(100,276),'Original',12,anchor='mm');text(base,(290,276),'Vorschau',12,anchor='mm')
    text(base,(28,323),'GESTE IM DETAIL · 4×',12,GOLD,True)
    d.line((48,579,342,579),fill='#45606a')
    text(base,(195,632),'Nur Vorschau · keine Spielintegration',14,GOLD,anchor='mm')
    text(base,(195,658),'Feste Füße · gleicher Kartenmaßstab',12,MUTED,anchor='mm')
    return base

def build(name,spec):
    out=HERE/name;(out/'frames').mkdir(exist_ok=True);(out/'keys').mkdir(exist_ok=True)
    keys,anchors=pack(name,spec)
    for i,f in enumerate(keys):f.save(out/'keys'/f'{i:02d}.png')
    frames=[keys[0]];durations=[650]
    for i,total in enumerate(spec['transitions']):
        steps=between(keys[i],keys[(i+1)%7])+[keys[(i+1)%7]]
        ticks=total//10;times=[ticks//3*10,(ticks-2*(ticks//3))*10,ticks//3*10]
        frames+=steps;durations+=times
    durations[-1]+=spec['end']
    if name=='ilyra-hip':
        for f in frames:f.paste(keys[0].crop((0,0,26,64)),(0,0))
    for i,f in enumerate(frames):f.save(out/'frames'/f'{i:02d}.png')
    base=backdrop(name,spec,sum(durations));renders=[]
    for f in frames:
        im=base.copy();sprite(im,f,(290,243));sprite(im,f,(195,576),4);renders.append(im.convert('RGB'))
    palette_source=Image.new('RGB',(390*len(renders),680))
    for i,im in enumerate(renders):palette_source.paste(im,(390*i,0))
    palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
    encoded[0].save(HERE/spec['file'],save_all=True,append_images=encoded[1:],duration=durations,loop=0,optimize=False,disposal=1)
    with Image.open(HERE/spec['file']) as gif:
        gif_durations=[f.info['duration'] for f in ImageSequence.Iterator(gif)]
    renders[9].save(out/'preview.png')
    sheet=Image.new('RGBA',(7*152,3*190),BG)
    for i,f in enumerate(frames[:-1]):
        x,y=i%7*152,i//7*190;text(sheet,(x+8,y+8),f'{i:02d}'+(' · Pose' if i%3==0 else ' · Übergang'),11,GOLD)
        sprite(sheet,f,(x+76,y+180),3)
    sheet.convert('RGB').save(out/'contact-sheet.png')
    manifest=dict(previewOnly=True,frameSize=[64,64],foot=[32,56],sourceAnchors=anchors,sourceScale=spec['scale'],
                  authoredPoses=7,intermediates=14,frames=len(frames),durationsMs=durations,loopMs=sum(durations),
                  gifFrames=len(gif_durations),gifDurationsMs=gif_durations,
                  fixedBootsY=51,source='source/poses-v2.png' if name=='mara-hip' else 'source/poses.png',
                  sourceSha256=hashlib.sha256((out/('source/poses-v2.png' if name=='mara-hip' else 'source/poses.png')).read_bytes()).hexdigest(),
                  fixedSpearRight=26 if name=='ilyra-hip' else None,
                  gif=spec['file'],gifBytes=(HERE/spec['file']).stat().st_size,
                  method='Imagegen key poses, shared scale/boot anchor, binary alpha; nearest-source DIS interpolation, no crossfade')
    (out/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    return manifest
if __name__=='__main__':
    for name,spec in SPECS.items():print(name,json.dumps(build(name,spec)))
