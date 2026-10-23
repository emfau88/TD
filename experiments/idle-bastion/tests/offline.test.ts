import assert from 'node:assert/strict';
import test from 'node:test';
import {
  OFFLINE, activateOffline, beginAbsence, checkpointActive, claimOffline,
  createOfflineState, reserveOffline, restoreOffline, type OfflineState,
} from '../src/offline';
import type { FarmCertificate } from '../src/farming';

const START = 1_000_000;
const BASIS: FarmCertificate = { wave: 1, fingerprint: 'defense-a', rulesVersion: 1, rewardGold: 200, durationMs: 120_000 };
const start = (basis: FarmCertificate | null = BASIS, paused = false): OfflineState =>
  beginAbsence(createOfflineState(START), START, basis, paused);

test('30 seconds, 10 minutes, 1 hour and 3 hours reserve 60% with the same two-hour cap', () => {
  for (const duration of [30_000, 600_000, 3_600_000, 10_800_000]) {
    const state = reserveOffline(start(), START + duration);
    assert.equal(state.pendingReward?.amountUnits, Math.min(duration, OFFLINE.limitMs));
    assert.equal(state.pendingReward?.elapsedMs, duration);
    assert.equal(state.pendingReward?.creditedMs, Math.min(duration, OFFLINE.limitMs));
    assert.equal(state.window?.usedMs, Math.min(duration, OFFLINE.limitMs));
    assert.deepEqual(restoreOffline(JSON.parse(JSON.stringify(state))), state);
  }
});

test('explicit pause and absence without a certified autonomous rate generate no gold', () => {
  for (const state of [start(BASIS, true), start(null)]) {
    const reserved = reserveOffline(state, START + 3_600_000);
    assert.equal(reserved.pendingReward?.amountUnits, 0);
    assert.equal(reserved.pendingReward?.creditedMs, 0);
    assert.equal(reserved.window?.usedMs, 0);
  }
  assert.equal(createOfflineState(START).baseline.certificate, null);
});

test('closing and reopening before claim consumes only the remaining cap of the original window', () => {
  const initial = reserveOffline(start(), START + 3_600_000);
  const id = initial.pendingReward!.id;
  const reopened = restoreOffline(JSON.parse(JSON.stringify(initial)))!;
  const later = reserveOffline(reopened, START + 10_800_000);
  assert.equal(later.pendingReward?.id, id);
  assert.equal(later.pendingReward?.amountUnits, OFFLINE.limitMs);
  assert.equal(later.window?.from, START);
  assert.equal(later.window?.usedMs, OFFLINE.limitMs);
  const claimed = claimOffline(later, id);
  assert.equal(claimed.amountUnits, OFFLINE.limitMs);
  assert.ok(claimed.state.window, 'A claim does not end the absence window.');
  const closedAgain = reserveOffline(claimed.state, START + 14_400_000);
  assert.equal(closedAgain.pendingReward?.amountUnits, 0);
  assert.equal(closedAgain.window?.usedMs, OFFLINE.limitMs);
  assert.notEqual(closedAgain.pendingReward?.id, id);
});

test('claims are idempotent, wrong IDs do nothing and only actual active play starts a fresh window', () => {
  const pending = reserveOffline(start(), START + 30_000);
  const wrong = claimOffline(pending, 'wrong-reward');
  assert.equal(wrong.amountUnits, 0);
  assert.deepEqual(wrong.state, pending);
  assert.throws(() => activateOffline(pending, START + 30_000, BASIS, false), /Claim/);
  const claimed = claimOffline(pending, pending.pendingReward!.id);
  assert.equal(claimed.amountUnits, 30_000);
  assert.equal(claimOffline(claimed.state, pending.pendingReward!.id).amountUnits, 0);
  const active = activateOffline(claimed.state, START + 30_000, BASIS, false);
  assert.equal(active.window, null);
  const later = beginAbsence(active, START + 40_000, BASIS, false);
  assert.notEqual(later.window?.id, pending.window?.id);
  assert.equal(reserveOffline(later, START + 70_000).pendingReward?.amountUnits, 30_000);
});

test('backwards clock jumps never move the high-water cursor back or repay a reserved interval', () => {
  const first = reserveOffline(start(), START + 60_000);
  const backward = reserveOffline(first, START - 500_000);
  assert.deepEqual(backward, first);
  const caughtUp = reserveOffline(backward, START + 30_000);
  assert.deepEqual(caughtUp, first);
  const forward = reserveOffline(caughtUp, START + 90_000);
  assert.equal(forward.pendingReward?.amountUnits, 90_000);
  assert.equal(forward.window?.cursorHighWater, START + 90_000);
});

test('the certificate and paused state are frozen at the original departure', () => {
  const old = start();
  const morePowerful = { ...BASIS, rewardGold: BASIS.rewardGold * 10, fingerprint: 'defense-b' };
  const attemptedReset = beginAbsence(old, START + 20_000, morePowerful, false);
  assert.deepEqual(attemptedReset, old);
  assert.equal(reserveOffline(attemptedReset, START + 30_000).pendingReward?.amountUnits, 30_000);
  const paused = start(BASIS, true);
  assert.equal(reserveOffline(beginAbsence(paused, START + 20_000, BASIS, false), START + 30_000).pendingReward?.amountUnits, 0);
});

