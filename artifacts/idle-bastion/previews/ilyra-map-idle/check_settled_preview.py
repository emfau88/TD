"""Targeted checks: live hip accent, planted return and preserved earlier previews."""
from pathlib import Path
import json
import subprocess
from PIL import Image, ImageSequence

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
OUT=HERE/'v3'
m=json.loads((OUT/'animation.json').read_text())
frames=[Image.open(OUT/'frames'/f'{i:02d}.png').convert('RGBA') for i in range(m['frames'])]
gif=Image.open(HERE/'Ilyra-Speer-Idle-Handy-v3.gif')
decoded=[f.convert('RGB').copy() for f in ImageSequence.Iterator(gif)]
durations=[f.info['duration'] for f in ImageSequence.Iterator(gif)]
assert gif.size==(390,680) and gif.n_frames==33 and gif.info['loop']==0
assert durations==m['durationsMs'] and sum(durations)==3920
assert decoded[0].tobytes()==decoded[-1].tobytes()
for f in frames:
    assert f.size==(64,64) and set(f.getchannel('A').getdata())<={0,255}
    l,t,r,b=f.getbbox();assert 0<l<r<64 and 0<t<b<64
arc=[i for i,t in enumerate(m['tags']) if t=='hip-arc']
assert len(arc)==8 and sum(durations[i] for i in arc)==720
for i in arc:
    assert frames[i].tobytes()!=frames[i-1].tobytes(), 'no frozen hip frame'
    for box in [(0,0,24,64),(0,53,64,64)]:
        assert frames[i].crop(box).tobytes()==frames[9].crop(box).tobytes()
for f in frames[m['returnStartFrame']:]:
    assert f.crop(tuple(m['returnFixedLowerBody'])).tobytes()==frames[0].crop(tuple(m['returnFixedLowerBody'])).tobytes()
for f in frames[6:24]:
    for y in range(40,55):
        r,g,b,a=f.getpixel((21,y))
        assert a==255 and r>120 and g>65 and r>b*1.5
# Earlier GIFs, original source and all previously generated frame files stay exact.
old_paths=['source/poses.png','Ilyra-Speer-Idle-Handy.gif','Ilyra-Speer-Idle-Handy-v2.gif']
old_paths += [f'v2/frames/{i:02d}.png' for i in range(25)]
for name in old_paths:
    p=HERE/name
    old=subprocess.check_output(['git','show',f'48b4825:{p.relative_to(ROOT).as_posix()}'],cwd=ROOT)
    assert p.read_bytes()==old,name
production=json.loads((HERE/'checks.json').read_text())
for name in production['sourceAssetsAndAnimationCodeUnchanged']:
    old=subprocess.check_output(['git','show',f"{production['baseCommit']}:{name}"],cwd=ROOT)
    current=(ROOT/name).read_bytes()
    if name.endswith('.ts'): current=current.replace(b'\r\n',b'\n')
    assert old==current,name
result=dict(gifFrames=33,loopMs=3920,infiniteLoop=True,identicalEndpoints=True,
            hipAccentAdditionalMovingMs=720,hipFramesAllMoving=True,hipSpearAndFeetFixed=True,
            frontalReturnLowerBodyPixelIdentical=True,returnFromFrame=m['returnStartFrame'],
            goldShaftPreserved=True,binaryAlpha=True,noClipping=True,
            earlierSourcesAndPreviewsUnchanged=True,productionAssetsAndCodeUnchanged=True,
            productionIntegration=False)
(OUT/'checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
