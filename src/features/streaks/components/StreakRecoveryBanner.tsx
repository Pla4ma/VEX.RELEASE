/**
 * StreakRecoveryBanner Component
 *
 * Shows 24-hour recovery mission after streak break.
 * "Complete 3 sessions in 24h to restore your [N]-day streak"
 * Progress indicator. Success = streak restored + "Comeback King" badge.
 *
 * @phase 3C.3
 */

import React from 'react';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import { RecoveryProgress, ComebackKingBadge } from './RecoverySubComponents';

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
 * Streak recovery banner
 */
export function StreakRecoveryBanner({
  originalStreak,
  sessionsCompleted,
  sessionsNeeded,
  hoursRemaining,
  isComplete,
}: StreakRecoveryBannerProps): React.ReactNode {
  const { theme } = useTheme();

  // Don't show if recovery complete
  if (isComplete) {
    return (
      <Box
        m="lg"
        p="lg"
        borderRadius="xl"
        bg={`${theme.colors.accent.purple}15`}
        borderWidth={2}
        borderColor="accent.purple"
        alignItems="center"
        gap="md"
      >
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
    <Box
      m="lg"
      p="lg"
      borderRadius="xl"
      bg={`${theme.colors.accent.orange}15`}
      borderWidth={2}
      borderColor="accent.orange"
      gap="md"
    >
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
            {sessionsCompleted === sessionsNeeded - 1
              ? '🔥 One more session to restore your streak!'
              : '💪 Keep going! Each session brings you closer.'}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default StreakRecoveryBanner;
