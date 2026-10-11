import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeContext';
import {
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
  glowFire?: boolean;
  flush?: boolean;
}

function getCardSurface(
  variant: GlassCardVariant,
  colors: ReturnType<typeof useTheme>['theme']['colors'],
): string {
  switch (variant) {
    case 'subtle':
      return colors.background.secondary;
    case 'strong':
      return colors.surface.selected;
    case 'hero':
    case 'premium':
      return colors.background.secondary;
    case 'selected':
      return colors.surface.selected;
    case 'success':
      return colors.background.secondary;
    case 'warning':
      return colors.background.secondary;
    default:
      return colors.surface.card;
  }
}

export const GlassCard: React.ComponentType<GlassCardProps> = React.memo(
  function GlassCard({
    children,
    variant = 'default',
    size = 'md',
    padding,
    radius,
    style,
    testID,
    accessibilityLabel,
    glowMint = false,
    glowFire = false,
  }: GlassCardProps): React.ReactNode {
    const { theme } = useTheme();
    const resolvedPadding = padding ?? SIZE_PADDING[size];
    const resolvedRadius = radius ?? SIZE_RADIUS[size];
    const topAccent =
      glowFire || variant === 'warning'
        ? theme.colors.semantic.primary
        : glowMint || variant === 'hero' || variant === 'premium'
          ? theme.colors.semantic.secondary
          : undefined;

    return (
      <View
        accessible={accessibilityLabel ? true : undefined}
        accessibilityLabel={accessibilityLabel}
        style={[
          {
            backgroundColor: getCardSurface(variant, theme.colors),
            borderColor:
              variant === 'hero' || variant === 'premium'
                ? theme.colors.border.DEFAULT
                : theme.colors.border.light,
            borderRadius: resolvedRadius,
            borderWidth: 1,
            elevation: variant === 'hero' || variant === 'premium' ? 4 : 2,
            shadowColor: theme.colors.semantic.shadow,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.16,
            shadowRadius: 12,
          },
          style,
        ]}
        testID={testID}
      >
        {topAccent ? (
          <View
            pointerEvents="none"
            style={{
              backgroundColor: topAccent,
              borderTopLeftRadius: resolvedRadius,
              borderTopRightRadius: resolvedRadius,
              height: 3,
              opacity: 0.9,
            }}
          />
        ) : null}
        <View style={{ padding: resolvedPadding }}>{children}</View>
      </View>
    );
  },
);
