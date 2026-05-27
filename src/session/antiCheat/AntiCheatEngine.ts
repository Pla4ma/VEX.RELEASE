import { createDebugger } from "../../utils/debug";
import { THRESHOLDS, PURITY_SCORING, FLAG_CRITICAL_THRESHOLD } from "./AntiCheatConfig";
import type { AntiCheatFlag } from "../types";
import type { SessionValidationInput, TickValidationResult, DeviceChangeResult, ActionResult, TickRecord, PurityLabel, SeverityLevel, EngineStatus } from "./anti-cheat-types";
export type { SessionValidationInput, TickValidationResult, DeviceChangeResult, ActionResult, TickRecord, PurityLabel, SeverityLevel, EngineStatus } from "./anti-cheat-types";

const debug = createDebugger("session:anticheat");

export class AntiCheatEngine {
  private flags: AntiCheatFlag[] = [];
  private sessionId: string | null = null;
  private tickHistory: TickRecord[] = [];
  private lastTickTime = 0;
  private deviceFingerprint: string | null = null;
  private backgroundSwitches = 0;
  private manualPauses = 0;
  private suspendedCount = 0;
  private uninterruptedFocusAccumulatedMs = 0;
  private uninterruptedFocusStartedAt: number | null = null;

  initialize(sessionId: string, deviceFingerprint: string): void {
    this.sessionId = sessionId; this.deviceFingerprint = deviceFingerprint;
    this.flags = []; this.tickHistory = []; this.lastTickTime = 0;
    this.backgroundSwitches = 0; this.manualPauses = 0; this.suspendedCount = 0;
    this.uninterruptedFocusAccumulatedMs = 0; this.uninterruptedFocusStartedAt = null;
    debug.info("AntiCheatEngine initialized for session %s", sessionId);
  }

  validateTick(elapsed: number, timestamp: number): TickValidationResult {
    if (!this.sessionId) return { valid: false, warning: "Engine not initialized" };
    if (!this.uninterruptedFocusStartedAt) this.uninterruptedFocusStartedAt = timestamp;
    if (this.lastTickTime > 0) {
      const timeSinceLastTick = timestamp - this.lastTickTime;
      if (timeSinceLastTick < 0) {
        this.flagViolation("TIME_MANIPULATION", "CRITICAL", { reason: "Negative time delta", lastTick: this.lastTickTime, currentTick: timestamp, delta: timeSinceLastTick });
        return { valid: false, warning: "Time manipulation detected" };
      }
      if (timeSinceLastTick < THRESHOLDS.MIN_TICK_INTERVAL) {
        this.flagViolation("TIME_MANIPULATION", "WARNING", { reason: "Tick interval too short", expected: THRESHOLDS.MIN_TICK_INTERVAL, actual: timeSinceLastTick });
        return { valid: false, warning: "Suspicious tick timing" };
      }
      if (timeSinceLastTick > THRESHOLDS.MAX_TICK_INTERVAL * 2 && timeSinceLastTick > THRESHOLDS.MAX_TIME_JUMP) {
        this.flagViolation("TIME_MANIPULATION", "MODERATE", { reason: "Large time gap between ticks", gap: timeSinceLastTick });
      }
    }
    if (this.tickHistory.length > 0) {
      const lastElapsed = this.tickHistory[this.tickHistory.length - 1]!.elapsed;
      const elapsedDelta = elapsed - lastElapsed;
      if (elapsedDelta < 0) {
        this.flagViolation("TIME_MANIPULATION", "CRITICAL", { reason: "Elapsed time decreased", previous: lastElapsed, current: elapsed });
        return { valid: false, warning: "Time regression detected" };
      }
      if (elapsedDelta > THRESHOLDS.MAX_TIME_JUMP) {
        this.flagViolation("TIME_MANIPULATION", "MODERATE", { reason: "Elapsed time jumped too far", delta: elapsedDelta });
      }
    }
    this.tickHistory.push({ timestamp, elapsed }); this.lastTickTime = timestamp;
    if (this.tickHistory.length > THRESHOLDS.MAX_TICK_HISTORY) this.tickHistory = this.tickHistory.slice(-THRESHOLDS.MAX_TICK_HISTORY_TRIM);
    return { valid: true };
  }

  recordManualPause(): void { this.manualPauses++; this.endCurrentFocusSegment(Date.now()); }
  recordBackgroundSwitch(): void { this.backgroundSwitches++; this.endCurrentFocusSegment(Date.now()); }
  recordSuspension(durationMs: number): void { if (durationMs > THRESHOLDS.MAX_SUSPENSION_MS) { this.suspendedCount = 1; this.endCurrentFocusSegment(Date.now()); } }

