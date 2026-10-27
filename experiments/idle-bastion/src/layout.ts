/** Owned map geometry, including the three additional tactical slots in layout v2. No combat, economy, progression or persistence state.
 * Cell size and scale follow reference/src/data.ts and the Idle art contract;
 * all bounds and reservations belong to the returned layout instance.
 */
export interface GridCell { readonly x: number; readonly y: number }
export interface WorldPoint { readonly x: number; readonly y: number }
export interface GridRect extends GridCell { readonly width: number; readonly height: number }
export interface GridBounds {
  readonly columns: number; readonly rows: number;
  readonly width: number; readonly height: number;
}
export type PadAvailability = 'initial' | 'wave-5' | 'wave-10' | 'east-clearing';
export interface TowerPad {
  readonly id: string; readonly cell: GridCell;
  readonly availability: PadAvailability; readonly isStarter: boolean;
}
export interface BuildingPlot {
  readonly id: 'workshop' | 'warehouse' | 'tavern';
  readonly footprint: GridRect; readonly blockingBody: GridRect;
  readonly courtyard: GridRect; readonly entrance: GridCell;
}
export interface IdleLayout {
  readonly cellSize: number;
  readonly version?: 1 | 2 | 3 | 4 | 5;
  readonly startBounds: GridBounds; readonly bounds: GridBounds; readonly maxBounds: GridBounds;
  readonly road: { readonly waypoints: readonly GridCell[]; readonly cells: readonly GridCell[] };
  readonly core: GridCell; readonly towerPads: readonly TowerPad[];
  readonly plots: readonly BuildingPlot[];
  readonly maraStart: GridCell; readonly previewEnemy: GridCell;
  readonly eastRegion: GridRect;
  /** Reserved access routes for the neutral layout; unlocked ground is walkable too. */
  readonly footpaths: readonly GridCell[];
}

const cell = (x: number, y: number): GridCell => Object.freeze({ x, y });
const rect = (x: number, y: number, width: number, height: number): GridRect =>
  Object.freeze({ x, y, width, height });
const key = (position: GridCell): string => `${position.x},${position.y}`;
const sameCell = (a: GridCell, b: GridCell): boolean => a.x === b.x && a.y === b.y;
const integerCell = (position: GridCell): boolean => Number.isInteger(position.x) && Number.isInteger(position.y);
const boundsFor = (columns: number, rows: number, size: number): GridBounds =>
  Object.freeze({ columns, rows, width: columns * size, height: rows * size });

export function cellCenter(layout: Pick<IdleLayout, 'cellSize'>, position: GridCell): WorldPoint {
  return { x: (position.x + 0.5) * layout.cellSize, y: (position.y + 0.5) * layout.cellSize };
}

export function isCellInBounds(position: GridCell, bounds: GridBounds): boolean {
  return integerCell(position) && position.x >= 0 && position.y >= 0
    && position.x < bounds.columns && position.y < bounds.rows;
}

export function isUnlockedCell(layout: IdleLayout, position: GridCell): boolean {
  return isCellInBounds(position, layout.bounds);
}

export function cellsInRect(area: GridRect): readonly GridCell[] {
  if (!integerCell(area) || !Number.isInteger(area.width) || !Number.isInteger(area.height)
    || area.width < 1 || area.height < 1) return [];
  const result: GridCell[] = [];
  for (let y = area.y; y < area.y + area.height; y++) {
    for (let x = area.x; x < area.x + area.width; x++) result.push(cell(x, y));
  }
  return result;
}

export function rectContains(area: GridRect, position: GridCell): boolean {
  return integerCell(position) && position.x >= area.x && position.y >= area.y
    && position.x < area.x + area.width && position.y < area.y + area.height;
}

