import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS,CYCLE,FIRE,DISTANCE,SPEED,sample,crystalFrame,trajectory,tick} from './study-model.js';
const manifest=JSON.parse(readFileSync(new URL('./manifest.json',import.meta.url),'utf8'));
test('eight agreed stages, cool variants preserve the original stage provenance',()=>{
 assert.deepEqual(LEVELS,[1,2,3,5,10,15,20,25]);
 assert.deepEqual(manifest.levels.map(r=>r.level),LEVELS);
 assert.deepEqual(manifest.levels.slice(0,3).map(r=>r.originalStage),[1,2,3]);
 assert.ok(manifest.levels[1].paletteCorrected&&manifest.levels[2].paletteCorrected);
});
test('one flight window and one impact inside a single demonstration cycle',()=>{
 const arrival=FIRE+DISTANCE/SPEED;
 assert.equal(sample(FIRE-1e-6).flight,false);assert.equal(sample(FIRE).flight,true);
 assert.equal(sample(arrival).flight,false);assert.equal(sample(arrival).impact,true);
 assert.equal(sample(arrival+.5).impact,false);assert.equal(sample(CYCLE).flight,false);
 for(let ms=0;ms<=CYCLE*1000;ms++){const s=sample(ms/1000);assert.ok(!(s.flight&&s.impact));assert.ok(s.progress>=0&&s.progress<=1);}
});
test('existing first-stage animation uses only real atlas frames; palette variants use provisional motion',()=>{
 const r=manifest.levels[0];const seen=new Set();
 for(let ms=0;ms<1800;ms++){const f=crystalFrame(r,ms/1000);assert.ok(r.frameMap.includes(f));seen.add(f);}
 assert.equal(seen.size,r.frameMap.length);
 for(const r of manifest.levels.slice(1))assert.equal(crystalFrame(r,.4),0);
});
test('nonrotating crystal launches in eight directions at unchanged distance',()=>{
 for(const r of manifest.levels)for(const angle of [0,45,90,135,180,225,270,315]){
  const g=trajectory(r.crystalY,angle);
  assert.equal(g.start.x,0);assert.equal(g.start.y,r.crystalY);
  assert.ok(Math.abs(Math.hypot(g.end.x-g.start.x,g.end.y-g.start.y)-110)<1e-8);
 }
});
test('15/30/60/144 FPS agree; hidden or paused time is not caught up',()=>{
 for(const fps of [15,30,60,144]){
  let c=tick({time:0,last:null},0,true,1);
  for(let i=1;i<=fps;i++)c=tick(c,i*1000/fps,true,1);
  assert.ok(Math.abs(c.time-1)<1e-10);
  c=tick(c,3000,false,1);const time=c.time;
  c=tick(c,300000,true,1);assert.equal(c.time,time);
  c=tick(c,300100,true,.25);assert.ok(Math.abs(c.time-time-.025)<1e-10);
 }
});
test('scrubbing restores a prior pose and provisional motion stays in its height budget',()=>{
 assert.equal(sample(.7).impact,true);assert.equal(sample(.1).impact,false);
 for(let ms=0;ms<1800;ms++){const y=sample(ms/1000).coreDip;assert.ok(y>=0&&y<=.900001);}
});
