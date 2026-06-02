import React from 'react';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import type { FocusDuration, FocusGoal } from '../schemas';
import { DURATION_OPTIONS, GOAL_OPTIONS } from '../service';

/**
 * Pulsing circle animation for excitement
 */
export function PulseRing(): JSX.Element {
  const { theme } = useTheme();

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withTiming(1.3, { duration: 1500 }), -1, true),
      },
    ],
    opacity: withRepeat(withTiming(0.3, { duration: 1500 }), -1, true),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: `${theme.colors.success[500]}40`,
        },
        pulseStyle,
      ]}
    />
  );
}

/**
 * Session preview card
 */
export function SessionPreview({
  duration,
  goal,
}: {
  duration: FocusDuration | null;
  goal: FocusGoal | null;
}): JSX.Element {
  const { theme } = useTheme();

  const durationOption = DURATION_OPTIONS.find((d) => d.value === duration);
  const goalOption = GOAL_OPTIONS.find((g) => g.key === goal);

  return (
    <Box
      p="lg"
      borderRadius="xl"
      bg="background.secondary"
      borderWidth={1}
      borderColor="border.light"
      alignItems="center"
      gap="md"
    >
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={40}>{durationOption?.emoji ?? ''}</Text>
        <Text variant="h2" color="text.primary" fontWeight="700">
          {durationOption?.label ?? '25 min'}
        </Text>
      </Box>

      {goalOption && (
        <Box
          flexDirection="row"
          alignItems="center"
          gap="xs"
          px="md"
          py="sm"
          borderRadius="full"
          bg={`${theme.colors.primary[500]}15`}
        >
          <Text fontSize={14}>{goalOption.emoji}</Text>
          <Text variant="caption" color="primary.500" fontWeight="600">
            {goalOption.label}
          </Text>
        </Box>
      )}

      <Text variant="bodySmall" color="text.tertiary">
        Estimated: {Math.round((duration ?? 25) * 2)} XP
      </Text>
    </Box>
  );
}
