import React from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';

interface EmptyVaultProps {
  onGetChest: () => void;
}

export function EmptyVault({ onGetChest }: EmptyVaultProps): React.ReactNode {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        py="3xl"
        px="lg"
      >
        <Box
          width={120}
          height={120}
          borderRadius="full"
          bg={theme.colors.background.tertiary}
          justifyContent="center"
          alignItems="center"
          mb="xl"
        >
          <Text fontSize={48}>📦</Text>
        </Box>

        <Text variant="h3" color="text.primary" textAlign="center" mb="md">
          Your Vault is Empty
        </Text>

        <Text variant="body" color="text.secondary" textAlign="center" mb="2xl">
          Complete focus sessions to earn chests! Longer sessions and higher
          purity scores give better rewards.
        </Text>

        <Button
          <Text>variant="primary"</Text>
          size="lg"
          onPress={onGetChest}
          accessibilityLabel="Start a session"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        >
          Start a Session
        </Button>
      </Box>
    </Animated.View>
  );
}
