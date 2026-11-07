import test from 'node:test';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, BASE, BATTLE_SCHEMA_VERSION, BATTLE_RULES_VERSION } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { defenseFingerprint } from '../src/farming';
import { createSocial } from '../src/tavern-social';
import { encounterEligible, nextEncounter, encounterRecord } from '../src/tavern-encounter-state';

function veteran(recruited = true) {
  const b = new IdleBattle(); b.update(4); b.gold = 12000; b.highestCleared = 25;
  b.bossVictories = 1; b.secondBossVictories = 1; b.buildWorkshop(); b.researchFrost();
  b.update(BASE.stepSeconds); b.wispArrival.met = true; b.discovery = 'off';
  assert.ok(b.buildTavern(b.recommendedTavernPlot!)); assert.ok(b.upgradeTavern());
  if (recruited) assert.ok(b.recruitIlyra());
  b.social.points.mara = 35; b.social.reserves.mara!.touch = 3; b.social.personal.mara.clears = 20;
  assert.ok(IdleBattle.restore(b.snapshot())); return b;
}
const empty = () => ({
  mara: { first: { seen: false, choice: null, completed: false }, second: { seen: false, choice: null, completed: false } },
  ilyra: { first: { seen: false, choice: null, completed: false }, second: { seen: false, choice: null, completed: false } },
});
function withoutEncounters(value: unknown) {
  const result = structuredClone(value) as any; delete result.social.encounters; return result;
}

test('the two own-win milestones remain available after heart three without inventing history', () => {
  const s = createSocial();
  s.points.mara = 35;
  for (const wins of [0, 9, 10, 19, 20, 30]) {
    s.personal.mara.clears = wins;
    assert.equal(encounterEligible(s, 'mara', 'first'), wins >= 10);
    assert.equal(encounterEligible(s, 'mara', 'second'), wins >= 20);
    assert.equal(nextEncounter(s, 'mara'), wins >= 10 ? 'first' : undefined);
    assert.equal(nextEncounter(s, 'ilyra'), undefined);
  }
  s.points.mara = 70; s.personal.mara.clears = 0;
  assert.equal(nextEncounter(s, 'mara'), 'first');
  assert.equal(encounterEligible(s, 'mara', 'second'), true);
  assert.equal(s.personal.mara.clears, 0);
  assert.equal(nextEncounter(s, 'wisp' as any), undefined);
  assert.equal(encounterEligible(s, 'mara', 'unknown' as any), false);
});

test('seen, one immutable choice, neutral completion and independent records have no rewards', () => {
  const b = veteran(), before = b.snapshot();
  assert.equal(b.chooseCompanionEncounter('mara', 'first', 'first'), false);
  assert.equal(b.finishCompanionEncounter('mara', 'first'), false);
  assert.equal(b.beginCompanionEncounter('mara', 'first'), true);
  assert.equal(b.beginCompanionEncounter('mara', 'first'), false);
  assert.equal(b.chooseCompanionEncounter('mara', 'first', 'unknown' as any), false);
  assert.equal(b.chooseCompanionEncounter('mara', 'first', 'second'), true);
  assert.equal(b.chooseCompanionEncounter('mara', 'first', 'second'), false);
  assert.equal(b.chooseCompanionEncounter('mara', 'first', 'first'), false);
  assert.equal(nextEncounter(b.social, 'mara'), 'first', 'partial reading remains open');
  const read = encounterRecord(b.social, 'mara', 'first') as any; read.choice = 'first';
  assert.equal(b.social.encounters.mara.first.choice, 'second', 'getter cannot mutate the saved choice');
  assert.equal(b.finishCompanionEncounter('mara', 'first'), true);
  assert.equal(b.finishCompanionEncounter('mara', 'first'), false);
  assert.equal(nextEncounter(b.social, 'mara'), 'second');
  assert.equal(b.beginCompanionEncounter('mara', 'second'), true);
  assert.equal(b.finishCompanionEncounter('mara', 'second'), true, 'no answer is a supported neutral path');
  assert.equal(b.social.encounters.mara.second.choice, null);
  assert.equal(nextEncounter(b.social, 'mara'), undefined);
  assert.deepEqual(b.social.encounters.ilyra, empty().ilyra);
  assert.deepEqual(withoutEncounters(b.snapshot()), withoutEncounters(before));
});

test('access and socialRewards are checked before encounter mutation', () => {
  const b = veteran(false), before = b.snapshot();
  assert.equal(b.beginCompanionEncounter('ilyra', 'first'), false);
  assert.equal(b.beginCompanionEncounter('wisp' as any, 'first'), false);
  assert.equal(b.beginCompanionEncounter('mara', 'bad' as any), false);
  assert.deepEqual(b.snapshot(), before);
  const probe = IdleBattle.restore(before, { socialRewards: false })!;
  assert.equal(probe.beginCompanionEncounter('mara', 'first'), false);
  assert.equal(probe.chooseCompanionEncounter('mara', 'first', 'first'), false);
  assert.equal(probe.finishCompanionEncounter('mara', 'first'), false);
  assert.deepEqual(probe.snapshot(), before);
});

