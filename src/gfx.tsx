import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, staticFile, Sequence} from 'remotion';
import {C, inter, mono, sc, serif, w, seg, f} from './theme';
import {usePop, useT, ease, Chip, Card, Stamp, Counter, Dot} from './ui';

const Title: React.FC<{at: number; children: React.ReactNode; top?: number}> = ({at, children, top = 70}) => {
  const p = usePop(at);
  return <div style={{position: 'absolute', top, left: 0, right: 0, textAlign: 'center', fontFamily: serif, fontWeight: 800,
    fontSize: 68, color: C.ink, letterSpacing: -.5, lineHeight: 1.08, opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>{children}</div>;
};

/* ---------- S2: "one serious question" ---------- */
export const Question: React.FC = () => {
  const a = w('K2', 'one'); const p = usePop(a, {damping: 10, stiffness: 220, mass: .6});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', background: 'rgba(246,244,239,.55)', backdropFilter: 'blur(6px)'}}>
      <div style={{transform: `scale(${interpolate(p, [0, 1], [1.8, 1])})`, opacity: p, textAlign: 'center'}}>
        <div style={{fontFamily: serif, fontWeight: 900, fontSize: 260, color: C.accent, lineHeight: .9, letterSpacing: -8}}>1</div>
        <div style={{fontFamily: serif, fontWeight: 800, fontSize: 92, color: C.ink, letterSpacing: -1}}>serious question.</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- S4: community 0 → 5,000 in 193 days + copycats ---------- */
export const Community: React.FC = () => {
  const t = useT(); const s = seg('K4').out; const n = w('K4', '5,000'); const d = w('K4', '193'); const cp = w('K4', 'copy');
  const comp = w('K4', 'competitors');
  const cardP = usePop(s); const copyP = usePop(comp);
  const bar = ease(t, d - .2, d + .9);
  const card = (dx: number, dy: number, ghost: boolean, i: number) => (
    <Card key={i} style={{position: 'absolute', left: 104 + dx, top: 200 + dy, width: 760, height: 470, padding: 50,
      opacity: ghost ? .55 : 1, filter: ghost ? 'grayscale(1) blur(1px)' : 'none', transform: ghost ? `rotate(${dx / 20}deg)` : `scale(${.9 + cardP * .1})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: inter, fontWeight: 800, fontSize: 34, color: C.mute}}>
        <Dot color={ghost ? C.mute : C.accent} /> {ghost ? 'Copycat Community' : 'Claude Malaysia Community'}</div>
      <div style={{fontFamily: serif, fontWeight: 900, fontSize: 180, color: C.ink, letterSpacing: -3, marginTop: 10}}>
        <Counter from={0} to={5000} a={n - .7} b={n + .4} /></div>
      <div style={{fontFamily: inter, fontWeight: 700, fontSize: 40, color: C.mute, marginTop: -10}}>members</div>
      <div style={{marginTop: 34, height: 26, borderRadius: 99, background: C.paper2, overflow: 'hidden'}}>
        <div style={{width: `${bar * 100}%`, height: '100%', background: ghost ? C.mute : C.accent, borderRadius: 99}} /></div>
      <div style={{fontFamily: inter, fontWeight: 800, fontSize: 34, color: C.ink, marginTop: 14}}>in just <span style={{color: ghost ? C.mute : C.accent}}>193 days</span></div>
    </Card>
  );
  return (
    <AbsoluteFill style={{background: C.paper}}>
      {t >= comp && [[-70, 70], [70, 120]].map(([dx, dy], i) => (
        <div key={i} style={{opacity: copyP, transform: `translate(${(1 - copyP) * -dx}px,${(1 - copyP) * -dy}px)`}}>{card(dx, dy, true, i)}</div>))}
      {card(0, 0, false, 9)}
      {t >= cp && <Stamp at={cp} text="COPY / PASTE" color={C.red} size={78} rot={-8} style={{top: '82%'}} />}
    </AbsoluteFill>
  );
};

/* ---------- S5 + S11: the four options, then Joey's pick ---------- */
const OPTIONS = ['Online courses', 'Build a sales team', 'Collaborate', 'Grow my personal brand'];
export const Options: React.FC<{pick?: boolean}> = ({pick}) => {
  const t = useT();
  const at = pick ? OPTIONS.map(() => seg('K9').out - 1) : ['one', 'two', 'three', 'four'].map((k) => w('K5', k));
  const chosen = pick ? w('K9', 'online') : 1e9; const cursorT = pick ? w('K9', 'pointed') : 1e9;
  const choP = usePop(chosen, {damping: 10, stiffness: 200, mass: .6});
  const cur = pick ? ease(t, cursorT, chosen, 0, 1) : 0;
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Title at={pick ? seg('K9').out - 1 : seg('K5').out}>
        {pick ? <>Out of all 4 options…</> : <>To hit <span style={{color: C.accent}}>RM2M</span>/year,<br />should we…</>}
      </Title>
      {OPTIONS.map((o, i) => {
        const p = usePop(at[i]); const isPick = pick && i === 0; const dim = pick && i > 0 && t >= chosen;
        return (
          <Card key={o} style={{position: 'absolute', left: 70, right: 70, top: 260 + i * 150, height: 124, display: 'flex', alignItems: 'center',
            gap: 30, padding: '0 36px', opacity: t < at[i] ? 0 : (dim ? .35 : 1) * p, transform: `translateX(${(1 - p) * 80}px) scale(${isPick ? 1 + choP * .06 : 1})`,
            border: isPick && t >= chosen ? `5px solid ${C.accent}` : `2px solid ${C.line}`, background: isPick && t >= chosen ? C.accentSoft : C.white}}>
            <div style={{width: 74, height: 74, borderRadius: 22, background: isPick && t >= chosen ? C.accent : C.ink, color: C.white,
              fontFamily: inter, fontWeight: 900, fontSize: 42, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{i + 1}</div>
            <div style={{fontFamily: inter, fontWeight: 800, fontSize: 50, color: C.ink, letterSpacing: -1, position: 'relative'}}>{o}
              {dim && <div style={{position: 'absolute', left: -6, right: -6, top: '52%', height: 6, background: C.ink, borderRadius: 4,
                transformOrigin: 'left', transform: `scaleX(${ease(t, chosen, chosen + .35)})`}} />}</div>
            {isPick && t >= chosen && <div style={{marginLeft: 'auto', fontFamily: inter, fontWeight: 900, fontSize: 30, color: C.white,
              background: C.accent, padding: '10px 20px', borderRadius: 99, transform: `scale(${choP})`}}>JOEY'S PICK</div>}
          </Card>);
      })}
      {pick && t >= cursorT && (
        <svg width="90" height="90" viewBox="0 0 24 24" style={{position: 'absolute',
          left: interpolate(cur, [0, 1], [820, 520]), top: interpolate(cur, [0, 1], [820, 330]), filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.3))'}}>
          <path d="M4 2l16 9-7 2-3 7z" fill={C.ink} stroke={C.white} strokeWidth="1.5" strokeLinejoin="round" /></svg>)}
    </AbsoluteFill>
  );
};

/* ---------- S6: Live Door badge over the chart ---------- */
export const DoorBadge: React.FC<{at: number; good: boolean; style?: React.CSSProperties; big?: boolean}> = ({at, good, style, big}) => {
  const p = usePop(at, {damping: 10, stiffness: 220, mass: .6}); if (useT() < at) return null;
  const col = good ? C.green : C.red; const s = big ? 1 : .85;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22 * s, background: C.white, borderRadius: 30, padding: `${22 * s}px ${34 * s}px`,
      border: `5px solid ${col}`, boxShadow: `0 20px 50px ${good ? 'rgba(31,157,99,.3)' : 'rgba(229,72,77,.3)'}`,
      transform: `scale(${p})`, opacity: Math.min(1, p * 2), ...style}}>
      <div style={{fontFamily: sc, fontWeight: 900, fontSize: 84 * s, color: col, lineHeight: 1}}>{good ? '生门' : '死门'}</div>
      <div>
        <div style={{fontFamily: inter, fontWeight: 900, fontSize: 52 * s, color: C.ink, letterSpacing: -1}}>{good ? 'LIVE DOOR' : 'DEATH DOOR'}</div>
        <div style={{fontFamily: inter, fontWeight: 700, fontSize: 30 * s, color: col}}>{good ? '✓ super strong position' : "✕ won't last long lah"}</div>
      </div>
    </div>);
};
export const LiveDoor: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 120}}>
    <DoorBadge at={w('K6', 'live')} good big />
  </AbsoluteFill>
);

/* ---------- S8: you vs competitors ---------- */
export const Doors: React.FC = () => (
  <AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center', gap: 40, flexDirection: 'column'}}>
    <Chip size={30} bg={C.ink} color={C.white}>YOU</Chip>
    <DoorBadge at={seg('K7').out - .3} good />
    <div style={{fontFamily: inter, fontWeight: 900, fontSize: 60, color: C.mute}}>vs</div>
    <Chip size={30} bg={C.ink} color={C.white}>COMPETITORS</Chip>
    <DoorBadge at={w('K7', 'death')} good={false} />
  </AbsoluteFill>
);

/* ---------- S10: the separate product ---------- */
export const Product: React.FC = () => {
  const t = useT(); const s = seg('K8').out; const sep = w('K8', 'separate'); const ap = w('K8', 'apart');
  const lift = usePop(sep, {damping: 12, stiffness: 120, mass: 1});
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Title at={s}>Everyone sells the<br />same thing…</Title>
      {Array.from({length: 12}).map((_, i) => {
        const x = 130 + (i % 4) * 190; const y = 330 + Math.floor(i / 4) * 175; const hero = i === 5;
        const p = usePop(s + .05 * i); const away = ease(t, ap, ap + .5);
        const hx = hero ? interpolate(lift, [0, 1], [0, 484 - x - 0]) : 0; const hy = hero ? interpolate(lift, [0, 1], [0, 610 - y]) : 0;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 150, height: 140, borderRadius: 30,
          background: hero && t >= sep ? C.accent : C.white, border: `3px solid ${hero && t >= sep ? C.accent : C.line}`,
          transform: `translate(${hx}px,${hy}px) scale(${p * (hero ? 1 + lift * .7 : 1 - away * .15)})`, zIndex: hero ? 3 : 1,
          opacity: hero ? 1 : 1 - away * .65, filter: !hero && away > 0 ? `blur(${away * 3}px)` : 'none',
          boxShadow: hero && t >= sep ? '0 30px 60px rgba(217,119,87,.45)' : '0 8px 20px rgba(0,0,0,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: inter, fontWeight: 900, fontSize: 30,
          color: C.white}}>{hero && t >= sep ? 'NEW' : ''}</div>;
      })}
      {t >= sep && <div style={{position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', fontFamily: serif, fontStyle: 'italic',
        fontWeight: 700, fontSize: 60, color: C.accent, opacity: ease(t, sep + .2, sep + .6)}}>…you need a separate product.</div>}
    </AbsoluteFill>);
};

/* ---------- S14: 13 physical workshops in KL ---------- */
export const Workshops: React.FC = () => {
  const t = useT(); const s = seg('K10b').out; const thirteen = w('K10b', '13');
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', fontFamily: inter, fontWeight: 900}}>
        <div style={{fontFamily: serif, fontSize: 220, color: C.ink, letterSpacing: -4, lineHeight: .95}}><Counter from={0} to={13} a={s} b={thirteen + .3} /></div>
        <div style={{fontSize: 48, color: C.mute}}>physical workshops · KL</div>
      </div>
      {Array.from({length: 13}).map((_, i) => {
        const at = s + (thirteen + .3 - s) * (i / 12); const p = usePop(at);
        return <div key={i} style={{position: 'absolute', left: 95 + (i % 5) * 160, top: 420 + Math.floor(i / 5) * 150, width: 136, height: 124,
          borderRadius: 26, background: t >= at ? C.white : 'transparent', border: `3px solid ${t >= at ? C.accent : C.line}`,
          transform: `scale(${t >= at ? p : 1})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: inter, fontWeight: 800, color: C.ink}}>
          <div style={{fontSize: 22, color: C.mute}}>WORKSHOP</div><div style={{fontSize: 46}}>#{i + 1}</div></div>;
      })}
    </AbsoluteFill>);
};

