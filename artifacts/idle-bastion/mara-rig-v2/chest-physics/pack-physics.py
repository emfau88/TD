"""Native lossless comparison of identical body motion, spring disabled/enabled."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json,hashlib,concurrent.futures
P=Path(__file__).resolve().parent;E=P.parent/'unity/Export/ChestPhysics'
sources={'before':E/'SpringPoseWithoutPhysicsTuned','after':E/'SpringPoseWithPhysicsTuned'}
manifest={'fps':30,'cycle':4.9,'clips':{}};qa={};jobs=[]
reference=np.array(Image.open(P.parent/'unity/Export/Idle/frame-000.png').convert('RGBA'))
for name,source in sources.items():
 files=sorted(source.glob('frame-*.png'));assert len(files)==127,len(files)
 images=[Image.open(f).convert('RGBA') for f in files];first=np.array(images[0]);last=np.array(images[-1])
 qa[name]={'samples':len(images),'duration':4.2,'endpoint_exact':bool(np.array_equal(first,last)),'rest_diff_from_original_pixels':int(np.any(first!=reference,axis=2).sum())}
 assert qa[name]['endpoint_exact']
 boxes=[im.getbbox() for im in images];box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes));w,h=box[2]-box[0],box[3]-box[1];frames=[];pages=[]
 for start in range(0,len(images),16):
  group=images[start:start+16];atlas=Image.new('RGBA',((w+4)*4,(h+4)*((len(group)+3)//4)))
  for i,im in enumerate(group):
   x=(i%4)*(w+4)+2;y=(i//4)*(h+4)+2;atlas.paste(im.crop(box),(x,y));frames.append([len(pages),x,y,w,h])
  file=f'{name}-{start//16:02}.webp';pages.append(file);jobs.append((atlas,P/file))
 manifest['clips'][name]={'pages':pages,'frames':frames,'crop':box,'duration':4.2}
 sheet=Image.new('RGB',(384*6,540),'#e7e0d2');draw=ImageDraw.Draw(sheet)
 for i,t in enumerate([0,.56,.90,1.27,1.68,4.2]):
  im=images[round(t*30)].resize((384,512),Image.Resampling.LANCZOS);sheet.paste(im,(i*384,0),im);draw.text((i*384+12,519),f'{name} {t:.2f}s',fill='black')
 sheet.save(P/f'{name}-poses.jpg',quality=95)
def encode(job):
 im,path=job
 if not path.exists(): im.save(path,lossless=True,quality=100,method=3,exact=True)
 assert np.array_equal(np.array(im),np.array(Image.open(path)));return path.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:qa['atlas_bytes']=sum(pool.map(encode,jobs))
diffs=[];outside=[];face=[];alpha=[];outside_delta=[];outside_alpha=[]
for i in range(127):
 a=np.array(Image.open(sources['before']/f'frame-{i:03}.png').convert('RGBA'));b=np.array(Image.open(sources['after']/f'frame-{i:03}.png').convert('RGBA'));d=np.any(a!=b,axis=2)
 diffs.append(int(d.sum()));face.append(int(d[:410,:].sum()));d[410:660,225:570]=False;outside.append(int(d.sum()));alpha.append(int(np.count_nonzero((a[470:580,290:480,3]>240)&(b[470:580,290:480,3]<128))))
 outside_delta.append(int(np.abs(a.astype('int16')-b.astype('int16'))[d].max()) if d.any() else 0);outside_alpha.append(int(np.count_nonzero(a[:,:,3][d]!=b[:,:,3][d])))
qa['max_changed_pixels']=max(diffs);qa['peak_difference_frame']=int(np.argmax(diffs));qa['face_changes']=max(face);qa['changes_outside_chest_region']=max(outside);qa['new_transparent_pixels_inside_torso']=max(alpha)
qa['outside_region_max_channel_delta']=max(outside_delta);qa['outside_region_alpha_changes']=max(outside_alpha)
print(json.dumps(qa,indent=2),flush=True)
# A maximum of four RGB rounding pixels (1/255, alpha unchanged) at the distant
# subdivided mesh fringe are recorded explicitly, not counted as geometry motion.
assert qa['max_changed_pixels']>0 and qa['face_changes']==0 and qa['outside_region_max_channel_delta']<=1 and qa['outside_region_alpha_changes']==0 and qa['new_transparent_pixels_inside_torso']==0
hashes=json.loads((P/'baseline-hashes.json').read_text(encoding='utf-8-sig'));qa['previous_model_unchanged']=all(hashlib.sha256(Path(f['Path']).read_bytes()).hexdigest().upper()==f['Hash'] for f in hashes);assert qa['previous_model_unchanged']
(P/'manifest.json').write_text(json.dumps(manifest,indent=2));(P/'validation.json').write_text(json.dumps(qa,indent=2));print(json.dumps(qa,indent=2))
