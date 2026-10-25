import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {IDBFactory} from 'fake-indexeddb';
import {openBattleStore} from '../src/save-store';
import {BattleSession} from '../src/battle-session';
import {towerSheet} from '../src/tower-atlas';
import {towerArt,towerMount,KEYS} from '../src/art';
import {stepIlyraMotion} from '../src/ilyra';
import {IdleBattle,BASE,STORMLIGHT,STORM_CHAIN,stats,upgradeCost,sellValue,waveCount,waveEnemy,BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION,type Enemy,type Shot} from '../src/battle';
import {certifyFarm,isFarmCertificateValid} from '../src/farming';
import {waveRecipe} from '../src/wave-recipes';
import {beginAbsence,createOfflineState,reserveOffline,claimOffline,restoreOffline} from '../src/offline';

/** Artificial unit fixture; the economy audit separately pays every purchase. */
export function veteran(){
 const b=new IdleBattle();b.update(4);b.gold=120000;b.highestCleared=40;b.bossVictories=1;b.secondBossVictories=1;
 assert.ok(b.buildWorkshop());assert.ok(b.researchFrost());b.update(.025);b.wispArrival.met=true;b.discovery='off';
 assert.ok(b.buildTavern(b.recommendedTavernPlot!));assert.ok(b.upgradeTavern());assert.ok(b.recruitIlyra());
 b.ilyra!.introduction='done';assert.ok(b.upgradeWorkshop());assert.ok(IdleBattle.restore(b.snapshot()));return b;
}
function researched(){const b=veteran();assert.ok(b.researchStorm());return b;}
function liveChain(){
 const b=researched();const pad=b.layout.towerPads.find(p=>p.id==='tower-02'&&b.canBuild(p.id,5))??b.layout.towerPads.find(p=>b.canBuild(p.id,5))!;
 assert.ok(b.build(pad.id,5));b.liveClearedWaves=[1,28];b.farmWave=28;b.mode='farm';(b as any).startAttempt();
 for(let i=0;i<12000;i++){b.update(.025);if(b.shots.some(s=>s.kind===5&&s.chainHits!.length>0))return b;}
 throw Error('No real chain hop observed');
}

test('research is a separate once-only paid unlock after wave 28 and Ilyra; upgrades remain unbounded',()=>{
 const b=veteran(),gold=b.gold;b.highestCleared=27;assert.equal(b.researchStorm(),false);b.highestCleared=40;
 b.ilyra!.introduction='cast';assert.equal(b.researchStorm(),false);b.ilyra!.introduction='done';
 b.gold=STORM_CHAIN.researchCost-1;assert.equal(b.researchStorm(),false);b.gold=gold;
 assert.ok(b.researchStorm());assert.equal(b.gold,gold-900);assert.equal(b.researchStorm(),false);
 const before=b.gold;assert.ok(b.build('tower-02',5));assert.equal(b.gold,before-170);const tower=b.towers.at(-1)!;
 b.gold=1000000;for(let i=1;i<23;i++){assert.ok(b.upgrade(tower.uid));}assert.equal(tower.level,23);assert.ok(upgradeCost(tower)>0);
 assert.ok(IdleBattle.restore(b.snapshot()));const refund=sellValue(tower),wallet=b.gold;assert.ok(b.sell(tower.uid));assert.equal(b.gold,wallet+refund);
});

test('a chain hits three distinct live targets, nearest first, with bounded range and 100/65/42 percent damage',()=>{
 const b=researched(),def={...BASE.enemies.Leafbug,armor:0};
 const enemy=(uid:number,x:number):Enemy=>({uid,x,y:100,hp:1000,maxHp:1000,def,distance:0,total:1,segment:0,speed:0,slowRemaining:0,direction:'side',flip:false,healCooldown:0,healRemaining:0,healLockout:0});
 b.enemies=[enemy(10,0),enemy(11,70),enemy(12,140),enemy(13,141),enemy(14,400)];
 const shot:Shot={uid:20,towerUid:1,target:10,x:0,y:100,speed:480,damage:100,level:1,kind:5,chainHits:[]};
 assert.equal((b as any).impact(shot,b.enemies[0]),true);assert.equal(shot.target,11);
 assert.equal((b as any).impact(shot,b.enemies[1]),true);assert.equal(shot.target,12);
 assert.equal((b as any).impact(shot,b.enemies[2]),false);
 assert.deepEqual(shot.chainHits,[10,11,12]);assert.deepEqual(b.enemies.map(e=>e.hp),[900,935,957.75,1000,1000]);
 const far={...shot,chainHits:[],target:14};assert.equal((b as any).impact(far,b.enemies[4]),false);
});

