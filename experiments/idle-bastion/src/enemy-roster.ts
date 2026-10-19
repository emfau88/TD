/** Idle-owned balance; the original enemy packs supply art, not mutable rules. */
export type EnemyId = 'Leafbug' | 'Firebug' | 'Scorpion' | 'Rosenspiegel' | 'FlyingLocust' | 'Firewasp' | 'MagmaCrab' | 'Clampbeetle' | 'LanternJelly' | 'Voidbutterfly';
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
});
export const ENEMY_ROSTER: readonly EnemyDef[] = Object.values(ENEMIES);
export const enemyId = (value: unknown): value is EnemyId => typeof value === 'string' && Object.hasOwn(ENEMIES, value);
export const introducedEnemy = (wave: number): EnemyDef | undefined => ENEMY_ROSTER.find(e => e.firstWave === wave && e.id !== 'Rosenspiegel');
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
  const intro = introducedEnemy(wave);
  if (intro) return index === 2 || index === 8 ? intro : old;
  const theme = THEMES[wave % THEMES.length], def = ENEMIES[theme[index % theme.length]];
  return def.firstWave > wave || def.id === 'LanternJelly' && index > 10 ? old : def;
}
export const JELLY_HEAL = Object.freeze({ cooldown: 3, cast: .4, range: 100, fraction: .06, lockout: 2, targets: 2 });
