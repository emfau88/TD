import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const worktree = resolve(process.argv[2]);
const out = dirname(fileURLToPath(import.meta.url));
const src = resolve(worktree, 'experiments/idle-bastion/src');
const load = (file: string) => import(pathToFileURL(resolve(src, file)).href);
const { IdleBattle, BASE, BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION, isNormalFarmWave, stats } = await load('battle.ts');
const { certifyFarm } = await load('farming.ts');
const { createSocial, grantMilestoneGifts, personalGiftReady, validSocial } = await load('tavern-social.ts');
const { encounterEligible } = await load('tavern-encounter-state.ts');
const sha = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const sourceFiles = ['battle.ts', 'farming.ts', 'tavern-social.ts', 'tavern-encounter-state.ts', 'wave-recipes.ts', 'enemy-roster.ts', 'balance.ts', 'boss.ts', 'mara.ts', 'ilyra.ts'];
const hashes = () => Object.fromEntries(sourceFiles.map(file => [file, sha(readFileSync(resolve(src, file)))]));
const beforeHashes = hashes();
const save = (file: string, data: unknown) => writeFileSync(resolve(out, file), JSON.stringify(data, null, 2) + '\n');
const round = (n: number) => Math.round(n * 1e6) / 1e6;
const whoIds = ['mara', 'ilyra'];
const defenses = [
  { id: 'weaker', label: 'Schwächerer bezahlter Stand nach Welle 28', file: 'control-wave28-earned.json' },
  { id: 'normal', label: 'Mittlerer bezahlter Stand nach Welle 40', file: 'control-wave40-earned.json' },
  { id: 'superior', label: 'Überlegener bezahlter Stand nach Welle 70', file: 'one-storm-wave70-earned.json' },
];
const fixtureFolder = resolve(worktree, 'artifacts/idle-bastion/acceptance/b16/economy');

function assertValid(b: any) {
  assert.ok(validSocial(b.social, b.socialAccess, b.attemptId));
  const restored = IdleBattle.restore(b.snapshot());
  assert.ok(restored, 'Audit fixture must be a valid production snapshot');
  assert.deepEqual(restored.snapshot(), b.snapshot());
}
function initial(defense: any) {
  const raw = readFileSync(resolve(fixtureFolder, defense.file));
  const b = IdleBattle.restore(JSON.parse(raw.toString('utf8')));
  assert.ok(b, `Historical paid fixture did not migrate: ${defense.file}`);
  assert.equal(b.phase, 'intermission');
  assert.equal(b.ilyra?.introduction, 'done');
  assert.equal(b.discovery, 'off');
  b.social = createSocial();
  b.social.lastClearAttempt = b.attemptId;
  grantMilestoneGifts(b.social, b.socialAccess);
  assert.equal(b.social.gifts, 4);
  for (const who of whoIds) {
    assert.deepEqual([0, 1, 2].map(() => b.interactCompanion(who, 'talk').points), [8, 8, 7]);
    assert.equal(b.interactCompanion(who, 'gift').points, 12);
  }
  assert.deepEqual(b.social.points, { mara: 35, ilyra: 35 });
  assert.equal(b.social.gifts, 2);
  assertValid(b);
  return { b, input: { path: resolve(fixtureFolder, defense.file), sha256: sha(raw), sourceSchema: JSON.parse(raw.toString('utf8')).schemaVersion } };
}
function visitAction(b: any, actions: any[], start: number, who: string, action: string, choice: any = {}) {
  const time = b.elapsed, before = structuredClone(b.social);
  const result = b.interactCompanion(who, action, choice);
  assert.equal(b.elapsed, time, 'Fixture interactions must not silently simulate reading time');
  actions.push({ atCombatSeconds: round(time - start), who, action, choice, result, beforePoints: before.points[who], afterPoints: b.social.points[who], beforeGifts: before.gifts, afterGifts: b.social.gifts });
  return result;
}
function deniedGate(b: any, targets: string[]) {
  const copy = IdleBattle.restore(b.snapshot());
  assert.ok(copy);
  copy.social.gifts = 20; // Independent full-stock counterfactual, not the timed run.
  const before = structuredClone(copy.social);
  const results = targets.map(who => ({ who, personal: copy.interactCompanion(who, 'gift', { gift: 'personal' }), normal: copy.interactCompanion(who, 'gift', { gift: 'normal' }) }));
  for (const r of results) {
    assert.equal(r.personal.accepted, false); assert.equal(r.personal.reason, 'gift-progress');
    assert.equal(r.normal.accepted, false); assert.equal(r.normal.reason, 'personal-needed');
  }
  assert.deepEqual(copy.social, before);
  return results;
}

const measured: any[] = [];
const cpuStarted = performance.now();
for (const defense of defenses) {
  for (const focus of ['favorite', 'both']) {
    measured.push(run(defense, focus, 'certified'));
  }
}
// Explicit engine lower-bound edge. This is not claimed as the automatic UI's usual farm choice.
measured.push(run(defenses[2], 'both', 'entry-recovery-edge'));

