import React from 'react';
import {Composition, Still} from 'remotion';
import {ReelV3, Cover} from './ReelV3';
import {ReelA, CoverA} from './ReelA';
import tl from '../data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ReelV3" component={ReelV3} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
    <Composition id="ReelA" component={ReelA} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
    <Still id="CoverA" component={CoverA} width={1080} height={1920} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
  </>
);
