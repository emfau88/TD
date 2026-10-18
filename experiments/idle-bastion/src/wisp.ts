/** Cosmetic workshop / warehouse errands use the same walkable grid as Mara. The gold
 * bonus is unconditional once unlocked and never depends on these poses. */
import { cellCenter, findFootpath, type IdleLayout } from './layout';
import { getForestBlockedCells } from './forest-world';
const arrivals = new WeakMap<IdleLayout, { x: number; y: number }[]>();
const routes = new WeakMap<IdleLayout, Map<boolean, { x: number; y: number }[]>>();
export function wispPose(layout: IdleLayout, elapsed: number, warehouseBuilt = false, arrivedAt: number | null = null) {
  if (arrivedAt !== null) {
    const end = layout.plots.find(p => p.id === 'workshop')!.entrance;
    let arrival = arrivals.get(layout);
    if (!arrival) {
      arrival = [{ x: 2, y: 13 }, { x: 2, y: 11 }, { x: 10, y: 13 }, { x: 10, y: 11 }].map(start => findFootpath(layout, start, end, getForestBlockedCells(layout))).find(path => path && path.length > 1)?.map(p => ({ ...p })) ?? [end];
      arrivals.set(layout, arrival);
    }
    const age = Math.max(0, elapsed - arrivedAt), duration = (arrival.length - 1) * layout.cellSize / 65;
    if (age < duration) {
      const step = age * 65 / layout.cellSize, i = Math.floor(step), a = cellCenter(layout, arrival[i]), b = cellCenter(layout, arrival[i + 1]);
      const row = Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? 9 : b.y < a.y ? 18 : 0;
      return { x: a.x + (b.x - a.x) * (step - i), y: a.y + (b.y - a.y) * (step - i), frame: row + Math.floor(age * 8) % 9, flip: b.x < a.x, moving: true };
    }
    elapsed = Math.max(0, age - duration);
  }
  let cache = routes.get(layout);
  if (!cache) { cache = new Map(); routes.set(layout, cache); }
  let route = cache.get(warehouseBuilt);
  if (!route) {
    const start = layout.plots.find(plot => plot.id === 'workshop')!.entrance;
    route = (findFootpath(layout, start, warehouseBuilt ? layout.plots.find(plot => plot.id === 'warehouse')!.entrance : { x: 5, y: 12 }, getForestBlockedCells(layout)) ?? [start]).map(cell => cellCenter(layout, cell));
    if (!route.length) route = [cellCenter(layout, start)];
    cache.set(warehouseBuilt, route);
  }
  const travel = Math.max(0, route.length - 1) * layout.cellSize / 30;
  const phase = elapsed % (travel * 2 + 8), returning = phase >= travel + 4;
  const time = returning ? phase - travel - 4 : phase;
  const moving = time < travel;
  const points = returning ? [...route].reverse() : route;
  const step = Math.min(points.length - 1, time * 30 / layout.cellSize);
  const index = Math.floor(step), a = points[index], b = points[Math.min(points.length - 1, index + 1)];
  const row = moving ? Math.abs(b.x - a.x) > Math.abs(b.y - a.y) ? 9 : b.y < a.y ? 18 : 0 : 27;
  return { x: a.x + (b.x - a.x) * (step - index), y: a.y + (b.y - a.y) * (step - index),
    frame: row + Math.floor(elapsed * 8) % 9, flip: moving && b.x < a.x, moving };
}
