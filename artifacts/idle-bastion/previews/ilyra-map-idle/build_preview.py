"""Mechanical sprite packing + GIF assembly; artwork comes from imagegen/source poses.
Run from any directory with Python + Pillow. Never writes production assets.
"""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
ART = ROOT / 'experiments/idle-bastion/assets/ilyra'
SOURCE = HERE / 'source/poses.png'
SCALE = .109
# Measured in each source cell: common foot baseline and planted spear axis.
FEET = [494, 495, 495, 495, 469, 469, 469, 469]
ANCHOR_X = [199, 199, 203, 185, 199, 211, 211, 199]
PHASES = ['Starke Idle-Pose', 'Speer anheben', 'Speer setzen', 'Hüfte nach außen',
          'Kleine Drehung', 'Spielerisch öffnen', 'Speer aufnehmen', 'Zurück in Idle']
SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 0]
DURATIONS = [850, 200, 220, 380, 340, 280, 220, 260, 450]
source = Image.open(SOURCE).convert('RGBA')
assert source.size == (1536, 1024)
frames = []
for i in range(8):
    cell = source.crop((i % 4 * 384, i // 4 * 512, (i % 4 + 1) * 384, (i // 4 + 1) * 512))
    # Same nearest-neighbour/binary-alpha approach as the runtime asset contract.
    cell.putalpha(cell.getchannel('A').point(lambda a: 255 if a >= 200 else 0))
    frame = cell.transform((64, 64), Image.Transform.AFFINE,
        (1 / SCALE, 0, ANCHOR_X[i] - 32 / SCALE, 0, 1 / SCALE, FEET[i] - 56 / SCALE),
        resample=Image.Resampling.NEAREST)
    bounds = frame.getbbox()
    assert bounds and 0 < bounds[0] < bounds[2] < 64 and 0 < bounds[1] < bounds[3] < 64, (i, bounds)
    frame.save(HERE / 'frames' / f'{i:02d}.png')
    frames.append(frame)
atlas = Image.new('RGBA', (512, 64))
for i, frame in enumerate(frames): atlas.paste(frame, (i * 64, 0))
atlas.save(HERE / 'idle-preview.png')
runtime = Image.open(ART / 'ilyra-atlas.png').convert('RGBA').crop((0, 0, 64, 64))
grass = Image.open(ROOT / 'public/assets/Grass Tileset.png').convert('RGBA').crop((128, 64, 192, 128)).resize((40, 40), Image.Resampling.NEAREST)
tower = Image.open(ROOT / 'public/assets/Tower 01.png').convert('RGBA').crop((0, 0, 64, 128)).resize((40, 81), Image.Resampling.NEAREST)
weapon = Image.open(ROOT / 'public/assets/Tower 01 - Level 01 - Weapon.png').convert('RGBA').crop((0, 0, 96, 96)).resize((60, 60), Image.Resampling.NEAREST)
fontdir = Path('C:/Windows/Fonts')
def font(size, bold=False):
    return ImageFont.truetype(str(fontdir / ('segoeuib.ttf' if bold else 'segoeui.ttf')), size)
BG, PANEL, INK, GOLD, MUTED = '#101c24', '#1a2a35', '#f3e7cf', '#d2b67c', '#b6c8cc'
def text(im, xy, value, size=14, fill=INK, bold=False, anchor=None):
    ImageDraw.Draw(im).text(xy, value, font=font(size,bold), fill=fill, anchor=anchor)
def sprite(im, frame, foot, scale=1):
    scaled=frame.resize((64*scale,64*scale),Image.Resampling.NEAREST)
    im.alpha_composite(scaled,(foot[0]-32*scale,foot[1]-56*scale))
def card(im, box):
    ImageDraw.Draw(im).rounded_rectangle(box, radius=9, fill=PANEL, outline='#45606a', width=1)
base=Image.new('RGBA',(390,680),BG)
text(base,(18,16),'SPIRE  /  ANIMATIONSPROBE',11,GOLD,True)
text(base,(18,36),'Ilyra · Speer-Idle',24,bold=True)
text(base,(18,69),'8 Posen · 3,2 s · nur Vorschau',13,MUTED)
card(base,(16,100,374,296))
text(base,(28,111),'KARTENMASSSTAB · 1×',12,GOLD,True)
world=Image.new('RGBA',(356,130))
for y in range(0,130,40):
    for x in range(0,356,40): world.alpha_composite(grass,(x,y))
# Existing tower is a scale cue only, with the runtime 0.63 scale.
world.alpha_composite(tower,(158,8))
world.alpha_composite(weapon,(148,6))
base.alpha_composite(world,(17,139))
def shadow(im, foot):
    layer=Image.new('RGBA',im.size)
    ImageDraw.Draw(layer).ellipse((foot[0]-10,foot[1]-2,foot[0]+10,foot[1]+5),fill=(20,46,48,56))
    im.alpha_composite(layer)
shadow(base,(100,243))
sprite(base,runtime,(100,243))
text(base,(100,276),'Bisher',12,anchor='mm')
text(base,(290,276),'Vorschau',12,anchor='mm')
card(base,(16,310,374,610))
text(base,(28,323),'GESTE IM DETAIL · 4×',12,GOLD,True)
ImageDraw.Draw(base).line((48,578,342,578),fill='#52727b',width=1)
text(base,(195,654),'Gleicher Körpermaßstab · keine Spiellogik',12,MUTED,anchor='mm')
renders=[]
for i in SEQUENCE:
    im=base.copy()
    # Shadows and labels are preview context, never baked into the sprite atlas.
    shadow(im,(290,243))
    sprite(im,frames[i],(290,243))
    sprite(im,frames[i],(195,576),4)
    text(im,(195,630),PHASES[i],15,GOLD,True,anchor='mm')
    renders.append(im.convert('RGB'))
# One palette across the loop prevents independent palette shimmer.
palette_source=Image.new('RGB',(390*len(renders),680))
for i, im in enumerate(renders): palette_source.paste(im,(390*i,0))
palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
encoded=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in renders]
encoded[0].save(HERE/'Ilyra-Speer-Idle-Handy.gif',save_all=True,append_images=encoded[1:],
    duration=DURATIONS,loop=0,optimize=False,disposal=1)
renders[4].save(HERE/'preview.png')
contact=Image.new('RGBA',(4*176,2*204),BG)
for i, frame in enumerate(frames):
    x,y=i%4*176,i//4*204
    text(contact,(x+10,y+8),f'{i+1:02d} · {PHASES[i]}',11,GOLD)
    sprite(contact,frame,(x+88,y+184),3)
contact.convert('RGB').save(HERE/'contact-sheet.png')
sha=lambda p:hashlib.sha256(p.read_bytes().replace(b'\r\n',b'\n') if p.suffix == '.ts' else p.read_bytes()).hexdigest()
manifest={
    'previewOnly':True,'directions':['down'],'frameSize':[64,64],'foot':[32,56],
    'uniquePoses':8,'sequence':SEQUENCE,'durationsMs':DURATIONS,'loopMs':sum(DURATIONS),
    'firstLastIdentical':renders[0].tobytes()==renders[-1].tobytes(),
    'sourceScale':SCALE,'sourceAlphaThreshold':200,'sourceAnchorX':ANCHOR_X,'sourceFootY':FEET,
    'plantedFrames':[2,3,4,5],'plantedSpearX':21,'gifSize':[390,680],
    'bounds':[f.getbbox() for f in frames],
    'basis':{p.relative_to(ROOT).as_posix():sha(p) for p in [ART/'ilyra-atlas.png',ART/'sources/stand-approved.png',ROOT/'experiments/idle-bastion/src/ilyra-view.ts',ROOT/'experiments/idle-bastion/src/ilyra.ts']},
    'textHashNewlines':'LF',
    'sourceSha256':sha(SOURCE),'gifBytes':(HERE/'Ilyra-Speer-Idle-Handy.gif').stat().st_size,
}
assert manifest['firstLastIdentical']
(HERE/'animation.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:manifest[k] for k in ['uniquePoses','loopMs','gifBytes','bounds','firstLastIdentical']}))