/** Rasterizes orthogonal waypoints once, without duplicating shared corners. */
export function pathCells(waypoints: readonly GridCell[]): readonly GridCell[] {
  if (waypoints.some(position => !integerCell(position))) throw new Error('Road cells must be integers.');
  const result: GridCell[] = [];
  for (let i = 0; i < waypoints.length; i++) {
    const end = waypoints[i];
    if (i === 0) { result.push(cell(end.x, end.y)); continue; }
    const start = waypoints[i - 1];
    if (start.x !== end.x && start.y !== end.y) throw new Error('Road segments must be orthogonal.');
    const dx = Math.sign(end.x - start.x), dy = Math.sign(end.y - start.y);
    const length = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    for (let step = 1; step <= length; step++) result.push(cell(start.x + dx * step, start.y + dy * step));
  }
  return Object.freeze(result);
}

export function isWalkableCell(layout: IdleLayout, position: GridCell): boolean {
  if (!isUnlockedCell(layout, position) || sameCell(position, layout.core)) return false;
  if (layout.plots.some(plot => rectContains(plot.blockingBody, position))) return false;
  // Reserve the tower's ground cell even before construction; Mara works from an adjacent cell.
  return (layout.version ?? 1) >= 3 || !layout.towerPads.some(pad => sameCell(pad.cell, position));
}

/** Ground reservation check; the named reservation may be used by its own later building action.
 * Affordability, occupied towers and unlock conditions belong to B02+, not this fixture.
 */
export function canPlaceFootprint(
  layout: IdleLayout, footprint: GridRect, options: { readonly reservationId?: string } = {},
): boolean {
  const occupied = cellsInRect(footprint);
  if (occupied.length === 0) return false;
  return occupied.every(position => isUnlockedCell(layout, position)
    && !sameCell(position, layout.core)
    && !layout.road.cells.some(roadCell => sameCell(roadCell, position))
    && !layout.plots.some(plot => plot.id !== options.reservationId && rectContains(plot.footprint, position))
    && !layout.towerPads.some(pad => pad.id !== options.reservationId && sameCell(pad.cell, position)));
}

export function getTowerApproachCells(layout: IdleLayout, padId: string): readonly GridCell[] {
  const pad = layout.towerPads.find(candidate => candidate.id === padId);
  if (!pad || !isUnlockedCell(layout, pad.cell)) return [];
  return [
    cell(pad.cell.x, pad.cell.y + 1), cell(pad.cell.x - 1, pad.cell.y),
    cell(pad.cell.x + 1, pad.cell.y), cell(pad.cell.x, pad.cell.y - 1),
  ].filter(position => isWalkableCell(layout, position));
}

/** Four-direction ground routing. Roads and courtyards are walkable; roofs and locked land are not. */
export function findFootpath(
  layout: IdleLayout, start: GridCell, destination: GridCell,
  additionalBlocked: readonly GridCell[] = [],
): readonly GridCell[] | undefined {
  const blocked = new Set(additionalBlocked.map(key));
  const canWalk = (position: GridCell): boolean => isWalkableCell(layout, position) && !blocked.has(key(position));
  if (!canWalk(start) || !canWalk(destination)) return undefined;
  const queue: GridCell[] = [cell(start.x, start.y)];
  const parents = new Map<string, GridCell | undefined>([[key(start), undefined]]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (sameCell(current, destination)) {
      const result: GridCell[] = [];
      for (let step: GridCell | undefined = current; step; step = parents.get(key(step))) result.push(step);
      return result.reverse();
    }
    for (const next of [
      cell(current.x + 1, current.y), cell(current.x, current.y + 1),
      cell(current.x - 1, current.y), cell(current.x, current.y - 1),
    ]) {
      if (!canWalk(next) || parents.has(key(next))) continue;
      parents.set(key(next), current);
      queue.push(next);
    }
  }
  return undefined;
}

