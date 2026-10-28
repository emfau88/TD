import { expectedCombatMigration, cleanupFixtures, checkOldContinuation } from './cleanup-fixtures';
import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {IDBFactory} from 'fake-indexeddb';
import {IdleBattle,BATTLE_SCHEMA_VERSION,BATTLE_RULES_VERSION} from '../src/battle';
import {waveRecipe} from '../src/wave-recipes';
import {ENEMIES} from '../src/enemy-roster';
import {certifyFarm,isFarmCertificateValid} from '../src/farming';
import {createOfflineState,beginAbsence,reserveOffline} from '../src/offline';
import {openBattleStore} from '../src/save-store';
import {BattleSession} from '../src/battle-session';
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/'+p,import.meta.url),'utf8'));
const seed=read('wave-rework-v2/earned-balanced-late.json');
const active=read('local-enemy-assets/merge-ready/historical-live46-v27.json');
test('only wave 46 changes under rules 14: retain a light escort, healer cap, exact cadence and total reward',()=>{
 for(let w=6;w<=250;w++){
  if(w===15||w===25)continue;
  const old=waveRecipe(w,13),now=waveRecipe(w,14);
  if(w!==46){assert.deepEqual(now,old,`unexpected recipe change ${w}`);continue;}
  const counts:Record<string,number>={};for(const id of now.enemies)counts[id]=(counts[id]??0)+1;
  assert.deepEqual(counts,{Scorpion:7,WoodSpider:15,LanternJelly:2});assert.equal(old.enemies.filter(id=>id==='Scorpion').length,20);
  assert.equal(now.enemies.length,old.enemies.length);assert.deepEqual(now.gaps,old.gaps);
  const gold=(r:typeof now)=>r.clearGold+r.enemies.reduce((sum,id)=>sum+ENEMIES[id].gold,0);assert.equal(gold(now),gold(old));
 }
});
test('a genuine schema-27 wave 46 keeps its old tank-heavy queue and live values, then adopts rules 14',()=>{
 const original=structuredClone(active),b=IdleBattle.restore(original);assert.ok(b);assert.deepEqual(original,active);
 assert.equal(b.waveRecipeVersion,13);assert.deepEqual(b.snapshot(),expectedCombatMigration(active));
 const clone=IdleBattle.restore(b.snapshot())!;for(let i=0;i<100;i++){b.update(.025);clone.update(.025);}assert.deepEqual(b.snapshot(),clone.snapshot());
 const bad=structuredClone(active);bad.queue[0]='WoodSpider';assert.equal(IdleBattle.restore(bad),undefined);
 const corrupt=structuredClone(active);corrupt.enemies[0].maxHp++;assert.equal(IdleBattle.restore(corrupt),undefined);
 const attempt=b.attemptId;for(let i=0;i<8000&&b.attemptId===attempt;i++)b.update(.025);
 assert.ok(b.attemptId>attempt);assert.equal(b.waveRecipeVersion,BATTLE_RULES_VERSION);assert.ok(IdleBattle.restore(b.snapshot()));
});
test('raw restore re-proves saved farm 29 even without a departure certificate, with no live model or reward mutation',()=>{
 const b=IdleBattle.restore(seed)!;assert.equal(b.farmWave,29);const before=b.snapshot(),events=structuredClone(b.events);
 const proof=certifyFarm(b);assert.ok(proof);assert.equal(proof.wave,29);assert.equal(proof.rulesVersion,BATTLE_RULES_VERSION);assert.ok(isFarmCertificateValid(proof,b));
 assert.deepEqual(b.snapshot(),before);assert.deepEqual(b.events,events);
 const invalid={...proof,wave:999,fingerprint:'untrusted-old-proof'};
 assert.equal(certifyFarm(b,invalid)?.wave,29);assert.deepEqual(b.snapshot(),before);
});
test('entry fallback recovers safe recent wave 38; harmful sales still invalidate higher farm proofs',()=>{
 const b=IdleBattle.restore({...seed,farmWave:1})!,proof=certifyFarm(b);assert.ok(proof);assert.equal(proof.wave,38);assert.ok(isFarmCertificateValid(proof,b));
 const c=IdleBattle.restore(seed)!,previous=certifyFarm(c)!;for(const t of [...c.towers])if(!t.protected)c.sell(t.uid);
 assert.equal(isFarmCertificateValid(previous,c),false);const safe=certifyFarm(c,previous);assert.ok(safe);assert.equal(safe.wave,1);assert.ok(isFarmCertificateValid(safe,c));
});
test('native schema-27 reload retains its rules-13 offline claim and credits the exact amount once',async()=>{
 const factory=new IDBFactory(),name='e01-merge-v27',now=31000;
 let store=await openBattleStore(factory,name,()=>now);store.close();
 const oldProof={wave:29,rulesVersion:13,fingerprint:'historical-departure',rewardGold:100,rewardRemainderUnits:250,durationMs:10000};
 const offline=reserveOffline(beginAbsence(createOfflineState(1000),1000,oldProof,false),now);
 await new Promise<void>((resolve,reject)=>{const r=factory.open(name,1);r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:now,paused:false,battle:active,offline},'default');tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};});
 store=await openBattleStore(factory,name,()=>now);const session=await BattleSession.open(store,{now:()=>now,ownerId:'merge-v27',locks:null});
 assert.equal(session.battle.waveRecipeVersion,13);assert.deepEqual(session.battle.snapshot().queue,active.queue);
 assert.equal(session.certificate?.rulesVersion,BATTLE_RULES_VERSION);assert.ok(isFarmCertificateValid(session.certificate!,session.battle));
 assert.equal(session.pendingReward?.amountUnits,180450);const units=session.battle.gold*1000+session.battle.goldRemainderUnits;
 assert.equal(await session.claimOffline(),true);assert.equal(session.battle.gold*1000+session.battle.goldRemainderUnits-units,180450);
 assert.equal(await session.claimOffline(),false);await session.close();
});
