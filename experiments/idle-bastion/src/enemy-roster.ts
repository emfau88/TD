/** Idle-owned balance; the original enemy packs supply art, not mutable rules. */
export type EnemyId = 'Leafbug' | 'Firebug' | 'Scorpion' | 'Rosenspiegel' | 'FlyingLocust' | 'Firewasp' | 'MagmaCrab' | 'Clampbeetle' | 'LanternJelly' | 'Voidbutterfly' | 'ForestGoblin' | 'BoneGuard' | 'ForestCultist' | 'MossShroom' | 'WoodSpider' | 'HornedBat' | 'EmberBomb';
export interface EnemyDef {
  readonly id: EnemyId; readonly name: string; readonly hp: number; readonly speed: number;
  readonly gold: number; readonly armor: number; readonly lives: number;
  readonly firstWave: number; readonly flying: boolean; readonly slowFactor: number;
  readonly role: string; readonly counter: string;
}
function enemy(id: EnemyId, name: string, hp: number, speed: number, gold: number, armor: number, lives: number, firstWave: number, flying: boolean, role: string, counter: string, slowFactor = .55): EnemyDef {
  return Object.freeze({ id, name, hp, speed, gold, armor, lives, firstWave, flying, role, counter, slowFactor });
}
export const ENEMIES = Object.freeze({
  Leafbug: enemy('Leafbug', 'Blattkäfer', 24, 45, 8, 0, 1, 1, false, 'Ungepanzerter Schwarm', 'Waldwächter und Flächenschaden'),
  Firebug: enemy('Firebug', 'Feuerkäfer', 34, 56, 11, 0, 1, 4, false, 'Zügiger Nahverwandter', 'Frost verlängert das Schussfenster'),
  FlyingLocust: enemy('FlyingLocust', 'Flugheuschrecke', 20, 63, 9, 0, 1, 6, true, 'Schneller, leichter Schwarm', 'Frost und Steinschleuder kombinieren'),
  Firewasp: enemy('Firewasp', 'Feuerwespe', 26, 72, 12, 0, 1, 9, true, 'Sehr schneller Durchbrecher', 'Überlappende Reichweiten und Frost'),
  Scorpion: enemy('Scorpion', 'Panzerskorpion', 50, 40, 15, .45, 2, 11, false, '45 % Rüstung', 'Scharfschütze ignoriert Rüstung'),
  MagmaCrab: enemy('MagmaCrab', 'Magmakrabbe', 80, 30, 22, .25, 2, 13, false, 'Langsam, viele Lebenspunkte · 25 % Rüstung', 'Durchdringung und konzentrierter Schaden'),
  Rosenspiegel: enemy('Rosenspiegel', 'Rosenspiegel', 850, 32, 80, .1, 20, 15, false, 'Boss · verführt einen Turm', 'Frost bremst den Vormarsch; ihr Tanz bleibt aktiv'),
  Clampbeetle: enemy('Clampbeetle', 'Panzerflieger', 48, 49, 18, .3, 2, 17, true, 'Beweglicher Panzer · 30 % Rüstung', 'Scharfschütze mit Frost absichern'),
  LanternJelly: enemy('LanternJelly', 'Laternenqualle', 38, 40, 17, 0, 1, 21, true, 'Heilt bis zu zwei verwundete Begleiter', 'Gruppen mit Flächenschaden unter Druck setzen'),
  Voidbutterfly: enemy('Voidbutterfly', 'Leerenfalter', 34, 76, 16, .1, 1, 28, true, 'Frost verlangsamt ihn nur um 20 %', 'Direktschaden und mehrere Schussbereiche', .8),
  ForestGoblin: enemy('ForestGoblin', 'Waldgoblin', 36, 66, 13, 0, 1, 19, false, 'Schneller Bodenläufer mit mittleren Lebenspunkten', 'Frost und überlappende Schussbereiche'),
  BoneGuard: enemy('BoneGuard', 'Knochenwächter', 55, 44, 17, .25, 2, 26, false, 'Mittelschwerer Wächter · 25 % Rüstung', 'Scharfschütze oder konzentriertes Feuer'),
  ForestCultist: enemy('ForestCultist', 'Waldkultist', 42, 39, 18, 0, 1, 32, false, 'Bodenheiler · teilt Heilsperren mit der Qualle', 'Flächenschaden gegen seine Begleitgruppe'),
  MossShroom: enemy('MossShroom', 'Moospilz', 28, 43, 9, 0, 1, 42, false, 'Kleiner Waldläufer · zwei kosmetische Kappenfarben', 'Waldwächter und Flächenschaden'),
  WoodSpider: enemy('WoodSpider', 'Waldspinne', 30, 64, 12, 0, 1, 46, false, 'Flinker, leichter Bodenläufer', 'Frost und überlappende Schussbereiche'),
  HornedBat: enemy('HornedBat', 'Hornfledermaus', 24, 74, 12, 0, 1, 50, true, 'Schneller, leichter Flieger', 'Frost und konzentrierter Schaden'),
  EmberBomb: enemy('EmberBomb', 'Zunderläufer', 60, 36, 18, .25, 2, 54, false, 'Langsamer Panzer · 25 % Rüstung, zwei Kernschaden', 'Scharfschütze und konzentriertes Feuer'),
});
export const isHealer = (def: EnemyDef): boolean => def.id === 'LanternJelly' || def.id === 'ForestCultist';
export const ENEMY_ROSTER: readonly EnemyDef[] = Object.values(ENEMIES);
export const enemyId = (value: unknown): value is EnemyId => typeof value === 'string' && Object.hasOwn(ENEMIES, value);
export const introducedEnemy = (wave: number, recipe = 11): EnemyDef | undefined => ENEMY_ROSTER.find(e => e.firstWave === wave && e.id !== 'Rosenspiegel'
  && (recipe >= 11 || !['ForestGoblin','BoneGuard','ForestCultist'].includes(e.id))
  && (recipe >= 13 || e.firstWave <= 40));
const THEMES: readonly (readonly EnemyId[])[] = [
  ['Leafbug', 'FlyingLocust', 'Firebug', 'FlyingLocust', 'Leafbug', 'Clampbeetle'],
  ['Firebug', 'Firewasp', 'FlyingLocust', 'Leafbug', 'Voidbutterfly', 'Firewasp'],
  ['Scorpion', 'Leafbug', 'MagmaCrab', 'Firebug', 'Clampbeetle', 'Leafbug'],
  ['MagmaCrab', 'Leafbug', 'LanternJelly', 'Scorpion', 'Firebug', 'Clampbeetle', 'FlyingLocust', 'Voidbutterfly'],
];
/** Boss escorts and saved recipes <= 8 stay intact. No RNG or ever-growing lists. */
export function regularEnemy(wave: number, index: number, recipe: number): EnemyDef {
  const old = recipe >= 4 && wave >= 11 && index % 5 === 4 ? ENEMIES.Scorpion : wave >= 4 && index % 3 === 2 ? ENEMIES.Firebug : ENEMIES.Leafbug;
  if (recipe < 9 || wave < 6 || wave === 15 || wave === 25) return old;
  const intro = introducedEnemy(wave, recipe);
  if (intro) return index === 2 || index === 8 ? intro : old;
  const theme = THEMES[wave % THEMES.length], def = ENEMIES[theme[index % theme.length]];
  return def.firstWave > wave || def.id === 'LanternJelly' && index > 10 ? old : def;
}
export const JELLY_HEAL = Object.freeze({ cooldown: 3, cast: .4, range: 100, fraction: .06, lockout: 2, targets: 2 });
