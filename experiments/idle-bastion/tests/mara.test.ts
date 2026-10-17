import assert from 'node:assert/strict';
import test from 'node:test';
import { BASE, BATTLE_RULES_VERSION, IdleBattle } from '../src/battle';
import { certifyFarm, defenseFingerprint, isFarmCertificateValid } from '../src/farming';
import { getForestBlockedCells } from '../src/forest-world';
import { cellCenter, createIdleLayout, getTowerApproachCells, isWalkableCell, type WorldPoint } from '../src/layout';
import { MARA, assignMaraTarget, cloneMara, createMara, stepMara, validMara } from '../src/mara';

const near = (actual: number, expected: number): void => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
const point = ({ x, y }: WorldPoint): WorldPoint => ({ x, y });
function until(battle: IdleBattle, condition: () => boolean, seconds = 60): void {
  for (let step = 0; step < seconds / BASE.stepSeconds && !condition(); step++) battle.update(BASE.stepSeconds);
  assert.ok(condition(), `Condition not reached after ${seconds}s.`);
}
function started(): IdleBattle {
  const battle = new IdleBattle();
  until(battle, () => battle.mara.effectRemaining > 0);
  return battle;
}

test('Mara starts beside the protected tower; automatic effect lasts 8s and repeats at 30s from activation', () => {
  const layout = createIdleLayout(), starterPad = layout.towerPads.find(pad => pad.isStarter)!;
  const tower = { uid: 1, padId: starterPad.id, ...cellCenter(layout, starterPad.cell) };
  const mara = createMara(layout, tower.uid), blocked = getForestBlockedCells(layout);
  assert.deepEqual(point(mara), cellCenter(layout, layout.maraStart));
  assert.equal(stepMara(mara, tower, layout, blocked, 0.025, false, true), 0);
  assert.equal(mara.cooldownRemaining, 0);
  assert.equal(stepMara(mara, tower, layout, blocked, 0.025, true, true), 0);
  assert.equal(mara.effectRemaining, MARA.duration);
  assert.equal(mara.cooldownRemaining, MARA.cooldown);
  let boostedSeconds = 0;
  for (let index = 0; index < 320; index++) boostedSeconds += stepMara(mara, tower, layout, blocked, 0.025, true, true);
  near(boostedSeconds, 8); near(mara.effectRemaining, 0); near(mara.cooldownRemaining, 22);
  for (let index = 0; index < 879; index++) stepMara(mara, tower, layout, blocked, 0.025, true, true);
  assert.ok(mara.cooldownRemaining > 0); assert.equal(mara.effectRemaining, 0);
  stepMara(mara, tower, layout, blocked, 0.025, true, true);
  assert.equal(mara.cooldownRemaining, 30); assert.equal(mara.effectRemaining, 8);
});

test('overclock reduces the existing firing cooldown at 1.5× and does not reset a shot or alter damage', () => {
  const battle = started();
  battle.towers[0].cooldown = 0.5;
  const ordinary = IdleBattle.restore(battle.snapshot(), { maraBonus: false })!;
  const boosted = IdleBattle.restore(battle.snapshot())!;
  assert.equal(ordinary.isMaraBoosted(ordinary.towers[0].uid), false);
  assert.equal(boosted.isMaraBoosted(boosted.towers[0].uid), true);
  boosted.update(0.1); ordinary.update(0.1);
  near(boosted.towers[0].cooldown, 0.35);
  near(ordinary.towers[0].cooldown, 0.4);
  assert.equal(boosted.shots.length, 0);
  until(boosted, () => boosted.shots.length > 0);
  assert.equal(boosted.shots[0].damage, BASE.tower.damage);
});

test('assignment walks at 80px/s on cardinal safe ground, preserves cooldown and gives no bonus before arrival', () => {
  const battle = started(), target = battle.build('tower-02')!, cooldown = battle.mara.cooldownRemaining;
  assert.equal(battle.assignMara(target.uid), true);
  assert.equal(battle.mara.effectRemaining, 0);
  assert.equal(battle.mara.cooldownRemaining, cooldown);
  assert.ok(battle.mara.path.length > 0);
  const blocked = new Set(getForestBlockedCells(battle.layout).map(cell => `${cell.x},${cell.y}`));
  let previous = point(battle.mara);
  for (let step = 0; step < 1000 && battle.mara.path.length; step++) {
    assert.equal(battle.isMaraBoosted(target.uid), false);
    battle.update(BASE.stepSeconds);
    const current = point(battle.mara), dx = Math.abs(current.x - previous.x), dy = Math.abs(current.y - previous.y);
    assert.ok(dx === 0 || dy === 0, 'No diagonal step may cut a blocked corner.');
    near(dx + dy, MARA.speed * BASE.stepSeconds);
    const cell = { x: Math.floor(current.x / 40), y: Math.floor(current.y / 40) };
    assert.ok(isWalkableCell(battle.layout, cell)); assert.equal(blocked.has(`${cell.x},${cell.y}`), false);
    assert.ok(IdleBattle.restore(battle.snapshot()), 'Every in-flight route state must be restorable.');
    previous = current;
  }
  assert.equal(battle.mara.path.length, 0);
  assert.ok(getTowerApproachCells(battle.layout, target.padId).some(cell => {
    const at = cellCenter(battle.layout, cell); return at.x === battle.mara.x && at.y === battle.mara.y;
  }));
  assert.ok(battle.mara.cooldownRemaining < cooldown);
  assert.equal(battle.assignMara(-1), false);
  assert.equal(battle.assignMara(target.uid), false);
});

