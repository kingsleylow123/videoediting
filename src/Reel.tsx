import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, inter, f, SEGS, WORDS, TOTAL, seg, w} from './theme';
import {CARDS, SFX} from './storyboard';
import {GFX, TERMINAL_LINES} from './gfx';
import {usePop, useT} from './ui';

// Light style Joshua layout: graphics y=0–1080, speaker full-width below, captions on the seam
const SEAM = 1080;
const AREA = {x: 56, y: 110, w: 968, h: 900};

// Joey's Q&A lives in three trimmed proxies; map source seconds → (file, offset)
const JOEY_SRC = (t: number) => t < 20 ? {file: 'broll/joey_a.mp4', at: t} : t < 200 ? {file: 'broll/joey_b.mp4', at: t - 88} : {file: 'broll/joey_c.mp4', at: t - 224};

/* hard-cut punch-ins: toggle 100% ↔ 118% on segment and sentence starts, ≥2.4s apart, ≤6s apart */
const CUTS: {t: number; z: number}[] = (() => {
  const cand = new Set<number>();
  SEGS.forEach((s) => cand.add(s.out));
  WORDS.forEach((wd, i) => { if (i && /[.?!]$/.test(WORDS[i - 1].text)) cand.add(wd.start); if (wd.emph) cand.add(wd.start); });
  const ts = [...cand].sort((a, b) => a - b); const out: {t: number; z: number}[] = []; let last = -9; let z = 1;
  const starts = WORDS.map((x) => x.start);
  ts.forEach((t) => {
    while (t - last > 6) { const fill = starts.find((s) => s > last + 3.5); if (!fill || fill >= t) break; z = z === 1 ? 1.18 : 1; out.push({t: fill, z}); last = fill; }
    if (t - last >= 2.4) { z = z === 1 ? 1.18 : 1; out.push({t, z}); last = t; }
  });
  return out;
})();
const zoomAt = (t: number) => { let z = 1; for (const c of CUTS) if (t >= c.t) z = c.z; return z; };

// Kingsley's selfie is a close-up (hair→chin ≈ 55% of frame height), so it is shown at 72% scale
// on a wall-coloured panel with feathered edges to keep the whole face + mouth in the 840px panel.
const TH_SCALE = 0.72; const WALL = '#D4D4CF';
const Speaker: React.FC = () => {
  const t = useT(); const z = zoomAt(t) * (1 + 0.008 * Math.sin(t * 0.7)); const H = 1920 - SEAM;
  return (
    <div style={{position: 'absolute', left: 0, top: SEAM, width: 1080, height: H, overflow: 'hidden', background: WALL}}>
      {SEGS.map((s) => {
        const j = s.src === 'joey' ? JOEY_SRC(s.start) : null;
        const vw = 1080 * TH_SCALE; const vh = 1920 * TH_SCALE;
        return (
          <Sequence key={s.id} from={f(s.out)} durationInFrames={f(s.dur) + 2} layout="none">
            {j ? <OffthreadVideo src={staticFile(j.file)} startFrom={f(j.at)} muted
              style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '42% 0%',
                transform: `scale(${z})`, transformOrigin: '42% 20%'}} />
              : <OffthreadVideo src={staticFile('th.mp4')} startFrom={f(s.start)} muted
              style={{position: 'absolute', left: (1080 - vw) / 2, top: -0.13 * vh, width: vw, height: vh,
                transform: `scale(${z})`, transformOrigin: `50% ${(0.13 * vh + H * .45) / vh * 100}%`,
                WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%)'}} />}
          </Sequence>);
      })}
      <SpeakerTag />
    </div>);
};

const SpeakerTag: React.FC = () => {
  const t = useT(); const J = ['J1', 'J2', 'J3', 'J4'].map(seg).find((s) => t >= s.out && t < s.out + s.dur);
  const k1 = t < seg('K2').out;
  const p = usePop(J ? J.out : 0.3);
  if (!J && !k1) return null;
  return (
    <div style={{position: 'absolute', left: 40, top: 96, transform: `translateX(${(1 - p) * -400}px)`}}>
      <div style={{background: C.ink, color: C.white, fontFamily: inter, fontWeight: 800, fontSize: 30, letterSpacing: 2, padding: '10px 18px'}}>
        {J ? "DATO' JOEY YAP" : 'KINGSLEY LOW'}</div>
      <div style={{background: C.accent, color: C.white, fontFamily: inter, fontWeight: 800, fontSize: 22, letterSpacing: 2, padding: '6px 18px', display: 'inline-block'}}>
        {J ? 'LIVE AT THRIVE 2026' : 'FOUNDER, CLAUDE MALAYSIA'}</div>
    </div>);
};

const Graphics: React.FC = () => (
  <div style={{position: 'absolute', left: AREA.x, top: AREA.y, width: AREA.w, height: AREA.h}}>
    {CARDS.map((c, i) => {
      const dur = f(c.to - c.from); if (dur <= 0) return null;
      return <Sequence key={i} from={f(c.from)} durationInFrames={dur} layout="none"><CardSlot c={c} /></Sequence>;
    })}
  </div>
);

