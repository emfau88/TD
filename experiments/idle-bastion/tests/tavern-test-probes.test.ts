import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import type { ConfigEnv, UserConfig } from 'vite';
import { IdleBattle, SETTLEMENT } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { gameDatabase } from '../src/save-namespace';
import { openBattleStore } from '../src/save-store';
import { availableTouches, hearts, interactionOffer } from '../src/tavern-social';
import { nextEncounter } from '../src/tavern-encounter-state';
import { createTavernProbe, isTavernPreset, saveTavernProbe, TAVERN_PRESETS } from '../src/tavern-test-probes';
import { tavernTestCompanion } from '../src/tavern-test-route';
import viteConfig from '../vite.config';

const recorded = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/early-balance-release/selected/B-snapshots.json', import.meta.url), 'utf8')).clear25;
const access = { tavernBuilt: true, ilyraRecruited: true, boss15: true, boss25: true };

test('Tavern presets retain the recorded paid defense and buy prerequisites without adding gold', () => {
  const original = IdleBattle.restore(recorded)!;
  for (const preset of TAVERN_PRESETS) {
    const b = createTavernProbe(preset, recorded);
    assert.equal(b.gold, original.gold - SETTLEMENT.tavernUpgradeCost);
    assert.equal(b.earned, original.earned);
    assert.deepEqual(b.snapshot().towers, original.snapshot().towers);
    assert.equal(b.highestCleared, 25); assert.equal(b.settlement.tavernLevel, 2);
    assert.equal(b.ilyra?.introduction, 'done');
    assert.deepEqual(IdleBattle.restore(b.snapshot())?.snapshot(), b.snapshot());
    for (const who of ['mara', 'ilyra'] as const) {
      assert.ok(b.social.reserves[who]);
      assert.deepEqual(b.social.encounters[who], {
        first: { seen: false, choice: null, completed: false },
        second: { seen: false, choice: null, completed: false },
      });
    }
  }
  assert.throws(() => createTavernProbe('fresh', {}), /foundation/);
  assert.throws(() => createTavernProbe('nope' as never, recorded), /Unknown/);
  assert.throws(() => createTavernProbe('fresh', createTavernProbe('fresh', recorded).snapshot()), /foundation/);
});

test('first visit, optional encounters, all touches and both personal-gift conditions are represented honestly', () => {
  const fresh = createTavernProbe('fresh', recorded);
  const ten = createTavernProbe('heart2-10', recorded), twenty = createTavernProbe('heart2-20', recorded);
  const ready = createTavernProbe('heart3', recorded);
  for (const who of ['mara', 'ilyra'] as const) {
    assert.equal(fresh.social.points[who], 0); assert.equal(fresh.social.personal[who].clears, 0);
    assert.deepEqual(availableTouches(fresh.social.points[who]), []);
    assert.equal(fresh.interactCompanion(who, 'talk').points, 8);
    assert.equal(ten.social.points[who], 35); assert.equal(ten.social.personal[who].clears, 10);
    assert.equal(nextEncounter(ten.social, who), 'first');
    assert.equal(twenty.social.personal[who].clears, 20);
    assert.equal(ready.social.points[who], 70);
    assert.deepEqual(availableTouches(ready.social.points[who]), ['shoulder', 'hair', 'hand']);
    assert.equal(nextEncounter(ready.social, who), 'first');
    for (const [preset, accepted] of [['gift58-18', false], ['gift58-30', true]] as const) {
      const b = createTavernProbe(preset, recorded);
      assert.equal(b.social.points[who], 58);
      assert.equal(interactionOffer(b.social, access, who, 'gift', { gift: 'personal' }).accepted, accepted);
    }
  }
});

test('explicit legacy-four-heart review preserves existing access without granting new progression', () => {
  assert.equal(isTavernPreset('legacy4'), true);
  assert.equal(isTavernPreset('heart4'), false);
  assert.equal(isTavernPreset('legacy5'), false);
  const b = createTavernProbe('legacy4', recorded);
  for (const who of ['mara', 'ilyra'] as const) {
    assert.equal(b.social.points[who], 110); assert.equal(hearts(b.social.points[who]), 4);
    assert.deepEqual(b.social.personal[who], { clears: 30, claimed: true });
    assert.deepEqual(availableTouches(b.social.points[who]), ['shoulder', 'hair', 'hand']);
    assert.equal(nextEncounter(b.social, who), 'first');
    assert.deepEqual(interactionOffer(b.social, access, who, 'talk'), { accepted: true, points: 0, reason: 'complete' });
    assert.deepEqual(interactionOffer(b.social, access, who, 'gift'), { accepted: false, points: 0, reason: 'complete' });
  }
  assert.deepEqual(IdleBattle.restore(b.snapshot())?.snapshot(), b.snapshot());
});

