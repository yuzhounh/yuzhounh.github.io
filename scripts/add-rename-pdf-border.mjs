import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pngPath = path.join(root, 'assets', 'vibe-icons', 'rename-pdf-files.png');

const borderSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
  <rect x="1" y="1" width="126" height="126" rx="28" ry="28" fill="none" stroke="#d1d5db" stroke-width="2"/>
</svg>`,
);

const tmpPath = `${pngPath}.tmp`;
await sharp(pngPath)
  .composite([{ input: borderSvg, blend: 'over' }])
  .png()
  .toFile(tmpPath);
fs.renameSync(tmpPath, pngPath);

console.log('Added light gray border to rename-pdf-files.png');
