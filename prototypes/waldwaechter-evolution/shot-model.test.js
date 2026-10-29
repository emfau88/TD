import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,SALVOS,CYCLE,FIRST_RELEASE,SALVO_GAP,FLIGHT_DISTANCE,SPEED,sampleShot,geometry,tick} from './shot-model.js';

test('all eight skins cap total arrows per cycle at three',()=>{
 assert.deepEqual(LEVELS,[1,2,3,5,10,15,20,25]);
 assert.deepEqual(LEVELS.map(l=>SALVOS[l].reduce((a,b)=>a+b)),[1,2,3,3,3,3,3,3]);
 assert.deepEqual(SALVOS[15],[2,1]);assert.deepEqual(SALVOS[20],[1,1,1]);assert.deepEqual(SALVOS[25],[1,1,1]);
 assert.ok(Object.values(SALVOS).flat().every(n=>n<=3));
});
test('salvos release and arrive sequentially inside one cycle',()=>{
 for(const level of LEVELS){
  const groups=sampleShot(level,0).groups;
  groups.forEach((g,i)=>{
   assert.equal(g.release,FIRST_RELEASE+i*SALVO_GAP);
   assert.ok(Math.abs(g.arrival-g.release-FLIGHT_DISTANCE/SPEED)<1e-10);
   assert.equal(sampleShot(level,g.release-1e-5).groups[i].flying,false);
   assert.equal(sampleShot(level,g.release).groups[i].flying,true);
   assert.equal(sampleShot(level,g.arrival).groups[i].flying,false);
   assert.equal(sampleShot(level,g.arrival).groups[i].impact,true);
   assert.equal(sampleShot(level,CYCLE).groups[i].impact,false);
  });
 }
});
test('geometry keeps fixed trajectory length, correct muzzle orientation at eight angles',()=>{
 for(const y of [-14.81,-13.55,-7.88])for(const angle of [0,45,90,135,180,225,270,315]){
  const g=geometry(y,angle);
  assert.ok(Math.abs(Math.hypot(g.end.x-g.start.x,g.end.y-g.start.y)-110)<1e-9);
  assert.ok(Math.abs(Math.hypot(g.start.x,g.start.y-y)-16)<1e-9);
  assert.ok(Math.abs(g.dx*g.dx+g.dy*g.dy-1)<1e-9);
 }
 assert.ok(geometry(-7.88,90).end.x>0);assert.ok(geometry(-7.88,180).end.y>0);
});
test('timeline is consistent at 15, 30, 60 and 144 FPS; no hidden time catch-up',()=>{
 for(const fps of [15,30,60,144]){
  let c={time:0,last:null};c=tick(c,0,true,1);
  for(let f=1;f<=fps;f++)c=tick(c,f*1000/fps,true,1);
  assert.ok(Math.abs(c.time-1)<1e-10);
  c=tick(c,5000,false,1);assert.equal(c.last,null);
  const frozen=c.time;c=tick(c,60000,true,1);assert.equal(c.time,frozen);
  c=tick(c,60100,true,.25);assert.ok(Math.abs(c.time-frozen-.025)<1e-10);
 }
});
test('scrubbing backwards restores prior state; recoil ends before next cycle',()=>{
 assert.equal(sampleShot(25,.7).released,3);assert.equal(sampleShot(25,.1).released,0);
 assert.equal(sampleShot(25,1.49).recoil,0);
 assert.equal(sampleShot(25,0).originalFrame,0);
 assert.equal(sampleShot(25,.8).originalFrame,0);
 assert.equal(sampleShot(25,.37).groups.filter(g=>g.flying).length,2);
});
