import React from 'react';
import { View } from 'react-native';

import { LiquidGlassObject } from '../../../components/glass/LiquidGlassObject';

export function VexFocusDecorations(): JSX.Element {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(95, 230, 197, 0.20)',
          borderRadius: 280,
          height: 220,
          position: 'absolute',
          right: -60,
          top: -80,
          width: 220,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(132, 228, 229, 0.18)',
          borderRadius: 200,
          height: 140,
          position: 'absolute',
          right: 30,
          top: 30,
          width: 140,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.50)',
          borderRadius: 200,
          height: 110,
          left: 30,
          position: 'absolute',
          top: 0,
          width: 110,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          bottom: -40,
          left: -30,
          position: 'absolute',
        }}
      >
        <LiquidGlassObject size={130} variant="swirl" />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -10,
          top: 0,
        }}
      >
        <LiquidGlassObject size={150} variant="orb" />
      </View>
    </>
  );
}
