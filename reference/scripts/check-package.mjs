import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const enemyPreview = process.argv[2] === 'enemy';
const woodland = process.argv[2] === 'forest';
const stylePreview = process.argv[2] === 'style' || woodland || enemyPreview;
const regional=woodland||enemyPreview;
const dist = enemyPreview ? 'enemy-dist' : woodland ? 'woodland-dist' : stylePreview ? 'style-dist' : 'dist';
const manifest = JSON.parse(await readFile(resolve(root, 'public/assets/manifest.json'), 'utf8'));
const offline = await readFile(resolve(root, enemyPreview ? 'Spire-Gegnerprobe.html' : woodland ? 'Spire-Regionen.html' : stylePreview ? 'Spire-Style.html' : 'Spire-Original.html'), 'utf8');
const payload = offline.match(/window\.__SPIRE_BUNDLE__=(.*?);<\/script>/s)?.[1];
assert.ok(payload, 'Offline payload missing');
const embedded = JSON.parse(payload);
assert.equal(Object.keys(embedded.images).length, regional ? 92 : stylePreview ? 85 : 84);
if (regional) {
  for(const name of ['Laternenmoor Props v1','Spiegelwinter Tiles v1','Spiegelwinter Sprites v1','Windbruch Tiles v1','Windbruch Sprites v1','Windbruch Details v1','Lantern Jelly Pixel v1']){
    const source=await readFile(resolve(root, '../public/assets',`${name}.png`));
    assert.ok(source.equals(Buffer.from(embedded.images[name].split(',')[1], 'base64')));
    assert.ok(source.equals(await readFile(resolve(root, dist, 'assets',`${name}.png`))));
  }
  if(woodland)assert.equal(offline,await readFile(resolve(root,'Spire-Wald.html'),'utf8'),'Legacy woodland launcher must include all four maps');
}
if (stylePreview) {
  const original = await readFile(resolve(root, '../public/assets/Hero Mara.png'));
  assert.ok(original.equals(Buffer.from(embedded.images['Mara style source'].split(',')[1], 'base64')), 'Mara source changed during packaging');
  assert.ok(original.equals(await readFile(resolve(root, dist, 'assets/Mara style source.png'))), 'Mara source differs in production build');
}
assert.deepEqual(embedded.manifest, manifest);
assert.ok(!/<(?:script|link)[^>]+(?:src|href)="(?:https?:|\.\/)/.test(offline), 'Offline output references an external script/style');
assert.ok(!offline.includes('@import url('), 'Offline output references external fonts');
const uiNames = ['panel-frame.png', 'button-states.png', 'menu-backdrop.png', 'spire-emblem.png', 'hud-icons.png', 'tower-slots.png', 'map-covers.png'];
assert.deepEqual(Object.keys(embedded.uiImages).sort(), [...uiNames].sort(), 'Offline UI image set differs');
const styles = [...offline.matchAll(/<style[^>]*>(.*?)<\/style>/gs)].map(match => match[1]).join('\n');
assert.ok(styles.length > 0, 'Offline styles missing');
assert.ok(!/@import\b/.test(styles), 'Offline CSS has an external import');
for (const match of styles.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*?))\s*\)/g)) {
  const url = (match[1] ?? match[2] ?? match[3]).trim();
  assert.ok(url.startsWith('data:') || url.startsWith('#'), `Offline CSS references an external asset: ${url}`);
}

for (const [name, info] of Object.entries(manifest)) {
  const original = await readFile(resolve(root, 'public/assets', `${name}.png`));
  const built = await readFile(resolve(root, dist, 'assets', `${name}.png`));
  const encoded = Buffer.from(embedded.images[name].split(',')[1], 'base64');
  assert.ok(original.equals(built), `${name}: production PNG differs`);
  assert.ok(original.equals(encoded), `${name}: embedded PNG differs`);
  assert.equal(original.readUInt32BE(16), info.sheetWidth, `${name}: wrong sheet width`);
  assert.equal(original.readUInt32BE(20), info.sheetHeight, `${name}: wrong sheet height`);
  for (const frame of info.frameMap ?? []) {
    assert.ok(Number.isInteger(frame) && frame >= 0 && frame < info.cols * info.rows, `${name}: invalid frame ${frame}`);
  }
}
for (const name of uiNames) {
  const original = await readFile(resolve(root, 'public/ui', name));
  const built = await readFile(resolve(root, dist, 'ui', name));
  assert.ok(embedded.uiImages[name].startsWith('data:image/png;base64,'), `${name}: invalid embedded UI image`);
  const encoded = Buffer.from(embedded.uiImages[name].split(',')[1], 'base64');
  assert.ok(original.equals(built), `${name}: production UI PNG differs`);
  assert.ok(original.equals(encoded), `${name}: embedded UI PNG differs`);
  assert.ok(original.readUInt32BE(16) > 0 && original.readUInt32BE(20) > 0, `${name}: invalid UI dimensions`);
}
console.log(`PASS ${regional ? 92 : stylePreview ? 85 : 84} game PNGs and 7 UI PNGs: production and offline bytes match; dimensions and animation frames valid; offline package has no external script/style/font/image dependencies.`);