test('in-flight hops survive upgrade, sale and reload exactly; forged payloads and visited IDs are rejected',()=>{
 const b=liveChain(),shot=b.shots.find(s=>s.kind===5&&s.chainHits!.length>0)!,owner=b.towers.find(t=>t.uid===shot.towerUid)!;
 const damage=shot.damage;assert.ok(b.upgrade(owner.uid));assert.equal(shot.damage,damage);assert.ok(b.sell(owner.uid));
 const saved=b.snapshot(),clone=IdleBattle.restore(saved);assert.ok(clone);assert.deepEqual(clone.snapshot(),saved);
 const schema29:any=structuredClone(saved);schema29.schemaVersion=29;schema29.rulesVersion=15;schema29.waveRecipeVersion=15;delete schema29.tutorialFrostUid;
 assert.deepEqual(IdleBattle.restore(schema29)?.snapshot(),{...saved,waveRecipeVersion:15},'schema 29 retains active chain shots');
 const bad=structuredClone(saved),payload=bad.shots.find(s=>s.uid===shot.uid)!;payload.damage++;assert.equal(IdleBattle.restore(bad),undefined);
 for(const hits of [[shot.target],[1],Array(3).fill(shot.target)]){const invalid=structuredClone(saved);invalid.shots.find(s=>s.uid===shot.uid)!.chainHits=hits;assert.equal(IdleBattle.restore(invalid),undefined);}
 for(let i=0;i<100;i++){b.update(.025);clone.update(.025);}assert.deepEqual(clone.snapshot(),b.snapshot());
 assert.ok(IdleBattle.restore(b.snapshot()));
});

test('Mara accelerates the fifth tower without increasing its per-chain target or damage cap; armor still applies',()=>{
 const b=researched();assert.ok(b.build('tower-02',5));const t=b.towers.at(-1)!;
 const boosted={...t,level:12};assert.equal(stats(boosted).damage,STORMLIGHT.damage*(7.5*Math.pow(1.3,6)));
 assert.ok(b.assignMara(t.uid)); // Same targeting API as the other towers.
 const near={...b.enemies[0],uid:98,x:t.x,y:t.y+40,hp:1000,maxHp:1000,speed:0} as Enemy;
 b.enemies=[near];b.mara.x=t.x;b.mara.y=t.y;b.mara.path=[];b.mara.effectTowerUid=t.uid;b.mara.effectRemaining=5;b.mara.autoCast=false;
 t.cooldown=.5;b.update(.025);assert.ok(Math.abs(t.cooldown-(.5-.025*1.5))<1e-9);
 const target={...b.enemies[0],uid:99,hp:100,maxHp:100,def:BASE.enemies.Scorpion,x:100,y:100} as Enemy;
 const shot={uid:120,towerUid:t.uid,target:99,x:100,y:100,speed:480,damage:40,level:1,kind:5,chainHits:[]} as Shot;
 b.enemies=[target];(b as any).impact(shot,target);assert.equal(target.hp,100-40*(1-target.def.armor));assert.deepEqual(shot.chainHits,[99]);
});

test('new farm proofs exclude active heroes; historical receipts remain exactly once and recipes are unchanged',()=>{
 const b=researched();assert.ok(b.build('tower-02',5));b.liveClearedWaves=[1];
 const before=b.snapshot(),proof=certifyFarm(b);assert.ok(proof);assert.equal(proof.rulesVersion,BATTLE_RULES_VERSION);assert.ok(isFarmCertificateValid(proof,b));assert.deepEqual(b.snapshot(),before);
 const old={...proof,rulesVersion:14},absence=reserveOffline(beginAbsence(createOfflineState(1000),1000,old,false),31000);
 assert.ok(restoreOffline(absence));const id=absence.pendingReward!.id,first=claimOffline(absence,id);assert.ok(first.amountUnits>0);assert.equal(claimOffline(first.state,id).amountUnits,0);
 for(let wave=1;wave<=250;wave++){
  assert.equal(waveCount(wave,15),waveCount(wave,14));
  if(wave>=6&&wave!==15&&wave!==25)assert.deepEqual(waveRecipe(wave,15),waveRecipe(wave,14));
  else assert.deepEqual(Array.from({length:waveCount(wave,15)},(_,i)=>waveEnemy(wave,i,15)),Array.from({length:waveCount(wave,14)},(_,i)=>waveEnemy(wave,i,14)));
 }
});

