import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  resolveVariant,
  SIZE_PADDING,
  SIZE_RADIUS,
  type GlassCardSize,
  type GlassCardVariant,
} from './GlassCard.tokens';

export type { GlassCardSize, GlassCardVariant };

export interface GlassCardProps {
  children: ReactNode;
  variant?: GlassCardVariant;
  size?: GlassCardSize;
  padding?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  glowMint?: boolean;
}

export function GlassCard({
  children,
  variant = 'default',
  size,
  padding,
  radius,
  style,
  testID,
  accessibilityLabel,
  glowMint = false,
}: GlassCardProps): JSX.Element {
  const v = resolveVariant(variant);
  const resolvedPadding = padding ?? (size ? SIZE_PADDING[size] : 18);
  const resolvedRadius = radius ?? (size ? SIZE_RADIUS[size] : 24);
  const showTopBar = variant === 'hero' || variant === 'premium' || variant === 'selected';

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessible={accessibilityLabel ? true : undefined}
      testID={testID}
      style={[
        {
          backgroundColor: v.background,
          borderColor: v.border,
          borderRadius: resolvedRadius,
          borderWidth: 1.2,
          overflow: 'hidden',
          shadowColor: v.shadowColor,
          shadowOffset: v.shadowOffset,
          shadowOpacity: v.shadowOpacity,
          shadowRadius: v.shadowRadius,
          elevation: 4,
        },
        glowMint
          ? {
              shadowColor: 'rgba(18, 184, 148, 0.18)',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.32,
              shadowRadius: 20,
            }
          : null,
        style,
      ]}
    >
      {showTopBar && v.accentTopBar ? (
        <View
          style={{
            backgroundColor: v.accentTopBar,
            height: 3,
            opacity: 0.45,
            width: '100%',
          }}
        />
      ) : null}

      {/* Top edge white glass highlight - strong specular */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 999,
          height: 2,
          left: 18,
          position: 'absolute',
          right: 18,
          top: showTopBar && v.accentTopBar ? 4 : 1.5,
          zIndex: 15,
        }}
      />

      {/* Secondary top edge highlight - softer glow */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.62)',
          borderRadius: 999,
          height: 1.5,
          left: 24,
          position: 'absolute',
          right: 24,
          top: showTopBar && v.accentTopBar ? 6.5 : 3.5,
          zIndex: 14,
        }}
      />

      {/* Tertiary thin highlight */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.32)',
          borderRadius: 999,
          height: 1,
          left: 30,
          position: 'absolute',
          right: 30,
          top: showTopBar && v.accentTopBar ? 8.5 : 5.5,
          zIndex: 13,
        }}
      />

      {/* Bottom inner shadow - physical thickness */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(10, 94, 77, 0.07)',
          borderRadius: 999,
          bottom: 2,
          height: 1.8,
          left: 20,
          position: 'absolute',
          right: 20,
          zIndex: 12,
        }}
      />

      {/* Secondary bottom shadow */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(10, 94, 77, 0.04)',
          borderRadius: 999,
          bottom: 4,
          height: 1.2,
          left: 24,
          position: 'absolute',
          right: 24,
          zIndex: 11,
        }}
      />

      {/* Top-left pearl glow - soft inner illumination */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.52)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.55, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: resolvedRadius,
          height: '50%',
          left: 0,
          opacity: 0.85,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 10,
        }}
      />

      {/* Soft top-left inner glow */}
      <LinearGradient
        colors={['rgba(132, 228, 229, 0.12)', 'rgba(132, 228, 229, 0.04)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.45, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: resolvedRadius,
          height: '55%',
          left: 0,
          opacity: 0.65,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 9,
        }}
      />

      {/* Bottom-right depth shadow - ambient occlusion */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', 'rgba(10, 94, 77, 0.06)', 'rgba(10, 94, 77, 0.1)']}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.65, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: resolvedRadius,
          bottom: 0,
          height: '50%',
          left: 0,
          opacity: 0.7,
          position: 'absolute',
          right: 0,
          zIndex: 9,
        }}
      />

      {/* Right edge subtle refraction */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', 'rgba(18, 184, 148, 0.06)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 0.5 }}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        style={{
          borderRadius: resolvedRadius,
          bottom: 0,
          opacity: 0.55,
          position: 'absolute',
          right: 0,
          top: 0,
          width: '12%',
          zIndex: 8,
        }}
      />

      {/* Left edge subtle refraction */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.02)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 0.5 }}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        style={{
          borderRadius: resolvedRadius,
          bottom: 0,
          left: 0,
          opacity: 0.45,
          position: 'absolute',
          top: 0,
          width: '8%',
          zIndex: 8,
        }}
      />

      {/* Glass shine streak - diagonal reflection */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.18)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 0.85, y: 0.55 }}
        locations={[0, 0.45, 1]}
        pointerEvents="none"
        start={{ x: 0.15, y: 0.45 }}
        style={{
          borderRadius: resolvedRadius,
          height: '25%',
          left: 0,
          opacity: 0.7,
          position: 'absolute',
          right: 0,
          top: '15%',
          zIndex: 11,
        }}
      />

      <View style={{ padding: resolvedPadding }}>{children}</View>
    </View>
  );
}

export default GlassCard;
