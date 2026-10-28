import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BATTLE_SCHEMA_VERSION, BATTLE_RULES_VERSION, IdleBattle } from '../src/battle';
export const cleanupFixtures = () => JSON.parse(readFileSync(new URL('./fixtures/cleanup-historical.json', import.meta.url), 'utf8'));
/** Explicit schema-32 expectation for the frozen combat fixtures (no interactions).
 * Do not call the runtime migration to construct its own expected result.
 * Relationship-rich migrations are independently covered in tavern-social.test.ts.
 */
export function expectedCombatSocial(old: any) {
  assert.deepEqual(old.social.points, { mara: 0, ilyra: 0 });
  assert.ok(!old.ilyra || old.social.gifts > 0, 'fixture already owns the welcome gift');
  return { points: { mara: 0, ilyra: 0 }, gifts: old.social.gifts,
    claimed: { ...old.social.claimed, ilyraWelcome: !!old.ilyra },
    reserves: { mara: old.settlement.tavernBuilt ? { talk: 3, touch: 0, clears: 0 } : null,
      ilyra: old.ilyra ? { talk: 3, touch: 0, clears: 0 } : null },
    personal: { mara: { clears: 0, claimed: false }, ilyra: { clears: 0, claimed: false } },
    clearProgress: old.social.window.clearProgress, lastClearAttempt: old.social.lastClearAttempt };
}
export function expectedCombatMigration(old: any) {
  return { ...old, schemaVersion: BATTLE_SCHEMA_VERSION, rulesVersion: BATTLE_RULES_VERSION,
    tutorialFrostUid: old.tutorialFrostUid ?? null,
    settlement: { ...old.settlement, stormResearched: old.settlement.stormResearched ?? false },
    social: expectedCombatSocial(old) };
}
export function checkOldContinuation(fixture: any) {
  const untouched = structuredClone(fixture.before), b = IdleBattle.restore(fixture.before);
  assert.ok(b); assert.deepEqual(fixture.before, untouched);
  assert.deepEqual(b.snapshot(), expectedCombatMigration(fixture.before));
  const clone = IdleBattle.restore(b.snapshot())!;
  for (let i = 0; i < fixture.steps; i++) { b.update(.025); clone.update(.025); }
  // The old social window ticked in real combat; schema 32 uses victories.
  // These in-flight probes cross no victory, so only the migrated reserves stay put.
  assert.equal(fixture.after.attemptId, fixture.before.attemptId);
  assert.deepEqual(b.snapshot(), { ...expectedCombatMigration(fixture.after), social: expectedCombatSocial(fixture.before) });
  assert.deepEqual(clone.snapshot(), b.snapshot());
  return b;
}
