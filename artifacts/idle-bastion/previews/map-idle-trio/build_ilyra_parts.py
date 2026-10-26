"""Ilyra V4: explicit anatomical cutouts, joint poses and fixed feet.

One existing drawing, rigid part transforms only. No row-dependent remap,
optical flow, crossfade, image blur or resampling-generated colours.
"""
import hashlib
import json
import math
import cv2
import numpy as np
from PIL import Image,ImageDraw,ImageSequence
from build_previews import HERE,ROOT,BG,PANEL,GOLD,MUTED,text,sprite,runtime

SOURCE=HERE/'ilyra-hip'/'keys'/'00.png'
OUT=HERE/'ilyra-hip'/'parts-v4'
GIF='Ilyra-Hip-Shift-Handy-V4.gif'
NAMES=['fixed','cape','head','left_arm','torso','right_arm','pelvis','left_thigh','left_shin','right_thigh','right_shin']
PAINT_ORDER=['cape','left_shin','right_shin','left_thigh','right_thigh','left_arm','torso','pelvis','right_arm','head','fixed']
JOINTS={'left':((30,43),(28,48),(27,52)), 'right':((36,43),(36,48),(37,52))}


def split_parts(source):
    arr=np.asarray(source);owner=np.full((64,64),-1,dtype=np.int8)
    for y in range(64):
        for x in range(64):
            r,g,b,a=[int(v) for v in arr[y,x]]
            if not a:continue
            blue=b>r*1.3 and b>g*1.1
            if x<26 or y>=51:name='fixed'
            elif y<=30 or (x>=38 and y<=34):name='head'
            elif y>=35 and (x>=40 or (x>=38 and blue) or (x<=27 and blue)):name='cape'
            elif 31<=x<=33 and y>=38:name='pelvis' # continuous front cloth
            elif y>=48:name='left_shin' if x<33 else 'right_shin'
            elif y>=44:name='left_thigh' if x<33 else 'right_thigh'
            elif x<=29 and y<=37:name='left_arm'
            elif x>=36 and y<=41:name='right_arm'
            elif y>=39:name='pelvis'
            else:name='torso'
            owner[y,x]=NAMES.index(name)
    layers={}
    for i,name in enumerate(NAMES):
        layer=arr.copy();layer[owner!=i]=0;layers[name]=Image.fromarray(layer)
    # Hidden inner cloak behind the shifting waist/thigh. Its original colour
    # is reused; the patch is fully occluded in the neutral pose. This avoids
    # holes becoming visible when front layers uncover their former positions.
    cloak=Image.new('RGBA',(64,64))
    ImageDraw.Draw(cloak).rectangle((26,35,31,47),fill=source.getpixel((27,38)))
    cloak.alpha_composite(layers['cape']);layers['cape']=cloak
    # Overlapping joint artwork is shared from the same source drawing. These
    # are real local patches, not a deformed row band or a filled silhouette.
    for name,boxes in {
        'torso':[(29,36,37,42),(34,30,38,36)],
        'pelvis':[(29,37,38,44)],
        'left_thigh':[(28,41,33,45),(27,46,31,50)],
        'left_shin':[(27,46,31,50)],
        'right_thigh':[(34,41,38,45),(34,46,39,50)],
        'right_shin':[(34,46,39,50)],
    }.items():
        for box in boxes:layers[name].alpha_composite(source.crop(box),box[:2])
    return layers,owner


def translation(dx,dy):
    return np.array([[1,0,round(dx)],[0,1,round(dy)]],dtype=np.float32)


def bone_matrix(start,end,target_start,target_end):
    start=np.array(start,float);end=np.array(end,float)
    a=np.array(target_start,float);b=np.array(target_end,float)
    angle=math.atan2(*(b-a)[::-1])-math.atan2(*(end-start)[::-1])
    c,s=math.cos(angle),math.sin(angle);rotation=np.array([[c,-s],[s,c]])
    return np.column_stack((rotation,a-rotation@start)).astype(np.float32)


def solve_leg(side,hip_shift):
    h,k,a=map(lambda p:np.array(p,float),JOINTS[side])
    l1=np.linalg.norm(k-h);l2=np.linalg.norm(a-k)
    th=h+hip_shift;delta=a-th;distance=np.linalg.norm(delta)
    assert abs(l1-l2)<distance<=l1+l2+.0001,(side,hip_shift,distance)
    direction=delta/distance
    along=(l1*l1-l2*l2+distance*distance)/(2*distance)
    height=math.sqrt(max(0,l1*l1-along*along))
    v,w=a-h,k-h
    sign=1 if v[0]*w[1]-v[1]*w[0]>=0 else -1
    tk=th+direction*along+np.array([-direction[1],direction[0]])*height*sign
    return th,tk,a


def matrices(spec):
    hx,hy=spec['hip'];cx=spec['chest'];head=spec['head'];cap=spec['cape'];arm=spec['arm']
    result={n:translation(0,0) for n in NAMES}
    result['cape']=translation(cap,0)
    result['head']=translation(head,0)
    result['pelvis']=translation(hx,hy)
    result['right_arm']=translation(arm,0)
    result['left_arm']=bone_matrix((26,34),(30,32),(26,34),(30+cx,32))
    result['torso']=bone_matrix((32,32),(33,41),(32+cx,32),(33+hx,41+hy))
    for side in ['left','right']:
        h,k,a=JOINTS[side];th,tk,ta=solve_leg(side,np.array([hx,hy]))
        result[side+'_thigh']=bone_matrix(h,k,th,tk)
        result[side+'_shin']=bone_matrix(k,a,tk,ta)
    return result


