import type {
  FocusQualityMetrics,
  SessionState,
  SessionStatus,
  SessionSummary,
} from '../types';
import type { ScoringEngine } from './ScoringEngine';
import type { CompletionResult } from './completion-types';
import { createSessionSummary } from './completion-summary';
import { createDebugger } from '../../utils/debug';

/** ponytail: minimal summary for recovery paths — full scoring done elsewhere */
function createRecoverySummary(
  session: SessionState,
  focusMetrics: FocusQualityMetrics,
): SessionSummary {
  return {
    sessionId: session.id,
    userId: session.userId,
    status: session.status,
    sessionMode: session.config.sessionMode,
    plannedDuration: session.config.duration * 1000,
    actualDuration: (session.endedAt ?? Date.now()) - (session.startedAt ?? Date.now()),
    effectiveDuration: session.elapsedTime,
    pausedDuration: 0,
    completionPercentage: session.completionPercentage,
    focusQuality: focusMetrics.overallScore,
    interruptions: session.interruptions,
    pauses: 0,
    pausedTime: 0,
    streakMaintained: false,
    modeBonus: 0,
    baseScore: 0,
    timeBonus: 0,
    finalScore: 0,
    createdAt: session.startedAt ?? Date.now(),
    streakIncreased: false,
    streakDays: 0,
    xpEarned: 0,
    coinsEarned: 0,
    gemsEarned: 0,
    userLevel: 1,
    bonuses: [],
    damageTaken: 0,
    penaltiesApplied: [],
    vsAverage: 0,
    vsBest: 0,
  };
}



const debug = createDebugger('session:completion');

export function executePartialCompletion(
  scoringEngine: ScoringEngine,
  session: SessionState,
  focusMetrics: FocusQualityMetrics,
  userStreak: number,
  reason: string,
  reflection?: string,
  mood?: 'GREAT' | 'GOOD' | 'OKAY' | 'STRUGGLING' | 'DIFFICULT',
): CompletionResult {
  const now = Date.now();
  session.status = 'PARTIAL';
  session.completedAt = now;
  session.endedAt = now;
  session.focusQuality = focusMetrics.overallScore;
  const scoreCalc = scoringEngine.calculateScore(session, focusMetrics);
  const penaltyMultiplier = session.completionPercentage / 100;
  const adjustedScore =
    scoringEngine.calculateFinalScore(scoreCalc) * penaltyMultiplier;
  session.baseScore = scoreCalc.basePoints * penaltyMultiplier;
  const summary = createSessionSummary(
    scoringEngine,
    session,
    scoreCalc,
    adjustedScore,
    focusMetrics,
    userStreak,
    reflection,
    mood,
  );
  const MIN_PARTIAL_CREDIT = 50;
  const streakMaintained = session.completionPercentage >= MIN_PARTIAL_CREDIT;
  const rewardsGranted = scoringEngine.isEligibleForRewards(
    session.completionPercentage,
  );
  debug.info(
    'Session %s partially completed (%d%%). Score: %d, Streak: %s',
    session.id,
    session.completionPercentage,
    adjustedScore,
    streakMaintained,
  );
  return {
    success: rewardsGranted,
    status: 'PARTIAL',
    summary,
    rewardsGranted,
    streakMaintained,
    recoveryAvailable: session.recoveryAttempts < session.maxRecoveryAttempts,
  };
}

export function attemptSessionRecovery(
  scoringEngine: ScoringEngine,
  session: SessionState,
  recoveryType: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
  focusMetrics: FocusQualityMetrics,
  userStreak: number,
): CompletionResult {
  session.recoveryAttempts++;
  session.lastRecoveryAt = Date.now();
  let success = false;
  let status: SessionStatus = 'RECOVERING';
  let summary: SessionSummary | undefined;
  switch (recoveryType) {
    case 'USER_RESUME':
      session.status = 'ACTIVE';
      success = true;
      summary = createRecoverySummary(session, focusMetrics);
      break;
    case 'STREAK_SAVE':
      if (session.completionPercentage >= 25) {
        session.completionPercentage = Math.max(
          session.completionPercentage,
          50,
        );
        status = 'PARTIAL';
        summary = executePartialCompletion(
          scoringEngine,
          session,
          focusMetrics,
          userStreak,
          'Streak saved',
        ).summary;
        success = true;
      }
      break;
    case 'PARTIAL_CREDIT':
      session.completionPercentage = Math.max(session.completionPercentage, 30);
      status = 'PARTIAL';
      summary = executePartialCompletion(
        scoringEngine,
        session,
        focusMetrics,
        userStreak,
        'Partial credit granted',
      ).summary;
      success = true;
      break;
  }
  if (!summary) {
    summary = createRecoverySummary(session, focusMetrics);
  }
  // Summary is always defined after the fallback block above
  const finalSummary = summary!;
  debug.info(
    'Recovery attempted for session %s (type: %s). Success: %s',
    session.id,
    recoveryType,
    success,
  );
  return {
    success,
    status,
    summary: finalSummary,
    rewardsGranted: success,
    streakMaintained: success,
    recoveryAvailable: session.recoveryAttempts < session.maxRecoveryAttempts,
  };
}
