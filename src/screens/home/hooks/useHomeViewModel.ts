/**
 * useHomeViewModel — Stage Resolver
 *
 * Determines the user stage and returns the correct stage-specific model.
 * Only the hooks required for the current stage are executed.
 * NEW_USER stage does NOT import or execute boss/squads/study/advanced coach hooks.
 */
import { useMemo } from "react";
import { useNetInfo } from "../../../network";
import {
  useFeatureAccess,
  useDisclosureAnalytics,
} from "../../../features/liveops-config";
import { useStreakSummary } from "../../../features/streaks/hooks";
import { useProgressionSummary } from "../../../features/progression/hooks";
import { useSessionHistory } from "../../../session/hooks/useSession";
import { useAuthStore } from "../../../store";
import { buildHomeFeatureRuntime } from "./home-feature-runtime";
import { useHomeAnalyticsEffects } from "./useHomeAnalyticsEffects";
import type { HomeViewModel } from "./home-view-model";
import type { HomeController } from "./home-controller-types";

export type { HomeController } from "./home-controller-types";
export type { HomeViewModel } from "./home-view-model";

export interface HomeModelResult {
  isLoading: boolean;
  stage: import("../../../features/liveops-config").UserExperienceStage;
  sharedInput: {
    analytics: ReturnType<typeof useDisclosureAnalytics>;
    disclosure: ReturnType<typeof useFeatureAccess>;
    historyQuery: ReturnType<typeof useSessionHistory>;
    isOnline: boolean;
    progressionQuery: ReturnType<typeof useProgressionSummary>;
    runtime: ReturnType<typeof buildHomeFeatureRuntime>;
    streakQuery: ReturnType<typeof useStreakSummary>;
    userId: string;
  };
}

/**
 * Stage resolver hook.
 * Only returns the shared input + stage. The actual stage model hook
 * is called by the stage-specific container, NOT here.
 */
export function useHomeViewModel(): HomeModelResult {
  const { isOnline } = useNetInfo();
  const { user } = useAuthStore();
  const userId = user?.id ?? "";
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

  return {
    isLoading:
      disclosure.isLoading ||
      streakQuery.isLoading ||
      progressionQuery.isLoading,
    stage: disclosure.stage,
    sharedInput: {
      analytics,
      disclosure,
      historyQuery,
      isOnline,
      progressionQuery,
      runtime,
      streakQuery,
      userId,
    },
  };
}
