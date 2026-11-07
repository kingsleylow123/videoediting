// The storyboard: every beat is anchored to a spoken word, so retiming the edit never breaks sync.
import {w, seg, segEnd, TOTAL} from './theme';

export type Mode = 'full' | 'split';
export const MODES: [number, Mode][] = [
  [0, 'full'],                       // S1 hook — face full screen
  [seg('K2').out, 'split'],          // S2 context b-roll
  [seg('J1').out, 'full'],           // Joey soundbite 1
  [seg('K7').out, 'split'],
  [seg('J2').out, 'full'],           // Joey soundbite 2
  [seg('K8').out, 'split'],
  [seg('J3').out, 'full'],           // Joey soundbite 3
  [seg('K10b').out, 'split'],        // (K10a "makes so much sense" stays full)
  [seg('K12').out, 'full'],
  [w('K12', 'this'), 'split'],       // terminal reveal
  [seg('J4').out, 'full'],           // "of course I've heard of Claude"
  [seg('K13').out, 'split'],
];

// punch-in zooms on the full-frame speaker (time, scale)
export const ZOOMS: [number, number][] = [
  [0, 1.18], [w('K1', 'boom') + 0.05, 1.0], [w('K1', 'rm2'), 1.12],
  [seg('J1').out, 1.0], [w('J1', 'powerful'), 1.12],
  [seg('J2').out, 1.05], [seg('J3').out, 1.0], [w('J3', 'do'), 1.14],
  [seg('K10a').out, 1.16], [seg('K12').out, 1.0], [seg('J4').out, 1.1], [w('J4', 'heard'), 1.22],
];

// media inside the split-screen card
export type Card = {from: number; to: number; kind: 'video' | 'image' | 'gfx'; src?: string; at?: number;
  label?: string; gfx?: string; pos?: string};
const K2 = seg('K2');
export const CARDS: Card[] = [
  {from: K2.out, to: w('K2', "carina's"), kind: 'video', src: 'broll/v2265.mp4', at: 0.3, label: 'THRIVE 2026 · YEAR 2'},
  {from: w('K2', "carina's"), to: w('K2', 'networking'), kind: 'video', src: 'broll/IMG_3800.mp4', at: 0.6, label: "WITH CARINA'S GROUP"},
  {from: w('K2', 'networking'), to: w('K2', 'one'), kind: 'video', src: 'broll/IMG_4092.mp4', at: 1.2, label: 'QI MEN CLUB LOUNGE'},
  {from: w('K2', 'one'), to: seg('K3').out, kind: 'image', src: 'broll/photo2.jpg', gfx: 'question'},
  {from: seg('K3').out, to: seg('K4').out, kind: 'video', src: 'broll/joey.mp4', at: 1.0, label: 'LIVE Q&A · DATO JOEY YAP', pos: '35% 50%'},
  {from: seg('K4').out, to: seg('K5').out, kind: 'gfx', gfx: 'community'},
  {from: seg('K5').out, to: seg('K6').out, kind: 'gfx', gfx: 'options'},
  {from: seg('K6').out, to: seg('J1').out, kind: 'video', src: 'broll/a0ce.mp4', at: 2, gfx: 'livedoor', label: 'MY QI MEN CHART'},
  {from: seg('K7').out, to: seg('J2').out, kind: 'gfx', gfx: 'doors'},
  {from: seg('K8').out, to: seg('K9').out, kind: 'gfx', gfx: 'product'},
  {from: seg('K9').out, to: seg('J3').out, kind: 'gfx', gfx: 'options-pick'},
  {from: seg('K10b').out, to: seg('K10c').out, kind: 'gfx', gfx: 'workshops'},
  {from: seg('K10c').out, to: seg('K11').out, kind: 'gfx', gfx: 'ecosystem'},
  {from: seg('K11').out, to: seg('K12').out, kind: 'gfx', gfx: 'moat'},
  {from: w('K12', 'this'), to: seg('J4').out, kind: 'gfx', gfx: 'terminal'},
  {from: seg('K13').out, to: w('K13', 'comment'), kind: 'gfx', gfx: 'goal'},
  {from: w('K13', 'comment'), to: w('K13', 'follow', 1), kind: 'gfx', gfx: 'comment'},
  {from: w('K13', 'follow', 1), to: TOTAL, kind: 'gfx', gfx: 'day'},
];

// sound design: [time, file, volume]
export const SFX: [number, string, number][] = [
  [0.0, 'impact', 0.9], [w('K1', 'dato') - 0.15, 'swish', 0.5], [w('K1', 'rm2') - 0.25, 'whoosh', 0.55], [w('K1', 'rm2') + 0.1, 'coin', 0.55],
  [seg('K2').out - 0.2, 'whoosh_down', 0.6],
  [w('K2', "carina's") - 0.08, 'swish', 0.45], [w('K2', 'networking') - 0.08, 'swish', 0.45],
  [w('K2', 'one') - 0.1, 'impact', 0.5],
  [seg('K3').out - 0.1, 'swish', 0.45],
  [seg('K4').out - 0.1, 'whoosh', 0.45], [w('K4', '5,000'), 'pop', 0.5], [w('K4', '193'), 'ding', 0.35],
  [w('K4', 'copy'), 'glitch', 0.55],
  [seg('K5').out - 0.1, 'whoosh', 0.45],
  [w('K5', 'one'), 'click', 0.6], [w('K5', 'two'), 'click', 0.6], [w('K5', 'three'), 'click', 0.6], [w('K5', 'four'), 'click', 0.6],
  [seg('K6').out - 0.1, 'whoosh_down', 0.45], [w('K6', 'live'), 'chime', 0.55],
  [seg('J1').out - 0.12, 'swish', 0.4], [w('J1', 'powerful'), 'pop', 0.4],
  [seg('K7').out - 0.1, 'swish', 0.45], [w('K7', 'death'), 'buzz', 0.45],
  [w('J2', 'won'), 'stamp', 0.7],
  [seg('K8').out - 0.12, 'whoosh', 0.45], [w('K8', 'separate'), 'riser', 0.35], [w('K8', 'apart'), 'pop', 0.55],
  [seg('K9').out - 0.1, 'swish', 0.45], [w('K9', 'straight'), 'click', 0.5], [w('K9', 'online'), 'ding', 0.55],
  [w('J3', 'do'), 'stamp', 0.7],
  [seg('K10a').out, 'whoosh_down', 0.4],
  [seg('K10b').out - 0.1, 'swish', 0.45],
  [seg('K10c').out - 0.1, 'whoosh', 0.45], [w('K10c', 'online'), 'chime', 0.45],
  [w('K11', 'validated'), 'stamp', 0.7], [w('K11', 'moat'), 'riser', 0.3], [w('K11', 'moat') + 0.3, 'pop', 0.5],
  [seg('K12').out, 'swish', 0.4], [w('K12', 'this') - 0.1, 'glitch', 0.5], [w('K12', 'claude'), 'ding', 0.5],
  [seg('J4').out, 'pop', 0.5],
  [seg('K13').out - 0.1, 'whoosh', 0.5], [w('K13', '2027'), 'impact', 0.45],
  [w('K13', 'comment') - 0.1, 'swish', 0.5], [w('K13', 'journey'), 'pop', 0.5],
  [w('K13', 'follow', 1) - 0.1, 'whoosh', 0.45], [w('K13', '194'), 'chime', 0.55],
];
// workshop tile ticks + terminal key taps + counters are added procedurally in Reel.tsx
export const segEndT = segEnd;
