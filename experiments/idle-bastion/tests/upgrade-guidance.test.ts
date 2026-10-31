import test from 'node:test';
import assert from 'node:assert/strict';
import { IdleBattle, towerDefinition, type TowerId } from '../src/battle';
import { currentGoal, recommendedUpgrade } from '../src/progress-ui';
import { setLanguage, language } from '../src/i18n';

// Read-only UI fixture: isolate the roster/record inputs, without simulating
// arbitrary structural states or treating them as historical save fixtures.
function roster(kind: TowerId, level = 15) {
  const b = new IdleBattle(), original = b.towers[0];
  b.settlement.workshopUpgraded = true; b.bossVictories = 1; b.highestCleared = 20;
  b.towers = [level, 1, 2].map((value, index) => ({ ...original, uid: index + 1,
    def: towerDefinition(kind), level: value, padId: `tower-${index}` }));
  return b;
}

test('fresh support towers never displace the strongest representative of any tower type', () => {
  for (const kind of [1, 2, 3, 4, 5] as const) {
    const b = roster(kind), before = b.snapshot();
    assert.equal(recommendedUpgrade(b)?.uid, 1);
    assert.deepEqual(b.snapshot(), before);
  }
});

test('learned ongoing upgrades do not become repeated tasks when low-level towers are added', () => {
  const previous = language();
  try {
    for (const lang of ['de', 'en'] as const) for (const kind of [1, 2, 3, 4, 5] as const) {
      setLanguage(lang);
      const b = roster(kind);
      for (const secondBoss of [0, 1]) {
        b.secondBossVictories = secondBoss; b.highestCleared = secondBoss ? 31 : 20;
        const before = b.snapshot(), goal = currentGoal(b);
        assert.equal(goal.action, 'progress'); assert.equal(goal.cost, undefined);
        assert.equal(goal.title, lang === 'de' ? 'Deine Verteidigung arbeitet' : 'Your defenses are at work');
        assert.deepEqual(b.snapshot(), before);
      }
    }
  } finally { setLanguage(previous); }
});

test('first Workshop II upgrade and genuine boss milestones retain their guidance', () => {
  const b = roster(3, 6);
  assert.equal(currentGoal(b).action, 'upgrade');
  b.towers[0].level = 7;
  assert.equal(currentGoal(b).action, 'progress');
  b.highestCleared = 24;
  assert.equal(currentGoal(b).action, 'boss');
  b.bossVictories = 0; b.highestCleared = 14;
  assert.equal(currentGoal(b).action, 'boss');
});

test('early capped towers do not hide valid upgrades on a second tower', () => {
  const b = roster(1, 3);
  b.settlement.workshopUpgraded = false; b.settlement.frostResearched = false;
  assert.equal(b.maxLevel, 3);
  assert.equal(recommendedUpgrade(b)?.uid, 2);
});
