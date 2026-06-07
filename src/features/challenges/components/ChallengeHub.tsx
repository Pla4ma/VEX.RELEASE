import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useThemeObject } from '../../../theme';
import { Card, Badge, ProgressBar } from '../../../components';
import { SkeletonItem } from '../../../shared/ui/components/SkeletonItem';
import { useActiveChallenges, useChallengeSummaries } from '../hooks';
import { ChallengeCard } from './ChallengeCard';
import { type UserChallengeSummary } from '../schemas';
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
}
export const ChallengeHub: React.FC<ChallengeHubProps> = ({
  userId,
  onChallengePress,
  onClaimReward,
}) => {
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
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
        contentContainerStyle={styles.content}
      >
        <Card style={styles.statsCard}>
          <SkeletonItem variant="title" width="50%" style={{ marginBottom: 12 }} />
          <View style={styles.statsGrid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.statItem}>
                <SkeletonItem variant="text" width={32} height={24} />
                <SkeletonItem variant="text" width={48} height={12} style={{ marginTop: 4 }} />
              </View>
            ))}
          </View>
          <SkeletonItem variant="text" height={8} style={{ borderRadius: 4, marginTop: 8 }} />
        </Card>

        <View style={styles.filterContainer}>
          <View style={[styles.filterContent, { flexDirection: 'row' }]}>
            {['ALL', 'DAILY', 'WEEKLY', 'SPECIAL'].map((filter) => (
              <SkeletonItem
                key={filter}
                variant="button"
                width={80}
                height={36}
                style={{ borderRadius: 20 }}
              />
            ))}
          </View>
        </View>

        {[0, 1, 2].map((i) => (
          <Card key={i} style={{ padding: 16, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <SkeletonItem variant="button" width={60} height={24} style={{ borderRadius: 12 }} />
              <SkeletonItem variant="button" width={60} height={24} style={{ borderRadius: 12 }} />
              <SkeletonItem variant="button" width={60} height={24} style={{ borderRadius: 12 }} />
            </View>
            <SkeletonItem variant="title" width="80%" style={{ marginBottom: 8 }} />
            <SkeletonItem variant="text" style={{ marginBottom: 4 }} />
            <SkeletonItem variant="text" width="60%" style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <SkeletonItem variant="text" width={80} height={14} />
              <SkeletonItem variant="text" width={40} height={14} />
            </View>
            <SkeletonItem variant="text" height={8} style={{ borderRadius: 4, marginBottom: 12 }} />
            <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border.light, paddingTop: 12 }}>
              <SkeletonItem variant="text" width="50%" height={14} />
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: theme.colors.border.light, paddingTop: 12, marginTop: 12 }}>
              <SkeletonItem variant="button" width={140} height={44} />
            </View>
          </Card>
        ))}
      </ScrollView>
    );
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
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}></Text>
            <Text style={styles.emptyTitle}>No challenges found</Text>
            <Text style={styles.emptyText}>
              {activeFilter === 'COMPLETED'
                ? 'Complete some challenges to see them here!'
                : 'Check back later for new challenges.'}
            </Text>
          </Card>
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
};
