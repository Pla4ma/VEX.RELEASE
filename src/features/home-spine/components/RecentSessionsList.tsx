import React, { useCallback } from 'react';
import { Pressable } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Box } from '../../../components/primitives/Box';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme/ThemeContext';
import {
  type SessionListItem,
  type RecentSessionsListProps,
} from './session-list-utils';
import {
  RecentSessionsSkeleton,
  EmptyState,
  SessionRow,
} from './session-list-item';

export type {
  SessionListItem,
  RecentSessionsListProps,
} from './session-list-utils';
export { formatDuration, formatTimeAgo, getGradeColor } from './session-list-utils';

const ItemSeparator = React.memo(() => {
  const { theme } = useTheme();
  return <Box height={1} mx="lg" bg={theme.colors.border.light} />;
});

export function RecentSessionsList({
  sessions,
  onViewAll,
  onSessionPress,
  isLoading = false,
}: RecentSessionsListProps): React.ReactNode {
  const { theme } = useTheme();
  const renderItem: ListRenderItem<SessionListItem> = useCallback(
    ({ item }) => (
      <SessionRow session={item} onPress={() => onSessionPress?.(item.id)} />
    ),
    [onSessionPress],
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
          <Pressable
            onPress={onViewAll}
            accessibilityLabel="View all recent sessions"
            accessibilityRole="button"
            accessibilityHint="Double tap to activate"
          >
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
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ItemSeparator}
          />
        </Box>
      </Box>
    </Animated.View>
  );
}

export default RecentSessionsList;
