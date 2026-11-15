// node capture.js <edl.json> <outDir> [t1,t2,...]   -> PNG frames with alpha
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [edlPath, out, list] = process.argv.slice(2);
  const E = JSON.parse(fs.readFileSync(edlPath)); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(__dirname, 'overlay.html') + (process.env.VARIANT ? '#' + process.env.VARIANT : ''));
  await p.evaluate(d => window.setup(d), { captions: E.captions.map(c => ({ ...c, e: Math.min(c.e, E.total) })), total: E.total });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.fonts].map(f => f.load().catch(() => 0))));
  let times = null, frameIdx = null;
  if (list && list.startsWith('f:')) { const [a, b] = list.slice(2).split(':').map(Number); frameIdx = []; for (let i = a; i <= b; i++) frameIdx.push(i); }
  else if (list) times = list.split(',').map(Number);
  const n = times ? times.length : frameIdx ? frameIdx.length : Math.round((E.total + E.end_card) * E.fps);
  for (let i = 0; i < n; i++) {
    const fi = frameIdx ? frameIdx[i] : i; const t = times ? times[i] : fi / E.fps;
    await p.evaluate(t => window.render(t), t);
    await p.screenshot({ path: path.join(out, times ? `t_${t}.png` : String(fi).padStart(5, '0') + '.png'), omitBackground: true });
    if (!times && i % 300 === 0) console.log('frame', i, '/', n);
  }
  await b.close();
})();
