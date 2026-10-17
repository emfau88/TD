/** B05's authored clearing. Rendering and Mara navigation consume exactly the
 * same solid cells. This adds no unlocks and never changes the enemy route.
 */
import { cellsInRect, getTowerApproachCells, isUnlockedCell, type GridCell, type IdleLayout } from './layout';

export interface ForestWorld {
  readonly trees: readonly GridCell[];
  readonly rocks: readonly GridCell[];
  readonly flowers: readonly GridCell[];
  readonly water: readonly GridCell[];
  readonly blocked: readonly GridCell[];
}
const cache = new WeakMap<IdleLayout, ForestWorld>();
const key = (point: GridCell): string => `${point.x},${point.y}`;
const cell = (x: number, y: number): GridCell => Object.freeze({ x, y });

export function getForestWorld(layout: IdleLayout): ForestWorld {
  const cached = cache.get(layout);
  if (cached) return cached;
  const reserved = new Set<string>([
    ...layout.footpaths, ...layout.plots.flatMap(plot => cellsInRect(plot.footprint)),
    layout.maraStart, layout.core,
    ...layout.towerPads.flatMap(pad => [pad.cell, ...getTowerApproachCells(layout, pad.id)]),
  ].map(key));
  // Leave clear silhouettes around the route, tower bases and character access.
  // A tree's canopy reaches beyond its occupied root cell.
  for (const position of [...layout.road.cells, ...layout.towerPads.map(pad => pad.cell), layout.core]) {
    for (let y = position.y - 1; y <= position.y + 1; y++) {
      for (let x = position.x - 1; x <= position.x + 1; x++) reserved.add(`${x},${y}`);
    }
  }
  const occupied = new Set<string>();
  const usable = (point: GridCell): boolean => isUnlockedCell(layout, point) && !reserved.has(key(point)) && !occupied.has(key(point));
  const water: GridCell[] = [];
  for (let y = 1; y <= 3; y++) for (let x = 2; x <= 4; x++) {
    const point = cell(x, y);
    if (usable(point)) { water.push(point); occupied.add(key(point)); }
  }
  const trees: GridCell[] = [];
  const tree = (x: number, y: number): void => {
    const point = cell(x, y);
    if (usable(point)) { trees.push(point); occupied.add(key(point)); }
  };
  // Woodland perimeter: entrance and core remain open; no eastern territory yet.
  for (let x = 0; x < layout.startBounds.columns; x++) {
    tree(x, 0); tree(x, 15);
    if (x % 5 !== 3) tree(x, 14);
  }
  for (let y = 1; y < 15; y++) {
    tree(0, y); tree(27, y);
    if (y % 4 !== 1) { tree(1, y); tree(26, y); }
  }
  for (const [x, y] of [
    [5,1],[6,0],[9,0],[11,0],[12,0],[18,1],[19,1],[20,1],[19,2],[20,2],[21,1],[24,1],[25,1],[24,2],
    [10,5],[11,5],[10,6],[11,6],[11,7],[12,7],[10,8],[11,8],
    [18,4],[19,4],[20,4],[18,5],[19,5],[20,5],[21,5],[19,6],[20,6],[21,6],[20,7],[22,7],
    [1,9],[2,9],[1,10],[1,11],[2,10],[11,12],[12,12],[13,12],[12,13],[13,13],
    [18,13],[19,13],[21,13],[22,13],[23,13],[24,13],[25,12],[26,12],
  ]) tree(x, y);
  const rocks: GridCell[] = [];
  for (const [x, y] of [[6,1],[17,2],[23,3],[13,5],[3,9],[16,13],[24,12]]) {
    const point = cell(x, y);
    if (usable(point)) { rocks.push(point); occupied.add(key(point)); }
  }
  const flowers: GridCell[] = [];
  for (const [x, y] of [[5,3],[6,7],[3,7],[9,8],[13,6],[16,7],[17,3],[22,3],[23,7],[19,8],[21,12],[11,11],[7,13],[2,13],[25,4]]) {
    const point = cell(x, y);
    if (isUnlockedCell(layout, point) && !occupied.has(key(point)) && !layout.road.cells.some(road => key(road) === key(point))
      && !layout.plots.some(plot => cellsInRect(plot.footprint).some(plotCell => key(plotCell) === key(point)))
      && !layout.towerPads.some(pad => key(pad.cell) === key(point))) flowers.push(point);
  }
  const result: ForestWorld = Object.freeze({
    trees: Object.freeze(trees), rocks: Object.freeze(rocks), water: Object.freeze(water), flowers: Object.freeze(flowers),
    blocked: Object.freeze([...trees, ...rocks, ...water]),
  });
  cache.set(layout, result);
  return result;
}

export function getForestBlockedCells(layout: IdleLayout): readonly GridCell[] {
  return getForestWorld(layout).blocked;
}
