import React from 'react';
import { View } from 'react-native';

import { LiquidGlassObject } from '../../../components/glass/LiquidGlassObject';

export function VexFocusDecorations(): React.ReactNode {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(95, 230, 197, 0.42)',
          borderRadius: 280,
          height: 220,
          position: 'absolute',
          right: -50,
          top: -70,
          width: 220,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(132, 228, 229, 0.38)',
          borderRadius: 200,
          height: 140,
          position: 'absolute',
          right: 24,
          top: 40,
          width: 140,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.72)',
          borderRadius: 200,
          height: 120,
          left: 20,
          position: 'absolute',
          top: -10,
          width: 120,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          bottom: -44,
          left: -32,
          opacity: 0.95,
          position: 'absolute',
        }}
      >
        <LiquidGlassObject size={132} variant="swirl" />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 1,
          position: 'absolute',
          right: -8,
          top: 8,
        }}
      >
        <LiquidGlassObject size={128} variant="swirl" />
      </View>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.58)',
          borderRadius: 200,
          height: 100,
          position: 'absolute',
          right: 60,
          top: -40,
          width: 100,
        }}
      />
    </>
  );
}
