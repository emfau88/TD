/** Legacy adjacency contract used only to validate/migrate schemas 3–10. */
/** Phaser-free automatic support. Movement follows the established cardinal
 * companion navigation and 80px/s pace from reference/src/woodland-simulation.
 */
import { cellCenter, findFootpath, getTowerApproachCells, isWalkableCell,
  type GridCell, type IdleLayout, type WorldPoint } from './layout';

export const MARA = Object.freeze({ speed: 80, duration: 8, cooldown: 30, fireRate: 1.5 });
export interface MaraState extends WorldPoint {
  x: number; y: number; path: WorldPoint[]; targetTowerUid: number;
  direction: 'up' | 'down' | 'left' | 'right';
  cooldownRemaining: number; effectRemaining: number; unreachable: boolean;
}
export interface MaraTarget extends WorldPoint { readonly uid: number; readonly padId: string }
const close = (a: number, b: number): boolean => Math.abs(a - b) <= 1e-6;
const cellOf = (layout: IdleLayout, point: WorldPoint): GridCell => ({
  x: Math.floor(point.x / layout.cellSize), y: Math.floor(point.y / layout.cellSize),
});
const key = (cell: GridCell): string => `${cell.x},${cell.y}`;
const facing = (dx: number, dy: number): MaraState['direction'] =>
  Math.abs(dx) > Math.abs(dy) ? dx < 0 ? 'left' : 'right' : dy < 0 ? 'up' : 'down';
const length = (path: readonly WorldPoint[], start: WorldPoint): number =>
  path.reduce((sum, point, index) => sum + Math.hypot(point.x - (path[index - 1] ?? start).x,
    point.y - (path[index - 1] ?? start).y), 0);

export const cloneMara = (mara: MaraState): MaraState => ({ ...mara, path: mara.path.map(point => ({ ...point })) });

function atTarget(mara: MaraState, target: MaraTarget, layout: IdleLayout): boolean {
  return getTowerApproachCells(layout, target.padId).some(cell => {
    const point = cellCenter(layout, cell);
    return close(point.x, mara.x) && close(point.y, mara.y);
  });
}
function route(mara: MaraState, target: MaraTarget, layout: IdleLayout, blocked: readonly GridCell[]): WorldPoint[] | undefined {
  const start = cellOf(layout, mara);
  const paths = getTowerApproachCells(layout, target.padId)
    .map(destination => findFootpath(layout, start, destination, blocked))
    .filter((path): path is readonly GridCell[] => !!path)
    .map(path => path.map(cell => cellCenter(layout, cell)))
    .sort((left, right) => length(left, mara) - length(right, mara));
  const best = paths[0];
  // Rejoin this cell's centre before turning when an order interrupts movement.
  // This prevents a diagonal shortcut across the corner of a roof or tree.
  if (best?.length && close(best[0].x, mara.x) && close(best[0].y, mara.y)) best.shift();
  return best;
}
export function assignMaraTarget(mara: MaraState, target: MaraTarget, layout: IdleLayout, blocked: readonly GridCell[]): void {
  const path = route(mara, target, layout, blocked);
  mara.targetTowerUid = target.uid;
  mara.path = path ?? [];
  mara.unreachable = !path;
  mara.effectRemaining = 0;
  if (!mara.path.length && !mara.unreachable) mara.direction = facing(target.x - mara.x, target.y - mara.y);
}

/** Serialized routes consist solely of adjacent walkable cell centres. The
 * current position may be part-way along its first cardinal segment.
 */
