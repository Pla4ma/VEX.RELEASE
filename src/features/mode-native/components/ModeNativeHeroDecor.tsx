import React from 'react';
import { View } from 'react-native';
import { LiquidGlassObject } from '../../../components/glass/LiquidGlassObject';

export function ModeNativeHeroDecor(): React.ReactNode {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(95, 230, 197, 0.22)',
          borderRadius: 280,
          height: 180,
          position: 'absolute',
          right: -70,
          top: -100,
          width: 180,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(132, 228, 229, 0.18)',
          borderRadius: 180,
          height: 120,
          position: 'absolute',
          right: 30,
          top: 30,
          width: 120,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.52)',
          borderRadius: 200,
          height: 100,
          left: 30,
          position: 'absolute',
          top: 0,
          width: 100,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          right: -16,
          top: -20,
          opacity: 0.72,
        }}
      >
        <LiquidGlassObject size={120} variant="orb" />
      </View>
      <View
        pointerEvents="none"
        style={{
          bottom: -50,
          left: -20,
          opacity: 0.62,
          position: 'absolute',
        }}
      >
        <LiquidGlassObject size={90} variant="swirl" />
      </View>
    </>
  );
}
