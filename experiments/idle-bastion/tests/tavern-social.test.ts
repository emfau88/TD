import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, BASE } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifyFarm, defenseFingerprint } from '../src/farming';
import { createOfflineState, beginAbsence, reserveOffline } from '../src/offline';
import { SOCIAL, createSocial, grantMilestoneGifts, stepSocial, recordSocialClear, interact, hearts } from '../src/tavern-social';

// Boundary fixtures, not a claim of a manually played wave-25 campaign.
function veteran(built = true) {
  const b = new IdleBattle(); b.update(4); b.gold = 12000; b.highestCleared = 25;
  b.bossVictories = 1; b.secondBossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.update(BASE.stepSeconds); b.wispArrival.met = true; b.discovery = 'off';
  if (built) { assert.ok(b.buildTavern(b.recommendedTavernPlot!)); assert.ok(b.upgradeTavern()); }
  assert.ok(IdleBattle.restore(b.snapshot())); return b;
}

test('legacy migration grants only proven milestone gifts once and preserves all battle data', () => {
  for (const built of [false, true]) for (const recruited of [false, true]) {
    if (recruited && !built) continue;
    const b = veteran(built); if (recruited) b.recruitIlyra();
    const legacy: any = b.snapshot(); legacy.schemaVersion = 23; delete legacy.social;
    const original = structuredClone(legacy), loaded = IdleBattle.restore(legacy)!;
    assert.deepEqual(legacy, original); assert.equal(loaded.social.gifts, built ? 3 : 2);
    const upgraded: any = loaded.snapshot(); upgraded.schemaVersion = 23; delete upgraded.social;
    assert.deepEqual(upgraded, original);
    if (built) loaded.interactCompanion('mara', 'gift');
    const once = loaded.snapshot(); assert.deepEqual(IdleBattle.restore(once)!.snapshot(), once);
  }
  const b = veteran(false); b.bossVictories = 0; b.secondBossVictories = 0;
  const legacy: any = b.snapshot(); legacy.schemaVersion = 23; delete legacy.social;
  const loaded = IdleBattle.restore(legacy)!;
  assert.equal(loaded.social.gifts, 0); // A high wave record is no boss proof.
  assert.ok(loaded.buildTavern(loaded.recommendedTavernPlot!)); assert.equal(loaded.social.gifts, 1);
});

test('per-character allowances persist, gifts are shared, locked Ilyra and unsupported targets spend nothing', () => {
  const b = veteran(), before = b.snapshot();
  assert.equal(b.interactCompanion('ilyra', 'gift').reason, 'locked');
  assert.equal(b.interactCompanion('wisp' as any, 'gift').reason, 'invalid');
  assert.deepEqual(b.snapshot(), before);
  assert.equal(b.interactCompanion('mara', 'talk').points, 8);
  assert.equal(b.interactCompanion('mara', 'talk').points, 8);
  const limited = b.snapshot(); assert.deepEqual(b.interactCompanion('mara', 'talk'), { accepted: true, points: 0, reason: 'limit' });
  assert.deepEqual(b.snapshot(), limited);
  assert.equal(IdleBattle.restore(limited)!.companionOffer('mara', 'talk').reason, 'limit');
  assert.ok(b.recruitIlyra()); assert.equal(b.interactCompanion('ilyra', 'talk').points, 8);
  b.interactCompanion('mara', 'gift'); b.interactCompanion('ilyra', 'gift');
  assert.equal(b.social.gifts, 1); assert.equal(b.social.points.mara, 28); assert.equal(b.social.points.ilyra, 20);
  b.interactCompanion('mara', 'gift'); const depleted = b.snapshot();
  assert.equal(b.interactCompanion('mara', 'gift').reason, 'limit');
  assert.equal(b.interactCompanion('ilyra', 'gift').reason, 'no-gift');
  assert.deepEqual(b.snapshot(), depleted);
});

test('max hearts clamp points and never consume gifts for a completed character', () => {
  const b = veteran(); b.social.points.mara = 155;
  assert.equal(b.interactCompanion('mara', 'talk').points, 5);
  assert.equal(hearts(b.social.points.mara), 5);
  const full = b.snapshot(); assert.equal(b.interactCompanion('mara', 'gift').reason, 'complete');
  assert.deepEqual(b.snapshot(), full);
  assert.deepEqual(b.interactCompanion('mara', 'touch'), { accepted: true, points: 0, reason: 'complete' });
});

