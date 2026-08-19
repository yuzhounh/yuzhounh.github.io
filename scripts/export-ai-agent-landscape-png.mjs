import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = path.join(root, 'assets', 'vibe-icons', 'ai-agent-landscape.svg');
const pngPath = path.join(root, 'assets', 'vibe-icons', 'ai-agent-landscape.png');

execSync(
  `npx --yes @resvg/resvg-js-cli --fit-width 128 --fit-height 128 "${svgPath}" "${pngPath}"`,
  { cwd: root, stdio: 'inherit' },
);

console.log('Exported ai-agent-landscape.png');
