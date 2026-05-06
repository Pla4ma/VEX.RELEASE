/**
 * HomeContent Component - Launch Structure
 *
 * Adaptive decision screen that answers "What should I do next?"
 *
 * Hierarchy:
 * 1. Primary recommendation / Coach intervention
 * 2. Start Focus Session CTA (prominent)
 * 3. AI Study CTA (if relevant)
 * 4. Small progress summary
 * 5. ONE contextual card (based on state)
 *
 * Gated/hidden at launch:
 * - Wagers (until level 3)
 * - Streak insurance (until streak 3+)
 * - Battle Pass (hidden)
 * - Boss bounties (simplified)
 * - Social features (moved to Profile)
 * - Feed (hidden)
 * - Squad Wars (hidden)
 */

import React from 'react';
import {
  AtRiskBanner,
  BossPreviewCard,
  ComebackQuestCard,
  StreakWidget,
  TodaysChallengesWidget,
} from '../../../features/home-spine/components';
import { StudyPlanSuggestionCard } from '../../../features/content-study/components/StudyPlanSuggestionCard';
import { WeeklyQuestCard } from '../../../features/weekly-quests/components/WeeklyQuestCard';
import { StaggeredEnter } from '../../../shared/ui/components/EnterAnimation';
import { BOUNTY_COST_COINS } from '../../../features/boss/hooks';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomePrimaryRail } from './HomePrimaryRail';
import { HomeSecondaryRail } from './HomeSecondaryRail';

interface HomeContentProps {
  navigation: NativeStackNavigationProp<ExtendedRootStackParams>;
  data: ReturnType<typeof import('../hooks/useHomeData').useHomeData>;
}