test('retargeting halfway through a segment rejoins a centre and selling the target falls back to the starter without cooldown reset', () => {
  const battle = started(), target = battle.build('tower-02')!;
  battle.assignMara(target.uid);
  battle.update(0.125);
  const mid = point(battle.mara), cooldown = battle.mara.cooldownRemaining;
  assert.equal(battle.assignMara(battle.towers[0].uid), true);
  assert.equal(battle.mara.cooldownRemaining, cooldown);
  const centre = cellCenter(battle.layout, { x: Math.floor(mid.x / 40), y: Math.floor(mid.y / 40) });
  assert.deepEqual(battle.mara.path[0], centre);
  battle.update(0.025);
  assert.ok(battle.mara.x === mid.x || battle.mara.y === mid.y);
  assert.ok(IdleBattle.restore(battle.snapshot()));
  battle.assignMara(target.uid);
  battle.update(0.025);
  const beforeSell = battle.mara.cooldownRemaining;
  assert.equal(battle.sell(target.uid), true);
  assert.equal(battle.mara.targetTowerUid, battle.towers[0].uid);
  assert.equal(battle.mara.effectRemaining, 0);
  assert.equal(battle.mara.cooldownRemaining, beforeSell);
  assert.ok(IdleBattle.restore(battle.snapshot()));
  until(battle, () => battle.mara.path.length === 0);
  assert.equal(battle.mara.unreachable, false);
});

test('blocked targets stay understandable and harmless, and a changed blocked route reroutes around real obstacles', () => {
  const layout = createIdleLayout(), pad = layout.towerPads.find(pad => pad.id === 'tower-02')!;
  const target = { uid: 2, padId: pad.id, ...cellCenter(layout, pad.cell) };
  const mara = createMara(layout, 1), forest = getForestBlockedCells(layout);
  mara.cooldownRemaining = 12;
  const sealed = [...forest, ...getTowerApproachCells(layout, pad.id)];
  assignMaraTarget(mara, target, layout, sealed);
  assert.equal(mara.unreachable, true); assert.equal(mara.path.length, 0);
  const before = point(mara);
  stepMara(mara, target, layout, sealed, 1, true, true);
  assert.deepEqual(point(mara), before); assert.equal(mara.effectRemaining, 0); near(mara.cooldownRemaining, 11);
  assert.ok(validMara(mara, [target], layout, sealed));
  assignMaraTarget(mara, target, layout, forest);
  assert.equal(mara.unreachable, false); assert.ok(mara.path.length > 1);
  const newlyBlocked = { x: Math.floor(mara.path[0].x / 40), y: Math.floor(mara.path[0].y / 40) };
  const changed = [...forest, newlyBlocked];
  stepMara(mara, target, layout, changed, 0.025, true, true);
  assert.equal(mara.unreachable, false);
  assert.ok(!mara.path.some(point => Math.floor(point.x / 40) === newlyBlocked.x && Math.floor(point.y / 40) === newlyBlocked.y));
  assert.ok(validMara(mara, [target], layout, changed));
});

test('travel, assignment, effect and cooldown reload exactly without replay and continue deterministically', () => {
  const battle = started(), target = battle.build('tower-02')!;
  battle.assignMara(target.uid); battle.update(0.137);
  let restored = IdleBattle.restore(JSON.parse(JSON.stringify(battle.snapshot())))!;
  assert.deepEqual(restored.snapshot(), battle.snapshot()); assert.deepEqual(restored.drainEvents(), []);
  battle.drainEvents();
  for (let index = 0; index < 700; index++) {
    battle.update(0.037); restored.update(0.037);
    assert.deepEqual(restored.snapshot(), battle.snapshot());
    assert.deepEqual(restored.drainEvents(), battle.drainEvents());
    if (index % 50 === 0) restored = IdleBattle.restore(restored.snapshot())!;
  }
  assert.ok(battle.mara.effectRemaining > 0 || battle.mara.cooldownRemaining > 0);
});

test('effect and cooldown continue through wave pauses; waiting without simulation cannot advance them', () => {
  const battle = new IdleBattle();
  until(battle, () => {
    const snapshot = battle.snapshot();
    return snapshot.queue.length === 0 && battle.enemies.length === 1 && battle.shots.some(shot => shot.target === battle.enemies[0].uid);
  });
  const last = battle.enemies[0], shot = battle.shots.find(shot => shot.target === last.uid)!;
  battle.mara.cooldownRemaining = 27; battle.mara.effectRemaining = 5;
  last.hp = 1; shot.x = last.x; shot.y = last.y;
  battle.update(0.025);
  assert.equal(battle.phase, 'intermission');
  near(battle.mara.effectRemaining, 4.975); near(battle.mara.cooldownRemaining, 26.975);
  const frozen = battle.snapshot(), restored = IdleBattle.restore(frozen)!;
  for (const dt of [0, -1, NaN, Infinity]) restored.update(dt);
  assert.deepEqual(restored.snapshot(), frozen);
  battle.update(2); restored.update(2);
  assert.equal(battle.phase, 'wave'); near(battle.mara.effectRemaining, 2.975);
  assert.deepEqual(restored.snapshot(), battle.snapshot());
});

