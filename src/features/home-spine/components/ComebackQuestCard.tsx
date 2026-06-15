/**
 * ComebackQuestCard Component
 *
 * Mini card for home screen showing active streak restoration quest.
 * "Complete 3 sessions this week to restore your X-day streak"
 *
 * @phase 2.3
 */

import React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';

import { ComebackQuestCardSkeleton } from './ComebackQuestCardSkeleton';

export type { ComebackQuestCardSkeleton } from './ComebackQuestCardSkeleton';

export interface ComebackQuestCardProps {
  /** Original streak days that can be restored */
  originalStreak: number;
  /** Number of sessions completed toward the 3-session goal */
  sessionsCompleted: number;
  /** Number of sessions required (typically 3) */
  sessionsRequired: number;
  /** XP multiplier bonus active during comeback */
  multiplier: number;
  /** Called when user taps to start comeback session */
  onPress: () => void;
  /** Loading state */
  isLoading?: boolean;
}

export function ComebackQuestCard({
  originalStreak,
  sessionsCompleted,
  sessionsRequired,
  multiplier,
  onPress,
  isLoading = false,
}: ComebackQuestCardProps): JSX.Element | null {
  const { theme } = useTheme();

  // Don't show if quest is complete
  if (sessionsCompleted >= sessionsRequired) {
    return null;
  }

  const progressPercent = (sessionsCompleted / sessionsRequired) * 100;
  const sessionsRemaining = sessionsRequired - sessionsCompleted;

  if (isLoading) {
    return <ComebackQuestCardSkeleton />;
  }

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(200)}>
      <Pressable
        onPress={onPress}
        accessibilityLabel="Comeback quest card"
        accessibilityRole="button"
        accessibilityHint="Double tap to start comeback session"
      >
        <Box
          mx="lg"
          mb="md"
          p="lg"
          borderRadius="xl"
          bg={`${theme.colors.warning[50]}80`}
          borderWidth={2}
          borderColor={theme.colors.warning.DEFAULT}
          style={{
            boxShadow: `0px 2px 4px ${theme.colors.warning.DEFAULT} / 0.85`,
          }}
        >
          {/* Header */}
          <Box flexDirection="row" alignItems="center" gap="md" mb="md">
            <Box
              width={48}
              height={48}
              borderRadius="full"
              bg={`${theme.colors.warning.DEFAULT}20`}
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={24} />
            </Box>
            <Box flex={1}>
              <Text variant="h4" color={theme.colors.text.primary}>
                Streak Restoration Quest
              </Text>
              <Text variant="caption" color={theme.colors.warning.dark}>
                Complete {sessionsRequired} sessions to restore your{' '}
                {originalStreak}-day streak
              </Text>
            </Box>
          </Box>

          {/* Progress bar */}
          <Box mb="md">
            <Box flexDirection="row" justifyContent="space-between" mb="xs">
              <Text variant="caption" color={theme.colors.text.secondary}>
                Progress
              </Text>
              <Text
                variant="caption"
                color={theme.colors.text.primary}
                fontWeight="600"
              >
                {sessionsCompleted} / {sessionsRequired}
              </Text>
            </Box>
            <Box
              height={12}
              borderRadius="full"
              bg={theme.colors.background.tertiary}
              overflow="hidden"
            >
              <Box
                width={`${progressPercent}%`}
                height="100%"
                borderRadius="full"
                bg={theme.colors.warning.DEFAULT}
              />
            </Box>
          </Box>

          {/* Session dots */}
          <Box flexDirection="row" gap="sm" mb="md">
            {Array.from({ length: sessionsRequired }).map((_, index) => (
              <Box
                key={index}
                flex={1}
                height={8}
                borderRadius="full"
                bg={
                  index < sessionsCompleted
                    ? theme.colors.warning.DEFAULT
                    : theme.colors.background.tertiary
                }
                opacity={index < sessionsCompleted ? 1 : 0.5}
              />
            ))}
          </Box>

          {/* Bonus info */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            p="md"
            borderRadius="lg"
            bg={theme.colors.background.primary}
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Text fontSize={16} />
              <Text variant="bodySmall" color={theme.colors.text.secondary}>
                {multiplier.toFixed(1)}x XP bonus active
              </Text>
            </Box>
            <Text
              variant="caption"
              color={theme.colors.primary[500]}
              fontWeight="700"
            >
              {sessionsRemaining} more session
              {sessionsRemaining !== 1 ? 's' : ''} →
            </Text>
          </Box>
        </Box>
      </Pressable>
    </Animated.View>
  );
}

export default ComebackQuestCard;