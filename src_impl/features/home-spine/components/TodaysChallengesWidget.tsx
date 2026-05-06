/**
 * TodaysChallengesWidget Component
 *
 * Compact card showing today's 3 daily challenges with progress bars.
 * Collapsed by default - tap to expand.
 *
 * @phase 1A.7
 */

import React, { useState, useMemo } from "react";
import { Pressable } from "react-native";
import Animated, { FadeIn, FadeInUp, Layout } from "react-native-reanimated";

import { Box } from "../../../components/primitives/Box";
import { Button } from "../../../components/primitives/Button";
import { Text } from "../../../components/primitives/Text";
import { useTheme } from "../../../theme";

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  currentProgress: number;
  targetProgress: number;
  rewardAmount: number;
  rewardType: "XP" | "COINS" | "GEMS";
  isCompleted: boolean;
  isClaimed: boolean;
  timeRemainingMinutes: number;
}

export interface TodaysChallengesWidgetProps {
  /** Today's challenges */
  challenges: ChallengeItem[];
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Navigate to challenges screen */
  onViewAll: () => void;
  /** Claim reward handler */
  onClaimReward?: (challengeId: string) => void;
  /** Retry handler for error state */
  onRetry?: () => void;
}

/**
 * Skeleton loading state
 */
function ChallengesWidgetSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box m="lg" p="lg" borderRadius="xl" bg={theme.colors.background.secondary}>
      <Box flexDirection="row" alignItems="center" gap="md" mb="md">
        <Box width={40} height={40} borderRadius="lg" bg={theme.colors.background.tertiary} />
        <Box gap="sm" flex={1}>
          <Box width={120} height={18} borderRadius="sm" bg={theme.colors.background.tertiary} />
          <Box width={80} height={12} borderRadius="sm" bg={theme.colors.background.tertiary} />
        </Box>
      </Box>
      {/* Progress bars */}
      {[1, 2, 3].map((i) => (
        <Box key={i} mb="sm" gap="xs">
          <Box width="100%" height={8} borderRadius="full" bg={theme.colors.background.tertiary} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * Individual challenge progress row
 */
function ChallengeProgressRow({ challenge, onClaim }: { challenge: ChallengeItem; onClaim?: (id: string) => void }): JSX.Element {
  const { theme } = useTheme();
  const progressPercent = Math.min(100, (challenge.currentProgress / challenge.targetProgress) * 100);

  const getRewardIcon = () => {
    switch (challenge.rewardType) {
      case "XP":
        return "⭐";
      case "GEMS":
        return "💎";
      case "COINS":
        return "🪙";
      default:
        return "🎁";
    }
  };

  return (
    <Box gap="xs">
      {/* Title and reward */}
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text variant="bodySmall" color={challenge.isCompleted ? "success.DEFAULT" : "text.primary"} fontWeight={challenge.isCompleted ? "600" : "400"} style={challenge.isClaimed ? { textDecorationLine: "line-through", opacity: 0.6 } : undefined}>
          {challenge.isCompleted ? "✓ " : ""}
          {challenge.title}
        </Text>
        <Box flexDirection="row" alignItems="center" gap="xs">
          <Text fontSize={12}>{getRewardIcon()}</Text>
          <Text variant="caption" color="text.secondary">
            {challenge.rewardAmount}
          </Text>
        </Box>
      </Box>

      {/* Progress bar */}
      <Box height={6} borderRadius="full" bg={theme.colors.background.tertiary} overflow="hidden">
        <Box height="100%" width={`${progressPercent}%`} borderRadius="full" bg={challenge.isCompleted ? theme.colors.success.DEFAULT : theme.colors.primary[500]} />
      </Box>

      {/* Progress text and claim button */}
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text variant="caption" color="text.tertiary">
          {challenge.currentProgress}/{challenge.targetProgress}
          {challenge.isCompleted && !challenge.isClaimed && (
            <Text variant="caption" color="success.DEFAULT" fontWeight="600">
              {" "}
              · Ready to claim!
            </Text>
          )}
        </Text>

        {challenge.isCompleted && !challenge.isClaimed && onClaim && (
          <Pressable onPress={() => onClaim(challenge.id)} accessibilityLabel="Claim button" accessibilityRole="button" accessibilityHint="Activates this control">
            <Box px="sm" py="xs" borderRadius="full" bg={theme.colors.success[500]}>
              <Text variant="caption" color={theme.colors.text.inverse} fontWeight="600">
                Claim
              </Text>
            </Box>
          </Pressable>
        )}
      </Box>
    </Box>
  );
}

/**
 * Empty state when no challenges assigned
 */
function ChallengesEmptyState(): JSX.Element {
  const { theme } = useTheme();

  // Calculate time until midnight
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const hoursUntilReset = Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60));
  const minutesUntilReset = Math.floor(((midnight.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Box alignItems="center" gap="sm" py="md">
      <Text fontSize={32}>⏳</Text>
      <Text variant="bodySmall" color="text.secondary" textAlign="center">
        Challenges reset at midnight
      </Text>
      <Text variant="caption" color="text.tertiary">
        {hoursUntilReset}h {minutesUntilReset}m remaining
      </Text>
    </Box>
  );
}

/**
 * Error state with retry
 */
function ChallengesErrorState({ onRetry }: { onRetry?: () => void }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box alignItems="center" gap="md" py="md">
      <Text fontSize={32}>⚠️</Text>
      <Text variant="bodySmall" color="error.DEFAULT" textAlign="center">
        Couldn't load challenges
      </Text>
      {onRetry && (
        <Button variant="outline" size="sm" onPress={onRetry} accessibilityLabel="Try Again button" accessibilityRole="button" accessibilityHint="Activates this control">
          Try Again
        </Button>
      )}
    </Box>
  );
}

/**
 * Main challenges widget component
 */
export function TodaysChallengesWidget({ challenges, isLoading = false, error = null, onViewAll, onClaimReward, onRetry }: TodaysChallengesWidgetProps): JSX.Element {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate completion stats
  const stats = useMemo(() => {
    const completed = challenges.filter((c) => c.isCompleted).length;
    const claimable = challenges.filter((c) => c.isCompleted && !c.isClaimed).length;
    return { completed, total: challenges.length, claimable };
  }, [challenges]);

  if (isLoading) {
    return <ChallengesWidgetSkeleton />;
  }

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(300)} layout={Layout.springify()}>
      <Box m="lg" p="lg" borderRadius="xl" bg={theme.colors.background.secondary} borderWidth={1} borderColor={theme.colors.border.DEFAULT}>
        {/* Header - Always visible */}
        <Pressable onPress={() => setIsExpanded((prev) => !prev)} accessibilityLabel="Interactive control" accessibilityRole="button" accessibilityHint="Activates this control">
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flexDirection="row" alignItems="center" gap="sm">
              <Box width={40} height={40} borderRadius="lg" bg={`${theme.colors.accent.purple}20`} justifyContent="center" alignItems="center">
                <Text fontSize={20}>🎯</Text>
              </Box>
              <Box>
                <Text variant="h4" color="text.primary">
                  Today's Challenges
                </Text>
                {stats.total > 0 && (
                  <Text variant="caption" color="text.secondary">
                    {stats.completed}/{stats.total} completed
                    {stats.claimable > 0 && (
                      <Text variant="caption" color="success.DEFAULT" fontWeight="600">
                        {" "}
                        · {stats.claimable} to claim!
                      </Text>
                    )}
                  </Text>
                )}
              </Box>
            </Box>

            {/* Expand/Collapse indicator */}
            <Text fontSize={20} color={theme.colors.text.tertiary} style={{ transform: [{ rotate: isExpanded ? "90deg" : "0deg" }] }}>
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
                      <ChallengeProgressRow challenge={challenge} onClaim={onClaimReward} />
                      {index < Math.min(challenges.length, 3) - 1 && <Box height={1} bg={theme.colors.border.light} my="sm" />}
                    </Box>
                  ))}

                  {/* View All button */}
                  <Button variant="ghost" size="sm" onPress={onViewAll} style={{ alignSelf: "center" }} accessibilityLabel="View All Challenges › button" accessibilityRole="button" accessibilityHint="Activates this control">
                    View All Challenges ›
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
                const percent = Math.min(100, (challenge.currentProgress / challenge.targetProgress) * 100);
                return (
                  <Box key={challenge.id} flex={1} height={4} borderRadius="full" bg={theme.colors.background.tertiary} overflow="hidden">
                    <Box height="100%" width={`${percent}%`} bg={challenge.isCompleted ? theme.colors.success.DEFAULT : theme.colors.primary[500]} />
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

export default TodaysChallengesWidget;
