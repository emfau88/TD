"""T11 review-only sprite preparation. Generated drawings, no warps or tweening.

Original sheets remain untouched. One constant nearest-neighbour scale per
generated sheet, integer belt registration, lossless RGBA packing.
"""
from pathlib import Path
from io import BytesIO
import json
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]

def save_sheet(folder, frames, timeline, labels):
    atlas = Image.new('RGBA', (384 * len(frames), 512))
    for i, frame in enumerate(frames):
        # A single fixed lower crop removes the generator's stray bottom-edge
        # flecks and the varying raw sheet cuts; no contour deformation.
        bottom=478 if folder.parent.name=='mara-tavern' else 448
        atlas.paste(frame.crop((0,0,384,bottom)), (i * 384, 0))
    atlas.save(folder / 'candidate.png')
    buffer = BytesIO()
    atlas.save(buffer, 'WEBP', lossless=True, exact=True, method=6)
    packed = buffer.getvalue()
    assert Image.open(BytesIO(packed)).convert('RGBA').tobytes() == atlas.tobytes()
    (folder / 'candidate.webp').write_bytes(packed)
    metadata = {'width': atlas.width, 'height': atlas.height, 'frameWidth': 384,
                'frameHeight': 512, 'idle': timeline, 'labels': labels}
    (folder / 'candidate.json').write_text(json.dumps(metadata, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    print(f'{folder.name}/{folder.parent.name}: {len(frames)} drawings, {len(packed):,} bytes, exact RGBA')

def original_frames(who):
    folder = ROOT / f'assets/{who}-tavern'
    metadata = json.loads((folder / f'{who}-atlas.json').read_text())
    source = Image.open(folder / f'{who}-atlas.png').convert('RGBA')
    frames = []
    for f in metadata['frames'][:4]:
        cell = source.crop((f['x'], f['y'], f['x']+f['width'], f['y']+f['height']))
        frame = Image.new('RGBA', (384, 512))
        frame.paste(cell, (192-f['anchorX'], 360-f['anchorY']))
        frames.append(frame)
    return frames

def main():
    folder = ROOT / 'assets/mara-tavern/idle-study'
    source = Image.open(folder / 'source-motion-r2.png').convert('RGBA')
    drawings = []
    for i, (ax,ay) in enumerate([(251,395),(250,395),(248,395),(251,392),(248,394),(248,394)]):
        x,y=round(i%3*source.width/3),(i//3)*591
        cell=source.crop((x,y,round((i%3+1)*source.width/3),y+591))
        cell=cell.resize((333,443),Image.Resampling.NEAREST)
        frame=Image.new('RGBA',(384,512))
        frame.paste(cell,(192-round(ax*.75),360-round(ay*.75)))
        drawings.append(frame)
    # One shared rest drawing locks hair outline, head, hands and belt.
    # Only actual Imagegen-drawn scarf/chest pixels are selected. Binary masks
    # do not blend, distort, shift or procedurally synthesize motion.
    breath=Image.new('L',(384,512))
    ImageDraw.Draw(breath).polygon([(166,204),(188,208),(213,201),(233,214),
        (229,225),(239,246),(254,270),(255,285),(245,301),(231,307),
        (162,307),(147,297),(146,278),(152,258),(157,240),(166,217)],fill=255)
    eyes=Image.new('L',(384,512))
    draw=ImageDraw.Draw(eyes)
    draw.polygon([(141,161),(150,156),(168,157),(173,163),(168,176),(151,178),(143,172)],fill=255)
    draw.polygon([(183,154),(192,149),(208,146),(213,150),(209,165),(194,169),(184,165)],fill=255)
    frames=[drawings[0]]
    for i in range(1,6):
        frames.append(Image.composite(drawings[i],drawings[0],breath if i<4 else eyes))
    for frame in frames:
        assert frame.getchannel('A').point(lambda a: 255 if a>=128 else 0).tobytes()==frames[0].getchannel('A').point(lambda a: 255 if a>=128 else 0).tobytes(), 'Stable silhouette'
        assert frame.crop((0,338,384,512)).tobytes()==frames[0].crop((0,338,384,512)).tobytes(), 'Fixed hands and belt'
    for frame in frames[1:4]:
        assert frame.crop((0,0,384,200)).tobytes()==frames[0].crop((0,0,384,200)).tobytes(), 'Fixed head/hair'
    # In particular blinking can never replace the hair or torso again.
    for i in (4,5):
        assert frames[i].crop((0,180,384,512)).tobytes()==frames[0].crop((0,180,384,512)).tobytes()
    save_sheet(folder,frames,[[0,700],[1,220],[2,220],[3,380],[2,240],[1,260],
               [0,1180],[4,60],[5,90],[4,70],[0,1220]],
               ['Ruhe · Kontur R2','Einatmen · Anfang','Einatmen · Mitte','Einatmen · Ende',
                'Lidschlag · halb','Lidschlag · geschlossen'])

    folder = ROOT / 'assets/ilyra-tavern/idle-study'
    source = Image.open(folder / 'source-motion.png').convert('RGBA')
    face_source = Image.open(folder / 'source-face-pass.png').convert('RGBA')
    donors=[]
    for i, ax in [(1,264),(2,263)]:
        cell=face_source.crop((round(i*2172/5),0,round((i+1)*2172/5),724)).resize((271,450),Image.Resampling.NEAREST)
        donor=Image.new('RGBA',(384,512))
        donor.paste(cell,(240-round(ax*450/724),360-round(497*450/724)))
        donors.append(donor)
    # Pack the same selected Imagegen facial accents into each motion frame.
    # The full face-pass sheet changed the nose between cells. Only these
    # generated feature pixels are used; skin/eyes/hair remain the motion art.
    # Hard alpha selection, never blending, morphing, or duplicate contours.
    nose=donors[0].crop((240,207,248,216)).resize((4,4),Image.Resampling.NEAREST)
    mouth=donors[1].crop((235,219,251,225)).resize((8,3),Image.Resampling.NEAREST)
    for detail in (nose,mouth):
        detail.putdata([(r,g,b,a if g<133 or (r>240 and g>190 and b>120) else 0)
                        for r,g,b,a in detail.getdata()])
    frames=[]
    scale=0.635
    for i, (ax,ay) in enumerate([(232,467),(235,467),(235,464),(232,459),(234,460)]):
        left,top=(i%3)*418,(i//3)*627
        cell=source.crop((left,top,left+418,top+627))
        cell=cell.resize((round(cell.width*scale),round(cell.height*scale)),Image.Resampling.NEAREST)
        frame=Image.new('RGBA',(384,512))
        # Existing Ilyra targetX=240, source scale=1.1. The review sheet is
        # registered in the 362px source coordinate space; renderer applies 1.1.
        frame.paste(cell,(240-round(ax*scale),360-round(ay*scale)))
        face_x, mouth_y=[(240,220),(239,219),(240,220),(241,220),(241,220)][i]
        frame.alpha_composite(nose,(face_x-2,mouth_y-11))
        frame.alpha_composite(mouth,(face_x-4,mouth_y-1))
        frames.append(frame)
    save_sheet(folder,frames,[[0,1600],[1,230],[2,340],[1,260],[0,1090],[3,80],[4,100],[3,80],[0,850]],
               ['Ruhe · Gesichtskorrektur','Atemzwischenpose','Kleine Einatmung','Halber Lidschlag','Augen geschlossen'])

if __name__ == '__main__':
    main()
