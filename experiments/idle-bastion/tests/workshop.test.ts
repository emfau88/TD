import assert from 'node:assert/strict';
import test from 'node:test';
import { BASE, FROST, SETTLEMENT, IdleBattle, stats } from '../src/battle';
import { certifyFarm, defenseFingerprint, isFarmCertificateValid } from '../src/farming';
import { nextObjective, tutorialStep } from '../src/hud';
const until = (battle: IdleBattle, condition: () => boolean, seconds = 200) => {
  for (let i = 0; i < seconds / BASE.stepSeconds && !condition(); i++) battle.update(BASE.stepSeconds);
  assert.ok(condition());
};
function unlocked() {
  const battle = new IdleBattle();
  battle.gold = 1000; // Controlled affordability fixture; never used by browser probes.
  assert.ok(battle.buildWorkshop()); assert.ok(battle.researchFrost());
  return battle;
}
test('workshop and research spend ordinary gold once, gate Frost and levels 4–6, and round-trip', () => {
  const battle = new IdleBattle();
  assert.equal(battle.researchFrost(), false);
  assert.equal(battle.build('tower-02', 2), undefined);
  assert.equal(battle.buildWorkshop(), false);
  battle.gold = SETTLEMENT.workshopCost;
  assert.equal(battle.buildWorkshop(), true); assert.equal(battle.gold, 0);
  assert.equal(battle.buildWorkshop(), false); assert.equal(battle.researchFrost(), false);
  battle.gold = 5000;
  assert.ok(battle.upgrade(1)); assert.ok(battle.upgrade(1)); assert.equal(battle.upgrade(1), false);
  const before = battle.gold;
  assert.ok(battle.researchFrost()); assert.equal(battle.gold, before - SETTLEMENT.researchCost);
  assert.equal(battle.researchFrost(), false);
  const frost = battle.build('tower-02', 2)!; assert.equal(frost.def, FROST);
  for (let level = 3; level < 6; level++) assert.ok(battle.upgrade(1));
  assert.equal(battle.upgrade(1), false); assert.equal(battle.towers[0].visualStage, 2);
  assert.ok(stats(battle.towers[0]).range <= BASE.tower.range + 30);
  assert.deepEqual(IdleBattle.restore(battle.snapshot())!.snapshot(), battle.snapshot());
});
test('a Frost projectile retains its slow after sale and reload; expired slow restores normal speed', () => {
  const battle = unlocked(), frost = battle.build('tower-02', 2)!;
  until(battle, () => battle.shots.some(shot => shot.kind === 2));
  const shot = battle.shots.find(shot => shot.kind === 2)!;
  const target = battle.enemies.find(enemy => enemy.uid === shot.target)!;
  target.hp = target.maxHp; shot.x = target.x; shot.y = target.y;
  battle.shots = [shot];
  assert.ok(battle.sell(frost.uid));
  const restored = IdleBattle.restore(battle.snapshot())!;
  const before = target.distance;
  battle.update(BASE.stepSeconds); restored.update(BASE.stepSeconds);
  assert.equal(target.slowRemaining, 2); assert.ok(battle.tutorial.frostSeen);
  assert.deepEqual(restored.snapshot(), battle.snapshot());
  const atSlow = target.distance;
  battle.update(BASE.stepSeconds);
  assert.ok(Math.abs(target.distance - atSlow - target.speed * SETTLEMENT.slowFactor * BASE.stepSeconds) < 1e-6);
  assert.ok(atSlow > before);
  battle.shots = [];
  for (let i = 0; i < 80; i++) {
    battle.towers[0].cooldown = BASE.tower.cooldown; // Isolate slow expiry from later lethal arrows.
    battle.update(BASE.stepSeconds);
  }
  assert.equal(target.slowRemaining, 0);
});
test('Frost defense receives conservative farm proof and selling it invalidates the old proof', () => {
  const battle = unlocked(); battle.build('tower-02', 2);
  until(battle, () => battle.highestCleared >= 2);
  const proof = certifyFarm(battle)!; assert.ok(proof);
  assert.equal(isFarmCertificateValid(proof, battle), true);
  battle.sell(battle.towers.find(tower => tower.def.id === 2)!.uid);
  assert.equal(isFarmCertificateValid(proof, battle), false);
  assert.ok(certifyFarm(battle));
});
test('schema three preserves Mara and gold while migrating to damaged workshop and fresh live farm evidence', () => {
  const battle = new IdleBattle(); battle.build('tower-02'); battle.assignMara(battle.towers[1].uid); battle.update(1.2);
  const modern = battle.snapshot();
  const { settlement, tutorial, ...old } = modern;
  const legacy = { ...old, schemaVersion: 3, rulesVersion: 2,
    towers: old.towers.map(({kind, ...tower}) => tower),
    enemies: old.enemies.map(({slowRemaining, ...enemy}) => enemy),
    shots: old.shots.map(({kind, ...shot}) => shot) };
  const restored = IdleBattle.restore(legacy)!;
  assert.ok(restored); assert.equal(restored.gold, battle.gold);
  assert.deepEqual(restored.mara, battle.mara); assert.equal(restored.settlement.workshopBuilt, false);
  assert.deepEqual(restored.liveClearedWaves, []);
  assert.deepEqual(restored.snapshot().shots, modern.shots);
});
test('malformed unlocks, Frost payloads and slow timers are rejected', () => {
  const battle = unlocked(); battle.build('tower-02', 2);
  until(battle, () => battle.enemies.length > 0);
  const good = battle.snapshot();
  for (const change of [
    (s: typeof good) => { s.settlement.workshopBuilt = false; },
    (s: typeof good) => { s.settlement.builtAt = s.elapsed + 1; },
    (s: typeof good) => { s.settlement.frostResearched = false; },
    (s: typeof good) => { s.enemies[0].slowRemaining = 3; },
    (s: typeof good) => { s.towers[1].kind = 99 as 2; },
  ]) { const bad = structuredClone(good); change(bad); assert.equal(IdleBattle.restore(bad), undefined); }
});
test('tutorial accepts early actions and alternative pads; replay/skip preserve economy and defense', () => {
  const battle = new IdleBattle();
  assert.equal(tutorialStep(battle), 0);
  battle.build('tower-04'); until(battle, () => battle.gold >= 60);
  battle.upgrade(battle.towers[1].uid);
  assert.equal(tutorialStep(battle), 3); assert.match(nextObjective(battle), /Werkstatt/);
  const before = battle.snapshot(), fingerprint = defenseFingerprint(battle);
  battle.tutorial.hidden = true; battle.tutorial.seen = 255;
  let restored = IdleBattle.restore(battle.snapshot())!;
  assert.equal(restored.tutorial.hidden, true);
  restored.tutorial.hidden = false; restored.tutorial.seen = 0;
  assert.equal(restored.gold, before.gold); assert.deepEqual(restored.snapshot().towers, before.towers);
  assert.equal(defenseFingerprint(restored), fingerprint); assert.equal(tutorialStep(restored), 3);
  assert.ok(restored.sell(restored.towers[1].uid));
  assert.equal(tutorialStep(restored), 3, 'Selling cannot erase a completed introductory action.');
});
