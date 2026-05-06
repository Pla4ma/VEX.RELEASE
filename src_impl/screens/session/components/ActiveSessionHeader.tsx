import React from 'react';
import { Pressable } from 'react-native';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import type { useTheme } from '../../../theme';

type ActiveSessionHeaderProps = {
  isPaused: boolean;
  onInterrupt: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
};

export function ActiveSessionHeader({
  isPaused,
  onInterrupt,
  theme,
}: ActiveSessionHeaderProps): JSX.Element {
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      p="lg"
      pt="xl"
      style={{ zIndex: 2 }}
    >
      <Pressable
        accessibilityHint="Opens the session interruption confirmation."
        accessibilityLabel="Go back or end session"
        accessibilityRole="button"
        onPress={onInterrupt}
      >
        <Box flexDirection="row" alignItems="center">
          <Icon name="chevron-left" size="lg" color={theme.colors.text.secondary} />
          <Text variant="caption" color="text.secondary" style={{ marginLeft: 4 }}>Exit</Text>
        </Box>
      </Pressable>
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Box
          width={8}
          height={8}
          borderRadius="full"
          bg={isPaused ? 'warning.DEFAULT' : 'success.DEFAULT'}
        />
        <Text variant="caption" color="text.secondary">
          {isPaused ? 'Paused' : 'In Session'}
        </Text>
      </Box>
      <Box width={40} />
    </Box>
  );
}
