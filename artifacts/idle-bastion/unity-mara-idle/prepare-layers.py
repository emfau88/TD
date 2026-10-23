"""Register generated hidden artwork; extract unchanged visible reference layers."""
from pathlib import Path
import json, struct
import cv2
import numpy as np
from PIL import Image, ImageDraw

project = Path(__file__).resolve().parent
root = project.parents[2]
art = root / 'experiments/idle-bastion/assets/mara-tavern/unity-idle'
source = np.array(Image.open(art.parent/'rest-reference/rest.png').convert('RGBA'))
H,W = source.shape[:2]

def register(path, target, mask=None):
    image = np.array(Image.open(path).convert('RGBA').resize((target.shape[1],target.shape[0]), Image.Resampling.NEAREST))
    sift = cv2.SIFT_create()
    a,da=sift.detectAndCompute(cv2.cvtColor(image[:,:,:3],cv2.COLOR_RGB2GRAY),None)
    b,db=sift.detectAndCompute(cv2.cvtColor(target[:,:,:3],cv2.COLOR_RGB2GRAY),mask)
    good=[x for x,y in cv2.BFMatcher().knnMatch(da,db,k=2) if x.distance < .72*y.distance]
    matrix, inliers=cv2.estimateAffinePartial2D(np.float32([a[m.queryIdx].pt for m in good]),np.float32([b[m.trainIdx].pt for m in good]),method=cv2.RANSAC,ransacReprojThreshold=3)
    assert matrix is not None
    print(path.name, 'matches',len(good),'inliers',int(inliers.sum()),'matrix',matrix.tolist())
    return cv2.warpAffine(image,matrix,(target.shape[1],target.shape[0]),flags=cv2.INTER_NEAREST)

mask=np.zeros((H,W),np.uint8);mask[235:477,:]=255
under=register(art/'source-underpaint.png',source,mask)
Image.fromarray(under).save(art/'registered-underpaint.png')
head=np.array(Image.open(art/'head-reference.png'))
closed=register(art/'source-blink.png',head)
Image.fromarray(closed).save(art/'registered-blink-head.png')
half=register(art/'source-blink-half.png',head)
Image.fromarray(half).save(art/'registered-half-head.png')

def polygon(points):
    mask=Image.new('L',(W,H));ImageDraw.Draw(mask).polygon(points,fill=255)
    return np.array(mask)>0

# These masks only separate existing pixels; no visible features are redrawn.
head_mask=polygon([(0,0),(384,0),(384,183),(250,183),(252,202),(238,212),(226,207),(219,196),(210,195),(198,202),(181,204),(165,196),(147,184),(137,184),(129,193),(116,188),(109,199),(97,209),(0,220)])
braid_mask=polygon([(143,183),(164,192),(167,210),(162,224),(155,241),(153,260),(147,278),(151,294),(149,310),(151,322),(145,337),(132,342),(123,330),(130,319),(121,309),(119,295),(117,279),(121,263),(124,244),(129,228),(134,211),(132,196)])
left_hair=polygon([(102,193),(113,205),(102,216),(88,228),(83,245),(71,259),(75,273),(69,293),(55,289),(50,269),(60,249),(65,230),(80,213)])
right_hair=polygon([(226,191),(240,195),(247,211),(258,219),(264,235),(280,246),(284,261),(270,258),(262,244),(249,240),(247,226),(235,218),(225,210)])
left_cloth=polygon([(0,270),(104,270),(106,303),(81,317),(73,334),(74,365),(91,397),(76,422),(0,422)])
right_cloth=polygon([(266,277),(384,277),(384,356),(291,356),(290,339),(281,321),(268,312)])
left_hand=polygon([(77,330),(104,326),(117,340),(141,352),(162,368),(166,385),(153,399),(133,402),(110,389),(95,377),(82,359)])
right_hand=polygon([(246,328),(279,325),(291,345),(297,374),(309,410),(300,439),(273,444),(263,428),(267,398),(259,380),(251,358)])
lower=polygon([(0,353),(384,353),(384,512),(0,512)])

# Front-to-back ownership keeps the reconstructed rest composition exact.
parts=[('Head',head_mask),('Braid',braid_mask),('LeftHair',left_hair),('RightHair',right_hair),('LeftHand',left_hand),('RightHand',right_hand),('LeftCloth',left_cloth),('RightCloth',right_cloth),('Hips',lower)]
used=np.zeros((H,W),bool);layers=[]
for name, region in parts:
    own=region & ~used
    # Two opaque pixels of underlap beneath preceding (front) layers protect the joints.
    overlap=(cv2.dilate(own.astype(np.uint8),np.ones((5,5),np.uint8))>0)&used&(source[:,:,3]==255)
    used|=region
    data=source.copy();data[~(own|overlap)]=0
    layers.append((name,data))