/* ---------- S15: online course ecosystem ---------- */
export const Ecosystem: React.FC = () => {
  const t = useT(); const s = seg('K10c').out; const on = w('K10c', 'online'); const tr = w('K10c', 'transition');
  const hubP = usePop(on); const arrow = ease(t, tr, tr + .6);
  const nodes = ['Video modules', 'Community', 'Live Q&A', 'Templates'];
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20}}>
        <Chip size={34} style={{opacity: 1 - arrow * .5}}>Physical workshops</Chip>
        <svg width="120" height="40"><line x1="0" y1="20" x2={110 * arrow} y2="20" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
          {arrow > .95 && <path d="M96 6 L112 20 L96 34" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />}</svg>
      </div>
      <svg width="968" height="900" style={{position: 'absolute', inset: 0}}>
        {nodes.map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 2 + Math.PI / 4; const p = ease(t, on + .1 * i, on + .1 * i + .5);
          return <line key={i} x1={484} y1={500} x2={484 + Math.cos(a) * 290 * p} y2={500 + Math.sin(a) * 250 * p} stroke={C.accent} strokeWidth="5" strokeDasharray="12 12" />; })}
      </svg>
      <div style={{position: 'absolute', left: 484 - 175, top: 500 - 110, width: 350, height: 220, borderRadius: 40, background: C.accent,
        transform: `scale(${hubP})`, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: C.white,
        fontFamily: serif, fontWeight: 800, fontSize: 50, lineHeight: 1.05, boxShadow: '0 30px 60px rgba(217,119,87,.4)'}}>Online course<br />ecosystem</div>
      {nodes.map((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 2 + Math.PI / 4; const p = usePop(on + .25 + .12 * i);
        return <div key={n} style={{position: 'absolute', left: 484 + Math.cos(a) * 300, top: 500 + Math.sin(a) * 260, transform: `translate(-50%,-50%) scale(${p})`}}>
          <Chip size={32}>{n}</Chip></div>; })}
    </AbsoluteFill>);
};

