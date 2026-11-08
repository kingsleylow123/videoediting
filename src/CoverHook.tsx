// Curiosity covers for IG. Everything important sits inside the 3:4 profile-grid crop (y 240–1680).
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, inter, serif} from './theme';

const Bar: React.FC<{w: number}> = ({w}) => (
  <span style={{display: 'inline-block', width: w, height: '0.78em', background: C.ink, verticalAlign: '-0.06em', transform: 'rotate(-1.5deg)', boxShadow: '0 6px 0 rgba(217,93,57,.9)'}} />
);

export const CoverHook: React.FC<{v: 'sell' | 'this' | 'death'}> = ({v}) => (
  <AbsoluteFill style={{background: C.paper}}>
    {/* Joey behind */}
    <Img src={staticFile('brand/joey_photo.jpg')} style={{position: 'absolute', left: 0, top: 560, width: 1080, height: 1360, objectFit: 'cover', objectPosition: '45% 0%'}} />
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.paper} 0%, ${C.paper} 30%, rgba(245,244,240,0) 42%)`}} />
    {/* headline (inside grid-safe zone) */}
    <div style={{position: 'absolute', top: 270, left: 60, right: 60, textAlign: 'center'}}>
      {v === 'sell' && <div style={{fontFamily: serif, fontWeight: 900, fontSize: 98, lineHeight: 1.04, color: C.ink, letterSpacing: -1}}>
        Joey Yap told me<br />to sell <Bar w={360} /><br />to hit <i style={{color: C.accent}}>RM2M</i></div>}
      {v === 'this' && <div style={{fontFamily: serif, fontWeight: 900, fontSize: 104, lineHeight: 1.04, color: C.ink, letterSpacing: -1}}>
        Joey Yap read<br />my chart. Then<br />he said <i style={{color: C.accent}}>this…</i></div>}
      {v === 'death' && <div style={{fontFamily: serif, fontWeight: 900, fontSize: 96, lineHeight: 1.06, color: C.ink, letterSpacing: -1}}>
        My competitors are<br />stuck in the <span style={{fontFamily: 'NotoSC', color: C.red}}>死门</span><br /><i style={{color: C.red}}>"Death Door"</i></div>}
    </div>
    {/* Thrive badge */}
    <div style={{position: 'absolute', right: 46, top: 1040, background: '#16151A', borderRadius: 18, padding: 9, transform: 'rotate(-5deg)', boxShadow: '0 24px 50px rgba(0,0,0,.45)'}}>
      <Img src={staticFile('brand/thrive_2027.jpg')} style={{width: 400, borderRadius: 11, display: 'block'}} /></div>
    {/* Kingsley cutout, face inside the grid crop */}
    <Img src={staticFile('broll/cover_me.png')} style={{position: 'absolute', left: -70, top: 1920 - 1250 * .92, width: 703, height: 1250, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,.45))'}} />
    {/* reaction sticker */}
    {v !== 'death' && <div style={{position: 'absolute', right: 70, top: 1360, background: C.accent, color: C.white, transform: 'rotate(6deg)', padding: '18px 26px',
      fontFamily: inter, fontWeight: 900, fontSize: 46, lineHeight: 1.05, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,.35)'}}>
      {v === 'sell' ? <>NOT WHAT<br />I EXPECTED</> : <>RM2M<br />QUESTION</>}</div>}
    {v === 'death' && <div style={{position: 'absolute', right: 70, top: 1360, background: C.green, color: C.white, transform: 'rotate(6deg)', padding: '18px 26px',
      fontFamily: inter, fontWeight: 900, fontSize: 44, lineHeight: 1.1, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,.35)'}}>
      <span style={{fontFamily: 'NotoSC'}}>生门</span> ME:<br />LIVE DOOR</div>}
    <Img src={staticFile('brand/claude_my.jpg')} style={{position: 'absolute', right: 70, top: 1560, width: 96, height: 96, borderRadius: 20, boxShadow: '0 10px 24px rgba(0,0,0,.35)'}} />
  </AbsoluteFill>
);
