// v3 "10/10" cut: jackpot hook → full-bleed b-roll/graphics, Kingsley cutout bottom-left (head & shoulders),
// yellow hook title, EN + 中文 captions, whip transitions, camera shake on impacts, one CTA.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, inter, serif, f, PARTS, WORDS, TOTAL, seg, w} from './theme';
import {CARDS, SFX, SHAKES, HOOK} from './storyboard';
import {GFX, TERMINAL_LINES, DoorBadge} from './gfx';
import {usePop, useT, ease, Stamp} from './ui';
import zh from '../data/zh.json';

const CUT_SRC = 'th_cut_v3.webm';
const JOEY_SRC = (t: number) => t < 20 ? {file: 'broll/joey_a.mp4', at: t} : t < 120 ? {file: 'broll/joey_b.mp4', at: t - 88}
  : t < 200 ? {file: 'broll/joey_d.mp4', at: t - 138} : {file: 'broll/joey_c.mp4', at: t - 224};
const JOEY = ['J1', 'J2', 'J5', 'J3', 'J4'].map(seg);
const inJoey = (t: number) => JOEY.find((s) => t >= s.out && t < s.out + s.dur);
const GZ = {x: 121, y: 300, s: 0.866};

/* ================= JACKPOT HOOK (0 → ~2.3s) ================= */
const DOORS = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
const FINAL = [['开门', '休门', '景门'], ['杜门', '生门', '伤门'], ['惊门', '死门', '休门']];   // rows; centre = 生门
const PROMPT = '> how do I hit RM2M/year?';
const Hook: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  if (t > 2.12) return null;
  const typed = Math.max(0, Math.min(PROMPT.length, Math.floor((t - 0.05) / 0.022) + 1));
  const slam = spring({frame: frame - f(1.70), fps, config: {damping: 9, stiffness: 220, mass: .6}});
  const out = ease(t, 1.98, 2.12);
  const STOPS = [1.20, 1.36, 1.52]; const CELL = 290;
  return (
    <AbsoluteFill style={{zIndex: 100, opacity: 1 - out}}>
      {/* phase 1: Claude terminal */}
      {t < 0.68 && <AbsoluteFill style={{background: '#14130F', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontFamily: 'JBMono, monospace', fontSize: 64, color: '#F3EFE6', width: 960}}>
          <div style={{fontSize: 30, color: '#8A857A', marginBottom: 26}}>claude — kingsley</div>
          {PROMPT.slice(0, typed)}<span style={{background: C.accent, opacity: Math.floor(t * 8) % 2 ? 1 : .2}}>&nbsp;</span>
        </div></AbsoluteFill>}
      {/* phase 2: Qi Men 9-grid slot machine */}
      {t >= 0.68 && <AbsoluteFill style={{background: '#14130F'}}>
        <Img src={staticFile('broll/chart.jpg')} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(18px) brightness(.35)'}} />
        <div style={{position: 'absolute', top: 260, left: 0, right: 0, textAlign: 'center', fontFamily: inter, fontWeight: 900, fontSize: 40, letterSpacing: 8, color: '#F2D64B'}}>
          QI MEN CHART · 奇门盘</div>
        <div style={{position: 'absolute', left: (1080 - CELL * 3 - 40) / 2, top: 360, width: CELL * 3 + 40, height: CELL * 3 + 40, background: '#F2D64B', padding: 10,
          display: 'grid', gridTemplateColumns: `repeat(3, ${CELL}px)`, gap: 5, borderRadius: 18, boxShadow: '0 0 80px rgba(242,214,75,.45)',
          transform: `scale(${1 + slam * .04})`}}>
          {[0, 1, 2].map((r) => [0, 1, 2].map((c) => {
            const stop = STOPS[c]; const spinning = t < stop;
            const land = spring({frame: frame - f(stop), fps, config: {damping: 10, stiffness: 300}});
            const label = spinning ? DOORS[(Math.floor(t * 40) + r * 3 + c * 5) % 8] : FINAL[r][c];
            const off = spinning ? ((t * 2600 + c * 97) % CELL) - CELL / 2 : (1 - land) * -40;
            const hit = r === 1 && c === 1 && t >= 1.52;
            const glow = hit ? ease(t, 1.52, 1.68) : 0;
            return <div key={`${r}${c}`} style={{background: hit ? interpolate(glow, [0, 1], [0, 1]) > .5 ? '#E3F6EC' : '#FFFDF6' : '#FFFDF6', overflow: 'hidden', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hit ? `inset 0 0 0 ${8 * glow}px ${C.green}` : 'none'}}>
              <div style={{fontFamily: 'NotoSC, NotoZH, sans-serif', fontWeight: 900, fontSize: 104, color: hit ? C.green : spinning ? '#9A9488' : C.ink,
                transform: `translateY(${off}px)`, filter: spinning ? 'blur(3px)' : 'none'}}>{label}</div>
            </div>; }))}
        </div>
        {t >= 1.52 && <div style={{position: 'absolute', top: 1360, left: 0, right: 0, textAlign: 'center', fontFamily: inter, fontWeight: 900, fontSize: 56,
          color: C.green, opacity: ease(t, 1.52, 1.62), letterSpacing: 4}}>生门 · LIVE DOOR</div>}
      </AbsoluteFill>}
      {/* phase 3: KA-CHING */}
      {t >= 1.66 && <>
        <AbsoluteFill style={{background: '#FFE27A', opacity: Math.max(0, 1 - (t - 1.66) / .18) * .9}} />
        <Coins t0={1.70} />
        <div style={{position: 'absolute', top: 760, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${interpolate(slam, [0, 1], [3, 1])})`, opacity: Math.min(1, slam * 3)}}>
          <div style={{background: '#F2D64B', color: '#111', fontFamily: serif, fontWeight: 900, fontSize: 200, padding: '14px 46px', border: '10px solid #111',
            boxShadow: '0 30px 80px rgba(0,0,0,.6)', letterSpacing: -2}}>RM2,000,000</div></div>
      </>}
    </AbsoluteFill>);
};
const Coins: React.FC<{t0: number}> = ({t0}) => {
  const t = useT() - t0; if (t < 0) return null;
  return <AbsoluteFill>{Array.from({length: 38}).map((_, i) => {
    const a = (i * 137.5) * Math.PI / 180; const v = 900 + (i * 53 % 700); const vx = Math.cos(a) * v * .9; const vy = Math.sin(a) * v - 900;
    const x = 540 + vx * t; const y = 880 + vy * t + 2400 * t * t; const note = i % 4 === 0;
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: note ? 120 : 64, height: note ? 60 : 64, borderRadius: note ? 6 : 99,
      background: note ? '#7FB77E' : 'radial-gradient(circle at 35% 35%, #FFF3A8, #E2B43B 60%, #A9781C)', border: note ? '3px solid #3F7A42' : '3px solid #8C6416',
      transform: `rotate(${i * 40 + t * 600}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: inter, fontWeight: 900, fontSize: note ? 26 : 22, color: note ? '#1E4D20' : '#7A5410'}}>{note ? 'RM100' : 'RM'}</div>; })}</AbsoluteFill>;
};

