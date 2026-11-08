import React from 'react';
import {Composition, Still} from 'remotion';
import {ReelV3, Cover} from './ReelV3';
import {ReelA, CoverA} from './ReelA';
import {CoverHook} from './CoverHook';
import tl from '../data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ReelV3" component={ReelV3} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
    <Composition id="ReelA" component={ReelA} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
    <Still id="CoverA" component={CoverA} width={1080} height={1920} />
    <Still id="CoverSell" component={CoverHook} defaultProps={{v: 'sell' as const}} width={1080} height={1920} />
    <Still id="CoverThis" component={CoverHook} defaultProps={{v: 'this' as const}} width={1080} height={1920} />
    <Still id="CoverDeath" component={CoverHook} defaultProps={{v: 'death' as const}} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