export const LAYOUT_VERSION = 4 as const;
// Layout 4 remains the legacy west map. Layout 5 adds a free core settlement.
export const CORE_LAYOUT_VERSION = 5 as const;
export const CORE_SETTLEMENT_ZONE: GridRect = { x: 30, y: 10, width: 9, height: 5 };
export const FUTURE_EAST_CORRIDOR: GridRect = { x: 28, y: 3, width: 12, height: 7 };
export const CORE_PLOTS: PlotPositions = { workshop: { x: 30, y: 11 }, warehouse: { x: 34, y: 12 } };
export const CORE_TAVERN_PLOT: GridCell = { x: 36, y: 10 };
export const CORE_ACCESS = pathCells([{ x: 27, y: 7 }, { x: 29, y: 7 }, { x: 29, y: 13 }, { x: 38, y: 13 }]);
export function settlementZone(layout: Pick<IdleLayout, 'version'>, id: BuildingId): GridRect {
  return layout.version === 5 ? CORE_SETTLEMENT_ZONE : id === 'tavern' ? TAVERN_ZONE : SETTLEMENT_ZONE;
}
export const SETTLEMENT_ZONE: GridRect = { x: 2, y: 10, width: 9, height: 4 };
// The tavern may use one extra courtyard row; existing building sites stay unchanged.
export const TAVERN_ZONE: GridRect = { ...SETTLEMENT_ZONE, height: 5 };
export type BuildingId = BuildingPlot['id'];
export type PlotPositions = Record<'workshop' | 'warehouse', GridCell> & { tavern?: GridCell };
export const buildingWidth = (id: BuildingId): number => id === 'warehouse' ? 2 : 3;
/** Snap the footprint centre to the chosen world point; saved plots remain top-left cells. */
export function centeredBuildingCell(id: BuildingId, point: { x: number; y: number }, cellSize: number): GridCell {
  return { x: Math.round(point.x / cellSize - buildingWidth(id) / 2), y: Math.round(point.y / cellSize - 1) };
}
export const DEFAULT_PLOTS: PlotPositions = { workshop: { x: 3, y: 11 }, warehouse: { x: 8, y: 12 } };
export function createIdleLayout(options: { readonly unlockedColumns?: number; readonly version?: 1 | 2 | 3 | 4 | 5; readonly plots?: PlotPositions } = {}): IdleLayout {
  const version = options.version ?? LAYOUT_VERSION;
  const cellSize = 40, rows = 16, startColumns = version === 5 ? 40 : 28, maxColumns = version === 5 ? 40 : 36;
  const columns = options.unlockedColumns ?? startColumns;
  if (!Number.isInteger(columns) || columns < startColumns || columns > maxColumns) {
    throw new Error(`Unlocked columns must be an integer from ${startColumns} through ${maxColumns}.`);
  }
  const northRow = version >= 4 ? 4 : 2;
  const waypoints = Object.freeze([
    cell(0, 5), cell(7, 5), cell(7, northRow), cell(15, northRow),
    cell(15, 10), cell(25, 10), cell(25, 6), cell(27, 6),
  ]);
  const pad = (id: string, x: number, y: number, availability: PadAvailability, isStarter = false): TowerPad =>
    Object.freeze({ id, cell: cell(x, y), availability, isStarter });
  let towerPads: readonly TowerPad[] = Object.freeze([
    pad('tower-start', 5, 6, 'initial', true),
    pad('tower-02', 8, version >= 4 ? 5 : 4, 'initial'),
    pad('tower-03', 14, version >= 4 ? 5 : 4, 'initial'),
    pad('tower-04', 17, 9, 'initial'),
    pad('tower-05', 10, 1, 'wave-5'),
    pad('tower-06', 14, 8, 'wave-5'),
    pad('tower-07', 21, 9, 'wave-10'),
    pad('tower-08', 26, 8, 'wave-10'),
    ...(options.version === 1 ? [] : [
      pad('tower-09', 11, version >= 4 ? 5 : 4, 'initial'),
      pad('tower-10', 16, 7, 'wave-5'),
      pad('tower-11', 23, 9, 'wave-10'),
    ]),
    pad('tower-east-01', 28, 7, 'east-clearing'),
    pad('tower-east-02', 28, 10, 'east-clearing'),
  ]);
  let plots: readonly BuildingPlot[] = Object.freeze([
    Object.freeze({
      id: 'workshop', footprint: rect(3, 11, 3, 2), blockingBody: rect(3, 11, 3, 1),
      courtyard: rect(3, 12, 3, 1), entrance: cell(4, 12),
    }),
    Object.freeze({
      id: 'warehouse', footprint: rect(8, 12, 2, 2), blockingBody: rect(8, 12, 2, 1),
      courtyard: rect(8, 13, 2, 1), entrance: cell(8, 13),
    }),
  ]);
  if (version >= 3 && options.plots?.tavern) {
    const { x, y } = options.plots.tavern;
    plots = [...plots, { id: 'tavern', footprint: rect(x, y, 3, 2), blockingBody: rect(x, y, 3, 1),
      courtyard: rect(x, y + 1, 3, 1), entrance: cell(x + 1, y + 1) }];
  }
  if (version >= 3) {
    plots = plots.map(plot => {
      const destination = options.plots?.[plot.id] ?? (version === 5 ? CORE_PLOTS : DEFAULT_PLOTS)[plot.id] ?? plot.footprint;
      const dx = destination.x - plot.footprint.x, dy = destination.y - plot.footprint.y;
      const shift = <T extends GridCell>(p: T): T => ({ ...p, x: p.x + dx, y: p.y + dy });
      return { ...plot, footprint: shift(plot.footprint), blockingBody: shift(plot.blockingBody),
        courtyard: shift(plot.courtyard), entrance: shift(plot.entrance) };
    });
    const road = pathCells(waypoints), candidates: TowerPad[] = [];
    // Manhattan distance includes three complete rows on either side, including bends.
    for (let y = 1; y < rows - 1; y++) for (let x = 0; x < 32; x++) {
      const distance = Math.min(...road.map(p => Math.abs(p.x - x) + Math.abs(p.y - y)));
      if (distance < 1 || distance > 3 || rectContains(SETTLEMENT_ZONE, { x, y })) continue;
      const old = towerPads.find(p => p.cell.x === x && p.cell.y === y);
      candidates.push(pad(old?.id ?? `cell-${x}-${y}`, x, y, x >= 28 && version !== 5 ? 'east-clearing' : 'initial', old?.isStarter));
    }
    towerPads = Object.freeze(candidates);
  }
  const layout: IdleLayout = {
    ...(version >= 3 ? { version } : {}),
    cellSize, startBounds: boundsFor(startColumns, rows, cellSize),
    bounds: boundsFor(columns, rows, cellSize), maxBounds: boundsFor(maxColumns, rows, cellSize),
    road: Object.freeze({ waypoints, cells: pathCells(waypoints) }),
    core: cell(27, 6), towerPads, plots, maraStart: cell(5, 7), previewEnemy: cell(1, 5),
    eastRegion: rect(startColumns, 0, maxColumns - startColumns, rows),
    footpaths: [],
  };
  const footpaths = new Map<string, GridCell>();
  const destinations = [
    ...plots.map(plot => plot.entrance),
    ...towerPads.filter(candidate => (!layout.version || !candidate.id.startsWith('cell-')) && isUnlockedCell(layout, candidate.cell))
      .flatMap(candidate => getTowerApproachCells(layout, candidate.id).slice(0, 1)),
  ];
  for (const destination of destinations) {
    for (const position of findFootpath(layout, layout.maraStart, destination) ?? []) {
      footpaths.set(key(position), position);
    }
  }
  return Object.freeze({ ...layout, footpaths: Object.freeze([...footpaths.values()]) });
}

