import { cp, lstat, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist_pages');
const staging = join(root, '.site-build');
for (const path of [output, staging]) {
  const info = await lstat(path).catch(() => null);
  if (info?.isSymbolicLink()) throw new Error(`Refusing linked output: ${path}`);
}
const files = execFileSync('git', ['ls-files', '-z', '--', 'index.html', 'assets', 'PDF'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
if (!files.includes('index.html')) throw new Error('Missing tracked homepage');
await rm(staging, { recursive: true, force: true });
await mkdir(staging);
const hashes = {};
for (const file of files) {
  const destination = join(staging, file);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join(root, file), destination);
  hashes[file] = createHash('sha256').update(await readFile(destination)).digest('hex');
}
await writeFile(join(staging, '.nojekyll'), '');
await writeFile(join(staging, 'deployment-manifest.json'), JSON.stringify({ source: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), files: hashes }, null, 2) + '\n');
await rm(output, { recursive: true, force: true });
await rename(staging, output);
console.log(`Prepared dist_pages: ${files.length} tracked site files`);
