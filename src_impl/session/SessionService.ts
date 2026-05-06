/**
 * Session Service
 *
 * Main service facade for the session system.
 * Provides high-level API for session management.
 * Integrates with all subsystems: orchestrator, repository, events, rewards.
 */

import { SessionOrchestrator, getSessionOrchestrator } from './SessionOrchestrator';
import { getSessionRepository } from './repository/SessionRepository';
import { getSessionEventEmitter } from './SessionEventEmitter';
import { getRewardAdapter } from './integration/RewardAdapter';
import { getPresetService } from './presets';
import { getSessionRewardIntegration } from './integration/SessionRewardIntegration';
import { SessionMode } from './modes';

import type {
  SessionState,
  SessionConfig,
  SessionPreset,
  SessionSummary,
  SessionHistoryEntry,
  TimerConfig,
} from './types';

import { createDebugger } from '../utils/debug';

const debug = createDebugger('session:service');

// ============================================================================
// Session Service Options
// ============================================================================

export interface SessionServiceOptions {
  autoSave?: boolean;
  enableNotifications?: boolean;
  enableAnalytics?: boolean;
  enableAntiCheat?: boolean;
  timerConfig?: Partial<TimerConfig>;
}

// ============================================================================
// Session Service
// ============================================================================

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

    // Initialize orchestrator with options
    this.orchestrator = getSessionOrchestrator({
      timerConfig: this.options.timerConfig,
      enableAntiCheat: this.options.enableAntiCheat,
    });

    this.setupEventListeners();

    // Initialize reward integration to wire up session completion handlers
    getSessionRewardIntegration({
      autoGrantRewards: false,
      autoUpdateStreak: false,
      autoAddXP: false,
      autoCreateSocialActivity: false,
      enableSeasonChallengeProgress: false,
    });

    debug.info('SessionService initialized');
  }

  setUserId(userId: string): void {
    this.userId = userId;
    this.orchestrator.setUserId(userId);
    this.repository.setUserId(userId);
    this.rewardAdapter.setUserId(userId);
    this.presetService.setUserId(userId);
    this.eventEmitter.attach('', userId); // Will be re-attached when session created

    debug.info('SessionService user set: %s', userId);
  }

  // ============================================================================
  // Session Management
  // ============================================================================

  /**
   * Create a new session from a preset
   */
  async createSessionFromPreset(presetId: string, customizations?: Partial<SessionConfig>): Promise<SessionState> {
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
      difficultyLevel: 'MEDIUM',
      adaptiveMode: false,
      focusScorePrimary: true,
      ...customizations,
      sessionMode: customizations?.sessionMode ?? SessionMode.FLOW,
    };

    return this.createCustomSession(config);
  }

  /**
   * Create a custom session
   */
  async createCustomSession(config: SessionConfig): Promise<SessionState> {
    if (!this.userId) {
      throw new Error('SessionService: No user set');
    }

    // Check for existing active session
    const activeSession = await this.getActiveSession();
    if (activeSession && this.isSessionActive()) {
      throw new Error('Cannot create new session: one is already active');
    }

    // Create session via orchestrator
    const session = await this.orchestrator.createSession(config);

    // Attach event emitter to new session
    this.eventEmitter.attach(session.id, this.userId);

    // Emit created event
    this.eventEmitter.emitSessionCreated(config);

    // Analytics
    if (this.options.enableAnalytics) {
      this.trackAnalytics('session_created', {
        duration: config.duration,
        intervals: config.intervals,
        category: config.category,
      });
    }

    return session;
  }

  /**
   * Start the current session
   */
  async startSession(countdownSeconds: number = 0): Promise<void> {
    await this.orchestrator.startSession(countdownSeconds);

    if (this.options.enableAnalytics) {
      this.trackAnalytics('session_started', {});
    }
  }

  /**
   * Pause the current session
   */
  async pauseSession(reason?: string): Promise<void> {
    await this.orchestrator.pauseSession(reason);

    if (this.options.enableNotifications) {
      this.eventEmitter.emitNotification(
        'SESSION_PAUSED',
        'Session Paused',
        reason || 'Your session has been paused',
        'normal'
      );
    }
  }

  /**
   * Resume the current session
   */
  async resumeSession(): Promise<void> {
    await this.orchestrator.resumeSession();

    if (this.options.enableNotifications) {
      this.eventEmitter.emitNotification(
        'SESSION_RESUMED',
        'Session Resumed',
        'Your session is now active',
        'normal'
      );
    }
  }

  /**
   * Abandon the current session
   */
  async abandonSession(reason?: string): Promise<void> {
    await this.orchestrator.abandonSession(reason);
  }

  async backgroundSession(): Promise<void> {
    await this.orchestrator.backgroundSession();
  }

  async foregroundSession(): Promise<void> {
    await this.orchestrator.foregroundSession();
  }

  applyStudyQuizBonus(correctAnswers: number): void {
    this.orchestrator.applyStudyQuizBonus(correctAnswers);
  }

  /**
   * Complete the current session (manual completion)
   * @returns The session summary with final score and rewards
   */
  async completeSession(): Promise<SessionSummary> {
    return this.orchestrator.completeSession();
  }

  /**
   * Attempt to recover a failed/abandoned session
   */
  async attemptRecovery(recoveryType: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT'): Promise<boolean> {
    return this.orchestrator.attemptRecovery(recoveryType);
  }

  // ============================================================================
  // Session Queries
  // ============================================================================

  /**
   * Get the current active session
   */
  getCurrentSession(): SessionState | null {
    return this.orchestrator.getSession();
  }

  /**
   * Get active session from storage (for app launch recovery)
   */
  async getActiveSession(): Promise<SessionState | null> {
    return this.repository.getActiveSession();
  }

  /**
   * Check if a session is currently active
   */
  isSessionActive(): boolean {
    return this.orchestrator.isSessionActive();
  }

  /**
   * Check if session is paused
   */
  isSessionPaused(): boolean {
    return this.orchestrator.isPaused();
  }

  /**
   * Get remaining time in seconds
   */
  getRemainingSeconds(): number {
    return this.orchestrator.getRemainingSeconds();
  }

  /**
   * Get elapsed time in seconds
   */
  getElapsedSeconds(): number {
    return this.orchestrator.getElapsedSeconds();
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    return this.orchestrator.getPercentageComplete();
  }

  getCurrentPurityScore(): number {
    return this.orchestrator.getCurrentPurityScore();
  }

  getPurityLabel(): 'Elite' | 'Good' | 'Okay' | 'Distracted' {
    return this.orchestrator.getPurityLabel();
  }

  // ============================================================================
  // Session History
  // ============================================================================

  /**
   * Get session history
   */
  async getSessionHistory(limit: number = 100): Promise<SessionHistoryEntry[]> {
    return this.repository.getSessionHistory(limit);
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<SessionHistoryEntry | null> {
    return this.repository.getSessionById(sessionId);
  }

  /**
   * Get session summary
   */
  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    return this.repository.getSessionSummary(sessionId);
  }

  /**
   * Get all session summaries
   */
  async getAllSummaries(): Promise<SessionSummary[]> {
    return this.repository.getAllSummaries();
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    totalFocusTime: number;
    averageSessionDuration: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    return this.repository.getSessionStats();
  }

  // ============================================================================
  // Preset Management
  // ============================================================================

  /**
   * Get all available presets
   */
  getAllPresets(): SessionPreset[] {
    return this.presetService.getAllPresets();
  }

  /**
   * Get preset by ID
   */
  getPresetById(presetId: string): SessionPreset | undefined {
    return this.presetService.getPresetById(presetId);
  }

  /**
   * Create custom preset
   */
  async createCustomPreset(config: {
    name: string;
    duration: number;
    breakDuration?: number;
    intervals?: number;
    category?: string;
    strictMode?: boolean;
    dndEnabled?: boolean;
    description?: string;
  }): Promise<SessionPreset> {
    return this.presetService.createCustomPreset(config);
  }

  /**
   * Delete custom preset
   */
  async deletePreset(presetId: string): Promise<void> {
    return this.presetService.deletePreset(presetId);
  }

  // ============================================================================
  // Event Handling
  // ============================================================================

  private setupEventListeners(): void {
    // Listen for session completion to distribute rewards
    // These would be subscribed via the event bus
  }

  // ============================================================================
  // Analytics
  // ============================================================================

  private trackAnalytics(event: string, properties: Record<string, unknown>): void {
    if (!this.options.enableAnalytics || !this.userId) {return;}

    // Would integrate with analytics service
    debug.debug('Analytics: %s %o', event, properties);
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    this.orchestrator.destroy();
    debug.info('SessionService destroyed');
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createSessionService(options?: SessionServiceOptions): SessionService {
  return new SessionService(options);
}

// ============================================================================
// Singleton
// ============================================================================

let serviceInstance: SessionService | null = null;

export function getSessionService(options?: SessionServiceOptions): SessionService {
  if (!serviceInstance) {
    serviceInstance = new SessionService(options);
  }
  return serviceInstance;
}
