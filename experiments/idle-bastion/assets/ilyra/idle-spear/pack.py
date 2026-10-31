"""Pack the approved V3 frames without resizing, recoloring or changing alpha.
Usage: python pack.py <path-to-preview/v3>
"""
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image

source = Path(sys.argv[1])
output = Path(__file__).resolve().parent
meta = json.loads((source / 'animation.json').read_text(encoding='utf-8-sig'))
assert meta['frames'] == 33 and meta['frameSize'] == [64, 64]
assert meta['foot'] == [32, 56] and sum(meta['durationsMs']) == 3920
atlas = Image.new('RGBA', (512, 320))
hashes = []
frames = []
for i in range(33):
    path = source / 'frames' / f'{i:02d}.png'
    frame = Image.open(path).convert('RGBA')
    assert frame.size == (64, 64)
    frames.append(frame)
    hashes.append(hashlib.sha256(frame.tobytes()).hexdigest())
    atlas.paste(frame, (i % 8 * 64, i // 8 * 64))
atlas.save(output / 'atlas.png', optimize=True)
decoded = Image.open(output / 'atlas.png').convert('RGBA')
for i, frame in enumerate(frames):
    x, y = i % 8 * 64, i // 8 * 64
    assert decoded.crop((x, y, x + 64, y + 64)).tobytes() == frame.tobytes()
(output / 'clip.json').write_text(json.dumps({
    'source': 'approved spear idle V3, codex/map-idle-trio-preview; origin ed6a4e3',
    'frameSize': [64, 64], 'foot': [32, 56], 'columns': 8,
    'durationsMs': meta['durationsMs'], 'durationMs': 3920,
    'frameRgbaSha256': hashes,
    'atlasSha256': hashlib.sha256((output / 'atlas.png').read_bytes()).hexdigest(),
}, indent=2) + '\n', encoding='utf-8')
print(f'33/33 frames pixel-identical; atlas {512}x{320}, {(output / "atlas.png").stat().st_size} bytes')
