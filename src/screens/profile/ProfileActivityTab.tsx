import React from 'react';
import { View } from 'react-native';
import { Box, Text } from '../../components/primitives';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassPill } from '../../components/glass/GlassPill';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { FlashList } from '@shopify/flash-list';
import type { Theme } from '../../theme/types';
import type { SessionHistoryEntry } from '../../session/types';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

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
  (_theme: Theme) =>
  ({ item }: { item: SessionHistoryEntry }): JSX.Element => (
    <View style={{ marginBottom: 10 }}>
      <GlassCard size="md" variant="default" padding={14} radius={20}>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flex={1}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 15,
                fontWeight: '800',
                letterSpacing: -0.2,
              }}
            >
              {item.config.customName ?? 'Focus Session'}
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {`${formatDate(item.startedAt)} | ${formatDuration(item)}`}
            </Text>
          </Box>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <GlassPill
              label={item.status}
              variant={item.status === 'COMPLETED' ? 'success' : 'neutral'}
              size="sm"
            />
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 11,
                fontWeight: '600',
              }}
            >
              {`${item.summary?.xpEarned ?? 0} XP`}
            </Text>
          </View>
        </Box>
      </GlassCard>
    </View>
  );

export const ProfileActivityTab = React.memo(({
  theme,
  isLoading,
  isError,
  history,
  onStartSession,
}: ProfileActivityTabProps) => {
  if (isLoading) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <Skeleton lines={5} height={52} borderRadius={14} spacing={12} />
      </GlassCard>
    );
  }

  if (isError) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <EmptyState
          iconName="exclamation-circle"
          title="Activity unavailable"
          body="We couldn't load your recent sessions right now."
          actionLabel="Start session"
          onAction={onStartSession}
        />
      </GlassCard>
    );
  }

  if (history.length === 0) {
    return (
      <GlassCard size="lg" variant="default" padding={18} radius={26}>
        <EmptyState
          iconName="plus-circle"
          title="No recent activity"
          body="Start a session to turn your profile into a live record of wins, streaks, and progression."
          actionLabel="Start session"
          onAction={onStartSession}
        />
      </GlassCard>
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
});

ProfileActivityTab.displayName = 'ProfileActivityTab';
