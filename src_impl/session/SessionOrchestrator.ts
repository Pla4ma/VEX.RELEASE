import { TimerEngine } from './engines/TimerEngine';
import { ScoringEngine } from './engines/ScoringEngine';
import { CompletionEngine } from './engines/CompletionEngine';
import { AntiCheatEngine } from './antiCheat/AntiCheatEngine';
import { SessionEventEmitter } from './SessionEventEmitter';
import { getSessionRepository } from './repository/SessionRepository';
import type {
  SessionState,
  SessionConfig,
  InterruptionType,
  InterruptionSeverity,
  InterruptionRecord,
  RecoveryRecord,
  FocusQualityMetrics,
  SessionSummary,
} from './types';
import { v4 as uuidv4 } from '../utils/uuid';
import { createDebugger } from '../utils/debug';
import type { OrchestratorConfig } from './orchestrator-types';
import * as persistence from './SessionPersistence';
const debug = createDebugger('session:orchestrator');
export class SessionOrchestrator {
  private session: SessionState | null = null;
  private userId: string | null = null;
  private timerEngine: TimerEngine | null = null;
  private scoringEngine: ScoringEngine;
  private completionEngine: CompletionEngine;
  private antiCheatEngine: AntiCheatEngine;
  private eventEmitter: SessionEventEmitter;
  private repository = getSessionRepository();
  private config: OrchestratorConfig;
  private focusMetrics: FocusQualityMetrics;
  private interruptions: InterruptionRecord[] = [];
  private recoveries: RecoveryRecord[] = [];
  private isActive: boolean = false;
  private countdownActive: boolean = false;
  private lastSessionSummary: SessionSummary | null = null;
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
    this.focusMetrics = this.createEmptyFocusMetrics();
    this.loadActiveSession();
    debug.info('SessionOrchestrator initialized');
  }
  setUserId(userId: string): void {
    this.userId = userId;
    this.repository.setUserId(userId);
    this.scoringEngine.setUserStats(0, 1);
    debug.info('SessionOrchestrator user set: %s', userId);
  }
  async createSession(config: SessionConfig): Promise<SessionState> {
    if (!this.userId) {
      throw new Error('SessionOrchestrator: No user set');
    }
    const sessionId = uuidv4();
    const now = Date.now();
    this.session = {
      id: sessionId,
      userId: this.userId,
      status: 'PREPARING',
      phase: 'PREPARATION',
      config,
      remainingTime: config.duration * 1000,
      totalDuration: config.duration * 1000,
      elapsedTime: 0,
      effectiveTime: 0,
      effectiveDuration: 0,
      actualDuration: 0,
      pausedTime: 0,
      totalPausedTime: 0,
      totalBackgroundTime: 0,
      currentInterval: 1,
      totalIntervals: config.intervals,
      intervalsCompleted: 0,
      interruptions: 0,
      pauses: 0,
      backgroundTime: 0,
      baseScore: 0,
      finalScore: 0,
      timeBonus: 0,
      streakBonus: 0,
      focusQuality: 100,
      completionPercentage: 0,
      streakMaintained: false,
      damagePoints: 0,
      penaltyMultiplier: 1,
      recoveryAttempts: 0,
      maxRecoveryAttempts: 3,
      canRecover: true,
      conflictStatus: 'NONE',
      storageStatus: 'HEALTHY',
      deviceId: 'device-placeholder',
      appVersion: '1.0.0',
      osVersion: 'unknown',
      antiCheatStatus: 'CLEAN',
      antiCheatFlags: [],
      createdAt: now,
      updatedAt: now,
      isDirty: true,
      isOnline: true,
      modeBonus: 0,
    };
    if (this.config.enableAntiCheat) {
      this.antiCheatEngine.initialize(sessionId, this.getDeviceFingerprint());
    }
    this.eventEmitter.attach(sessionId, this.userId);
    await this.repository.saveActiveSession(this.session);
    this.eventEmitter.emitSessionCreated(config);
    debug.info('Session created: %s', sessionId);
    return this.session;
  }
  cancelStart(): void {
    if (this.countdownActive) {
      this.countdownActive = false;
      if (this.session) {
        this.session.status = 'PREPARING';
      }
    }
  }
  async startSession(config?: number | SessionConfig, countdownSeconds: number = 3): Promise<SessionState> {
    // Handle config object passed from hook
    if (config && typeof config === 'object') {
      await this.createSession(config);
    }
    if (!this.session) {
      throw new Error('No active session');
    }
    this.session.status = 'STARTING';
    this.countdownActive = true;
    this.eventEmitter.emitSessionStarting(countdownSeconds);
    for (let i = countdownSeconds; i > 0; i--) {
      if (!this.countdownActive) {
        throw new Error('Session start cancelled');
      }
      await this.wait(1000);
    }
    if (!this.countdownActive) {
      throw new Error('Session start cancelled');
    }
    this.countdownActive = false;
    this.session.status = 'ACTIVE';
    this.session.phase = 'FOCUS';
    this.session.startedAt = Date.now();
    this.session.updatedAt = Date.now();
    this.timerEngine = new TimerEngine(
      this.session.id,
      Math.floor((this.session.remainingTime || 0) / 1000),
      this.config.timerConfig || {},
      {
        onTick: this.handleTimerTick.bind(this),
        onComplete: this.handleTimerComplete.bind(this),
        onWarning: this.handleTimerWarning.bind(this),
      },
    );
    this.timerEngine.start();
    this.isActive = true;
    await this.saveSessionState();
    this.eventEmitter.emitSessionStarted(this.session.phase);
    debug.info('Session started: %s', this.session.id);
    const session = this.getSession();
    if (!session) {
      throw new Error('Failed to get session state');
    }
    return session;
  }
  async pauseSession(reason?: string): Promise<SessionState> {
    if (!this.session || !this.timerEngine) {
      throw new Error('No active session');
    }
    if (this.session.status !== 'ACTIVE') {
      const session = this.getSession();
      if (!session) {
        throw new Error('Failed to get session state');
      }
      return session;
    }
    this.session.status = 'PAUSED';
    this.session.pausedAt = Date.now();
    this.session.pauses = (this.session.pauses || 0) + 1;
    if (reason === 'user') {
      this.antiCheatEngine.recordManualPause();
    }
    this.timerEngine.pause(reason);
    await this.saveSessionState();
    this.eventEmitter.emitSessionPaused(reason);
    this.recordInterruption('USER_PAUSE', 'MINOR');
    debug.info('Session paused: %s', this.session.id);
    const session = this.getSession();
    if (!session) {
      throw new Error('Failed to get session state');
    }
    return session;
  }
  async resumeSession(): Promise<SessionState> {
    if (!this.session || !this.timerEngine) {
      throw new Error('No active session');
    }
    if (this.session.status !== 'PAUSED') {
      const session = this.getSession();
      if (!session) {
        throw new Error('Failed to get session state');
      }
      return session;
    }
    const now = Date.now();
    const pausedDuration = now - (this.session.pausedAt || now);
    this.session.status = 'ACTIVE';
    this.session.resumedAt = now;
    this.session.pausedTime = (this.session.pausedTime || 0) + pausedDuration;
    this.session.updatedAt = now;
    this.timerEngine.resume();
    this.completeLastInterruption(pausedDuration);
    await this.saveSessionState();
    this.eventEmitter.emitSessionResumed(pausedDuration);
    debug.info(
      'Session resumed: %s (paused for %dms)',
      this.session.id,
      pausedDuration,
    );
    const session = this.getSession();
    if (!session) {
      throw new Error('Failed to get session state');
    }
    return session;
  }
  async backgroundSession(): Promise<void> {
    if (!this.session || !this.timerEngine) {
      return;
    }
    this.antiCheatEngine.recordBackgroundSwitch();
    this.session.status = 'BACKGROUNDED';
    this.session.updatedAt = Date.now();
    this.timerEngine.background();
    await this.saveSessionState();
    this.eventEmitter.emitBackgrounded(Date.now());
    if (this.config.pauseOnBackground) {
      setTimeout(() => {
        if (this.session?.status === 'BACKGROUNDED') {
          this.pauseSession('auto_background');
        }
      }, this.config.pauseThreshold);
    }
    debug.info('Session backgrounded: %s', this.session.id);
  }
  async foregroundSession(): Promise<void> {
    if (!this.session || !this.timerEngine) {
      return;
    }
    const foregroundedAt = Date.now();
    const backgroundDuration = this.timerEngine.foreground();
    this.antiCheatEngine.recordSuspension(backgroundDuration);
    this.session.backgroundTime = (this.session.backgroundTime || 0) + backgroundDuration;
    this.session.updatedAt = foregroundedAt;
    if (this.session.status === 'BACKGROUNDED') {
      this.session.status = 'ACTIVE';
    }
    await this.saveSessionState();
    this.eventEmitter.emitForegrounded(foregroundedAt, backgroundDuration);
    debug.info(
      'Session foregrounded: %s (background: %dms)',
      this.session.id,
      backgroundDuration,
    );
  }
  private handleTimerTick(
    elapsed: number,
    remaining: number,
    percentage: number,
  ): void {
    if (!this.session) {return;}
    if (this.config.enableAntiCheat) {
      const validation = this.antiCheatEngine.validateTick(elapsed, Date.now());
      if (!validation.valid) {
        this.handleAntiCheatViolation(validation.warning || 'Invalid tick');
        return;
      }
    }
    this.session.elapsedTime = elapsed;
    this.session.remainingTime = remaining;
    this.session.completionPercentage = percentage;
    this.session.effectiveTime = elapsed - (this.session.pausedTime || 0);
    const totalDuration = this.session.totalDuration;
    const effectiveDuration = this.session.config.duration * 1000;
    const intervalProgress = (elapsed % effectiveDuration) / effectiveDuration;
    const currentInterval = Math.floor(elapsed / effectiveDuration) + 1;
    if (currentInterval > (this.session.currentInterval || 0)) {
      this.session.intervalsCompleted = (this.session.intervalsCompleted || 0) + 1;
      this.session.currentInterval = currentInterval;
      this.eventEmitter.emitIntervalCompleted(
        currentInterval,
        this.session.totalIntervals || 0,
      );
    }
    this.session.isDirty = true;
    this.session.updatedAt = Date.now();
    if (Math.floor(elapsed / 1000) % 5 === 0) {
      this.saveSessionState();
    }
    this.eventEmitter.emitTick(
      elapsed,
      remaining,
      percentage,
      this.session.phase,
    );
    this.eventEmitter.emitProgress(
      this.session.phase,
      this.session.currentInterval || 0,
      intervalProgress * 100,
      remaining,
    );
  }
  private async handleTimerComplete(): Promise<void> {
    if (!this.session) {return;}
    if ((this.session.currentInterval || 0) >= (this.session.totalIntervals || 0)) {
      await this.completeSessionInternal();
    } else {
      await this.startBreak();
    }
  }
  private handleTimerWarning(secondsRemaining: number): void {
    if (!this.session) {return;}
    this.eventEmitter.emitNotification(
      'TIME_WARNING',
      'Time Running Out',
      `${secondsRemaining} seconds remaining`,
      'normal',
      { secondsRemaining },
    );
  }
  async startBreak(): Promise<void> {
    if (!this.session) {return;}
    const isLongBreak =
      (this.session.currentInterval || 0) % this.session.config.longBreakInterval ===
      0;
    const breakDuration = isLongBreak
      ? this.session.config.longBreakDuration * 1000
      : this.session.config.breakDuration * 1000;
    const previousPhase = this.session.phase;
    this.session.phase = isLongBreak ? 'LONG_BREAK' : 'SHORT_BREAK';
    this.session.updatedAt = Date.now();
    this.eventEmitter.emitPhaseChanged(previousPhase, this.session.phase);
    if (this.timerEngine) {
      this.timerEngine.destroy();
    }
    this.timerEngine = new TimerEngine(
      this.session.id,
      Math.floor(breakDuration / 1000),
      this.config.timerConfig || {},
      {
        onTick: this.handleBreakTick.bind(this),
        onComplete: this.handleBreakComplete.bind(this),
        onWarning: this.handleTimerWarning.bind(this),
      },
    );
    this.timerEngine.start();
    this.eventEmitter.emitNotification(
      'BREAK_STARTING',
      isLongBreak ? 'Long Break' : 'Short Break',
      'Take a break to recharge',
      'normal',
    );
    debug.info(
      'Break started: %s (%s, %dms)',
      this.session.id,
      this.session.phase,
      breakDuration,
    );
  }
  private handleBreakTick(
    elapsed: number,
    remaining: number,
    percentage: number,
  ): void {
    if (!this.session) {return;}
    this.session.elapsedTime = (this.session.elapsedTime || 0) + elapsed;
    this.session.updatedAt = Date.now();
  }
  private async handleBreakComplete(): Promise<void> {
    if (!this.session) {return;}
    const previousPhase = this.session.phase;
    this.session.phase = 'FOCUS';
    this.session.updatedAt = Date.now();
    this.eventEmitter.emitPhaseChanged(previousPhase, this.session.phase);
    if (this.timerEngine) {
      this.timerEngine.destroy();
    }
    const remainingIntervals =
      (this.session.totalIntervals || 0) - (this.session.currentInterval || 0);
    const focusDuration = this.session.config.duration * 1000;
    this.timerEngine = new TimerEngine(
      this.session.id,
      Math.floor(focusDuration / 1000),
      this.config.timerConfig || {},
      {
        onTick: this.handleTimerTick.bind(this),
        onComplete: this.handleTimerComplete.bind(this),
        onWarning: this.handleTimerWarning.bind(this),
      },
    );
    this.timerEngine.start();
    if (!this.session.config.autoStartNextInterval) {
      await this.pauseSession('break_complete');
    }
    debug.info('Break complete, next interval: %s', this.session.id);
  }
  async completeSession(): Promise<SessionSummary> {
    if (!this.session) {
      throw new Error('No active session');
    }
    await this.completeSessionInternal();
    const session = this.session;
    return this.buildSessionSummary();
  }
  async endSession(_reason?: string): Promise<SessionState> {
    if (!this.session) {
      throw new Error('No active session');
    }
    await this.completeSessionInternal();
    const session = this.getSession();
    if (!session) {
      throw new Error('Failed to get session state');
    }
    return session;
  }
  private async completeSessionInternal(): Promise<void> {
    if (!this.session) {return;}
    this.isActive = false;
    if (this.config.enableAntiCheat) {
      const validation = this.antiCheatEngine.validateSession(this.session);
      if (!validation.valid) {
        this.session.antiCheatStatus = 'FLAGGED';
        this.session.antiCheatFlags = validation.flags.map((f) => f.type);
        this.antiCheatEngine.applyActions();
        const actions = this.antiCheatEngine.takeAction();
        if (actions.shouldInvalidate) {
          await this.failSession('Anti-cheat validation failed', false);
          return;
        }
      }
    }
    this.focusMetrics = this.scoringEngine.calculateFocusQuality(
      this.session,
      this.interruptions.map((i) => ({
        duration: i.duration || 0,
        severity: i.severity,
        autoRecovered: i.autoRecovered,
      })),
    );
    const result = this.completionEngine.completeSession(
      this.session,
      this.focusMetrics,
      0,
      undefined,
      undefined,
      undefined,
    );
    if (!result.success) {
      throw new Error('Session completion failed');
    }
    this.session = {
      ...this.session,
      ...(result.summary as unknown as SessionState),
    };
    this.lastSessionSummary = result.summary;
    await this.finalizeSession(result.summary);
    this.eventEmitter.emitSessionCompleted(result.summary);
    debug.info(
      'Session completed: %s, Score: %d',
      this.session.id,
      result.summary.finalScore,
    );
  }
  private buildSessionSummary(): SessionSummary {
    if (!this.lastSessionSummary) {
      throw new Error(
        'No session summary available - session may not have completed',
      );
    }
    return this.lastSessionSummary;
  }
  async abandonSession(reason?: string): Promise<void> {
    if (!this.session) {
      throw new Error('No active session');
    }
    this.isActive = false;
    const elapsedTime = this.session.elapsedTime;
    const result = this.completionEngine.abandonSession(this.session, reason);
    this.session.damagePoints = result.damage.totalDamage;
    this.session.penaltyMultiplier = result.damage.finalPenalty;
    this.eventEmitter.emitSessionAbandoned(Date.now(), reason, elapsedTime);
    if (result.damage.totalDamage > 0) {
      this.eventEmitter.emitDamageTaken(
        result.damage.totalDamage,
        reason || 'Session abandoned',
      );
    }
    await this.finalizeAbandonedSession();
    debug.warn(
      'Session abandoned: %s (reason: %s)',
      this.session.id,
      reason || 'none',
    );
  }
  private async failSession(
    error: string,
    canRecover: boolean = true,
  ): Promise<void> {
    if (!this.session) {return;}
    this.isActive = false;
    const result = this.completionEngine.failSession(
      this.session,
      error,
      canRecover,
    );
    this.session.status = 'FAILED';
    this.session.damagePoints = result.damage.totalDamage;
    this.eventEmitter.emitSessionFailed(error, canRecover);
    if (canRecover && result.canRecover) {
      this.session.status = 'RECOVERING';
      await this.saveSessionState();
    } else {
      await this.finalizeAbandonedSession();
    }
    debug.error(
      'Session failed: %s (error: %s)',
      new Error(error),
      this.session.id,
    );
  }
  async attemptRecovery(
    recoveryType: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
  ): Promise<boolean> {
    if (!this.session) {
      throw new Error('No active session');
    }
    if ((this.session.recoveryAttempts || 0) >= (this.session.maxRecoveryAttempts || 3)) {
      return false;
    }
    const recovery: RecoveryRecord = {
      id: uuidv4(),
      sessionId: this.session.id,
      type: recoveryType,
      timestamp: Date.now(),
      recoveredTime: 0,
      success: false,
      attemptedAt: Date.now(),
    };
    this.eventEmitter.emitRecoveryAttempted(recovery);
    const result = this.completionEngine.attemptRecovery(
      this.session,
      recoveryType,
      this.focusMetrics,
      0,
    );
    if (result.success) {
      this.isActive = true;
      this.session.status = result.status;
      recovery.success = true;
      recovery.recoveredTime = result.summary.effectiveDuration;
      this.recoveries.push(recovery);
      if (recoveryType === 'USER_RESUME' && this.timerEngine) {
        this.timerEngine.resume();
      }
      this.eventEmitter.emitRecoverySuccessful(
        Date.now(),
        result.summary.effectiveDuration,
      );
      await this.saveSessionState();
      debug.info('Recovery successful: %s', this.session.id);
      return true;
    } else {
      recovery.success = false;
      this.recoveries.push(recovery);
      this.eventEmitter.emitRecoveryFailed(
        Date.now(),
        'Recovery not applicable',
      );
      debug.warn('Recovery failed: %s', this.session.id);
      return false;
    }
  }
  private completeLastInterruption(duration: number): void {
    const lastInterruption = this.interruptions[this.interruptions.length - 1];
    if (lastInterruption && !lastInterruption.resolvedAt) {
      lastInterruption.resolvedAt = Date.now();
      lastInterruption.duration = duration;
      // impact is now a string, no timeLost property
    }
  }
  private recordInterruption(
    type: InterruptionType,
    severity: InterruptionSeverity = 'MODERATE',
  ): InterruptionRecord {
    if (!this.session) {
      throw new Error('No active session');
    }
    const interruption: InterruptionRecord = {
      id: uuidv4(),
      sessionId: this.session.id,
      type,
      severity,
      timestamp: Date.now(),
      reason: 'Session interruption',
      duration: 0,
      resolvedAt: Date.now(),
      autoRecovered: false,
      impact: {
        timeLost: 0,
        scoreImpact: 0,
        damagePoints: 0,
      },
    };
    this.interruptions.push(interruption);
    this.session.interruptions = (this.session.interruptions || 0) + 1;
    this.eventEmitter.emitInterruption(interruption);
    const damage = this.scoringEngine.calculateDamage(
      this.session,
      'INTERRUPTION',
    );
    if (damage.totalDamage > 0) {
      this.eventEmitter.emitDamageTaken(
        damage.totalDamage,
        `Interruption: ${type}`,
      );
    }
    return interruption;
  }
  private handleAntiCheatViolation(warning: string): void {
    if (!this.session) {return;}
    const flags = this.antiCheatEngine.getFlags();
    if (flags.length > 0) {
      const latestFlag = flags[flags.length - 1];
      this.eventEmitter.emitAntiCheatFlag(latestFlag);
      this.session.antiCheatStatus = this.antiCheatEngine.getStatus();
      this.session.antiCheatFlags = flags.map((f) => f.type);
    }
    debug.error('Anti-cheat violation: %s', new Error(warning));
  }
  private async saveSessionState(): Promise<void> {
    if (!this.session) {return;}
    await persistence.saveSessionState(this.session, this.repository);
  }
  private async loadActiveSession(): Promise<void> {
    const session = await persistence.loadActiveSession(this.repository);
    if (session) {
      this.session = session;
      this.userId = session.userId;
      this.eventEmitter.attach(session.id, session.userId);
      if (session.status === 'ACTIVE' || session.status === 'PAUSED') {
        this.timerEngine = persistence.restoreTimerEngine(
          session,
          this.config.timerConfig || {},
          {
            onTick: this.handleTimerTick.bind(this),
            onComplete: this.handleTimerComplete.bind(this),
            onWarning: this.handleTimerWarning.bind(this),
          },
        );
        this.isActive = session.status === 'ACTIVE';
      }
      debug.info('Restored active session: %s', session.id);
    }
  }
  private async finalizeSession(summary: SessionSummary): Promise<void> {
    if (!this.session) {return;}
    await persistence.finalizeSession(this.session, summary, this.repository);
  }
  private async finalizeAbandonedSession(): Promise<void> {
    if (!this.session) {return;}
    await persistence.finalizeAbandonedSession(this.session, this.repository);
  }
  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private getDeviceFingerprint(): string {
    return 'device-placeholder';
  }
  private createEmptyFocusMetrics(): FocusQualityMetrics {
    return {
      sessionId: 'placeholder',
      timeInDeepFocus: 0,
      timeInShallowFocus: 0,
      timeDistracted: 0,
      focusSegments: [],
      consistencyScore: 100,
      depthScore: 100,
      recoveryScore: 100,
      overallScore: 100,
      calculatedAt: Date.now(),
    };
  }
  getSession(): SessionState | null {
    return this.session ? { ...this.session } : null;
  }
  getSessionState(): SessionState | null {
    return this.getSession();
  }
  getTimerState() {
    return this.timerEngine?.getState() || null;
  }
  getRemainingSeconds(): number {
    return this.timerEngine?.getRemainingSeconds() || 0;
  }
  getElapsedSeconds(): number {
    return this.timerEngine?.getElapsedSeconds() || 0;
  }
  getPercentageComplete(): number {
    return this.timerEngine?.getPercentageComplete() || 0;
  }
  isSessionActive(): boolean {
    return this.isActive;
  }
  isPaused(): boolean {
    return this.session?.status === 'PAUSED';
  }
  getCurrentPurityScore(): number {
    return this.antiCheatEngine.getCurrentPurityScore();
  }
  applyStudyQuizBonus(correctAnswers: number): void {
    if (!this.session) {return;}
    this.session.config.quizBonusPoints = Math.max(0, correctAnswers) * 5;
    this.session.metadata = {
      ...(this.session.metadata ?? {}),
      studyQuizCorrectAnswers: correctAnswers,
    };
    this.session.updatedAt = Date.now();
    this.session.isDirty = true;
    void this.saveSessionState();
  }
  getPurityLabel(): 'Elite' | 'Good' | 'Okay' | 'Distracted' {
    return this.antiCheatEngine.getPurityLabel();
  }
  getInterruptions(): InterruptionRecord[] {
    return [...this.interruptions];
  }
  getRecoveries(): RecoveryRecord[] {
    return [...this.recoveries];
  }
  destroy(): void {
    this.timerEngine?.destroy();
    this.antiCheatEngine.destroy();
    this.eventEmitter.detach();
    this.isActive = false;
    this.session = null;
    debug.info('SessionOrchestrator destroyed');
  }

  // Stub methods for compatibility with useStudySession hook
  endBreak(): void {
    debug.info('endBreak called - not implemented');
  }

  updateFocusQuality(_quality: number): void {
    debug.info('updateFocusQuality called - not implemented');
  }

  logInterruption(_type: string, _details?: Record<string, unknown>): void {
    debug.info('logInterruption called - not implemented');
  }

  logRecovery(_type: string, _details?: Record<string, unknown>): void {
    debug.info('logRecovery called - not implemented');
  }

  addDocument(_documentId: string): void {
    debug.info('addDocument called - not implemented');
  }

  removeDocument(_documentId: string): void {
    debug.info('removeDocument called - not implemented');
  }

  // Additional methods needed by useStudySession hook
  getSessionHistory(_limit: number): SessionState[] {
    debug.info('getSessionHistory called - returning empty array');
    return [];
  }

  getSessionStats(): unknown {
    debug.info('getSessionStats called - returning empty stats');
    return {
      totalSessions: 0,
      totalDuration: 0,
      averageDuration: 0,
      completionRate: 0,
    };
  }

  getActiveSession(): SessionState | null {
    debug.info('getActiveSession called');
    return this.getSession();
  }
}
export {
  createSessionOrchestrator,
  getSessionOrchestrator,
} from './orchestrator-factory';
