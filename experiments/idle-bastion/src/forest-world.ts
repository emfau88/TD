/** B05's authored clearing. Rendering and Mara navigation consume exactly the
 * same solid cells. This adds no unlocks and never changes the enemy route.
 */
import { SETTLEMENT_ZONE, createIdleLayout, cellsInRect, getTowerApproachCells, isUnlockedCell, type GridCell, type IdleLayout } from './layout';

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
  // Preserve the authored woods and pond when adding free construction candidates.
  // The settlement zone stays clear so moving a building never uproots scenery.
  const terrainLayout = (layout.version ?? 1) >= 3 ? createIdleLayout({ version: 2, unlockedColumns: layout.bounds.columns }) : layout;
  const authoredPads = terrainLayout.towerPads;
  const reserved = new Set<string>([
    ...((layout.version ?? 1) >= 3 ? cellsInRect(SETTLEMENT_ZONE) : []), ...terrainLayout.footpaths, ...layout.plots.flatMap(plot => cellsInRect(plot.footprint)),
    layout.maraStart, layout.core,
    ...authoredPads.flatMap(pad => [pad.cell, ...getTowerApproachCells(terrainLayout, pad.id)]),
  ].map(key));
  // Leave clear silhouettes around the route, tower bases and character access.
  // A tree's canopy reaches beyond its occupied root cell.
  for (const position of [...layout.road.cells, ...authoredPads.map(pad => pad.cell), layout.core]) {
    for (let y = position.y - 1; y <= position.y + 1; y++) {
      for (let x = position.x - 1; x <= position.x + 1; x++) reserved.add(`${x},${y}`);
    }
  }
  // Three clear rows above the lowered north road, with canopy headroom.
  // Keep the old reservations too: valid existing towers must not acquire trees.
  if ((layout.version ?? 1) >= 4) {
    for (let y = 0; y <= 3; y++) for (let x = 6; x <= 16; x++) reserved.add(`${x},${y}`);
    const old = getForestWorld(createIdleLayout({ version: 3, unlockedColumns: layout.bounds.columns, plots: {
      workshop: layout.plots.find(p => p.id === 'workshop')!.footprint,
      warehouse: layout.plots.find(p => p.id === 'warehouse')!.footprint,
    } }));
    const oldSolids = new Set(old.blocked.map(key));
    for (const pad of createIdleLayout({ version: 3 }).towerPads) {
      if (!oldSolids.has(key(pad.cell))) reserved.add(key(pad.cell));
    }
  }
  const occupied = new Set<string>();
  const usable = (point: GridCell): boolean => isUnlockedCell(layout, point) && !reserved.has(key(point)) && !occupied.has(key(point));
  const water: GridCell[] = [];
  for (let y = 1; y <= 3; y++) for (let x = 2; x <= 4; x++) {
    const point = cell(x, y);
    if (usable(point)) { water.push(point); occupied.add(key(point)); }
  }
  const expanded = layout.bounds.columns > layout.startBounds.columns;
  const trees: GridCell[] = [];
  const tree = (x: number, y: number): void => {
    if (expanded && x >= 26 && x < 28 && y >= 3 && y <= 12) return;
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
  if (expanded) {
    for (let x = 28; x < layout.bounds.columns; x++) { tree(x, 0); tree(x, 15); tree(x, 14); }
    for (let y = 1; y < 15; y++) tree(layout.bounds.columns - 1, y);
    for (const [x,y] of [[29,1],[30,2],[29,3],[30,4],[29,12],[30,13]]) tree(x,y);
  }
  const rocks: GridCell[] = [];
  for (const [x, y] of [[6,1],[17,2],[23,3],[13,5],[3,9],[16,13],[24,12], ...(expanded ? [[30,5],[29,13]] : [])]) {
    const point = cell(x, y);
    if (usable(point)) { rocks.push(point); occupied.add(key(point)); }
  }
  const flowers: GridCell[] = [];
  for (const [x, y] of [[5,3],[6,7],[3,7],[9,8],[13,6],[16,7],[17,3],[22,3],[23,7],[19,8],[21,12],[11,11],[7,13],[2,13],[25,4], ...(expanded ? [[29,6],[30,8],[29,11]] : [])]) {
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
