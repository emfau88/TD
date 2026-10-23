"""Produce the review/runtime derivative; never modify the approved sources.

WebP quality 90 / exact alpha, 30 fps, eight frames per atlas. Normalize the
three native-resolution extras to the same 480x700 display/anchor as the probe.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parents[1]
ROOT = GAME.parents[1]
ART = ROOT / 'artifacts' / 'idle-bastion'
OUT = GAME / 'assets' / 'tavern-rig'
REPORT = ART / 'tavern-integration-v1'


def sources():
    p = ART / 'tavern-hearts-0-2'
    m = json.loads((p / 'manifest.json').read_text())
    result = []
    for hero, clips in m['heroes'].items():
        for key, c in clips.items():
            result.append((hero, key, p, c, (480, 800), (480, 800), (0, -48 if hero == 'mara' else -30)))
    p = ART / 'mara-proportions-v1/reactions-v1/preview'
    m = json.loads((p / 'manifest.json').read_text())
    for key, label in [('tease', 'Necken'), ('hip', 'Hand an die Hüfte')]:
        c = m['clips'][key]
        result.append(('mara', key, p, dict(count=c['count'], fps=30, restFrames=[0], label=label,
                       minHeart=2, pages=c['versions']['after']['pages']), (768, 1024), (576, 768), (-48, -32)))
    p = ART / 'ilyra-rig-prep/hip-base-v2/hip-hand-v2/preview'
    m = json.loads((p / 'manifest.json').read_text())
    result.append(('ilyra', 'hip', p, dict(count=m['frames'], fps=m['fps'], restFrames=[0], label='Hand an die Hüfte',
                   minHeart=2, pages=m['sheets']), (768, 1280), (480, 800), (-7, -35)))
    return result


def pack(job):
    hero, key, folder, clip, (w, h), scaled, position = job
    target = OUT / hero / key
    target.mkdir(parents=True, exist_ok=True)
    pages, hashes, total_error, samples = [], {}, 0, 0
    original_bytes = 0
    for page_no, source in enumerate(clip['pages']):
        source = folder / source
        before_hash = hashlib.sha256(source.read_bytes()).hexdigest()
        hashes[source.relative_to(ROOT).as_posix()] = before_hash
        original_bytes += source.stat().st_size
        with Image.open(source) as atlas:
            sheet = Image.new('RGBA', (1920, 1400))
            for i in range(min(8, clip['count'] - page_no * 8)):
                x, y = i % 4 * w, i // 4 * h
                frame = atlas.crop((x, y, x + w, y + h)).convert('RGBA')
                if frame.size != scaled:
                    frame = frame.resize(scaled, Image.Resampling.LANCZOS)
                placed = Image.new('RGBA', (480, 700))
                placed.paste(frame, position)
                sheet.paste(placed, (i % 4 * 480, i // 4 * 700))
        path = target / f'{page_no:02}.webp'
        sheet.save(path, lossless=False, quality=90, method=5, alpha_quality=100)
        with Image.open(path) as encoded:
            a, b = np.array(sheet), np.array(encoded.convert('RGBA'))
        assert np.array_equal(a[:, :, 3], b[:, :, 3]), f'Alpha changed: {path}'
        visible = a[:, :, 3] > 0
        total_error += int(np.abs(a[:, :, :3].astype(np.int16) - b[:, :, :3].astype(np.int16))[visible].sum())
        samples += int(visible.sum()) * 3
        assert hashlib.sha256(source.read_bytes()).hexdigest() == before_hash
        pages.append(path.relative_to(OUT).as_posix())
    data = dict(label=clip['label'], minHeart=clip['minHeart'], count=clip['count'], fps=clip['fps'],
                duration=clip['count'] / clip['fps'], restFrames=clip['restFrames'], pages=pages,
                bytes=sum((OUT / p).stat().st_size for p in pages))
    metrics = dict(hero=hero, clip=key, frames=clip['count'], sourceBytes=original_bytes, outputBytes=data['bytes'],
                   alphaExact=True, visibleMeanRgbError=round(total_error / samples, 4), sourcesUnchanged=True)
    print(f'{hero}/{key}: {original_bytes / 1e6:.2f} -> {data["bytes"] / 1e6:.2f} MB', flush=True)
    return hero, key, data, metrics, hashes


if __name__ == '__main__':
    data = dict(width=480, height=700, columns=4, perPage=8, codec='WebP lossy quality 90 / alpha lossless',
                heroes={'mara': {}, 'ilyra': {}})
    metrics, hashes = [], {}
    with ThreadPoolExecutor(max_workers=3) as pool:
        for hero, key, clip, row, source_hashes in pool.map(pack, sources()):
            data['heroes'][hero][key] = clip
            metrics.append(row)
            hashes.update(source_hashes)
    (OUT / 'manifest.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    report = dict(sourceBytes=sum(r['sourceBytes'] for r in metrics), outputBytes=sum(r['outputBytes'] for r in metrics),
                  frames=sum(r['frames'] for r in metrics), clips=metrics,
                  note='Size includes cropping/normalizing native extras and lossy RGB compression; alpha and 30fps preserved.')
    (REPORT / 'runtime-size-report.json').write_text(json.dumps(report, indent=2) + '\n')
    (REPORT / 'qa/runtime-source-hashes.json').write_text(json.dumps(hashes, indent=2) + '\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'clips'}, indent=2))
