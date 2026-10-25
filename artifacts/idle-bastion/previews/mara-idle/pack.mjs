// Non-destructive sprite packing of Imagegen cels; no painting or procedural pose generation.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)(process.env.SPIRE_SHARP_MODULE||'sharp');
const root=new URL('./',import.meta.url);await mkdir(new URL('frames/',root),{recursive:true});
const {data,info}=await sharp(fileURLToPath(new URL('sources/idle-front-v1.png',root))).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const scale=.1,metadata=[],frames=[];
for(let index=0;index<8;index++){
 const col=index%4,row=Math.floor(index/4),cw=info.width/4,ch=info.height/2;
 let left=cw,top=ch,right=0,bottom=0;
 const alpha=(x,y)=>data[((row*ch+y)*info.width+col*cw+x)*4+3];
 for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(alpha(x,y)>=128){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 // Register the boot-contact band, not the asymmetric tool or the total silhouette.
 let bootLeft=cw,bootRight=0;
 for(let y=bottom-15;y<=bottom;y++)for(let x=0;x<cw;x++)if(alpha(x,y)>=128){bootLeft=Math.min(bootLeft,x);bootRight=Math.max(bootRight,x);}
 const footX=(bootLeft+bootRight)/2,footY=bottom-2,w=right-left+1,h=bottom-top+1;
 // Sample directly around the shared foot anchor: independently rounded crop sizes
 // would make the soles jump one pixel when the breathing changes the bounds.
 const raw=Buffer.alloc(64*64*4);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const sx=Math.round(footX+(x-32)/scale),sy=Math.round(footY+(y-56)/scale);
  if(sx<0||sy<0||sx>=cw||sy>=ch)continue;
  const src=((row*ch+sy)*info.width+col*cw+sx)*4,dst=(y*64+x)*4;
  raw[dst]=data[src];raw[dst+1]=data[src+1];raw[dst+2]=data[src+2];raw[dst+3]=data[src+3]>=128?255:0;
 }
 const frame=await sharp(raw,{raw:{width:64,height:64,channels:4}}).png().toBuffer();
 await writeFile(new URL(`frames/${String(index).padStart(2,'0')}.png`,root),frame);frames.push(frame);
 metadata.push({index,source:{left:col*cw+left,top:row*ch+top,width:w,height:h},sourceFoot:[footX+col*cw,footY+row*ch],scale,frameFoot:[32,56]});
}
await sharp({create:{width:512,height:64,channels:4,background:'#00000000'}}).composite(frames.map((input,i)=>({input,left:i*64,top:0}))).png().toFile(fileURLToPath(new URL('mara-idle-front-64.png',root)));
// Unchanged existing pose, packed with the current runtime's measured rectangle and shared scale.
const original=await sharp(fileURLToPath(new URL('../../../../public/assets/Hero%20Mara.png',root))).extract({left:85,top:27,width:191,height:269}).resize(27,38,{kernel:'nearest'}).png().toBuffer();
await sharp({create:{width:64,height:64,channels:4,background:'#00000000'}}).composite([{input:original,left:20,top:18}]).png().toFile(fileURLToPath(new URL('original-front-64.png',root)));
await writeFile(new URL('packing.json',root),JSON.stringify({source:'sources/idle-front-v1.png',cell:[64,64],foot:[32,56],durationsMs:[620,260,260,340,110,180,300,550],loopMs:2620,frames:metadata},null,2)+'\n');
console.log(JSON.stringify({frames:8,scale,frame:[64,64],foot:[32,56],metadata}));