/* ---------- S16: validated → build the moat ---------- */
export const Moat: React.FC = () => {
  const t = useT(); const v = w('K11', 'validated'); const m = w('K11', 'moat'); const s = seg('K11').out;
  const ring = ease(t, m - .1, m + .8); const castle = usePop(s);
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Title at={s}>Mass market demand</Title>
      <svg width="968" height="900" style={{position: 'absolute', inset: 0}}>
        <circle cx="484" cy="520" r="300" fill="none" stroke={C.blue} strokeOpacity=".18" strokeWidth={70 * ring} />
        <circle cx="484" cy="520" r="300" fill="none" stroke={C.blue} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 300} strokeDashoffset={2 * Math.PI * 300 * (1 - ring)} transform="rotate(-90 484 520)" />
        {Array.from({length: 8}).map((_, i) => { const a = i / 8 * Math.PI * 2 + t * .4; const r = 420 - ring * 30 + Math.sin(t * 6 + i) * 8;
          return <circle key={i} cx={484 + Math.cos(a) * r} cy={520 + Math.sin(a) * r * .75} r="20" fill={C.mute} opacity={.5} />; })}
      </svg>
      <div style={{position: 'absolute', left: 484 - 170, top: 520 - 120, width: 340, height: 240, transform: `scale(${castle})`,
        borderRadius: 40, background: C.ink, color: C.white, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: inter, fontWeight: 900, fontSize: 44, textAlign: 'center', lineHeight: 1.1}}>
        <svg width="90" height="70" viewBox="0 0 90 70"><path d="M5 70V20h12v10h12V20h12v10h8V20h12v10h12V20h12v50z" fill={C.accent} /></svg>
        Claude<br />Malaysia</div>
      {t >= m && <div style={{position: 'absolute', bottom: 34, left: 0, right: 0, textAlign: 'center', fontFamily: serif, fontWeight: 800, fontStyle: 'italic',
        fontSize: 68, color: C.blue, opacity: ease(t, m, m + .4)}}>Now: build the moat.</div>}
      <Stamp at={v} text="VALIDATED ✓" color={C.green} size={80} rot={-7} style={{top: '30%', opacity: t > m ? 1 - ease(t, m, m + .3) : undefined}} />
    </AbsoluteFill>);
};

