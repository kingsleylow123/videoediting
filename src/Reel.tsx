import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, inter, f, SEGS, WORDS, TOTAL, seg, w} from './theme';
import {MODES, ZOOMS, CARDS, SFX, Mode} from './storyboard';
import {GFX, TERMINAL_LINES, DoorBadge} from './gfx';
import {usePop, useT, ease, Chip, Stamp, Counter} from './ui';

const FULL = {x: 0, y: 0, w: 1080, h: 1920, r: 0, b: 0};
const BUB = {x: 56, y: 1228, w: 392, h: 512, r: 46, b: 7};          // face bubble, bottom-left
const CARD = {x: 56, y: 196, w: 968, h: 900};                        // split-screen media card

const modeAt = (t: number): {mode: Mode; since: number} => {
  let m: Mode = MODES[0][1]; let since = 0;
  for (const [s, mm] of MODES) if (t >= s) { m = mm; since = s; }
  return {mode: m, since};
};

/** 0 = full-frame speaker, 1 = bubble; springs between modes for the morph */
const useBubble = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps;
  const {mode, since} = modeAt(t); const prev = modeAt(since - 0.001).mode;
  const p = spring({frame: frame - f(since), fps, config: {damping: 18, stiffness: 170}});
  const target = mode === 'split' ? 1 : 0; const from = since === 0 ? target : prev === 'split' ? 1 : 0;
  return from + (target - from) * p;
};

const Speaker: React.FC = () => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = frame / fps; const b = useBubble();
  const L = (k: keyof typeof FULL) => interpolate(b, [0, 1], [FULL[k], BUB[k]]);
  let z = 1, zs = 0, zp = 1;
  for (const [s, sc] of ZOOMS) if (t >= s) { zp = z; z = sc; zs = s; }
  const zsp = spring({frame: frame - f(zs), fps, config: {damping: 20, stiffness: 120}});
  const zoom = interpolate(b, [0, 1], [zp + (z - zp) * zsp, 1]) * (1 + 0.012 * Math.sin(t * 0.8));
  return (
    <div style={{position: 'absolute', left: L('x'), top: L('y'), width: L('w'), height: L('h'), borderRadius: L('r'), overflow: 'hidden',
      border: `${L('b')}px solid ${C.white}`, boxShadow: b > .02 ? `0 30px 70px rgba(20,15,5,${.28 * b})` : 'none', zIndex: 5, background: C.ink}}>
      {SEGS.map((s) => (
        <Sequence key={s.id} from={f(s.out)} durationInFrames={f(s.dur) + 2} layout="none">
          <OffthreadVideo src={staticFile(s.src === 'th' ? 'th.mp4' : 'broll/joey.mp4')} startFrom={f(s.start)} muted
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: s.src === 'th' ? '50% 30%' : '38% 45%',
              transform: `scale(${zoom})`, transformOrigin: s.src === 'th' ? '50% 35%' : '40% 40%'}} />
        </Sequence>))}
    </div>);
};

const MediaCard: React.FC = () => {
  const frame = useCurrentFrame(); const t = frame / 30; const b = useBubble();
  if (b < 0.01) return null;
  return (
    <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: 44, overflow: 'hidden',
      background: C.white, boxShadow: '0 30px 80px rgba(30,25,15,.16)', border: `2px solid ${C.line}`, opacity: b,
      transform: `translateY(${(1 - b) * -60}px) scale(${.94 + b * .06})`}}>
      {CARDS.map((c, i) => {
        const dur = f(c.to - c.from); if (dur <= 0) return null;
        return (
          <Sequence key={i} from={f(c.from)} durationInFrames={dur} layout="none">
            <CardSlot c={c} />
          </Sequence>);
      })}
    </div>);
};

