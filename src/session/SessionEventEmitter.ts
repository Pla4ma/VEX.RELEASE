import { eventBus } from "../events";
import type { SessionEventPayload } from "./types/events";
import type {
  SessionState,
  SessionSummary,
  InterruptionRecord,
  RecoveryRecord,
  AntiCheatFlag,
} from "./types";
import { createDebugger } from "../utils/debug";
const debug = createDebugger("session:events");
export class SessionEventEmitter {
  private sessionId: string | null = null;
  private userId: string | null = null;
  attach(sessionId: string, userId: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    debug.debug("SessionEventEmitter attached to session %s", sessionId);
  }
  detach(): void {
    this.sessionId = null;
    this.userId = null;
    debug.debug("SessionEventEmitter detached");
  }
  emitSessionCreated(
    config: SessionEventPayload<"session:created">["config"],
  ): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:created", {
      sessionId: this.sessionId,
      userId: this.userId,
      config,
      timestamp: Date.now(),
    });
    debug.debug("Session created event emitted: %s", this.sessionId);
  }
  emitSessionStarting(countdown: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:starting", {
      sessionId: this.sessionId,
      countdown,
      timestamp: Date.now(),
    });
    debug.debug(
      "Session starting event emitted: %s (countdown: %d)",
      this.sessionId,
      countdown,
    );
  }
  emitSessionStarted(phase: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:started", {
      sessionId: this.sessionId,
      startedAt: Date.now(),
      phase,
    });
    debug.info("Session started event emitted: %s", this.sessionId);
  }
  emitSessionPaused(reason?: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:paused", {
      sessionId: this.sessionId,
      userId: this.userId,
      pausedAt: Date.now(),
      reason,
    });
    debug.debug("Session paused event emitted: %s", this.sessionId);
  }
  emitSessionResumed(pausedDuration: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:resumed", {
      sessionId: this.sessionId,
      userId: this.userId,
      resumedAt: Date.now(),
      pausedDuration,
    });
    debug.debug(
      "Session resumed event emitted: %s (paused for %dms)",
      this.sessionId,
      pausedDuration,
    );
  }
  emitPhaseChanged(previousPhase: string, newPhase: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:phase:changed", {
      sessionId: this.sessionId,
      previousPhase,
      newPhase,
      timestamp: Date.now(),
    });
    debug.debug(
      "Phase changed event emitted: %s -> %s",
      previousPhase,
      newPhase,
    );
  }
  emitIntervalCompleted(interval: number, totalIntervals: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:interval:completed", {
      sessionId: this.sessionId,
      interval,
      totalIntervals,
      timestamp: Date.now(),
    });
    debug.debug(
      "Interval completed event emitted: %d/%d",
      interval,
      totalIntervals,
    );
  }
  emitSessionCompleting(completionPercentage: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:completing", {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      completionPercentage,
    });
    debug.debug("Session completing event emitted: %s", this.sessionId);
  }
  emitSessionCompleted(summary: SessionSummary): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:completed", {
      sessionId: this.sessionId,
      userId: this.userId,
      summary,
      timestamp: Date.now(),
      duration: summary.effectiveDuration,
    });
    debug.info(
      "Session completed event emitted: %s, Score: %d",
      this.sessionId,
      summary.finalScore,
    );
  }
  emitSessionPartial(summary: SessionSummary, partialReason: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:partial", {
      sessionId: this.sessionId,
      userId: this.userId,
      summary,
      timestamp: Date.now(),
      partialReason,
    });
    debug.info(
      "Session partial event emitted: %s, Completion: %d%%",
      this.sessionId,
      summary.completionPercentage,
    );
  }
  emitSessionAbandoned(
    abandonedAt: number,
    reason?: string,
    elapsedTime: number = 0,
  ): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:abandoned", {
      sessionId: this.sessionId,
      userId: this.userId,
      abandonedAt,
      reason,
      elapsedTime,
    });
    debug.warn(
      "Session abandoned event emitted: %s (reason: %s)",
      this.sessionId,
      reason || "none",
    );
  }
  emitSessionFailed(error: string, canRecover: boolean = true): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:failed", {
      sessionId: this.sessionId,
      userId: this.userId,
      error,
      timestamp: Date.now(),
      canRecover,
    });
    debug.error(
      "Session failed event emitted: %s (error: %s)",
      new Error(error),
      this.sessionId,
    );
  }
  emitTick(
    elapsed: number,
    remaining: number,
    percentage: number,
    phase: string,
  ): void {
    if (!this.sessionId) {
      return;
    }
    eventBus.publish("session:tick", {
      sessionId: this.sessionId,
      elapsed,
      remaining,
      percentage,
      phase,
    });
  }
  emitProgress(
    phase: string,
    interval: number,
    percentage: number,
    timeRemaining: number,
  ): void {
    if (!this.sessionId) {
      return;
    }
    eventBus.publish("session:progress", {
      sessionId: this.sessionId,
      phase,
      interval,
      percentage,
      timeRemaining,
    });
  }
  emitInterruption(interruption: InterruptionRecord): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:interruption", {
      sessionId: this.sessionId,
      interruption,
      userId: this.userId,
    });
    debug.warn(
      "Interruption event emitted: %s (type: %s)",
      this.sessionId,
      interruption.type,
    );
  }
  emitInterruptionRisk(
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    timeUntilRisk: number,
  ): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:interruption:risk", {
      sessionId: this.sessionId,
      riskLevel,
      timeUntilRisk,
      userId: this.userId,
    });
    debug.debug(
      "Interruption risk event emitted: %s (%s, %dms until risk)",
      this.sessionId,
      riskLevel,
      timeUntilRisk,
    );
  }
  emitBackgrounded(backgroundedAt: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:backgrounded", {
      sessionId: this.sessionId,
      userId: this.userId,
      backgroundedAt,
    });
    debug.debug("Session backgrounded event emitted: %s", this.sessionId);
  }
  emitForegrounded(foregroundedAt: number, duration: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:foregrounded", {
      sessionId: this.sessionId,
      userId: this.userId,
      foregroundedAt,
      duration,
    });
    debug.debug(
      "Session foregrounded event emitted: %s (duration: %dms)",
      this.sessionId,
      duration,
    );
  }
  emitRecoveryAttempted(recovery: RecoveryRecord): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:recovery:attempted", {
      sessionId: this.sessionId,
      recovery,
      userId: this.userId,
    });
    debug.info(
      "Recovery attempted event emitted: %s (type: %s, success: %s)",
      this.sessionId,
      recovery.type,
      recovery.success,
    );
  }
  emitRecoverySuccessful(recoveredAt: number, recoveredTime: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:recovery:successful", {
      sessionId: this.sessionId,
      userId: this.userId,
      recoveredAt,
      recoveredTime,
    });
    debug.info("Recovery successful event emitted: %s", this.sessionId);
  }
  emitRecoveryFailed(failedAt: number, reason: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:recovery:failed", {
      sessionId: this.sessionId,
      userId: this.userId,
      failedAt,
      reason,
    });
    debug.error(
      "Recovery failed event emitted: %s (reason: %s)",
      new Error(reason),
      this.sessionId,
    );
  }
  emitScoreUpdated(score: number, previousScore: number, reason: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:score:updated", {
      sessionId: this.sessionId,
      userId: this.userId,
      score,
      previousScore,
      reason,
    });
    debug.debug(
      "Score updated event emitted: %s (%d -> %d, reason: %s)",
      this.sessionId,
      previousScore,
      score,
      reason,
    );
  }
  emitBonusEarned(type: string, amount: number, description: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:bonus:earned", {
      sessionId: this.sessionId,
      userId: this.userId,
      type,
      amount,
      description,
    });
    debug.info(
      "Bonus earned event emitted: %s (%s: %d)",
      this.sessionId,
      type,
      amount,
    );
  }
  emitDamageTaken(
    amount: number,
    reason: string,
    remainingHealth?: number,
  ): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:damage:taken", {
      sessionId: this.sessionId,
      userId: this.userId,
      amount,
      reason,
      remainingHealth,
    });
    debug.warn(
      "Damage taken event emitted: %s (%d, reason: %s)",
      this.sessionId,
      amount,
      reason,
    );
  }
  emitAntiCheatFlag(flag: AntiCheatFlag): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:anticheat:flag", {
      sessionId: this.sessionId,
      userId: this.userId,
      flag,
    });
    debug.error(
      "Anti-cheat flag event emitted: %s (%s: %s)",
      new Error(`AntiCheat ${flag.type}`),
      this.sessionId,
      flag.severity,
    );
  }
  emitAntiCheatCleared(clearedAt: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:anticheat:cleared", {
      sessionId: this.sessionId,
      userId: this.userId,
      clearedAt,
    });
    debug.info("Anti-cheat cleared event emitted: %s", this.sessionId);
  }
  emitSyncStarted(): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:sync:started", {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
    });
    debug.debug("Sync started event emitted: %s", this.sessionId);
  }
  emitSyncCompleted(): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:sync:completed", {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
    });
    debug.debug("Sync completed event emitted: %s", this.sessionId);
  }
  emitSyncFailed(error: string, willRetry: boolean): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:sync:failed", {
      sessionId: this.sessionId,
      userId: this.userId,
      error,
      timestamp: Date.now(),
      willRetry,
    });
    debug.error(
      "Sync failed event emitted: %s (error: %s, retry: %s)",
      new Error(error),
      this.sessionId,
      willRetry,
    );
  }
  emitConflictDetected(
    localState: SessionState,
    remoteState: SessionState,
  ): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:conflict:detected", {
      sessionId: this.sessionId,
      userId: this.userId,
      localState,
      remoteState,
    });
    debug.warn("Conflict detected event emitted: %s", this.sessionId);
  }
  emitConflictResolved(resolution: "LOCAL" | "REMOTE" | "MERGED"): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:conflict:resolved", {
      sessionId: this.sessionId,
      userId: this.userId,
      resolution,
      timestamp: Date.now(),
    });
    debug.info(
      "Conflict resolved event emitted: %s (resolution: %s)",
      this.sessionId,
      resolution,
    );
  }
  emitStreakMaintained(streakDays: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:streak:maintained", {
      sessionId: this.sessionId,
      userId: this.userId,
      streakDays,
      timestamp: Date.now(),
    });
    debug.info(
      "Streak maintained event emitted: %s (%d days)",
      this.sessionId,
      streakDays,
    );
  }
  emitStreakBroken(previousStreak: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:streak:broken", {
      sessionId: this.sessionId,
      userId: this.userId,
      previousStreak,
      timestamp: Date.now(),
    });
    debug.warn(
      "Streak broken event emitted: %s (was %d days)",
      this.sessionId,
      previousStreak,
    );
  }
  emitStreakProtected(protectionType: string): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:streak:protected", {
      sessionId: this.sessionId,
      userId: this.userId,
      protectionType,
      timestamp: Date.now(),
    });
    debug.info(
      "Streak protected event emitted: %s (type: %s)",
      this.sessionId,
      protectionType,
    );
  }
  emitRewardsCalculated(rewards: {
    xp: number;
    coins: number;
    gems: number;
    bonuses: string[];
  }): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:rewards:calculated", {
      sessionId: this.sessionId,
      userId: this.userId,
      rewards,
      timestamp: Date.now(),
    });
    debug.info("Rewards calculated event emitted: %s", this.sessionId);
  }
  emitRewardsGranted(rewards: unknown): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:rewards:granted", {
      sessionId: this.sessionId,
      userId: this.userId,
      rewards,
      timestamp: Date.now(),
    });
    debug.info("Rewards granted event emitted: %s", this.sessionId);
  }
  emitNotification(
    type: string,
    title: string,
    body: string,
    priority: "low" | "normal" | "high" | "urgent" = "normal",
    data?: Record<string, unknown>,
  ): void {
    if (!this.sessionId) {
      return;
    }
    eventBus.publish("session:notification", {
      sessionId: this.sessionId,
      type,
      title,
      body,
      priority,
      data,
    });
    debug.debug("Notification event emitted: %s (%s)", this.sessionId, type);
  }
  emitAnalyticsMilestone(milestone: string, value: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:analytics:milestone", {
      sessionId: this.sessionId,
      userId: this.userId,
      milestone,
      value,
      timestamp: Date.now(),
    });
    debug.debug(
      "Analytics milestone event emitted: %s (%s: %d)",
      this.sessionId,
      milestone,
      value,
    );
  }
  emitAnalyticsEngagement(metric: string, value: number): void {
    if (!this.sessionId || !this.userId) {
      return;
    }
    eventBus.publish("session:analytics:engagement", {
      sessionId: this.sessionId,
      userId: this.userId,
      metric,
      value,
      timestamp: Date.now(),
    });
    debug.debug(
      "Analytics engagement event emitted: %s (%s: %d)",
      this.sessionId,
      metric,
      value,
    );
  }
}
export function createSessionEventEmitter(): SessionEventEmitter {
  return new SessionEventEmitter();
}
let globalEmitter: SessionEventEmitter | null = null;
export function getSessionEventEmitter(): SessionEventEmitter {
  if (!globalEmitter) {
    globalEmitter = new SessionEventEmitter();
  }
  return globalEmitter;
}
