import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { IdleBattle, BASE, BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION, waveCount, waveEnemy } from '../src/battle';
import { ENEMIES, ENEMY_ROSTER, isHealer, JELLY_HEAL } from '../src/enemy-roster';
import { waveRecipe, spawnGap, clearReward } from '../src/wave-recipes';
import { healthMultiplier } from '../src/balance';
import { ENEMY_SHEETS, enemyFrame, enemyFlip, enemyHealFrame } from '../src/enemy-art';
import { createOfflineState, beginAbsence, reserveOffline, claimOffline } from '../src/offline';
import { IDBFactory } from 'fake-indexeddb';
import { openBattleStore } from '../src/save-store';
import { BattleSession } from '../src/battle-session';
const old=JSON.parse(readFileSync(new URL('./fixtures/waves-v24.json',import.meta.url),'utf8'));
const oldRecipes: {wave:number;enemies:string}[]=JSON.parse(readFileSync(new URL('./fixtures/wave-recipes-v10.json',import.meta.url),'utf8'));
const ids=(wave:number,version:number=BATTLE_RULES_VERSION)=>Array.from({length:waveCount(wave,version)},(_,i)=>waveEnemy(wave,i,version).id);

test('all forty historical recipes remain exact; entry, bosses, HP and old spawn clocks stay intact',()=>{
  for(const row of oldRecipes){
    assert.equal(ids(row.wave,10).join(','),row.enemies,`historical wave ${row.wave}`);
    for(let n=1;n<=waveCount(row.wave,10);n++)assert.equal(spawnGap(row.wave,n,10),row.wave>=6?(n%3===0?1.65:.32):Math.max(.75,1.2-(row.wave-1)*.025));
    assert.equal(clearReward(row.wave,10),Math.min(250,20+row.wave*2));
    assert.equal(healthMultiplier(row.wave,11,false),healthMultiplier(row.wave,10,false));
    if(row.wave<=5||row.wave===15||row.wave===25)assert.equal(ids(row.wave).join(','),row.enemies);
  }
});

test('opening recipes are reproducible in reverse order, bounded, readable and repeat every introduction promptly',()=>{
  const signatures=new Map<number,string>();const families=new Set<string>();
  for(let wave=6;wave<=40;wave++){
    if(wave===15||wave===25)continue;
    const r=waveRecipe(wave);signatures.set(wave,JSON.stringify(r));families.add(r.family);
    assert.ok(r.enemies.length<=28&&r.enemies.length>=6);
    assert.ok(new Set(r.enemies).size<=3,`types in wave ${wave}`);
    assert.ok(r.enemies.filter(id=>isHealer(ENEMIES[id])).length<=2);
    for(const id of r.enemies)assert.ok(ENEMIES[id].firstWave<=wave);
    assert.ok(r.gaps.every(gap=>gap>=.25&&gap<=1.65));
    const previous=signatures.get(wave-1);if(previous)assert.notEqual(JSON.stringify(r),previous);
    if(previous){
      const p=waveRecipe(wave-1),counts=(list:readonly string[])=>new Map([...new Set(list)].map(id=>[id,list.filter(x=>x===id).length/list.length]));
      const a=counts(p.enemies),b=counts(r.enemies),overlap=[...a].reduce((sum,[id,n])=>sum+Math.min(n,b.get(id)??0),0);
      const gap=(values:readonly number[])=>values.reduce((sum,n)=>sum+n,0)/values.length;
      assert.ok(overlap<.9||Math.max(gap(p.gaps),gap(r.gaps))/Math.min(gap(p.gaps),gap(r.gaps))>1.2,`near-identical adjacent waves ${wave-1}/${wave}`);
    }
  }
  assert.equal(families.size,4);assert.equal(waveRecipe(40).elite,true);
  for(let wave=40;wave>=6;wave--)if(signatures.has(wave))assert.equal(JSON.stringify(waveRecipe(wave)),signatures.get(wave));
  for(const e of ENEMY_ROSTER.filter(e=>e.firstWave>=6&&e.id!=='Rosenspiegel')){
    assert.equal(ids(e.firstWave).filter(id=>id===e.id).length,e.firstWave===46?15:2,e.name);
    const next=[e.firstWave+1,e.firstWave+2,e.firstWave+3].filter(w=>w!==15&&w!==25).slice(0,2);
    assert.ok(next.some(w=>ids(w).includes(e.id)),`${e.name} repeated`);
    let absence=0;
    for(let wave=e.firstWave;wave<=40;wave++)if(wave!==15&&wave!==25){absence=ids(wave).includes(e.id)?0:absence+1;assert.ok(absence<=9,`${e.name} disappears before wave ${wave}`);}
  }
  assert.ok(ids(10).includes('Firewasp'));assert.ok(ids(17).includes('Firewasp'));
  assert.ok(new Set([...signatures.keys()].filter(w=>w>=10).map(w=>waveRecipe(w).gaps.join(','))).size>=8);
  const lagFour=[...signatures.keys()].filter(w=>signatures.has(w-4));
  assert.ok(lagFour.filter(w=>waveRecipe(w).family!==waveRecipe(w-4).family).length>lagFour.length/2);
});

