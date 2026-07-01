import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Alignment, Fit, RiveView, useRiveFile } from '@rive-app/react-native';

import { PngMascotRenderer } from './PngMascotRenderer';
import type { AnimatedMascotProps } from './AnimatedMascot';
import { MASCOT_MOOD_NUMBER } from './VexMascotGuide.tokens';

// SAFETY: require() needed for Metro asset bundling. Assets are resolved at build time.
const RIVE_MASCOT_FILE: number = require('../../../../../assets/mascot/vex_mascot.riv');
export function RiveMascotRenderer(
  props: AnimatedMascotProps,
): React.JSX.Element {
  const { riveFile, isLoading, error } = useRiveFile(RIVE_MASCOT_FILE);
  const [hasRuntimeError, setHasRuntimeError] = useState(false);

  useEffect(() => {
    if (riveFile) {
      props.onReady?.();
    }
  }, [props, riveFile]);

  void MASCOT_MOOD_NUMBER[props.mood];

  if (isLoading || error || !riveFile || hasRuntimeError) {
    return <PngMascotRenderer {...props} />;
  }

  return (
    <View style={{ width: props.size.width, height: props.size.height }}>
      <RiveView
        alignment={Alignment.Center}
        autoPlay
        file={riveFile}
        fit={Fit.Contain}
        onError={() => {
          setHasRuntimeError(true);
        }}
        style={{
          width: props.size.width,
          height: props.size.height,
        }}
      />
    </View>
  );
}
