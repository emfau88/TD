import {createRequire} from 'node:module';
import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)('C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=new URL('./',import.meta.url),path=p=>fileURLToPath(new URL(p,root));
await mkdir(path('assets/'),{recursive:true});
function bounds(data,info){let l=info.width,t=info.height,r=-1,b=-1;for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>127){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return{left:l,top:t,width:r-l+1,height:b-t+1};}
const manifest={scale:.83,creatures:[]};
async function describe(id,name,label,file){const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});const b=bounds(data,info);return{id,name,label,url:`assets/${id}.png`,frame:64,pivot:{x:32,y:43},bounds:b,screen:{width:Math.round(b.width*.83),height:Math.round(b.height*.83)}};}
for(const [id,name]of [['flame-wisp-orange','Flammengeist'],['floating-eye-purple','Schwebendes Auge']]){
 const meta=JSON.parse(await readFile(path(`sources/${id}.json`),'utf8'));
 const f=meta.frames.find(f=>f.pixor.action==='Idle'&&f.pixor.side==='South'&&f.pixor.index===0);
 const merged=await sharp(path(`sources/${id}_outline_lit.png`)).composite([{input:path(`sources/${id}_outline_shine.png`)}]).png().toBuffer();
 const tile=await sharp(merged).extract({left:f.frame.x,top:f.frame.y,width:f.frame.w,height:f.frame.h}).png().toBuffer();
 const out=path(`assets/${id}.png`);
 await sharp({create:{width:64,height:64,channels:4,background:'#00000000'}}).composite([{input:tile,left:32-f.pixor.pivot.x,top:43-f.pixor.pivot.y}]).png().toFile(out);
 manifest.creatures.push(await describe(id,name,'Original aus der Reserve',out));
}
// Native export only: no hand-painted replacement. Keep both ImageGen originals.
const {data,info}=await sharp(path('sources/cobalt-slime-v2.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let i=3;i<data.length;i+=4)data[i]=data[i]>127?255:0;
const b=bounds(data,info),native=await sharp(data,{raw:info}).extract(b).resize({width:34,kernel:'nearest'}).png({palette:true,colours:16,dither:0}).toBuffer();
const m=await sharp(native).metadata();
await sharp({create:{width:64,height:64,channels:4,background:'#00000000'}}).composite([{input:native,left:Math.floor((64-m.width)/2),top:43-m.height}]).png().toFile(path('assets/cobalt-slime.png'));
manifest.creatures.unshift(await describe('cobalt-slime','Kobaltschleim','Neuer Entwurf · Standpose',path('assets/cobalt-slime.png')));
const input=path('../../public/assets/Leafbug.png'),lm=await sharp(input).metadata(),cols=lm.width/64;
await sharp(input).extract({left:40%cols*64,top:Math.floor(40/cols)*64,width:64,height:64}).png().toFile(path('assets/leafbug.png'));
manifest.reference={...(await describe('leafbug','Blattkäfer','Original zum Größenvergleich',path('assets/leafbug.png'))),pivot:{x:32,y:32}};
for(const name of ['grass.png','road.png','PixelifySans.ttf'])await copyFile(path('../segment-worm-v1/assets/'+name),path('assets/'+name));
await writeFile(path('assets/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
