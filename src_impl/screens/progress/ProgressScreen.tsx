import React from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Button } from '../../components/primitives/Button';
import { Text } from '../../components/primitives/Text';
import { getPremiumCardStyle } from '../../components/premiumStyles';
import { Skeleton } from '../../components/ui/Skeleton';
import { useFeatureAccess } from '../../features/liveops-config';
import { FocusScoreDashboard } from '../../features/focus-identity/components/focus-score-dashboard';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import { ProgressionDashboard } from '../../features/progression/components';
import { PersonalBestsGrid } from '../profile/components/PersonalBestsGrid';
import { useSessionStats } from '../../session/hooks/useSession';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';

const formatHours = (totalMilliseconds: number): string =>
  `${(totalMilliseconds / 3600000).toFixed(totalMilliseconds >= 36000000 ? 0 : 1)}h`;

export function ProgressScreen(): JSX.Element {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const focusDashboardModel = useFocusScoreDashboardModel(userId || null, 30);
  const { stats, isLoading: isStatsLoading, refresh } = useSessionStats(userId);
  const canOpenStudy = disclosure.features.content_study.isUnlocked;

  const statCards = [
    { label: 'Focus Hours', value: stats ? formatHours(stats.totalFocusTime) : '--' },
    { label: 'Completed Sessions', value: stats ? String(stats.completedSessions) : '--' },
    { label: 'Longest Streak', value: stats ? `${stats.longestStreak} days` : '--' },
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background.primary }}
      contentContainerStyle={{
        paddingTop: insets.top + theme.spacing[5],
        paddingBottom: theme.spacing[10],
        paddingHorizontal: theme.spacing[5],
        gap: theme.spacing[4],
      }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text variant="label" color={theme.colors.primary[500]}>Progress</Text>
        <Text variant="h2" color={theme.colors.text.primary}>Your execution record.</Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Focus sessions, study work, and coaching signals in one place.
        </Text>
      </View>

      <FocusScoreDashboard
        model={focusDashboardModel}
        onRetry={() => { void focusDashboardModel.refetch(); }}
        onStartSession={openSession}
        onOpenMonthlyReport={() => navigation.navigate('Paywall', {
          source: 'focus-monthly-report',
          gatedFeature: 'monthly_focus_report',
        })}
      />

      {userId ? <ProgressionDashboard userId={userId} onStartSession={openSession} /> : null}

      <View style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[3],
        ...getPremiumCardStyle('medium'),
      }}>
        <Text variant="label" color={theme.colors.text.secondary}>Study OS</Text>
        <Text variant="h4" color={theme.colors.text.primary}>
          {canOpenStudy ? 'Turn material into focus sessions' : 'Study tools unlock through sessions'}
        </Text>
        <Text variant="body" color={theme.colors.text.secondary}>
          Plans, review, and quizzes stay tied to the same start and complete loop.
        </Text>
        <Button
          variant="outline"
          onPress={openStudy}
          accessibilityLabel={canOpenStudy ? 'Open study tools' : 'Start session to unlock study tools'}
          accessibilityRole="button"
          accessibilityHint="Moves you to the next study or focus action"
        >
          {canOpenStudy ? 'Open study tools' : 'Start session'}
        </Button>
      </View>

      <View style={{ gap: theme.spacing[3] }}>
        <Text variant="h4" color={theme.colors.text.primary}>Personal Stats</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing[3], flexWrap: 'wrap' }}>
          {statCards.map((item) => (
            <View
              key={item.label}
              style={{
                minWidth: '30%',
                flexGrow: 1,
                borderWidth: 1,
                borderColor: theme.colors.border.light,
                backgroundColor: theme.colors.background.secondary,
                padding: theme.spacing[4],
                gap: theme.spacing[1],
                ...getPremiumCardStyle('small'),
              }}
            >
              <Text variant="label" color={theme.colors.text.secondary}>{item.label}</Text>
              {isStatsLoading ? (
                <Skeleton width="70%" height={28} borderRadius={10} />
              ) : (
                <Text variant="h4" color={theme.colors.text.primary}>{item.value}</Text>
              )}
            </View>
          ))}
        </View>
        <Button
          variant="outline"
          onPress={() => void refresh()}
          accessibilityLabel="Refresh progress stats"
          accessibilityRole="button"
          accessibilityHint="Reloads your latest execution stats"
        >
          Refresh stats
        </Button>
      </View>

      <PersonalBestsGrid userId={userId || null} />
    </ScrollView>
  );
}

export default withScreenErrorBoundary(ProgressScreen, 'Progress');
