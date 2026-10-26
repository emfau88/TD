"""Pack authored Mara poses directly; no flow, warp or blended tween frames."""
import hashlib
import json
import numpy as np
from scipy.ndimage import label
from PIL import Image, ImageDraw, ImageSequence
from build_previews import HERE, ROOT, BG, PANEL, GOLD, MUTED, text, sprite, runtime

OUT=HERE/'mara-hip/authored-v3'
SOURCE=OUT/'source/poses-revised.png'
GIF=HERE/'Mara-Hip-Shift-Handy-V3.gif'
SCALE=.09
# Select the genuinely distinct arm silhouettes. Near-duplicate generated
# drawings are not animation in-betweens: they only add costume-detail noise.
ORDER=[0,6,1,4,1,6,0]
DURATIONS=[850,130,180,950,180,130,450]


def pack():
    sheet=Image.open(SOURCE).convert('RGBA')
    frames=[];anchors=[]
    for i in range(8):
        cell=sheet.crop((i%4*384,i//4*512,i%4*384+384,i//4*512+512))
        alpha=np.asarray(cell)[:,:,3]>=180
        ys,xs=np.where(alpha)
        baseline=int(ys.max()+1)
        # Bottom of the two planted boots determines translation, never scale.
        columns=np.any(alpha[baseline-18:baseline],axis=0)
        groups,count=label(columns)
        feet=sorted([np.flatnonzero(groups==j) for j in range(1,count+1)],key=len,reverse=True)[:2]
        assert len(feet)==2,(i,feet)
        center=float(np.mean([group.mean() for group in feet]))
        cell.putalpha(cell.getchannel('A').point(lambda value:255 if value>=180 else 0))
        frame=cell.transform((64,64),Image.Transform.AFFINE,(1/SCALE,0,center-32/SCALE,0,1/SCALE,baseline-56/SCALE),resample=Image.Resampling.NEAREST)
        frames.append(frame);anchors.append([center,baseline])
    # One global restrained palette, without dithering. The clear face, raised
    # wrench and planted boots are the exact same pixels throughout the gesture.
    rgb=np.vstack([np.array(f)[:,:,:3][np.array(f)[:,:,3]>0] for f in frames])
    palette=Image.fromarray(rgb.reshape(1,-1,3)).quantize(colors=32,method=Image.Quantize.MEDIANCUT)
    for i,f in enumerate(frames):
        alpha=f.getchannel('A')
        frames[i]=f.convert('RGB').quantize(palette=palette,dither=Image.Dither.NONE).convert('RGBA')
        frames[i].putalpha(alpha)
    neutral=frames[0]
    for f in frames[1:]:
        f.paste(neutral.crop((0,0,64,33)),(0,0))
        f.paste(neutral.crop((38,0,64,43)),(38,0))
        f.paste(neutral.crop((0,50,64,64)),(0,50))
    frames[-1]=neutral.copy()
    return frames,anchors


def card():
    base=Image.new('RGBA',(304,600),BG);d=ImageDraw.Draw(base)
    text(base,(16,14),'SPIRE / MARA',11,GOLD,True)
    text(base,(16,33),'Hand an die Hüfte',23,bold=True)
    text(base,(16,64),'Neue Idle-Probe · V3',12,MUTED)
    for box in [(12,90,292,260),(12,276,292,558)]:d.rounded_rectangle(box,radius=8,fill=PANEL,outline='#45606a')
    text(base,(24,101),'KARTENMASSSTAB · 1×',12,GOLD,True)
    tile=Image.open(ROOT/'public/assets/Grass Tileset.png').convert('RGBA').crop((128,64,192,128)).resize((40,40),Image.Resampling.NEAREST)
    world=Image.new('RGBA',(278,110))
    for y in range(0,110,40):
        for x in range(0,278,40):world.alpha_composite(tile,(x,y))
    base.alpha_composite(world,(13,128));sprite(base,runtime('mara'),(76,222))
    text(base,(76,248),'Original',12,anchor='mm');text(base,(228,248),'Vorschau',12,anchor='mm')
    text(base,(24,289),'GESTE IM DETAIL · 4×',12,GOLD,True)
    d.line((32,543,272,543),fill='#45606a')
    text(base,(152,577),'Nur Vorschau · 304 px nativ',12,GOLD,anchor='mm')
    return base


def build():
    candidates,anchors=pack();(OUT/'frames').mkdir(exist_ok=True)
    (OUT/'keys').mkdir(exist_ok=True)
    for key in sorted(set(ORDER)):candidates[key].save(OUT/'keys'/f'source-{key:02d}.png')
    frames=[candidates[key] for key in ORDER]
    for i,frame in enumerate(frames):frame.save(OUT/'frames'/f'{i:02d}.png')
    contact=Image.new('RGBA',(len(frames)*160,280),BG)
    for i,frame in enumerate(frames):
        text(contact,(i*160+8,10),str(i),12,GOLD)
        sprite(contact,frame,(i*160+80,260),4)
        sprite(contact,frame,(i*160+80,86))
    contact.convert('RGB').save(OUT/'contact-sheet.png')
    durations=DURATIONS
    renders=[];base=card()
    for frame in frames:
        im=base.copy();sprite(im,frame,(228,222));sprite(im,frame,(152,540),4);renders.append(im.convert('RGB'))
    atlas=Image.new('RGB',(304*len(renders),600))
    for i,im in enumerate(renders):atlas.paste(im,(304*i,0))
    palette=atlas.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
    encoded[0].save(GIF,save_all=True,append_images=encoded[1:],duration=durations,loop=0,disposal=1,optimize=False)
    renders[3].save(OUT/'preview.png')
    with Image.open(GIF) as gif:gif_durations=[f.info['duration'] for f in ImageSequence.Iterator(gif)]
    manifest=dict(version=3,previewOnly=True,source=SOURCE.relative_to(HERE).as_posix(),sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        method='Four selected authored poses, same reverse path, shared stable head/wrench/boots, no deformation or frame blending',
        scale=SCALE,anchors=anchors,sourceOrder=ORDER,uniquePoses=len(set(ORDER)),frames=len(frames),durationsMs=durations,gif=GIF.name,gifFrames=len(gif_durations),gifDurationsMs=gif_durations,loopMs=sum(durations),gifBytes=GIF.stat().st_size)
    (OUT/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8');print(json.dumps(manifest))


if __name__=='__main__':build()
