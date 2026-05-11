/**
 * HomeContextualCards Component
 *
 * Renders contextual cards based on user state.
 * Shows only ONE card at a time based on priority.
 */

import React from 'react';
import {
  BossPreviewCard,
  ComebackQuestCard,
  TodaysChallengesWidget,
  type ChallengeItem,
} from '../../../features/home-spine/components';
import { StudyPlanSuggestionCard } from '../../../features/content-study/components/StudyPlanSuggestionCard';
import { BOUNTY_COST_COINS } from '../../../features/boss/hooks';
import type { ActiveStudyPlan } from '../../../features/content-study/hooks/helpers';
import type { UseQueryResult } from '@tanstack/react-query';
import type { BountyStatus } from '../../../features/boss/BossBountySystem';

interface HomeContextualCardsProps {
  activeStudyPlan: ActiveStudyPlan | null | undefined;
  comebackData: { streakRestoreEligible?: boolean; streakBefore?: number; rewardMultiplier?: number; isComeback?: boolean; daysAbsent?: number; streakNow?: number; message?: string } | null | undefined;
  comebackSessionsCompleted: number;
  activeBossQuery: UseQueryResult<{ bossName?: string; percentHealthRemaining?: number; timeRemaining?: number; id?: string } | null, Error>;
  bountyStatusQuery: { status: BountyStatus | null; isLoading: boolean; error: Error | null };
  placeBountyMutation: { mutate: (vars: { userId: string; encounterId: string }, opts?: { onSuccess?: () => void; onError?: (e: Error) => void }) => void; isPending: boolean; error?: Error | null };
  coinBalance: number;
  canShowBossBounties: boolean;
  todaysChallenges: ChallengeItem[];
  challengesQueryError: Error | null | undefined;
  challengesQueryIsLoading: boolean;
  handleClaimReward: (challengeId: string) => void;
  challengesRefetch: () => void;
  openSetup: () => void;
  continueStudyPlan: () => void;
  showToast: (data: { type: string; title: string; message?: string }) => void;
  userId: string;
}

export function HomeContextualCards({
  activeStudyPlan,
  comebackData,
  comebackSessionsCompleted,
  activeBossQuery,
  bountyStatusQuery,
  placeBountyMutation,
  coinBalance,
  canShowBossBounties,
  todaysChallenges,
  challengesQueryError,
  challengesQueryIsLoading,
  handleClaimReward,
  challengesRefetch,
  openSetup,
  continueStudyPlan,
  showToast,
  userId,
}: HomeContextualCardsProps): JSX.Element | null {
  // Determine the ONE contextual card to show (priority order)
  const showStudyPlanCard = activeStudyPlan && activeStudyPlan.nextTask !== null;
  const showComebackCard = comebackData?.streakRestoreEligible ?? false;
  const showBossCard = activeBossQuery.data && !activeBossQuery.isLoading &&
    (activeBossQuery.data.percentHealthRemaining ?? 100) <= 25;
  const showChallengeCard = todaysChallenges.length > 0 &&
    todaysChallenges.some(c => {
      const percent = (c.currentProgress / c.targetProgress) * 100;
      return percent >= 70 && !c.isCompleted;
    });

  if (showStudyPlanCard) {
    return (
      <StudyPlanSuggestionCard
        studyPlan={activeStudyPlan}
        onSelect={continueStudyPlan}
      />
    );
  }

  if (showComebackCard) {
    return (
      <ComebackQuestCard
        originalStreak={comebackData?.streakBefore ?? 0}
        sessionsCompleted={comebackSessionsCompleted}
        sessionsRequired={3}
        multiplier={comebackData?.rewardMultiplier ?? 1}
        onPress={openSetup}
      />
    );
  }

  if (showBossCard && canShowBossBounties) {
    return (
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
          if (!userId || !activeBossQuery.data?.id) {return;}
          placeBountyMutation.mutate(
            { userId, encounterId: activeBossQuery.data.id },
            {
              onSuccess: () => showToast({ type: 'success', title: '🎯 Bounty placed! 2× loot next session.' }),
              onError: (error: Error) => showToast({
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
    );
  }

  if (showChallengeCard) {
    return (
      <TodaysChallengesWidget
        challenges={todaysChallenges}
        error={challengesQueryError}
        isLoading={challengesQueryIsLoading}
        onClaimReward={handleClaimReward}
        onRetry={challengesRefetch}
        onViewAll={() => {}} // Will be handled by parent
      />
    );
  }

  return null;
}
