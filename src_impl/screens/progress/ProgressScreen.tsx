import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { FeatureTeaserCard } from '../../components/FeatureTeaserCard';
import { EmptyState } from '../../components/EmptyState';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import { Skeleton } from '../../components/ui/Skeleton';
import { BattlePassTrack } from '../../features/battle-pass/components/BattlePassTrack';
import { useBattlePassTiers, useUserBattlePass } from '../../features/battle-pass/hooks';
import { useFeatureAccess } from '../../features/liveops-config';
import { MasteryCard } from '../../features/mastery/components/MasteryCard';
import { MasteryService } from '../../features/mastery/service';
import type { MasteryState } from '../../features/mastery/types';
import { FocusScoreDashboard } from "../../features/focus-identity/components/focus-score-dashboard";
import { useFocusScoreDashboardModel } from "../../features/focus-identity/hooks-focus-score";
import { ProgressionDashboard } from '../../features/progression/components';
// import { LeaderboardView } from '../../features/rankings/components'; // Feature not implemented
import { useActiveSeason, useUpcomingSeasons } from '../../features/seasons/hooks';
import { useSessionStats } from '../../session/hooks/useSession';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import type { ExtendedRootStackParams } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const formatHours = (totalMilliseconds: number) => `${(totalMilliseconds / 3600000).toFixed(totalMilliseconds >= 36000000 ? 0 : 1)}h`;
const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export function ProgressScreen(): JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const seasonQuery = useActiveSeason();
  const upcomingSeasons = useUpcomingSeasons();
  const battlePassTiers = useBattlePassTiers(seasonQuery.data?.id ?? '');
  const battlePassProgress = useUserBattlePass(userId, seasonQuery.data?.id ?? '');
  const focusDashboardModel = useFocusScoreDashboardModel(userId || null, 30);
  const { stats, isLoading: isStatsLoading, refresh } = useSessionStats(userId);
  const [masteryState, setMasteryState] = useState<MasteryState | null>(null);
  const daysRemaining = useMemo(() => seasonQuery.data ? Math.max(0, Math.ceil((seasonQuery.data.endAt - Date.now()) / 86400000)) : null, [seasonQuery.data]);
  const statCards = [
    { label: 'Focus Hours', value: stats ? formatHours(stats.totalFocusTime) : '--' },
    { label: 'Total Sessions', value: stats ? String(stats.totalSessions) : '--' },
    { label: 'Longest Streak', value: stats ? `${stats.longestStreak} days` : '--' },
  ];

  useEffect(() => {
    setMasteryState(userId ? MasteryService.getOrCreateMasteryState(userId) : null);
  }, [userId]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background.primary }} contentContainerStyle={{ paddingTop: insets.top + theme.spacing[5], paddingBottom: theme.spacing[10], paddingHorizontal: theme.spacing[5], gap: theme.spacing[4] }} showsVerticalScrollIndicator={false}>
      <View><Text variant="label" color={theme.colors.primary[500]}>Progress</Text><Text variant="h2" color={theme.colors.text.primary}>Your long-term loop.</Text><Text variant="body" color={theme.colors.text.secondary}>We keep this view useful from day one, then let more systems show up as they become emotionally relevant.</Text></View>
      <FocusScoreDashboard
        model={focusDashboardModel}
        onRetry={() => { void focusDashboardModel.refetch(); }}
        onStartSession={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
        onOpenMonthlyReport={() => navigation.navigate('Paywall', { source: 'focus-monthly-report', gatedFeature: 'monthly_focus_report' })}
      />
      {userId ? (
        <ProgressionDashboard
          userId={userId}
          onStartSession={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })}
        />
      ) : null}
      {disclosure.features.battle_pass.isUnlocked && seasonQuery.data ? (
        <>
          <BattlePassTrack tiers={battlePassTiers.data ?? []} userProgress={battlePassProgress.data ?? null} loading={battlePassTiers.isLoading || battlePassProgress.isLoading} error={(battlePassTiers.error as Error | null) ?? (battlePassProgress.error as Error | null)} onRetry={() => { void Promise.all([battlePassTiers.refetch(), battlePassProgress.refetch()]); }} />
          <View style={{ borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary, padding: theme.spacing[4], gap: theme.spacing[2], ...getPremiumCardStyle('medium') }}><Text variant="label" color={theme.colors.text.secondary}>Season Timer</Text><Text variant="h4" color={theme.colors.text.primary}>{seasonQuery.data.name}</Text><Text variant="body" color={theme.colors.text.secondary}>{daysRemaining === 1 ? '1 day remaining' : `${daysRemaining ?? 0} days remaining`}</Text><Text variant="caption" color={theme.colors.text.tertiary}>{`Ends ${formatDate(seasonQuery.data.endAt)}`}</Text></View>
        </>
      ) : (
        <FeatureTeaserCard ctaLabel="Start a session" description={disclosure.features.battle_pass.lockedDescription} feature="battle_pass" icon="🎟️" onPress={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })} stage={disclosure.stage} title="Battle Pass" unlockLabel={disclosure.features.battle_pass.unlockReason} whyItMatters="Season progression lands better once you already trust the core focus loop." progressLabel={upcomingSeasons.data?.[0]?.startAt ? `Next season ${formatDate(upcomingSeasons.data[0].startAt)}` : disclosure.features.battle_pass.recommendedUnlockMoment} />
      )}
      <View style={{ gap: theme.spacing[3] }}>
        <Text variant="h4" color={theme.colors.text.primary}>Personal Stats</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing[3], flexWrap: 'wrap' }}>{statCards.map((item) => <View key={item.label} style={{ minWidth: '30%', flexGrow: 1, borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary, padding: theme.spacing[4], gap: theme.spacing[1], ...getPremiumCardStyle('small') }}>{<Text variant="label" color={theme.colors.text.secondary}>{item.label}</Text>}{isStatsLoading ? <Skeleton width="70%" height={28} borderRadius={10} /> : <Text variant="h4" color={theme.colors.text.primary}>{item.value}</Text>}</View>)}</View>
        <Button variant="outline" onPress={() => void refresh()}
  accessibilityLabel="Refresh stats button"
  accessibilityRole="button"
  accessibilityHint="Activates this control">Refresh stats</Button>
      </View>
      {masteryState ? <MasteryCard userId={userId} state={masteryState} onStateChange={setMasteryState} /> : null}
      <View style={{ gap: theme.spacing[3], minHeight: 320 }}>
        <Text variant="h4" color={theme.colors.text.primary}>Rankings</Text>
        {!disclosure.features.rankings.isUnlocked ? (
          <FeatureTeaserCard ctaLabel="Complete another session" description="Your next rank target starts showing up after you have enough data to care." feature="rankings" icon="🏆" onPress={() => navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} })} stage={disclosure.stage} title="Rankings" unlockLabel={disclosure.features.rankings.unlockReason} whyItMatters="Instead of a dead leaderboard, we hold rankings back until they can create real ambition." progressLabel="Next target: top 50% after 3 sessions" />
        ) : disclosure.stage === 'ACTIVATING' ? (
          <View style={{ borderWidth: 1, borderColor: theme.colors.border.light, backgroundColor: theme.colors.background.secondary, padding: theme.spacing[4], gap: theme.spacing[2], ...getPremiumCardStyle('medium') }}><Text variant="label" color={theme.colors.text.secondary}>Your next rank target</Text><Text variant="h4" color={theme.colors.text.primary}>Keep your streak alive for three more days.</Text><Text variant="bodySmall" color={theme.colors.text.secondary}>We use personal milestones first so this never feels like an empty room.</Text></View>
        ) : userId ? (
          <EmptyState icon="🏆" title="Rankings" body="Rankings feature coming soon." />
        ) : (
          <EmptyState icon="🏆" title="Sign in to see rankings" body="Your next rank target will appear here once your progress can be compared." />
        )}
      </View>
    </ScrollView>
  );
}

export default ProgressScreen;
