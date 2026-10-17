import assert from 'node:assert/strict';
import test from 'node:test';
import { BASE, IdleBattle, sellValue, stats, upgradeCost, type BattleEvent } from '../src/battle';
import { createIdleLayout } from '../src/layout';

function until(sim: IdleBattle, condition: () => boolean, seconds = 300): void {
  for (let count = 0; count < seconds / BASE.stepSeconds && !condition(); count++) sim.update(BASE.stepSeconds);
  assert.ok(condition(), `Condition not reached after ${seconds}s; wave=${sim.wave}, phase=${sim.phase}.`);
}

function firstClear(sim: IdleBattle): BattleEvent[] {
  until(sim, () => sim.events.some(event => event.type === 'clear' && event.wave === 1));
  return sim.drainEvents();
}

test('fresh model owns a free protected starter and automatically starts wave one at 1×', () => {
  const sim = new IdleBattle();
  assert.equal(sim.gold, 75);
  assert.equal(sim.lives, 20);
  assert.equal(sim.wave, 0);
  assert.equal(sim.phase, 'intermission');
  assert.equal(sim.towers.length, 1);
  const starter = sim.towers[0];
  assert.equal(starter.padId, 'tower-start');
  assert.equal(starter.spent, 0);
  assert.equal(starter.protected, true);
  assert.equal(sim.sell(starter.uid), false);
  sim.update(0.25);
  assert.equal(sim.phase, 'wave');
  assert.equal(sim.wave, 1);
  assert.equal(sim.remaining, 6);
  sim.update(0.15);
  assert.equal(sim.enemies.length, 1);
  assert.equal(sim.enemies[0].def.id, 'Leafbug');
  assert.equal(sim.drainEvents().filter(event => event.type === 'wave').length, 1);
  assert.deepEqual(sim.drainEvents(), []);
});

test('building spends the real balance once and rejects occupied, invalid and unopened pads', () => {
  const sim = new IdleBattle();
  const tower = sim.build('tower-02');
  assert.ok(tower);
  assert.equal(tower.spent, BASE.tower.cost);
  assert.equal(sim.gold, 0);
  assert.equal(sim.build('tower-02'), undefined);
  assert.equal(sim.build('tower-start'), undefined);
  assert.equal(sim.build('tower-03'), undefined);
  assert.equal(sim.build('made-up'), undefined);
  assert.equal(sim.towers.length, 2);
  const expanded = new IdleBattle(createIdleLayout({ unlockedColumns: 36 }));
  expanded.gold = 1000; // Controlled affordability fixture; B02 unlocks only initial pads.
  for (const pad of expanded.layout.towerPads.filter(pad => pad.availability !== 'initial')) {
    assert.equal(expanded.build(pad.id), undefined);
  }
  assert.equal(expanded.gold, 1000);
  assert.equal(expanded.build('tower-start'), undefined);
});

test('level upgrades charge 60 then 94, reject insolvency/max level and keep art stage separate', () => {
  const sim = new IdleBattle();
  const starter = sim.towers[0];
  assert.equal(upgradeCost(starter), 60);
  assert.equal(sim.upgrade(starter.uid), true);
  assert.equal(sim.gold, 15);
  assert.equal(starter.level, 2);
  assert.equal(starter.spent, 60);
  assert.equal(upgradeCost(starter), 94);
  assert.equal(sim.upgrade(starter.uid), false);
  sim.gold = 94; // Exact-boundary fixture.
  assert.equal(sim.upgrade(starter.uid), true);
  assert.equal(sim.gold, 0);
  assert.equal(starter.level, 3);
  assert.equal(starter.spent, 154);
  assert.equal(starter.visualStage, 1);
  sim.gold = 1000;
  assert.equal(sim.upgrade(starter.uid), false);
  assert.equal(sim.upgrade(-1), false);
  assert.equal(sim.gold, 1000);
  const stat = stats(starter);
  assert.ok(stat.range <= BASE.tower.range + 30);
  assert.ok(BASE.tower.cooldown / stat.cooldown <= 1.3);
  assert.ok(stat.damage > BASE.tower.damage);
  const futureStat = stats({ def: BASE.tower, level: 20 });
  assert.ok(futureStat.range <= BASE.tower.range + 30);
  assert.ok(BASE.tower.cooldown / futureStat.cooldown <= 1.3);
});

