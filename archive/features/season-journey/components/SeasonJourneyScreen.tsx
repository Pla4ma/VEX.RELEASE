/**
 * Season Journey Screen
 *
 * Main UI for Season Journey progression.
 * Shows milestones, rewards, and user progress.
 *
 * @phase 3
 */

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../theme';
import { VStack, HStack, Text, Card, Button } from '../../../components/primitives';
import { LoadingState } from '../../../components/states';
import { Icon } from '../../../components/Icon';
import { useSeasonJourney } from '../hooks/useSeasonJourney';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('season-journey:screen');

// ============================================================================
// Component
// ============================================================================

export const SeasonJourneyScreen: React.FC = () => {
  const theme = useTheme();
  const {
    summary,
    milestones,
    userJourney,
    unclaimedMilestones,
    hasActiveJourney,
    hasUnclaimedMilestones,
    nextMilestone,
    xpToNextMilestone,
    canClaimMilestone,
    getMilestoneProgress,
    isLoading,
    error,
    initializeJourney,
    claimMilestone,
  } = useSeasonJourney();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Queries will auto-refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleClaimMilestone = useCallback((milestoneNumber: number) => {
    claimMilestone(milestoneNumber);
  }, [claimMilestone]);

  const handleInitialize = useCallback(() => {
    initializeJourney();
  }, [initializeJourney]);

  // Group milestones by rows (5 per row for mobile)
  const milestoneRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < milestones.length; i += 5) {
      rows.push(milestones.slice(i, i + 5));
    }
    return rows;
  }, [milestones]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading && !summary) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <LoadingState message="Loading your journey..." />
      </View>
    );
  }

  // ============================================================================
  // Error State
  // ============================================================================

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <Card
          variant="elevated"
          margin="lg"
          padding="lg"
          background="card"
        >
          <VStack gap="md" align="center">
            <Icon name="alert-circle" size={48} color={theme.colors.error.DEFAULT} />
            <Text variant="heading" color="error">
              Journey Unavailable
            </Text>
            <Text variant="body" color="secondary" align="center">
              We couldn't load your journey. Please try again.
            </Text>
            <Button variant="primary" onPress={handleRefresh}>
              Try Again
            </Button>
          </VStack>
        </Card>
      </View>
    );
  }

  // ============================================================================
  // No Active Season
  // ============================================================================

  if (!hasActiveJourney) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <VStack gap="lg" align="center">
          <Icon name="map" size={64} color={theme.colors.text.secondary} />
          <Text variant="heading" align="center">
            No Active Journey
          </Text>
          <Text variant="body" color="secondary" align="center">
            There's no active Season Journey right now. Check back soon!
          </Text>
        </VStack>
      </ScrollView>
    );
  }

  // ============================================================================
  // Not Initialized
  // ============================================================================

  if (!userJourney) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <VStack gap="lg">
          <Card variant="elevated" padding="lg" background="card">
            <VStack gap="md" align="center">
              <Icon name="flag" size={48} color={theme.colors.primary.DEFAULT} />
              <Text variant="heading" align="center">
                {summary.activeSeason.name}
              </Text>
              <Text variant="body" color="secondary" align="center">
                {summary.activeSeason.milestoneCount} milestones await you
              </Text>
              <Button
                variant="primary"
                onPress={handleInitialize}
                size="lg"
              >
                Start Your Journey
              </Button>
            </VStack>
          </Card>

          <Card variant="outlined" padding="md" background="card">
            <VStack gap="sm">
              <Text variant="heading" size="sm">
                What is Season Journey?
              </Text>
              <Text variant="body" color="secondary">
                Complete 20-30 meaningful milestones instead of grinding through 100+ tiers. 
                Each milestone represents real progress in your learning journey.
              </Text>
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    );
  }

  // ============================================================================
  // Main Journey UI
  // ============================================================================

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{ padding: theme.spacing.lg }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack gap="lg">
        {/* Season Header */}
        <Card variant="elevated" padding="lg" background="card">
          <VStack gap="md">
            <HStack justify="space-between" align="center">
              <VStack gap="xs">
                <Text variant="heading">{summary.activeSeason.name}</Text>
                <Text variant="caption" color="secondary">
                  {summary.userProgress?.daysRemaining || 0} days remaining
                </Text>
              </VStack>
              <VStack gap="xs" align="flex-end">
                <Text variant="body" weight="semibold">
                  Milestone {userJourney.currentMilestone}/{summary.activeSeason.milestoneCount}
                </Text>
                <Text variant="caption" color="secondary">
                  {userJourney.totalProgress.toFixed(1)}% complete
                </Text>
              </VStack>
            </HStack>

            {/* Progress Bar */}
            <View
              style={{
                height: 8,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.radius.full,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${userJourney.totalProgress}%`,
                  backgroundColor: theme.colors.primary.DEFAULT,
                }}
              />
            </View>

            {/* Stats */}
            <HStack justify="space-around">
              <VStack align="center" gap="xs">
                <Text variant="caption" color="secondary">Current XP</Text>
                <Text variant="body" weight="semibold">
                  {userJourney.totalXp.toLocaleString()}
                </Text>
              </VStack>
              <VStack align="center" gap="xs">
                <Text variant="caption" color="secondary">Next Milestone</Text>
                <Text variant="body" weight="semibold">
                  {xpToNextMilestone.toLocaleString()} XP
                </Text>
              </VStack>
              <VStack align="center" gap="xs">
                <Text variant="caption" color="secondary">Unclaimed</Text>
                <Text variant="body" weight="semibold" color="warning">
                  {unclaimedMilestones.length}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Card>

        {/* Unclaimed Milestones Alert */}
        {hasUnclaimedMilestones && (
          <Card
            variant="elevated"
            padding="md"
            background="card"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.success.DEFAULT,
            }}
          >
            <HStack gap="sm" align="center">
              <Icon name="gift" size={24} color={theme.colors.success.DEFAULT} />
              <VStack gap="xs" flex={1}>
                <Text variant="body" weight="semibold" color="success">
                  {unclaimedMilestones.length} Milestone{unclaimedMilestones.length === 1 ? '' : 's'} Available
                </Text>
                <Text variant="caption" color="secondary">
                  Claim your rewards from completed milestones
                </Text>
              </VStack>
            </HStack>
          </Card>
        )}

        {/* Milestones Grid */}
        <VStack gap="md">
          <Text variant="heading">Milestones</Text>
          
          {milestoneRows.map((row, rowIndex) => (
            <HStack key={rowIndex} gap="sm" justify="space-between">
              {row.map((milestone) => {
                const isCompleted = userJourney.currentMilestone >= milestone.milestoneNumber;
                const isClaimed = userJourney.claimedMilestones.includes(milestone.milestoneNumber);
                const isUnclaimed = isCompleted && !isClaimed;
                const progress = getMilestoneProgress(milestone.milestoneNumber);
                const canClaim = canClaimMilestone(milestone.milestoneNumber);

                return (
                  <Card
                    key={milestone.id}
                    variant={isUnclaimed ? 'elevated' : 'outlined'}
                    padding="md"
                    background={isUnclaimed ? 'card' : 'secondary'}
                    style={{
                      flex: 1,
                      borderWidth: isUnclaimed ? 2 : 1,
                      borderColor: isUnclaimed ? theme.colors.success.DEFAULT : theme.colors.border.DEFAULT,
                    }}
                  >
                    <VStack gap="sm" align="center">
                      {/* Milestone Number */}
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: theme.radius.full,
                          backgroundColor: isCompleted 
                            ? theme.colors.success.DEFAULT 
                            : theme.colors.background.secondary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          variant="caption"
                          weight="semibold"
                          color={isCompleted ? 'inverse' : 'secondary'}
                        >
                          {milestone.milestoneNumber}
                        </Text>
                      </View>

                      {/* Milestone Name */}
                      <Text
                        variant="body"
                        size="sm"
                        align="center"
                        weight={isCompleted ? 'semibold' : 'normal'}
                      >
                        {milestone.name}
                      </Text>

                      {/* Reward */}
                      {milestone.rewardType && (
                        <Text
                          variant="caption"
                          color={isCompleted ? 'primary' : 'secondary'}
                          align="center"
                        >
                          {milestone.rewardAmount} {milestone.rewardType}
                        </Text>
                      )}

                      {/* Claim Button */}
                      {isUnclaimed && (
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={() => handleClaimMilestone(milestone.milestoneNumber)}
                          style={{ width: '100%' }}
                        >
                          Claim
                        </Button>
                      )}

                      {/* Completed Indicator */}
                      {isClaimed && (
                        <Icon name="check-circle" size={20} color={theme.colors.success.DEFAULT} />
                      )}

                      {/* Progress for current milestone */}
                      {!isCompleted && milestone.milestoneNumber === userJourney.currentMilestone + 1 && (
                        <View style={{ width: '100%' }}>
                          <View
                            style={{
                              height: 4,
                              backgroundColor: theme.colors.background.secondary,
                              borderRadius: theme.radius.full,
                            }}
                          >
                            <View
                              style={{
                                height: '100%',
                                width: `${progress}%`,
                                backgroundColor: theme.colors.primary.DEFAULT,
                              }}
                            />
                          </View>
                          <Text
                            variant="caption"
                            color="secondary"
                            align="center"
                            style={{ marginTop: theme.spacing.xs }}
                          >
                            {progress.toFixed(0)}%
                          </Text>
                        </View>
                      )}
                    </VStack>
                  </Card>
                );
              })}
            </HStack>
          ))}
        </VStack>
      </VStack>
    </ScrollView>
  );
};
