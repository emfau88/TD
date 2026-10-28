/** Run from repo root after extracting each source's experiments/idle-bastion/src
 * with git archive into qa/early-balance-release/test-cleanup-history/<schema>/.
 * No current model imports. Unit setups are artificial; serialization and
 * continuation oracles are produced and self-validated by the original model.
 * npx tsx experiments/idle-bastion/tests/fixtures/generate-cleanup-fixtures.ts
 */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const load = (schema: string, file = 'battle') => import(pathToFileURL(resolve(
  'qa/early-balance-release/test-cleanup-history', schema, 'experiments/idle-bastion/src', file + '.ts')).href);
const v26 = await load('schema26'), v29 = await load('schema29');
assert.equal(v26.BATTLE_SCHEMA_VERSION, 26); assert.equal(v29.BATTLE_SCHEMA_VERSION, 29);
const out: any = { sources: { schema26: '796f02e5fe49164c1edd7a17e12dcbeed4079001',
  schema29: '537b5e8c9cf09b696b41644da4c56dbc8633d720' },
  provenance: 'Original unmodified historical models. Artificial unit setups, real historical serialization and continuation oracles; no relabelled modern saves.',
  schema26: {}, schema29: {} };
function capture(b: any, Model: any, steps = 40, readable = true) {
  const before = b.snapshot(); assert.deepEqual(Model.restore(before)?.snapshot(), readable ? before : undefined);
  for (let i = 0; i < steps; i++) b.update(.025);
  const after = b.snapshot(); assert.deepEqual(Model.restore(after)?.snapshot(), readable ? after : undefined);
  return { before, steps, after, originalReaderAccepted: readable };
}
for (const wave of [40, 53, 125]) {
  const seed = JSON.parse(readFileSync('artifacts/idle-bastion/acceptance/wave-rework-v2/earned-balanced-late.json', 'utf8'));
  const prep = v26.IdleBattle.restore(seed).snapshot();
  Object.assign(prep, { highestCleared: wave-1, wave: wave-1, phase: 'intermission', mode: 'advance',
    advanceRequested: false, queue: [], enemies: [], shots: [], intermissionRemaining: 0, spawnTimer: 0,
    lives: v26.BASE.coreLives, liveClearedWaves: prep.liveClearedWaves.filter((w: number) => w < wave), farmWave: 1 });
  const b = v26.IdleBattle.restore(prep); assert.ok(b); b.update(3.025);
  if (wave === 125) {
    // The old reader had an HP ceiling bug at wave 125, already fixed by 5e24ddc.
    // Capture the actual old writer/continuation, never patch that old reader.
    const levelled = v26.IdleBattle.restore(prep); levelled.gold = 100000000;
    while (levelled.towers[0].level < 21) assert.ok(levelled.upgrade(levelled.towers[0].uid));
    levelled.update(3.025);
    out.schema26.level21 = capture(levelled, v26.IdleBattle, 40, false);
  }
  out.schema26['wave' + wave] = capture(b, v26.IdleBattle, 40, wave !== 125);
}
function researched() {
  const b = new v29.IdleBattle(); b.update(4); b.gold = 120000; b.highestCleared = 40; b.bossVictories = 1; b.secondBossVictories = 1;
  assert.ok(b.buildWorkshop()); assert.ok(b.researchFrost()); b.update(.025); b.wispArrival.met = true; b.discovery = 'off';
  assert.ok(b.buildTavern(b.recommendedTavernPlot)); assert.ok(b.upgradeTavern()); assert.ok(b.recruitIlyra());
  b.ilyra.introduction = 'done'; assert.ok(b.upgradeWorkshop()); assert.ok(b.researchStorm()); return b;
}
{
  const b = researched(); assert.ok(b.build('tower-02', 5)); b.liveClearedWaves = [1,28]; b.farmWave = 28; b.mode = 'farm'; b.startAttempt();
  for (let i = 0; i < 12000 && !b.shots.some((s: any) => s.kind === 5 && s.chainHits.length); i++) b.update(.025);
  const shot = b.shots.find((s: any) => s.kind === 5 && s.chainHits.length); assert.ok(shot);
  assert.ok(b.upgrade(shot.towerUid)); assert.ok(b.sell(shot.towerUid));
  out.schema29.soldChain = capture(b, v29.IdleBattle, 100);
}
{
  const b = researched(); const tower = b.build('tower-02', 5); assert.ok(tower);
  while (tower.level < 10) assert.ok(b.upgrade(tower.uid));
  const { stepIlyraMotion } = await load('schema29', 'ilyra');
  assert.ok(b.moveIlyraTo({ x: 3, y: 5 }));
  for (let i = 0; i < 3000 && b.ilyra.path.length; i++) stepIlyraMotion(b.ilyra, .025);
  b.mode = 'farm'; b.farmWave = 6; b.liveClearedWaves = [1,6]; b.startAttempt(); b.update(.9);
  assert.ok(b.castIlyraAt(b.enemies[0])); assert.ok(b.sell(tower.uid));
  out.schema29.soldVolley = capture(b, v29.IdleBattle);
}
{
  const b = v29.IdleBattle.newGame(); b.beginIntroduction(); b.build(b.recommendedStarterPad); b.startDefense();
  for (let i = 0; i < 4000 && b.introduction.stage !== 'frost'; i++) {
    b.update(.025); if (!b.learningPaused) continue;
    if (b.introduction.stage === 'upgrade') assert.ok(b.upgrade(1));
    else if (b.introduction.stage === 'workshop') assert.ok(b.buildWorkshop());
    else if (b.introduction.stage === 'research') assert.ok(b.researchFrost());
    if (b.learningPaused) assert.ok(b.continueLesson());
  }
  assert.equal(b.introduction.stage, 'frost'); out.schema29.guidedFrost = capture(b, v29.IdleBattle, 0);
  b.skipLessons(); b.discovery = 'off'; for (let i = 0; i < 8000 && b.gold < 110; i++) b.update(.025);
  const paid = b.build(b.recommendedFrostPad, 2); assert.equal(paid.spent, 110);
  out.schema29.paidFrost = capture(b, v29.IdleBattle, 0);
}
writeFileSync('experiments/idle-bastion/tests/fixtures/cleanup-historical.json', JSON.stringify(out, null, 2) + '\n');