/* ================= background cards (whip transitions) ================= */
const Background: React.FC = () => (
  <AbsoluteFill>
    {CARDS.map((c, i) => { const dur = f(c.to - c.from); if (dur <= 0) return null;
      return <Sequence key={i} from={f(c.from)} durationInFrames={dur} layout="none"><Slot c={c} dir={i % 2 ? -1 : 1} /></Sequence>; })}
    {JOEY.map((s) => { const j = JOEY_SRC(s.start);
      return <Sequence key={s.id} from={f(s.out)} durationInFrames={f(s.dur) + 1} layout="none"><JoeyBg file={j.file} at={j.at} /></Sequence>; })}
  </AbsoluteFill>
);
const JoeyBg: React.FC<{file: string; at: number}> = ({file, at}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const p = spring({frame, fps, config: {damping: 22, stiffness: 260}});
  return (
    <AbsoluteFill style={{background: '#111', transform: `translateX(${(1 - p) * 1080}px)`, filter: `blur(${(1 - p) * 14}px)`}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 270, bottom: 0, overflow: 'hidden'}}>
        <OffthreadVideo src={staticFile(file)} startFrom={f(at)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '38% 0%', transform: `scale(${1.04 + frame / fps * .015})`, transformOrigin: '38% 10%'}} /></div>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,.55) 100%)'}} />
    </AbsoluteFill>);
};
const Slot: React.FC<{c: typeof CARDS[number]; dir: number}> = ({c, dir}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const lt = frame / fps;
  const p = spring({frame, fps, config: {damping: 24, stiffness: 280}});
  const Gfx = c.gfx ? GFX[c.gfx] : null; const media = c.kind !== 'gfx';
  return (
    <AbsoluteFill style={{background: C.paper, transform: c.from > 0.1 ? `translateX(${(1 - p) * 1080 * dir}px)` : 'none', filter: c.from > 0.1 ? `blur(${(1 - p) * 16}px)` : 'none'}}>
      {media && <AbsoluteFill>
        {c.kind === 'video' && <OffthreadVideo src={staticFile(c.src!)} startFrom={f(c.at ?? 0)} muted
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos ?? '50% 50%', transform: `scale(${1.05 + lt * .02})`}} />}
        {c.kind === 'image' && <Img src={staticFile(c.src!)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + lt * .02})`}} />}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.3) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 55%, rgba(0,0,0,.45) 100%)'}} />
      </AbsoluteFill>}
      {Gfx && <div style={{position: 'absolute', left: GZ.x, top: GZ.y, width: 968, height: 900, transform: `scale(${GZ.s})`, transformOrigin: 'top left'}}>
        <Sequence from={-f(c.from)} layout="none"><Gfx /></Sequence></div>}
      {c.label && <div style={{position: 'absolute', right: 40, top: 330, background: C.ink, color: C.white, fontFamily: inter, fontWeight: 800,
        fontSize: 28, letterSpacing: 2, padding: '10px 18px'}}>{c.label}</div>}
    </AbsoluteFill>);
};

/* overlays on Joey's soundbites */
const JoeyOverlay: React.FC = () => {
  const t = useT(); const J = inJoey(t);
  const p = usePop(J ? J.out + .05 : 0);
  if (!J) return null;
  return (<>
    <div style={{position: 'absolute', left: 40, top: 1420, transform: `translateX(${(1 - p) * -500}px)`, zIndex: 18}}>
      <div style={{background: C.accent, color: C.white, fontFamily: inter, fontWeight: 800, fontSize: 24, letterSpacing: 3, padding: '7px 16px', display: 'inline-block'}}>LIVE · THRIVE 2026</div>
      <div style={{background: C.white, fontFamily: serif, fontWeight: 800, fontSize: 50, padding: '10px 22px', color: C.ink}}>Dato' Joey Yap</div>
    </div>
    <div style={{position: 'absolute', inset: 0, zIndex: 18}}>
      {J.id === 'J1' && <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center'}}><DoorBadge at={w('J1', 'powerful')} good big /></div>}
      {J.id === 'J2' && <Stamp at={w('J2', 'won')} text="WON'T LAST LONG" color={C.red} size={80} style={{top: '36%'}} />}
      {J.id === 'J5' && <Stamp at={w('J5', 'separate')} text="A SEPARATE PRODUCT" color={C.accent} size={70} rot={-5} style={{top: '36%'}} />}
      {J.id === 'J3' && <Stamp at={w('J3', 'do')} text="DO THE COURSE FIRST" color={C.accent} size={70} style={{top: '36%'}} />}
    </div>
  </>);
};

/* ================= Kingsley cutout: head & shoulders, bottom-left ================= */
const CUT = {w: 675, h: 1200};   // 720×1280 alpha source at 0.94; chin (~74% of frame) lands ~60px above the bottom edge
const Cutout: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  let hide = 1 - spring({frame: frame - f(HOOK - .15), fps, config: {damping: 18, stiffness: 200}});   // enters on "Boom"
  for (const s of JOEY) {
    const a = spring({frame: frame - f(s.out - .1), fps, config: {damping: 20, stiffness: 200}});
    const b = spring({frame: frame - f(s.out + s.dur - .15), fps, config: {damping: 20, stiffness: 200}});
    hide = Math.max(hide, a - b);
  }
  return (
    <div style={{position: 'absolute', left: -70 - hide * 800, top: 1920 - CUT.h * 0.80 + Math.sin(t * 1.3) * 4, width: CUT.w, height: CUT.h,
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.35))', zIndex: 10}}>
      {PARTS.filter((s) => s.src === 'th').map((s, i) => (
        <Sequence key={i} from={f(s.out)} durationInFrames={f(s.dur) + 1} layout="none">
          <OffthreadVideo src={staticFile(CUT_SRC)} transparent startFrom={f(s.start)} muted style={{position: 'absolute', width: '100%', height: '100%'}} />
        </Sequence>))}
    </div>);
};

const Title: React.FC = () => {
  const t = useT(); const p = usePop(HOOK + .1);
  if (t < HOOK) return null;
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30}}>
      <div style={{background: '#F2D64B', borderRadius: 26, padding: '18px 34px', textAlign: 'center', fontFamily: inter, fontWeight: 800,
        fontSize: 52, lineHeight: 1.12, color: '#111', boxShadow: '0 12px 30px rgba(0,0,0,.25)', transform: `translateY(${(1 - p) * -300}px)`, maxWidth: 940}}>
        I Asked Dato' Joey Yap:<br />How Do I Hit RM2M a Year?</div>
    </div>);
};

/* ================= captions: EN (white, black outline) + 中文 line ================= */
type Grp = {words: typeof WORDS; start: number; end: number};
const GROUPS: Grp[] = (() => {
  const out: Grp[] = []; let cur: typeof WORDS = [];
  const flush = () => { if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end}); cur = []; };
  WORDS.forEach((wd, i) => { const prev = WORDS[i - 1];
    if (cur.length && (wd.seg !== prev.seg || wd.start - prev.end > .3 || cur.length >= 4 || cur.map((x) => x.text).join(' ').length + wd.text.length > 22)) flush();
    cur.push(wd); if (/[.,?!]$/.test(wd.text)) flush(); });
  flush(); out.forEach((g, i) => { g.end = out[i + 1] ? Math.min(out[i + 1].start, g.end + .4) : g.end + .6; });
  return out;
})();
const cap = (s: string, first: boolean) => first ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const Captions: React.FC = () => {
  const t = useT(); const g = GROUPS.find((x) => t >= x.start && t < x.end);
  const z = (zh as {start: number; end: number; text: string}[]).find((x) => t >= x.start && t < x.end);
  const p = usePop(g ? g.start : 0, {damping: 18, stiffness: 300, mass: .5});
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1090, textAlign: 'center', zIndex: 25}}>
      {g && <div style={{transform: `scale(${.92 + p * .08})`}}>{g.words.map((wd, i) => { const on = t >= wd.start;
        const segStart = WORDS.findIndex((x) => x.seg === wd.seg) === WORDS.indexOf(wd);
        return <span key={i} style={{fontFamily: inter, fontWeight: 800, fontSize: 70, lineHeight: 1.1, margin: '0 9px', display: 'inline-block',
          color: wd.emph ? '#F2D64B' : '#fff', opacity: on ? 1 : .5, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill',
          textShadow: '0 6px 16px rgba(0,0,0,.4)'}}>{cap(wd.text.replace(/,$/, ''), segStart)}</span>; })}</div>}
      {z && <div style={{marginTop: 10, fontFamily: 'NotoZH, NotoSC, sans-serif', fontWeight: 800, fontSize: 44, color: '#fff', lineHeight: 1.25,
        WebkitTextStroke: '8px #000', paintOrder: 'stroke fill', padding: '0 30px'}}>{z.text}</div>}
    </div>);
};

/* ================= sticker bottom-right ================= */
const Starburst: React.FC = () => (
  <svg width="220" height="220" viewBox="-110 -110 220 220">{Array.from({length: 12}).map((_, i) => { const a = i / 12 * Math.PI * 2; const L = i % 2 ? 78 : 96;
    return <line key={i} x1={Math.cos(a) * 16} y1={Math.sin(a) * 16} x2={Math.cos(a) * L} y2={Math.sin(a) * L} stroke="#fff" strokeWidth="17" strokeLinecap="round" />; })}</svg>
);
const big = (a: string, b?: string, size = 120) => <><div style={{fontFamily: serif, fontWeight: 900, fontSize: size, lineHeight: 1.02}}>{a}</div>
  {b && <div style={{fontFamily: inter, fontWeight: 800, fontSize: 32, letterSpacing: 1}}>{b}</div>}</>;
const STICKERS: {from: number; body: React.ReactNode}[] = [
  {from: w('K1', 'rm2'), body: big('RM2M', 'PER YEAR GOAL')},
  {from: seg('K4').out, body: big('5,000', 'MEMBERS · 193 DAYS', 110)},
  {from: seg('K5').out, body: big('4', 'OPTIONS', 150)},
  {from: w('K6', 'live'), body: <><div style={{fontFamily: 'NotoSC', fontWeight: 900, fontSize: 110, lineHeight: 1}}>生门</div><div style={{fontFamily: inter, fontWeight: 800, fontSize: 34}}>LIVE DOOR</div></>},
  {from: seg('K9').out, body: big('Online courses ✓', undefined, 74)},
  {from: seg('K10b').out, body: big('13', 'WORKSHOPS · KL', 130)},
  {from: seg('K11').out, body: big('Build the moat', undefined, 80)},
  {from: w('K12', 'claude'), body: <Starburst />},
  {from: w('K13', 'comment'), body: <><div style={{fontFamily: inter, fontWeight: 900, fontSize: 40}}>COMMENT</div><div style={{fontFamily: inter, fontWeight: 900, fontSize: 86, letterSpacing: 2}}>CLAUDE</div></>},
];
const Sticker: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const cur = STICKERS.filter((s) => t >= s.from).pop();
  const p = spring({frame: frame - f(cur ? cur.from : 0), fps, config: {damping: 11, stiffness: 180, mass: .7}});
  if (!cur || inJoey(t) || t < HOOK) return null;
  return (
    <div style={{position: 'absolute', right: 60, top: 1330 + Math.sin(t * 1.6) * 8, width: 380, height: 380, background: C.accent, color: C.white,
      transform: `rotate(${-7 + Math.sin(t) * 1.5}deg) scale(${p})`, boxShadow: '0 30px 60px rgba(0,0,0,.35)', zIndex: 15, padding: 20,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10}}>{cur.body}</div>);
};

/* ================= camera shake ================= */
const useShake = () => {
  const t = useT(); let x = 0, y = 0, r = 0;
  for (const [s, k] of SHAKES) { const d = t - s; if (d >= 0 && d < .4) { const e = (1 - d / .4) ** 2 * k;
    x += Math.sin(d * 90) * 22 * e; y += Math.cos(d * 77) * 18 * e; r += Math.sin(d * 60) * .8 * e; } }
  return `translate(${x}px, ${y}px) rotate(${r}deg)`;
};

const procSfx = (): [number, string, number][] => {
  const o: [number, string, number][] = []; const s = seg('K10b').out; const th = w('K10b', '13');
  for (let i = 0; i < 13; i++) o.push([s + (th + .3 - s) * (i / 12), 'tick', .35]);
  const ts = w('K12', 'this');
  TERMINAL_LINES.slice(0, 3).forEach((l) => { for (let k = 0; k < 7; k++) o.push([ts + l.t + k * .075, `mkey${k % 3}`, .4]); });
  TERMINAL_LINES.slice(3).forEach((l) => o.push([ts + l.t, 'tick', .4]));
  const tc = w('K13', 'comment'); for (let k = 0; k < 6; k++) o.push([tc + .2 + k * .12, `mkey${k % 3}`, .5]);
  STICKERS.forEach((st) => o.push([st.from, 'pop', .3]));
  return o;
};
const ALL_SFX = [...SFX, ...procSfx()].filter(([t]) => t >= 0 && t < TOTAL);

export const ReelV3: React.FC = () => {
  const shake = useShake();
  const music = (fr: number) => { const t = fr / 30; if (t < HOOK) return 0;
    const fade = interpolate(t, [TOTAL - 1.5, TOTAL], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (inJoey(t) ? 0.022 : 0.05) * fade * Math.min(1, (t - HOOK) / .3); };
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{transform: shake, background: C.paper}}>
        <Background />
        <JoeyOverlay />
        <Sticker />
        <Cutout />
        <Title />
        <Captions />
        <Hook />
      </AbsoluteFill>
      <Audio src={staticFile('audio/voice.wav')} />
      <Sequence from={f(HOOK)} layout="none"><Audio src={staticFile('sfx/music_bed.wav')} volume={(fr) => music(fr + f(HOOK))} /></Sequence>
      {ALL_SFX.map(([t, name, v], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={70} layout="none"><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.85} /></Sequence>))}
    </AbsoluteFill>);
};

/* ================= cover frame ================= */
export const Cover: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={staticFile('broll/photo2.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.42) blur(10px)'}} />
    <div style={{position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#F2D64B', borderRadius: 30, padding: '26px 40px', textAlign: 'center', fontFamily: inter, fontWeight: 900, fontSize: 84, lineHeight: 1.05, color: '#111', maxWidth: 980}}>
        I Asked Dato' Joey Yap How to Hit <span style={{color: C.accent}}>RM2M</span></div></div>
    <div style={{position: 'absolute', right: 70, top: 660, width: 430, background: '#fff', padding: 14, paddingBottom: 70, transform: 'rotate(5deg)', boxShadow: '0 30px 60px rgba(0,0,0,.5)'}}>
      <Img src={staticFile('broll/cover_joey.jpg')} style={{width: 402, height: 500, objectFit: 'cover'}} />
      <div style={{position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 40}}>Dato' Joey Yap</div></div>
    <Img src={staticFile('broll/cover_me.png')} style={{position: 'absolute', left: -70, top: 1920 - 1200 * .8, width: 675, height: 1200, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.5))'}} />
    <div style={{position: 'absolute', right: 60, top: 1330, width: 380, height: 260, background: C.accent, color: '#fff', transform: 'rotate(-7deg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 60px rgba(0,0,0,.4)'}}>
      <div style={{fontFamily: 'NotoSC', fontWeight: 900, fontSize: 100, lineHeight: 1}}>生门</div><div style={{fontFamily: inter, fontWeight: 900, fontSize: 36}}>LIVE DOOR</div></div>
  </AbsoluteFill>
);