  getCurrentPurityScore(): number {
    const uninterruptedFocusMs = this.uninterruptedFocusAccumulatedMs + (this.uninterruptedFocusStartedAt ? Math.max(0, Date.now() - this.uninterruptedFocusStartedAt) : 0);
    const uninterruptedBonus = Math.floor(uninterruptedFocusMs / 60000) * PURITY_SCORING.UNINTERRUPTED_BONUS_PER_MINUTE;
    const score = PURITY_SCORING.MAX_SCORE - this.backgroundSwitches * PURITY_SCORING.BACKGROUND_SWITCH_PENALTY - this.manualPauses * PURITY_SCORING.MANUAL_PAUSE_PENALTY - (this.suspendedCount > 0 ? PURITY_SCORING.SUSPENSION_PENALTY : 0) + uninterruptedBonus;
    return Math.max(PURITY_SCORING.MIN_SCORE, Math.min(PURITY_SCORING.MAX_SCORE, score));
  }

  getPurityLabel(): PurityLabel {
    const score = this.getCurrentPurityScore();
    if (score >= PURITY_SCORING.ELITE_THRESHOLD) return "Elite";
    if (score >= PURITY_SCORING.GOOD_THRESHOLD) return "Good";
    if (score >= PURITY_SCORING.OKAY_THRESHOLD) return "Okay";
    return "Distracted";
  }

  validateSession(session: SessionValidationInput): { valid: boolean; flags: AntiCheatFlag[] } {
    if (!this.sessionId) return { valid: false, flags: [] };
    if (session.endedAt && session.startedAt) {
      const realDuration = session.endedAt - session.startedAt;
      if (realDuration > THRESHOLDS.MAX_SESSION_DURATION) this.flagViolation("IMPOSSIBLE_DURATION", "CRITICAL", { duration: realDuration, maxAllowed: THRESHOLDS.MAX_SESSION_DURATION });
      if (realDuration < THRESHOLDS.MIN_SESSION_DURATION && session.completionPercentage > 50) this.flagViolation("RAPID_COMPLETION", "CRITICAL", { duration: realDuration, completion: session.completionPercentage });
      if (session.completionPercentage >= 100) {
        const speedRatio = (session.config.duration * 1000) / session.effectiveTime;
        if (speedRatio > THRESHOLDS.MAX_COMPLETION_SPEED) this.flagViolation("RAPID_COMPLETION", "MODERATE", { speedRatio, expectedDuration: session.config.duration * 1000, actualEffectiveTime: session.effectiveTime });
      }
    }
    const totalTime = (session.endedAt || Date.now()) - (session.startedAt || Date.now());
    const pauseRatio = totalTime > 0 ? session.pausedTime / totalTime : 0;
    if (pauseRatio > THRESHOLDS.MAX_PAUSE_RATIO && session.completionPercentage >= 90) {
      this.flagViolation("SUSPICIOUS_PATTERN", "WARNING", { reason: "High pause ratio with high completion", pauseRatio, completion: session.completionPercentage });
    }
    this.validateDataConsistency(session); this.validateTickPatterns();
    return { valid: this.getSeverity() !== "CRITICAL", flags: this.flags };
  }

  private validateDataConsistency(session: SessionValidationInput): void {
    const expectedTotal = session.elapsedTime + session.remainingTime;
    const actualTotal = session.config.duration * 1000;
    if (Math.abs(expectedTotal - actualTotal) > THRESHOLDS.TIME_ACCOUNTING_TOLERANCE_MS) {
      this.flagViolation("INCONSISTENT_DATA", "MODERATE", { reason: "Time accounting mismatch", expectedTotal, actualTotal, elapsed: session.elapsedTime, remaining: session.remainingTime });
    }
    if (session.intervalsCompleted > 0) {
      const expectedTimeFromIntervals = session.intervalsCompleted * session.config.duration * 1000;
      if (Math.abs(session.effectiveTime - expectedTimeFromIntervals) > session.config.duration * 1000 * THRESHOLDS.INTERVAL_TIME_DISCREPANCY_RATIO) {
        this.flagViolation("INCONSISTENT_DATA", "WARNING", { reason: "Interval count mismatch", intervals: session.intervalsCompleted, expectedTime: expectedTimeFromIntervals, actualTime: session.effectiveTime });
      }
    }
    if (session.pauses > 0 && session.pausedTime < THRESHOLDS.MIN_PAUSE_TIME_MS) {
      this.flagViolation("SUSPICIOUS_PATTERN", "WARNING", { reason: "Multiple pauses with minimal pause time", pauses: session.pauses, pausedTime: session.pausedTime });
    }
  }

