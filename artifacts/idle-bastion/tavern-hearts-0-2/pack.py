"""Read existing approved-family exports; write only this independent test package.

No image generation, retouching, rig edits, or changes to source exports.
The 480x800 display derivative is resampled once; WebP packing is lossless.
"""
from pathlib import Path
import hashlib
import json
import sys
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
M = 'mara-proportions-v1/reactions-v1/preview'
I = 'ilyra-rig-prep/'
SOURCES = {
    'mara': {
        'idle': (M, ['clips','idle'], 'Ruhe', 0),
        'head': (M, ['clips','head'], 'Kopfreaktion', 0),
        'touch': (M, ['clips','touch'], 'Berührung', 0),
        'variant': (M, ['clips','glance'], 'Blickkontakt', 2),
        'joy': (M, ['clips','joy'], 'Freudiges Aufrichten', 2),
        'giggle': (M, ['clips','giggle'], 'Kichern', 2),
    },
    'ilyra': {
        'idle': (I+'hip-v1/preview', ['clips','idle'], 'Ruhe', 0),
        'head': (I+'forearm-hands-v2/preview', ['clips','head'], 'Kopfreaktion', 0),
        'touch': (I+'touch-v1/preview', ['clips','touch'], 'Berührung', 0),
        'variant': (I+'idle-v2/preview', ['clips','variant'], 'Gewichtswechsel', 2),
        'joy': (I+'mini-hop-v3/preview', ['clips','hop'], 'Kleiner Hüpfer', 2),
        'giggle': (I+'giggle-v1/preview', ['clips','giggle'], 'Kichern', 2),
    },
}

def source(hero, key):
    folder, keys, label, heart = SOURCES[hero][key]
    path = ROOT/folder/'manifest.json'
    manifest = json.loads(path.read_text(encoding='utf-8'))
    clip = manifest
    for k in keys:
        clip = clip[k]
    if hero=='mara':
        clip={**clip,**clip['versions']['after']}
    return path.parent, manifest, clip, label, heart

def original_frame(hero, key, n, cache=None):
    unified = HERE/'unity-export'/key/'frames'/f'frame-{n:03d}.png'
    if hero=='ilyra' and unified.exists():
        return Image.open(unified).convert('RGBA')
    folder, manifest, clip, _, _ = source(hero,key)
    if 'frames' in clip:
        p,x,y,w,h = clip['frames'][n]
        path = folder/clip['pages'][p]
    else:
        w,h = manifest['width'],manifest['height']
        path = folder/clip.get('sheets',clip.get('pages'))[n//8]
        x,y = n%4*w,(n%8)//4*h
    if cache is not None and path in cache:
        page = cache[path]
    else:
        page = Image.open(path).convert('RGBA')
        if cache is not None:
            cache.clear()
            cache[path] = page
    frame = page.crop((x,y,x+w,y+h))
    if 'frames' in clip:
        full = Image.new('RGBA',(768,1024))
        full.paste(frame,clip['crop'][:2])
        return full
    return frame

def display(frame, hero):
    canvas = Image.new('RGBA',(480,800))
    size, pos = ((576,768),(-48,16)) if hero=='mara' else ((480,800),(0,-25))
    canvas.paste(frame.resize(size,Image.Resampling.LANCZOS),pos)
    # RGB under zero alpha has no visual content. Canonicalize for exact checks.
    a = np.array(canvas)
    a[a[:,:,3]==0] = 0
    return Image.fromarray(a)

def difference(a,b):
    aa,bb = np.array(a).astype(int),np.array(b).astype(int)
    aa[aa[:,:,3]==0]=0;bb[bb[:,:,3]==0]=0
    changed = np.any(aa!=bb,axis=2)
    coords = np.argwhere(changed)
    return {'pixels':int(changed.sum()),'meanChannelDelta':round(float(np.abs(aa-bb).mean()),5),
            'box': [int(coords[:,1].min()),int(coords[:,0].min()),int(coords[:,1].max()+1),int(coords[:,0].max()+1)] if len(coords) else None}

def inspect():
    report = {}
    for hero, clips in SOURCES.items():
        rest = display(original_frame(hero,'idle',0),hero)
        report[hero] = {}
        for key in clips:
            folder, manifest, clip, label, heart = source(hero,key)
            count = round(clip['duration']*manifest['fps'])
            first = display(original_frame(hero,key,0),hero)
            last = display(original_frame(hero,key,count-1),hero)
            report[hero][key] = {'restDifference':difference(rest,first),'lastToFirst':difference(last,first),'count':count}
        rest.save(HERE/'qa'/f'{hero}-display.png')
    (HERE/'qa'/'endpoints.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
    print(json.dumps(report,indent=2),flush=True)

def pack(hero,key):
    folder, manifest, clip, label, heart = source(hero,key)
    fps=manifest['fps']; count=round(clip['duration']*fps)
    out=HERE/'assets'/('mara-proportions-v1' if hero=='mara' else hero)/key;out.mkdir(parents=True,exist_ok=True)
    pages=[]; cache={}; checks=0; rest_frames=[]
    rest=np.array(display(original_frame(hero,key,0),hero))
    for start in range(0,count,8):
        # Max texture 1920x1600, eight frames / 267ms, bounded decoded memory.
        sheet=Image.new('RGBA',(1920,1600))
        for n in range(start,min(start+8,count)):
            frame=display(original_frame(hero,key,n,cache),hero)
            if np.array_equal(np.array(frame),rest):rest_frames.append(n)
            sheet.paste(frame,((n-start)%4*480,(n-start)//4*800))
        path=out/f'{start//8:02d}.webp'
        sheet.save(path,lossless=True,method=3,exact=True)
        decoded=Image.open(path).convert('RGBA')
        assert np.array_equal(np.array(sheet),np.array(decoded)),path
        checks+=1;pages.append(path.relative_to(HERE).as_posix())
    manifest_path=folder/'manifest.json'
    origins=[manifest_path]+[(folder/name).resolve() for name in clip.get('pages',clip.get('sheets',[]))]
    hashes={p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in origins}
    total=sum((HERE/p).stat().st_size for p in pages)
    print(f'{hero}/{key}: {count} frames, {total/1024/1024:.2f} MiB, {checks} lossless pages',flush=True)
    return hero,key,{'label':label,'minHeart':heart,'duration':clip['duration'],'fps':fps,'count':count,'pages':pages,'bytes':total,'restFrames':rest_frames,'source':manifest_path.relative_to(ROOT).as_posix()},hashes

if __name__=='__main__':
    (HERE/'qa').mkdir(exist_ok=True)
    if '--mara-current' not in sys.argv:inspect()
    if '--inspect' not in sys.argv:
        data={'width':480,'height':800,'columns':4,'perPage':8,'heroes':{h:{} for h in SOURCES}};hashes={}
        if '--mara-current' in sys.argv:data=json.loads((HERE/'manifest.json').read_text(encoding='utf-8'))
        jobs=[(h,k) for h in SOURCES for k in SOURCES[h] if '--mara-current' not in sys.argv or h=='mara']
        with ThreadPoolExecutor(max_workers=3) as pool:
            for hero,key,clip,hh in pool.map(lambda x:pack(*x),jobs):
                data['heroes'][hero][key]=clip;hashes.update(hh)
        (HERE/'manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
        (HERE/'qa'/('source-hashes-mara-current.json' if '--mara-current' in sys.argv else 'source-hashes.json')).write_text(json.dumps(hashes,indent=2),encoding='utf-8')
