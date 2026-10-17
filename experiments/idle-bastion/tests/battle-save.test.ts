import assert from 'node:assert/strict';
import test from 'node:test';
import { BASE, IdleBattle, type BattleSnapshot } from '../src/battle';
import { createIdleLayout } from '../src/layout';

const jsonCopy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

test('a legally funded Frost run stays saveable through long wave tails and wave 15', () => {
  const sim = new IdleBattle();
  const archer = sim.build('tower-03')!;
  sim.assignMara(archer.uid);
  for (let step = 0; step < 6500 && sim.wave < 16; step++) {
    if (archer.level === 1 && sim.gold >= 60) sim.upgrade(archer.uid);
    if (!sim.settlement.workshopBuilt && sim.gold >= 400) sim.buildWorkshop();
    if (sim.settlement.workshopBuilt && !sim.settlement.frostResearched && sim.gold >= 60) sim.researchFrost();
    if (sim.settlement.frostResearched && sim.canBuild('tower-02', 2)) sim.build('tower-02', 2);
    if (sim.settlement.frostResearched && sim.canBuild('tower-04')) sim.build('tower-04');
    sim.update(0.1);
    sim.drainEvents();
    assert.ok(IdleBattle.restore(jsonCopy(sim.snapshot())), `Invalid save at ${sim.elapsed}s / wave ${sim.wave}`);
  }
  assert.equal(sim.wave, 16, 'The regular run must cross the formerly invalid wave-15 boundary.');
});

function until(sim: IdleBattle, condition: () => boolean, seconds = 100): void {
  for (let step = 0; step < seconds / BASE.stepSeconds && !condition(); step++) sim.update(BASE.stepSeconds);
  assert.ok(condition(), `Condition not reached at wave ${sim.wave}, phase ${sim.phase}.`);
}
function restored(sim: IdleBattle): IdleBattle {
  const snapshot = sim.snapshot();
  const next = IdleBattle.restore(jsonCopy(snapshot));
  assert.ok(next, 'A real model snapshot must restore.');
  assert.deepEqual(next.snapshot(), snapshot);
  assert.deepEqual(next.drainEvents(), [], 'Restore must not replay events or rewards.');
  assert.equal(next.towers[0].def, BASE.tower);
  for (const enemy of next.enemies) assert.equal(enemy.def, BASE.enemies[enemy.def.id]);
  return next;
}
function continueEqually(left: IdleBattle, right: IdleBattle, duration: number): void {
  left.drainEvents();
  right.drainEvents();
  for (let index = 0; index < Math.ceil(duration / 0.1); index++) {
    const dt = Math.min(0.1, duration - index * 0.1);
    left.update(dt);
    right.update(dt);
    assert.deepEqual(right.snapshot(), left.snapshot());
    assert.deepEqual(right.drainEvents(), left.drainEvents());
  }
}

test('JSON round trip preserves a live wave, its homing shots, IDs and deterministic later rewards', () => {
  const sim = new IdleBattle();
  sim.build('tower-02');
  until(sim, () => sim.shots.length > 0 && sim.enemies.length > 1);
  const next = restored(sim);
  assert.notEqual(next.towers[0], sim.towers[0]);
  assert.notEqual(next.enemies[0], sim.enemies[0]);
  assert.notEqual(next.shots[0], sim.shots[0]);
  assert.notEqual(next.layout, sim.layout);
  assert.ok(next.remaining >= next.enemies.length);
  continueEqually(sim, next, 80);
});

test('snapshot records are detached from the live model and from restored models', () => {
  const sim = new IdleBattle();
  until(sim, () => sim.shots.length > 0);
  const snapshot = sim.snapshot(), stable = jsonCopy(snapshot);
  const next = IdleBattle.restore(snapshot)!;
  next.update(0.1);
  assert.deepEqual(snapshot, stable);
  snapshot.gold = 999;
  snapshot.towers[0].level = 3;
  snapshot.enemies[0].hp = 1;
  snapshot.shots[0].damage = 999;
  assert.notEqual(sim.gold, 999);
  assert.equal(sim.towers[0].level, 1);
  assert.notEqual(sim.enemies[0].hp, 1);
  assert.notEqual(sim.shots[0].damage, 999);
  assert.equal(next.towers[0].level, 1);
});

