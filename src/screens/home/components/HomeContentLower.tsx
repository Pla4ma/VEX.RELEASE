import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../../../navigation/types';
import { useFeatureGate } from '../../../features/feature-gate/hooks';
import type { HomeController } from '../hooks/home-controller-types';
import type { ActiveStudyPlan } from '../../../features/content-study';
import { HomeSecondaryRail } from './HomeSecondaryRail';
import { HomeFocusScore } from './HomeFocusScore';
import { HomeContextualCards } from './HomeContextualCards';
import { HomeMemoryInsight } from './HomeMemoryInsight';
import type { ChallengeItem } from '../../../features/home-spine/components';
import type { useHomeData } from '../hooks/useHomeData';
import type { HomeSurfaceMap } from '../../../features/home-experience/surface-decision-schemas';
import { buildLearningSessionParams } from '../../../features/learning-execution';

type HomeData = ReturnType<typeof useHomeData>;
type NavigationProp = NativeStackNavigationProp<RootStackParams>;

interface HomeContentLowerProps {
  controller: HomeController;
  data: HomeData;
  missionInput: Record<string, never>;
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  features: HomeController['features'];
  comebackSessionsCompleted: number;
  surfaceMap: HomeSurfaceMap;
}

export const HomeContentLower: React.FC<HomeContentLowerProps> = ({
  controller,
  data,
  missionInput: _missionInput,
  handleClaimReward,
  streakHoursRemaining: _streakHoursRemaining,
  features,
  comebackSessionsCompleted,
  surfaceMap,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { isAvailable } = useFeatureGate('challenges', 'entryPoint');
  const { isAvailable: canNavChallenges } = useFeatureGate(
    'challenges',
    'navigation',
  );
  const openChallenges = (): void => {
    if (canNavChallenges) {
      navigation.navigate('Challenges');
      return;
    }
    controller.openSetup();
  };

  const stage = controller.disclosure.stage;
  const isDayZero = controller.disclosure.inputs.totalCompletedSessions === 0;
  if (isDayZero) {return null;}

  const sm = surfaceMap;
  const showContextualCards =
    sm.study_layer !== 'hidden' || sm.boss_teaser !== 'hidden';
  const showSecondaryRail =
    sm.study_layer !== 'hidden' && sm.study_layer !== 'blocked';

  const isNewOrActivating = stage === 'ACTIVATING' || stage === 'NEW_USER';
  const showFocusScore =
    sm.focus_score !== 'hidden' &&
    sm.focus_score !== 'blocked';
  const canOpenProgressDetail =
    sm.progress_detail !== 'hidden' &&
    sm.progress_detail !== 'blocked' &&
    sm.progress_detail !== 'tiny_tease';
  const handleFocusScorePress = (): void => {
    if (isNewOrActivating || !canOpenProgressDetail) {return;}
    navigation.navigate('FocusScoreDashboard');
  };

  const todaysChallenges: ChallengeItem[] = isAvailable
    ? data.todaysChallenges
    : [];
  const startLearningTarget = (): void => {
    const target = controller.learningExecutionLayer.target;
    controller.openSetup(
      target ? buildLearningSessionParams(target) : undefined,
    );
  };

  return (
    <>
      <HomeMemoryInsight userId={controller.userId} surfaceMap={surfaceMap} />

      {showFocusScore ? (
        <HomeFocusScore onPress={handleFocusScorePress} />
      ) : null}

      {showContextualCards ? (
        <HomeContextualCards
          activeStudyPlan={
            controller.activeStudyPlanQuery.data as
              | ActiveStudyPlan
              | null
              | undefined
          }
          learningCopy={controller.learningExecutionLayer.copy}
          comebackData={
            controller.comebackQuery.data as
              | Record<string, unknown>
              | null
              | undefined
          }
          comebackSessionsCompleted={comebackSessionsCompleted}
          todaysChallenges={todaysChallenges}
          challengesQueryError={data.challengesQuery.error ?? undefined}
          challengesQueryIsLoading={data.challengesQuery.isPending}
          handleClaimReward={handleClaimReward}
          challengesRefetch={() => data.challengesQuery.refetch()}
          openSetup={controller.openSetup}
          startLearningTarget={startLearningTarget}
          showToast={(toastData) =>
            data.showToast({
              type: toastData.type as 'success' | 'error' | 'warning' | 'info',
              title: toastData.title,
              message: toastData.message,
            })
          }
          userId={controller.userId ?? ''}
        />
      ) : null}

      {showSecondaryRail ? (
        <HomeSecondaryRail
          activePlan={
            controller.activeStudyPlanQuery.data as {
              completedTasks: number;
              progressPercent: number;
              remainingMinutes: number;
              title: string;
              totalTasks: number;
            } | null
          }
          canShowSecondarySystems={controller.shouldShowSecondarySystems}
          comebackMessage={
            (
              controller.comebackQuery.data as
                | Record<string, unknown>
                | undefined
            )?.isComeback
              ? (((
                  controller.comebackQuery.data as
                    | Record<string, unknown>
                    | undefined
                )?.message as string) ?? null)
              : null
          }
          features={features}
          hasActiveRecommendation={Boolean(controller.primaryRecommendation)}
          hasStudyError={Boolean(controller.activeStudyPlanQuery.error)}
          history={controller.historyQuery.history}
          isFirstRun={controller.isFirstRun}
          isStudyLoading={controller.activeStudyPlanQuery.isPending}
          learningCopy={controller.learningExecutionLayer.copy}
          onContinueStudyPlan={startLearningTarget}
          onOpenProgress={controller.openProgress}
          onOpenSetup={() => controller.openSetup()}
          onRetryStudyPlan={controller.activeStudyPlanQuery.refetch}
          onStartStudy={controller.openContentStudy}
          stage={controller.disclosure.stage}
        />
      ) : null}
    </>
  );
};
