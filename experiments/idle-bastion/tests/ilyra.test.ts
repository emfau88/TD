import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, BASE, ilyraDamage } from '../src/battle';
import { ILYRA, stepIlyraMotion, ilyraCell } from '../src/ilyra';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifyFarm, defenseFingerprint } from '../src/farming';

// Artificial veteran fixture; saves and live hits still use normal rules.
function veteran() {
 const b=new IdleBattle();b.update(4);b.gold=12000;b.highestCleared=25;b.bossVictories=1;b.secondBossVictories=1;
 b.buildWorkshop();b.researchFrost();b.update(.025);b.wispArrival.met=true;b.discovery='off';
 assert.ok(b.buildTavern(b.recommendedTavernPlot!));assert.ok(b.upgradeTavern());assert.ok(IdleBattle.restore(b.snapshot()));return b;
}
function recruited() {const b=veteran();assert.ok(b.recruitIlyra());return b;}
function deploy(b:IdleBattle) {
 assert.ok(b.moveIlyraTo({x:3,y:5}));
 for(let i=0;i<3000&&b.ilyra!.path.length;i++)stepIlyraMotion(b.ilyra!,BASE.stepSeconds);
 assert.equal(b.ilyra!.path.length,0);assert.ok(IdleBattle.restore(b.snapshot()));
}
function advance(b:IdleBattle,t:number) {for(let i=0;i<Math.round(t/BASE.stepSeconds);i++)b.update(BASE.stepSeconds);}
function volleyFixture() {
 const b=recruited();deploy(b);
 b.mode='farm';b.farmWave=6;b.liveClearedWaves=[1,6];(b as any).startAttempt();advance(b,.9);
 const first=b.enemies[0];assert.equal(b.enemies.length,3);assert.ok(b.enemies.some(e=>e.def.flying));
 assert.ok(IdleBattle.restore(b.snapshot()));assert.ok(b.castIlyraAt(first));return b;
}

test('free conscious recruitment preserves veteran saves and rejects repeats; core settlement also supports it',()=>{
 const fresh=IdleBattle.newGame();assert.equal(fresh.ilyraPower.damage,70);assert.equal(fresh.recruitIlyra(),false);
 const b=veteran(),before=b.snapshot(),old:any=structuredClone(before);old.schemaVersion=20;delete old.ilyra;
 assert.deepEqual(IdleBattle.restore(old)!.snapshot(),before);
 assert.ok(b.recruitIlyra());assert.equal(b.gold,before.gold);assert.equal(b.ilyra!.autoCast,false);assert.equal(b.setIlyraAuto(true),false);
 const recruited=b.snapshot();assert.equal(b.recruitIlyra(),false);assert.deepEqual(b.snapshot(),recruited);
 assert.deepEqual(IdleBattle.restore(recruited)!.snapshot(),recruited);
 const core=veteran();assert.ok(core.relocateSettlement());assert.ok(core.recruitIlyra());assert.ok(IdleBattle.restore(core.snapshot()));
 const invalid=b.snapshot();invalid.settlement.tavernBuilt=false;assert.equal(IdleBattle.restore(invalid),undefined);
});

test('movement remains independent, bounded and reloadable; obstacles reject orders',()=>{
 const b=recruited(),target=b.mara.targetTowerUid;
 assert.equal(b.moveIlyraTo({x:-1,y:0}),false);assert.ok(b.moveIlyraTo({x:3,y:5}));
 for(let i=0;i<3000&&b.ilyra!.path.length;i++){stepIlyraMotion(b.ilyra!,BASE.stepSeconds);if(i%40===0)assert.ok(IdleBattle.restore(b.snapshot()));}
 assert.deepEqual(ilyraCell(b.ilyra!),{x:3,y:5});assert.equal(b.mara.targetTowerUid,target);
 assert.equal(b.ilyra!.introduction,'cast');assert.equal(b.setIlyraAuto(true),false);
});

