import React from 'react';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { vexFire } from '../../../theme/tokens/vex-fire';

const FOCUS_BACKGROUND = require('../../../../assets/vex/focus-background.png');

export function SessionSetupAtmosphere(): React.JSX.Element {
  return (
    <>
      <Image
        accessibilityIgnoresInvertColors
        source={FOCUS_BACKGROUND}
        resizeMode="cover"
        style={{ bottom: 0, left: 0, opacity: 0.3, position: 'absolute', right: 0, top: 0 }}
      />
      <LinearGradient
        colors={[vexFire.background, vexFire.overlaySoft, vexFire.background]}
        locations={[0, 0.45, 1]}
        pointerEvents="none"
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
    </>
  );
}
