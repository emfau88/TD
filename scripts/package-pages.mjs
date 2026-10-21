/** Publish the current game at the root; old play/preview URLs are lightweight aliases. */
import { cp, mkdir, readFile, readdir, realpath, lstat, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const source = join(root, 'experiments', 'idle-bastion', 'dist');
const output = join(root, 'dist');
// Verify the built entry before touching an old generated output directory.
if (!(await readFile(join(source, 'index.html'), 'utf8')).includes('SPIRE')) throw new Error('Missing current game build');
if (relative(root, output) !== 'dist') throw new Error('Unsafe output path');
const existing = await lstat(output).catch(error => { if (error.code !== 'ENOENT') throw error; });
if (existing && (existing.isSymbolicLink() || await realpath(output) !== output)) throw new Error('Output must be the real repository dist directory');
await rm(output, { recursive: true, force: true });
await cp(source, output, { recursive: true });
const aliases = join(output, 'idle-bastion');
await mkdir(aliases);
for (const name of await readdir(source)) {
  if (!name.endsWith('.html')) continue;
  const target = name === 'index.html' ? '../' : `../${name}`;
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SPIRE · Weiter zum Spiel</title></head><body><p>SPIRE hat eine neue Hauptadresse. <a id="continue" href="${target}">Weiter zum Spiel</a></p><script>const target=new URL(${JSON.stringify(target)},location.href);target.search=location.search;target.hash=location.hash;document.getElementById('continue').href=target.href;location.replace(target.href);</script></body></html>`;
  await writeFile(join(aliases, name), html);
}
await writeFile(join(output, '.nojekyll'), '');
console.log('Current SPIRE build packaged at /; previous /idle-bastion/ links retain query and hash.');
