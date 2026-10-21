// Offline integration of the Imagegen hair pass. Requires sharp; not part of the game build.
// All other pixels come byte-for-byte from the user-approved original atlas in Git.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
(async()=>{
 const root=__dirname;
 const original=execFileSync('git',['show','8481d5b:experiments/idle-bastion/assets/mara-tavern/mara-atlas.png'],{maxBuffer:8*1024*1024});
 const a=await sharp(original).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const b=await sharp(path.join(root,'sources/hair-pass.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(a.info.width!==b.info.width||a.info.height!==b.info.height)throw Error('Atlas size changed');
 const {width,height}=a.info; const out=Buffer.from(a.data); const mask=Buffer.alloc(width*height);
 const meta=JSON.parse(fs.readFileSync(path.join(root,'mara-atlas.json'),'utf8'));
 const isHair=(data,p)=>data[p+3]>20&&data[p]>40&&data[p+1]<data[p]*.61&&data[p+2]<data[p]*.23&&data[p+1]>=data[p+2]*1.8;
 let changed=0;
 for(const [frameIndex,f] of meta.frames.entries()){
  for(let y=0;y<285;y++)for(let x=30;x<270;x++){
   // Crown, outer locks and left braid only. The entire face, forehead/eyes,
   // right shoulder and central clothing are explicitly outside the selection.
   const region=(y<72&&x>65&&x<250)||(y>=72&&y<150&&(x<128||x>235))||(y>=150&&y<245&&x<140);
   if(!region)continue;
   // The crossing hand/forearm must stay original in reaction poses.
   if(frameIndex>=6&&frameIndex<=10&&y>=160&&x>=100)continue;
   const p=((f.y+y)*width+f.x+x)*4;
   if(!isHair(a.data,p))continue;
   // Do not transfer generated skin/clothing into the hair selection.
   if(!(isHair(b.data,p)||b.data[p+3]<20))continue;
   mask[p/4]=255;

  }
 }
 // Feather inward only, never into protected pixels. This avoids a hard seam
 // where the crown selection meets the unchanged forehead/face drawing.
 const distance=new Float32Array(mask.length);
 for(let i=0;i<mask.length;i++)distance[i]=mask[i]?10000:0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=y*width+x;if(!mask[i])continue;
  distance[i]=Math.min(distance[i],x?distance[i-1]+1:1,y?distance[i-width]+1:1);
 }
 for(let y=height-1;y>=0;y--)for(let x=width-1;x>=0;x--){
  const i=y*width+x;if(!mask[i])continue;
  distance[i]=Math.min(distance[i],x+1<width?distance[i+1]+1:1,y+1<height?distance[i+width]+1:1);
  const t=Math.min(1,distance[i]/6);const weight=t*t*(3-2*t);const p=i*4;
  let different=false;for(let c=0;c<4;c++){out[p+c]=Math.round(a.data[p+c]*(1-weight)+b.data[p+c]*weight);if(out[p+c]!==a.data[p+c])different=true;}
  if(different)changed++;
 }
 let outside=0;for(let p=0;p<out.length;p+=4)if(!mask[p/4])for(let c=0;c<4;c++)if(out[p+c]!==a.data[p+c])outside++;
 if(outside!==0)throw Error('Protected pixels changed');
 await sharp(out,{raw:{width,height,channels:4}}).png({compressionLevel:9}).toFile(path.join(root,'mara-atlas.png'));
 await sharp(mask,{raw:{width,height,channels:1}}).png().toFile(path.join(root,'sources/hair-selection.png'));
 console.log(JSON.stringify({changedHairPixels:changed,changedProtectedChannels:outside,width,height}));
})();
