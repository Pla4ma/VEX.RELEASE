import type { SessionOrchestrator } from "./SessionOrchestrator";
import { TimerEngine } from "./engines/TimerEngine";
import { ScoringEngine } from "./engines/ScoringEngine";
import { CompletionEngine } from "./engines/CompletionEngine";
import { AntiCheatEngine } from "./antiCheat/AntiCheatEngine";
import { SessionEventEmitter } from "./SessionEventEmitter";
import { getSessionRepository } from "./repository/SessionRepository";
import type {
  SessionState,
  SessionConfig,
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

const debug = createDebugger("session:orchestrator");

export class SessionOrchestratorBase {
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
  interruptions: import("./types").InterruptionRecord[] = [];
  recoveries: import("./types").RecoveryRecord[] = [];
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
    loadActiveSession(this as unknown as SessionOrchestrator);
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
    if (this.session)
      await persistence.saveSessionState(this.session, this.repository);
  }
  finalizeSession(summary: SessionSummary): void {
    doFinalizeSession(this as unknown as SessionOrchestrator, summary);
  }
  finalizeAbandonedSession(): void {
    doFinalizeAbandonedSession(this as unknown as SessionOrchestrator);
  }

  setUserId(id: string): void {
    this.userId = id;
    this.repository.setUserId(id);
    this.scoringEngine.setUserStats(0, 1);
    debug.info("SessionOrchestrator user set: %s", id);
  }
  createSession(config: SessionConfig): Promise<SessionState> {
    return createSession(this as unknown as SessionOrchestrator, config);
  }
  cancelStart(): void {
    if (this.countdownActive) {
      this.countdownActive = false;
      if (this.session) this.session.status = "PREPARING";
    }
  }

  startSession(countdown = 0): Promise<SessionState> {
    return startSession(this as unknown as SessionOrchestrator, countdown);
  }
  pauseSession(reason?: string): Promise<SessionState> {
    return pauseSession(this as unknown as SessionOrchestrator, reason);
  }
  resumeSession(): Promise<SessionState> {
    return resumeSession(this as unknown as SessionOrchestrator);
  }
  backgroundSession(): Promise<void> {
    return backgroundSession(this as unknown as SessionOrchestrator);
  }
  foregroundSession(): Promise<void> {
    return foregroundSession(this as unknown as SessionOrchestrator);
  }
}