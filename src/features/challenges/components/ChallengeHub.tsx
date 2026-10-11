import React, { useState } from 'react';
import { Image, View, Text, ScrollView, Pressable } from 'react-native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { Card } from '../../../components/primitives/Card';
import { Badge } from '../../../components/Badge';
import { ProgressBar } from '../../../components/ui/ProgressBar';

import { ChallengeHubSkeleton } from './ChallengeHub.skeleton';
import { useActiveChallenges, useChallengeSummaries } from '../hooks/challengeQueries';
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
import { vexFire } from '../../../theme/tokens/vex-fire';
import { Text as VexText } from '../../../components/primitives/Text';
import { RouteBackButton } from '../../../shared/ui/vex/RouteBackButton';

interface ChallengeHubProps {
  userId: string;
  onChallengePress?: (challengeId: string) => void;
  onClaimReward?: (challengeId: string) => void;
  onBrowseChallenges?: () => void;
  onBack?: () => void;
}
export const ChallengeHub = React.memo(({
  userId,
  onChallengePress,
  onClaimReward,
  onBrowseChallenges,
  onBack,
}: ChallengeHubProps) => {
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
      style={[styles.container, { backgroundColor: vexFire.background }]}
      contentContainerStyle={styles.content}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={require('../../../../assets/vex/utility/challenge-badge.png')}
        resizeMode="contain"
        style={{ height: 180, opacity: 0.16, position: 'absolute', right: -40, top: 8, width: 180 }}
      />
      {onBack ? <RouteBackButton onPress={onBack} /> : null}
      <View style={{ marginBottom: 16 }}>
        <VexText style={{ color: vexFire.ember, fontSize: 12, fontWeight: '900', letterSpacing: 1.6 }}>
          TRIAL BOARD
        </VexText>
        <VexText style={{ color: vexFire.cream, fontSize: 30, fontWeight: '900', marginTop: 4 }}>
          Challenges
        </VexText>
        <VexText style={{ color: vexFire.textSecondary, fontSize: 15, marginTop: 4 }}>
          Small tests. Clear rewards. One more reason to return.
        </VexText>
      </View>
      <Card style={[styles.statsCard, { backgroundColor: vexFire.panel, borderColor: vexFire.border, borderWidth: 1 }]}>
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
        <Card style={[styles.streakCard, { borderColor: vexFire.border, borderWidth: 1 }]}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakTitle}>Daily Streak</Text>
            <Badge variant="warning" label="3 Days" />
          </View>
          <Text style={styles.streakDescription}>
            Complete daily challenges to maintain your streak and earn bonus rewards!
          </Text>
          <View style={styles.streakDays}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <View
                key={`item-${index}`}
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
          />
        )}
      </View>
    </ScrollView>
  );
});

ChallengeHub.displayName = 'ChallengeHub';
