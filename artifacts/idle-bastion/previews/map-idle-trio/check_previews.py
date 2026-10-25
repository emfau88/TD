"""Targeted media and preservation checks. No game state or production writes."""
from pathlib import Path
import hashlib
import json
import subprocess
from PIL import Image, ImageSequence
from build_previews import SPECS, HERE, ROOT

results=[]
for name,spec in SPECS.items():
    p=HERE/name;m=json.loads((p/'animation.json').read_text())
    im=Image.open(HERE/spec['file']);decoded=[f.convert('RGB').copy() for f in ImageSequence.Iterator(im)]
    durations=[f.info['duration'] for f in ImageSequence.Iterator(im)]
    assert im.size==(390,680) and im.n_frames==m['gifFrames'] and im.info['loop']==0
    assert durations==m['gifDurationsMs'] and sum(durations)==sum(m['durationsMs'])==m['loopMs']
    assert decoded[0].tobytes()==decoded[-1].tobytes()
    frames=[Image.open(p/'frames'/f'{i:02d}.png').convert('RGBA') for i in range(22)]
    unique_frames=len({f.tobytes() for f in frames})
    assert unique_frames>=14
    for f in frames:
        assert f.size==(64,64) and set(f.getchannel('A').getdata())<={0,255}
        l,t,r,b=f.getbbox();assert 0<l<r<64 and 0<t<b<64
        assert f.crop((0,51,64,64)).tobytes()==frames[0].crop((0,51,64,64)).tobytes()
        if name=='ilyra-hip':assert f.crop((0,0,26,64)).tobytes()==frames[0].crop((0,0,26,64)).tobytes()
    assert hashlib.sha256((p/m['source']).read_bytes()).hexdigest()==m['sourceSha256']
    results.append(dict(pose=name,gif=spec['file'],frames=im.n_frames,sampledFrames=len(frames),uniqueFrames=unique_frames,loopMs=sum(durations),
        identicalEndpoints=True,binaryAlpha=True,noClipping=True,fixedBoots=True,
        fixedSpear=name=='ilyra-hip',bytes=(HERE/spec['file']).stat().st_size))

# Preserve every file of the approved pole preview, not only its exported GIF.
base='ed6a4e3f1411217363f156be735c3901445305df'
prefix='artifacts/idle-bastion/previews/ilyra-map-idle/'
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'--',prefix],cwd=ROOT,text=True).splitlines()
production=['experiments/idle-bastion/assets/runtime/mara-game.webp',
 'experiments/idle-bastion/assets/ilyra/ilyra-atlas.png','experiments/idle-bastion/assets/ilyra/sources/stand-approved.png',
 'experiments/idle-bastion/src/art.ts','experiments/idle-bastion/src/ilyra-view.ts','experiments/idle-bastion/src/ilyra.ts',
 'reference/src/style-assets.ts']
for name in paths+production:
    old=subprocess.check_output(['git','show',f'{base}:{name}'],cwd=ROOT)
    current=(ROOT/name).read_bytes()
    if Path(name).suffix in ['.ts','.py','.json','.txt','.md','.html']:current=current.replace(b'\r\n',b'\n')
    assert old==current,name
result=dict(previewOnly=True,poses=results,approvedPolePreviewFilesUnchanged=len(paths),
            productionReferencesUnchanged=production,baseCommit=base)
(HERE/'checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
