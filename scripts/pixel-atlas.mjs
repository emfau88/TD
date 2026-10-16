// Small PNG codec for deterministic sprite normalization and atlas assembly.
// Artwork is generated separately; this only packs pixels and preserves sources.
import { inflateSync, deflateSync } from 'node:zlib';
import { readFile, writeFile } from 'node:fs/promises';

export async function readPNG(path){
  const bytes=await readFile(path),width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20),type=bytes[25],bpp=type===6?4:type===2?3:0;
  if(bytes[24]!==8||!bpp||bytes[28]!==0)throw new Error(`Unsupported PNG format: ${path}`);
  const chunks=[];for(let p=8;p<bytes.length;){const n=bytes.readUInt32BE(p);if(bytes.toString('ascii',p+4,p+8)==='IDAT')chunks.push(bytes.subarray(p+8,p+8+n));p+=n+12;}
  const raw=inflateSync(Buffer.concat(chunks)),stride=width*bpp,decoded=Buffer.alloc(stride*height),data=Buffer.alloc(width*height*4);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];if(filter>4)throw new Error('Unknown PNG filter');
    for(let x=0;x<stride;x++){const at=y*stride+x,a=x>=bpp?decoded[at-bpp]:0,b=y?decoded[at-stride]:0,c=y&&x>=bpp?decoded[at-stride-bpp]:0;
      decoded[at]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}
  }
  for(let p=0;p<width*height;p++){data[p*4]=decoded[p*bpp];data[p*4+1]=decoded[p*bpp+1];data[p*4+2]=decoded[p*bpp+2];data[p*4+3]=bpp===4?decoded[p*bpp+3]:255;}
  return {width,height,data};
}
function crc32(data){let crc=-1;for(const value of data){crc^=value;for(let b=0;b<8;b++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^-1)>>>0;}
export async function writePNG(path,image){
  const {width,height,data}=image,header=Buffer.alloc(13);header.writeUInt32BE(width,0);header.writeUInt32BE(height,4);header[8]=8;header[9]=6;
  const scan=Buffer.alloc(height*(width*4+1));for(let y=0;y<height;y++)data.copy(scan,y*(width*4+1)+1,y*width*4,(y+1)*width*4);
  const chunk=(type,payload)=>{const body=Buffer.concat([Buffer.from(type),payload]),out=Buffer.alloc(payload.length+12);out.writeUInt32BE(payload.length);body.copy(out,4);out.writeUInt32BE(crc32(body),out.length-4);return out;};
  await writeFile(path,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]));
}
export function blank(width,height){return {width,height,data:Buffer.alloc(width*height*4)};}
export function pixel(image,x,y){return image.data.subarray((y*image.width+x)*4,(y*image.width+x)*4+4);}
export function put(image,x,y,value){image.data.set(value,(y*image.width+x)*4);}
export function copyTile(image,tile,index,size=64){const ox=index%(image.width/size)*size,oy=Math.floor(index/(image.width/size))*size;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++)put(image,ox+x,oy+y,pixel(tile,x,y));}
export function normalizedProps(source,frames,scale){const atlas=blank(frames.length*64,64);
  frames.forEach(({box:[sx,sy,w,h],foot:[fx,fy]},index)=>{
    const dw=Math.round(w*scale),dh=Math.round(h*scale),ox=index*64+Math.round(32+(sx-fx)*scale),oy=Math.round(58+(sy-fy)*scale);
    for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){const p=Buffer.from(pixel(source,sx+Math.floor(x/dw*w),sy+Math.floor(y/dh*h)));p[3]=p[3]>=128?255:0;
      if(ox+x<index*64||ox+x>=(index+1)*64||oy+y<0||oy+y>=64)throw new Error('Sprite exceeds its documented frame');put(atlas,ox+x,oy+y,p);}
  });return atlas;
}
export function materialTile(source,quadrant,palette){
  const size=source.width/2,ox=(quadrant%2)*size,oy=Math.floor(quadrant/2)*size,tile=blank(64,64),colors=palette.map(hex=>[hex>>16&255,hex>>8&255,hex&255,255]);
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const color=pixel(source,Math.floor(ox+(x+.5)*size/64),Math.floor(oy+(y+.5)*size/64));
    const nearest=colors.reduce((a,b)=>{const d=c=>c.slice(0,3).reduce((sum,v,i)=>sum+(v-color[i])**2,0);return d(a)<=d(b)?a:b;});
    // Every material has the same first/last edge pixel, so repeated joins are exact.
    put(tile,x,y,x===0||y===0||x===63||y===63?colors[0]:nearest);
  }return tile;
}
export function connectedTile(ground,material,mask,radius,edgeColor){
  const tile=blank(64,64),ends=[[32,0],[64,32],[32,64],[0,32]].filter((_,i)=>mask&(1<<i));
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const px=x+.5,py=y+.5;
    let distance=Math.hypot(px-32,py-32);
    for(const [ex,ey]of ends){const dx=ex-32,dy=ey-32,t=Math.max(0,Math.min(1,((px-32)*dx+(py-32)*dy)/(dx*dx+dy*dy)));distance=Math.min(distance,Math.hypot(px-32-dx*t,py-32-dy*t));}
    put(tile,x,y,distance>radius?pixel(ground,x,y):edgeColor&&distance>radius-1.5?edgeColor:pixel(material,x,y));
  }return tile;
}
