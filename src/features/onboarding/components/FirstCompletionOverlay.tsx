import React, { useEffect } from 'react';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { Button } from '../../../components/primitives/Button';
import { useTheme } from '../../../theme';

interface FirstCompletionOverlayProps {
  xpEarned: number;
  onComplete: () => void;
}

function SessionCompleteCard(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeInUp.duration(500).delay(200)}>
      <Box
        p="xl"
        borderRadius="xl"
        bg="background.secondary"
        borderWidth={1}
        borderColor="border.light"
        alignItems="center"
        gap="lg"
      >
        <Box alignItems="center" gap="sm">
          <Text variant="h3" color="text.primary" textAlign="center" fontWeight="700">
            First session complete.
          </Text>
          <Text variant="bodyLarge" color="text.secondary" textAlign="center">
            VEX is learning what helps you start.
          </Text>
        </Box>

        {/* Progress proof: single stat line */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          gap="sm"
          mt="md"
        >
          <Box alignItems="center" gap="xs" px="lg">
            <Text fontSize={28}>✅</Text>
            <Text variant="caption" color="text.tertiary">
              Done
            </Text>
          </Box>
          <Text fontSize={20} color="text.tertiary">
            →
          </Text>
          <Box alignItems="center" gap="xs" px="lg">
            <Text fontSize={28}>🌱</Text>
            <Text variant="caption" color="text.tertiary">
              Learning
            </Text>
          </Box>
          <Text fontSize={20} color="text.tertiary">
            →
          </Text>
          <Box alignItems="center" gap="xs" px="lg">
            <Text fontSize={28}>✨</Text>
            <Text variant="caption" color="text.tertiary">
              Adapting
            </Text>
          </Box>
        </Box>
      </Box>
    </Animated.View>
  );
}

function ComebackCTA({ onPress }: { onPress: () => void }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View
      entering={FadeIn.duration(400).delay(1800)}
      style={{ width: '100%' }}
    >
      <Box gap="md" mt="xl" width="100%">
        <Text variant="body" color="text.secondary" textAlign="center">
          Come back tomorrow and VEX will be ready.
        </Text>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={onPress}
          accessibilityLabel="Enter VEX"
          accessibilityRole="button"
          accessibilityHint="Opens the VEX home screen"
        >
          Enter VEX
        </Button>
      </Box>
    </Animated.View>
  );
}

export function FirstCompletionOverlay({
  xpEarned: _xpEarned,
  onComplete,
}: FirstCompletionOverlayProps): JSX.Element {
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      exiting={FadeOut.duration(400)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.colors.background.primary,
        zIndex: 1000,
      }}
    >
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        px="xl"
        gap="xl"
      >
        {/* Title */}
        <Animated.View entering={FadeInUp.duration(500).delay(200)}>
          <Box alignItems="center" gap="sm">
            <Text variant="label" color="success.DEFAULT">
              Session complete
            </Text>
          </Box>
        </Animated.View>

        {/* Central message card */}
        <SessionCompleteCard />

        {/* CTA */}
        <ComebackCTA onPress={onComplete} />

        {/* Auto-dismiss indicator */}
        <Animated.View
          entering={FadeIn.duration(400).delay(3500)}
        >
          <Text variant="caption" color="text.tertiary">
            Continuing in a moment...
          </Text>
        </Animated.View>
      </Box>
    </Animated.View>
  );
}

export default FirstCompletionOverlay;