body=source.copy();body[used]=0
body_own=(~used)&(source[:,:,3]>0)
body_overlap=(cv2.dilate(body_own.astype(np.uint8),np.ones((5,5),np.uint8))>0)&used&(source[:,:,3]==255)
body[body_overlap]=source[body_overlap]
layers.append(('Torso',body))

# Only the previously occluded hair/head area receives generated underpainting.
# Extend underneath original body by two pixels to prevent pinhole seams.
occluded=(head_mask|braid_mask|left_hair|right_hair)
fill=under.copy();fill[~occluded]=0
fill[:188]=0
layers.append(('HiddenBody',fill))

dest=project/'Assets/Art';dest.mkdir(parents=True,exist_ok=True)
for name,data in layers:
    Image.fromarray(data).save(dest/f'{name}.png')

# The whole head stays identical outside these fixed eye polygons.
eyes=polygon([(143,160),(149,157),(158,155),(165,157),(171,161),(171,170),(164,174),(151,174),(144,169)])
eyes|=polygon([(181,151),(188,147),(201,143),(212,142),(214,155),(209,164),(202,169),(188,168),(179,159)])
head_pixels=dict(layers)['Head']
for name,registered in [('HeadHalf',half),('HeadClosed',closed)]:
    region=np.array(Image.fromarray(registered).resize((175,148),Image.Resampling.NEAREST))
    aligned=source.copy();aligned[65:213,85:260]=region
    data=head_pixels.copy();data[eyes,:3]=aligned[eyes,:3]
    if name=='HeadHalf':
        # Preserve the original iris/white artwork wherever the intermediate lid leaves it visible.
        rgb=aligned[:,:,:3].astype(np.int16)
        green=(rgb[:,:,1]>rgb[:,:,0]*1.12)&(rgb[:,:,1]>rgb[:,:,2]*1.12)
        white=(rgb.min(axis=2)>185)&((rgb.max(axis=2)-rgb.min(axis=2))<35)
        preserve=eyes&(green|white)
        data[preserve,:3]=source[preserve,:3]
    Image.fromarray(data).save(dest/f'{name}.png')
    demo=source.copy();demo[eyes,:3]=data[eyes,:3]
    Image.fromarray(demo).save(art/f'{name.lower()}-check.png')

assembled=Image.new('RGBA',(W,H))
for name,data in reversed(layers):assembled=Image.alpha_composite(assembled,Image.fromarray(data))
assembled.save(art/'prepared-rest.png')
print('layers',len(layers))

# PSB v2, uncompressed 8-bit RGBA layers, plus merged preview.
def u16(v):return struct.pack('>H',v)
def u32(v):return struct.pack('>I',v)
def u64(v):return struct.pack('>Q',v)
records=bytearray(); channels=bytearray()
for name,data in layers:
    ys,xs=np.where(data[:,:,3]>0)
    if not len(xs):raise ValueError(name)
    l,t,r,b=int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)
    cut=data[t:b,l:r];size=(r-l)*(b-t)
    record=struct.pack('>iiiiH',t,l,b,r,4)
    for cid in (-1,0,1,2): record+=struct.pack('>hQ',cid,size+2)
    label=bytes([len(name)])+name.encode('ascii');label+=b'\0'*((-len(label))%4)
    extra=u32(0)+u32(0)+label
    records+=record+b'8BIMnorm'+bytes([255,0,0,0])+u32(len(extra))+extra
    for channel in (3,0,1,2):channels+=u16(0)+cut[:,:,channel].tobytes()
layerinfo=struct.pack('>h',-len(layers))+records+channels
layerinfo+=b'\0'*(len(layerinfo)%2)
layermask=u64(len(layerinfo))+layerinfo+u32(0)
merged=np.array(assembled)
psb=b'8BPS'+u16(2)+b'\0'*6+u16(4)+u32(H)+u32(W)+u16(8)+u16(3)+u32(0)+u32(0)+u64(len(layermask))+layermask+u16(0)
psb+=b''.join(merged[:,:,i].tobytes() for i in (0,1,2,3))
(dest/'MaraLayers.psb').write_bytes(psb)
(art/'layers.json').write_text(json.dumps({'canvas':[W,H],'layersFrontToBack':[n for n,d in layers]},indent=2),encoding='utf-8')
