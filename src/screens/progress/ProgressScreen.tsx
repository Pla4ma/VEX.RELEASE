import React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GlassScreen } from '../../components/glass/GlassScreen';
import { FocusScoreDashboard } from '../../features/focus-identity/components/focus-score-dashboard';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import { ProgressionDashboard } from '../../features/progression/components';
import { PersonalBestsGrid } from '../profile/components/PersonalBestsGrid';
import { useSessionStats } from '../../session/hooks/useSession';
import { useAuthStore } from '../../store';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useFeatureAccess } from '../../features/liveops-config';
import { resolveMonthlyReportAction } from './progress-actions';
import { StudyOSCard } from './StudyOSCard';
import { ProgressHeader } from './components/ProgressHeader';
import { PersonalStatsGrid } from './components/PersonalStatsGrid';

const formatHours = (totalMilliseconds: number): string =>
  `${(totalMilliseconds / 3600000).toFixed(totalMilliseconds >= 36000000 ? 0 : 1)}h`;

export function ProgressScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const focusDashboardModel = useFocusScoreDashboardModel(userId || null, 30);
  const { stats, isLoading: isStatsLoading, refresh } = useSessionStats(userId);
  const canOpenStudy = disclosure.features.content_study.isUnlocked;
  const monthlyReportAction = resolveMonthlyReportAction(
    disclosure.features.premium_paywall,
  );

  const statCards = [
    {
      label: 'Focus Hours',
      value: stats ? formatHours(stats.totalFocusTime) : '--',
    },
    {
      label: 'Completed Sessions',
      value: stats ? String(stats.completedSessions) : '--',
    },
    {
      label: 'Longest Streak',
      value: stats ? `${stats.longestStreak} days` : '--',
    },
  ];

  const openSession = (): void => {
    navigation.navigate('SessionStack', { screen: 'SessionSetup', params: {} });
  };

  const openStudy = (): void => {
    if (canOpenStudy) {
      navigation.navigate('ContentStudy');
      return;
    }
    openSession();
  };

  const retryFocusDashboard = (): void => {
    focusDashboardModel.refetch?.();
  };

  return (
    <GlassScreen showAura={false}>
      <ScrollView
        contentContainerStyle={{
          gap: 16,
          paddingBottom: insets.bottom + 160,
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProgressHeader
          onOpenSettings={() =>
            navigation.navigate('Settings', { screen: 'SettingsMain' })
          }
        />
        <FocusScoreDashboard
          model={focusDashboardModel}
          onOpenMonthlyReport={() => {
            if (monthlyReportAction === 'paywall') {
              navigation.navigate('Paywall', {
                gatedFeature: 'monthly_focus_report',
                source: 'focus-monthly-report',
              });
              return;
            }
            openSession();
          }}
          onRetry={retryFocusDashboard}
          onStartSession={openSession}
        />
        {userId ? (
          <ProgressionDashboard onStartSession={openSession} userId={userId} />
        ) : null}
        <StudyOSCard canOpenStudy={canOpenStudy} onOpenStudy={openStudy} />
        <PersonalStatsGrid
          isLoading={isStatsLoading}
          onRefresh={() => refresh()}
          stats={statCards}
        />
        <PersonalBestsGrid userId={userId || null} />
      </ScrollView>
    </GlassScreen>
  );
}

export default withScreenErrorBoundary(ProgressScreen, 'Progress');
