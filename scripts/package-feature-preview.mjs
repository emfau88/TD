/** Add a temporary branch preview to an unchanged, successful main Pages artifact. */
import { cp, lstat, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative, resolve } from 'node:path';

const [mainPath, branchPath, branchSha, mainSha] = process.argv.slice(2);
if (!mainPath || !branchPath || !/^[a-f0-9]{40}$/.test(branchSha ?? '') || !/^[a-f0-9]{40}$/.test(mainSha ?? '')) {
  throw new Error('Usage: package-feature-preview.mjs MAIN_ARTIFACT BRANCH_DIST BRANCH_SHA MAIN_SHA');
}
const main = await realpath(resolve(mainPath)), branch = await realpath(resolve(branchPath));
if (main === branch || !relative(main, branch).startsWith('..')) throw new Error('Main and branch artifacts must be separate');
await readFile(join(main, 'index.html'));
await readFile(join(branch, 'feature-check.html'));
const target = join(main, 'previews', 'frost-hero');
try { await lstat(target); throw new Error('Preview path already exists in main artifact'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
async function hashes(directory, prefix = '') {
  const result = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const key = prefix + entry.name, path = join(directory, entry.name);
    if (entry.isDirectory()) for (const [k, v] of await hashes(path, key + '/')) result.set(k, v);
    else if (entry.isFile()) result.set(key, createHash('sha256').update(await readFile(path)).digest('hex'));
    else throw new Error(`Unsupported artifact entry: ${key}`);
  }
  return result;
}
const original = await hashes(main);
await cp(branch, target, { recursive: true, errorOnExist: true, force: false });
await writeFile(join(target, 'feature-preview.json'), JSON.stringify({ branch: 'codex/frost-kit-hero-controls', branchSha, mainSha }, null, 2) + '\n');
const combined = await hashes(main);
for (const [file, digest] of original) if (combined.get(file) !== digest) throw new Error(`Main artifact changed: ${file}`);
for (const file of combined.keys()) if (!original.has(file) && !file.startsWith('previews/frost-hero/')) throw new Error(`Unexpected addition: ${file}`);
console.log(`Preserved all ${original.size} main files byte-for-byte; added preview for ${branchSha}.`);
