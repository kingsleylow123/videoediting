#!/usr/bin/env node
// Backup renderer for HyperFrames projects in the cloud session.
// `npx hyperframes render` crashes this cloud container, so this renders the same
// index.html with Playwright (pre-installed) + FFmpeg instead.
//
// Usage: node tools/render.js <project-dir> [out.mp4] [--fps 30] [--draft]
//   - seeks window.__timelines[<composition-id>] frame by frame and screenshots it
//   - mixes every <audio data-start data-volume src> in the page into the MP4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const draft = args.includes('--draft'); if (draft) args.splice(args.indexOf('--draft'), 1);
const fpsArg = flag('--fps', null);
const stills = flag('--stills', null); // e.g. --stills 1.5,10,42  -> writes PNGs next to the output, no video
const fromT = +flag('--from', 0), toArg = flag('--to', null);
const dir = path.resolve(args[0] || '.');
const out = path.resolve(args[1] || path.join(dir, 'renders', path.basename(dir) + '.mp4'));
const entry = path.join(dir, 'index.html');
if (!fs.existsSync(entry)) { console.error(`no index.html in ${dir}`); process.exit(1); }
fs.mkdirSync(path.dirname(out), { recursive: true });

(async () => {
  const browser = await chromium.launch();
  // HyperFrames' runtime normally provides this registry; projects write their timeline into it
  const init = () => { window.__timelines = window.__timelines || {}; };
  const probe = await browser.newPage();
  await probe.addInitScript(init);
  await probe.goto('file://' + entry);
  const meta = await probe.evaluate(() => {
    const root = document.querySelector('[data-composition-id]');
    return {
      id: root.dataset.compositionId,
      w: +(root.dataset.width || 1080), h: +(root.dataset.height || 1920),
      dur: +(root.dataset.duration || 0), fps: +(root.dataset.fps || 30),
      audio: [...document.querySelectorAll('audio[src]')].map(a => ({
        src: a.getAttribute('src'), start: +(a.dataset.start || 0), volume: +(a.dataset.volume || a.volume || 1),
      })),
    };
  });
  await probe.close();
  const fps = +(fpsArg || meta.fps);
  const frames = Math.round(meta.dur * fps);
  if (!frames) throw new Error('composition has no data-duration');

  const page = await browser.newPage({ viewport: { width: meta.w, height: meta.h } });
  await page.addInitScript(init);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('file://' + entry);
  await page.evaluate(() => document.fonts && document.fonts.ready);
  if (errors.length) console.warn('page errors:', errors.join(' | '));
  if (!(await page.evaluate(id => !!(window.__timelines && window.__timelines[id]), meta.id)))
    console.warn(`warning: no timeline registered as window.__timelines["${meta.id}"]; animation will not play`);
  await page.evaluate(() => document.querySelectorAll('audio,video').forEach(m => { m.muted = true; m.pause(); }));
  // wait until every <video> can show frames
  await page.waitForFunction(() => [...document.querySelectorAll('video')].every(v => v.readyState >= 2), null, { timeout: 60000 })
    .catch(() => console.warn('warning: a <video> did not load (codec or path problem)'));

  // seek the GSAP timeline, toggle data-start clips, and seek every <video> to its frame
  const seekTo = t => page.evaluate(async ([id, t]) => {
    const tl = window.__timelines && window.__timelines[id];
    if (tl) { tl.seek(t, false); } // GSAP timeline, paused
    document.querySelectorAll('[data-start][data-duration]').forEach(el => {
      if (el.matches('[data-composition-id]')) return;
      const s = +el.dataset.start, d = +el.dataset.duration;
      el.style.visibility = t >= s && t < s + d ? '' : 'hidden';
    });
    const waits = [];
    document.querySelectorAll('video[data-start]').forEach(v => {
      const target = Math.max(0, t - +v.dataset.start + +(v.dataset.mediaStart || 0));
      if (Math.abs(v.currentTime - target) < 0.0005) return;
      waits.push(new Promise(res => { const done = () => res(); v.addEventListener('seeked', done, { once: true }); setTimeout(done, 3000); }));
      v.currentTime = target;
    });
    await Promise.all(waits);
    await new Promise(r => requestAnimationFrame(() => r()));
  }, [meta.id, t]);

  if (stills) {
    const base = out.replace(/\.mp4$/, '');
    for (const t of stills.split(',').map(Number)) {
      await seekTo(t);
      const f = `${base}-${t.toFixed(2)}.png`;
      await page.screenshot({ path: f });
      console.log('still', f);
    }
    await browser.close();
    return;
  }

  const silent = path.join(path.dirname(out), '.video-only.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'medium', '-crf', draft ? '28' : '18',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => ff.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()));

  const f0 = Math.round(fromT * fps), f1 = toArg ? Math.min(frames, Math.round(+toArg * fps)) : frames;
  for (let i = f0; i < f1; i++) {
    await seekTo(i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: draft ? 80 : 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % fps === 0) process.stdout.write(`\rframe ${i}/${frames}`);
  }
  ff.stdin.end();
  await ffDone;
  await browser.close();
  process.stdout.write(`\rframe ${f1}/${frames}\n`);

  // mix audio
  if (meta.audio.length) {
    const inputs = ['-i', silent], filters = [];
    meta.audio.forEach((a, k) => {
      inputs.push('-i', path.resolve(dir, a.src));
      const ms = Math.round(a.start * 1000);
      filters.push(`[${k + 1}:a]adelay=${ms}|${ms},volume=${a.volume}[a${k}]`);
    });
    const mix = meta.audio.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${meta.audio.length}:normalize=0:duration=longest,apad,atrim=${fromT}:${toArg ? Math.min(+toArg, meta.dur) : meta.dur},asetpts=PTS-STARTPTS[aout]`;
    await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', ...inputs,
      '-filter_complex', [...filters, mix].join(';'), '-map', '0:v', '-map', '[aout]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', out], { stdio: 'inherit' })
      .on('close', c => c ? rej(new Error('ffmpeg audio ' + c)) : res()));
    fs.unlinkSync(silent);
  } else {
    fs.renameSync(silent, out);
  }
  const mb = (fs.statSync(out).size / 1e6).toFixed(1);
  console.log(`done: ${out} (${meta.w}x${meta.h}, ${fps} fps, ${meta.dur}s, ${mb} MB)`);
})().catch(e => { console.error('RENDER FAILED:', e.message); process.exit(1); });
