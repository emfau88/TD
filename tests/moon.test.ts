import assert from 'node:assert/strict';
import test from 'node:test';
import { COLS, ROWS, ENEMIES, MAPS, pathCells, pathPoints, platformCells, waveComposition, type EnemyDef, type Point } from '../src/data';
import { MARA_COOLDOWN, MARA_OVERCLOCK_DURATION, Simulation, type Enemy } from '../src/simulation';

const moon = MAPS[3];
const judge = ENEMIES.find(enemy => enemy.id === 'Sternenrichter')!;

function enemyAt(point: Point, def: EnemyDef = ENEMIES[0], uid = 1000): Enemy {
  return { ...point, uid, def, hp: 10000, maxHp: 10000, distance: 0, total: 1000,
    path: [point, { x: point.x + 1000, y: point.y }], segment: 0, speed: 0,
    slow: 0, slowTime: 0, burn: 0, burnTime: 0, boss: false, direction: 'side', flip: false };
}

function combat() {
  const sim = new Simulation(3);
  const tower = sim.build(1, 13, 7)!;
  assert.ok(tower);
  sim.phase = 'wave';
  sim.enemies = [enemyAt({ x: tower.x + 30, y: tower.y })];
  sim.drainEvents();
  return { sim, tower };
}

test('all Moon portal routes reach the central Spire and future paths can never be built on', () => {
  const sim = new Simulation(3);
  const land = platformCells(moon);
  let buildable = 0;
  let voidCells = 0;
  for (const route of moon.paths) {
    assert.deepEqual(route.at(-1), moon.goal);
    for (const cell of pathCells(route)) {
      assert.ok(land.has(cell));
      const [col, row] = cell.split(',').map(Number);
      assert.equal(sim.canBuild(col, row), false);
    }
  }
  assert.deepEqual(moon.air.at(-1), moon.goal);
  for (let col = 1; col < COLS - 1; col++) for (let row = 1; row < ROWS - 1; row++) {
    if (!land.has(`${col},${row}`)) { voidCells++; assert.equal(sim.canBuild(col, row), false); }
    if (sim.canBuild(col, row)) buildable++;
  }
  assert.ok(voidCells > 30);
  assert.ok(buildable > 20);
});

test('portal preview changes between waves only and ground spawns follow the displayed routes', () => {
  const sim = new Simulation(3);
  assert.equal(sim.routeLabel, 'Nordportale');
  assert.deepEqual(sim.activePaths, moon.paths.slice(0, 2));
  sim.wave = 2;
  sim.phase = 'wave';
  assert.equal(sim.routeLabel, 'Nordportale');
  sim.wave = 3;
  sim.update(.025);
  assert.equal(sim.phase, 'build');
  assert.equal(sim.routeLabel, 'Südportale');
  const preview = sim.activePaths;
  assert.deepEqual(preview, moon.paths.slice(2));
  assert.ok(sim.startWave());
  sim.update(6);
  assert.deepEqual(sim.activePaths, preview);
  assert.equal(sim.routeLabel, 'Südportale');
  for (const enemy of sim.enemies.filter(enemy => !enemy.def.flying)) {
    assert.ok(preview.some(route => JSON.stringify(pathPoints(route)) === JSON.stringify(enemy.path)));
  }
  sim.wave = 6;
  assert.equal(sim.routeLabel, 'Südportale');
  sim.phase = 'build';
  assert.equal(sim.routeLabel, 'Alle Portale');
  assert.deepEqual(sim.activePaths, moon.paths);
});

test('Moon waves introduce the judge after two teaching waves and finish at wave ten', () => {
  assert.equal(waveComposition(1, 3).some(entry => entry.type === judge), false);
  assert.equal(waveComposition(2, 3).some(entry => entry.type === judge), false);
  assert.equal(waveComposition(3, 3).some(entry => entry.type === judge), true);
  assert.equal(waveComposition(10, 3).filter(entry => entry.boss && entry.type === judge).length, 1);
  const sim = new Simulation(3);
  assert.equal(sim.totalWaves, 10);
  sim.wave = 10;
  for(const objective of sim.objectives)objective.completed=true;
  sim.phase = 'wave';
  sim.update(.025);
  assert.equal(sim.phase, 'victory');
  assert.equal(sim.startWave(), false);
  assert.equal(sim.drainEvents().filter(event => event.type === 'victory').length, 1);
});

