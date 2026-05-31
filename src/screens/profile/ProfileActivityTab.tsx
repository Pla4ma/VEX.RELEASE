import React from 'react';
import { Box, Card, Text } from '../../components/primitives';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { FlashList } from '@shopify/flash-list';
import type { Theme } from '../../theme/types';
import type { SessionHistoryEntry } from '../../session/types';

interface ProfileActivityTabProps {
  theme: Theme;
  isLoading: boolean;
  isError: boolean;
  history: SessionHistoryEntry[];
  onStartSession: () => void;
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(entry: SessionHistoryEntry): string {
  return `${Math.max(1, Math.round((entry.summary?.effectiveDuration ?? 0) / 60))} min`;
}

const renderSessionCard =
  (theme: Theme) =>
  ({ item }: { item: SessionHistoryEntry }) => (
    <Card
      size="md"
      style={{ backgroundColor: theme.colors.background.secondary, marginBottom: 12 }}
    >
      <Box flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box flex={1}>
          <Text variant="h4" color="text.primary">
            {item.config.customName ?? 'Focus Session'}
          </Text>
          <Text variant="caption" color="text.secondary">
            {`${formatDate(item.startedAt)} | ${formatDuration(item)}`}
          </Text>
        </Box>
        <Box alignItems="flex-end">
          <Badge variant={item.status === 'COMPLETED' ? 'success' : 'secondary'} size="sm">
            {item.status}
          </Badge>
          <Text variant="caption" color="text.tertiary" style={{ marginTop: 6 }}>
            {`${item.summary?.xpEarned ?? 0} XP`}
          </Text>
        </Box>
      </Box>
    </Card>
  );

export const ProfileActivityTab: React.FC<ProfileActivityTabProps> = ({
  theme,
  isLoading,
  isError,
  history,
  onStartSession,
}) => {
  if (isLoading) {
    return (
      <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
        <Skeleton lines={5} height={52} borderRadius={14} spacing={12} />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
        <EmptyState
          icon="!"
          title="Activity unavailable"
          body="We couldn't load your recent sessions right now."
          actionLabel="Start session"
          onAction={onStartSession}
        />
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card size="lg" style={{ backgroundColor: theme.colors.background.secondary }}>
        <EmptyState
          icon="+"
          title="No recent activity"
          body="Start a session to turn your profile into a live record of wins, streaks, and progression."
          actionLabel="Start session"
          onAction={onStartSession}
        />
      </Card>
    );
  }

  return (
    <Box style={{ height: Math.max(360, history.length * 86) }}>
      <FlashList
        data={history}
        scrollEnabled={false}
        estimatedItemSize={86}
        keyExtractor={(item: SessionHistoryEntry) => item.sessionId}
        renderItem={renderSessionCard(theme)}
      />
    </Box>
  );
};