test('a genuine v24 live queue, healed targets, timer, projectiles, wallet and actors survive exactly',()=>{
  const b=IdleBattle.restore(old);assert.ok(b);
  const s=b.snapshot();assert.equal(s.schemaVersion,BATTLE_SCHEMA_VERSION);assert.equal(s.rulesVersion,BATTLE_RULES_VERSION);assert.equal(s.waveRecipeVersion,10);
  for(const key of ['queue','enemies','shots','towers','spawnTimer','gold','goldRemainderUnits','rewardRemainderUnits','earned','mara','ilyra','social','settlement','elapsed','bossCharm'] as const)assert.deepEqual(s[key],old[key],key);
  assert.deepEqual(s.liveClearedWaves,[]);assert.equal(s.farmWave,1);
  const bad=structuredClone(old);bad.queue[0]=bad.queue[0]==='Leafbug'?'Firebug':'Leafbug';assert.equal(IdleBattle.restore(bad),undefined);
  const badHp=structuredClone(old);badHp.enemies[0].maxHp+=1;assert.equal(IdleBattle.restore(badHp),undefined);
  b.update(.1);assert.ok(IdleBattle.restore(b.snapshot()));
  const attempt=b.attemptId;for(let i=0;i<8000&&b.attemptId===attempt;i++)b.update(.025);
  assert.ok(b.attemptId>attempt);assert.equal(b.waveRecipeVersion,BATTLE_RULES_VERSION);assert.ok(IdleBattle.restore(b.snapshot()));
});

test('both healer species share target locks, exclude each other and bosses, and resume their exact saved cast',()=>{
  const b=new IdleBattle();b.highestCleared=39;b.bossVictories=1;b.secondBossVictories=1;b.update(18);
  const cult=b.enemies.find(e=>e.def.id==='ForestCultist')!;assert.ok(cult);
  const jelly=b.enemies.find(e=>e.def.id==='BoneGuard')!;jelly.def=ENEMIES.LanternJelly;jelly.speed=jelly.def.speed;jelly.maxHp=jelly.def.hp*healthMultiplier(40,BATTLE_RULES_VERSION,false);jelly.hp=jelly.maxHp;
  const targets=b.enemies.filter(e=>!isHealer(e.def)&&Math.hypot(e.x-cult.x,e.y-cult.y)<=100).slice(0,2);assert.equal(targets.length,2);
  // A simultaneous cast at the same path position, rather than a different target set.
  Object.assign(jelly,{x:cult.x,y:cult.y,distance:cult.distance,segment:cult.segment,direction:cult.direction,flip:cult.flip});
  for(const e of b.enemies){e.hp=e.maxHp;e.healLockout=0;}
  for(const e of targets)e.hp=e.maxHp*.5;
  for(const h of [jelly,cult]){h.hp=h.maxHp*.5;h.healRemaining=.2;h.healCooldown=2;}
  const restored=IdleBattle.restore(b.snapshot());assert.ok(restored);assert.deepEqual(restored.snapshot(),b.snapshot());
  const before=targets.map(e=>e.hp);
  (b as unknown as {stepHealers(dt:number):void}).stepHealers(.2);
  (restored as unknown as {stepHealers(dt:number):void}).stepHealers(.2);
  assert.deepEqual(restored.snapshot(),b.snapshot());
  targets.forEach((e,i)=>{assert.equal(e.hp,before[i]+e.maxHp*JELLY_HEAL.fraction);assert.equal(e.healLockout,JELLY_HEAL.lockout);});
  for(const h of [jelly,cult])assert.equal(h.hp,h.maxHp*.5);
});

