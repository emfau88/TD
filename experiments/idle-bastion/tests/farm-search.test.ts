import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { BASE, BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION, IdleBattle } from '../src/battle';
import { certifyFarm, farmRewardGold, isFarmCertificateValid, MAX_FARM_CANDIDATES, MAX_FARM_PROBE_STEPS, type FarmCertificate } from '../src/farming';
import { beginAbsence, createOfflineState, offlinePolicy, reserveOffline } from '../src/offline';
import { openBattleStore } from '../src/save-store';
import { BattleSession } from '../src/battle-session';

function paid(strategy: string, wave: number): IdleBattle {
  const file = new URL(`../../../artifacts/idle-bastion/acceptance/b16/economy/${strategy}-wave${wave}-earned.json`, import.meta.url);
  const battle = IdleBattle.restore(JSON.parse(readFileSync(file, 'utf8')));
  assert.ok(battle); return battle;
}
function prior(battle: IdleBattle): FarmCertificate {
  const copy = IdleBattle.restore({ ...battle.snapshot(), liveClearedWaves: [1, battle.farmWave] });
  assert.ok(copy); const proof = certifyFarm(copy); assert.ok(proof);
  assert.equal(proof.wave, battle.farmWave); assert.ok(isFarmCertificateValid(proof, battle)); return proof;
}
function measured(battle: IdleBattle, previous?: FarmCertificate) {
  const update = IdleBattle.prototype.update;
  const probes = new Map<IdleBattle, {wave: number; steps: number; clears: number; lives: number}>();
  IdleBattle.prototype.update = function(seconds: number) {
    let row = probes.get(this);
    if (!row) { row = { wave: this.wave, steps: 0, clears: 0, lives: BASE.coreLives }; probes.set(this, row); }
    update.call(this, seconds); row.steps++; row.lives = Math.min(row.lives, this.lives);
    row.clears += this.events.filter(e => e.type === 'clear').length;
  };
  try { return { proof: certifyFarm(battle, previous), probes: [...probes.values()] }; }
  finally { IdleBattle.prototype.update = update; }
}
const rate = (proof: FarmCertificate) => farmRewardGold(proof) * 60000 / proof.durationMs;

test('paid defenses at 40/50/60/70 improve or retain income, with at most four genuine two-clear probes and no live mutation', () => {
  const expected = { control: [31, 36, 41, 46], 'one-storm': [26, 26, 43, 48], 'two-storms': [26, 26, 43, 48] };
  for (const [strategy, selected] of Object.entries(expected)) for (const [index, wave] of [40, 50, 60, 70].entries()) {
    const b = paid(strategy, wave), old = prior(b), before = b.snapshot(), events = structuredClone(b.events);
    for (const previous of [undefined, old]) {
      const { proof, probes } = measured(b, previous); assert.ok(proof);
      assert.equal(proof.wave, selected[index]); assert.ok(rate(proof) >= rate(old));
      assert.ok(isFarmCertificateValid(proof, b)); assert.ok(probes.length <= MAX_FARM_CANDIDATES);
      for (const probe of probes) {
        assert.ok(before.liveClearedWaves.includes(probe.wave)); assert.ok(probe.wave <= before.highestCleared);
        assert.ok(probe.steps <= MAX_FARM_PROBE_STEPS);
        if (probe.wave === proof.wave) { assert.equal(probe.clears, 2); assert.equal(probe.lives, BASE.coreLives); }
      }
      if (previous?.wave === proof.wave) assert.deepEqual(proof, previous);
      assert.deepEqual(b.snapshot(), before); assert.deepEqual(b.events, events);
    }
  }
});

test('sparse history picks an actually cleared midpoint, breaks ties downwards and never guesses missing waves', () => {
  const b = paid('control', 40), old = prior(b);
  for (const w of [1, 23, 31, 32, 40]) assert.ok(b.liveClearedWaves.includes(w));
  b.liveClearedWaves = [1, 23, 31, 32, 40];
  const result = measured(b, old);
  assert.equal(result.proof?.wave, 31); assert.ok(result.probes.some(p => p.wave === 31));
  assert.ok(!result.probes.some(p => p.wave === 32));
  b.liveClearedWaves = [1, 23, 32, 40];
  assert.ok(measured(b, old).probes.some(p => p.wave === 32));
  b.liveClearedWaves = []; b.farmWave = 1;
  assert.equal(certifyFarm(b), undefined); // A high record alone never unlocks farming.
  b.liveClearedWaves = [15, 25, 999];
  assert.equal(certifyFarm(b), undefined);
});

test('a leaky or economically worse midpoint preserves the exact valid proof without re-proving it', () => {
  const b = paid('one-storm', 50), previous = prior(b), { proof, probes } = measured(b, previous);
  assert.deepEqual(proof, previous); assert.ok(!probes.some(p => p.wave === previous.wave));
  assert.ok(probes.some(p => p.wave === 38));
  assert.equal(isFarmCertificateValid(previous, b), true);
});

