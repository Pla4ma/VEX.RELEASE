import type { RecoveryRecord } from '../types';
import { createDebugger } from '../../../utils/debug';

const debug = createDebugger('session:recovery');

// ponytail: Cap recovery history to prevent unbounded Map growth
const MAX_RECOVERY_SESSIONS = 200;

export class RecoveryHistory {
  private recoveryHistory: Map<string, RecoveryRecord[]> = new Map();
  private pendingRecoveries: Map<string, ReturnType<typeof setTimeout>> = new Map();

  recordRecovery(sessionId: string, recovery: RecoveryRecord): void {
    const history = this.recoveryHistory.get(sessionId) || [];
    history.push(recovery);
    this.recoveryHistory.set(sessionId, history);
    // Evict oldest sessions when Map exceeds cap
    if (this.recoveryHistory.size > MAX_RECOVERY_SESSIONS) {
      const oldestKey = this.recoveryHistory.keys().next().value;
      if (oldestKey != null) {
        this.recoveryHistory.delete(oldestKey);
      }
    }
  }

  getRecoveryHistory(sessionId: string): RecoveryRecord[] {
    return this.recoveryHistory.get(sessionId) || [];
  }

  getRecoveryCount(sessionId: string): number {
    return this.getRecoveryHistory(sessionId).length;
  }

  getSuccessfulRecoveries(sessionId: string): RecoveryRecord[] {
    return this.getRecoveryHistory(sessionId).filter((r) => r.success);
  }

  setPendingRecovery(sessionId: string, timeoutId: ReturnType<typeof setTimeout>): void {
    this.pendingRecoveries.set(sessionId, timeoutId);
  }

  clearPendingRecovery(sessionId: string): boolean {
    const timeoutId = this.pendingRecoveries.get(sessionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pendingRecoveries.delete(sessionId);
      debug.debug('Pending recovery cleared for session %s', sessionId);
      return true;
    }
    return false;
  }

  clearHistory(sessionId?: string): void {
    if (sessionId) {
      this.recoveryHistory.delete(sessionId);
      this.clearPendingRecovery(sessionId);
    } else {
      for (const timeoutId of this.pendingRecoveries.values()) {
        clearTimeout(timeoutId);
      }
      this.pendingRecoveries.clear();
      this.recoveryHistory.clear();
    }
  }

  destroy(): void {
    this.clearHistory();
    debug.info('RecoveryHistory destroyed');
  }
}