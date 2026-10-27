import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IdleBattle } from '../src/battle';
import { TUTORIAL_STEPS, tutorialProgress } from '../src/tutorial-progress';

test('one total covers the three opening scenes and the earned building lessons', () => {
  const b = IdleBattle.newGame(); assert.equal(TUTORIAL_STEPS.length, 14);
  for (const step of [0, 1, 2] as const) assert.deepEqual(tutorialProgress(b, { active: true, step }), { current: step + 1, total: 14, optional: false });
  b.beginIntroduction(); assert.equal(tutorialProgress(b)?.current, 4);
  b.build(b.recommendedStarterPad!); assert.equal(tutorialProgress(b)?.current, 5);
  b.startDefense(); assert.equal(tutorialProgress(b)?.current, 6);
  const seen = new Set<number>();
  for (let i = 0; i < 4000 && b.introduction.stage !== 'frost'; i++) {
    b.update(.025); seen.add(tutorialProgress(b)!.current);
    if (!b.learningPaused) continue;
    if (b.introduction.stage === 'upgrade') assert.ok(b.upgrade(1));
    else if (b.introduction.stage === 'workshop') assert.ok(b.buildWorkshop());
    else if (b.introduction.stage === 'research') assert.ok(b.researchFrost());
    if (b.learningPaused) assert.ok(b.continueLesson());
  }
  assert.deepEqual([...seen], [6, 7, 8]); assert.equal(tutorialProgress(b)?.current, 9);
  const before = b.snapshot(); tutorialProgress(b); assert.deepEqual(b.snapshot(), before);
  assert.deepEqual(tutorialProgress(IdleBattle.restore(before)!), tutorialProgress(b));
});

test('discovery counts do not restart; optional lessons end the total and veterans get no new tutorial', () => {
  const raw = JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/onboarding/menu-guide/browser.json', 'utf8')).final.battle;
  const b = IdleBattle.restore(raw)!; assert.ok(b);
  for (let i = 0; i < 12000 && !b.discoveryPaused; i++) b.update(.025);
  assert.equal(tutorialProgress(b)?.current, 10);
  b.meetWisp(); assert.equal(tutorialProgress(b)?.current, 11); b.continueDiscovery();
  for (let i = 0; i < 12000 && b.discovery !== 'mara-controls'; i++) { assert.equal(tutorialProgress(b)?.current, 11); b.update(.025); }
  assert.equal(tutorialProgress(b)?.current, 12);
  b.continueDiscovery(); assert.deepEqual(tutorialProgress(b), { current: 13, total: 14, optional: true });
  b.dismissDiscovery(); assert.deepEqual(tutorialProgress(b), { current: 14, total: 14, optional: true });
  b.dismissDiscovery(); assert.equal(tutorialProgress(b), undefined);
  b.discovery = 'off'; assert.equal(tutorialProgress(b), undefined);
  b.discovery = 'mara-wait'; b.tutorial.hidden = true; assert.equal(tutorialProgress(b), undefined);
});

test('the first upgrade resumes the same wave and survives reload without a confirmation', () => {
  const b = IdleBattle.newGame(); b.beginIntroduction(); b.build(b.recommendedStarterPad!); b.startDefense();
  for (let i = 0; i < 4000 && !b.learningPaused; i++) b.update(.025);
  assert.equal(b.introduction.stage, 'upgrade'); assert.equal(b.learningPaused, true);
  const gold = b.gold, wave = b.wave;
  assert.equal(b.upgrade(b.towers[0].uid), true);
  assert.equal(b.gold, gold - 60); assert.equal(b.wave, wave);
  assert.equal(b.introduction.stage, 'workshop'); assert.equal(b.learningPaused, false);
  const restored = IdleBattle.restore(b.snapshot())!;
  assert.ok(restored); const elapsed = restored.elapsed; restored.update(.1);
  assert.ok(restored.elapsed > elapsed); assert.equal(restored.towers[0].level, 2);
  assert.equal(restored.upgrade(restored.towers[0].uid), false, 'no second tutorial purchase');
});

test('an older save waiting after level 2 releases only its obsolete learning pause', () => {
  const b = IdleBattle.newGame(); b.beginIntroduction(); b.build(b.recommendedStarterPad!); b.startDefense();
  for (let i = 0; i < 4000 && !b.learningPaused; i++) b.update(.025);
  b.upgrade(b.towers[0].uid);
  b.introduction.stage = 'upgrade'; b.introduction.halted = true;
  const old = IdleBattle.restore(b.snapshot())!; assert.ok(old);
  const gold = old.gold; old.update(.025);
  assert.equal(old.introduction.stage, 'workshop'); assert.equal(old.learningPaused, false);
  assert.equal(old.gold, gold); assert.equal(old.towers[0].level, 2);
});
