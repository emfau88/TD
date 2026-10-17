// Technical packing of measured generated poses, without modifying raw sources.
import {writeFile,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPNG,writePNG,blank,pixel,put,copyTile} from './pixel-atlas.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),directory=resolve(root,'artifacts/enemies/succubus/production-v1');
const palette=['241828','3b2038','542942','7a3c52','972653','b71161','dc2278','ef579e','e77fa5','f6aec4','ffd4db','713c32','a65f41','c98052','e5a373','f0bb8b','a57732','e0ad4e','ffe19a','542d5b'].map(hex=>[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),255]);
const sources={};for(const name of ['move-side','up','down','dance','death'])sources[name]=await readPNG(resolve(directory,`${name}-source.png`));
const spec=(source,box,foot,scale)=>({source,box,foot,scale});
const movement={
  side:[
    [[109,38,364,467],[345,505]],[[579,38,313,467],[774,505]],[[1071,41,336,464],[1260,505]],
    [[86,526,373,461],[318,987]],[[568,526,337,462],[775,988]],[[1079,526,370,461],[1264,987]],
  ].map(([box,foot])=>spec('move-side',box,foot,.09)),
  up:[
    [[165,50,250,444],[293,494]],[[651,50,226,444],[772,494]],[[1159,50,228,443],[1273,493]],
    [[146,532,264,438],[285,970]],[[658,532,219,438],[768,970]],[[1160,532,265,438],[1271,970]],
  ].map(([box,foot])=>spec('up',box,foot,.095)),
  down:[
    [[166,80,262,422],[305,502]],[[643,75,249,427],[767,502]],[[1130,80,255,422],[1257,502]],
    [[172,548,242,423],[306,971]],[[643,552,252,419],[767,971]],[[1138,553,253,419],[1261,972]],
  ].map(([box,foot])=>spec('down',box,foot,.1)),
};
const dance=[
  [[55,12,285,496],[230,508]],[[381,43,401,465],[575,508]],[[810,20,359,490],[987,510]],[[1198,16,308,494],[1360,510]],
  [[33,530,392,476],[230,1006]],[[448,519,348,486],[602,1005]],[[839,530,297,475],[972,1005]],[[1195,535,294,469],[1346,1004]],
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
  const moves=movement[direction].map(sample),tiles=[moves[0],...moves,...danceTiles,...death[direction].map(sample)];
  tiles.forEach((tile,slot)=>{const index=d*24+slot;copyTile(atlas,tile,index);frames.push({index,direction,state:slot===0?'idle':slot<7?'move':slot<15?'dance':'death',bounds:bounds(tile)});});
  for(const [state,start,count,ms,repeat]of [['idle',0,1,100,-1],['move',1,6,100,-1],['dance',7,8,125,-1],['death',15,6,100,0]])animations[`${state}-${direction}`]={frames:Array.from({length:count},(_,i)=>d*24+start+i),durations:Array(count).fill(ms),repeat};
}
const filename='Succubus Pixel v1.png';await writePNG(resolve(root,'public/assets',filename),atlas);await copyFile(resolve(root,'public/assets',filename),resolve(root,'reference/public/assets',filename));
const contact=blank(1024,1152);for(let y=0;y<contact.height;y++)for(let x=0;x<contact.width;x++)put(contact,x,y,pixel(atlas,Math.floor(x/2),Math.floor(y/2)));await writePNG(resolve(directory,'atlas-2x.png'),contact);
await writeFile(resolve(directory,'metadata.json'),JSON.stringify({asset:filename,width:512,height:576,cell:[64,64],foot:[32,56],scale:1,allocatedSlots:72,usedSlots:63,distinctPoses:44,reserved:[21,22,23,45,46,47,69,70,71],palette:palette.map(c=>'#'+c.slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('')),animations,frames,sources:{movement,dance,death},notes:'Idle reuses move. Dance is a front-facing stage performance deliberately shared across all facing rows. Separate dance panel uses the same runtime frames, not a video. The first combined directions source was discarded because wing tips crossed its cell edges.'},null,2)+'\n');
console.log('Succubus atlas: 512x576, 63 used slots, 44 distinct poses, foot32/56, 20 colors; move/dance/death.');
