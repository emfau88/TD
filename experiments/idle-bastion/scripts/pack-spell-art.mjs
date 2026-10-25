// Delivery copies of approved Imagegen originals; no redraw or source modification.
// Run with SPIRE_SHARP_MODULE pointing to an installed sharp package when needed.
import {createRequire} from 'node:module';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const sharp=createRequire(import.meta.url)(process.env.SPIRE_SHARP_MODULE||'sharp');
const source=new URL('../../../artifacts/idle-bastion/previews/ability-art/assets/',import.meta.url);
const output=new URL('../assets/spells/',import.meta.url);await mkdir(output,{recursive:true});
const manifest=[];
for(const name of ['mara-spell','ilyra-spell','mara-ring','ilyra-ring','destination','mara-mote','star-projectile','star-impact']){
 const input=await readFile(new URL(name+'.png',source)),image=sharp(input);
 const {data,info}=await image.clone().ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>20){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 const icon=name.endsWith('-spell');
 const bounds=icon?{left:0,top:0,width:info.width,height:info.height}:{left,top,width:right-left+1,height:bottom-top+1};
 const bytes=await image.extract(bounds).resize(192,192,{fit:'inside',withoutEnlargement:true,kernel:'lanczos3'}).webp({lossless:true}).toBuffer();
 await writeFile(new URL(name+'.webp',output),bytes);
 manifest.push({name,sourceSha256:createHash('sha256').update(input).digest('hex'),bounds,inputBytes:input.length,bytes:bytes.length});
}
await writeFile(new URL('manifest.json',output),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({files:manifest.length,bytes:manifest.reduce((n,f)=>n+f.bytes,0)}));
