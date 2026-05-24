import { TimerEngine } from "./engines/TimerEngine";
import { ScoringEngine } from "./engines/ScoringEngine";
import { CompletionEngine } from "./engines/CompletionEngine";
import { AntiCheatEngine } from "./antiCheat/AntiCheatEngine";
import { SessionEventEmitter } from "./SessionEventEmitter";
import { getSessionRepository } from "./repository/SessionRepository";
import type {
  SessionState,
  SessionConfig,
  InterruptionType,
  InterruptionSeverity,
  InterruptionRecord,
  RecoveryRecord,
  FocusQualityMetrics,
  SessionSummary,
} from "./types";
import { v4 as uuidv4 } from "../utils/uuid";
import { createDebugger } from "../utils/debug";
import type { OrchestratorConfig } from "./orchestrator-types";
import * as persistence from "./SessionPersistence";
import {
  createSession,
  loadActiveSession,
  finalizeSession as doFinalizeSession,
  finalizeAbandonedSession as doFinalizeAbandonedSession,
  createEmptyFocusMetrics,
} from "./orchestrators/SessionCore";
import {
  startSession,
  pauseSession,
  resumeSession,
  backgroundSession,
  foregroundSession,
} from "./orchestrators/SessionLifecycle";
import {
  handleTimerTick as doHandleTimerTick,
  handleTimerWarning,
  startBreak,
  handleBreakTick,
  handleBreakComplete as doHandleBreakComplete,
  endBreak as doEndBreak,
} from "./orchestrators/SessionTimer";
import {
  completeSessionInternal,
  abandonSession,
} from "./orchestrators/SessionCompletion";
import {
  attemptRecovery,
  completeLastInterruption,
  recordInterruption,
  handleAntiCheatViolation,
  logInterruption,
  logRecovery,
} from "./orchestrators/SessionRecovery";
import {
  getTimerState,
  getRemainingSeconds,
  getElapsedSeconds,
  getPercentageComplete,
  isPaused,
  getCurrentPurityScore,
  getPurityLabel,
  getInterruptions,
  getRecoveries,
  applyStudyQuizBonus,
  updateFocusQuality,
  addDocument,
  removeDocument,
  getSessionHistory,
  getSessionStats,
} from "./orchestrators/SessionAccessors";

const debug = createDebugger("session:orchestrator");

export class SessionOrchestrator {
  session: SessionState | null = null;
  userId: string | null = null;
  timerEngine: TimerEngine | null = null;
  scoringEngine: ScoringEngine;
  completionEngine: CompletionEngine;
  antiCheatEngine: AntiCheatEngine;
  eventEmitter: SessionEventEmitter;
  repository = getSessionRepository();
  config: OrchestratorConfig;
  focusMetrics: FocusQualityMetrics;
  interruptions: InterruptionRecord[] = [];
  recoveries: RecoveryRecord[] = [];
  isActive: boolean = false;
  countdownActive: boolean = false;
  lastSessionSummary: SessionSummary | null = null;
  private _deviceFingerprint: string = "";

  constructor(config: OrchestratorConfig = {}) {
    this.config = {
      enableAntiCheat: true,
      enableAutoRecovery: true,
      enableBackgroundTracking: true,
      pauseOnBackground: true,
      pauseThreshold: 5000,
      ...config,
    };
    this.scoringEngine = new ScoringEngine();
    this.completionEngine = new CompletionEngine(this.scoringEngine);
    this.antiCheatEngine = new AntiCheatEngine();
    this.eventEmitter = new SessionEventEmitter();
    this.focusMetrics = createEmptyFocusMetrics();
    loadActiveSession(this);
    debug.info("SessionOrchestrator initialized");
  }

  getDeviceFingerprint(): string {
    if (!this._deviceFingerprint) this._deviceFingerprint = uuidv4();
    return this._deviceFingerprint;
  }

  getSession(): SessionState | null {
    return this.session ? { ...this.session } : null;
  }

  async saveSessionState(): Promise<void> {
    if (!this.session) return;
    await persistence.saveSessionState(this.session, this.repository);
  }

  finalizeSession(summary: SessionSummary): void {
    doFinalizeSession(this, summary);
  }

  finalizeAbandonedSession(): void {
    doFinalizeAbandonedSession(this);
  }

  // ═══ Public API ═══════════════════════════════════════════

  setUserId(id: string): void {
    this.userId = id;
    this.repository.setUserId(id);
    this.scoringEngine.setUserStats(0, 1);
    debug.info("SessionOrchestrator user set: %s", id);
  }

  createSession(config: SessionConfig): Promise<SessionState> {
    return createSession(this, config);
  }

  cancelStart(): void {
    if (this.countdownActive) {
      this.countdownActive = false;
      if (this.session) this.session.status = "PREPARING";
    }
  }

