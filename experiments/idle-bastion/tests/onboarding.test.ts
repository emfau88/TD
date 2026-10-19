import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDBFactory} from 'fake-indexeddb';
import {IdleBattle} from '../src/battle';
import {BattleSession, type SessionStore} from '../src/battle-session';
import {openBattleStore} from '../src/save-store';
import {certifyFarm} from '../src/farming';
const restore=(b:IdleBattle)=>{const copy=IdleBattle.restore(b.snapshot());assert.ok(copy);assert.deepEqual(copy.snapshot(),b.snapshot());return copy;};

test('preparation persists without combat, production or repeated gifts',()=>{
 let b=IdleBattle.newGame();assert.equal(b.introduction.stage,'welcome');
 b.update(600);assert.equal(b.wave,0);assert.equal(b.gold,75);assert.equal(b.elapsed,0);assert.equal(b.towers.length,0);assert.equal(certifyFarm(b),undefined);
 assert.equal(b.build('tower-start'),undefined);assert.equal(b.startDefense(),false);b=restore(b);
 assert.equal(b.beginIntroduction(),true);b=restore(b);
 assert.equal(b.build('tower-03'),undefined);assert.equal(b.build('tower-start',2),undefined);
 assert.ok(b.build('tower-start'));assert.equal(b.gold,75);assert.equal(b.towers[0].uid,1);b=restore(b);
 assert.equal(b.upgrade(1),false);assert.equal(b.sell(1),false);
 assert.ok(b.build('cell-6-6'));assert.equal(b.towers.length,1);assert.equal(b.towers[0].uid,1);assert.equal(b.gold,75);b=restore(b);
 b.update(3600);assert.equal(b.wave,0);assert.equal(certifyFarm(b),undefined);
 assert.equal(b.startDefense(),true);assert.equal(b.startDefense(),false);assert.equal(b.wave,1);b=restore(b);
 b.skipLessons();assert.ok(b.build('tower-start'));assert.equal(b.gold,0);assert.equal(b.towers.filter(t=>t.protected).length,1);restore(b);
});

test('all offered first placements clear wave one without manual support',()=>{
 const candidates=IdleBattle.newGame().layout.towerPads.filter(p=>IdleBattle.newGame().isStarterLocation(p.id));assert.ok(candidates.length>=3);
 for(const p of candidates){const b=IdleBattle.newGame();b.beginIntroduction();assert.ok(b.build(p.id));b.startDefense();b.skipLessons();b.mara.autoCast=false;
  for(let i=0;i<2400&&!b.highestCleared&&b.phase!=='defeat';i++)b.update(.025);
  assert.equal(b.highestCleared,1,p.id);assert.equal(b.lives,20,p.id);restore(b);
 }
});

test('all starter locations survive the complete guided purchase sequence with real learning pauses',()=>{
 const locations=IdleBattle.newGame().layout.towerPads.filter(p=>IdleBattle.newGame().isStarterLocation(p.id));
 for(const location of locations){
  const b=IdleBattle.newGame();b.update(8);b.beginIntroduction();b.build(location.id);b.startDefense();let pauses=0,workshop=0;
  for(let i=0;i<16000&&b.guiding;i++){
   b.update(.025);assert.equal(b.lives,20,`${location.id} leaked in ${b.introduction.stage}`);assert.ok(b.wave<=2);assert.equal(b.wispUnlocked,false);
   if(!b.learningPaused)continue;
   const before=b.snapshot();b.update(10);const after=b.snapshot();after.introduction.preparationSeconds=before.introduction.preparationSeconds;assert.deepEqual(after,before,'reading must freeze combat and income');
   if(b.introduction.stage!=='observe')assert.equal(b.continueLesson(),false);
   switch(b.introduction.stage){
    case 'upgrade': assert.equal(b.upgrade(1),true);assert.equal(b.upgrade(1),false);break;
    case 'workshop': { assert.ok(b.highestCleared >= 1); assert.equal(b.workshopBuildCost,0); const gold=b.gold; assert.equal(b.buildWorkshop(),true); assert.equal(b.gold,gold); assert.equal(b.buildWorkshop(),false); workshop=b.elapsed;break; }
    case 'research': assert.equal(b.researchFrost(),true);break;
    case 'frost': assert.ok(b.recommendedFrostPad);assert.ok(b.build(b.recommendedFrostPad!,2));break;
    case 'observe': break;
   }
   assert.equal(b.lessonComplete,true);assert.equal(b.learningPaused,true);restore(b);
   assert.equal(b.continueLesson(),true);restore(b);pauses++;
  }
  assert.equal(b.introduction.stage,'done',location.id);assert.equal(pauses,5);assert.equal(b.towers.length,2);assert.equal(b.towers[0].level,2);assert.ok(b.tutorial.frostSeen);
  if(location.id==='tower-start')console.log(JSON.stringify({workshopCombatSeconds:workshop,completeCombatSeconds:b.elapsed,learningAndPreparationSeconds:b.introduction.preparationSeconds,totalSeconds:b.elapsed+b.introduction.preparationSeconds}));
 }
});