test('current snapshots deep-copy partially read records and preserve choices on reload', () => {
  const b = veteran(); b.beginCompanionEncounter('mara', 'first'); b.chooseCompanionEncounter('mara', 'first', 'first');
  const fingerprint = defenseFingerprint(b), saved = b.snapshot(), loaded = IdleBattle.restore(saved)!;
  assert.equal(nextEncounter(loaded.social, 'mara'), 'first');
  assert.equal(loaded.social.encounters.mara.first.choice, 'first');
  assert.deepEqual(loaded.snapshot(), saved); assert.equal(defenseFingerprint(loaded), fingerprint);
  saved.social.encounters.mara.first.choice = 'second';
  assert.equal(b.social.encounters.mara.first.choice, 'first');
  assert.equal(loaded.social.encounters.mara.first.choice, 'first');
});

test('schema37 migration validates all old fields and adds only empty optional encounter records', () => {
  const b = veteran(); const old: any = b.snapshot(); old.schemaVersion = 37; delete old.social.encounters;
  const untouched = structuredClone(old), loaded = IdleBattle.restore(old)!;
  assert.ok(loaded); assert.equal(BATTLE_SCHEMA_VERSION, 38); assert.equal(BATTLE_RULES_VERSION, 21);
  assert.deepEqual(loaded.snapshot(), { ...old, schemaVersion: 38, social: { ...old.social, encounters: empty() } });
  assert.deepEqual(old, untouched);
  const invalid = structuredClone(old); invalid.social.gifts = 21;
  assert.equal(IdleBattle.restore(invalid), undefined);
  const forged = structuredClone(old); forged.social.encounters = { invented: true };
  assert.deepEqual(IdleBattle.restore(forged)!.social.encounters, empty(), 'old schema never invents seen choices');
});

test('current schema rejects malformed or impossible records rather than resetting them', () => {
  for (const corrupt of [
    (s: any) => { delete s.encounters; },
    (s: any) => { s.encounters = []; },
    (s: any) => { delete s.encounters.mara.second; },
    (s: any) => { s.encounters.mara.first.choice = 'first'; },
    (s: any) => { s.encounters.mara.first.completed = true; },
    (s: any) => { s.encounters.mara.first.seen = true; s.encounters.mara.first.choice = 'third'; },
    (s: any) => { s.encounters.ilyra.first.seen = true; },
    (s: any) => { s.encounters.mara.first.other = 1; },
  ]) { const value = veteran().snapshot(); corrupt(value.social); assert.equal(IdleBattle.restore(value), undefined); }
});

test('encounter choices use durable commands: rejected save rolls back, duplicates cannot overwrite', async () => {
  const factory = new IDBFactory(); let store = await openBattleStore(factory, 'tavern-encounter-atomic');
  const b = veteran(); await store.save(b.snapshot(), true, 0);
  let live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  assert.equal(await live.command(b => b.beginCompanionEncounter('mara', 'first')), true);
  const before = live.battle.snapshot(), offline = structuredClone(live.offline), fingerprint = defenseFingerprint(live.battle);
  const save = store.save.bind(store); store.save = async () => { throw new Error('controlled encounter failure'); };
  assert.equal(await live.command(b => b.chooseCompanionEncounter('mara', 'first', 'second')), false);
  assert.deepEqual(live.battle.snapshot(), before); assert.deepEqual(live.offline, offline);
  assert.equal(defenseFingerprint(live.battle), fingerprint);
  store.save = save; await assert.rejects(live.close(), /controlled encounter failure/);
  store = await openBattleStore(factory, 'tavern-encounter-atomic'); live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const first = live.command(b => b.chooseCompanionEncounter('mara', 'first', 'first'));
  const duplicate = live.command(b => b.chooseCompanionEncounter('mara', 'first', 'second'));
  assert.deepEqual(await Promise.all([first, duplicate]), [true, false]);
  assert.equal(live.battle.social.encounters.mara.first.choice, 'first');
  assert.equal(await live.command(b => b.finishCompanionEncounter('mara', 'first')), true);
  const after = live.battle.snapshot(); assert.deepEqual(withoutEncounters(after), withoutEncounters(before));
  await live.close(); store = await openBattleStore(factory, 'tavern-encounter-atomic');
  const persisted = await store.load(); assert.equal(persisted.kind, 'valid');
  if (persisted.kind === 'valid') assert.deepEqual(persisted.save.battle.social.encounters, after.social.encounters);
  store.close();
});
