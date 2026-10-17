// Pack measured generated poses; retain the approved side frames byte-for-byte.
import {writeFile,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPNG,writePNG,blank,pixel,put,copyTile} from './pixel-atlas.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..'),directory=resolve(root,'artifacts/enemies/lantern-jelly/v1');
const palette=['092c3d','124e61','176f80','208d99','35a7aa','64c5b1','a4dac0','fff1ac','e6d676','cfad47','ffc74b','e79a1a','a85b0b','5e350d'].map(hex=>[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16),255]);
const sources={};for(const name of ['directions','down','heal','death'])sources[name]=await readPNG(resolve(directory,`${name}-source.png`));
const side=await readPNG(resolve(root,'public/assets/Lantern Jelly Pixel Preview v1.png'));
const frames=[],atlas=blank(512,384);
const pose=(source,box,anchor,scale,target=[32,16])=>({source,box,anchor,scale,target});
const up=[
  pose('directions',[87,156,252,259],[223,156],.12),
  pose('directions',[456,156,216,249],[563,156],.12),
  pose('directions',[782,156,219,256],[889,156],.12),
  pose('directions',[1060,156,359,269],[1237,156],.12),
  pose('directions',[70,464,309,256],[223,464],.12),
  pose('directions',[439,463,275,252],[563,463],.12),
];
const down=[
  pose('down',[75,83,414,382],[280,83],.083),
  pose('down',[614,83,320,372],[775,83],.083),
  pose('down',[1104,83,317,369],[1262,83],.083),
  pose('down',[29,556,508,372],[284,556],.083),
  pose('down',[562,556,421,372],[774,556],.083),
  pose('down',[1062,556,404,377],[1263,556],.083),
];
const heals={
  down:[[[84,64,230,274],[199,64]],[[454,63,246,275],[577,63]],[[779,63,362,277],[959,63]],[[1210,64,256,276],[1341,64]]],
  up:[[[85,394,227,270],[199,394]],[[454,394,246,264],[577,394]],[[775,394,370,264],[961,394]],[[1202,394,271,269],[1341,394]]],
  side:[[[92,702,240,262],[214,702]],[[461,702,244,258],[597,702]],[[763,702,332,265],[983,702]],[[1177,702,295,265],[1353,702]]],
};
const deaths={
  down:[[[40,112,240,251],170],[[368,145,215,220],476],[[662,191,227,177],773],[[938,240,276,128],1078],[[1239,283,265,90],1378]],
  up:[[[40,423,261,241],174],[[373,456,211,208],478],[[646,511,238,162],771],[[937,556,281,118],1079],[[1246,586,263,84],1379]],
  side:[[[36,725,265,240],196],[[364,750,234,212],502],[[644,800,239,166],792],[[949,851,254,114],1091],[[1244,878,260,88],1384]],
};
function sample(spec){
  const tile=blank(64,64),source=sources[spec.source],[sx,sy,w,h]=spec.box,[ax,ay]=spec.anchor,[tx,ty]=spec.target;
  for(let y=0;y<64;y++)for(let x=0;x<64;x++){
    const px=Math.floor(ax+(x-tx+.5)/spec.scale),py=Math.floor(ay+(y-ty+.5)/spec.scale);
    if(px<sx||py<sy||px>=sx+w||py>=sy+h)continue;
    const value=pixel(source,px,py);if(value[3]<128)continue;
    const distance=color=>color.slice(0,3).reduce((sum,v,i)=>sum+(v-value[i])**2,0);
    put(tile,x,y,palette.reduce((a,b)=>distance(a)<=distance(b)?a:b));
  }
  return tile;
}
function approvedSide(index){const tile=blank(64,64);for(let y=0;y<64;y++)for(let x=0;x<64;x++)put(tile,x,y,pixel(side,index*64+x,y));return tile;}
function bounds(tile){let x0=64,y0=64,x1=-1,y1=-1;for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(pixel(tile,x,y)[3]){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}if(x0<2||y0<2||x1>61||y1>61||x1<0)throw new Error('Invalid sprite border/content');return [x0,y0,x1-x0+1,y1-y0+1];}
const animations={};
for(const [row,direction]of ['down','up','side'].entries()){
  const movement=direction==='side'?Array.from({length:6},(_,i)=>approvedSide(i)):(direction==='up'?up:down).map(sample);
  const tiles=[movement[0],...movement,...heals[direction].map(([box,anchor])=>sample(pose('heal',box,anchor,.12))),...deaths[direction].map(([box,x])=>sample(pose('death',box,[x,{down:373,up:674,side:966}[direction]],.12,[32,47])))];
  tiles.forEach((tile,slot)=>{
    const index=row*16+slot;copyTile(atlas,tile,index);frames.push({index,direction,state:slot===0?'idle':slot<=6?'move':slot<=10?'heal':'death',bounds:bounds(tile)});
  });
  for(const [state,start,count,repeat]of [['idle',0,1,-1],['move',1,6,-1],['heal',7,4,0],['death',11,5,0]])animations[`${state}-${direction}`]={frames:Array.from({length:count},(_,i)=>row*16+start+i),durations:Array(count).fill(100),repeat};
}
const filename='Lantern Jelly Pixel v1.png';
await writePNG(resolve(root,'public/assets',filename),atlas);
await copyFile(resolve(root,'public/assets',filename),resolve(root,'reference/public/assets',filename));
const contact=blank(1024,768);for(let y=0;y<contact.height;y++)for(let x=0;x<contact.width;x++)put(contact,x,y,pixel(atlas,Math.floor(x/2),Math.floor(y/2)));
await writePNG(resolve(directory,'complete-atlas-2x.png'),contact);
await writeFile(resolve(directory,'complete-metadata.json'),JSON.stringify({asset:filename,width:512,height:384,cell:[64,64],origin:[.5,.5],scale:.83,slots:48,distinctPoses:45,idle:'reuses first move frame for each direction',palette:palette.map(p=>'#'+p.slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('')),animations,frames,sources:{up,down,heals,deaths},notes:'Measured individual crops; uniform scale within each source sequence; no automatic grid division. Approved side movement preserved.'},null,2)+'\n');
console.log('Lantern jelly: 512x384, 48 slots / 45 poses, three directions, move/heal/death, alpha 0/255.');
