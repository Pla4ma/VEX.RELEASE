import React from 'react';
import { View } from 'react-native';

import { NativeLiquidGlass } from './native/NativeLiquidGlass';

/**
 * Full-screen glass field behind all screen content.
 * Provides the base glass layer that cards and surfaces refract through.
 *
 * No decorative blobs — let the mesh gradient atmosphere provide color.
 * The native glass refracts whatever is behind it.
 */
export function LiquidGlassField(): React.ReactNode {
  return (
    <View pointerEvents="none" style={absoluteFill}>
      <NativeLiquidGlass
        radius={0}
        tintColor="transparent"
        style={absoluteFill}
      />
    </View>
  );
}

const absoluteFill = {
  bottom: 0,
  left: 0,
  position: 'absolute' as const,
  right: 0,
  top: 0,
};
