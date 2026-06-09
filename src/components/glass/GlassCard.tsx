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
        },
        glowMint
          ? {
              shadowColor: 'rgba(18, 184, 148, 0.22)',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.85,
              shadowRadius: 22,
            }
          : null,
        style,
      ]}
    >
      {showTopBar && v.accentTopBar ? (
        <View
          style={{
            backgroundColor: v.accentTopBar,
            height: 2.5,
            opacity: 0.85,
            width: '100%',
          }}
        />
      ) : null}

      {/* Physical glass top edge - crisp white bevel highlight */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 999,
          height: 1.8,
          left: 16,
          position: 'absolute',
          right: 16,
          top: showTopBar && v.accentTopBar ? 3.5 : 1.2,
          zIndex: 15,
        }}
      />

      {/* Secondary top edge - softer glass thickness */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.55)',
          borderRadius: 999,
          height: 1.2,
          left: 22,
          position: 'absolute',
          right: 22,
          top: showTopBar && v.accentTopBar ? 5.5 : 2.8,
          zIndex: 14,
        }}
      />

      {/* Bottom physical edge - contact shadow for thickness */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(10, 94, 77, 0.14)',
          borderRadius: 999,
          bottom: 1.5,
          height: 1.8,
          left: 18,
          position: 'absolute',
          right: 18,
          zIndex: 12,
        }}
      />

      {/* Secondary bottom edge - softer shadow */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(10, 94, 77, 0.08)',
          borderRadius: 999,
          bottom: 3.5,
          height: 1.2,
          left: 24,
          position: 'absolute',
          right: 24,
          zIndex: 11,
        }}
      />

      {/* Top-left inner light - soft pearl illumination */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.52)', 'rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.45, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: resolvedRadius,
          height: '50%',
          left: 0,
          opacity: 0.88,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 10,
        }}
      />

      {/* Soft mint inner glow - very subtle, light only */}
      <LinearGradient
        colors={['rgba(132, 228, 229, 0.14)', 'rgba(132, 228, 229, 0.04)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.42, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: resolvedRadius,
          height: '55%',
          left: 0,
          opacity: 0.72,
          position: 'absolute',
          right: 0,
          top: 0,
          zIndex: 9,
        }}
      />

      {/* Bottom-right depth shadow - ambient occlusion, darker */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', 'rgba(10, 94, 77, 0.08)', 'rgba(10, 94, 77, 0.16)']}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.65, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={{
          borderRadius: resolvedRadius,
          bottom: 0,
          height: '50%',
          left: 0,
          opacity: 0.88,
          position: 'absolute',
          right: 0,
          zIndex: 9,
        }}
      />

      {/* Right edge subtle refraction - very faint */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0)', 'rgba(18, 184, 148, 0.08)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 0.5 }}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        style={{
          borderRadius: resolvedRadius,
          bottom: 0,
          opacity: 0.62,
          position: 'absolute',
          right: 0,
          top: 0,
          width: '10%',
          zIndex: 8,
        }}
      />

      {/* Left edge subtle refraction - very faint */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 1, y: 0.5 }}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0.5 }}
        style={{
          borderRadius: resolvedRadius,
          bottom: 0,
          left: 0,
          opacity: 0.55,
          position: 'absolute',
          top: 0,
          width: '8%',
          zIndex: 8,
        }}
      />

      {/* Glass shine streak - diagonal reflection, very subtle */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0)']}
        end={{ x: 0.85, y: 0.55 }}
        locations={[0, 0.45, 1]}
        pointerEvents="none"
        start={{ x: 0.15, y: 0.45 }}
        style={{
          borderRadius: resolvedRadius,
          height: '22%',
          left: 0,
          opacity: 0.78,
          position: 'absolute',
          right: 0,
          top: '10%',
          zIndex: 11,
        }}
      />

      <View style={{ padding: resolvedPadding }}>{children}</View>
    </View>
  );
}

export default GlassCard;
