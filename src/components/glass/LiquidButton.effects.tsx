import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassEffectsProps {
  isPrimary: boolean;
}

export function LiquidButtonGlassEffects({ isPrimary }: GlassEffectsProps): JSX.Element {
  return (
    <>
      {/* Top specular highlight - glass reflection */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.88)', 'rgba(255, 255, 255, 0.38)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.45, 0.85]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: 999,
          borderTopRightRadius: 999,
          height: '48%',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />

      {/* Inner glow highlight line */}
      {isPrimary ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            borderRadius: 999,
            height: 1.5,
            left: 14,
            position: 'absolute',
            right: 14,
            top: 2.5,
          }}
        />
      ) : null}

      {/* Secondary highlight line */}
      {isPrimary ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.42)',
            borderRadius: 999,
            height: 1,
            left: 18,
            position: 'absolute',
            right: 18,
            top: 4.5,
          }}
        />
      ) : null}

      {/* Bottom inner shadow for depth */}
      {isPrimary ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(6, 67, 56, 0.18)',
            borderRadius: 999,
            bottom: 1.5,
            height: 1.2,
            left: 16,
            position: 'absolute',
            right: 16,
          }}
        />
      ) : null}
    </>
  );
}
