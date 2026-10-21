import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { syncIlyraUI } from '../src/ilyra-ui';
import { IDBFactory } from 'fake-indexeddb';
import { IdleBattle, SETTLEMENT } from '../src/battle';
import { BattleSession } from '../src/battle-session';
import { openBattleStore } from '../src/save-store';
import { certifyFarm } from '../src/farming';
import { validPlotPositions, type PlotPositions } from '../src/layout';

// Artificial veteran fixture for boundary tests, not a claim of earned play time.
function veteran() {
  const b = new IdleBattle(); b.update(4); b.gold = 12000;
  b.highestCleared = 25; b.bossVictories = 1; b.secondBossVictories = 1;
  b.buildWorkshop(); b.researchFrost(); b.update(.025);
  assert.ok(IdleBattle.restore(b.snapshot()));
  return b;
}

test('wave 12 awards one free kit without changing combat, gold or introduction', () => {
  const b = veteran(); b.highestCleared = 11; b.bossVictories = 0; b.secondBossVictories = 0; b.gold = 0;
  const cell = b.recommendedTavernPlot!, before = b.snapshot();
  assert.equal(b.tavernUnlocked, false); assert.equal(b.buildTavern(cell), false);
  assert.deepEqual(b.snapshot(), before);
  b.highestCleared = 12;
  const ready = b.snapshot();
  assert.equal(b.tavernKitAvailable, true);
  assert.equal(b.buildTavern(b.plots.workshop), false); assert.deepEqual(b.snapshot(), ready);
  assert.ok(b.buildTavern(cell)); assert.equal(b.gold, 0); assert.equal(b.settlement.tavernLevel, 1);
  assert.deepEqual(b.snapshot().enemies, ready.enemies); assert.deepEqual(b.introduction, ready.introduction);
  assert.equal(b.phase, ready.phase); assert.equal(b.discovery, ready.discovery);
  assert.equal(b.tavernKitAvailable, false); assert.equal(b.recruitIlyra(), false);
  const built = b.snapshot(); assert.equal(b.buildTavern(cell), false); assert.deepEqual(b.snapshot(), built);
  assert.deepEqual(IdleBattle.restore(built)!.snapshot(), built);
  assert.equal(IdleBattle.restore(built)!.tavernKitAvailable, false);
});

test('upgrade needs actual boss 25 and 1,200 gold; recruitment needs level II; repeats cannot charge', () => {
  const b = veteran(); b.discovery = 'off'; b.wispArrival.met = true;
  assert.ok(b.buildTavern(b.recommendedTavernPlot!)); b.secondBossVictories = 0;
  const locked = b.snapshot(); assert.equal(b.upgradeTavern(), false); assert.equal(b.recruitIlyra(), false);
  assert.deepEqual(b.snapshot(), locked);
  b.secondBossVictories = 1; b.gold = SETTLEMENT.tavernUpgradeCost - 1;
  const poor = b.snapshot(); assert.equal(b.upgradeTavern(), false); assert.deepEqual(b.snapshot(), poor);
  assert.equal(b.recruitIlyra(), false);
  b.gold++; assert.ok(b.upgradeTavern()); assert.equal(b.gold, 0); assert.equal(b.settlement.tavernLevel, 2);
  const upgraded = b.snapshot(); assert.equal(b.upgradeTavern(), false); assert.deepEqual(b.snapshot(), upgraded);
  assert.ok(b.recruitIlyra()); assert.equal(b.gold, 0); assert.equal(b.recruitIlyra(), false);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(), b.snapshot());
  const forged = b.snapshot(); forged.settlement.tavernLevel = 1;
  assert.equal(IdleBattle.restore(forged), undefined);
});

test('old schema 18 preserves actors, free plots, coins and progress; invalid new ownership is rejected', () => {
  const b = veteran(); b.positionBuilding('warehouse', { x: 8, y: 10 });
  const now = b.snapshot(), old: any = structuredClone(now); old.schemaVersion = 18;
  delete old.settlement.tavernLevel; delete old.settlement.tavernBuilt; delete old.settlement.tavernBuiltAt; delete old.settlement.tavernSeen;
  assert.deepEqual(IdleBattle.restore(old)!.snapshot(), now);
  const invalid = b.snapshot(); invalid.settlement.tavernBuilt = true;
  assert.equal(IdleBattle.restore(invalid), undefined);
  assert.equal(b.buildTavern(b.recommendedTavernPlot!), true);
  assert.ok(b.upgradeTavern());
  const forged = b.snapshot(); forged.secondBossVictories = 0;
  assert.equal(IdleBattle.restore(forged), undefined);
  assert.equal(b.positionBuilding('tavern', { x: 2, y: 13 }), true);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(), b.snapshot());
});

test('every legal pair of old settlement plots leaves a tavern site without moving either building', () => {
  let layouts = 0;
  for (let wy = 10; wy <= 12; wy++) for (let wx = 2; wx <= 8; wx++)
    for (let ly = 10; ly <= 12; ly++) for (let lx = 2; lx <= 9; lx++) {
      const plots: PlotPositions = { workshop: { x: wx, y: wy }, warehouse: { x: lx, y: ly } };
      if (!validPlotPositions(plots)) continue;
      const found = Array.from({ length: 28 }, (_, i) => ({ x: 2 + i % 7, y: 10 + Math.floor(i / 7) }))
        .some(tavern => validPlotPositions({ ...plots, tavern }));
      assert.ok(found, JSON.stringify(plots)); layouts++;
    }
  assert.ok(layouts > 100);
});

