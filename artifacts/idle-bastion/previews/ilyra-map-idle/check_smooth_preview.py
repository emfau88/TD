"""Bounded media checks for the V2 preview; no production runtime execution."""
from pathlib import Path
import hashlib
import json
import subprocess
import numpy as np
from PIL import Image, ImageSequence

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OUT = HERE / 'v2'
manifest = json.loads((OUT / 'animation.json').read_text())
gif = Image.open(HERE / 'Ilyra-Speer-Idle-Handy-v2.gif')
decoded = [f.convert('RGB').copy() for f in ImageSequence.Iterator(gif)]
durations = [f.info['duration'] for f in ImageSequence.Iterator(gif)]
assert len(decoded) == 25 and durations == manifest['durationsMs']
assert sum(durations) == 3200 and gif.info['loop'] == 0
assert decoded[0].tobytes() == decoded[-1].tobytes()
assert gif.size == (390, 680)
frames = [Image.open(OUT / 'frames' / f'{i:02d}.png').convert('RGBA') for i in range(25)]
assert len({f.tobytes() for f in frames}) == 24
for f in frames:
    assert f.size == (64, 64)
    assert set(f.getchannel('A').getdata()) <= {0, 255}
    l,t,r,b = f.getbbox()
    assert 0 < l < r < 64 and 0 < t < b < 64

# Same original eight poses: changed pixels confined to the intended shaft line.
shafts = [((21,23),(21,54)), ((18,20),(24,42)), ((21,22),(21,54)),
          ((21,22),(21,54)), ((21,22),(21,54)), ((21,22),(21,54)),
          ((21,24),(23,51)), ((21,24),(21,54))]
for i,(a,b) in enumerate(shafts):
    old = np.asarray(Image.open(HERE / 'frames' / f'{i:02d}.png').convert('RGBA'))
    new = np.asarray(frames[i*3])
    changed = np.any(old != new, axis=2)
    allowed = np.zeros((64,64), dtype=bool)
    for y in range(a[1], b[1]+1):
        x = round(a[0]+(b[0]-a[0])*(y-a[1])/max(1,b[1]-a[1]))
        allowed[y,x] = True
    assert not np.any(changed & ~allowed)

# Unobscured lower planted shaft, including every intermediate frame.
shaft_samples = 0
for f in frames[6:16]:
    for y in range(40,55):
        r,g,b,a = f.getpixel((21,y))
        assert a == 255 and r > 120 and g > 65 and r > b*1.5
        shaft_samples += 1

unchanged = ['source/poses.png', 'Ilyra-Speer-Idle-Handy.gif', 'idle-preview.png',
             'preview.png', 'contact-sheet.png', 'build_preview.py', 'animation.json',
             'checks.json', 'browser-checks.json', 'prompt.txt']
unchanged += [f'frames/{i:02d}.png' for i in range(8)]
for name in unchanged:
    p = HERE / name
    prior = subprocess.check_output(['git','show',f'12269b5:{p.relative_to(ROOT).as_posix()}'],cwd=ROOT)
    current = p.read_bytes()
    if p.suffix in {'.py','.json','.txt'}:
        current = current.replace(b'\r\n',b'\n')
    assert prior == current, name
production = json.loads((HERE/'checks.json').read_text())
for name in production['sourceAssetsAndAnimationCodeUnchanged']:
    prior = subprocess.check_output(['git','show',f"{production['baseCommit']}:{name}"],cwd=ROOT)
    current = (ROOT/name).read_bytes()
    if name.endswith('.ts'): current = current.replace(b'\r\n',b'\n')
    assert prior == current, name
result = dict(gifFrames=25, distinctMotionFrames=24, loopMs=3200, infiniteLoop=True,
              identicalEndpoints=True, binaryAlpha=True, noClipping=True,
              sameEightKeyPosesOutsideShaft=True, plantedGoldShaftSamples=shaft_samples,
              originalV1FilesUnchanged=unchanged, productionFilesUnchanged=production['sourceAssetsAndAnimationCodeUnchanged'],
              sourceSha256=hashlib.sha256((HERE/'source/poses.png').read_bytes()).hexdigest(),
              productionIntegration=False)
(OUT/'checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
