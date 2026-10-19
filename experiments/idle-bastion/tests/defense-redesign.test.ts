import { defenseFingerprint } from '../src/farming';
import { tutorialStep } from '../src/hud';
import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBFactory } from 'fake-indexeddb';
import { BASE, IdleBattle, SETTLEMENT, stats } from '../src/battle';
import { createIdleLayout, SETTLEMENT_ZONE, rectContains } from '../src/layout';
import { getForestBlockedCells } from '../src/forest-world';
import { MARA, castMara, moveMara, stepMara } from '../src/mara';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { TOWER_SHEETS, towerSheet, weaponFrame } from '../src/tower-atlas';
import { readFile } from 'node:fs/promises';

function rich() {
  const b = new IdleBattle(); b.update(1); b.highestCleared = 10; b.gold = 10000;
  b.buildWorkshop(); b.researchFrost(); return b;
}

test('both sides of the road offer a three-cell band; trees, water, road and settlement stay excluded', () => {
  const b = new IdleBattle(), solid = getForestBlockedCells(b.layout);
  const available = b.layout.towerPads.filter(p => b.isPadUnlocked(p.id));
  assert.ok(available.length > 80, `${available.length} usable cells`);
  for (const pad of available) {
    const distance = Math.min(...b.layout.road.cells.map(c => Math.abs(c.x-pad.cell.x)+Math.abs(c.y-pad.cell.y)));
    assert.ok(distance >= 1 && distance <= 3);
    assert.ok(!rectContains(SETTLEMENT_ZONE, pad.cell));
    assert.ok(!solid.some(c => c.x === pad.cell.x && c.y === pad.cell.y));
  }
  for (const y of [4, 6]) assert.ok(available.some(p => p.cell.x === 3 && p.cell.y === y));
  assert.equal(b.canBuild('cell-3-5'), false);
  const lockedByTree = b.layout.towerPads.find(p => solid.some(c => c.x === p.cell.x && c.y === p.cell.y));
  assert.ok(lockedByTree); assert.equal(b.canBuild(lockedByTree.id), false);
});

test('a dense Frost / damage combination builds, charges once and survives exact continuation', () => {
  let b = rich();
  for (const [id, kind] of [['cell-8-3', 2], ['tower-02', 1], ['cell-9-3', 3]] as const) {
    const money = b.gold, tower = b.build(id, kind); assert.ok(tower, id);
    assert.equal(b.gold, money - tower.def.cost); assert.equal(b.build(id, kind), undefined);
  }
  const snap = b.snapshot(), restored = IdleBattle.restore(snap); assert.ok(restored);
  assert.deepEqual(restored.snapshot(), snap);
  b.update(2); restored.update(2); assert.deepEqual(restored.snapshot(), b.snapshot());
});

test('schema 10 preserves money, old tower positions, ongoing combat and cooldown, without inventing farm proof', async () => {
  const snap = JSON.parse(await readFile(new URL('./fixtures/map-v3.json', import.meta.url), 'utf8'));
  const legacy = { ...snap, schemaVersion: 10, rulesVersion: 6, layoutVersion: 2, waveRecipeVersion: 6 };
  const restored = IdleBattle.restore(legacy); assert.ok(restored);
  assert.equal(restored.gold, snap.gold); assert.deepEqual(restored.snapshot().towers, snap.towers);
  assert.deepEqual(restored.snapshot().enemies, snap.enemies); assert.deepEqual(restored.snapshot().shots, snap.shots);
  assert.equal(restored.mara.cooldownRemaining, snap.mara.cooldownRemaining);
  assert.deepEqual(restored.liveClearedWaves, []); assert.equal(restored.snapshot().schemaVersion, 15);
  assert.ok(IdleBattle.restore(restored.snapshot()));
});

test('Mara waits for combat at her target, casts remotely, retains her buff while walking and changing target', () => {
  const b = rich(), m = b.mara, target = b.towers[0];
  const layout = b.layout, blocked = b.movementBlocked();
  stepMara(m, target, layout, blocked, 1, true, true, false);
  assert.equal(m.cooldownRemaining, 0); assert.equal(m.effectRemaining, 0);
  stepMara(m, target, layout, blocked, .025, true, true, true);
  assert.equal(m.effectRemaining, 8); assert.equal(m.effectTowerUid, target.uid);
  assert.ok(moveMara(m, { x: 6, y: 7 }, layout, blocked));
  stepMara(m, target, layout, blocked, 1, true, true, false);
  assert.equal(m.effectRemaining, 7); assert.ok(b.isMaraBoosted(target.uid));
  const next = b.build('tower-02')!; b.assignMara(next.uid);
  assert.equal(m.effectTowerUid, target.uid); assert.equal(m.effectRemaining, 7);
  assert.equal(castMara(m, next), false);
  assert.ok(IdleBattle.restore(b.snapshot()));
  m.effectRemaining = 0; m.effectTowerUid = null; m.cooldownRemaining = 0; m.autoCast = false;
  stepMara(m, next, layout, b.movementBlocked(), .025, true, true, true);
  assert.equal(m.effectRemaining, 0); assert.equal(castMara(m, next), true);
});

