import type {
  FocusQualityMetrics,
  SessionState,
  SessionStatus,
  SessionSummary,
} from '../types';
import type { ScoringEngine } from './ScoringEngine';
import type { CompletionResult } from './completion-types';
import { createSessionSummary } from './completion-summary';
import { createDebugger } from '../../../utils/debug';

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
  debug.info(
    'Recovery attempted for session %s (type: %s). Success: %s',
    session.id,
    recoveryType,
    success,
  );
  if (summary === undefined) {
    const scoreCalc = scoringEngine.calculateScore(session, focusMetrics);
    const adjustedScore = scoringEngine.calculateFinalScore(scoreCalc);
    summary = createSessionSummary(
      scoringEngine,
      session,
      scoreCalc,
      adjustedScore,
      focusMetrics,
      userStreak,
    );
  }
  return {
    success,
    status,
    summary,
    rewardsGranted: success,
    streakMaintained: success,
    recoveryAvailable: session.recoveryAttempts < session.maxRecoveryAttempts,
  };
}
