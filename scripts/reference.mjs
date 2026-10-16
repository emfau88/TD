import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const reference = resolve(root, 'reference');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
async function walk(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, item.name);
    if (item.isDirectory()) files.push(...await walk(path));
    else if (item.isFile()) files.push(path);
  }
  return files;
}

async function prepare() {
  const sources = new Map();
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('Foozle_')) continue;
    for (const path of await walk(resolve(root, entry.name))) {
      if (!path.toLowerCase().endsWith('.png')) continue;
      const name = basename(path, '.png');
      const paths = sources.get(name) ?? [];
      paths.push(path);
      sources.set(name, paths);
    }
  }
  assert.equal(sources.size, 84, 'Expected the 84 original Foozle PNG assets');
  const current = JSON.parse(await readFile(resolve(root, 'public/assets/manifest.json'), 'utf8'));
  const manifest = {}, provenance = [];
  const output = resolve(reference, 'public/assets');
  await mkdir(output, { recursive: true });
  for (const [name, candidates] of [...sources].sort(([a], [b]) => a.localeCompare(b))) {
    const runtime = await readFile(resolve(root, 'public/assets', `${name}.png`));
    let original;
    for (const candidate of candidates) {
      if (runtime.equals(await readFile(candidate))) { original = candidate; break; }
    }
    assert.ok(original, `Runtime asset differs from its original package: ${name}`);
    assert.ok(current[name], `Missing original asset metadata: ${name}`);
    assert.equal(current[name].sheetWidth, runtime.readUInt32BE(16), `${name}: width`);
    assert.equal(current[name].sheetHeight, runtime.readUInt32BE(20), `${name}: height`);
    manifest[name] = current[name];
    await writeFile(resolve(output, `${name}.png`), runtime);
    provenance.push({ name, original: relative(root, original).replaceAll('\\', '/'), sha256: hash(runtime) });
  }
  await writeFile(resolve(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await copyFile(resolve(root, 'public/assets/Hero Mara.png'), resolve(output, 'Mara style source.png'));
  await copyFile(resolve(root, 'public/assets/Laternenmoor Props v1.png'), resolve(output, 'Laternenmoor Props v1.png'));
  await run([resolve(root,'scripts/prepare-winter-atlas.mjs')]);
  await run([resolve(root,'scripts/prepare-wind-atlas.mjs')]);
  for(const file of ['Spiegelwinter Tiles v1.png','Spiegelwinter Sprites v1.png','Windbruch Tiles v1.png','Windbruch Sprites v1.png','Windbruch Details v1.png'])await copyFile(resolve(root,'public/assets',file),resolve(output,file));
  const ui = ['panel-frame.png', 'button-states.png', 'menu-backdrop.png', 'spire-emblem.png', 'hud-icons.png', 'tower-slots.png', 'map-covers.png'];
  await mkdir(resolve(reference, 'public/ui'), { recursive: true });
  for (const file of ui) await copyFile(resolve(root, 'public/ui', file), resolve(reference, 'public/ui', file));
  await mkdir(resolve(root, 'artifacts/m0'), { recursive: true });
  await writeFile(resolve(root, 'artifacts/m0/asset-provenance.json'), JSON.stringify({
    description: '84 original game PNGs verified byte-for-byte against Foozle packages; seven existing forest UI graphics reused.',
    assets: provenance, ui,
  }, null, 2) + '\n');
  console.log('Reference assets ready: 84 verified original game images, 7 forest UI images.');
}

async function run(args) {
  const child = spawn(process.execPath, args, { cwd: reference, stdio: 'inherit', windowsHide: true });
  await new Promise((done, fail) => {
    child.on('error', fail);
    child.on('exit', (code, signal) => code === 0 ? done() : fail(new Error(`Reference command failed (${code ?? signal}): ${args[0]}`)));
  });
}
const bin = path => resolve(root, 'node_modules', path);
const mode = process.argv[2] ?? 'prepare';
assert.ok(['prepare', 'dev', 'build', 'test', 'style-build', 'forest-build'].includes(mode), 'Use prepare, dev, build, test, style-build, or forest-build');
await prepare();
if (mode === 'dev') await run([bin('vite/bin/vite.js'), '--host', '127.0.0.1']);
if (mode === 'build') {
  await run([bin('typescript/bin/tsc'), '--noEmit']);
  await run([bin('vite/bin/vite.js'), 'build']);
  await run(['scripts/package-offline.mjs']);
  await run(['scripts/check-package.mjs']);
}
if (mode === 'style-build') {
  await run([bin('typescript/bin/tsc'), '--noEmit']);
  await run([bin('vite/bin/vite.js'), 'build', '--config', 'vite.style.config.ts']);
  await run(['scripts/package-offline.mjs', 'style']);
  await run(['scripts/check-package.mjs', 'style']);
}
if (mode === 'forest-build') {
  await run([bin('typescript/bin/tsc'), '--noEmit']);
  await run([bin('vite/bin/vite.js'), 'build', '--config', 'vite.woodland.config.ts']);
  await run(['scripts/package-offline.mjs', 'forest']);
  await run(['scripts/check-package.mjs', 'forest']);
}
if (mode === 'test') {
  const files = (await readdir(resolve(reference, 'tests'))).filter(file => /\.test\.(ts|mjs)$/.test(file)).sort();
  await run([bin('tsx/dist/cli.mjs'), '--test', ...files.map(file => `tests/${file}`)]);
  await run(['scripts/check-ui.mjs']);
}
