/**
 * Recovery sub-components for StreakRecoveryBanner
 *
 * @phase 3C.3
 */

import React from 'react';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

/**
 * Progress bar for recovery
 */
export function RecoveryProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}): React.ReactNode {
  const { theme } = useTheme();
  const progress = completed / total;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${withSpring(progress * 100, { damping: 15, stiffness: 100 })}%`,
  }));

  return (
    <Box gap="sm">
      <Box
        height={8}
        borderRadius="full"
        bg="background.tertiary"
        overflow="hidden"
      >
        <Animated.View
          style={[
            {
              height: '100%',
              borderRadius: 4,
              backgroundColor: theme.colors.accent.orange,
            },
            progressStyle,
          ]}
        />
      </Box>
      <Box flexDirection="row" justifyContent="space-between">
        <Text variant="caption" color="text.tertiary">
          Progress
        </Text>
        <Text variant="caption" color="text.primary" fontWeight="600">
          {completed}/{total} sessions
        </Text>
      </Box>
    </Box>
  );
}

/**
 * Comeback King badge (shown when complete)
 */
export function ComebackKingBadge(): React.ReactNode {
  const { theme } = useTheme();

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(
          withSequence(
            withSpring(1.1, { damping: 3, stiffness: 200 }),
            withSpring(1, { damping: 3, stiffness: 200 }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: theme.colors.accent.purple,
        },
        bounceStyle,
      ]}
    >
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={16}>👑</Text>
        <Text variant="caption" color="text.inverse" fontWeight="800">
          COMEBACK KING
        </Text>
      </Box>
    </Animated.View>
  );
}
