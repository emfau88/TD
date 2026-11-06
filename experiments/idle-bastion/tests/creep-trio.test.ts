import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,statSync} from 'node:fs';
import {IdleBattle,BATTLE_RULES_VERSION,BATTLE_SCHEMA_VERSION,waveCount,waveEnemy} from '../src/battle';
import {ENEMIES,introducedEnemy} from '../src/enemy-roster';
import {ENEMY_SHEETS,enemyFrame,enemyFlip,slimeHop} from '../src/enemy-art';
import {waveRecipe,clearReward,spawnGap,enemyPressure} from '../src/wave-recipes';
import {healthMultiplier,battleRewardUnits} from '../src/balance';
import {certifyFarm,isFarmCertificateValid} from '../src/farming';
const ids=(w:number,v=BATTLE_RULES_VERSION as number)=>Array.from({length:waveCount(w,v)},(_,i)=>waveEnemy(w,i,v).id);
const read=(name:string)=>JSON.parse(readFileSync(new URL('../../../artifacts/creep-trio-2026-11-06/'+name,import.meta.url),'utf8'));
test('all 250 rules-20 waves retain their frozen queue, HP, clocks and clear gold',()=>{
 for(const r of read('baseline/waves.json')){
  assert.deepEqual(ids(r.wave,20),r.enemies);assert.equal(clearReward(r.wave,20),r.clearGold);
  assert.equal(healthMultiplier(r.wave,20,false),r.hp);
  assert.deepEqual(r.enemies.map((_:unknown,i:number)=>spawnGap(r.wave,i+1,20)),r.gaps);
 }
});
test('staged trio adds three early silhouettes without increasing counts, wave budgets or late pressure',()=>{
 for(const [wave,id]of [[3,'CobaltSlime'],[7,'FlameWisp'],[12,'FloatingEye']]as const){
  assert.equal(introducedEnemy(wave,21)?.id,id);assert.equal(introducedEnemy(wave,20)?.id,undefined);
  assert.equal(ids(wave).filter(x=>x===id).length,2);assert.ok(ids(wave+1).includes(id)||ids(wave+2).includes(id));
 }
 for(let w=1;w<=250;w++){
  const before=ids(w,20),after=ids(w);assert.equal(after.length,before.length);
  assert.deepEqual(after.map((_,i)=>spawnGap(w,i+1,21)),before.map((_,i)=>spawnGap(w,i+1,20)));
  const gold=(v:number)=>ids(w,v).reduce((s,id)=>s+ENEMIES[id].gold,clearReward(w,v));assert.equal(gold(21),gold(20));
  const paid=(v:number)=>ids(w,v).reduce((s,id)=>s+battleRewardUnits(ENEMIES[id].gold,w,v,true,false),battleRewardUnits(clearReward(w,v),w,v,true,false));
  assert.ok(Math.abs(paid(21)/paid(20)-1)<.01,`rounding W${w}`);
  if([1,2,15,25,36,40,45].includes(w))assert.deepEqual(after,before);
  if(w>25){
   const p=(v:number)=>ids(w,v).reduce((s,id)=>s+enemyPressure(id)*healthMultiplier(w,v,false),0);
   assert.ok(Math.abs(p(21)/p(20)-1)<1e-12,`pressure W${w}`);
   assert.equal(after.filter(id=>ENEMIES[id].flying).length,before.filter(id=>ENEMIES[id].flying).length,`air mix W${w}`);
  }
 }
 const early=Array.from({length:20},(_,i)=>ids(i+1)).flat();assert.equal(early.length,293);assert.equal(new Set(early).size,12);
 assert.ok(early.filter(id=>['Leafbug','Firebug','FlyingLocust'].includes(id)).length/early.length<.5);
});
test('each new creature survives live save/reload at entry and along the route',()=>{
 for(const w of [3,7,12]){
  let b=new IdleBattle();b.highestCleared=w-1;b.wave=w-1;b.intermissionRemaining=0;
  const seen=new Set<string>();
  for(let i=0;i<1200;i++){
   b.update(.025);b.enemies.forEach(e=>seen.add(e.def.id));
   if(i%17===0){const before=b.snapshot(),copy=IdleBattle.restore(before);assert.ok(copy,`W${w} tick${i}`);assert.deepEqual(copy.snapshot(),before);b=copy;}
   b.drainEvents();if(b.wave>w)break;
  }
  assert.ok(seen.has(introducedEnemy(w,21)!.id));
 }
});
test('old rule-20 combat is exact until the boundary and farm claims require a fresh proof',()=>{
 const s=read('baseline/mixed-fresh.json').snapshots.clear14;
 const b=IdleBattle.restore(s)!;assert.ok(b);assert.deepEqual(b.snapshot(),{...s,schemaVersion:BATTLE_SCHEMA_VERSION,rulesVersion:BATTLE_RULES_VERSION});
 const old=read('baseline/mixed-w14-24h.json').proof;assert.equal(isFarmCertificateValid(old,b),false);
 const before=b.snapshot(),proof=certifyFarm(b,old);assert.ok(proof);assert.equal(proof.rulesVersion,21);assert.deepEqual(b.snapshot(),before);
 b.update(3);assert.equal(b.waveRecipeVersion,21);assert.ok(IdleBattle.restore(b.snapshot()));
});
test('compact trio atlases provide all route directions and matching loop timings',()=>{
 for(const id of ['CobaltSlime','FlameWisp','FloatingEye']as const){
  const sheet=ENEMY_SHEETS[id],file=new URL('../assets/creep-trio/'+id+'.png',import.meta.url),bytes=readFileSync(file);
  const cols=bytes.readUInt32BE(16)/64,rows=bytes.readUInt32BE(20)/64;assert.ok(statSync(file).size<24000);
  for(const direction of ['down','up','side']as const){
   const clip=sheet.move[direction];assert.equal(clip.frames.length,id==='CobaltSlime'?6:8);assert.equal(clip.durations.length,clip.frames.length);
   let ms=0;for(let i=0;i<clip.frames.length;i++){assert.equal(enemyFrame(id,direction,ms/1000),clip.frames[i]);assert.ok(clip.frames[i]<cols*rows);ms+=clip.durations[i];}
   assert.equal(enemyFrame(id,direction,ms/1000),clip.frames[0]);
  }
  assert.equal(enemyFlip(id,'side',true),id==='CobaltSlime');
 }
 assert.equal(slimeHop(0),0);assert.equal(slimeHop(.42),7);assert.equal(slimeHop(.76),0);
});
