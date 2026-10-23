"""Export existing Unity frames to lossless browser pages and phone-sized GIFs."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np, json, hashlib, concurrent.futures

P=Path(__file__).resolve().parent
E=P.parent/'unity/Export/ForwardLean'
CLIPS=[('after','ForwardLeanPhysics','Neue Vorbeuge',5.0)]
reference=np.array(Image.open(P.parent/'unity/Export/Idle/frame-000.png').convert('RGBA'))
manifest={'fps':30,'cycle':5.5,'clips':{}}
before=json.loads((P.parent/'physics-gestures/manifest.json').read_text(encoding='utf-8'))['clips']['lean']
before['pages']=['../physics-gestures/'+f for f in before['pages']]
manifest['clips']['before']=before
qa={}
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)

def encode(job):
    im,path=job
    if path.exists() and np.array_equal(np.array(im),np.array(Image.open(path))):
        return path.stat().st_size
    im.save(path,lossless=True,quality=80,method=1,exact=True)
    assert np.array_equal(np.array(im),np.array(Image.open(path)))
    return path.stat().st_size

for key,folder,label,duration in CLIPS:
    files=sorted((E/folder).glob('frame-*.png'))
    assert len(files)==round(duration*30)+1
    images=[Image.open(f).convert('RGBA') for f in files]
    first=np.array(images[0]);last=np.array(images[-1])
    check={'samples':len(images),'endpoint_exact':bool(np.array_equal(first,last)), 'rest_pixels_changed':int(np.any(first!=reference,axis=2).sum())}
    assert check['endpoint_exact'] and check['rest_pixels_changed']==0,check
    # Conservative inner torso rectangle that remains inside all three poses.
    check['transparent_pixels_inner_torso']=max(int((np.array(im)[510:590,350:415,3]<128).sum()) for im in images)
    assert check['transparent_pixels_inner_torso']==0
    boxes=[im.getbbox() for im in images]
    box=(min(b[0] for b in boxes),min(b[1] for b in boxes),max(b[2] for b in boxes),max(b[3] for b in boxes))
    w,h=box[2]-box[0],box[3]-box[1];pages=[];frames=[];jobs=[]
    for start in range(0,len(images),16):
        group=images[start:start+16];atlas=Image.new('RGBA',((w+4)*4,(h+4)*((len(group)+3)//4)))
        for i,im in enumerate(group):
            x=(i%4)*(w+4)+2;y=(i//4)*(h+4)+2;atlas.paste(im.crop(box),(x,y));frames.append([len(pages),x,y,w,h])
        name=f'{key}-{start//16:02}.webp';pages.append(name);jobs.append((atlas,P/name))
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        check['atlas_bytes']=sum(pool.map(encode,jobs))
    manifest['clips'][key]={'label':label,'duration':duration,'cycle':duration+.5,'pages':pages,'frames':frames,'crop':box,'gif':f'Mara-{key}.gif'}
    sheet=Image.new('RGB',(384*6,540),'#e7e0d2');draw=ImageDraw.Draw(sheet)
    for i,t in enumerate([0,.6,1.0,1.3,1.7,2.0]):
        im=images[round(t*30)].resize((384,512),Image.Resampling.LANCZOS);sheet.paste(im,(i*384,0),im);draw.text((i*384+12,516),f'{label} {t:.2f}s',font=font,fill='black')
    sheet.save(P/f'{key}-poses.jpg',quality=95)
    # One shared palette avoids per-frame palette flicker; native PNGs stay untouched.
    gif=[]
    for f in range(round((duration+.5)*20)):
        im=images[min(len(images)-1,round(f*30/20))].resize((384,512),Image.Resampling.LANCZOS)
        canvas=Image.new('RGB',(384,544),'#e7e0d2');canvas.paste(im,(0,25),im)
        ImageDraw.Draw(canvas).text((12,7),label,font=font,fill='#292a2b');gif.append(canvas)
    palette_source=Image.new('RGB',(384*10,544))
    for i in range(10):palette_source.paste(gif[round(i*(len(gif)-1)/9)],(384*i,0))
    palette=palette_source.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
    paletted=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in gif]
    path=P/f'Mara-{key}.gif';paletted[0].save(path,save_all=True,append_images=paletted[1:],duration=50,loop=0,optimize=False,disposal=1)
    g=Image.open(path);check['gif_frames']=g.n_frames;check['gif_bytes']=path.stat().st_size
    qa[key]=check;print(key,json.dumps(check),flush=True)
    del images,jobs,gif,paletted

baseline=json.loads((P/'baseline-hashes.json').read_text())
changed=[f for f,h in baseline.items() if hashlib.sha256(Path(f).read_bytes()).hexdigest()!=h]
qa['previous_files_changed']=changed
assert not changed,changed
(P/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
(P/'validation.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
# Direct animated comparison, synchronized to the same sample times.
old=P.parent/'unity/Export/PhysicsGestures/LeanForwardPhysics'
new=E/'ForwardLeanPhysics'
gif=[]
for f in range(110):
    index=min(150,round(f*30/20));canvas=Image.new('RGB',(768,544),'#e7e0d2');draw=ImageDraw.Draw(canvas)
    for col,folder,label in [(0,old,'Bisher'),(1,new,'Mehr Oberkörper')]:
        im=Image.open(folder/f'frame-{index:03}.png').convert('RGBA').resize((384,512),Image.Resampling.LANCZOS);canvas.paste(im,(col*384,25),im);draw.text((col*384+12,7),label,font=font,fill='#292a2b')
    gif.append(canvas)
sheet=Image.new('RGB',(768*8,544))
for i in range(8):sheet.paste(gif[round(i*109/7)],(768*i,0))
palette=sheet.quantize(colors=256,method=Image.Quantize.MEDIANCUT)
frames=[im.quantize(palette=palette,dither=Image.Dither.NONE) for im in gif]
frames[0].save(P/'Mara-Vorbeugen-Vergleich.gif',save_all=True,append_images=frames[1:],duration=50,loop=0,optimize=False,disposal=1)
print('PACK_OK',flush=True)
