import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IdleBattle, BASE, BATTLE_SCHEMA_VERSION, BATTLE_RULES_VERSION } from '../src/battle';
import { isLegacyStarterCell, isPreparingStarterCell, isShiftedStarterCell } from '../src/tutorial-placement';

function reload(battle: IdleBattle): IdleBattle {
  const snapshot = battle.snapshot(), restored = IdleBattle.restore(snapshot);
  assert.ok(restored, 'state must remain reloadable');
  assert.deepEqual(restored.snapshot(), snapshot);
  return restored;
}

test('new recommendation uses Variant B while legacy constructor and compatibility placements stay intact', () => {
  assert.equal(new IdleBattle().towers[0]!.padId, 'tower-start');
  let battle = IdleBattle.newGame();
  assert.equal(battle.recommendedStarterPad, 'cell-10-5');
  assert.equal(battle.isPreferredStarterLocation('cell-10-5'), true);
  assert.equal(battle.isPreferredStarterLocation('cell-6-6'), false);
  assert.equal(battle.isStarterLocation('cell-6-6'), true, 'old first-placement callers retain a bounded compatibility corridor');
  assert.equal(battle.isStarterLocation('tower-03'), false);
  assert.equal(battle.beginIntroduction(), true);
  assert.ok(battle.build(battle.recommendedStarterPad!));
  assert.equal(battle.gold, BASE.startGold); assert.equal(battle.towers[0]!.protected, true);
  assert.deepEqual([battle.towers[0]!.x, battle.towers[0]!.y], [420, 220]);
  battle = reload(battle);
  assert.equal(battle.recommendedStarterPad, 'cell-10-5');
  assert.equal(battle.recommendedFrostPad, 'tower-02');
  assert.equal(battle.isStarterLocation('cell-6-6'), false, 'an existing shifted starter stays in its own family');
  assert.ok(battle.build('cell-9-5')); assert.equal(battle.towers.length, 1); assert.equal(battle.gold, 75);
  assert.equal(battle.towers[0]!.uid, 1); reload(battle);
});

test('every offered new starter cell clears wave one without Mara or another purchase', () => {
  const initial = IdleBattle.newGame(), offered = initial.layout.towerPads.filter(pad => initial.isPreferredStarterLocation(pad.id));
  assert.equal(offered.length, 6);
  for (const pad of offered) {
    const battle = IdleBattle.newGame(); battle.beginIntroduction();
    assert.equal(isShiftedStarterCell(pad.cell), true); assert.ok(battle.build(pad.id));
    battle.startDefense(); battle.skipLessons(); battle.mara.autoCast = false;
    for (let step = 0; step < 2400 && battle.highestCleared < 1 && battle.phase !== 'defeat'; step++) battle.update(.025);
    assert.equal(battle.highestCleared, 1, pad.id); assert.equal(battle.lives, 20, pad.id);
    reload(battle);
  }
});

test('actual guided Variant B reaches its free Frost kit and reloads at every purchase', () => {
  let battle = IdleBattle.newGame(); const costs: Record<string, number> = {};
  battle.beginIntroduction(); const startGold = battle.gold;
  assert.ok(battle.build(battle.recommendedStarterPad!)); costs.starter = startGold - battle.gold;
  battle = reload(battle); assert.equal(battle.startDefense(), true); battle = reload(battle);
  for (let step = 0; step < 16000 && battle.guiding; step++) {
    battle.update(.025); assert.equal(battle.lives, 20); assert.ok(battle.wave <= 2);
    if (!battle.learningPaused) continue;
    const stage = battle.introduction.stage, gold = battle.gold;
    if (stage === 'upgrade') { assert.equal(battle.upgrade(1), true); costs.upgrade = gold - battle.gold; }
    else if (stage === 'workshop') { assert.equal(battle.workshopBuildCost, 0); assert.equal(battle.buildWorkshop(), true); costs.workshop = gold - battle.gold; }
    else if (stage === 'research') { assert.equal(battle.researchFrost(), true); costs.research = gold - battle.gold; }
    else if (stage === 'frost') {
      assert.equal(battle.recommendedFrostPad, 'tower-02');
      assert.ok(battle.build(battle.recommendedFrostPad!, 2)); costs.frost = gold - battle.gold;
    }
    battle = reload(battle);
    if (battle.guiding) { assert.equal(battle.lessonComplete, true); assert.equal(battle.continueLesson(), true); battle = reload(battle); }
  }
  assert.equal(battle.introduction.stage, 'done');
  assert.deepEqual(battle.towers.map(tower => tower.padId), ['cell-10-5', 'tower-02']);
  assert.deepEqual(battle.towers.map(tower => tower.level), [2, 1]);
  assert.deepEqual(costs, { starter: 0, upgrade: 60, workshop: 0, research: 60, frost: 0 });
  assert.equal(battle.gold, 75 + battle.earned - 120);
  assert.equal(battle.snapshot().schemaVersion, BATTLE_SCHEMA_VERSION);
  assert.equal(battle.snapshot().rulesVersion, BATTLE_RULES_VERSION);
  reload(battle);
});

test('already placed legacy starter and historical ready saves retain their location and Frost recommendation', () => {
  let battle = IdleBattle.newGame(); battle.beginIntroduction(); assert.ok(battle.build('cell-6-6'));
  const before = battle.snapshot(); battle = reload(battle);
  assert.deepEqual(battle.snapshot(), before);
  assert.equal(battle.recommendedStarterPad, 'cell-6-6'); assert.equal(battle.recommendedFrostPad, 'cell-4-6');
  assert.equal(battle.isPreferredStarterLocation('cell-6-6'), true);
  assert.equal(battle.isStarterLocation('cell-10-5'), false);
  const fixtures = JSON.parse(readFileSync(new URL('./fixtures/legacy-migrations.json', import.meta.url), 'utf8'));
  const legacyReady = fixtures.schema15.ready, unchanged = structuredClone(legacyReady);
  const legacy = IdleBattle.restore(legacyReady); assert.ok(legacy); assert.deepEqual(legacyReady, unchanged);
  assert.equal(legacy.towers[0]!.padId, legacyReady.towers[0].padId);
  assert.equal(legacy.recommendedStarterPad, legacyReady.towers[0].padId);
  assert.ok(isLegacyStarterCell(legacy.layout.towerPads.find(pad => pad.id === legacy.recommendedStarterPad)!.cell));
  reload(legacy);
  const impossibleHistorical = structuredClone(legacyReady); impossibleHistorical.towers[0].padId = 'cell-10-5';
  assert.equal(IdleBattle.restore(impossibleHistorical), undefined, 'historical schema must not gain a new preparation window');
});

test('preparation validation admits only the old bounded corridor or new Variant B family', () => {
  assert.equal(isPreparingStarterCell({ x: 10, y: 5 }), false);
  assert.equal(isPreparingStarterCell({ x: 10, y: 5 }, true), true);
  assert.equal(isPreparingStarterCell({ x: 6, y: 6 }, true), true);
  assert.equal(isPreparingStarterCell({ x: 14, y: 5 }, true), false);
  const battle = IdleBattle.newGame(); battle.beginIntroduction(); battle.build('cell-10-5');
  const snapshot = battle.snapshot(); snapshot.towers[0]!.padId = 'tower-03';
  assert.equal(IdleBattle.restore(snapshot), undefined);
});
