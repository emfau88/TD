"""Pack the native Unity correction for a local I03-only before/after review."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import subprocess
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ART = HERE.parents[1]
ROOT = HERE.parents[3]
BASE_COMMIT = '1ce4e476f2d290a681fae6e16887eedd27d984d5'
BEFORE = ART / 'tavern-hearts-0-2/unity-export/touch'
AFTER = HERE / 'export/after'
PREVIEW = HERE / 'preview'

def pixels(path):
    return np.array(Image.open(path).convert('RGBA'))

def display(frame):
    first = Image.new('RGBA', (480, 800))
    first.paste(frame.resize((480, 800), Image.Resampling.LANCZOS), (0, -25))
    data = np.array(first)
    data[data[:, :, 3] == 0] = 0
    result = Image.new('RGBA', (480, 700))
    result.paste(Image.fromarray(data), (0, -30))
    return result

def pack_page(page):
    sheet = Image.new('RGBA', (1920, 1400))
    for cell in range(8):
        frame = Image.open(AFTER / 'frames' / f'frame-{page*8+cell:03d}.png').convert('RGBA')
        sheet.paste(display(frame), (cell % 4 * 480, cell // 4 * 700))
    path = PREVIEW / 'after' / f'{page:02d}.webp'
    # Preserve a lossless prepared source for the normal production packer.
    sheet.save(PREVIEW / 'lossless' / path.name, lossless=True, method=3, exact=True)
    sheet.save(path, quality=30, method=5, alpha_quality=100)
    assert np.array_equal(np.array(sheet)[:, :, 3], pixels(path)[:, :, 3])
    return path.stat().st_size

def main():
    for folder in ['before', 'after', 'lossless']:
        (PREVIEW / folder).mkdir(parents=True, exist_ok=True)
    runtime_hashes = {}
    for page in range(12):
        name = f'{page:02d}.webp'
        path = f'experiments/idle-bastion/assets/tavern-rig/ilyra/touch/{name}'
        original = subprocess.check_output(['git', '-C', str(ROOT), 'show', f'{BASE_COMMIT}:{path}'])
        (PREVIEW / 'before' / name).write_bytes(original)
        runtime_hashes[name] = hashlib.sha256(original).hexdigest()
    with ThreadPoolExecutor(max_workers=3) as pool:
        sizes = list(pool.map(pack_page, range(12)))
    validation = json.loads((AFTER / 'validation.json').read_text())
    old_validation = json.loads((BEFORE / 'validation.json').read_text())
    assert validation['foldedTriangles'] == 0
    changes = []
    outside = 0
    for n in range(validation['samples']):
        old, new = pixels(BEFORE / 'frames' / f'frame-{n:03d}.png'), pixels(AFTER / 'frames' / f'frame-{n:03d}.png')
        changed = np.any(old != new, axis=2)
        coords = np.argwhere(changed)
        box = [int(coords[:, 1].min()), int(coords[:, 0].min()), int(coords[:, 1].max())+1, int(coords[:, 0].max())+1] if len(coords) else None
        outside_mask = changed.copy()
        outside_mask[660:900, 100:240] = False
        outside += int(outside_mask.sum())
        changes.append({'frame': n, 'pixels': int(changed.sum()), 'box': box})
    assert outside == 0, 'A pixel outside the elbow region changed'
    assert changes[0]['pixels'] == changes[96]['pixels'] == changes[97]['pixels'] == 0
    original_joints_delta = max(abs(p['joints'][i][key] - validation['poses'][f]['joints'][i][key])
                               for f, p in enumerate(old_validation['poses']) for i in range(28)
                               for key in ['x', 'y', 'endX', 'endY'])
    assert original_joints_delta == 0
    sources = json.loads((HERE / 'source-hashes.json').read_text())
    changed_sources = [p for p, h in sources.items() if hashlib.sha256((ART / p).read_bytes()).hexdigest() != h]
    assert not changed_sources
    report = {'nativeSamples': validation['samples'], 'runtimeFrames': 96, 'fps': 30,
              'trianglesChecked': validation['trianglesChecked'], 'foldedTriangles': validation['foldedTriangles'],
              'minimumTriangleAreaRatio': validation['minAreaRatio'], 'originalJointsMaxPixelDelta': original_joints_delta,
              'restFrameExact': True, 'pixelsChangedOutsideElbow': outside, 'sourceFilesPreserved': len(sources),
              'beforeRuntimeHashes': runtime_hashes, 'afterRuntimeBytes': sum(sizes), 'frameChanges': changes}
    (PREVIEW / 'checks.json').write_text(json.dumps(report, indent=2))
    (PREVIEW / 'manifest.json').write_text(json.dumps({'width': 480, 'height': 700, 'count': 96, 'fps': 30,
        'before': [f'before/{i:02d}.webp' for i in range(12)], 'after': [f'after/{i:02d}.webp' for i in range(12)]}, indent=2))
    print(json.dumps({k: v for k, v in report.items() if k not in ['frameChanges', 'beforeRuntimeHashes']}, indent=2))

if __name__ == '__main__':
    main()
