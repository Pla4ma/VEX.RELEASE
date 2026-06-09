import React from 'react';
import { ImageBackground, View } from 'react-native';

const ENTRY_BACKGROUND = require('../../../../../assets/auth/vex-liquid-glass-entry-clean.png');

export function EtherealSkyBackground(): React.JSX.Element {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <ImageBackground
        resizeMode="cover"
        source={ENTRY_BACKGROUND}
        style={{
          position: 'absolute',
          top: -44,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </View>
  );
}
