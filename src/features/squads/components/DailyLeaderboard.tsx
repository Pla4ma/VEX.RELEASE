import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { Text } from '../../../components/primitives/Text';
import { Skeleton } from '../../../components/ui/Skeleton';
import { useTheme } from '../../../theme';
import { useDailyContributions } from '../competitive-hooks';

type DailyLeaderboardProps = { squadId: string; userId: string };

function getAvatarColor(userId: string): string {
  const palette = ['#2563EB', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'] as const;
  const hash = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palette[hash % palette.length];
}

function getRankBadge(rank: number) {
  if (rank === 1) {return '🥇';}
  if (rank === 2) {return '🥈';}
  if (rank === 3) {return '🥉';}
  return `#${rank}`;
}

export function DailyLeaderboard({ squadId, userId }: DailyLeaderboardProps): JSX.Element {
  const { theme } = useTheme();
  const query = useDailyContributions(squadId);
  const entries = useMemo(() => (query.data ?? []).slice(0, 8), [query.data]);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        borderRadius: theme.borderRadius['2xl'],
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[3],
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text variant="label" color={theme.colors.primary[500]}>Daily Leaderboard</Text>
          <Text variant="bodySmall" color={theme.colors.text.secondary}>Top contributor owns the crown.</Text>
        </View>
        <Pressable onPress={() => void query.refetch()}
  accessibilityLabel="Refresh button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
          <Text variant="label" color={theme.colors.primary[500]}>Refresh</Text>
        </Pressable>
      </View>

      {query.isLoading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <View key={`leaderboard-skeleton-${index}`} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
            <Skeleton width={28} height={18} />
            <Skeleton width={40} height={40} variant="circular" />
            <View style={{ flex: 1, gap: theme.spacing[2] }}>
              <Skeleton width="40%" height={14} />
              <Skeleton width="100%" height={6} borderRadius={999} />
            </View>
            <Skeleton width={52} height={14} />
          </View>
        ))
      ) : null}

      {query.error instanceof Error ? (
        <Text variant="bodySmall" color={theme.colors.error.DEFAULT}>{query.error.message}</Text>
      ) : null}

      {!query.isLoading && !(query.error instanceof Error) && entries.length === 0 ? (
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          No sessions yet today — first attack wins rank 1!
        </Text>
      ) : null}

      {!query.isLoading && !(query.error instanceof Error) && entries.length > 0 ? (
        <View style={{ height: entries.length * 70 }}>
          <FlashList
            data={entries}
            estimatedItemSize={70}
            keyExtractor={(item: (typeof entries)[number]) => item.userId}
            renderItem={({ item }: { item: (typeof entries)[number] }) => {
              const highlight = item.userId === userId;
              const progress = Math.max(0, Math.min(100, item.contributionScore));
              return (
                <View
                  style={{
                    marginBottom: theme.spacing[2],
                    borderRadius: theme.borderRadius.xl,
                    borderWidth: 1,
                    borderColor: highlight ? theme.colors.primary[500] : theme.colors.border.light,
                    backgroundColor: theme.colors.background.primary,
                    padding: theme.spacing[3],
                    gap: theme.spacing[2],
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] }}>
                    <Text variant="h4" color={theme.colors.text.primary} style={{ minWidth: 30 }}>{getRankBadge(item.rank)}</Text>
                    <View style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: getAvatarColor(item.userId), alignItems: 'center', justifyContent: 'center' }}>
                      <Text variant="label" color={theme.colors.text.inverse}>{item.username.slice(0, 1).toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
                        <Text variant="body" color={theme.colors.text.primary}>{item.username}</Text>
                        {item.rank === 1 ? <Text variant="bodySmall">👑 Top Contributor</Text> : null}
                      </View>
                      <Text variant="caption" color={theme.colors.text.secondary}>{`${item.contributionScore} score • ${item.sessionsCompleted} sessions`}</Text>
                    </View>
                    <Text variant="label" color={theme.colors.text.secondary}>{`${item.minutesFocused}m`}</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 999, backgroundColor: theme.colors.background.tertiary, overflow: 'hidden' }}>
                    <View style={{ width: `${progress}%`, height: '100%', backgroundColor: theme.colors.primary[500] }} />
                  </View>
                </View>
              );
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

