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
    if (b.introduction.stage === 'workshop') assert.ok(b.buildWorkshop());
    if (b.introduction.stage === 'research') assert.ok(b.researchFrost());
    assert.ok(b.continueLesson());
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
