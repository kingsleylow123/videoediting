// Render preview stills at given seconds: node scripts/stills.mjs out_dir 1.2 5 9 ...
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [out, ...secs] = process.argv.slice(2);
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Reel', browserExecutable});
for (const s of secs) {
  const frame = Math.round(Number(s) * 30);
  await renderStill({serveUrl, composition, frame, output: `${out}/f_${String(frame).padStart(4, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 70, scale: 0.4, browserExecutable});
  console.log('still', s);
}
