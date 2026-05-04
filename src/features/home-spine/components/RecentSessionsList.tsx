/**
 * RecentSessionsList Component
 *
 * Shows last 5 sessions with duration, quality score, XP earned, and time ago.
 * Uses FlashList for performance. Each row has quality-based color accent.
 *
 * @phase 1A.6
 */

import React, { useMemo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';

export interface SessionListItem {
  id: string;
  duration: number; // in seconds
  qualityGrade: 'S' | 'A' | 'B' | 'C' | 'D';
  xpEarned: number;
  endedAt: string; // ISO date
  interruptions: number;
}

export interface RecentSessionsListProps {
  sessions: SessionListItem[];
  /** Navigate to session history */
  onViewAll?: () => void;
  /** Navigate to session detail */
  onSessionPress?: (sessionId: string) => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Format duration in seconds to readable string
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {return `${minutes} min`;}
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Format time ago from ISO date
 */
function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 5) {return 'Just now';}
  if (diffMins < 60) {return `${diffMins}m ago`;}
  if (diffHours < 24) {return `${diffHours}h ago`;}
  if (diffDays === 1) {return 'Yesterday';}
  if (diffDays < 7) {return `${diffDays} days ago`;}
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Get color for quality grade
 */
function getGradeColor(
  grade: SessionListItem['qualityGrade'],
  theme: ReturnType<typeof useTheme>['theme']
): string {
  switch (grade) {
    case 'S':
      return theme.colors.accent.purple;
    case 'A':
      return theme.colors.success.DEFAULT;
    case 'B':
      return theme.colors.info.DEFAULT;
    case 'C':
      return theme.colors.text.tertiary;
    case 'D':
      return theme.colors.error.DEFAULT;
    default:
      return theme.colors.text.tertiary;
  }
}

/**
 * Skeleton item for loading state
 */
function SessionItemSkeleton(): JSX.Element {
  const { theme } = useTheme();

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      py="md"
      px="lg"
      gap="md"
    >
      {/* Grade indicator skeleton */}
      <Box
        width={4}
        height={40}
        borderRadius="full"
        bg={theme.colors.background.tertiary}
      />

      {/* Content skeleton */}
      <Box flex={1} gap="sm">
        <Box
          width={80}
          height={16}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
        <Box
          width={120}
          height={12}
          borderRadius="sm"
          bg={theme.colors.background.tertiary}
        />
      </Box>

      {/* XP skeleton */}
      <Box
        width={50}
        height={20}
        borderRadius="lg"
        bg={theme.colors.background.tertiary}
      />
    </Box>
  );
}

/**
 * Skeleton loading state for entire list
 */
function RecentSessionsSkeleton(): JSX.Element {
  return (
    <Box>
      <SessionItemSkeleton />
      <SessionItemSkeleton />
      <SessionItemSkeleton />
    </Box>
  );
}

/**
 * Empty state when no sessions
 */
function EmptyState({ onStart }: { onStart?: () => void }): JSX.Element {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Box
        py="xl"
        px="lg"
        alignItems="center"
        justifyContent="center"
        gap="md"
      >
        <Text fontSize={48}>🎯</Text>
        <Text variant="h4" color="text.secondary" textAlign="center">
          No sessions yet
        </Text>
        <Text
          variant="body"
          color="text.tertiary"
          textAlign="center"
        >
          Start your first focus session to begin building your streak!
        </Text>
      </Box>
    </Animated.View>
  );
}

/**
 * Individual session row item
 */
function SessionRow({
  session,
  onPress,
}: {
  session: SessionListItem;
  onPress?: () => void;
}): JSX.Element {
  const { theme } = useTheme();
  const accentColor = getGradeColor(session.qualityGrade, theme);
  const hasInterruptions = session.interruptions > 0;

  return (
    <Pressable onPress={onPress}
  accessibilityLabel="Interactive control"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
      <Box
        flexDirection="row"
        alignItems="center"
        py="md"
        px="lg"
        gap="md"
      >
        {/* Quality accent bar */}
        <Box
          width={4}
          height={48}
          borderRadius="full"
          bg={accentColor}
        />

        {/* Session info */}
        <Box flex={1} gap="xs">
          <Box flexDirection="row" alignItems="center" gap="sm">
            <Text variant="body" color="text.primary" fontWeight="600">
              {formatDuration(session.duration)}
            </Text>
            <Text variant="caption" color="text.tertiary">
              ·
            </Text>
            <Text variant="caption" color="text.tertiary">
              {formatTimeAgo(session.endedAt)}
            </Text>
          </Box>

          <Box flexDirection="row" alignItems="center" gap="sm">
            {/* Grade badge */}
            <Box
              px="xs"
              py="xs"
              borderRadius="sm"
              bg={`${accentColor}20`}
            >
              <Text
                variant="caption"
                color={accentColor}
                fontWeight="700"
              >
                {session.qualityGrade}
              </Text>
            </Box>

            {hasInterruptions && (
              <Text variant="caption" color="text.tertiary">
                {session.interruptions} interruption{session.interruptions > 1 ? 's' : ''}
              </Text>
            )}
          </Box>
        </Box>

        {/* XP earned */}
        <Box
          flexDirection="row"
          alignItems="center"
          gap="xs"
          px="sm"
          py="xs"
          borderRadius="lg"
          bg={theme.colors.background.tertiary}
        >
          <Text fontSize={12}>✨</Text>
          <Text
            variant="caption"
            color="text.secondary"
            fontWeight="600"
          >
            +{session.xpEarned}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
}

/**
 * Main recent sessions list component
 */
export function RecentSessionsList({
  sessions,
  onViewAll,
  onSessionPress,
  isLoading = false,
}: RecentSessionsListProps): JSX.Element {
  const { theme } = useTheme();

  const renderItem: ListRenderItem<SessionListItem> = useCallback(
    ({ item }) => (
      <SessionRow
        session={item}
        onPress={() => onSessionPress?.(item.id)}
      />
    ),
    [onSessionPress]
  );

  const keyExtractor = useCallback((item: SessionListItem) => item.id, []);

  if (isLoading) {
    return (
      <Box px="lg" py="md">
        <Text variant="h4" color="text.primary" mb="md">
          Recent Sessions
        </Text>
        <RecentSessionsSkeleton />
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box px="lg" py="md">
        <Text variant="h4" color="text.primary" mb="md">
          Recent Sessions
        </Text>
        <EmptyState />
      </Box>
    );
  }

  // Take only last 5 sessions
  const displaySessions = sessions.slice(0, 5);

  return (
    <Animated.View entering={FadeIn.duration(400).delay(300)}>
      <Box px="lg" py="md">
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          mb="sm"
        >
          <Text variant="h4" color="text.primary">
            Recent Sessions
          </Text>
          <Pressable onPress={onViewAll}
  accessibilityLabel="View all › button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
            <Text variant="bodySmall" color="link">
              View all ›
            </Text>
          </Pressable>
        </Box>

        <Box
          borderRadius="xl"
          bg={theme.colors.background.secondary}
          overflow="hidden"
        >
          <FlashList
            data={displaySessions}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={72}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => (
              <Box
                height={1}
                mx="lg"
                bg={theme.colors.border.light}
              />
            )}
          />
        </Box>
      </Box>
    </Animated.View>
  );
}

export default RecentSessionsList;
