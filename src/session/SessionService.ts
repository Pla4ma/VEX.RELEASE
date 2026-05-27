import { SessionOrchestrator, getSessionOrchestrator } from "./SessionOrchestrator";
import { getSessionRepository } from "./repository/SessionRepository";
import { getSessionEventEmitter } from "./SessionEventEmitter";
import { getRewardAdapter } from "./integration/RewardAdapter";
import { getPresetService } from "./presets";
import { SessionMode } from "./modes";
import type { SessionState, SessionConfig, SessionPreset, SessionSummary, SessionHistoryEntry } from "./types";
import type { SessionServiceOptions, SessionStatsResult, CreateCustomPresetInput } from "./session-service-types";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("session:service");

export type { SessionServiceOptions, SessionStatsResult, CreateCustomPresetInput };

export class SessionService {
  private userId: string | null = null;
  private orchestrator: SessionOrchestrator;
  private repository = getSessionRepository();
  private eventEmitter = getSessionEventEmitter();
  private rewardAdapter = getRewardAdapter();
  private presetService = getPresetService();
  private options: SessionServiceOptions;

  constructor(options: SessionServiceOptions = {}) {
    this.options = {
      autoSave: true,
      enableNotifications: true,
      enableAnalytics: true,
      enableAntiCheat: true,
      ...options,
    };
    this.orchestrator = getSessionOrchestrator({
      timerConfig: this.options.timerConfig,
      enableAntiCheat: this.options.enableAntiCheat,
    });
    debug.info("SessionService initialized");
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.orchestrator.setUserId(userId);
    this.repository.setUserId(userId);
    this.rewardAdapter.setUserId(userId);
    this.presetService.setUserId(userId);
    this.eventEmitter.attach("", userId);
    debug.info("SessionService user set: %s", userId);
  }

  async createSessionFromPreset(
    presetId: string,
    customizations?: Partial<SessionConfig>,
  ): Promise<SessionState> {
    const preset = this.presetService.getPresetById(presetId);
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`);
    }
    const config: SessionConfig = {
      presetId: preset.id,
      duration: preset.duration,
      breakDuration: preset.breakDuration,
      longBreakDuration: preset.longBreakDuration,
      intervals: preset.intervals,
      longBreakInterval: preset.longBreakInterval,
      soundEnabled: preset.soundEnabled,
      vibrationEnabled: preset.vibrationEnabled,
      dndEnabled: preset.dndEnabled,
      strictMode: preset.strictMode,
      autoStartBreaks: preset.autoStartBreaks,
      autoStartNextInterval: preset.autoStartNextInterval,
      category: preset.category,
      tags: preset.tags,
      difficultyLevel: "MEDIUM",
      adaptiveMode: false,
      focusScorePrimary: true,
      ...customizations,
      sessionMode: customizations?.sessionMode ?? SessionMode.FLOW,
    };
    return this.createCustomSession(config);
  }

  async createCustomSession(config: SessionConfig): Promise<SessionState> {
    if (!this.userId) {
      throw new Error("SessionService: No user set");
    }
    const activeSession = await this.getActiveSession();
    if (activeSession && this.isSessionActive()) {
      throw new Error("Cannot create new session: one is already active");
    }
    const session = await this.orchestrator.createSession(config);
    this.eventEmitter.attach(session.id, this.userId);
    this.eventEmitter.emitSessionCreated(config);
    if (this.options.enableAnalytics) {
      this.trackAnalytics("session_created", {
        duration: config.duration,
        intervals: config.intervals,
        category: config.category,
      });
    }
    return session;
  }

  async startSession(countdownSeconds: number = 0): Promise<void> {
    await this.orchestrator.startSession(countdownSeconds);
    if (this.options.enableAnalytics) {
      this.trackAnalytics("session_started", {});
    }
  }

  async pauseSession(reason?: string): Promise<void> {
    await this.orchestrator.pauseSession(reason);
    if (this.options.enableNotifications) {
      this.eventEmitter.emitNotification("SESSION_PAUSED", "Session Paused", reason || "Your session has been paused", "normal");
    }
  }

  async resumeSession(): Promise<void> {
    await this.orchestrator.resumeSession();
    if (this.options.enableNotifications) {
      this.eventEmitter.emitNotification("SESSION_RESUMED", "Session Resumed", "Your session is now active", "normal");
    }
  }

  abandonSession(reason?: string): Promise<void> { return this.orchestrator.abandonSession(reason); }
  backgroundSession(): Promise<void> { return this.orchestrator.backgroundSession(); }
  foregroundSession(): Promise<void> { return this.orchestrator.foregroundSession(); }
  applyStudyQuizBonus(correctAnswers: number): void { this.orchestrator.applyStudyQuizBonus(correctAnswers); }
  completeSession(): Promise<SessionSummary> { return this.orchestrator.completeSession(); }
  attemptRecovery(recoveryType: "USER_RESUME" | "STREAK_SAVE" | "PARTIAL_CREDIT"): Promise<boolean> { return this.orchestrator.attemptRecovery(recoveryType); }
  getCurrentSession(): SessionState | null { return this.orchestrator.getSession(); }
  getActiveSession(): Promise<SessionState | null> { return this.repository.getActiveSession(); }
  isSessionActive(): boolean { return this.orchestrator.isSessionActive(); }
  isSessionPaused(): boolean { return this.orchestrator.isPaused(); }
  getRemainingSeconds(): number { return this.orchestrator.getRemainingSeconds(); }
  getElapsedSeconds(): number { return this.orchestrator.getElapsedSeconds(); }
  getCompletionPercentage(): number { return this.orchestrator.getPercentageComplete(); }
  getCurrentPurityScore(): number { return this.orchestrator.getCurrentPurityScore(); }
  getPurityLabel(): "Elite" | "Good" | "Okay" | "Distracted" { return this.orchestrator.getPurityLabel(); }
  getSessionHistory(limit: number = 100): Promise<SessionHistoryEntry[]> { return this.repository.getSessionHistory(limit); }
  getSessionById(sessionId: string): Promise<SessionHistoryEntry | null> { return this.repository.getSessionById(sessionId); }
  getSessionSummary(sessionId: string): Promise<SessionSummary | null> { return this.repository.getSessionSummary(sessionId); }
  getAllSummaries(): Promise<SessionSummary[]> { return this.repository.getAllSummaries(); }
  getSessionStats(): Promise<SessionStatsResult> { return this.repository.getSessionStats(); }
  getAllPresets(): SessionPreset[] { return this.presetService.getAllPresets(); }
  getPresetById(presetId: string): SessionPreset | undefined { return this.presetService.getPresetById(presetId); }

  async createCustomPreset(config: CreateCustomPresetInput): Promise<SessionPreset> {
    return this.presetService.createCustomPreset(config);
  }

  async deletePreset(presetId: string): Promise<void> {
    return this.presetService.deletePreset(presetId);
  }

  private trackAnalytics(event: string, properties: Record<string, unknown>): void {
    if (!this.options.enableAnalytics || !this.userId) { return; }
    debug.debug("Analytics: %s %o", event, properties);
  }

  destroy(): void { this.orchestrator.destroy(); debug.info("SessionService destroyed"); }
}

export function createSessionService(options?: SessionServiceOptions): SessionService {
  return new SessionService(options);
}

let serviceInstance: SessionService | null = null;
export function getSessionService(options?: SessionServiceOptions): SessionService {
  if (!serviceInstance) { serviceInstance = new SessionService(options); }
  return serviceInstance;
}
