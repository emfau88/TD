import assert from 'node:assert/strict';
import test from 'node:test';
import { JSDOM } from 'jsdom';
import { IDBFactory } from 'fake-indexeddb';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifiedGoldPerMinute, leaderboardEligible } from '../src/leaderboard-scores';
import { KongregateLeaderboards, kongregateLoader, type KongregateAPI } from '../src/kongregate';

const tick = () => new Promise<void>(resolve => setImmediate(resolve));
const scores = { highestWave: 25, bestGoldPerMinute: 43, enemiesDefeated: 827 };
function platform() {
  const sent: [string, number][] = [];
  const state = { guest: false, userId: 1, fail: false, login: () => {} };
  const api: KongregateAPI = {
    stats: { submit(name, value) { if (state.fail) throw new Error('Disconnected'); sent.push([name, value]); } },
    services: { isGuest: () => state.guest, getUserId: () => state.userId,
      addEventListener: (_event, listener) => { state.login = listener; } },
  };
  return { api, sent, state };
}

test('regular Kongregate game alone is eligible, including exclusion of malformed probe routes', () => {
  const main = 'spire-idle-bastion';
  assert.equal(leaderboardEligible(true, false, main, new URLSearchParams()), true);
  for (const params of ['fresh=1', 'probe=regular', 'probe=', 'probe=INVALID']) {
    assert.equal(leaderboardEligible(true, false, main, new URLSearchParams(params)), false);
  }
  assert.equal(leaderboardEligible(false, false, main, new URLSearchParams()), false);
  assert.equal(leaderboardEligible(true, true, main, new URLSearchParams()), false);
  assert.equal(leaderboardEligible(true, false, main + '-probe-test', new URLSearchParams()), false);
});

test('saved totals submit on load, wave clear, login and reconnection without Add increments', async () => {
  const { api, sent, state } = platform();
  let clock = 0;
  const client = new KongregateLeaderboards(async () => api, () => clock);
  client.update(scores); await tick();
  assert.deepEqual(sent, [['Highest Wave', 25], ['Best Gold per Minute', 43], ['Enemies Defeated', 827]]);
  sent.length = 0;
  client.update({ ...scores, enemiesDefeated: 830 });
  assert.equal(sent.length, 0, 'Kills are batched, not submitted on each hit.');
  clock = 10_000; client.update({ ...scores, enemiesDefeated: 830 });
  assert.deepEqual(sent, [['Enemies Defeated', 830]]);
  sent.length = 0;
  client.update({ ...scores, highestWave: 26, enemiesDefeated: 840 });
  assert.deepEqual(sent, [['Highest Wave', 26], ['Enemies Defeated', 840]]);
  sent.length = 0;
  state.fail = true; clock = 60_000; client.update(scores);
  assert.equal(sent.length, 0);
  state.fail = false; client.update(scores, true);
  assert.equal(sent.length, 3, 'Online resubmits absolute values even if unchanged.');
  sent.length = 0;
  state.guest = true; client.update(scores, true);
  assert.equal(sent.length, 0);
  state.guest = false; state.userId = 2; state.login();
  assert.equal(sent.length, 3);
  sent.length = 0; clock += 60_000; client.update(scores);
  assert.equal(sent.length, 3, 'Periodic resend also recovers silently lost SDK messages.');
  client.dispose(); state.login(); assert.equal(sent.length, 3);
});

test('unavailable API and delayed guest login never block; invalid/temporary scores cannot leak', async () => {
  const { api, sent, state } = platform();
  let clock = 0, attempts = 0;
  const client = new KongregateLeaderboards(async () => {
    if (++attempts === 1) throw new Error('CDN blocked');
    return api;
  }, () => clock);
  client.update(undefined); assert.equal(attempts, 0);
  client.update(scores); await tick();
  client.update(scores); await tick(); assert.equal(attempts, 1);
  state.guest = true; clock = 30_000; client.update(scores); await tick();
  assert.equal(attempts, 2); assert.equal(sent.length, 0);
  client.update(undefined); state.guest = false; state.login(); assert.equal(sent.length, 0);
  client.update({ ...scores, enemiesDefeated: NaN }, true); assert.equal(sent.length, 0);
  client.update(scores); assert.equal(sent.length, 3);
  client.dispose();
});

test('script download can retry, while SDK initialization is shared exactly once', async () => {
  const dom = new JSDOM('<!doctype html><html><head></head></html>');
  try {
    const win = dom.window as unknown as Window;
    const load = kongregateLoader(win, dom.window.document);
    const failed = load();
    const failure = assert.rejects(failed, /unavailable/);
    dom.window.document.querySelector('script')!.dispatchEvent(new dom.window.Event('error'));
    await failure;
    assert.equal(dom.window.document.querySelectorAll('script').length, 0);
    let initializations = 0, ready = () => {};
    const { api } = platform();
    const first = load(), second = load();
    assert.equal(dom.window.document.querySelectorAll('script').length, 1);
    Object.assign(win, { kongregateAPI: {
      loadAPI(callback: () => void) { initializations++; ready = callback; }, getAPI: () => api,
    } });
    dom.window.document.querySelector('script')!.dispatchEvent(new dom.window.Event('load'));
    await tick(); assert.equal(initializations, 1);
    ready(); assert.equal(await first, api); assert.equal(await second, api);
    assert.equal(await load(), api); assert.equal(initializations, 1);
  } finally { dom.window.close(); }
});

test('farm record survives weaker defense/reload; proofs and offline gold add no kills or wave wins', async () => {
  const factory = new IDBFactory(), name = 'leaderboard-session-test';
  let clock = 1000;
  const store = await openBattleStore(factory, name, () => clock);
  const live = await BattleSession.open(store, { now: () => clock, locks: null, guidedStart: false });
  assert.equal(await live.command(battle => battle.build('tower-02')), true);
  for (let step = 0; step < 1000 && !live.battle.liveClearedWaves.includes(1); step++) {
    live.advance(.25); await live.flush();
  }
  assert.equal(live.battle.highestCleared, 1);
  const rate = certifiedGoldPerMinute(live.certificate);
  assert.ok(rate > 0);
  assert.deepEqual(live.leaderboardScores, { highestWave: 1, bestGoldPerMinute: rate, enemiesDefeated: live.battle.kills });
  const previous = live.leaderboardScores!;
  await live.suspend(); clock += 60_000;
  const returned = await BattleSession.open(store, { now: () => clock, locks: null });
  assert.ok(returned.pendingReward);
  assert.equal(await returned.claimOffline(), true);
  assert.deepEqual(returned.leaderboardScores, previous);
  await returned.resumeActive();
  assert.equal(await returned.command(battle => battle.sell(battle.towers.find(tower => !tower.protected)!.uid)), true);
  assert.ok(certifiedGoldPerMinute(returned.certificate) <= rate);
  assert.deepEqual(returned.leaderboardScores, previous);
  await returned.close();
  const reopenedStore = await openBattleStore(factory, name, () => clock);
  const reopened = await BattleSession.open(reopenedStore, { now: () => clock, locks: null });
  assert.deepEqual(reopened.leaderboardScores, previous);
  await reopened.close();
  const temporary = await BattleSession.open(undefined, { guidedStart: false });
  assert.equal(temporary.leaderboardScores, undefined);
  await temporary.close();
});