/* ---------- S17: terminal — "this video was edited by Claude" ---------- */
export const TERMINAL_LINES = [
  {t: 0.0, txt: '$ claude', col: C.white},
  {t: 0.35, txt: '> edit talking_head.mov — light style,', col: '#F0C3B2'},
  {t: 0.35, txt: '  Light style Joshua, SFX, split screen', col: '#F0C3B2'},
  {t: 1.6, txt: '✓ transcribed 284 words', col: '#7EE2A8'},
  {t: 1.9, txt: '✓ 19 cuts · 4 Joey soundbites', col: '#7EE2A8'},
  {t: 2.2, txt: '✓ 18 motion scenes · 50+ SFX', col: '#7EE2A8'},
  {t: 2.5, txt: '✓ rendered reel_final.mp4', col: '#7EE2A8'},
];
export const Terminal: React.FC = () => {
  const t = useT(); const s = w('K12', 'this'); const p = usePop(s); const pre = usePop(seg('K12').out);
  if (t < s) return (
    <AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 120, color: C.ink, transform: `scale(${pre})`}}>Fun fact…</div>
    </AbsoluteFill>);
  return (
    <AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{width: 880, height: 700, borderRadius: 30, background: '#1A1915', transform: `scale(${.85 + p * .15})`, opacity: p,
        boxShadow: '0 40px 80px rgba(0,0,0,.35)', overflow: 'hidden'}}>
        <div style={{height: 64, background: '#2A2924', display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px'}}>
          {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => <Dot key={c} color={c} size={22} />)}
          <div style={{marginLeft: 20, fontFamily: mono, fontSize: 26, color: '#9A968A'}}>claude-code — videoediting</div></div>
        <div style={{padding: '30px 36px', fontFamily: mono, fontSize: 33, lineHeight: 1.6}}>
          {TERMINAL_LINES.map((l, i) => { const lt = s + l.t; if (t < lt) return null;
            const typed = i < 3 ? Math.floor(ease(t, lt, lt + .55, 0, l.txt.length)) : l.txt.length;
            return <div key={i} style={{color: l.col, whiteSpace: 'pre'}}>{l.txt.slice(0, typed)}{i < 3 && typed < l.txt.length ? '▌' : ''}</div>; })}
        </div>
      </div>
      <div style={{position: 'absolute', top: 40, fontFamily: serif, fontWeight: 800, fontSize: 60, color: C.ink, opacity: ease(t, w('K12', 'claude'), w('K12', 'claude') + .3)}}>
        Edited by <span style={{color: C.accent}}>Claude</span></div>
    </AbsoluteFill>);
};

