/**
 * LeaderboardView Component
 *
 * Displays ranked entries with user position and pagination.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useThemeObject } from '../../../theme';
import { Card, Avatar, Badge, Button } from '../../../components';
import { useLeaderboard, useUserRank } from '../hooks';
import {
  LeaderboardPeriodSchema,
  LeaderboardScopeSchema,
  LeaderboardTypeSchema,
  type LeaderboardEntry,
} from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

interface LeaderboardViewProps {
  type: string;
  scope: string;
  period: string;
  userId: string;
  onUserPress?: (userId: string) => void;
  onRefresh?: () => void;
}

const TIER_COLORS: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
  Master: '#9370DB',
  Grandmaster: '#FF4500',
  Legend: '#FF0000',
};

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  type,
  scope,
  period,
  userId,
  onUserPress,
  onRefresh,
}) => {
  const theme = useThemeObject();
  const leaderboardInput = {
    type: LeaderboardTypeSchema.parse(type),
    scope: LeaderboardScopeSchema.parse(scope),
    period: LeaderboardPeriodSchema.parse(period),
    limit: 50,
  };
  const { data: leaderboard, isLoading, error, refetch } = useLeaderboard(leaderboardInput);
  const { data: userRank } = useUserRank(userId, type, scope);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    onRefresh?.();
    setRefreshing(false);
  }, [refetch, onRefresh]);

  // Loading State
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>Failed to load leaderboard</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
        <Button onPress={handleRefresh} style={styles.retryButton}
  accessibilityLabel="Retry button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">Retry</Button>
      </View>
    );
  }

  // Empty State
  if (!leaderboard || leaderboard.entries.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyTitle}>No entries yet</Text>
        <Text style={styles.emptyMessage}>Be the first to make the leaderboard!</Text>
        <Button onPress={handleRefresh} variant="secondary"
  accessibilityLabel="Refresh button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">Refresh</Button>
      </View>
    );
  }

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.userId === userId;
    const trend = item.rankChange > 0 ? '↑' : item.rankChange < 0 ? '↓' : '−';
    const trendColor = item.rankChange > 0 ? '#4CAF50' : item.rankChange < 0 ? '#F44336' : '#999';

    return (
      <Pressable
        style={({ pressed }) => [
          styles.entryRow,
          isCurrentUser && styles.currentUserRow,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => onUserPress?.(item.userId)}
        disabled={!onUserPress}
        accessibilityLabel="Interactive control"
        accessibilityRole="button"
        accessibilityHint="Activates this control">
        <View style={styles.rankContainer}>
          {item.rank <= 3 ? (
            <View style={[styles.medal, getMedalStyle(item.rank)]}>
              <Text style={styles.medalText}>{item.rank}</Text>
            </View>
          ) : (
            <Text style={styles.rankText}>#{item.rank}</Text>
          )}
        </View>

        <Avatar
          size="sm"
          name={item.displayName || item.displayValue?.charAt(0) || '?'}
        />

        <View style={styles.userInfo}>
          <Text style={[styles.userName, isCurrentUser && styles.currentUserName]}>
            {isCurrentUser ? 'You' : item.userId.slice(0, 8)}
          </Text>
          {isCurrentUser && <Badge variant="primary" size="sm">You</Badge>}
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreValue}>{item.displayValue || item.value.toLocaleString()}</Text>
          {item.rankChange !== 0 && (
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trend} {Math.abs(item.rankChange)}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* User's Position Card */}
      {userRank && (
        <Card style={styles.userCard}>
          <Text style={styles.userCardTitle}>Your Position</Text>
          <View style={styles.userCardContent}>
            <Text style={styles.userCardRank}>#{userRank.rank}</Text>
            <Text style={styles.userCardScore}>
              {userRank.displayValue || userRank.value.toLocaleString()}
            </Text>
          </View>
        </Card>
      )}

      {/* Leaderboard List */}
      <FlashList
        data={leaderboard.entries}
        keyExtractor={(item: LeaderboardEntry) => item.userId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Stats Footer */}
      <Card style={styles.statsCard}>
        <Text style={styles.statsText}>
          {leaderboard.totalParticipants.toLocaleString()} participants
        </Text>
      </Card>
    </View>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  userCard: {
    margin: 16,
    padding: 16,
  },
  userCardTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  userCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userCardRank: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  userCardScore: {
    fontSize: 24,
    fontWeight: '600',
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  currentUserRow: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  medal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medal1: {
    backgroundColor: '#FFD700',
  },
  medal2: {
    backgroundColor: '#C0C0C0',
  },
  medal3: {
    backgroundColor: '#CD7F32',
  },
  medalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentUserName: {
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendText: {
    fontSize: 12,
    marginTop: 2,
  },
  statsCard: {
    margin: 16,
    padding: 12,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
});

function getMedalStyle(rank: number) {
  if (rank === 1) {return styles.medal1;}
  if (rank === 2) {return styles.medal2;}
  return styles.medal3;
}
