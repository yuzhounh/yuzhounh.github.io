import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import decodeIco from 'decode-ico';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'assets', 'vibe-icons');
const tmpDir = path.join(root, '.tmp-vibe-icons');

const ICONS = [
  {
    repo: 'music-collection',
    sources: [
      'https://www.google.com/s2/favicons?domain=music.163.com&sz=128',
      'https://raw.githubusercontent.com/yuzhounh/music-collection/main/public/favicon.png',
      'https://music.163.com/favicon.ico',
    ],
  },
  {
    repo: 'douban-movies-ranking',
    sources: [
      'https://www.google.com/s2/favicons?domain=douban.com&sz=128',
      'https://raw.githubusercontent.com/yuzhounh/douban-movies-ranking/main/public/favicon.png',
      'https://www.douban.com/favicon.ico',
    ],
  },
  {
    repo: 'douban-books-ranking',
    sources: [
      'https://www.google.com/s2/favicons?domain=douban.com&sz=128',
      'https://raw.githubusercontent.com/yuzhounh/douban-books-ranking/main/public/favicon.png',
      'https://www.douban.com/favicon.ico',
    ],
  },
  {
    repo: 'Tampermonkey-scripts',
    sources: [
      'https://www.google.com/s2/favicons?domain=tampermonkey.net&sz=128',
      'https://raw.githubusercontent.com/yuzhounh/Tampermonkey-scripts/main/favicon.png',
      'https://www.tampermonkey.net/favicon.ico',
    ],
  },
  {
    repo: 'Open-with-Antigravity',
    sources: [
      'https://www.google.com/s2/favicons?domain=antigravity.google&sz=128',
      'https://raw.githubusercontent.com/yuzhounh/Open-with-Antigravity/main/favicon.png',
      'https://antigravity.google/favicon.ico',
    ],
  },
  {
    repo: 'Open-with-Cursor',
    sources: [
      'https://www.google.com/s2/favicons?domain=cursor.com&sz=128',
      'https://cursor.com/favicon.svg',
      'https://raw.githubusercontent.com/yuzhounh/Open-with-Cursor/main/favicon.png',
    ],
  },
  {
    repo: 'python-image-export-comparison',
    sources: [
      'https://www.google.com/s2/favicons?domain=python.org&sz=128',
      'https://www.python.org/static/favicon.ico',
      'https://raw.githubusercontent.com/yuzhounh/python-image-export-comparison/main/favicon.png',
    ],
  },
  {
    repo: 'matlab-figure-export-comparison',
    sources: [
      'https://www.google.com/s2/favicons?domain=mathworks.com&sz=128',
      'https://raw.githubusercontent.com/yuzhounh/matlab-figure-export-comparison/main/favicon.png',
      'https://www.mathworks.com/favicon.ico',
    ],
  },
  {
    repo: 'timelens-chrome-extension',
    sources: [
      'https://raw.githubusercontent.com/yuzhounh/timelens-chrome-extension/main/icons/timer-128.png',
      'https://raw.githubusercontent.com/yuzhounh/timelens-chrome-extension/main/icons/timer.svg',
    ],
  },
  {
    repo: 'focus-pace',
    sources: [
      'https://raw.githubusercontent.com/yuzhounh/focus-pace/main/src/FocusPace/Assets/FocusPace.ico',
    ],
  },
  {
    repo: 'dsh-windows-tray-launcher',
    sources: [
      'https://raw.githubusercontent.com/yuzhounh/dsh-windows-tray-launcher/main/dsh-favicon-black.svg',
    ],
  },
  {
    repo: 'rename-pdf-files',
    sources: [
      'https://raw.githubusercontent.com/yuzhounh/rename-pdf-files/main/logo.ico',
    ],
  },
];

async function download(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; vibe-icon-sync/1.0)' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function isSvg(data) {
  const head = data.slice(0, 256).toString('utf8').trimStart();
  return head.includes('<svg');
}

function isIco(data) {
  return data.length >= 4 && data[0] === 0 && data[1] === 0 && data[2] === 1 && data[3] === 0;
}

function isPng(data) {
  return data.length >= 8 && data[0] === 0x89 && data[1] === 0x50;
}

function isJpeg(data) {
  return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
}

