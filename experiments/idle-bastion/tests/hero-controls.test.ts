import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle } from '../src/battle';
import { ILYRA, ilyraCell, stepIlyraMotion } from '../src/ilyra';
import { findFootpath, cellCenter } from '../src/layout';
import { heroWorldAvailable, recommendIlyraPosition, ilyraFirstTarget } from '../src/hero-controls';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';

function recruited(): IdleBattle {
  const raw = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json', import.meta.url), 'utf8'));
  const b = IdleBattle.restore(raw)!; assert.ok(b);
  assert.ok(b.buildTavern(b.recommendedTavernPlot!)); assert.ok(b.upgradeTavern()); assert.ok(b.recruitIlyra());
  return b;
}
test('Ilyra recommendation is reachable, free and covers the actual defended road without changing battle state', () => {
  const b = recruited(), before = b.snapshot(), p = recommendIlyraPosition(b); assert.ok(p);
  assert.ok(findFootpath(b.layout, ilyraCell(b.ilyra!), ilyraCell(p), b.movementBlocked()));
  assert.ok(!b.towers.some(t => Math.hypot(t.x - p.x, t.y - p.y) < 40));
  assert.ok(b.layout.road.cells.some(c => { const road = cellCenter(b.layout, c); return Math.hypot(road.x - p.x, road.y - p.y) <= ILYRA.range; }));
  assert.deepEqual(b.snapshot(), before);
  assert.ok(b.moveIlyraTo(ilyraCell(p))); assert.equal(ilyraFirstTarget(b), undefined, 'accepted route is not arrival');
  for (let i = 0; i < 4000 && b.ilyra!.path.length; i++) stepIlyraMotion(b.ilyra!, .025);
  assert.equal(b.ilyra!.path.length, 0); assert.equal(ilyraFirstTarget(b), undefined, 'arrival does not invent enemies');
  assert.equal(b.ilyra!.autoCast, false); assert.equal(b.ilyra!.volley, null);
  assert.deepEqual(IdleBattle.restore(b.snapshot())?.snapshot(), b.snapshot());
});
test('manual pause accepts both hero routes, replacements survive reload and Mara keeps assignment/cooldown', async () => {
  const b = recruited(), p = recommendIlyraPosition(b)!;
  const store = await openBattleStore(new IDBFactory(), 'hero-paused'); await store.save(b.snapshot(), true, 0);
  const session = await BattleSession.open(store, { locks: null });
  if (session.pendingReward) await session.claimOffline(); if (session.awaitingResume) await session.resumeActive();
  assert.equal(session.paused, true);
  const before = session.battle.snapshot(), target = before.mara.targetTowerUid;
  assert.ok(await session.command(b => b.moveMaraTo(ilyraCell(p))));
  assert.ok(await session.command(b => b.moveIlyraTo(ilyraCell(p))));
  const planned = session.battle.snapshot(); session.advance(.25);
  assert.deepEqual(session.battle.snapshot(), planned);
  assert.equal(planned.mara.targetTowerUid, target); assert.equal(planned.mara.cooldownRemaining, before.mara.cooldownRemaining);
  const clone = IdleBattle.restore(planned)!; assert.ok(clone);
  const destination = { x: ilyraCell(p).x, y: ilyraCell(p).y + 1 };
  assert.ok(clone.moveMaraTo(destination)); assert.ok(clone.moveIlyraTo(destination));
  assert.deepEqual(clone.mara.path.at(-1), cellCenter(clone.layout, destination));
  assert.deepEqual(clone.ilyra!.path.at(-1), cellCenter(clone.layout, destination));
  assert.deepEqual(IdleBattle.restore(clone.snapshot())?.snapshot(), clone.snapshot());
  await session.setPaused(false); session.advance(.25);
  assert.notEqual(session.battle.ilyra!.x + session.battle.ilyra!.y, planned.ilyra!.x + planned.ilyra!.y);
  await session.close();
});
test('guided stages block direct hero control; no volley movement or implicit first cast', () => {
  const early = IdleBattle.newGame(); assert.equal(heroWorldAvailable(early), false);
  early.beginIntroduction(); early.build(early.recommendedStarterPad!); early.startDefense(); assert.equal(heroWorldAvailable(early), false);
  const b = recruited(); assert.equal(heroWorldAvailable(b), true);
  const p = recommendIlyraPosition(b)!; b.moveIlyraTo(ilyraCell(p));
  for (let i = 0; i < 4000 && b.ilyra!.path.length; i++) stepIlyraMotion(b.ilyra!, .025);
  for (let i = 0; i < 8000 && !ilyraFirstTarget(b); i++) b.update(.025);
  const aim = ilyraFirstTarget(b); assert.ok(aim); assert.equal(b.ilyra!.volley, null);
  assert.ok(b.castIlyraAt(aim)); const before = b.snapshot(); assert.equal(b.moveIlyraTo({ x: 3, y: 5 }), false);
  assert.deepEqual(b.snapshot(), before); assert.deepEqual(IdleBattle.restore(before)?.snapshot(), before);
});
