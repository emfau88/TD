import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {IDBFactory} from 'fake-indexeddb';
import {IdleBattle,BASE,EMBER,EMBER_BURN,BATTLE_RULES_VERSION,waveCount,waveEnemy,emberBurnDamage,stats,upgradeCost,type Enemy,type Shot} from '../src/battle';
import {towerSheet} from '../src/tower-atlas';
import {towerArt,KEYS} from '../src/art';
import {waveRecipe} from '../src/wave-recipes';
import {certifyFarm,defenseFingerprint,isFarmCertificateValid} from '../src/farming';
import {BattleSession} from '../src/battle-session';
import {openBattleStore} from '../src/save-store';
import {MARA} from '../src/mara';
const fixture=JSON.parse(readFileSync(new URL('./fixtures/wave-progression-v17.json',import.meta.url),'utf8'));
// Unit fixture only; economic probes use unmodified earned wallets and purchases.
function ready(){const b=IdleBattle.restore(fixture.before)!;assert.ok(b);b.gold=100000;b.highestCleared=34;return b;}
function built(level=5){
 const b=ready();assert.ok(b.researchEmber());
 const pad=[[5,5],[6,5],[9,5],[10,3]].map(([x,y])=>b.layout.towerPads.find(p=>p.cell.x===x&&p.cell.y===y)).find(p=>p&&b.canBuild(p.id,7));
 assert.ok(pad);const tower=b.build(pad.id,7)!;assert.ok(tower);while(tower.level<level)assert.ok(b.upgrade(tower.uid));return {b,tower};
}
function shot(towerUid=1,level=1):Shot{return {uid:2000,towerUid,target:1000,x:100,y:100,speed:480,damage:stats({def:EMBER,level}).damage,level,kind:7};}
function target(b:IdleBattle,uid:number,x=100,flying=false):Enemy{return {...b.enemies[0],def:flying?BASE.enemies.FlyingLocust:BASE.enemies.Scorpion,uid,x,y:100,hp:10000,maxHp:10000};}

test('ember research is a deliberate once-only payment after W34 and Workshop II; new marker does not require money',()=>{
 const b=ready();b.highestCleared=33;assert.equal(b.researchEmber(),false);assert.equal(b.inspectEmberResearch(),false);
 b.highestCleared=34;b.settlement.workshopUpgraded=false;assert.equal(b.researchEmber(),false);b.settlement.workshopUpgraded=true;
 b.gold=EMBER_BURN.researchCost-1;assert.equal(b.researchEmber(),false);assert.equal(b.emberResearchNew,true);
 const fingerprint=defenseFingerprint(b);assert.ok(b.inspectEmberResearch());assert.equal(b.emberResearchNew,false);assert.equal(defenseFingerprint(b),fingerprint);
 assert.equal(IdleBattle.restore(b.snapshot())!.settlement.emberResearchSeen,true);
 b.gold=EMBER_BURN.researchCost;assert.ok(b.researchEmber());assert.equal(b.gold,0);assert.equal(b.researchEmber(),false);assert.ok(b.isTowerUnlocked(7));
 assert.equal(b.towers.some(t=>t.def.id===7),false,'research does not grant a tower');
 b.gold=EMBER.cost;const pad=b.layout.towerPads.find(p=>b.canBuild(p.id,7))!;assert.ok(b.build(pad.id,7));assert.equal(b.gold,0);
 assert.ok(IdleBattle.restore(b.snapshot()));
});

test('ember area and targeting exclude flyers; armor affects direct hits and the one ongoing burn',()=>{
 const {b,tower}=built();const a=target(b,1000),fly=target(b,1001,110,true),outside=target(b,1002,131);
 b.enemies=[a,fly,outside];const s=shot(tower.uid);(b as any).impact(s,a);
 assert.equal(a.hp,10000-EMBER.damage*(1-a.def.armor));assert.equal(fly.hp,10000);assert.equal(fly.burn,undefined);assert.equal(outside.hp,10000);
 (b as any).stepBurns(1);assert.equal(a.hp,10000-(EMBER.damage+EMBER_BURN.damagePerSecond)*(1-a.def.armor));
 const onlyFly={...fly,x:tower.x,y:tower.y+40};b.enemies=[onlyFly];b.shots=[];tower.cooldown=0;b.update(.025);
 assert.equal(b.shots.some(s=>s.towerUid===tower.uid),false);
});

