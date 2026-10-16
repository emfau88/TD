"""Copy runtime PNGs and read real frame dimensions/tags from Aseprite sources."""
from pathlib import Path
import struct, json, shutil

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)

def metadata(path):
    data = path.read_bytes()
    frames, width, height = struct.unpack_from('<HHH', data, 6)
    tags, durations = [], []
    pos = 128
    for _ in range(frames):
        size, magic, old_count, duration = struct.unpack_from('<IHHH', data, pos)
        count = struct.unpack_from('<I', data, pos + 12)[0] or old_count
        durations.append(duration)
        chunk = pos + 16
        for _ in range(count):
            length, kind = struct.unpack_from('<IH', data, chunk)
            if kind == 0x2018:
                total = struct.unpack_from('<H', data, chunk + 6)[0]
                tagpos = chunk + 16
                for _ in range(total):
                    start, end, direction = struct.unpack_from('<HHB', data, tagpos)
                    name_len = struct.unpack_from('<H', data, tagpos + 17)[0]
                    name = data[tagpos+19:tagpos+19+name_len].decode('utf-8')
                    tags.append(dict(name=name, start=start, end=end, direction=direction))
                    tagpos += 19 + name_len
            chunk += length
        pos += size
    return dict(width=width, height=height, frames=frames, tags=tags, durations=durations)

manifest = {}
for image in ROOT.glob('Foozle_*/**/*.png'):
    filename = image.name
    target = OUT / filename
    shutil.copyfile(image, target)
    source = next(ROOT.glob('Foozle_*/**/' + image.stem + '.aseprite'), None)
    if source:
        manifest[image.stem] = metadata(source)
    else:
        manifest[image.stem] = {}
    png_width, png_height = struct.unpack_from('>II', image.read_bytes(), 16)
    info = manifest[image.stem]
    info['sheetWidth'], info['sheetHeight'] = png_width, png_height
    if source:
        info['cols'], info['rows'] = png_width // info['width'], png_height // info['height']
        tags = info['tags']
        leaves = [t for t in tags if not any(o != t and o['start'] >= t['start'] and o['end'] <= t['end'] for o in tags)]
        if info['rows'] > 1 and len(leaves) <= info['rows']:
            mapping = []
            for row, tag in enumerate(leaves):
                mapping.extend([row * info['cols'] + x for x in range(tag['end'] - tag['start'] + 1)])
            if len(mapping) < info['frames']:
                row = len(leaves)
                mapping.extend([row * info['cols'] + x for x in range(info['frames'] - len(mapping))])
            info['frameMap'] = mapping
        else:
            info['frameMap'] = list(range(min(info['frames'], info['cols'] * info['rows'])))
(OUT / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
print(f'Prepared {len(manifest)} PNG assets')
for name, info in manifest.items():
    if name in ['Leafbug', 'Firewasp', 'Tower 02 - Level 01 - Weapon', 'Tower 05 - Level 01 - Weapon', 'Wisp - Animations', 'Animated water tiles']:
        print(name, {k:v for k,v in info.items() if k != 'durations'})