export function validMara(value: unknown, targets: readonly MaraTarget[], layout: IdleLayout, blocked: readonly GridCell[]): value is MaraState {
  if (typeof value !== 'object' || !value || Array.isArray(value)) return false;
  const mara = value as Record<string, unknown>;
  const inRange = (number: unknown, min: number, max: number): number is number =>
    typeof number === 'number' && Number.isFinite(number) && number >= min && number <= max;
  if (!inRange(mara.x, 0, layout.bounds.width - 1) || !inRange(mara.y, 0, layout.bounds.height - 1)
    || !Number.isSafeInteger(mara.targetTowerUid) || !Array.isArray(mara.path) || mara.path.length > layout.bounds.columns * layout.bounds.rows
    || !['up', 'down', 'left', 'right'].includes(mara.direction as string) || typeof mara.unreachable !== 'boolean'
    || !inRange(mara.cooldownRemaining, 0, MARA.cooldown) || !inRange(mara.effectRemaining, 0, MARA.duration)
    || mara.effectRemaining > mara.cooldownRemaining + 1e-6) return false;
  const target = targets.find(target => target.uid === mara.targetTowerUid);
  if (!target) return false;
  const blockedKeys = new Set(blocked.map(key));
  const current = mara as unknown as MaraState;
  const canWalk = (point: WorldPoint): boolean => isWalkableCell(layout, cellOf(layout, point)) && !blockedKeys.has(key(cellOf(layout, point)));
  if (!canWalk(current)) return false;
  const currentCentre = cellCenter(layout, cellOf(layout, current));
  if (!close(current.x, currentCentre.x) && !close(current.y, currentCentre.y)) return false;
  let previous: WorldPoint = current;
  const visited = new Set<string>();
  for (let index = 0; index < mara.path.length; index++) {
    const value = mara.path[index];
    if (typeof value !== 'object' || !value || Array.isArray(value)) return false;
    const point = value as WorldPoint;
    if (!inRange(point.x, 0, layout.bounds.width - 1) || !inRange(point.y, 0, layout.bounds.height - 1) || !canWalk(point)) return false;
    const cell = cellOf(layout, point), centre = cellCenter(layout, cell), pointKey = key(cell);
    if (!close(point.x, centre.x) || !close(point.y, centre.y) || visited.has(pointKey)) return false;
    visited.add(pointKey);
    const dx = Math.abs(point.x - previous.x), dy = Math.abs(point.y - previous.y);
    if (!(close(dx, 0) || close(dy, 0)) || dx + dy > layout.cellSize + 1e-6
      || (index > 0 && !close(dx + dy, layout.cellSize))) return false;
    previous = point;
  }
  if (mara.path.length) {
    if (mara.unreachable || mara.effectRemaining > 0 || !atTarget({ ...current, ...previous }, target, layout)) return false;
  } else if (!mara.unreachable && !atTarget(current, target, layout)) return false;
  if (mara.unreachable && mara.effectRemaining > 0) return false;
  return true;
}

/** Only called after validating the original save against its original layout.
 * Keep an unaffected route exactly; reroute around new pads without refreshing
 * cooldowns. If Mara occupied a newly reserved cell, use the nearest legal one. */
export function migrateMaraLayout(mara: MaraState, targets: readonly MaraTarget[], layout: IdleLayout, blocked: readonly GridCell[]): MaraState | undefined {
  if (validMara(mara as unknown, targets, layout, blocked)) return cloneMara(mara);
  const target = targets.find(t => t.uid === mara.targetTowerUid);
  if (!target) return undefined;
  const blockedKeys = new Set(blocked.map(key));
  const canStand = (point: WorldPoint) => isWalkableCell(layout, cellOf(layout, point)) && !blockedKeys.has(key(cellOf(layout, point)));
  const candidates: WorldPoint[] = [];
  if (canStand(mara)) candidates.push(mara);
  const nearby: WorldPoint[] = [];
  for (let y = 0; y < layout.bounds.rows; y++) for (let x = 0; x < layout.bounds.columns; x++) {
    const point = cellCenter(layout, { x, y });
    if (canStand(point)) nearby.push(point);
  }
  nearby.sort((a, b) => Math.hypot(a.x - mara.x, a.y - mara.y) - Math.hypot(b.x - mara.x, b.y - mara.y));
  for (const point of [...candidates, ...nearby]) {
    const next = { ...cloneMara(mara), x: point.x, y: point.y };
    assignMaraTarget(next, target, layout, blocked);
    if (!next.unreachable && validMara(next, targets, layout, blocked)) return next;
  }
  return undefined;
}
