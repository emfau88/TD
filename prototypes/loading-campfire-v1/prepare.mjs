import {createRequire} from 'node:module';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_MODULE||'C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.dirname(fileURLToPath(import.meta.url));
const sourceRoot='C:/Users/madde/.codex/generated_images/01a19c11-9450-79d0-91a9-6907a248e931';
const sources={forest:'exec-ae59828d-74fe-44dd-bc6b-f5a2c5a9f306.png','camp-wide':'exec-69e64cb7-2f31-4b9e-b0c7-268506c8472e.png','camp-portrait':'exec-62118665-bc22-4972-b588-6e56caf1eb5e.png','fire-atlas':'exec-8fdd6783-fdff-49fb-b45e-ff3d019cf440.png'};
await mkdir(path.join(root,'assets'),{recursive:true});await mkdir(path.join(root,'sources'),{recursive:true});
const results=[];
for(const [name,file]of Object.entries(sources)){
 const source=path.join(root,'sources',name+'.png');await copyFile(path.join(sourceRoot,file),source);
 const input=sharp(source),meta=await input.metadata();
 const output=await input.resize({width:name==='fire-atlas'?1536:name==='camp-portrait'?960:name==='camp-wide'?1440:1920,withoutEnlargement:true}).webp({quality:88,alphaQuality:100,effort:6}).toFile(path.join(root,'assets',name+'.webp'));
 results.push({name,source:file,width:meta.width,height:meta.height,hasAlpha:meta.hasAlpha,output});
}
await copyFile(path.join(root,'../../experiments/idle-bastion/assets/ui/fonts/PixelifySans.ttf'),path.join(root,'assets/PixelifySans.ttf'));
await copyFile(path.join(root,'../../experiments/idle-bastion/assets/ui/fonts/OFL.txt'),path.join(root,'assets/PixelifySans-OFL.txt'));
await writeFile(path.join(root,'assets/exports.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(r=>({name:r.name,bytes:r.output.size,alpha:r.hasAlpha,width:r.output.width,height:r.output.height})),null,2));
