import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useTheme } from '../../../theme';
import { liquidGlassRadii, liquidGlassSpacing } from './liquidGlassTokens';

type LiquidGlassCardProps = {
  children: React.ReactNode;
  compact?: boolean;
  emphasized?: boolean;
  style?: ViewStyle;
};

export function LiquidGlassCard({
  children,
  compact = false,
  emphasized = false,
  style,
}: LiquidGlassCardProps): React.JSX.Element {
  const { theme } = useTheme();
  const padding = compact
    ? liquidGlassSpacing.cardCompact
    : liquidGlassSpacing.card;

  return (
    <BlurView
      intensity={emphasized ? 78 : 58}
      tint="light"
      style={[
        {
          backgroundColor: emphasized
            ? theme.colors.semantic.liquidGlassStrong
            : theme.colors.semantic.liquidGlass,
          borderColor: emphasized
            ? theme.colors.semantic.borderStrong
            : theme.colors.semantic.liquidGlassBorder,
          borderRadius: liquidGlassRadii.card,
          borderWidth: 1,
          elevation: emphasized ? 8 : 5,
          overflow: 'hidden',
          padding,
          shadowColor: theme.colors.semantic.shadow,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: emphasized ? 0.22 : 0.14,
          shadowRadius: emphasized ? 28 : 18,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          backgroundColor: theme.colors.semantic.liquidGlassHighlight,
          height: 3,
          left: liquidGlassSpacing.hairlineInset,
          opacity: 0.78,
          position: 'absolute',
          right: liquidGlassSpacing.hairlineInset,
          top: 6,
        }}
      />
      {children}
    </BlurView>
  );
}
