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
  GlassCardTopEdge,
  GlassCardSecondEdge,
  GlassCardBottomEdge,
  GlassCardBottomSecondaryEdge,
} from './GlassCard.edges';
import {
  GlassCardTopLight,
  GlassCardMintGlow,
  GlassCardBottomShadow,
  GlassCardRightEdge,
  GlassCardLeftEdge,
  GlassCardShineStreak,
} from './GlassCard.gradients';

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

export const GlassCard: React.FC<GlassCardProps> = React.memo(function GlassCard({
  children,
  variant = 'default',
  size,
  padding,
  radius,
  style,
  testID,
  accessibilityLabel,
  glowMint = false,
}: GlassCardProps): React.ReactNode {
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
          backgroundColor: v.background, borderColor: v.border,
          borderRadius: resolvedRadius, borderWidth: 1.35, elevation: 3, overflow: 'hidden',
          boxShadow: glowMint
            ? '0px 10px 22px rgba(18, 184, 148, 0.22)'
            : `0px 10px 22px ${v.shadowColor}`,
        },
        style,
      ]}
    >
      {showTopBar && v.accentTopBar ? (
        <View style={{ backgroundColor: v.accentTopBar, height: 2.5, opacity: 0.85, width: '100%' }} />
      ) : null}

      <GlassCardTopEdge resolvedRadius={resolvedRadius} />
      <GlassCardSecondEdge showTopBar={showTopBar && !!v.accentTopBar} />
      <GlassCardBottomEdge />
      <GlassCardBottomSecondaryEdge />
      <GlassCardTopLight resolvedRadius={resolvedRadius} />
      <GlassCardMintGlow resolvedRadius={resolvedRadius} />
      <GlassCardBottomShadow resolvedRadius={resolvedRadius} />
      <GlassCardRightEdge resolvedRadius={resolvedRadius} />
      <GlassCardLeftEdge resolvedRadius={resolvedRadius} />
      <GlassCardShineStreak resolvedRadius={resolvedRadius} />

      <View style={{ padding: resolvedPadding, zIndex: 20 }}>{children}</View>
    </View>
  );
});

export { GlassCard }