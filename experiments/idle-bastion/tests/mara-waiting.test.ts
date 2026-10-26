import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IdleBattle } from '../src/battle';
import { MARA, createMara, prepareWaitingMara, stepMara, validMara } from '../src/mara';
import { cellCenter } from '../src/layout';
import { heroWorldAvailable, maraControlStage } from '../src/hero-controls';

test('waiting walks remain local, legal and in range, with long rests and several facing directions', () => {
  const b = IdleBattle.newGame(); b.beginIntroduction(); b.build(b.recommendedStarterPad!);
  const target = b.towers[0], mara = createMara(b.layout, target.uid), home = cellCenter(b.layout, b.layout.maraStart);
  const positions = new Set<string>(), directions = new Set<string>(); let moving = 0;
  for (let i = 0; i < 3120; i++) {
    prepareWaitingMara(mara, target, b.layout, b.movementBlocked(), i * .025, true);
    if (mara.path.length) moving++;
    stepMara(mara, target, b.layout, b.movementBlocked(), .025, false, false);
    assert.ok(validMara(mara, b.towers, b.layout, b.movementBlocked()));
    assert.ok(Math.hypot(mara.x - home.x, mara.y - home.y) <= 40.001);
    assert.ok(Math.hypot(mara.x - target.x, mara.y - target.y) <= MARA.range);
    positions.add(`${mara.x},${mara.y}`); directions.add(mara.direction);
  }
  assert.ok(positions.size > 10); assert.ok(moving < 3120 * .15); assert.ok(directions.has('down'));
  assert.equal(mara.cooldownRemaining, 0); assert.equal(mara.effectRemaining, 0);
  prepareWaitingMara(mara, target, b.layout, b.movementBlocked(), 60, false);
  for (let i = 0; i < 80; i++) stepMara(mara, target, b.layout, b.movementBlocked(), .025, false, false);
  assert.equal(mara.x, home.x); assert.equal(mara.y, home.y);
});

test('ordinary earned opening and a saved walking segment restore without moving an unbuilt save', () => {
  const b = IdleBattle.newGame(), original = structuredClone(b.mara); b.update(20);
  assert.deepEqual(b.mara, original); assert.ok(IdleBattle.restore(b.snapshot()));
  b.beginIntroduction(); b.build(b.recommendedStarterPad!); b.startDefense(); let checkedWalkingSave = false;
  for (let i = 0; i < 4000 && b.introduction.stage !== 'frost'; i++) {
    b.update(.025);
    if (b.mara.path.length && !checkedWalkingSave) {
      const restored = IdleBattle.restore(b.snapshot()); assert.ok(restored);
      assert.deepEqual(restored.snapshot(), b.snapshot());
      const second = IdleBattle.restore(b.snapshot())!; restored.update(.25); second.update(.25);
      assert.deepEqual(restored.snapshot(), second.snapshot()); checkedWalkingSave = true;
    }
    if (!b.learningPaused) continue;
    if (b.introduction.stage === 'upgrade') assert.ok(b.upgrade(1));
    if (b.introduction.stage === 'workshop') assert.ok(b.buildWorkshop());
    if (b.introduction.stage === 'research') assert.ok(b.researchFrost());
    assert.ok(b.continueLesson());
  }
  assert.ok(checkedWalkingSave); assert.equal(b.introduction.stage, 'frost');
  assert.ok(IdleBattle.restore(b.snapshot())); assert.equal(b.mara.effectRemaining, 0);
});

test('real first spell unlocks controls after its effect; waiting paths stop at the introduction', () => {
  const raw = JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/onboarding/menu-guide/browser.json', 'utf8')).final.battle;
  const b = IdleBattle.restore(raw)!; assert.ok(b);
  for (let i = 0; i < 12000 && !b.discoveryPaused; i++) b.update(.025);
  assert.equal(maraControlStage(b), 'waiting'); assert.equal(heroWorldAvailable(b), false);
  assert.ok(b.meetWisp()); assert.equal(b.mara.path.length, 0);
  assert.ok(b.continueDiscovery()); assert.equal(maraControlStage(b), 'lesson');
  const position = { x: b.mara.x, y: b.mara.y };
  for (let i = 0; i < 12000 && b.discovery !== 'mara-controls'; i++) {
    b.update(.025);
    assert.deepEqual({ x: b.mara.x, y: b.mara.y }, position);
  }
  assert.equal(b.discovery, 'mara-controls'); assert.equal(maraControlStage(b), 'ready');
  assert.equal(heroWorldAvailable(b), true); assert.ok(IdleBattle.restore(b.snapshot()));
  assert.ok(b.moveMaraTo(b.layout.maraStart));
  b.update(.25); assert.equal(maraControlStage(b), 'ready');
});
