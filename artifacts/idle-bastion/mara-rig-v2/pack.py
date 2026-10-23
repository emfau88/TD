"""Lossless native-resolution atlases plus exhaustive sequence checks; no art generation."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,cv2,json,concurrent.futures,shutil
P=Path(__file__).resolve().parent;EXPORT=P/'unity/Export';OUT=P/'preview';OUT.mkdir(exist_ok=True)
clips={'Idle':150,'HeadReaction':48,'TouchReaction':72};manifest={'width':768,'height':1024,'fps':30,'clips':{}};qa={}
rest=np.array(Image.open(EXPORT/'Idle/frame-000.png'));inner=cv2.erode((rest[:,:,3]>240).astype('uint8'),np.ones((25,25),np.uint8))>0
def holes(alpha):
 foreground=(alpha>128).astype('uint8');background=1-foreground;n,lab,stats,_=cv2.connectedComponentsWithStats(background,8)
 outside=set(np.unique(np.concatenate([lab[0,:],lab[-1,:],lab[:,0],lab[:,-1]])))
 return [(int(stats[i,cv2.CC_STAT_AREA]),tuple(map(int,stats[i,:4])))for i in range(1,n)if i not in outside and stats[i,cv2.CC_STAT_AREA]>=3]
jobs=[]
for name,count in clips.items():
 arrays=[np.array(Image.open(EXPORT/name/f'frame-{i:03}.png').convert('RGBA')) for i in range(count+1)]
 extra=P/'diagnostics/first-pass-extra-frames';extra.mkdir(exist_ok=True)
 for path in (EXPORT/name).glob('frame-*.png'):
  if int(path.stem.split('-')[1])>count:shutil.move(path,extra/(name+'-'+path.name))
 lo=np.array([768,1024]);hi=np.array([0,0]);gaps=[];holeslist=[];maxsteps=[]
 for i,a in enumerate(arrays):
  y,x=np.where(a[:,:,3]>0);lo=np.minimum(lo,[x.min(),y.min()]);hi=np.maximum(hi,[x.max()+1,y.max()+1]);holeslist.append({'frame':i,'holes':holes(a[:,:,3])})
  if name!='TouchReaction':gaps.append(int(np.count_nonzero(inner&(a[:,:,3]<128))))
  if i:maxsteps.append(float(np.abs(a.astype('int16')-arrays[i-1].astype('int16')).mean()))
 box=tuple(map(int,[lo[0],lo[1],hi[0],hi[1]]));cw=box[2]-box[0];ch=box[3]-box[1];cellw=cw+4;cellh=ch+4
 info={'duration':count/30,'count':count,'crop':list(box),'pages':[],'frames':[]}
 for start in range(0,count,16):
  total=min(16,count-start);rows=(total+3)//4;atlas=Image.new('RGBA',(cellw*4,cellh*rows))
  for i in range(total):
   x=(i%4)*cellw+2;y=(i//4)*cellh+2;im=Image.fromarray(arrays[start+i]).crop(box);atlas.paste(im,(x,y));info['frames'].append([len(info['pages']),x,y,cw,ch])
  filename=f'{name}-{start//16:02}.webp';info['pages'].append(filename);jobs.append((atlas,OUT/filename))
 manifest['clips'][name]=info
 qa[name]={'samples':count+1,'duration':count/30,'endpoint_exact':bool(np.array_equal(arrays[0],arrays[-1])),'starts_at_idle_rest':bool(np.array_equal(arrays[0],rest)),'max_interior_gap_pixels':max(gaps) if gaps else None,'holes':holeslist,'max_mean_rgba_step':max(maxsteps),'crop':box}
 # Contact sheet at fixed quarters, with no frame interpolation.
 sheet=Image.new('RGB',(384*5,540),'#ddd9ce');d=ImageDraw.Draw(sheet)
 for k,t in enumerate([0,.25,.5,.75,1]):
  im=Image.fromarray(arrays[round(count*t)]).resize((384,512),Image.Resampling.LANCZOS);sheet.paste(im,(384*k,0),im);d.text((384*k+12,520),f'{name} {t*count/30:.2f}s',fill='black')
 sheet.save(OUT/(name+'-poses.jpg'),quality=95)
def encode(job):
 im,path=job;im.save(path,lossless=True,quality=100,method=4,exact=True)
 decoded=np.array(Image.open(path));assert np.array_equal(decoded,np.array(im)),path
 return (path.name,path.stat().st_size)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 sizes=dict(pool.map(encode,jobs))
manifest['bytes']=sizes;(OUT/'manifest.json').write_text(json.dumps(manifest,indent=2));(P/'diagnostics/validation.json').write_text(json.dumps(qa,indent=2))
shutil.copy(EXPORT/'rig-poses.json',OUT/'rig-poses.json')
shutil.copy(EXPORT/'Idle/frame-000.png',OUT/'rest.png')
order=list(reversed(json.loads((P/'art/assembly.json').read_text())['frontToBack']))
tiles=Image.new('RGB',(1200,((len(order)+5)//6)*270),'#ddd9ce');draw=ImageDraw.Draw(tiles)
for i,name in enumerate(order):
 im=Image.open(P/f'unity/Assets/Art/{name}.png');im=im.crop(im.getbbox());im.thumbnail((180,230),Image.Resampling.LANCZOS);x=(i%6)*200+(200-im.width)//2;y=(i//6)*270;tiles.paste(im,(x,y),im);draw.text(((i%6)*200+10,y+240),name,fill='black')
tiles.save(OUT/'layers.png')
print(json.dumps({'atlas_bytes':sum(sizes.values()),'clips':{n:{k:v for k,v in q.items()if k!='holes'}for n,q in qa.items()}},indent=2))

