/** Rules 13 add four late species. The balanced opening and historical attempts
 * still use the frozen rules-12 recipes, including their encounter rewards. */
import { ENEMIES, introducedEnemy, isHealer, type EnemyId } from './enemy-roster';
import { waveRecipeV12, spawnGapV12, clearRewardV12 } from './wave-recipes-v12';
import type { WaveFamily, WaveRecipe } from './wave-recipes-v11';
export { FAMILY_NAMES, enemyPressure, type WaveFamily, type WaveRecipe } from './wave-recipes-v11';
const ORDER: readonly WaveFamily[] = ['swarm','rush','armor','swarm','armor','rush','support','armor','swarm','rush','armor','rush','swarm','support','rush','armor','rush'];
const PAIRS: Record<WaveFamily, readonly (readonly EnemyId[])[]> = {
  swarm: [['Leafbug','FlyingLocust'],['MossShroom','Firebug'],['Leafbug','WoodSpider'],['MossShroom','FlyingLocust']],
  rush: [['Firebug','Firewasp'],['ForestGoblin','WoodSpider'],['HornedBat','Voidbutterfly'],['FlyingLocust','Firewasp'],['ForestGoblin','HornedBat'],['WoodSpider','Voidbutterfly']],
  armor: [['Scorpion','Leafbug'],['EmberBomb','ForestGoblin'],['MagmaCrab','Firebug'],['Clampbeetle','FlyingLocust'],['BoneGuard','WoodSpider'],['Scorpion','MossShroom'],['EmberBomb','Firewasp'],['MagmaCrab','MossShroom'],['BoneGuard','HornedBat']],
  support: [['LanternJelly','Scorpion','MossShroom'],['ForestCultist','BoneGuard','ForestGoblin'],['LanternJelly','Clampbeetle','WoodSpider'],['ForestCultist','EmberBomb','Leafbug'],['LanternJelly','MagmaCrab','Firebug'],['ForestCultist','BoneGuard','HornedBat']],
};
/** Family occurrence since wave 41, evaluated in constant space/time even when
 * farming a distant wave directly. No attempt state or global PRNG influences it. */
function occurrence(wave: number, family: WaveFamily): number {
  const cycles = Math.floor((wave - 41) / ORDER.length), tail = (wave - 41) % ORDER.length;
  let value = cycles * ORDER.filter(f => f === family).length;
  for (let i = 0; i < tail; i++) if (ORDER[(41 + i - 6) % ORDER.length] === family) value++;
  return value;
}
function laterRecipe(wave: number): WaveRecipe {
  const base = waveRecipeV12(wave), { family } = base;
  const special = introducedEnemy(wave,13)?.id ?? introducedEnemy(wave-1,13)?.id;
  const choices = PAIRS[family].filter(pair => pair.every(id => ENEMIES[id].firstWave <= wave));
  let types = [...choices[occurrence(wave,family) % choices.length]];
  if (special) {
    types = types.filter(id => id !== special);
    // Keep two introduction slots and at most three silhouettes in the wave.
    types = types.slice(0,2);
  }
  const healers = types.filter(id => isHealer(ENEMIES[id]));
  const ordinary = types.filter(id => !isHealer(ENEMIES[id]));
  const variant = (wave + Math.floor(wave / 4)) % 2;
  const share = family === 'support' ? 3 : family === 'armor' ? 3 + variant : 6 + variant;
  const enemies = base.enemies.map((_, i) => ordinary[(i*7%10) < share ? 0 : Math.min(1,ordinary.length-1)]);
  if (healers.length) for (let i=0;i<2;i++) enemies[3+i*Math.floor(enemies.length/2)]=healers[0];
  if (special) { enemies[2]=special; enemies[8]=special; }
  const targetGold = base.clearGold + base.enemies.reduce((sum,id) => sum+ENEMIES[id].gold,0);
  const killGold = enemies.reduce((sum,id) => sum+ENEMIES[id].gold,0);
  return Object.freeze({ ...base, enemies:Object.freeze(enemies), clearGold:Math.max(20,targetGold-killGold) });
}
let lastWave=-1, lastRecipe: WaveRecipe;
export function waveRecipe(wave: number, version=13): WaveRecipe {
  if (version <= 12 || wave <= 40) return waveRecipeV12(wave,version<=12?version:12);
  if (lastWave !== wave) { lastRecipe=laterRecipe(wave); lastWave=wave; }
  return lastRecipe;
}
export function spawnGap(wave: number, spawned: number, version: number): number {
  return version>=13 && wave>40 ? waveRecipe(wave,version).gaps[spawned-1]??1 : spawnGapV12(wave,spawned,version);
}
export function clearReward(wave: number, version: number): number {
  return version>=13 && wave>40 ? waveRecipe(wave,version).clearGold : clearRewardV12(wave,version);
}