/* ---------- S19: goal bar / comment CTA / day counter ---------- */
export const Goal: React.FC = () => {
  const t = useT(); const s = seg('K13').out; const y = w('K13', '2027'); const fill = ease(t, s + .2, y, 0, .025);
  return (
    <AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: serif, fontWeight: 800, fontSize: 72, color: C.ink, textAlign: 'center'}}>Can we hit</div>
      <div style={{fontFamily: serif, fontWeight: 900, fontSize: 150, color: C.accent, letterSpacing: -3}}>RM2,000,000</div>
      <div style={{width: 820, height: 44, borderRadius: 99, background: C.paper2, border: `3px solid ${C.line}`, overflow: 'hidden', marginTop: 30}}>
        <div style={{width: `${Math.max(fill, .03) * 100}%`, height: '100%', background: C.accent}} /></div>
      <div style={{width: 820, display: 'flex', justifyContent: 'space-between', fontFamily: inter, fontWeight: 800, fontSize: 32, color: C.mute, marginTop: 14}}>
        <span>Day 193</span><span>Goal</span></div>
      <Stamp at={y} text="by 2027?" color={C.ink} size={90} rot={-5} style={{top: '84%'}} />
    </AbsoluteFill>);
};
export const Comment: React.FC = () => {
  const t = useT(); const s = w('K13', 'comment'); const kw = 'CLAUDE'; const typed = Math.floor(ease(t, s + .2, s + .9, 0, kw.length));
  const sent = w('K13', 'journey'); const sp = usePop(sent); const p = usePop(s);
  return (
    <AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: serif, fontWeight: 800, fontSize: 80, color: C.ink, marginBottom: 40, transform: `scale(${p})`}}>Comment below</div>
      <Card style={{width: 840, padding: '30px 34px', display: 'flex', alignItems: 'center', gap: 24, transform: `scale(${p})`}}>
        <div style={{width: 80, height: 80, borderRadius: 99, background: C.accent}} />
        <div style={{flex: 1, fontFamily: inter, fontWeight: 900, fontSize: 92, color: C.ink, letterSpacing: 4}}>
          {kw.slice(0, typed)}<span style={{opacity: Math.floor(t * 2.5) % 2 ? 1 : 0, color: C.accent}}>|</span></div>
        <div style={{fontFamily: inter, fontWeight: 900, fontSize: 40, color: C.white, background: t >= sent ? C.green : C.blue,
          borderRadius: 99, padding: '18px 30px', transform: `scale(${1 + sp * .1 - (t >= sent ? .1 : 0)})`}}>{t >= sent ? 'Sent ✓' : 'Post'}</div>
      </Card>
      <div style={{fontFamily: inter, fontWeight: 700, fontSize: 40, color: C.mute, marginTop: 36}}>to follow the journey</div>
    </AbsoluteFill>);
};
export const Day: React.FC = () => {
  const t = useT(); const s = w('K13', 'follow', 1); const n = w('K13', '194'); const flip = ease(t, n - .1, n + .35);
  const p = usePop(s);
  return (
    <AbsoluteFill style={{background: C.paper, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: inter, fontWeight: 800, fontSize: 52, color: C.mute, letterSpacing: 6}}>FOLLOW FOR</div>
      <div style={{position: 'relative', height: 300, width: 900, overflow: 'hidden', transform: `scale(${p})`}}>
        {[193, 194].map((d, i) => <div key={d} style={{position: 'absolute', inset: 0, textAlign: 'center', fontFamily: serif, fontWeight: 900,
          fontSize: 230, letterSpacing: -4, color: i ? C.accent : C.ink, transform: `translateY(${(i - flip) * 100}%)`}}>DAY {d}</div>)}
      </div>
      <div style={{marginTop: 20, fontFamily: inter, fontWeight: 900, fontSize: 46, color: C.white, background: C.ink, padding: '22px 60px',
        borderRadius: 99, transform: `scale(${usePop(n + .3)})`}}>+ Follow</div>
    </AbsoluteFill>);
};