test('a sold source retains its old shot level/damage and pays one kill after reload', () => {
  const sim = new IdleBattle(), tower = sim.build('tower-02')!;
  until(sim, () => sim.shots.some(shot => shot.towerUid === tower.uid));
  const shot = sim.shots.find(candidate => candidate.towerUid === tower.uid)!;
  const target = sim.enemies.find(enemy => enemy.uid === shot.target)!;
  target.hp = 1; // A valid near-lethal state, independently of fired damage.
  sim.gold = 60;
  assert.equal(sim.upgrade(tower.uid), true);
  assert.equal(sim.sell(tower.uid), true);
  assert.equal(shot.damage, BASE.tower.damage);
  assert.equal(shot.level, 1);
  const next = restored(sim), gold = sim.gold, kills = sim.kills;
  continueEqually(sim, next, 0.5);
  assert.equal(sim.gold, gold + BASE.enemies.Leafbug.gold);
  assert.equal(sim.kills, kills + 1);
  assert.ok(!sim.towers.some(candidate => candidate.uid === tower.uid));
});

test('reload immediately before lethal impact and after its event never replays kill money', () => {
  const sim = new IdleBattle();
  until(sim, () => sim.shots.length > 0);
  const shot = sim.shots[0], target = sim.enemies.find(enemy => enemy.uid === shot.target)!;
  target.hp = 1;
  shot.x = target.x;
  shot.y = target.y;
  const next = restored(sim), gold = sim.gold;
  continueEqually(sim, next, BASE.stepSeconds);
  assert.equal(sim.gold, gold + BASE.enemies.Leafbug.gold);
  const afterKill = restored(sim);
  assert.equal(afterKill.gold, sim.gold);
  assert.equal(afterKill.kills, 1);
  assert.deepEqual(afterKill.drainEvents(), []);
  continueEqually(sim, afterKill, 5);
});

test('last enemy and clear bonus cross the save boundary once; intermission resumes at the exact remainder', () => {
  const sim = new IdleBattle();
  until(sim, () => {
    const snapshot = sim.snapshot();
    return snapshot.queue.length === 0 && sim.enemies.length === 1 && sim.shots.length > 0;
  });
  const target = sim.enemies[0];
  target.hp = 1;
  const shot = sim.shots.find(candidate => candidate.target === target.uid)!;
  shot.x = target.x;
  shot.y = target.y;
  const before = restored(sim), gold = sim.gold;
  continueEqually(sim, before, BASE.stepSeconds);
  assert.equal(sim.phase, 'intermission');
  assert.equal(sim.gold, gold + BASE.enemies.Leafbug.gold + BASE.waves.rewardBase + BASE.waves.rewardPerWave);
  sim.update(0.415);
  const after = restored(sim);
  continueEqually(sim, after, 3);
  assert.equal(sim.wave, 2);
});

test('initial delay and sub-tick remainder persist without accelerating or dropping simulation time', () => {
  const sim = new IdleBattle();
  sim.update(0.239);
  const snapshot = sim.snapshot();
  assert.equal(snapshot.phase, 'intermission');
  assert.ok(snapshot.pendingTime > 0);
  const next = restored(sim);
  sim.update(0.011);
  next.update(0.011);
  assert.equal(next.wave, 1);
  assert.deepEqual(next.snapshot(), sim.snapshot());
  continueEqually(sim, next, 3);
});

test('real defeat including the escaped enemy restores and enters the identical farm transition', () => {
  const sim = new IdleBattle();
  until(sim, () => sim.phase === 'defeat', 3000);
  const next = restored(sim), snapshot = sim.snapshot();
  sim.update(BASE.stepSeconds);
  next.update(BASE.stepSeconds);
  assert.deepEqual(next.snapshot(), sim.snapshot());
  assert.equal(next.gold, snapshot.gold);
  assert.equal(next.lives, 20);
  assert.equal(next.mode, 'farm');
  assert.equal(next.phase, 'intermission');
  assert.deepEqual(next.drainEvents(), []);
  continueEqually(sim, next, 30);
});

test('every sampled route corner, enemy recipe and partial update remains valid through later waves', () => {
  const sim = new IdleBattle();
  sim.build('tower-03');
  for (let index = 0; index < 600 && sim.phase !== 'defeat'; index++) {
    sim.update(0.413);
    const next = restored(sim);
    next.update(0.037);
    sim.update(0.037);
    assert.deepEqual(next.snapshot(), sim.snapshot());
    sim.drainEvents();
  }
  assert.ok(sim.wave >= 4, 'Samples must exercise the second enemy definition.');
});

