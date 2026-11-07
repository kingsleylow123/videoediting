// Full render: node scripts/render.mjs out/reel.mp4
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const out = process.argv[2] ?? 'out/reel.mp4';
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Reel', browserExecutable});
let last = -1;
await renderMedia({serveUrl, composition, codec: 'h264', crf: 18, outputLocation: out, browserExecutable,
  concurrency: 4, audioBitrate: '256k', timeoutInMilliseconds: 120000, offthreadVideoCacheSizeInBytes: 2 * 1024 ** 3,
  onProgress: ({progress}) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log('progress', Math.round(progress * 100) + '%'); } }});
console.log('done', out);
