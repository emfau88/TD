/** Rules 18: measured B progression, with a small frost-resistant escort.
 * Historical attempts remain routed through their frozen recipes. */
import { ENEMIES, introducedEnemy, isHealer, type EnemyId } from './enemy-roster';
import { enemyPressure, type WaveRecipe } from './wave-recipes-v11';
import { waveRecipeV17, spawnGapV17, clearRewardV17 } from './wave-recipes-v17';
export { FAMILY_NAMES, enemyPressure, type WaveFamily, type WaveRecipe } from './wave-recipes-v11';

// Only the 25 reviewed encounters are cached; endless recipes retain the
// existing bounded generator. New enemy roles can use the same pressure budget.
const progressionRecipes = new Map<number, WaveRecipe>();
const FROST_ESCORT_WAVES: readonly number[] = [35, 38];
export function waveRecipe(wave: number, version = 18): WaveRecipe {
  const old = waveRecipeV17(wave, version);
  if (version < 18 || wave <= 25 || wave > 50 || old.elite) return old;
  const cached = progressionRecipes.get(wave);
  if (cached) return cached;
  const special = introducedEnemy(wave, 18)?.id ?? introducedEnemy(wave - 1, 18)?.id;
  const types = [...new Set(old.enemies)].filter(id => !isHealer(ENEMIES[id]) && id !== special);
  const count = (id: EnemyId) => old.enemies.filter(x => x === id).length;
  const light = types.filter(id => ENEMIES[id].armor === 0).sort((a, b) => count(b) - count(a))[0];
  const armored = types.filter(id => ENEMIES[id].armor > 0).sort((a, b) => enemyPressure(b) - enemyPressure(a))[0];
  const fast = [...types].sort((a, b) => ENEMIES[b].speed - ENEMIES[a].speed)[0];
  const heavyFamily = old.family === 'armor' || old.family === 'support';
  const from = heavyFamily ? light : [...types].sort((a, b) => count(b) - count(a))[0];
  const to = heavyFamily ? armored : fast;
  const replacements = heavyFamily ? 2 : old.family === 'swarm' ? 4 : 3;
  const enemies = [...old.enemies];
  let clearGold = old.clearGold;
  const replace = (index: number, id: EnemyId) => {
    const cost = ENEMIES[id].gold - ENEMIES[enemies[index]].gold;
    if (clearGold - cost < 20) return;
    enemies[index] = id;
    clearGold -= cost;
  };
  if (from && to && from !== to) {
    const slots = enemies.map((id, i) => id === from ? i : -1).filter(i => i >= 0);
    const n = Math.min(replacements, slots.length);
    for (let k = 0; k < n; k++) replace(slots[Math.floor(k * slots.length / n)], to);
  }
  // Two established fast escorts, without changing introductions or healers.
  if (FROST_ESCORT_WAVES.includes(wave)) {
    const slots = enemies.map((id, i) => id === light ? i : -1).filter(i => i >= 0);
    for (const index of [slots[1], slots[Math.floor(slots.length / 2)]]) {
      if (index !== undefined) replace(index, 'Voidbutterfly');
    }
  }
  const recipe = Object.freeze({ ...old, enemies: Object.freeze(enemies), clearGold });
  progressionRecipes.set(wave, recipe);
  return recipe;
}

export const spawnGap = spawnGapV17; // Quantities and clocks are unchanged.
export function clearReward(wave: number, version: number): number {
  return version >= 18 && wave >= 26 && wave <= 50
    ? waveRecipe(wave, version).clearGold : clearRewardV17(wave, version);
}

let progressionAnchor: number | undefined;
/** Normalize mixed groups against a fixed W26–30 reference, then apply B's
 * finite ramp. The ordinary 13% growth continues after W50 without a reset.
 * This is a shared difficulty curve, never adaptive to the player's defense. */
export function waveHealthFactor(wave: number, version: number, boss: boolean): number {
  if (version < 18 || wave <= 25 || boss) return 1;
  progressionAnchor ??= Math.exp([26, 27, 28, 29, 30].reduce((sum, w) => sum
    + Math.log(waveRecipeV17(w, 17).enemies.reduce((s, id) => s + enemyPressure(id), 0)), 0) / 5);
  const weight = waveRecipe(wave, version).enemies.reduce((sum, id) => sum + enemyPressure(id), 0);
  return progressionAnchor / weight * (1 + .06 * Math.min(wave - 25, 10));
}