test('pre-start state cannot smuggle money, combat, extra towers or unassigned active Mara',()=>{
 const welcome=IdleBattle.newGame().snapshot();
 for(const change of [(s:any)=>s.gold++,(s:any)=>s.introduction.stage='done',(s:any)=>s.mara.autoCast=true,(s:any)=>s.introduction.preparationSeconds=-1]){
  const s=structuredClone(welcome);change(s);assert.equal(IdleBattle.restore(s),undefined);
 }
 const b=IdleBattle.newGame();b.beginIntroduction();b.build('tower-start');const ready=b.snapshot();ready.towers[0].padId='tower-03';assert.equal(IdleBattle.restore(ready),undefined);
});

test('real v14 veteran and its historical offline basis survive the schema-only migration',async()=>{
 const old=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/15min/b13-browser-save.json','utf8'));
 const before=structuredClone(old);const b=IdleBattle.restore(old.battle)!;assert.ok(b);assert.deepEqual(old,before);
 assert.deepEqual(b.introduction,{stage:'done',preparationSeconds:0,halted:false});
 const current:any=b.snapshot();delete current.introduction;current.schemaVersion=14;assert.deepEqual(current,old.battle);
 const factory=new IDBFactory(),store=await openBattleStore(factory,'intro-legacy',()=>old.writtenAt);
 const writer=(await store.acquireWriter('fixture'))!;await store.save(b.snapshot(),old.paused,0,{writer,offline:old.offline});
 const loaded=await store.load();assert.equal(loaded.kind,'valid');if(loaded.kind==='valid')assert.deepEqual(loaded.save.offline,old.offline);
 await store.releaseWriter(writer);store.close();
});

test('session reload before start preserves the kit and avoids an empty return dialog',async()=>{
 const factory=new IDBFactory();let now=1000;
 let store=await openBattleStore(factory,'intro-session',()=>now),live=await BattleSession.open(store,{now:()=>now,locks:null});
 await live.command(b=>b.beginIntroduction());await live.command(b=>b.build('cell-6-6'));await live.close();now+=3600000;
 store=await openBattleStore(factory,'intro-session',()=>now);live=await BattleSession.open(store,{now:()=>now,locks:null});
 assert.equal(live.awaitingResume,false);assert.equal(live.pendingReward,null);assert.equal(live.certificate,null);assert.equal(live.battle.gold,75);assert.equal(live.battle.introduction.stage,'ready');
 await live.command(b=>b.startDefense());const before=live.battle.snapshot();await live.close();
 store=await openBattleStore(factory,'intro-session',()=>now);live=await BattleSession.open(store,{now:()=>now,locks:null});assert.deepEqual(live.battle.snapshot(),before);await live.close();
});

test('rejected first-build transaction rolls back the kit and complete preparation',async()=>{
 const store=await openBattleStore(new IDBFactory(),'intro-failure',()=>1000);let fail=false;
 const wrapped:SessionStore={load:()=>store.load(),save:(...a)=>fail?Promise.reject(Error('write failed')):store.save(...a),recoverBackup:(...a)=>store.recoverBackup(...a),close:()=>store.close(),acquireWriter:(...a)=>store.acquireWriter(...a),renewWriter:(...a)=>store.renewWriter(...a),releaseWriter:(...a)=>store.releaseWriter(...a)};
 const live=await BattleSession.open(wrapped,{now:()=>1000,locks:null});await live.command(b=>b.beginIntroduction());const before=live.battle.snapshot();fail=true;
 assert.equal(await live.command(b=>b.build('tower-start')),false);assert.deepEqual(live.battle.snapshot(),before);assert.equal(live.battle.towers.length,0);assert.equal(live.battle.gold,75);await live.close().catch(()=>undefined);
});

