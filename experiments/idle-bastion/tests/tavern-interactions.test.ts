import test from 'node:test';
import assert from 'node:assert/strict';
import { BattleSession } from '../src/battle-session';
import { TavernInteractions } from '../src/tavern-interactions';
async function fixture() {
  const session = await BattleSession.open(undefined, { guidedStart: false });
  const b = session.battle; b.update(4); b.highestCleared = 12;
  assert.ok(b.buildTavern(b.recommendedTavernPlot!));
  await session.setPaused(true); return session;
}
test('tavern actions preserve manual pause, consume one gift per transaction and serialize taps', async () => {
  const s = await fixture(), ui = new TavernInteractions();
  for (let i = 0; i < 3; i++) await ui.run(s, 'talk');
  const first = ui.run(s, 'gift'), duplicate = ui.run(s, 'gift');
  assert.equal(await duplicate, null); assert.equal((await first)?.points, 12);
  assert.equal(s.battle.social.gifts, 0); assert.equal(s.battle.social.points.mara, 35);
  assert.equal(await ui.run(s, 'gift'), null); assert.equal(s.paused, true);
  await s.close();
});
test('unrewarded interactions remain playable without another save; failed save has no UI reward', async () => {
  const s = await fixture(), ui = new TavernInteractions();
  await ui.run(s, 'talk'); await ui.run(s, 'talk'); await ui.run(s, 'talk');
  const snapshot = s.battle.snapshot(), revision = s.revision;
  assert.equal((await ui.run(s, 'talk'))?.points, 0);
  assert.deepEqual(s.battle.snapshot(), snapshot); assert.equal(s.revision, revision);
  const command = s.command.bind(s); s.command = async () => false;
  assert.equal(await ui.run(s, 'gift'), null); assert.deepEqual(s.battle.snapshot(), snapshot);
  assert.equal(ui.pending, false); s.command = command; await s.close();
});
