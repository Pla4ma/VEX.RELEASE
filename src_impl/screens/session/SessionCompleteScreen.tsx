import React from 'react';

import { useSessionCompletionRouteState } from '../../features/session-completion/route';
import { SessionCompleteContent } from './components/SessionCompleteContent';
import { SessionSummaryUnavailable } from './components/SessionSummaryUnavailable';
import { useActiveBoss } from '../../features/boss/hooks';
import { useStreakSummary } from '../../features/streaks/hooks';
import { useActiveChallenges } from '../../features/challenges/hooks';
import { useAuthStore } from '../../store';
import type { SessionConsequenceCardsProps } from './components/SessionConsequenceCards';

export const SessionCompleteScreen: React.FC = () => {
  const { navigation, parsedRoute } = useSessionCompletionRouteState();
  const { user } = useAuthStore();
  const userId = user?.id ?? null;
  const summary = parsedRoute.params?.summary;

  // PHASE 7.2: Fetch data for consequences computation
  const { data: activeBoss } = useActiveBoss(userId);
  const { data: streakSummary } = useStreakSummary(userId);
  const { data: activeChallenges } = useActiveChallenges(userId ?? '');
  const rivals: Array<{
    weeklyScore?: { mine?: number; theirs?: number };
    profile?: { name?: string };
  }> = [];

  // Compute consequences from session impact
  const consequences = React.useMemo(() => {
    if (!summary) {return { bossConsequence: null, streakConsequence: null, challengeConsequence: null, rivalConsequence: null };}

    // Boss consequence: Calculate damage dealt and health change
    const bossConsequence: SessionConsequenceCardsProps['bossConsequence'] = (() => {
      if (!activeBoss || activeBoss.status !== 'ACTIVE') {return null;}
      const sessionMinutes = Math.floor((summary.effectiveDuration || summary.actualDuration || 0) / 60);
      const purityMultiplier = (summary.focusPurityScore || summary.focusQuality || 100) / 100;
      const damageDealt = Math.floor(sessionMinutes * purityMultiplier);
      const healthBefore = (activeBoss.healthRemaining / activeBoss.maxHealth) * 100;
      const healthAfter = Math.max(0, healthBefore - (damageDealt / activeBoss.maxHealth) * 100);

      return {
        bossName: activeBoss.bossName || 'The Procrastinator',
        healthBefore,
        healthAfter,
        damageDealt,
        wasDefeated: healthAfter <= 0 && healthBefore > 0,
        hadCriticalHit: purityMultiplier > 1.2,
      };
    })();

    // Streak consequence: Track streak progression
    const streakConsequence: SessionConsequenceCardsProps['streakConsequence'] = (() => {
      if (!streakSummary) {return null;}
      const currentDays = streakSummary.currentDays;
      const previousDays = summary.streakIncreased ? currentDays - 1 : currentDays;
      const milestones = [7, 14, 30, 60, 100];
      const nextMilestone = milestones.find(m => m > currentDays) || 100;

      return {
        previousDays,
        currentDays,
        nextMilestone,
        daysUntilMilestone: nextMilestone - currentDays,
        streakSaved: streakSummary.isAtRisk && summary.streakIncreased,
      };
    })();

    // Challenge consequence: Track progress on first active challenge
    const challengeConsequence: SessionConsequenceCardsProps['challengeConsequence'] = (() => {
      if (!activeChallenges || activeChallenges.length === 0) {return null;}
      const detail = activeChallenges[0];
      const target = detail.challenge.targetValue || 1;
      const progressBefore = Math.max(0, (detail.userChallenge.currentValue || 0) - 1);
      const progressAfter = detail.userChallenge.currentValue || 0;

      return {
        challengeName: detail.challenge.title,
        progressBefore,
        progressAfter,
        target,
        wasCompleted: progressAfter >= target && progressBefore < target,
      };
    })();

    // Rival consequence: Track gap changes
    const rivalConsequence: SessionConsequenceCardsProps['rivalConsequence'] = (() => {
      if (!rivals || rivals.length === 0) {return null;}
      const mainRival = rivals[0];
      const sessionMinutes = Math.floor((summary.effectiveDuration || summary.actualDuration || 0) / 60);
      const gapBefore = Math.floor(((mainRival.weeklyScore?.theirs || 0) - (mainRival.weeklyScore?.mine || 0)) / 60);
      const gapAfter = gapBefore - sessionMinutes;

      return {
        rivalName: mainRival.profile?.name || 'Your Rival',
        gapBefore,
        gapAfter,
        minutesGained: sessionMinutes,
      };
    })();

    return {
      boss: bossConsequence,
      streak: streakConsequence,
      challenge: challengeConsequence,
      rival: rivalConsequence,
    };
  }, [activeBoss, streakSummary, activeChallenges, rivals, summary]);

  if (!parsedRoute.params) {
    return (
      <SessionSummaryUnavailable
        message={parsedRoute.warningMessage ?? undefined}
        onDone={() => navigation.navigate({ name: 'Main', params: {} })}
      />
    );
  }

  return (
    <SessionCompleteContent
      sessionId={parsedRoute.params.sessionId}
      summary={parsedRoute.params.summary}
      consequences={consequences}
    />
  );
};

export default SessionCompleteScreen;
