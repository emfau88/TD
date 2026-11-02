/** Format/size exports only; the approved ImageGen sources remain unchanged. */
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const sharp=createRequire(import.meta.url)(process.env.SHARP_MODULE||'C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dest=new URL('../../experiments/idle-bastion/assets/loading/scene/',import.meta.url);await mkdir(dest,{recursive:true});
const exports=[['forest','forest-tiny',160,36],['forest','forest-mobile',960,74],['forest','forest-desktop',1671,80],['camp-wide','camp-wide-tiny',180,42],['camp-wide','camp-wide-mobile',600,80],['camp-wide','camp-wide-desktop',1200,83],['camp-portrait','camp-portrait-tiny',144,42],['camp-portrait','camp-portrait-mobile',600,82],['fire-atlas','fire-atlas',1024,78],['cloud','cloud',640,75]];
const records=[];
for(const [source,name,width,quality]of exports){const info=await sharp(fileURLToPath(new URL(`sources/${source}.png`,import.meta.url))).resize({width}).webp({quality,alphaQuality:90,effort:6}).toFile(fileURLToPath(new URL(name+'.webp',dest)));records.push({source,name,...info});}
const atlas=await sharp(fileURLToPath(new URL('sources/fire-atlas.png',import.meta.url))).resize(1024,512).png().toBuffer();
const info=await sharp(atlas).extract({left:0,top:0,width:256,height:256}).resize(80).webp({quality:48,alphaQuality:90,effort:6}).toFile(fileURLToPath(new URL('fire-tiny.webp',dest)));records.push({source:'fire-atlas first frame',name:'fire-tiny',...info});
await writeFile(new URL('exports.json',dest),JSON.stringify(records,null,2));console.log(JSON.stringify(records.map(r=>({name:r.name,bytes:r.size,width:r.width,height:r.height})),null,2));
