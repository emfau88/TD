import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { BASE, IdleBattle, SETTLEMENT } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifyFarm, defenseFingerprint, farmRewardUnits } from '../src/farming';
import { OFFLINE, WAREHOUSE_OFFLINE, activateOffline, beginAbsence, checkpointActive, claimOffline, createOfflineState, reserveOffline, restoreOffline } from '../src/offline';
import { wispPose } from '../src/wisp';
import { getForestBlockedCells } from '../src/forest-world';

// Earn the complete pre-purchase state through ordinary model actions only.
function earnedOpening() {
  const b = new IdleBattle(), archer = b.build('tower-03')!; b.assignMara(archer.uid);
  for (let step = 0; step < 14400; step++) {
    if (archer.level === 1) b.upgrade(archer.uid);
    if (!b.settlement.workshopBuilt) b.buildWorkshop();
    if (!b.settlement.frostResearched) b.researchFrost();
    if (!b.towers.some(t => t.def.id === 2)) b.build('tower-02', 2);
    if (!b.towers.some(t => t.def.id === 3)) b.build('tower-06', 3);
    if (b.highestCleared >= 5) for (const t of b.towers) if (t.level < 3) b.upgrade(t.uid);
    if (b.warehouseUnlocked && b.gold >= SETTLEMENT.warehouseCost) return b;
    b.update(BASE.stepSeconds); b.drainEvents();
  }
  assert.fail('Legal opening did not fund the warehouse within six minutes.');
}
const earned = earnedOpening();
const basis = certifyFarm(earned)!;
const HOUR = 3600000, START = 1000;
assert.ok(basis);

test('warehouse has real unlock and price gates; old saves retain combat and farm evidence', () => {
  const early = new IdleBattle(); early.gold = 650;
  assert.equal(early.buildWarehouse(), false);
  early.highestCleared = 8; assert.equal(early.buildWarehouse(), false, 'Wave alone is insufficient');
  const modern = earned.snapshot(), { warehouseBuilt, warehouseBuiltAt, ...settlement } = modern.settlement;
  const migrated = IdleBattle.restore({ ...modern, schemaVersion: 6, settlement })!;
  assert.ok(migrated); assert.deepEqual(migrated.liveClearedWaves, earned.liveClearedWaves);
  assert.deepEqual(migrated.snapshot(), modern);
  const fingerprint = defenseFingerprint(migrated), wallet = migrated.gold;
  migrated.gold = 649; assert.equal(migrated.buildWarehouse(), false); migrated.gold = wallet;
  assert.equal(migrated.buildWarehouse(), true);
  assert.equal(migrated.gold, wallet - 650); assert.equal(migrated.buildWarehouse(), false);
  assert.equal(defenseFingerprint(migrated), fingerprint, 'Offline building cannot invalidate battle evidence');
  assert.deepEqual(IdleBattle.restore(migrated.snapshot())!.snapshot(), migrated.snapshot());
  const invalid = migrated.snapshot(); invalid.settlement.warehouseBuiltAt = invalid.elapsed + 1;
  assert.equal(IdleBattle.restore(invalid), undefined);
});

test('old 60% / 2h absence stays frozen; warehouse policy begins at the next active boundary', () => {
  const start = beginAbsence(createOfflineState(START), START, basis, false);
  const preserved = beginAbsence(start, START + HOUR, basis, false, WAREHOUSE_OFFLINE);
  assert.deepEqual(preserved, start);
  const old = reserveOffline(preserved, START + 3 * HOUR);
  assert.equal(old.pendingReward!.efficiencyPermille, 600);
  assert.equal(old.pendingReward!.creditedMs, 2 * HOUR);
  const claimed = claimOffline(old, old.pendingReward!.id);
  const active = activateOffline(claimed.state, START + 3 * HOUR, basis, false, WAREHOUSE_OFFLINE);
  const next = reserveOffline(beginAbsence(active, START + 3 * HOUR, basis, false, WAREHOUSE_OFFLINE), START + 6 * HOUR);
  assert.equal(next.pendingReward!.efficiencyPermille, 650); assert.equal(next.pendingReward!.creditedMs, 3 * HOUR);
});