/* ---------- S1 hook: result-first ---------- */
export const Hook: React.FC = () => {
  const t = useT(); const d = w('K1', 'dato'); const rm = w('K1', 'rm2');
  const pp = usePop(0.05); const move = usePop(rm, {damping: 16, stiffness: 160}); const np = usePop(rm, {damping: 11, stiffness: 200, mass: .6});
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontFamily: inter, fontWeight: 800, fontSize: 28,
        letterSpacing: 4, color: C.mute}}>THRIVE 2026 · CLAUDE MALAYSIA DAY 193</div>
      <div style={{position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: serif, fontWeight: 800, fontSize: 72,
        color: C.ink, opacity: Math.min(1, pp * 2), transform: `translateY(${(1 - pp) * 30}px)`}}>I asked <i style={{color: C.accent}}>Dato' Joey Yap</i></div>
      <div style={{position: 'absolute', left: interpolate(move, [0, 1], [484 - 170, 60]), top: interpolate(move, [0, 1], [250, 250]),
        width: 340, background: C.white, padding: 14, paddingBottom: 64, borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,.18)',
        transform: `rotate(${interpolate(move, [0, 1], [-3, -6])}deg) scale(${pp * interpolate(move, [0, 1], [1, .82])})`, transformOrigin: 'top left'}}>
        <div style={{width: 312, height: 400, overflow: 'hidden', borderRadius: 8}}>
          <OffthreadVideo src={staticFile('broll/v2345.mp4')} startFrom={30} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '20% 50%'}} /></div>
        <div style={{position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 32}}>Dato' Joey Yap</div>
      </div>
      {t >= rm && <div style={{position: 'absolute', right: 50, top: 300, width: 560, textAlign: 'right', opacity: np, transform: `translateX(${(1 - np) * 60}px)`}}>
        <div style={{fontFamily: inter, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: C.mute}}>HOW TO HIT</div>
        <div style={{fontFamily: serif, fontWeight: 900, fontSize: 112, color: C.ink, letterSpacing: -2, lineHeight: 1}}>
          <Counter from={0} to={2} a={rm} b={rm + .5} prefix="RM" />M</div>
        <div style={{fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 64, color: C.accent}}>a year?</div>
        <div style={{marginTop: 26, height: 14, background: C.paper2, borderRadius: 2}}><div style={{height: '100%', width: `${ease(t, rm, rm + .9) * 100}%`, background: C.accent}} /></div>
      </div>}
    </AbsoluteFill>);
};

