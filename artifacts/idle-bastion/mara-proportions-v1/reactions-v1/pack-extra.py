"""Append one existing movement with M01 proportions; lossless local preview only."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import sys
import numpy as np
from PIL import Image

P = Path(__file__).resolve().parent
BASE = P.parent / 'idle-rig'
OLD = P.parents[1] / 'mara-rig-v2/unity/Export'
V = P / 'preview'
SPECS = {
    'glance': (114, 'GestureStudy/IdleBlickkontakt', 'M04 · Blickkontakt'),
    'tease': (102, 'NeckenBody/ReactionNeckenBody', 'M07 · Necken'),
    'joy': (126, 'ChestPhysics/SpringPoseWithPhysicsTuned', 'M06 · Aufrichten und Abfedern'),
    'hip': (150, 'PhysicsGestures/HandOnHipPhysics', 'M08 · Hand an die Hüfte'),
    'giggle': (162, 'PhysicsGestures/GigglePhysics', 'M05 · Kichern'),
}
key = sys.argv[1]
count, old_folder, label = SPECS[key]
audit = json.loads((P / f'mesh-audit-{key}.json').read_text())
assert audit['folded'] == 0, audit['folded']
poses = {(p['version'], p['frame']): p['joints'] for p in audit['poses']}
report = {'key': key, 'samplesPerVersion': count+1, 'foldedTriangles': audit['folded'],
          'states': audit['states'], 'oldExportDifferentFrames': [], 'jointMotionIdentical': True,
          'headPixelsUnchanged': True, 'endpoints': {}, 'jointCoverage': {}, 'atlasBytes': 0}
clip = {'duration': count/30, 'count': count, 'last': count, 'versions': {}}

def rgba(path):
    with Image.open(path) as im:
        return np.array(im.convert('RGBA'))

def diff(a,b):
    d=np.abs(a.astype(np.int16)-b.astype(np.int16))
    return {'pixels': int(np.any(d,axis=2).sum()), 'maxChannel': int(d.max()), 'meanChannel': float(d.mean())}

def encode(sheet,dest):
    sheet.save(dest,lossless=True,method=3,exact=True)
    assert np.array_equal(np.array(sheet),rgba(dest)),dest
    return dest.stat().st_size

pool=ThreadPoolExecutor(max_workers=4)
pending=[]

for version in ('before','after'):
    paths=sorted((P/'export'/key/version).glob('frame-*.png'))
    assert len(paths)==count+1, (key,version,len(paths))
    rest=rgba(BASE/'export'/version/'frame-000.png')
    first,last=rgba(paths[0]),rgba(paths[-1])
    report['endpoints'][version]={'firstVsIdle':diff(first,rest),'lastVsIdle':diff(last,rest),'firstVsLast':diff(first,last)}
    pages=[];coverage={}
    for start in range(0,count+1,8):
        sheet=Image.new('RGBA',(3072,2048))
        for n,path in enumerate(paths[start:start+8]):
            i=start+n;a=rgba(path)
            sheet.paste(Image.fromarray(a),(n%4*768,n//4*1024))
            if version=='before':
                if not np.array_equal(a,rgba(OLD/old_folder/path.name)):report['oldExportDifferentFrames'].append(i)
            else:
                before=rgba(P/'export'/key/'before'/path.name)
                report['headPixelsUnchanged'] &= bool(np.array_equal(a[:375],before[:375]))
                report['jointMotionIdentical'] &= poses[('before',i)]==poses[('after',i)]
            for j in poses[(version,i)]:
                if j['name'] not in ('UpperArmL','UpperArmR','ForearmL','ForearmR','HandL','HandR'):continue
                x,y=round(j['x']),round(j['y']);yy,xx=np.ogrid[-6:7,-6:7];mask=xx*xx+yy*yy<=36
                patch=a[y-6:y+7,x-6:x+7,3]
                assert patch.shape==(13,13),(key,j)
                coverage[j['name']]=min(coverage.get(j['name'],255),int(patch[mask].min()))
        name=f'{key}-{version}-{start//8:02}.webp';dest=V/name
        pending.append(pool.submit(encode,sheet,dest));pages.append(name)
        if len(pending)>=4:report['atlasBytes']+=pending.pop(0).result()
    report['jointCoverage'][version]=coverage
    clip['versions'][version]={'pages':pages}
report['atlasBytes']+=sum(job.result() for job in pending)
pool.shutdown()
assert report['jointMotionIdentical'],key
assert not report['oldExportDifferentFrames'],report['oldExportDifferentFrames']
assert report['headPixelsUnchanged'],key
report['losslessRoundtripAllPages']=True
(P/f'validation-{key}.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
manifest=json.loads((V/'manifest.json').read_text())
manifest['clips'][key]=clip
(V/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
html=(V/'index.html').read_text(encoding='utf-8')
if f'data-clip="{key}"' not in html:
    html=html.replace('</nav>',f'<button data-clip="{key}" aria-pressed="false">{label}</button></nav>')
(V/'index.html').write_text(html,encoding='utf-8')
print(json.dumps(report,indent=2),flush=True)
