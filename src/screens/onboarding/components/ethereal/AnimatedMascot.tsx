import React, { Suspense, lazy } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { PngMascotRenderer } from './PngMascotRenderer';
import type { MascotMood } from './VexMascotGuide.tokens';

export type AnimatedMascotProps = {
  mood: MascotMood;
  size: { width: number; height: number };
  reducedMotion: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  isPointing?: boolean;
  isCelebrating?: boolean;
  preferPng?: boolean;
  reactionKey?: string | number;
  onReady?: () => void;
};

const HAS_RIVE_MASCOT =
  process.env.EXPO_PUBLIC_ENABLE_RIVE_MASCOT === '1' &&
  Platform.OS !== 'web' &&
  Constants.appOwnership !== 'expo' &&
  process.env.EXPO_PUBLIC_DISABLE_RIVE_MASCOT !== '1';
const LazyRiveMascotRenderer = lazy(async () => {
  const module = await import('./RiveMascotRenderer');
  return { default: module.RiveMascotRenderer };
});

export function AnimatedMascot(props: AnimatedMascotProps): React.JSX.Element {
  if (HAS_RIVE_MASCOT && !props.preferPng) {
    return (
      <Suspense fallback={<PngMascotRenderer {...props} />}>
        <LazyRiveMascotRenderer {...props} />
      </Suspense>
    );
  }

  return <PngMascotRenderer {...props} />;
}