test('selling returns 70 percent of actual investment exactly once; starter remains protected', () => {
  const sim = new IdleBattle();
  const tower = sim.build('tower-02')!;
  sim.gold = 60;
  assert.equal(sim.upgrade(tower.uid), true);
  assert.equal(tower.spent, 135);
  assert.equal(sellValue(tower), 95);
  assert.equal(sim.sell(tower.uid), true);
  assert.equal(sim.gold, 95);
  assert.equal(sim.sell(tower.uid), false);
  assert.equal(sim.gold, 95);
  assert.equal(sim.sell(sim.towers[0].uid), false);
  assert.equal(sim.build('tower-02')?.level, 1);
  assert.equal(sim.gold, 20);
});

for (const initialCooldown of [0, BASE.tower.cooldown]) {
  test(`unassisted protected starter clears the real entry geometry at 20/20 (cooldown ${initialCooldown})`, () => {
    const sim = new IdleBattle(undefined, { maraBonus: false });
    sim.towers[0].cooldown = initialCooldown;
    const events = firstClear(sim);
    assert.equal(sim.wave, 1);
    assert.equal(sim.phase, 'intermission');
    assert.equal(sim.lives, 20);
    assert.equal(sim.kills, 6);
    assert.equal(sim.enemies.length, 0);
    assert.equal(sim.shots.length, 0);
    assert.equal(sim.gold, 75 + 6 * 8 + 22);
    assert.equal(sim.earned, 6 * 8 + 22);
    assert.equal(events.filter(event => event.type === 'kill').length, 6);
    assert.equal(events.filter(event => event.type === 'escape').length, 0);
    assert.equal(events.filter(event => event.type === 'clear').length, 1);
    assert.ok(sim.elapsed < 20, `Actual first clear took ${sim.elapsed}s.`);
  });
}

test('new attempts reset core and active combat, preserve money/towers and use globally increasing IDs', () => {
  const sim = new IdleBattle();
  const events = firstClear(sim);
  const previousIds = events.flatMap(event => [event.enemy?.uid, event.shot?.uid]).filter((id): id is number => id !== undefined);
  const gold = sim.gold, starter = sim.towers[0];
  sim.lives = 7; // Damage fixture carried into the intermission.
  sim.update(BASE.intermissionSeconds);
  assert.equal(sim.phase, 'wave');
  assert.equal(sim.wave, 2);
  assert.equal(sim.lives, 20);
  assert.equal(sim.gold, gold);
  assert.equal(sim.towers[0], starter);
  assert.deepEqual(sim.shots, []);
  assert.equal(sim.enemies.length, 0);
  assert.equal(sim.remaining, 7);
  sim.update(0.15);
  assert.ok(sim.enemies[0].uid > Math.max(...previousIds));
  assert.equal(sim.drainEvents().filter(event => event.type === 'clear').length, 0);
});

test('projectiles retain fired damage and level after upgrading and selling their source', () => {
  const sim = new IdleBattle();
  const tower = sim.build('tower-02')!;
  sim.towers[0].cooldown = 1000; // Isolate the purchased tower's shot.
  until(sim, () => sim.shots.some(shot => shot.towerUid === tower.uid), 20);
  const shot = sim.shots.find(candidate => candidate.towerUid === tower.uid)!;
  const target = sim.enemies.find(enemy => enemy.uid === shot.target)!;
  const hp = target.hp;
  assert.equal(shot.damage, 14);
  assert.equal(shot.level, 1);
  sim.gold = 60;
  assert.equal(sim.upgrade(tower.uid), true);
  assert.equal(stats(tower).damage, 24.5);
  assert.equal(sim.sell(tower.uid), true);
  assert.equal(shot.damage, 14);
  assert.equal(shot.level, 1);
  until(sim, () => !sim.shots.some(candidate => candidate.uid === shot.uid), 2);
  assert.equal(target.hp, hp - 14);
  assert.ok(sim.drainEvents().some(event => event.type === 'hit' && event.shot?.uid === shot.uid));
});

test('simultaneous lethal projectiles cannot pay a kill twice', () => {
  const sim = new IdleBattle();
  until(sim, () => sim.shots.length > 0, 20);
  const shot = sim.shots[0];
  const target = sim.enemies.find(enemy => enemy.uid === shot.target)!;
  target.hp = 1; // Lethal concurrent-hit fixture.
  sim.shots.push({ ...shot, uid: 999999 });
  const gold = sim.gold, kills = sim.kills;
  sim.drainEvents();
  until(sim, () => target.hp === 0, 2);
  const events = sim.drainEvents();
  assert.equal(sim.gold, gold + target.def.gold);
  assert.equal(sim.kills, kills + 1);
  assert.equal(events.filter(event => event.type === 'kill' && event.enemy?.uid === target.uid).length, 1);
});

