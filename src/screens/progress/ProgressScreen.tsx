import React from 'react';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { GlassScreen } from '../../components/glass/GlassScreen';
import { useFocusScoreDashboardModel } from '../../features/focus-identity/hooks-focus-score';
import { useAuthStore } from '../../store';
import { useOnboardingStore } from '../../features/onboarding/store';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import { useFeatureAccess } from '../../features/liveops-config';
import { resolveMonthlyReportAction } from './progress-actions';
import { ProgressHeader } from './components/ProgressHeader';
import { BaselineSignalCard } from './components/BaselineSignalCard';
import { ProgressStatCards } from './components/ProgressStatCards';


export function ProgressScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const disclosure = useFeatureAccess();
  const motivationProfile = useOnboardingStore(
    (state) => state.motivationProfile,
  );
  const userId = useAuthStore((state) => state.user?.id ?? '');
  const focusDashboardModel = useFocusScoreDashboardModel(userId || null, 30);
  const canOpenStudy = disclosure.features.content_study.isUnlocked;
  const completedSessions = disclosure.inputs.totalCompletedSessions;
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

  const openFocusScore = (): void => {
    navigation.navigate('FocusScoreDashboard');
  };

  const openAchievements = (): void => {
    navigation.navigate('Achievements');
  };

  const openMonthlyReport = (): void => {
    if (monthlyReportAction === 'paywall') {
      navigation.navigate('Paywall', {
        gatedFeature: 'monthly_focus_report',
        source: 'focus-monthly-report',
      });
      return;
    }
    openSession();
  };

  const score = focusDashboardModel.current?.currentScore ?? 82;

  return (
    <GlassScreen showAura variant="progress">
      <ScrollView
        contentContainerStyle={{
          gap: 12,
          paddingBottom: insets.bottom + 200,
          paddingHorizontal: 12,
          paddingTop: 8,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ProgressHeader
          onOpenNotifications={() => navigation.navigate('Notifications')}
        />

        {completedSessions === 0 ? <BaselineSignalCard /> : null}

        <ProgressStatCards
          canOpenStudy={canOpenStudy}
          completedSessions={completedSessions}
          motivationProfile={motivationProfile}
          onOpenAchievements={openAchievements}
          onOpenFocusScore={openFocusScore}
          onOpenMonthlyReport={openMonthlyReport}
          onOpenSession={openSession}
          onOpenStudy={openStudy}
          score={score}
        />
      </ScrollView>
    </GlassScreen>
  );
}

export default withScreenErrorBoundary(ProgressScreen, 'Progress');
