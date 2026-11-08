// Version A final: Light style Joshua split (graphics y=0–1080, speaker below, seam captions),
// v3 trims, receipt-print hook with Claude Malaysia × Joey Yap × Thrive 2027 logo slam, pro SFX mix.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, inter, serif, mono, f, PARTS, WORDS, TOTAL, seg, w, HOOK} from './theme';
import {GFX, TERMINAL_LINES} from './gfx';
import {usePop, useT, ease} from './ui';

const SEAM = 1080; const AREA = {x: 56, y: 110, w: 968, h: 900};
const JOEY_SRC = (t: number) => t < 20 ? {file: 'broll/joey_a.mp4', at: t} : t < 120 ? {file: 'broll/joey_b.mp4', at: t - 88}
  : t < 200 ? {file: 'broll/joey_d.mp4', at: t - 138} : {file: 'broll/joey_c.mp4', at: t - 224};
const JOEY = ['J1', 'J2', 'J5', 'J3', 'J4'].map(seg);
const inJoey = (t: number) => JOEY.find((s) => t >= s.out && t < s.out + s.dur);

type Card = {from: number; to: number; kind: 'video' | 'image' | 'gfx'; src?: string; at?: number; label?: string; gfx?: string; pos?: string};
const CARDS: Card[] = [
  {from: HOOK - .2, to: seg('K2').out, kind: 'gfx', gfx: 'hook'},
  {from: seg('K2').out, to: w('K2', "carina's"), kind: 'video', src: 'broll/v2265.mp4', at: 0.3, label: 'THRIVE 2027 · YEAR 2'},
  {from: w('K2', "carina's"), to: seg('K2b').out, kind: 'video', src: 'broll/IMG_3800.mp4', at: 0.6, label: "WITH CARINA'S GROUP"},
  {from: seg('K2b').out, to: seg('K4').out, kind: 'video', src: 'broll/v2353.mp4', at: 5.4, label: 'MY QUESTION, TYPED BEFORE THE MIC', gfx: 'question'},
  {from: seg('K4').out, to: seg('K5').out, kind: 'gfx', gfx: 'community'},
  {from: seg('K5').out, to: seg('K6').out, kind: 'gfx', gfx: 'options'},
  {from: seg('K6').out, to: seg('J1').out, kind: 'video', src: 'broll/a0ce.mp4', at: 2, gfx: 'livedoor', label: 'MY QI MEN CHART'},
  {from: seg('J1').out, to: seg('K7').out, kind: 'gfx', gfx: 'J1'},
  {from: seg('K7').out, to: seg('J2').out, kind: 'gfx', gfx: 'doors'},
  {from: seg('J2').out, to: seg('J5').out, kind: 'gfx', gfx: 'J2'},
  {from: seg('J5').out, to: seg('K9').out, kind: 'gfx', gfx: 'J5'},
  {from: seg('K9').out, to: seg('J3').out, kind: 'gfx', gfx: 'options-pick'},
  {from: seg('J3').out, to: seg('K10b').out, kind: 'gfx', gfx: 'J3'},
  {from: seg('K10b').out, to: seg('K10c').out, kind: 'gfx', gfx: 'workshops'},
  {from: seg('K10c').out, to: seg('K11').out, kind: 'gfx', gfx: 'ecosystem'},
  {from: seg('K11').out, to: seg('K12').out, kind: 'gfx', gfx: 'moat'},
  {from: seg('K12').out, to: seg('J4').out, kind: 'gfx', gfx: 'terminal'},
  {from: seg('J4').out, to: seg('K13').out, kind: 'gfx', gfx: 'J4'},
  {from: seg('K13').out, to: w('K13', 'comment'), kind: 'gfx', gfx: 'goal'},
  {from: w('K13', 'comment'), to: TOTAL, kind: 'gfx', gfx: 'comment'},
];