const CardSlot: React.FC<{c: typeof CARDS[number]}> = ({c}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const lt = frame / fps;
  const inP = spring({frame, fps, config: {damping: 22, stiffness: 260}});   // snap / slide reveal
  const Gfx = c.gfx ? GFX[c.gfx] : null; const framed = c.kind !== 'gfx';
  return (
    <AbsoluteFill style={{opacity: Math.min(1, inP * 1.6), transform: `translateY(${(1 - inP) * 50}px)`}}>
      {framed && <div style={{position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', background: C.white,
        border: `10px solid ${C.white}`, boxShadow: '0 30px 70px rgba(26,26,26,.18)'}}>
        {c.kind === 'video' && <OffthreadVideo src={staticFile(c.src!)} startFrom={f(c.at ?? 0)} muted
          style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos ?? '50% 50%', borderRadius: 18, transform: `scale(${1.04 + lt * .015})`}} />}
        {c.kind === 'image' && <Img src={staticFile(c.src!)} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18, transform: `scale(${1.04 + lt * .015})`}} />}
      </div>}
      {Gfx && <AbsoluteFill style={{borderRadius: framed ? 28 : 0, overflow: 'hidden'}}><Sequence from={-f(c.from)} layout="none"><Gfx /></Sequence></AbsoluteFill>}
      {c.label && <div style={{position: 'absolute', left: 34, bottom: 34, background: C.ink, color: C.white, fontFamily: inter, fontWeight: 800,
        fontSize: 28, letterSpacing: 2, padding: '10px 18px'}}>{c.label}</div>}
    </AbsoluteFill>);
};

/* ---------- captions: ALL CAPS white in sharp black boxes on the seam ---------- */
type Grp = {words: typeof WORDS; start: number; end: number};
const GROUPS: Grp[] = (() => {
  const out: Grp[] = []; let cur: typeof WORDS = [];
  const flush = () => { if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end}); cur = []; };
  WORDS.forEach((wd, i) => {
    const prev = WORDS[i - 1];
    if (cur.length && (wd.seg !== prev.seg || wd.start - prev.end > .3 || cur.length >= 3 ||
      cur.map((x) => x.text).join(' ').length + wd.text.length > 16)) flush();
    cur.push(wd); if (/[.,?!]$/.test(wd.text)) flush();
  });
  flush();
  out.forEach((g, i) => { g.end = out[i + 1] ? Math.min(out[i + 1].start, g.end + .4) : g.end + .6; });
  return out;
})();

const Captions: React.FC = () => {
  const t = useT(); const g = GROUPS.find((x) => t >= x.start && t < x.end);
  if (!g) return null;
  const text = g.words.map((x) => x.text.replace(/[,.]$/, '')).join(' ').toUpperCase();
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: SEAM - 44, display: 'flex', justifyContent: 'center', zIndex: 20}}>
      <div style={{background: '#000', color: '#fff', fontFamily: inter, fontWeight: 800, fontSize: 58, letterSpacing: .5, lineHeight: 1.12,
        padding: '12px 24px', textAlign: 'center', maxWidth: 940}}>{text}</div>
    </div>);
};

/* ---------- sound ---------- */
const procSfx = (): [number, string, number][] => {
  const out: [number, string, number][] = [];
  const s = seg('K10b').out; const th = w('K10b', '13');
  for (let i = 0; i < 13; i++) out.push([s + (th + .3 - s) * (i / 12), 'tick', .35]);
  const ts = w('K12', 'this');
  TERMINAL_LINES.slice(0, 3).forEach((l) => { for (let k = 0; k < 7; k++) out.push([ts + l.t + k * .075, 'key', .3]); });
  TERMINAL_LINES.slice(3).forEach((l) => out.push([ts + l.t, 'tick', .4]));
  const tc = w('K13', 'comment'); for (let k = 0; k < 6; k++) out.push([tc + .2 + k * .12, 'key', .4]);
  return out;
};
const ALL_SFX = [...SFX, ...procSfx()].filter(([t]) => t >= 0 && t < TOTAL);
const JOEY = ['J1', 'J2', 'J3', 'J4'].map(seg);

export const Reel: React.FC = () => {
  const music = (fr: number) => {
    const t = fr / 30; const inJ = JOEY.some((s) => t >= s.out - .2 && t < s.out + s.dur + .1);
    const fadeOut = interpolate(t, [TOTAL - 1.5, TOTAL], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (inJ ? 0.03 : 0.065) * fadeOut;
  };
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Graphics />
      <Speaker />
      <Captions />
      <Audio src={staticFile('audio/voice.wav')} />
      <Audio src={staticFile('sfx/music_bed.wav')} volume={music} />
      {ALL_SFX.map(([t, name, v], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.85} /></Sequence>))}
    </AbsoluteFill>);
};
