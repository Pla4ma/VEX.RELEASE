import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import {
  resolveVariant,
  SIZE_PADDING,
  SIZE_RADIUS,
  type GlassCardSize,
  type GlassCardVariant,
} from './GlassCard.tokens';
import { NativeLiquidGlass } from './native/NativeLiquidGlass';

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

/**
 * Glass card primitive. Routes to native liquid glass (iOS 26+) with real-time
 * refraction, or falls back to expo-glass-effect / BlurView on other platforms.
 *
 * No opaque backgrounds, no gradient overlays, no CSS fake glass.
 * The native glass provides its own highlights, refraction, and depth.
 */
export const GlassCard: React.ComponentType<GlassCardProps> = React.memo(
  function GlassCard({
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
    const showTopBar =
      variant === 'hero' || variant === 'premium' || variant === 'selected';

    return (
      <NativeLiquidGlass
        accessibilityLabel={accessibilityLabel}
        accessible={accessibilityLabel ? true : undefined}
        interactive={variant === 'premium' || variant === 'selected'}
        radius={resolvedRadius}
        tintColor={glowMint ? 'rgba(95,230,197,0.08)' : 'transparent'}
        testID={testID}
        style={[
          {
            borderColor: v.borderColor,
            borderWidth: 0.5,
          },
          style,
        ]}
      >
        {showTopBar && v.accentTopBar ? (
          <View
            pointerEvents="none"
            style={{
              backgroundColor: v.accentTopBar,
              height: 2.5,
              borderTopLeftRadius: resolvedRadius,
              borderTopRightRadius: resolvedRadius,
              opacity: 0.7,
            }}
          />
        ) : null}
        <View style={{ padding: resolvedPadding }}>
          {children}
        </View>
      </NativeLiquidGlass>
    );
  },
);
