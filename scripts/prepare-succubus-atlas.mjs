// Technical packing of measured generated poses, without modifying raw sources.
import {writeFile,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPNG,writePNG,blank,pixel,put,copyTile} from './pixel-atlas.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),directory=resolve(root,'artifacts/enemies/succubus/production-v3'),previous=resolve(directory,'../production-v2');
const palette=['28182d','522246','b91463','e8237e','e97ca5','ffc1d2','aa653e','d89562','f2bb86','e5b147','fff3e4','7c2252'].map(hex=>[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),255]);
const sources={};for(const name of ['move-side-fix','dance'])sources[name]=await readPNG(resolve(previous,`${name}-source.png`));
sources.vertical=await readPNG(resolve(directory,'vertical-walk-source.png'));
sources.death=await readPNG(resolve(directory,'../production-v1/death-source.png'));
const spec=(source,box,foot,scale)=>({source,box,foot,scale});
const movement={
  side:[
    [[93,14,353,481],[330,495]],[[1063,14,306,481],[1286,495]],
    [[84,523,368,473],[330,996]],[[1061,522,305,474],[1286,996]],
  ].map(([box,foot])=>spec('move-side-fix',box,foot,.087)),
  up:[
    [[119,510,281,488],[278,998]],[[474,510,282,488],[634,998]],
    [[832,512,285,486],[982,998]],[[1194,511,280,487],[1343,998]],
  ].map(([box,foot])=>spec('vertical',box,foot,.085)),
  down:[
    [[114,12,295,486],[278,498]],[[474,12,285,486],[634,498]],
    [[820,12,296,486],[982,498]],[[1181,12,292,486],[1343,498]],
  ].map(([box,foot])=>spec('vertical',box,foot,.085)),
};
const dance=[
  [[45,39,290,464],[242,503]],[[419,39,328,464],[615,503]],[[786,17,339,486],[988,503]],[[1125,39,397,464],[1374,503]],
  [[33,542,321,457],[242,999]],[[424,520,348,479],[615,999]],[[809,542,312,457],[988,999]],[[1185,542,299,457],[1374,999]],
].map(([box,foot])=>spec('dance',box,foot,.09));
const death={
  down:[[[32,18,208,291],135],[[314,50,192,261],421],[[590,102,226,212],706],[[871,153,246,159],996],[[1153,189,334,125],1320],[[1533,254,192,60],1629]]
    .map(([box,x])=>spec('death',box,[x,314],.14)),
  up:[[[47,317,219,273],150],[[343,357,220,240],447],[[619,404,216,193],727],[[898,451,232,146],1010],[[1172,500,320,107],1322],[[1548,542,181,65],1640]]
    .map(([box,x])=>spec('death',box,[x,596],.15)),
  side:[[[31,597,175,269],128],[[316,628,217,238],422],[[587,675,237,191],711],[[873,715,255,150],1002],[[1164,758,326,108],1322],[[1544,805,185,68],1637]]
    .map(([box,x])=>spec('death',box,[x,866],.15)),
};
function sample({source:name,box:[sx,sy,w,h],foot:[ax,ay],scale}){
  const tile=blank(64,64),source=sources[name];
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const px=Math.floor(ax+(x-32+.5)/scale),py=Math.floor(ay+(y-56+.5)/scale);
    if(px<sx||py<sy||px>=sx+w||py>=sy+h||px<0||py<0||px>=source.width||py>=source.height)continue;
    const value=pixel(source,px,py);if(value[3]<128)continue;
    const distance=c=>c.slice(0,3).reduce((sum,v,i)=>sum+(v-value[i])**2,0);
    put(tile,x,y,palette.reduce((a,b)=>distance(a)<=distance(b)?a:b));
  }return tile;
}
function bounds(tile){let x0=64,y0=64,x1=-1,y1=-1;for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(pixel(tile,x,y)[3]){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}if(x0<2||y0<2||x1>61||y1>61||x1<0)throw new Error(`Sprite border/content invalid: ${[x0,y0,x1,y1]}`);return [x0,y0,x1-x0+1,y1-y0+1];}
const atlas=blank(512,576),frames=[],animations={};
const danceTiles=dance.map(sample);
for(const [d,direction]of ['down','up','side'].entries()){
  const moves=movement[direction].map(sample);
  const groups=[['idle',0,[moves[0]],100,-1],['move',1,moves,150,-1],['dance',7,danceTiles,190,-1],['death',15,death[direction].map(sample),100,0]];
  for(const [state,start,tiles,ms,repeat]of groups){
    tiles.forEach((tile,n)=>{const index=d*24+start+n;copyTile(atlas,tile,index);frames.push({index,direction,state,bounds:bounds(tile)});});
    animations[`${state}-${direction}`]={frames:Array.from({length:tiles.length},(_,i)=>d*24+start+i),durations:Array(tiles.length).fill(ms),repeat};
  }
}
const filename='Succubus Pixel v2.png';await writePNG(resolve(root,'public/assets',filename),atlas);await copyFile(resolve(root,'public/assets',filename),resolve(root,'reference/public/assets',filename));
const contact=blank(1024,1152);for(let y=0;y<contact.height;y++)for(let x=0;x<contact.width;x++)put(contact,x,y,pixel(atlas,Math.floor(x/2),Math.floor(y/2)));await writePNG(resolve(directory,'atlas-2x.png'),contact);
await writeFile(resolve(directory,'metadata.json'),JSON.stringify({revision:3,asset:filename,width:512,height:576,cell:[64,64],foot:[32,56],scale:1,allocatedSlots:72,usedSlots:57,distinctPoses:38,reserved:[5,6,21,22,23,29,30,45,46,47,53,54,69,70,71],palette:palette.map(c=>'#'+c.slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('')),animations,frames,sources:{files:{vertical:'production-v3/vertical-walk-source.png','move-side-fix':'production-v2/move-side-fix-source.png',dance:'production-v2/dance-source.png',death:'production-v1/death-source.png'},movement,dance,death},notes:'Revision 3 corrects the vertical leg cycle with alternating left/right contact and lifted boots. Four walking poses remain 150ms each, with a consistent foot anchor and 12-color palette. Side walking, body dance and death frames are pixel-identical to v2. The larger dance presentation uses a separate higher-resolution atlas. The first new vertical study repeated the lifted boot; one targeted correction fixed the side swap. Raw sources and the v2 runtime atlas are preserved.'},null,2)+'\n');
console.log('Succubus v3 body: 512x576, corrected vertical steps, preserved side/dance/death, 57 used slots, 12 colors.');