test('escape records defeat without erasing gold or purchases and then returns to live farming', () => {
  const sim = new IdleBattle();
  sim.build('tower-02');
  for (const tower of sim.towers) tower.cooldown = 1000;
  sim.update(0.4);
  sim.lives = 1; // Isolate the first escape rather than waiting for late-wave balance.
  const gold = sim.gold, towers = [...sim.towers];
  until(sim, () => sim.phase === 'defeat', 60);
  const elapsed = sim.elapsed;
  assert.equal(sim.lives, 0);
  assert.equal(sim.gold, gold);
  assert.deepEqual(sim.towers, towers);
  assert.equal(sim.upgrade(sim.towers[0].uid), false);
  assert.equal(sim.sell(sim.towers[1].uid), false);
  assert.equal(sim.build('tower-03'), undefined);
  assert.equal(sim.events.filter(event => event.type === 'clear').length, 0);
  assert.equal(sim.events.filter(event => event.type === 'defeat').length, 1);
  sim.update(BASE.stepSeconds);
  assert.equal(sim.elapsed, elapsed + BASE.stepSeconds);
  assert.equal(sim.gold, gold);
  assert.equal(sim.mode, 'farm');
  assert.equal(sim.phase, 'intermission');
  assert.equal(sim.lives, 20);
  assert.equal(sim.remaining, 0);
  assert.equal(sim.events.filter(event => event.type === 'defeat').length, 1);
});

test('fixed steps give the same combat and economy for large, frame-sized and partial updates', () => {
  const whole = new IdleBattle(), frames = new IdleBattle(), partial = new IdleBattle();
  for (const sim of [whole, frames, partial]) sim.build('tower-02');
  whole.update(30);
  for (let count = 0; count < 1200; count++) frames.update(0.025);
  for (let count = 0; count < 3000; count++) partial.update(0.01);
  const state = (sim: IdleBattle) => ({
    gold: sim.gold, earned: sim.earned, lives: sim.lives, phase: sim.phase,
    wave: sim.wave, elapsed: sim.elapsed, kills: sim.kills,
    towers: sim.towers, enemies: sim.enemies, shots: sim.shots,
    events: sim.drainEvents(), remaining: sim.remaining, intermissionRemaining: sim.intermissionRemaining,
  });
  const expected = state(whole);
  assert.deepEqual(state(frames), expected);
  assert.deepEqual(state(partial), expected);
});

test('non-finite or non-positive time cannot start waves or change money', () => {
  const sim = new IdleBattle();
  for (const dt of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, -1, 0]) sim.update(dt);
  assert.equal(sim.phase, 'intermission');
  assert.equal(sim.wave, 0);
  assert.equal(sim.elapsed, 0);
  assert.equal(sim.gold, 75);
  sim.update(0.01);
  assert.equal(sim.elapsed, 0);
  sim.update(0.015);
  assert.equal(sim.elapsed, 0.025);
});


test('a sold tower can still earn one kill from a projectile already in flight', () => {
  const sim = new IdleBattle();
  const tower = sim.build('tower-02')!;
  sim.towers[0].cooldown = 1000;
  until(sim, () => sim.shots.some(shot => shot.towerUid === tower.uid), 20);
  const shot = sim.shots.find(candidate => candidate.towerUid === tower.uid)!;
  const target = sim.enemies.find(enemy => enemy.uid === shot.target)!;
  target.hp = 1;
  assert.equal(sim.sell(tower.uid), true);
  const gold = sim.gold;
  sim.drainEvents();
  until(sim, () => target.hp === 0, 2);
  assert.equal(sim.gold, gold + target.def.gold);
  assert.equal(sim.kills, 1);
  const kills = sim.drainEvents().filter(event => event.type === 'kill');
  assert.equal(kills.length, 1);
  assert.equal(kills[0].tower, undefined);
  assert.equal(kills[0].enemy?.uid, target.uid);
});

test('an escaped enemy pays no kill reward; a damaged successful attempt still starts the next with full core', () => {
  const sim = new IdleBattle();
  for (const tower of sim.towers) tower.cooldown = 1000;
  const events = firstClear(sim);
  assert.equal(sim.lives, 14);
  assert.equal(sim.kills, 0);
  assert.equal(sim.gold, 75 + 22);
  assert.equal(sim.earned, 22);
  assert.equal(events.filter(event => event.type === 'escape').length, 6);
  assert.equal(events.filter(event => event.type === 'kill').length, 0);
  sim.update(BASE.intermissionSeconds);
  assert.equal(sim.wave, 2);
  assert.equal(sim.lives, 20);
  assert.equal(sim.gold, 97);
});
