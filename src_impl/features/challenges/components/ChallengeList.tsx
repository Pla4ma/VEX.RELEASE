/**
 * ChallengeList Component
 *
 * List view for challenges with filtering and refresh.
 */

import React from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, Card, Button } from '../../../components';
import { ChallengeCard } from './ChallengeCard';
import type { UserChallengeSummary } from '../schemas';
import { createSheet } from '@/shared/ui/create-sheet';

interface ChallengeListProps {
  challenges: UserChallengeSummary[];
  onClaimChallenge?: (challengeId: string) => void;
  onRerollChallenge?: (challengeId: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  filter?: 'ALL' | 'ACTIVE' | 'COMPLETED';
}

export function ChallengeList({ challenges, onClaimChallenge, onRerollChallenge, onRefresh, loading, error, onRetry, filter = 'ALL' }: ChallengeListProps): JSX.Element {
  const filteredChallenges = React.useMemo(() => {
    switch (filter) {
      case 'ACTIVE':
        return challenges.filter((c) => c.status === 'ACTIVE');
      case 'COMPLETED':
        return challenges.filter((c) => c.status === 'COMPLETED' || c.status === 'CLAIMED');
      default:
        return challenges;
    }
  }, [challenges, filter]);

  const renderChallenge = ({ item }: { item: UserChallengeSummary }) => <ChallengeCard challenge={item} onClaim={() => onClaimChallenge?.(item.challengeId)} onReroll={() => onRerollChallenge?.(item.challengeId)} />;

  // Loading state
  if (loading && !challenges.length) {
    return (
      <View style={styles.container}>
        <Card style={styles.skeletonCard}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
        </Card>
        <Card style={styles.skeletonCard}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
        </Card>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.errorCard}>
          <Text style={styles.errorTitle}>Failed to Load Challenges</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          {onRetry && (
            <Button variant="primary" onPress={onRetry} style={styles.retryButton} accessibilityLabel="Retry button" accessibilityRole="button" accessibilityHint="Activates this control">
              Retry
            </Button>
          )}
        </Card>
      </View>
    );
  }

  // Empty state
  if (!filteredChallenges.length) {
    return (
      <View style={styles.centerContainer}>
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{filter === 'ALL' ? 'No Challenges' : `No ${filter.toLowerCase()} challenges`}</Text>
          <Text style={styles.emptyText}>{filter === 'ALL' ? 'Check back later for new challenges!' : 'Try a different filter'}</Text>
          {filter !== 'ALL' && onRefresh && (
            <Button variant="secondary" onPress={onRefresh} style={styles.retryButton} accessibilityLabel="Show All button" accessibilityRole="button" accessibilityHint="Activates this control">
              Show All
            </Button>
          )}
        </Card>
      </View>
    );
  }

  return (
    <FlashList
      data={filteredChallenges}
      renderItem={renderChallenge}
      keyExtractor={(item: UserChallengeSummary) => item.challengeId}
      contentContainerStyle={styles.listContainer}
      refreshControl={onRefresh && <RefreshControl refreshing={!!loading} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {filteredChallenges.length} Challenge{filteredChallenges.length !== 1 ? 's' : ''}
          </Text>
        </View>
      }
    />
  );
}

const styles = createSheet({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  listContainer: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  skeletonCard: {
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 12,
    width: '70%',
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 18,
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
});
