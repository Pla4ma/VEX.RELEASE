import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { LiquidButtonVariant } from './LiquidButton.tokens';

interface GlassEffectsProps {
  variant: LiquidButtonVariant;
  isPrimary: boolean;
}

export function LiquidButtonGlassEffects({ variant, isPrimary }: GlassEffectsProps): React.ReactNode {
  void variant;
  return (
    <>
      {/* Top specular highlight - glass reflection */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.52)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.42, 0.82]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: 999,
          borderTopRightRadius: 999,
          height: '52%',
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
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            borderRadius: 999,
            height: 2,
            left: 12,
            position: 'absolute',
            right: 12,
            top: 2.2,
          }}
        />
      ) : null}

      {/* Secondary highlight line */}
      {isPrimary ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.55)',
            borderRadius: 999,
            height: 1.2,
            left: 16,
            position: 'absolute',
            right: 16,
            top: 4.2,
          }}
        />
      ) : null}

      {/* Bottom inner shadow for depth */}
      {isPrimary ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(6, 67, 56, 0.22)',
            borderRadius: 999,
            bottom: 1.2,
            height: 1.5,
            left: 14,
            position: 'absolute',
            right: 14,
          }}
        />
      ) : null}
    </>
  );
}