/** Structural fixture validation. It does not claim game balance or completed progression. */
export function validateLayout(layout: IdleLayout): readonly string[] {
  const errors: string[] = [];
  const road = new Set(layout.road.cells.map(key));
  if (!sameCell(layout.road.cells.at(-1) ?? cell(-1, -1), layout.core)) errors.push('Road must end at the core.');
  if (layout.road.cells.some(position => !isCellInBounds(position, layout.startBounds))) errors.push('Road leaves start area.');
  if (road.size !== layout.road.cells.length) errors.push('Road revisits a cell.');
  if (new Set(layout.towerPads.map(pad => pad.id)).size !== layout.towerPads.length) errors.push('Tower IDs repeat.');
  if (new Set(layout.towerPads.map(pad => key(pad.cell))).size !== layout.towerPads.length) errors.push('Tower cells repeat.');
  for (const pad of layout.towerPads) {
    if (!isCellInBounds(pad.cell, layout.maxBounds)) errors.push(`${pad.id} leaves map budget.`);
    if (road.has(key(pad.cell))) errors.push(`${pad.id} overlaps road.`);
    if (layout.plots.some(plot => rectContains(plot.footprint, pad.cell))) errors.push(`${pad.id} overlaps plot.`);
    if (isUnlockedCell(layout, pad.cell) && !getTowerApproachCells(layout, pad.id)
      .some(position => findFootpath(layout, layout.maraStart, position))) errors.push(`${pad.id} is inaccessible.`);
  }
  const reserved = new Set<string>();
  for (const plot of layout.plots) {
    for (const position of cellsInRect(plot.footprint)) {
      if (!isCellInBounds(position, layout.startBounds)) errors.push(`${plot.id} leaves start area.`);
      if (road.has(key(position)) || reserved.has(key(position))) errors.push(`${plot.id} overlaps another reservation.`);
      reserved.add(key(position));
      const body = rectContains(plot.blockingBody, position), yard = rectContains(plot.courtyard, position);
      if (body === yard) errors.push(`${plot.id} body/courtyard must partition its footprint.`);
    }
    if (!rectContains(plot.courtyard, plot.entrance)
      || !findFootpath(layout, layout.maraStart, plot.entrance)) errors.push(`${plot.id} entrance is inaccessible.`);
  }
  if (!isWalkableCell(layout, layout.maraStart)) errors.push('Mara start is blocked.');
  if (!road.has(key(layout.previewEnemy))) errors.push('Preview enemy must be on road.');
  return errors;
}