test('judges shield at most two nearby non-judges without stacking shields', () => {
  const sim = new Simulation(3);
  sim.phase = 'wave';
  const source = enemyAt({ x: 200, y: 200 }, judge, 1);
  const neighbors = [10, 20, 30].map((offset, index) => enemyAt({ x: 200 + offset, y: 200 }, ENEMIES[0], index + 2));
  const distant = enemyAt({ x: 500, y: 200 }, ENEMIES[0], 5);
  sim.enemies = [source, ...neighbors, distant];
  sim.update(.025);
  assert.equal(sim.enemies.filter(enemy => enemy.shieldSource === 1).length, 2);
  assert.equal(source.shieldSource, undefined);
  assert.equal(distant.shieldSource, undefined);
  const second = enemyAt({ x: 210, y: 200 }, judge, 6);
  sim.enemies.push(second);
  sim.update(.025);
  assert.equal(second.shieldSource, undefined);
  assert.equal(source.shieldSource, undefined);
  assert.equal(sim.enemies.filter(enemy => enemy.shieldSource !== undefined).length, 3);
  neighbors[0].x = 500;
  sim.update(.025);
  assert.equal(neighbors[0].shieldSource, undefined);
});

test('a shield halves damage and disappears in the same tick when its judge is killed', () => {
  const { sim, tower } = combat();
  const target = sim.enemies[0];
  target.distance = 100;
  const source = enemyAt({ x: target.x + 70, y: target.y }, judge, 2000);
  sim.enemies.push(source);
  sim.update(.1);
  assert.equal(target.hp, 10000 - 7);
  assert.equal(target.shieldSource, source.uid);
  tower.cooldown = 100;
  source.hp = 1;
  sim.shots.push({ uid: 9000, tower, target: source.uid, x: source.x, y: source.y, speed: 100, damage: 10, level: 1 });
  sim.shots.push({ uid: 9001, tower, target: target.uid, x: target.x, y: target.y, speed: 100, damage: 14, level: 1 });
  sim.update(.025);
  assert.equal(target.shieldSource, undefined);
  assert.equal(target.hp, 10000 - 7 - 14);
  assert.equal(sim.enemies.includes(source), false);
  assert.equal(sim.kills, 1);
});

test('Mara validates phase and target and applies overclock only after walking to the tower', () => {
  const { sim, tower } = combat();
  sim.phase = 'build';
  assert.equal(sim.overclock(tower.uid), false);
  sim.phase = 'wave';
  assert.equal(sim.overclock(123456), false);
  assert.equal(sim.maraCooldown, 0);
  const gold = sim.gold;
  assert.equal(sim.overclock(tower.uid), true);
  assert.equal(sim.gold, gold);
  assert.equal(sim.isOverclocked(tower), false);
  assert.equal(sim.maraCooldown, 0);
  while(!sim.isOverclocked(tower))sim.update(.025);
  assert.ok(sim.maraCooldown>MARA_COOLDOWN-.05);
  assert.equal(sim.overclock(tower.uid), false);
  assert.equal(sim.drainEvents().filter(event => event.type === 'overclock').length, 1);
  sim.update(MARA_OVERCLOCK_DURATION + .025);
  assert.equal(sim.isOverclocked(tower), false);
  assert.ok(Math.abs(sim.maraCooldown - (MARA_COOLDOWN - MARA_OVERCLOCK_DURATION - .025)) < .03);
  sim.update(MARA_COOLDOWN - MARA_OVERCLOCK_DURATION);
  assert.equal(sim.maraCooldown, 0);
  assert.equal(sim.overclock(tower.uid), true);
});

test('overclock increases fire rate, freezes with simulation time, and clears when a wave ends', () => {
  const regular = combat();
  const boosted = combat();
  boosted.sim.overclock(boosted.tower.uid);
  while(!boosted.sim.isOverclocked(boosted.tower))boosted.sim.update(.025);
  boosted.sim.drainEvents();
  boosted.tower.cooldown=0;
  regular.sim.update(7.9);
  boosted.sim.update(7.9);
  const regularShots = regular.sim.drainEvents().filter(event => event.type === 'fire').length;
  const boostedShots = boosted.sim.drainEvents().filter(event => event.type === 'fire').length;
  assert.ok(boostedShots >= regularShots * 1.4 && boostedShots <= regularShots * 1.6);
  boosted.sim.phase = 'build';
  boosted.sim.update(50);
  assert.equal(boosted.sim.maraCooldown, 0);
  boosted.sim.phase = 'wave';
  boosted.sim.enemies = [];
  boosted.sim.update(.025);
  assert.equal(boosted.sim.phase, 'build');
  assert.equal(boosted.tower.overclockUntil, undefined);
  assert.equal(boosted.sim.isOverclocked(boosted.tower), false);
  const restarted = new Simulation(3);
  assert.equal(restarted.maraCooldown, 0);
  assert.equal(restarted.towers.length, 0);
});
