/**
 * GlassSurface — frosted glass wrapper for inputs + cards. Uses
 * SafeBlurView with a light tint for the new dawn-sky visual layer.
 */
import React, { useMemo } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { etherealGlass } from '@/theme/tokens/ethereal-sky';
import { SafeBlurView } from '../SafeBlurView';

type GlassSurfaceProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'subtle' | 'strong';
  borderRadius?: number;
  /** When true, the surface uses a stronger fill (e.g. for selected cards). */
  selected?: boolean;
  /** Optional shadow elevation. */
  elevation?: 'soft' | 'none';
} & Pick<ViewProps, 'accessibilityLabel' | 'accessibilityRole'>;

export function GlassSurface({
  children,
  style,
  intensity = 'subtle',
  borderRadius = 24,
  selected = false,
  elevation = 'soft',
  accessibilityLabel,
  accessibilityRole,
}: GlassSurfaceProps): React.JSX.Element {
  const fill = selected
    ? etherealGlass.fillStrong
    : intensity === 'strong'
      ? etherealGlass.fillStrong
      : etherealGlass.fill;

  const containerStyle = useMemo<ViewStyle>(
    () => ({
      backgroundColor: fill,
      borderRadius,
      borderWidth: 1,
      borderColor: selected ? 'rgba(10, 10, 10, 0.10)' : etherealGlass.border,
      overflow: 'hidden',
      shadowColor: etherealGlass.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: elevation === 'soft' ? 0.18 : 0,
      shadowRadius: 40,
    }),
    [fill, borderRadius, selected, elevation],
  );

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      style={[containerStyle, style]}
    >
      <SafeBlurView intensity={selected ? 50 : 30} tint="light" style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>{children}</View>
      </SafeBlurView>
    </View>
  );
}
