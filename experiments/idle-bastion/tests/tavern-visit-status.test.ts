import test from 'node:test';
import assert from 'node:assert/strict';
import { createSocial } from '../src/tavern-social';
import { markEncounterSeen, chooseEncounter, completeEncounter } from '../src/tavern-encounter-state';
import { pendingTavernConversations } from '../src/tavern-visit-status';

const access = { tavernBuilt: true, ilyraRecruited: true, boss15: true, boss25: true };
test('notices appear at own milestones, without spending gifts or clearing unread content', () => {
  const s = createSocial(); s.points.mara = 58; s.personal.mara.clears = 9; s.gifts = 20;
  assert.deepEqual(pendingTavernConversations(s, access), []);
  s.personal.mara.clears = 10;
  const before = structuredClone(s);
  assert.deepEqual(pendingTavernConversations(s, access), [{ who: 'mara', isNew: true }]);
  assert.deepEqual(pendingTavernConversations(s, access), [{ who: 'mara', isNew: true }]);
  assert.deepEqual(s, before);
});
test('started conversation stays resumable; the next available topic becomes new only after completion', () => {
  const s = createSocial(); s.points.mara = 35; s.personal.mara.clears = 20;
  markEncounterSeen(s, 'mara', 'first');
  assert.deepEqual(pendingTavernConversations(s, access), [{ who: 'mara', isNew: false }]);
  chooseEncounter(s, 'mara', 'first', 'second');
  assert.deepEqual(pendingTavernConversations(structuredClone(s), access), [{ who: 'mara', isNew: false }]);
  completeEncounter(s, 'mara', 'first');
  assert.deepEqual(pendingTavernConversations(s, access), [{ who: 'mara', isNew: true }]);
  markEncounterSeen(s, 'mara', 'second'); completeEncounter(s, 'mara', 'second');
  assert.deepEqual(pendingTavernConversations(s, access), []);
});
test('companions are independent, locked access stays quiet, earned heart-three content remains discoverable', () => {
  const s = createSocial(); s.points.mara = 70; s.points.ilyra = 70;
  assert.deepEqual(pendingTavernConversations(s, access), [{ who: 'mara', isNew: true }, { who: 'ilyra', isNew: true }]);
  assert.deepEqual(pendingTavernConversations(s, { ...access, ilyraRecruited: false }), [{ who: 'mara', isNew: true }]);
  assert.deepEqual(pendingTavernConversations(s, { ...access, tavernBuilt: false }), []);
});
