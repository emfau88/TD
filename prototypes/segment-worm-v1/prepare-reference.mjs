import {createRequire} from 'node:module';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=new URL('./',import.meta.url),repo=new URL('../../',root);
await mkdir(new URL('assets/',root),{recursive:true});await mkdir(new URL('sources/',root),{recursive:true});
const examples=[];
for(const [name,frame] of [['Leafbug',40],['Scorpion',40]]){
 const input=fileURLToPath(new URL('public/assets/'+name+'.png',repo)),meta=await sharp(input).metadata(),cols=meta.width/64;
 await copyFile(input,new URL('assets/'+name+'.png',root));
 const buffer=await sharp(input).extract({left:frame%cols*64,top:Math.floor(frame/cols)*64,width:64,height:64}).resize(384,384,{kernel:'nearest'}).png().toBuffer();
 examples.push({input:buffer,left:examples.length*384,top:0});
}
await sharp({create:{width:768,height:384,channels:4,background:'#e4d7b9'}}).composite(examples).png().toFile(fileURLToPath(new URL('sources/style-reference.png',root)));
const terrain=fileURLToPath(new URL('public/assets/Grass Tileset.png',repo));
for(const [name,left,top,width,height] of [['grass',128,64,64,64],['road',384,64,64,64],['tree',833,384,62,64]]){
 await sharp(terrain).extract({left,top,width,height}).png().toFile(fileURLToPath(new URL('assets/'+name+'.png',root)));
}
await copyFile(new URL('experiments/idle-bastion/assets/ui/fonts/PixelifySans.ttf',repo),new URL('assets/PixelifySans.ttf',root));
await writeFile(new URL('assets/reference.json',root),JSON.stringify({Leafbug:{frame:40,size:64,scale:.83},Scorpion:{frame:40,size:64,scale:.83},worldTile:40},null,2));
console.log('Original sprite reference and terrain extracts prepared.');
