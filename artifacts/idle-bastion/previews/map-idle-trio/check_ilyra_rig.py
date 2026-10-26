"""Check sharpness and character continuity, not just smaller frame differences."""
import hashlib
import json
import subprocess
import numpy as np
from PIL import Image,ImageSequence
from build_ilyra_rig import OUT,SOURCE,HERE,GIF

m=json.loads((OUT/'animation.json').read_text())
source=Image.open(SOURCE).convert('RGBA')
frames=[Image.open(OUT/f'{i:02d}.png').convert('RGBA') for i in range(m['frames'])]
allowed=set(source.getdata())|{(0,0,0,0)}
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==m['sourceSha256']
assert frames[0].tobytes()==source.tobytes()==frames[-1].tobytes()
for i,(f,a) in enumerate(zip(frames,m['amounts'])):
    assert f.size==(64,64) and set(f.getchannel('A').getdata())<={0,255}
    assert set(f.getdata())<=allowed,'No mixed/blurred/new pixel colours'
    l,t,r,b=f.getbbox();assert 0<l<r<64 and 0<t<b<64
    assert f.crop((0,0,26,64)).tobytes()==source.crop((0,0,26,64)).tobytes()
    assert f.crop((0,51,64,64)).tobytes()==source.crop((0,51,64,64)).tobytes()
    shift=int(np.floor(-a+.5))
    assert f.crop((28+shift,18,42+shift,31)).tobytes()==source.crop((28,18,42,31)).tobytes(), 'Face must translate as intact pixels, including half-pixel phases'
    assert f.tobytes()==frames[-1-i].tobytes(),'Return follows the same poses'
assert not frames[0].tobytes()==frames[8].tobytes()
with Image.open(HERE/GIF) as gif:
    assert gif.size==(390,680) and gif.info['loop']==0
    decoded=[f.convert('RGB').copy() for f in ImageSequence.Iterator(gif)]
    durations=[f.info['duration'] for f in ImageSequence.Iterator(gif)]
assert len(decoded)==m['gifFrames'] and durations==m['gifDurationsMs']
assert sum(durations)==sum(m['durationsMs'])==3400
assert decoded[0].tobytes()==decoded[-1].tobytes()
for f in decoded:
    # All figure pixels in the 4x detail consist of exact solid 4x4 blocks;
    # exclude the separate one-pixel ground rule below the feet.
    arr=np.asarray(f.crop((67,352,323,576)))
    assert np.array_equal(arr,np.repeat(np.repeat(arr[::4,::4],4,0),4,1))

# All existing production and both Mara previews, all previous exports and the
# accepted spear animation are protected. Only the new experiment/docs may change.
root=HERE.parents[3]
changed=subprocess.check_output(['git','diff','--name-only','2693e2f','--'],cwd=root,text=True).splitlines()
allowed_changes=['experiments/idle-bastion/ROADMAP.md','artifacts/idle-bastion/previews/map-idle-trio/README.md']
assert all(p in allowed_changes or p.startswith('artifacts/idle-bastion/previews/map-idle-trio/ilyra-hip/rig-v3/') or p.startswith('artifacts/idle-bastion/previews/map-idle-trio/Ilyra-Hip-Shift-Handy-V3') or p.startswith('artifacts/idle-bastion/previews/map-idle-trio/build_ilyra_rig') or p.startswith('artifacts/idle-bastion/previews/map-idle-trio/check_ilyra_rig') or p.startswith('artifacts/idle-bastion/previews/map-idle-trio/ilyra-hip-v3.') for p in changed)
result=dict(version=3,gif=GIF,gifFrames=len(decoded),loopMs=sum(durations),
    uniqueSpriteFrames=len({f.tobytes() for f in frames}),sourceColoursOnly=True,binaryAlpha=True,
    faceMovesWithoutRedrawing=True,exactFourfoldPixels=True,fixedFeetAndSpear=True,
    identicalEndpoints=True,returnUsesSamePoses=True,noClipping=True,
    productionMaraAndPoleUnchanged=True,
    visualApproval='Pending user review; sharp pixels alone do not prove attractive animation.')
(OUT/'checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
