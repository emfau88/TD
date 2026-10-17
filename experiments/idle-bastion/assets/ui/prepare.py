"""WebP delivery encoding only; originals and image dimensions remain unchanged.
Run manually with Pillow installed. No build-time image dependency is required.
"""
from pathlib import Path
from PIL import Image
root = Path(__file__).parent
for source in sorted((root / 'sources').glob('*.png')):
    with Image.open(source) as original:
        target = root / (source.stem + '.webp')
        original.save(target, 'WEBP', quality=88, method=6, exact=True)
        with Image.open(target) as result:
            assert result.size == original.size
            if original.mode == 'RGBA':
                assert original.getchannel('A').tobytes() == result.getchannel('A').tobytes()
        print(source.name, original.size, original.mode, target.stat().st_size)