from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json,hashlib
import numpy as np
from PIL import Image
P=Path(__file__).resolve().parent;out=P/'preview';out.mkdir(exist_ok=True)
manifest={'fps':30,'duration':5,'count':150,'width':768,'height':1024,'clips':{}};report={};jobs=[]
for version in ['before','after']:
 files=sorted((P/'export'/version).glob('frame-*.png'));assert len(files)==151,(version,len(files))
 frames=[Image.open(f).convert('RGBA') for f in files]
 assert np.array_equal(np.array(frames[0]),np.array(frames[-1])),'loop mismatch'
 pages=[];coords=[]
 for start in range(0,150,8):
  group=frames[start:start+8];sheet=Image.new('RGBA',(3072,2048))
  for i,im in enumerate(group):sheet.paste(im,(i%4*768,i//4*1024));coords.append([len(pages),i%4*768,i//4*1024,768,1024])
  file=f'{version}-{start//8:02}.webp';pages.append(file);jobs.append((sheet,out/file))
 manifest['clips'][version]={'pages':pages,'frames':coords}
 frames[0].save(out/f'{version}-rest.png');frames[50].save(out/f'{version}-breath.png')
 report[version]={'frames':151,'loopExact':True}
def encode(job):
 im,p=job;im.save(p,lossless=True,method=3,exact=True)
 assert np.array_equal(np.array(im),np.array(Image.open(p).convert('RGBA')))
 return p.stat().st_size
with ThreadPoolExecutor(max_workers=2) as pool:report['atlasBytes']=sum(pool.map(encode,jobs))
src=P.parents[1]/'mara-rig-v2/unity';hashes=json.loads((P/'source-hashes.json').read_text())
assert all(hashlib.sha256((src/f).read_bytes()).hexdigest()==h for f,h in hashes.items())
report['originalSourceFilesUnchanged']=len(hashes)
before=[np.array(Image.open(P/'export/before'/f'frame-{i:03}.png')) for i in range(151)]
after=[np.array(Image.open(P/'export/after'/f'frame-{i:03}.png')) for i in range(151)]
report['headPixelsUnchangedAllFrames']=all(np.array_equal(a[:395],b[:395]) for a,b in zip(before,after))
report['torsoCentreUnchangedAllFrames']=all(np.array_equal(a[450:725,320:450],b[450:725,320:450]) for a,b in zip(before,after))
centre=[np.abs(a[450:725,320:450].astype(int)-b[450:725,320:450].astype(int)) for a,b in zip(before,after)]
report['torsoCentreMaxMeanChannelDelta']=max(float(d.mean()) for d in centre)
report['torsoCentreMaxChannelDelta']=max(int(d.max()) for d in centre)
assert report['headPixelsUnchangedAllFrames'] and report['torsoCentreMaxMeanChannelDelta']<.1
report['changedHandPixelsAtRest']=int(np.count_nonzero(np.any(before[0][760:920]!=after[0][760:920],axis=2)))
assert report['changedHandPixelsAtRest']>1000,'Geometry changes did not survive the Unity import'
old=src/'Export/BodyComparison/IdleOrganic'
report['baselineMatchesPreviousExport']=all(np.array_equal(a,np.array(Image.open(old/f'frame-{i:03}.png'))) for i,a in enumerate(before))
audit=json.loads((P/'mesh-audit.json').read_text());assert audit['folded']==0
report['mesh']={k:v for k,v in audit.items() if k!='poses'}
poses=audit['poses'];report['jointMotionIdentical']=all(poses[i]['joints']==poses[i+151]['joints'] for i in range(151));assert report['jointMotionIdentical']
(out/'manifest.json').write_text(json.dumps(manifest,indent=2));(P/'validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
