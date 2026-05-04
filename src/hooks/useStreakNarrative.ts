import { useMemo } from 'react';
import { generateStreakNarrative, generateRiskWarning, generateBreakRecovery } from '../retention/streak-narrative';
import type { StreakNarrative } from '../retention/streak-narrative';

interface UseStreakNarrativeProps {
  streakDays: number;
  maxStreak: number;
  totalSessions: number;
  hoursSinceLastSession: number;
  comebackTokens: number;
  _hasInsurance: boolean;
}

interface UseStreakNarrativeReturn {
  narrative: StreakNarrative;
  riskWarning: {
    show: boolean;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    headline: string;
    story: string;
    callToAction: string;
  } | null;
  breakRecovery: ReturnType<typeof generateBreakRecovery> | null;
}

export function useStreakNarrative({
  streakDays,
  maxStreak,
  totalSessions,
  hoursSinceLastSession,
  comebackTokens,
  _hasInsurance,
}: UseStreakNarrativeProps): UseStreakNarrativeReturn {
  const narrative = useMemo(() => {
    return generateStreakNarrative(streakDays, maxStreak, totalSessions);
  }, [streakDays, maxStreak, totalSessions]);

  const riskWarning = useMemo(() => {
    if (streakDays < 3 || hoursSinceLastSession < 18) {
      return null;
    }

    const hoursRemaining = Math.max(0, 24 - hoursSinceLastSession);
    const warning = generateRiskWarning(streakDays, hoursRemaining, narrative.currentBoss);

    return {
      show: hoursSinceLastSession > 20,
      ...warning,
    };
  }, [streakDays, hoursSinceLastSession, narrative.currentBoss]);

  const breakRecovery = useMemo(() => {
    if (streakDays === 0 && maxStreak > 0) {
      return generateBreakRecovery(maxStreak, maxStreak, comebackTokens);
    }
    return null;
  }, [streakDays, maxStreak, comebackTokens]);

  return {
    narrative,
    riskWarning,
    breakRecovery,
  };
}
