"""Ilyra V3: animate one consistent drawing with a small, explicit pixel rig.

No generated pose changes, optical flow, crossfade, blur or soft alpha.
The spear, gripping hand and planted feet stay anchored. Only preview outputs.
"""
import hashlib
import json
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageSequence
from build_previews import HERE, BG, GOLD, MUTED, backdrop, sprite, text

OUT=HERE/'ilyra-hip'/'rig-v3'
SOURCE=HERE/'ilyra-hip'/'keys'/'00.png'
GIF='Ilyra-Hip-Shift-Handy-V3.gif'
xx,yy=np.meshgrid(np.arange(64,dtype=np.float32),np.arange(64,dtype=np.float32))


def pose(source,amount):
    # Row anchors in map pixels: head/neck counterpose, waist/hip accent,
    # knee bend and a smooth return to the original planted lower legs.
    row_shift=np.interp(yy,[0,30,34,38,42,46,51,63],[-1,-1,0,3,3,1.5,0,0]).astype(np.float32)
    # The anchored spear arm is independent of the body. Face pixels x>=29
    # translate together; they never morph into a different drawing.
    grip_weight=np.clip((xx-25)/4,0,1)
    grip_weight=np.where((yy<=30)&(xx>=26),1,grip_weight)
    # Snap displacement, not absolute sample coordinates: half-pixel ties in
    # nearest-neighbour remapping can otherwise duplicate alternate columns.
    dx=np.floor(row_shift*amount*grip_weight+.5)
    result=cv2.remap(np.asarray(source),xx-dx,yy,cv2.INTER_NEAREST,borderMode=cv2.BORDER_CONSTANT)
    return Image.fromarray(result)


def build():
    OUT.mkdir(exist_ok=True)
    source=Image.open(SOURCE).convert('RGBA')
    # Eight visible movement samples each way; same path on return. Calm idle
    # pauses are explicit rather than fabricated by blended duplicate frames.
    outbound=[.125,.25,.375,.5,.625,.75,.875,1.0]
    amounts=[0]+outbound+list(reversed([0]+outbound[:-1]))
    durations=[600]+[120]*8+[120]*8
    durations[8]+=360;durations[-1]+=520
    frames=[pose(source,a) for a in amounts]
    for i,f in enumerate(frames):f.save(OUT/f'{i:02d}.png')
    base=backdrop('ilyra-hip',{'title':'Ilyra · Hip Shift'},sum(durations))
    ImageDraw.Draw(base).rectangle((16,65,374,96),fill=BG)
    text(base,(18,69),f'V3 · eine Zeichnung · {sum(durations)/1000:g} s',13,MUTED)
    renders=[]
    for f in frames:
        im=base.copy();sprite(im,f,(290,243));sprite(im,f,(195,576),4);renders.append(im.convert('RGB'))
    all_pixels=Image.new('RGB',(390*len(renders),680))
    for i,im in enumerate(renders):all_pixels.paste(im,(390*i,0))
    palette=all_pixels.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
    encoded[0].save(HERE/GIF,save_all=True,append_images=encoded[1:],duration=durations,loop=0,optimize=False,disposal=1)
    with Image.open(HERE/GIF) as gif:
        gif_durations=[f.info['duration'] for f in ImageSequence.Iterator(gif)]
    sheet=Image.new('RGBA',(9*128,190),BG)
    for i,f in enumerate(frames[:9]):
        text(sheet,(i*128+8,8),f'{i:02d} · {amounts[i]:g}',11,GOLD)
        sprite(sheet,f,(i*128+64,180),3)
    sheet.convert('RGB').save(OUT/'contact-sheet.png')
    renders[8].save(OUT/'preview.png')
    manifest=dict(version=3,previewOnly=True,source=str(SOURCE.relative_to(HERE)),
        sourceSha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        method='One source drawing; explicit row/joint displacement; nearest-neighbour pixel sampling; no optical flow, blending or blur',
        amounts=amounts,durationsMs=durations,frames=len(frames),gif=GIF,gifFrames=len(gif_durations),
        gifDurationsMs=gif_durations,loopMs=sum(gif_durations),gifBytes=(HERE/GIF).stat().st_size,
        frameSize=[64,64],foot=[32,56],maxHipShift=3,maxHeadCounterShift=1,
        rowAnchors=[0,30,34,38,42,46,51,63],rowShifts=[-1,-1,0,3,3,1.5,0,0],
        fixedSpearRight=26,fixedBootsY=51)
    (OUT/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(manifest))


if __name__=='__main__':build()
