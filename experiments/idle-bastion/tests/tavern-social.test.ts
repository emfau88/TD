import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, BASE } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifyFarm, defenseFingerprint } from '../src/farming';
import { createSocial as createLegacy, grantMilestoneGifts as grantLegacy } from '../src/tavern-social-legacy';
import { SOCIAL, createSocial, grantMilestoneGifts, recordSocialClear, interact, interactionOffer, hearts, personalGiftReady, availableTouches, migrateSocial } from '../src/tavern-social';
import { legacyFixtures, restoreHistorical } from './legacy-fixtures';

function veteran(recruited = false) {
  const b = new IdleBattle(); b.update(4); b.gold = 12000; b.highestCleared = 25;
  b.bossVictories = 1; b.secondBossVictories = 1; b.buildWorkshop(); b.researchFrost();
  b.update(BASE.stepSeconds); b.wispArrival.met = true; b.discovery = 'off';
  assert.ok(b.buildTavern(b.recommendedTavernPlot!)); assert.ok(b.upgradeTavern());
  if (recruited) assert.ok(b.recruitIlyra());
  assert.ok(IdleBattle.restore(b.snapshot())); return b;
}
function heartTwo(b: IdleBattle, who: 'mara' | 'ilyra' = 'mara') {
  assert.deepEqual([0, 1, 2].map(() => b.interactCompanion(who, 'talk').points), [8, 8, 7]);
  assert.equal(b.social.points[who], 23);
  assert.equal(b.interactCompanion(who, 'gift').points, 12);
  assert.equal(b.social.points[who], 35);
}
function clears(b: IdleBattle, n: number) {
  for (let i = 0; i < n; i++) recordSocialClear(b.social, ++b.attemptId, b.socialAccess);
}
test('three conversations and a stock gift reach heart two for each companion without time gates', () => {
  const b = veteran(true);
  for (const who of ['mara', 'ilyra'] as const) {
    assert.equal(b.companionOffer(who, 'gift').reason, 'affection');
    heartTwo(b, who);
    assert.equal(b.social.personal[who].clears, 0);
    assert.equal(hearts(b.social.points[who]), 2);
  }
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.social, b.social);
});
test('locked and invalid companions/regions cannot spend anything', () => {
  const b = veteran(), before = b.snapshot();
  assert.equal(b.interactCompanion('ilyra', 'talk').reason, 'locked');
  assert.equal(b.interactCompanion('wisp' as any, 'gift').reason, 'invalid');
  assert.equal(b.interactCompanion('mara', 'touch', { region: 'invalid' as any }).reason, 'invalid');
  assert.equal(b.interactCompanion('mara', 'touch').reason, 'locked');
  assert.deepEqual(b.snapshot(), before);
});
test('a personal gift is guaranteed on the thirtieth own live win, independent of stock and the other companion', () => {
  const b = veteran(true); heartTwo(b); clears(b, 10); heartTwo(b, 'ilyra');
  b.social.gifts = 20; clears(b, 19);
  assert.equal(personalGiftReady(b.social, 'mara'), false);
  const once = structuredClone(b.social);
  recordSocialClear(b.social, b.attemptId, b.socialAccess); assert.deepEqual(b.social, once);
  clears(b, 1); assert.equal(personalGiftReady(b.social, 'mara'), true);
  assert.equal(b.social.personal.ilyra.clears, 20);
  assert.equal(b.social.gifts, 20);
  assert.equal(b.companionOffer('mara', 'gift', { gift: 'personal' }).reason, 'affection');
  for (let i = 0; i < 3; i++) b.interactCompanion('mara', 'talk');
  assert.equal(b.social.points.mara, 58);
  const stock = b.social.gifts;
  assert.equal(b.interactCompanion('mara', 'gift', { gift: 'personal' }).points, 12);
  assert.equal(b.social.gifts, stock); assert.equal(b.social.points.mara, 70);
  assert.equal(b.interactCompanion('mara', 'gift').accepted, false);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.social, b.social);
  clears(b, 10); assert.equal(personalGiftReady(b.social, 'ilyra'), true);
});
test('affection may be ready before the gift, stock gifts never bypass the personal gate', () => {
  const b = veteran(); heartTwo(b);
  b.social.gifts = 20; b.interactCompanion('mara', 'gift'); b.interactCompanion('mara', 'gift');
  assert.equal(b.social.points.mara, 58);
  const stock = b.social.gifts;
  for (let i = 0; i < 50; i++) { b.interactCompanion('mara', 'talk'); b.interactCompanion('mara', 'gift'); }
  assert.equal(b.social.points.mara, 58); assert.equal(b.social.gifts, stock);
  assert.equal(b.companionOffer('mara', 'gift', { gift: 'personal' }).reason, 'gift-progress');
  clears(b, 30); assert.equal(b.interactCompanion('mara', 'gift').gift, 'personal');
  assert.equal(b.social.points.mara, 70);
});
test('reward reserves refill per three victories, not time, reload, wall clock or offline gold', () => {
  const b = veteran(); heartTwo(b);
  for (let i = 0; i < 3; i++) assert.equal(b.interactCompanion('mara', 'touch').points, 4);
  assert.equal(b.companionOffer('mara', 'talk').reason, 'limit');
  const frozen = structuredClone(b.social);
  b.creditOfflineUnits(1000); assert.deepEqual(b.social, frozen);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.social, frozen);
  clears(b, 2); assert.equal(b.companionOffer('mara', 'talk').reason, 'limit');
  clears(b, 1); assert.equal(b.interactCompanion('mara', 'talk').points, 8);
  assert.equal(b.social.reserves.mara!.touch, 1);
  clears(b, 30); assert.equal(b.social.reserves.mara!.talk, 3); assert.equal(b.social.reserves.mara!.touch, 3);
});
test('normal drops have no twenty-minute quota, defer at full stock and stop after the available chapter', () => {
  const b = veteran(); const initial = b.social.gifts;
  clears(b, 30); assert.equal(b.social.gifts, initial + 3);
  b.social.gifts = 20; b.social.clearProgress = 9;
  clears(b, 5); assert.equal(b.social.clearProgress, 9);
  b.social.gifts = 19; clears(b, 1); assert.equal(b.social.gifts, 20); assert.equal(b.social.clearProgress, 0);
  b.social.points.mara = 70; const gifts = b.social.gifts; clears(b, 30);
  assert.equal(b.social.gifts, gifts); assert.equal(b.social.clearProgress, 0);
});
test('recruitment guarantees Ilyra a welcome gift, full stock defers the claim', () => {
  const b = veteran(); b.social.gifts = 0;
  assert.ok(b.recruitIlyra()); assert.equal(b.social.gifts, 1); assert.ok(b.social.claimed.ilyraWelcome);
  grantMilestoneGifts(b.social, b.socialAccess); assert.equal(b.social.gifts, 1);
  const full = veteran(); full.social.gifts = 20; assert.ok(full.recruitIlyra());
  assert.equal(full.social.claimed.ilyraWelcome, false);
  for (let i = 0; i < 3; i++) full.interactCompanion('ilyra', 'talk');
  full.interactCompanion('ilyra', 'gift');
  assert.equal(full.social.gifts, 20); assert.equal(full.social.claimed.ilyraWelcome, true);
});
test('touches unlock at hearts 1/2/3, share the existing reserve from heart 2 and preserve legacy progress', () => {
  assert.deepEqual([0,10,35,70,110,160].map(availableTouches), [[],['shoulder'],['shoulder','hair'],['shoulder','hair','hand'],['shoulder','hair','hand'],['shoulder','hair','hand']]);
  for (const who of ['mara','ilyra'] as const) {
    const b = veteran(true);
    for (const points of [10,23,34]) {
      b.social.points[who] = points; const before = structuredClone(b.social);
      for (let i=0;i<20;i++) assert.deepEqual(b.interactCompanion(who,'touch',{region:'shoulder'}), {accepted:true,points:0,reason:'companionship'});
      assert.equal(b.interactCompanion(who,'touch',{region:'hair'}).reason,'locked');
      assert.equal(b.interactCompanion(who,'touch',{region:'hand'}).reason,'locked');
      assert.deepEqual(b.social,before); assert.deepEqual(IdleBattle.restore(b.snapshot())!.social,before);
    }
    assert.equal(b.interactCompanion(who,'gift').points,1); // existing 34-point save reaches heart 2
    assert.equal(b.social.reserves[who]!.touch,3);
    assert.equal(b.interactCompanion(who,'touch',{region:'shoulder'}).points,4);
    assert.equal(b.interactCompanion(who,'touch',{region:'hair'}).points,4);
    assert.equal(b.social.reserves[who]!.touch,1);
    assert.equal(b.interactCompanion(who,'touch',{region:'hand'}).reason,'locked');
    for(const points of [70,110,160]) {
      b.social.points[who]=points; const before=structuredClone(b.social);
      for(const region of ['shoulder','hair','hand'] as const) assert.deepEqual(b.interactCompanion(who,'touch',{region}),{accepted:true,points:0,reason:'complete'});
      assert.deepEqual(b.social,before); assert.deepEqual(IdleBattle.restore(b.snapshot())!.social,before);
    }
  }
});

