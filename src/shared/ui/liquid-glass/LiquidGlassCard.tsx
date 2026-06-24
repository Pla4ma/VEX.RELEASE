import React from 'react';
import { type ViewStyle } from 'react-native';
import { NativeGlassSurface } from '../../../components/glass/native/NativeGlassSurface';
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
  const padding = compact
    ? liquidGlassSpacing.cardCompact
    : liquidGlassSpacing.card;

  return (
    <NativeGlassSurface
      variant={emphasized ? 'hero' : 'regular'}
      radius={liquidGlassRadii.card}
      style={style}
      contentStyle={{ padding }}
    >
      {children}
    </NativeGlassSurface>
  );
}