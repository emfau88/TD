"""Read the local Frakassets archive. Optional comparisons stay outside Git/build.
No network, image resampling, normal maps, source archives or attack code in runtime.
"""
from pathlib import Path
from PIL import Image
import argparse, colorsys, hashlib, io, json, zipfile

ROOT = Path(__file__).resolve().parents[3]
GAME = ROOT / 'experiments/idle-bastion'
PRIVATE = GAME / '.local-assets'
PUBLIC = GAME / 'assets/local-monsters'
FRAMES = {'South': 'down', 'East': 'side', 'North': 'up', 'West': 'left'}
SELECTED = {'mushroom-monster-red': 'MossShroom', 'fuzzy-spider-purple': 'WoodSpider',
            'horned-bat-purple': 'HornedBat', 'bomb-walker-black': 'EmberBomb'}

def png(data):
    return Image.open(io.BytesIO(data)).convert('RGBA')

def digest(data):
    return hashlib.sha256(data).hexdigest()

def frak_data(z, creature, size, outline):
    stem = f'free_monster_pack_frakassets/{creature}/{creature}_{size}px_top-down'
    meta = json.loads(z.read(stem+'.json'))
    im = Image.alpha_composite(png(z.read(stem+f'_{outline}_lit.png')), png(z.read(stem+f'_{outline}_shine.png')))
    clips = {}
    for f in meta['frames']:
        pix = f['pixor']; q = f['frame']
        assert not f['rotated'] and not f['trimmed']
        clips.setdefault(pix['action'], {}).setdefault(FRAMES[pix['side']], []).append(
            dict(x=q['x'], y=q['y'], w=q['w'], h=q['h'], ms=f['duration'], pivot=pix['pivot'], index=pix['index']))
    for dirs in clips.values():
        for cells in dirs.values(): cells.sort(key=lambda f:f['index'])
    return im, clips

def moss_palette(im):
    # Optional cosmetic skin of the CC-BY mushroom. Preserve outlines, body,
    # alpha and luminance; rotate only saturated red cap pixels to moss green.
    out = im.copy(); pixels=[]
    for r,g,b,a in im.getdata():
        h,s,v=colorsys.rgb_to_hsv(r/255,g/255,b/255)
        if a and (h<.07 or h>.94) and s>.35 and v>.18:
            r,g,b=(round(c*255) for c in colorsys.hsv_to_rgb(.27,s*.8,v*.86))
        pixels.append((r,g,b,a))
    out.putdata(pixels); return out

def runtime(z, creature, enemy):
    im, clips = frak_data(z,creature,48,'outline')
    action = 'Walk' if 'Walk' in clips else 'Idle'
    atlas = Image.new('RGBA',(8*64,8*64 if enemy=='MossShroom' else 4*64))
    move={}; source=[]
    for row,(direction,cells) in enumerate(clips[action].items()):
        frames=[];durations=[]
        for col,f in enumerate(cells):
            tile=im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h']))
            px,py=32-f['pivot']['x'],43-f['pivot']['y']
            bounds=tile.getbbox(); assert bounds and bounds[0]+px>=0 and bounds[2]+px<=64 and bounds[1]+py>=0 and bounds[3]+py<=64
            atlas.alpha_composite(tile,(col*64+px,row*64+py))
            frames.append(row*8+col);durations.append(f['ms']);source.append(dict(direction=direction,source=f))
        move[direction]=dict(frames=frames,durations=durations)
    if enemy=='MossShroom':
        base=atlas.crop((0,0,512,256));atlas.alpha_composite(moss_palette(base),(0,256))
    PUBLIC.mkdir(parents=True,exist_ok=True);atlas.save(PUBLIC/(enemy+'.png'),optimize=True)
    (PUBLIC/(enemy+'-frames.json')).write_text(json.dumps(dict(sourceCreature=creature,sourceSize=48,sourceAngle='top-down',action=action,frames=source),indent=2),encoding='utf-8')
    return dict(key='idle-enemy-'+enemy,width=64,height=64,scale=.83,facesLeft=False,move=move,skins=2 if enemy=='MossShroom' else 1)

def main():
    ap=argparse.ArgumentParser(description='Import only the local Frakassets Free Monster Pack.')
    ap.add_argument('--downloads',type=Path,default=Path.home()/'Downloads')
    ap.add_argument('--runtime',action='store_true',help='Regenerate the four production atlases only.')
    ap.add_argument('--gallery',action='store_true',help='Also generate the optional local resolution comparison.')
    args=ap.parse_args()
    archive=args.downloads/'free_monster_pack_frakassets.zip'
    data=archive.read_bytes();z=zipfile.ZipFile(io.BytesIO(data));assert z.testzip() is None
    gallery_count=0
    if args.gallery or not args.runtime:
        PRIVATE.mkdir(parents=True,exist_ok=True);gallery={'frak':[]}
        for creature in sorted({n.split('/')[1] for n in z.namelist() if len(n.split('/'))>2}):
            versions={}
            for size in [16,32,48,64]:
                for outline in ['outline','no-outline']:
                    im,clips=frak_data(z,creature,size,outline);name=f'{creature}-{size}-{outline}.png';im.save(PRIVATE/name,optimize=True)
                    versions[f'{size}-{outline}']=dict(url='./.local-assets/'+name,clips=clips)
            gallery['frak'].append(dict(id=creature,versions=versions,scale=.83))
        (PRIVATE/'gallery.json').write_text(json.dumps(gallery,ensure_ascii=False),encoding='utf-8')
        gallery_count=len(gallery['frak'])
    if args.runtime:
        frames={enemy:runtime(z,c,enemy) for c,enemy in SELECTED.items()}
        (GAME/'src/local-enemy-frames.ts').write_text('// Generated by scripts/import-local-enemies.py --runtime from the local CC-BY archive.\nexport const LOCAL_ENEMY_FRAMES = '+json.dumps(frames)+' as const;\n',encoding='utf-8')
        (PUBLIC/'LICENSE-Frakassets.txt').write_bytes(z.read('free_monster_pack_frakassets/LICENSE.txt'))
        (PUBLIC/'sources.json').write_text(json.dumps([dict(file=archive.name,sha256=digest(data),bytes=len(data))],indent=2),encoding='utf-8')
    print(json.dumps(dict(frakCreatures=gallery_count,runtime=args.runtime,requiredArchives=1)))

if __name__=='__main__': main()
