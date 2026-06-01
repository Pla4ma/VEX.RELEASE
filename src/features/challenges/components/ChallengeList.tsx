/**
 * ChallengeList Component
 *
 * List view for challenges with filtering and refresh.
 */

import React from 'react';
import { View, RefreshControl } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text, Card, Button } from '../../../components';
import { ChallengeCard } from './ChallengeCard';
import type { UserChallengeSummary } from '../schemas';
import { challengeListStyles as styles } from './challenge-list.styles';

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

export function ChallengeList({
  challenges,
  onClaimChallenge,
  onRerollChallenge,
  onRefresh,
  loading,
  error,
  onRetry,
  filter = 'ALL',
}: ChallengeListProps): JSX.Element {
  const filteredChallenges = React.useMemo(() => {
    switch (filter) {
      case 'ACTIVE':
        return challenges.filter((c) => c.status === 'ACTIVE');
      case 'COMPLETED':
        return challenges.filter(
          (c) => c.status === 'COMPLETED' || c.status === 'CLAIMED',
        );
      default:
        return challenges;
    }
  }, [challenges, filter]);

  const renderChallenge = ({ item }: { item: UserChallengeSummary }) => (
    <ChallengeCard
      challenge={item}
      onClaim={() => onClaimChallenge?.(item.challengeId)}
      onReroll={() => onRerollChallenge?.(item.challengeId)}
    />
  );

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
            <Button
              variant="primary"
              onPress={onRetry}
              style={styles.retryButton}
              accessibilityLabel="Retry loading challenges"
              accessibilityRole="button"
              accessibilityHint="Double tap to select"
            >
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
          <Text style={styles.emptyTitle}>
            {filter === 'ALL'
              ? 'No Challenges'
              : `No ${filter.toLowerCase()} challenges`}
          </Text>
          <Text style={styles.emptyText}>
            {filter === 'ALL'
              ? 'Check back later for new challenges!'
              : 'Try a different filter'}
          </Text>
          {filter !== 'ALL' && onRefresh && (
            <Button
              variant="secondary"
              onPress={onRefresh}
              style={styles.retryButton}
              accessibilityLabel="Show all challenges"
              accessibilityRole="button"
              accessibilityHint="Double tap to select"
            >
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
      estimatedItemSize={168}
      refreshControl={
        onRefresh && (
          <RefreshControl refreshing={!!loading} onRefresh={onRefresh} />
        )
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {filteredChallenges.length} Challenge
            {filteredChallenges.length !== 1 ? 's' : ''}
          </Text>
        </View>
      }
    />
  );
}
