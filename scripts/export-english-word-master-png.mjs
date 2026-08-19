import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = path.join(root, 'assets', 'vibe-icons', 'english-word-master.svg');
const pngPath = path.join(root, 'assets', 'vibe-icons', 'english-word-master.png');

if (!fs.existsSync(svgPath)) {
  throw new Error(`SVG not found: ${svgPath}`);
}

execSync(
  `npx --yes @resvg/resvg-js-cli --fit-width 128 --fit-height 128 "${svgPath}" "${pngPath}"`,
  { cwd: root, stdio: 'inherit' },
);

console.log(`Exported ${path.relative(root, pngPath)} from ${path.relative(root, svgPath)}`);
