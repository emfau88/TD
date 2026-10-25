import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, BATTLE_SCHEMA_VERSION, BATTLE_RULES_VERSION, waveCount, waveEnemy } from '../src/battle';
import { healthMultiplier, battleReward } from '../src/balance';
import { waveRecipe, spawnGap, clearReward } from '../src/wave-recipes';
import { certifyFarm, isFarmCertificateValid } from '../src/farming';
import { beginAbsence, reserveOffline, createOfflineState, WAREHOUSE_OFFLINE } from '../src/offline';
import { openBattleStore } from '../src/save-store';
import { BattleSession } from '../src/battle-session';

const read=(file:string)=>JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/early-balance-release/'+file,import.meta.url),'utf8'));
const run=(variant:string,name:string)=>read(variant+'/runs.json').find((r:any)=>r.profile.name===name);
const legacy=read('baseline/legacy-fixtures.json');
const current=read('selected/B-snapshots.json');
function encounter(wave:number,version:number){
  const enemies=Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version));
  return {version,wave,enemies:enemies.map(e=>[e.id,e.hp*healthMultiplier(wave,version,e.id==='Rosenspiegel'),battleReward(e.gold,wave,version)]),
    gaps:enemies.map((_,i)=>spawnGap(wave,i+1,version)),clear:battleReward(clearReward(wave,version),wave,version)};
}

test('rules 3–15 match main for 910 encounters; current rules change only waves 10 and 20',()=>{
  const rows=[];
  for(let version=3;version<=15;version++)for(let wave=1;wave<=70;wave++)rows.push(encounter(wave,version));
  assert.equal(createHash('sha256').update(JSON.stringify(rows)).digest('hex'),legacy.historicDigest);
  for(let wave=1;wave<=250;wave++){
    if(wave===10||wave===20)continue;
    assert.deepEqual({...encounter(wave,16),version:15},encounter(wave,15),'wave '+wave);
  }
  assert.equal(BATTLE_SCHEMA_VERSION,31);assert.equal(BATTLE_RULES_VERSION,16);
});

test('wave 10 has 22 enemies in four short groups; wave 20 trades exactly three beetles with nearly equal rewards',()=>{
  const ten=waveRecipe(10,16),twenty=waveRecipe(20,16),old=waveRecipe(20,15);
  assert.equal(ten.enemies.length,22);
  assert.deepEqual(ten.enemies.slice(0,15),waveRecipe(10,15).enemies);
  assert.deepEqual(ten.enemies.slice(15),Array(7).fill('FlyingLocust'));
  assert.deepEqual(ten.gaps.map((gap,i)=>gap===1.05?i+1:0).filter(Boolean),[6,12,17]);
  assert.ok(Math.abs(.15+ten.gaps.slice(0,-1).reduce((a,b)=>a+b,0)-8.7)<1e-9);
  assert.equal(twenty.enemies.length,25);assert.deepEqual(twenty.gaps,old.gaps);
  const changed=twenty.enemies.map((id,i)=>id!==old.enemies[i]?i:-1).filter(i=>i>=0);
  assert.equal(changed.length,3);
  for(const i of changed){assert.equal(old.enemies[i],'Leafbug');assert.equal(twenty.enemies[i],'Clampbeetle');}
  const gold=(wave:number,version:number)=>{const row=encounter(wave,version);return row.clear+row.enemies.reduce((s,e)=>s+Number(e[2]),0);};
  assert.equal(gold(10,16),214);assert.equal(gold(10,15),205);
  assert.equal(gold(20,16),831);assert.equal(gold(20,15),830);
  assert.equal(waveCount(10,15),15);
});

test('real schema-30 fights resume with identical old movement, projectiles, timers and money until their boundary',()=>{
  for(const fixture of legacy.continuations){
    const untouched=structuredClone(fixture.before),b=IdleBattle.restore(fixture.before);
    assert.ok(b,fixture.key);assert.deepEqual(fixture.before,untouched);
    assert.deepEqual(b.snapshot(),{...fixture.before,schemaVersion:31,rulesVersion:16});
    for(let i=0;i<fixture.steps;i++)b.update(.025);
    // An old in-flight clear is not a new-rules farm certificate.
    assert.deepEqual(b.snapshot(),{...fixture.after,schemaVersion:31,rulesVersion:16,liveClearedWaves:fixture.before.liveClearedWaves},fixture.key);
    assert.ok(IdleBattle.restore(b.snapshot()),fixture.key+' boundary');
    const attempt=b.attemptId;
    for(let i=0;i<2000&&b.attemptId===attempt;i++)b.update(.025);
    assert.ok(b.attemptId>attempt);assert.equal(b.waveRecipeVersion,16);
  }
});

