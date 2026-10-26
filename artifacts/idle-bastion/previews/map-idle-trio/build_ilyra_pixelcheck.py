"""Display-only control: identical V3 animation, narrower native-size mobile GIF."""
import json
from PIL import Image,ImageDraw,ImageSequence
from build_previews import HERE,ROOT,BG,PANEL,GOLD,MUTED,text,sprite,runtime

OUT=HERE/'ilyra-hip'/'pixelcheck'
GIF='Ilyra-Hip-Shift-Pixelcheck.gif'


def build():
    OUT.mkdir(exist_ok=True)
    source=HERE/'ilyra-hip'/'rig-v3'
    manifest=json.loads((source/'animation.json').read_text())
    frames=[Image.open(source/f'{i:02d}.png').convert('RGBA') for i in range(manifest['frames'])]
    base=Image.new('RGBA',(304,600),BG);d=ImageDraw.Draw(base)
    text(base,(16,14),'SPIRE / ILYRA',11,GOLD,True)
    text(base,(16,33),'Hip Shift · Pixelprobe',21,bold=True)
    text(base,(16,62),'Gleiche V3-Bewegung · 3,4 s',12,MUTED)
    for box in [(12,90,292,260),(12,276,292,558)]:d.rounded_rectangle(box,radius=8,fill=PANEL,outline='#45606a')
    text(base,(24,101),'KARTENMASSSTAB · 1×',12,GOLD,True)
    tile=Image.open(ROOT/'public/assets/Grass Tileset.png').convert('RGBA').crop((128,64,192,128)).resize((40,40),Image.Resampling.NEAREST)
    world=Image.new('RGBA',(278,110))
    for y in range(0,110,40):
        for x in range(0,278,40):world.alpha_composite(tile,(x,y))
    base.alpha_composite(world,(13,128))
    sprite(base,runtime('ilyra'),(76,222))
    text(base,(76,248),'Original',12,anchor='mm');text(base,(228,248),'Vorschau',12,anchor='mm')
    text(base,(24,289),'GESTE IM DETAIL · 4×',12,GOLD,True)
    d.line((32,543,272,543),fill='#45606a')
    text(base,(152,577),'304 px · bitte unskaliert ansehen',12,GOLD,anchor='mm')
    renders=[]
    for frame in frames:
        im=base.copy();sprite(im,frame,(228,222));sprite(im,frame,(152,540),4);renders.append(im.convert('RGB'))
    palette_source=Image.new('RGB',(304*len(renders),600))
    for i,f in enumerate(renders):palette_source.paste(f,(304*i,0))
    palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    encoded=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in renders]
    encoded[0].save(HERE/GIF,save_all=True,append_images=encoded[1:],duration=manifest['durationsMs'],loop=0,optimize=False,disposal=1)
    with Image.open(HERE/GIF) as gif:
        durations=[f.info['duration'] for f in ImageSequence.Iterator(gif)]
        output=dict(displayOnly=True,sourceAnimation='ilyra-hip/rig-v3/animation.json',
            gif=GIF,size=[304,600],frames=gif.n_frames,loopMs=sum(durations),
            sourceFramesUnchanged=True,sourceTimingUnchanged=True,
            reason='The user-visible 390px GIF was scaled to 318.997px with image-rendering:auto.',
            visualAcceptance='Not claimed; this isolates display resampling from animation contour changes.')
    (OUT/'manifest.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(output))


if __name__=='__main__':build()
