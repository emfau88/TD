import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, statSync } from 'node:fs';
import { IdleBattle, BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION, BASE, waveCount, waveEnemy, upgradeCost } from '../src/battle';
import { ENEMIES, ENEMY_ROSTER, introducedEnemy, isHealer } from '../src/enemy-roster';
import { waveRecipe, clearReward, spawnGap } from '../src/wave-recipes';
import { healthMultiplier, battleReward } from '../src/balance';
import { ENEMY_SHEETS, enemyFrame, enemyFlip } from '../src/enemy-art';
import { certifyFarm, isFarmCertificateValid } from '../src/farming';
import { createOfflineState, beginAbsence, reserveOffline, claimOffline, restoreOffline } from '../src/offline';
const read=(file:string)=>JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/'+file,import.meta.url),'utf8'));
const seed=read('wave-rework-v2/earned-balanced-late.json');
const added=['MossShroom','WoodSpider','HornedBat','EmberBomb'] as const;
function encounter(wave:number,version:12|13=13){
 const prep=IdleBattle.restore(seed)!.snapshot();prep.highestCleared=wave-1;prep.wave=wave-1;prep.phase='intermission';prep.mode='advance';prep.advanceRequested=false;prep.queue=[];prep.enemies=[];prep.shots=[];prep.intermissionRemaining=0;prep.spawnTimer=0;prep.lives=BASE.coreLives;prep.liveClearedWaves=prep.liveClearedWaves.filter(w=>w<wave);prep.farmWave=1;
 const b=IdleBattle.restore(prep)!;assert.ok(b);b.update(.025);
 const s=b.snapshot();s.waveRecipeVersion=version;s.enemies=[];s.shots=[];s.spawnTimer=.15;
 s.queue=Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version).id);
 return IdleBattle.restore(s)!;
}
test('rules 12 stay byte-for-byte reproducible against the captured original 100-wave table; opening 1–40 is unchanged',()=>{
 for(const row of read('wave-rework-v2/balance-results.json').recipes){
  const w=row.wave,expected=row.versions.find((r:{version:number})=>r.version===12),ids=Array.from({length:waveCount(w,12)},(_,i)=>waveEnemy(w,i,12));
  const counts:Record<string,number>={};for(const e of ids)counts[e.id]=(counts[e.id]??0)+1;
  assert.deepEqual(counts,expected.counts,`legacy composition ${w}`);
  assert.equal(ids.reduce((n,e)=>n+battleReward(e.gold,w,12),battleReward(clearReward(w,12),w,12)),expected.gold);
  assert.equal(.15+ids.slice(1).reduce((n,_,i)=>n+spawnGap(w,i+1,12),0),expected.spawnSeconds);
  if(w<=40){
   assert.deepEqual(Array.from({length:waveCount(w)},(_,i)=>waveEnemy(w,i).id),ids.map(e=>e.id));
   assert.equal(clearReward(w,13),clearReward(w,12));
   assert.equal(healthMultiplier(w,13,false),healthMultiplier(w,12,false));
   assert.deepEqual(ids.map((_,i)=>spawnGap(w,i+1,13)),ids.map((_,i)=>spawnGap(w,i+1,12)));
  }
 }
});
test('new introductions repeat immediately; later recipes retain all sixteen species, two healer and 28 enemy caps',()=>{
 assert.equal(ENEMY_ROSTER.length,17);
 for(const id of added){const w=ENEMIES[id].firstWave;assert.equal(introducedEnemy(w,12),undefined);assert.equal(introducedEnemy(w,13)?.id,id);
  for(const n of [w,w+1])assert.equal(waveRecipe(n).enemies.filter(e=>e===id).length,2,`${id} at ${n}`);
 }
 const expected=new Map<number,string>();
 for(let w=41;w<=250;w++){
  const r=waveRecipe(w);expected.set(w,JSON.stringify(r));
  assert.ok(r.enemies.length<=28&&r.enemies.length>=18);assert.ok(new Set(r.enemies).size<=3);
  assert.ok(r.enemies.every(id=>ENEMIES[id].firstWave<=w));assert.ok(r.enemies.filter(id=>isHealer(ENEMIES[id])).length<=2);
  assert.deepEqual(r.gaps,waveRecipe(w,12).gaps);
  const old=waveRecipe(w,12),gold=(recipe:typeof r)=>recipe.clearGold+recipe.enemies.reduce((sum,id)=>sum+ENEMIES[id].gold,0);assert.equal(gold(r),gold(old));
  if(w>41)assert.notEqual(JSON.stringify(r),expected.get(w-1));
 }
 for(let w=250;w>=41;w--)assert.equal(JSON.stringify(waveRecipe(w)),expected.get(w));
 for(let start=60;start<200;start+=17){
  const seen=new Set(Array.from({length:51},(_,i)=>waveRecipe(start+i).enemies).flat());
  for(const e of ENEMY_ROSTER.filter(e=>e.id!=='Rosenspiegel'))assert.ok(seen.has(e.id),`${e.id} missing after ${start}`);
 }
});
test('schema 26 live attempts retain exact queues, enemies, clocks and wallet, including waves after 40',()=>{
 for(const w of [40,53,125]){
  const old=encounter(w,12);assert.ok(old);old.update(3);const s=old.snapshot();
  const legacy={...s,schemaVersion:26,rulesVersion:12},before=structuredClone(legacy),b=IdleBattle.restore(legacy);assert.ok(b,`wave ${w}`);
  assert.deepEqual(legacy,before);assert.equal(b.waveRecipeVersion,12);assert.deepEqual(b.snapshot(),{...s,schemaVersion:BATTLE_SCHEMA_VERSION,rulesVersion:BATTLE_RULES_VERSION});
  for(let i=0;i<40;i++){old.update(.025);b.update(.025);}assert.deepEqual(b.snapshot(),old.snapshot());
  const bad=structuredClone(legacy);bad.queue[0]='MossShroom';assert.equal(IdleBattle.restore(bad),undefined);
  const hp=structuredClone(legacy);hp.enemies[0].maxHp++;assert.equal(IdleBattle.restore(hp),undefined);
 }
});
test('schema 26 already permits paid levels above 20; rules 12/13 HP above the old global cap reload exactly',()=>{
 const b=encounter(125,12);assert.ok(b);b.update(1);const s=b.snapshot(),t=s.towers[0];
 t.level=21;t.spent=0;for(let level=1;level<21;level++)t.spent+=upgradeCost({def:BASE.tower,level});
 assert.ok(s.enemies.some(e=>e.maxHp>850*100000));
 assert.ok(IdleBattle.restore({...s,schemaVersion:26,rulesVersion:12}));
 const bad=structuredClone(s);bad.towers[0].spent++;assert.equal(IdleBattle.restore(bad),undefined);
});
test('four compact atlases preserve metadata timings and genuine west views; cosmetic skins never change combat stats',()=>{
 let bytes=0;
 for(const id of added){const s=ENEMY_SHEETS[id],url=new URL(`../assets/local-monsters/${id}.png`,import.meta.url);bytes+=statSync(url).size;
  const meta=JSON.parse(readFileSync(new URL(`../assets/local-monsters/${id}-frames.json`,import.meta.url),'utf8'));
  assert.equal(meta.sourceSize,48);assert.equal(meta.sourceAngle,'top-down');assert.equal(meta.action,id==='HornedBat'?'Idle':'Walk');
  for(const dir of ['up','down','side','left'] as const){const clip=s.move[dir]!;assert.ok(clip.frames.length>=6);assert.equal(clip.frames.length,clip.durations.length);
   assert.deepEqual(clip.durations,meta.frames.filter((f:{direction:string})=>f.direction===dir).map((f:{source:{ms:number}})=>f.source.ms));
   assert.equal(enemyFlip(id,dir==='left'?'side':dir,dir==='left'),false);
  }
 }
 assert.ok(bytes<80000,`runtime atlases ${bytes} bytes`);
 for(const dir of ['up','down','side'] as const)for(const left of [true,false])for(const seconds of [0,.1,.7,3]){
  const red=enemyFrame('MossShroom',dir,seconds,left,0),green=enemyFrame('MossShroom',dir,seconds,left,1);
  assert.equal(green,red+32);assert.equal(enemyFrame('MossShroom',dir,seconds,left,2),red);
 }
});
test('every new species survives live save/reload deterministically; new farm proofs replace old rates without altering the model',()=>{
 for(const id of added){const b=encounter(ENEMIES[id].firstWave);assert.ok(b);b.update(4.5);assert.ok(b.enemies.some(e=>e.def.id===id));
  const restored=IdleBattle.restore(b.snapshot());assert.ok(restored);for(let i=0;i<300;i++){b.update(.025);restored.update(.025);}
  assert.deepEqual(restored.snapshot(),b.snapshot());
 }
 const b=IdleBattle.restore(seed)!;const old=read('wave-rework-v2/played-balanced.json').farm;
 assert.equal(isFarmCertificateValid(old,b),false);const before=b.snapshot(),proof=certifyFarm(b,old);assert.ok(proof&&isFarmCertificateValid(proof,b));assert.deepEqual(before,b.snapshot());
 assert.equal(proof.rulesVersion,13);
});
test('both historical rules-12 and current rules-13 offline receipts keep their exact amounts and one-claim boundary',()=>{
 for(const version of [12,13]){
  const proof={wave:29,rulesVersion:version,fingerprint:'departure',rewardGold:100,rewardRemainderUnits:250,durationMs:10000};
  const offline=reserveOffline(beginAbsence(createOfflineState(1000),1000,proof,false),31000);
  assert.ok(restoreOffline(offline));const receipt=offline.pendingReward!.id,claimed=claimOffline(offline,receipt);assert.equal(claimed.amountUnits,180450);assert.equal(claimOffline(claimed.state,receipt).amountUnits,0);
 }
});
