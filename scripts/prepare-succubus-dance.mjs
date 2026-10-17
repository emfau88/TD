// Pack the measured high-resolution dance poses; preserve the generated source.
import {copyFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPNG,writePNG,blank,pixel,put,copyTile} from './pixel-atlas.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const directory=resolve(root,'artifacts/enemies/succubus/production-v3');
const source=await readPNG(resolve(directory,'dance-hd-source.png'));
// Shared scale, measured stage floor and support-foot midpoint for each pose.
// The raised hand in row two approaches row one's floor; these are not uniform cells.
const poses=[
  {box:[23,24,310,499],foot:[220,523]},
  {box:[400,24,370,499],foot:[598,523]},
  {box:[804,4,333,520],foot:[1004,524]},
  {box:[1143,22,386,502],foot:[1377,524]},
  {box:[20,530,357,482],foot:[239,1012]},
  {box:[431,523,342,489],foot:[622,1012]},
  {box:[812,537,316,475],foot:[1006,1012]},
  {box:[1184,533,299,479],foot:[1377,1012]},
];
const palette=['211025','351326','4a1544','5f2257','8b114b','a91861','c70a68','e0157f','f32896','9e3b71','c85e91','e88db4','ffacc9','ffcee1','ffe0e6','754124','a85e36','c8814b','e59d67','f4b986','ffd09e','7e5127','9c6b2b','d49a38','f7c555','ffe594','17101f','fff2e9','623438','983b4c','c34d68','6f4263','8d5c7b'].map(hex=>[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),255]);
const atlas=blank(1024,128),scale=.19,frames=[];
for(const [index,{box:[sx,sy,w,h],foot:[fx,fy]}]of poses.entries()){
  const tile=blank(128,128);let x0=128,y0=128,x1=-1,y1=-1;
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const px=Math.floor(fx+(x-64+.5)/scale),py=Math.floor(fy+(y-112+.5)/scale);
    if(px<sx||px>=sx+w||py<sy||py>=sy+h)continue;
    const value=pixel(source,px,py);if(value[3]<128)continue;
    const distance=c=>(c[0]-value[0])**2+(c[1]-value[1])**2+(c[2]-value[2])**2;
    put(tile,x,y,palette.reduce((a,b)=>distance(a)<=distance(b)?a:b));
    x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
  }
  if(x0<3||y0<3||x1>124||y1>124||x1<x0)throw new Error(`Dance frame ${index} touches border`);
  copyTile(atlas,tile,index,128);frames.push({index,bounds:[x0,y0,x1-x0+1,y1-y0+1]});
}
const filename='Succubus Dance HD v1.png';
await writePNG(resolve(root,'public/assets',filename),atlas);
await copyFile(resolve(root,'public/assets',filename),resolve(root,'reference/public/assets',filename));
await writePNG(resolve(directory,'dance-hd-atlas.png'),atlas);
await writeFile(resolve(directory,'dance-hd-metadata.json'),JSON.stringify({asset:filename,width:1024,height:128,cell:[128,128],foot:[64,112],source:'dance-hd-source.png',sourceScale:scale,displayScale:1.1,frameMs:190,cycleMs:1520,palette:palette.map(c=>'#'+c.slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('')),poses,frames,notes:'Dedicated finer artwork for the enlarged dance panel. The small worldbody continues to use its readable 64px atlas; both animations share simulation time.'},null,2)+'\n');
console.log('Succubus dance: 8 distinct 128px frames, 33 colors, dedicated portrait atlas1024x128.');
