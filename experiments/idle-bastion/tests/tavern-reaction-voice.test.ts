import test from 'node:test';
import assert from 'node:assert/strict';
import { voiceForEncounterAnswer, voiceForTavernGesture } from '../src/tavern-reaction-voice';
import { tavernEncounter } from '../src/tavern-encounter-content';

test('existing playful gestures use each companion pool; Mara teasing does not leak to Ilyra', () => {
  for (const who of ['mara', 'ilyra'] as const) {
    assert.equal(voiceForTavernGesture(who, 'giggle'), true);
    assert.equal(voiceForTavernGesture(who, 'hip'), true);
    for (const passive of ['idle', 'variant', 'head', 'story', 'next', 'replay', 'unknown']) {
      assert.equal(voiceForTavernGesture(who, passive), false);
    }
  }
  assert.equal(voiceForTavernGesture('mara', 'tease'), true);
  assert.equal(voiceForTavernGesture('ilyra', 'tease'), false);
});

test('playful encounter replies may use a random voice without voicing the quiet or confiding path', () => {
  assert.equal(voiceForEncounterAnswer('mara', 'first', 'second'), true);
  assert.match(tavernEncounter('mara', 'first').choices[1].label, /Takt/);
  assert.equal(voiceForEncounterAnswer('mara', 'second', 'second'), true);
  assert.match(tavernEncounter('mara', 'second').choices[1].label, /Ablenkung/);
  assert.equal(voiceForEncounterAnswer('ilyra', 'second', 'second'), true);
  assert.match(tavernEncounter('ilyra', 'second').choices[1].label, /öfter/);
  assert.equal(voiceForEncounterAnswer('ilyra', 'first', 'second'), false, 'Shared silence stays quiet.');
  for (const who of ['mara', 'ilyra'] as const) for (const id of ['first', 'second'] as const) {
    assert.equal(voiceForEncounterAnswer(who, id, 'first'), false);
  }
});
