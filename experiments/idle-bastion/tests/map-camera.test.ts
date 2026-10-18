import assert from 'node:assert/strict';
import test from 'node:test';
import { IdleBattle } from '../src/battle';
import { createIdleLayout, validateLayout } from '../src/layout';
import { getForestBlockedCells } from '../src/forest-world';
import { readFileSync } from 'node:fs';
import { certifyFarm } from '../src/farming';

// Captured with the published e639b78 simulation, before changing the road.
const savedV3 = () => JSON.parse(readFileSync(new URL('./fixtures/map-v3.json', import.meta.url), 'utf8'));

function oldBattle() {
  const battle = new IdleBattle(createIdleLayout({ version: 3 }));
  battle.gold = 10000;
  return battle;
}
function legacy(battle: IdleBattle) {
  return { ...battle.snapshot(), schemaVersion: 11, rulesVersion: 7, waveRecipeVersion: 7 };
}

test('north road has three complete usable rows, while the entry, core and settlement stay in place', () => {
  const b = new IdleBattle(), old = createIdleLayout({ version: 3 });
  assert.deepEqual(validateLayout(b.layout), []);
  assert.deepEqual(b.layout.road.waypoints.slice(4), old.road.waypoints.slice(4));
  assert.deepEqual(b.layout.plots, old.plots);
  for (let x = 7; x <= 15; x++) for (let y = 1; y <= 3; y++) {
    const pad = b.layout.towerPads.find(p => p.cell.x === x && p.cell.y === y);
    assert.ok(pad && b.canBuild(pad.id), `${x},${y} is buildable`);
  }
  assert.equal(b.layout.road.waypoints[2].y, 4);
});

test('an old active fight and paused reload retain exact enemies, shots and tower positions until the boundary', () => {
  const snap = savedV3(), b = IdleBattle.restore(snap)!; assert.ok(b);
  assert.equal(b.layout.version, 3);
  assert.equal(b.gold, snap.gold); assert.deepEqual(b.snapshot().enemies.map(({healCooldown, healRemaining, healLockout, ...e}) => e), snap.enemies);
  assert.deepEqual(b.snapshot().shots, snap.shots); assert.deepEqual(b.snapshot().towers, snap.towers);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(), b.snapshot());
  assert.equal(certifyFarm(b), undefined);
  for (let n = 0; n < 6000 && b.phase === 'wave'; n++) b.update(.025);
  assert.equal(b.phase, 'intermission');
  const money = b.gold, investments = b.towers.map(t => [t.uid, t.level, t.spent, t.kills]);
  b.update(.025);
  assert.equal(b.layout.version, 4); assert.equal(b.gold, money);
  assert.deepEqual(b.towers.map(t => [t.uid, t.level, t.spent, t.kills]), investments);
  assert.ok(b.towers.find(t => t.uid === 2)!.y !== 180);
  assert.deepEqual(b.liveClearedWaves, []);
  const restored = IdleBattle.restore(b.snapshot())!; assert.ok(restored);
  b.update(3); restored.update(3); assert.deepEqual(b.snapshot(), restored.snapshot());
  assert.equal(b.enemies[0]?.total, 1520);
});

test('a maximally built old map migrates every tower without charges, duplicates or new obstacles', () => {
  const b = oldBattle(); b.gold = 100000;
  for (const p of b.layout.towerPads) if (b.canBuild(p.id)) b.build(p.id);
  const snap = legacy(b), migrated = IdleBattle.restore(snap)!; assert.ok(migrated);
  assert.equal(migrated.layout.version, 4); assert.equal(migrated.gold, b.gold);
  assert.equal(migrated.towers.length, b.towers.length);
  assert.deepEqual(migrated.towers.map(t => [t.uid, t.level, t.spent, t.protected]), b.towers.map(t => [t.uid, t.level, t.spent, t.protected]));
  assert.equal(new Set(migrated.towers.map(t => t.padId)).size, b.towers.length);
  const solids = getForestBlockedCells(migrated.layout);
  for (const t of migrated.towers) {
    const cell = { x: Math.floor(t.x/40), y: Math.floor(t.y/40) };
    assert.ok(!solids.some(c => c.x === cell.x && c.y === cell.y));
    assert.ok(!migrated.layout.road.cells.some(c => c.x === cell.x && c.y === cell.y));
  }
  assert.deepEqual(IdleBattle.restore(migrated.snapshot())!.snapshot(), migrated.snapshot());
});

test('invalid old road data is rejected before migration and an expanded settlement remains intact', () => {
  const b = IdleBattle.restore(savedV3())!; b.highestCleared = 15; b.bossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.unlockClearing(); b.positionBuilding('workshop', { x: 2, y: 10 });
  const snap = legacy(b), restored = IdleBattle.restore(snap); assert.ok(restored);
  assert.deepEqual(restored.plots, b.plots); assert.equal(restored.layout.bounds.columns, 32);
  assert.equal(restored.mara.cooldownRemaining, b.mara.cooldownRemaining);
  const broken = structuredClone(snap); broken.enemies[0].total -= 40;
  assert.equal(IdleBattle.restore(broken), undefined);
});
