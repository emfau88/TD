"""Export-only comparison. Keeps original art, animation and preview untouched."""
from pathlib import Path
from PIL import Image, ImageDraw
import numpy as np, json, hashlib
P=Path(__file__).resolve().parent
sources={'before':P/'baseline/frames','after':P.parent/'unity/Export/HeadComparison/HeadReactionOrganic'}
manifest={'fps':30,'cycle':2.7,'clips':{}}
qa={}
for name,source in sources.items():
    files=sorted(source.glob('frame-*.png')); images=[Image.open(f).convert('RGBA') for f in files]
    assert len(images)==(49 if name=='before' else 61),len(images)
    boxes=[im.getbbox() for im in images]; box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
    w,h=box[2]-box[0],box[3]-box[1]; frames=[];pages=[]
    for start in range(0,len(images),16):
        group=images[start:start+16]; atlas=Image.new('RGBA',((w+4)*4,(h+4)*((len(group)+3)//4)))
        for i,im in enumerate(group):
            x=(i%4)*(w+4)+2;y=(i//4)*(h+4)+2
            atlas.paste(im.crop(box),(x,y));frames.append([len(pages),x,y,w,h])
        filename=f'{name}-{start//16:02}.webp'
        if not (P/filename).exists(): atlas.save(P/filename,lossless=True,quality=100,method=4,exact=True)
        assert np.array_equal(np.array(atlas),np.array(Image.open(P/filename)))
        pages.append(filename)
    qa[name]={'frames':len(images),'endpoint_exact':np.array_equal(np.array(images[0]),np.array(images[-1])), 'duration':(len(images)-1)/30}
    assert qa[name]['endpoint_exact']
    manifest['clips'][name]={'pages':pages,'frames':frames,'crop':box,'duration':(len(images)-1)/30}
    # Original PNGs, sampled at actual timestamps, to inspect intermediate poses.
    sheet=Image.new('RGB',(384*6,540),'#e7e0d2');draw=ImageDraw.Draw(sheet)
    for i,t in enumerate([0,.2,.6,1,1.5,2]):
        im=images[min(len(images)-1,round(t*30))].resize((384,512),Image.Resampling.LANCZOS)
        sheet.paste(im,(i*384,0),im);draw.text((i*384+12,519),f'{name} {t:.2f} s',fill='#252525')
    sheet.save(P/f'{name}-poses.jpg',quality=95)
assert np.array_equal(np.array(Image.open(sources['before']/'frame-000.png')),np.array(Image.open(sources['after']/'frame-000.png')))
qa['same_rest']=True
baseline=json.loads((P/'baseline/hashes.json').read_text(encoding='utf-8-sig'))
qa['original_assets_unchanged']=all(hashlib.sha256(Path(f['Path']).read_bytes()).hexdigest().upper()==f['Hash'] for f in baseline)
assert qa['original_assets_unchanged']
(P/'manifest.json').write_text(json.dumps(manifest,indent=2))
(P/'validation.json').write_text(json.dumps(qa,indent=2))
print(json.dumps(qa,indent=2))
