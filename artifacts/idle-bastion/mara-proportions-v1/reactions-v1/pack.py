"""Validate the unchanged motion, then package a separate lossless comparison."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import numpy as np
from PIL import Image

P = Path(__file__).resolve().parent
ROOT = P.parents[3]
V = P / 'preview'
V.mkdir(exist_ok=True)
BASE = P.parent / 'idle-rig'
OLD = P.parents[1] / 'mara-rig-v2/unity/Export'
specs = {'head': (60, 'HeadComparison/HeadReactionOrganic'),
         'touch': (84, 'BodyComparison/TouchReactionOrganic')}
manifest = {'width': 768, 'height': 1024, 'fps': 30, 'framesPerPage': 8, 'clips': {}}
idle = json.loads((BASE / 'preview/manifest.json').read_text())
manifest['clips']['idle'] = {'duration': 5, 'count': 150, 'last': 149, 'versions': {}}
for version in ('before', 'after'):
    manifest['clips']['idle']['versions'][version] = {
        'pages': ['../../idle-rig/preview/' + f for f in idle['clips'][version]['pages']]}

def rgba(path):
    with Image.open(path) as im:
        return np.array(im.convert('RGBA'))

def stats(a, b):
    d = np.abs(a.astype(np.int16) - b.astype(np.int16))
    return {'pixels': int(np.any(d, axis=2).sum()), 'maxChannel': int(d.max()),
            'meanChannel': float(d.mean())}

preserved = json.loads((P / 'preserved-hashes.json').read_text())
changed = [f for f,h in preserved.items() if hashlib.sha256((ROOT/f).read_bytes()).hexdigest() != h]
assert not changed, changed
audit = json.loads((P / 'mesh-audit.json').read_text())
assert audit['folded'] == 0, audit['folded']
poses = {(p['clip'],p['version'],p['frame']): p for p in audit['poses']}
report = {'preservedFiles': len(preserved), 'preservedFilesChanged': changed,
          'mesh': {k:v for k,v in audit.items() if k != 'poses'}, 'clips': {}}
jobs = []
for key, (count, old_folder) in specs.items():
    clip = {'duration': count / 30, 'count': count, 'last': count, 'versions': {}}
    info = {'samplesPerVersion': count + 1, 'oldExportDifferences': [], 'endpoints': {},
            'headPixelsUnchanged': True, 'jointMotionIdentical': True, 'jointCoverage': {}}
    frames = {}
    for version in ('before', 'after'):
        paths = sorted((P / 'export' / key / version).glob('frame-*.png'))
        assert len(paths) == count + 1, (key, version, len(paths))
        frames[version] = [rgba(f) for f in paths]
        rest = rgba(BASE / 'export' / version / 'frame-000.png')
        info['endpoints'][version] = {
            'firstVsIdle': stats(frames[version][0],rest),
            'lastVsIdle': stats(frames[version][-1],rest),
            'firstVsLast': stats(frames[version][0],frames[version][-1])}
        pages = []
        for start in range(0,count+1,8):
            sheet = Image.new('RGBA',(3072,2048))
            for n, a in enumerate(frames[version][start:start+8]):
                sheet.paste(Image.fromarray(a),(n%4*768,n//4*1024))
            name=f'{key}-{version}-{start//8:02}.webp'
            pages.append(name);jobs.append((sheet,V/name))
        clip['versions'][version] = {'pages':pages}
        coverage = {}
        for i, a in enumerate(frames[version]):
            pose = poses[(key,version,i)]
            for j in pose['joints']:
                if j['name'] not in ('UpperArmL','UpperArmR','ForearmL','ForearmR','HandL','HandR'): continue
                x,y=round(j['x']),round(j['y'])
                yy,xx=np.ogrid[-6:7,-6:7]; mask=xx*xx+yy*yy<=36
                patch=a[y-6:y+7,x-6:x+7,3]
                assert patch.shape == (13,13), (key,j)
                coverage[j['name']]=min(coverage.get(j['name'],255),int(patch[mask].min()))
        info['jointCoverage'][version]=coverage
    for i,(before,after) in enumerate(zip(frames['before'],frames['after'])):
        d=stats(before,rgba(OLD / old_folder / f'frame-{i:03}.png'))
        if d['pixels']: info['oldExportDifferences'].append({'frame':i,**d})
        info['headPixelsUnchanged'] &= bool(np.array_equal(before[:375],after[:375]))
        info['jointMotionIdentical'] &= poses[(key,'before',i)]['joints'] == poses[(key,'after',i)]['joints']
    assert info['jointMotionIdentical'], key
    assert info['headPixelsUnchanged'], key
    for version in ('before','after'):
        assert info['endpoints'][version]['firstVsLast']['meanChannel'] < .01, (key,version,info['endpoints'])
        assert info['endpoints'][version]['firstVsIdle']['meanChannel'] < .01, (key,version,info['endpoints'])
        assert info['endpoints'][version]['lastVsIdle']['meanChannel'] < .01, (key,version,info['endpoints'])
    manifest['clips'][key]=clip;report['clips'][key]=info

def encode(job):
    im,path=job;im.save(path,lossless=True,method=3,exact=True)
    assert np.array_equal(np.array(im),rgba(path)), path
    return path.stat().st_size

with ThreadPoolExecutor(max_workers=2) as pool:
    report['newAtlasBytes']=sum(pool.map(encode,jobs))
report['losslessRoundtripAllPages']=True
(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(P/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report,indent=2),flush=True)
