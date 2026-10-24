import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle } from '../src/battle';
import { createFeatureProbe, saveFeatureProbe } from '../src/feature-probes';
import { heroWorldAvailable, recommendIlyraPosition } from '../src/hero-controls';
import { openBattleStore } from '../src/save-store';

const earned = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json', import.meta.url), 'utf8'));
test('Frost preview earns its 25 gold and stops before the single free build', () => {
  const b = createFeatureProbe('frost');
  assert.equal(b.introduction.stage, 'frost'); assert.equal(b.learningPaused, true);
  assert.equal(b.gold, 25); assert.equal(b.tutorialFrostUid, null);
  assert.equal(b.settlement.frostResearched, true);
  assert.deepEqual(IdleBattle.restore(b.snapshot())?.snapshot(), b.snapshot());
});
test('Ilyra preview pays the upgrade and retains her real first movement', () => {
  const b = createFeatureProbe('ilyra', earned);
  assert.equal(b.gold, earned.gold - 1200);
  assert.equal(b.ilyra?.introduction, 'move'); assert.equal(b.ilyra?.autoCast, false);
  assert.ok(recommendIlyraPosition(b)); assert.ok(heroWorldAvailable(b));
  assert.deepEqual(IdleBattle.restore(b.snapshot())?.snapshot(), b.snapshot());
});
test('hero preview completes the actual first volley and is ready for free movement', () => {
  const b = createFeatureProbe('heroes', earned);
  assert.equal(b.ilyra?.introduction, 'done'); assert.equal(b.ilyra?.volley, null);
  assert.equal(b.ilyra?.path.length, 0); assert.ok(heroWorldAvailable(b));
  assert.deepEqual(IdleBattle.restore(b.snapshot())?.snapshot(), b.snapshot());
});
test('every visit creates a distinct durable probe and leaves the main save byte-for-byte intact', async () => {
  const factory = new IDBFactory(), main = await openBattleStore(factory);
  await main.save(IdleBattle.newGame().snapshot(), true, 0);
  const before = await main.load(), b = createFeatureProbe('frost');
  const first = await saveFeatureProbe(b, 'frost', factory), second = await saveFeatureProbe(b, 'frost', factory);
  assert.notEqual(first, second); assert.match(first, /^[a-z0-9-]{1,60}$/);
  const probe = await openBattleStore(factory, `spire-idle-bastion-probe-${first}`);
  const loaded = await probe.load(); assert.equal(loaded.kind, 'valid');
  if (loaded.kind === 'valid') assert.deepEqual(loaded.save.battle, b.snapshot());
  assert.deepEqual(await main.load(), before);
  probe.close(); main.close();
});
test('invalid saved defense fails instead of generating a substitute game', () => {
  assert.throws(() => createFeatureProbe('ilyra', {}), /recorded defense/);
});
