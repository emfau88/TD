import { IdleBattle } from './battle';
import { gameDatabase } from './save-namespace';
import { openBattleStore } from './save-store';
import { createEncounterState } from './tavern-encounter-state';

export const TAVERN_PRESETS = ['fresh', 'heart2-10', 'heart2-20', 'heart3', 'gift58-18', 'gift58-30', 'legacy4'] as const;
export type TavernPreset = typeof TAVERN_PRESETS[number];
export function isTavernPreset(value: unknown): value is TavernPreset {
  return TAVERN_PRESETS.includes(value as TavernPreset);
}

/** A recorded, paid defense with explicitly synthetic relationship review states.
 * No combat values, prices, gold or progression rules are granted/overridden.
 */
export function createTavernProbe(preset: TavernPreset, earnedSnapshot: unknown): IdleBattle {
  if (!isTavernPreset(preset)) throw new Error('Unknown Tavern preset');
  const b = IdleBattle.restore(earnedSnapshot);
  if (!b || b.highestCleared !== 25 || b.secondBossVictories < 1 || b.phase !== 'intermission'
    || b.settlement.tavernBuilt || b.ilyra) throw new Error('Invalid recorded Tavern foundation');
  if (!b.buildTavern(b.recommendedTavernPlot!) || !b.upgradeTavern() || !b.recruitIlyra()) {
    throw new Error('Cannot buy Tavern prerequisites');
  }
  // This preview starts after recruitment, outside the combat introduction.
  b.ilyra!.introduction = 'done';
  b.settlement.tavernSeen = true;
  b.tutorial.hidden = true;
  b.discovery = 'off';
  const [points, clears] = preset === 'fresh' ? [0, 0] : preset === 'legacy4' ? [110, 30] : preset === 'heart3' ? [70, 30]
    : preset === 'heart2-10' ? [35, 10] : preset === 'heart2-20' ? [35, 20]
      : preset === 'gift58-18' ? [58, 18] : [58, 30];
  b.social.encounters = createEncounterState();
  for (const who of ['mara', 'ilyra'] as const) {
    b.social.points[who] = points;
    b.social.personal[who] = { clears, claimed: points >= 70 };
    b.social.reserves[who] = { talk: 3, touch: points >= 35 ? 3 : 0, clears: 0 };
  }
  b.drainEvents();
  if (!IdleBattle.restore(b.snapshot())) throw new Error('Tavern preset failed save validation');
  return b;
}

/** The same namespace selected by the real feature-preview Main, never Main's DB. */
export async function saveTavernProbe(battle: IdleBattle, factory: IDBFactory = globalThis.indexedDB): Promise<string> {
  const probe = `tavern-review-${crypto.randomUUID()}`;
  const store = await openBattleStore(factory, gameDatabase(true, probe, true));
  try {
    if ((await store.load()).kind !== 'empty') throw new Error('Tavern preview slot already occupied');
    await store.save(battle.snapshot(), true, 0);
    return probe;
  } finally { store.close(); }
}
