"""Lossless native Unity exports; original clips/atlases remain untouched."""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np, json, hashlib, concurrent.futures
P=Path(__file__).resolve().parent
original=json.loads((P.parent/'preview/manifest.json').read_text())
manifest={'fps':30,'comparisons':{}};qa={};jobs=[]
for name,newname,frames,duration in [('Idle','IdleOrganic',151,5),('TouchReaction','TouchReactionOrganic',85,2.8)]:
    source=P.parent/'unity/Export/BodyComparison'/newname
    files=sorted(source.glob('frame-*.png'));assert len(files)==frames,(name,len(files))
    images=[Image.open(f).convert('RGBA') for f in files]
    baseline=Image.open(P/'baseline'/name/'frame-000.png').convert('RGBA')
    before=dict(original['clips'][name]);before['pages']=['../preview/'+f for f in before['pages']]
    # Include original exact final pose for holding at the end of reactions.
    before['frames']=before['frames']+[before['frames'][0]]
    boxes=[im.getbbox() for im in images];box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
    w,h=box[2]-box[0],box[3]-box[1];coords=[];pages=[]
    for start in range(0,len(images),16):
        group=images[start:start+16];atlas=Image.new('RGBA',((w+4)*4,(h+4)*((len(group)+3)//4)))
        for i,im in enumerate(group):
            x=(i%4)*(w+4)+2;y=(i//4)*(h+4)+2
            atlas.paste(im.crop(box),(x,y));coords.append([len(pages),x,y,w,h])
        filename=f'{newname}-{start//16:02}.webp';pages.append(filename);jobs.append((atlas,P/filename))
    after={'pages':pages,'frames':coords,'crop':box,'duration':duration}
    manifest['comparisons'][name]={'cycle':5 if name=='Idle' else 3.5,'before':before,'after':after}
    qa[name]={'samples':frames,'duration':duration,'endpoint_exact':np.array_equal(np.array(images[0]),np.array(images[-1])),'same_rest':np.array_equal(np.array(baseline),np.array(images[0]))}
    assert qa[name]['endpoint_exact'] and qa[name]['same_rest'],qa[name]
    # Compare transparent gaps inside a conservative solid torso region only.
    a0=np.array(baseline);region=np.zeros(a0.shape[:2],dtype=bool);region[470:690,290:480]=True
    region &= a0[:,:,3]>240
    qa[name]['transparent_pixels_inside_torso']=max(int(np.count_nonzero(region&(np.array(im)[:,:,3]<128))) for im in images)
    sheet=Image.new('RGB',(384*6,540),'#e7e0d2');draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(np.linspace(0,duration,6)):
        im=images[round(t*30)].resize((384,512),Image.Resampling.LANCZOS);sheet.paste(im,(i*384,0),im);draw.text((i*384+12,519),f'{newname} {t:.2f} s',fill='#252525')
    sheet.save(P/f'{newname}-poses.jpg',quality=95)
def encode(job):
    atlas,path=job;atlas.save(path,lossless=True,quality=100,method=3,exact=True)
    assert np.array_equal(np.array(atlas),np.array(Image.open(path))),path
    return path.stat().st_size
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: qa['atlas_bytes']=sum(pool.map(encode,jobs))
hashes=json.loads((P/'baseline/hashes.json').read_text(encoding='utf-8-sig'))
qa['original_assets_and_head_study_unchanged']=all(hashlib.sha256(Path(f['Path']).read_bytes()).hexdigest().upper()==f['Hash'] for f in hashes)
assert qa['original_assets_and_head_study_unchanged']
(P/'manifest.json').write_text(json.dumps(manifest,indent=2))
(P/'validation.json').write_text(json.dumps(qa,indent=2));print(json.dumps(qa,indent=2))
