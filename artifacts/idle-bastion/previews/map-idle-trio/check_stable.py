"""Regression checks for the V2 interpolation fix, including decoded GIF output."""
import json
import hashlib
import subprocess
import numpy as np
from PIL import Image,ImageSequence
from build_previews import HERE,ROOT,SPECS
from build_stable import flow_pair,render_pair,HEAD_BOXES


def decoded(path):
    with Image.open(path) as im:
        assert im.size==(390,680) and im.info['loop']==0
        frames=[f.convert('RGB').copy() for f in ImageSequence.Iterator(im)]
        durations=[f.info['duration'] for f in ImageSequence.Iterator(im)]
    return frames,durations


def jump_metric(frames,durations):
    # Equal wall-clock sampling of the 1x actor, not unequal source frame counts.
    arr=np.array([np.asarray(f.crop((258,187,322,251)),dtype=float) for f in frames])
    indices=np.searchsorted(np.cumsum(durations),np.arange(0,sum(durations),50),side='right')
    delta=np.abs(np.diff(arr[indices],axis=0)).mean(axis=(1,2,3))
    return dict(maxMeanRgbJump=float(delta.max()),p95MeanRgbJump=float(np.percentile(delta,95)))


results=[]
for name,spec in SPECS.items():
    out=HERE/name/'stable';m=json.loads((out/'animation.json').read_text())
    frames=[Image.open(out/f'{i:03d}.png').convert('RGBA') for i in range(m['sampledFrames'])]
    keys=[Image.open(HERE/name/'keys'/f'{i:02d}.png').convert('RGBA') for i in range(7)]
    assert frames[0].tobytes()==frames[-1].tobytes()
    for f in frames:
        assert f.size==(64,64)
        l,t,r,b=f.getbbox();assert 0<l<r<64 and 0<t<b<64
        assert f.crop((0,51,64,64)).tobytes()==keys[0].crop((0,51,64,64)).tobytes()
        assert f.crop(HEAD_BOXES[name]).tobytes()==keys[0].crop(HEAD_BOXES[name]).tobytes()
        if name=='ilyra-hip':assert f.crop((0,0,26,64)).tobytes()==keys[0].crop((0,0,26,64)).tobytes()
    midpoint=[];boundaries=[]
    pairs=[flow_pair(keys[i],keys[(i+1)%7]) for i in range(7)]
    for i,pair in enumerate(pairs):
        left=np.asarray(render_pair(pair,.4999,keys[0],name),dtype=float)
        right=np.asarray(render_pair(pair,.5001,keys[0],name),dtype=float)
        midpoint.append(float(np.abs(right-left).mean()))
        assert midpoint[-1]<.1,'No abrupt source switch at midpoint'
        end=render_pair(pair,1,keys[0],name)
        start=render_pair(pairs[(i+1)%7],0,keys[0],name)
        assert end.tobytes()==start.tobytes(),'No jump at key boundary'
    for i,expected in enumerate(m['sourceKeys']):
        assert hashlib.sha256((HERE/name/'keys'/f'{i:02d}.png').read_bytes()).hexdigest()==expected
    new,nd=decoded(HERE/m['gif']);old,od=decoded(HERE/spec['file'])
    assert nd==m['gifDurationsMs'] and sum(nd)==sum(od)==m['loopMs']
    assert new[0].tobytes()==new[-1].tobytes()
    assert max(m['durationsMs'][1:-1])<=50
    before=jump_metric(old,od);after=jump_metric(new,nd)
    assert after['maxMeanRgbJump']<before['maxMeanRgbJump']*.5
    results.append(dict(pose=name,gif=m['gif'],frames=len(new),loopMs=sum(nd),bytes=m['gifBytes'],
        endpointsIdentical=True,keyBoundariesContinuous=True,midpointMaximumMeanDelta=max(midpoint),
        feetFixed=True,headFixed=True,spearFixed=name=='ilyra-hip',noClipping=True,
        motionStepMsMax=50,equalTime50msImageDelta=dict(before=before,after=after)))

# Source art, previous GIFs, accepted pole animation and production code remain intact.
protected=['artifacts/idle-bastion/previews/ilyra-map-idle','experiments/idle-bastion/assets',
           'experiments/idle-bastion/src','reference/src','public/assets']
protected += [str((HERE/spec['file']).relative_to(ROOT)) for spec in SPECS.values()]
protected += [str((HERE/name/'keys').relative_to(ROOT)) for name in SPECS]
assert not subprocess.check_output(['git','diff','--name-only','d113df2','--',*protected],cwd=ROOT).strip()
result=dict(version=2,poses=results,protectedPathsUnchanged=True,
    metricCaveat='Equal-time frame differences measure abrupt image changes, not subjective flicker quality or a physical phone test.')
(HERE/'stable-checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
