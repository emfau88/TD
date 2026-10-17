// Technical export of the generated movement study. Source artwork stays unchanged.
import { writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPNG, writePNG, blank, pixel, put } from './pixel-atlas.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const directory=resolve(root,'artifacts/enemies/lantern-jelly/v1');
const source=await readPNG(resolve(directory,'movement-source.png'));
// Bounds measured at alpha >= 128. Bell alignment is measured separately from
// trailing tentacles so the changing silhouette does not move the whole body.
const frames=[
  {box:[144,113,310,318],bell:[321,113]},
  {box:[646,133,271,300],bell:[784,133]},
  {box:[1068,132,351,301],bell:[1291,132]},
  {box:[99,582,391,325],bell:[350,582]},
  {box:[610,591,359,307],bell:[828,591]},
  {box:[1138,596,300,310],bell:[1300,596]},
];
const palette=['#092c3d','#124e61','#176f80','#208d99','#35a7aa','#64c5b1','#a4dac0','#fff1ac','#e6d676','#cfad47','#ffc74b','#e79a1a','#a85b0b','#5e350d']
  .map(hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255]);
const scale=.1,size=64,atlas=blank(size*frames.length,size),bounds=[];
for(const [index,{box:[sx,sy,w,h],bell:[ax,ay]}]of frames.entries()){
  let minX=64,minY=64,maxX=-1,maxY=-1;
  // Uniform nearest-neighbour sampling; no independent pose fitting/stretching.
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const px=Math.floor(ax+(x-32+.5)/scale),py=Math.floor(ay+(y-16+.5)/scale);
    if(px<sx||px>=sx+w||py<sy||py>=sy+h)continue;
    const value=pixel(source,px,py);if(value[3]<128)continue;
    const distance=color=>(color[0]-value[0])**2+(color[1]-value[1])**2+(color[2]-value[2])**2;
    const nearest=palette.reduce((a,b)=>distance(a)<=distance(b)?a:b);
    put(atlas,index*size+x,y,nearest);
    minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
  }
  if(minX<2||minY<2||maxX>61||maxY>61)throw new Error(`Frame ${index} touches export border`);
  bounds.push([minX,minY,maxX-minX+1,maxY-minY+1]);
}
const name='Lantern Jelly Pixel Preview v1.png';
await writePNG(resolve(root,'public/assets',name),atlas);
await mkdir(resolve(root,'reference/public/assets'),{recursive:true});
await copyFile(resolve(root,'public/assets',name),resolve(root,'reference/public/assets',name));
// Enlarged contact sheet is a nearest-neighbour inspection aid, never runtime art.
const enlarged=blank(atlas.width*3,atlas.height*3);
for(let y=0;y<enlarged.height;y++)for(let x=0;x<enlarged.width;x++)put(enlarged,x,y,pixel(atlas,Math.floor(x/3),Math.floor(y/3)));
await writePNG(resolve(directory,'movement-frames-3x.png'),enlarged);
await writeFile(resolve(directory,'movement-metadata.json'),JSON.stringify({
  status:'side movement study approved by user on 2026-10-17; preserved as reference',
  source:'movement-source.png',runtime:`public/assets/${name}`,frameWidth:64,frameHeight:64,
  atlasWidth:384,atlasHeight:64,origin:[.5,.5],bellTop:[32,16],scale:.83,
  animations:{'move-side':{frames:[0,1,2,3,4,5],durations:[100,100,100,100,100,100],repeat:-1}},
  sourceScale:scale,alphaThreshold:128,palette:palette.map(color=>'#'+color.slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('')),
  frames:frames.map((frame,index)=>({...frame,visibleBounds:bounds[index]})),
},null,2)+'\n');
console.log(JSON.stringify({atlas:name,size:[atlas.width,atlas.height],palette:palette.length,visibleBounds:bounds}));
