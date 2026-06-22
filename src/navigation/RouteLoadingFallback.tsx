import React from 'react';
import { View } from 'react-native';

import { Text } from '../components/primitives/Text';
import { useTheme } from '../theme/ThemeContext';

interface RouteLoadingFallbackProps {
  label?: string;
}

export function RouteLoadingFallback({
  label = 'Loading',
}: RouteLoadingFallbackProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.primary,
        flex: 1,
        gap: theme.spacing[4],
        justifyContent: 'center',
        padding: theme.spacing[5],
      }}
    >
      <View style={{ gap: theme.spacing[2] }}>
        <Text color="text.secondary" variant="label">
          {label}
        </Text>
        <View
          style={{
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            height: theme.spacing[8],
            width: '72%',
          }}
        />
      </View>
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderColor: theme.colors.border.light,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          gap: theme.spacing[3],
          padding: theme.spacing[4],
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface.pressed,
            borderRadius: theme.borderRadius.sm,
            height: theme.spacing[4],
            width: '48%',
          }}
        />
        <View
          style={{
            backgroundColor: theme.colors.surface.pressed,
            borderRadius: theme.borderRadius.sm,
            height: theme.spacing[10],
            width: '100%',
          }}
        />
      </View>
    </View>
  );
}
