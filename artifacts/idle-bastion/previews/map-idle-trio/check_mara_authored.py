"""Check the new Mara preview's media properties and preserved scope."""
import hashlib
import json
import subprocess
import numpy as np
from PIL import Image, ImageSequence
from build_mara_authored import OUT, SOURCE, GIF, HERE, ROOT, DURATIONS

manifest=json.loads((OUT/'animation.json').read_text())
frames=[Image.open(OUT/'frames'/f'{i:02d}.png').convert('RGBA') for i in range(manifest['frames'])]
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==manifest['sourceSha256']
assert len({frame.tobytes() for frame in frames})==4
assert frames[0].tobytes()==frames[-1].tobytes()
colours=set()
for index,frame in enumerate(frames):
    assert frame.size==(64,64) and set(frame.getchannel('A').getdata())<={0,255}
    bounds=frame.getbbox();assert bounds and 0<bounds[0]<bounds[2]<64 and 0<bounds[1]<bounds[3]<64
    assert 37<=bounds[3]-bounds[1]<=39,'Must remain at the real map scale'
    for box in [(0,0,64,33),(38,0,64,43),(0,50,64,64)]:
        assert frame.crop(box).tobytes()==frames[0].crop(box).tobytes(),'Head, tool or feet changed'
    assert frame.tobytes()==frames[-1-index].tobytes(),'Different return artwork'
    colours.update(tuple(pixel[:3]) for pixel in np.array(frame).reshape(-1,4) if pixel[3])
assert len(colours)<=32
neutral=np.array(frames[0])[:,:,3]>0;peak=np.array(frames[3])[:,:,3]>0
silhouette_change=int(np.count_nonzero(neutral!=peak))
assert silhouette_change>=12,'Pose must change the silhouette, not only its shading'
assert np.flatnonzero(peak[35]).min()<=np.flatnonzero(neutral[35]).min()-2,'Elbow must project visibly'
with Image.open(GIF) as gif:
    assert gif.size==(304,600) and gif.info['loop']==0
    decoded=[frame.convert('RGB').copy() for frame in ImageSequence.Iterator(gif)]
    durations=[frame.info['duration'] for frame in ImageSequence.Iterator(gif)]
assert durations==DURATIONS==manifest['gifDurationsMs'] and sum(durations)==2870
assert len(decoded)==manifest['gifFrames']==7
assert decoded[0].tobytes()==decoded[-1].tobytes()
for frame in decoded:
    pixels=np.asarray(frame.crop((24,316,280,540)))
    assert np.array_equal(pixels,np.repeat(np.repeat(pixels[::4,::4],4,0),4,1)),'Filtered GIF'

changed=set(subprocess.check_output(['git','diff','--name-only','d4aad72','--'],cwd=ROOT,text=True).splitlines())
changed.update(subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines())
prefix='artifacts/idle-bastion/previews/map-idle-trio/'
allowed={prefix+name for name in ['README.md','build_mara_authored.py','check_mara_authored.py','mara-hip-v3.html',GIF.name]}
allowed.add('experiments/idle-bastion/ROADMAP.md')
unexpected=[p for p in changed if p not in allowed and not p.startswith(prefix+'mara-hip/authored-v3/')]
assert not unexpected,unexpected
result=dict(version=3,gif=GIF.name,frames=len(decoded),uniquePoses=4,loopMs=sum(durations),
    binaryAlpha=True,sharedSpriteColours=len(colours),unchangedHeadToolAndBoots=True,
    noClipping=True,mapHeightPixels=frames[0].getbbox()[3]-frames[0].getbbox()[1],
    silhouetteChangedPixels=silhouette_change,elbowOutlineShiftAtLeastTwoMapPixels=True,
    exactFourfoldGifPixels=True,identicalEndpoints=True,returnUsesSamePoses=True,
    productionIlyraPoleAndPreviousPreviewsUnchanged=True,
    visualApproval='Pending user review; this check cannot certify the appeal of the movement.')
(OUT/'checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
