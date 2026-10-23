import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION, BASE, stats, upgradeCost, waveCount, waveEnemy } from '../src/battle';
import { healthMultiplier, battleReward } from '../src/balance';
import { ENEMIES, isHealer } from '../src/enemy-roster';
import { waveRecipe, spawnGap, clearReward } from '../src/wave-recipes';
import { certifyFarm, isFarmCertificateValid } from '../src/farming';
import { beginAbsence, reserveOffline, createOfflineState } from '../src/offline';
import { openBattleStore } from '../src/save-store';
import { BattleSession } from '../src/battle-session';
import { stepIlyraMotion } from '../src/ilyra';
const read = (path: string) => JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/' + path, import.meta.url), 'utf8'));
const first = read('wave-rework-v2/baseline-v11/view-wave32.json');

test('frozen first-rework quantities, composition, HP, clocks and total rewards remain exact', () => {
  const baseline = read('wave-rework/balance-results.json');
  for (const row of baseline.recipes) {
    const wave = row.wave, enemies = Array.from({length:waveCount(wave,11)},(_,i)=>waveEnemy(wave,i,11));
    const counts:Record<string,number>={};for(const e of enemies)counts[e.id]=(counts[e.id]??0)+1;
    assert.deepEqual(counts,row.current.counts,`composition ${wave}`);
    assert.equal(enemies.length,row.current.count);
    assert.equal(enemies.reduce((sum,e)=>sum+e.hp*healthMultiplier(wave,11,e.id==='Rosenspiegel'),0),row.current.hp);
    assert.equal(.15+enemies.slice(1).reduce((sum,_,i)=>sum+spawnGap(wave,i+1,11),0),row.current.spawnSeconds);
    assert.equal(enemies.reduce((sum,e)=>sum+battleReward(e.gold,wave,11),battleReward(clearReward(wave,11),wave,11)),row.current.gold);
  }
});

test('larger families retain bounded populations, healers, deterministic later waves and distinct rhythms', () => {
  const signatures=new Map<number,string>();
  for(let wave=6;wave<=250;wave++){
    if(wave===15||wave===25)continue;
    const r=waveRecipe(wave);signatures.set(wave,JSON.stringify(r));
    assert.ok(r.enemies.length<=28);assert.ok(new Set(r.enemies).size<=3);
    assert.ok(r.enemies.every(id=>ENEMIES[id].firstWave<=wave));
    assert.ok(r.enemies.filter(id=>isHealer(ENEMIES[id])).length<=2);
    assert.ok(r.gaps.every(gap=>gap>=.25&&gap<=1.65));
    if(wave>=23){
      const min={swarm:25,rush:22,armor:18,support:18}[r.family];
      assert.ok(r.enemies.length>=min,`${wave} ${r.family} has ${r.enemies.length}`);
    }
    if(signatures.has(wave-1))assert.notEqual(JSON.stringify(r),signatures.get(wave-1));
  }
  for(let wave=250;wave>=6;wave--)if(signatures.has(wave))assert.equal(JSON.stringify(waveRecipe(wave)),signatures.get(wave));
  assert.equal(waveCount(40),26);assert.equal(waveRecipe(40).elite,true);assert.equal(waveRecipe(41).elite,false);
  const lateFamilies=new Set(Array.from({length:17},(_,i)=>waveRecipe(41+i).family));assert.equal(lateFamilies.size,4);
});

test('a genuine schema-25 active healer wave migrates intact, rejects corruption, then starts rules 12',()=>{
  const b=IdleBattle.restore(first);assert.ok(b);const current=b.snapshot();
  assert.equal(current.schemaVersion,BATTLE_SCHEMA_VERSION);assert.equal(current.rulesVersion,BATTLE_RULES_VERSION);assert.equal(current.waveRecipeVersion,11);
  for(const key of ['queue','enemies','shots','towers','spawnTimer','gold','earned','goldRemainderUnits','rewardRemainderUnits','mara','ilyra','social','settlement','elapsed','bossCharm'] as const)assert.deepEqual(current[key],first[key],key);
  assert.deepEqual(current.liveClearedWaves,first.liveClearedWaves);assert.equal(current.farmWave,first.farmWave);
  const bad=structuredClone(first);bad.queue[0]='Rosenspiegel';assert.equal(IdleBattle.restore(bad),undefined);
  const badHp=structuredClone(first);badHp.enemies[0].maxHp+=1;assert.equal(IdleBattle.restore(badHp),undefined);
  const attempt=b.attemptId;for(let i=0;i<8000&&b.attemptId===attempt;i++)b.update(.025);
  assert.ok(b.attemptId>attempt);assert.equal(b.waveRecipeVersion,12);assert.ok(IdleBattle.restore(b.snapshot()));
});

