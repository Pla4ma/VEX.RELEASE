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
  canShowWagers: boolean;
  activeWagerQuery: HomeData['activeWagerQuery'];
  canShowBattlePass: boolean;
  features: HomeController['disclosure']['features'];
  comebackSessionsCompleted: number;
  activeBossQuery: HomeData['activeBossQuery'];
  bountyStatusQuery: HomeData['bountyStatusQuery'];
  placeBountyMutation: HomeData['placeBountyMutation'];
  coinBalance: number | null;
  canShowBossBounties: boolean;
}

export const HomeContentLower: React.FC<HomeContentLowerProps> = ({
  controller,
  data,
  handleClaimReward,
  streakHoursRemaining,
  canShowWagers,
  activeWagerQuery,
  canShowBattlePass,
  features,
  comebackSessionsCompleted,
  activeBossQuery,
  bountyStatusQuery,
  placeBountyMutation,
  coinBalance,
  canShowBossBounties,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { isVisible } = useFeatureGate('challenges');

  const todaysChallenges: ChallengeItem[] = isVisible
    ? data.todaysChallenges
    : [];

  return (
    <>
      {/* ONE contextual card (priority order) */}
      <HomeContextualCards
        activeStudyPlan={controller.activeStudyPlanQuery.data}
        comebackData={controller.comebackQuery.data}
        comebackSessionsCompleted={comebackSessionsCompleted}
        activeBossQuery={activeBossQuery}
        bountyStatusQuery={bountyStatusQuery}
        placeBountyMutation={placeBountyMutation}
        coinBalance={coinBalance ?? 0}
        canShowBossBounties={canShowBossBounties}
        todaysChallenges={todaysChallenges}
        challengesQueryError={data.challengesQuery.error ?? undefined}
        challengesQueryIsLoading={data.challengesQuery.isLoading}
        handleClaimReward={handleClaimReward}
        challengesRefetch={() => data.challengesQuery.refetch()}
        openSetup={controller.openSetup}
        continueStudyPlan={controller.continueStudyPlan}
        showToast={(toastData) => void data.showToast({ type: toastData.type as 'success' | 'error' | 'warning' | 'info', title: toastData.title, message: toastData.message })}
        userId={controller.userId ?? ''}
      />

      {/* Weekly Quest Card */}
      <HomeWeeklyQuest
        userId={controller.userId ?? ''}
        onPress={() => navigation.navigate('Challenges')}
      />

      {/* 5. Streak/progress strip */}
      <HomeStreakProgress
        currentDays={controller.currentStreak}
        hoursRemaining={streakHoursRemaining}
        riskLevel={controller.streakQuery.data?.riskLevel}
        longestStreak={controller.streakQuery.data?.longestDays}
        isLoading={controller.streakQuery.isLoading}
        userId={controller.userId ?? undefined}
        activeWager={canShowWagers ? activeWagerQuery.wager : undefined}
      />

      {/* 6. Secondary optional rail */}
      <HomeSecondaryRail
        activePlan={controller.activeStudyPlanQuery.data ?? null}
        battlePass={canShowBattlePass ? (controller.battlePassQuery.data ?? null) : null}
        canShowExpansionSystems={false}
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
        onOpenSocial={controller.openSocial}
        onRetryStudyPlan={controller.activeStudyPlanQuery.refetch}
        onStartStudy={controller.openContentStudy}
        seasonIsVisible={false}
        socialSummary="Social features are now in your Profile"
        stage={controller.disclosure.stage}
        wallet={controller.walletQuery.data ?? null}
      />
    </>
  );
};
