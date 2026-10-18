import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { BASE, FROST, IdleBattle, SETTLEMENT } from '../src/battle';
import { cellCenter, createIdleLayout, findFootpath, getTowerApproachCells } from '../src/layout';
import { getForestBlockedCells } from '../src/forest-world';
import { validMara } from '../src/mara';
import { defenseFingerprint } from '../src/farming';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';

// Deliberate unit fixture; the earned timeline is checked alongside B10's run.
function eligible() {
  const b = new IdleBattle(); b.build('tower-03'); b.update(4);
  b.highestCleared = 15; b.bossVictories = 1; b.gold = 1200;
  return b;
}
const key = (p: {x:number;y:number}) => `${p.x},${p.y}`;

test('clearing purchase requires a real boss milestone and gold, charges once, preserves running combat', () => {
  const b = eligible(); b.bossVictories = 0;
  assert.equal(b.unlockClearing(), false); assert.equal(b.canBuild('tower-east-01'), false);
  b.bossVictories = 1; b.gold = 899; assert.equal(b.unlockClearing(), false);
  b.gold = 1200; const before = b.snapshot(), fingerprint = defenseFingerprint(b), route = b.layout.road;
  assert.equal(b.unlockClearing(), true); assert.equal(b.gold, 300); assert.equal(b.unlockClearing(), false);
  assert.equal(b.layout.bounds.columns, 32); assert.deepEqual(b.layout.road, route);
  const after = b.snapshot(); assert.notEqual(defenseFingerprint(b), fingerprint);
  assert.deepEqual({...after,gold:before.gold,layoutId:before.layoutId,clearing:before.clearing},before);
  assert.equal(b.canBuild('tower-east-01'), true);
  assert.deepEqual(IdleBattle.restore(after)!.snapshot(),after);
});

test('both new slots have useful level-one frost/damage overlap and accessible companion routes', () => {
  const old = createIdleLayout(), layout = createIdleLayout({unlockedColumns:32});
  const blocked = getForestBlockedCells(layout), oldBlocked = new Set(getForestBlockedCells(old).map(key));
  assert.ok(blocked.filter(c=>c.x<28).every(c=>oldBlocked.has(key(c))), 'opening must not add obstacles to existing Mara routes');
  const guard = cellCenter(layout, layout.towerPads.find(p=>p.id==='tower-08')!.cell);
  const road = layout.road.waypoints.map(c=>cellCenter(layout,c));
  for (const pad of layout.towerPads.filter(p=>p.availability==='east-clearing')) {
    const point=cellCenter(layout,pad.cell); let shared=0;
    for(let i=1;i<road.length;i++) {
      const a=road[i-1],z=road[i],length=Math.hypot(z.x-a.x,z.y-a.y);
      for(let d=1;d<length;d+=2) {
        const x=a.x+(z.x-a.x)*d/length,y=a.y+(z.y-a.y)*d/length;
        if(Math.hypot(x-point.x,y-point.y)<=FROST.range && Math.hypot(x-guard.x,y-guard.y)<=BASE.tower.range) shared+=2;
      }
    }
    assert.ok(shared>=40,`${pad.id}: ${shared} world pixels with the core guard`);
    assert.ok(getTowerApproachCells(layout,pad.id).some(c=>findFootpath(layout,layout.maraStart,c,blocked)));
    assert.deepEqual(layout.core,old.core);
  }
});

test('expanded battle with east towers and a moving Mara reloads exactly; forged region state is rejected', () => {
  const b=eligible(); b.unlockClearing();
  const a=b.build('tower-east-01')!,z=b.build('tower-east-02')!;
  assert.ok(a&&z); b.assignMara(z.uid); b.update(0.25);
  assert.ok(!b.mara.unreachable && b.mara.path.length>0);
  assert.ok(validMara(b.mara,b.towers,b.layout,getForestBlockedCells(b.layout)));
  const snap=b.snapshot(),restored=IdleBattle.restore(snap)!;
  assert.deepEqual(restored.snapshot(),snap);
  b.update(1);restored.update(1);assert.deepEqual(restored.snapshot(),b.snapshot());
  assert.equal(IdleBattle.restore({...snap,layoutId:'start28'}),undefined);
  assert.equal(IdleBattle.restore({...snap,bossVictories:0}),undefined);
  assert.equal(IdleBattle.restore({...snap,clearing:{unlocked:true,openedAt:snap.elapsed+1}}),undefined);
  assert.equal(IdleBattle.restore({...snap,clearing:{unlocked:false,openedAt:null}}),undefined);
});

test('schema-eight live save migrates closed without changing money, combat or boss progress', () => {
  const b=eligible(), modern=b.snapshot(), {clearing,...core}=modern;
  const old={...core,schemaVersion:8,rulesVersion:5,waveRecipeVersion:5}; const copy=structuredClone(old);
  const migrated=IdleBattle.restore(old)!;
  assert.deepEqual(migrated.snapshot(),{...modern,waveRecipeVersion:5});assert.deepEqual(old,copy);
  assert.equal(migrated.canBuild('tower-east-01'),false);
});

test('failed persistent clearing purchase rolls back geometry and gold; committed purchase survives IndexedDB reload', async () => {
  const factory=new IDBFactory();
  let store=await openBattleStore(factory,'b11-transaction');
  const b=eligible();await store.save(b.snapshot(),false,0);
  let live=await BattleSession.open(store,{locks:null});
  if(live.pendingReward)await live.claimOffline();await live.resumeActive();
  const before=live.battle.snapshot(),save=store.save.bind(store);
  store.save=async()=>{throw new Error('controlled write failure');};
  assert.equal(await live.command(b=>b.unlockClearing()),false);
  assert.deepEqual(live.battle.snapshot(),before);assert.equal(live.battle.layout.bounds.columns,28);
  store.save=save;await assert.rejects(live.close(),/controlled write failure/);
  store=await openBattleStore(factory,'b11-transaction');
  live=await BattleSession.open(store,{locks:null});
  if(live.pendingReward)await live.claimOffline();await live.resumeActive();
  const money=live.battle.gold;
  assert.equal(await live.command(b=>b.unlockClearing()),true);
  assert.equal(live.battle.gold,money-SETTLEMENT.clearingCost);
  await live.close();
  store=await openBattleStore(factory,'b11-transaction');
  const loaded=await store.load();assert.equal(loaded.kind,'valid');
  if(loaded.kind==='valid')assert.equal(IdleBattle.restore(loaded.save.battle)!.layout.bounds.columns,32);
  store.close();
});
