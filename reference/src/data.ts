export const CELL = 40;
export const COLS = 28;
export const ROWS = 16;
export const WIDTH = COLS * CELL;
export const HEIGHT = ROWS * CELL;
export type Point = { x: number; y: number };
export type GridPoint = [number, number];
export type Priority = 'first' | 'strong' | 'near' | 'last';
export type TowerDef = {
  id: number; name: string; role: string; description: string; cost: number;
  damage: number; range: number; cooldown: number; color: number; targets: 'all' | 'ground';
  splash?: number; slow?: number; burn?: number; chain?: number; pierce?: boolean;
};
export const TOWERS: TowerDef[] = [
  { id: 1, name: 'Waldwächter', role: 'Allrounder', description: 'Zuverlässige Pfeile gegen Boden- und Fluggegner.', cost: 75, damage: 14, range: 132, cooldown: .6, color: 0xe3cf87, targets: 'all' },
  { id: 2, name: 'Frostkristall', role: 'Verlangsamung', description: 'Verlangsamt Gegner um 45 %. Ideal an Wegkreuzungen.', cost: 110, damage: 7, range: 126, cooldown: .9, color: 0x91e2ee, targets: 'all', slow: .45 },
  { id: 3, name: 'Steinschleuder', role: 'Flächenschaden', description: 'Schwere Geschosse treffen Gruppen von Bodengegnern.', cost: 135, damage: 34, range: 156, cooldown: 1.55, color: 0xd5a69c, targets: 'ground', splash: 52 },
  { id: 4, name: 'Scharfschütze', role: 'Rüstungsbrecher', description: 'Große Reichweite. Bolzen durchdringen jede Rüstung.', cost: 170, damage: 53, range: 215, cooldown: 1.85, color: 0xc7e9a8, targets: 'all', pierce: true },
  { id: 5, name: 'Sturmlicht', role: 'Kettenblitz', description: 'Blitze springen auf bis zu drei nahe Gegner über.', cost: 155, damage: 18, range: 136, cooldown: 1, color: 0x9edfea, targets: 'all', chain: 3 },
  { id: 6, name: 'Schnellfeuer', role: 'Hohe Feuerrate', description: 'Schnelle Salven halten Schwärme und Flieger auf.', cost: 115, damage: 6, range: 116, cooldown: .21, color: 0xf2da99, targets: 'all' },
  { id: 7, name: 'Glutwerfer', role: 'Brandschaden', description: 'Feuerbälle verbrennen Bodengegner über mehrere Sekunden.', cost: 145, damage: 17, range: 125, cooldown: .85, color: 0xf8a576, targets: 'ground', splash: 30, burn: 8 },
  { id: 8, name: 'Sonnenobelisk', role: 'Schwere Magie', description: 'Mächtige Energiewellen durchdringen Rüstung und treffen Gruppen.', cost: 210, damage: 48, range: 146, cooldown: 1.45, color: 0xffc77e, targets: 'all', splash: 42, pierce: true },
];
export type EnemyDef = { id: string; name: string; hp: number; speed: number; gold: number; flying: boolean; armor: number; lives: number; };
export const ENEMIES: EnemyDef[] = [
  { id: 'Leafbug', name: 'Blattkäfer', hp: 30, speed: 57, gold: 10, flying: false, armor: 0, lives: 1 },
  { id: 'Firebug', name: 'Feuerkäfer', hp: 48, speed: 78, gold: 13, flying: false, armor: 0, lives: 1 },
  { id: 'Scorpion', name: 'Skorpion', hp: 115, speed: 44, gold: 19, flying: false, armor: .25, lives: 2 },
  { id: 'Magma Crab', name: 'Magmakrabbe', hp: 195, speed: 34, gold: 25, flying: false, armor: .4, lives: 2 },
  { id: 'Flying Locust', name: 'Flugheuschrecke', hp: 35, speed: 63, gold: 13, flying: true, armor: 0, lives: 1 },
  { id: 'Firewasp', name: 'Feuerwespe', hp: 60, speed: 72, gold: 16, flying: true, armor: 0, lives: 1 },
  { id: 'Clampbeetle', name: 'Panzerflieger', hp: 110, speed: 45, gold: 22, flying: true, armor: .28, lives: 2 },
  { id: 'Voidbutterfly', name: 'Leerenfalter', hp: 85, speed: 84, gold: 20, flying: true, armor: .12, lives: 1 },
];
export type MapDef = { id: number; name: string; subtitle: string; difficulty: string; paths: GridPoint[][]; air: GridPoint[]; water: [number, number, number, number][]; seed: number; gold: number; };
export const MAPS: MapDef[] = [
  { id: 0, name: 'Der alte Hain', subtitle: 'Wo die Wächter erwachen', difficulty: 'Einstieg', seed: 11, gold: 350,
    paths: [[[-1,7],[4,7],[4,3],[10,3],[10,11],[17,11],[17,5],[24,5],[24,8],[28,8]]],
    air: [[-1,7],[6,6],[12,8],[20,7],[28,8]], water: [[13,2,4,3],[20,11,4,3]] },
  { id: 1, name: 'Die Nebelbrücke', subtitle: 'Über stillen Wassern', difficulty: 'Fortgeschritten', seed: 31, gold: 390,
    paths: [[[-1,4],[7,4],[7,11],[12,11],[12,7],[19,7],[19,3],[24,3],[24,8],[28,8]]],
    air: [[-1,4],[8,6],[16,7],[23,6],[28,8]], water: [[13,5,5,5],[2,11,3,3]] },
  { id: 2, name: 'Die letzte Lichtung', subtitle: 'Zwei Wege. Ein letzter Spire.', difficulty: 'Herausfordernd', seed: 51, gold: 440,
    paths: [[[-1,3],[5,3],[5,7],[10,7],[10,12],[19,12],[19,8],[28,8]], [[-1,12],[5,12],[5,7],[10,7],[10,3],[19,3],[19,8],[28,8]]],
    air: [[-1,8],[8,8],[16,7],[23,8],[28,8]], water: [[13,6,4,4]] },
];
export function center([col, row]: GridPoint): Point { return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 }; }
export function pathPoints(nodes: GridPoint[]): Point[] { return nodes.map(center); }
export function pathCells(nodes: GridPoint[]): Set<string> {
  const cells = new Set<string>();
  for (let i = 1; i < nodes.length; i++) {
    const [ax,ay] = nodes[i-1], [bx,by] = nodes[i];
    const steps = Math.max(Math.abs(bx-ax), Math.abs(by-ay));
    if(steps===0){cells.add(`${ax},${ay}`);continue;}
    for (let s=0;s<=steps;s++) cells.add(`${Math.round(ax+(bx-ax)*s/steps)},${Math.round(ay+(by-ay)*s/steps)}`);
  }
  return cells;
}
export function waterCells(map: MapDef): Set<string> {
  const cells=new Set<string>();
  for (const [x,y,w,h] of map.water) for(let c=x;c<x+w;c++) for(let r=y;r<y+h;r++) cells.add(`${c},${r}`);
  return cells;
}
export function seeded(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
export function waveComposition(wave: number): { type: EnemyDef; boss: boolean }[] {
  const available = wave < 3 ? [0] : wave < 5 ? [0,1] : wave < 7 ? [0,1,4] : wave < 9 ? [0,1,2,4] : wave < 12 ? [0,1,2,4,5] : wave < 15 ? [1,2,3,4,5,6] : [0,1,2,3,4,5,6,7];
  const count = 7 + Math.floor(wave * 1.15);
  const result = Array.from({length:count},(_,i)=>({ type: ENEMIES[available[(i*3+wave+Math.floor(i/3))%available.length]], boss: false }));
  if(wave%5===0) result.push({type: ENEMIES[wave===5?2:3], boss: true});
  return result;
}
