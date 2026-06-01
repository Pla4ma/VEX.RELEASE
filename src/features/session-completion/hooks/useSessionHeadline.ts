import { useMemo } from 'react';

import {
  FEATURE_FLAG_DEFAULTS,
  FEATURE_FLAGS,
} from '../../../constants/features';
import type { SessionSummary } from '../../../session/types';
import { selectHeadlineReward } from '../headline-reward.service';
import type {
  HeadlineReward,
  HeadlineRewardConsequences,
} from '../headline-reward.types';
import {
  buildSessionRewardPriority,
  type RewardPrioritySummary,
} from '../reward-priority';
import type { SessionCompletionConsequences } from '../story-consequence-service';

function buildHeadlineConsequences(input: {
  consequences?: SessionCompletionConsequences;
  contractStatus?: 'done' | 'partial' | 'not_done' | 'skipped' | null;
  summary: SessionSummary;
}): HeadlineRewardConsequences {
  const { consequences, contractStatus, summary } = input;

  return {
    boss: consequences?.boss
      ? {
          currentHealth: consequences.boss.healthAfter,
          isEnabled:
            FEATURE_FLAG_DEFAULTS[FEATURE_FLAGS.BASIC_SOLO_BOSS] ?? false,
        }
      : undefined,
    challenge: consequences?.challenge
      ? {
          completedThisSession: consequences.challenge.wasCompleted,
          isEnabled:
            FEATURE_FLAG_DEFAULTS[FEATURE_FLAGS.BASIC_CHALLENGES] ?? false,
        }
      : undefined,
    contract: { status: contractStatus ?? null },
    streak: consequences?.streak
      ? {
          currentDays: consequences.streak.currentDays,
          previousDays: consequences.streak.previousDays,
          streakSaved: consequences.streak.streakSaved,
        }
      : undefined,
    summary: {
      coinsEarned: summary.coinsEarned ?? 0,
      focusPurityScore: summary.focusPurityScore,
      gemsEarned: summary.gemsEarned ?? 0,
      newLevel: summary.userLevel,
      previousLevel: summary.userLevel,
      sessionMode: summary.sessionMode,
      xpEarned: summary.xpEarned ?? 0,
    },
  };
}

export function useSessionHeadline(input: {
  consequences?: SessionCompletionConsequences;
  contractStatus?: 'done' | 'partial' | 'not_done' | 'skipped' | null;
  summary: SessionSummary;
}): HeadlineReward {
  const { consequences, contractStatus, summary } = input;

  return useMemo(() => {
    return selectHeadlineReward(buildHeadlineConsequences(input));
  }, [input]);
}

export function useSessionRewardPriority(input: {
  consequences?: SessionCompletionConsequences;
  contractStatus?: 'done' | 'partial' | 'not_done' | 'skipped' | null;
  summary: SessionSummary;
}): RewardPrioritySummary {
  const { consequences, contractStatus, summary } = input;

  return useMemo(() => {
    return buildSessionRewardPriority(buildHeadlineConsequences(input));
  }, [input]);
}
