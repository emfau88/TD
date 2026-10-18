/** B10 uses Rosenspiegel's existing artwork and charm concept, with isolated
 * idle tuning. No classic simulation state or animation clock is imported. */
export const BOSS = Object.freeze({
  wave: 15, count: 9, firstReward: 750,
  range: 200, windup: 0.8, channel: 4.5, cooldown: 11, recovery: 6, rateMultiplier: 0.6,
});
export interface BossCharm {
  phase: 'idle' | 'windup' | 'channel' | 'interrupted';
  targetUid: number | null; remaining: number; cooldown: number;
}
export const freshCharm = (): BossCharm => ({ phase: 'idle', targetUid: null, remaining: 0, cooldown: 0 });
export type BossWave = 15 | 25;
export const BOSS_ENCOUNTERS = Object.freeze({
  15: { count: 9, firstReward: 750, title: 'Rosenspiegel' },
  25: { count: 13, firstReward: 1200, title: 'Rosenspiegels Rückkehr' },
});
export const bossEncounter = (wave: number) => BOSS_ENCOUNTERS[wave === 25 ? 25 : 15];
export const isBossWave = (wave: number, recipe = 6): boolean => recipe >= 5 && (wave === 15 || recipe >= 6 && wave === 25);
