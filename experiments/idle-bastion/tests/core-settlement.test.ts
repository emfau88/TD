import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { CORE_PLOTS, CORE_TAVERN_PLOT, FUTURE_EAST_CORRIDOR, battleLayout, cellsInRect, findFootpath, rectContains, validateLayout } from '../src/layout';
import { getForestBlockedCells } from '../src/forest-world';
import { certifyFarm } from '../src/farming';
import { wispPose } from '../src/wisp';

const published = () => JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/b15/fixture.json', 'utf8'));
function veteran() {
  const b = IdleBattle.restore(published())!; assert.ok(b);
  assert.ok(b.buildTavern(b.recommendedTavernPlot!));
  b.gold += 1000; assert.ok(b.build('tower-east-01'));
  return b;
}

test('fresh core settlement preserves the west route and reserves the future east corridor', () => {
  const b = IdleBattle.newGame();
  assert.equal(b.layout.bounds.columns,40); assert.equal(b.layout.version,5);
  assert.deepEqual(validateLayout(b.layout),[]);
  assert.deepEqual(b.layout.road,battleLayout(false).road);
  assert.deepEqual(b.plots,CORE_PLOTS);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  for (const p of [...b.layout.plots.map(p => p.footprint),{...CORE_TAVERN_PLOT,width:3,height:2}])
    assert.ok(cellsInRect(p).every(c => !rectContains(FUTURE_EAST_CORRIDOR,c)));
  const blocked=getForestBlockedCells(b.layout);
  for(const plot of b.layout.plots) assert.ok(findFootpath(b.layout,{x:26,y:6},plot.entrance,blocked));
  assert.equal(b.canPositionBuilding('workshop',{x:32,y:6}),false);
});

test('published save retains its old settlement until an explicit free move; every owned actor survives reload', () => {
  const saved=published(), b=IdleBattle.restore(saved)!;
  assert.equal(b.layout.version,4);assert.deepEqual(b.plots,saved.plots);
  assert.equal(b.gold,saved.gold);assert.equal(b.eastAccessCredit,900);
  const full=veteran(), before=full.snapshot(), actors=full.towers.map(t=>[t.x,t.y]);
  assert.equal(full.relocateSettlement(),true);
  const after=full.snapshot();assert.equal(after.layoutVersion,5);assert.equal(after.layoutId,'core40');
  for(const field of ['gold','settlement','clearing','towers','enemies','shots','mara','progress','elapsed','wispArrival'] as const) assert.deepEqual(after[field],before[field],field);
  assert.deepEqual(full.towers.map(t=>[t.x,t.y]),actors);assert.equal(full.eastAccessCredit,900);
  assert.deepEqual(IdleBattle.restore(after)!.snapshot(),after);
  assert.equal(full.relocateSettlement(),false);
  for(const p of full.layout.plots) assert.ok(findFootpath(full.layout,{x:26,y:6},p.entrance,full.movementBlocked()));
  const pose=wispPose(full.layout,5,false,null);assert.ok(pose.x>=1160,'Wisp errands remain near the actual workshop');
  assert.ok(certifyFarm(full),'new map can certify the unchanged west defense');
});

test('all formerly open tower cells remain clear after the move', () => {
  const b=new IdleBattle(); b.gold=100000; b.update(.3);b.highestCleared=15;b.bossVictories=1;assert.ok(b.unlockClearing());
  const available=b.layout.towerPads.filter(p=>b.canBuild(p.id));
  assert.ok(b.relocateSettlement());
  for(const p of available) assert.ok(b.canBuild(p.id),p.id);
});

test('session requires pause, commits the whole relocation once and rolls back on storage failure', async()=>{
  const factory=new IDBFactory();let store=await openBattleStore(factory,'b17a-move');
  await store.save(veteran().snapshot(),false,0);
  let live=await BattleSession.open(store,{locks:null});
  if(live.pendingReward)await live.claimOffline();await live.resumeActive();
  assert.equal(await live.relocateSettlement(),false);await live.setPaused(true);
  const before=live.battle.snapshot(), save=store.save.bind(store);
  store.save=async()=>{throw new Error('controlled write failure');};
  assert.equal(await live.relocateSettlement(),false);assert.deepEqual(live.battle.snapshot(),before);
  store.save=save;await assert.rejects(live.close(),/controlled write failure/);
  store=await openBattleStore(factory,'b17a-move');live=await BattleSession.open(store,{locks:null});
  if(live.pendingReward)await live.claimOffline();await live.resumeActive();
  assert.equal(live.paused,true);assert.equal(await live.relocateSettlement(),true);
  const expected=live.battle.snapshot();assert.equal(await live.relocateSettlement(),false);await live.close();
  store=await openBattleStore(factory,'b17a-move');const loaded=await store.load();assert.equal(loaded.kind,'valid');
  if(loaded.kind==='valid'){assert.deepEqual(loaded.save.battle,expected);assert.equal(loaded.save.paused,true);}store.close();
});

test('a valid core position stays reachable and invalid mixed/overlapping snapshots are rejected',()=>{
  const b=veteran();assert.ok(b.relocateSettlement());assert.ok(b.positionBuilding('workshop',{x:30,y:10}));
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(),b.snapshot());
  const mixed=b.snapshot();mixed.plots.workshop={x:3,y:11};assert.equal(IdleBattle.restore(mixed),undefined);
  const overlap=b.snapshot();overlap.plots.warehouse={...overlap.plots.workshop};assert.equal(IdleBattle.restore(overlap),undefined);
});
