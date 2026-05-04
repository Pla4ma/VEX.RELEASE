/**
 * Study Circles Screen
 *
 * Main UI for async accountability groups.
 * Shows user's circles, invites, and circle management.
 *
 * @phase 3
 */

import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '../../../theme';
import { VStack, HStack, Text, Card, Button } from '../../../components/primitives';
import { LoadingState } from '../../../components/states';
import { Icon } from '../../../components/Icon';
import { useStudyCircles } from '../hooks/useStudyCircles';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('study-circles:screen');

// ============================================================================
// Component
// ============================================================================

export const StudyCirclesScreen: React.FC = () => {
  const theme = useTheme();
  const {
    memberships,
    invites,
    hasCircles,
    hasPendingInvites,
    isCreating,
    createCircle,
    joinCircle,
    respondToInvite,
    isLoading,
    error,
  } = useStudyCircles();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Queries will auto-refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCreateCircle = useCallback(() => {
    createCircle({
      name: 'My Study Circle',
      weeklyGoalMinutes: 120,
      maxMembers: 6,
    });
  }, [createCircle]);

  const handleJoinCircle = useCallback((circleId: string) => {
    joinCircle(circleId);
  }, [joinCircle]);

  const handleAcceptInvite = useCallback((inviteId: string) => {
    respondToInvite(inviteId, true);
  }, [respondToInvite]);

  const handleDeclineInvite = useCallback((inviteId: string) => {
    respondToInvite(inviteId, false);
  }, [respondToInvite]);

  // ============================================================================
  // Loading State
  // ============================================================================

  if (isLoading && memberships.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
        <LoadingState message="Loading your study circles..." />
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
              Circles Unavailable
            </Text>
            <Text variant="body" color="secondary" align="center">
              We couldn't load your study circles. Please try again.
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

  if (!hasCircles && !hasPendingInvites) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
        contentContainerStyle={{ padding: theme.spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <VStack gap="lg" align="center">
          <Icon name="users" size={64} color={theme.colors.text.secondary} />
          <Text variant="heading" align="center">
            No Study Circles Yet
          </Text>
          <Text variant="body" color="secondary" align="center">
            Join or create a study circle to stay accountable with your learning goals.
          </Text>
          <Button
            variant="primary"
            onPress={handleCreateCircle}
            size="lg"
            leftIcon={<Icon name="plus" size={16} color={theme.colors.text.inverse} />}
          >
            Create Your First Circle
          </Button>
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
          <Text variant="heading">Study Circles</Text>
          <Button
            variant="secondary"
            onPress={handleCreateCircle}
            disabled={isCreating}
            size="sm"
            leftIcon={<Icon name="plus" size={14} color={theme.colors.primary.DEFAULT} />}
          >
            Create Circle
          </Button>
        </HStack>

        {/* Pending Invites */}
        {hasPendingInvites && (
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
                  {invites.length} Pending Invite{invites.length === 1 ? '' : 's'}
                </Text>
              </HStack>
              
              {invites.map((invite) => (
                <Card key={invite.id} variant="outlined" padding="sm" background="secondary">
                  <VStack gap="xs">
                    <HStack justify="space-between" align="center">
                      <Text variant="body" size="sm">
                        {invite.circleName}
                      </Text>
                      <Text variant="caption" color="secondary">
                        Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    <HStack gap="sm">
                      <Button
                        variant="primary"
                        size="sm"
                        onPress={() => handleAcceptInvite(invite.id)}
                        disabled={isCreating}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => handleDeclineInvite(invite.id)}
                        disabled={isCreating}
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

        {/* User's Circles */}
        {memberships.map((membership) => (
          <Card
            key={membership.circleId}
            variant="elevated"
            padding="lg"
            background="card"
          >
            <VStack gap="md">
              {/* Circle Header */}
              <HStack justify="space-between" align="center">
                <VStack gap="xs">
                  <Text variant="heading" size="md">
                    {membership.circleName}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {membership.memberCount} members • {membership.weeklyGoalMinutes}min/week goal
                  </Text>
                </VStack>
                <Text
                  variant="caption"
                  color={membership.role === 'FOUNDER' ? 'warning' : 'secondary'}
                >
                  {membership.role === 'FOUNDER' ? 'Founder' : 'Member'}
                </Text>
              </HStack>

              {/* Weekly Progress */}
              <View
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                }}
              >
                <VStack gap="sm">
                  <HStack justify="space-between">
                    <Text variant="body" size="sm" color="secondary">
                      Weekly Progress
                    </Text>
                    <Text variant="body" weight="semibold">
                      {membership.currentWeekProgress}/{membership.weeklyGoalMinutes} min
                    </Text>
                  </HStack>
                  
                  <View
                    style={{
                      height: 8,
                      backgroundColor: theme.colors.background.primary,
                      borderRadius: theme.radius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (membership.currentWeekProgress / membership.weeklyGoalMinutes) * 100)}%`,
                        backgroundColor: theme.colors.success.DEFAULT,
                      }}
                    />
                  </View>
                </VStack>
              </View>

              {/* Actions */}
              <HStack gap="sm">
                <Button
                  variant="secondary"
                  size="sm"
                  flex={1}
                  leftIcon={<Icon name="users" size={14} color={theme.colors.primary.DEFAULT} />}
                >
                  View Circle
                </Button>
                {membership.role === 'FOUNDER' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Icon name="settings" size={14} color={theme.colors.text.secondary} />}
                  >
                    Settings
                  </Button>
                )}
              </HStack>
            </VStack>
          </Card>
        ))}

        {/* Join Public Circles Section */}
        <Card variant="outlined" padding="md" background="secondary">
          <VStack gap="sm">
            <Text variant="heading" size="sm">
              Discover Public Circles
            </Text>
            <Text variant="body" color="secondary">
              Join public study circles focused on similar goals.
            </Text>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Icon name="search" size={14} color={theme.colors.primary.DEFAULT} />}
            >
              Browse Circles
            </Button>
          </VStack>
        </Card>
      </VStack>
    </ScrollView>
  );
};
