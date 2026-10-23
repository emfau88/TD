"""Read the user's existing ZIPs. Restricted comparisons stay outside Git/build.
No network, image resampling, normal maps, source archives or attack code in runtime.
"""
from pathlib import Path
from PIL import Image
import argparse, collections, colorsys, hashlib, io, json, zipfile

ROOT = Path(__file__).resolve().parents[3]
GAME = ROOT / 'experiments/idle-bastion'
PRIVATE = GAME / '.local-assets'
PUBLIC = GAME / 'assets/local-monsters'
SHROOMS = ['dotcap', 'gillcap', 'mushmanflat', 'mushmanpointy', 'mushmanskullshroom']
FRAMES = {'South': 'down', 'East': 'side', 'North': 'up', 'West': 'left'}
SELECTED = {'mushroom-monster-red': 'MossShroom', 'fuzzy-spider-purple': 'WoodSpider',
            'horned-bat-purple': 'HornedBat', 'bomb-walker-black': 'EmberBomb'}

def png(data):
    return Image.open(io.BytesIO(data)).convert('RGBA')

def digest(data):
    return hashlib.sha256(data).hexdigest()

def shroom_clips(im):
    # Observed PNG layout, not the advertised 5x4 grid: movement has FOUR
    # populated cells; column five and rows 8–11 are transparent placeholders.
    result = {}
    for action, first in [('Walk', 0), ('Attack', 4), ('Run', 12), ('Damaged', 16), ('Hide', 20)]:
        result[action] = {}
        for offset, direction in enumerate(['down', 'up', 'side', 'left']):
            row = first + offset
            cells = [{'x': col*64, 'y': row*32, 'w':64, 'h':32, 'ms':120 if action!='Run' else 85}
                     for col in range(5) if im.crop((col*64,row*32,(col+1)*64,(row+1)*32)).getbbox()]
            result[action][direction] = cells
    return result

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
    ap=argparse.ArgumentParser();ap.add_argument('--downloads',type=Path,default=Path.home()/'Downloads');ap.add_argument('--runtime',action='store_true');args=ap.parse_args()
    PRIVATE.mkdir(parents=True,exist_ok=True)
    gallery={'shrooms':[], 'frak':[], 'spores':[], 'inventory':[]}; seen={}
    for typ in SHROOMS:
        path=args.downloads/(typ+'-colorways.zip');data=path.read_bytes();z=zipfile.ZipFile(io.BytesIO(data));assert z.testzip() is None
        gallery['inventory'].append(dict(file=path.name,sha256=digest(data),bytes=len(data)))
        variants=[]
        for name in z.namelist():
            base=Path(name).name
            if not base.startswith(typ+'-') or not base.endswith('.png'):continue
            raw=z.read(name);im=png(raw);assert im.size==(320,768)
            assert base not in seen or seen[base]==digest(raw)
            seen[base]=digest(raw);(PRIVATE/base).write_bytes(raw)
            variants.append(dict(name=base.removesuffix('.png').removeprefix(typ+'-'),url='./.local-assets/'+base))
        gallery['shrooms'].append(dict(id=typ,variants=variants,clips=shroom_clips(im),scale=1.35,pivot={'x':32,'y':31}))
    # The flat ZIP repeats the other three character families. Verify duplicate
    # bytes against their canonical archives, rather than inventing 155 variants.
    flat=zipfile.ZipFile(args.downloads/'mushmanflat-colorways.zip');duplicates=0
    for name in flat.namelist():
        base=Path(name).name
        if base in seen and not base.startswith('mushmanflat-'):
            assert digest(flat.read(name))==seen[base];duplicates+=1
    gallery['duplicateFilesInFlatZip']=duplicates
    z=zipfile.ZipFile(args.downloads/'free_monster_pack_frakassets.zip');assert z.testzip() is None
    for creature in sorted({n.split('/')[1] for n in z.namelist() if len(n.split('/'))>2}):
        versions={}
        for size in [16,32,48,64]:
            for outline in ['outline','no-outline']:
                im,clips=frak_data(z,creature,size,outline);name=f'{creature}-{size}-{outline}.png';im.save(PRIVATE/name,optimize=True)
                versions[f'{size}-{outline}']=dict(url='./.local-assets/'+name,clips=clips)
        gallery['frak'].append(dict(id=creature,versions=versions,scale=.83))
    zsp=zipfile.ZipFile(args.downloads/'sporeburst-colorways.zip');assert zsp.testzip() is None
    for name in zsp.namelist():
        if name.endswith('.png'):
            base=Path(name).name;(PRIVATE/base).write_bytes(zsp.read(name));gallery['spores'].append(dict(name=base,url='./.local-assets/'+base))
    gallery['shadows']='Excluded: SPIRE already draws contact shadows.'
    (PRIVATE/'gallery.json').write_text(json.dumps(gallery,ensure_ascii=False),encoding='utf-8')
    if args.runtime:
        frames={enemy:runtime(z,c,enemy) for c,enemy in SELECTED.items()}
        (GAME/'src/local-enemy-frames.ts').write_text('// Generated by scripts/import-local-enemies.py --runtime from the local CC-BY archive.\nexport const LOCAL_ENEMY_FRAMES = '+json.dumps(frames)+' as const;\n',encoding='utf-8')
        (PUBLIC/'LICENSE-Frakassets.txt').write_bytes(z.read('free_monster_pack_frakassets/LICENSE.txt'))
        names=[*(t+'-colorways.zip' for t in SHROOMS),'sporeburst-colorways.zip','ShroomShadows.png','free_monster_pack_frakassets.zip','Foozle_2DC0018_Lucifer_Skeleton_Grunt_Pixel_Art.zip','Foozle_2DC0030_Legend_EnemyPack_1.zip']
        (PUBLIC/'sources.json').write_text(json.dumps([dict(file=n,sha256=digest((args.downloads/n).read_bytes()),bytes=(args.downloads/n).stat().st_size) for n in names],indent=2),encoding='utf-8')
    print(json.dumps(dict(shroomVariants=sum(len(s['variants']) for s in gallery['shrooms']),duplicateFiles=duplicates,frakCreatures=len(gallery['frak']),runtime=args.runtime)))

if __name__=='__main__': main()
