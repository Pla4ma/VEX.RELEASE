import React from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '../../../theme';
import { AnimatedGradientBorder } from './AnimatedGradientBorder';

interface AuthCommandPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function AuthCommandPanel({ children, style }: AuthCommandPanelProps): JSX.Element {
  const { theme } = useTheme();

  return (
    <AnimatedGradientBorder
      borderRadius={theme.borderRadius['2xl']}
      gradientColors={[
        'rgba(0,229,255,0.15)',
        'rgba(139,92,246,0.10)',
        'rgba(0,229,255,0.15)',
      ]}
    >
      <View
        style={[
          {
            backgroundColor: theme.colors.semantic.backgroundElevated,
            padding: theme.spacing[6],
            gap: theme.spacing[5],
          },
          style,
        ]}
      >
        {children}
      </View>
    </AnimatedGradientBorder>
  );
}

export default AuthCommandPanel;
