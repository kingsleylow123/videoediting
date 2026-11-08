import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const b = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const u = await bundle({entryPoint: path.resolve('src/index.ts')});
for (const id of process.argv.slice(2)) {
  const c = await selectComposition({serveUrl: u, id, browserExecutable: b});
  await renderStill({serveUrl: u, composition: c, frame: 0, output: `out/${id}.png`, browserExecutable: b}); console.log('ok', id);
}