test('budgets reset only at the live tick boundary; wall clock, reload and offline gold cannot reset them', () => {
  let b = veteran(); b.interactCompanion('mara', 'talk'); b.interactCompanion('mara', 'talk');
  b.social.window.ticks = SOCIAL.windowTicks - 2;
  const oldNow = Date.now;
  try {
    Date.now = () => 0; b = IdleBattle.restore(b.snapshot())!;
    Date.now = () => Number.MAX_SAFE_INTEGER; b.creditOfflineUnits(1000);
    assert.equal(b.companionOffer('mara', 'talk').reason, 'limit');
    b.update(BASE.stepSeconds); assert.equal(b.companionOffer('mara', 'talk').reason, 'limit');
    b.update(BASE.stepSeconds); assert.equal(b.companionOffer('mara', 'talk').reason, 'rewarded');
    assert.equal(b.social.points.mara, 16); assert.equal(b.social.window.ticks, 0);
  } finally { Date.now = oldNow; }
});

test('normal live clears award bounded gifts; duplicate attempts, full stock and farm proofs do not', () => {
  const b = veteran(); b.social.window.clearProgress = 9; b.towers[0].level = 6;
  const gifts = b.social.gifts;
  for (let i = 0; i < 3000 && b.social.gifts === gifts; i++) b.update(BASE.stepSeconds);
  assert.equal(b.social.gifts, gifts + 1); assert.equal(b.social.window.earnedGifts, 1);
  const once = structuredClone(b.social); recordSocialClear(b.social, b.social.lastClearAttempt);
  assert.deepEqual(b.social, once);
  for (let id = b.attemptId + 1; id < b.attemptId + 50; id++) recordSocialClear(b.social, id);
  assert.equal(b.social.window.earnedGifts, 2); assert.equal(b.social.gifts, gifts + 2);
  const full = createSocial(); full.gifts = SOCIAL.stockLimit;
  recordSocialClear(full, 1); assert.equal(full.window.clearProgress, 0);
  grantMilestoneGifts(full, b.socialAccess); assert.equal(full.claimed.opening, false);
  interact(full, b.socialAccess, 'mara', 'gift'); assert.equal(full.claimed.opening, true); assert.equal(full.gifts, SOCIAL.stockLimit);
  const probeBase = veteran(); probeBase.liveClearedWaves = [1]; probeBase.social.window.clearProgress = 9;
  const snapshot = probeBase.snapshot(), fingerprint = defenseFingerprint(probeBase);
  assert.ok(certifyFarm(probeBase)); assert.deepEqual(probeBase.snapshot(), snapshot);
  const probe = IdleBattle.restore(snapshot, { socialRewards: false })!;
  const frozen = structuredClone(probe.social); probe.update(100);
  assert.deepEqual(probe.social, frozen); assert.equal(probe.interactCompanion('mara', 'gift').accepted, false);
  probeBase.interactCompanion('mara', 'gift'); assert.equal(defenseFingerprint(probeBase), fingerprint);
});

test('invalid social saves are rejected rather than silently reset', () => {
  for (const corrupt of [
    (s: any) => { s.points.mara = -1; }, (s: any) => { s.points.ilyra = 1; },
    (s: any) => { s.gifts = 21; }, (s: any) => { s.claimed.opening = 'yes'; },
    (s: any) => { s.window.used.mara.gift = 3; }, (s: any) => { s.window.ticks = SOCIAL.windowTicks; },
    (s: any) => { s.lastClearAttempt = 999; },
  ]) { const snapshot = veteran().snapshot(); corrupt(snapshot.social); assert.equal(IdleBattle.restore(snapshot), undefined); }
});