/* ================= RECEIPT HOOK (0 → HOOK) ================= */
const Q = 'Q: HOW DO I HIT RM2M/YR?';
const R = {qStart: .5, qStep: .022, lines: [.06, .26, .38, 1.08, 1.2, 1.32], kaching: 1.42, slam: 1.78};
const Dash = () => <div style={{borderTop: '4px dashed #BDB6A8', margin: '18px 0'}} />;
const ReceiptHook: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  if (t > HOOK + .05) return null;
  const shown = (i: number) => t >= R.lines[i];
  const typed = Math.max(0, Math.min(Q.length, Math.floor((t - R.qStart) / R.qStep) + 1));
  const nShown = R.lines.filter((x) => t >= x).length + (t >= R.qStart ? 1 : 0);
  const paper = 260 + nShown * 150;                                       // receipt feeds out as lines print
  const slam = spring({frame: frame - f(R.slam), fps, config: {damping: 14, stiffness: 340, mass: .55}});
  const kp = spring({frame: frame - f(R.kaching), fps, config: {damping: 9, stiffness: 260, mass: .5}});
  const exit = ease(t, HOOK - .22, HOOK);
  const after = t >= R.slam;
  return (
    <AbsoluteFill style={{zIndex: 100, background: C.paper, transform: `translateY(${-exit * 1920}px)`}}>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${C.line} 2px, transparent 2px)`, backgroundSize: '36px 36px', opacity: .7}} />
      {/* printer slot */}
      <div style={{position: 'absolute', left: 110, right: 110, top: 330, height: 54, background: C.ink, borderRadius: 14, zIndex: 3, boxShadow: '0 10px 30px rgba(0,0,0,.3)'}}>
        <div style={{position: 'absolute', left: 30, right: 30, top: 22, height: 10, background: '#000', borderRadius: 5}} /></div>
      {/* receipt */}
      <div style={{position: 'absolute', left: 90, width: 900, top: 360, height: Math.min(paper, 1400), overflow: 'hidden', zIndex: 2,
        filter: after ? `blur(${slam * 10}px)` : 'none', opacity: after ? 1 - Math.min(1, slam * 1.4) : 1, transform: `scale(${after ? 1 - slam * .08 : 1})`}}>
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, background: '#FFFEFA', padding: '46px 56px 80px', fontFamily: mono, color: C.ink,
          boxShadow: '0 30px 60px rgba(0,0,0,.18)', WebkitMaskImage: 'linear-gradient(#000 calc(100% - 22px), transparent calc(100% - 22px)), repeating-linear-gradient(135deg, #000 0 16px, transparent 16px 32px)'}}>
          {shown(0) && <div style={{background: '#16151A', borderRadius: 16, padding: 10, display: 'flex', justifyContent: 'center'}}>
            <Img src={staticFile('brand/thrive_2027.jpg')} style={{width: 700, borderRadius: 10}} /></div>}
          {shown(1) && <div style={{textAlign: 'center', fontSize: 36, letterSpacing: 4, marginTop: 22, fontWeight: 700}}>CLAUDE MALAYSIA × THRIVE 2027</div>}
          {shown(2) && <><Dash /><div style={{display: 'flex', alignItems: 'center', gap: 22, fontSize: 38}}>
            <Img src={staticFile('brand/joey_photo.jpg')} style={{width: 110, height: 110, borderRadius: 99, objectFit: 'cover', objectPosition: '50% 20%'}} />
            <div>LIVE Q&A WITH<br /><b style={{fontSize: 46}}>DATO' JOEY YAP</b></div></div></>}
          {t >= R.qStart && <div style={{fontSize: 48, marginTop: 30, fontWeight: 700, whiteSpace: 'pre'}}>{Q.slice(0, typed)}{typed < Q.length && <span style={{background: C.accent}}> </span>}</div>}
          {shown(3) && <div style={{fontSize: 48, marginTop: 18, display: 'flex', alignItems: 'center', gap: 14}}>A: <span style={{background: C.ink, height: 44, width: 400, display: 'inline-block'}} /> <span style={{fontSize: 30, color: C.mute}}>(WATCH)</span></div>}
          {shown(4) && <Dash />}
          {shown(5) && <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 700}}>
            <span style={{fontSize: 46}}>TOTAL</span>
            <span style={{fontFamily: serif, fontWeight: 900, fontSize: 100, color: t >= R.kaching ? C.accent : C.ink, transform: `scale(${t >= R.kaching ? 1 + (1 - kp) * .4 : 1})`, display: 'inline-block', transformOrigin: 'right center'}}>RM2,000,000</span></div>}
          {shown(5) && <div style={{textAlign: 'center', fontSize: 28, color: C.mute, marginTop: 16, letterSpacing: 3}}>* PER YEAR · DAY 193 *</div>}
        </div>
      </div>
      {/* ka-ching flash */}
      {t >= R.kaching && t < R.kaching + .25 && <AbsoluteFill style={{background: '#FFF4C2', opacity: (1 - (t - R.kaching) / .25) * .7, zIndex: 4}} />}
      {/* logo lockup slam */}
      {after && <div style={{position: 'absolute', left: 0, right: 0, top: 520, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28,
        transform: `scale(${interpolate(slam, [0, 1], [1.9, 1])})`, opacity: Math.min(1, slam * 3)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <Img src={staticFile('brand/claude_my.jpg')} style={{width: 250, height: 250, borderRadius: 40, boxShadow: '0 20px 50px rgba(0,0,0,.3)'}} />
          <div style={{fontFamily: inter, fontWeight: 900, fontSize: 90, color: C.ink}}>×</div>
          <Img src={staticFile('brand/joey_photo.jpg')} style={{width: 250, height: 250, borderRadius: 999, objectFit: 'cover', objectPosition: '50% 18%', border: `8px solid ${C.white}`, boxShadow: '0 20px 50px rgba(0,0,0,.3)'}} />
        </div>
        <div style={{background: '#16151A', borderRadius: 22, padding: 12, boxShadow: '0 30px 70px rgba(0,0,0,.4)'}}>
          <Img src={staticFile('brand/thrive_2027.jpg')} style={{width: 860, borderRadius: 14, display: 'block'}} /></div>
        <div style={{fontFamily: serif, fontWeight: 800, fontSize: 76, color: C.ink, textAlign: 'center', lineHeight: 1.1}}>The <i style={{color: C.accent}}>RM2,000,000</i> question.</div>
      </div>}
    </AbsoluteFill>);
};

/* ================= main layout ================= */
const TH_SCALE = 0.72; const WALL = '#D4D4CF';
const CUTS: {t: number; z: number}[] = (() => {
  const cand = new Set<number>(); PARTS.forEach((s) => cand.add(s.out));
  WORDS.forEach((wd, i) => { if (i && /[.?!]$/.test(WORDS[i - 1].text)) cand.add(wd.start); if (wd.emph) cand.add(wd.start); });
  const ts = [...cand].sort((a, b) => a - b); const out: {t: number; z: number}[] = []; let last = -9; let z = 1; const starts = WORDS.map((x) => x.start);
  ts.forEach((t) => { while (t - last > 6) { const fill = starts.find((s) => s > last + 3.5); if (!fill || fill >= t) break; z = z === 1 ? 1.18 : 1; out.push({t: fill, z}); last = fill; }
    if (t - last >= 2.4) { z = z === 1 ? 1.18 : 1; out.push({t, z}); last = t; } });
  return out;
})();
const zoomAt = (t: number) => { let z = 1; for (const c of CUTS) if (t >= c.t) z = c.z; return z; };

const Speaker: React.FC = () => {
  const t = useT(); const z = zoomAt(t) * (1 + 0.008 * Math.sin(t * 0.7)); const H = 1920 - SEAM; const vw = 1080 * TH_SCALE; const vh = 1920 * TH_SCALE;
  return (
    <div style={{position: 'absolute', left: 0, top: SEAM, width: 1080, height: H, overflow: 'hidden', background: WALL}}>
      {PARTS.map((s, i) => { const j = s.src === 'joey' ? JOEY_SRC(s.start) : null;
        return <Sequence key={i} from={f(s.out)} durationInFrames={f(s.dur) + 1} layout="none">
          {j ? <OffthreadVideo src={staticFile(j.file)} startFrom={f(j.at)} muted style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: '40% 8%', transform: `scale(${z})`, transformOrigin: '40% 25%'}} />
            : <OffthreadVideo src={staticFile('th.mp4')} startFrom={f(s.start)} muted style={{position: 'absolute', left: (1080 - vw) / 2, top: -0.13 * vh, width: vw, height: vh,
              transform: `scale(${z})`, transformOrigin: `50% ${(0.13 * vh + H * .45) / vh * 100}%`, filter: 'contrast(1.06) saturate(1.1) sepia(.05)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 9%, #000 91%, transparent 100%)'}} />}
        </Sequence>; })}
      <Tag />
    </div>);
};
const Tag: React.FC = () => {
  const t = useT(); const J = inJoey(t); const k1 = t >= HOOK && t < seg('K2').out; const p = usePop(J ? J.out : HOOK + .2);
  if (!J && !k1) return null;
  return (
    <div style={{position: 'absolute', left: 40, top: 96, display: 'flex', alignItems: 'center', gap: 14, transform: `translateX(${(1 - p) * -500}px)`}}>
      <Img src={staticFile(J ? 'brand/joey_photo.jpg' : 'brand/claude_my.jpg')} style={{width: 84, height: 84, borderRadius: J ? 99 : 16, objectFit: 'cover', objectPosition: '50% 18%', border: '4px solid #fff'}} />
      <div><div style={{background: C.ink, color: C.white, fontFamily: inter, fontWeight: 800, fontSize: 30, letterSpacing: 2, padding: '8px 16px'}}>{J ? "DATO' JOEY YAP" : 'KINGSLEY LOW'}</div>
        <div style={{background: C.accent, color: C.white, fontFamily: inter, fontWeight: 800, fontSize: 22, letterSpacing: 2, padding: '5px 16px', display: 'inline-block'}}>{J ? 'LIVE AT THRIVE 2027' : 'FOUNDER, CLAUDE MALAYSIA'}</div></div>
    </div>);
};

const Graphics: React.FC = () => (
  <div style={{position: 'absolute', left: AREA.x, top: AREA.y, width: AREA.w, height: AREA.h}}>
    {CARDS.map((c, i) => { const dur = f(c.to - c.from); if (dur <= 0) return null;
      return <Sequence key={i} from={f(c.from)} durationInFrames={dur} layout="none"><CardSlot c={c} /></Sequence>; })}
  </div>
);
const CardSlot: React.FC<{c: Card}> = ({c}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const lt = frame / fps;
  const inP = spring({frame, fps, config: {damping: 22, stiffness: 260}}); const Gfx = c.gfx ? GFX[c.gfx] : null; const framed = c.kind !== 'gfx';
  return (
    <AbsoluteFill style={{opacity: Math.min(1, inP * 1.6), transform: `translateY(${(1 - inP) * 50}px)`}}>
      {framed && <div style={{position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', background: C.white, border: `10px solid ${C.white}`, boxShadow: '0 30px 70px rgba(26,26,26,.18)'}}>
        {c.kind === 'video' && <OffthreadVideo src={staticFile(c.src!)} startFrom={f(c.at ?? 0)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos ?? '50% 50%', borderRadius: 18, transform: `scale(${1.04 + lt * .015})`}} />}
        {c.kind === 'image' && <Img src={staticFile(c.src!)} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 18}} />}
      </div>}
      {Gfx && <AbsoluteFill style={{borderRadius: framed ? 28 : 0, overflow: 'hidden'}}><Sequence from={-f(c.from)} layout="none"><Gfx /></Sequence></AbsoluteFill>}
      {c.label && <div style={{position: 'absolute', left: 34, bottom: 34, background: C.ink, color: C.white, fontFamily: inter, fontWeight: 800, fontSize: 28, letterSpacing: 2, padding: '10px 18px'}}>{c.label}</div>}
    </AbsoluteFill>);
};

type Grp = {words: typeof WORDS; start: number; end: number};
const GROUPS: Grp[] = (() => {
  const out: Grp[] = []; let cur: typeof WORDS = [];
  const flush = () => { if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end}); cur = []; };
  WORDS.forEach((wd, i) => { const prev = WORDS[i - 1];
    if (cur.length && (wd.seg !== prev.seg || wd.start - prev.end > .3 || cur.length >= 3 || cur.map((x) => x.text).join(' ').length + wd.text.length > 16)) flush();
    cur.push(wd); if (/[.,?!]$/.test(wd.text)) flush(); });
  flush(); out.forEach((g, i) => { g.end = out[i + 1] ? Math.min(out[i + 1].start, g.end + .4) : g.end + .6; });
  return out;
})();
const Captions: React.FC = () => {
  const t = useT(); const g = GROUPS.find((x) => t >= x.start && t < x.end); if (!g) return null;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: SEAM - 44, display: 'flex', justifyContent: 'center', zIndex: 20}}>
      <div style={{background: '#000', color: '#fff', fontFamily: inter, fontWeight: 800, fontSize: 58, letterSpacing: .5, lineHeight: 1.12, padding: '12px 24px', textAlign: 'center', maxWidth: 940}}>
        {g.words.map((x) => x.text.replace(/[,.]$/, '')).join(' ').toUpperCase()}</div>
    </div>);
};

/* ================= sound design ================= */
const hookSfx = (): [number, string, number][] => {
  const o: [number, string, number][] = [];
  R.lines.forEach((l, i) => { if (i !== 4) o.push([l, 'printer', .5]); });
  for (let i = 0; i < Q.length; i++) o.push([R.qStart + i * R.qStep, `mkey${i % 3}`, .55]);
  o.push([R.qStart + Q.length * R.qStep + .02, 'enter', .7]);
  o.push([R.kaching, 'kaching2', 1.0], [R.kaching + .1, 'coins', .45], [R.slam - .55, 'revcym', .55], [R.slam, 'slam', 1.0], [R.slam + .05, 'shimmer', .5],
    [HOOK - .3, 'tear', .6], [HOOK - .28, 'whoosh2', .6]);
  return o;
};
const bodySfx = (): [number, string, number][] => [
  [w('K1', 'dato') - 0.15, 'swish', 0.4], [w('K1', 'rm2') + 0.05, 'coin', 0.5],
  [seg('K2').out - 0.12, 'whoosh2', 0.45], [w('K2', "carina's") - 0.08, 'swish', 0.4],
  [seg('K2b').out - 0.1, 'whoosh2', 0.45], [w('K2b', 'one') - 0.05, 'impact', 0.45],
  [seg('K4').out - 0.1, 'whoosh2', 0.4], [w('K4', '5,000'), 'kaching2', 0.4], [w('K4', '193'), 'ding', 0.3], [w('K4', 'copy'), 'glitch', 0.5],
  [seg('K5').out - 0.1, 'whoosh2', 0.4], [w('K5', 'one'), 'mkey0', 0.7], [w('K5', 'two'), 'mkey1', 0.7], [w('K5', 'three'), 'mkey2', 0.7], [w('K5', 'four'), 'mkey0', 0.7],
  [seg('K6').out - 0.1, 'whoosh_down', 0.4], [w('K6', 'live'), 'chime', 0.5], [w('K6', 'live') + .05, 'shimmer', .3],
  [seg('J1').out - 0.1, 'swish', 0.4], [w('J1', 'powerful'), 'pop', 0.4],
  [seg('K7').out - 0.1, 'swish', 0.4], [w('K7', 'death'), 'buzz', 0.4],
  [seg('J2').out - .1, 'swish', .35], [w('J2', 'won'), 'stamp', 0.65],
  [seg('J5').out - 0.1, 'whoosh2', 0.4], [w('J5', 'separate'), 'stamp', 0.6],
  [seg('K9').out - 0.1, 'swish', 0.4], [w('K9', 'straight'), 'click', 0.5], [w('K9', 'online'), 'kaching2', 0.5],
  [w('J3', 'do'), 'stamp', 0.7], [w('J3', 'do') + .02, 'subhit', .4],
  [seg('K10b').out - 0.1, 'whoosh2', 0.4],
  [seg('K10c').out - 0.1, 'whoosh2', 0.4], [w('K10c', 'online'), 'chime', 0.45],
  [seg('K11').out - 0.1, 'swish', 0.4], [w('K11', 'moat') - .4, 'revcym', 0.4], [w('K11', 'moat'), 'slam', 0.5],
  [seg('K12').out, 'swish', 0.4], [w('K12', 'this') - 0.1, 'glitch', 0.45], [w('K12', 'claude'), 'ding', 0.5],
  [seg('J4').out, 'pop', 0.5],
  [seg('K13').out - 0.1, 'whoosh2', 0.45], [w('K13', '2027'), 'kaching2', 0.6],
  [w('K13', 'comment') - 0.1, 'swish', 0.45], [w('K13', 'journey'), 'pop', 0.5], [w('K13', 'journey') + .05, 'shimmer', .35],
];
const procSfx = (): [number, string, number][] => {
  const o: [number, string, number][] = []; const s = seg('K10b').out; const th = w('K10b', '13');
  for (let i = 0; i < 13; i++) o.push([s + (th + .3 - s) * (i / 12), 'tick', .35]);
  const ts = w('K12', 'this');
  TERMINAL_LINES.slice(0, 3).forEach((l) => { for (let k = 0; k < 7; k++) o.push([ts + l.t + k * .075, `mkey${k % 3}`, .4]); });
  TERMINAL_LINES.slice(3).forEach((l) => o.push([ts + l.t, 'tick', .4]));
  const tc = w('K13', 'comment'); for (let k = 0; k < 6; k++) o.push([tc + .2 + k * .12, `mkey${k % 3}`, .5]);
  return o;
};
const ALL_SFX = [...hookSfx(), ...bodySfx(), ...procSfx()].filter(([t]) => t >= 0 && t < TOTAL);

export const ReelA: React.FC = () => {
  const music = (fr: number) => { const t = fr / 30;
    const fade = interpolate(t, [TOTAL - 1.5, TOTAL], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (inJoey(t) ? 0.02 : 0.045) * fade * Math.min(1, Math.max(0, (t - HOOK) / .3)); };
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Graphics />
      <Speaker />
      <Captions />
      <ReceiptHook />
      <Audio src={staticFile('audio/voice.wav')} />
      <Audio src={staticFile('sfx/music_bed.wav')} volume={music} />
      {ALL_SFX.map(([t, name, v], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={75} layout="none"><Audio src={staticFile(`sfx/${name}.wav`)} volume={v * 0.85} /></Sequence>))}
    </AbsoluteFill>);
};

/* ================= cover: Joey's photo behind, Kingsley in front, Thrive 2027 ================= */
export const CoverA: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <Img src={staticFile('brand/joey_photo.jpg')} style={{position: 'absolute', left: 0, top: 300, width: 1080, height: 1620, objectFit: 'cover', objectPosition: '42% 0%', filter: 'blur(1.5px) saturate(1.05)'}} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paper} 17%, rgba(245,244,240,0) 32%, rgba(245,244,240,0) 70%, rgba(245,244,240,.0) 100%)`}} />
    <div style={{position: 'absolute', top: 90, left: 60, right: 60, textAlign: 'center', fontFamily: serif, fontWeight: 900, fontSize: 96, lineHeight: 1.02, color: C.ink, letterSpacing: -1}}>
      I Asked Joey Yap How to Hit <i style={{color: C.accent}}>RM2M</i></div>
    <div style={{position: 'absolute', right: 50, top: 1080, background: '#16151A', borderRadius: 20, padding: 10, transform: 'rotate(-5deg)', boxShadow: '0 30px 60px rgba(0,0,0,.45)'}}>
      <Img src={staticFile('brand/thrive_2027.jpg')} style={{width: 470, borderRadius: 12, display: 'block'}} /></div>
    <Img src={staticFile('broll/cover_me.png')} style={{position: 'absolute', left: -90, top: 1920 - 1250 * .8, width: 703, height: 1250, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.45))'}} />
    <Img src={staticFile('brand/claude_my.jpg')} style={{position: 'absolute', right: 60, top: 1420, width: 170, height: 170, borderRadius: 30, boxShadow: '0 16px 40px rgba(0,0,0,.35)'}} />
    <div style={{position: 'absolute', right: 250, top: 1460, fontFamily: inter, fontWeight: 900, fontSize: 30, color: C.white, background: C.ink, padding: '10px 18px', letterSpacing: 2}}>CLAUDE MALAYSIA</div>
  </AbsoluteFill>
);
