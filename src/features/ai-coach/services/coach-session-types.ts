export interface CoachSessionConfig {
  duration: number;
  difficulty: 'EASY' | 'NORMAL' | 'CHALLENGING' | 'PUSH';
  sessionType: 'FOCUS' | 'BOSS_BATTLE' | 'CHALLENGE' | 'FREE';
  source:
    | 'COACH_RECOMMENDATION'
    | 'STREAK_PROTECTION'
    | 'COMEBACK_BUILDER'
    | 'OPTIMAL_TIME';
  context: {
    coachReasoning: string;
    userStreakDays?: number;
    isStreakAtRisk?: boolean;
    isComebackMode?: boolean;
    optimalTimeWindow?: boolean;
  };
}

export interface SessionTriggerResult {
  success: boolean;
  sessionId?: string;
  config: CoachSessionConfig;
  error?: string;
}

export function toAnalyticsDifficulty(
  difficulty: CoachSessionConfig['difficulty'],
): 'easy' | 'medium' | 'hard' {
  if (difficulty === 'EASY') {
    return 'easy';
  }
  if (difficulty === 'PUSH' || difficulty === 'CHALLENGING') {
    return 'hard';
  }
  return 'medium';
}

export function toAnalyticsSessionType(
  sessionType: CoachSessionConfig['sessionType'],
): 'focus' | 'challenge' | 'boss' {
  if (sessionType === 'CHALLENGE') {
    return 'challenge';
  }
  if (sessionType === 'BOSS_BATTLE') {
    return 'boss';
  }
  return 'focus';
}
