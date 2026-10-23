"""One-clip size experiment, separate from the approved sources and UI player."""
from pathlib import Path
from PIL import Image
import json
import numpy as np

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / 'tavern-hearts-0-2'
OUT = HERE / 'qa' / 'sizing'
OUT.mkdir(parents=True, exist_ok=True)
clip = json.loads((SOURCE / 'manifest.json').read_text())['heroes']['mara']['idle']
frames = []
for page in clip['pages']:
    with Image.open(SOURCE / page) as atlas:
        for n in range(8):
            if len(frames) == clip['count']:
                break
            x, y = (n % 4) * 480, (n // 4) * 800
            frames.append(atlas.crop((x, y, x + 480, y + 800)).convert('RGBA'))
durations = [round((i + 1) * 1000 / 30) - round(i * 1000 / 30) for i in range(len(frames))]
target = OUT / 'mara-idle-lossless-animation.webp'
frames[0].save(target, save_all=True, append_images=frames[1:], duration=durations,
               loop=0, lossless=True, quality=100, method=4, minimize_size=True, allow_mixed=False)
# WebP may collapse identical consecutive frames. Compare on the original timeline.
decoded = []
with Image.open(target) as animation:
    t = 0
    for i in range(animation.n_frames):
        animation.seek(i)
        array = np.array(animation.convert('RGBA'))
        decoded.append((t, t + animation.info['duration'], array))
        t += animation.info['duration']
visible_exact = True
t = 0
for frame, duration in zip(frames, durations):
    encoded = next(a for start, end, a in decoded if start <= t < end)
    source = np.array(frame)
    visible_exact &= bool(np.array_equal(source[:, :, 3], encoded[:, :, 3]) and
                          np.array_equal(source[:, :, :3][source[:, :, 3] > 0], encoded[:, :, :3][source[:, :, 3] > 0]))
    t += duration
report = dict(clip='mara/idle', sourceBytes=sum((SOURCE / p).stat().st_size for p in clip['pages']),
              animatedWebpBytes=target.stat().st_size, sourceFrames=len(frames), encodedFrames=len(decoded),
              durationMs=t, visibleRgbaExact=visible_exact, resolution=[480, 800],
              note='Size feasibility only. Browser player still uses approved atlases; controlled playback/transition handling needs a separate implementation.')
(HERE / 'compression-sample.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