test('saved windup and flight hit once, reward ground/air kills once, and reject forged damage',()=>{
 const b=volleyFixture(),before=b.kills;
 assert.equal(b.castIlyraAt(b.enemies[0]),false);assert.equal(b.moveIlyraTo({x:4,y:5}),false);
 advance(b,.3);const snap=b.snapshot(),restored=IdleBattle.restore(snap)!;assert.ok(restored);
 const forged=structuredClone(snap);forged.ilyra!.volley!.damage++;assert.equal(IdleBattle.restore(forged),undefined);
 advance(b,.525);advance(restored,.525);assert.deepEqual(restored.snapshot(),b.snapshot());
 assert.equal(b.kills-before,3);assert.equal(b.ilyra!.volley!.hit,true);assert.equal(b.ilyra!.introduction,'done');
 const afterHit=IdleBattle.restore(b.snapshot())!,earned=b.earned,kills=b.kills;
 advance(afterHit,.025);assert.equal(afterHit.earned,earned);assert.equal(afterHit.kills,kills);
 assert.ok(afterHit.setIlyraAuto(true));assert.ok(IdleBattle.restore(afterHit.snapshot()));
});

test('air damage is 50 percent higher, scaling ignores Mara, and empty waves never spend cooldown',()=>{
 const b=volleyFixture(),v=b.ilyra!.volley!,source=v.damage;
 // High-health targets isolate damage from rewards; model invariants checked in the previous case.
 const ground=b.enemies[0],air=b.enemies.at(-1)!;ground.hp=air.hp=1000;
 advance(b,.825);assert.equal(1000-ground.hp,source);assert.equal(1000-air.hp,source*1.5);
 const power=b.ilyraPower.damage;b.mara.effectRemaining=8;assert.equal(b.ilyraPower.damage,power);
 assert.ok(ilyraDamage(1,8)>ilyraDamage(1,1));
 b.ilyra!.autoCast=true;b.ilyra!.cooldown=0;b.ilyra!.volley=null;b.enemies=[];(b as any).queue=[];
 advance(b,.025);assert.equal(b.ilyra!.cooldown,0);assert.equal(b.ilyra!.volley,null);
 assert.equal(b.castIlyraAt({x:1500,y:100}),false);
});

test('recruitment is transactional across storage failure and reload',async()=>{
 const factory=new IDBFactory();let store=await openBattleStore(factory,'b15b');await store.save(veteran().snapshot(),false,0);
 let live=await BattleSession.open(store,{locks:null});if(live.pendingReward)await live.claimOffline();await live.resumeActive();
 const before=live.battle.snapshot(),save=store.save.bind(store);store.save=async()=>{throw new Error('controlled write failure');};
 assert.equal(await live.command(b=>b.recruitIlyra(),true),false);assert.deepEqual(live.battle.snapshot(),before);store.save=save;
 await assert.rejects(live.close(),/controlled write failure/);
 store=await openBattleStore(factory,'b15b');live=await BattleSession.open(store,{locks:null});if(live.pendingReward)await live.claimOffline();await live.resumeActive();
 const gold=live.battle.gold;assert.ok(await live.command(b=>b.recruitIlyra(),true));assert.equal(live.battle.gold,gold);await live.close();
 store=await openBattleStore(factory,'b15b');const result=await store.load();assert.equal(result.kind,'valid');if(result.kind==='valid')assert.ok(IdleBattle.restore(result.save.battle)!.ilyra);store.close();
});

test('farm proof ignores recruited Ilyra and pending spells',()=>{
 const b=veteran();b.liveClearedWaves=[1];const before=certifyFarm(b);assert.ok(before);const fingerprint=defenseFingerprint(b);
 assert.ok(b.recruitIlyra());deploy(b);assert.ok(b.castIlyraAt(b.enemies[0]));
 assert.equal(defenseFingerprint(b),fingerprint);assert.deepEqual(certifyFarm(b),before);
});


test('slower volleys remain in flight at the old hit time; legacy saves finish once at their old pace',()=>{
 const slow=volleyFixture();advance(slow,.625);
 assert.equal(slow.ilyra!.volley!.hit,false);assert.ok(IdleBattle.restore(slow.snapshot()));
 const bad=slow.snapshot();(bad.ilyra!.volley as any).pace=2;assert.equal(IdleBattle.restore(bad),undefined);
 for(const hit of [false,true]){
  const b=volleyFixture();if(hit)advance(b,.825);
  const old:any=b.snapshot();old.schemaVersion=21;delete old.ilyra.volley.pace;
  old.ilyra.volley.age=hit?.7:.3;old.ilyra.cooldown=28-old.ilyra.volley.age;
  const restored=IdleBattle.restore(old)!;assert.ok(restored);assert.equal(restored.ilyra!.volley!.pace,undefined);
  const kills=restored.kills;advance(restored,hit?.05:.325);
  assert.equal(restored.kills-kills,hit?0:3);assert.equal(restored.ilyra!.volley!.hit,true);
  assert.ok(IdleBattle.restore(restored.snapshot()));
 }
});
