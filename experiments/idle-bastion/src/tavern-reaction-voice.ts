import type { Companion } from './tavern-social';
import type { EncounterChoice, EncounterId } from './tavern-encounter-state';

/** Use the existing random pool for deliberate playful reactions, never a fixed line per clip. */
export function voiceForTavernGesture(who: Companion, gesture: string): boolean {
  return gesture === 'giggle' || gesture === 'hip' || gesture === 'tease' && who === 'mara';
}

/** Quiet/confiding replies keep their tone; only the explicitly playful answer gets a voice. */
export function voiceForEncounterAnswer(who: Companion, id: EncounterId, choice: EncounterChoice): boolean {
  return choice === 'second' && (who === 'mara' || id === 'second');
}
