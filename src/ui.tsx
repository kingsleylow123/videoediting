import React from 'react';
import {spring, interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, inter, f} from './theme';

export const usePop = (at: number, cfg = {damping: 13, stiffness: 190, mass: 0.7}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig();
  return spring({frame: frame - f(at), fps, config: cfg});
};
export const useT = () => useCurrentFrame() / 30;
export const ease = (t: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.22, 1, 0.36, 1)});

export const Chip: React.FC<{children: React.ReactNode; color?: string; bg?: string; size?: number; style?: React.CSSProperties}> =
  ({children, color = C.ink, bg = C.white, size = 30, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: `${size * 0.42}px ${size * 0.8}px`,
    background: bg, color, borderRadius: 999, fontFamily: inter, fontWeight: 800, fontSize: size, letterSpacing: 1.5,
    boxShadow: '0 10px 30px rgba(0,0,0,.12)', ...style}}>{children}</div>
);

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: C.white, borderRadius: 36, boxShadow: '0 24px 60px rgba(30,25,15,.14), 0 2px 0 rgba(0,0,0,.03)',
    border: `2px solid ${C.line}`, ...style}}>{children}</div>
);

export const Dot: React.FC<{color: string; size?: number}> = ({color, size = 18}) => (
  <span style={{width: size, height: size, borderRadius: 99, background: color, display: 'inline-block'}} />
);

/** big stamp that slams in with overshoot + slight rotation */
export const Stamp: React.FC<{at: number; text: string; color?: string; size?: number; rot?: number; style?: React.CSSProperties}> =
  ({at, text, color = C.accent, size = 96, rot = -6, style}) => {
  const p = usePop(at, {damping: 9, stiffness: 260, mass: 0.6});
  if (useT() < at) return null;
  return (
    <div style={{position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${interpolate(p, [0, 1], [2.4, 1])})`,
      opacity: Math.min(1, p * 3), border: `10px solid ${color}`, color, padding: '18px 40px', borderRadius: 28,
      fontFamily: inter, fontWeight: 900, fontSize: size, letterSpacing: 2, whiteSpace: 'nowrap', background: 'rgba(255,255,255,.92)',
      boxShadow: '0 20px 60px rgba(0,0,0,.18)', ...style}}>{text}</div>
  );
};

export const Counter: React.FC<{from: number; to: number; a: number; b: number; prefix?: string; style?: React.CSSProperties}> =
  ({from, to, a, b, prefix = '', style}) => {
  const t = useT(); const v = Math.round(ease(t, a, b, from, to));
  return <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>{prefix}{v.toLocaleString('en-US')}</span>;
};