def render(layers,spec):
    transforms=matrices(spec);out=Image.new('RGBA',(64,64))
    for name in PAINT_ORDER:
        transformed=cv2.warpAffine(np.asarray(layers[name]),transforms[name],(64,64),flags=cv2.INTER_NEAREST,borderMode=cv2.BORDER_CONSTANT)
        out.alpha_composite(Image.fromarray(transformed))
    # Keep entire fixed regions, including their transparent pixels, intact.
    out.paste(layers['fixed'].crop((0,0,26,64)),(0,0))
    out.paste(layers['fixed'].crop((0,51,64,64)),(0,51))
    if spec.get('seam'):
        out.putpixel((30,35),layers['cape'].getpixel((27,38)))
    return out,transforms


# Deliberate poses, not independently rounding a deformation of every image row.
POSES=[
 dict(label='Idle',hip=[0,0],chest=0,head=0,cape=0,arm=0),
 dict(label='Gewicht ansetzen',hip=[1,1],chest=0,head=0,cape=0,arm=0),
 dict(label='Gewicht verlagern',hip=[2,1],chest=0,head=0,cape=1,arm=1,seam=True),
 dict(label='Schultern nachführen',hip=[2,1],chest=-.5,head=0,cape=1,arm=1),
 dict(label='Gegenpose',hip=[2,1],chest=-1,head=-1,cape=1,arm=1),
]


def card():
    base=Image.new('RGBA',(304,600),BG);d=ImageDraw.Draw(base)
    text(base,(16,14),'SPIRE / ILYRA',11,GOLD,True)
    text(base,(16,33),'Hip Shift · V4',23,bold=True)
    text(base,(16,64),'Zusammenhängende Körperteile',12,MUTED)
    for box in [(12,90,292,260),(12,276,292,558)]:d.rounded_rectangle(box,radius=8,fill=PANEL,outline='#45606a')
    text(base,(24,101),'KARTENMASSSTAB · 1×',12,GOLD,True)
    tile=Image.open(ROOT/'public/assets/Grass Tileset.png').convert('RGBA').crop((128,64,192,128)).resize((40,40),Image.Resampling.NEAREST)
    world=Image.new('RGBA',(278,110))
    for y in range(0,110,40):
        for x in range(0,278,40):world.alpha_composite(tile,(x,y))
    base.alpha_composite(world,(13,128));sprite(base,runtime('ilyra'),(76,222))
    text(base,(76,248),'Original',12,anchor='mm');text(base,(228,248),'Vorschau',12,anchor='mm')
    text(base,(24,289),'GESTE IM DETAIL · 4×',12,GOLD,True)
    d.line((32,543,272,543),fill='#45606a')
    text(base,(152,577),'Nur Vorschau · 304 px nativ',12,GOLD,anchor='mm')
    return base


def build():
    OUT.mkdir(exist_ok=True);(OUT/'parts').mkdir(exist_ok=True)
    source=Image.open(SOURCE).convert('RGBA');layers,owner=split_parts(source)
    for name,layer in layers.items():layer.save(OUT/'parts'/f'{name}.png')
    keys=[render(layers,s)[0] for s in POSES]
    for i,f in enumerate(keys):f.save(OUT/f'key-{i:02d}.png')
    sheet=Image.new('RGBA',(len(keys)*192,272),BG)
    for i,f in enumerate(keys):
        text(sheet,(i*192+8,8),POSES[i]['label'],11,GOLD);sprite(sheet,f,(i*192+96,254),4)
    sheet.convert('RGB').save(OUT/'contact-sheet.png')
    order=[0,1,2,3,4,3,2,1,0];durations=[600,140,160,120,700,120,160,140,600]
    base=card();renders=[]
    for i,key in enumerate(order):
        f=keys[key];f.save(OUT/f'{i:02d}.png')
        im=base.copy();sprite(im,f,(228,222));sprite(im,f,(152,540),4);renders.append(im.convert('RGB'))
    palette_source=Image.new('RGB',(304*len(renders),600))
    for i,im in enumerate(renders):palette_source.paste(im,(304*i,0))
    palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
    encoded[0].save(HERE/GIF,save_all=True,append_images=encoded[1:],duration=durations,loop=0,optimize=False,disposal=1)
    renders[4].save(OUT/'preview.png')
    with Image.open(HERE/GIF) as gif:
        gif_durations=[frame.info['duration'] for frame in ImageSequence.Iterator(gif)]
    manifest=dict(version=4,previewOnly=True,source=SOURCE.relative_to(HERE).as_posix(),sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        method='Anatomical cutout layers with rigid transforms and two-bone leg joints; fixed feet, no row remap/flow/blend/blur',
        parts=NAMES,poses=POSES,order=order,durationsMs=durations,gif=GIF,frames=len(order),loopMs=sum(durations),gifFrames=len(gif_durations),gifDurationsMs=gif_durations,gifBytes=(HERE/GIF).stat().st_size)
    (OUT/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(manifest))


if __name__=='__main__':build()
