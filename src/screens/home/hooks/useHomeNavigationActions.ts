import { useCallback } from 'react';

import type { UserExperienceStage } from '../../../features/liveops-config';
import { buildLearningSessionParams } from '../../../features/learning-execution/service';
import type { LearningSessionTarget } from '../../../features/learning-execution';
import type {
  ExtendedRootStackParams,
  SessionStackParams,
} from '../../../navigation/types';
import { navigateToSessionStackScreen, navigateToMainTab, navigateToMainStackScreen } from '../../../navigation/navigation-helpers';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type HomeNavigation = NativeStackNavigationProp<ExtendedRootStackParams>;

export function useHomeNavigationActions(input: {
  activeStudyPlan: {
    contentId: string;
    generationId: string;
  } | null;
  learningTarget: LearningSessionTarget | null;
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  completedSessions: number;
  canNavigateContentStudy: boolean;
  canNavigateSocial: boolean;
  navigation: HomeNavigation;
  stage: UserExperienceStage;
  userId: string;
}) {
  const {
    activeStudyPlan,
    analytics,
    canNavigateContentStudy,
    canNavigateSocial,
    completedSessions,
    learningTarget,
    navigation,
    stage,
    userId,
  } = input;

  const openSetup = useCallback(
    (params?: SessionStackParams['SessionSetup']) => {
      if (userId && completedSessions === 0) {
        analytics.trackFirstSessionStarted(userId, params?.source ?? 'home');
      }

      navigateToSessionStackScreen(navigation, 'SessionSetup', params ?? {});
    },
    [analytics, completedSessions, navigation, userId],
  );

  const openProgress = useCallback(
    () => navigateToMainTab(navigation, 'Progress'),
    [navigation],
  );
  const openSocial = useCallback(
    () =>
      navigateToMainTab(
        navigation,
        'Profile',
        canNavigateSocial
          ? { tab: 'social' }
          : { tab: 'stats' },
      ),
    [canNavigateSocial, navigation],
  );
  const openContentStudy = useCallback(() => {
    if (!canNavigateContentStudy) {
      openSetup();
      return;
    }
    navigateToMainStackScreen(navigation, 'ContentStudy');
  }, [canNavigateContentStudy, navigation, openSetup]);
  const continueStudyPlan = useCallback(() => {
    if (learningTarget) {
      openSetup(buildLearningSessionParams(learningTarget));
      return;
    }
    if (!activeStudyPlan || !canNavigateContentStudy) {
      openContentStudy();
      return;
    }

    navigateToMainStackScreen(navigation, 'ContentStudy', {
      screen: 'StudyPlan',
      params: {
        generationId: activeStudyPlan.generationId,
        contentId: activeStudyPlan.contentId,
      },
    });
  }, [
    activeStudyPlan,
    canNavigateContentStudy,
    learningTarget,
    navigation,
    openContentStudy,
    openSetup,
  ]);
  const openNextAction = useCallback(() => {
    analytics.trackNextBestActionPressed(stage, completedSessions);
    openSetup();
  }, [analytics, completedSessions, openSetup, stage]);

  return {
    continueStudyPlan,
    openContentStudy,
    openNextAction,
    openProgress,
    openSetup,
    openSocial,
  };
}
