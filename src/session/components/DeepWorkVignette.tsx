import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { launchColors } from '@theme/tokens/launch-colors';

/**
 * DeepWorkVignette
 * Full-screen dark edge overlay for DEEP_WORK mode.
 * Creates a tunnel-vision effect that signals "serious mode."
 * Pointer-events: none — does not intercept touches.
 */
export function DeepWorkVignette(): JSX.Element {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[
          launchColors.rgb_0_0_0_0_45,
          'transparent',
          'transparent',
          launchColors.rgb_0_0_0_0_35,
        ]}
        locations={[0, 0.25, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

export default DeepWorkVignette;
