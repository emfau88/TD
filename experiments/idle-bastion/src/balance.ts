/** Versioned B13 tuning. Old in-flight recipes keep their exact HP and rewards. */
import { waveHealthFactor } from './wave-recipes';
export const BALANCE = Object.freeze({ entryGrowth: 1.16, lateGrowth: 1.13, maxHpMultiplier: 100000, firstBossHealth: 1.2, maxRewardFactor: 4 });
export const REPEAT_REWARD_PERMILLE = 100;
export function healthMultiplier(wave: number, recipe: number, boss: boolean): number {
  const growth = recipe < 10 || wave <= 15 ? Math.pow(BALANCE.entryGrowth, wave - 1) : Math.pow(BALANCE.entryGrowth, 14) * Math.pow(BALANCE.lateGrowth, wave - 15);
  return waveHealthFactor(wave, recipe, boss) * (recipe >= 12 ? Math.min(Number.MAX_VALUE / 1024, growth) : Math.min(BALANCE.maxHpMultiplier, growth)) * (recipe >= 10 && boss && wave === 15 ? BALANCE.firstBossHealth : 1);
}
export function battleReward(base: number, wave: number, recipe: number): number {
  const factor = recipe < 10 || wave <= 15 ? 1 : Math.min(BALANCE.maxRewardFactor, 2 + (wave - 16) * .12);
  const tightening = recipe < 12 || wave <= 20 || wave === 25 ? 1 : 1 - Math.min(1, (wave - 20) / 5) * .04;
  return Math.round(base * factor * tightening);
}

/** Thousandths of gold, including Wisp exactly once. Older in-flight attempts
 * keep their original rewards; first attempts and tutorial repeats stay full.
 * Current rewards are multiples of 100/110 units, so no rounding is discarded.
 */
export function battleRewardUnits(base: number, wave: number, recipe: number, wisp: boolean, repeated: boolean): number {
  const units = battleReward(base, wave, recipe) * (wisp ? 1100 : 1000);
  return recipe >= 17 && repeated ? units * REPEAT_REWARD_PERMILLE / 1000 : units;
}