function run(defense: any, focus: string, farmPolicy: string) {
  const { b, input } = initial(defense), targets = focus === 'favorite' ? ['mara'] : whoIds;
  const beforeProof = b.snapshot(), proof = certifyFarm(b);
  assert.ok(proof); assert.deepEqual(b.snapshot(), beforeProof);
  const farmWave = farmPolicy === 'certified' ? proof.wave : 1;
  assert.ok(isNormalFarmWave(farmWave)); assert.ok(b.setFarmWave(farmWave));
  b.mode = 'farm'; b.advanceRequested = false; b.intermissionRemaining = BASE.intermissionSeconds;
  const start = b.elapsed, id = `${defense.id}-${focus}-${farmPolicy}`;
  const actions: any[] = [], clears: any[] = [], visits: any[] = [], gateChecks: any[] = [];
  const initialSnapshot = b.snapshot();
  save(`${id}-start.json`, initialSnapshot);
  for (const who of targets) {
    for (let i = 0; i < 3; i++) assert.equal(visitAction(b, actions, start, who, 'touch', { region: 'hair' }).points, 4);
    assert.equal(visitAction(b, actions, start, who, 'gift', { gift: 'normal' }).points, 11);
    assert.equal(b.social.points[who], 58);
  }
  gateChecks.push({ atWins: 0, results: deniedGate(b, targets) });
  b.drainEvents();
  let waveSeconds = 0, intermissionSeconds = 0, losses = 0, escapes = 0;
  for (let step = 0; step < 2400 / BASE.stepSeconds && clears.length < 30; step++) {
    if (b.phase === 'wave') waveSeconds += BASE.stepSeconds; else intermissionSeconds += BASE.stepSeconds;
    b.update(BASE.stepSeconds);
    const events = b.drainEvents();
    losses += events.filter((e: any) => e.type === 'defeat').length;
    escapes += events.filter((e: any) => e.type === 'escape').length;
    for (const event of events.filter((e: any) => e.type === 'clear')) {
      assert.ok(isNormalFarmWave(event.wave)); assert.equal(event.wave, farmWave);
      assert.equal(b.waveRecipeVersion, BATTLE_RULES_VERSION);
      const wins = clears.length + 1;
      assert.equal(b.social.personal.mara.clears, wins);
      assert.equal(b.social.personal.ilyra.clears, wins);
      clears.push({ index: wins, atCombatSeconds: round(b.elapsed - start), wave: event.wave, attemptId: b.attemptId, lives: b.lives, gifts: b.social.gifts, points: { ...b.social.points } });
      if (wins === 10 || wins === 20) {
        const encounter = wins === 10 ? 'first' : 'second';
        const before = structuredClone(b.social);
        for (const who of targets) {
          assert.ok(encounterEligible(b.social, who, encounter));
          assert.ok(b.beginCompanionEncounter(who, encounter));
          assert.ok(b.chooseCompanionEncounter(who, encounter, 'first'));
          assert.ok(b.finishCompanionEncounter(who, encounter));
        }
        assert.deepEqual(b.social.points, before.points); assert.equal(b.social.gifts, before.gifts);
        visits.push({ atWins: wins, atCombatSeconds: round(b.elapsed - start), encounter, targets, instantStateCommands: targets.length * 3, rewards: 0 });
      }
      if (wins === 29) gateChecks.push({ atWins: 29, results: deniedGate(b, targets) });
    }
  }
  assert.equal(clears.length, 30); assert.equal(losses, 0);
  assert.equal(new Set(clears.map(row => row.attemptId)).size, 30);
  const beforePersonal = structuredClone(b.social);
  for (const who of targets) {
    assert.ok(personalGiftReady(b.social, who)); assert.equal(b.social.points[who], 58);
    assert.equal(visitAction(b, actions, start, who, 'gift', { gift: 'personal' }).points, 12);
    assert.equal(b.social.points[who], 70);
  }
  assert.equal(b.social.gifts, beforePersonal.gifts, 'Personal gifts do not consume ordinary stock');
  assertValid(b);
  save(`${id}-end.json`, b.snapshot());
  const result = { id, defense, input, focus, targets, farmPolicy, farmWave,
    certifiedFarm: { wave: proof.wave, twoCycleSeconds: proof.durationMs / 1000, rewardGold: proof.rewardGold, rewardRemainderUnits: proof.rewardRemainderUnits ?? 0 },
    defenseTowers: b.towers.map((t: any) => ({ pad: t.padId, kind: t.def.id, level: t.level, damage: stats(t).damage, cooldown: stats(t).cooldown })),
    automaticMara: b.mara.autoCast, automaticIlyra: b.ilyra.autoCast, manualCombatCasts: 0,
    combatSeconds: round(b.elapsed - start), waveSeconds: round(waveSeconds), intermissionSeconds: round(intermissionSeconds),
    clears, losses, escapes, actions, visits, gateChecks, initialPoints: initialSnapshot.social.points, initialGifts: initialSnapshot.social.gifts,
    beforePersonal, finalSocial: b.social, realReadingAndInputSeconds: null,
    instantAffectionTransactions: actions.length, instantEncounterStateCommands: visits.reduce((sum, row) => sum + row.instantStateCommands, 0),
    snapshotsRoundtripValid: true };
  console.log(JSON.stringify({ id, farmWave, combatSeconds: result.combatSeconds, losses, escapes, actions: actions.length, finalPoints: b.social.points, gifts: b.social.gifts }));
  return result;
}

