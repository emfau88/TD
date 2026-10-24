import assert from 'node:assert/strict';
import { IdleBattle } from '../../src/battle';

/** Earned opening: no wallet edits or skipped purchases. */
export function guidedFrost(): IdleBattle {
  const b = IdleBattle.newGame(); b.beginIntroduction(); b.build(b.recommendedStarterPad!); b.startDefense();
  for (let i = 0; i < 4000 && b.introduction.stage !== 'frost'; i++) {
    b.update(.025);
    if (!b.learningPaused) continue;
    if (b.introduction.stage === 'upgrade') assert.ok(b.upgrade(1));
    if (b.introduction.stage === 'workshop') assert.ok(b.buildWorkshop());
    if (b.introduction.stage === 'research') assert.ok(b.researchFrost());
    assert.ok(b.continueLesson());
  }
  assert.equal(b.introduction.stage, 'frost'); assert.equal(b.learningPaused, true);
  return b;
}
