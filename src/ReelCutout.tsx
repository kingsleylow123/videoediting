// Variant B — "bottom-left cutout" (ref: kingsleylow.ai Jon Lai reel): full-bleed b-roll / graphics,
// Kingsley cut out of his wall and parked large in the bottom-left, yellow hook title on top,
// white outlined captions mid-screen, a tilted sticker card bottom-right.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, inter, serif, f, SEGS, WORDS, TOTAL, seg, w} from './theme';
import {CARDS, SFX} from './storyboard';
import {GFX, TERMINAL_LINES, DoorBadge} from './gfx';
import {usePop, useT} from './ui';

const JOEY_SRC = (t: number) => t < 20 ? {file: 'broll/joey_a.mp4', at: t} : t < 200 ? {file: 'broll/joey_b.mp4', at: t - 88} : {file: 'broll/joey_c.mp4', at: t - 224};
const JOEY = ['J1', 'J2', 'J3', 'J4'].map(seg);
const inJoey = (t: number) => JOEY.find((s) => t >= s.out && t < s.out + s.dur);
const GZ = {x: 121, y: 300, s: 0.866};   // graphics zone: 968×900 art scaled into the space above the cutout

/* ---------- full-bleed background ---------- */
const Background: React.FC = () => (
  <AbsoluteFill>
    {CARDS.map((c, i) => { const dur = f(c.to - c.from); if (dur <= 0) return null;
      return <Sequence key={i} from={f(c.from)} durationInFrames={dur} layout="none"><Slot c={c} /></Sequence>; })}
    {/* Joey speaking: his footage goes full-bleed behind everything */}
    {JOEY.map((s) => { const j = JOEY_SRC(s.start);
      return <Sequence key={s.id} from={f(s.out)} durationInFrames={f(s.dur) + 1} layout="none">
        <AbsoluteFill><OffthreadVideo src={staticFile(j.file)} startFrom={f(j.at)} muted
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 30%'}} />
          <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.15) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,.35) 100%)'}} /></AbsoluteFill>
      </Sequence>; })}
  </AbsoluteFill>
);