test('weaker burns neither stack nor refresh a stronger source; equal and stronger hits renew it',()=>{
 const {b,tower}=built();const e=target(b,1000);b.enemies=[e];(b as any).impact(shot(tower.uid,5),e);(b as any).stepBurns(1);
 assert.equal(e.burn!.remaining,2);(b as any).impact(shot(tower.uid,4),e);assert.equal(e.burn!.remaining,2);assert.equal(e.burn!.level,5);
 (b as any).impact(shot(tower.uid,6),e);assert.equal(e.burn!.level,6);assert.equal(e.burn!.remaining,3);
 (b as any).stepBurns(1);(b as any).impact(shot(tower.uid,6),e);assert.equal(e.burn!.remaining,3);
 const hp=e.hp;(b as any).stepBurns(5);assert.ok(Math.abs(e.hp-(hp-emberBurnDamage(6)*3*(1-e.def.armor)))<1e-8);assert.equal(e.burn,undefined);
});

test('burn kills pay once, retain attribution after sale and never pay for an already dead enemy',()=>{
 const {b,tower}=built();const e=target(b,1000);e.hp=1;e.burn={sourceUid:tower.uid,level:1,remaining:3};b.enemies=[e];
 const kills=b.kills,ownerKills=tower.kills;b.drainEvents();(b as any).stepBurns(1);(b as any).stepBurns(1);
 assert.equal(b.kills,kills+1);assert.equal(tower.kills,ownerKills+1);assert.equal(b.drainEvents().filter(e=>e.type==='kill').length,1);
 const sold=target(b,1001);sold.hp=1;sold.burn={sourceUid:tower.uid,level:1,remaining:3};b.enemies=[sold];assert.ok(b.sell(tower.uid));
 (b as any).stepBurns(1);assert.equal(b.kills,kills+2);assert.equal(b.drainEvents().filter(e=>e.type==='kill').length,1);
});

test('real burn and shot preserve fired level across upgrade, sale and exact reload; forged sources and levels fail',()=>{
 const {b,tower}=built();let active=false;
 for(let i=0;i<5000;i++){b.update(.025);b.drainEvents();if(b.enemies.some(e=>e.burn)){active=true;break;}}
 assert.ok(active,'original projectile actually ignites a living ground enemy');
 const savedLevel=b.enemies.find(e=>e.burn)!.burn!.level;assert.ok(b.upgrade(tower.uid));assert.ok(b.sell(tower.uid));
 assert.equal(b.enemies.find(e=>e.burn)!.burn!.level,savedLevel);
 const saved=b.snapshot(),copy=IdleBattle.restore(saved);assert.ok(copy);assert.deepEqual(copy.snapshot(),saved);
 for(const mutate of [(e:any)=>e.burn.remaining=4,(e:any)=>e.burn.level=0,(e:any)=>e.burn.sourceUid=e.uid]){
  const bad=structuredClone(saved);mutate(bad.enemies.find(e=>e.burn));assert.equal(IdleBattle.restore(bad),undefined);
 }
 const original=structuredClone(saved);for(let i=0;i<240;i++){b.update(.025);copy.update(.025);}assert.deepEqual(copy.snapshot(),b.snapshot());assert.deepEqual(saved,original);
 assert.ok(IdleBattle.restore(b.snapshot()));
});

test('original ember artwork has complete weapons, shared fireball and impact; W1â€“250 recipes stay identical',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../../../public/assets/manifest.json',import.meta.url),'utf8'));
 for(const stage of [1,2,3])for(const role of ['Weapon','Projectile','Projectile - Impact'] as const){
  const sheet=towerSheet(7,stage,role),name=`Tower 07 - Level ${role==='Weapon'?'0'+stage:'X'} - ${role}`;
  const png=readFileSync(fileURLToPath(sheet.url));assert.equal(sheet.width,manifest[name].width);assert.deepEqual(sheet.frameMap,manifest[name].frameMap);
  assert.equal(png.readUInt32BE(16),manifest[name].sheetWidth);assert.equal(png.readUInt32BE(20),manifest[name].sheetHeight);assert.equal(towerArt(7,stage).base,KEYS.emberTower);
 }
 for(let w=1;w<=250;w++){assert.equal(waveCount(w,19),waveCount(w,18));if(w>=6&&w!==15&&w!==25)assert.deepEqual(waveRecipe(w,19),waveRecipe(w,18));else for(let i=0;i<waveCount(w,18);i++)assert.deepEqual(waveEnemy(w,i,19),waveEnemy(w,i,18));}
});

