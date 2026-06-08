import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassBlurLayerProps {
  intensity: number;
  radius: number;
}

export function GlassBlurLayer({
  intensity,
  radius,
}: GlassBlurLayerProps): JSX.Element {
  const alpha = Math.min(0.98, Math.max(0.72, intensity / 82));

  return (
    <View
      pointerEvents="none"
      style={{
        borderRadius: radius,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      {/* Base frost layer - strong white overlay for frosted glass effect */}
      <LinearGradient
        colors={[
          `rgba(255,255,255,${alpha})`,
          `rgba(255,255,255,${alpha * 0.75})`,
          `rgba(255,255,255,${alpha * 0.55})`,
          `rgba(255,255,255,${alpha * 0.72})`,
        ]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.45, 0.75, 1]}
        start={{ x: 0, y: 0 }}
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />

      {/* Mint/cyan tint layer for color atmosphere */}
      <LinearGradient
        colors={[
          'rgba(95,230,197,0.18)',
          'rgba(132,228,229,0.12)',
          'rgba(95,230,197,0.08)',
          'rgba(255,255,255,0)',
        ]}
        end={{ x: 0.85, y: 1 }}
        locations={[0, 0.35, 0.65, 1]}
        start={{ x: 0.15, y: 0 }}
        style={{
          bottom: -20,
          left: -20,
          opacity: 0.88,
          position: 'absolute',
          right: -20,
          top: -20,
        }}
      />

      {/* Top gloss/reflection highlight - strong specular */}
      <LinearGradient
        colors={[
          'rgba(255,255,255,0.92)',
          'rgba(255,255,255,0.55)',
          'rgba(255,255,255,0)',
        ]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.35, 0.7]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          height: '38%',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />

      {/* Bottom inner shadow for physical thickness */}
      <LinearGradient
        colors={[
          'rgba(13,76,65,0)',
          'rgba(13,76,65,0.04)',
          'rgba(13,76,65,0.10)',
        ]}
        end={{ x: 0, y: 1 }}
        locations={[0, 0.65, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
          bottom: 0,
          height: '28%',
          left: 0,
          position: 'absolute',
          right: 0,
        }}
      />

      {/* Inner edge highlight - glass edge glow */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.88)',
          borderRadius: 999,
          height: 1.8,
          left: 18,
          position: 'absolute',
          right: 18,
          top: 2,
        }}
      />

      {/* Secondary inner edge highlight */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.45)',
          borderRadius: 999,
          height: 1,
          left: 24,
          position: 'absolute',
          right: 24,
          top: 4,
        }}
      />

      {/* Bottom inner edge shadow */}
      <View
        style={{
          backgroundColor: 'rgba(13,76,65,0.08)',
          borderRadius: 999,
          bottom: 2,
          height: 1.2,
          left: 20,
          position: 'absolute',
          right: 20,
        }}
      />
    </View>
  );
}

export default GlassBlurLayer;
