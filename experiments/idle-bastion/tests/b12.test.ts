import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { BASE, IdleBattle, SETTLEMENT, stats, towerDefinition, upgradeCost, visualStage, waveCount } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifyFarm, defenseFingerprint, type FarmCertificate } from '../src/farming';
import { currentGoal } from '../src/progress-ui';
import { playOpening } from './helpers/earned-opening';

// Rich unit fixture for boundary checks only; the timing test below earns every coin.
function eligible() {
  const b=new IdleBattle(); b.update(4); b.gold=1000000;
  b.buildWorkshop(); b.researchFrost(); b.highestCleared=24; b.bossVictories=1;
  b.buildWarehouse(); b.unlockClearing(); return b;
}

test('Workshop II charges once after clearing and unlocks bounded level 7–20 / three art stages',()=>{
  const b=eligible(); b.gold=1199; assert.equal(b.upgradeWorkshop(),false);
  b.gold=1200; assert.equal(b.upgradeWorkshop(),true); assert.equal(b.gold,0);
  assert.equal(b.upgradeWorkshop(),false); assert.equal(b.maxLevel,20);
  const early=new IdleBattle(); early.gold=100000;early.buildWorkshop();early.researchFrost();
  assert.equal(early.upgradeWorkshop(),false); assert.equal(early.maxLevel,6);
  b.gold=10000000;
  for(const kind of [1,2,3,4] as const){
    const t=b.build(['tower-03','tower-02','tower-06','tower-07'][kind-1],kind)!;
    for(let level=1;level<=20;level++){
      assert.equal(t.level,level); assert.equal(t.visualStage,visualStage(level));
      const s=stats(t);assert.ok(Number.isFinite(s.damage)&&s.damage>0);
      assert.ok(s.range<=t.def.range+30);assert.ok(s.cooldown>=t.def.cooldown/1.3);
      if(level>6)assert.equal(s.range,stats({...t,level:6}).range);
      if(level<20){const old=s.damage,price=upgradeCost(t),money=b.gold;assert.equal(b.upgrade(t.uid),true);assert.equal(b.gold,money-price);assert.ok(stats(t).damage>old);}
    }
    assert.equal(b.upgrade(t.uid),false);
  }
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  const bad=b.snapshot();bad.settlement.upgradedAt=b.elapsed+1;assert.equal(IdleBattle.restore(bad),undefined);
  bad.settlement.upgradedAt=b.elapsed;bad.settlement.workshopUpgraded=false;assert.equal(IdleBattle.restore(bad),undefined);
  assert.deepEqual([1,3,4,6,7,20].map(visualStage),[1,1,2,2,3,3]);
});

test('schema nine expanded live save migrates without changing combat, purchases or a historical wave-25 record',()=>{
  const b=eligible();b.build('tower-east-01',2);b.update(1);b.highestCleared=30;
  const snap=b.snapshot();const {secondBossVictories,bossChallengeWave,...old}=snap;
  const {workshopUpgraded,upgradedAt,...settlement}=old.settlement;
  const legacy={...old,settlement,schemaVersion:9,rulesVersion:5,waveRecipeVersion:5};
  const restored=IdleBattle.restore(legacy)!;assert.ok(restored);
  assert.deepEqual(restored.snapshot(),{...snap,waveRecipeVersion:5,liveClearedWaves:[],farmWave:1});
  assert.equal(restored.secondBossVictories,0);assert.equal(restored.nextAdvanceWave,25);
  assert.equal(restored.requestBossChallenge(25),true);
  assert.equal(IdleBattle.restore(restored.snapshot())!.bossChallengeWave,25);
  assert.equal(waveCount(25,5),28);assert.equal(waveCount(25),13);
});

test('second boss pays its own first reward once, survives reload, and never becomes an offline farm',()=>{
  const b=eligible();b.upgradeWorkshop();
  for(const pad of b.layout.towerPads){
    const t=b.towers.find(t=>t.padId===pad.id)??b.build(pad.id,pad.id==='tower-02'?2:4)!;
    while(t.level<7)b.upgrade(t.uid);
  }
  assert.equal(b.requestBossChallenge(25),true);
  let live=b,seen=false,firstReward=-1;
  for(let i=0;i<12000&&!live.secondBossVictories;i++){
    live.update(BASE.stepSeconds);
    for(const e of live.drainEvents())if(e.type==='boss-victory')firstReward=e.amount!;
    if(live.bossEnemy&&!seen){const snap=live.snapshot();live=IdleBattle.restore(snap)!;assert.ok(live);assert.deepEqual(live.snapshot(),snap);seen=true;}
  }
  assert.ok(seen);assert.equal(live.secondBossVictories,1);assert.equal(live.bossVictories,1);assert.equal(firstReward,1200);
  assert.equal(live.setFarmWave(25),false);assert.ok(!live.liveClearedWaves.includes(25));
  assert.equal(live.requestBossChallenge(25),true);let repeatReward=-1;
  for(let i=0;i<12000&&live.secondBossVictories<2;i++){
    live.update(BASE.stepSeconds);for(const e of live.drainEvents())if(e.type==='boss-victory')repeatReward=e.amount!;
  }
  assert.equal(live.secondBossVictories,2);assert.equal(repeatReward,0);assert.ok(IdleBattle.restore(live.snapshot()));
});

