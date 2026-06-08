import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useThemeObject } from '../../../theme';
import { Card, Badge, ProgressBar } from '../../../components';
import { SkeletonItem } from '../../../shared/ui/components/SkeletonItem';
import { ChallengeHubSkeleton } from './ChallengeHub.skeleton';
import { useActiveChallenges, useChallengeSummaries } from '../hooks';
import { ChallengeCard } from './ChallengeCard';
import { type UserChallengeSummary } from '../schemas';
import { EmptyChallenges } from '../../../shared/ui/primitives/EmptyState.variants';
import { styles } from './challenge-hub-styles';
import {
  type ChallengeFilter,
  FILTER_OPTIONS,
  getFilteredChallenges,
  getChallengeStats,
} from './challenge-hub-helpers';

interface ChallengeHubProps {
  userId: string;
  onChallengePress?: (challengeId: string) => void;
  onClaimReward?: (challengeId: string) => void;
  onBrowseChallenges?: () => void;
}
export const ChallengeHub = React.memo(({
  userId,
  onChallengePress,
  onClaimReward,
  onBrowseChallenges,
}: ChallengeHubProps) => {
  const theme = useThemeObject();
  const [activeFilter, setActiveFilter] = useState<ChallengeFilter>('ALL');
  const { isLoading: isLoadingAll } = useActiveChallenges(userId);
  const { data: challengeSummaries, isLoading: isLoadingSummaries } =
    useChallengeSummaries(userId);
  const isLoading = isLoadingAll || isLoadingSummaries;
  const stats = getChallengeStats(challengeSummaries);
  const filteredChallenges = getFilteredChallenges(challengeSummaries, activeFilter);
  const renderChallenge: ListRenderItem<UserChallengeSummary> = ({ item }) => (
    <Pressable
      onPress={() => onChallengePress?.(item.challengeId)}
      style={({ pressed }) => [pressed && { opacity: 0.9 }]}
      accessibilityLabel="Claim reward"
      accessibilityRole="button"
      accessibilityHint="Double tap to select"
    >
      <ChallengeCard challenge={item} onClaim={() => onClaimReward?.(item.challengeId)} />
    </Pressable>
  );
  if (isLoading) {
    return <ChallengeHubSkeleton />;
  }
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      contentContainerStyle={styles.content}
    >
      <Card style={styles.statsCard}>
        <Text style={styles.statsTitle}>Challenge Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.available}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.claimed}</Text>
            <Text style={styles.statLabel}>Claimed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {Math.round((stats.completed / Math.max(1, stats.total)) * 100)}%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
        <ProgressBar
          progress={stats.total > 0 ? (stats.completed + stats.claimed) / stats.total : 0}
          style={styles.overallProgress}
        />
      </Card>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_OPTIONS.map((filter) => (
          <Pressable
            key={filter}
            style={({ pressed }) => [
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => setActiveFilter(filter)}
            accessibilityLabel="Challenge hub item"
            accessibilityRole="button"
            accessibilityHint="Double tap to select"
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {(activeFilter === 'ALL' || activeFilter === 'DAILY') && (
        <Card style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Daily Streak</Text>
            <Badge variant="warning">3 Days</Badge>
          </View>
          <Text style={styles.streakDescription}>
            Complete daily challenges to maintain your streak and earn bonus rewards!
          </Text>
          <View style={styles.streakDays}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <View
                key={index}
                style={[styles.streakDay, index < 3 && styles.streakDayCompleted]}
              >
                <Text style={[styles.streakDayText, index < 3 && styles.streakDayTextCompleted]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>
          {activeFilter === 'ALL' ? 'All Challenges' : `${activeFilter} Challenges`}
        </Text>
        {filteredChallenges.length === 0 ? (
          <EmptyChallenges onBrowseChallenges={onBrowseChallenges} />
        ) : (
          <FlashList<UserChallengeSummary>
            data={filteredChallenges}
            renderItem={renderChallenge}
            keyExtractor={(item: UserChallengeSummary) => item.challengeId}
            estimatedItemSize={168}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
});

ChallengeHub.displayName = 'ChallengeHub';
