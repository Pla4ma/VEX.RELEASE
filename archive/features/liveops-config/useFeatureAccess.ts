import { useMemo } from 'react';

import { useOnboardingStore } from '../../onboarding';
import { useSessionHistory } from '../../session/hooks/useSession';
import { useAuthStore } from '../../store';
import { usePremiumStatus } from '../../shared/monetization';
import { useProgressionSummary } from '../progression/hooks';
import { useStreakSummary } from '../streaks/hooks';
import { useUserSquads } from '../squads/hooks';
import { useInventoryStats } from '../inventory/hooks';
import { useActiveBoss } from '../boss/hooks';
import { useActiveStudyPlan } from '../content-study/hooks';
import { useFeatureFlags } from './hooks';
import { buildFeatureAccessMap } from './feature-access';

function getAccountAgeDays(createdAt: string | undefined): number {
  if (!createdAt) {return 0;}
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) {return 0;}
  return Math.max(0, Math.floor((Date.now() - created) / 86400000));
}

export function useFeatureAccess() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id ?? '';
  const onboardingProfile = useOnboardingStore((state) =>
    userId ? state.getProfile(userId) : undefined,
  );
  const { isPremium } = usePremiumStatus();
  const historyQuery = useSessionHistory(userId, 25);
  const progressionQuery = useProgressionSummary(userId);
  const streakQuery = useStreakSummary(userId);
  const squadsQuery = useUserSquads(userId || undefined);
  const flagsQuery = useFeatureFlags();

  // New gating data sources
  const inventoryQuery = useInventoryStats(userId || '');
  const bossQuery = useActiveBoss(userId || null);
  const studyPlanQuery = useActiveStudyPlan();

  const result = useMemo(
    () =>
      buildFeatureAccessMap({
        accountAgeDays: getAccountAgeDays(user?.createdAt),
        totalCompletedSessions: historyQuery.history.length,
        currentStreak: streakQuery.data?.currentDays ?? 0,
        currentLevel: progressionQuery.data?.level ?? 1,
        hasJoinedSquad: (squadsQuery.data?.length ?? 0) > 0,
        hasCompletedOnboarding: Boolean(onboardingProfile?.completedAt),
        hasCompletedSuccessfulSession: historyQuery.history.length > 0,
        isPremium,
        // New gating fields
        hasFirstItem: (inventoryQuery.data?.totalItems ?? 0) > 0,
        inventoryItemCount: inventoryQuery.data?.totalItems ?? 0,
        hasFirstValueMoment: historyQuery.history.length > 0,
        notificationPermissionStatus: 'not_requested', // Will be updated via settings/store
        activeBossEncounter: Boolean(bossQuery.data),
        hasActiveStudyPlan: Boolean(studyPlanQuery.data),
        squadCount: squadsQuery.data?.length ?? 0,
        liveOpsFlags: flagsQuery.features ?? undefined,
      }),
    [
      bossQuery.data,
      flagsQuery.features,
      historyQuery.history.length,
      inventoryQuery.data?.totalItems,
      isPremium,
      onboardingProfile?.completedAt,
      progressionQuery.data?.level,
      squadsQuery.data?.length,
      streakQuery.data?.currentDays,
      studyPlanQuery.data,
      user?.createdAt,
    ],
  );

  return {
    ...result,
    inputs: {
      accountAgeDays: getAccountAgeDays(user?.createdAt),
      totalCompletedSessions: historyQuery.history.length,
      currentStreak: streakQuery.data?.currentDays ?? 0,
      currentLevel: progressionQuery.data?.level ?? 1,
      hasJoinedSquad: (squadsQuery.data?.length ?? 0) > 0,
      hasCompletedOnboarding: Boolean(onboardingProfile?.completedAt),
      hasCompletedSuccessfulSession: historyQuery.history.length > 0,
      isPremium,
      hasFirstItem: (inventoryQuery.data?.totalItems ?? 0) > 0,
      inventoryItemCount: inventoryQuery.data?.totalItems ?? 0,
      hasActiveStudyPlan: Boolean(studyPlanQuery.data),
      activeBossEncounter: Boolean(bossQuery.data),
      squadCount: squadsQuery.data?.length ?? 0,
    },
    isLoading:
      historyQuery.isLoading ||
      progressionQuery.isLoading ||
      streakQuery.isLoading ||
      squadsQuery.isLoading ||
      flagsQuery.isLoading ||
      inventoryQuery.isLoading ||
      bossQuery.isLoading ||
      studyPlanQuery.isLoading,
    error:
      historyQuery.error ??
      progressionQuery.error ??
      streakQuery.error ??
      squadsQuery.error ??
      flagsQuery.error ??
      inventoryQuery.error ??
      bossQuery.error ??
      studyPlanQuery.error ??
      null,
    refetchAll: () =>
      Promise.all([
        historyQuery.refresh(),
        progressionQuery.refetch(),
        streakQuery.refetch(),
        squadsQuery.refetch(),
        inventoryQuery.refetch(),
        bossQuery.refetch(),
        studyPlanQuery.refetch(),
      ]),
  };
}
