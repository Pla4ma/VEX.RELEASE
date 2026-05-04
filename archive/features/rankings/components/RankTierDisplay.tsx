/**
 * RankTierDisplay Component
 *
 * Visual representation of rank tier with progress and requirements.
 */

import React from 'react';
import {
  View,
  Text,
} from 'react-native';
import { Card, Badge, ProgressBar } from '../../../components';
import { useUserTier, useRankTiers } from '../hooks';
import { createSheet } from '@/shared/ui/create-sheet';

interface RankTierDisplayProps {
  userId: string;
  currentRating: number;
  showDetails?: boolean;
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

const TIER_ICONS: Record<string, string> = {
  Bronze: '🥉',
  Silver: '🥈',
  Gold: '🥇',
  Platinum: '💎',
  Diamond: '💠',
  Master: '👑',
  Grandmaster: '🔥',
  Legend: '⭐',
};

export const RankTierDisplay: React.FC<RankTierDisplayProps> = ({
  userId,
  currentRating,
  showDetails = true,
}) => {
  const { data: currentTier, isLoading: tierLoading } = useUserTier(userId);
  const { data: allTiers, isLoading: tiersLoading } = useRankTiers();

  if (tierLoading || tiersLoading) {
    return (
      <Card style={{ ...styles.container, ...styles.loadingContainer }}>
        <Text style={styles.loadingText}>Loading rank info...</Text>
      </Card>
    );
  }

  if (!currentTier || !allTiers) {
    return (
      <Card style={{ ...styles.container, ...styles.errorContainer }}>
        <Text style={styles.errorText}>Unable to load rank information</Text>
      </Card>
    );
  }

  const tierColor = TIER_COLORS[currentTier.name] || '#666';
  const tierIcon = TIER_ICONS[currentTier.name] || '🏆';

  // Find next tier
  const tierIndex = allTiers.findIndex(t => t.name === currentTier.name);
  const nextTier = allTiers[tierIndex + 1];

  // Calculate progress to next tier
  const progress = nextTier
    ? (currentRating - currentTier.minRating) / (nextTier.minRating - currentTier.minRating)
    : 1;

  const pointsNeeded = nextTier ? nextTier.minRating - currentRating : 0;

  return (
    <Card style={styles.container}>
      {/* Current Tier Header */}
      <View style={[styles.header, { backgroundColor: tierColor + '15' }]}>
        <Text style={styles.tierIcon}>{tierIcon}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.tierName, { color: tierColor }]}>{currentTier.name}</Text>
          <Text style={styles.rating}>{currentRating.toLocaleString()} Rating</Text>
        </View>
      </View>

      {/* Progress to Next Tier */}
      {nextTier && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress to {nextTier.name}</Text>
            <Text style={styles.progressValue}>{Math.round(progress * 100)}%</Text>
          </View>
          <ProgressBar progress={progress} fillColor={tierColor} style={styles.progressBar} />
          <Text style={styles.pointsNeeded}>
            {pointsNeeded.toLocaleString()} points needed
          </Text>
        </View>
      )}

      {/* Tier Benefits */}
      {showDetails && currentTier.rewards.length > 0 && (
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Tier Benefits</Text>
          {currentTier.rewards.map((reward, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                {reward.type}: {reward.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* All Tiers Overview */}
      {showDetails && (
        <View style={styles.tiersOverview}>
          <Text style={styles.overviewTitle}>Rank Tiers</Text>
          <View style={styles.tiersList}>
            {allTiers.map((tier, index) => {
              const isCurrent = tier.name === currentTier.name;
              const isUnlocked = tier.minRating <= currentRating;

              return (
                <View
                  key={tier.name}
                  style={[
                    styles.tierItem,
                    isCurrent && styles.currentTierItem,
                    !isUnlocked && styles.lockedTierItem,
                  ]}
                >
                  <Text style={[
                    styles.tierItemIcon,
                    { color: isUnlocked ? TIER_COLORS[tier.name] : '#ccc' },
                  ]}>
                    {TIER_ICONS[tier.name]}
                  </Text>
                  <View style={styles.tierItemInfo}>
                    <Text style={[
                      styles.tierItemName,
                      isCurrent && styles.currentTierName,
                      !isUnlocked && styles.lockedTierName,
                    ]}>
                      {tier.name}
                    </Text>
                    <Text style={styles.tierItemRating}>
                      {tier.minRating.toLocaleString()}+
                    </Text>
                  </View>
                  {isCurrent && <Badge variant="primary" size="sm">Current</Badge>}
                  {!isUnlocked && <Text style={styles.lockedText}>🔒</Text>}
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = createSheet({
  container: {
    padding: 0,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  tierIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  tierName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  progressSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    marginBottom: 8,
  },
  pointsNeeded: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  benefitsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitBullet: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
  },
  tiersOverview: {
    padding: 20,
  },
  overviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  tiersList: {
    gap: 8,
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  currentTierItem: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  lockedTierItem: {
    opacity: 0.6,
  },
  tierItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tierItemInfo: {
    flex: 1,
  },
  tierItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentTierName: {
    fontWeight: 'bold',
  },
  lockedTierName: {
    color: '#999',
  },
  tierItemRating: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  lockedText: {
    fontSize: 14,
  },
});
