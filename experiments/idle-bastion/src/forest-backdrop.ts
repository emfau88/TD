import type { GridCell, IdleLayout } from './layout';

export const BACKDROP_TREE = { width: 50, height: 51, spacing: 40 } as const;

/** Decorative silhouettes only: overlap the map solely on existing tree cells.
 * Never add obstacles or cover free construction ground, paths or buildings. */
export function backdropTrees(layout: IdleLayout, trees: readonly GridCell[], padX: number, padY: number): { x: number; y: number; variant: number }[] {
  const { width, height } = layout.bounds, size = layout.cellSize;
  const occupied = new Set(trees.map(p => `${p.x},${p.y}`));
  const result: { x: number; y: number; variant: number }[] = [];
  const { width: w, height: h, spacing } = BACKDROP_TREE;
  const safe = (x: number, y: number): boolean => {
    for (let row = Math.max(0, Math.floor(y / size)); row < Math.min(layout.bounds.rows, Math.ceil((y + h) / size)); row++)
      for (let col = Math.max(0, Math.floor(x / size)); col < Math.min(layout.bounds.columns, Math.ceil((x + w) / size)); col++)
        if (!occupied.has(`${col},${row}`)) return false;
    return true;
  };
  const add = (x: number, y: number, variant: number) => result.push({ x, y, variant });
  const variation = (a: number, b: number) => Math.abs(a * 17 + b * 31) % 7;
  // Start the outer rows with whole crowns/roots. Small offsets avoid a ruler-straight edge.
  for (let row = 0; row <= Math.ceil(padY / spacing); row++) {
    for (let col = Math.floor(-padX / spacing) - 1; col <= Math.ceil((width + padX) / spacing) + 1; col++) {
      const v = variation(col, row), x = col * spacing + (row % 2 ? 20 : 0) - 25;
      let top = -h + 8 - row * spacing - v;
      let bottom = height - 18 + row * spacing + v;
      if (!safe(x, top)) top = -h - 2 - v;
      if (!safe(x, bottom)) bottom = height + 2 + v;
      add(x, top, v % 4); add(x, bottom, (v + 1) % 4);
    }
  }
  for (let col = 0; col <= Math.ceil(padX / spacing); col++) {
    for (let row = 0; row < layout.bounds.rows; row++) {
      const v = variation(col, row), y = row * spacing - 10 + v;
      let left = -w + 12 - col * spacing - v;
      let right = width - 12 + col * spacing + v;
      if (!safe(left, y)) left = -w - 2 - v;
      if (!safe(right, y)) right = width + 2 + v;
      add(left, y, (v + 2) % 4); add(right, y, (v + 3) % 4);
    }
  }
  return result.sort((a, b) => a.y - b.y || a.x - b.x);
}
