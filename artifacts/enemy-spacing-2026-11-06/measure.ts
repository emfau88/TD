// Read existing pixels only. No asset edits or extra runtime dependency.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {writeFileSync} from 'node:fs';
import {ENEMY_SHEETS} from '../../experiments/idle-bastion/src/enemy-art';
import {ENEMIES,type EnemyId} from '../../experiments/idle-bastion/src/enemy-roster';
import {enemyPresentation} from '../../experiments/idle-bastion/src/enemy-presentation';
import {createIdleLayout} from '../../experiments/idle-bastion/src/layout';
import {jellyFrames} from '../../reference/src/jelly-art';
const sharp=createRequire(import.meta.url)('C:/Users/madde/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const layout=createIdleLayout({version:5}),results:any[]=[];
for(const id of Object.keys(ENEMIES) as EnemyId[]){
 if(id==='Rosenspiegel'||id.startsWith('Obsidian'))continue;
 const s=ENEMY_SHEETS[id],{data,info}=await sharp(fileURLToPath(s.url)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(const [dir,clip]of Object.entries(s.move)){
  let frames=[...clip.frames,...(s.heal?.[dir as keyof typeof s.heal]?.frames??[])];
  if(id==='LanternJelly')frames=[...jellyFrames('move',dir as any),...jellyFrames('heal',dir as any)];
  if(s.skins===2)frames.push(...frames.map(f=>f+32));
  let minX=s.width,minY=s.height,maxX=0,maxY=0;
  for(const f of frames){const fx=f%(info.width/s.width)*s.width,fy=Math.floor(f/(info.width/s.width))*s.height;
   for(let y=0;y<s.height;y++)for(let x=0;x<s.width;x++)if(data[((fy+y)*info.width+fx+x)*4+3]>=128){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x+1);maxY=Math.max(maxY,y+1);}
  }
  const side=dir==='side'||dir==='left',radius=(side?Math.max(s.height/2-minY,maxY-s.height/2):Math.max(s.width/2-minX,maxX-s.width/2))*s.scale;
  const e={uid:5,def:ENEMIES[id],x:side?180:620,y:side?220:300,segment:side?0:3} as any;
  const p=enemyPresentation(e,layout,0),offset=Math.hypot(p.groundX-e.x,p.groundY-e.y);
  assert.ok(offset===0 || radius+offset<=18.000001,`${id}/${dir}: new offset must retain 2px road margin`);
  results.push({id,dir,visibleWidth:(maxX-minX)*s.scale,visibleHeight:(maxY-minY)*s.scale,crossRadius:radius,offset});
 }
}
writeFileSync(new URL('sprite-measurements.json',import.meta.url),JSON.stringify(results,null,2));
console.log(results.length+' directional footprints checked; no extra lateral road overhang.');
console.log(JSON.stringify(results.filter(r=>r.id==='Firebug')));
