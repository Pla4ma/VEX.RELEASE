import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { Nav } from './ActivatingHomeContainer.types';
import { navigateToSessionStackScreen, navigateToMainTab, navigateToMainStackScreen } from '@/navigation/navigation-helpers';
import type { SessionStackParams } from '@/navigation/types';
import { getNextBestAction } from '@/features/progression';
import { getNextUnlockFeature } from '@/screens/home/hooks/home-controller-helpers';
import { buildHomeReturnReasonState } from '@/features/home-spine/service';
import type { HomeReturnReason } from '@/screens/home/hooks/useHomeReturnReason';
import { createStubQuery, stubNavigationActions, stubLearningExecutionLayer, stubCoachMutations } from '@/screens/home/hooks/home-controller-stubs';
import type { HomeController } from '@/screens/home/hooks/home-controller-types';
import { computeActivatingState } from './ActivatingHomeContainer.state';
import type { ActivatingContainerInput } from './ActivatingHomeContainer.types';
import { useSessionUIStore } from '@/store/session-state';

export function useActivatingContainerActions(
  input: ActivatingContainerInput,
  disclosure: ActivatingContainerInput['disclosure'],
  analytics: ActivatingContainerInput['analytics'],
  userId: ActivatingContainerInput['userId'],
  runtime: ActivatingContainerInput['runtime'],
  nextBestAction: ReturnType<typeof getNextBestAction>,
): {
  openSetup: (params?: SessionStackParams['SessionSetup']) => void;
  openProgress: () => void;
  openPlan: () => void;
  openCoach: () => void;
  openNextAction: () => void;
  returnReason: HomeReturnReason;
  stubActions: ReturnType<typeof stubNavigationActions>;
} {
  const navigation = useNavigation<Nav>();

  const openSetup = useCallback(
    (params: SessionStackParams['SessionSetup'] = {}): void => {
      if (userId && disclosure.inputs.totalCompletedSessions === 0) {
        analytics.trackFirstSessionStarted(userId, 'home');
      }
      navigateToSessionStackScreen(navigation, 'SessionSetup', params);
    },
    [analytics, disclosure.inputs.totalCompletedSessions, navigation, userId],
  );

  const openProgress = useCallback(() => {
    navigateToMainTab(navigation, 'Progress');
  }, [navigation]);

  const openPlan = useCallback(() => {
    navigateToMainTab(navigation, 'Progress');
  }, [navigation]);

  const openCoach = useCallback(() => {
    navigateToMainStackScreen(navigation, 'AICoach');
  }, [navigation]);

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

  const nextUnlockFeature = useMemo(
    () => getNextUnlockFeature(disclosure.features),
    [disclosure.features],
  );

  const returnReason = useMemo<HomeReturnReason>(() => {
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan: null,
      canShowExpansionSystems: runtime.shouldShowExpansionSystems,
      comebackMessage: null,
      nextBestAction,
      primaryRecommendation: null,
    });
    const onPress =
      reasonState.source === 'next-best-action'
        ? openNextAction
        : () => openSetup();
    return {
      body: reasonState.body,
      ctaLabel: reasonState.ctaLabel,
      eyebrow: reasonState.eyebrow,
      intent: reasonState.intent,
      onPress,
      source: reasonState.source,
      title: reasonState.title,
      tone: reasonState.tone,
    };
  }, [
    nextBestAction,
    openNextAction,
    openSetup,
    runtime.shouldShowExpansionSystems,
  ]);

  const stubActions = useMemo(() => stubNavigationActions(), []);

  return {
    openSetup,
    openProgress,
    openPlan,
    openCoach,
    openNextAction,
    returnReason,
    stubActions,
  };
}