// Mechanical atlas export: uniform nearest-neighbour resize, alpha cleanup, palette.
// Source art is preserved; no part is independently stretched or redrawn.
import {createRequire} from 'node:module';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=new URL('./',import.meta.url),source=new URL('sources/obsidian-parts-v1.png',root);
const metadata=await sharp(fileURLToPath(source)).metadata();
const {data,info}=await sharp(fileURLToPath(source)).resize(128,96,{kernel:'nearest',fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
for(let i=3;i<data.length;i+=4)data[i]=data[i]>=128?255:0;
const output=await sharp(data,{raw:info}).png({palette:true,colours:32,dither:0}).toFile(fileURLToPath(new URL('assets/obsidian-parts.png',root)));
const frames=[];
for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 let minX=32,minY=32,maxX=-1,maxY=-1,pixels=0;
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){if(data[((row*32+y)*128+col*32+x)*4+3]){pixels++;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}}
 if(minX===0||minY===0||maxX===31||maxY===31)throw Error('Part touches cell border: '+row+','+col);
 frames.push({direction:['right','down','up'][row],part:['head','bodyA','bodyB','tail'][col],pixels,bounds:{x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1}});
}
const result={source:{width:metadata.width,height:metadata.height},output:{width:128,height:96,bytes:output.size,colors:32,alpha:'binary'},cell:32,scale:.83,bodySegments:30,spacing:13.5,frames};
await writeFile(new URL('assets/parts.json',root),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
