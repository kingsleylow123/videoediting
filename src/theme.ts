import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';
import tl from '../data/timeline.json';

// fonts are self-hosted in public/fonts (headless Chrome can't reach Google Fonts through the proxy)
for (const wt of ['500', '700', '800', '900']) loadFont({family: 'InterTight', url: staticFile(`fonts/InterTight-${wt}.woff2`), weight: wt});
loadFont({family: 'JBMono', url: staticFile('fonts/JetBrainsMono-500.woff2'), weight: '500'});
loadFont({family: 'NotoSC', url: staticFile('fonts/NotoSC-900.woff2'), weight: '900'});
export const inter = 'InterTight, Inter, sans-serif';
export const mono = 'JBMono, monospace';
export const sc = 'NotoSC, sans-serif';

// "Light" system — warm paper, ink, one hot accent (Claude orange) + semantic green/red
export const C = {
  paper: '#F6F4EF', paper2: '#ECE8DF', ink: '#121212', mute: '#8A8578', line: '#DDD8CC',
  accent: '#D97757', accentSoft: '#F6DCD0', green: '#1F9D63', greenSoft: '#D5F0E2',
  red: '#E5484D', redSoft: '#FBDADB', white: '#FFFFFF', blue: '#3B82F6',
};
export const FPS = 30;
export const f = (s: number) => Math.round(s * FPS);

type W = {text: string; start: number; end: number; seg: string; spk: string; emph: boolean};
export const WORDS = tl.words as W[];
export const SEGS = tl.segments as {id: string; src: string; start: number; end: number; out: number; dur: number; spk: string}[];
export const TOTAL = tl.total as number;
export const seg = (id: string) => SEGS.find((s) => s.id === id)!;
/** output time (s) of the nth word in segment `id` whose text starts with `txt` */
export const w = (id: string, txt: string, nth = 0) => {
  const hits = WORDS.filter((x) => x.seg === id && x.text.toLowerCase().replace(/[^a-z0-9,']/g, '').startsWith(txt.toLowerCase()));
  if (!hits[nth]) throw new Error(`anchor not found ${id}:${txt}`);
  return hits[nth].start;
};
export const segEnd = (id: string) => seg(id).out + seg(id).dur;
