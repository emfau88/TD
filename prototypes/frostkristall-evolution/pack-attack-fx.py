"""Pack the generated FX grid; no changes to any approved tower sprite."""
from pathlib import Path
from PIL import Image
import json,hashlib
R=Path(__file__).resolve().parent
src=Image.open(R/'sources/frost-cast-generated.png').convert('RGBA')
cells=[]
for i in range(8):
 box=(round(i%4*src.width/4),round(i//4*src.height/2),round((i%4+1)*src.width/4),round((i//4+1)*src.height/2))
 cell=src.crop(box);cell.putalpha(cell.getchannel('A').point(lambda a:255 if a>=192 else 0))
 cells.append(cell.crop(cell.getbbox()))
# A single shared scale preserves relative particle size across all frames.
scale=48/max(max(c.size) for c in cells)
out=Image.new('RGBA',(256,128))
boxes=[]
for i,c in enumerate(cells):
 c=c.resize((max(1,round(c.width*scale)),max(1,round(c.height*scale))),Image.Resampling.NEAREST)
 pos=(i%4*64+(64-c.width)//2,i//4*64+(64-c.height)//2)
 out.alpha_composite(c,pos)
 boxes.append([(64-c.width)//2,(64-c.height)//2,(64-c.width)//2+c.width,(64-c.height)//2+c.height])
target=R/'assets/frost-cast-v2.png';out.save(target,optimize=True)
metadata=dict(path='assets/frost-cast-v2.png',frameSize=64,columns=4,frames=8,boxes=boxes,sha256=hashlib.sha256(target.read_bytes()).hexdigest())
(R/'attack-fx.json').write_text(json.dumps(metadata,indent=2)+'\n',encoding='utf-8')
print(metadata)
