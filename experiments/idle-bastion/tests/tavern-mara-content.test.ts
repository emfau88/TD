import test from 'node:test';
import assert from 'node:assert/strict';
import { IdleBattle } from '../src/battle';
import { SOCIAL, hearts } from '../src/tavern-social';
import { MARA_MOMENTS, maraMoment, maraStage, maraLine, nextMaraMoment, type MaraMoment } from '../src/tavern-mara-content';

test('each earned heart unlocks one distinct three-beat moment, preserved across restore without replay rewards', () => {
  const b = new IdleBattle(); b.update(4); b.highestCleared = 12; assert.ok(b.buildTavern(b.recommendedTavernPlot!));
  assert.equal(new Set(MARA_MOMENTS.map(moment => moment.title)).size, 5);
  for (const [index, threshold] of SOCIAL.heartThresholds.entries()) {
    assert.equal(maraMoment(threshold - 1, index + 1), undefined);
    b.social.points.mara = threshold;
    const restored = IdleBattle.restore(b.snapshot()); assert.ok(restored);
    const snapshot = restored.snapshot();
    for (let replay = 0; replay < 3; replay++) {
      const moment: MaraMoment = maraMoment(restored.social.points.mara, index + 1)!;
      assert.ok(moment); assert.equal(moment.beats.length, 3);
      assert.ok(moment.beats.every(beat => beat.line.length > 30 && ['hair', 'hand', 'shoulder'].includes(beat.clip)));
      assert.equal(maraMoment(restored.social.points.mara, index + 2), undefined);
    }
    assert.deepEqual(restored.snapshot(), snapshot);
    assert.equal(hearts(restored.social.points.mara), index + 1);
  }
  assert.equal(maraMoment(160, 0), undefined); assert.equal(maraMoment(160, 1.5), undefined);
  assert.equal(nextMaraMoment(160), undefined);
});
test('all six relationship stages have distinct greetings and contextual actions, including unearned replay', () => {
  const points = [0, ...SOCIAL.heartThresholds];
  assert.equal(new Set(points.map(p => maraStage(p).greeting)).size, 6);
  for (const p of points) {
    assert.notEqual(maraLine(p, 'talk', 'hand', 0), maraLine(p, 'talk', 'hand', 1));
    assert.equal(maraLine(p, 'talk', 'hand', 0), maraLine(p, 'talk', 'hand', 2));
    for (const region of ['hand', 'hair', 'shoulder'] as const) assert.ok(maraLine(p, 'touch', region, 0).length > 20);
    assert.ok(maraLine(p, 'gift', 'hand', 0).length > 20);
  }
  assert.deepEqual(nextMaraMoment(34), { title: MARA_MOMENTS[1]!.title, points: 35 });
});
