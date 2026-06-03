import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../../theme';

export function LiquidGlassPanel({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { theme } = useTheme();
  const semantic = theme.colors.semantic;

  return (
    <View
      style={{
        borderRadius: theme.borderRadius['3xl'],
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: semantic.liquidGlassBorder,
        backgroundColor: semantic.liquidPanel,
        shadowColor: semantic.liquidShadow,
        shadowOffset: { width: 0, height: 28 },
        shadowOpacity: 0.46,
        shadowRadius: 48,
      }}
    >
      <LinearGradient
        colors={[semantic.liquidGlassHighlight, semantic.liquidGlassStrong, semantic.liquidGlass]}
        locations={[0, 0.28, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.42 }}
      />
      <View style={{ padding: theme.spacing[5], gap: theme.spacing[3] }}>{children}</View>
    </View>
  );
}
