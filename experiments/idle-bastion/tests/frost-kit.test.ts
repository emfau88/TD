import test from 'node:test';
import assert from 'node:assert/strict';
import { IdleBattle, sellValue } from '../src/battle';
import { guidedFrost } from './helpers/guided-frost';

const reload = (b: IdleBattle) => { const next = IdleBattle.restore(b.snapshot()); assert.ok(next); assert.deepEqual(next.snapshot(), b.snapshot()); return next; };
test('earned Frost kit is immediately affordable, atomic and consumed through sale and reload', () => {
  let b = reload(guidedFrost()); const gold = b.gold;
  assert.equal(gold, 25); assert.ok(b.elapsed < 13); assert.equal(b.lessonCost, 0);
  assert.equal(b.frostKitAvailable, true); assert.equal(b.recommendedFrostPad, 'tower-02');
  const tower = b.build(b.recommendedFrostPad!, 2)!; assert.ok(tower);
  assert.equal(tower.spent, 0); assert.equal(sellValue(tower), 0); assert.equal(b.gold, gold);
  assert.equal(b.introduction.stage, 'done'); assert.equal(b.frostKitAvailable, false);
  assert.equal(b.build(tower.padId, 2), undefined); b = reload(b);
  assert.ok(b.sell(tower.uid)); assert.equal(b.gold, gold); b = reload(b);
  assert.equal(b.tutorialFrostUid, tower.uid); assert.equal(b.towerBuildCost(2), 110);
  b.tutorial.hidden = false; b.tutorial.seen = 0;
  assert.equal(b.build(tower.padId, 2), undefined);
  b.discovery = 'off';
  for (let i = 0; i < 8000 && b.gold < 110; i++) b.update(.025);
  const paidGold = b.gold, paid = b.build(tower.padId, 2)!;
  assert.ok(paid); assert.equal(paid.spent, 110); assert.equal(b.gold, paidGold - 110); reload(b);
});
test('only paid upgrades contribute to the free kit refund; forged free towers are rejected', () => {
  let b = guidedFrost(); const tower = b.build(b.recommendedFrostPad!, 2)!;
  b.discovery = 'off'; for (let i = 0; i < 8000 && b.gold < 60; i++) b.update(.025);
  assert.ok(b.upgrade(tower.uid)); assert.equal(tower.spent, 60); assert.equal(sellValue(tower), 42);
  b = reload(b); const before = b.gold; assert.ok(b.sell(tower.uid)); assert.equal(b.gold, before + 42); reload(b);
  const forged = b.snapshot(); forged.tutorialFrostUid = 1; assert.equal(IdleBattle.restore(forged), undefined);
  const missing = guidedFrost(); missing.build(missing.recommendedFrostPad!, 2); missing.tutorialFrostUid = null;
  assert.equal(IdleBattle.restore(missing.snapshot()), undefined);
});
test('schema 29 unfinished guidance gains eligibility; completed and paid saves retain prices', () => {
  const b = guidedFrost(), old: any = b.snapshot(); old.schemaVersion = 29; delete old.tutorialFrostUid;
  const unchanged = structuredClone(old), migrated = IdleBattle.restore(old)!;
  assert.ok(migrated); assert.equal(migrated.frostKitAvailable, true); assert.deepEqual(old, unchanged);
  assert.deepEqual(migrated.snapshot(), { ...old, schemaVersion: 30, tutorialFrostUid: null });
  b.skipLessons(); assert.equal(b.frostKitAvailable, false);
  b.discovery = 'off'; for (let i = 0; i < 8000 && b.gold < 110; i++) b.update(.025);
  const paid = b.build(b.recommendedFrostPad!, 2)!; assert.equal(paid.spent, 110);
  const paidOld: any = b.snapshot(); paidOld.schemaVersion = 29; delete paidOld.tutorialFrostUid;
  const next = IdleBattle.restore(paidOld)!; assert.ok(next); assert.equal(next.towerBuildCost(2), 110);
  assert.equal(next.towers.find(t => t.uid === paid.uid)!.spent, 110); reload(next);
});
