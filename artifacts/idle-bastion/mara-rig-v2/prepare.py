"""Pack predesigned separated production pieces; retain registration and editable sources."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
import numpy as np, json,struct,cv2
P=Path(__file__).resolve().parent
OUT=P/'unity/Assets/Art'; W,H=768,1024
body=Image.open(P/'art/body-kit-source.png').convert('RGBA')
head=Image.open(P/'art/head-kit-source.png').convert('RGBA')
layers={}; specs=[]
def clean(im):
 a=np.array(im);a[:,:,3][a[:,:,3]>=240]=255;a[a[:,:,3]<8]=0
 num,labels,stats,_=cv2.connectedComponentsWithStats((a[:,:,3]>16).astype('uint8'),8)
 if num>1:
  keep=1+np.argmax(stats[1:,cv2.CC_STAT_AREA]);mask=cv2.dilate((labels==keep).astype('uint8'),np.ones((5,5),np.uint8))>0;a[~mask]=0
 return Image.fromarray(a)
def put(name,sheet,box,size,pos,angle=0):
 im=clean(sheet.crop(box)).resize(size,Image.Resampling.LANCZOS)
 if angle: im=im.rotate(angle,Image.Resampling.BICUBIC,expand=True)
 canvas=Image.new('RGBA',(W,H));canvas.alpha_composite(im,pos);layers[name]=canvas
 specs.append(dict(name=name,crop=box,size=size,position=pos,rotation=angle))
 return im
def anchored(name,sheet,box,scale,source_anchor,target,angle=0):
 im=clean(sheet.crop(box));size=(round(im.width*scale),round(im.height*scale));im=im.resize(size,Image.Resampling.LANCZOS)
 point=np.array([(source_anchor[0]-box[0])*scale,(source_anchor[1]-box[1])*scale]);center=np.array(size)/2
 theta=np.deg2rad(angle);R=np.array([[np.cos(theta),np.sin(theta)],[-np.sin(theta),np.cos(theta)]])
 rot=im.rotate(angle,Image.Resampling.BICUBIC,expand=True);point=R@(point-center)+np.array(rot.size)/2
 pos=tuple(np.round(np.array(target)-point).astype(int));canvas=Image.new('RGBA',(W,H));canvas.alpha_composite(rot,pos);layers[name]=canvas
 specs.append(dict(name=name,crop=box,scale=scale,anchor=source_anchor,target=target,rotation=angle))
# Body components have complete hidden shoulder/waist ends. One continuous cape behind the body.
cape=Image.open(P/'art/cape-source.png').convert('RGBA')
put('CapeBack',cape,(0,0,*cape.size),(506,412),(131,395))
put('Hips',body,(540,60,973,441),(390,343),(189,655))
arms=Image.open(P/'art/arms-kit-source.png').convert('RGBA')
anchored('UpperArmL',arms,(272,0,533,365),.43,(437,70),(251,435))
anchored('UpperArmR',arms,(778,0,1040,365),.43,(856,70),(518,435))
anchored('ForearmL',arms,(298,466,500,842),.43,(385,455),(196,613))
anchored('ForearmR',arms,(811,466,1015,842),.43,(920,455),(575,613))
anchored('HandL',arms,(367,850,583,1174),.43,(454,892),(218,761))
anchored('HandR',arms,(730,850,949,1174),.43,(857,892),(556,761))
continuous=Image.open(P/'art/shoulder-revision/torso-continuous-source.png').convert('RGBA')
put('Torso',continuous,(0,0,*continuous.size),(W,H),(0,0))
# Front fabric attached at shoulder, with long independent cloth deformation.
anchored('CapeL',body,(105,723,451,1016),.55,(397,754),(238,493),20)
anchored('CapeR',body,(677,721,1043,1012),.55,(732,753),(533,492),-20)
# Hair, scalp and face are distinct designed pieces, rather than fragments of a complete figure.
put('HairBack',head,(480,5,987,560),(314,344),(228,61))
ref=Image.open(P/'art/head-base-reference.png').convert('RGBA')
nose=Image.open(P/'art/nose-source.png').convert('RGBA').resize(ref.size,Image.Resampling.LANCZOS)
nosemask=Image.new('L',ref.size);ImageDraw.Draw(nosemask).ellipse((125,211,163,247),fill=255);nosemask=nosemask.filter(ImageFilter.GaussianBlur(2))
ref=Image.composite(nose,ref,nosemask)
blank=Image.open(P/'art/face-underpaint-source.png').convert('RGBA').resize(ref.size,Image.Resampling.LANCZOS)
# Register underpaint to existing head using invariant contour/nose/neck, with facial features excluded.
aa=np.array(blank);bb=np.array(ref);mask=np.full(bb.shape[:2],255,np.uint8);mask[120:280,25:260]=0
sift=cv2.SIFT_create();ka,da=sift.detectAndCompute(cv2.cvtColor(aa[:,:,:3],cv2.COLOR_RGB2GRAY),None);kb,db=sift.detectAndCompute(cv2.cvtColor(bb[:,:,:3],cv2.COLOR_RGB2GRAY),mask)
matches=[x for x,y in cv2.BFMatcher().knnMatch(da,db,k=2) if x.distance<.75*y.distance]
M,inliers=cv2.estimateAffinePartial2D(np.float32([ka[x.queryIdx].pt for x in matches]),np.float32([kb[x.trainIdx].pt for x in matches]),method=cv2.RANSAC,ransacReprojThreshold=2)
if M is None:raise RuntimeError('Face underpaint registration failed')
blank=Image.fromarray(cv2.warpAffine(aa,M,ref.size,flags=cv2.INTER_CUBIC))
featureboxes={'EyeL':(30,170,120,232),'EyeR':(165,145,260,213),'BrowL':(30,146,114,176),'BrowR':(155,120,250,158),'Mouth':(120,247,190,284)}
base=ref.copy();features={}
for name,box in featureboxes.items():
 m=Image.new('L',ref.size);ImageDraw.Draw(m).rounded_rectangle(box,radius=8,fill=255);m=m.filter(ImageFilter.GaussianBlur(1.5))
 base=Image.composite(blank,base,m)
 feat=ref.copy();feat.putalpha(m);features[name]=feat
headsize=(259,370);headpos=(254,88)
put('Head',base,(0,0,*ref.size),headsize,headpos)
for name,im in features.items():put(name,im,(0,0,*ref.size),headsize,headpos)
put('HairFront',head,(994,65,1518,523),(329,288),(216,73))
put('HairL',head,(346,542,576,1013),(106,217),(221,288))
put('HairR',head,(698,554,946,1014),(109,202),(473,291))
put('Braid',head,(84,493,290,1001),(135,331),(220,316))
# Separate wrist layers preserve overlapping artwork at an intentional glove joint.
# Both sides of the seam receive the same rigid wrist binding in Unity.
# Facial variants: shared base and fixed feature anchors. Supplied closed/half lid drawings only.
for variant,rects in {'Half':[(1253,595,1354,656),(1392,580,1503,649)],'Closed':[(989,712,1095,772),(1122,711,1234,771)]}.items():
 for side,box in zip(['L','R'],rects):
  eyebox=featureboxes['Eye'+side];sprite=Image.new('RGBA',ref.size)
  piece=clean(head.crop(box)).resize((eyebox[2]-eyebox[0],eyebox[3]-eyebox[1]),Image.Resampling.LANCZOS)
  sprite.alpha_composite(piece,eyebox[:2]);put('Eye'+side+variant,sprite,(0,0,*ref.size),headsize,headpos)
mouth=Image.new('RGBA',ref.size);mouth.alpha_composite(clean(head.crop((1281,831,1407,900))).resize((70,39),Image.Resampling.LANCZOS),(120,247))
put('MouthSmile',mouth,(0,0,*ref.size),headsize,headpos)
# Scarf is an intentional garment overlap in front of the continuous head/neck piece.
scarfmask=Image.new('L',(W,H));ImageDraw.Draw(scarfmask).polygon([(285,378),(333,349),(346,381),(421,381),(434,349),(487,379),(498,425),(458,453),(389,477),(318,447),(272,413)],fill=255)
scarf=layers['Torso'].copy();scarf.putalpha(Image.fromarray(np.minimum(np.array(scarf.getchannel('A')),np.array(scarfmask))));layers['Scarf']=scarf
layers['HairBack']=Image.new('RGBA',(W,H));layers['HairBack'].alpha_composite(clean(head.crop((480,5,987,560))).resize((314,344),Image.Resampling.LANCZOS),(228,81))
order=['CapeBack','CapeL','CapeR','HairBack','Hips','Torso','Head','Scarf','ForearmL','ForearmR','HandL','HandR','HairL','HairR','Braid','EyeL','EyeR','BrowL','BrowR','Mouth','HairFront']
assembled=Image.new('RGBA',(W,H))
for n in order:assembled.alpha_composite(layers[n])
for n,im in layers.items():im.save(OUT/(n+'.png'))
assembled.save(P/'preview/rest.png')
bg=Image.new('RGBA',(W,H),'#ddd9ce');bg.alpha_composite(assembled);bg.save(P/'preview/rest-light.png')
(P/'art/assembly.json').write_text(json.dumps({'canvas':[W,H],'frontToBack':list(reversed(order)),'parts':specs,'faceRegistration':M.tolist()},indent=2))
# Layered PSB v2; each painted piece retains its canvas registration.
u16=lambda x:struct.pack('>H',x);u32=lambda x:struct.pack('>I',x);u64=lambda x:struct.pack('>Q',x)
records=bytearray();channels=bytearray()
psborder=list(reversed(order))+[n for n in layers if n not in order]
for name in psborder:
 im=layers[name];box=im.getbbox();l,t,r,b=box;a=np.array(im.crop(box));count=(r-l)*(b-t)
 rec=struct.pack('>iiiiH',t,l,b,r,4)
 for cid in [-1,0,1,2]:rec+=struct.pack('>hQ',cid,count+2)
 label=bytes([len(name)])+name.encode();label+=b'\0'*((-len(label))%4);extra=u32(0)+u32(0)+label
 records+=rec+b'8BIMnorm'+bytes([255,0,0 if name in order else 2,0])+u32(len(extra))+extra
 for c in [3,0,1,2]:channels+=u16(0)+a[:,:,c].tobytes()
info=struct.pack('>h',len(psborder))+records+channels
if len(info)%2:info+=b'\0'
lm=u64(len(info))+info+u32(0)
header=b'8BPS'+u16(2)+b'\0'*6+u16(4)+u32(H)+u32(W)+u16(8)+u16(3)+u32(0)+u32(0)
a=np.array(assembled);merged=u16(0)+b''.join(a[:,:,c].tobytes() for c in [0,1,2,3])
(OUT/'Mara.psb').write_bytes(header+u64(len(lm))+lm+merged)
print('Prepared',len(layers),'layers; PSB',len(order),'visible layers; native art assembled, not upscaled old Mara.')



