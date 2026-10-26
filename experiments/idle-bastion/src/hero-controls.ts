import { stats, type IdleBattle } from './battle';
import { ILYRA, ilyraCell } from './ilyra';
import { cellCenter, findFootpath, type GridCell, type WorldPoint } from './layout';

export type ControlledHero = 'mara' | 'ilyra';

export function maraControlStage(b: IdleBattle): 'waiting' | 'lesson' | 'ready' {
  if (b.preparing || b.guiding || b.maraIntroductionPending) return 'waiting';
  if (b.discoveryActive && b.discovery.startsWith('mara-') && b.discovery !== 'mara-controls') return 'lesson';
  return 'ready';
}

/** Manual pause allows route planning; guided pauses do not. */
export function heroWorldAvailable(b: IdleBattle): boolean {
  return maraControlStage(b) === 'ready' && !b.discoveryPaused && b.phase !== 'defeat';
}

/** Presentation only. Uses actual road, occupied towers and the existing router.
 * Recommend ground beside the first defended road segment, not the distant tavern.
 * No snapshot fields, movement mutation or ability/stat changes. */
export function recommendIlyraPosition(b: IdleBattle): WorldPoint | undefined {
  if (!b.ilyra) return;
  const road = b.layout.road.cells.map(c => cellCenter(b.layout, c));
  const anchor = road.find(p => b.towers.some(t => Math.hypot(t.x - p.x, t.y - p.y) <= stats(t).range)) ?? road[0];
  if (!anchor) return;
  const near = ilyraCell(anchor), blocked = b.movementBlocked(), start = ilyraCell(b.ilyra);
  const candidates: { cell: GridCell; point: WorldPoint; score: number }[] = [];
  for (let y = near.y - 2; y <= near.y + 2; y++) for (let x = near.x - 2; x <= near.x + 2; x++) {
    if (b.layout.road.cells.some(c => c.x === x && c.y === y)) continue;
    const cell = { x, y }, point = cellCenter(b.layout, cell);
    if (Math.hypot(point.x - b.mara.x, point.y - b.mara.y) < 30) continue;
    const coverage = road.reduce((sum, p, i) => sum + (Math.hypot(p.x - point.x, p.y - point.y) <= ILYRA.range ? 1 / (i + 1) : 0), 0);
    if (coverage) candidates.push({ cell, point, score: coverage * 100 - Math.hypot(point.x - anchor.x, point.y - anchor.y) / 40 });
  }
  candidates.sort((a, c) => c.score - a.score || a.cell.y - c.cell.y || a.cell.x - c.cell.x);
  return candidates.find(c => findFootpath(b.layout, start, c.cell, blocked))?.point;
}

/** A deliberate cast can aim at the nearest in-range edge of a group. */
export function ilyraFirstTarget(b: IdleBattle): WorldPoint | undefined {
  const s = b.ilyra; if (!s || s.path.length || s.volley || s.introduction === 'move') return;
  for (const e of b.enemies) {
    const dx = e.x - s.x, dy = e.y - s.y, distance = Math.hypot(dx, dy), scale = Math.min(1, (ILYRA.range - .01) / Math.max(1, distance));
    const point = { x: s.x + dx * scale, y: s.y + dy * scale };
    if (b.canCastIlyra(point)) return point;
  }
}
