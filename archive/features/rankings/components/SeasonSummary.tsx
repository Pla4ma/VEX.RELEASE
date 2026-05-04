import { captureSilentFailure } from '../../../utils/silent-failure';
/**
 * SeasonSummary Component
 *
 * Displays end-of-season results with rewards and statistics.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useThemeObject } from '../../../theme';
import { Card, Button, Badge } from '../../../components';
import { useCurrentSeasonSummary } from '../hooks';
import { type SeasonSummary as SeasonSummaryData, type RankTierName } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

interface SeasonSummaryProps {
  userId: string;
  onShare?: (summary: SeasonSummaryData) => void;
  onClaimRewards?: () => void;
}

const TIER_COLORS: Record<RankTierName, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#E5E4E2',
  Diamond: '#B9F2FF',
  Master: '#9370DB',
  Grandmaster: '#FF4500',
  Legend: '#FF0000',
};

export const SeasonSummary: React.FC<SeasonSummaryProps> = ({
  userId,
  onShare,
  onClaimRewards,
}) => {
  const theme = useThemeObject();
  const { data: summary, isLoading, error } = useCurrentSeasonSummary(userId);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState<Set<string>>(new Set());

  // Loading State
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>Loading season summary...</Text>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorTitle}>Failed to load season summary</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }

  // No Summary State
  if (!summary) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyTitle}>No season data available</Text>
        <Text style={styles.emptyMessage}>Complete activities to earn your first season rewards!</Text>
      </View>
    );
  }

  const handleClaim = async (rewardIndex: number) => {
    setIsClaiming(true);
    try {
      await onClaimRewards?.();
      setClaimedRewards(prev => new Set([...prev, rewardIndex.toString()]));
    } finally {
      setIsClaiming(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I finished ${summary.seasonName} at rank #${summary.finalRank} (${summary.finalTier})! 🏆`,
      });
      onShare?.(summary);
    } catch (error) { captureSilentFailure(error, { feature: 'rankings', operation: 'ui-fallback', type: 'ui' });}
  };

  const tierColor = TIER_COLORS[summary.finalTier] || '#666';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Text style={styles.seasonName}>{summary.seasonName}</Text>
        <Text style={styles.seasonComplete}>Season Complete!</Text>

        <View style={[styles.tierBadge, { backgroundColor: tierColor + '20' }]}>
          <Text style={[styles.tierText, { color: tierColor }]}>{summary.finalTier}</Text>
        </View>

        <Text style={styles.finalRank}>Final Rank: #{summary.finalRank.toLocaleString()}</Text>
        <Text style={styles.percentile}>Top {summary.percentile.toFixed(1)}%</Text>
      </Card>

      {/* Stats Grid */}
      <Card style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Your Performance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.xpGained.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP Gained</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.sessionsCompleted}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.round(summary.totalFocusTime / 3600)}h</Text>
            <Text style={styles.statLabel}>Focus Time</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{summary.streakHigh}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </Card>

      {/* Duel Stats */}
      {summary.duelsPlayed > 0 && (
        <Card style={styles.duelCard}>
          <Text style={styles.sectionTitle}>Duel Performance</Text>
          <View style={styles.duelStats}>
            <View style={styles.duelStat}>
              <Text style={styles.duelValue}>{summary.duelsWon}</Text>
              <Text style={styles.duelLabel}>Wins</Text>
            </View>
            <Text style={styles.duelDivider}>/</Text>
            <View style={styles.duelStat}>
              <Text style={styles.duelValue}>{summary.duelsPlayed}</Text>
              <Text style={styles.duelLabel}>Played</Text>
            </View>
            <View style={styles.duelWinRate}>
              <Text style={styles.winRateValue}>
                {Math.round((summary.duelsWon / summary.duelsPlayed) * 100)}%
              </Text>
              <Text style={styles.winRateLabel}>Win Rate</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Rewards */}
      <Card style={styles.rewardsCard}>
        <Text style={styles.sectionTitle}>Rewards Earned</Text>
        <Text style={styles.totalValue}>Total Value: {summary.totalRewardValue.toLocaleString()}</Text>

        {summary.rewardsEarned.map((reward, index) => {
          const isClaimed = claimedRewards.has(index.toString());

          return (
            <View key={index} style={[styles.rewardItem, isClaimed && styles.rewardClaimed]}>
              <View style={styles.rewardIcon}>
                <Text style={styles.rewardIconText}>
                  {reward.type === 'RANK' ? '#' : reward.type === 'TIER' ? '^' : reward.type === 'MILESTONE' ? '*' : '+'}
                </Text>
              </View>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{reward.name}</Text>
                <Badge variant={reward.type === 'RANK' ? 'primary' : 'default'} size="sm">
                  {reward.type}
                </Badge>
              </View>
              <View style={styles.rewardValue}>
                <Text style={styles.rewardAmount}>
                  {typeof reward.value === 'number' ? reward.value.toLocaleString() : reward.value}
                </Text>
                {!isClaimed && !reward.claimed && (
                  <Button
                    size="sm"
                    onPress={() => handleClaim(index)}
                    isLoading={isClaiming}

                  accessibilityLabel="Claim button"
                  accessibilityRole="button"
                  accessibilityHint="Activates this control">
                    Claim
                  </Button>
                )}
                {(isClaimed || reward.claimed) && (
                  <Text style={styles.claimedText}>Claimed</Text>
                )}
              </View>
            </View>
          );
        })}
      </Card>

      {/* Share Button */}
      <Button onPress={handleShare} variant="secondary" style={styles.shareButton}
  accessibilityLabel="Share Results button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
        Share Results
      </Button>
    </ScrollView>
  );
};

const styles = createSheet({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
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
  },
  headerCard: {
    padding: 24,
    alignItems: 'center',
  },
  seasonName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  seasonComplete: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tierBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  finalRank: {
    fontSize: 16,
    marginBottom: 4,
  },
  percentile: {
    fontSize: 14,
    color: '#666',
  },
  statsCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statBox: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  duelCard: {
    padding: 16,
  },
  duelStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  duelStat: {
    alignItems: 'center',
  },
  duelValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  duelLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  duelDivider: {
    fontSize: 20,
    color: '#666',
  },
  duelWinRate: {
    alignItems: 'center',
    marginLeft: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  winRateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  winRateLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  rewardsCard: {
    padding: 16,
  },
  totalValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardClaimed: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardIconText: {
    fontSize: 20,
  },
  rewardInfo: {
    flex: 1,
    gap: 4,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '500',
  },
  rewardValue: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rewardAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  claimedText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  shareButton: {
    marginTop: 8,
  },
});
