import type {
  FocusQualityMetrics,
  SessionState,
} from "../types";
import { createDebugger } from "../../utils/debug";
import type { ScoringEngine } from "./ScoringEngine";
import type {
  CompletionResult,
  AbandonResult,
  SessionStatsResult,
  CompletionEligibility,
} from "./completion-types";
import { validateEligibility } from "./completion-types";
import {
  createSessionSummary,
  computeAbandonResult,
  computeFailResult,
  computeCompletionStats,
} from "./completion-summary";
import {
  executePartialCompletion,
  attemptSessionRecovery,
} from "./completion-recovery";

const debug = createDebugger("session:completion");

export class CompletionEngine {
  private scoringEngine: ScoringEngine;

  constructor(scoringEngine: ScoringEngine) {
    this.scoringEngine = scoringEngine;
  }

  completeSession(
    session: SessionState,
    focusMetrics: FocusQualityMetrics,
    userStreak: number,
    reflection?: string,
    mood?: "GREAT" | "GOOD" | "OKAY" | "STRUGGLING" | "DIFFICULT",
    tasksCompleted?: number,
  ): CompletionResult {
    const now = Date.now();
    session.status = "COMPLETED";
    session.completedAt = now;
    session.endedAt = now;
    session.completionPercentage = 100;
    session.focusQuality = focusMetrics.overallScore;
    session.effectiveTime = session.config.duration * 1000;
    const scoreCalc = this.scoringEngine.calculateScore(session, focusMetrics);
    const finalScore = this.scoringEngine.calculateFinalScore(scoreCalc);
    session.baseScore = scoreCalc.basePoints;
    session.timeBonus = scoreCalc.timeBonus;
    session.streakBonus = scoreCalc.streakBonus;
    const summary = createSessionSummary(
      this.scoringEngine,
      session,
      scoreCalc,
      finalScore,
      focusMetrics,
      userStreak,
      reflection,
      mood,
      tasksCompleted,
    );
    const streakMaintained = true;
    debug.info(
      "Session %s completed successfully. Score: %d, Streak maintained: %s",
      session.id,
      finalScore,
      streakMaintained,
    );
    return {
      success: true,
      status: "COMPLETED",
      summary,
      rewardsGranted: true,
      streakMaintained,
      recoveryAvailable: false,
    };
  }

  completePartial(
    session: SessionState,
    focusMetrics: FocusQualityMetrics,
    userStreak: number,
    reason: string,
    reflection?: string,
    mood?: "GREAT" | "GOOD" | "OKAY" | "STRUGGLING" | "DIFFICULT",
  ): CompletionResult {
    return executePartialCompletion(
      this.scoringEngine,
      session,
      focusMetrics,
      userStreak,
      reason,
      reflection,
      mood,
    );
  }

  abandonSession(session: SessionState, reason?: string): AbandonResult {
    const result = computeAbandonResult(this.scoringEngine, session, reason);
    debug.info(
      "Session %s abandoned (reason: %s). Damage: %d, Can recover: %s",
      session.id,
      reason || "none",
      result.damage.totalDamage,
      result.canRecover,
    );
    return result;
  }

  failSession(
    session: SessionState,
    error: string,
    canRecover: boolean = true,
  ): AbandonResult {
    const result = computeFailResult(
      this.scoringEngine,
      session,
      error,
      canRecover,
    );
    debug.info(
      "Session %s failed (error: %s). Damage: %d",
      session.id,
      error,
      result.damage.totalDamage,
    );
    return result;
  }

  attemptRecovery(
    session: SessionState,
    recoveryType: "USER_RESUME" | "STREAK_SAVE" | "PARTIAL_CREDIT",
    focusMetrics: FocusQualityMetrics,
    userStreak: number,
  ): CompletionResult {
    return attemptSessionRecovery(
      this.scoringEngine,
      session,
      recoveryType,
      focusMetrics,
      userStreak,
    );
  }

  validateCompletionEligibility(session: SessionState): CompletionEligibility {
    return validateEligibility(session);
  }

  calculateSessionStats(
    session: SessionState,
    focusMetrics: FocusQualityMetrics,
  ): SessionStatsResult {
    return computeCompletionStats(session, focusMetrics);
  }
}

export function createCompletionEngine(
  scoringEngine: ScoringEngine,
): CompletionEngine {
  return new CompletionEngine(scoringEngine);
}
