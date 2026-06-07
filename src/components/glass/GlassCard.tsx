import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { glassRadius, vexLightGlass } from '../../theme/tokens/vex-light-glass';
import {
  resolveVariant,
  SIZE_PADDING,
  SIZE_RADIUS,
  type GlassCardSize,
  type GlassCardVariant,
} from './GlassCard.tokens';
import { GlassSurface } from './GlassSurface';

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
  const resolvedPadding = padding ?? (size ? SIZE_PADDING[size] : 20);
  const resolvedRadius = radius ?? (size ? SIZE_RADIUS[size] : glassRadius.card);
  const surfaceVariant =
    variant === 'hero' ? 'hero'
    : variant === 'premium' ? 'premium'
    : variant === 'strong' ? 'strong'
    : variant === 'subtle' ? 'subtle'
    : 'default';
  const showTopBar = variant === 'hero' || variant === 'premium';
  void vexLightGlass;

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessible={accessibilityLabel ? true : undefined}
      style={[
        glowMint
          ? {
              shadowColor: '#42CFAE',
              shadowOffset: { width: 0, height: 14 },
              shadowOpacity: 0.5,
              shadowRadius: 32,
            }
          : null,
        style,
      ]}
    >
      <GlassSurface
        accentTopBar={showTopBar}
        bordered
        radius={resolvedRadius}
        style={{
          shadowColor: v.shadowColor,
          shadowOffset: v.shadowOffset,
          shadowOpacity: v.shadowOpacity,
          shadowRadius: v.shadowRadius,
        }}
        testID={testID}
        topBarColor="#42CFAE"
        variant={surfaceVariant}
      >
        <View style={{ padding: resolvedPadding }}>{children}</View>
      </GlassSurface>
    </View>
  );
}

export default GlassCard;
