import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { BASE, BATTLE_RULES_VERSION, BATTLE_SCHEMA_VERSION, IdleBattle, waveCount, waveEnemy } from '../src/battle';
import { battleRewardUnits, healthMultiplier } from '../src/balance';
import { spawnGap } from '../src/wave-recipes';
import { LeakGuidance } from '../src/leak-guidance';

test('40% rewards preserve enemies, timing, HP, first clears and Wisp through endless waves', () => {
  for (const wave of [...Array.from({ length: 45 }, (_, i) => i + 1), 60, 100]) {
    assert.equal(waveCount(wave, 22), waveCount(wave, 21));
    assert.equal(healthMultiplier(wave, 22, wave === 15 || wave === 25), healthMultiplier(wave, 21, wave === 15 || wave === 25));
    for (let i = 0; i < waveCount(wave, 21); i++) {
      assert.deepEqual(waveEnemy(wave, i, 22), waveEnemy(wave, i, 21));
      assert.equal(spawnGap(wave, i + 1, 22), spawnGap(wave, i + 1, 21));
    }
    for (const wisp of [false, true]) for (const base of [1, 8, 27, 50]) {
      const first = battleRewardUnits(base, wave, 22, wisp, false);
      assert.equal(first, battleRewardUnits(base, wave, 21, wisp, false));
      assert.equal(battleRewardUnits(base, wave, 22, wisp, true), first * 4 / 10);
      assert.equal(battleRewardUnits(base, wave, 21, wisp, true), first / 10);
    }
  }
});

test('schema38 migration retains the entire recorded defense and current attempt until the next wave', () => {
  // Frozen before changing the engine; earned W31 defense with an old in-flight recipe.
  const old = JSON.parse(readFileSync(new URL('../../../artifacts/idle-bastion/acceptance/farm-feedback-2026-11-14/legacy-v21.json', import.meta.url), 'utf8'));
  const untouched = structuredClone(old), b = IdleBattle.restore(old)!;
  assert.ok(b);
  assert.deepEqual(b.snapshot(), { ...old, schemaVersion: BATTLE_SCHEMA_VERSION, rulesVersion: BATTLE_RULES_VERSION });
  assert.deepEqual(old, untouched);
  assert.deepEqual(IdleBattle.restore(b.snapshot())!.snapshot(), b.snapshot());
  const attempt = b.attemptId;
  for (let i = 0; i < 16000 && b.attemptId === attempt; i++) b.update(BASE.stepSeconds);
  assert.ok(b.attemptId > attempt); assert.equal(b.waveRecipeVersion, 22);
  assert.equal(b.lives, 20);
  assert.equal(IdleBattle.restore({ ...old, rulesVersion: 22 }), undefined, 'old schema must validate old rules');
  assert.equal(IdleBattle.restore({ ...b.snapshot(), waveRecipeVersion: 23 }), undefined);
  assert.equal(IdleBattle.restore({ ...b.snapshot(), schemaVersion: 40 }), undefined);
});

test('first-leak reassurance waits for free UI space and persists once per save slot', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const hint = new LeakGuidance('one', storage);
  hint.observe(20); assert.equal(hint.take(false), false);
  hint.observe(19); assert.equal(hint.take(true), false); assert.equal(values.size, 0);
  hint.observe(20); assert.equal(hint.take(false), true, 'deferred reassurance survives the wave boundary');
  hint.observe(18); assert.equal(hint.take(false), false);
  const loaded = new LeakGuidance('one', storage); loaded.observe(19); assert.equal(loaded.take(false), false);
  const another = new LeakGuidance('two', storage); another.observe(19); assert.equal(another.take(false), true);
});

test('defeat takes precedence and blocked preference storage cannot break the hint', () => {
  const hint = new LeakGuidance('blocked', { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } });
  hint.observe(19); hint.observe(0); assert.equal(hint.take(false), false);
  hint.observe(20); assert.equal(hint.take(false), false);
  hint.observe(18); assert.equal(hint.take(false), true);
  hint.observe(19); assert.equal(hint.take(false), false);
});