  // ── Lifecycle ────────────────────────────────────────────

  startSession(countdown: number = 0): Promise<SessionState> {
    return startSession(this, countdown);
  }

  pauseSession(reason?: string): Promise<SessionState> {
    return pauseSession(this, reason);
  }

  resumeSession(): Promise<SessionState> {
    return resumeSession(this);
  }

  backgroundSession(): Promise<void> {
    return backgroundSession(this);
  }

  foregroundSession(): Promise<void> {
    return foregroundSession(this);
  }

  // ── Timer handlers (called by TimerEngine) ───────────────

  handleTimerTick(elapsed: number, remaining: number, percentage: number): void {
    doHandleTimerTick(this, elapsed, remaining, percentage);
  }

  handleTimerWarning(sec: number): void {
    handleTimerWarning(this, sec);
  }

  async handleTimerComplete(): Promise<void> {
    if (!this.session) return;
    if ((this.session.currentInterval || 0) >= (this.session.totalIntervals || 0)) {
      await completeSessionInternal(this);
    } else {
      await startBreak(this);
    }
  }

  startBreak(): Promise<void> {
    return startBreak(this);
  }

  handleBreakTick(elapsed: number): void {
    handleBreakTick(this, elapsed);
  }

  handleBreakComplete(): Promise<void> {
    return doHandleBreakComplete(this);
  }

  endBreak(): void {
    doEndBreak(this);
  }

  // ── Completion ───────────────────────────────────────────

  async completeSession(): Promise<SessionSummary> {
    if (!this.session) throw new Error("No active session");
    await completeSessionInternal(this);
    if (!this.lastSessionSummary) throw new Error("No session summary");
    return this.lastSessionSummary;
  }

  async endSession(_reason?: string): Promise<SessionState> {
    if (!this.session) throw new Error("No active session");
    await completeSessionInternal(this);
    const s = this.getSession();
    if (!s) throw new Error("Failed to get session state");
    return s;
  }

  abandonSession(reason?: string): Promise<void> {
    return abandonSession(this, reason);
  }

  // ── Recovery ─────────────────────────────────────────────

  attemptRecovery(type: "USER_RESUME" | "STREAK_SAVE" | "PARTIAL_CREDIT"): Promise<boolean> {
    return attemptRecovery(this, type);
  }

  completeLastInterruption(duration: number): void {
    completeLastInterruption(this, duration);
  }

  recordInterruption(
    type: InterruptionType,
    severity: InterruptionSeverity = "MODERATE",
  ): void {
    recordInterruption(this, type, severity);
  }

  handleAntiCheatViolation(warning: string): void {
    handleAntiCheatViolation(this, warning);
  }

  logInterruption(type: string, data?: Record<string, unknown>): void {
    logInterruption(this, type, data);
  }

  logRecovery(type: string, data?: Record<string, unknown>): void {
    logRecovery(this, type, data);
  }

  // ── Accessors ────────────────────────────────────────────

  getActiveSession(): SessionState | null {
    debug.info("getActiveSession");
    return this.getSession();
  }

  getTimerState() { return getTimerState(this); }
  getRemainingSeconds() { return getRemainingSeconds(this); }
  getElapsedSeconds() { return getElapsedSeconds(this); }
  getPercentageComplete() { return getPercentageComplete(this); }
  isSessionActive(): boolean { return this.isActive; }
  isPaused(): boolean { return isPaused(this); }
  getCurrentPurityScore(): number { return getCurrentPurityScore(this); }
  getPurityLabel(): "Elite" | "Good" | "Okay" | "Distracted" { return getPurityLabel(this); }
  getInterruptions(): InterruptionRecord[] { return getInterruptions(this); }
  getRecoveries(): RecoveryRecord[] { return getRecoveries(this); }

  applyStudyQuizBonus(correct: number): void {
    applyStudyQuizBonus(this, correct);
  }

  updateFocusQuality(quality: number): void {
    updateFocusQuality(this, quality);
  }

  addDocument(docId: string): void {
    addDocument(this, docId);
  }

  removeDocument(docId: string): void {
    removeDocument(this, docId);
  }

  getSessionHistory(limit: number = 10): Promise<SessionState[]> {
    return getSessionHistory(this, limit);
  }

  getSessionStats() {
    return getSessionStats(this);
  }

  destroy(): void {
    this.timerEngine?.destroy();
    this.antiCheatEngine.destroy();
    this.eventEmitter.detach();
    this.isActive = false;
    this.session = null;
    debug.info("SessionOrchestrator destroyed");
  }
}

let orchestratorInstance: SessionOrchestrator | null = null;

export function getSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  if (!orchestratorInstance) orchestratorInstance = new SessionOrchestrator(config);
  return orchestratorInstance;
}

export function createSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  return new SessionOrchestrator(config);
}
