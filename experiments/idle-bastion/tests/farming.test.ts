import assert from 'node:assert/strict';
import test from 'node:test';
import { BASE, IdleBattle, isNormalFarmWave, upgradeCost } from '../src/battle';
import { certifyFarm, defenseFingerprint, isFarmCertificateValid, type FarmCertificate } from '../src/farming';

function until(battle: IdleBattle, condition: () => boolean, seconds = 1200): void {
  for (let step = 0; step < seconds / BASE.stepSeconds && !condition(); step++) battle.update(BASE.stepSeconds);
  assert.ok(condition(), `Unreached condition at ${battle.elapsed}s, wave ${battle.wave}, phase ${battle.phase}.`);
}
function firstClear(): IdleBattle {
  const battle = new IdleBattle();
  until(battle, () => battle.highestCleared === 1);
  return battle;
}
function equipped(): IdleBattle {
  const battle = new IdleBattle();
  battle.build('tower-02');
  for (let step = 0; step < 50000 && battle.highestCleared < 8; step++) {
    for (const pad of ['tower-03', 'tower-04']) if (battle.canBuild(pad)) battle.build(pad);
    for (const tower of battle.towers) if (!tower.protected && tower.level < 3 && battle.gold >= upgradeCost(tower)) battle.upgrade(tower.uid);
    battle.update(BASE.stepSeconds);
  }
  assert.equal(battle.highestCleared, 8);
  return battle;
}
const small = (certificate: FarmCertificate | undefined) => certificate && {
  wave: certificate.wave, rewardGold: certificate.rewardGold, durationMs: certificate.durationMs,
};

test('no live completion means no certificate or fabricated starter rate', () => {
  const battle = new IdleBattle();
  assert.equal(certifyFarm(battle), undefined);
  battle.highestCleared = 12; // A record alone is deliberately insufficient evidence.
  assert.equal(certifyFarm(battle), undefined);
  assert.equal(battle.setFarmWave(12), false);
  assert.equal(battle.setFarmWave(0), true);
  assert.equal(battle.farmWave, 1);
  assert.equal(battle.requestAdvance(), false);
});

test('first real clear proves two conservative no-damage cycles including both pauses without touching live state or events', () => {
  const battle = firstClear();
  const before = battle.snapshot(), events = structuredClone(battle.events);
  const certificate = certifyFarm(battle);
  assert.deepEqual(small(certificate), { wave: 1, rewardGold: 140, durationMs: 21100 });
  assert.ok(isFarmCertificateValid(certificate, battle));
  assert.deepEqual(battle.snapshot(), before);
  assert.deepEqual(battle.events, events);
  assert.deepEqual(certifyFarm(battle, certificate), certificate);
});

test('combat timers and money do not invalidate a proof; a purchase or upgrade does', () => {
  const battle = firstClear(), certificate = certifyFarm(battle)!;
  const fingerprint = defenseFingerprint(battle);
  battle.update(0.025);
  battle.creditOfflineUnits(1250);
  assert.equal(defenseFingerprint(battle), fingerprint);
  assert.equal(isFarmCertificateValid(certificate, battle), true);
  assert.equal(battle.upgrade(battle.towers[0].uid), true);
  assert.equal(isFarmCertificateValid(certificate, battle), false);
  const upgraded = certifyFarm(battle)!;
  assert.ok(isFarmCertificateValid(upgraded, battle));
  battle.gold += 75; // Purchase fixture isolates the structural fingerprint.
  assert.ok(battle.build('tower-02'));
  assert.equal(isFarmCertificateValid(upgraded, battle), false);
});

test('a harmful sale immediately invalidates the old defense and selects a genuinely safe lower proof', () => {
  const battle = equipped(), previous = certifyFarm(battle)!;
  assert.ok(previous.wave > 1 && previous.wave <= battle.highestCleared);
  assert.equal(battle.setFarmWave(previous.wave), true);
  for (const tower of [...battle.towers]) if (!tower.protected) battle.sell(tower.uid);
  assert.equal(isFarmCertificateValid(previous, battle), false);
  const next = certifyFarm(battle, previous)!;
  assert.equal(next.wave, 1);
  assert.ok(next.wave < previous.wave);
  assert.equal(isFarmCertificateValid(next, battle), true);
  assert.equal(battle.setFarmWave(next.wave), true);
});

