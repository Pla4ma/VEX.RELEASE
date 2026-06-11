import type {
  FocusQualityMetrics,
  ScoreCalculation,
  SessionState,
  SessionSummary,
} from '../types';
import { resolveSessionMode } from '../modes';
import type { ScoringEngine } from './ScoringEngine';
import type { AbandonResult } from './completion-types';
import { computeCompletionStats } from './completion-stats';

function getBaseIntervalBonus(session: SessionState): number {
  if (session.intervalsCompleted >= 8) {
    return 80;
  }
  if (session.intervalsCompleted >= 4) {
    return 40;
  }
  if (session.intervalsCompleted >= 2) {
    return 15;
  }
  return 0;
}

export function createSessionSummary(
  scoringEngine: ScoringEngine,
  session: SessionState,
  scoreCalc: ScoreCalculation,
  finalScore: number,
  focusMetrics: FocusQualityMetrics,
  userStreak: number,
  reflection?: string,
  mood?: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING' | 'DIFFICULT',
  tasksCompleted?: number,
): SessionSummary {
  const plannedDuration = session.config.duration * 1000;
  if (session.endedAt == null || session.startedAt == null) {
    throw new Error(
      `Cannot create session summary: session ${session.id} is missing start/end timestamps`,
    );
  }
  const actualDuration = session.endedAt - session.startedAt;
  const focusPurityScore = scoringEngine.calculateFocusPurityScore(session);
  const xpEarned = Math.floor(finalScore * 0.1);
  const coinsEarned = Math.floor(
    (((session.completionPercentage / 100) * focusMetrics.overallScore) / 100) *
      50,
  );
  const gemsEarned =
    session.completionPercentage >= 100 && focusMetrics.overallScore >= 90
      ? 1
      : 0;
  const bonuses =
    scoreCalc.comebackBonus > 0
      ? [
          {
            type: 'COMEBACK_BONUS',
            amount: scoreCalc.comebackBonus,
            description: `${scoreCalc.comebackMultiplier}x comeback XP applied`,
          },
        ]
      : [];
  const modeBonus = Math.max(
    0,
    scoreCalc.intervalBonus - getBaseIntervalBonus(session),
  );
  return {
    sessionId: session.id,
    userId: session.userId,
    status: session.status,
    plannedDuration,
    actualDuration,
    effectiveDuration: session.effectiveTime,
    pausedDuration: session.pausedTime,
    pausedTime: session.pausedTime,
    completionPercentage: session.completionPercentage,
    focusQuality: focusMetrics.overallScore,
    focusPurityScore,
    interruptions: session.interruptions,
    pauses: session.pauses,
    baseScore: scoreCalc.basePoints,
    timeBonus: scoreCalc.timeBonus,
    streakBonus: scoreCalc.streakBonus,
    finalScore,
    xpEarned,
    coinsEarned,
    gemsEarned,
    bonuses,
    streakMaintained: true,
    streakIncreased: session.completionPercentage >= 100,
    streakDays: userStreak,
    userLevel: scoringEngine.getUserLevel(),
    isPerfect: scoreCalc.isPerfect,
    damageTaken: session.damagePoints,
    penaltiesApplied: session.antiCheatFlags,
    vsAverage: 100,
    vsBest: 100,
    tasksCompleted,
    tasksPlanned: session.config.estimatedTaskCount,
    reflection,
    mood,
    sessionMode: resolveSessionMode(session.config.sessionMode),
    modeBonus,
    createdAt: Date.now(),
  };
}

export function computeAbandonResult(
  scoringEngine: ScoringEngine,
  session: SessionState,
  _reason?: string,
): AbandonResult {
  const now = Date.now();
  session.status = 'ABANDONED';
  session.abandonedAt = now;
  session.endedAt = now;
  const damage = scoringEngine.calculateDamage(session, 'ABANDON');
  session.damagePoints = damage.totalDamage;
  session.penaltyMultiplier = damage.finalPenalty;
  const canRecover = session.recoveryAttempts < session.maxRecoveryAttempts;
  const partialCredit =
    session.effectiveTime > session.config.duration * 1000 * 0.25;
  const streakBroken = !partialCredit;
  return {
    sessionId: session.id,
    damage,
    canRecover,
    streakBroken,
    partialCredit,
  };
}

export function computeFailResult(
  scoringEngine: ScoringEngine,
  session: SessionState,
  error: string,
  canRecover: boolean = true,
): AbandonResult {
  const now = Date.now();
  session.status = 'FAILED';
  session.endedAt = now;
  const damage = scoringEngine.calculateDamage(session, 'INTERRUPTION');
  session.damagePoints = damage.totalDamage;
  session.penaltyMultiplier = damage.finalPenalty;
  const streakBroken =
    session.effectiveTime < session.config.duration * 1000 * 0.5;
  return {
    sessionId: session.id,
    damage,
    canRecover:
      canRecover && session.recoveryAttempts < session.maxRecoveryAttempts,
    streakBroken,
    partialCredit: !streakBroken,
  };
}
export function computeCompletionStats(
  session: SessionState,
  focusMetrics: FocusQualityMetrics,
): SessionStatsResult {
  if (session.endedAt == null || session.startedAt == null) {
    throw new Error(
      `Cannot compute completion stats: session ${session.id} is missing start/end timestamps`,
    );
  }
  const totalTime = session.endedAt - session.startedAt;
  const efficiency =
    totalTime > 0 ? (session.effectiveTime / totalTime) * 100 : 0;
  let focusRating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
  if (focusMetrics.overallScore >= 90) {
    focusRating = 'EXCELLENT';
  } else if (focusMetrics.overallScore >= 75) {
    focusRating = 'GOOD';
  } else if (focusMetrics.overallScore >= 50) {
    focusRating = 'AVERAGE';
  } else {
    focusRating = 'NEEDS_IMPROVEMENT';
  }
  const productivity = Math.round(
    session.completionPercentage * 0.4 +
      efficiency * 0.3 +
      focusMetrics.overallScore * 0.3,
  );
  const recommendations: string[] = [];
  if (session.interruptions > 2) {
    recommendations.push('Try enabling Do Not Disturb to reduce interruptions');
  }
  if (session.pauses > 3) {
    recommendations.push(
      'Consider shorter sessions if you need frequent breaks',
    );
  }
  if (focusMetrics.overallScore < 70) {
    recommendations.push(
      'Try the "Preparation" phase to set clear goals before starting',
    );
  }
  if (session.completionPercentage < 100) {
    recommendations.push('Build consistency by completing full sessions');
  }
  return {
    efficiency: Math.round(efficiency),
    focusRating,
    productivity,
    recommendations,
  };
}