test('level 20 is no ceiling: paid upgrades, higher-level projectiles and exact spent totals survive reload',()=>{
  const b=IdleBattle.restore(read('wave-rework-v2/baseline-v11/earned-balanced-late.json'))!;assert.ok(b);
  const tower=b.towers[0];tower.level=20;tower.visualStage=3;tower.spent=0;
  for(let level=1;level<20;level++)tower.spent+=upgradeCost({...tower,level});
  b.gold=1_000_000;const before=stats(tower),price=upgradeCost(tower),gold=b.gold;
  assert.equal(b.maxLevel,Infinity);assert.equal(b.upgrade(tower.uid),true);assert.equal(tower.level,21);
  assert.equal(b.gold,gold-price);assert.ok(stats(tower).damage>before.damage);assert.equal(stats(tower).range,before.range);assert.equal(stats(tower).cooldown,before.cooldown);
  assert.equal(upgradeCost(tower),Math.round(tower.def.cost*8.75*Math.pow(1.32,15)));
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  let seen=false;for(let i=0;i<800&&!seen;i++){b.update(.025);seen=b.shots.some(s=>s.level===21);}
  assert.ok(seen);assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  const oldFormat={...b.snapshot(),schemaVersion:25,rulesVersion:11};assert.equal(IdleBattle.restore(oldFormat),undefined);
  const impossible=b.snapshot();impossible.towers[0].level=1_000_000;assert.equal(IdleBattle.restore(impossible),undefined);
  const impossibleShot=b.snapshot();impossibleShot.shots.find(s=>s.level===21)!.level=1_000_000;assert.equal(IdleBattle.restore(impossibleShot),undefined);
  const unpayableShot=b.snapshot(),forgedShot=unpayableShot.shots.find(s=>s.level===21)!;forgedShot.level=1000;forgedShot.damage=stats({def:BASE.tower,level:1000}).damage;assert.equal(IdleBattle.restore(unpayableShot),undefined);
  const wrongSpent=b.snapshot();wrongSpent.towers[0].spent++;assert.equal(IdleBattle.restore(wrongSpent),undefined);
  assert.ok(b.buildTavern(b.recommendedTavernPlot!));assert.ok(b.upgradeTavern());assert.ok(b.recruitIlyra());
  assert.ok(b.moveIlyraTo({x:3,y:5}));
  for(let i=0;i<3000&&b.ilyra!.path.length;i++)stepIlyraMotion(b.ilyra!,BASE.stepSeconds);
  assert.ok(b.castIlyraAt(b.enemies[0]));assert.equal(b.ilyra!.volley!.sourceLevel,21);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  const impossibleVolley=b.snapshot();impossibleVolley.ilyra!.volley!.sourceLevel=1_000_000;assert.equal(IdleBattle.restore(impossibleVolley),undefined);
});

test('old farm evidence cannot certify new waves; historical offline receipts remain payable exactly once',async()=>{
  const b=IdleBattle.restore(first)!;
  const legacyProof={wave:31,rulesVersion:11,fingerprint:'frozen-departure',rewardGold:100,durationMs:10000};
  assert.equal(isFarmCertificateValid(legacyProof,b),false);
  const earned=IdleBattle.restore(read('wave-rework-v2/baseline-v11/earned-balanced-late.json'))!;
  const previous=read('wave-rework-v2/baseline-v11/played-balanced.json').farm;
  assert.equal(isFarmCertificateValid(previous,earned),false);
  const before=earned.snapshot(),fresh=certifyFarm(earned,previous);assert.ok(fresh&&fresh.wave>1);
  assert.equal(fresh.rulesVersion,12);assert.equal(isFarmCertificateValid(fresh,earned),true);assert.deepEqual(earned.snapshot(),before);
  const factory=new IDBFactory(),name='w02-schema25';let store=await openBattleStore(factory,name,()=>31000);store.close();
  const offline=reserveOffline(beginAbsence(createOfflineState(1000),1000,legacyProof,false),31000);
  await new Promise<void>((resolve,reject)=>{const r=factory.open(name,1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{
    const db=r.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:31000,paused:false,battle:first,offline},'default');
    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
  };});
  store=await openBattleStore(factory,name,()=>31000);const session=await BattleSession.open(store,{now:()=>31000,ownerId:'w02',locks:null});
  assert.equal(session.certificate?.rulesVersion,12);assert.ok(isFarmCertificateValid(session.certificate!,session.battle));assert.equal(session.pendingReward?.amountUnits,180000);const gold=session.battle.gold;
  assert.equal(await session.claimOffline(),true);assert.equal(session.battle.gold,gold+180);assert.equal(await session.claimOffline(),false);await session.close();
});

test('HP continues past the old plateau; machine guards and old level curves remain explicit',()=>{
  for(const wave of [40,50,75,100]){
    const hp=healthMultiplier(wave,12,false);assert.ok(Number.isFinite(hp)&&hp>0);
    if(wave<=40)assert.equal(hp,healthMultiplier(wave,11,false));
    if(wave>40)assert.ok(hp>healthMultiplier(wave-1,12,false));
    if(wave>40){
      const b=IdleBattle.restore(read('wave-rework-v2/baseline-v11/earned-balanced-late.json'))!;
      // Structural continuation only; reaching these records was not simulated.
      b.highestCleared=wave-1;b.wave=wave-1;b.update(6);
      assert.equal(b.wave,wave);assert.ok(b.enemies.length>0);
      assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
    }
  }
  assert.equal(healthMultiplier(100,11,false),100000);assert.ok(healthMultiplier(100,12,false)>100000);
  assert.ok(Number.isFinite(healthMultiplier(1_000_000,12,false)*ENEMIES.Rosenspiegel.hp));
  for(const level of [20,30,40,60])assert.ok(Number.isFinite(stats({def:BASE.tower,level}).damage)&&Number.isSafeInteger(upgradeCost({def:BASE.tower,level})));
});
