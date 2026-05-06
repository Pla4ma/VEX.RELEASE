import type { SessionSummary } from '../../session/types';
import type { SessionConsequenceCardsProps } from '../../screens/session/components/SessionConsequenceCards';

export type SessionCompletionConsequences = {
  boss?: SessionConsequenceCardsProps['bossConsequence'];
  challenge?: SessionConsequenceCardsProps['challengeConsequence'];
  rival?: SessionConsequenceCardsProps['rivalConsequence'];
  streak?: SessionConsequenceCardsProps['streakConsequence'];
};

type ActiveBossInput = {
  bossName?: string;
  healthRemaining: number;
  maxHealth: number;
  status: string;
};

type StreakSummaryInput = {
  currentDays: number;
  isAtRisk: boolean;
};

type ActiveChallengeInput = {
  challenge: { targetValue?: number; title: string };
  userChallenge: { currentValue?: number; status?: string };
};

export function buildSessionCompletionConsequences(input: {
  activeBoss: ActiveBossInput | null | undefined;
  activeChallenges: ActiveChallengeInput[] | null | undefined;
  streakSummary: StreakSummaryInput | null | undefined;
  summary: SessionSummary;
}): SessionCompletionConsequences {
  return {
    boss: buildBossConsequence(input.summary, input.activeBoss),
    challenge: buildChallengeConsequence(input.activeChallenges),
    streak: buildStreakConsequence(input.summary, input.streakSummary),
  };
}

function buildBossConsequence(
  summary: SessionSummary,
  activeBoss: ActiveBossInput | null | undefined,
): SessionCompletionConsequences['boss'] {
  if (!activeBoss || activeBoss.status !== 'ACTIVE') {
    return null;
  }
  const sessionMinutes = Math.floor((summary.effectiveDuration || summary.actualDuration || 0) / 60);
  const purityMultiplier = (summary.focusPurityScore || summary.focusQuality || 100) / 100;
  const damageDealt = Math.floor(sessionMinutes * purityMultiplier);
  const healthBefore = (activeBoss.healthRemaining / activeBoss.maxHealth) * 100;
  const healthAfter = Math.max(0, healthBefore - (damageDealt / activeBoss.maxHealth) * 100);

  return {
    bossName: activeBoss.bossName || 'The Procrastinator',
    damageDealt,
    hadCriticalHit: purityMultiplier > 1.2,
    healthAfter,
    healthBefore,
    wasDefeated: healthAfter <= 0 && healthBefore > 0,
  };
}

function buildChallengeConsequence(
  activeChallenges: ActiveChallengeInput[] | null | undefined,
): SessionCompletionConsequences['challenge'] {
  const detail = activeChallenges?.[0];
  if (!detail) {
    return null;
  }
  const target = detail.challenge.targetValue || 1;
  const progressBefore = Math.max(0, (detail.userChallenge.currentValue || 0) - 1);
  const progressAfter = detail.userChallenge.currentValue || 0;

  return {
    challengeName: detail.challenge.title,
    progressAfter,
    progressBefore,
    target,
    wasCompleted: progressAfter >= target && progressBefore < target,
  };
}

function buildStreakConsequence(
  summary: SessionSummary,
  streakSummary: StreakSummaryInput | null | undefined,
): SessionCompletionConsequences['streak'] {
  if (!streakSummary) {
    return null;
  }
  const currentDays = streakSummary.currentDays;
  const previousDays = summary.streakIncreased ? currentDays - 1 : currentDays;
  const nextMilestone = [7, 14, 30, 60, 100].find((milestone) => milestone > currentDays) || 100;

  return {
    currentDays,
    daysUntilMilestone: nextMilestone - currentDays,
    nextMilestone,
    previousDays,
    streakSaved: streakSummary.isAtRisk && summary.streakIncreased,
  };
}
