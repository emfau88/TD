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

export function createMara(layout: IdleLayout, starterUid: number): MaraState {
  return { ...cellCenter(layout, layout.maraStart), path: [], targetTowerUid: starterUid,
    direction: 'up', cooldownRemaining: 0, effectRemaining: 0, unreachable: false };
}
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

/** Returns the part of this step during which the old effect was active.
 * Activations occur at the end boundary; the next full step gains the bonus.
 * Cooldown starts at activation and never resets on walking/wave transitions.
 */
export function stepMara(
  mara: MaraState, target: MaraTarget, layout: IdleLayout, blocked: readonly GridCell[],
  dt: number, waveActive: boolean, bonusEnabled: boolean,
): number {
  const oldEffect = mara.effectRemaining;
  mara.cooldownRemaining = Math.max(0, mara.cooldownRemaining - dt);
  mara.effectRemaining = Math.max(0, mara.effectRemaining - dt);
  const blockedKeys = new Set(blocked.map(key));
  if (mara.path.some(point => !isWalkableCell(layout, cellOf(layout, point)) || blockedKeys.has(key(cellOf(layout, point))))) {
    assignMaraTarget(mara, target, layout, blocked);
  }
  let travel = MARA.speed * dt;
  const wasWalking = mara.path.length > 0;
  while (mara.path.length && travel > 0) {
    const next = mara.path[0], dx = next.x - mara.x, dy = next.y - mara.y;
    const gap = Math.hypot(dx, dy), step = Math.min(travel, gap);
    if (gap > 1e-9) {
      mara.direction = facing(dx, dy);
      mara.x += dx / gap * step; mara.y += dy / gap * step;
    }
    travel -= step;
    if (gap <= step + 1e-9) mara.path.shift();
  }
  const ready = !mara.path.length && !mara.unreachable && atTarget(mara, target, layout);
  if (ready) mara.direction = facing(target.x - mara.x, target.y - mara.y);
  if (!ready || wasWalking || !waveActive || !bonusEnabled) return 0;
  const activeSeconds = Math.min(dt, oldEffect);
  if (mara.effectRemaining <= 1e-9 && mara.cooldownRemaining <= 1e-9) {
    mara.effectRemaining = MARA.duration;
    mara.cooldownRemaining = MARA.cooldown;
  }
  return activeSeconds;
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
