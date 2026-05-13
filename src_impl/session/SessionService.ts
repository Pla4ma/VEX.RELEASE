import type { SessionConfig, SessionHistoryEntry, SessionState, SessionSummary } from './types';
import { getSessionOrchestrator } from './SessionOrchestrator';
import { createCustomPreset, deletePreset, getAllPresets } from './presets';

export interface SessionServiceOptions {
  enableAnalytics?: boolean;
  enableNotifications?: boolean;
}

export class SessionService {
  private readonly orchestrator = getSessionOrchestrator();
  private userId: string | null = null;

  constructor(_options?: SessionServiceOptions) {}

  setUserId(userId: string): void {
    this.userId = userId;
    this.orchestrator.setUserId(userId);
  }

  async createCustomSession(config: SessionConfig): Promise<SessionState> {
    if (!this.userId) {
      throw new Error('SessionService: No user set');
    }
    if (this.orchestrator.isSessionActive()) {
      throw new Error('Cannot create new session: one is already active');
    }
    return this.orchestrator.createSession(config);
  }

  async startSession(countdownSeconds = 0): Promise<void> {
    await this.orchestrator.startSession(countdownSeconds);
  }

  async pauseSession(reason?: string): Promise<void> {
    await this.orchestrator.pauseSession(reason);
  }

  async resumeSession(): Promise<void> {
    await this.orchestrator.resumeSession();
  }

  async completeSession(): Promise<SessionSummary> {
    return this.orchestrator.completeSession();
  }

  async gracefulExit(reflection?: string, mood?: any): Promise<SessionSummary> {
    return this.orchestrator.gracefulExit(reflection, mood);
  }

  async abandonSession(reason?: string): Promise<void> {
    await this.orchestrator.abandonSession(reason);
  }

  getCurrentSession(): SessionState | null {
    return this.orchestrator.getSession();
  }

  isSessionActive(): boolean {
    return this.orchestrator.isSessionActive();
  }

  isSessionPaused(): boolean {
    return this.orchestrator.isPaused();
  }

  getRemainingSeconds(): number {
    return this.orchestrator.getRemainingSeconds();
  }

  getElapsedSeconds(): number {
    return this.orchestrator.getElapsedSeconds();
  }

  getCompletionPercentage(): number {
    return this.orchestrator.getPercentageComplete();
  }

  backgroundSession(): Promise<void> {
    return Promise.resolve();
  }

  foregroundSession(): Promise<void> {
    return Promise.resolve();
  }

  attemptRecovery(_type: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT'): Promise<boolean> {
    return Promise.resolve(false);
  }

  applyStudyQuizBonus(correctAnswers: number): void {
    this.orchestrator.applyStudyQuizBonus(correctAnswers);
  }

  getAntiCheatScore(): number {
    return this.orchestrator.getCurrentPurityScore();
  }

  getCurrentPurityScore(): number {
    return this.getAntiCheatScore();
  }

  getAntiCheatLabel(): 'Elite' | 'Good' | 'Okay' | 'Distracted' {
    return this.orchestrator.getPurityLabel();
  }

  getPurityLabel(): 'Elite' | 'Good' | 'Okay' | 'Distracted' {
    return this.getAntiCheatLabel();
  }

  getSessionHistory(limit = 20): SessionHistoryEntry[] {
    return this.orchestrator.getSessionHistory(limit) as unknown as SessionHistoryEntry[];
  }

  getSessionStats(): unknown {
    return this.orchestrator.getSessionStats();
  }

  getAllPresets() {
    return getAllPresets();
  }

  createCustomPreset(input: Parameters<typeof createCustomPreset>[0]) {
    return createCustomPreset(input);
  }

  deletePreset(presetId: string): void {
    deletePreset(presetId);
  }
}

let instance: SessionService | null = null;

export function createSessionService(options?: SessionServiceOptions): SessionService {
  return new SessionService(options);
}

export function getSessionService(): SessionService {
  if (!instance) {
    instance = new SessionService();
  }
  return instance;
}
