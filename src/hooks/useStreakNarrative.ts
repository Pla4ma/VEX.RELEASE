import { useMemo } from 'react';
// import { generateStreakNarrative, generateRiskWarning, generateBreakRecovery } from '../retention/streak-narrative';
// import type { StreakNarrative } from '../retention/streak-narrative';

// Stub implementations for missing streak-narrative module
type StreakNarrative = {
  title: string;
  message: string;
  type: 'motivational' | 'warning' | 'recovery';
};

function generateStreakNarrative(_props: unknown): StreakNarrative {
  return {
    title: 'Keep Going!',
    message: 'Your streak is building momentum.',
    type: 'motivational',
  };
}

function generateRiskWarning(_props: unknown): StreakNarrative {
  return {
    title: 'Streak at Risk',
    message: "Don't lose your progress!",
    type: 'warning',
  };
}

function generateBreakRecovery(_props: unknown): StreakNarrative {
  return {
    title: 'Welcome Back!',
    message: 'Time to rebuild your streak.',
    type: 'recovery',
  };
}

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
    return generateStreakNarrative({ streakDays, maxStreak, totalSessions });
  }, [streakDays, maxStreak, totalSessions]);

  const riskWarning = useMemo(() => {
    if (streakDays < 3 || hoursSinceLastSession < 18) {
      return null;
    }

    const hoursRemaining = Math.max(0, 24 - hoursSinceLastSession);
    const warning = generateRiskWarning({ streakDays, hoursRemaining });

    return {
      show: hoursSinceLastSession > 20,
      urgency: 'MEDIUM' as const,
      headline: warning.title,
      story: warning.message,
      callToAction: 'Keep your streak going!',
    };
  }, [streakDays, hoursSinceLastSession]);

  const breakRecovery = useMemo(() => {
    if (streakDays === 0 && maxStreak > 0) {
      return generateBreakRecovery({ maxStreak, comebackTokens });
    }
    return null;
  }, [streakDays, maxStreak, comebackTokens]);

  return {
    narrative,
    riskWarning,
    breakRecovery,
  };
}
