import test from 'node:test';
import assert from 'node:assert/strict';
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

test('tavern requires a real boss-25 win; failed and repeated purchases cost nothing', () => {
  const b = veteran(), cell = b.recommendedTavernPlot!;
  b.secondBossVictories = 0;
  assert.equal(b.tavernUnlocked, false); assert.equal(b.buildTavern(cell), false);
  b.secondBossVictories = 1; b.gold = SETTLEMENT.tavernCost - 1;
  const poor = b.snapshot(); assert.equal(b.buildTavern(cell), false); assert.deepEqual(b.snapshot(), poor);
  b.gold++; const before = b.snapshot();
  assert.equal(b.buildTavern(b.plots.workshop), false); assert.deepEqual(b.snapshot(), before);
  assert.equal(b.buildTavern(cell), true); assert.equal(b.gold, 0);
  assert.equal(b.buildTavern(cell), false); assert.equal(b.gold, 0);
  assert.equal(b.settlement.tavernSeen, true);
  assert.equal(b.layout.plots.filter(p => p.id === 'tavern').length, 1);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(), b.snapshot());
});

test('old schema 18 preserves actors, free plots, coins and progress; invalid new ownership is rejected', () => {
  const b = veteran(); b.positionBuilding('warehouse', { x: 8, y: 10 });
  const now = b.snapshot(), old: any = structuredClone(now); old.schemaVersion = 18;
  delete old.settlement.tavernBuilt; delete old.settlement.tavernBuiltAt; delete old.settlement.tavernSeen;
  assert.deepEqual(IdleBattle.restore(old)!.snapshot(), now);
  const invalid = b.snapshot(); invalid.settlement.tavernBuilt = true;
  assert.equal(IdleBattle.restore(invalid), undefined);
  assert.equal(b.buildTavern(b.recommendedTavernPlot!), true);
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
  assert.equal(live.battle.gold, coins - SETTLEMENT.tavernCost); await live.close();
  store = await openBattleStore(factory, 'b15-purchase'); const loaded = await store.load();
  assert.equal(loaded.kind, 'valid');
  if (loaded.kind === 'valid') assert.equal(IdleBattle.restore(loaded.save.battle)!.settlement.tavernBuilt, true);
  store.close();
});

test('farm proof still works after a tavern built at nonzero combat time', () => {
  const b = veteran(); b.liveClearedWaves = [1]; b.buildTavern(b.recommendedTavernPlot!);
  const proof = certifyFarm(b); assert.ok(proof); assert.equal(proof.wave, 1);
});
