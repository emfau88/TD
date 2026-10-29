import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEVELS,CYCLE,FIRE,DISTANCE,SPEED,sample,crystalFrame,trajectory,tick} from './study-model.js';
import {ATTACK_PROFILES,RELEASE,SETTLED,attackPose} from './attack-motion.js';
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
test('first-stage animation retains every original frame; other stages use the separate choreography',()=>{
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
test('every blue stage completes charge, release and return without lingering effects',()=>{
 assert.equal(RELEASE,FIRE);
 for(const level of LEVELS.slice(1)){
  const profile=ATTACK_PROFILES[level],frames=new Set(),phases=new Set();
  for(let ms=0;ms<=1800;ms++){
   const p=attackPose(level,ms/1000);phases.add(p.phase);if(p.fxFrame>=0)frames.add(p.fxFrame);
   assert.ok(Number.isInteger(p.y)&&p.y>=-profile.lift&&p.y<=profile.recoil);
   assert.ok(Number.isInteger(p.spread)&&p.spread>=0&&p.spread<=2);
   assert.ok(p.light>=0&&p.light<=.54);assert.ok(p.fxOpacity>=0&&p.fxOpacity<=.85);
   assert.ok(p.fxFrame>=-1&&p.fxFrame<8);
  }
  assert.deepEqual([...phases],['Ruhe','Aufladen','Abschuss','Rückkehr']);
  assert.deepEqual([...frames],[0,1,2,3,4,5,6,7]);
  assert.equal(attackPose(level,FIRE).phase,'Abschuss');
  assert.equal(attackPose(level,FIRE).y,-profile.lift);
  assert.equal(attackPose(level,SETTLED).light,0);assert.equal(attackPose(level,SETTLED).fxFrame,-1);
  assert.deepEqual(attackPose(level,0),attackPose(level,CYCLE));
 }
});

test('backward scrubbing is deterministic; no state or particles accumulate',()=>{
 for(const level of LEVELS){
  const before=attackPose(level,.24);
  for(let cycle=0;cycle<100;cycle++)for(const t of [.4,.9,0,.28,1.79])attackPose(level,t);
  assert.deepEqual(attackPose(level,.24),before);
 }
});

test('choreography follows the same clock at low and high FPS and quarter speed',()=>{
 for(const fps of [15,30,60,144])for(const rate of [1,.25])for(const t of [.24,.28,.38,.68,.86]){
  let clock=tick({time:0,last:null},0,true,rate),end=t/rate*1000;
  for(let i=1;i*1000/fps<end;i++)clock=tick(clock,i*1000/fps,true,rate);
  clock=tick(clock,end,true,rate);
  // Snap only floating point boundary noise, not timing or pose differences.
  const time=Math.round(clock.time*1e9)/1e9;
  for(const level of LEVELS)assert.deepEqual(attackPose(level,time),attackPose(level,t));
 }
});

test('new effect grid is versioned and has eight bounded frames',()=>{
 const fx=JSON.parse(readFileSync(new URL('./attack-fx.json',import.meta.url),'utf8'));
 assert.equal(fx.frames,8);assert.equal(fx.columns,4);assert.equal(fx.frameSize,64);
 assert.equal(fx.boxes.length,8);
 for(const [x,y,right,bottom] of fx.boxes)assert.ok(x>=0&&y>=0&&right<=64&&bottom<=64&&right>x&&bottom>y);
});
