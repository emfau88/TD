/** Cosmetic workshop / warehouse errands use the same walkable grid as Mara. The gold
 * bonus is unconditional once unlocked and never depends on these poses. */
import { cellCenter, findFootpath, type IdleLayout } from './layout';
import { getForestBlockedCells } from './forest-world';
const routes = new WeakMap<IdleLayout, Map<boolean, { x: number; y: number }[]>>();
export function wispPose(layout: IdleLayout, elapsed: number, warehouseBuilt = false) {
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
