import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../../../navigation/types';
import { useFeatureGate } from '../../../features/feature-gate/hooks';
import { getFeatureAvailability } from '../../../features/liveops-config';
import type { HomeController } from '../hooks/home-controller-types';
import type { ActiveStudyPlan } from '../../../features/content-study';
import { HomeSecondaryRail } from './HomeSecondaryRail';
import { HomeDailyMission } from './HomeDailyMission';
import { HomeFocusScore } from './HomeFocusScore';
import { HomeContextualCards } from './HomeContextualCards';
import type { ChallengeItem } from '../../../features/home-spine/components';
import type { useHomeData } from '../hooks/useHomeData';
import type { MissionPriorityInput } from '../../../features/daily-mission/types';
import { buildLearningSessionParams } from '../../../features/learning-execution';

type HomeData = ReturnType<typeof useHomeData>;
type NavigationProp = NativeStackNavigationProp<RootStackParams>;

interface HomeContentLowerProps {
  controller: HomeController;
  data: HomeData;
  missionInput: Partial<MissionPriorityInput>;
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  features: HomeController['features'];
  comebackSessionsCompleted: number;
}

export const HomeContentLower: React.FC<HomeContentLowerProps> = ({
  controller,
  data,
  missionInput,
  handleClaimReward,
  streakHoursRemaining,
  features,
  comebackSessionsCompleted,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { isAvailable } = useFeatureGate('challenges', 'entryPoint');
  const { isAvailable: canNavChallenges } = useFeatureGate('challenges', 'navigation');
  const openChallenges = (): void => {
    if (canNavChallenges) {
      navigation.navigate('Challenges');
      return;
    }
    controller.openSetup();
  };

  const todaysChallenges: ChallengeItem[] = isAvailable ? data.todaysChallenges : [];
  const challengeAvailability = getFeatureAvailability(features.challenges);
  const startLearningTarget = (): void => {
    const target = controller.learningExecutionLayer.target;
    controller.openSetup(target ? buildLearningSessionParams(target) : undefined);
  };

  return (
    <>
      <HomeFocusScore onPress={() => navigation.navigate('FocusScoreDashboard')} />

      {controller.shouldShowSecondarySystems && challengeAvailability.canRenderEntryPoint ? (
        <HomeDailyMission missionInput={missionInput} onMissionPress={openChallenges} />
      ) : null}

      {controller.shouldShowSecondarySystems ? (
        <HomeContextualCards
          activeStudyPlan={controller.activeStudyPlanQuery.data as unknown as ActiveStudyPlan | null | undefined}
          learningCopy={controller.learningExecutionLayer.copy}
          comebackData={controller.comebackQuery.data as unknown as Record<string, unknown> | null | undefined}
          comebackSessionsCompleted={comebackSessionsCompleted}
          todaysChallenges={todaysChallenges}
          challengesQueryError={data.challengesQuery.error ?? undefined}
          challengesQueryIsLoading={data.challengesQuery.isLoading}
          handleClaimReward={handleClaimReward}
          challengesRefetch={() => data.challengesQuery.refetch()}
          openSetup={controller.openSetup}
          startLearningTarget={startLearningTarget}
          showToast={(toastData) => void data.showToast({ type: toastData.type as 'success' | 'error' | 'warning' | 'info', title: toastData.title, message: toastData.message })}
          userId={controller.userId ?? ''}
        />
      ) : null}

      {controller.shouldShowSecondarySystems ? (
        <HomeSecondaryRail
          activePlan={controller.activeStudyPlanQuery.data as unknown as { completedTasks: number; progressPercent: number; remainingMinutes: number; title: string; totalTasks: number } | null}
          canShowSecondarySystems={controller.shouldShowSecondarySystems}
          comebackMessage={(controller.comebackQuery.data as Record<string, unknown> | undefined)?.isComeback ? ((controller.comebackQuery.data as Record<string, unknown> | undefined)?.message as string ?? null) : null}
          features={features}
          hasActiveRecommendation={Boolean(controller.primaryRecommendation)}
          hasStudyError={Boolean(controller.activeStudyPlanQuery.error)}
          history={controller.historyQuery.history}
          isFirstRun={controller.isFirstRun}
          isStudyLoading={controller.activeStudyPlanQuery.isLoading}
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
