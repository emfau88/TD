import type { Companion, SocialState } from './tavern-social';

export const ENCOUNTER_IDS = ['first', 'second'] as const;
export type EncounterId = typeof ENCOUNTER_IDS[number];
export type EncounterChoice = 'first' | 'second';
export interface EncounterRecord { seen: boolean; choice: EncounterChoice | null; completed: boolean }
export type EncounterState = Record<Companion, Record<EncounterId, EncounterRecord>>;
type Progress = Pick<SocialState, 'points' | 'personal'>;
const companions = ['mara', 'ilyra'] as const;
const thresholds: Readonly<Record<EncounterId, number>> = { first: 10, second: 20 };
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const validWho = (who: Companion): boolean => companions.includes(who);
const validId = (id: EncounterId): boolean => ENCOUNTER_IDS.includes(id);

export const createEncounterState = (): EncounterState => ({
  mara: { first: { seen: false, choice: null, completed: false }, second: { seen: false, choice: null, completed: false } },
  ilyra: { first: { seen: false, choice: null, completed: false }, second: { seen: false, choice: null, completed: false } },
});

/** Higher earned hearts make missed old content available, without inventing wins. */
export function encounterEligible(state: Progress, who: Companion, id: EncounterId): boolean {
  return validWho(who) && validId(id) && (state.points[who] >= 70
    || state.points[who] >= 35 && state.personal[who].clears >= thresholds[id]);
}
export function nextEncounter(state: SocialState, who: Companion): EncounterId | undefined {
  return validWho(who) ? ENCOUNTER_IDS.find(id => encounterEligible(state, who, id) && !state.encounters[who][id].completed) : undefined;
}
export function encounterRecord(state: SocialState, who: Companion, id: EncounterId): Readonly<EncounterRecord> | undefined {
  return validWho(who) && validId(id) ? { ...state.encounters[who][id] } : undefined;
}
export function markEncounterSeen(state: SocialState, who: Companion, id: EncounterId): boolean {
  if (!encounterEligible(state, who, id)) return false;
  const record = state.encounters[who][id];
  if (record.seen) return false;
  record.seen = true; return true;
}
export function chooseEncounter(state: SocialState, who: Companion, id: EncounterId, choice: EncounterChoice): boolean {
  if (!encounterEligible(state, who, id) || choice !== 'first' && choice !== 'second') return false;
  const record = state.encounters[who][id];
  if (!record.seen || record.completed || record.choice !== null) return false;
  record.choice = choice; return true;
}
export function completeEncounter(state: SocialState, who: Companion, id: EncounterId): boolean {
  if (!encounterEligible(state, who, id)) return false;
  const record = state.encounters[who][id];
  if (!record.seen || record.completed) return false;
  record.completed = true; return true;
}

/** Fixed bounded records; progress cannot claim an unavailable or unread encounter. */
export function validEncounterState(value: unknown, progress: Progress): value is EncounterState {
  if (!object(value) || Object.keys(value).length !== 2) return false;
  for (const who of companions) {
    const records = value[who];
    if (!object(records) || Object.keys(records).length !== 2) return false;
    for (const id of ENCOUNTER_IDS) {
      const record = records[id];
      if (!object(record) || Object.keys(record).length !== 3 || typeof record.seen !== 'boolean'
        || typeof record.completed !== 'boolean' || record.choice !== null && record.choice !== 'first' && record.choice !== 'second'
        || !record.seen && (record.choice !== null || record.completed)
        || record.seen && !encounterEligible(progress, who, id)) return false;
    }
  }
  return true;
}
