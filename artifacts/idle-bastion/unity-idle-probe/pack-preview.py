"""Lossless packaging and focused validation of Unity's exported frames."""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image

project = Path(__file__).resolve().parent
root = project.parents[2]
output = root / 'experiments/idle-bastion/assets/mara-tavern/unity-probe'
report = root / 'artifacts/idle-bastion/acceptance/t11-unity'
output.mkdir(parents=True, exist_ok=True)
frames = [Image.open(project / f'Export/frame-{i:03}.png').convert('RGBA') for i in range(97)]
base = np.array(frames[0])
source_path = root / 'experiments/idle-bastion/assets/mara-tavern/rest-reference/rest.png'
source = np.array(Image.open(source_path).resize((768, 1024), Image.Resampling.NEAREST))
assert np.array_equal(base, source), 'Unity rest render must preserve every RGBA pixel'
assert np.array_equal(base, np.array(frames[96])), 'Loop endpoint differs from rest'
regions = {
    'head_and_hair': (80, 60, 285, 215), 'breast': (140, 240, 253, 327),
    'left_hand': (85, 334, 163, 400), 'right_hand': (244, 350, 304, 442),
    'braid': (113, 202, 167, 339), 'belt_anchor': (160, 340, 240, 390),
}
differences = dict.fromkeys(regions, 0)
union = np.zeros(base.shape[:2], dtype=bool)
max_change = 0
max_adjacent = 0
previous = base
for frame in frames:
    array = np.array(frame)
    diff = np.any(array != base, axis=2)
    union |= diff
    max_change = max(max_change, int(diff.sum()))
    max_adjacent = max(max_adjacent, int(np.any(array != previous, axis=2).sum()))
    previous = array
    for name, (x, y, right, bottom) in regions.items():
        differences[name] = max(differences[name], int(diff[2*y:2*bottom, 2*x:2*right].sum()))
assert not any(differences.values()), differences
assert max_change > 0, 'No visible animation was rendered'

durations = [round((i+1)*1000/24) - round(i*1000/24) for i in range(96)]
frames[0].save(output / 'rest.webp', lossless=True, exact=True, method=4)
for name, multiplier in [('cloth.webp', 1), ('cloth-slow.webp', 2)]:
    frames[0].save(output / name, save_all=True, append_images=frames[1:96],
                   duration=[d*multiplier for d in durations], loop=0,
                   lossless=True, exact=True, quality=0, method=0)

# Match each encoded interval to its source time, including duplicate-frame merges.
decoded = Image.open(output / 'cloth.webp')
elapsed = 0
source_starts = np.cumsum([0] + durations[:-1])
for i in range(decoded.n_frames):
    decoded.seek(i)
    expected_index = int(np.searchsorted(source_starts, elapsed, side='right') - 1)
    actual = np.array(decoded.convert('RGBA'))
    expected = np.array(frames[expected_index])
    visible = (actual[:, :, 3] > 0) | (expected[:, :, 3] > 0)
    assert np.array_equal(actual[visible], expected[visible]), f'Lossy frame {i}'
    elapsed += decoded.info['duration']
assert elapsed == 4000, elapsed

ys, xs = np.where(union)
result = {
    'unity': '6000.4.0f1', 'samples': 96, 'fps': 24, 'durationMs': elapsed,
    'renderSize': [768, 1024], 'displaySize': [384, 512],
    'restExactRGBA': True, 'loopEndpointExactRGBA': True, 'webpLosslessVisibleRGBA': True,
    'protectedRegionChangedPixels': differences,
    'changedBoundsAt2x': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
    'maxChangedPixelsAt2x': max_change, 'maxAdjacentChangedPixelsAt2x': max_adjacent,
    'encodedFramesAfterDuplicateMerge': decoded.n_frames,
    'sourceSHA256': hashlib.sha256(source_path.read_bytes()).hexdigest(),
    'filesBytes': {p.name: p.stat().st_size for p in output.glob('*.webp')},
}
(report / 'validation.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(json.dumps(result, indent=2))