const CardSlot: React.FC<{c: typeof CARDS[number]}> = ({c}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const lt = frame / fps;
  const inP = spring({frame, fps, config: {damping: 20, stiffness: 160}});
  const kb = 1.06 + lt * 0.02;
  const Gfx = c.gfx ? GFX[c.gfx] : null;
  return (
    <AbsoluteFill style={{clipPath: `inset(0 0 0 ${(1 - inP) * 100}% round 44px)`}}>
      {c.kind === 'video' && <OffthreadVideo src={staticFile(c.src!)} startFrom={f(c.at ?? 0)} muted
        style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos ?? '50% 50%', transform: `scale(${kb})`}} />}
      {c.kind === 'image' && <Img src={staticFile(c.src!)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`}} />}
      {Gfx && <WithGlobalTime from={c.from}><Gfx /></WithGlobalTime>}
      {c.label && <div style={{position: 'absolute', left: 30, bottom: 30, transform: `translateY(${(1 - inP) * 40}px)`}}>
        <Chip size={30}><span style={{width: 14, height: 14, borderRadius: 9, background: C.accent}} />{c.label}</Chip></div>}
    </AbsoluteFill>);
};

/** Graphics are authored against global time; re-offset the inner frame so anchors line up. */
const WithGlobalTime: React.FC<{from: number; children: React.ReactNode}> = ({from, children}) => (
  <Sequence from={-f(from)} layout="none">{children}</Sequence>
);

/* ---------- captions: white pill, active word in accent ---------- */
type Grp = {words: typeof WORDS; start: number; end: number};
const GROUPS: Grp[] = (() => {
  const out: Grp[] = []; let cur: typeof WORDS = [];
  const flush = () => { if (cur.length) out.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end}); cur = []; };
  WORDS.forEach((wd, i) => {
    const prev = WORDS[i - 1];
    if (cur.length && (wd.seg !== prev.seg || wd.start - prev.end > .3 || cur.length >= 4 ||
      cur.map((x) => x.text).join(' ').length + wd.text.length > 20)) flush();
    cur.push(wd); if (/[.,?!]$/.test(wd.text) && cur.length >= 2) flush();
  });
  flush();
  out.forEach((g, i) => { g.end = out[i + 1] ? Math.min(out[i + 1].start, g.end + .5) : g.end + .6; });
  return out;
})();

const Captions: React.FC = () => {
  const t = useT(); const b = useBubble();
  const g = GROUPS.find((x) => t >= x.start && t < x.end);
  const p = usePop(g ? g.start : 0, {damping: 16, stiffness: 260, mass: .5});
  if (!g) return null;
  const isJoey = g.words[0].spk === 'J';
  const top = interpolate(b, [0, 1], [1290, 1112]);
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top, display: 'flex', justifyContent: 'center', zIndex: 20}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 14px', padding: '14px 28px', borderRadius: 28,
        background: isJoey ? C.ink : C.white, boxShadow: '0 16px 40px rgba(0,0,0,.18)', transform: `scale(${.85 + p * .15})`, maxWidth: 960}}>
        {g.words.map((wd, i) => {
          const active = t >= wd.start && t < Math.max(wd.end, wd.start + .12);
          const col = wd.emph ? C.accent : isJoey ? C.white : C.ink;
          return <span key={i} style={{fontFamily: inter, fontWeight: 900, fontSize: 64, letterSpacing: -1, lineHeight: 1.12,
            color: active && !wd.emph ? (isJoey ? '#FFD2C2' : C.accent) : col, opacity: t >= wd.start ? 1 : .35,
            transform: `scale(${active ? 1.08 : 1})`, display: 'inline-block'}}>{wd.text.replace(/,$/, '')}</span>;
        })}
      </div>
    </div>);
};

/* ---------- full-frame overlays ---------- */
const HookOverlay: React.FC = () => {
  const t = useT(); const rm = w('K1', 'rm2'); const end = seg('K2').out; const dato = w('K1', 'dato');
  const p = usePop(rm); const jp = usePop(dato); const out = ease(t, end - .25, end);
  if (t > end) return null;
  return (<>
    <div style={{position: 'absolute', top: 210, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 12,
      opacity: (t >= rm ? 1 : 0) * (1 - out), transform: `scale(${p})`}}>
      <Chip size={30} bg={C.ink} color={C.white}>THE QUESTION</Chip>
      <div style={{marginTop: 18, background: C.white, borderRadius: 34, padding: '10px 40px', boxShadow: '0 24px 60px rgba(0,0,0,.25)',
        fontFamily: inter, fontWeight: 900, fontSize: 116, color: C.ink, letterSpacing: -4}}>
        <Counter from={0} to={2000000} a={rm} b={rm + .8} prefix="RM" /><span style={{fontSize: 48, color: C.mute}}> /yr</span></div>
    </div>
    {t >= dato && t < rm && <div style={{position: 'absolute', right: 60, top: 230, zIndex: 12, width: 330, transform: `rotate(4deg) scale(${jp})`,
      background: C.white, padding: 14, paddingBottom: 60, borderRadius: 18, boxShadow: '0 30px 60px rgba(0,0,0,.3)'}}>
      <div style={{width: 302, height: 380, overflow: 'hidden', borderRadius: 10}}>
        <OffthreadVideo src={staticFile('broll/v2345.mp4')} startFrom={30} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '20% 50%'}} /></div>
      <div style={{position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontFamily: inter, fontWeight: 900, fontSize: 32}}>Dato' Joey Yap</div>
    </div>}
  </>);
};

const JoeyOverlay: React.FC = () => {
  const t = useT(); const J = ['J1', 'J2', 'J3', 'J4'].map(seg).find((s) => t >= s.out && t < s.out + s.dur);
  const p = usePop(J ? J.out + .1 : 0);
  if (!J) return null;
  return (<>
    <div style={{position: 'absolute', left: 50, top: 200, transform: `translateX(${(1 - p) * -500}px)`, zIndex: 15}}>
      <div style={{background: C.accent, color: C.white, fontFamily: inter, fontWeight: 800, fontSize: 26, letterSpacing: 3,
        padding: '8px 18px', borderRadius: '14px 14px 0 0', display: 'inline-block'}}>LIVE · THRIVE 2026</div>
      <div style={{background: C.white, fontFamily: inter, fontWeight: 900, fontSize: 48, padding: '14px 26px', borderRadius: '0 18px 18px 18px',
        boxShadow: '0 20px 50px rgba(0,0,0,.25)', color: C.ink}}>Dato' Joey Yap</div>
    </div>
    {J.id === 'J1' && <div style={{position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', zIndex: 15}}>
      <DoorBadge at={w('J1', 'powerful')} good big /></div>}
    {J.id === 'J2' && <div style={{position: 'absolute', inset: 0, zIndex: 15}}><Stamp at={w('J2', 'won')} text="WON'T LAST LONG" color={C.red} size={84} style={{top: '36%'}} /></div>}
    {J.id === 'J3' && <div style={{position: 'absolute', inset: 0, zIndex: 15}}><Stamp at={w('J3', 'do')} text="DO THE COURSE FIRST" color={C.accent} size={74} style={{top: '36%'}} /></div>}
  </>);
};

const Chrome: React.FC = () => {
  const t = useT(); const b = useBubble();
  return (<>
    <div style={{position: 'absolute', top: 0, left: 0, height: 10, width: `${(t / TOTAL) * 100}%`, background: C.accent, zIndex: 30}} />
    <div style={{position: 'absolute', top: 92, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 25, opacity: b}}>
      <Chip size={28}><span style={{width: 14, height: 14, borderRadius: 9, background: C.accent}} />CLAUDE MALAYSIA · DAY 193</Chip></div>
    {/* right of the bubble: running context */}
    <div style={{position: 'absolute', left: BUB.x + BUB.w + 36, top: BUB.y + 30, right: 50, opacity: b, zIndex: 6,
      fontFamily: inter, color: C.ink}}>
      <div style={{fontWeight: 900, fontSize: 44, letterSpacing: -1}}>Kingsley Low</div>
      <div style={{fontWeight: 700, fontSize: 30, color: C.mute, marginTop: 4}}>Founder, Claude Malaysia</div>
      <div style={{marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12}}>
        {[['5,000', 'members'], ['193', 'days'], ['RM2M', 'goal / yr']].map(([a, bb]) => (
          <div key={bb} style={{display: 'flex', alignItems: 'baseline', gap: 12}}>
            <span style={{fontWeight: 900, fontSize: 40, color: C.accent}}>{a}</span><span style={{fontWeight: 700, fontSize: 28, color: C.mute}}>{bb}</span></div>))}
      </div>
    </div>
  </>);
};

const Flash: React.FC = () => { // white flash on hard mode changes
  const t = useT(); let o = 0;
  for (const [s] of MODES.slice(1)) o = Math.max(o, 1 - Math.min(1, Math.abs(t - s) / .08));
  return o > 0 ? <AbsoluteFill style={{background: C.white, opacity: o * .35, zIndex: 40}} /> : null;
};

/* ---------- sound ---------- */
const procSfx = (): [number, string, number][] => {
  const out: [number, string, number][] = [];
  const s = seg('K10b').out; const th = w('K10b', '13');
  for (let i = 0; i < 13; i++) out.push([s + (th + .3 - s) * (i / 12), 'tick', .4]);
  const ts = w('K12', 'this');
  TERMINAL_LINES.slice(0, 3).forEach((l) => { for (let k = 0; k < 7; k++) out.push([ts + l.t + k * .075, 'key', .35]); });
  TERMINAL_LINES.slice(3).forEach((l) => out.push([ts + l.t, 'tick', .45]));
  const tc = w('K13', 'comment'); for (let k = 0; k < 6; k++) out.push([tc + .2 + k * .12, 'key', .45]);
  return out;
};
const ALL_SFX = [...SFX, ...procSfx()].filter(([t]) => t >= 0 && t < TOTAL);
const JOEY = ['J1', 'J2', 'J3', 'J4'].map(seg);

export const Reel: React.FC = () => {
  const music = (fr: number) => {
    const t = fr / 30; const inJ = JOEY.some((s) => t >= s.out - .2 && t < s.out + s.dur + .1);
    const fadeOut = interpolate(t, [TOTAL - 1.5, TOTAL], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (inJ ? 0.035 : 0.075) * fadeOut;
  };
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <AbsoluteFill style={{backgroundImage: `radial-gradient(${C.line} 2px, transparent 2px)`, backgroundSize: '36px 36px', opacity: .6}} />
      <MediaCard />
      <Speaker />
      <HookOverlay />
      <JoeyOverlay />
      <Chrome />
      <Captions />
      <Flash />
      <Audio src={staticFile('audio/voice.wav')} />
      <Audio src={staticFile('sfx/music_bed.wav')} volume={music} />
      {ALL_SFX.map(([t, name, v], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>))}
    </AbsoluteFill>);
};
