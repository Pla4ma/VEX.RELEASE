import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { StartSessionButtonProps } from './StartSessionButton';
import { useStartSessionButtonColors } from './start-session-button-colors';

export function StartSessionButtonCompact({ onPress, isLoading, streakRiskLevel = 'NONE', hasActiveSession = false }: Omit<StartSessionButtonProps, 'label' | 'subtitle'>): JSX.Element {
  const { theme } = useTheme();
  const colors = useStartSessionButtonColors(streakRiskLevel, hasActiveSession);
  return (
    <Pressable onPress={onPress} disabled={isLoading} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
      <Box flexDirection="row" alignItems="center" justifyContent="center" gap="sm" px="lg" py="md" borderRadius="xl" style={{ backgroundColor: colors.gradient[0] }}>
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.text.inverse} />
        ) : (
          <>
            <Text fontSize={18}>{hasActiveSession ? '▶️' : '🔥'}</Text>
            <Text variant="body" color={theme.colors.text.inverse} fontWeight="600">
              {hasActiveSession ? 'Resume' : 'Start Session'}
            </Text>
          </>
        )}
      </Box>
    </Pressable>
  );
}