test('second boss defeat preserves expansion and requires an explicit new advance',()=>{
  const b=eligible();b.upgradeWorkshop();assert.equal(b.requestBossChallenge(25),true);
  for(let i=0;i<12000&&b.phase!=='defeat';i++){b.update(BASE.stepSeconds);b.drainEvents();}
  assert.equal(b.phase,'defeat');assert.equal(b.secondBossVictories,0);assert.ok(IdleBattle.restore(b.snapshot()));
  b.update(BASE.stepSeconds);assert.equal(b.mode,'farm');assert.equal(b.advanceRequested,false);
  assert.equal(b.settlement.workshopUpgraded,true);assert.equal(b.requestAdvance(),true);
  const restored=IdleBattle.restore(b.snapshot())!;assert.ok(restored);assert.equal(restored.bossChallengeWave,25);
});

test('Workshop II persistent command rolls back on failure and survives a committed reload',async()=>{
  const factory=new IDBFactory();let store=await openBattleStore(factory,'b12-transaction');
  await store.save(eligible().snapshot(),false,0);
  let live=await BattleSession.open(store,{locks:null});if(live.pendingReward)await live.claimOffline();await live.resumeActive();
  const before=live.battle.snapshot(),save=store.save.bind(store);store.save=async()=>{throw new Error('controlled write failure');};
  assert.equal(await live.command(b=>b.upgradeWorkshop()),false);assert.deepEqual(live.battle.snapshot(),before);
  store.save=save;await assert.rejects(live.close(),/controlled write failure/);
  store=await openBattleStore(factory,'b12-transaction');live=await BattleSession.open(store,{locks:null});
  if(live.pendingReward)await live.claimOffline();await live.resumeActive();
  const money=live.battle.gold;assert.equal(await live.command(b=>b.upgradeWorkshop()),true);
  assert.equal(live.battle.gold,money-SETTLEMENT.workshopUpgradeCost);await live.close();
  store=await openBattleStore(factory,'b12-transaction');const loaded=await store.load();assert.equal(loaded.kind,'valid');
  if(loaded.kind==='valid')assert.equal(IdleBattle.restore(loaded.save.battle)!.settlement.workshopUpgraded,true);store.close();
});

test('earned continuation opens Workshop II around minute 13 and keeps an affordable next goal after minute 15',()=>{
  const b=playOpening().b;assert.equal(b.unlockClearing(),true);
  let proof:FarmCertificate|undefined,key='',workshopAt=0,changed=false;
  while(b.elapsed<900){
    if(!b.settlement.workshopUpgraded){if(b.upgradeWorkshop()){workshopAt=b.elapsed;changed=true;}}
    else {const next=[...b.towers].filter(t=>t.level<7).sort((a,z)=>upgradeCost(a)-upgradeCost(z))[0];if(next&&b.upgrade(next.uid))changed=true;}
    const k=defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');
    if(k!==key){proof=certifyFarm(b,proof);b.setFarmWave(proof?.wave??1);key=k;}
    if(b.mode==='farm'&&changed){b.requestAdvance();changed=false;}
    b.update(BASE.stepSeconds);b.drainEvents();
  }
  assert.ok(workshopAt>=600&&workshopAt<=795,'Workshop II around minutes 10–13');
  assert.ok(b.highestCleared>=20,'Wave 25 is the next visible milestone after wave 20');
  assert.ok(proof);assert.equal(b.maxLevel,20);assert.equal(currentGoal(b).action,'upgrade');
  assert.ok(currentGoal(b).cost!>0);assert.ok(IdleBattle.restore(b.snapshot()));
  console.log('B12 earned continuation:',{workshopAt,at15:b.highestCleared,levels:b.towers.map(t=>t.level),nextCost:currentGoal(b).cost});
});

test('late waves and fully upgraded goals remain bounded without fictitious unlocks',()=>{
  const b=eligible();b.upgradeWorkshop();b.gold=100000000;b.secondBossVictories=1;b.highestCleared=25;b.attemptId=2;
  for(const pad of b.layout.towerPads){const t=b.towers.find(t=>t.padId===pad.id)??b.build(pad.id)!;while(t.level<20)b.upgrade(t.uid);}
  assert.equal(currentGoal(b).action,'progress');assert.equal(currentGoal(b).cost,undefined);
  assert.equal(waveCount(1000000),BASE.waves.maxCount);
  assert.ok(Number.isSafeInteger(upgradeCost({def:towerDefinition(4),level:20})));
  b.wave=999999;b.highestCleared=999999;b.update(60);
  assert.ok(b.enemies.length<=BASE.waves.maxCount);assert.ok(b.shots.length<=BASE.maxProjectiles);
  assert.ok(b.enemies.every(e=>Number.isFinite(e.hp)&&e.hp<=BASE.enemies.Rosenspiegel.hp*BASE.waves.maxHpMultiplier));
});
