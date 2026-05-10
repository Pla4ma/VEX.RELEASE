/**
 * StreakRecoveryBanner Component
 *
 * Shows 24-hour recovery mission after streak break.
 * "Complete 3 sessions in 24h to restore your [N]-day streak"
 * Progress indicator. Success = streak restored + "Comeback King" badge.
 *
 * @phase 3C.3
 */

<<<<<<< HEAD
import React from "react";
import Animated, { useAnimatedStyle, withSpring, withRepeat, withSequence } from "react-native-reanimated";
=======
import React from 'react';
import Animated, { useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
>>>>>>> f194c8d66eb6369eff18df0a003c89e538923452

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface StreakRecoveryBannerProps {
  /** Original streak that was lost */
  originalStreak: number;
  /** Current progress (sessions completed) */
  sessionsCompleted: number;
  /** Total sessions needed */
  sessionsNeeded: number;
  /** Hours remaining */
  hoursRemaining: number;
  /** Whether recovery is complete */
  isComplete: boolean;
}

/**
 * Progress bar for recovery
 */
function RecoveryProgress({ completed, total }: { completed: number; total: number }): JSX.Element {
  const { theme } = useTheme();
  const progress = completed / total;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${withSpring(progress * 100, { damping: 15, stiffness: 100 })}%`,
  }));

  return (
    <Box gap="sm">
      <Box height={8} borderRadius="full" bg="background.tertiary" overflow="hidden">
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
function ComebackKingBadge(): JSX.Element {
  const { theme } = useTheme();

  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withRepeat(withSequence(withSpring(1.1, { damping: 3, stiffness: 200 }), withSpring(1, { damping: 3, stiffness: 200 })), -1, true),
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

/**
 * Streak recovery banner
 */
export function StreakRecoveryBanner({ originalStreak, sessionsCompleted, sessionsNeeded, hoursRemaining, isComplete }: StreakRecoveryBannerProps): JSX.Element {
  const { theme } = useTheme();

  // Don't show if recovery complete
  if (isComplete) {
    return (
      <Box m="lg" p="lg" borderRadius="xl" bg={`${theme.colors.accent.purple}15`} borderWidth={2} borderColor="accent.purple" alignItems="center" gap="md">
        <ComebackKingBadge />
        <Text variant="h4" color="text.primary" textAlign="center">
          Streak Restored!
        </Text>
        <Text variant="body" color="text.secondary" textAlign="center">
          Your {originalStreak}-day streak is back. Legendary comeback!
        </Text>
      </Box>
    );
  }

  // Don't show if time expired
  if (hoursRemaining <= 0) {
    return <></>;
  }

  return (
    <Box m="lg" p="lg" borderRadius="xl" bg={`${theme.colors.accent.orange}15`} borderWidth={2} borderColor="accent.orange" gap="md">
      {/* Header */}
      <Box flexDirection="row" alignItems="center" gap="sm">
        <Text fontSize={24}>⚡</Text>
        <Box flex={1}>
          <Text variant="h4" color="text.primary">
            Recovery Mission
          </Text>
          <Text variant="bodySmall" color="text.tertiary">
            {hoursRemaining} hours remaining
          </Text>
        </Box>
      </Box>

      {/* Goal */}
      <Text variant="body" color="text.secondary">
        Complete{' '}
        <Text color="accent.orange" fontWeight="700">
          {sessionsNeeded} sessions
        </Text>{' '}
        to restore your{' '}
        <Text color="text.primary" fontWeight="700">
          {originalStreak}-day streak
        </Text>
      </Text>

      {/* Progress */}
      <RecoveryProgress completed={sessionsCompleted} total={sessionsNeeded} />

      {/* Motivation */}
      {sessionsCompleted > 0 && (
        <Box p="sm" borderRadius="lg" bg={`${theme.colors.accent.orange}20`}>
          <Text variant="caption" color="accent.orange" textAlign="center">
            {sessionsCompleted === sessionsNeeded - 1 ? '🔥 One more session to restore your streak!' : '💪 Keep going! Each session brings you closer.'}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default StreakRecoveryBanner;
