"""Small reproducible codec samples. Does not change source or runtime assets."""
from pathlib import Path
from PIL import Image
import json
import time

HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / 'tavern-hearts-0-2'
OUT = HERE / 'qa' / 'sizing'
OUT.mkdir(parents=True, exist_ok=True)
manifest = json.loads((SOURCE / 'manifest.json').read_text())
rows = []
for hero in ('mara', 'ilyra'):
    page = SOURCE / manifest['heroes'][hero]['idle']['pages'][5]
    with Image.open(page) as source:
        image = source.convert('RGBA')
    for fmt, quality in [('WEBP', 90), ('WEBP', 95), ('AVIF', 90)]:
        target = OUT / f'{hero}-page-{quality}.{fmt.lower()}'
        start = time.monotonic()
        try:
            image.save(target, format=fmt, quality=quality,
                       **({'method': 5, 'alpha_quality': 100} if fmt == 'WEBP' else {'speed': 6, 'subsampling': '4:4:4'}))
            rows.append(dict(hero=hero, format=fmt, quality=quality, sourceBytes=page.stat().st_size,
                             bytes=target.stat().st_size, seconds=round(time.monotonic() - start, 2)))
        except Exception as error:
            rows.append(dict(format=fmt, error=str(error)))
(HERE / 'lossy-samples.json').write_text(json.dumps(rows, indent=2) + '\n')
print(json.dumps(rows, indent=2))
