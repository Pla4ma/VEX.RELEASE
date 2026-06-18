import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


/**
 * DeepWorkVignette
 * Full-screen dark edge overlay for DEEP_WORK mode.
 * Creates a tunnel-vision effect that signals "serious mode."
 * Pointer-events: none — does not intercept touches.
 */
export function DeepWorkVignette(): React.ReactNode {
  return (
    <View pointerEvents="none" style={{ position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 }}>
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.45)',
          'transparent',
          'transparent',
          'rgba(0,0,0,0.35)',
        ]}
        locations={[0, 0.25, 0.75, 1]}
        style={{ position: 'absolute' as const, left: 0, right: 0, top: 0, bottom: 0 }}
      />
    </View>
  );
}

export default DeepWorkVignette;