export function HomeContent({ navigation, data }: HomeContentProps): JSX.Element {
  const {
    controller,
    todaysChallenges,
    streakHoursRemaining,
    comebackSessionsCompleted,
    activeBossQuery,
    bountyStatusQuery,
    placeBountyMutation,
    coinBalance,
    activeWagerQuery,
    handleClaimReward,
  } = data;

  // Use feature gates to determine visibility
  const features = controller.disclosure.features;
  const canShowWagers = features.wagers?.isVisible ?? false;
  const canShowBossBounties = features.boss_bounties?.isVisible ?? false;
  const canShowBattlePass = features.battle_pass?.isVisible ?? false;

  // Determine the ONE contextual card to show (priority order)
  // Priority: Active Study Plan > Comeback > Boss near defeat > Challenge near completion
  const activeStudyPlan = controller.activeStudyPlanQuery.data;
  const showStudyPlanCard = activeStudyPlan && activeStudyPlan.nextTask !== null;
  const showComebackCard = controller.comebackQuery.data?.streakRestoreEligible ?? false;
  const showBossCard = activeBossQuery.data && !activeBossQuery.isLoading &&
    activeBossQuery.data.percentHealthRemaining <= 25; // Only show when boss is nearly defeated
  const showChallengeCard = todaysChallenges.length > 0 &&
    todaysChallenges.some(c => {
      const percent = (c.currentProgress / c.targetProgress) * 100;
      return percent >= 70 && !c.isCompleted;
    }); // Near completion
  const showAtRiskCard = streakHoursRemaining !== null && streakHoursRemaining <= 4;

  return (
    <StaggeredEnter
      containerStyle={{ gap: 16, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      direction="up"
      initialDelay={100}
      speed="normal"
      staggerDelay={60}
    >
      {/* 1. Primary recommendation / Coach intervention */}
      <HomePrimaryRail
        completionSync={controller.completionSync}
        isOnline={controller.isOnline}
        loadError={controller.loadError}
        onDismissHighlight={controller.clearHomeHighlight}
        onOpenProgress={controller.openProgress}
        onRepairSync={controller.retryAll}
        onRetry={controller.retryAll}
        onStart={() => controller.openSetup()}
        primaryAction={controller.homeSpine.primaryAction}
        progressSignal={controller.homeSpine.progressSignal}
        returnReason={controller.returnReason}
      />

      {/* 2. Urgency banner (if streak at risk) - only when urgent */}
      {showAtRiskCard && (
        <AtRiskBanner
          hoursRemaining={streakHoursRemaining}
          currentStreak={controller.currentStreak}
          onStartSession={() => controller.openSetup()}
          isLoading={controller.streakQuery.isLoading}
        />
      )}

      {/* 3. ONE contextual card (priority order) */}
      {showStudyPlanCard ? (
        <StudyPlanSuggestionCard
          studyPlan={activeStudyPlan}
          onSelect={() => controller.continueStudyPlan()}
        />
      ) : showComebackCard ? (
        <ComebackQuestCard
          originalStreak={controller.comebackQuery.data?.streakBefore ?? 0}
          sessionsCompleted={comebackSessionsCompleted}
          sessionsRequired={3}
          multiplier={controller.comebackQuery.data?.rewardMultiplier ?? 1}
          onPress={() => controller.openSetup()}
        />
      ) : showBossCard && canShowBossBounties ? (
        <BossPreviewCard
          bossName={activeBossQuery.data?.bossName ?? ''}
          healthPercent={activeBossQuery.data?.percentHealthRemaining ?? 100}
          hoursRemaining={Math.max(0, Math.floor((activeBossQuery.data?.timeRemaining ?? 0) / (1000 * 60 * 60)))}
          tier="COMMON"
          wouldDefeat={(activeBossQuery.data?.percentHealthRemaining ?? 100) <= 20}
          estimatedDamage={undefined}
          isFinalStrike={(activeBossQuery.data?.percentHealthRemaining ?? 100) <= 15}
          activeBountyCount={bountyStatusQuery.status?.bountyCount ?? 0}
          maxBounties={4}
          onPlaceBounty={() => {
            if (!controller.userId || !activeBossQuery.data?.id) {return;}
            placeBountyMutation.mutate(
              { userId: controller.userId, encounterId: activeBossQuery.data.id },
              {
                onSuccess: () => data.showToast({ type: 'success', title: '🎯 Bounty placed! 2× loot next session.' }),
                onError: (error: Error) => data.showToast({
                  type: 'error',
                  title: 'Bounty placement failed',
                  message: error instanceof Error ? error.message : 'Check your coin balance.',
                }),
              }
            );
          }}
          isPlacingBounty={placeBountyMutation.isPending}
          bountyError={placeBountyMutation.error instanceof Error ? placeBountyMutation.error.message : null}
          coinBalance={coinBalance ?? 0}
          BOUNTY_COST={BOUNTY_COST_COINS}
        />
      ) : showChallengeCard ? (
        <TodaysChallengesWidget
          challenges={todaysChallenges}
          error={data.challengesQuery.error ?? undefined}
          isLoading={data.challengesQuery.isLoading}
          onClaimReward={handleClaimReward}
          onRetry={() => data.challengesQuery.refetch()}
          onViewAll={() => navigation.navigate('Challenges')}
        />
      ) : null}

      {/* Weekly Quest Card */}
      {controller.userId && (
        <WeeklyQuestCard
          userId={controller.userId}
          onPress={() => navigation.navigate('Challenges')}
        />
      )}

      {/* 4. Simplified progress summary (without gated features) */}
      <StreakWidget
        currentDays={controller.currentStreak}
        multiplier={1.0 + (controller.currentStreak * 0.1)}
        hoursRemaining={streakHoursRemaining}
        riskLevel={controller.streakQuery.data?.riskLevel ?? 'NONE'}
        longestStreak={controller.streakQuery.data?.longestDays ?? 0}
        isLoading={controller.streakQuery.isLoading}
        userId={controller.userId ?? undefined}
        // Gated features - only pass if unlocked (insurance hidden at launch until streak 3+)
        activeWager={canShowWagers ? activeWagerQuery.wager : undefined}
        // Note: onWagerPress intentionally omitted until wager sheet implementation is complete
      />

      {/* 5. Secondary content (simplified) */}
      <HomeSecondaryRail
        activePlan={controller.activeStudyPlanQuery.data ?? null}
        battlePass={canShowBattlePass ? (controller.battlePassQuery.data ?? null) : null}
        canShowExpansionSystems={false} // Hidden at launch
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
        seasonIsVisible={false} // Battle Pass hidden at launch
        socialSummary="Social features are now in your Profile"
        stage={controller.disclosure.stage}
        wallet={controller.walletQuery.data ?? null}
      />
    </StaggeredEnter>
  );
}
