import React from 'react';
import { AbsoluteFill, Easing, Sequence, useCurrentFrame } from 'remotion';
import { BigTitle, Captions, Kicker, PauseCard, ProgressBar, Stamp, prog } from '../../lib/shorts';
import { FONT_BODY, FONT_DISPLAY } from '../../fonts';
import { VO } from './vo.gen';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'Short13ClaudeMY',
  durationInSeconds: 41,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE — Claude Malaysia brand tokens (event-ops docs/BRAND_SYSTEM.md)
// =============================================================================
const INK = '#211C16';
const PAPER = '#FAF7F2';
const CARD = '#FFFDF9';
const INK_SOFT = '#5F564B';
const INK_FAINT = '#978C7B';
const CLAY = '#D97757';
const SAGE = '#4B7A5A';
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);
const EASE_INOUT = Easing.bezier(0.37, 0, 0.63, 1);
const S = (s: number) => Math.round(s * 30);

// =============================================================================
// DATA — illustrative "typical Monday" (labelled on screen)
// =============================================================================
const TASKS = [
  { name: 'Quotations', mins: 60, in: S(9.5) },
  { name: 'Follow-up emails', mins: 75, in: S(10.4) },
  { name: 'Sales report', mins: 60, in: S(11.3) },
  { name: 'Invoice chasing', mins: 45, in: S(12.3) },
  { name: 'Meeting notes', mins: 60, in: S(13.2) },
];
const TICK0 = S(18.5); // "All five"
const TICK_STEP = 7;
const COUNT_END = S(21.0);
const BOARD_OUT = S(24.0);
const LOOP_IN = S(37.0);
const END = S(41);

const fmt = (m: number) => {
  const r = Math.round(m);
  if (r <= 15) return `${r} MIN`;
  return `${Math.floor(r / 60)}H ${String(r % 60).padStart(2, '0')}M`;
};

// =============================================================================
// THE PERSISTENT CANVAS — task board, driven by GLOBAL frame (mounted at root)
// =============================================================================
const Board: React.FC = () => {
  const f = useCurrentFrame();
  const hook = f < S(3.4);
  const loop = f >= LOOP_IN;
  const done = hook || loop;

  // visibility
  let o = 1;
  if (hook) o = 1 - prog(f, S(3.0), S(3.4));
  else if (loop) o = EASE_OUT(prog(f, LOOP_IN, LOOP_IN + 14));
  else o = prog(f, S(3.6), S(4.0)) * (1 - prog(f, BOARD_OUT - 10, BOARD_OUT));
  if (o <= 0.01) return null;

  const scale = hook
    ? 1.06 - 0.06 * EASE_INOUT(prog(f, 0, 28))
    : loop
      ? 1.0 + 0.06 * EASE_INOUT(prog(f, LOOP_IN, END - 1))
      : 1;

  const added = TASKS.reduce((a, t) => a + t.mins * EASE_OUT(prog(f, t.in, t.in + 12)), 0);
  const cut = prog(f, TICK0, COUNT_END);
  const total = done ? 10 : added - (300 - 10) * EASE_INOUT(cut);
  const showStrike = done || cut > 0.98;

  return (
    <AbsoluteFill style={{ opacity: o, transform: `scale(${scale})` }}>
      {/* counter */}
      <div style={{ position: 'absolute', top: 450, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 26, letterSpacing: 6, color: INK_FAINT, fontWeight: 600 }}>
          {done || cut > 0 ? 'YOUR HANDS-ON TIME' : 'A TYPICAL MONDAY'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 28, marginTop: 6 }}>
          {showStrike && (
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 64, color: INK_FAINT, textDecoration: 'line-through', textDecorationColor: CLAY }}>
              5H 00M
            </span>
          )}
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 120, color: cut > 0 || done ? CLAY : PAPER }}>
            {added < 1 && !done ? '—' : fmt(total)}
          </span>
        </div>
      </div>
      {/* rows */}
      {TASKS.map((t, i) => {
        const p = done ? 1 : EASE_OUT(prog(f, t.in, t.in + 10));
        if (p <= 0.01) return null;
        const tk = done ? 1 : EASE_OUT(prog(f, TICK0 + i * TICK_STEP, TICK0 + i * TICK_STEP + 8));
        return (
          <div
            key={t.name}
            style={{
              position: 'absolute',
              left: 110,
              right: 110,
              top: 650 + i * 112,
              height: 92,
              borderRadius: 18,
              background: CARD,
              display: 'flex',
              alignItems: 'center',
              padding: '0 32px',
              gap: 26,
              opacity: p,
              transform: `translateX(${(1 - p) * -60}px)`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                border: `3px solid ${tk > 0.5 ? SAGE : INK_FAINT}`,
                background: tk > 0.5 ? SAGE : 'transparent',
                color: PAPER,
                fontSize: 34,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `scale(${1 + 0.25 * Math.sin(Math.PI * tk)})`,
              }}
            >
              {tk > 0.5 ? '✓' : ''}
            </div>
            <div style={{ flex: 1, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 42, color: tk > 0.5 ? INK_SOFT : INK }}>
              {t.name}
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: 34, fontWeight: 600, color: tk > 0.5 ? SAGE : CLAY }}>
              {tk > 0.5 ? 'Claude' : fmt(t.mins).toLowerCase()}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// =============================================================================
// OVERLAY SCENES (local frames — every cue = global_s*30 − sequence_from)
// =============================================================================
const HookTitle: React.FC<{ warm: boolean }> = ({ warm }) => (
  <BigTitle
    lines={[
      { text: '5 HOURS OF ADMIN', color: PAPER },
      { text: 'GONE BEFORE LUNCH', color: CLAY },
    ]}
    y={140}
    size={92}
    warm={warm}
  />
);

const Fade: React.FC<{ children: React.ReactNode; inDur?: number; outAt?: number }> = ({ children, inDur = 8, outAt }) => {
  const f = useCurrentFrame();
  const o = (inDur > 0 ? prog(f, 0, inDur) : 1) * (outAt === undefined ? 1 : 1 - prog(f, outAt - 10, outAt));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const OfferScene: React.FC = () => {
  const f = useCurrentFrame(); // mounted at S(24.2)
  const pill = (txt: string, at: number) => (
    <div
      style={{
        fontFamily: FONT_BODY, fontWeight: 600, fontSize: 36, color: INK, background: PAPER,
        borderRadius: 999, padding: '16px 34px', opacity: EASE_OUT(prog(f, at, at + 10)),
        transform: `translateY(${(1 - EASE_OUT(prog(f, at, at + 10))) * 20}px)`,
      }}
    >
      {txt}
    </div>
  );
  return (
    <Fade outAt={S(30.8) - S(24.2)}>
      <div style={{ position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: 150, height: 150, borderRadius: 36, background: CLAY, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: FONT_DISPLAY, fontSize: 96, color: PAPER, fontWeight: 700,
            transform: `scale(${0.6 + 0.4 * EASE_OUT(prog(f, 0, 14))})`,
          }}
        >
          ✳
        </div>
        <div style={{ marginTop: 40, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, color: PAPER, letterSpacing: 2 }}>CLAUDE</div>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, color: CLAY, letterSpacing: 2, marginTop: -10 }}>MALAYSIA</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 56, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 900 }}>
          {pill('1 day', S(27.3) - S(24.2))}
          {pill('Hands-on', S(27.9) - S(24.2))}
          {pill('Built for founders', S(28.8) - S(24.2))}
        </div>
      </div>
    </Fade>
  );
};

