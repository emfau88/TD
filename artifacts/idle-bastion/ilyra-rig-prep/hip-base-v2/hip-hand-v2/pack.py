from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import shutil
import subprocess
import sys
import numpy as np

P = Path(__file__).resolve().parent
V = P / 'preview'
F = V / 'frames'
OLD = P.parent / 'blink-v1' / 'preview'
FRAME_COUNT = 180
BACKGROUND = '#e6e0d4'
MAX_GIF = 10 * 1024 * 1024
FFMPEG = shutil.which('ffmpeg')
NO_GIF = '--no-gif' in sys.argv
assert NO_GIF or FFMPEG, 'ffmpeg is required for GIF export; no dependencies will be installed.'
V.mkdir(exist_ok=True)

def rgba(path):
    return np.array(Image.open(path).convert('RGBA'))

ev = json.loads((V / 'validation.json').read_text(encoding='utf-8'))
old_ev = json.loads((OLD / 'validation.json').read_text(encoding='utf-8'))
checks = {k: ev[k] for k in ['samples', 'trianglesChecked', 'foldedTriangles', 'minAreaRatio']}
assert checks['foldedTriangles'] == 0
checks['exactLoop'] = bool(np.array_equal(rgba(F / 'frame-000.png'), rgba(F / 'frame-180.png')))
assert checks['exactLoop'], 'New loop endpoints differ.'
checks['jointSamplesIdentical'] = ev['poses'] == old_ev['poses']
assert checks['jointSamplesIdentical'], 'Body bone samples changed.'

# Bounds include the wrist, fingertips, and the maximum six-second body sway.
allowed = [170, 725, 360, 870]
bounds = []
changed_frames = []
for frame in range(FRAME_COUNT + 1):
    new = rgba(F / f'frame-{frame:03}.png')
    old = rgba(OLD / 'frames' / f'frame-{frame:03}.png')
    assert new.shape == old.shape == (1280, 768, 4)
    difference = np.any(new != old, axis=2)
    ys, xs = np.where(difference)
    if len(xs):
        box = [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1]
        bounds.append(box)
        changed_frames.append(frame)
        assert (box[0] >= allowed[0] and box[1] >= allowed[1]
                and box[2] <= allowed[2] and box[3] <= allowed[3]), (frame, box, allowed)
assert changed_frames, 'Hand has no visible change.'
checks['allowedHandRegion'] = allowed
checks['differenceBounds'] = [min(b[0] for b in bounds), min(b[1] for b in bounds),
                             max(b[2] for b in bounds), max(b[3] for b in bounds)]
checks['changedFrames'] = len(changed_frames)
checks['outsideHandPixelIdentical'] = True

manifest = {'width': 768, 'height': 1280, 'fps': 30, 'frames': FRAME_COUNT,
            'duration': 6, 'framesPerSheet': 8, 'columns': 4, 'sheets': []}
for start in range(0, FRAME_COUNT, 8):
    atlas = Image.new('RGBA', (3072, 2560))
    for frame in range(start, min(start + 8, FRAME_COUNT)):
        atlas.paste(Image.open(F / f'frame-{frame:03}.png'),
                    ((frame - start) % 4 * 768, (frame - start) // 4 * 1280))
    name = f'hand-{start // 8:02}.webp'
    original = np.array(atlas)
    original[original[:, :, 3] == 0, :3] = 0
    decoded = None
    if (V / name).exists():
        try:
            decoded = rgba(V / name)
            decoded[decoded[:, :, 3] == 0, :3] = 0
        except (OSError, ValueError):
            decoded = None
    if decoded is None or not np.array_equal(original, decoded):
        atlas.save(V / name, lossless=True, method=0)
        decoded = rgba(V / name)
    decoded[decoded[:, :, 3] == 0, :3] = 0
    assert np.array_equal(original, decoded), name
    manifest['sheets'].append(name)
checks['losslessAtlases'] = True
(V / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
if NO_GIF:
    checks['gifExportSkipped'] = True
    (V / 'checks.json').write_text(json.dumps(checks, indent=2), encoding='utf-8')
    print(json.dumps(checks, indent=2))
    raise SystemExit(0)

def font(size):
    for candidate in [Path('C:/Windows/Fonts/arialbd.ttf'), Path('C:/Windows/Fonts/segoeuib.ttf')]:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()

def panel(path, width):
    im = Image.open(path).convert('RGBA')
    bg = Image.new('RGBA', im.size, BACKGROUND)
    bg.alpha_composite(im)
    return bg.convert('RGB').resize((width, round(width * 5 / 3)), Image.Resampling.LANCZOS)

def encode_gif(kind, width, filename):
    directory = P / ('gif-' + kind)
    directory.mkdir(exist_ok=True)
    label_font = font(17)
    for i in range(120):
        frame = round(i * 1.5)
        after = panel(F / f'frame-{frame:03}.png', width)
        if kind == 'comparison':
            before = panel(OLD / 'frames' / f'frame-{frame:03}.png', width)
            image = Image.new('RGB', (2 * width, after.height + 32), BACKGROUND)
            image.paste(before, (0, 32))
            image.paste(after, (width, 32))
            draw = ImageDraw.Draw(image)
            draw.text((width / 2, 7), 'VORHER', font=label_font, fill='#263344', anchor='mt')
            draw.text((width * 1.5, 7), 'NACHHER', font=label_font, fill='#263344', anchor='mt')
            draw.line((width, 0, width, image.height), fill='#b7b2aa', width=1)
        else:
            image = after
        image.save(directory / f'{i:03}.png')
    palette = directory / 'palette.png'
    subprocess.run([FFMPEG, '-y', '-v', 'error', '-framerate', '20', '-i', str(directory / '%03d.png'),
                    '-vf', 'palettegen=stats_mode=full', '-frames:v', '1', str(palette)], check=True)
    output = V / filename
    subprocess.run([FFMPEG, '-y', '-v', 'error', '-framerate', '20', '-i', str(directory / '%03d.png'),
                    '-i', str(palette), '-lavfi', 'paletteuse=dither=bayer:bayer_scale=4',
                    '-loop', '0', str(output)], check=True)
    with Image.open(output) as gif:
        count = gif.n_frames
        duration = sum((gif.seek(i) or gif.info.get('duration', 0)) for i in range(count))
        size = list(gif.size)
    assert count == 120 and duration == 6000, (count, duration)
    return {'file': filename, 'frames': count, 'durationMs': duration,
            'bytes': output.stat().st_size, 'size': size}

comparison_name = 'Ilyra-Huefthand-Vorher-Nachher.gif'
for width in [300, 280, 260]:
    comparison = encode_gif('comparison', width, comparison_name)
    if comparison['bytes'] < MAX_GIF:
        break
assert comparison['bytes'] < MAX_GIF, 'Comparison exceeds native-upload limit.'
after = encode_gif('after', 360, 'Ilyra-Huefthand-Korrigiert.gif')
assert after['bytes'] < MAX_GIF
checks['comparisonGif'] = comparison
checks['afterGif'] = after
(V / 'checks.json').write_text(json.dumps(checks, indent=2), encoding='utf-8')
print(json.dumps(checks, indent=2))
