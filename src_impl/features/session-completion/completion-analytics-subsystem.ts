import type { SessionSummary } from '../../session/types';
import { trackSessionCompleted } from './analytics';
import type { CompletionLedger } from './schemas';

export function trackCompletionAnalytics(input: {
  ledger: CompletionLedger;
  summary: SessionSummary;
}): void {
  const { ledger, summary } = input;
  const isAbandoned = ledger.grade === 'D';
  const completionType = isAbandoned ? 'abandoned' : 'natural';
  const efficiency =
    ledger.completedDurationSeconds > 0
      ? ledger.effectiveFocusedSeconds / ledger.completedDurationSeconds
      : 0;

  trackSessionCompleted(
    ledger.userId,
    ledger.sessionId,
    completionType,
    ledger.completedDurationSeconds,
    {
      total: ledger.targetDurationSeconds,
      completed: ledger.completedDurationSeconds,
      failed: 0,
      skipped: 0,
      percentage: summary.completionPercentage,
    },
    {
      overallScore: ledger.gradeScore,
      accuracy: ledger.qualityScore,
      efficiency,
      speed: 0,
      consistency: ledger.streakResult.newDays,
    },
    {
      success: !isAbandoned,
      failureReason: isAbandoned ? `Session graded ${ledger.grade}` : undefined,
      completionCriteria: ['target_duration_met'],
      metCriteria:
        ledger.completedDurationSeconds >= ledger.targetDurationSeconds
          ? ['target_duration_met']
          : [],
      missedCriteria:
        ledger.completedDurationSeconds < ledger.targetDurationSeconds
          ? ['target_duration_not_met']
          : [],
    },
  );
}
