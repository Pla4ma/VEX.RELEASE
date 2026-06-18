import type {
  SessionState,
  RecoveryRecord,
  RecoveryType,
  InterruptionRecord,
} from '../types';
import { createDebugger } from '../../../utils/debug';
import type { RecoveryConfig } from './recovery-analysis-types';
import {
  evaluateRecovery,
  calculatePenalties,
  canProtectStreak,
  calculatePartialCredit,
  attemptSessionRecovery,
  canAutoRecoverForInterruption,
} from './recovery-analysis';
import { RecoveryHistory } from './RecoveryHistory';

export type { RecoveryConfig } from './recovery-analysis-types';
export { createRecoveryService, getRecoveryService } from './recovery-service-factory';

const debug = createDebugger('session:recovery');

export class RecoveryService {
  private config: RecoveryConfig;
  private history: RecoveryHistory;

  constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = {
      autoRecoveryEnabled: true,
      autoRecoveryDelay: 5000,
      streakProtectionEnabled: true,
      partialCreditThreshold: 0.25,
      maxRecoveriesPerSession: 3,
      ...config,
    };
    this.history = new RecoveryHistory();
    debug.info('RecoveryService initialized');
  }

  scheduleAutoRecovery(session: SessionState, onRecover: () => void): boolean {
    if (!this.config.autoRecoveryEnabled) {
      return false;
    }
    if (
      this.history.getRecoveryCount(session.id) >=
      this.config.maxRecoveriesPerSession
    ) {
      debug.warn('Max recoveries reached for session %s', session.id);
      return false;
    }
    const timeoutId = setTimeout(() => {
      onRecover();
    }, this.config.autoRecoveryDelay);
    this.history.setPendingRecovery(session.id, timeoutId);
    debug.info(
      'Auto-recovery scheduled for session %s in %dms',
      session.id,
      this.config.autoRecoveryDelay,
    );
    return true;
  }

  cancelAutoRecovery(sessionId: string): boolean {
    return this.history.clearPendingRecovery(sessionId);
  }

  attemptRecovery(
    session: SessionState,
    recoveryType: RecoveryType,
    recoveredTime: number = 0,
  ): RecoveryRecord {
    const recovery = attemptSessionRecovery(
      session,
      recoveryType,
      this.config.partialCreditThreshold,
      recoveredTime,
    );
    this.history.recordRecovery(session.id, recovery);
    debug.info(
      'Recovery attempted: %s (type: %s, success: %s)',
      session.id,
      recoveryType,
      recovery.success,
    );
    return recovery;
  }

  canProtectStreak(session: SessionState): ReturnType<typeof canProtectStreak> {
    return canProtectStreak(
      session,
      this.config.streakProtectionEnabled,
      this.config.partialCreditThreshold,
    );
  }

  protectStreak(session: SessionState): boolean {
    const protection = this.canProtectStreak(session);
    if (!protection.canProtect) {
      debug.warn(
        'Cannot protect streak for session %s: %s',
        session.id,
        protection.reason,
      );
      return false;
    }
    debug.info(
      'Streak protected for session %s (type: %s)',
      session.id,
      protection.protectionType,
    );
    return true;
  }

  calculatePartialCredit(
    session: SessionState,
  ): ReturnType<typeof calculatePartialCredit> {
    return calculatePartialCredit(session, this.config.partialCreditThreshold);
  }

  getRecoveryHistory(sessionId: string): RecoveryRecord[] {
    return this.history.getRecoveryHistory(sessionId);
  }

  getRecoveryCount(sessionId: string): number {
    return this.history.getRecoveryCount(sessionId);
  }

  getSuccessfulRecoveries(sessionId: string): RecoveryRecord[] {
    return this.history.getSuccessfulRecoveries(sessionId);
  }

  clearHistory(sessionId?: string): void {
    this.history.clearHistory(sessionId);
  }

  handleInterruption(
    session: SessionState,
    interruption: InterruptionRecord,
    onRecover: () => void,
  ): { autoRecoverScheduled: boolean; canAutoRecover: boolean } {
    const canAutoRecover = canAutoRecoverForInterruption(
      this.history.getRecoveryCount(session.id),
      this.config.maxRecoveriesPerSession,
      interruption.severity,
    );
    let autoRecoverScheduled = false;
    if (canAutoRecover) {
      autoRecoverScheduled = this.scheduleAutoRecovery(session, onRecover);
    }
    return { autoRecoverScheduled, canAutoRecover };
  }

  updateConfig(config: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info('RecoveryService config updated');
  }

  getConfig(): RecoveryConfig {
    return { ...this.config };
  }

  destroy(): void {
    this.history.destroy();
    debug.info('RecoveryService destroyed');
  }
}