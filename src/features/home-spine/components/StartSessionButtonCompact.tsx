import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { StartSessionButtonProps } from './StartSessionButton';
import { useStartSessionButtonColors } from './start-session-button-colors';
import { sessionStart } from '../../../utils/haptics';

export function StartSessionButtonCompact({
  onPress,
  isLoading,
  streakRiskLevel = 'NONE',
  hasActiveSession = false,
}: Omit<StartSessionButtonProps, 'label' | 'subtitle'>): JSX.Element {
  const { theme } = useTheme();
  const colors = useStartSessionButtonColors(streakRiskLevel, hasActiveSession);
  return (
    <Pressable
      onPress={() => { sessionStart(); onPress?.(); }}
      disabled={isLoading}
      accessibilityLabel={hasActiveSession ? 'Resume focus session' : 'Start focus session'}
      accessibilityRole="button"
      accessibilityHint="Double tap to begin focusing"
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        gap="sm"
        px="lg"
        py="md"
        borderRadius="xl"
        style={{ backgroundColor: colors.gradient[0] }}
      >
        <Text fontSize={18} />
        <Text
          variant="body"
          color={theme.colors.text.inverse}
          fontWeight="600"
        >
          {hasActiveSession ? 'Resume' : 'Start Session'}
        </Text>
      </Box>
    </Pressable>
  );
}