test('schema 31 migration preserves earned values, claims, combat and partial gift progress exactly', () => {
  for (const points of [0, 23, 34, 35, 58, 69, 70, 109, 110, 160]) {
    const b = veteran(true), oldSocial = createLegacy(); grantLegacy(oldSocial, b.socialAccess);
    oldSocial.points.mara = points; oldSocial.points.ilyra = points; oldSocial.window.clearProgress = 9;
    const old = { ...b.snapshot(), schemaVersion: 31, social: oldSocial }, copy = structuredClone(old);
    const restored = IdleBattle.restore(old); assert.ok(restored); assert.deepEqual(old, copy);
    assert.deepEqual(restored.social.points, oldSocial.points); assert.equal(restored.social.gifts, oldSocial.gifts);
    assert.equal(restored.social.clearProgress, 9); assert.equal(restored.social.personal.mara.clears, 0);
    assert.equal(restored.social.personal.mara.claimed, points >= 70);
    const { social, schemaVersion, ...combat } = restored.snapshot();
    const { social: unused, schemaVersion: previous, ...oldCombat } = old;
    assert.deepEqual(combat, oldCombat); assert.equal(schemaVersion, 32);
    assert.deepEqual(IdleBattle.restore(restored.snapshot())!.snapshot(), restored.snapshot());
    if (points === 34) assert.equal(restored.interactCompanion('mara', 'gift').points, 1);
    if (points === 69) { clears(restored, 30); assert.equal(restored.interactCompanion('mara', 'gift').points, 1); }
    if (points >= 70) { assert.equal(restored.interactCompanion('mara', 'talk').points, 0); assert.equal(restored.social.points.mara, points); }
  }
});
test('legacy empty-stock Ilyra gets her welcome claim once; corrupt legacy budgets remain rejected', () => {
  const b = veteran(true), old = createLegacy(); old.claimed = { opening: true, boss15: true, boss25: true };
  const migrated = migrateSocial(old, b.socialAccess, b.attemptId)!; assert.equal(migrated.gifts, 1);
  b.social = migrated; assert.deepEqual(IdleBattle.restore(b.snapshot())!.social, migrated);
  old.window.used.mara.gift = 3;
  assert.equal(IdleBattle.restore({ ...b.snapshot(), schemaVersion: 31, social: old }), undefined);
});
test('invalid current social states are rejected, never reset', () => {
  for (const corrupt of [
    (s: any) => { s.points.mara = -1; }, (s: any) => { s.points.ilyra = 1; },
    (s: any) => { s.gifts = 21; }, (s: any) => { s.reserves.mara.talk = 4; },
    (s: any) => { s.personal.mara.clears = 31; }, (s: any) => { s.personal.mara.claimed = true; },
    (s: any) => { s.clearProgress = 10; }, (s: any) => { s.lastClearAttempt = 999999; },
  ]) { const s = veteran().snapshot(); corrupt(s.social); assert.equal(IdleBattle.restore(s), undefined); }
});
test('live wave integration grants once and probes/offline preserve social progress and the farm fingerprint', () => {
  const b = veteran(); b.social.clearProgress = 9; b.towers[0].level = 6;
  const gifts = b.social.gifts;
  for (let i = 0; i < 3000 && b.social.gifts === gifts; i++) b.update(BASE.stepSeconds);
  assert.equal(b.social.gifts, gifts + 1);
  const probeBase = veteran(); probeBase.liveClearedWaves = [1];
  const snapshot = probeBase.snapshot(), fingerprint = defenseFingerprint(probeBase);
  assert.ok(certifyFarm(probeBase)); assert.deepEqual(probeBase.snapshot(), snapshot);
  const probe = IdleBattle.restore(snapshot, { socialRewards: false })!, frozen = structuredClone(probe.social);
  probe.update(100); assert.deepEqual(probe.social, frozen);
  assert.equal(probe.interactCompanion('mara', 'talk').accepted, false);
  probeBase.interactCompanion('mara', 'talk'); assert.equal(defenseFingerprint(probeBase), fingerprint);
});
test('gift consumption is atomic, failed saves roll back, pause and concurrent taps do not duplicate rewards', async () => {
  const factory = new IDBFactory(); let store = await openBattleStore(factory, 't12-transactions');
  const b = veteran(); for (let i = 0; i < 3; i++) b.interactCompanion('mara', 'talk');
  await store.save(b.snapshot(), true, 0);
  let live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const before = live.battle.snapshot(); live.advance(1200); assert.deepEqual(live.battle.snapshot(), before);
  const save = store.save.bind(store); store.save = async () => { throw new Error('controlled social failure'); };
  assert.equal(await live.command(battle => battle.interactCompanion('mara', 'gift')), false);
  assert.deepEqual(live.battle.snapshot(), before); store.save = save;
  await assert.rejects(live.close(), /controlled social failure/);
  store = await openBattleStore(factory, 't12-transactions'); live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const first = live.command(battle => battle.interactCompanion('mara', 'gift'));
  const second = live.command(battle => battle.interactCompanion('mara', 'gift'));
  assert.deepEqual(await Promise.all([first, second]), [true, false]);
  assert.equal(live.battle.social.points.mara, 35); assert.equal(live.battle.social.gifts, before.social.gifts - 1);
  const after = live.battle.snapshot(); await live.close();
  store = await openBattleStore(factory, 't12-transactions'); const loaded = await store.load();
  assert.equal(loaded.kind, 'valid'); if (loaded.kind === 'valid') assert.deepEqual(loaded.save.battle.social, after.social); store.close();
});
test('older pre-social saves retain building access and only proven milestone gifts', () => {
  for (const mode of ['unbuilt', 'built', 'recruited']) {
    const old = legacyFixtures().critical.social[mode], loaded = restoreHistorical(old);
    assert.equal(loaded.social.gifts, mode === 'unbuilt' ? 2 : 3);
    assert.equal(!!loaded.ilyra, mode === 'recruited');
  }
  const early = restoreHistorical(legacyFixtures().critical.social.early);
  assert.equal(early.settlement.tavernLevel, 1); assert.equal(early.social.gifts, 1);
  assert.equal(early.recruitIlyra(), false); assert.equal(early.secondBossVictories, 0);
});
