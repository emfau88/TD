"""Asset invariants for the isolated visual study; no gameplay expectations."""
import hashlib, json
from math import hypot
from pathlib import Path
from PIL import Image, ImageChops

root = Path(__file__).resolve().parent
repo = root.parents[1]
manifest = json.loads((root / 'manifest.json').read_text())
for i, level in enumerate([1, 4, 7]):
    expected = Image.open(repo/'public/assets/Tower 01.png').convert('RGBA').crop((64*i,0,64*i+64,128))
    actual = Image.open(root/f'assets/level-{level}-base.png').convert('RGBA')
    assert expected.tobytes() == actual.tobytes(), f'Original base changed: {level}'
    expected = Image.open(repo/f'public/assets/Tower 01 - Level 0{i+1} - Weapon.png').convert('RGBA').crop((0,0,96,96))
    actual = Image.open(root/f'assets/level-{level}-weapon.png').convert('RGBA')
    assert expected.tobytes() == actual.tobytes(), f'Original weapon changed: {level}'
for level in [1,4,7,10,15,20]:
    for part, size in [('base',(64,128)),('weapon',(96,96))]:
        image = Image.open(root/f'assets/level-{level}-{part}.png').convert('RGBA')
        assert image.size == size
        assert set(image.getchannel('A').getdata()) <= {0,255}, (level,part,'soft alpha')
    if level >= 10:
        base = Image.open(root/f'assets/level-{level}-base.png')
        weapon = Image.open(root/f'assets/level-{level}-weapon.png')
        assert base.getbbox() == (0,12,64,128), 'Expanded level-7 base envelope'
        box = weapon.getbbox()
        radius=max(hypot(x+.5-48,y+.5-48) for y in range(96) for x in range(96) if weapon.getpixel((x,y))[3])
        assert radius <= 32, 'Rotated static weapon exceeds base width'
        assert box[0] >= 16 and box[2] <= 80, 'Weapon wider than original base'
        assert box[1] - 2.742857 >= 12 and box[3] - 2.742857 <= 128
for name, expected in manifest['hashes'].items():
    assert hashlib.sha256((root/'assets'/name).read_bytes()).hexdigest() == expected, name
assert manifest['scale'] == .63 and manifest['cellSize'] == 40
print('PASS: six original frames unchanged; all sprite frames/alpha/hashes valid; new bases equal level-7 envelope; weapons inside envelope.')
