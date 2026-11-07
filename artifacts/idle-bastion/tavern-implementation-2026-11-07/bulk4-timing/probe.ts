import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const worktree = resolve(process.argv[2]);
const load = (file: string) => import(pathToFileURL(resolve(worktree, 'experiments/idle-bastion/src', file)).href);
const { IdleBattle, BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION } = await load('battle.ts');
const { certifyFarm } = await load('farming.ts');
for (const file of ['control-wave28-earned.json', 'control-wave40-earned.json', 'one-storm-wave70-earned.json']) {
  const snapshot = JSON.parse(readFileSync(resolve(worktree, 'artifacts/idle-bastion/acceptance/b16/economy', file), 'utf8'));
  const b = IdleBattle.restore(snapshot);
  assert.ok(b, `Could not migrate ${file}`);
  const proof = certifyFarm(b);
  console.log(JSON.stringify({ file, schema: BATTLE_SCHEMA_VERSION, rules: BATTLE_RULES_VERSION, proof, levels: b.towers.map(t => [t.padId, t.def.id, t.level]), ilyra: b.ilyra?.introduction }));
}
