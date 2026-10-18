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
export const isBossWave = (wave: number, recipe = 5): boolean => recipe >= 5 && wave === BOSS.wave;
