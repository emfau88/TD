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

test('touch region and personal gift choice are checked at execution and cannot substitute another reward', async () => {
  const s = await fixture(), ui = new TavernInteractions();
  for (let i = 0; i < 3; i++) await ui.run(s, 'talk');
  await ui.run(s, 'gift');
  const before = s.battle.snapshot();
  assert.equal(await ui.run(s, 'touch', 'mara', { region: 'hand' }), null);
  assert.deepEqual(s.battle.snapshot(), before);
  assert.equal((await ui.run(s, 'touch', 'mara', { region: 'shoulder' }))?.points, 4);
  assert.equal(await ui.run(s, 'gift', 'mara', { gift: 'personal' }), null);
  s.battle.social.points.mara = 58; s.battle.social.personal.mara.clears = 30;
  const stock = s.battle.social.gifts;
  assert.equal((await ui.run(s, 'gift', 'mara', { gift: 'personal' }))?.points, 12);
  assert.equal(s.battle.social.gifts, stock); assert.equal(s.battle.social.points.mara, 70);
  await s.close();
});
