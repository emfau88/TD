import assert from 'node:assert/strict';
import test from 'node:test';
import { ENEMIES, MAPS, TOWERS, center, pathCells, pathPoints, waveComposition, type EnemyDef, type Point } from '../src/data';
import { Simulation, sellValue, stats, upgradeCost, type Enemy, type Tower } from '../src/simulation';

function enemyAt(point: Point, definition: EnemyDef = ENEMIES[0], uid = 1000): Enemy {
  return {
    ...point, uid, def: definition, hp: 1000, maxHp: 1000,
    distance: 0, total: 1000, path: [point, { x: point.x + 1000, y: point.y }],
    segment: 0, speed: 0, slow: 0, slowTime: 0, burn: 0, burnTime: 0,
    boss: false, direction: 'side', flip: false,
  };
}

function combat(towerId: number): { sim: Simulation; tower: Tower } {
  const sim = new Simulation(0);
  const tower = sim.build(towerId, 8, 8)!;
  assert.ok(tower);
  sim.phase = 'wave';
  sim.drainEvents();
  return { sim, tower };
}

test('building rejects paths, water, obstacles, occupied cells, invalid coordinates and insufficient gold', () => {
  const sim = new Simulation(0);
  const initial = sim.gold;
  sim.obstacles.add('8,8');
  for (const [col, row] of [[4, 7], [13, 2], [8, 8], [0, 5], [27, 5], [5, 0], [5, 15], [8.5, 8], [8, Number.NaN]]) {
    assert.equal(sim.build(1, col, row), undefined);
  }
  assert.equal(sim.build(99, 8, 9), undefined);
  assert.equal(sim.gold, initial);
  sim.obstacles.clear();
  const tower = sim.build(1, 8, 8)!;
  assert.ok(tower);
  assert.deepEqual({ x: tower.x, y: tower.y }, center([8, 8]));
  assert.equal(sim.gold, initial - 75);
  assert.equal(sim.build(1, 8, 8), undefined);
  sim.gold = 74;
  assert.equal(sim.build(1, 8, 9), undefined);
  assert.equal(sim.towers.length, 1);
});

test('upgrades charge both levels, improve stats and selling refunds the invested total once', () => {
  const sim = new Simulation(0);
  const tower = sim.build(1, 8, 8)!;
  const firstCost = upgradeCost(tower);
  const firstStats = stats(tower);
  assert.equal(sim.upgrade(tower.uid), true);
  assert.equal(tower.level, 2);
  assert.ok(stats(tower).damage > firstStats.damage);
  assert.ok(stats(tower).range > firstStats.range);
  assert.ok(stats(tower).cooldown < firstStats.cooldown);
  const secondCost = upgradeCost(tower);
  assert.equal(sim.upgrade(tower.uid), true);
  assert.equal(tower.level, 3);
  assert.equal(sim.upgrade(tower.uid), false);
  assert.equal(tower.spent, 75 + firstCost + secondCost);
  const goldBeforeSale = sim.gold;
  const refund = sellValue(tower);
  assert.equal(sim.sell(tower.uid), true);
  assert.equal(sim.gold, goldBeforeSale + refund);
  assert.equal(sim.canBuild(8, 8), true);
  assert.equal(sim.sell(tower.uid), false);
  assert.equal(sim.gold, goldBeforeSale + refund);
});

test('failed upgrades and terminal phases leave the economy unchanged', () => {
  const sim = new Simulation(0);
  const tower = sim.build(1, 8, 8)!;
  sim.gold = 0;
  assert.equal(sim.upgrade(tower.uid), false);
  assert.equal(tower.level, 1);
  for (const phase of ['victory', 'defeat'] as const) {
    sim.phase = phase;
    sim.gold = 500;
    assert.equal(sim.build(1, 8, 9), undefined);
    assert.equal(sim.upgrade(tower.uid), false);
    assert.equal(sim.sell(tower.uid), false);
    assert.equal(sim.startWave(), false);
    assert.equal(sim.gold, 500);
  }
});

test('waves begin once, consume their queue and award one bonus', () => {
  const sim = new Simulation(0);
  assert.equal(sim.startWave(), true);
  assert.equal(sim.startWave(), false);
  assert.equal(sim.remaining, waveComposition(1).length);
  sim.update(120);
  assert.equal(sim.phase, 'build');
  assert.equal(sim.lives, 12);
  assert.equal(sim.remaining, 0);
  assert.equal(sim.gold, MAPS[0].gold + 38);
  const events = sim.drainEvents();
  assert.equal(events.filter(event => event.type === 'escape').length, 8);
  assert.equal(events.filter(event => event.type === 'clear').length, 1);
  assert.equal(events.filter(event => event.type === 'wave').length, 1);
  sim.update(120);
  assert.equal(sim.gold, MAPS[0].gold + 38);
  assert.equal(sim.drainEvents().length, 0);
});