test('a successful but damaged real wave is not safe; previous valid evidence survives a newer leaky clear', () => {
  const battle = firstClear(), previous = certifyFarm(battle)!;
  until(battle, () => battle.highestCleared === 4);
  assert.ok(battle.lives < BASE.coreLives);
  const before = battle.snapshot();
  const onlyLeaky = IdleBattle.restore({ ...before, liveClearedWaves: [4] })!;
  assert.ok(onlyLeaky);
  assert.equal(certifyFarm(onlyLeaky), undefined);
  assert.deepEqual(certifyFarm(battle, previous), previous);
  assert.deepEqual(battle.snapshot(), before);
});

test('defeat returns to a fresh farm attempt, repeats it and never advances until the queued command crosses a boundary', () => {
  const battle = firstClear();
  battle.setFarmWave(certifyFarm(battle)!.wave);
  until(battle, () => battle.phase === 'defeat');
  const failedWave = battle.wave, highest = battle.highestCleared, gold = battle.gold, failedAttempt = battle.attemptId;
  assert.equal(battle.mode, 'farm');
  battle.update(BASE.stepSeconds);
  assert.equal(battle.phase, 'intermission');
  assert.equal(battle.lives, 20);
  assert.equal(battle.remaining, 0);
  assert.deepEqual(battle.shots, []);
  assert.equal(battle.gold, gold);
  until(battle, () => battle.attemptId === failedAttempt + 1);
  assert.equal(battle.wave, 1);
  assert.equal(battle.lives, 20);
  until(battle, () => battle.attemptId === failedAttempt + 2);
  assert.equal(battle.wave, 1);
  assert.equal(battle.highestCleared, highest);
  const activeAttempt = battle.attemptId;
  assert.equal(battle.requestAdvance(), true);
  assert.equal(battle.requestAdvance(), false);
  assert.equal(battle.wave, 1);
  assert.equal(battle.attemptId, activeAttempt);
  const restored = IdleBattle.restore(battle.snapshot())!;
  assert.equal(restored.advanceRequested, true);
  until(restored, () => restored.attemptId === activeAttempt + 1);
  assert.equal(restored.wave, highest + 1);
  assert.equal(restored.wave, failedWave);
  assert.equal(restored.mode, 'advance');
  assert.equal(restored.advanceRequested, false);
});

test('snapshot v1 migration retains combat exactly and invents neither a certificate nor live-clear history', () => {
  const battle = new IdleBattle(undefined, { maraBonus: false });
  until(battle, () => battle.highestCleared === 1);
  battle.update(2.5);
  const modern = battle.snapshot();
  const { mara, goldRemainderUnits, mode, highestCleared, attemptId, liveClearedWaves, farmWave, advanceRequested, ...old } = modern;
  const legacy = { ...old, schemaVersion: 1, layoutVersion: 1, rulesVersion: 1 };
  const migrated = IdleBattle.restore(legacy, { maraBonus: false })!;
  assert.ok(migrated);
  assert.equal(migrated.snapshot().schemaVersion, 10);
  assert.equal(migrated.highestCleared, 1);
  assert.equal(migrated.attemptId, 2);
  assert.deepEqual(migrated.liveClearedWaves, []);
  assert.equal(certifyFarm(migrated), undefined);
  assert.equal(migrated.goldRemainderUnits, 0);
  battle.drainEvents();
  assert.deepEqual(migrated.drainEvents(), []);
  for (let step = 0; step < 80; step++) {
    battle.update(0.025); migrated.update(0.025);
    const a = battle.snapshot(), b = migrated.snapshot();
    assert.deepEqual(b.towers, a.towers);
    assert.deepEqual(b.enemies, a.enemies);
    assert.deepEqual(b.shots, a.shots);
    assert.deepEqual(b.queue, a.queue);
    assert.equal(b.gold, a.gold);
    assert.equal(b.pendingTime, a.pendingTime);
    assert.equal(b.attemptId, a.attemptId);
  }
  assert.equal(IdleBattle.restore({ ...legacy, gold: -1 }), undefined);
  assert.deepEqual(migrated.drainEvents(), battle.drainEvents());
});

