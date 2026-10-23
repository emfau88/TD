/** Read-only A/B on paid B16 saves. Temporary copies use identical production
 * proof logic; only candidate selection differs. Instrumentation never ships. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cpus } from 'node:os';
import { IdleBattle, BATTLE_RULES_VERSION } from '../../src/battle';
import { farmRewardGold, type FarmCertificate } from '../../src/farming';

const base = '922aff633c615881ef068918676ab96aa90cb830';
const sourcePath = 'experiments/idle-bastion/src/farming.ts';
const baseline = execFileSync('git', ['show', `${base}:${sourcePath}`], { encoding: 'utf8' });
const temporary = 'experiments/idle-bastion/.local-assets';
const output = 'artifacts/idle-bastion/acceptance/farm-search';
mkdirSync(temporary, { recursive: true }); mkdirSync(output, { recursive: true });
assert.equal(BATTLE_RULES_VERSION, 15, 'Reassess the paired baseline after combat rules change.');

const midpoint = `function candidateWaves(battle: IdleBattle, previous?: FarmCertificate): number[] {
  const completed = battle.liveClearedWaves.filter(wave => isNormalFarmWave(wave) && wave <= battle.highestCleared)
    .sort((a, b) => b - a);
  const preferred = previous && previous.wave > 1 && completed.includes(previous.wave) ? previous.wave
    : battle.farmWave > 1 && completed.includes(battle.farmWave) ? battle.farmWave : undefined;
  // Try a proven live clear between the old safe choice and the frontier. The
  // former certificate remains a candidate, even when an upgrade invalidated it.
  const target = preferred === undefined ? undefined : (preferred + completed[0]) / 2;
  const middle = target === undefined ? undefined : completed.filter(wave => wave > preferred! && wave < completed[0])
    .sort((a, b) => Math.abs(a - target) - Math.abs(b - target) || a - b)[0];
  const recovery = !isFarmCertificateValid(previous, battle);
  const entry = completed.includes(1) ? [1] : [];
  const candidates = [...new Set([completed[0], preferred, middle, completed[1], ...(recovery ? [completed[2]] : [])])]
    .filter((wave): wave is number => wave !== undefined && wave !== 1 && completed.includes(wave));
  return [...candidates.slice(0, MAX_FARM_CANDIDATES-entry.length), ...entry];
}`;
const policyRange = /function candidateWaves\([\s\S]+?\n}\n\nfunction prove/;
assert.ok(policyRange.test(baseline));
const variants: Record<string, string> = {
  baseline,
  midpoint: baseline.replace(policyRange, `${midpoint}\n\nfunction prove`),
  current: readFileSync(sourcePath, 'utf8'),
};
type Measured = {
  certifyFarm: (b: IdleBattle, previous?: FarmCertificate) => FarmCertificate | undefined;
  candidateWaves: (b: IdleBattle, previous?: FarmCertificate) => number[];
  measurement: { steps: number; probes: number[] };
};
const modules: Record<string, Measured> = {};
for (const [name, source] of Object.entries(variants)) {
  let instrumented = source.replaceAll("from './", "from '../src/")
    .replace('function candidateWaves(', 'export function candidateWaves(')
    .replace('  const snapshot = battle.snapshot();', '  measurement.probes.push(wave);\n  const snapshot = battle.snapshot();')
    .replace('    probe.update(BASE.stepSeconds);', '    measurement.steps++;\n    probe.update(BASE.stepSeconds);');
  instrumented += '\nexport const measurement: {steps:number; probes:number[]} = { steps:0, probes:[] };\n';
  const path = resolve(temporary, `farm-search-${name}.ts`);
  writeFileSync(path, instrumented);
  modules[name] = await import(pathToFileURL(path).href);
}
const repeats = Number(process.env.SPIRE_FARM_REPEATS ?? 7);
const rows: unknown[] = [];
for (const strategy of ['control', 'one-storm', 'two-storms']) for (const wave of [40, 50, 60, 70]) {
  const path = `artifacts/idle-bastion/acceptance/b16/economy/${strategy}-wave${wave}-earned.json`;
  const snapshot = JSON.parse(readFileSync(path, 'utf8'));
  const original = IdleBattle.restore(snapshot)!; assert.ok(original);
  const previous = modules.baseline.certifyFarm(original); assert.ok(previous);
  for (const state of ['raw', 'certified'] as const) {
    const proof = state === 'certified' ? previous : undefined;
    const results: Record<string, unknown> = {};
    // Warm each policy before measuring, then alternate execution order.
    for (const policy of Object.values(modules)) policy.certifyFarm(IdleBattle.restore(snapshot)!, proof);
    const measurements: Record<string, number[]> = Object.fromEntries(Object.keys(modules).map(name => [name, []]));
    for (let repeat = 0; repeat < repeats; repeat++) {
      const names = Object.keys(modules); if (repeat % 2) names.reverse();
      for (const name of names) {
        const policy = modules[name], b = IdleBattle.restore(snapshot)!;
        const before = b.snapshot(), events = structuredClone(b.events);
        policy.measurement.steps = 0; policy.measurement.probes = [];
        const start = performance.now(), result = policy.certifyFarm(b, proof), ms = performance.now() - start;
        measurements[name].push(ms);
        assert.deepEqual(b.snapshot(), before); assert.deepEqual(b.events, events);
        assert.ok(policy.measurement.probes.length <= 4); assert.ok(policy.measurement.steps <= 4 * 8000);
        assert.ok(policy.measurement.probes.every(w => before.liveClearedWaves.includes(w) && w <= before.highestCleared));
        results[name] = { candidates: policy.candidateWaves(b, proof), probes: policy.measurement.probes,
          steps: policy.measurement.steps, certificate: result ?? null,
          wave: result?.wave ?? null, goldPerMinute: result ? farmRewardGold(result) * 60000 / result.durationMs : 0 };
      }
    }
    for (const [name, times] of Object.entries(measurements)) {
      times.sort((a, b) => a - b);
      Object.assign(results[name]!, { medianMs: times[Math.floor(times.length / 2)], timingsMs: times });
    }
    const row = { strategy, record: wave, state, source: path, savedFarmWave: original.farmWave, results };
    rows.push(row);
    console.log(JSON.stringify(row, ['strategy', 'record', 'state', 'results', ...Object.keys(modules), 'wave', 'goldPerMinute', 'steps', 'medianMs']));
  }
}
writeFileSync(`${output}/comparison.json`, JSON.stringify({ base, repeats, node: process.version, cpu: cpus()[0]?.model,
  method: 'Paid saved defenses, no grants or purchases; identical two-clear production proof; alternating warmed runs.', rows }, null, 2) + '\n');
