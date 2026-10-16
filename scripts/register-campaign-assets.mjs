import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const directory=resolve(root,'public/assets');
const files=(await readdir(directory)).filter(name=>/^(Terrain |Hero |Portrait |Lantern Jelly|Root Herald|Frost Ram|Campaign Objects)/.test(name)&&name.endsWith('.png'));
const additions={};
for(const file of files){
  const name=file.slice(0,-4),png=await readFile(resolve(directory,file));
  const cols=name.startsWith('Portrait ')?1:4,rows=name.startsWith('Portrait ')?1:name.startsWith('Hero ')?4:2;
  const sheetWidth=png.readUInt32BE(16),sheetHeight=png.readUInt32BE(20);
  additions[name]={width:Math.floor(sheetWidth/cols),height:Math.floor(sheetHeight/rows),sheetWidth,sheetHeight,cols,rows,frames:cols*rows,frameMap:Array.from({length:cols*rows},(_,i)=>i),durations:Array(cols*rows).fill(180),tags:[]};
}
const manifestPath=resolve(directory,'manifest.json');
await writeFile(resolve(directory,'campaign-manifest.json'),JSON.stringify(additions,null,2)+'\n');
await writeFile(manifestPath,JSON.stringify({...JSON.parse(await readFile(manifestPath,'utf8')),...additions},null,2)+'\n');
console.log('Registered campaign atlases:',Object.keys(additions).join(', '));
