/** Replace only /previews/tavern/ in the last published Pages site, preserving main and other previews. */
import { cp, lstat, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

const [mainPath, branchPath, branchSha, mainSha, publishedPath] = process.argv.slice(2);
if (!mainPath || !branchPath || !publishedPath || !/^[a-f0-9]{40}$/.test(branchSha ?? '') || !/^[a-f0-9]{40}$/.test(mainSha ?? '')) {
  throw new Error('Usage: package-tavern-preview.mjs MAIN_ARTIFACT BRANCH_DIST BRANCH_SHA MAIN_SHA PUBLISHED_ARTIFACT');
}
const main = await realpath(resolve(mainPath));
const branch = await realpath(resolve(branchPath));
const site = await realpath(resolve(publishedPath));
function contains(parent, child) {
  const path = relative(parent, child);
  return path === '' || !isAbsolute(path) && path !== '..' && !path.startsWith(`..${sep}`);
}
for (const [left, right] of [[main, branch], [main, site], [branch, site]]) {
  if (contains(left, right) || contains(right, left)) throw new Error('Main, branch and published artifacts must be separate directories');
}
await readFile(join(main, 'index.html'));
for (const name of ['index.html', 'tavern-test.html', 'tavern-counter-check.html']) {
  const html = await readFile(join(branch, name), 'utf8');
  if (/(?:src|href)=["']\/assets\//.test(html)) throw new Error(`Preview requires relative asset URLs: ${name}`);
}
async function hashes(directory, prefix = '') {
  const result = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const key = prefix + entry.name, path = join(directory, entry.name);
    if (entry.isDirectory()) for (const [file, digest] of await hashes(path, key + '/')) result.set(file, digest);
    else if (entry.isFile()) result.set(key, createHash('sha256').update(await readFile(path)).digest('hex'));
    else throw new Error(`Unsupported artifact entry: ${key}`);
  }
  return result;
}
const [mainFiles, original, branchFiles] = await Promise.all([hashes(main), hashes(site), hashes(branch)]);
// Byte proof is stronger than trusting a stale mainSha inside an old preview's metadata.
for (const [file, digest] of mainFiles) {
  if (original.get(file) !== digest) throw new Error(`Published site does not match current main: ${file}; preserve previews and refresh the main baseline before deploying`);
}
for (const file of original.keys()) {
  if (!mainFiles.has(file) && !file.startsWith('previews/')) throw new Error(`Unexpected file outside published previews: ${file}`);
}
const prefix = 'previews/tavern/';
const target = join(site, 'previews', 'tavern');
if (!contains(site, target) || relative(site, target) !== join('previews', 'tavern')) throw new Error('Unsafe tavern preview target');
const previous = await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; });
if (previous) {
  if (!previous.isDirectory() || previous.isSymbolicLink() || await realpath(target) !== target) throw new Error('Existing tavern preview must be a real directory');
  // Only this checked, generated preview directory may be replaced.
  await rm(target, { recursive: true });
}
await cp(branch, target, { recursive: true, errorOnExist: true, force: false });
await writeFile(join(target, 'feature-preview.json'), JSON.stringify({
  branch: 'codex/tavern-comfy-integration', branchSha, mainSha,
  entries: ['tavern-test.html', 'tavern-counter-check.html'],
  verifiedMainFiles: mainFiles.size,
  preservedPublishedFiles: [...original.keys()].filter(file => !file.startsWith(prefix)).length,
}, null, 2) + '\n');
const combined = await hashes(site);
for (const [file, digest] of original) {
  if (!file.startsWith(prefix) && combined.get(file) !== digest) throw new Error(`Published file changed: ${file}`);
}
for (const file of combined.keys()) {
  if (!original.has(file) && !file.startsWith(prefix)) throw new Error(`Unexpected addition outside tavern preview: ${file}`);
}
for (const [file, digest] of branchFiles) {
  if (file !== 'feature-preview.json' && combined.get(prefix + file) !== digest) throw new Error(`Branch file changed while packaging: ${file}`);
}
console.log(`Verified ${mainFiles.size} current main files; preserved every published file outside ${prefix}; packaged ${branchFiles.size} branch files for ${branchSha}.`);
