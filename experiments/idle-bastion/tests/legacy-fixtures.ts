import { IdleBattle, BATTLE_SCHEMA_VERSION, BATTLE_RULES_VERSION } from '../src/battle';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** Frozen original-model inputs/oracles; source commits are recorded in the JSON.
 * Clone per caller so a rejection test cannot corrupt a later test's fixture.
 */
export function legacyFixtures() {
  return JSON.parse(readFileSync(new URL('./fixtures/legacy-migrations.json', import.meta.url), 'utf8'));
}

/** Compare every historical field exactly, including all array entries.
 * New fields are checked separately against their documented migration defaults.
 * Version changes must be specified explicitly by the caller, never ignored here.
 */
export function assertHistoricalFields(actual: unknown, expected: unknown, at = 'snapshot'): void {
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), at);
    assert.equal(actual.length, expected.length, at + '.length');
    expected.forEach((value, index) => assertHistoricalFields(actual[index], value, at + '[' + index + ']'));
  } else if (expected !== null && typeof expected === 'object') {
    assert.ok(actual !== null && typeof actual === 'object', at);
    for (const [key, value] of Object.entries(expected)) {
      assert.ok(Object.hasOwn(actual, key), at + '.' + key + ' must be preserved');
      assertHistoricalFields((actual as Record<string, unknown>)[key], value, at + '.' + key);
    }
  } else {
    assert.deepEqual(actual, expected, at);
  }
}

/** Validate an original-format input without mutating it and check every old field.
 * Explicit overrides describe intentional data migrations, never ignored failures.
 */
export function restoreHistorical(old: Record<string, any>, changes: Record<string, unknown> = {}): IdleBattle {
  const untouched = structuredClone(old);
  const battle = IdleBattle.restore(old);
  assert.ok(battle, 'historical schema ' + old.schemaVersion + ' must load');
  assert.deepEqual(old, untouched, 'migration must not mutate its input');
  const snapshot = battle.snapshot();
  assertHistoricalFields(snapshot, { ...old, schemaVersion: BATTLE_SCHEMA_VERSION,
    rulesVersion: BATTLE_RULES_VERSION, layoutVersion: Math.max(3, old.layoutVersion), ...changes });
  assert.deepEqual(IdleBattle.restore(snapshot)!.snapshot(), snapshot, 'exact current reload');
  return battle;
}
