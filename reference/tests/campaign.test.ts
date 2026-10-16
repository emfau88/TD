import assert from 'node:assert/strict';
import test from 'node:test';
import { MAPS, ENEMIES, pathPoints, waveComposition } from '../src/data';
import { Simulation } from '../src/simulation';
import { runCampaign } from '../scripts/balance';

for (const map of MAPS) {
  test(`${map.name}: a mixed defense wins all twenty waves with its normal budget`, () => {
    const result = runCampaign(map.id);
    assert.equal(result.phase, 'victory');
    assert.equal(result.wave, 20);
    assert.ok(result.lives > 0);
    assert.equal(result.kills, Array.from({ length: 20 }, (_, index) => waveComposition(index + 1).length).reduce((total, count) => total + count, 0));
    assert.deepEqual(result.towerTypes, [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.ok(result.towers < 25);
    assert.ok(result.gold >= 0);
  });
}

test('an undefended campaign loses naturally without a victory bonus', () => {
  const sim = new Simulation(0);
  while (sim.phase === 'build') {
    assert.equal(sim.startWave(), true);
    sim.update(180);
  }
  assert.equal(sim.phase, 'defeat');
  assert.equal(sim.wave, 3);
  assert.equal(sim.lives, 0);
  assert.equal(sim.kills, 0);
  assert.equal(sim.earned, 0);
  assert.equal(sim.gold, MAPS[0].gold + 38 + 41);
  assert.equal(sim.drainEvents().filter(event => event.type === 'victory').length, 0);
});

test('the split map alternates ground routes and routes flyers independently', () => {
  const sim = new Simulation(2);
  sim.wave = 4;
  assert.equal(sim.startWave(), true);
  sim.update(8);
  const ground = sim.enemies.filter(enemy => !enemy.def.flying);
  const air = sim.enemies.filter(enemy => enemy.def.flying);
  assert.ok(ground.length >= 2);
  assert.ok(air.length > 0);
  assert.ok(ground.some(enemy => enemy.path[0].y === pathPoints(MAPS[2].paths[0])[0].y));
  assert.ok(ground.some(enemy => enemy.path[0].y === pathPoints(MAPS[2].paths[1])[0].y));
  assert.deepEqual(air[0].path, pathPoints(MAPS[2].air));
  assert.equal(air[0].def, ENEMIES[4]);
});

test('waves spawn their advertised bosses with extra health and bounty', () => {
  const sim = new Simulation(0);
  sim.wave = 4;
  sim.startWave();
  sim.update(12);
  const boss = sim.enemies.find(enemy => enemy.boss);
  assert.ok(boss);
  assert.equal(boss.def, ENEMIES[2]);
  assert.ok(Math.abs(boss.maxHp - ENEMIES[2].hp * Math.pow(1.095, 4) * 3.2) < .00001);
  assert.equal(boss.speed, ENEMIES[2].speed * .78);
});
