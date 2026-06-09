import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  resolveVariant,
  SIZE_PADDING,
  SIZE_RADIUS,
  type GlassCardSize,
  type GlassCardVariant,
} from './GlassCard.tokens';
import {
  CardTopHighlight,
  CardInnerGlow,
  CardBottomShadow,
  CardEdgeRefraction,
  CardShineStreak,
} from './GlassCard.highlights';

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

      {/* Top edge white glass highlight */}
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

      {/* Secondary top edge highlight */}
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

      {/* Bottom inner shadow */}
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

      <CardTopHighlight color="rgba(255, 255, 255, 0.52)" radius={resolvedRadius} />
      <CardInnerGlow color="rgba(132, 228, 229, 0.12)" radius={resolvedRadius} />
      <CardBottomShadow radius={resolvedRadius} />
      <CardEdgeRefraction side="right" />
      <CardEdgeRefraction side="left" />
      <CardShineStreak radius={resolvedRadius} />

      <View style={{ padding: resolvedPadding }}>{children}</View>
    </View>
  );
}

export default GlassCard;
