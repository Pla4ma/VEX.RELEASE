import React from 'react';

import { useActiveBoss } from '../../../features/boss/hooks';
import { useActiveChallenges } from '../../../features/challenges/hooks';
import { useStreakSummary } from '../../../features/streaks/hooks';
import type { SessionStakesBriefingProps } from '../../../features/session-start/components/SessionStakesBriefing';

type UseSessionSetupStakesInput = {
  currentStreakDays: number | null;
  selectedDurationSeconds: number;
  userId: string;
};

type SessionSetupStakes = Pick<
  SessionStakesBriefingProps,
  'bossStake' | 'challengeStake' | 'rivalStake' | 'streakStake'
>;

export function useSessionSetupStakes({
  currentStreakDays,
  selectedDurationSeconds,
  userId,
}: UseSessionSetupStakesInput): SessionSetupStakes {
  const { data: activeBoss } = useActiveBoss(userId);
  const { data: activeChallenges } = useActiveChallenges(userId);
  const { data: streakSummary } = useStreakSummary(userId);

  const bossStake = React.useMemo<SessionSetupStakes['bossStake']>(() => {
    if (!activeBoss || activeBoss.status !== 'ACTIVE') {
      return null;
    }

    const healthPercent = (activeBoss.healthRemaining / activeBoss.maxHealth) * 100;

    return {
      bossName: activeBoss.bossName || 'The Procrastinator',
      estimatedDamage: Math.floor((selectedDurationSeconds / 60) * 0.8),
      healthPercent,
      isFinalStrike: healthPercent <= 15,
      wouldDefeat: healthPercent <= 15,
    };
  }, [activeBoss, selectedDurationSeconds]);

  const streakStake = React.useMemo<SessionSetupStakes['streakStake']>(() => {
    if (currentStreakDays === null || !streakSummary) {
      return null;
    }

    const hoursUntilDeadline = streakSummary.nextDeadline
      ? Math.max(0, Math.floor((streakSummary.nextDeadline - Date.now()) / (1000 * 60 * 60)))
      : null;

    return {
      currentDays: currentStreakDays,
      hoursUntilDeadline,
      isAtRisk: streakSummary.isAtRisk ?? false,
      multiplier: 1 + currentStreakDays * 0.1,
      sessionNumberInStreak: 1,
    };
  }, [currentStreakDays, streakSummary]);

  const challengeStake = React.useMemo<SessionSetupStakes['challengeStake']>(() => {
    const detail = activeChallenges?.[0];
    if (!detail) {
      return null;
    }

    const current = detail.userChallenge.currentValue || 0;
    const target = detail.challenge.targetValue || 1;

    return {
      canComplete: current >= target - 1,
      challengeName: detail.challenge.title,
      current,
      target,
    };
  }, [activeChallenges]);

  const rivalStake = React.useMemo<SessionSetupStakes['rivalStake']>(() => {
    return null;
  }, []);

  return {
    bossStake,
    challengeStake,
    rivalStake,
    streakStake,
  };
}