const Slot: React.FC<{c: typeof CARDS[number]}> = ({c}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const lt = frame / fps;
  const inP = spring({frame, fps, config: {damping: 22, stiffness: 240}});
  const Gfx = c.gfx ? GFX[c.gfx] : null; const media = c.kind !== 'gfx';
  return (
    <AbsoluteFill style={{background: C.paper}}>
      {media && <AbsoluteFill style={{opacity: Math.min(1, inP * 1.5)}}>
        {c.kind === 'video' && <OffthreadVideo src={staticFile(c.src!)} startFrom={f(c.at ?? 0)} muted
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos ?? '50% 50%', transform: `scale(${1.05 + lt * .02})`}} />}
        {c.kind === 'image' && <Img src={staticFile(c.src!)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.05 + lt * .02})`}} />}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 60%, rgba(0,0,0,.35) 100%)'}} />
      </AbsoluteFill>}
      {Gfx && <div style={{position: 'absolute', left: GZ.x, top: GZ.y, width: 968, height: 900, transform: `scale(${GZ.s}) translateY(${(1 - inP) * 50}px)`,
        transformOrigin: 'top left', opacity: Math.min(1, inP * 1.6)}}>
        <Sequence from={-f(c.from)} layout="none"><Gfx /></Sequence></div>}
      {c.label && <div style={{position: 'absolute', right: 40, top: 330, background: C.ink, color: C.white, fontFamily: inter, fontWeight: 800,
        fontSize: 28, letterSpacing: 2, padding: '10px 18px'}}>{c.label}</div>}
    </AbsoluteFill>);
};

/* ---------- Kingsley cutout, bottom-left ---------- */
const CUT = {w: 640, h: 1138};   // 720×1280 alpha video at 0.89
const Cutout: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  // slide off-screen while Joey talks, spring back after
  let hide = 0;
  for (const s of JOEY) {
    const a = spring({frame: frame - f(s.out - .1), fps, config: {damping: 20, stiffness: 200}});
    const b = spring({frame: frame - f(s.out + s.dur - .15), fps, config: {damping: 20, stiffness: 200}});
    hide = Math.max(hide, a - b);
  }
  const bob = Math.sin(t * 1.3) * 4;
  return (
    <div style={{position: 'absolute', left: -60 - hide * 700, bottom: -40 + bob, width: CUT.w, height: CUT.h,
      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.35))', zIndex: 10}}>
      {SEGS.filter((s) => s.src === 'th').map((s) => (
        <Sequence key={s.id} from={f(s.out)} durationInFrames={f(s.dur) + 2} layout="none">
          <OffthreadVideo src={staticFile('th_cut.webm')} transparent startFrom={f(s.start)} muted
            style={{position: 'absolute', width: '100%', height: '100%'}} />
        </Sequence>))}
    </div>);
};

/* ---------- yellow hook title ---------- */
const Title: React.FC = () => {
  const p = usePop(0);
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 30}}>
      <div style={{background: '#F2D64B', borderRadius: 26, padding: '18px 34px', textAlign: 'center', fontFamily: inter, fontWeight: 800,
        fontSize: 52, lineHeight: 1.12, color: '#111', boxShadow: '0 12px 30px rgba(0,0,0,.25)', transform: `scale(${p})`, maxWidth: 940}}>
        I Asked Dato' Joey Yap:<br />How Do I Hit RM2M a Year?</div>
    </div>);
};

/* ---------- captions: white, black outline, mid-screen ---------- */
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
const Captions: React.FC = () => {
  const t = useT(); const g = GROUPS.find((x) => t >= x.start && t < x.end);
  const p = usePop(g ? g.start : 0, {damping: 18, stiffness: 300, mass: .5});
  if (!g) return null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1110, textAlign: 'center', zIndex: 25, transform: `scale(${.92 + p * .08})`}}>
      {g.words.map((wd, i) => { const on = t >= wd.start;
        return <span key={i} style={{fontFamily: inter, fontWeight: 800, fontSize: 70, lineHeight: 1.1, margin: '0 9px', display: 'inline-block',
          color: wd.emph ? '#F2D64B' : '#fff', opacity: on ? 1 : .5, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill',
          textShadow: '0 6px 16px rgba(0,0,0,.4)'}}>{wd.text.replace(/,$/, '')}</span>; })}
    </div>);
};

/* ---------- tilted sticker, bottom-right ---------- */
const Starburst: React.FC = () => (
  <svg width="220" height="220" viewBox="-110 -110 220 220">{Array.from({length: 12}).map((_, i) => { const a = i / 12 * Math.PI * 2; const L = i % 2 ? 78 : 96;
    return <line key={i} x1={Math.cos(a) * 16} y1={Math.sin(a) * 16} x2={Math.cos(a) * L} y2={Math.sin(a) * L} stroke="#fff" strokeWidth="17" strokeLinecap="round" />; })}</svg>
);
const STICKERS: {from: number; body: React.ReactNode}[] = [
  {from: w('K1', 'rm2'), body: <><div style={{fontFamily: serif, fontWeight: 900, fontSize: 120, lineHeight: 1}}>RM2M</div><div style={{fontFamily: inter, fontWeight: 800, fontSize: 34}}>PER YEAR GOAL</div></>},
  {from: seg('K4').out, body: <><div style={{fontFamily: serif, fontWeight: 900, fontSize: 110, lineHeight: 1}}>5,000</div><div style={{fontFamily: inter, fontWeight: 800, fontSize: 32}}>MEMBERS · 193 DAYS</div></>},
  {from: seg('K5').out, body: <><div style={{fontFamily: serif, fontWeight: 900, fontSize: 140, lineHeight: 1}}>4</div><div style={{fontFamily: inter, fontWeight: 800, fontSize: 34}}>OPTIONS</div></>},
  {from: w('K6', 'live'), body: <><div style={{fontFamily: 'NotoSC', fontWeight: 900, fontSize: 110, lineHeight: 1}}>生门</div><div style={{fontFamily: inter, fontWeight: 800, fontSize: 34}}>LIVE DOOR</div></>},
  {from: seg('K8').out, body: <><div style={{fontFamily: serif, fontWeight: 900, fontSize: 76, lineHeight: 1.05}}>Separate<br />product</div></>},
  {from: w('K9', 'online'), body: <><div style={{fontFamily: serif, fontWeight: 900, fontSize: 76, lineHeight: 1.05}}>Online<br />courses ✓</div></>},
  {from: seg('K10b').out, body: <><div style={{fontFamily: serif, fontWeight: 900, fontSize: 130, lineHeight: 1}}>13</div><div style={{fontFamily: inter, fontWeight: 800, fontSize: 32}}>WORKSHOPS · KL</div></>},
  {from: seg('K11').out, body: <><div style={{fontFamily: serif, fontWeight: 900, fontSize: 80, lineHeight: 1.05}}>Build the<br />moat</div></>},
  {from: w('K12', 'claude'), body: <Starburst />},
  {from: w('K13', 'comment'), body: <><div style={{fontFamily: inter, fontWeight: 900, fontSize: 40}}>COMMENT</div><div style={{fontFamily: inter, fontWeight: 900, fontSize: 86, letterSpacing: 2}}>CLAUDE</div></>},
];
const Sticker: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const idx = STICKERS.map((s) => s.from).filter((x) => t >= x).length - 1;
  const cur = STICKERS[idx]; const p = spring({frame: frame - f(cur ? cur.from : 0), fps, config: {damping: 11, stiffness: 180, mass: .7}});
  if (!cur || inJoey(t)) return null;
  return (
    <div style={{position: 'absolute', right: 70, top: 1290 + Math.sin(t * 1.6) * 8, width: 400, height: 400, background: C.accent, color: C.white,
      transform: `rotate(${-7 + Math.sin(t) * 1.5}deg) scale(${p})`, boxShadow: '0 30px 60px rgba(0,0,0,.35)', zIndex: 15,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10}}>{cur.body}</div>);
};

/* ---------- sound (same design as the main cut) ---------- */
const procSfx = (): [number, string, number][] => {
  const out: [number, string, number][] = []; const s = seg('K10b').out; const th = w('K10b', '13');
  for (let i = 0; i < 13; i++) out.push([s + (th + .3 - s) * (i / 12), 'tick', .35]);
  const ts = w('K12', 'this');
  TERMINAL_LINES.slice(0, 3).forEach((l) => { for (let k = 0; k < 7; k++) out.push([ts + l.t + k * .075, 'key', .3]); });
  TERMINAL_LINES.slice(3).forEach((l) => out.push([ts + l.t, 'tick', .4]));
  const tc = w('K13', 'comment'); for (let k = 0; k < 6; k++) out.push([tc + .2 + k * .12, 'key', .4]);
  STICKERS.forEach((st) => out.push([st.from, 'pop', .35]));
  return out;
};
const ALL_SFX = [...SFX, ...procSfx()].filter(([t]) => t >= 0 && t < TOTAL);

export const ReelCutout: React.FC = () => {
  const music = (fr: number) => { const t = fr / 30;
    const fade = interpolate(t, [TOTAL - 1.5, TOTAL], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (inJoey(t) ? 0.03 : 0.065) * fade; };
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Background />
      <Sticker />
      <Cutout />
      <Title />
      <Captions />
      <Audio src={staticFile('audio/voice.wav')} />
      <Audio src={staticFile('sfx/music_bed.wav')} volume={music} />
      {ALL_SFX.map(([t, name, v], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.85} /></Sequence>))}
    </AbsoluteFill>);
};
