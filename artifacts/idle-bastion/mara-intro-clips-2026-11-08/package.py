"""Turn the two approved silent videos into transparent, fixed-size UI frame atlases.
Only the exterior preview matte is removed. Native timing and source clips remain unchanged.
"""
from pathlib import Path
import hashlib, json, subprocess
import cv2
import numpy as np
from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
OUT = REPO/'experiments/idle-bastion/assets/intro/mara/animation'
OUT.mkdir(parents=True, exist_ok=True)
records = []
for code, label, count in [('MI01','Begruessung',73), ('MI02','Erklaerung',56)]:
    source = HERE/code/f'Mara_{code}_{label}_ComfyUI.mp4'
    verification = json.loads((HERE/code/'verification.json').read_text(encoding='utf-8'))
    assert verification['user_approved'], f'{code}: approval required before packaging'
    assert hashlib.sha256(source.read_bytes()).hexdigest() == verification['video_sha256']
    raw = subprocess.check_output(['ffmpeg','-v','error','-i',str(source),'-f','rawvideo','-pix_fmt','rgb24','-'])
    frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1,576,480,3)
    assert len(frames) == count
    atlas = None
    pages = []
    samples = []
    for n, frame in enumerate(frames):
        background = np.median(np.concatenate([frame[:18,:18].reshape(-1,3),frame[:18,-18:].reshape(-1,3)]),axis=0)
        distance = np.max(np.abs(frame.astype(np.float32)-background),axis=2)
        candidate = (distance < 18).astype(np.uint8)
        _, labels = cv2.connectedComponents(candidate, connectivity=8)
        edge_labels = np.unique(np.concatenate([labels[0],labels[-1],labels[:,0],labels[:,-1]]))
        edge_labels = edge_labels[edge_labels != 0]
        exterior = np.isin(labels, edge_labels)
        alpha = cv2.GaussianBlur((~exterior).astype(np.float32),(3,3),0.5)
        rgb = np.clip((frame.astype(np.float32)-background*(1-alpha[:,:,None]))/np.maximum(alpha[:,:,None],1e-6),0,255)
        rgba = np.dstack([rgb.astype(np.uint8),np.rint(alpha*255).astype(np.uint8)])
        # Undo the proportional reference's five-pixel top padding, preserving the old 272:320 portrait box.
        image = Image.fromarray(rgba).crop((0,5,480,570)).resize((272,320),Image.Resampling.LANCZOS)
        if n%16 == 0: atlas = Image.new('RGBA',(1088,1280))
        atlas.paste(image,((n%4)*272,((n%16)//4)*320))
        if n%16 == 15 or n == count-1:
            name = f'{code.lower()}-{n//16}.webp'
            atlas.save(OUT/name,quality=85,method=6,exact=True)
            pages.append(name)
        if n in [0,count//4,count//2,3*count//4,count-1]:
            samples.append(image)
            image.save(HERE/code/f'packaged-frame-{n}.png')
    sheet = Image.new('RGB',(272*len(samples),640))
    for i, image in enumerate(samples):
        for row, color in enumerate([(238,238,238),(25,45,41)]):
            bg = Image.new('RGBA',(272,320),color+(255,)); bg.alpha_composite(image)
            sheet.paste(bg.convert('RGB'),(i*272,row*320))
    sheet.save(HERE/code/'packaged-review.jpg',quality=94)
    record = dict(code=code,frames=count,fps=24,width=272,height=320,columns=4,perPage=16,pages=pages,
        source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),bytes=sum((OUT/p).stat().st_size for p in pages))
    records.append(record)
(OUT/'manifest.json').write_text(json.dumps(records,indent=2)+'\n',encoding='utf-8')
(HERE/'packaging.json').write_text(json.dumps(dict(clips=records,method='Exterior connected background only, tolerance 18, 0.5 px alpha edge, unpremultiply matte; crop pad and resize to original portrait ratio.',source_videos_unchanged=True),indent=2)+'\n',encoding='utf-8')
print(json.dumps(records))
