/** Frozen rules 12, including all later encounters: never rewrite saved attempts. */
import { ENEMIES, introducedEnemy, isHealer, type EnemyId } from './enemy-roster';
import { waveRecipeV11, spawnGapV11, clearRewardV11, type WaveFamily, type WaveRecipe } from './wave-recipes-v11';
export { FAMILY_NAMES, enemyPressure, type WaveFamily, type WaveRecipe } from './wave-recipes-v11';

/** Rules 12 keep the repertoire and introduce/revisit slots, but give each
 * family a visible group size instead of trading almost all bodies for armor. */
function createRecipe(wave: number): WaveRecipe {
  const old = waveRecipeV11(wave);
  if (wave < 11) return old;
  const { family, elite } = old;
  const intro = introducedEnemy(wave)?.id ?? introducedEnemy(wave - 1)?.id
    ?? (wave - 1 === 15 || wave - 1 === 25 ? introducedEnemy(wave - 2)?.id : undefined);
  const special = intro && ENEMIES[intro].firstWave >= 6 ? intro : undefined;
  let healers = [...new Set(old.enemies.filter(id => isHealer(ENEMIES[id])))];
  let ordinary = [...new Set(old.enemies.filter(id => !isHealer(ENEMIES[id]) && id !== special))];
  const light: EnemyId = wave >= 19 ? 'ForestGoblin' : 'Firebug';
  if (ordinary.length === 1 && healers.length) {
    if (special && !isHealer(ENEMIES[special])) ordinary = [light];
    else if (healers.length === 1) ordinary.push(light);
  }
  if (healers.length === 2) { healers = [healers[wave % 2]]; ordinary.push(light); }
  if (wave > 30 && family === 'rush' && ordinary.includes('FlyingLocust')) ordinary = ordinary.map(id => id === 'FlyingLocust' ? 'Firewasp' : id);
  const base = Math.min(28, wave + 5), variant = (Math.floor(wave / 4) + wave) % 2;
  const target = elite ? 26 : family === 'swarm' ? 28 : family === 'rush' ? 27 + variant : family === 'armor' ? 21 + variant : 23 + variant;
  const count = elite ? target : Math.min(target, family === 'armor' ? Math.round(base * .88) : base);
  // Tank groups use 30–40% armored units; support keeps more light escorts.
  const share = family === 'support' ? 3 : family === 'armor' ? (elite ? 2 : 3) + variant : 7;
  const enemies: EnemyId[] = Array.from({ length: count }, (_, i) => ordinary[(i * 7 % 10) < share ? 0 : Math.min(1, ordinary.length - 1)]);
  const supportingHealers = healers.filter(id => id !== special);
  for (let i = 0; i < (supportingHealers.length ? 2 : 0); i++) enemies[3 + i * Math.floor(count / 2)] = supportingHealers[i % supportingHealers.length];
  if (special) { enemies[2] = special; enemies[8] = special; }
  const group = elite ? 4 : family === 'swarm' ? 4 + variant : family === 'rush' ? 3 + variant : family === 'armor' ? 3 : 4;
  const within = elite ? .42 : family === 'swarm' ? .26 : family === 'rush' ? .3 : family === 'armor' ? .6 : .38;
  const pause = elite ? 1.25 : family === 'swarm' ? 1.15 : family === 'rush' ? 1.25 : family === 'armor' ? 1.3 : 1.35;
  const gaps = enemies.map((_, i) => (i + 1) % group === 0 ? pause : within);
  const oldGold = old.clearGold + old.enemies.reduce((sum, id) => sum + ENEMIES[id].gold, 0);
  const killGold = enemies.reduce((sum, id) => sum + ENEMIES[id].gold, 0);
  // Reward the whole encounter; additional bodies do not also buy a larger bonus.
  return Object.freeze({ family, enemies: Object.freeze(enemies), gaps: Object.freeze(gaps), clearGold: Math.max(20, oldGold - killGold), elite });
}
const opening = new Map<number, WaveRecipe>();
let lastWave = -1, lastRecipe: WaveRecipe;
export function waveRecipeV12(wave: number, version = 12): WaveRecipe {
  if (version === 11) return waveRecipeV11(wave);
  if (wave <= 40) {
    if (!opening.has(wave)) opening.set(wave, createRecipe(wave));
    return opening.get(wave)!;
  }
  if (wave !== lastWave) { lastRecipe = createRecipe(wave); lastWave = wave; }
  return lastRecipe;
}
export function spawnGapV12(wave: number, spawned: number, version: number): number {
  return version >= 12 && wave >= 6 && wave !== 15 && wave !== 25 ? waveRecipeV12(wave).gaps[spawned - 1] ?? 1 : spawnGapV11(wave, spawned, version);
}
export function clearRewardV12(wave: number, version: number): number {
  return version >= 12 && wave >= 6 && wave !== 15 && wave !== 25 ? waveRecipeV12(wave).clearGold : clearRewardV11(wave, version);
}
