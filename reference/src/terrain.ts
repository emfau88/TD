// Coordinates in the unmodified Foozle sheets, not newly generated artwork.
// Each tree is one 64px-high cell. Inset both sides by 1px to exclude the
// stray opaque green column at atlas x=832 without moving the foot point.
export const TREE_FRAMES: Record<string, [number, number, number, number]> = {};
for (let variant = 0; variant < 4; variant++) {
  const x = 833 + (variant % 2) * 64;
  TREE_FRAMES[`tree-${variant}`] = [x, 384 + Math.floor(variant / 2) * 64, 62, 64];
  TREE_FRAMES[`autumn-${variant}`] = [x, 576 + Math.floor(variant / 2) * 64, 62, 64];
}

export const WATER_TILE_SIZE = 32;

// Remove only the exterior grass of each construction sheet. Flood filling
// from its border preserves green details enclosed inside the water/shore.
// Source PNGs remain unchanged; this operates on a runtime texture copy.
export function clearWaterBackdrop(pixels: Uint8ClampedArray, sheetWidth: number, frameWidth: number, frameHeight: number) {
  const grass = new Set([0x63ab3f, 0xc8d45d, 0x3b7d4f]);
  for (let offset = 0; offset < sheetWidth; offset += frameWidth) {
    const seen = new Uint8Array(frameWidth * frameHeight);
    const queue = new Int32Array(seen.length);
    let head = 0, tail = 0;
    const visit = (x: number, y: number) => {
      const cell = y * frameWidth + x;
      if (seen[cell]) return;
      seen[cell] = 1;
      const pixel = (y * sheetWidth + offset + x) * 4;
      const color = (pixels[pixel] << 16) | (pixels[pixel + 1] << 8) | pixels[pixel + 2];
      if (pixels[pixel + 3] && !grass.has(color)) return;
      pixels[pixel + 3] = 0;
      queue[tail++] = cell;
    };
    for (let x = 0; x < frameWidth; x++) { visit(x, 0); visit(x, frameHeight - 1); }
    for (let y = 0; y < frameHeight; y++) { visit(0, y); visit(frameWidth - 1, y); }
    while (head < tail) {
      const cell = queue[head++], x = cell % frameWidth, y = Math.floor(cell / frameWidth);
      if (x > 0) visit(x - 1, y);
      if (x + 1 < frameWidth) visit(x + 1, y);
      if (y > 0) visit(x, y - 1);
      if (y + 1 < frameHeight) visit(x, y + 1);
    }
  }
}

// The 448px animation frame is a terrain construction sheet shaped like a
// cross. Sample its convex cap corners, straight shores and water interior.
// Half tiles keep the shore narrow; 64px of source still occupy one game cell.
export function waterTileSource(col: number, row: number, cols: number, rows: number): [number, number] {
  const west = col === 0, east = col === cols - 1;
  const north = row === 0, south = row === rows - 1;
  const x = west ? 160 : east ? 256 : 192 + ((col - 1) % 2) * 32;
  const y = north ? 32 : south ? 384 : (west || east ? 64 : 192) + ((row - 1) % 2) * 32;
  return [x, y];
}