test('four active periods with one gift each reach five hearts for both figures; no gifts need six', () => {
  const state = createSocial(), access = { tavernBuilt: true, ilyraRecruited: true, boss15: true, boss25: true };
  grantMilestoneGifts(state, access); let attempt = 0;
  for (let period = 0; period < 4; period++) {
    for (let i = 0; i < 20; i++) recordSocialClear(state, ++attempt);
    for (const who of ['mara', 'ilyra'] as const) {
      for (let i = 0; i < 2; i++) interact(state, access, who, 'talk');
      for (let i = 0; i < 3; i++) interact(state, access, who, 'touch');
      interact(state, access, who, 'gift');
    }
    assert.equal(state.points.mara, (period + 1) * 40); assert.equal(state.points.ilyra, (period + 1) * 40);
    for (let i = 0; i < SOCIAL.windowTicks; i++) stepSocial(state);
  }
  assert.equal(hearts(state.points.mara), 5); assert.equal(hearts(state.points.ilyra), 5);
  assert.equal(Math.ceil(160 / (2 * SOCIAL.talkPoints + 3 * SOCIAL.touchPoints)), 6);
});

test('social gifts and points are one transaction, paused time gives no budget, concurrent clicks cannot duplicate', async () => {
  const factory = new IDBFactory(); let store = await openBattleStore(factory, 't03-transactions');
  await store.save(veteran().snapshot(), true, 0);
  let live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const before = live.battle.snapshot(); live.advance(20 * 60); assert.deepEqual(live.battle.snapshot(), before);
  const save = store.save.bind(store); store.save = async () => { throw new Error('controlled social failure'); };
  assert.equal(await live.command(b => b.interactCompanion('mara', 'gift')), false);
  assert.deepEqual(live.battle.snapshot(), before); store.save = save;
  await assert.rejects(live.close(), /controlled social failure/);
  store = await openBattleStore(factory, 't03-transactions'); live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const first = live.command(b => b.interactCompanion('mara', 'gift'));
  const duplicate = live.command(b => b.interactCompanion('mara', 'gift'));
  assert.deepEqual(await Promise.all([first, duplicate]), [true, false]);
  const after = live.battle.snapshot(); assert.equal(after.social.gifts, before.social.gifts - 1);
  assert.equal(after.social.points.mara, 12); await live.close();
  store = await openBattleStore(factory, 't03-transactions'); const loaded = await store.load();
  assert.equal(loaded.kind, 'valid'); if (loaded.kind === 'valid') assert.deepEqual(loaded.save.battle.social, after.social);
  store.close();
});

test('old envelopes retain their pending offline entitlement when social claims are migrated', async () => {
  const factory = new IDBFactory(), b = veteran(); b.liveClearedWaves = [1];
  const proof = certifyFarm(b)!; assert.ok(proof);
  let offline = createOfflineState(1000); offline = beginAbsence(offline, 1000, proof, false);
  offline = reserveOffline(offline, 61000); assert.ok(offline.pendingReward);
  const legacy: any = b.snapshot(); legacy.schemaVersion = 23; delete legacy.social;
  const envelope = { schemaVersion: 2, revision: 7, writtenAt: 61000, paused: false, battle: legacy, offline };
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open('t03-legacy', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('saves');
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('saves', 'readwrite'); tx.objectStore('saves').put(envelope, 'default');
    tx.oncomplete = () => resolve(); tx.onabort = () => reject(tx.error);
  }); db.close();
  const store = await openBattleStore(factory, 't03-legacy'), loaded = await store.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind === 'valid') {
    assert.deepEqual(loaded.save.offline, offline); assert.equal(loaded.save.revision, 7);
    assert.equal(loaded.save.battle.gold, legacy.gold); assert.equal(loaded.save.battle.social.gifts, 3);
  }
  store.close();
});

test('schema 23 early level-I owners migrate without inventing boss victories or upgrading the building', () => {
  const b = veteran(false); b.highestCleared = 12; b.bossVictories = 0; b.secondBossVictories = 0;
  b.buildTavern(b.recommendedTavernPlot!);
  const old: any = b.snapshot(); old.schemaVersion = 23; delete old.social;
  const restored = IdleBattle.restore(old)!;
  assert.equal(restored.settlement.tavernLevel, 1); assert.equal(restored.social.gifts, 1);
  assert.equal(restored.recruitIlyra(), false); assert.equal(restored.secondBossVictories, 0);
});
