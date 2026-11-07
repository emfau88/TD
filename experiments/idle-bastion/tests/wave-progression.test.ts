import {expectedEmptyEncounters} from './cleanup-fixtures';
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {IDBFactory} from 'fake-indexeddb';
import {IdleBattle,BATTLE_RULES_VERSION,BATTLE_SCHEMA_VERSION,waveCount,waveEnemy} from '../src/battle';
import {healthMultiplier,battleRewardUnits} from '../src/balance';
import {waveRecipe,spawnGap,clearReward,enemyPressure} from '../src/wave-recipes';
import {ENEMIES,isHealer,introducedEnemy} from '../src/enemy-roster';
import {certifyFarm,isFarmCertificateValid} from '../src/farming';
import {reserveOffline,restoreOffline,claimOffline} from '../src/offline';
import {BattleSession} from '../src/battle-session';
import {openBattleStore} from '../src/save-store';

const fixture=JSON.parse(readFileSync(new URL('./fixtures/wave-progression-v17.json',import.meta.url),'utf8'));
const baseline=JSON.parse(readFileSync(new URL('../../../artifacts/waves-26-50-study-2026-11-02/recipes.json',import.meta.url),'utf8')).control.rows;
const current=BATTLE_RULES_VERSION;
const promote=(s:any)=>({...s,settlement:{...s.settlement,emberResearched:false,emberResearchSeen:false},social:{...s.social,encounters:expectedEmptyEncounters()},schemaVersion:BATTLE_SCHEMA_VERSION,rulesVersion:current});
const enemies=(wave:number,version:number)=>Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version));
function until(b:IdleBattle,done:()=>boolean){for(let i=0;i<16000&&!done();i++)b.update(.025);assert.ok(done());}

test('rules 17 still reproduce the frozen pre-change compositions, HP, clocks and gold',()=>{
  for(const row of baseline){
    const es=enemies(row.wave,17),composition:Record<string,number>={};
    for(const e of es)composition[e.id]=(composition[e.id]??0)+1;
    assert.deepEqual(composition,row.composition);
    assert.equal(es.reduce((s,e)=>s+e.hp*healthMultiplier(row.wave,17,e.id==='Rosenspiegel'),0),row.hp);
    assert.deepEqual(es.map((_,i)=>spawnGap(row.wave,i+1,17)),row.gaps);
    assert.equal(es.reduce((s,e)=>s+battleRewardUnits(e.gold,row.wave,17,true,false)/1000,
      battleRewardUnits(clearReward(row.wave,17),row.wave,17,true,false)/1000),row.gold);
  }
});

test('frozen B progression preserves opening, populations, clocks, introductions and full-clear gold',()=>{
  const current=20; // Current trio compositions and budgets are checked in creep-trio.test.ts.
  let previousPressure=0;
  for(let wave=1;wave<=250;wave++){
    // W36/45 now have dedicated worm tests; keep the original B curve audited.
    const version=wave===36||wave===45?19:current;
    const old=enemies(wave,17),now=enemies(wave,version),boss=wave===15||wave===25;
    assert.equal(now.length,old.length);
    assert.deepEqual(now.map((_,i)=>spawnGap(wave,i+1,current)),old.map((_,i)=>spawnGap(wave,i+1,17)));
    const gold=(version:number)=>enemies(wave,version).reduce((s,e)=>s+e.gold,clearReward(wave,version));
    assert.equal(gold(current),gold(17));
    const paid=(version:number)=>enemies(wave,version).reduce((s,e)=>s+battleRewardUnits(e.gold,wave,version,true,false),battleRewardUnits(clearReward(wave,version),wave,version,true,false));
    assert.ok(Math.abs(paid(version)/paid(17)-1)<.003);
    if(wave<=25){assert.deepEqual(now,old);assert.equal(healthMultiplier(wave,current,boss),healthMultiplier(wave,17,boss));}
    else {
      assert.ok(new Set(now.map(e=>e.id)).size<=3);
      assert.equal(now.filter(isHealer).length,old.filter(isHealer).length);
      assert.ok(now.every(e=>e.firstWave<=wave));
      const special=introducedEnemy(wave,current)?.id??introducedEnemy(wave-1,current)?.id;
      if(special)assert.equal(now.filter(e=>e.id===special).length,old.filter(e=>e.id===special).length);
      const pressure=now.reduce((s,e)=>s+enemyPressure(e.id)*healthMultiplier(wave,version,false),0);
      if(wave>26)assert.ok(pressure/previousPressure>=1.13-1e-12&&pressure/previousPressure<=1.1941);
      previousPressure=pressure;
      if(wave>50)assert.deepEqual(waveRecipe(wave,current),waveRecipe(wave,17));
    }
  }
  for(const wave of [1000,1_000_000])for(const e of enemies(wave,current))assert.ok(Number.isFinite(e.hp*healthMultiplier(wave,current,false)));
  for(const wave of [35,38])assert.equal(waveRecipe(wave,current).enemies.filter(id=>id==='Voidbutterfly').length,2);
});