/* ---------- Joey soundbites: pull-quote cards ---------- */
const QUOTES: Record<string, {q: string; extra?: string}> = {
  J1: {q: 'A very powerful position.', extra: 'live'},
  J2: {q: "They won't last very long.", extra: 'death'},
  J3: {q: 'Do the course first.', extra: 'course'},
  J4: {q: 'Of course I have heard of Claude.'},
};
export const Quote: React.FC<{id: string}> = ({id}) => {
  const t = useT(); const s = seg(id); const p = usePop(s.out); const Q = QUOTES[id];
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <div style={{position: 'absolute', top: 30, left: 70, fontFamily: serif, fontWeight: 900, fontSize: 260, color: C.accent, lineHeight: 1, opacity: .9}}>“</div>
      <div style={{position: 'absolute', top: 200, left: 80, right: 80, fontFamily: serif, fontStyle: 'italic', fontWeight: 700, fontSize: 84,
        lineHeight: 1.1, color: C.ink, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>{Q.q}</div>
      <div style={{position: 'absolute', top: 480, left: 80, fontFamily: inter, fontWeight: 800, fontSize: 30, letterSpacing: 3, color: C.mute, opacity: p}}>
        — DATO' JOEY YAP, LIVE AT THRIVE</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center'}}>
        {Q.extra === 'live' && <DoorBadge at={s.out + .3} good big />}
        {Q.extra === 'death' && <DoorBadge at={s.out + .2} good={false} big />}
      </div>
      {Q.extra === 'death' && <Stamp at={w('J2', 'won')} text="WON'T LAST" color={C.red} size={70} rot={-8} style={{top: '86%'}} />}
      {Q.extra === 'course' && <Stamp at={w('J3', 'do')} text="ONLINE COURSES ✓" color={C.accent} size={70} rot={-5} style={{top: '78%'}} />}
    </AbsoluteFill>);
};

/* ---------- K10a: recap ---------- */
export const Recap: React.FC = () => {
  const s = seg('K10a').out; const rows = ['Live Door position', 'Needs a separate product', 'Online courses first'];
  return (
    <AbsoluteFill style={{background: C.paper}}>
      <Title at={s} top={90}>Makes sense, <i style={{color: C.accent}}>kan?</i></Title>
      {rows.map((r, i) => { const p = usePop(s + .15 + i * .22);
        return <div key={r} style={{position: 'absolute', left: 150, right: 150, top: 330 + i * 150, display: 'flex', alignItems: 'center', gap: 28,
          opacity: p, transform: `translateX(${(1 - p) * -60}px)`, borderBottom: `2px solid ${C.line}`, paddingBottom: 26}}>
          <div style={{width: 64, height: 64, borderRadius: 8, background: C.ink, color: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: inter, fontWeight: 900, fontSize: 40}}>✓</div>
          <div style={{fontFamily: inter, fontWeight: 800, fontSize: 48, color: C.ink}}>{r}</div></div>; })}
    </AbsoluteFill>);
};

export const GFX: Record<string, React.FC> = {
  hook: Hook, recap: Recap, J1: () => <Quote id="J1" />, J2: () => <Quote id="J2" />, J3: () => <Quote id="J3" />, J4: () => <Quote id="J4" />,
  question: Question, community: Community, options: () => <Options />, 'options-pick': () => <Options pick />,
  livedoor: LiveDoor, doors: Doors, product: Product, workshops: Workshops, ecosystem: Ecosystem, moat: Moat,
  terminal: Terminal, goal: Goal, comment: Comment, day: Day,
};