/** Terrain is authored independently of these candidates; the model excludes solids. */
export function validPlotPositions(positions: unknown, version: number = LAYOUT_VERSION): positions is PlotPositions {
  if (!positions || typeof positions !== 'object') return false;
  const p = positions as PlotPositions;
  const occupied = new Set<string>();
  for (const id of ['workshop', 'warehouse', 'tavern'] as const) {
    if (id === 'tavern' && p.tavern === undefined) continue;
    const pos = p[id];
    if (!pos || !integerCell(pos)) return false;
    for (const cell of cellsInRect({ ...pos, width: buildingWidth(id), height: 2 })) {
      if (!rectContains(version === 5 ? CORE_SETTLEMENT_ZONE : id === 'tavern' ? TAVERN_ZONE : SETTLEMENT_ZONE, cell) || occupied.has(key(cell))) return false;
      occupied.add(key(cell));
    }
  }
  return true;
}
const battleLayouts = new Map<string, IdleLayout>();
export function battleLayout(expanded: boolean, plots: PlotPositions = DEFAULT_PLOTS, version: 3 | 4 | 5 = LAYOUT_VERSION): IdleLayout {
  const key = JSON.stringify([version, expanded, plots.workshop.x, plots.workshop.y, plots.warehouse.x, plots.warehouse.y, plots.tavern?.x, plots.tavern?.y]);
  let layout = battleLayouts.get(key);
  if (!layout) { layout = createIdleLayout({ unlockedColumns: version === 5 ? 40 : expanded ? 32 : 28, plots, version }); battleLayouts.set(key, layout); }
  return layout;
}
