/**
 * HomeContextualCards Component
 *
 * Renders contextual cards based on user state.
 * Shows only ONE card at a time based on priority.
 */

import React from 'react';
import {
  ComebackQuestCard,
  TodaysChallengesWidget,
  type ChallengeItem,
} from '../../../features/home-spine/components';
import { StudyPlanSuggestionCard } from '../../../features/content-study/components/StudyPlanSuggestionCard';
import type { ActiveStudyPlan } from '../../../features/content-study/hooks/helpers';

interface HomeContextualCardsProps {
  activeStudyPlan: ActiveStudyPlan | null | undefined;
  comebackData: { streakRestoreEligible?: boolean; streakBefore?: number; rewardMultiplier?: number; isComeback?: boolean; daysAbsent?: number; streakNow?: number; message?: string } | null | undefined;
  comebackSessionsCompleted: number;
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
