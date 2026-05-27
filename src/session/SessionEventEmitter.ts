import { eventBus } from "../events";
import type { SessionEventChannels, SessionEventChannel } from "./types/events";
import type {
  SessionSummary,
  InterruptionRecord,
  RecoveryRecord,
  AntiCheatFlag,
  SessionState,
} from "./types";
import type {
  InterruptionRiskLevel,
  ConflictResolution,
  NotificationPriority,
  SessionRewards,
  Payload,
  PartialPayload,
} from "./session-event-emitter-types";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("session:events");

export { InterruptionRiskLevel, ConflictResolution, NotificationPriority, SessionRewards, Payload, PartialPayload };

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

  private emit<E extends SessionEventChannel>(
    channel: E,
    payload: PartialPayload<E>
  ): void {
    if (!this.sessionId) return;
    eventBus.publish(channel as never, {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      ...payload,
    } as never);
  }

  emitSessionCreated(config: Payload<"session:created">["config"]): void {
    this.emit("session:created", { config });
    debug.debug("Session created event emitted: %s", this.sessionId);
  }
  emitSessionStarting(countdown: number): void { this.emit("session:starting", { countdown }); debug.debug("Session starting: %s (countdown: %d)", this.sessionId, countdown); }
  emitSessionStarted(phase: string): void { this.emit("session:started", { startedAt: Date.now(), phase }); debug.info("Session started: %s", this.sessionId); }
  emitSessionPaused(reason?: string): void { this.emit("session:paused", { pausedAt: Date.now(), reason }); debug.debug("Session paused: %s", this.sessionId); }
  emitSessionResumed(pausedDuration: number): void { this.emit("session:resumed", { resumedAt: Date.now(), pausedDuration }); debug.debug("Session resumed: %s", this.sessionId); }
  emitPhaseChanged(previousPhase: string, newPhase: string): void { this.emit("session:phase:changed", { previousPhase, newPhase }); debug.debug("Phase changed: %s -> %s", previousPhase, newPhase); }
  emitIntervalCompleted(interval: number, totalIntervals: number): void { this.emit("session:interval:completed", { interval, totalIntervals }); debug.debug("Interval completed: %d/%d", interval, totalIntervals); }
  emitSessionCompleting(completionPercentage: number): void { this.emit("session:completing", { completionPercentage }); debug.debug("Session completing: %s", this.sessionId); }
  emitSessionCompleted(summary: SessionSummary): void {
    this.emit("session:completed", { summary });
    debug.info("Session completed: %s, Score: %d", this.sessionId, summary.finalScore);
  }
  emitSessionPartial(summary: SessionSummary, partialReason: string): void {
    this.emit("session:partial", { summary, partialReason });
    debug.info("Session partial: %s, Completion: %d%%", this.sessionId, summary.completionPercentage);
  }
  emitSessionAbandoned(abandonedAt: number, reason?: string, elapsedTime: number = 0): void {
    this.emit("session:abandoned", { abandonedAt, reason, elapsedTime });
    debug.warn("Session abandoned: %s (reason: %s)", this.sessionId, reason || "none");
  }
  emitSessionFailed(error: string, canRecover: boolean = true): void {
    this.emit("session:failed", { error, canRecover });
    debug.error("Session failed: %s (error: %s)", this.sessionId, error);
  }
  emitTick(elapsed: number, remaining: number, percentage: number, phase: string): void {
    this.emit("session:tick", { elapsed, remaining, percentage, phase });
  }
  emitProgress(phase: string, interval: number, percentage: number, timeRemaining: number): void {
    this.emit("session:progress", { phase, interval, percentage, timeRemaining });
  }
  emitInterruption(interruption: InterruptionRecord): void {
    this.emit("session:interruption", { interruption });
    debug.warn("Interruption: %s (type: %s)", this.sessionId, interruption.type);
  }
  emitInterruptionRisk(riskLevel: InterruptionRiskLevel, timeUntilRisk: number): void { this.emit("session:interruption:risk", { riskLevel, timeUntilRisk }); debug.debug("Interruption risk: %s", this.sessionId); }
  emitBackgrounded(backgroundedAt: number): void { this.emit("session:backgrounded", { backgroundedAt }); debug.debug("Session backgrounded: %s", this.sessionId); }
  emitForegrounded(foregroundedAt: number, duration: number): void { this.emit("session:foregrounded", { foregroundedAt, duration }); debug.debug("Session foregrounded: %s", this.sessionId); }
  emitRecoveryAttempted(recovery: RecoveryRecord): void {
    this.emit("session:recovery:attempted", { recovery });
    debug.info("Recovery attempted: %s", this.sessionId);
  }
  emitRecoverySuccessful(recoveredAt: number, recoveredTime: number): void { this.emit("session:recovery:successful", { recoveredAt, recoveredTime }); debug.info("Recovery successful: %s", this.sessionId); }
  emitRecoveryFailed(failedAt: number, reason: string): void { this.emit("session:recovery:failed", { failedAt, reason }); debug.error("Recovery failed: %s (reason: %s)", this.sessionId, reason); }
  emitScoreUpdated(score: number, previousScore: number, reason: string): void { this.emit("session:score:updated", { score, previousScore, reason }); debug.debug("Score updated: %s (%d -> %d)", this.sessionId, previousScore, score); }
  emitBonusEarned(type: string, amount: number, description: string): void { this.emit("session:bonus:earned", { type, amount, description }); debug.info("Bonus earned: %s (%s: %d)", this.sessionId, type, amount); }
  emitDamageTaken(amount: number, reason: string, remainingHealth?: number): void { this.emit("session:damage:taken", { amount, reason, remainingHealth }); debug.warn("Damage taken: %s (%d)", this.sessionId, amount); }
  emitAntiCheatFlag(flag: AntiCheatFlag): void {
    this.emit("session:anticheat:flag", { flag });
    debug.error("Anti-cheat flag: %s (%s)", this.sessionId, flag.severity);
  }
  emitAntiCheatCleared(clearedAt: number): void { this.emit("session:anticheat:cleared", { clearedAt }); debug.info("Anti-cheat cleared: %s", this.sessionId); }
  emitSyncStarted(): void { this.emit("session:sync:started", {}); debug.debug("Sync started: %s", this.sessionId); }
  emitSyncCompleted(): void { this.emit("session:sync:completed", {}); debug.debug("Sync completed: %s", this.sessionId); }
  emitSyncFailed(error: string, willRetry: boolean): void { this.emit("session:sync:failed", { error, willRetry }); debug.error("Sync failed: %s (error: %s)", this.sessionId, error); }
  emitConflictDetected(localState: SessionState, remoteState: SessionState): void { this.emit("session:conflict:detected", { localState, remoteState }); debug.warn("Conflict detected: %s", this.sessionId); }
  emitConflictResolved(resolution: ConflictResolution): void { this.emit("session:conflict:resolved", { resolution }); debug.info("Conflict resolved: %s (result: %s)", this.sessionId, resolution); }
  emitStreakMaintained(streakDays: number): void { this.emit("session:streak:maintained", { streakDays }); debug.info("Streak maintained: %s (%d days)", this.sessionId, streakDays); }
  emitStreakBroken(previousStreak: number): void { this.emit("session:streak:broken", { previousStreak }); debug.warn("Streak broken: %s (was %d days)", this.sessionId, previousStreak); }
  emitStreakProtected(protectionType: string): void { this.emit("session:streak:protected", { protectionType }); debug.info("Streak protected: %s (type: %s)", this.sessionId, protectionType); }
  emitRewardsCalculated(rewards: SessionRewards): void { this.emit("session:rewards:calculated", { rewards }); debug.info("Rewards calculated: %s", this.sessionId); }
  emitRewardsGranted(rewards: unknown): void { this.emit("session:rewards:granted", { rewards }); debug.info("Rewards granted: %s", this.sessionId); }
  emitNotification(
    type: string,
    title: string,
    body: string,
    priority: NotificationPriority = "normal",
    data?: Record<string, unknown>,
  ): void {
    if (!this.sessionId) return;
    eventBus.publish("session:notification", {
      sessionId: this.sessionId,
      type, title, body, priority, data,
    });
    debug.debug("Notification: %s (%s)", this.sessionId, type);
  }
  emitAnalyticsMilestone(milestone: string, value: number): void { this.emit("session:analytics:milestone", { milestone, value }); debug.debug("Analytics milestone: %s (%s: %d)", this.sessionId, milestone, value); }
  emitAnalyticsEngagement(metric: string, value: number): void { this.emit("session:analytics:engagement", { metric, value }); debug.debug("Analytics engagement: %s (%s: %d)", this.sessionId, metric, value); }
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