test('old rule snapshots migrate once, preserve money and combat payloads and require fresh live farm evidence', () => {
  const oldBattle = new IdleBattle(undefined, { maraBonus: false });
  until(oldBattle, () => oldBattle.highestCleared === 1);
  oldBattle.update(2.75);
  const modern = oldBattle.snapshot();
  const { mara, ...core } = modern;
  const legacy = { ...core, schemaVersion: 2, rulesVersion: 1 };
  const before = structuredClone(legacy), migrated = IdleBattle.restore(legacy)!;
  assert.ok(migrated);
  assert.equal(migrated.snapshot().schemaVersion, 7); assert.equal(BATTLE_RULES_VERSION, 4);
  assert.deepEqual(migrated.liveClearedWaves, []); assert.equal(migrated.farmWave, 1);
  assert.equal(certifyFarm(migrated), undefined);
  assert.deepEqual(migrated.snapshot().towers, modern.towers);
  assert.deepEqual(migrated.snapshot().enemies, modern.enemies);
  assert.deepEqual(migrated.snapshot().shots, modern.shots);
  assert.equal(migrated.gold, modern.gold); assert.equal(migrated.attemptId, modern.attemptId);
  assert.equal(migrated.mara.targetTowerUid, migrated.towers[0].uid);
  assert.equal(migrated.mara.cooldownRemaining, 0); assert.equal(migrated.mara.effectRemaining, 0);
  assert.deepEqual(migrated.drainEvents(), []); assert.deepEqual(legacy, before);
  assert.equal(IdleBattle.restore({ ...legacy, gold: -1 }), undefined);
  assert.equal(IdleBattle.restore({ ...legacy, liveClearedWaves: [1, 1] }), undefined);
  assert.equal(IdleBattle.restore({ ...legacy, rulesVersion: 2 }), undefined);
});

test('Mara position and temporary effect never inflate a farm proof, while reassignment invalidates its fingerprint', () => {
  const battle = new IdleBattle();
  until(battle, () => battle.highestCleared === 1);
  const ordinary = certifyFarm(battle)!;
  battle.mara.cooldownRemaining = 30; battle.mara.effectRemaining = 8;
  const active = certifyFarm(battle)!;
  assert.deepEqual(active, ordinary);
  assert.deepEqual({ reward: active.rewardGold, duration: active.durationMs }, { reward: 140, duration: 21100 });
  const tower = battle.build('tower-02')!, before = certifyFarm(battle)!;
  const fingerprint = defenseFingerprint(battle);
  assert.equal(battle.assignMara(tower.uid), true);
  assert.notEqual(defenseFingerprint(battle), fingerprint);
  assert.equal(isFarmCertificateValid(before, battle), false);
  const walking = certifyFarm(battle)!;
  assert.equal(walking.rewardGold, before.rewardGold); assert.equal(walking.durationMs, before.durationMs);
});

test('Mara snapshots reject invalid target IDs, obstacles, routes and timer payloads', () => {
  const battle = started(), target = battle.build('tower-02')!;
  battle.assignMara(target.uid); battle.update(0.125);
  const good = battle.snapshot();
  const changes = [
    { targetTowerUid: 999999 }, { x: -1 }, { y: Infinity }, { direction: 'side' },
    { x: 225.5, y: 305.5, path: [], unreachable: true },
    { cooldownRemaining: -1 }, { cooldownRemaining: 31 }, { effectRemaining: 9 },
    { effectRemaining: NaN }, { effectRemaining: 2, cooldownRemaining: 1 },
    { effectRemaining: 1 }, { unreachable: true }, { path: null }, { path: [{ x: 240, y: 280 }] },
    { path: [{ x: 140, y: 140 }] }, // Pond cell, also not adjacent.
    { path: [{ x: 260, y: 340 }] }, // Diagonal first segment.
    { path: [{ x: 260, y: 300 }, { x: 260, y: 300 }] },
    { path: [{ x: 1000, y: 300 }] }, { path: [] },
  ];
  for (const fields of changes) assert.equal(IdleBattle.restore({ ...good, mara: { ...good.mara, ...fields } }), undefined, JSON.stringify(fields));
  assert.equal(IdleBattle.restore({ ...good, mara: undefined }), undefined);
  const restored = IdleBattle.restore(good)!;
  restored.mara.path[0] = { x: 0, y: 0 };
  assert.notDeepEqual(restored.mara.path, good.mara.path);
  assert.deepEqual(battle.snapshot(), good);
});
