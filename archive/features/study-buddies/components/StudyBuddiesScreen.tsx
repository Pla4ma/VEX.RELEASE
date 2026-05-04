/**
 * Study Buddies Screen
 *
 * Main UI for non-competitive accountability pairs.
 * Shows buddy relationships, matches, and encouragement.
 *
 * @phase 3
 */

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../theme';
import { VStack, HStack, Text, Card, Button } from '../../../components/primitives';
import { LoadingState } from '../../../components/states';
import { Icon } from '../../../components/Icon';
import { useStudyBuddies } from '../hooks/useStudyBuddies';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('study-buddies:screen');

// ============================================================================
// Component
// ============================================================================

export const StudyBuddiesScreen: React.FC = () => {
  const theme = useTheme();
  const {
    buddies,
    sharedGoals,
    matches,
    hasBuddies,
    hasActiveBuddy,
    hasPendingRequests,
    availableMatchesCount,
    createBuddyRequest,
    acceptBuddyRequest,
    declineBuddyRequest,
    endBuddyRelationship,
    isLoading,
    error,
  } = useStudyBuddies();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Queries will auto-refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleAcceptRequest = useCallback((buddyPairId: string) => {
    acceptBuddyRequest(buddyPairId);
  }, [acceptBuddyRequest]);

  const handleDeclineRequest = useCallback((buddyPairId: string) => {
    declineBuddyRequest(buddyPairId);
  }, [declineRequest]);

  const handleEndRelationship = useCallback((buddyPairId: string) => {
    endBuddyRelationship(buddyPairId, 'MUTUAL_AGREEMENT');
  }, [endBuddyRelationship]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading && buddies.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <LoadingState message="Loading your study buddies..." />
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
              Study Buddies Unavailable
            </Text>
            <Text variant="body" color="secondary" align="center">
              We couldn't load your study buddies. Please try again.
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
  // Empty State
  // ============================================================================

  if (!hasBuddies && !hasPendingRequests) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <VStack gap="lg" align="center">
          <Icon name="user-plus" size={64} color={theme.colors.text.secondary} />
          <Text variant="heading" align="center">
            No Study Buddies Yet
          </Text>
          <Text variant="body" color="secondary" align="center">
            Find a study buddy for mutual support and accountability.
          </Text>
          
          {availableMatchesCount > 0 && (
            <Card variant="outlined" padding="md" background="secondary">
              <VStack gap="sm">
                <Text variant="body" weight="semibold">
                  {availableMatchesCount} Potential Matches Found
                </Text>
                <Text variant="caption" color="secondary">
                  Based on your study preferences and goals
                </Text>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Icon name="search" size={14} color={theme.colors.primary.DEFAULT} />}
                >
                  View Matches
                </Button>
              </VStack>
            </Card>
          )}
        </VStack>
      </ScrollView>
    );
  }

  // ============================================================================
  // Main UI
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
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text variant="heading">Study Buddies</Text>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Icon name="search" size={14} color={theme.colors.primary.DEFAULT} />}
          >
            Find Buddies
          </Button>
        </HStack>

        {/* Pending Requests */}
        {hasPendingRequests && (
          <Card
            variant="elevated"
            padding="md"
            background="card"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.info.DEFAULT,
            }}
          >
            <VStack gap="sm">
              <HStack gap="sm" align="center">
                <Icon name="mail" size={20} color={theme.colors.info.DEFAULT} />
                <Text variant="body" weight="semibold" color="info">
                  Pending Buddy Requests
                </Text>
              </HStack>
              
              {buddies
                .filter(buddy => buddy.status === 'PENDING')
                .map((buddy) => (
                  <Card key={buddy.id} variant="outlined" padding="sm" background="secondary">
                    <VStack gap="xs">
                      <HStack justify="space-between" align="center">
                        <Text variant="body" size="sm">
                          {buddy.buddyDisplayName || 'New Buddy'}
                        </Text>
                        <Text variant="caption" color="secondary">
                          {new Date(buddy.initiatedAt).toLocaleDateString()}
                        </Text>
                      </HStack>
                      
                      {buddy.sharedGoal && (
                        <Text variant="caption" color="secondary">
                          Goal: {buddy.sharedGoal.description}
                        </Text>
                      )}
                      
                      <HStack gap="sm">
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={() => handleAcceptRequest(buddy.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => handleDeclineRequest(buddy.id)}
                        >
                          Decline
                        </Button>
                      </HStack>
                    </VStack>
                  </Card>
                ))}
            </VStack>
          </Card>
        )}

        {/* Active Buddies */}
        {buddies
          .filter(buddy => buddy.status === 'ACTIVE')
          .map((buddy) => (
            <Card
              key={buddy.id}
              variant="elevated"
              padding="lg"
              background="card"
            >
              <VStack gap="md">
                {/* Buddy Header */}
                <HStack justify="space-between" align="center">
                  <VStack gap="xs">
                    <Text variant="heading" size="md">
                      {buddy.buddyDisplayName || 'Study Buddy'}
                    </Text>
                    <Text variant="caption" color="secondary">
                      Buddies since {new Date(buddy.initiatedAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Icon name="message-circle" size={14} color={theme.colors.text.secondary} />}
                  >
                    Encourage
                  </Button>
                </HStack>

                {/* Shared Goal */}
                {buddy.sharedGoal && (
                  <View
                    style={{
                      backgroundColor: theme.colors.background.secondary,
                      padding: theme.spacing.md,
                      borderRadius: theme.radius.md,
                    }}
                  >
                    <VStack gap="sm">
                      <Text variant="body" size="sm" color="secondary">
                        Shared Goal
                      </Text>
                      <Text variant="body" weight="semibold">
                        {buddy.sharedGoal.description}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {buddy.sharedGoal.target} {buddy.sharedGoal.metric.toLowerCase()} {buddy.sharedGoal.timeframe.toLowerCase()}
                      </Text>
                    </VStack>
                  </View>
                )}

                {/* Mutual Stats */}
                <View
                  style={{
                    backgroundColor: theme.colors.background.secondary,
                    padding: theme.spacing.md,
                    borderRadius: theme.radius.md,
                  }}
                >
                  <VStack gap="sm">
                    <Text variant="body" size="sm" color="secondary">
                      Together You've Achieved
                    </Text>
                    <HStack justify="space-around">
                      <VStack align="center" gap="xs">
                        <Text variant="body" weight="semibold">
                          {buddy.mutualStats.totalSessionsTogether}
                        </Text>
                        <Text variant="caption" color="secondary">
                          Sessions
                        </Text>
                      </VStack>
                      <VStack align="center" gap="xs">
                        <Text variant="body" weight="semibold">
                          {Math.floor((buddy.mutualStats.combinedFocusTime || 0) / 60)}h
                        </Text>
                        <Text variant="caption" color="secondary">
                          Focus Time
                        </Text>
                      </VStack>
                      <VStack align="center" gap="xs">
                        <Text variant="body" weight="semibold">
                          {buddy.mutualStats.streakDaysTogether}
                        </Text>
                        <Text variant="caption" color="secondary">
                          Day Streak
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </View>

                {/* Encouragement Stats */}
                <HStack justify="space-around">
                  <VStack align="center" gap="xs">
                    <Text variant="caption" color="secondary">
                      Sent
                    </Text>
                    <Text variant="body" weight="semibold" color="success">
                      {buddy.encouragementsSent}
                    </Text>
                  </VStack>
                  <VStack align="center" gap="xs">
                    <Text variant="caption" color="secondary">
                      Received
                    </Text>
                    <Text variant="body" weight="semibold" color="info">
                      {buddy.encouragementsReceived}
                    </Text>
                  </VStack>
                </HStack>

                {/* Actions */}
                <HStack gap="sm">
                  <Button
                    variant="secondary"
                    size="sm"
                    flex={1}
                    leftIcon={<Icon name="message-circle" size={14} color={theme.colors.primary.DEFAULT} />}
                  >
                    Send Message
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    flex={1}
                    leftIcon={<Icon name="calendar" size={14} color={theme.colors.primary.DEFAULT} />}
                  >
                    Schedule Study
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() => handleEndRelationship(buddy.id)}
                  >
                    End Partnership
                  </Button>
                </HStack>
              </VStack>
            </Card>
          ))}

        {/* Find New Buddies Section */}
        <Card variant="outlined" padding="md" background="secondary">
          <VStack gap="sm">
            <Text variant="heading" size="sm">
              Find New Study Buddies
            </Text>
            <Text variant="body" color="secondary">
              Connect with learners who share your goals and study preferences.
            </Text>
            <HStack gap="sm">
              <Button
                variant="secondary"
                size="sm"
                flex={1}
                leftIcon={<Icon name="search" size={14} color={theme.colors.primary.DEFAULT} />}
              >
                Browse Matches
              </Button>
              <Button
                variant="secondary"
                size="sm"
                flex={1}
                leftIcon={<Icon name="user-plus" size={14} color={theme.colors.primary.DEFAULT} />}
              >
                Invite Friend
              </Button>
            </HStack>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
};
