import { useCallback } from 'react';
import type { NavigationProp } from '@react-navigation/native';
import type { SessionStackParams } from '../../../navigation/types';
import { navigateToSessionStackScreen, navigateToMainTab, navigateToMainStackScreen } from '../../../navigation/navigation-helpers';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { LearningSessionTarget } from '../../../features/learning-execution';

interface NavigationCallbacks {
  openSetup: (params?: Record<string, unknown>) => void;
  openProgress: () => void;
  openSocial: () => void;
  openContentStudy: () => void;
  continueStudyPlan: () => void;
  openNextAction: () => void;
}

export function useNavigationCallbacks(params: {
  navigation: NavigationProp<Record<string, unknown>>;
  userId: string;
  disclosure: FeatureAccessResult;
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: import('../../../features/liveops-config').UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  canNavigateSocial: boolean;
  canNavigateContentStudy: boolean;
  learningExecutionTarget: LearningSessionTarget | null;
  buildLearningSessionParams: (target: LearningSessionTarget) => Record<string, unknown>;
}): NavigationCallbacks {
  const {
    navigation, userId, disclosure, analytics,
    canNavigateSocial, canNavigateContentStudy,
    learningExecutionTarget, buildLearningSessionParams,
  } = params;

  const openSetup = useCallback(
    (setupParams?: Record<string, unknown>): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(
          userId,
          (setupParams as SessionStackParams['SessionSetup'] | undefined)?.source ?? 'home',
        );
      }
      navigateToSessionStackScreen(navigation as never, 'SessionSetup', (setupParams ?? {}) as SessionStackParams['SessionSetup']);
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback(
    () => navigateToMainTab(navigation as never, 'Progress'),
    [navigation],
  );

  const openSocial = useCallback(() => {
    navigateToMainTab(
      navigation as never,
      'Profile',
      canNavigateSocial
        ? { tab: 'social' }
        : { tab: 'stats' },
    );
  }, [canNavigateSocial, navigation]);

  const openContentStudy = useCallback(() => {
    if (!canNavigateContentStudy) { openSetup(); return; }
    navigateToMainStackScreen(navigation as never, 'ContentStudy');
  }, [canNavigateContentStudy, navigation, openSetup]);

  const continueStudyPlan = useCallback(() => {
    if (!learningExecutionTarget) { openContentStudy(); return; }
    openSetup(buildLearningSessionParams(learningExecutionTarget));
  }, [learningExecutionTarget, openContentStudy, openSetup, buildLearningSessionParams]);

  const openNextAction = useCallback(() => {
    analytics.trackNextBestActionPressed(
      disclosure.stage, disclosure.inputs.totalCompletedSessions,
    );
    openSetup();
  }, [analytics, disclosure.inputs.totalCompletedSessions, disclosure.stage, openSetup]);

  return { openSetup, openProgress, openSocial, openContentStudy, continueStudyPlan, openNextAction };
}
