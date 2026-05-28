import { useCallback } from "react";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getFeatureAvailability,
  isFeatureAvailableForNavigation,
  type FeatureAccessResult,
} from "../../../features/liveops-config";
import type { ExtendedRootStackParams } from "../../../navigation/types";
import {
  navigateToSessionStackScreen,
  navigateToMainTab,
} from "../../../navigation/navigation-helpers";
import type { LearningExecutionLayer } from "../../../features/learning-execution";
import { buildLearningSessionParams } from "../../../features/learning-execution";

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

export function usePowerUserNavigation(params: {
  navigation: Nav;
  userId: string;
  disclosure: FeatureAccessResult;
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: import("../../../features/liveops-config").UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  learningExecutionTarget: LearningExecutionLayer["target"];
}) {
  const {
    navigation,
    userId,
    disclosure,
    analytics,
    learningExecutionTarget,
  } = params;

  const canNavigateContentStudy = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.content_study),
  );
  const canNavigateSocial = isFeatureAvailableForNavigation(
    getFeatureAvailability(disclosure.features.social_tab),
  );

  const openSetup = useCallback(
    (setupParams: Record<string, unknown> = {}): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(userId, "home");
      }
      navigateToSessionStackScreen(navigation, "SessionSetup", setupParams);
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback(
    () => navigateToMainTab(navigation, "Progress"),
    [navigation],
  );

  const openSocial = useCallback(() => {
    navigateToMainTab(navigation, "Profile");
  }, [navigation]);

  const openContentStudy = useCallback(() => {
    if (!canNavigateContentStudy) {
      openSetup();
      return;
    }
    navigation.navigate("ContentStudy");
  }, [canNavigateContentStudy, navigation, openSetup]);

  const continueStudyPlan = useCallback(() => {
    if (!learningExecutionTarget) {
      openContentStudy();
      return;
    }
    openSetup(buildLearningSessionParams(learningExecutionTarget));
  }, [learningExecutionTarget, openContentStudy, openSetup]);

  const openNextAction = useCallback(() => {
    analytics.trackNextBestActionPressed(
      disclosure.stage,
      disclosure.inputs.totalCompletedSessions,
    );
    openSetup();
  }, [
    analytics,
    disclosure.inputs.totalCompletedSessions,
    disclosure.stage,
    openSetup,
  ]);

  return {
    openSetup,
    openProgress,
    openSocial,
    openContentStudy,
    continueStudyPlan,
    openNextAction,
  };
}