const checks: any = {};
for (const defense of defenses) {
  const pair = measured.filter(row => row.defense.id === defense.id && row.farmPolicy === 'certified');
  assert.equal(pair[0].combatSeconds, pair[1].combatSeconds);
  assert.deepEqual(pair[0].clears.map(row => row.atCombatSeconds), pair[1].clears.map(row => row.atCombatSeconds));
}
checks.bothShareSameThirtyLiveWins = true;

// No-gift alternative uses the same earned starting reserves, then the first actual three wins refill.
{
  const row = measured.find(row => row.id === 'normal-both-certified');
  const b = IdleBattle.restore(JSON.parse(readFileSync(resolve(out, `${row.id}-start.json`), 'utf8')));
  const start = b.elapsed, actions: any[] = [];
  for (const who of whoIds) for (let i = 0; i < 3; i++) visitAction(b, actions, start, who, 'touch', { region: 'hair' });
  b.drainEvents(); let wins = 0;
  for (let i = 0; i < 600 / BASE.stepSeconds && wins < 3; i++) { b.update(BASE.stepSeconds); wins += b.drainEvents().filter((e: any) => e.type === 'clear').length; }
  assert.equal(wins, 3);
  for (const who of whoIds) {
    assert.equal(visitAction(b, actions, start, who, 'talk').points, 8);
    assert.equal(visitAction(b, actions, start, who, 'touch', { region: 'hair' }).points, 3);
    assert.equal(b.social.points[who], 58);
  }
  assert.equal(b.social.gifts, 2); assertValid(b);
  checks.giftFreeAffectionAlternative = { wins, combatSeconds: round(b.elapsed - start), actions, points: b.social.points, gifts: b.social.gifts, gateResults: deniedGate(b, whoIds) };
}

// Actual boss victory, actual failed wave, and ordinary offline-gold credit must not advance the personal-win gate.
{
  const { b } = initial(defenses[2]);
  const before = structuredClone(b.social), start = b.elapsed;
  b.mode = 'farm'; assert.ok(b.requestBossChallenge(15)); b.drainEvents();
  let bossVictory = false;
  for (let i = 0; i < 600 / BASE.stepSeconds && !bossVictory; i++) { b.update(BASE.stepSeconds); bossVictory = b.drainEvents().some((e: any) => e.type === 'boss-victory' && e.wave === 15); }
  assert.ok(bossVictory); assert.deepEqual(b.social, before);
  checks.bossVictoryExcluded = { wave: 15, combatSeconds: round(b.elapsed - start), personalClears: b.social.personal };
}
{
  const { b } = initial(defenses[0]);
  const sold = [];
  for (const t of [...b.towers]) if (!t.protected) { assert.ok(b.sell(t.uid)); sold.push(t.padId); }
  const before = structuredClone(b.social), start = b.elapsed;
  b.mode = 'advance'; b.drainEvents(); let defeat = false, failedWave = null;
  for (let i = 0; i < 600 / BASE.stepSeconds && !defeat; i++) {
    b.update(BASE.stepSeconds);
    for (const e of b.drainEvents()) if (e.type === 'defeat') { defeat = true; failedWave = e.wave; }
  }
  assert.ok(defeat, 'Sold-defense exclusion fixture must actually lose');
  assert.deepEqual(b.social, before);
  checks.defeatExcluded = { soldPads: sold, remainingTowerLevel: b.towers[0].level, failedWave, combatSeconds: round(b.elapsed - start), personalClears: b.social.personal };
}
{
  const { b } = initial(defenses[0]), before = structuredClone(b.social);
  b.creditOfflineUnits(12345000); assert.deepEqual(b.social, before);
  checks.offlineExcluded = { creditedGold: 12345, personalClears: b.social.personal };
}
assert.deepEqual(hashes(), beforeHashes, 'Combat/social sources changed during audit; rerun on a stable snapshot');
save('results.json', { date: '2026-11-07', worktree, battleSchema: BATTLE_SCHEMA_VERSION, battleRules: BATTLE_RULES_VERSION, fixedStepSeconds: BASE.stepSeconds,
  sourceHashes: beforeHashes, noDatabaseAccess: true, measuredCpuWallMilliseconds: round(performance.now() - cpuStarted),
  interpretation: 'Combat elapsed is 1x simulation seconds including normal intermissions. Fixture transaction calls and optional encounter status commands run instantly without advancing combat. Human reading, actual UI input, animation, save latency, frame scheduling and offline absence are not timed. Paid historical defense snapshots are migrated with current rules; no new combat gold/tower grants or upgrades occur in timed runs. Social relationships are intentionally reset and advanced through normal commands to exactly 35 points per character before measurement.',
  results: measured, checks });
console.log('All compact timing and exclusion checks passed.');
