from pathlib import Path
from PIL import Image,ImageDraw
V=Path(__file__).resolve().parent/'preview'
frames=[0,21,27,34,43,56,84,120]
out=Image.new('RGB',(1280,580),'#e6e0d4');d=ImageDraw.Draw(out)
for i,f in enumerate(frames):
 im=Image.open(V/'frames'/f'frame-{f:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im)
 x=(i%4)*320;y=(i//4)*290;out.paste(bg.crop((130,230,638,660)).convert('RGB').resize((300,254)),(x,y+30));d.text((x+10,y+8),f'{f/30:.2f} s',fill='black')
out.save(V/'keyframes.png')
