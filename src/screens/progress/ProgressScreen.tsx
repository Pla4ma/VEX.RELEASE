import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
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
import { PlanWorkspace } from '../plan/components/PlanWorkspace';
import { Text } from '../../components/primitives/Text';
import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { navigateToRootScreen, navigateToMainStackScreen } from '../../navigation/navigation-helpers';

type ProgressMode = 'overview' | 'plan';

function ProgressScreen(): React.ReactNode {
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
  const [mode, setMode] = useState<ProgressMode>('overview');

  const selectOverview = useCallback((): void => setMode('overview'), []);
  const selectPlan = useCallback((): void => setMode('plan'), []);

  const openSession = (): void => {
    navigateToRootScreen(navigation, 'SessionStack', { screen: 'SessionSetup', params: {} });
  };

  const openStudy = (): void => {
    if (canOpenStudy) {
      navigateToMainStackScreen(navigation, 'ContentStudy');
      return;
    }
    openSession();
  };

  const openFocusScore = (): void => {
    navigateToRootScreen(navigation, 'FocusScoreDashboard');
  };

  const openAchievements = (): void => {
    navigateToMainStackScreen(navigation, 'Achievements');
  };

  const openMonthlyReport = (): void => {
    if (monthlyReportAction === 'paywall') {
      navigateToRootScreen(navigation, 'Paywall', {
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
          onOpenNotifications={() => navigateToMainStackScreen(navigation, 'Notifications')}
        />

        <View
          style={{
            backgroundColor: vexLightGlass.glass.fill,
            borderColor: vexLightGlass.glass.border,
            borderRadius: 24,
            borderWidth: 1,
            flexDirection: 'row',
            padding: 5,
          }}
        >
          <Pressable
            accessibilityHint="Show focus score and progression"
            accessibilityLabel="Progress overview tab"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'overview' }}
            onPress={selectOverview}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: mode === 'overview' ? vexLightGlass.mint[100] : vexLightGlass.background.transparent,
              borderRadius: 19,
              flex: 1,
              minHeight: 44,
              justifyContent: 'center',
              opacity: pressed ? 0.86 : 1,
            })}
          >
            <Text
              style={{
                color: mode === 'overview' ? vexLightGlass.mint[800] : vexLightGlass.text.tertiary,
                fontSize: 13,
                fontWeight: '800',
              }}
            >
              Overview
            </Text>
          </Pressable>
          <Pressable
            accessibilityHint="Show today's plan, week, projects, and study"
            accessibilityLabel="Plan tab"
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'plan' }}
            onPress={selectPlan}
            style={({ pressed }) => ({
              alignItems: 'center',
              backgroundColor: mode === 'plan' ? vexLightGlass.mint[100] : vexLightGlass.background.transparent,
              borderRadius: 19,
              flex: 1,
              minHeight: 44,
              justifyContent: 'center',
              opacity: pressed ? 0.86 : 1,
            })}
          >
            <Text
              style={{
                color: mode === 'plan' ? vexLightGlass.mint[800] : vexLightGlass.text.tertiary,
                fontSize: 13,
                fontWeight: '800',
              }}
            >
              Plan
            </Text>
          </Pressable>
        </View>

        {mode === 'overview' ? (
          <>
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
          </>
        ) : (
          <PlanWorkspace />
        )}
      </ScrollView>
    </GlassScreen>
  );
}

const ProgressScreenWithBoundary = withScreenErrorBoundary(ProgressScreen, 'Progress');
export { ProgressScreenWithBoundary as ProgressScreen };
