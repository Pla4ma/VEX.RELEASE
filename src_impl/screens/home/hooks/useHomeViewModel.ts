import { useMemo } from 'react';
import { useNetInfo } from '../../../network';
import { useFeatureAccess, useDisclosureAnalytics } from '../../../features/liveops-config';
import { useStreakSummary } from '../../../features/streaks/hooks';
import { useProgressionSummary } from '../../../features/progression/hooks';
import { useSessionHistory } from '../../../session/hooks/useSession';
import { useAuthStore } from '../../../store';
import { buildHomeFeatureRuntime } from './home-feature-runtime';
import { useNewUserHomeModel } from './useNewUserHomeModel';
import { useActivatingHomeModel } from './useActivatingHomeModel';
import { useEngagedHomeModel } from './useEngagedHomeModel';
import { usePowerUserHomeModel } from './usePowerUserHomeModel';
import { useHomeAnalyticsEffects } from './useHomeAnalyticsEffects';
import type { HomeViewModel } from './home-view-model';
import type { HomeController } from './home-controller-types';

export function useHomeViewModel(): HomeViewModel & {
  controller: HomeController;
} {
  const { isOnline } = useNetInfo();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const disclosure = useFeatureAccess();
  const runtime = useMemo(
    () => buildHomeFeatureRuntime(disclosure.features, disclosure.productTier),
    [disclosure.features, disclosure.productTier],
  );
  const analytics = useDisclosureAnalytics();

  const streakQuery = useStreakSummary(userId);
  const progressionQuery = useProgressionSummary(userId);
  const historyQuery = useSessionHistory(userId, 5);

  useHomeAnalyticsEffects({
    analytics,
    features: disclosure.features as Record<string, { isUnlocked: boolean }>,
    stage: disclosure.stage,
    totalCompletedSessions: disclosure.inputs.totalCompletedSessions,
    userId,
  });

  const sharedInput = {
    analytics,
    disclosure,
    historyQuery,
    isOnline,
    progressionQuery,
    runtime,
    streakQuery,
    userId,
  };

  const newUserModel = useNewUserHomeModel(sharedInput);
  const activatingModel = useActivatingHomeModel(sharedInput);
  const engagedModel = useEngagedHomeModel(sharedInput);
  const powerUserModel = usePowerUserHomeModel(sharedInput);

  switch (disclosure.stage) {
    case 'NEW_USER':
      return newUserModel;
    case 'ACTIVATING':
      return activatingModel;
    case 'ENGAGED':
      return engagedModel;
    case 'POWER_USER':
      return powerUserModel;
    default:
      return newUserModel;
  }
}
