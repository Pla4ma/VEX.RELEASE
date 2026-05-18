import React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParams } from '../../../navigation/types';
import { useFeatureGate } from '../../../features/feature-gate/hooks';
import { HomeSecondaryRail } from './HomeSecondaryRail';
import { HomeStreakProgress } from './HomeStreakProgress';
import { HomeWeeklyQuest } from './HomeWeeklyQuest';

import { HomeContextualCards } from './HomeContextualCards';
import type { ChallengeItem } from '../../../features/home-spine/components';
import type { useHomeData } from '../hooks/useHomeData';

type HomeData = ReturnType<typeof useHomeData>;
type HomeController = HomeData['controller'];

type NavigationProp = NativeStackNavigationProp<RootStackParams>;

interface HomeContentLowerProps {
  controller: HomeController;
  data: HomeData;
  handleClaimReward: (rewardId: string) => void;
  streakHoursRemaining: number;
  features: HomeController['disclosure']['features'];
  comebackSessionsCompleted: number;
}

export const HomeContentLower: React.FC<HomeContentLowerProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  features,
  comebackSessionsCompleted,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { isVisible } = useFeatureGate('challenges');
  const openChallenges = (): void => {
    if (features.challenges.isUnlocked) {
      navigation.navigate('Challenges');
      return;
    }
    controller.openSetup();
  };

  const todaysChallenges: ChallengeItem[] = isVisible
    ? data.todaysChallenges
    : [];

  return (
    <>
      {controller.shouldShowSecondarySystems ? (
        <HomeContextualCards
          activeStudyPlan={controller.activeStudyPlanQuery.data}
          comebackData={controller.comebackQuery.data}
          comebackSessionsCompleted={comebackSessionsCompleted}
          todaysChallenges={todaysChallenges}
          challengesQueryError={data.challengesQuery.error ?? undefined}
          challengesQueryIsLoading={data.challengesQuery.isLoading}
          handleClaimReward={handleClaimReward}
          challengesRefetch={() => (data.challengesQuery.refetch)()}
          openSetup={controller.openSetup}
          continueStudyPlan={controller.continueStudyPlan}
          showToast={(toastData) => void data.showToast({ type: toastData.type as 'success' | 'error' | 'warning' | 'info', title: toastData.title, message: toastData.message })}
          userId={controller.userId ?? ''}
        />
      ) : null}

      {/* Weekly Quest Card */}
      {controller.shouldShowSecondarySystems && features.challenges.isUnlocked ? (
        <HomeWeeklyQuest
          userId={controller.userId ?? ''}
          onPress={openChallenges}
        />
      ) : null}

      {/* 5. Streak/progress strip */}
      <HomeStreakProgress
        currentDays={controller.currentStreak}
        hoursRemaining={streakHoursRemaining}
        riskLevel={controller.streakQuery.data?.riskLevel}
        longestStreak={controller.streakQuery.data?.longestDays}
        isLoading={controller.streakQuery.isLoading}
        userId={controller.userId ?? undefined}
      />

      {/* 6. Secondary optional rail */}
      {controller.shouldShowSecondarySystems ? (
        <HomeSecondaryRail
          activePlan={controller.activeStudyPlanQuery.data ?? null}
          canShowSecondarySystems={controller.shouldShowSecondarySystems}
          comebackMessage={controller.comebackQuery.data?.isComeback ? controller.comebackQuery.data.message : null}
          features={features}
          hasActiveRecommendation={Boolean(controller.primaryRecommendation)}
          hasStudyError={Boolean(controller.activeStudyPlanQuery.error)}
          history={controller.historyQuery.history}
          isFirstRun={controller.isFirstRun}
          isStudyLoading={controller.activeStudyPlanQuery.isLoading}
          onContinueStudyPlan={controller.continueStudyPlan}
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
