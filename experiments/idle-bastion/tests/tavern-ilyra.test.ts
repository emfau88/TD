import test from 'node:test';
import assert from 'node:assert/strict';
import { BattleSession } from '../src/battle-session';
import { IdleBattle } from '../src/battle';
import { TavernInteractions } from '../src/tavern-interactions';
import { SOCIAL } from '../src/tavern-social';
import { ILYRA_MOMENTS, ilyraMoment, ilyraStage, ilyraLine, nextIlyraMoment } from '../src/tavern-ilyra-content';
import { MARA_MOMENTS } from '../src/tavern-mara-content';

async function veteran() {
  const s = await BattleSession.open(undefined, { guidedStart: false }), b = s.battle;
  b.update(4); b.gold = 12000; b.highestCleared = 25; b.bossVictories = 1; b.secondBossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.update(.025); b.wispArrival.met = true; b.discovery = 'off';
  assert.ok(b.buildTavern(b.recommendedTavernPlot!)); assert.ok(b.upgradeTavern());
  await s.setPaused(true); return s;
}
test('Ilyra requires actual recruitment; each transaction retains its recipient and shared stock', async () => {
  const s = await veteran(), ui = new TavernInteractions(), b = s.battle;
  const locked = b.snapshot(); assert.equal(await ui.run(s, 'gift', 'ilyra'), null); assert.deepEqual(b.snapshot(), locked);
  assert.ok(b.recruitIlyra());
  const pose = structuredClone(b.ilyra), maraBefore = b.social.points.mara, gifts = b.social.gifts;
  const gift = ui.run(s, 'gift', 'ilyra');
  assert.equal(await ui.run(s, 'gift', 'mara'), null); // A second tap/recipient cannot steal the pending gift.
  assert.equal((await gift)?.points, 12); assert.equal(b.social.points.ilyra, 12);
  assert.equal(b.social.points.mara, maraBefore); assert.equal(b.social.gifts, gifts - 1);
  assert.equal((await ui.run(s, 'talk', 'mara'))?.points, 8);
  assert.equal(b.social.points.ilyra, 12); assert.equal(b.social.points.mara, 8);
  assert.deepEqual(b.ilyra, pose); assert.equal(s.paused, true);
  const restored = IdleBattle.restore(b.snapshot()); assert.ok(restored); assert.deepEqual(restored.social, b.social);
  await s.close();
});
test('Ilyra has five distinct replayable heart scenes and six own dialogue stages', () => {
  assert.equal(new Set(ILYRA_MOMENTS.map(m => m.title)).size, 5);
  const maraLines = new Set(MARA_MOMENTS.flatMap(m => m.beats.map(b => b.line)));
  for (const [i, p] of SOCIAL.heartThresholds.entries()) {
    assert.equal(ilyraMoment(p - 1, i + 1), undefined);
    const scene = ilyraMoment(p, i + 1)!; assert.equal(scene.beats.length, 3);
    for (const beat of scene.beats) { assert.ok(beat.line.length > 30); assert.ok(!maraLines.has(beat.line)); }
    assert.equal(ilyraMoment(p, i + 2), undefined);
  }
  assert.equal(ilyraMoment(160, 1.5), undefined); assert.equal(nextIlyraMoment(160), undefined);
  const points = [0, ...SOCIAL.heartThresholds]; assert.equal(new Set(points.map(p => ilyraStage(p).greeting)).size, 6);
  for (const p of points) {
    assert.notEqual(ilyraLine(p, 'talk', 'hand', 0), ilyraLine(p, 'talk', 'hand', 1));
    for (const region of ['hand', 'hair', 'shoulder'] as const) assert.ok(ilyraLine(p, 'touch', region, 0).length > 20);
    assert.ok(ilyraLine(p, 'gift', 'hand', 0).length > 20);
  }
});