test('historical and current offline entitlements retain their exact amount and can only be claimed once',()=>{
  for(const rulesVersion of [10,11,12]){
    const certificate={wave:1,fingerprint:'historical-or-current',rulesVersion,rewardGold:100,durationMs:10000};
    let state=beginAbsence(createOfflineState(1000),1000,certificate,false);
    state=reserveOffline(state,61000);assert.ok(state.pendingReward);const rewardId=state.pendingReward.id;
    const first=claimOffline(state,rewardId);assert.equal(first.amountUnits,360000);
    const again=claimOffline(first.state,rewardId);assert.equal(again.amountUnits,0);
  }
});

test('native save boundary migrates v24 and pays its pending historical offline claim exactly once',async()=>{
  const factory=new IDBFactory(), name='wave-rework-v24';
  let store=await openBattleStore(factory,name,()=>31000);store.close();
  const offline=reserveOffline(beginAbsence(createOfflineState(1000),1000,{wave:24,rulesVersion:10,fingerprint:'v24-departure',rewardGold:100,durationMs:10000},false),31000);
  await new Promise<void>((resolve,reject)=>{const request=factory.open(name,1);request.onerror=()=>reject(request.error);request.onsuccess=()=>{
    const db=request.result,tx=db.transaction('saves','readwrite');tx.objectStore('saves').put({schemaVersion:2,revision:1,writtenAt:31000,paused:false,battle:structuredClone(old),offline},'default');
    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
  };});
  store=await openBattleStore(factory,name,()=>31000);const loaded=await store.load();assert.equal(loaded.kind,'valid');
  if(loaded.kind!=='valid')throw Error('v24 save was not loaded');
  assert.deepEqual(loaded.save.offline,offline);assert.deepEqual(loaded.save.battle.queue,old.queue);
  const session=await BattleSession.open(store,{now:()=>31000,ownerId:'wave-update',locks:null});
  assert.equal(session.certificate,null);assert.equal(session.battle.waveRecipeVersion,10);
  assert.equal(session.pendingReward?.amountUnits,180000);const before=session.battle.gold;
  assert.equal(await session.claimOffline(),true);assert.equal(session.battle.gold,before+180);
  assert.equal(await session.claimOffline(),false);await session.close();
});

test('three compact original atlases have real directional clips and stable nonmirrored left views',()=>{
  let bytes=0;
  for(const id of ['ForestGoblin','BoneGuard','ForestCultist'] as const){
    const sheet=ENEMY_SHEETS[id],png=readFileSync(new URL(`../assets/lucifer/${id}.png`,import.meta.url));bytes+=png.length;
    const cells=png.readUInt32BE(16)/64*png.readUInt32BE(20)/64;
    for(const dir of ['up','down','side'] as const){
      const clip=sheet.move[dir];assert.ok(clip.frames.length>=6);assert.equal(new Set(clip.frames).size,clip.frames.length);
      assert.ok(clip.frames.every(frame=>frame<cells));assert.equal(enemyFrame(id,dir,0),clip.frames[0]);
    }
    assert.ok(sheet.move.left);assert.notEqual(enemyFrame(id,'side',0,true),enemyFrame(id,'side',0,false));assert.equal(enemyFlip(id,'side',true),false);
    if(id==='ForestCultist')assert.notEqual(enemyHealFrame(id,'side',0),enemyFrame(id,'side',0));
  }
  assert.ok(bytes<30000,`Runtime PNGs: ${bytes} bytes`);
});