test('upgrades or harmful sales require fresh proof, while an unsafe former choice cannot survive through its old rate', () => {
  const b = paid('control', 40), previous = prior(b);
  for (const tower of [...b.towers]) if (!tower.protected) assert.ok(b.sell(tower.uid));
  assert.equal(isFarmCertificateValid(previous, b), false);
  const { proof, probes } = measured(b, previous); assert.ok(proof);
  assert.notEqual(proof.fingerprint, previous.fingerprint); assert.ok(isFarmCertificateValid(proof, b));
  const selected = probes.find(p => p.wave === proof.wave); assert.ok(selected);
  assert.equal(selected.clears, 2); assert.equal(selected.lives, BASE.coreLives);
});

test('entry pruning never creates evidence: first clear still needs two cycles, and skipped entry cannot beat the proven rate', () => {
  const fresh = new IdleBattle();
  assert.equal(measured(fresh).proof, undefined);
  for (let i = 0; i < 8000 && !fresh.highestCleared; i++) fresh.update(BASE.stepSeconds);
  const first = measured(fresh); assert.ok(first.proof);
  assert.equal(first.proof.wave, 1); assert.equal(first.proof.rewardGold, 140);
  assert.equal(first.proof.durationMs, 21100); assert.equal(first.probes[0].clears, 2);
  const b = paid('control', 40), full = measured(b); assert.ok(full.proof);
  assert.ok(!full.probes.some(p => p.wave === 1));
  const entry = IdleBattle.restore({ ...b.snapshot(), farmWave: 1, liveClearedWaves: [1] }); assert.ok(entry);
  const entryProof = measured(entry); assert.ok(entryProof.proof); assert.equal(entryProof.probes[0].clears, 2);
  assert.ok(rate(full.proof) > rate(entryProof.proof));
});

for (const historicalRules of [14, 15]) test(`native reload preserves the pending rules-${historicalRules} receipt, pays it once and uses better proof only for future absence`, async () => {
  const b = paid('control', 50), old = { ...prior(b), rulesVersion: historicalRules };
  const before = b.snapshot(), at = 1000, now = 61000;
  const offline = reserveOffline(beginAbsence(createOfflineState(at), at, old, false, offlinePolicy(b.settlement.warehouseBuilt)), now);
  assert.ok(offline.pendingReward); const receipt = structuredClone(offline.pendingReward);
  const factory = new IDBFactory(), name = `farm-search-rules-${historicalRules}`;
  let store = await openBattleStore(factory, name, () => now);
  await store.save(before, false, 0, { offline }); store.close();
  store = await openBattleStore(factory, name, () => now);
  let session = await BattleSession.open(store, { now: () => now, locks: null });
  assert.equal(session.battle.snapshot().schemaVersion, BATTLE_SCHEMA_VERSION); assert.equal(session.certificate?.rulesVersion, BATTLE_RULES_VERSION);
  assert.equal(session.certificate?.wave, 36); assert.deepEqual(session.pendingReward, receipt);
  assert.deepEqual(session.battle.snapshot(), { ...before, farmWave: 36 });
  const units = session.battle.gold * 1000 + session.battle.goldRemainderUnits;
  assert.equal(await session.claimOffline(), true); assert.equal(await session.claimOffline(), false);
  assert.equal(session.battle.gold * 1000 + session.battle.goldRemainderUnits - units, receipt.amountUnits);
  const after = session.battle.snapshot(); await session.close();
  store = await openBattleStore(factory, name, () => now);
  session = await BattleSession.open(store, { now: () => now, locks: null });
  assert.deepEqual(session.battle.snapshot(), after);
  assert.ok(!session.pendingReward || session.pendingReward.amountUnits === 0);
  if (session.pendingReward) await session.claimOffline(); else await session.resumeActive();
  assert.equal(session.offline.baseline.certificate?.wave, session.certificate?.wave);
  const future = reserveOffline(beginAbsence(session.offline, now, session.certificate, false, offlinePolicy(true)), now + 60000);
  assert.ok(future.pendingReward!.amountUnits > receipt.amountUnits);
  await session.close();
});

test('current and historical in-flight combat resumes identically after a read-only farm search', () => {
  for (const path of ['b16/economy/one-storm-wave40.json', 'local-enemy-assets/merge-ready/historical-live46-v27.json']) {
    const raw = JSON.parse(readFileSync(new URL(`../../../artifacts/idle-bastion/acceptance/${path}`, import.meta.url), 'utf8'));
    const b = IdleBattle.restore(raw), control = IdleBattle.restore(raw); assert.ok(b); assert.ok(control);
    const before = b.snapshot(); certifyFarm(b); assert.deepEqual(b.snapshot(), before);
    for (let i = 0; i < 160; i++) { b.update(BASE.stepSeconds); control.update(BASE.stepSeconds); }
    assert.deepEqual(b.snapshot(), control.snapshot()); assert.deepEqual(b.drainEvents(), control.drainEvents());
  }
});
