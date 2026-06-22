import React, { useState, useMemo } from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeInUp, Layout } from 'react-native-reanimated';
import { Box } from '../../../components/primitives/Box';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import {
  ChallengesWidgetSkeleton,
  ChallengesErrorState,
  ChallengesEmptyState,
} from './TodaysChallengesStates';
import { ChallengeProgressRow } from './ChallengeProgressRow';
import type { TodaysChallengesWidgetProps } from './todays-challenges-types';
import { Text as VexText } from '../../../components/primitives/Text';

export type { TodaysChallengesWidgetProps, ChallengeItem } from './todays-challenges-types';

/**
 * Main challenges widget component
 */
export function TodaysChallengesWidget({
  challenges,
  isLoading = false,
  error = null,
  onViewAll,
  onClaimReward,
  onRetry,
}: TodaysChallengesWidgetProps): React.ReactNode {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const stats = useMemo(() => {
    const completed = challenges.filter((c) => c.isCompleted).length;
    const claimable = challenges.filter(
      (c) => c.isCompleted && !c.isClaimed,
    ).length;
    return { completed, total: challenges.length, claimable };
  }, [challenges]);
  if (isLoading) {
    return <ChallengesWidgetSkeleton />;
  }
  return (
    <Animated.View
      entering={FadeInUp.duration(400).delay(300)}
      layout={Layout.springify()}
    >
      <Box
        m="lg"
        p="lg"
        borderRadius="xl"
        bg={theme.colors.background.secondary}
        borderWidth={1}
        borderColor={theme.colors.border.DEFAULT}
      >
        {/* Header - Always visible */}
        <Pressable
          onPress={() => setIsExpanded((prev) => !prev)}
          accessibilityLabel="Today's challenges"
          accessibilityRole="button"
          accessibilityHint="Double tap to view challenges"
        >
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Box
                width={40}
                height={40}
                borderRadius="lg"
                bg={`${theme.colors.accent.purple}20`}
                justifyContent="center"
                alignItems="center"
              >
                <Text fontSize={20} />
              </Box>
              <Box>
                <Text variant="h4" color="text.primary">
                  Today's Challenges
                </Text>
                {stats.total > 0 && (
                  <Text variant="caption" color="text.secondary">
                    {stats.completed}/{stats.total} completed
                    {stats.claimable > 0 && (
                      <Text
                        variant="caption"
                        color="success.DEFAULT"
                        fontWeight="600"
                      >
                        {' '}
                        · {stats.claimable} to claim!
                      </Text>
                    )}
                  </Text>
                )}
              </Box>
            </Box>
            {/* Expand/Collapse indicator */}
            <Text
              fontSize={20}
              color={theme.colors.text.tertiary}
              style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}
            >
              ›
            </Text>
          </Box>
        </Pressable>
        {/* Expanded Content */}
        {isExpanded && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Box mt="lg" gap="md">
              {error ? (
                <ChallengesErrorState onRetry={onRetry} />
              ) : challenges.length === 0 ? (
                <ChallengesEmptyState />
              ) : (
                <>
                  {challenges.slice(0, 3).map((challenge, index) => (
                    <Box key={challenge.id}>
                      <ChallengeProgressRow
                        challenge={challenge}
                        onClaim={onClaimReward}
                      />
                      {index < Math.min(challenges.length, 3) - 1 && (
                        <Box
                          height={1}
                          bg={theme.colors.border.light}
                          my="sm"
                        />
                      )}
                    </Box>
                  ))}
                  {/* View All button */}
                  <Button variant="ghost"
                    size="sm"
                    onPress={onViewAll}
                    style={{ alignSelf: 'center' }}
                    accessibilityLabel="View all challenges"
                    accessibilityRole="button"
                    accessibilityHint="Double tap to view challenges"
                  >
                    <VexText>View All Challenges ›</VexText>
                  </Button>
                </>
              )}
            </Box>
          </Animated.View>
        )}
        {/* Preview when collapsed and has challenges */}
        {!isExpanded && !error && challenges.length > 0 && (
          <Box mt="md" gap="xs">
            {/* Mini progress bars */}
            <Box flexDirection="row" gap="xs">
              {challenges.slice(0, 3).map((challenge) => {
                const percent = Math.min(
                  100,
                  (challenge.currentProgress / challenge.targetProgress) * 100,
                );
                return (
                  <Box
                    key={challenge.id}
                    flex={1}
                    height={4}
                    borderRadius="full"
                    bg={theme.colors.background.tertiary}
                    overflow="hidden"
                  >
                    <Box
                      height="100%"
                      width={`${percent}%`}
                      bg={
                        challenge.isCompleted
                          ? theme.colors.success.DEFAULT
                          : theme.colors.primary[500]
                      }
                    />
                  </Box>
                );
              })}
            </Box>
            <Text variant="caption" color="text.tertiary" textAlign="center">
              Tap to expand
            </Text>
          </Box>
        )}
      </Box>
    </Animated.View>
  );
}
export { TodaysChallengesWidget }