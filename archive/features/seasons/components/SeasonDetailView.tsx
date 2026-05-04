/**
 * SeasonDetailView Component
 *
 * Full season detail view with milestones, rewards track, and progress.
 */

import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Card, Button, Badge } from '../../../components';
import type { SeasonDetail, UserSeasonProgress } from '../types';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { createSheet } from '@/shared/ui/create-sheet';

type NavigationProp = NativeStackNavigationProp<ExtendedRootStackParams>;

interface SeasonDetailViewProps {
  season: SeasonDetail | null;
  progress: UserSeasonProgress | null;
  onPurchasePremium?: () => void;
  onClaimTier?: (tier: number) => void;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function SeasonDetailView({
  season,
  progress,
  onPurchasePremium,
  onClaimTier,
  loading,
  error,
  onRetry,
}: SeasonDetailViewProps): JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handlePurchasePremium = () => {
    if (onPurchasePremium) {
      onPurchasePremium();
      return;
    }

    navigation.navigate('Paywall', {
      source: 'season_premium_cta',
      gatedFeature: 'season_premium_rewards',
    });
  };

  // Loading state
  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.skeletonCard}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonTrack} />
        </Card>
      </ScrollView>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          {onRetry && (
            <Button variant="primary" onPress={onRetry} style={styles.retryButton}
  accessibilityLabel="Try Again button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">
              Try Again
            </Button>
          )}
        </Card>
      </View>
    );
  }

  // Empty state
  if (!season || !progress) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No Season Data</Text>
          <Text style={styles.emptyText}>Check back later for season details</Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <Card style={styles.headerCard}>
        <Text style={styles.seasonName}>{season.name}</Text>
        <Text style={styles.seasonDescription}>{season.description}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Tier {progress.currentTier}</Text>
            <Text style={styles.statLabel}>Current</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {Math.floor((progress.tierXp / season.xpPerTier) * 100)}%
            </Text>
            <Text style={styles.statLabel}>To Next Tier</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{season.totalParticipants.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Participants</Text>
          </View>
        </View>

        {/* Premium CTA */}
        {!progress.isPremium && (
          <Pressable
            style={({ pressed }) => [styles.premiumBanner, pressed && { opacity: 0.8 }]}
            onPress={handlePurchasePremium}
            accessibilityLabel="Interactive control"
            accessibilityRole="button"
            accessibilityHint="Activates this control">
            <Badge variant="warning">Premium</Badge>
            <Text style={styles.premiumText}>
              Upgrade for exclusive rewards!
            </Text>
          </Pressable>
        )}
      </Card>

      {/* Progress Track */}
      <Card style={styles.trackCard}>
        <Text style={styles.trackTitle}>Progress</Text>
        <View style={styles.trackContainer}>
          {Array.from({ length: 5 }).map((_, i) => {
            const tier = progress.currentTier - 2 + i;
            if (tier < 1 || tier > season.tierCount) {return null;}

            const isCurrent = tier === progress.currentTier;
            const isCompleted = tier < progress.currentTier;
            const isClaimed = progress.claimedTiers.includes(String(tier));

            return (
              <View
                key={tier}
                style={[
                  styles.tierNode,
                  isCurrent && styles.tierNodeCurrent,
                  isCompleted && styles.tierNodeCompleted,
                ]}
              >
                <Text style={styles.tierNumber}>{tier}</Text>
                {isCompleted && !isClaimed && (
                  <Badge variant="success" style={styles.unclaimedBadge}>
                    !
                  </Badge>
                )}
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = createSheet({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  skeletonCard: {
    padding: 16,
    margin: 16,
  },
  skeletonHeader: {
    height: 32,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonTrack: {
    height: 60,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#DC2626',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 120,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  headerCard: {
    margin: 16,
    padding: 16,
  },
  seasonName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  seasonDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  premiumText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  trackCard: {
    margin: 16,
    padding: 16,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  trackContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierNode: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierNodeCurrent: {
    backgroundColor: '#4F46E5',
  },
  tierNodeCompleted: {
    backgroundColor: '#10B981',
  },
  tierNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  unclaimedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
