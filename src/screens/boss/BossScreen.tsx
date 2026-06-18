/**
 * BossScreen — Progressive unlock & product intensity.
 *
 * Queries only run when FeatureAvailability allows.
 * Intensity comes from the canonical VexExperience — no duplicate resolution.
 * Squad content removed for final release.
 * Boss damage maps directly to focus/study sessions — no economy/shop dependency.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { withScreenErrorBoundary } from '../../shared/ui/components/ScreenErrorBoundary';
import {
  useFeatureAccess,
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
} from '../../features/liveops-config';
import { getDegradedFeatures } from '../../features/liveops-config/feature-access-store';
import { useResolvedVexExperienceRuntime } from '../../features/personalization/hooks';
import { useStreakSummary } from '../../features/streaks/hooks';
import { trackBossRouteOpened } from '../../features/boss/analytics';
import {
  useBossEngagementSignals,
  type BossEngagementInputs,
} from '../../features/boss/boss-engagement-signals';
import type { ExtendedRootStackParams } from '../../navigation/types';
import { navigateToRootScreen } from '../../navigation/navigation-helpers';
import { BossScreenContent } from './BossScreenContent';
import { useAuthStore } from '../../store';
import { useTheme } from '../../theme/ThemeContext';
import {
  BossFallback,
  toScreenIntensity,
  nextResetLabel,
} from './boss-screen-helpers';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export const BossScreen = (): React.ReactNode => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const disclosure = useFeatureAccess();
  const userId = useAuthStore((state) => state.user?.id ?? null);

  const streakQuery = useStreakSummary(userId);
  const completionStreak =
    (streakQuery.data as { currentStreak?: number } | undefined)
      ?.currentStreak ?? 0;
  const degradedFeatures = getDegradedFeatures();
  const bossIgnored = degradedFeatures.has('boss_tab');

  const bossEngagementInputs: BossEngagementInputs = {
    bossIgnored,
    bossUnlocked: disclosure.features.boss_tab.isUnlocked,
    canQueryBoss: false,
    bossRouteOpenedCount: 0,
    bossCTAClickedCount: 0,
    bossDamageEventsCount: 0,
    recentSessionsWithBossProgress: 0,
  };

  const _bossEngagement = useBossEngagementSignals(bossEngagementInputs);

  const resolved = useResolvedVexExperienceRuntime({
    behaviorStats: {
      abandonedSessionDurations: [],
      bossChallengeEngagement: 'low',
      coachInteractions: 0,
      comebackSessions: 0,
      completedSessionDurations: [],
      completionStreak,
      ignoredFeatures: bossIgnored ? ['boss_tab'] : [],
      mostSuccessfulTimeOfDay: null,
      preferredSessionMode: null,
      premiumFeatureAttempts: [],
      studyUsageRatio: 0,
      totalCompletedSessions: disclosure.inputs.totalCompletedSessions,
    },
    featureAvailability: {
      boss: disclosure.features.boss_tab.isUnlocked,
      challenges: disclosure.features.challenges.isUnlocked,
      premium: disclosure.features.premium_paywall.isUnlocked,
      study: disclosure.features.content_study.isUnlocked,
    },
  });

  const bossIntensity = resolved.bossIntensity;

  const bossAvailability = getFeatureAvailability(disclosure.features.boss_tab);
  const canQueryBoss =
    bossAvailability.canQuery && bossAvailability.canUseBackend;
  const canNavigateBoss = isFeatureAvailableForNavigation(bossAvailability);

  const [resetLabel, setResetLabel] = useState(nextResetLabel());

  useEffect(() => {
    const id = setInterval(() => setResetLabel(nextResetLabel()), 60000);
    return () => clearInterval(id);
  }, []);

  const trackedOpenRef = useRef(false);

  useEffect(() => {
    if (!userId) {return;}
    if (trackedOpenRef.current) {return;}
    trackedOpenRef.current = true;
    trackBossRouteOpened(userId, bossIntensity, canQueryBoss);
  }, [userId, bossIntensity, canQueryBoss]);

  if (
    !canNavigateBoss ||
    disclosure.features.boss_tab.releaseState === 'final_release_deactivated'
  ) {
    return (
      <BossFallback
        intensity={toScreenIntensity(bossIntensity)}
        onStartSession={() =>
          navigateToRootScreen(navigation, 'SessionStack', {
            screen: 'SessionSetup',
            params: {},
          })
        }
        unlockReason={disclosure.features.boss_tab.unlockReason}
        stage={disclosure.stage}
        resetLabel={resetLabel}
      />
    );
  }

  return (
    <BossScreenContent
      canQueryBoss={canQueryBoss}
      bossIntensity={toScreenIntensity(bossIntensity)}
      userId={userId}
      navigation={navigation}
      resetLabel={resetLabel}
      theme={theme}
    />
  );
};

export default withScreenErrorBoundary(BossScreen, 'Boss');