function extractPngFromIco(data) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  let best = null;
  let idx = 0;

  while ((idx = data.indexOf(sig, idx)) !== -1) {
    const endMarker = data.indexOf(Buffer.from('IEND'), idx);
    if (endMarker === -1) {
      break;
    }
    const chunkEnd = endMarker + 8;
    const chunk = data.slice(idx, chunkEnd);
    if (!best || chunk.length > best.length) {
      best = chunk;
    }
    idx += 1;
  }

  return best;
}

function icoToPngViaPowerShell(icoPath, pngPath) {
  const ps = [
    'Add-Type -AssemblyName System.Drawing',
    `$icon = New-Object System.Drawing.Icon('${icoPath.replace(/'/g, "''")}')`,
    '$bitmap = $icon.ToBitmap()',
    `$bitmap.Save('${pngPath.replace(/'/g, "''")}', [System.Drawing.Imaging.ImageFormat]::Png)`,
    '$icon.Dispose()',
    '$bitmap.Dispose()',
  ].join('; ');
  execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"')}"`, { stdio: 'pipe' });
}

async function resizePng(pngPath) {
  const meta = await sharp(pngPath).metadata();
  if ((meta.width || 0) >= 128 && (meta.height || 0) >= 128) {
    return;
  }
  const tmpPath = `${pngPath}.tmp`;
  await sharp(pngPath)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(tmpPath);
  fs.renameSync(tmpPath, pngPath);
}

async function savePngFromBufferInner(data, pngPath) {
  if (isSvg(data)) {
    const svgPath = pngPath.replace(/\.png$/i, '.svg');
    fs.writeFileSync(svgPath, data);
    execSync(`npx --yes @resvg/resvg-js-cli "${svgPath}" "${pngPath}"`, {
      cwd: root,
      stdio: 'pipe',
    });
    return 'svg';
  }

  if (isIco(data)) {
    const embeddedPng = extractPngFromIco(data);
    if (embeddedPng) {
      await sharp(embeddedPng)
        .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(pngPath);
      return 'ico-png';
    }

    const images = decodeIco(data);
    if (images.length) {
      const best = images.sort((a, b) => b.width * b.height - a.width * a.height)[0];
      const expected = best.width * best.height * 4;
      if (best.data.length === expected) {
        await sharp(best.data, {
          raw: { width: best.width, height: best.height, channels: 4 },
        })
          .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(pngPath);
        return 'ico';
      }
    }
  }

  if (isPng(data) || isJpeg(data)) {
    await sharp(data)
      .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(pngPath);
    return 'png';
  }

  await sharp(data)
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(pngPath);
  return 'auto';
}

async function savePngFromBuffer(data, pngPath) {
  fs.mkdirSync(tmpDir, { recursive: true });

  try {
    return await savePngFromBufferInner(data, pngPath);
  } catch (error) {
    if (!isIco(data)) {
      throw error;
    }
    const tmpPath = path.join(tmpDir, `${path.basename(pngPath, '.png')}.ico`);
    fs.writeFileSync(tmpPath, data);
    icoToPngViaPowerShell(tmpPath, pngPath);
    await resizePng(pngPath);
    return 'ico-ps';
  }
}

async function syncIcon({ repo, sources }) {
  const pngPath = path.join(outDir, `${repo}.png`);
  let lastError;

  for (const url of sources) {
    try {
      process.stdout.write(`Syncing ${repo} from ${new URL(url).hostname}... `);
      const data = await download(url);
      const kind = await savePngFromBuffer(data, pngPath);
      console.log(kind);
      return;
    } catch (error) {
      lastError = error;
      console.log(`failed (${error.message})`);
    }
  }

  throw new Error(`Unable to sync ${repo}: ${lastError?.message || 'unknown error'}`);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  execSync('npm install --no-save sharp@0.33.5 decode-ico@0.4.1', {
    cwd: root,
    stdio: 'inherit',
  });

  for (const icon of ICONS) {
    await syncIcon(icon);
  }

  const cursorPng = path.join(outDir, 'Open-with-Cursor.png');
  const cursorRegPng = path.join(outDir, 'Open-with-Cursor-by-reg.png');
  fs.copyFileSync(cursorPng, cursorRegPng);
  console.log('Copied Open-with-Cursor.png -> Open-with-Cursor-by-reg.png');

  fs.rmSync(tmpDir, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