test('invalid resources, times, references, definitions and newer formats are rejected without mutating input', () => {
  const sim = new IdleBattle();
  sim.build('tower-02');
  until(sim, () => sim.shots.length > 0);
  const valid = sim.snapshot();
  const mutations: [string, (value: BattleSnapshot) => void][] = [
    ['schema', value => { value.schemaVersion = 5 as 4; }],
    ['rules', value => { value.rulesVersion = 4 as 3; }],
    ['layout version', value => { value.layoutVersion = 2 as 1; }],
    ['layout identity', value => { value.layoutId = 'unknown' as 'start28'; }],
    ['negative gold', value => { value.gold = -1; }],
    ['fractional gold', value => { value.gold = 0.5; }],
    ['unsafe gold', value => { value.gold = Number.MAX_SAFE_INTEGER + 1; }],
    ['nonfinite earned', value => { value.earned = Number.NaN; }],
    ['negative kills', value => { value.kills = -1; }],
    ['core overflow', value => { value.lives = 21; }],
    ['defeat core mismatch', value => { value.lives = 0; }],
    ['phase', value => { value.phase = 'other' as 'wave'; }],
    ['negative wave', value => { value.wave = -1; }],
    ['tick mismatch', value => { value.ticks++; }],
    ['nonfinite time', value => { value.elapsed = Number.POSITIVE_INFINITY; }],
    ['partial step overflow', value => { value.pendingTime = BASE.stepSeconds; }],
    ['negative partial step', value => { value.pendingTime = -0.001; }],
    ['nonmonotone ID', value => { value.uid = value.shots[0].uid; }],
    ['spawn timer', value => { value.spawnTimer = -1000; }],
    ['intermission timer', value => { value.intermissionRemaining = 3; }],
    ['queue definition', value => { value.queue.push('unknown' as 'Leafbug'); }],
    ['starter protection', value => { value.towers[0].protected = false; }],
    ['starter ID', value => { value.towers[0].uid = value.uid + 1; }],
    ['duplicate tower', value => { value.towers.push({ ...value.towers[0] }); }],
    ['duplicate pad', value => { value.towers[1].padId = value.towers[0].padId; }],
    ['locked pad', value => { value.towers[1].padId = 'tower-east-01'; }],
    ['unknown pad', value => { value.towers[1].padId = 'unknown'; }],
    ['unavailable level', value => { value.towers[0].level = 4; }],
    ['negative cooldown', value => { value.towers[0].cooldown = -0.1; }],
    ['infinite cooldown', value => { value.towers[0].cooldown = Infinity; }],
    ['wrong investment', value => { value.towers[0].spent = 75; }],
    ['impossible kill attribution', value => { value.towers[0].kills = value.kills + 1; }],
    ['definition', value => { value.enemies[0].defId = 'unknown' as 'Leafbug'; }],
    ['prototype definition', value => { value.enemies[0].defId = 'toString' as 'Leafbug'; }],
    ['nonfinite HP', value => { value.enemies[0].hp = NaN; }],
    ['HP overflow', value => { value.enemies[0].hp = value.enemies[0].maxHp + 1; }],
    ['world coordinate', value => { value.enemies[0].x = -1; }],
    ['off route', value => { value.enemies[0].y += 1; }],
    ['route progress', value => { value.enemies[0].distance += 5; }],
    ['route segment', value => { value.enemies[0].segment = 999; }],
    ['route total', value => { value.enemies[0].total += 1; }],
    ['speed', value => { value.enemies[0].speed *= 10; }],
    ['direction', value => { value.enemies[0].direction = 'wrong' as 'side'; }],
    ['projectile target', value => { value.shots[0].target = value.uid; }],
    ['projectile source', value => { value.shots[0].towerUid = value.uid; }],
    ['source is enemy', value => { value.shots[0].towerUid = value.enemies[0].uid; }],
    ['target is tower', value => { value.shots[0].target = value.towers[1].uid; }],
    ['duplicate shot ID', value => { value.shots[0].uid = value.enemies[0].uid; }],
    ['fired damage', value => { value.shots[0].damage += 100; }],
    ['fired level', value => { value.shots[0].level = 0; }],
    ['fired speed', value => { value.shots[0].speed = -1; }],
    ['fired coordinate', value => { value.shots[0].x = Infinity; }],
    ['projectile as reference', value => { value.shots.push({ ...value.shots[0], uid: value.uid++ }); value.shots[1].target = value.shots[0].uid; }],
  ];
  for (const [name, change] of mutations) {
    const bad = jsonCopy(valid);
    change(bad);
    const unchanged = structuredClone(bad);
    assert.equal(IdleBattle.restore(bad), undefined, name);
    assert.deepEqual(bad, unchanged, name);
  }
  for (const bad of [undefined, null, [], 0, 'save', {}, { ...valid, towers: null }, { ...valid, enemies: [null] }]) {
    assert.equal(IdleBattle.restore(bad), undefined);
  }
  assert.deepEqual(sim.snapshot(), valid);
});

test('layout changes cannot be silently serialized under the starting-layout identity', () => {
  const expanded = new IdleBattle(createIdleLayout({ unlockedColumns: 36 }));
  assert.throws(() => expanded.snapshot(), /Unsupported battle layout/);
});
