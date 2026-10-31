import { legacyFixtures, restoreHistorical, assertHistoricalFields } from './legacy-fixtures';
import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { BASE, IdleBattle, SETTLEMENT, stats, towerDefinition, upgradeCost, visualStage, waveCount } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifyFarm, defenseFingerprint, type FarmCertificate } from '../src/farming';
import { currentGoal, recommendedUpgrade } from '../src/progress-ui';
import { playOpening } from './helpers/earned-opening';

// Rich unit fixture for boundary checks only; the timing test below earns every coin.
function eligible() {
  const b=new IdleBattle(); b.update(4); b.gold=1000000;
  b.buildWorkshop(); b.researchFrost(); b.highestCleared=24; b.bossVictories=1;
  b.buildWarehouse(); b.unlockClearing();
  // Directly setting a record bypasses the live clear which normally welcomes Wisp.
  b.wispArrival.at=b.elapsed;
  assert.ok(IdleBattle.restore(b.snapshot()));return b;
}

test('Workshop II charges once after Frost and unlocks continuing level 7+ / three bounded art stages',()=>{
  const b=eligible(); b.gold=1199; assert.equal(b.upgradeWorkshop(),false);
  b.gold=1200; assert.equal(b.upgradeWorkshop(),true); assert.equal(b.gold,0);
  assert.equal(b.upgradeWorkshop(),false); assert.equal(b.maxLevel,Infinity);
  const early=new IdleBattle(); early.gold=100000;early.buildWorkshop();early.researchFrost();
  // Clearing is optional; Frost and the separate 1,200-gold purchase are required.
  const noFrost=new IdleBattle();noFrost.gold=100000;noFrost.buildWorkshop();
  assert.equal(noFrost.upgradeWorkshop(),false);
  assert.equal(early.clearing.unlocked,false);assert.equal(early.maxLevel,6);
  const before=early.gold;assert.equal(early.upgradeWorkshop(),true);
  assert.equal(early.gold,before-SETTLEMENT.workshopUpgradeCost);assert.equal(early.maxLevel,Infinity);
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
    assert.equal(b.upgrade(t.uid),true); assert.equal(t.level,21);
  }
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  const bad=b.snapshot();bad.settlement.upgradedAt=b.elapsed+1;assert.equal(IdleBattle.restore(bad),undefined);
  bad.settlement.upgradedAt=b.elapsed;bad.settlement.workshopUpgraded=false;assert.equal(IdleBattle.restore(bad),undefined);
  assert.deepEqual([1,3,4,6,7,20].map(visualStage),[1,1,2,2,3,3]);
});

test('schema nine expanded live save migrates without changing combat, purchases or a historical wave-25 record',() => {
  const old=legacyFixtures().critical.expanded9;
  const restored=restoreHistorical(old,{liveClearedWaves:[],farmWave:1});
  assert.equal(restored.waveRecipeVersion,5);assert.equal(restored.clearing.unlocked,true);
  assert.equal(restored.secondBossVictories,0);assert.equal(restored.nextAdvanceWave,25);
  assert.equal(restored.requestBossChallenge(25),true);
  assert.equal(IdleBattle.restore(restored.snapshot())!.bossChallengeWave,25);
  assert.equal(waveCount(25,5),28);assert.equal(waveCount(25),13);
});

test('second boss pays its own first reward once, survives reload, and never becomes an offline farm',()=>{
  const b=eligible();b.upgradeWorkshop();
  // Bounded rich unit defense isolates rewards/reload; earned balance is separate.
  for(const id of ['tower-02','tower-03','tower-04','tower-06','tower-07','tower-08','tower-09','tower-10','tower-11']){
    const kind=id==='tower-02'?2:4;
    if(b.canBuild(id,kind))assert.ok(b.build(id,kind));
  }
  assert.ok(b.towers.length>=8);
  for(const t of b.towers)while(t.level<12)assert.equal(b.upgrade(t.uid),true);
  assert.ok(IdleBattle.restore(b.snapshot()));
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

test('earned continuation opens Workshop II early and retains paid upgrades without repeated tasks at minute 15',()=>{
  const b=playOpening().b;assert.equal(b.unlockClearing(),true);const clearingAt=b.elapsed;
  let proof:FarmCertificate|undefined,key='',workshopAt=0,changed=false;
  while(b.elapsed<900){
    if(!b.settlement.workshopUpgraded){const wallet=b.gold;if(b.upgradeWorkshop()){assert.equal(b.gold,wallet-SETTLEMENT.workshopUpgradeCost);workshopAt=b.elapsed;changed=true;}}
    else {const next=[...b.towers].filter(t=>t.level<7).sort((a,z)=>upgradeCost(a)-upgradeCost(z))[0];if(next&&b.upgrade(next.uid))changed=true;}
    const k=defenseFingerprint(b)+'/'+b.liveClearedWaves.join(',');
    if(k!==key){proof=certifyFarm(b,proof);b.setFarmWave(proof?.wave??1);key=k;}
    if(b.mode==='farm'&&changed){b.requestAdvance();changed=false;}
    b.update(BASE.stepSeconds);b.drainEvents();
  }
  // B13 accepts earlier Workshop II purchases; retain earned order and the original upper limit.
  assert.ok(workshopAt>=clearingAt&&workshopAt<=795,'Workshop II after the earned clearing, by minute 13.25');
  assert.ok(b.highestCleared>=20,'Wave 25 is the next visible milestone after wave 20');
  assert.ok(proof);assert.equal(b.maxLevel,Infinity);assert.equal(currentGoal(b).action,'progress');
  assert.ok(upgradeCost(recommendedUpgrade(b)!)>0);assert.ok(IdleBattle.restore(b.snapshot()));
  console.log('B12 earned continuation:',{workshopAt,at15:b.highestCleared,levels:b.towers.map(t=>t.level),nextCost:upgradeCost(recommendedUpgrade(b)!)});
});

test('late waves retain bounded populations and level 20 still offers a real next upgrade',()=>{
  const b=eligible();b.upgradeWorkshop();b.gold=100000000;b.secondBossVictories=1;b.highestCleared=25;b.attemptId=2;
  for(const [pad,kind] of [['tower-02',2],['tower-03',3],['tower-07',4]] as const)assert.ok(b.build(pad,kind));
  for(const t of b.towers)while(t.level<20)assert.equal(b.upgrade(t.uid),true);
  assert.equal(currentGoal(b).action,'progress');
  const next = recommendedUpgrade(b)!; assert.ok(upgradeCost(next)>0);
  assert.equal(b.upgrade(next.uid),true); assert.equal(next.level,21);
  assert.ok(waveCount(1000000)>=18&&waveCount(1000000)<=BASE.waves.maxCount);
  assert.ok(Number.isSafeInteger(upgradeCost({def:towerDefinition(4),level:20})));
  b.wave=999999;b.highestCleared=999999;b.update(60);
  assert.ok(b.enemies.length<=BASE.waves.maxCount);assert.ok(b.shots.length<=BASE.maxProjectiles);
  assert.ok(b.enemies.every(e=>Number.isFinite(e.hp)&&e.hp>BASE.waves.maxHpMultiplier));
});