test('eight-hour cap survives repeated returns, reload and repeated claims; paused production remains zero', () => {
  let state = beginAbsence(createOfflineState(START), START, basis, false, WAREHOUSE_OFFLINE);
  state = reserveOffline(state, START + HOUR);
  const claimId = state.pendingReward!.id;
  state = restoreOffline(JSON.parse(JSON.stringify(state)))!;
  state = beginAbsence(state, START + 4 * HOUR, basis, false, WAREHOUSE_OFFLINE);
  state = reserveOffline(state, START + 12 * HOUR);
  assert.equal(state.pendingReward!.id, claimId); assert.equal(state.window!.usedMs, 8 * HOUR);
  const expected = Number(farmRewardUnits(basis) * 650n * BigInt(8 * HOUR) / (BigInt(basis.durationMs) * 1000n));
  assert.equal(state.pendingReward!.amountUnits, expected);
  const claimed = claimOffline(state, claimId);
  assert.equal(claimOffline(claimed.state, claimId).amountUnits, 0);
  const later = reserveOffline(restoreOffline(claimed.state)!, START + 20 * HOUR);
  assert.equal(later.pendingReward!.amountUnits, 0); assert.equal(later.window!.usedMs, 8 * HOUR);
  const paused = reserveOffline(beginAbsence(createOfflineState(START), START, basis, true, WAREHOUSE_OFFLINE), START + HOUR);
  assert.equal(paused.pendingReward!.amountUnits, 0);
  const bad = structuredClone(state); bad.baseline.limitMs = OFFLINE.limitMs;
  assert.equal(restoreOffline(bad), undefined, 'Mixed policy pairs are invalid');
});

test('legal opening buys warehouse; one controlled hour is paid once and funds two real upgrades after reload', async () => {
  let now = START;
  const factory = new IDBFactory(), name = 'b09-return';
  const store = await openBattleStore(factory, name, () => now);
  await store.save(earned.snapshot(), false, 0, { offline: checkpointActive(createOfflineState(now), now, basis, false) });
  let live = await BattleSession.open(store, { now: () => now, locks: null });
  if (live.pendingReward) await live.claimOffline();
  await live.resumeActive();
  await live.command(b => b.buildWarehouse());
  assert.equal(live.battle.settlement.warehouseBuilt, true);
  assert.equal(live.offline.baseline.efficiencyPermille, 650);
  const before = live.battle.gold * 1000 + live.battle.goldRemainderUnits, elapsed = live.battle.elapsed;
  const proof = live.certificate!;
  await live.close();
  now += HOUR;
  live = await BattleSession.open(await openBattleStore(factory, name, () => now), { now: () => now, locks: null });
  const reward = live.pendingReward!;
  const expected = Number(farmRewardUnits(proof) * 650n * BigInt(HOUR) / (BigInt(proof.durationMs) * 1000n));
  assert.equal(reward.amountUnits, expected); assert.equal(reward.creditedMs, HOUR);
  await live.claimOffline(); await live.claimOffline(); await live.resumeActive();
  assert.equal(live.battle.gold * 1000 + live.battle.goldRemainderUnits, before + expected);
  assert.equal(live.battle.elapsed, elapsed, 'Offline return does not run combat');
  const levels = live.battle.towers.slice(0, 2).map(t => t.level);
  for (const tower of live.battle.towers.slice(0, 2)) await live.command(b => b.upgrade(tower.uid));
  assert.deepEqual(live.battle.towers.slice(0, 2).map(t => t.level), levels.map(l => l + 1));
  const kills = live.battle.kills;
  for (let frame = 0; frame < 600; frame++) {
    now += 50;
    if (frame % 20 === 0) await live.heartbeat();
    live.advance(0.05); await live.flush();
  }
  assert.ok(live.battle.elapsed >= elapsed + 29.9);
  assert.ok(live.battle.kills > kills);
  assert.equal(live.error, undefined);
  console.log('B09 earned warehouse at', earned.elapsed.toFixed(3), 's, cleared wave', earned.highestCleared,
    '| 1h reward', expected / 1000, 'gold | two upgrades persisted');
  await live.close();
  const final = await openBattleStore(factory, name, () => now), loaded = await final.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind === 'valid') {
    assert.equal(loaded.save.battle.settlement.warehouseBuilt, true);
    assert.deepEqual(loaded.save.battle.towers.slice(0, 2).map(t => t.level), levels.map(l => l + 1));
  }
  final.close();
});

test('Wisp reaches the warehouse entrance along the existing walkable grid', () => {
  const blocked = new Set(getForestBlockedCells(earned.layout).map(cell => `${cell.x},${cell.y}`));
  const entrance = earned.layout.plots.find(p => p.id === 'warehouse')!.entrance;
  let reached = false;
  for (let seconds = 0; seconds < 100; seconds += 0.5) {
    const pose = wispPose(earned.layout, seconds, true), cell = { x: Math.floor(pose.x / 40), y: Math.floor(pose.y / 40) };
    assert.ok(!blocked.has(`${cell.x},${cell.y}`), 'Wisp walks around scenery');
    reached ||= cell.x === entrance.x && cell.y === entrance.y;
  }
  assert.ok(reached);
});
