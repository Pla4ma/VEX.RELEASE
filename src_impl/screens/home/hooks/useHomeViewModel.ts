import { useHomeScreenController } from './useHomeScreenController';
import type { HomeViewModel } from './home-view-model';

/**
 * Single entry point for the home screen's view model.
 *
 * Components consume this hook — never useHomeScreenController directly.
 * Internally, this can dispatch to stage-specific models
 * (useNewUserHomeModel, useActivatingHomeModel, useEngagedHomeModel,
 * usePowerUserHomeModel) as those are implemented.
 *
 * Future: Each stage model will only import and query features relevant
 * to that stage, reducing bundle and mental complexity.
 */
export function useHomeViewModel(): HomeViewModel & {
  controller: ReturnType<typeof useHomeScreenController>;
} {
  const controller = useHomeScreenController();

  return {
    userId: controller.userId,
    isOnline: controller.isOnline,
    isLoading: controller.isLoading,
    isFirstRun: controller.isFirstRun,
    loadError: controller.loadError,
    currentStreak: controller.currentStreak,
    currentXp: controller.currentXp,
    todayFocusMinutes: controller.todayFocusMinutes,
    progressPercent: controller.progressPercent,
    primaryRecommendation: controller.primaryRecommendation,
    homeSpine: controller.homeSpine,
    returnReason: controller.returnReason,
    stage: controller.disclosure.stage,
    productTier: controller.disclosure.productTier,
    features: controller.disclosure.features,
    runtime: controller.runtime,
    controller,
  };
}
