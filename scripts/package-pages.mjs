/** Publish the current game at the root; old play/preview URLs are lightweight aliases. */
import { cp, mkdir, readFile, readdir, realpath, lstat, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const source = join(root, 'experiments', 'idle-bastion', 'dist');
const output = join(root, 'dist');
// Verify the built entry before touching an old generated output directory.
if (!(await readFile(join(source, 'index.html'), 'utf8')).includes('id="boot-screen"')) throw new Error('Missing current game build');
if (relative(root, output) !== 'dist') throw new Error('Unsafe output path');
const existing = await lstat(output).catch(error => { if (error.code !== 'ENOENT') throw error; });
if (existing && (existing.isSymbolicLink() || await realpath(output) !== output)) throw new Error('Output must be the real repository dist directory');
await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
// Static review media are loaded only when the gallery is opened, never by the game.
const review = join(root, 'artifacts', 'idle-bastion', 'previews', 'ability-art');
for (const name of ['index.html', 'assets', 'screenshots', 'videos']) {
  await cp(join(review, name), join(output, 'art-review', name), { recursive: true });
}
// Standalone comparison page; the game separately imports the approved compact assets.
const towerStudy = join(root, 'prototypes', 'waldwaechter-evolution');
for (const name of ['index.html', 'styles.css', 'preview.js', 'shooting.js', 'shot-model.js', 'manifest.json', 'comparison.png', 'assets']) {
  await cp(join(towerStudy, name), join(output, 'prototypes', 'waldwaechter-evolution', name), { recursive: true });
}
// Standalone frost study; the game shares its approved assets and animation poses.
const frostStudy = join(root, 'prototypes', 'frostkristall-evolution');
for (const name of ['index.html', 'styles.css', 'preview.js', 'study-model.js', 'attack-motion.js', 'manifest.json', 'comparison.png', 'assets']) {
  await cp(join(frostStudy, name), join(output, 'prototypes', 'frostkristall-evolution', name), { recursive: true });
}
// Standalone impact comparison; effect generation is also shared with the game.
await cp(join(root, 'prototypes', 'tower-impact-study'), join(output, 'prototypes', 'tower-impact-study'), { recursive: true });
function redirect(target) {
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Towers &amp; Tantrums · Weiter</title></head><body><p><a id="continue" href="${target}">Weiter zu Towers &amp; Tantrums</a></p><script>const target=new URL(${JSON.stringify(target)},location.href);target.search=location.search;target.hash=location.hash;document.getElementById('continue').href=target.href;location.replace(target.href);</script></body></html>`;
}
// Preserve shared README test/gallery links after the temporary branch preview becomes main.
// Preview builds are themselves nested at this address and do not need these aliases.
if (process.env.VITE_FEATURE_PREVIEW !== '1') {
  const legacyPreview = join(output, 'previews', 'frost-hero');
  await mkdir(join(legacyPreview, 'art-review'), { recursive: true });
  await writeFile(join(legacyPreview, 'feature-check.html'), redirect('../../feature-check.html'));
  await writeFile(join(legacyPreview, 'art-review', 'index.html'), redirect('../../../art-review/'));
}
const aliases = join(output, 'idle-bastion');
await mkdir(aliases);
for (const name of await readdir(source)) {
  if (!name.endsWith('.html')) continue;
  const target = name === 'index.html' ? '../' : `../${name}`;
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Towers &amp; Tantrums · Weiter zum Spiel</title></head><body><p>Towers &amp; Tantrums hat eine neue Hauptadresse. <a id="continue" href="${target}">Weiter zum Spiel</a></p><script>const target=new URL(${JSON.stringify(target)},location.href);target.search=location.search;target.hash=location.hash;document.getElementById('continue').href=target.href;location.replace(target.href);</script></body></html>`;
  await writeFile(join(aliases, name), html);
}
await writeFile(join(output, '.nojekyll'), '');
console.log('Current Towers & Tantrums build packaged at /; previous /idle-bastion/ links retain query and hash.');
