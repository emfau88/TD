"""Register generated eyelids; keep the approved head outside the eye patches."""
from pathlib import Path
import shutil,json
from PIL import Image,ImageDraw,ImageFont
import numpy as np
P=Path(__file__).resolve().parent;A=P/'unity/Assets';root=P.parent
source=root/'art/head-jaw-source.png'
generated=Path('C:/Users/madde/.codex/generated_images/01a16007-e484-70b3-8407-669db7bb28d0')
files={'Closed':'exec-51a02894-6312-4978-8f6d-ae5e0b0405d7.png','Half':'exec-9784852d-bf0f-4fc7-9aad-3a121012459a.png'}
base=Image.open(source).convert('RGBA');a=np.array(base)
y,x=np.mgrid[:a.shape[0],:a.shape[1]]
def smooth(v):
 v=np.clip(v,0,1);return v*v*(3-2*v)
# Feather the new drawing into untouched skin, excluding brows, nose and cheeks.
mask=np.maximum(smooth((x-310)/12)*smooth((560-x)/12),smooth((x-695)/12)*smooth((940-x)/12))*smooth((y-542)/10)*smooth((698-y)/12)
overview=Image.new('RGB',(930,370),'#e6e0d4');font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',23)
for i,state in enumerate(['Open','Half','Closed']):
 if state=='Open':im=base
 else:
  shutil.copy2(generated/files[state],P/'art'/f'head-{state.lower()}-source.png')
  b=np.array(Image.open(P/'art'/f'head-{state.lower()}-source.png').convert('RGBA').resize(base.size,Image.Resampling.LANCZOS))
  mixed=np.rint(a.astype(float)*(1-mask[:,:,None])+b.astype(float)*mask[:,:,None]).astype('uint8');mixed[:,:,3]=a[:,:,3]
  im=Image.fromarray(mixed);im.save(P/'art'/f'head-{state.lower()}-registered.png')
  # Identical original head placement, no change to pivot or head silhouette.
  layer=Image.new('RGBA',(768,1280));layer.alpha_composite(im.crop((205,115,1045,1005)).resize((222,235),Image.Resampling.LANCZOS),(272,203))
  layer.save(A/'Art'/f'Head{state}.png')
  assert np.array_equal(mixed[mask==0],a[mask==0])
 bg=Image.new('RGBA',im.size,'#e6e0d4');bg.alpha_composite(im)
 overview.paste(bg.crop((280,450,980,1010)).resize((310,310),Image.Resampling.LANCZOS).convert('RGB'),(i*310,40))
 ImageDraw.Draw(overview).text((i*310+15,6),state,font=font,fill='#20334a')
overview.save(P/'preview/blink-states.jpg',quality=95)
print('Localized eyelids registered; all pixels outside eye regions preserved.')