test('tavern command persists once and rolls back coins and position on storage failure', async () => {
  const factory = new IDBFactory(); let store = await openBattleStore(factory, 'b15-purchase');
  await store.save(veteran().snapshot(), false, 0);
  let live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const before = live.battle.snapshot(); const save = store.save.bind(store);
  store.save = async () => { throw new Error('controlled write failure'); };
  assert.equal(await live.command(b => b.buildTavern(b.recommendedTavernPlot!)), false);
  assert.deepEqual(live.battle.snapshot(), before); store.save = save;
  await assert.rejects(live.close(), /controlled write failure/);
  store = await openBattleStore(factory, 'b15-purchase'); live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const coins = live.battle.gold;
  assert.equal(await live.command(b => b.buildTavern(b.recommendedTavernPlot!)), true);
  assert.equal(live.battle.gold, coins); await live.close();
  store = await openBattleStore(factory, 'b15-purchase'); const loaded = await store.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind === 'valid') assert.equal(IdleBattle.restore(loaded.save.battle)!.settlement.tavernBuilt, true);
  store.close();
});

test('farm proof still works after a tavern built at nonzero combat time', () => {
  const b = veteran(); b.liveClearedWaves = [1]; b.buildTavern(b.recommendedTavernPlot!);
  const proof = certifyFarm(b); assert.ok(proof); assert.equal(proof.wave, 1);
});

// Downgraded fixtures omit the new field, like actual released schema-22 saves.
test('schema 22 owners become II once; nonowners keep kit, old recruitment, gold and positions survive', () => {
  for (const mode of ['unbuilt', 'built', 'recruited'] as const) {
    const b = veteran(); b.discovery = 'off'; b.wispArrival.met = true;
    if (mode !== 'unbuilt') { b.buildTavern(b.recommendedTavernPlot!); b.upgradeTavern(); }
    if (mode === 'recruited') assert.ok(b.recruitIlyra());
    const expected = b.snapshot(), old: any = structuredClone(expected);
    old.schemaVersion = 22; delete old.settlement.tavernLevel;
    const untouched = structuredClone(old), restored = IdleBattle.restore(old)!;
    assert.deepEqual(old, untouched); assert.deepEqual(restored.snapshot(), expected);
    assert.equal(restored.tavernKitAvailable, mode === 'unbuilt');
    assert.equal(restored.upgradeTavern(), false);
    assert.deepEqual(IdleBattle.restore(restored.snapshot())!.snapshot(), expected);
  }
});

test('paid upgrade rolls back on save failure and survives reload without a second payment', async () => {
  const factory = new IDBFactory(), b = veteran(); b.buildTavern(b.recommendedTavernPlot!);
  let store = await openBattleStore(factory, 't02-upgrade'); await store.save(b.snapshot(), false, 0);
  let live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const before = live.battle.snapshot(), save = store.save.bind(store);
  store.save = async () => { throw new Error('controlled upgrade failure'); };
  assert.equal(await live.command(b => b.upgradeTavern()), false);
  assert.deepEqual(live.battle.snapshot(), before); store.save = save;
  await assert.rejects(live.close(), /controlled upgrade failure/);
  store = await openBattleStore(factory, 't02-upgrade'); live = await BattleSession.open(store, { locks: null });
  if (live.pendingReward) await live.claimOffline(); await live.resumeActive();
  const coins = live.battle.gold;
  assert.equal(await live.command(b => b.upgradeTavern()), true);
  assert.equal(live.battle.gold, coins - SETTLEMENT.tavernUpgradeCost);
  const upgraded = live.battle.snapshot(); await live.close();
  store = await openBattleStore(factory, 't02-upgrade'); const loaded = await store.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind === 'valid') {
    const restored = IdleBattle.restore(loaded.save.battle)!;
    assert.deepEqual(restored.snapshot(), upgraded); assert.equal(restored.upgradeTavern(), false);
  }
  store.close();
});

test('companion UI explains locked Ilyra without an early recruitment offer', () => {
  const dom = new JSDOM(readFileSync(new URL('../index.html', import.meta.url), 'utf8'));
  const original = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', { value: dom.window.document, configurable: true });
  try {
    const b = veteran(); b.discovery = 'off'; b.buildTavern(b.recommendedTavernPlot!);
    const recruit = document.getElementById('recruit-ilyra') as HTMLButtonElement;
    syncIlyraUI(b, false, false);
    assert.ok(recruit.hidden); assert.ok(recruit.disabled);
    assert.match(document.getElementById('roster-ilyra-status')!.textContent!, /Taverne II & Boss 25/);
    assert.equal(document.getElementById('tavern-ilyra')!.classList.contains('new-building'), false);
    b.upgradeTavern(); syncIlyraUI(b, false, false);
    assert.equal(recruit.hidden, false); assert.equal(recruit.disabled, false);
    assert.ok(document.getElementById('tavern-ilyra')!.classList.contains('new-building'));
    b.recruitIlyra(); syncIlyraUI(b, false, false); assert.ok(recruit.hidden);
  } finally {
    if (original) Object.defineProperty(globalThis, 'document', original); else Reflect.deleteProperty(globalThis, 'document');
    dom.window.close();
  }
});
