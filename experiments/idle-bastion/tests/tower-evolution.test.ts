import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, stats } from '../src/battle';
import { openBattleStore } from '../src/save-store';
import { SKIN_LEVELS, skinLevel, evolutionSkin, arrowCopies, frostAnimationTime, towerPreviewDatabase } from '../src/tower-evolution';
import { createTowerProbe, saveTowerProbe } from '../src/tower-test-probes';
const earned = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json', import.meta.url),'utf8'));

test('visual tiers change exactly at the approved boundaries, for all five towers',()=>{
 for(let level=1;level<=120;level++){
  const expected=[...SKIN_LEVELS].reverse().find(n=>level>=n)!;
  assert.equal(skinLevel(level),expected);
  for(const kind of [1,2,3,4,5])assert.equal(evolutionSkin(kind,level)?.level,expected);
  for(const kind of [0,6])assert.equal(evolutionSkin(kind,level),undefined);
 }
});
test('high-level arrows use at most three visual copies, stagger and converge at the logical hit',()=>{
 for(const level of SKIN_LEVELS)for(let p=0;p<=100;p++){
  const copies=arrowCopies(level,p/100);assert.ok(copies.length<=3);
  for(const c of copies)assert.ok(c.progress>=0&&c.progress<=1);
  if(p===100)assert.ok(copies.every(c=>c.visible&&c.progress===1));
 }
 assert.equal(arrowCopies(15,0).filter(c=>c.visible).length,2);
 assert.equal(arrowCopies(20,0).filter(c=>c.visible).length,1);
 assert.equal(arrowCopies(25,.4).filter(c=>c.visible).length,3);
});
test('Frost releases on the real shot and returns to rest even at fast cooldowns',()=>{
 for(const cycle of [.1,.3,.6,1,2]){
  assert.equal(frostAnimationTime(0,cycle,cycle,true),.28);
  assert.equal(frostAnimationTime(10,0,cycle,false),0);
  assert.equal(frostAnimationTime(10,.01,cycle,false),0);
  assert.ok(frostAnimationTime(10,.01,cycle,true)>.04);
  for(let i=0;i<100;i++)assert.ok(frostAnimationTime(i*.01,cycle,cycle,false)<=.86);
 }
});
test('prepared lineups contain every requested skin and round-trip without a new schema',()=>{
 for(const scenario of ['mixed','warden','frost','slinger','sniper','storm'] as const)for(const level of ['all',...SKIN_LEVELS] as const){
  const b=createTowerProbe(scenario,earned,level), saved=b.snapshot();
  assert.deepEqual(IdleBattle.restore(saved)?.snapshot(),saved);
  if(level==='all')assert.deepEqual([...new Set(b.towers.map(t=>t.level))].sort((a,c)=>a-c),SKIN_LEVELS);
  else assert.equal(b.towers.filter(t=>t.level===level).length>=(scenario==='mixed'?5:1),true);
  assert.ok(b.towers.every(t=>stats(t).damage>0));
  assert.ok(b.enemies.some(e=>e.x>=220));
  assert.equal(b.shots.length,0,'preview pauses before the first tower fires');
  assert.ok(b.towers.every(t=>t.x>=460));
 }
});
test('every optical level survives real shots, upgrades, sales and save/reload using normal rules',()=>{
 for(const scenario of ['warden','frost','slinger','sniper','storm'] as const)for(const level of SKIN_LEVELS){
  const b=createTowerProbe(scenario,earned,level), before=b.snapshot(), kind=scenario==='warden'?1:scenario==='frost'?2:scenario==='slinger'?3:scenario==='sniper'?4:5;
  let fires=0;
  for(let i=0;i<600;i++){b.update(.025);fires+=b.drainEvents().filter(e=>e.type==='fire'&&e.shot?.kind===kind&&e.shot.level===level).length;}
  assert.ok(fires>0,`${scenario} ${level} must actually shoot`);assert.ok(b.elapsed>before.elapsed);
  const copy=IdleBattle.restore(b.snapshot())!;assert.ok(copy);
  assert.deepEqual(copy.snapshot(),b.snapshot());
  copy.gold += 1_000_000; copy.earned += 1_000_000; // Test-only budget for a real 25→26 purchase.
  assert.ok(copy.upgrade(copy.towers.find(t=>t.def.id===kind&&t.level===level)!.uid));
  const disposable=copy.towers.find(t=>!t.protected)??copy.build(copy.layout.towerPads.find(p=>copy.canBuild(p.id,1))!.id,1)!;
  assert.ok(copy.sell(disposable.uid));
  assert.ok(IdleBattle.restore(copy.snapshot()));
 }
});
test('preview slots are unique, paused and cannot read or overwrite the main save',async()=>{
 const factory=new IDBFactory(), main=await openBattleStore(factory);
 await main.save(IdleBattle.newGame().snapshot(),false,0);const before=await main.load();
 const b=createTowerProbe('mixed',earned), a=await saveTowerProbe(b,factory), c=await saveTowerProbe(b,factory);
 assert.notEqual(a,c);
 for(const probe of [undefined,'',a,c,'../spire-idle-bastion'])assert.match(towerPreviewDatabase(probe),/^spire-idle-bastion-tower-evolution/);
 const own=await openBattleStore(factory,towerPreviewDatabase(a));const loaded=await own.load();
 assert.equal(loaded.kind,'valid');if(loaded.kind==='valid'){assert.equal(loaded.save.paused,true);assert.deepEqual(loaded.save.battle,b.snapshot());}
 assert.deepEqual(await main.load(),before);own.close();main.close();
});
test('invalid test foundations fail closed',()=>{
 assert.throws(()=>createTowerProbe('mixed',{}),/foundation/);
 assert.throws(()=>createTowerProbe('other' as any,earned),/Unknown/);
 assert.throws(()=>createTowerProbe('mixed',earned,4 as any),/Unknown/);
});