const TwistScene: React.FC = () => {
  const f = useCurrentFrame(); // mounted at S(30.8)
  const rows = [
    { t: 'Built on YOUR business', at: S(32.6) },
    { t: 'Running before you leave', at: S(33.8) },
    { t: 'Prompts you keep', at: S(35.0) },
  ];
  return (
    <Fade outAt={S(37.0) - S(30.8)}>
      <BigTitle lines={[{ text: 'WORKFLOWS,', color: PAPER }, { text: 'NOT THEORY', color: CLAY }]} y={420} size={110} />
      {rows.map((r, i) => {
        const at = r.at - S(30.8);
        const p = EASE_OUT(prog(f, at, at + 10));
        return (
          <div
            key={r.t}
            style={{
              position: 'absolute', top: 780 + i * 120, left: 140, right: 140, opacity: p,
              transform: `translateX(${(1 - p) * 40}px)`, display: 'flex', alignItems: 'center', gap: 24,
              fontFamily: FONT_BODY, fontWeight: 600, fontSize: 44, color: PAPER,
            }}
          >
            <span style={{ color: SAGE, fontSize: 52 }}>✓</span>
            {r.t}
          </div>
        );
      })}
    </Fade>
  );
};

// =============================================================================
// MAIN
// =============================================================================
const Short13ClaudeMY: React.FC = () => (
  <AbsoluteFill style={{ background: INK }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, #3a2c22 0%, ${INK} 65%)` }} />
    <Board />
    {/* hook title — warm at f0 */}
    <Sequence from={0} durationInFrames={S(3.4)}>
      <Fade inDur={0} outAt={S(3.4)}>
        <HookTitle warm />
      </Fade>
    </Sequence>
    {/* setup kicker: global 3.6–14.2 */}
    <Sequence from={S(3.6)} durationInFrames={S(14.2) - S(3.6)}>
      <Kicker text="RM1–5M FOUNDER · MONDAY" color={CLAY} y={250} at={4} until={S(14.2) - S(3.6)} />
    </Sequence>
    {/* quiz: global 14.4–18.2 */}
    <Sequence from={S(14.4)} durationInFrames={S(18.2) - S(14.4)}>
      <Kicker text="HOW MANY CAN AI DO?" color={CLAY} y={250} at={2} until={S(18.2) - S(14.4)} />
      <Sequence from={S(15.2) - S(14.4)} durationInFrames={S(18.0) - S(15.2)}>
        <PauseCard durSec={2.8} title="PAUSE" subtitle="guess before the reveal" accent={CLAY} y={1320} />
      </Sequence>
    </Sequence>
    {/* reveal: global 18.2–24.2 */}
    <Sequence from={S(18.2)} durationInFrames={S(24.2) - S(18.2)}>
      <Kicker text="NO NEW SOFTWARE" color={SAGE} y={250} at={S(20.0) - S(18.2)} until={S(24.2) - S(18.2)} />
      <Stamp text="ALL 5" color={CLAY} at={S(18.5) - S(18.2)} until={S(24.0) - S(18.2)} x={540} y={1300} size={96} rotate={-8} />
    </Sequence>
    <Sequence from={S(24.2)} durationInFrames={S(30.8) - S(24.2)}>
      <OfferScene />
    </Sequence>
    <Sequence from={S(30.8)} durationInFrames={S(37.0) - S(30.8)}>
      <TwistScene />
    </Sequence>
    {/* loop: title returns, board grows; last frame ≈ frame 0 */}
    <Sequence from={LOOP_IN} durationInFrames={END - LOOP_IN}>
      <Fade inDur={14}>
        <HookTitle warm />
      </Fade>
    </Sequence>
    <Captions lines={VO} y={1500} accent={CLAY} />
    <ProgressBar color={CLAY} />
  </AbsoluteFill>
);

export default Short13ClaudeMY;
