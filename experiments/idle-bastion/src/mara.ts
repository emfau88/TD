/** Phaser-free automatic support. Movement follows the established cardinal
 * companion navigation and 80px/s pace from reference/src/woodland-simulation.
 */
import { cellCenter, findFootpath, getTowerApproachCells, isWalkableCell,
  type GridCell, type IdleLayout, type WorldPoint } from './layout';

export const MARA = Object.freeze({ speed: 80, duration: 8, cooldown: 30, fireRate: 1.5, range: 240 });
export interface MaraState extends WorldPoint {
  x: number; y: number; path: WorldPoint[]; targetTowerUid: number;
  direction: 'up' | 'down' | 'left' | 'right';
  cooldownRemaining: number; effectRemaining: number; unreachable: boolean;
  autoCast: boolean; effectTowerUid: number | null;
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
    direction: 'up', cooldownRemaining: 0, effectRemaining: 0, unreachable: false, autoCast: true, effectTowerUid: null };
}
export const cloneMara = (mara: MaraState): MaraState => ({ ...mara, path: mara.path.map(point => ({ ...point })) });

function inRange(mara: WorldPoint, target: WorldPoint): boolean {
  return Math.hypot(mara.x - target.x, mara.y - target.y) <= MARA.range;
}
export function moveMara(mara: MaraState, destination: GridCell, layout: IdleLayout, blocked: readonly GridCell[]): boolean {
  const route = findFootpath(layout, cellOf(layout, mara), destination, blocked);
  if (!route) return false;
  const path = route.map(cell => cellCenter(layout, cell));
  if (path.length && close(path[0].x, mara.x) && close(path[0].y, mara.y)) path.shift();
  mara.path = path; mara.unreachable = false;
  return true;
}
export function assignMaraTarget(mara: MaraState, target: MaraTarget, layout: IdleLayout, blocked: readonly GridCell[]): void {
  mara.targetTowerUid = target.uid;
  if (inRange(mara, target)) { mara.unreachable = false; return; }
  const candidates: GridCell[] = [];
  for (let y = 0; y < layout.bounds.rows; y++) for (let x = 0; x < layout.bounds.columns; x++) {
    const cell = { x, y };
    if (inRange(cellCenter(layout, cell), target)) candidates.push(cell);
  }
  candidates.sort((a, b) => Math.hypot(cellCenter(layout, a).x - mara.x, cellCenter(layout, a).y - mara.y)
    - Math.hypot(cellCenter(layout, b).x - mara.x, cellCenter(layout, b).y - mara.y));
  mara.unreachable = !candidates.some(cell => moveMara(mara, cell, layout, blocked));
}
export function castMara(mara: MaraState, target: MaraTarget): boolean {
  if (!inRange(mara, target) || mara.cooldownRemaining > 1e-9 || mara.effectRemaining > 1e-9) return false;
  mara.effectRemaining = MARA.duration; mara.cooldownRemaining = MARA.cooldown;
  mara.effectTowerUid = target.uid; mara.direction = facing(target.x - mara.x, target.y - mara.y);
  return true;
}

/** Returns the part of this step during which the old effect was active.
 * Activations occur at the end boundary; the next full step gains the bonus.
 * Cooldown starts at activation and never resets on walking/wave transitions.
 */
export function stepMara(
  mara: MaraState, target: MaraTarget, layout: IdleLayout, blocked: readonly GridCell[],
  dt: number, waveActive: boolean, bonusEnabled: boolean, enemyInRange = false,
): number {
  const oldEffect = mara.effectRemaining;
  mara.cooldownRemaining = Math.max(0, mara.cooldownRemaining - dt);
  mara.effectRemaining = Math.max(0, mara.effectRemaining - dt);
  const blockedKeys = new Set(blocked.map(key));
  if (mara.path.some(point => !isWalkableCell(layout, cellOf(layout, point)) || blockedKeys.has(key(cellOf(layout, point))))) {
    mara.path = []; mara.unreachable = true;
  }
  let travel = MARA.speed * dt;
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
  const activeSeconds = bonusEnabled && waveActive ? Math.min(dt, oldEffect) : 0;
  if (mara.effectRemaining <= 1e-9) mara.effectTowerUid = null;
  if (mara.autoCast && waveActive && bonusEnabled && enemyInRange) castMara(mara, target);
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
    || typeof mara.autoCast !== 'boolean' || (mara.effectTowerUid !== null && !targets.some(t => t.uid === mara.effectTowerUid))
    || ((mara.effectRemaining as number) > 0) !== (mara.effectTowerUid !== null)
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
    next.path = []; next.unreachable = false;
    if (!next.unreachable && validMara(next, targets, layout, blocked)) return next;
  }
  return undefined;
}