test('schema 28 live queues and wallets migrate unchanged without granting research or rewriting shots',()=>{
 const old=JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/local-enemy-assets/merge-ready/view-wave54.json',import.meta.url),'utf8'));
 const b=IdleBattle.restore(old);assert.ok(b);assert.equal(b.settlement.stormResearched,false);assert.equal(b.isTowerUnlocked(5),false);
 assert.deepEqual(b.snapshot(),{...old,schemaVersion:BATTLE_SCHEMA_VERSION,tutorialFrostUid:null,rulesVersion:BATTLE_RULES_VERSION,settlement:{...old.settlement,stormResearched:false}});
 const forged=structuredClone(old);forged.towers[1].kind=5;assert.equal(IdleBattle.restore(forged),undefined);
});

test('research is atomic across a failed native save, then remains paid and owned after reopening',async()=>{
 const factory=new IDBFactory();let store=await openBattleStore(factory,'b16-research');await store.save(veteran().snapshot(),false,0);
 let live=await BattleSession.open(store,{locks:null});if(live.pendingReward)await live.claimOffline();await live.resumeActive();
 const before=live.battle.snapshot(),save=store.save.bind(store);store.save=async()=>{throw Error('controlled B16 write failure');};
 assert.equal(await live.command(b=>b.researchStorm(),true),false);assert.deepEqual(live.battle.snapshot(),before);store.save=save;
 await assert.rejects(live.close(),/controlled B16 write failure/);
 store=await openBattleStore(factory,'b16-research');live=await BattleSession.open(store,{locks:null});if(live.pendingReward)await live.claimOffline();await live.resumeActive();
 const gold=live.battle.gold;assert.ok(await live.command(b=>b.researchStorm(),true));assert.equal(live.battle.gold,gold-900);await live.close();
 store=await openBattleStore(factory,'b16-research');const result=await store.load();assert.equal(result.kind,'valid');
 if(result.kind==='valid'){const b=IdleBattle.restore(result.save.battle)!;assert.equal(b.settlement.stormResearched,true);assert.equal(b.gold,gold-900);assert.equal(b.researchStorm(),false);}store.close();
});

test('all three original art stages retain source frame maps, PNG dimensions and the shared floor anchor',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../../../public/assets/manifest.json',import.meta.url),'utf8'));
 for(const stage of [1,2,3])for(const role of ['Weapon','Projectile','Projectile - Impact'] as const){
  const sheet=towerSheet(5,stage,role),original=manifest[`Tower 05 - Level 0${stage} - ${role}`],png=readFileSync(fileURLToPath(sheet.url));
  assert.deepEqual(sheet.frameMap,original.frameMap);assert.equal(sheet.width,original.width);assert.equal(sheet.height,original.height);
  assert.equal(png.readUInt32BE(16),original.sheetWidth);assert.equal(png.readUInt32BE(20),original.sheetHeight);
  assert.ok(sheet.frameMap.every(i=>i>=0&&i<original.cols*original.rows));assert.equal(towerArt(5,stage).base,KEYS.stormTower);
 }
 assert.deepEqual(towerMount(5),towerMount(1));
});

test('Ilyra can retain the fifth tower as a sold volley source without counting chain damage twice',()=>{
 const b=researched();assert.ok(b.build('tower-02',5));const storm=b.towers.at(-1)!;
 while(storm.level<10)assert.ok(b.upgrade(storm.uid));
 assert.ok(b.moveIlyraTo({x:3,y:5}));for(let i=0;i<3000&&b.ilyra!.path.length;i++)stepIlyraMotion(b.ilyra!,.025);
 b.mode='farm';b.farmWave=6;b.liveClearedWaves=[1,6];(b as any).startAttempt();b.update(.9);
 assert.equal(b.ilyraPower.sourceKind,5);assert.equal(b.ilyraPower.damage,Math.round(1.5*stats(storm).damage/stats(storm).cooldown));
 assert.ok(b.castIlyraAt(b.enemies[0]));assert.ok(b.sell(storm.uid));const clone=IdleBattle.restore(b.snapshot());assert.ok(clone);
 const schema29:any=b.snapshot();schema29.schemaVersion=29;schema29.rulesVersion=15;schema29.waveRecipeVersion=15;delete schema29.tutorialFrostUid;
 assert.deepEqual(IdleBattle.restore(schema29)?.snapshot(),{...b.snapshot(),waveRecipeVersion:15},'schema 29 retains Ilyra sourceKind 5 after sale');
 for(let i=0;i<40;i++){b.update(.025);clone.update(.025);}assert.deepEqual(clone.snapshot(),b.snapshot());assert.equal(b.ilyra!.volley!.hit,true);
});