test('schema 15 saves preserve preparation and completed play without forcing the extended lessons',()=>{
 for(const phase of ['welcome','ready','done'] as const){
  const b=phase==='done'?new IdleBattle():IdleBattle.newGame();if(phase==='ready'){b.beginIntroduction();b.build('cell-6-6')}
  const old:any=b.snapshot();old.schemaVersion=15;delete old.introduction.halted;
  const loaded=IdleBattle.restore(old)!;assert.ok(loaded);assert.equal(loaded.introduction.stage,phase);assert.equal(loaded.learningPaused,false);
  const current:any=loaded.snapshot();current.schemaVersion=15;delete current.introduction.halted;assert.deepEqual(current,old);
 }
});

test('intro command waits for a background write, then rechecks and consumes the kit once',async()=>{
 const store=await openBattleStore(new IDBFactory(),'intro-queued',()=>1000);let release:()=>void=()=>{};let hold=false;let entered!:()=>void;const entering=new Promise<void>(r=>entered=r);
 const wrapped:SessionStore={load:()=>store.load(),save:async(...a)=>{if(hold){hold=false;entered();await new Promise<void>(r=>release=r)}return store.save(...a)},recoverBackup:(...a)=>store.recoverBackup(...a),close:()=>store.close(),acquireWriter:(...a)=>store.acquireWriter(...a),renewWriter:(...a)=>store.renewWriter(...a),releaseWriter:(...a)=>store.releaseWriter(...a)};
 const live=await BattleSession.open(wrapped,{now:()=>1000,locks:null});hold=true;
 const writing=live.command(b=>b.beginIntroduction());await entering;assert.equal(live.busy,true);
 const placing=live.command(b=>b.build('tower-start'),true);assert.equal(live.battle.towers.length,0);
 release();assert.equal(await writing,true);assert.equal(await placing,true);assert.equal(live.battle.towers.length,1);assert.equal(live.battle.gold,75);
 await live.close();
});


test('learning pause survives return without idle income and stays distinct from manual pause',async()=>{
 const factory=new IDBFactory();let now=1000;let store=await openBattleStore(factory,'lesson-return',()=>now),live=await BattleSession.open(store,{now:()=>now,locks:null});
 await live.command(b=>{b.beginIntroduction();b.build('tower-start');b.startDefense();while(!b.learningPaused)b.update(.025)});
 const before=live.battle.snapshot();await live.close();now+=3600000;
 store=await openBattleStore(factory,'lesson-return',()=>now);live=await BattleSession.open(store,{now:()=>now,locks:null});
 assert.equal(live.paused,false);assert.equal(live.battle.learningPaused,true);assert.equal(live.awaitingResume,false);assert.equal(live.pendingReward,null);assert.deepEqual(live.battle.snapshot(),before);
 await live.command(b=>b.upgrade(1));assert.equal(live.battle.learningPaused,true);await live.command(b=>b.continueLesson());assert.equal(live.battle.learningPaused,false);await live.close();
});


test('workshop kit waits for first victory, survives reload and never refunds an existing workshop',()=>{
 let b=IdleBattle.newGame();b.beginIntroduction();b.build('cell-6-6');b.startDefense();
 while(!b.learningPaused)b.update(.025);
 b.upgrade(1);b.continueLesson();
 assert.equal(b.workshopKitAvailable,false);assert.equal(b.buildWorkshop(),false);
 while(!b.learningPaused)b.update(.025);
 b=restore(b);assert.equal(b.workshopKitAvailable,true);const gold=b.gold;
 assert.equal(b.buildWorkshop(),true);assert.equal(b.gold,gold);b=restore(b);
 assert.equal(b.workshopKitAvailable,false);assert.equal(b.buildWorkshop(),false);assert.equal(b.gold,gold);
 b.continueLesson();b=restore(b);assert.equal(b.researchFrost(),true);assert.equal(b.gold,gold-60);
 const veteran=new IdleBattle();veteran.gold=200;assert.equal(veteran.workshopBuildCost,200);
 assert.equal(veteran.buildWorkshop(),true);assert.equal(veteran.gold,0);restore(veteran);
});
