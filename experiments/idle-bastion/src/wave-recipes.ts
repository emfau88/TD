import { ENEMIES, introducedEnemy, isHealer, type EnemyId } from './enemy-roster';

export type WaveFamily = 'swarm' | 'rush' | 'armor' | 'support';
export interface WaveRecipe {
  readonly family: WaveFamily;
  readonly enemies: readonly EnemyId[];
  readonly gaps: readonly number[];
  readonly clearGold: number;
  readonly elite: boolean;
}
export const FAMILY_NAMES: Record<WaveFamily, string> = { swarm: 'Schwarm', rush: 'Ansturm', armor: 'Panzer', support: 'Unterstützung' };
// A small repertoire, not one recipe per wave. Introductions overlay its slots.
const ORDER: readonly WaveFamily[] = ['swarm','rush','armor','swarm','armor','rush','support','armor','swarm','rush','armor','rush','swarm','support','rush','armor','rush'];
const PAIRS: Record<WaveFamily, readonly (readonly EnemyId[])[]> = {
  swarm: [['Leafbug','FlyingLocust'],['Firebug','FlyingLocust'],['Leafbug','Firebug'],['Leafbug','ForestGoblin']],
  rush: [['Firebug','FlyingLocust'],['Firebug','Firewasp'],['FlyingLocust','Firewasp'],['ForestGoblin','Firebug'],['ForestGoblin','Voidbutterfly'],['Firewasp','Voidbutterfly']],
  armor: [['Scorpion','Leafbug'],['MagmaCrab','Firebug'],['Clampbeetle','FlyingLocust'],['BoneGuard','Firebug'],['Scorpion','ForestGoblin'],['MagmaCrab','Leafbug'],['BoneGuard','Firewasp']],
  support: [['LanternJelly','Scorpion','Leafbug'],['LanternJelly','MagmaCrab','Firebug'],['ForestCultist','BoneGuard','ForestGoblin'],['ForestCultist','Clampbeetle','Leafbug'],['LanternJelly','ForestCultist','BoneGuard']],
};
function familyAt(wave: number): WaveFamily {
  if (wave < 11) return wave % 2 ? 'rush' : 'swarm';
  if (wave === 11 || wave === 13) return 'armor';
  if (wave === 19) return 'rush';
  if (wave === 20) return 'swarm';
  if (wave === 22) return 'armor';
  if (wave === 21 || wave === 32) return 'support';
  if (wave === 40) return 'armor';
  const index = (wave - 6) % ORDER.length, family = ORDER[index];
  return family === 'support' && wave < 21 ? (ORDER[(index + ORDER.length - 1) % ORDER.length] === 'swarm' ? 'armor' : 'swarm') : family;
}
function recentIntroduction(wave: number): EnemyId | undefined {
  // First regular wave after an introduction, skipping the two reserved bosses.
  for (let delta = 1; delta <= 2; delta++) {
    const intro = introducedEnemy(wave - delta);
    if (intro && intro.firstWave >= 6 && (delta === 1 || wave - 1 === 15 || wave - 1 === 25)) return intro.id;
  }
  return undefined;
}
function composition(types: readonly EnemyId[], count: number, family: WaveFamily, special?: EnemyId): EnemyId[] {
  const healers = types.filter(id => isHealer(ENEMIES[id]));
  const ordinary = types.filter(id => !isHealer(ENEMIES[id]) && id !== special);
  const result = Array.from({length: count}, (_, i) => ordinary[(family === 'armor' || family === 'support' ? (i % 5 < 2 ? 0 : 1) : i % 3 === 2 ? 1 : 0) % ordinary.length]);
  if (healers.length) for (let i = 0; i < Math.min(2, healers.length === 1 && count < 18 ? 1 : 2); i++) result[Math.min(count - 1, 3 + i * Math.floor(count / 2))] = healers[i % healers.length];
  if (special) { result[2] = special; result[Math.min(8, count - 1)] = special; }
  return result;
}
/** Diagnostic pressure only: quantities compensate armor/tempo without changing HP rules. */
export const enemyPressure = (id: EnemyId): number => {
  const e = ENEMIES[id]; return e.hp / (1 - e.armor) * Math.sqrt(e.speed / 45) * (isHealer(e) ? 1.25 : 1);
};
function createRecipe(wave: number, history: readonly (readonly [number,WaveRecipe])[] = []): WaveRecipe {
  const family = familyAt(wave), elite = wave === 40;
  const special = introducedEnemy(wave)?.id ?? recentIntroduction(wave);
  let choices = PAIRS[family].filter(pair => pair.every(id => ENEMIES[id].firstWave <= wave));
  const withoutSpecial=choices.filter(pair=>!pair.includes(special!));
  if(special && withoutSpecial.length)choices=withoutSpecial;
  const lastSeen=(id:EnemyId)=>{for(let i=history.length-1;i>=0;i--)if(history[i][1].enemies.includes(id))return history[i][0];return ENEMIES[id].firstWave-1;};
  const previous=history.at(-1)?.[1].enemies ?? [];
  const score=(pair:readonly EnemyId[])=>Math.max(...pair.map(id=>Math.min(12,wave-lastSeen(id))))**2
    +pair.reduce((sum,id)=>sum+Math.min(12,wave-lastSeen(id))*2,0)
    -pair.filter(id=>previous.includes(id)).length/pair.length*12;
  let types: readonly EnemyId[] = choices.reduce((best,pair)=>score(pair)>score(best)?pair:best,choices[(wave+Math.floor(wave/5))%choices.length]);
  if(elite)types=['BoneGuard','ForestGoblin','ForestCultist'];
  if (special) {
    // Keep the introduction at exactly two; no old fallback can add extra scorpions.
    types = types.filter(id => id !== special);
    if (!types.some(id => !isHealer(ENEMIES[id]))) types = ['Leafbug','Firebug'];
    if (types.length > 2) types = types.slice(0,2);
    if (types.some(id => isHealer(ENEMIES[id])) && isHealer(ENEMIES[special])) types = types.filter(id => !isHealer(ENEMIES[id]));
  }
  const baseCount = Math.min(28, wave + 5);
  const cap = Math.max(10, Math.round(baseCount * ({swarm:1,rush:.9,armor:.76,support:.86}[family])));
  const budget = baseCount * (wave < 11 ? 25 : 28) * (elite ? 1.12 : 1);
  let enemies = composition(types, Math.min(28,cap), family,special), error = Infinity;
  for (let count = Math.min(10,cap); count <= Math.min(28,cap); count++) {
    const candidate = composition(types,count,family,special);
    const pressure = candidate.reduce((sum,id)=>sum+enemyPressure(id),0);
    const difference = Math.abs(pressure-budget);
    if (difference < error) { enemies=candidate; error=difference; }
  }
  const variant = (Math.floor(wave / 4) + wave) % 2;
  const group = family === 'swarm' ? (variant ? 5 : 4) : family === 'rush' ? (variant ? 2 : 3) : 4;
  const gaps = enemies.map((_,i)=>family === 'armor' ? (variant ? .95 : 1.1)
    : (i+1)%group===0 ? (variant ? 1.45 : 1.6) : family==='swarm' ? .34 : family==='rush' ? .48 : .45);
  const killGold=enemies.reduce((sum,id)=>sum+ENEMIES[id].gold,0);
  const targetGold = Math.round((baseCount*11 + 20+Math.min(wave,100)*2)*({swarm:1,rush:1.03,armor:1.14,support:1.12}[family])*(elite?1.12:1));
  return Object.freeze({family,enemies:Object.freeze(enemies),gaps:Object.freeze(gaps),clearGold:Math.max(Math.min(250,20+2*wave),targetGold-killGold),elite});
}
// The opening is derived once in order, independent of attempts/reloads/farming.
// Its bounded history prevents recently introduced species disappearing behind
// introduction overrides. Beyond forty, only one additional recipe is retained.
const opening=new Map<number,WaveRecipe>();
let lastWave = -1, lastRecipe: WaveRecipe;
export function waveRecipe(wave: number): WaveRecipe {
  if(wave<=40){
    for(let w=6;w<=wave;w++)if(w!==15&&w!==25&&!opening.has(w))opening.set(w,createRecipe(w,[...opening]));
    return opening.get(wave)!;
  }
  if (wave !== lastWave) { lastRecipe=createRecipe(wave); lastWave=wave; }
  return lastRecipe;
}
export function spawnGap(wave: number, spawned: number, version: number): number {
  if (version >= 11 && wave >= 6 && wave !== 15 && wave !== 25) return waveRecipe(wave).gaps[spawned-1] ?? 1;
  return version >= 4 && wave >= 6 ? (spawned%3===0?1.65:.32) : Math.max(.75,1.2-(wave-1)*.025);
}
export function clearReward(wave: number, version: number): number {
  return version>=11 && wave>=6 && wave!==15 && wave!==25 ? waveRecipe(wave).clearGold : Math.min(250,20+wave*2);
}
