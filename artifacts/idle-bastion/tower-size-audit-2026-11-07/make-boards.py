"""Arrange unchanged in-game screenshots with labels; no sprite/image retouching."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

p = Path(__file__).resolve().parent
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
board = Image.new('RGB', (960, 708), '#10191f')
draw = ImageDraw.Draw(board)
for row, age in enumerate(['idle', 'fire']):
    for col, angle in enumerate([0, 90, 180, 270]):
        label = f'L1 | {angle} Grad | ' + ('Ruhe' if age == 'idle' else 'Schuss')
        draw.text((col * 240 + 10, row * 354 + 7), label, font=font, fill='white')
        board.paste(Image.open(p / 'ingame' / f'kind4-level1-{angle}-{age}.png'), (col * 240, row * 354 + 32))
board.save(p / 'sniper-ingame-directions.jpg', quality=95)
board = Image.new('RGB', (720, 354), '#10191f')
draw = ImageDraw.Draw(board)
for col, level in enumerate([1, 2, 3]):
    draw.text((col * 240 + 10, 7), f'Frost L{level} | gleicher Zoom', font=font, fill='white')
    board.paste(Image.open(p / 'ingame' / f'kind2-level{level}-0-idle.png'), (col * 240, 32))
board.save(p / 'frost-ingame-levels.jpg', quality=95)
