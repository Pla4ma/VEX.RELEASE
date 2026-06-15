import React from 'react';
import { Image, View } from 'react-native';

import { glassMaterials, glassRadius } from '../../../theme/tokens/vex-light-glass';

const MASCOT = require('../../../../MASCOT ASSETS/MASCOT_POINTING.png');

interface Day0MascotProps {
  size: number;
}

export function Day0Mascot({ size }: Day0MascotProps): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={[
        glassMaterials.paneStrong,
        {
          alignItems: 'center',
          borderRadius: glassRadius.orb,
          height: size,
          justifyContent: 'center',
          overflow: 'hidden',
          width: size,
        },
      ]}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={MASCOT}
        style={{ height: size, width: size }}
      />
    </View>
  );
}
