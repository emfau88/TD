// Reproducible nearest-neighbour packing of Imagegen sources; never modifies originals.
import { mkdir, writeFile } from 'node:fs/promises';
import { readPNG, writePNG, blank, pixel, put } from './pixel-atlas.mjs';
const folder = new URL('../experiments/idle-bastion/assets/workshop/', import.meta.url);
await mkdir(folder, { recursive: true });
const report = {};
for (const name of ['workshop-i', 'workshop-damaged']) {
  let source;
  try { source = await readPNG(new URL(`raw/${name}.png`, folder)); }
  catch (error) { if (error.code === 'ENOENT') continue; throw error; }
  let left = source.width, top = source.height, right = 0, bottom = 0;
  for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) {
    if (pixel(source, x, y)[3] < 128) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  const width = right - left + 1, height = bottom - top + 1;
  const scale = report['workshop-i']?.scale ?? Math.min(96 / width, 88 / height);
  const dw = Math.round(width * scale), dh = Math.round(height * scale);
  const result = blank(128, 128), ox = Math.round(64 - dw / 2), oy = 112 - dh + 1;
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const color = Buffer.from(pixel(source, left + Math.floor((x + 0.5) * width / dw), top + Math.floor((y + 0.5) * height / dh)));
    color[3] = color[3] < 128 ? 0 : 255;
    put(result, ox + x, oy + y, color);
  }
  await writePNG(new URL(`${name}.png`, folder), result);
  report[name] = { source: [source.width, source.height], bounds: [left, top, width, height], scale,
    output: [128, 128], silhouette: [ox, oy, dw, dh], anchor: [64, 112], alphaThreshold: 128 };
}
await writeFile(new URL('metadata.json', folder), `${JSON.stringify(report, null, 2)}\n`);
console.log(report);