test('new wave 10/20 and both boss snapshots reload exactly; downgrade and forged old queues are rejected',()=>{
  for(const key of ['active10','active20','channel15','channel25']){
    const b=IdleBattle.restore(current[key]),restored=IdleBattle.restore(current[key]);
    assert.ok(b&&restored,key);assert.deepEqual(b.snapshot(),current[key]);
    for(let i=0;i<200;i++){b.update(.025);restored.update(.025);}
    assert.deepEqual(b.snapshot(),restored.snapshot(),key);
    const downgraded={...current[key],schemaVersion:30,rulesVersion:15};
    assert.equal(IdleBattle.restore(downgraded),undefined);
  }
  const bad=structuredClone(legacy.continuations[0].before);bad.queue[0]='Rosenspiegel';
  assert.equal(IdleBattle.restore(bad),undefined);
  const hp=structuredClone(legacy.continuations[1].before);hp.enemies[0].maxHp++;
  assert.equal(IdleBattle.restore(hp),undefined);
});

test('old farm departure remains payable once through native save migration; fresh proof needs two current clears',async()=>{
  const {snapshot,proof}=legacy.departure,b=IdleBattle.restore(snapshot)!;assert.ok(b);
  const before=b.snapshot();assert.equal(isFarmCertificateValid(proof,b),false);
  const fresh=certifyFarm(b,proof);assert.ok(fresh);assert.equal(fresh.rulesVersion,16);
  assert.equal(isFarmCertificateValid(fresh,b),true);assert.deepEqual(b.snapshot(),before);
  const offline=reserveOffline(beginAbsence(createOfflineState(1000),1000,proof,false,WAREHOUSE_OFFLINE),31000);
  const units=offline.pendingReward!.amountUnits;assert.ok(units>0);
  const factory=new IDBFactory(),name='early-release-old-departure';
  let store=await openBattleStore(factory,name,()=>31000);store.close();
  await new Promise<void>((resolve,reject)=>{const r=factory.open(name,1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{
    const db=r.result,tx=db.transaction('saves','readwrite');
    tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:31000,paused:false,battle:snapshot,offline},'default');
    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
  };});
  store=await openBattleStore(factory,name,()=>31000);
  const session=await BattleSession.open(store,{now:()=>31000,ownerId:'early-release',locks:null});
  assert.equal(session.pendingReward?.amountUnits,units);
  assert.equal(session.certificate?.rulesVersion,16);
  const gold=session.battle.gold*1000+session.battle.goldRemainderUnits;
  assert.equal(await session.claimOffline(),true);
  assert.equal(session.battle.gold*1000+session.battle.goldRemainderUnits,gold+units);
  assert.equal(await session.claimOffline(),false);await session.close();
  store=await openBattleStore(factory,name,()=>31000);
  const loaded=await store.load();assert.equal(loaded.kind,'valid');
  if(loaded.kind==='valid'){assert.equal(loaded.save.offline.pendingReward,null);assert.equal(loaded.save.battle.gold*1000+loaded.save.battle.goldRemainderUnits,gold+units);}
  store.close();
});

test('earned release runs retain the first five waves and win both bosses without new losses or money farming',()=>{
  for(const name of ['A','A-direct-retry','B','C','B-no-mara','C-20s','B-poor-placement']){
    const old=run('baseline',name),next=run('selected',name);
    assert.deepEqual(next.attempts.filter((a:any)=>a.wave<=5),old.attempts.filter((a:any)=>a.wave<=5),name);
    assert.equal(next.record,25,name);assert.equal(next.losses,old.losses,name);
    assert.equal(next.boss15.result,'win');assert.equal(next.boss25.result,'win');
    if(name!=='A')assert.equal(next.farmAttempts.length,0,name);
  }
  const old=run('baseline','minimal'),next=run('selected','minimal');
  assert.equal(old.attempts.find((a:any)=>a.wave===10).damage,9);
  assert.equal(next.attempts.find((a:any)=>a.wave===10).damage,17);
});
