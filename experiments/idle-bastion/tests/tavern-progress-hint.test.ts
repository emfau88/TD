import test from 'node:test';
import assert from 'node:assert/strict';
import { createSocial, type Companion } from '../src/tavern-social';
import { tavernProgressHint } from '../src/tavern-progress-hint';
import { hasTranslation, setLanguage, t } from '../src/i18n';

function fixture(points: number, wins = 0, gifts = 0, talk = 3, touch = 3) {
  const state = createSocial();
  for (const who of ['mara', 'ilyra'] as const) {
    state.points[who] = points;
    state.reserves[who] = { talk, touch: points >= 35 ? touch : 0, clears: 1 };
    state.personal[who] = { clears: wins, claimed: points >= 70 };
  }
  state.gifts = gifts;
  return state;
}

test('heart-three hint names the missing wins, independently of ordinary gift stock', () => {
  for (const who of ['mara', 'ilyra'] as Companion[]) for (const gifts of [0, 20]) {
    const hint = tavernProgressHint(fixture(58, 18, gifts), who, who === 'mara' ? 'Mara' : 'Ilyra');
    assert.match(hint.message, /gewonnene normale Wellen/);
    assert.deepEqual(hint.values, [who === 'mara' ? 'Mara' : 'Ilyra', 12]);
    assert.doesNotMatch(hint.message, /Zuneigung/);
  }
});

test('ready gift and ready affection are explained separately without losing either condition', () => {
  assert.match(tavernProgressHint(fixture(47, 30), 'mara', 'Mara').message, /wartet schon/);
  assert.match(tavernProgressHint(fixture(58, 30), 'mara', 'Mara').message, /überreiche es für Herz 3/);
  const empty = fixture(47, 30, 0, 0, 0);
  const hint = tavernProgressHint(empty, 'mara', 'Mara');
  assert.match(hint.message, /Neue Zuneigung/); assert.deepEqual(hint.values, [2]);
  assert.match(tavernProgressHint(fixture(47, 30, 1, 0, 0), 'mara', 'Mara').message, /normales Geschenk/);
  assert.match(tavernProgressHint(fixture(47, 18, 1, 0, 0), 'mara', 'Mara').message, /aus deinem Vorrat/);
});

test('first gift, exhausted reserve, and completed legacy chapters have an actionable explanation', () => {
  assert.match(tavernProgressHint(fixture(0), 'mara', 'Mara').message, /kennen/);
  assert.match(tavernProgressHint(fixture(23, 0, 1), 'mara', 'Mara').message, /Herz 2/);
  const state = fixture(23); state.clearProgress = 7;
  assert.deepEqual(tavernProgressHint(state, 'mara', 'Mara').values, [3]);
  assert.match(tavernProgressHint(fixture(16, 0, 0, 0), 'mara', 'Mara').message, /Neue Zuneigung/);
  for (const points of [70, 110, 160]) assert.match(tavernProgressHint(fixture(points, 30, 20), 'mara', 'Mara').message, /abgeschlossen/);
});

test('all hint paths translate and reading them never changes earned progress', () => {
  const states = [fixture(0), fixture(23, 0, 1), fixture(23), fixture(35), fixture(47, 30), fixture(47, 30, 0, 0, 0), fixture(47, 30, 1, 0, 0), fixture(47, 18, 1, 0, 0), fixture(58, 18), fixture(58, 30), fixture(70)];
  try {
    for (const state of states) {
      const before = structuredClone(state), hint = tavernProgressHint(state, 'mara', 'Mara');
      assert.ok(hasTranslation(hint.message), hint.message);
      setLanguage('de'); const de = t(hint.message, ...(hint.values ?? []));
      setLanguage('en'); const en = t(hint.message, ...(hint.values ?? []));
      assert.notEqual(en, de); assert.doesNotMatch(en, /\{\d\}/); assert.deepEqual(state, before);
    }
  } finally { setLanguage('en'); }
});
