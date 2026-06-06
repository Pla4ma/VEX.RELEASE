import type {
  SessionState,
  InterruptionType,
  InterruptionSeverity,
  InterruptionRecord,
  RecoveryRecord,
  SessionSummary,
} from './types';
import type { OrchestratorConfig } from './orchestrator-types';
import { SessionOrchestratorBase } from './SessionOrchestratorBase';
import {
  handleTimerTick as doHandleTimerTick,
  handleTimerWarning,
  startBreak,
  handleBreakTick,
  handleBreakComplete as doHandleBreakComplete,
  endBreak as doEndBreak,
} from './orchestrators/SessionTimer';
import { loadActiveSession } from './orchestrators/SessionCore';
import {
  completeSessionInternal,
  abandonSession,
} from './orchestrators/SessionCompletion';
import {
  attemptRecovery,
  completeLastInterruption,
  recordInterruption,
  handleAntiCheatViolation,
  logInterruption,
  logRecovery,
} from './orchestrators/SessionRecovery';
import {
  getActiveSession as getActiveSessionAccessor,
  getTimerState as getTimerStateAccessor,
  getRemainingSeconds as getRemainingSecondsAccessor,
  getElapsedSeconds as getElapsedSecondsAccessor,
  getPercentageComplete as getPercentageCompleteAccessor,
  isSessionActive as isSessionActiveAccessor,
  isPaused as isPausedAccessor,
  getCurrentPurityScore as getCurrentPurityScoreAccessor,
  getPurityLabel as getPurityLabelAccessor,
  getInterruptions as getInterruptionsAccessor,
  getRecoveries as getRecoveriesAccessor,
  applyStudyQuizBonus as applyStudyQuizBonusAccessor,
  updateFocusQuality as updateFocusQualityAccessor,
  addDocument as addDocumentAccessor,
  removeDocument as removeDocumentAccessor,
  getSessionHistory as getSessionHistoryAccessor,
  getSessionStats as getSessionStatsAccessor,
} from './orchestrator-accessors';

export class SessionOrchestrator extends SessionOrchestratorBase {
  handleTimerTick(
    elapsed: number,
    remaining: number,
    percentage: number,
  ): void {
    doHandleTimerTick(this, elapsed, remaining, percentage);
  }
  handleTimerWarning(sec: number): void {
    handleTimerWarning(this, sec);
  }
  async handleTimerComplete(): Promise<void> {
    if (!this.session) {return;}
    if (
      (this.session.currentInterval || 0) >= (this.session.totalIntervals || 0)
    ) {
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

  async completeSession(): Promise<SessionSummary> {
    if (!this.session) {throw new Error('No active session');}
    await completeSessionInternal(this);
    if (!this.lastSessionSummary) {throw new Error('No session summary');}
    return this.lastSessionSummary;
  }
  async endSession(_reason?: string): Promise<SessionState> {
    if (!this.session) {throw new Error('No active session');}
    await completeSessionInternal(this);
    const s = this.getSession();
    if (!s) {throw new Error('Failed to get session state');}
    return s;
  }
  abandonSession(reason?: string): Promise<void> {
    return abandonSession(this, reason);
  }

  attemptRecovery(
    type: 'USER_RESUME' | 'STREAK_SAVE' | 'PARTIAL_CREDIT',
  ): Promise<boolean> {
    return attemptRecovery(this, type);
  }
  completeLastInterruption(duration: number): void {
    completeLastInterruption(this, duration);
  }
  recordInterruption(
    type: InterruptionType,
    severity: InterruptionSeverity = 'MODERATE',
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

  getActiveSessionInMemory(): SessionState | null {
    return getActiveSessionAccessor(this);
  }
  getTimerState() {
    return getTimerStateAccessor(this);
  }
  getRemainingSeconds() {
    return getRemainingSecondsAccessor(this);
  }
  getElapsedSeconds() {
    return getElapsedSecondsAccessor(this);
  }
  getPercentageComplete() {
    return getPercentageCompleteAccessor(this);
  }
  isSessionActive(): boolean {
    return isSessionActiveAccessor(this);
  }
  isPaused(): boolean {
    return isPausedAccessor(this);
  }
  getCurrentPurityScore(): number {
    return getCurrentPurityScoreAccessor(this);
  }
  getPurityLabel(): 'Elite' | 'Good' | 'Okay' | 'Distracted' {
    return getPurityLabelAccessor(this);
  }
  getInterruptions(): InterruptionRecord[] {
    return getInterruptionsAccessor(this);
  }
  getRecoveries(): RecoveryRecord[] {
    return getRecoveriesAccessor(this);
  }
  applyStudyQuizBonus(correct: number): void {
    applyStudyQuizBonusAccessor(this, correct);
  }
  updateFocusQuality(quality: number): void {
    updateFocusQualityAccessor(this, quality);
  }
  addDocument(docId: string): void {
    addDocumentAccessor(this, docId);
  }
  removeDocument(docId: string): void {
    removeDocumentAccessor(this, docId);
  }
  getSessionHistoryFromAccessor(limit = 10): Promise<SessionState[]> {
    return getSessionHistoryAccessor(this, limit);
  }
  getSessionStatsFromAccessor() {
    return getSessionStatsAccessor(this);
  }

  destroy(): void {
    this.timerEngine?.destroy();
    this.antiCheatEngine.destroy();
    this.eventEmitter.detach();
    this.isActive = false;
    this.session = null;
  }
}
let orchestratorInstance: SessionOrchestrator | null = null;
export function getSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  if (!orchestratorInstance) {orchestratorInstance = new SessionOrchestrator(config);}
  loadActiveSession(orchestratorInstance);
  return orchestratorInstance;
}
export function resetSessionOrchestrator(): void {
  if (orchestratorInstance) { orchestratorInstance.destroy(); orchestratorInstance = null; }
}
export function createSessionOrchestrator(config?: OrchestratorConfig): SessionOrchestrator {
  const inst = new SessionOrchestrator(config);
  loadActiveSession(inst);
  return inst;
}
