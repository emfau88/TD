import {createRequire} from 'node:module';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const sharp=createRequire(import.meta.url)('C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const path=p=>fileURLToPath(new URL(p,import.meta.url));
const blank=(w=64,h=64)=>sharp({create:{width:w,height:h,channels:4,background:'#00000000'}});
function bounds(data,info){let l=info.width,t=info.height,r=-1,b=-1;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>127){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return{left:l,top:t,width:r-l+1,height:b-t+1};}
const manifest=JSON.parse(await readFile(path('assets/manifest.json'),'utf8'));
async function atlas(c,tiles,durations,notes,side=false){
 const output=await blank(64*tiles.length).composite(tiles.map((input,i)=>({input,left:i*64,top:0}))).png({palette:true,colours:c.id==='cobalt-slime'?16:256,dither:0}).toBuffer();
 const filename=`assets/${c.id}${side?'-east':''}-animation.png`;
 await writeFile(path(filename),output);
 const frames=[];
 for(let i=0;i<tiles.length;i++){
  const {data,info}=await sharp(output).extract({left:i*64,top:0,width:64,height:64}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  frames.push({duration:durations[i],bounds:bounds(data,info),sha256:createHash('sha256').update(data).digest('hex')});
 }
 c[side?'sideAnimation':'animation']={url:filename,frames,cycle:durations.reduce((a,b)=>a+b,0),notes};
 console.log(c.id,frames.map(f=>`${f.bounds.width}x${f.bounds.height}`),new Set(frames.map(f=>f.sha256)).size+' unique frames');
}
for(const c of manifest.creatures.filter(c=>c.id!=='cobalt-slime')){
 const meta=JSON.parse(await readFile(path(`sources/${c.id}.json`),'utf8'));
 for(const direction of ['South','East']){
 const frames=meta.frames.filter(f=>f.pixor.action==='Idle'&&f.pixor.side===direction).sort((a,b)=>a.pixor.index-b.pixor.index);
 const merged=await sharp(path(`sources/${c.id}_outline_lit.png`)).composite([{input:path(`sources/${c.id}_outline_shine.png`)}]).png().toBuffer(),tiles=[];
 for(const f of frames){
  const tile=await sharp(merged).extract({left:f.frame.x,top:f.frame.y,width:f.frame.w,height:f.frame.h}).png().toBuffer();
  tiles.push(await blank().composite([{input:tile,left:32-f.pixor.pivot.x,top:43-f.pixor.pivot.y}]).png().toBuffer());
 }
 await atlas(c,tiles,frames.map(f=>f.duration),`Original Frakassets Idle ${direction}, 8 frames. No Walk clip in source; translation is preview only.`,direction==='East');
 }
}
const source=path('sources/cobalt-slime-hop-v1.png'),meta=await sharp(source).metadata(),cells=[];
for(let i=0;i<6;i++){
 const {data,info}=await sharp(source).extract({left:(i%3)*meta.width/3,top:Math.floor(i/3)*meta.height/2,width:meta.width/3,height:meta.height/2}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let j=3;j<data.length;j+=4)data[j]=data[j]>127?255:0;
 cells.push({data,info,b:bounds(data,info)});
}
// One common scale retains squash/stretch across poses. No independent frame normalization.
const scale=34/cells[0].b.width,tiles=[];
for(const {data,info,b} of cells){
 const w=Math.round(b.width*scale),h=Math.round(b.height*scale);
 const tile=await sharp(data,{raw:info}).extract(b).resize(w,h,{kernel:'nearest'}).png().toBuffer();
 tiles.push(await blank().composite([{input:tile,left:Math.round(32-w/2),top:43-h}]).png().toBuffer());
}
await atlas(manifest.creatures[0],tiles,[150,100,100,180,100,130],'ImageGen 6-pose hop study. Fixed baseline, common native scale; preview adds vertical hop.');
await writeFile(path('assets/animation-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