test('each Tavern start uses a fresh Main-matching Tavern key and preserves normal and both default preview saves', async () => {
  const factory = new IDBFactory();
  const main = await openBattleStore(factory, gameDatabase(false));
  const preview = await openBattleStore(factory, gameDatabase(true));
  const tavernDefault = await openBattleStore(factory, gameDatabase(true, undefined, true));
  await main.save(IdleBattle.newGame().snapshot(), true, 0);
  await preview.save(IdleBattle.newGame().snapshot(), false, 0);
  await tavernDefault.save(IdleBattle.newGame().snapshot(), true, 0);
  const mainBefore = await main.load(), previewBefore = await preview.load(), tavernBefore = await tavernDefault.load();
  const b = createTavernProbe('heart3', recorded);
  const a = await saveTavernProbe(b, factory), second = await saveTavernProbe(b, factory);
  assert.notEqual(a, second); assert.match(a, /^[a-z0-9-]{1,60}$/);
  const store = await openBattleStore(factory, gameDatabase(true, a, true));
  const live = await BattleSession.open(store, { locks: null, now: () => 1000 });
  assert.equal(live.paused, true);
  assert.equal(live.awaitingResume, true, 'the normal offline/return receipt remains in place');
  assert.equal(await live.resumeActive(), true);
  assert.equal(live.paused, true, 'return does not clear manual pause');
  assert.equal(await live.command(battle => battle.beginCompanionEncounter('mara', 'first'), true), true);
  assert.equal(await live.command(battle => battle.chooseCompanionEncounter('mara', 'first', 'second'), true), true);
  await live.close(); store.close();
  const reloadStore = await openBattleStore(factory, gameDatabase(true, a, true));
  const reload = await BattleSession.open(reloadStore, { locks: null, now: () => 2000 });
  assert.equal(reload.paused, true);
  assert.deepEqual(reload.battle.social.encounters.mara.first, { seen: true, choice: 'second', completed: false });
  assert.equal(reload.battle.social.encounters.ilyra.first.seen, false);
  await reload.close(); reloadStore.close();
  assert.deepEqual(await main.load(), mainBefore); assert.deepEqual(await preview.load(), previewBefore);
  assert.deepEqual(await tavernDefault.load(), tavernBefore);
  const wrongNamespace = await openBattleStore(factory, gameDatabase(false, a));
  const wrongTowerNamespace = await openBattleStore(factory, gameDatabase(true, a));
  assert.deepEqual(await wrongNamespace.load(), { kind: 'empty' });
  assert.deepEqual(await wrongTowerNamespace.load(), { kind: 'empty' });
  wrongTowerNamespace.close(); wrongNamespace.close(); main.close(); preview.close(); tavernDefault.close();
});

test('autoopen requires both preview flags, a generated test slot and an explicit companion', () => {
  const valid = new URLSearchParams('probe=tavern-review-01234567-89ab-4cde-8fab-0123456789ab&tavernTest=mara');
  assert.equal(tavernTestCompanion(true, true, valid), 'mara');
  assert.equal(tavernTestCompanion(false, true, valid), undefined);
  assert.equal(tavernTestCompanion(true, false, valid), undefined);
  assert.equal(tavernTestCompanion(false, false, valid), undefined);
  valid.set('tavernTest', 'ilyra'); assert.equal(tavernTestCompanion(true, true, valid), 'ilyra');
  for (const probe of ['', 'normal-save', 'tower-arena-01234567-89ab-4cde-8fab-0123456789ab', 'tavern-review-------------------------------------']) {
    valid.set('probe', probe); assert.equal(tavernTestCompanion(true, true, valid), undefined);
  }
});

test('ordinary and Tower-only builds exclude Tavern test entries', async () => {
  const oldFeature = process.env.VITE_FEATURE_PREVIEW, oldTavern = process.env.VITE_TAVERN_PREVIEW;
  try {
    for (const [feature, tavern] of [['0', '0'], ['1', '0'], ['0', '1'], ['1', '1']]) {
      process.env.VITE_FEATURE_PREVIEW = feature; process.env.VITE_TAVERN_PREVIEW = tavern;
      assert.equal(typeof viteConfig, 'function');
      const config = await (viteConfig as (env: ConfigEnv) => UserConfig | Promise<UserConfig>)({ command: 'build', mode: 'production' });
      const inputs = config.build?.rollupOptions?.input as Record<string, string>;
      assert.equal('tavernTest' in inputs, feature === '1' && tavern === '1');
      assert.equal('tavernCounterCheck' in inputs, feature === '1' && tavern === '1');
    }
  } finally {
    if (oldFeature === undefined) delete process.env.VITE_FEATURE_PREVIEW; else process.env.VITE_FEATURE_PREVIEW = oldFeature;
    if (oldTavern === undefined) delete process.env.VITE_TAVERN_PREVIEW; else process.env.VITE_TAVERN_PREVIEW = oldTavern;
  }
});
