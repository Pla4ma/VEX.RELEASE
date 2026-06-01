import { useCallback } from 'react';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import { buildLearningSessionParams } from '../../../features/learning-execution';
import type { LearningSessionTarget } from '../../../features/learning-execution';
import type { SessionStackParams } from '../../../navigation/types';
import type { Nav } from './engaged-home-types';

interface EngagedNavigationParams {
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: import('../../../features/liveops-config').UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  disclosure: FeatureAccessResult;
  navigation: Nav;
  userId: string;
  canNavigateSocial: boolean;
  canNavigateContentStudy: boolean;
  learningTarget: LearningSessionTarget | null;
}

export function useEngagedNavigation(params: EngagedNavigationParams) {
  const {
    analytics,
    disclosure,
    navigation,
    userId,
    canNavigateSocial,
    canNavigateContentStudy,
    learningTarget,
  } = params;

  const openSetup = useCallback(
    (params?: Record<string, unknown>): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(
          userId,
          (params as SessionStackParams['SessionSetup'] | undefined)?.source ??
            'home',
        );
      }
      navigation.navigate('SessionStack', {
        screen: 'SessionSetup',
        params: (params ?? {}) as SessionStackParams['SessionSetup'],
      });
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback(
    () => navigation.navigate('Main', { screen: 'Progress' }),
    [navigation],
  );

  const openSocial = useCallback(() => {
    navigation.navigate(
      'Main',
      canNavigateSocial
        ? { screen: 'Profile', params: { tab: 'social' } }
        : { screen: 'Profile', params: { tab: 'stats' } },
    );
  }, [canNavigateSocial, navigation]);

  const openContentStudy = useCallback(() => {
    if (!canNavigateContentStudy) {
      openSetup();
      return;
    }
    navigation.navigate('ContentStudy');
  }, [canNavigateContentStudy, navigation, openSetup]);

  const continueStudyPlan = useCallback(() => {
    if (!learningTarget) {
      openContentStudy();
      return;
    }
    openSetup(buildLearningSessionParams(learningTarget));
  }, [learningTarget, openContentStudy, openSetup]);

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