test('zero, negative and nonfinite time cannot corrupt a running simulation', () => {
  const sim = new Simulation(0);
  sim.startWave();
  for (const delta of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) sim.update(delta);
  assert.equal(sim.elapsed, 0);
  assert.equal(sim.enemies.length, 0);
  assert.equal(sim.remaining, 8);
});

test('escaped bosses cost double lives and defeat stops further rewards', () => {
  const sim = new Simulation(0);
  sim.phase = 'wave';
  sim.wave = 5;
  sim.lives = 3;
  const enemy = enemyAt({ x: 10, y: 10 }, ENEMIES[2]);
  enemy.path = [{ x: 0, y: 10 }, { x: 10, y: 10 }];
  enemy.speed = 10;
  enemy.segment = 0;
  enemy.boss = true;
  sim.enemies = [enemy];
  sim.update(.025);
  assert.equal(sim.phase, 'defeat');
  assert.equal(sim.lives, 0);
  assert.equal(sim.gold, MAPS[0].gold);
  assert.deepEqual(sim.drainEvents().map(event => event.type), ['escape', 'defeat']);
  sim.update(10);
  assert.equal(sim.drainEvents().length, 0);
});

test('clearing the twentieth wave emits victory exactly once', () => {
  const sim = new Simulation(0);
  sim.phase = 'wave';
  sim.wave = 20;
  sim.update(.025);
  assert.equal(sim.phase, 'victory');
  assert.equal(sim.gold, MAPS[0].gold + 95);
  assert.deepEqual(sim.drainEvents().map(event => event.type), ['clear', 'victory']);
  sim.update(10);
  assert.equal(sim.drainEvents().length, 0);
});

test('ground towers cannot attack flying enemies while allrounders can', () => {
  for (const towerId of [3, 7, 1, 4, 5, 6, 8]) {
    const { sim, tower } = combat(towerId);
    const enemy = enemyAt({ x: tower.x + 30, y: tower.y }, ENEMIES[4]);
    sim.enemies = [enemy];
    sim.update(.25);
    assert.equal(enemy.hp < 1000, TOWERS[towerId - 1].targets === 'all');
  }
});

test('priority selects progress, health or distance as requested', () => {
  for (const [priority, expected] of [['first', 1001], ['last', 1000], ['strong', 1002], ['near', 1003]] as const) {
    const { sim, tower } = combat(1);
    tower.priority = priority;
    sim.enemies = [
      enemyAt({ x: tower.x + 60, y: tower.y }, ENEMIES[0], 1000),
      enemyAt({ x: tower.x + 70, y: tower.y }, ENEMIES[0], 1001),
      enemyAt({ x: tower.x + 80, y: tower.y }, ENEMIES[0], 1002),
      enemyAt({ x: tower.x + 20, y: tower.y }, ENEMIES[0], 1003),
    ];
    sim.enemies[0].distance = 10;
    sim.enemies[1].distance = 900;
    sim.enemies[2].distance = 400;
    sim.enemies[2].hp = 2000;
    sim.enemies[3].distance = 200;
    sim.update(.025);
    assert.equal(sim.shots[0]?.target, expected);
  }
});

test('armor reduces ordinary damage and piercing shots bypass it', () => {
  for (const towerId of [1, 4]) {
    const { sim, tower } = combat(towerId);
    const enemy = enemyAt({ x: tower.x + 20, y: tower.y }, ENEMIES[3]);
    sim.enemies = [enemy];
    sim.update(.1);
    const damage = stats(tower).damage * (tower.def.pierce ? 1 : .6);
    assert.ok(Math.abs(enemy.hp - (1000 - damage)) < .00001);
  }
});

test('splash damages nearby ground enemies but excludes flyers and distant enemies', () => {
  const { sim, tower } = combat(3);
  const target = enemyAt({ x: tower.x + 20, y: tower.y }, ENEMIES[0], 1000);
  const near = enemyAt({ x: target.x + 25, y: target.y }, ENEMIES[0], 1001);
  const far = enemyAt({ x: target.x + 90, y: target.y }, ENEMIES[0], 1002);
  const flyer = enemyAt({ x: target.x + 5, y: target.y }, ENEMIES[4], 1003);
  target.distance = 500;
  sim.enemies = [target, near, far, flyer];
  sim.update(.2);
  assert.equal(target.hp, 966);
  assert.equal(near.hp, 966);
  assert.equal(far.hp, 1000);
  assert.equal(flyer.hp, 1000);
});

