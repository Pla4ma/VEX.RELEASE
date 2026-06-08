import React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GlassScreen } from '../../components/glass/GlassScreen';
import { FocusScoreDashboard } from '../../features/focus-identity/components/focus-score-dashboard';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import { ProgressionDashboard } from '../../features/progression/components';
import { useAuthStore } from '../../store';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useFeatureAccess } from '../../features/liveops-config';
import { resolveMonthlyReportAction } from './progress-actions';
import { StudyOSCard } from './StudyOSCard';
import { ProgressHeader } from './components/ProgressHeader';

export function ProgressScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const focusDashboardModel = useFocusScoreDashboardModel(userId || null, 30);
  const canOpenStudy = disclosure.features.content_study.isUnlocked;
  const monthlyReportAction = resolveMonthlyReportAction(
    disclosure.features.premium_paywall,
  );

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
    <GlassScreen showAura>
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: insets.bottom + 180,
          paddingHorizontal: 16,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProgressHeader
          onOpenNotifications={() => navigation.navigate('Notifications')}
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
      </ScrollView>
    </GlassScreen>
  );
}

export default withScreenErrorBoundary(ProgressScreen, 'Progress');

