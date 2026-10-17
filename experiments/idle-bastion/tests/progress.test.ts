import assert from 'node:assert/strict';
import test from 'node:test';
import { IdleBattle } from '../src/battle';
import { certifyFarm, isFarmCertificateValid } from '../src/farming';
import { IncomeWindow, createProgress, recordAttempt, validProgress, HISTORY_LIMIT } from '../src/progress';

function until(battle: IdleBattle, condition: () => boolean, limit = 1200) {
  for (let i = 0; i < limit * 40 && !condition(); i++) battle.update(0.025);
  assert.ok(condition(), `Not reached at wave ${battle.wave}, phase ${battle.phase}`);
}

test('live starts and outcomes persist without replaying starts on reload; farm cycles stay separate', () => {
  let battle = new IdleBattle();
  until(battle, () => battle.wave === 1);
  assert.deepEqual(battle.progress.totals.advance, { attempts: 1, wins: 0, losses: 0 });
  const before = battle.snapshot();
  battle = IdleBattle.restore(JSON.parse(JSON.stringify(before)))!;
  assert.deepEqual(battle.progress, before.progress);
  until(battle, () => battle.highestCleared === 1);
  assert.deepEqual(battle.progress.waves[0].advance, { attempts: 1, wins: 1, losses: 0 });
  battle.mode = 'farm'; // Isolate a legal farm selection from the defeat test below.
  battle.setFarmWave(1);
  until(battle, () => battle.progress.totals.farm.wins === 2);
  assert.deepEqual(battle.progress.waves[0].farm, { attempts: 2, wins: 2, losses: 0 });
  assert.equal(battle.progress.totals.advance.attempts, 1);
  assert.deepEqual(IdleBattle.restore(battle.snapshot())!.progress, battle.progress);
});

test('a genuine defeat records the failed advance before switching to farm', () => {
  const battle = new IdleBattle();
  until(battle, () => battle.phase === 'defeat');
  const wave = battle.wave;
  assert.equal(battle.mode, 'farm');
  assert.equal(battle.progress.waves.find(row => row.wave === wave)!.advance.losses, 1);
  assert.equal(battle.progress.totals.farm.losses, 0);
  assert.deepEqual(battle.progress.lastDefeat, { wave, attemptId: battle.attemptId });
  const resumed = IdleBattle.restore(battle.snapshot())!;
  until(resumed, () => resumed.progress.totals.farm.wins === 1);
  assert.equal(resumed.progress.totals.advance.losses, 1);
  assert.equal(resumed.progress.totals.farm.attempts, 1);
});

test('schema four migration keeps combat and invalidates old rule proofs but does not invent old attempts', () => {
  const old = new IdleBattle();
  until(old, () => old.wave === 2);
  const certificate = certifyFarm(old)!;
  const { progress: ignored, ...snapshot } = old.snapshot();
  const restored = IdleBattle.restore({ ...snapshot, schemaVersion: 4, rulesVersion: 3 })!;
  assert.ok(restored);
  assert.equal(restored.gold, old.gold);
  assert.equal(restored.highestCleared, 1);
  assert.equal(isFarmCertificateValid(certificate, restored), false);
  assert.equal(restored.progress.sinceAttempt, old.attemptId + 1);
  until(restored, () => restored.highestCleared === 2);
  assert.deepEqual(restored.progress.totals.advance, { attempts: 0, wins: 0, losses: 0 });
  until(restored, () => restored.wave === 3);
  assert.deepEqual(restored.progress.totals.advance, { attempts: 1, wins: 0, losses: 0 });
  assert.ok(IdleBattle.restore(restored.snapshot()));
});

test('invalid statistics cannot be loaded and snapshots do not share mutable records', () => {
  const battle = new IdleBattle();
  until(battle, () => battle.highestCleared === 1);
  const snapshot = battle.snapshot();
  snapshot.progress.waves[0].advance.wins = 99;
  assert.equal(IdleBattle.restore(snapshot), undefined);
  assert.equal(battle.progress.waves[0].advance.wins, 1);
  const duplicate = battle.snapshot();
  duplicate.progress.waves.push(structuredClone(duplicate.progress.waves[0]));
  assert.equal(IdleBattle.restore(duplicate), undefined);
});

test('bounded wave history retains aggregate results and accepts a returning low farm wave', () => {
  const progress = createProgress();
  for (let id = 1; id <= HISTORY_LIMIT + 3; id++) {
    recordAttempt(progress, id, 'advance', id, 'attempts');
    recordAttempt(progress, id, 'advance', id, 'wins');
  }
  recordAttempt(progress, 1, 'farm', HISTORY_LIMIT + 4, 'attempts');
  recordAttempt(progress, 1, 'farm', HISTORY_LIMIT + 4, 'wins');
  assert.equal(progress.waves.length, HISTORY_LIMIT);
  assert.equal(progress.waves.at(-1)!.wave, 1);
  assert.equal(progress.totals.advance.wins, HISTORY_LIMIT + 3);
  assert.ok(validProgress(progress, HISTORY_LIMIT + 4, 0));
});

test('live income warms up, rolls over 60 active seconds and resets on rollback', () => {
  const income = new IncomeWindow();
  assert.deepEqual(income.observe(0, 0), { perMinute: null, seconds: 0 });
  assert.equal(income.observe(10, 20).perMinute, null);
  assert.equal(income.observe(20, 40).perMinute, 120);
  assert.equal(income.observe(20, 40).seconds, 20, 'Pause does not add measured time');
  assert.equal(income.observe(60, 120).perMinute, 120);
  assert.equal(income.observe(80, 180).perMinute, 140);
  assert.equal(income.observe(1, 0).perMinute, null, 'Rollback starts a fresh window');
});

test('purchases, sales and offline claims do not change battle-earned production', () => {
  const battle = new IdleBattle();
  const tower = battle.build('tower-02')!;
  assert.ok(tower);
  const earned = battle.progress.battleGold;
  battle.sell(tower.uid);
  battle.creditOfflineUnits(100000);
  battle.upgrade(battle.towers[0].uid);
  assert.equal(battle.progress.battleGold, earned);
});
