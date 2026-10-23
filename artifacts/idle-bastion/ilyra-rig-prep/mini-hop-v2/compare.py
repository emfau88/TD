from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np
P=Path('artifacts/idle-bastion/ilyra-rig-prep');V=P/'mini-hop-v2/preview';A=P/'mini-hop-v1/preview'
a=json.loads((A/'validation.json').read_text(encoding='utf-8'));b=json.loads((V/'validation.json').read_text(encoding='utf-8'))
assert all(x['joints'][:26]==y['joints'][:26] for x,y in zip(a['poses'],b['poses']))
frames=[]
for i in range(65):
 f=min(96,round(i*1.5));out=Image.new('RGB',(768,674),'#e6e0d4');draw=ImageDraw.Draw(out);draw.text((20,12),'VORHER',fill='#302827');draw.text((404,12),'NACHHER',fill='#302827')
 for n,src in enumerate([A,V]):
  im=Image.open(src/'frames'/f'frame-{f:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);out.paste(bg.convert('RGB').resize((384,640),Image.Resampling.LANCZOS),(n*384,34))
 frames.append(out)
frames[0].save(V/'Ilyra-Huepfer-Vergleich.gif',save_all=True,append_images=frames[1:],duration=[50]*64+[700],loop=0,optimize=False)
contact=Image.new('RGB',(1200,240),'#e6e0d4')
for i,f in enumerate([18,26,31,35,40,47]):
 im=Image.open(V/'frames'/f'frame-{f:03}.png').convert('RGBA');bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im);crop=bg.crop((180,475,580,875)).resize((200,200));contact.paste(crop.convert('RGB'),(i*200,40));ImageDraw.Draw(contact).text((i*200+10,12),f'{f/30:.2f}s',fill='black')
contact.save(V/'chest-contact.png')
print('All 26 body joints unchanged in all 98 states; comparison GIF ready.')