test('confirmed active checkpoints and absence share a single non-overlapping time boundary', () => {
  const initial = checkpointActive(createOfflineState(START), START, BASIS, false);
  const afterActive = checkpointActive(initial, START + 10_000, BASIS, false);
  // Abrupt close after the last confirmed active checkpoint: only its tail counts.
  const crashReturn = reserveOffline(afterActive, START + 40_000);
  assert.equal(crashReturn.pendingReward?.amountUnits, 30_000);
  assert.equal(crashReturn.window?.from, START + 10_000);
  assert.throws(() => checkpointActive(crashReturn, START + 40_000, BASIS, false), /Resume/);
  // A normal visibility boundary advances past actively simulated time as well.
  const hidden = beginAbsence(afterActive, START + 15_000, BASIS, false);
  assert.equal(reserveOffline(hidden, START + 40_000).pendingReward?.amountUnits, 25_000);
});

test('exact rational currency remainders survive tiny repeated reservations, claims and JSON round trips', () => {
  const tiny = { ...BASIS, rewardGold: 1, durationMs: 7 };
  let state = start(tiny), total = 0;
  for (let duration = 1; duration <= 7; duration++) {
    state = reserveOffline(state, START + duration);
    const claimed = claimOffline(state, state.pendingReward!.id);
    state = restoreOffline(JSON.parse(JSON.stringify(claimed.state)))!;
    total += claimed.amountUnits;
  }
  assert.equal(total, 600);
  assert.deepEqual(state.roundingRemainder, { numerator: '0', denominator: '1' });
  assert.equal(reserveOffline(start(tiny), START + 7).pendingReward?.amountUnits, total);
});

test('fractional units carry into future windows even when the certified rate changes', () => {
  const seven = { ...BASIS, rewardGold: 1, durationMs: 7 };
  const eleven = { ...BASIS, rewardGold: 1, durationMs: 11 };
  const first = reserveOffline(start(seven), START + 1);
  const claimOne = claimOffline(first, first.pendingReward!.id);
  assert.equal(claimOne.amountUnits, 85);
  const active = activateOffline(claimOne.state, START + 1, eleven, false);
  const second = reserveOffline(beginAbsence(active, START + 2, eleven, false), START + 3);
  assert.equal(second.pendingReward?.amountUnits, 55);
  assert.deepEqual(second.roundingRemainder, { numerator: '20', denominator: '77' });
});

test('invalid saved cursors, caps, pending amounts, versions and fractional remainders are rejected', () => {
  const good = reserveOffline(start(), START + 60_000);
  const changes: ((state: any) => void)[] = [
    state => { state.schemaVersion = 2; },
    state => { state.window.cursorHighWater = START - 1; },
    state => { state.window.usedMs = OFFLINE.limitMs + 1; },
    state => { state.pendingReward.amountUnits = Number.MAX_SAFE_INTEGER; },
    state => { state.pendingReward.creditedMs = -1; },
    state => { state.roundingRemainder = { numerator: '1', denominator: '1' }; },
    state => { state.roundingRemainder = { numerator: '-1', denominator: '2' }; },
    state => { state.baseline.certificate = null; },
  ];
  for (const change of changes) {
    const invalid = structuredClone(good);
    change(invalid);
    assert.equal(restoreOffline(invalid), undefined);
  }
  assert.throws(() => reserveOffline(good, Number.NaN), /time/);
  assert.throws(() => checkpointActive(createOfflineState(START), START, { ...BASIS, rewardGold: -1 }, false), /certificate/);
});

test('the first B04 schema-one policy defaults migrate without resetting a pending absence window', () => {
  const original = reserveOffline(start({ ...BASIS, rewardGold: 1, durationMs: 7 }), START + 1);
  const legacy = JSON.parse(JSON.stringify(original));
  delete legacy.baseline.efficiencyPermille;
  delete legacy.baseline.limitMs;
  delete legacy.window.efficiencyPermille;
  delete legacy.window.limitMs;
  const migrated = restoreOffline(legacy);
  assert.deepEqual(migrated, original);
  assert.deepEqual(migrated?.pendingReward, original.pendingReward);
  assert.deepEqual(migrated?.roundingRemainder, original.roundingRemainder);
  assert.equal(reserveOffline(migrated!, START + 7).pendingReward?.amountUnits, 600);
  const active = createOfflineState(START);
  const oldActive = JSON.parse(JSON.stringify(active));
  delete oldActive.baseline.efficiencyPermille;
  delete oldActive.baseline.limitMs;
  assert.deepEqual(restoreOffline(oldActive), active);
});

test('policy migration never replaces an explicitly contradictory or malformed saved policy', () => {
  const original = reserveOffline(start(), START + 30_000);
  for (const target of ['baseline', 'window'] as const) {
    for (const [key, wrong] of [['efficiencyPermille', 650], ['limitMs', 8 * 60 * 60 * 1000], ['limitMs', undefined]] as const) {
      const invalid = structuredClone(original) as any;
      invalid[target][key] = wrong;
      assert.equal(restoreOffline(invalid), undefined);
    }
  }
});

test('known historical departure proofs retain their original production basis', () => {
  for (const rulesVersion of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) {
    const basis = { ...BASIS, rulesVersion, fingerprint: `defense-rules-${rulesVersion}` };
    const pending = reserveOffline(start(basis), START + 30_000);
    const restored = restoreOffline(JSON.parse(JSON.stringify(pending)));
    assert.deepEqual(restored, pending);
    assert.equal(restored?.window?.certificate?.rulesVersion, rulesVersion);
    assert.equal(restored?.baseline.certificate?.fingerprint, basis.fingerprint);
    assert.equal(reserveOffline(restored!, START + 60_000).pendingReward?.amountUnits, 60_000);
  }
  const future = JSON.parse(JSON.stringify(start()));
  future.baseline.certificate.rulesVersion = future.window.certificate.rulesVersion = 16;
  assert.equal(restoreOffline(future), undefined);
});
