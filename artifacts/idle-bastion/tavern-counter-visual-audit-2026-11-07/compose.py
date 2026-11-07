"""Arrange actual screenshots with labels; never retouch the game captures."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path(__file__).resolve().parent
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',24)
for kind,second,title in [('desktop','mc07','MC07 · Annäherung'),('phone','mc06','MC06 · Lachen')]:
    images=[Image.open(root/f'{kind}-{state}.png').convert('RGB') for state in ['idle',second]]
    width=820 if kind=='desktop' else 390
    images=[im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS) if im.width!=width else im for im in images]
    result=Image.new('RGB',(2*width+24,images[0].height+56),(23,19,15));draw=ImageDraw.Draw(result)
    for i,(im,label) in enumerate(zip(images,['MC01 · Ruhe',title])):
        x=i*(width+24);draw.text((x+12,12),label,font=font,fill=(243,230,207));result.paste(im,(x,56))
    result.save(root/f'{kind}-pair.jpg',quality=94)
