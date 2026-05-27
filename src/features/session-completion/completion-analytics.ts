import * as Sentry from "@sentry/react-native";

import type { SessionSummary } from "../../session/types";
import { trackSessionCompleted } from "./analytics";
import type { CompletionLedger } from "./schemas";

export function trackCompletionAnalytics(
  ledger: CompletionLedger,
  summary: SessionSummary,
): void {
  const isAbandoned = ledger.grade === "D";
  const completionType = isAbandoned ? "abandoned" : "natural";
  const efficiency =
    ledger.completedDurationSeconds > 0
      ? ledger.effectiveFocusedSeconds / ledger.completedDurationSeconds
      : 0;

  Sentry.addBreadcrumb({
    category: "session-completion",
    data: {
      grade: ledger.grade,
      sessionId: ledger.sessionId,
      userId: ledger.userId,
    },
    level: "info",
    message: "vex_session_completed",
  });

  trackSessionCompleted(
    ledger.userId,
    ledger.sessionId,
    completionType,
    ledger.completedDurationSeconds,
    {
      completed: ledger.completedDurationSeconds,
      failed: 0,
      percentage: summary.completionPercentage,
      skipped: 0,
      total: ledger.targetDurationSeconds,
    },
    {
      accuracy: ledger.qualityScore,
      consistency: ledger.streakResult.newDays,
      efficiency,
      overallScore: ledger.gradeScore,
      speed: 0,
    },
    {
      completionCriteria: ["target_duration_met"],
      failureReason: isAbandoned ? `Session graded ${ledger.grade}` : undefined,
      metCriteria:
        ledger.completedDurationSeconds >= ledger.targetDurationSeconds
          ? ["target_duration_met"]
          : [],
      missedCriteria:
        ledger.completedDurationSeconds < ledger.targetDurationSeconds
          ? ["target_duration_not_met"]
          : [],
      success: !isAbandoned,
    },
  );
}
