import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export type VexSurfaceTone = 'base' | 'hero' | 'quiet' | 'accent';

interface VexSurfaceProps {
  children: ReactNode;
  tone?: VexSurfaceTone;
  style?: ViewStyle;
  testID?: string;
}

export function VexSurface({
  children,
  tone = 'base',
  style,
  testID,
}: VexSurfaceProps): React.JSX.Element {
  const { theme } = useTheme();
  const isHero = tone === 'hero';
  const isAccent = tone === 'accent';

  return (
    <View
      style={[
        {
          backgroundColor: isHero
            ? theme.colors.background.elevated
            : isAccent
              ? theme.colors.surface.button
              : tone === 'quiet'
                ? theme.colors.background.secondary
                : theme.colors.surface.card,
          borderColor: isHero
            ? theme.colors.border.strong
            : theme.colors.border.DEFAULT,
          borderRadius: isHero ? theme.borderRadius['2xl'] : theme.borderRadius.xl,
          borderWidth: 1,
          overflow: 'hidden',
          shadowColor: theme.colors.semantic.shadow,
          shadowOffset: { width: 0, height: isHero ? 14 : 8 },
          shadowOpacity: isHero ? 0.28 : 0.16,
          shadowRadius: isHero ? 24 : 16,
          elevation: isHero ? 8 : 3,
        },
        style,
      ]}
      testID={testID}
    >
      {isHero ? (
        <View
          pointerEvents="none"
          style={{
            backgroundColor: theme.colors.primary[500],
            height: 2,
            left: theme.spacing[4],
            opacity: 0.88,
            position: 'absolute',
            right: theme.spacing[4],
            top: 0,
          }}
        />
      ) : null}
      {children}
    </View>
  );
}
