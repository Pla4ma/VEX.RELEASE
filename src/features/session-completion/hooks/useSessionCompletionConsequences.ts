import { useMemo } from 'react';

import { useActiveBoss } from '../../boss/hooks';
import { useActiveChallenges } from '../../challenges/hooks';
import { useStreakSummary } from '../../streaks/hooks';
import type { SessionSummary } from '../../../session/types';
import {
  buildSessionCompletionConsequences,
  type SessionCompletionConsequences,
} from '../story-consequence-service';

export function useSessionCompletionConsequences(input: {
  summary: SessionSummary;
  userId: string | null;
}): SessionCompletionConsequences {
  const { summary, userId } = input;
  const activeBossQuery = useActiveBoss(userId);
  const streakQuery = useStreakSummary(userId);
  const activeChallengesQuery = useActiveChallenges(userId ?? '');

  return useMemo(
    () =>
      buildSessionCompletionConsequences({
        activeBoss: activeBossQuery.data,
        activeChallenges: activeChallengesQuery.data,
        streakSummary: streakQuery.data,
        summary,
      }),
    [activeBossQuery.data, activeChallengesQuery.data, streakQuery.data, summary],
  );
}