test('buildings occupy chosen non-overlapping settlement footprints; Workshop II does not require the east', () => {
  const b = rich(); assert.equal(b.clearing.unlocked, false);
  assert.ok(b.upgradeWorkshop()); assert.equal(b.maxLevel, 20); assert.equal(tutorialStep(b), 14);
  assert.ok(b.positionBuilding('workshop', { x: 2, y: 10 }));
  assert.equal(b.positionBuilding('warehouse', { x: 3, y: 10 }), false);
  assert.equal(b.positionBuilding('workshop', { x: 5, y: 5 }), false);
  assert.ok(b.positionBuilding('warehouse', { x: 7, y: 11 })); assert.ok(b.buildWarehouse());
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(), b.snapshot());
  const gold = b.gold; assert.equal(b.buildWarehouse(), false); assert.equal(b.gold, gold);
});

test('Wisp has one persisted arrival and greeting, independent of his immediate economic bonus', () => {
  const b = rich(); assert.equal(b.wispUnlocked, true); assert.equal(b.wispArrival.at, b.elapsed);
  assert.equal(b.wispArrival.met, false); const at = b.wispArrival.at;
  b.wispArrival.met = true; b.update(.25);
  const restored = IdleBattle.restore(b.snapshot())!;
  assert.ok(restored.wispArrival.met); assert.equal(restored.wispArrival.at, at);
  assert.equal(restored.researchFrost(), false); assert.equal(restored.drainEvents().length, 0);
});

test('new construction and chosen building positions survive the real IndexedDB transaction boundary', async () => {
  const store = await openBattleStore(new IDBFactory(), 'redesign');
  const session = await BattleSession.open(store, { now: () => 10000, ownerId: 'redesign', locks: null });
  assert.ok(await session.command(b => b.build('cell-8-3')));
  const snap = session.battle.snapshot(); const loaded = await store.load(); assert.equal(loaded.kind, 'valid');
  if (loaded.kind === 'valid') assert.deepEqual(loaded.save.battle, snap);
  await session.command(b => { b.gold = SETTLEMENT.workshopCost; b.positionBuilding('workshop', { x: 2, y: 10 }); b.buildWorkshop(); });
  assert.ok(IdleBattle.restore(session.battle.snapshot())); await session.close();
});

test('all weapon/projectile/impact atlases use the original frame maps, including one Frost crystal per frame', async () => {
  const manifest = JSON.parse(await readFile(new URL('../../../public/assets/manifest.json', import.meta.url), 'utf8'));
  for (const [key, sheet] of Object.entries(TOWER_SHEETS)) {
    const file = decodeURIComponent(new URL(sheet.url).pathname).split('/').at(-1)!.replace('.png', '');
    assert.equal(sheet.width, manifest[file].width, key); assert.equal(sheet.height, manifest[file].height, key);
    assert.deepEqual([...sheet.frameMap], manifest[file].frameMap, key);
    const png = await readFile(new URL(sheet.url));
    assert.equal(png.readUInt32BE(16) % sheet.width, 0); assert.equal(png.readUInt32BE(20) % sheet.height, 0);
  }
  assert.deepEqual([1, 2, 3].map(stage => towerSheet(2, stage, 'Weapon').width), [48, 64, 64]);
  assert.equal(weaponFrame(2, 1, 0, 0, .9), 16);
  assert.equal(weaponFrame(2, 1, 10, .5, .9), 5);
});

test('a fully occupied legal band still has a bounded, persistable farm fingerprint', () => {
  const b = rich(); b.gold = 100000;
  for (const pad of b.layout.towerPads) if (b.canBuild(pad.id)) b.build(pad.id);
  assert.ok(b.towers.length > 80);
  assert.ok(defenseFingerprint(b).length < 20000);
  assert.ok(IdleBattle.restore(b.snapshot()));
});
