// v3 storyboard — every beat anchored to a spoken word (see data/timeline.json)
import {w, seg, TOTAL, HOOK} from './theme';

export type Card = {from: number; to: number; kind: 'video' | 'image' | 'gfx'; src?: string; at?: number;
  label?: string; gfx?: string; pos?: string};
export const CARDS: Card[] = [
  {from: 0, to: seg('K2').out, kind: 'gfx', gfx: 'jackpot'},
  {from: seg('K2').out, to: w('K2', "carina's"), kind: 'video', src: 'broll/v2265.mp4', at: 0.3, label: 'THRIVE 2026 · YEAR 2'},
  {from: w('K2', "carina's"), to: seg('K2b').out, kind: 'video', src: 'broll/IMG_3800.mp4', at: 0.6, label: "WITH CARINA'S GROUP"},
  {from: seg('K2b').out, to: seg('K4').out, kind: 'video', src: 'broll/v2353.mp4', at: 5.4, label: 'MY QUESTION, TYPED BEFORE THE MIC', gfx: 'question'},
  {from: seg('K4').out, to: seg('K5').out, kind: 'gfx', gfx: 'community'},
  {from: seg('K5').out, to: seg('K6').out, kind: 'gfx', gfx: 'options'},
  {from: seg('K6').out, to: seg('J1').out, kind: 'video', src: 'broll/a0ce.mp4', at: 2, gfx: 'livedoor', label: 'MY QI MEN CHART'},
  {from: seg('K7').out, to: seg('J2').out, kind: 'gfx', gfx: 'doors'},
  {from: seg('K9').out, to: seg('J3').out, kind: 'gfx', gfx: 'options-pick'},
  {from: seg('K10b').out, to: seg('K10c').out, kind: 'gfx', gfx: 'workshops'},
  {from: seg('K10c').out, to: seg('K11').out, kind: 'gfx', gfx: 'ecosystem'},
  {from: seg('K11').out, to: seg('K12').out, kind: 'gfx', gfx: 'moat'},
  {from: seg('K12').out, to: seg('J4').out, kind: 'gfx', gfx: 'terminal'},
  {from: seg('K13').out, to: w('K13', 'comment'), kind: 'gfx', gfx: 'goal'},
  {from: w('K13', 'comment'), to: TOTAL, kind: 'gfx', gfx: 'comment'},
];

// [time, sfx, volume]
const hookSfx = (): [number, string, number][] => {
  const o: [number, string, number][] = [];
  for (let i = 0; i < 25; i++) o.push([0.05 + i * 0.022, `mkey${i % 3}`, 0.55]);
  o.push([0.64, 'enter', 0.8], [0.68, 'riser', 0.35]);
  let tt = 0.70, gap = 0.035; while (tt < 1.52) { o.push([tt, 'ratchet', 0.45]); tt += gap; gap *= 1.06; }
  o.push([1.20, 'clack', 0.8], [1.36, 'clack', 0.8], [1.52, 'clack', 0.9]);
  o.push([1.66, 'kaching', 1.0], [1.76, 'subhit', 0.8], [1.80, 'coins', 0.6]);
  return o;
};
export const SFX: [number, string, number][] = [
  ...hookSfx(),
  [w('K1', 'dato') - 0.15, 'swish', 0.45], [w('K1', 'rm2') + 0.05, 'coin', 0.5],
  [seg('K2').out - 0.12, 'whoosh', 0.5], [w('K2', "carina's") - 0.08, 'swish', 0.45],
  [seg('K2b').out - 0.1, 'whoosh', 0.45], [w('K2b', 'one') - 0.05, 'impact', 0.5],
  [seg('K4').out - 0.1, 'whoosh', 0.45], [w('K4', '5,000'), 'kaching', 0.45], [w('K4', '193'), 'ding', 0.3], [w('K4', 'copy'), 'glitch', 0.55],
  [seg('K5').out - 0.1, 'whoosh', 0.45],
  [w('K5', 'one'), 'mkey0', 0.7], [w('K5', 'two'), 'mkey1', 0.7], [w('K5', 'three'), 'mkey2', 0.7], [w('K5', 'four'), 'mkey0', 0.7],
  [seg('K6').out - 0.1, 'whoosh_down', 0.45], [w('K6', 'live'), 'chime', 0.55],
  [seg('J1').out - 0.1, 'swish', 0.4], [w('J1', 'powerful'), 'pop', 0.4],
  [seg('K7').out - 0.1, 'swish', 0.45], [w('K7', 'death'), 'buzz', 0.45],
  [w('J2', 'won'), 'stamp', 0.7],
  [seg('J5').out - 0.1, 'whoosh', 0.4], [w('J5', 'separate'), 'stamp', 0.6],
  [seg('K9').out - 0.1, 'swish', 0.45], [w('K9', 'straight'), 'click', 0.5], [w('K9', 'online'), 'kaching', 0.5],
  [w('J3', 'do'), 'stamp', 0.7],
  [seg('K10b').out - 0.1, 'whoosh', 0.45],
  [seg('K10c').out - 0.1, 'whoosh', 0.45], [w('K10c', 'online'), 'chime', 0.45],
  [seg('K11').out - 0.1, 'swish', 0.4], [w('K11', 'moat'), 'riser', 0.3], [w('K11', 'moat') + 0.35, 'impact', 0.45],
  [seg('K12').out, 'swish', 0.4], [w('K12', 'this') - 0.1, 'glitch', 0.5], [w('K12', 'claude'), 'ding', 0.5],
  [seg('J4').out, 'pop', 0.5],
  [seg('K13').out - 0.1, 'whoosh', 0.5], [w('K13', '2027'), 'kaching', 0.6],
  [w('K13', 'comment') - 0.1, 'swish', 0.5], [w('K13', 'journey'), 'pop', 0.5],
];
// moments that shake the frame: [time, strength]
export const SHAKES: [number, number][] = [
  [1.66, 1.6], [w('K2b', 'one'), .7], [w('K4', 'copy'), .5], [w('J2', 'won'), .8], [w('J5', 'separate'), .7],
  [w('J3', 'do'), .8], [w('K11', 'moat') + .35, .6], [w('K13', '2027'), .8],
];
export {HOOK};
