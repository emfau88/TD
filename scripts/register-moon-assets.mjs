import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const specs = [
  { name: 'Mara', cols: 4, rows: 2, durations: [450, 450, 160, 160, 220, 220, 650, 180] },
  { name: 'Sternenrichter', cols: 4, rows: 2, durations: [260, 260, 220, 220, 100, 140, 170, 220] },
  { name: 'Moon Props', cols: 3, rows: 2, durations: [100, 100, 100, 100, 100, 100] },
];
const additions = {};
for (const { name, cols, rows, durations } of specs) {
  const png = await readFile(resolve(root, 'public/assets', `${name}.png`));
  const sheetWidth = png.readUInt32BE(16), sheetHeight = png.readUInt32BE(20);
  // Generated atlases can include a trailing transparent pixel. Phaser uses
  // integer frame dimensions; discard that unused right/bottom margin.
  additions[name] = {
    width: Math.floor(sheetWidth / cols), height: Math.floor(sheetHeight / rows),
    sheetWidth, sheetHeight, cols, rows, frames: cols * rows,
    frameMap: Array.from({ length: cols * rows }, (_, index) => index),
    durations, tags: [],
  };
}
const filename = resolve(root, 'public/assets/manifest.json');
const original = JSON.parse(await readFile(filename, 'utf8'));
await writeFile(resolve(root, 'public/assets/moon-manifest.json'), JSON.stringify(additions, null, 2) + '\n');
await writeFile(filename, JSON.stringify({ ...original, ...additions }, null, 2) + '\n');
console.log('Registered Moon atlases:', Object.keys(additions).join(', '));
