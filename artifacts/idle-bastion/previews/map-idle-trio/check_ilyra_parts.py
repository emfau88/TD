"""V4 media checks: intact parts, planted feet, seams and decoded GIF pixels.

These checks protect technical properties; user approval of motion remains open.
"""
import hashlib
import json
import subprocess
import numpy as np
from scipy.ndimage import binary_fill_holes
from PIL import Image, ImageSequence
from build_ilyra_parts import HERE, ROOT, OUT, SOURCE, GIF, JOINTS, matrices, solve_leg


def canonical(image):
    pixels=np.array(image.convert('RGBA'))
    pixels[pixels[:,:,3]==0]=0
    return pixels


manifest=json.loads((OUT/'animation.json').read_text())
source=canonical(Image.open(SOURCE))
frames=[canonical(Image.open(OUT/f'{i:02d}.png')) for i in range(manifest['frames'])]
colours={tuple(pixel) for pixel in source.reshape(-1,4)}
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()==manifest['sourceSha256']
assert np.array_equal(frames[0],source) and np.array_equal(frames[-1],source)
assert len({frame.tobytes() for frame in frames})==5
for index,frame in enumerate(frames):
    pose=manifest['poses'][manifest['order'][index]]
    assert frame.shape==(64,64,4) and set(frame[:,:,3].flat)<={0,255}
    assert {tuple(pixel) for pixel in frame.reshape(-1,4)}<=colours
    assert np.array_equal(frame[:,:26],source[:,:26]),'Spear and grip drift'
    assert np.array_equal(frame[51:],source[51:]),'Feet drift'
    shift=pose['head']
    assert np.array_equal(frame[18:31,28+shift:42+shift],source[18:31,28:42]),'Face pixels changed'
    assert np.array_equal(frame,frames[-1-index]),'Return uses different artwork'
    opaque=frame[:,:,3]>0
    assert not opaque[[0,-1],:].any() and not opaque[:,[0,-1]].any(),'Clipping'
    holes=binary_fill_holes(opaque)&~opaque
    assert not holes[30:45,29:39].any(),f'Open torso joint in pose {index}'
    for matrix in matrices(pose).values():
        rotation=matrix[:,:2]
        assert np.allclose(rotation.T@rotation,np.eye(2),atol=1e-6),'Part stretched/sheared'
        assert np.isclose(np.linalg.det(rotation),1,atol=1e-6)
    for side in JOINTS:
        hip,knee,ankle=map(np.array,JOINTS[side])
        target_hip,target_knee,target_ankle=solve_leg(side,np.array(pose['hip']))
        assert np.array_equal(ankle,target_ankle)
        assert np.isclose(np.linalg.norm(knee-hip),np.linalg.norm(target_knee-target_hip))
        assert np.isclose(np.linalg.norm(ankle-knee),np.linalg.norm(target_ankle-target_knee))

with Image.open(HERE/GIF) as gif:
    assert gif.size==(304,600) and gif.info['loop']==0
    decoded=[frame.convert('RGB').copy() for frame in ImageSequence.Iterator(gif)]
    durations=[frame.info['duration'] for frame in ImageSequence.Iterator(gif)]
assert len(decoded)==manifest['gifFrames']==9
assert durations==manifest['gifDurationsMs']==manifest['durationsMs']
assert sum(durations)==manifest['loopMs']==2740
assert decoded[0].tobytes()==decoded[-1].tobytes()
for frame in decoded:
    pixels=np.asarray(frame.crop((24,316,280,540)))
    assert np.array_equal(pixels,np.repeat(np.repeat(pixels[::4,::4],4,0),4,1)),'Filtered GIF pixels'

# Include untracked output as well as tracked changes. The earlier animation
# exports, Mara, accepted pole dance and production paths must stay untouched.
changed=set(subprocess.check_output(['git','diff','--name-only','29d7d4c','--'],cwd=ROOT,text=True).splitlines())
changed.update(subprocess.check_output(['git','ls-files','--others','--exclude-standard'],cwd=ROOT,text=True).splitlines())
prefix='artifacts/idle-bastion/previews/map-idle-trio/'
allowed={prefix+name for name in ['README.md','build_ilyra_parts.py','check_ilyra_parts.py','ilyra-hip-v4.html',GIF]}
allowed.add('experiments/idle-bastion/ROADMAP.md')
unexpected=[path for path in changed if path not in allowed and not path.startswith(prefix+'ilyra-hip/parts-v4/')]
assert not unexpected,unexpected
result=dict(version=4,gif=GIF,gifFrames=len(decoded),uniqueSpriteFrames=5,loopMs=sum(durations),
    sourceColoursOnly=True,binaryAlpha=True,neutralMatchesSource=True,faceMovesIntact=True,
    rigidPartsWithoutScaleOrShear=True,fixedFeetAndSpear=True,legLengthsPreserved=True,
    noEnclosedTorsoSeamHoles=True,exactFourfoldGifPixels=True,noClipping=True,
    identicalEndpoints=True,returnUsesSamePoses=True,productionMaraAndPoleUnchanged=True,
    comparisonBase='29d7d4c60363368520435ec92834107fa0855cef',
    visualApproval='Pending user review; technical properties do not prove attractive movement.')
(OUT/'checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
