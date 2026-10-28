import { legacyFixtures, restoreHistorical, assertHistoricalFields } from './legacy-fixtures';
import assert from 'node:assert/strict';
import test from 'node:test';
import { BASE, CANNON, SNIPER, IdleBattle, stats, BATTLE_RULES_VERSION } from '../src/battle';
import { certifyFarm, farmRewardGold, farmRewardUnits, defenseFingerprint } from '../src/farming';
import { beginAbsence, createOfflineState, reserveOffline, claimOffline, restoreOffline } from '../src/offline';
const until = (b: IdleBattle, condition: () => boolean, limit = 240) => {
  for (let i = 0; i < limit / BASE.stepSeconds && !condition(); i++) { b.update(BASE.stepSeconds); b.drainEvents(); }
  assert.ok(condition(), `Condition not reached at ${b.elapsed}s / wave ${b.wave}`);
};
// Explicit controlled progression fixture, never installed in a browser save.
function unlocked(wave = 5) {
  const b = new IdleBattle(); b.update(0.4); b.highestCleared = wave; b.gold = 5000;
  b.buildWorkshop(); b.researchFrost(); return b;
}
test('Wisp and weapons unlock at permanent milestones while the free grid stays available, with no gift or repeated payment on reload', () => {
  const b = unlocked(4), before = b.gold;
  const pads = b.layout.towerPads.filter(p => b.isPadUnlocked(p.id)).map(p => p.id);
  assert.ok(pads.length > 100);
  assert.equal(b.wispUnlocked, false); assert.equal(b.build('tower-05', 3), undefined);
  b.highestCleared = 5; b.wispArrival.at = b.elapsed; // Synthetic milestone must include its saved arrival.
  assert.equal(b.wispUnlocked, true); assert.equal(b.gold, before);
  assert.deepEqual(b.layout.towerPads.filter(p => b.isPadUnlocked(p.id)).map(p => p.id), pads);
  assert.equal(b.build('tower-05', 3)?.def, CANNON);
  assert.equal(b.isTowerUnlocked(4), false);
  b.highestCleared = 10;
  assert.deepEqual(b.layout.towerPads.filter(p => b.isPadUnlocked(p.id)).map(p => p.id), pads);
  assert.equal(b.build('tower-08', 4)?.def, SNIPER);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(), b.snapshot());
  const bad = b.snapshot(); bad.highestCleared = 4;
  assert.equal(IdleBattle.restore(bad), undefined);
});
test('cannon splash pays each kill once, carries tenths, and does not boost sale or offline credit', () => {
  const b = unlocked(), cannon = b.build('tower-02', 3)!;
  const first = b.enemies[0];
  b.enemies = [0, 1, 2].map(i => ({ ...first, uid: 40 + i, x: first.x + i * 8, hp: 28, maxHp: 28 }));
  b.shots = [{ uid: 50, towerUid: cannon.uid, target: 40, x: first.x, y: first.y, speed: BASE.projectileSpeed, damage: stats(cannon).damage, level: 1, kind: 3 }];
  const wallet = b.gold;
  b.update(BASE.stepSeconds);
  assert.equal(b.kills, 3); assert.equal(cannon.kills, 3);
  assert.equal(b.gold - wallet, 26); assert.equal(b.goldRemainderUnits, 400);
  assert.equal(b.progress.battleGold, 26); assert.equal(b.rewardRemainderUnits, 400);
  const earned = b.progress.battleGold;
  b.creditOfflineUnits(1000); assert.equal(b.gold, wallet + 27);
  b.sell(cannon.uid); assert.equal(b.gold, wallet + 27 + Math.round(135 * 0.7));
  assert.equal(b.progress.battleGold, earned);
});
test('sniper prioritizes armor and its projectile ignores mitigation', () => {
  const b = unlocked(10), sniper = b.build('tower-05', 4)!;
  const first = b.enemies[0];
  b.enemies = [
    { ...first, uid: 40, x: sniper.x, y: sniper.y - 30, hp: 100, maxHp: 100, distance: 150 },
    { ...first, uid: 41, def: BASE.enemies.Scorpion, x: sniper.x, y: sniper.y - 35, hp: 100, maxHp: 100, distance: 100 },
  ];
  b.update(BASE.stepSeconds);
  const shot = b.shots.find(s => s.towerUid === sniper.uid)!;
  assert.equal(shot.target, 41);
  const target = b.enemies.find(e => e.uid === 41)!;
  shot.x = target.x; shot.y = target.y; b.update(BASE.stepSeconds);
  assert.equal(target.hp, 47);
});
test('schema five midwave migration preserves combat and historical money, without certifying an old recipe',() => {
  const old=legacyFixtures().critical.midwave[5];
  const migrated=restoreHistorical(old,{liveClearedWaves:[],farmWave:1});
  assert.equal(migrated.waveRecipeVersion,3);assert.deepEqual(migrated.liveClearedWaves,[]);
  assert.equal(certifyFarm(migrated),undefined);
  assert.deepEqual(migrated.progress,old.progress);assert.equal(migrated.gold,old.gold);
  until(migrated,()=>migrated.phase==='intermission');
  assert.deepEqual(migrated.liveClearedWaves,[]);
  until(migrated,()=>migrated.phase==='wave');
  assert.equal(migrated.waveRecipeVersion,BATTLE_RULES_VERSION);
  assert.ok(IdleBattle.restore(migrated.snapshot()));
});
test('Wisp adds precisely ten percent to farm production and offline uses that rate once', () => {
  const b = new IdleBattle(); until(b, () => b.highestCleared === 1);
  const base = certifyFarm(b)!; assert.ok(base);
  b.highestCleared = 5; b.gold = 1000; b.buildWorkshop(); b.researchFrost();
  const withWisp = certifyFarm(b)!; assert.ok(withWisp);
  assert.notEqual(defenseFingerprint(b), base.fingerprint);
  assert.equal(withWisp.durationMs, base.durationMs);
  assert.equal(farmRewardGold(withWisp), farmRewardGold(base) * 1.1);
  const pending = reserveOffline(beginAbsence(createOfflineState(0), 0, withWisp, false), 60000);
  assert.ok(restoreOffline(pending));
  const amount = Number(farmRewardUnits(withWisp) * 600n * 60000n / (BigInt(withWisp.durationMs) * 1000n));
  assert.equal(pending.pendingReward!.amountUnits, amount);
  const claimed = claimOffline(pending, pending.pendingReward!.id), wallet = b.gold * 1000 + b.goldRemainderUnits;
  b.creditOfflineUnits(claimed.amountUnits);
  assert.equal(b.gold * 1000 + b.goldRemainderUnits - wallet, amount);
  assert.equal(claimOffline(claimed.state, pending.pendingReward!.id).amountUnits, 0);
});
test('regular opening still funds workshop and Frost before Wisp; four roles remain saveable into armored waves', () => {
  const b = new IdleBattle(), archer = b.build('tower-03')!; b.assignMara(archer.uid);
  const times: Record<string, number> = {};
  for (let step = 0; step < 16000 && b.highestCleared < 12; step++) {
    if (archer.level === 1 && b.gold >= 60) b.upgrade(archer.uid);
    if (!b.settlement.workshopBuilt && b.buildWorkshop()) times.workshop = b.elapsed;
    if (!b.settlement.frostResearched && b.researchFrost()) times.frost = b.elapsed;
    if (b.wispUnlocked && !times.wisp) times.wisp = b.elapsed;
    if (b.canBuild('tower-02', 2)) b.build('tower-02', 2);
    if (b.canBuild('tower-06', 3)) b.build('tower-06', 3);
    if (b.canBuild('tower-05')) b.build('tower-05');
    if (b.canBuild('tower-07', 4)) b.build('tower-07', 4);
    if (b.highestCleared >= 5) for (const t of b.towers) if (t.level < 3) b.upgrade(t.uid);
    b.update(BASE.stepSeconds); b.drainEvents();
    if (step % 40 === 0) assert.ok(IdleBattle.restore(b.snapshot()));
  }
  assert.ok(times.workshop >= 60 && times.workshop <= 90, JSON.stringify(times));
  assert.ok(times.frost <= 150, JSON.stringify(times));
  assert.ok(times.wisp >= times.frost && times.wisp <= 240, JSON.stringify(times));
  assert.ok(b.highestCleared >= 12); assert.equal(new Set(b.towers.map(t => t.def.id)).size, 4);
  console.log('B08 regular simulation milestone seconds:', times);
});
