import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlassIconOrbProps {
  children?: ReactNode;
  size?: number;
  variant?: 'mint' | 'cyan' | 'fire' | 'amber' | 'lavender' | 'pearl';
  testID?: string;
}

interface VariantConfig {
  innerStart: string;
  innerEnd: string;
  ring: string;
  glow: string;
  core: string;
}

function resolveVariant(variant: NonNullable<GlassIconOrbProps['variant']>): VariantConfig {
  switch (variant) {
    case 'cyan':
      return {
        innerStart: 'rgba(132, 228, 229, 0.85)',
        innerEnd: 'rgba(132, 228, 229, 0.18)',
        ring: 'rgba(132, 228, 229, 0.55)',
        glow: 'rgba(132, 228, 229, 0.45)',
        core: 'rgba(255, 255, 255, 0.92)',
      };
    case 'fire':
      return {
        innerStart: 'rgba(240, 138, 75, 0.85)',
        innerEnd: 'rgba(240, 138, 75, 0.18)',
        ring: 'rgba(240, 138, 75, 0.55)',
        glow: 'rgba(240, 138, 75, 0.40)',
        core: 'rgba(255, 255, 255, 0.92)',
      };
    case 'amber':
      return {
        innerStart: 'rgba(223, 164, 74, 0.80)',
        innerEnd: 'rgba(223, 164, 74, 0.20)',
        ring: 'rgba(223, 164, 74, 0.50)',
        glow: 'rgba(223, 164, 74, 0.38)',
        core: 'rgba(255, 255, 255, 0.92)',
      };
    case 'lavender':
      return {
        innerStart: 'rgba(160, 132, 220, 0.70)',
        innerEnd: 'rgba(160, 132, 220, 0.15)',
        ring: 'rgba(160, 132, 220, 0.45)',
        glow: 'rgba(160, 132, 220, 0.35)',
        core: 'rgba(255, 255, 255, 0.92)',
      };
    case 'pearl':
      return {
        innerStart: 'rgba(255, 255, 255, 0.92)',
        innerEnd: 'rgba(255, 255, 255, 0.55)',
        ring: 'rgba(255, 255, 255, 0.85)',
        glow: 'rgba(255, 255, 255, 0.50)',
        core: 'rgba(255, 255, 255, 0.98)',
      };
    case 'mint':
    default:
      return {
        innerStart: 'rgba(95, 230, 197, 0.85)',
        innerEnd: 'rgba(95, 230, 197, 0.15)',
        ring: 'rgba(95, 230, 197, 0.55)',
        glow: 'rgba(95, 230, 197, 0.45)',
        core: 'rgba(255, 255, 255, 0.92)',
      };
  }
}

export function GlassIconOrb({
  children,
  size = 64,
  variant = 'mint',
  testID,
}: GlassIconOrbProps): JSX.Element {
  const v = resolveVariant(variant);
  const coreSize = Math.max(size - 18, 28);

  return (
    <View
      testID={testID}
      style={{
        alignItems: 'center',
        height: size,
        justifyContent: 'center',
        shadowColor: v.glow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.65,
        shadowRadius: 18,
        width: size,
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: v.glow,
          borderColor: v.ring,
          borderRadius: size / 2,
          borderWidth: 1.2,
          height: size,
          justifyContent: 'center',
          overflow: 'hidden',
          width: size,
        }}
      >
        <BlurView
          intensity={30}
          pointerEvents="none"
          tint="light"
          style={{
            borderRadius: size / 2,
            bottom: 0,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <LinearGradient
          colors={[v.innerStart, v.innerEnd]}
          end={{ x: 0.5, y: 1 }}
          start={{ x: 0.5, y: 0 }}
          style={{
            alignItems: 'center',
            borderRadius: size / 2,
            height: size,
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'absolute',
            width: size,
          }}
        />
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.92)', 'rgba(255, 255, 255, 0)']}
          end={{ x: 0.7, y: 0.9 }}
          start={{ x: 0.2, y: 0.05 }}
          style={{
            borderRadius: size / 2,
            height: size * 0.72,
            left: size * 0.10,
            opacity: 0.72,
            position: 'absolute',
            top: size * 0.06,
            transform: [{ rotate: '-18deg' }],
            width: size * 0.42,
          }}
        />
        <View
          pointerEvents="none"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            borderRadius: size / 10,
            height: size * 0.12,
            left: size * 0.26,
            opacity: 0.78,
            position: 'absolute',
            top: size * 0.18,
            width: size * 0.12,
          }}
        />
        <View
          style={{
            alignItems: 'center',
            backgroundColor: v.core,
            borderColor: 'rgba(255, 255, 255, 0.82)',
            borderRadius: size / 2,
            borderWidth: 1,
            height: coreSize,
            justifyContent: 'center',
            shadowColor: 'rgba(13, 76, 65, 0.16)',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.8,
            shadowRadius: 10,
            width: coreSize,
          }}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

export default GlassIconOrb;
