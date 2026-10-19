import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {IDBFactory} from 'fake-indexeddb';
import {IdleBattle} from '../src/battle';
import {BattleSession} from '../src/battle-session';
import {openBattleStore} from '../src/save-store';
import {currentGoal} from '../src/progress-ui';
import {tutorialStep} from '../src/hud';
import {wispPose} from '../src/wisp';
import {cellCenter} from '../src/layout';
import {certifyFarm} from '../src/farming';
const opening=JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/onboarding/menu-guide/browser.json','utf8')).final.battle;
function until(b:IdleBattle, condition:()=>boolean){for(let i=0;i<12000&&!condition();i++)b.update(.025);assert.ok(condition(),`${b.discovery}: wave ${b.wave}`);}
function restored(b:IdleBattle){const next=IdleBattle.restore(b.snapshot());assert.ok(next);assert.deepEqual(next.snapshot(),b.snapshot());return next;}
function atWisp(){const b=IdleBattle.restore(opening)!;assert.equal(b.discovery,'wisp');until(b,()=>b.discoveryPaused);assert.equal(b.highestCleared,5);return b;}

test('Wisp pauses at the wave boundary; real Mara cast, countdown and optional purchases follow in order',()=>{
 let b=atWisp();assert.equal(b.lives,20);assert.equal(b.phase,'intermission');assert.equal(currentGoal(b).action,'wisp');
 const elapsed=b.elapsed,gold=b.gold;b.update(20);assert.equal(b.elapsed,elapsed);assert.equal(b.gold,gold);b=restored(b);
 assert.ok(certifyFarm(b),'discovery pause must not enter farm proofs');
 assert.equal(b.meetWisp(),true);assert.equal(b.meetWisp(),false);assert.equal(b.gold,gold);assert.equal(b.discovery,'mara-wait');
 const beforeAnnouncement=b.snapshot();b.update(10);assert.equal(b.elapsed,beforeAnnouncement.elapsed);assert.equal(b.mara.cooldownRemaining,beforeAnnouncement.mara.cooldownRemaining);assert.equal(b.castMaraNow(),false);b=restored(b);
 b.continueDiscovery();assert.equal(b.discovery,'mara-ready');until(b,()=>b.discovery==='mara-effect');assert.equal(b.mara.effectRemaining,8);assert.equal(b.mara.cooldownRemaining,30);assert.equal(currentGoal(b).action,'mara');
 b=restored(b);b.update(3);assert.ok(b.mara.effectRemaining>4.9&&b.mara.effectRemaining<5.1);b=restored(b);
 until(b,()=>b.discovery==='mara-controls');assert.equal(b.mara.effectRemaining,0);b.continueDiscovery();assert.equal(b.discovery,'cannon');
 assert.ok(b.build(b.recommendedCannonPad!,3));b.update(.025);assert.equal(b.discovery,'warehouse');
 // Normal earned-gold upgrades, no money/time injection.
 until(b,()=>{if(b.towers[0].level<4)b.upgrade(b.towers[0].uid);return b.warehouseUnlocked});
 assert.equal(b.learningPaused,false);assert.equal(currentGoal(b).action,'warehouse');
 b.dismissDiscovery();assert.equal(b.discovery,'done');assert.equal(b.settlement.warehouseBuilt,false);assert.notEqual(currentGoal(b).action,'warehouse');restored(b);
});

test('optional Mara and cannon lessons can be deferred; old Mara hint maps to Mara, never the clearing',()=>{
 const b=atWisp();b.meetWisp();b.dismissDiscovery();assert.equal(b.discovery,'cannon');
 b.dismissDiscovery();assert.equal(b.discovery,'warehouse');assert.notEqual(tutorialStep(b),8);
 b.discovery='off';b.tutorial.seen &= ~(1<<15);assert.equal(tutorialStep(b),15);assert.equal(currentGoal(b).action,'mara');
 const invalid:any=b.snapshot();invalid.discovery='mara-start';invalid.mara.effectRemaining=0;invalid.mara.effectTowerUid=null;assert.equal(IdleBattle.restore(invalid),undefined);
});

test('Wisp learning pause survives absence without offline reward or repeated greeting',async()=>{
 const factory=new IDBFactory();let now=1000;let store=await openBattleStore(factory,'discovery-return',()=>now);
 const writer=(await store.acquireWriter('fixture'))!;await store.save(atWisp().snapshot(),false,0,{writer});await store.releaseWriter(writer);store.close();
 store=await openBattleStore(factory,'discovery-return',()=>now);let live=await BattleSession.open(store,{now:()=>now,locks:null});
 assert.equal(live.awaitingResume,false);assert.equal(live.battle.learningPaused,true);const gold=live.battle.gold;await live.close();now+=3600000;
 store=await openBattleStore(factory,'discovery-return',()=>now);live=await BattleSession.open(store,{now:()=>now,locks:null});
 assert.equal(live.awaitingResume,false);assert.equal(live.pendingReward,null);assert.equal(live.battle.gold,gold);
 await live.command(b=>b.meetWisp());assert.equal(live.battle.discovery,'mara-wait');assert.equal(live.battle.learningPaused,true);await live.command(b=>b.continueDiscovery());assert.equal(live.battle.learningPaused,false);await live.close();
});

test('schema 16 veteran preserves all saved fields without a new compulsory lesson',()=>{
 const b=atWisp();b.meetWisp();b.discovery='off';const old:any=b.snapshot();delete old.discovery;delete old.dismissedDefeatAttempt;old.schemaVersion=16;
 const copy=structuredClone(old), next=IdleBattle.restore(old)!;assert.ok(next);assert.equal(next.discovery,'off');
 const actual:any=next.snapshot();delete actual.discovery;delete actual.dismissedDefeatAttempt;actual.schemaVersion=16;assert.deepEqual(actual,copy);assert.deepEqual(old,copy);
});


test('dismissed defeat stays dismissed after reload; schema 17 migrates without losing gold',()=>{
 const b=new IdleBattle();for(let i=0;i<20000&&!b.progress.lastDefeat;i++)b.update(.025);
 assert.ok(b.progress.lastDefeat);b.dismissedDefeatAttempt=b.progress.lastDefeat.attemptId;
 const next=restored(b);assert.equal(next.dismissedDefeatAttempt,next.progress.lastDefeat!.attemptId);
 const old:any=b.snapshot();delete old.dismissedDefeatAttempt;old.schemaVersion=17;
 const migrated=IdleBattle.restore(old)!;assert.ok(migrated);assert.equal(migrated.dismissedDefeatAttempt,0);assert.equal(migrated.gold,b.gold);
 const bad=b.snapshot();bad.dismissedDefeatAttempt=b.attemptId+1;assert.equal(IdleBattle.restore(bad),undefined);
});


test('Wisp arrives from the core side along the walkable route',()=>{
 const b=atWisp(),start=wispPose(b.layout,b.wispArrival.at!,false,b.wispArrival.at),core=cellCenter(b.layout,b.layout.core);
 assert.equal(start.arriving,true);assert.equal(Math.hypot(start.x-core.x,start.y-core.y),b.layout.cellSize);
 const later=wispPose(b.layout,b.wispArrival.at!+2,false,b.wispArrival.at);
 assert.ok(later.x<start.x);assert.equal(later.arriving,true);
 assert.equal(wispPose(b.layout,b.wispArrival.at!+60,false,b.wispArrival.at).arriving,false);
});