test('offline thousandths survive repeated credits, spending and snapshots; invalid amounts are atomic', () => {
  const battle = new IdleBattle();
  battle.creditOfflineUnits(750);
  assert.equal(battle.gold, 75); assert.equal(battle.goldRemainderUnits, 750);
  assert.ok(battle.build('tower-02'));
  assert.equal(battle.gold, 0); assert.equal(battle.goldRemainderUnits, 750);
  const restored = IdleBattle.restore(battle.snapshot())!;
  restored.creditOfflineUnits(1250);
  assert.equal(restored.gold, 2); assert.equal(restored.goldRemainderUnits, 0);
  restored.creditOfflineUnits(1);
  assert.equal(restored.goldRemainderUnits, 1);
  const before = restored.snapshot();
  for (const value of [-1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.throws(() => restored.creditOfflineUnits(value), /Invalid offline/);
    assert.deepEqual(restored.snapshot(), before);
  }
});

test('current progress and certificate fields reject invalid histories, references, versions and numeric limits', () => {
  const battle = firstClear(), good = battle.snapshot(), certificate = certifyFarm(battle)!;
  const mutations = [
    { mode: 'wrong' }, { highestCleared: -1 }, { attemptId: 0 }, { farmWave: 9 }, { farmWave: 15 },
    { liveClearedWaves: [1, 1] }, { liveClearedWaves: [2] }, { liveClearedWaves: [1, 15] },
    { goldRemainderUnits: -1 }, { goldRemainderUnits: 1000 }, { goldRemainderUnits: 0.5 },
    { mode: 'advance', advanceRequested: true }, { schemaVersion: 10 },
  ];
  for (const fields of mutations) assert.equal(IdleBattle.restore({ ...good, ...fields }), undefined, JSON.stringify(fields));
  for (const fields of [
    { wave: 2 }, { wave: 15 }, { rulesVersion: 6 }, { fingerprint: 'stale' },
    { rewardGold: 0 }, { rewardGold: Infinity }, { rewardGold: 0.5 },
    { durationMs: -1 }, { durationMs: 4001 }, { durationMs: 999999999 },
  ]) assert.equal(isFarmCertificateValid({ ...certificate, ...fields }, battle), false, JSON.stringify(fields));
  assert.equal(isNormalFarmWave(15), false); assert.equal(isNormalFarmWave(25), false);
  assert.equal(isNormalFarmWave(1), true);
});


test('a valid non-entry proof survives later leaky clears with unchanged defense', () => {
  const battle = equipped(), previous = certifyFarm(battle)!;
  assert.ok(previous.wave > 1);
  battle.setFarmWave(previous.wave);
  until(battle, () => battle.phase === 'defeat', 3000);
  assert.ok(battle.highestCleared > previous.wave + 1);
  assert.ok(isFarmCertificateValid(previous, battle));
  const result = certifyFarm(battle, previous)!;
  assert.ok(result.rewardGold * previous.durationMs >= previous.rewardGold * result.durationMs);
  assert.ok(isFarmCertificateValid(result, battle));
});

test('bounded live history pins both entry evidence and the currently certified farm wave', () => {
  const initial = new IdleBattle();
  until(initial, () => initial.shots.length > 0);
  const snapshot = initial.snapshot();
  snapshot.wave = 49; snapshot.highestCleared = 48; snapshot.attemptId = 49;
  snapshot.progress.waves[0].wave = 49; // Match the artificially moved active attempt.
  snapshot.farmWave = 3;
  snapshot.liveClearedWaves = [1, 3, ...Array.from({ length: 31 }, (_, index) => index + 18).filter(wave => wave !== 25)];
  assert.equal(snapshot.liveClearedWaves.length, 32);
  const target = snapshot.enemies.find(enemy => enemy.uid === snapshot.shots[0].target)!;
  target.maxHp = BASE.enemies[target.defId].hp * Math.min(BASE.waves.maxHpMultiplier, Math.pow(BASE.waves.hpGrowth, 48));
  target.hp = 1;
  snapshot.enemies = [target]; snapshot.queue = [];
  snapshot.shots = [snapshot.shots[0]];
  snapshot.shots[0].x = target.x; snapshot.shots[0].y = target.y;
  const battle = IdleBattle.restore(snapshot)!;
  assert.ok(battle);
  battle.update(BASE.stepSeconds);
  assert.equal(battle.highestCleared, 49);
  assert.equal(battle.liveClearedWaves.length, 32);
  assert.ok(battle.liveClearedWaves.includes(1));
  assert.ok(battle.liveClearedWaves.includes(3));
  assert.ok(battle.liveClearedWaves.includes(49));
  assert.ok(IdleBattle.restore(battle.snapshot()));
});
