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
    this.config = { enableAntiCheat: true, enableAutoRecovery: true, enableBackgroundTracking: true, pauseOnBackground: true, pauseThreshold: 5000, ...config };
    this.scoringEngine = new ScoringEngine(); this.completionEngine = new CompletionEngine(this.scoringEngine);
    this.antiCheatEngine = new AntiCheatEngine(); this.eventEmitter = new SessionEventEmitter();
    this.focusMetrics = createEmptyFocusMetrics(); loadActiveSession(this);
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

  finalizeSession = (summary: SessionSummary) => { doFinalizeSession(this, summary); };
  finalizeAbandonedSession = () => { doFinalizeAbandonedSession(this); };

  // ═══ Public API ═══════════════════════════════════════════

  setUserId(id: string): void { this.userId = id; this.repository.setUserId(id); this.scoringEngine.setUserStats(0, 1); debug.info("SessionOrchestrator user set: %s", id); }
  createSession = (config: SessionConfig) => createSession(this, config);

  cancelStart(): void { if (this.countdownActive) { this.countdownActive = false; if (this.session) this.session.status = "PREPARING"; } }

  // ── Lifecycle ────────────────────────────────────────────

  startSession = (cd: number = 0) => startSession(this, cd);
  pauseSession = (r?: string) => pauseSession(this, r);
  resumeSession = () => resumeSession(this);
  backgroundSession = () => backgroundSession(this);
  foregroundSession = () => foregroundSession(this);

  // ── Timer handlers (called by TimerEngine) ───────────────

  handleTimerTick(elapsed: number, remaining: number, percentage: number): void {
    doHandleTimerTick(this, elapsed, remaining, percentage);
  }

  handleTimerWarning(sec: number): void { handleTimerWarning(this, sec); }

  handleTimerComplete: () => Promise<void> = async () => {
    if (!this.session) return;
    if ((this.session.currentInterval || 0) >= (this.session.totalIntervals || 0)) {
      await completeSessionInternal(this);
    } else {
      await startBreak(this);
    }
  };

  startBreak = () => startBreak(this);

  handleBreakTick(elapsed: number, ..._r: unknown[]): void { handleBreakTick(this, elapsed); }

  handleBreakComplete = () => doHandleBreakComplete(this);
  endBreak = () => { doEndBreak(this); };

  // ── Completion ───────────────────────────────────────────

  async completeSession(): Promise<SessionSummary> {
    if (!this.session) throw new Error("No active session");
    await completeSessionInternal(this);
    if (!this.lastSessionSummary) throw new Error("No session summary");
    return this.lastSessionSummary;
  }

  endSession = async (_reason?: string): Promise<SessionState> => {
    if (!this.session) throw new Error("No active session");
    await completeSessionInternal(this);
    const s = this.getSession();
    if (!s) throw new Error("Failed to get session state");
    return s;
  };

  abandonSession = (r?: string) => abandonSession(this, r);

  // ── Recovery ─────────────────────────────────────────────

  attemptRecovery = (t: "USER_RESUME" | "STREAK_SAVE" | "PARTIAL_CREDIT") => attemptRecovery(this, t);
  completeLastInterruption = (d: number) => completeLastInterruption(this, d);
  recordInterruption = (type: InterruptionType, sev: InterruptionSeverity = "MODERATE") => recordInterruption(this, type, sev);
  handleAntiCheatViolationOrigin = (w: string) => { handleAntiCheatViolation(this, w); };
  handleAntiCheatViolation(w: string): void { handleAntiCheatViolation(this, w); }
  logInterruption = (t: string, d?: Record<string, unknown>) => { logInterruption(this, t, d); };
  logRecovery = (t: string, d?: Record<string, unknown>) => { logRecovery(this, t, d); };

  // ── Accessors ────────────────────────────────────────────

  getSessionState = this.getSession;
  getActiveSession = (): SessionState | null => { debug.info("getActiveSession"); return this.getSession(); };
  getTimerState = () => getTimerState(this);
  getRemainingSeconds = () => getRemainingSeconds(this);
  getElapsedSeconds = () => getElapsedSeconds(this);
  getPercentageComplete = () => getPercentageComplete(this);
  isSessionActive = () => this.isActive;
  isPaused = () => isPaused(this);
  getCurrentPurityScore = () => getCurrentPurityScore(this);
  getPurityLabel = () => getPurityLabel(this);
  getInterruptions = () => getInterruptions(this);
  getRecoveries = () => getRecoveries(this);
  applyStudyQuizBonus = (n: number) => { applyStudyQuizBonus(this, n); };
  updateFocusQuality = (q: number) => { updateFocusQuality(this, q); };
  addDocument = (id: string) => { addDocument(this, id); };
  removeDocument = (id: string) => { removeDocument(this, id); };
  getSessionHistory = (l: number = 10) => getSessionHistory(this, l);
  getSessionStats = () => getSessionStats(this);

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
