import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../theme/ThemeContext';
import { vexFire } from '../../theme/tokens/vex-fire';

/** Backward-compatible alias for the screen atmosphere variant. */
export type GlassScreenAtmosphereVariant = 'home' | 'focus' | 'progress' | 'profile' | 'default';


interface GlassScreenProps {
  children: ReactNode;
  showAura?: boolean;
  contentStyle?: ViewStyle;
  testID?: string;
  variant?: GlassScreenAtmosphereVariant;
}

export const GlassScreen: React.ComponentType<GlassScreenProps> = React.memo(function GlassScreen({
  children,
  contentStyle,
  testID,
  showAura,
  variant,
}: GlassScreenProps): React.ReactNode {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const atmosphereColor = variant === 'focus'
    ? theme.colors.primary[900]
    : variant === 'progress'
      ? theme.colors.semantic.secondary
      : theme.colors.background.secondary;
  const screenBackground = variant === 'home' || variant === 'focus'
    ? vexFire.background
    : theme.colors.background.primary;

  return (
    <View
      style={{ backgroundColor: screenBackground, flex: 1, overflow: 'hidden' }}
      testID={testID}
    >
      {showAura ? (
        <LinearGradient
          colors={[atmosphereColor, theme.colors.background.primary, theme.colors.background.primary]}
          locations={[0, 0.42, 1]}
          pointerEvents="none"
          style={{
            height: theme.spacing[24] * 2,
            left: 0,
            opacity: 0.42,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
      ) : null}
      <View
        style={[
          { flex: 1, paddingTop: insets.top },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
});
