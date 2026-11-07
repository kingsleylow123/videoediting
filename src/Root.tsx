import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {ReelCutout} from './ReelCutout';
import tl from '../data/timeline.json';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel" component={Reel} durationInFrames={Math.ceil(tl.total * 30)}
      fps={30} width={1080} height={1920} />
    <Composition id="ReelCutout" component={ReelCutout} durationInFrames={Math.ceil(tl.total * 30)}
      fps={30} width={1080} height={1920} />
  </>
);