test('chain lightning hits three distinct nearby targets with falloff', () => {
  const { sim, tower } = combat(5);
  sim.enemies = [0, 1, 2, 3].map((index) => enemyAt({ x: tower.x + 20 + index * 20, y: tower.y }, ENEMIES[0], 1000 + index));
  sim.enemies[0].distance = 500;
  sim.update(.1);
  const damages = sim.enemies.map(enemy => 1000 - enemy.hp);
  for (const [index, expected] of [18, 14.4, 11.52, 0].entries()) assert.ok(Math.abs(damages[index] - expected) < .00001);
  assert.equal(sim.drainEvents().find(event => event.type === 'hit')?.links?.length, 3);
});

test('slowing applies for the remaining duration and restores normal speed', () => {
  const sim = new Simulation(0);
  sim.phase = 'wave';
  const enemy = enemyAt({ x: 0, y: 100 });
  enemy.speed = 100;
  enemy.slow = .45;
  enemy.slowTime = .01;
  sim.enemies = [enemy];
  sim.update(.025);
  assert.ok(Math.abs(enemy.x - 2.05) < .00001);
  assert.equal(enemy.slowTime, 0);
  sim.update(.025);
  assert.ok(Math.abs(enemy.x - 4.55) < .00001);
});

test('burn damage and kill credit persist after selling the source tower', () => {
  const { sim, tower } = combat(7);
  const enemy = enemyAt({ x: tower.x + 20, y: tower.y });
  enemy.hp = 20;
  enemy.maxHp = 20;
  sim.enemies = [enemy];
  sim.update(.1);
  assert.ok(enemy.burnTime > 0);
  assert.equal(sim.sell(tower.uid), true);
  sim.update(1);
  assert.equal(sim.kills, 1);
  assert.equal(tower.kills, 1);
  assert.equal(sim.earned, ENEMIES[0].gold);
  assert.equal(sim.drainEvents().filter(event => event.type === 'kill').length, 1);
});

test('a projectile retains its fired level after upgrading its tower', () => {
  const { sim, tower } = combat(7);
  const enemy = enemyAt({ x: tower.x + 100, y: tower.y });
  sim.enemies = [enemy];
  sim.update(.025);
  assert.equal(sim.shots.length, 1);
  sim.gold = 500;
  sim.upgrade(tower.uid);
  sim.update(.25);
  assert.equal(enemy.burn, 8);
  assert.ok(enemy.hp > 980);
});

test('stronger existing status effects survive weaker applications', () => {
  const { sim, tower } = combat(2);
  const enemy = enemyAt({ x: tower.x + 20, y: tower.y });
  enemy.slow = .7;
  enemy.slowTime = 1;
  sim.enemies = [enemy];
  sim.update(.1);
  assert.equal(enemy.slow, .7);
  assert.ok(enemy.slowTime > 2);
  const fire = combat(7);
  const burned = enemyAt({ x: fire.tower.x + 20, y: fire.tower.y });
  burned.burn = 24;
  burned.burnTime = 1;
  burned.burnSource = fire.tower;
  fire.sim.enemies = [burned];
  fire.sim.update(.1);
  assert.equal(burned.burn, 24);
  assert.ok(burned.burnTime > 2);
});

test('large updates and normal frames produce the same outcomes', () => {
  const first = new Simulation(0);
  const second = new Simulation(0);
  for (const sim of [first, second]) {
    sim.build(1, 3, 6);
    sim.build(1, 5, 6);
    sim.build(1, 5, 8);
    sim.startWave();
  }
  first.update(40);
  for (let frame = 0; frame < 1600; frame++) second.update(.025);
  assert.equal(first.phase, second.phase);
  assert.equal(first.gold, second.gold);
  assert.equal(first.lives, second.lives);
  assert.equal(first.kills, second.kills);
  assert.equal(first.enemies.length, second.enemies.length);
});

test('all waves contain valid enemy definitions, bosses and all eight species', () => {
  const species = new Set<string>();
  for (let wave = 1; wave <= 20; wave++) {
    const queue = waveComposition(wave);
    assert.ok(queue.length >= 8);
    assert.equal(queue.filter(enemy => enemy.boss).length, wave % 5 === 0 ? 1 : 0);
    for (const entry of queue) {
      assert.ok(ENEMIES.includes(entry.type));
      species.add(entry.type.id);
    }
  }
  assert.equal(species.size, 8);
  assert.deepEqual([...pathCells([[3, 3], [3, 3]])], ['3,3']);
  assert.deepEqual(pathPoints([[0, 0]])[0], { x: 20, y: 20 });
});