test('a real in-flight rule-17 W31 keeps every combat field, then adopts current rules at the next attempt',()=>{
  const original=structuredClone(fixture.before),b=IdleBattle.restore(original)!;assert.ok(b);
  assert.deepEqual(b.snapshot(),promote(fixture.before));assert.deepEqual(original,fixture.before);
  for(let i=0;i<160;i++)b.update(.025);
  assert.deepEqual(b.snapshot(),promote(fixture.after));
  assert.equal(isFarmCertificateValid(fixture.proof,b),false);
  const before=b.snapshot(),proof=certifyFarm(b,fixture.proof);assert.ok(proof);
  assert.deepEqual(b.snapshot(),before);assert.equal(proof.rulesVersion,current);
  const attempt=b.attemptId;until(b,()=>b.attemptId>attempt);
  assert.equal(b.waveRecipeVersion,current);
  for(let i=0;i<80;i++)b.update(.025);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  const bad=structuredClone(fixture.before);bad.enemies[0].maxHp+=1;assert.equal(IdleBattle.restore(bad),undefined);
  const mislabeled=structuredClone(fixture.before);mislabeled.waveRecipeVersion=current;assert.equal(IdleBattle.restore(mislabeled),undefined);
});

test('rule-17 departure survives native session migration and reload, with one exact claim and fresh proofs',async()=>{
  const factory=new IDBFactory(),name='wave-progression-v17',now=86401000;
  const frozen=reserveOffline(restoreOffline(fixture.offline)!,now);
  const store=await openBattleStore(factory,name,()=>now);store.close();
  await new Promise<void>((resolve,reject)=>{const q=factory.open(name,1);q.onerror=()=>reject(q.error);q.onsuccess=()=>{
    const db=q.result,tx=db.transaction('saves','readwrite');
    tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:1000,paused:false,battle:fixture.before,offline:fixture.offline},'default');
    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
  };});
  let session=await BattleSession.open(await openBattleStore(factory,name,()=>now),{now:()=>now,locks:null});
  assert.equal(session.pendingReward!.amountUnits,frozen.pendingReward!.amountUnits);
  // Session selects a freshly proven farm; the in-flight battle stays exact.
  assert.equal(session.battle.farmWave,28);
  assert.deepEqual(session.battle.snapshot(),{...promote(fixture.before),farmWave:28});await session.close();
  session=await BattleSession.open(await openBattleStore(factory,name,()=>now),{now:()=>now,locks:null});
  const wallet=session.battle.gold*1000+session.battle.goldRemainderUnits;
  assert.equal(await session.claimOffline(),true);assert.equal(await session.claimOffline(),false);
  assert.equal(session.battle.gold*1000+session.battle.goldRemainderUnits,wallet+frozen.pendingReward!.amountUnits);
  assert.equal(await session.resumeActive(),true);
  assert.equal(session.offline.baseline.certificate!.rulesVersion,current);
  assert.equal(session.offline.baseline.efficiencyPermille,260);
  const fresh=restoreOffline(JSON.parse(JSON.stringify(session.offline)))!;assert.ok(fresh);
  const reserved=reserveOffline(fresh,now+86400000),id=reserved.pendingReward!.id;
  const claimed=claimOffline(reserved,id);assert.ok(claimed.amountUnits>0);assert.equal(claimOffline(claimed.state,id).amountUnits,0);
  await session.close();
});