test('ember purchases and seen status are atomic on native save failure and persist once on success',async()=>{
 const factory=new IDBFactory(),name='ember-atomic';let store=await openBattleStore(factory,name);await store.save(ready().snapshot(),false,0);
 let live=await BattleSession.open(store,{locks:null});if(live.pendingReward)await live.claimOffline();await live.resumeActive();
 const before=live.battle.snapshot(),save=store.save.bind(store);store.save=async()=>{throw Error('ember save failure');};
 assert.equal(await live.command(b=>b.researchEmber(),true),false);assert.deepEqual(live.battle.snapshot(),before);store.save=save;await assert.rejects(live.close(),/ember save failure/);
 store=await openBattleStore(factory,name);live=await BattleSession.open(store,{locks:null});if(live.pendingReward)await live.claimOffline();await live.resumeActive();
 const gold=live.battle.gold;assert.ok(await live.command(b=>b.researchEmber(),true));await live.close();
 store=await openBattleStore(factory,name);const loaded=await store.load();assert.equal(loaded.kind,'valid');
 if(loaded.kind==='valid'){const b=IdleBattle.restore(loaded.save.battle)!;assert.equal(b.gold,gold-EMBER_BURN.researchCost);assert.ok(b.settlement.emberResearched);assert.ok(b.settlement.emberResearchSeen);assert.equal(b.researchEmber(),false);}store.close();
});

test('ember farms are proven with saved burns and no active heroes, without changing the source battle',()=>{
 const {b}=built(8);b.liveClearedWaves=[1,20,30];b.farmWave=20;
 const before=b.snapshot(),proof=certifyFarm(b);assert.ok(proof);assert.equal(proof.rulesVersion,BATTLE_RULES_VERSION);assert.ok(isFarmCertificateValid(proof,b));assert.deepEqual(b.snapshot(),before);
});

test('Mara does not spend automatic overclock on flyers that her ember tower cannot attack',()=>{
 for(const flying of [true,false]){
  const {b,tower}=built();b.discovery='off';
  Object.assign(b.mara,{x:tower.x,y:tower.y+40,path:[],targetTowerUid:tower.uid,unreachable:false,autoCast:true,cooldownRemaining:0,effectRemaining:0,effectTowerUid:null});
  const enemy=target(b,1000,tower.x,flying);enemy.y=tower.y;b.enemies=[enemy];b.update(BASE.stepSeconds);
  assert.equal(b.mara.effectRemaining,flying?0:MARA.duration);assert.equal(b.mara.cooldownRemaining,flying?0:MARA.cooldown);
 }
});

test('Ilyra can retain an ember source through sale and reload without multiplying its burn into her volley',()=>{
 const {b,tower}=built(13);assert.equal(b.ilyraPower.sourceKind,7);const direct=stats(tower);
 assert.equal(b.ilyraPower.damage,Math.round(1.5*direct.damage/direct.cooldown));b.ilyra!.autoCast=false;
 let cast=false;for(let n=0;n<8000;n++){b.update(BASE.stepSeconds);const enemy=b.enemies.find(e=>b.canCastIlyra(e));if(enemy){cast=b.castIlyraAt(enemy);break;}}
 assert.ok(cast);assert.equal(b.ilyra!.volley!.sourceKind,7);const damage=b.ilyra!.volley!.damage;assert.ok(b.sell(tower.uid));
 const saved=b.snapshot(),restored=IdleBattle.restore(saved);assert.ok(restored);assert.equal(restored.ilyra!.volley!.damage,damage);
 const bad=structuredClone(saved);bad.ilyra!.volley!.sourceKind=6 as any;assert.equal(IdleBattle.restore(bad),undefined);
 const unowned=structuredClone(saved);unowned.settlement.emberResearched=false;assert.equal(IdleBattle.restore(unowned),undefined);
 for(let n=0;n<80;n++){b.update(BASE.stepSeconds);restored.update(BASE.stepSeconds);}assert.deepEqual(restored.snapshot(),b.snapshot());
});