  private validateTickPatterns(): void {
    if (this.tickHistory.length < THRESHOLDS.MIN_TICK_PATTERN_SAMPLE) return;
    const intervals: number[] = [];
    for (let i = 1; i < this.tickHistory.length; i++) intervals.push(this.tickHistory[i]!.timestamp - this.tickHistory[i - 1]!.timestamp);
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;
    const cv = variance / mean;
    if (cv < THRESHOLDS.MIN_FOCUS_VARIANCE && intervals.length > THRESHOLDS.VARIANCE_SAMPLE_THRESHOLD) {
      this.flagViolation("AUTOMATION_DETECTED", "CRITICAL", { reason: "Tick intervals too consistent", coefficientOfVariation: cv, sampleSize: intervals.length });
    }
  }

  validateDeviceChange(newFingerprint: string): DeviceChangeResult {
    if (!this.deviceFingerprint) return { valid: true, changed: false };
    if (newFingerprint !== this.deviceFingerprint) {
      this.flagViolation("DEVICE_CHANGE", "WARNING", { previousDevice: this.deviceFingerprint, newDevice: newFingerprint });
      return { valid: true, changed: true };
    }
    return { valid: true, changed: false };
  }

  private flagViolation(type: AntiCheatFlag["type"], severity: AntiCheatFlag["severity"], evidence: Record<string, unknown>): void {
    if (!this.sessionId) return;
    this.flags.push({ id: `flag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, sessionId: this.sessionId, type, severity, detectedAt: Date.now(), evidence, actionTaken: "NONE" });
    debug.warn("Anti-cheat flag: %s (%s)", type, severity);
  }

  getFlags(): AntiCheatFlag[] { return [...this.flags]; }
  getSeverity(): SeverityLevel {
    if (this.flags.length === 0) return "CLEAN";
    if (this.flags.some((f) => f.severity === "CRITICAL")) return "CRITICAL";
    if (this.flags.some((f) => f.severity === "MODERATE")) return "MODERATE";
    if (this.flags.some((f) => f.severity === "WARNING")) return "WARNING";
    return "CLEAN";
  }
  getStatus(): EngineStatus {
    const severity = this.getSeverity();
    if (severity === "CLEAN") return "CLEAN"; if (severity === "WARNING") return "WARNING";
    if (severity === "MODERATE") return "FLAGGED";
    return this.flags.length > FLAG_CRITICAL_THRESHOLD ? "INVALIDATED" : "FAILED";
  }
  takeAction(): ActionResult {
    switch (this.getStatus()) {
      case "FAILED": return { action: "SESSION_INVALIDATED", scoreReduction: 1, shouldInvalidate: true };
      case "FLAGGED": return { action: "SCORE_REDUCED", scoreReduction: 0.3, shouldInvalidate: false };
      case "WARNING": return { action: "FLAGGED", scoreReduction: 0.05, shouldInvalidate: false };
      default: return { action: "NONE", scoreReduction: 0, shouldInvalidate: false };
    }
  }

  flagDeviceChange(oldHash: string, newHash: string): void {
    if (!this.sessionId) return;
    this.flagViolation("DEVICE_CHANGE", "WARNING", { reason: "Device fingerprint changed during session", oldHash, newHash });
  }
  applyActions(): void { const action = this.takeAction(); this.flags = this.flags.map((flag) => ({ ...flag, actionTaken: action.action })); }
  reset(): void {
    this.flags = []; this.tickHistory = []; this.lastTickTime = 0;
    this.backgroundSwitches = 0; this.manualPauses = 0; this.suspendedCount = 0;
    this.uninterruptedFocusAccumulatedMs = 0; this.uninterruptedFocusStartedAt = null;
  }
  destroy(): void { this.reset(); this.sessionId = null; this.deviceFingerprint = null; }

  private endCurrentFocusSegment(timestamp: number): void {
    if (!this.uninterruptedFocusStartedAt) return;
    this.uninterruptedFocusAccumulatedMs += Math.max(0, timestamp - this.uninterruptedFocusStartedAt);
    this.uninterruptedFocusStartedAt = null;
  }
}

export function createAntiCheatEngine(): AntiCheatEngine { return new AntiCheatEngine(); }
