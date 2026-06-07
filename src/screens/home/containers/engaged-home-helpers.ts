import { useCallback, useMemo } from 'react';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FeatureAccessResult } from '../../../features/liveops-config';
import type { HomeFeatureRuntime } from '../hooks/home-feature-runtime';
import type { ExtendedRootStackParams, SessionStackParams } from '../../../navigation/types';
import type { SessionRecommendation, RecommendationStatus } from '../../../features/ai-coach';
import type { HomeReturnReason } from '../hooks/useHomeReturnReason';
import { navigateToMainTab } from '../../../navigation/navigation-helpers';
import { buildLearningSessionParams } from '../../../features/learning-execution';
import type { LearningSessionTarget } from '../../../features/learning-execution';
import { buildHomeReturnReasonState } from '../../../features/home-spine/service';
import type { NextBestAction } from '../../../features/progression';
import type { ActiveStudyPlanData, ComebackData } from './engaged-home-types';

type Nav = NativeStackNavigationProp<ExtendedRootStackParams>;

interface ActionsInput {
  analytics: {
    trackFirstSessionStarted: (userId: string, source: string) => void;
    trackNextBestActionPressed: (
      stage: import('../../../features/liveops-config').UserExperienceStage,
      completedSessions: number,
    ) => void;
  };
  canNavigateContentStudy: boolean;
  canNavigateSocial: boolean;
  disclosure: FeatureAccessResult;
  learningExecutionLayer: { target: LearningSessionTarget | null };
  navigation: Nav;
  openSetup: (params?: SessionStackParams['SessionSetup']) => void;
  userId: string;
}

export function useEngagedActions(input: ActionsInput) {
  const {
    analytics, canNavigateContentStudy, canNavigateSocial,
    disclosure, learningExecutionLayer, navigation, openSetup,
  } = input;
  const openProgress = useCallback(
    () => navigateToMainTab(navigation, 'Progress'),
    [navigation],
  );
  const openSocial = useCallback(() => {
    if (canNavigateSocial) {
      navigateToMainTab(navigation, 'Profile');
    } else {
      navigateToMainTab(navigation, 'Profile');
    }
  }, [canNavigateSocial, navigation]);
  const openContentStudy = useCallback(() => {
    if (!canNavigateContentStudy) { openSetup(); return; }
    navigation.navigate('ContentStudy');
  }, [canNavigateContentStudy, navigation, openSetup]);
  const continueStudyPlan = useCallback(() => {
    if (!learningExecutionLayer.target) { openContentStudy(); return; }
    openSetup(buildLearningSessionParams(learningExecutionLayer.target as LearningSessionTarget));
  }, [learningExecutionLayer.target, openContentStudy, openSetup]);
  const openNextAction = useCallback(() => {
    analytics.trackNextBestActionPressed(
      disclosure.stage, disclosure.inputs.totalCompletedSessions,
    );
    openSetup();
  }, [analytics, disclosure.inputs.totalCompletedSessions, disclosure.stage, openSetup]);
  return { openProgress, openSocial, openContentStudy, continueStudyPlan, openNextAction };
}

interface ReturnReasonInput {
  activeStudyPlanQuery: { data: unknown };
  comebackQuery: { data: unknown };
  continueStudyPlan: () => void;
  nextBestAction: NextBestAction;
  openNextAction: () => void;
  openSetup: (params?: SessionStackParams['SessionSetup']) => void;
  primaryRecommendation: SessionRecommendation | null | undefined;
  runtime: HomeFeatureRuntime;
  updateRecommendationStatus: {
    mutateAsync: (vars: {
      recommendationId: string;
      status: RecommendationStatus;
      userId: string;
    }) => Promise<unknown>;
  };
  userId: string;
}

export function useEngagedReturnReason(
  input: ReturnReasonInput,
): HomeReturnReason {
  const {
    activeStudyPlanQuery, comebackQuery, continueStudyPlan,
    nextBestAction, openNextAction, openSetup,
    primaryRecommendation, runtime, updateRecommendationStatus, userId,
  } = input;
  return useMemo<HomeReturnReason>(() => {
    const studyData = activeStudyPlanQuery.data as ActiveStudyPlanData | undefined;
    const cbData = comebackQuery.data as ComebackData | undefined;
    const reasonState = buildHomeReturnReasonState({
      activeStudyPlan: studyData
        ? {
            completedTasks: studyData.completedTasks ?? 0,
            remainingMinutes: studyData.remainingMinutes ?? 0,
            title: studyData.title ?? '',
            totalTasks: studyData.totalTasks ?? 0,
          }
        : null,
      canShowExpansionSystems: runtime.shouldShowExpansionSystems,
      comebackMessage: cbData?.isComeback ? (cbData.message ?? null) : null,
      nextBestAction: nextBestAction,
      primaryRecommendation: primaryRecommendation
        ? {
            id: primaryRecommendation.id,
            reasoning: primaryRecommendation.reasoning ?? '',
            suggestedDifficulty: primaryRecommendation.suggestedDifficulty ?? 'NORMAL',
            suggestedDuration: primaryRecommendation.suggestedDuration ?? 15 * 60,
            type: primaryRecommendation.recommendationType,
          }
        : null,
    });
    let onPress: () => Promise<void> | void = () => openSetup();
    if (reasonState.intent === 'continue-study-plan') {
      onPress = continueStudyPlan;
    } else if (
      reasonState.intent === 'accept-coach-recommendation' &&
      reasonState.recommendationId
    ) {
      onPress = async () => {
        await updateRecommendationStatus.mutateAsync({
          recommendationId: reasonState.recommendationId!,
          status: 'ACCEPTED',
          userId,
        });
        openSetup({
          recommendationId: reasonState.recommendationId,
          suggestedDifficulty: reasonState.suggestedDifficulty,
          suggestedDurationSeconds: reasonState.suggestedDurationSeconds,
        });
      };
    } else if (reasonState.source === 'next-best-action') {
      onPress = openNextAction;
    }
    return {
      body: reasonState.body, ctaLabel: reasonState.ctaLabel,
      eyebrow: reasonState.eyebrow, intent: reasonState.intent,
      onPress, source: reasonState.source, title: reasonState.title, tone: reasonState.tone,
    };
  }, [
    activeStudyPlanQuery.data, comebackQuery.data, continueStudyPlan,
    nextBestAction, openNextAction, openSetup, primaryRecommendation,
    runtime.shouldShowExpansionSystems, updateRecommendationStatus, userId,
  ]);
}
