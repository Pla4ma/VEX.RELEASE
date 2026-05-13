import type { SessionState, RecoveryRecord, RecoveryType, InterruptionRecord } from "../types";
import { v4 as uuidv4 } from "../../utils/uuid";
import { createDebugger } from "../../utils/debug";


export class RecoveryService {
  private config: RecoveryConfig;
  private recoveryHistory: Map<string, RecoveryRecord[]> = new Map();
  private pendingRecoveries: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = {
      autoRecoveryEnabled: true,
      autoRecoveryDelay: 5000,
      streakProtectionEnabled: true,
      partialCreditThreshold: 0.25,
      maxRecoveriesPerSession: 3,
      ...config,
    };

    debug.info('RecoveryService initialized');
  }

  // ============================================================================
  // Auto Recovery
  // ============================================================================

  scheduleAutoRecovery(
    session: SessionState,
    onRecover: () => void
  ): boolean {
    if (!this.config.autoRecoveryEnabled) {
      return false;
    }

    if (this.getRecoveryCount(session.id) >= this.config.maxRecoveriesPerSession) {
      debug.warn('Max recoveries reached for session %s', session.id);
      return false;
    }

    // Clear any existing pending recovery
    this.clearPendingRecovery(session.id);

    // Schedule recovery
    const timeoutId = setTimeout(() => {
      this.pendingRecoveries.delete(session.id);
      onRecover();
    }, this.config.autoRecoveryDelay);

    this.pendingRecoveries.set(session.id, timeoutId);

    debug.info('Auto-recovery scheduled for session %s in %dms',
      session.id, this.config.autoRecoveryDelay);

    return true;
  }

  cancelAutoRecovery(sessionId: string): boolean {
    return this.clearPendingRecovery(sessionId);
  }

  private clearPendingRecovery(sessionId: string): boolean {
    const timeoutId = this.pendingRecoveries.get(sessionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.pendingRecoveries.delete(sessionId);
      debug.debug('Pending recovery cleared for session %s', sessionId);
      return true;
    }
    return false;
  }

  // ============================================================================
  // Recovery Attempt
  // ============================================================================

  attemptRecovery(
    session: SessionState,
    recoveryType: RecoveryType,
    recoveredTime: number = 0
  ): RecoveryRecord {
    const recovery: RecoveryRecord = {
      id: uuidv4(),
      sessionId: session.id,
      type: recoveryType,
      attemptedAt: Date.now(),
      success: false,
      recoveredTime,
      penalties: [],
      timestamp: Date.now(),
    };

    // Calculate penalties
    recovery.penalties = this.calculatePenalties(session, recoveryType);

    // Determine success
    recovery.success = this.evaluateRecovery(session, recoveryType, recovery.penalties);

    // Update session if successful
    if (recovery.success) {
      session.recoveryAttempts++;
      session.lastRecoveryAt = recovery.attemptedAt;

      // Apply penalties
      for (const penalty of recovery.penalties ?? []) {
        session.damagePoints += penalty.amount;
      }
    }

    // Record in history
    this.recordRecovery(session.id, recovery);

    debug.info('Recovery attempted: %s (type: %s, success: %s)',
      session.id, recoveryType, recovery.successful);

    return recovery;
  }

  // ============================================================================
  // Recovery Evaluation
  // ============================================================================

  private evaluateRecovery(
    session: SessionState,
    recoveryType: RecoveryType,
    penalties: RecoveryRecord['penalties']
  ): boolean {
    const totalPenalty = penalties?.reduce((sum: number, p: DynamicValue) => sum + p.amount, 0) || 0;
    const maxAcceptablePenalty = session.baseScore * 0.3; // 30% max penalty

    switch (recoveryType) {
      case 'AUTO_RESUME':
        // Auto-recover if minimal penalties
        return totalPenalty < maxAcceptablePenalty * 0.5;

      case 'USER_RESUME':
        // User-initiated recoveries are generally successful
        return totalPenalty < maxAcceptablePenalty;

      case 'STREAK_SAVE':
        // Streak saves require partial completion
        return session.completionPercentage >= this.config.partialCreditThreshold * 100;

      case 'PARTIAL_CREDIT':
        // Partial credit requires some effort
        return session.effectiveTime > (session.config.duration * 1000 * 0.15);

      case 'FULL_RESET':
        // Full reset is always "successful" as a new attempt
        return true;

      default:
        return false;
    }
  }

  // ============================================================================
  // Penalty Calculation
  // ============================================================================

  private calculatePenalties(
    session: SessionState,
    recoveryType: RecoveryType
  ): RecoveryRecord['penalties'] {
    const penalties: RecoveryRecord['penalties'] = [];

    switch (recoveryType) {
      case 'AUTO_RESUME':
        // Minimal penalties for auto-recovery
        penalties.push({
          type: 'AUTO_RECOVERY',
          amount: Math.floor(session.baseScore * 0.02),
          description: 'Auto-recovery penalty',
        });
        break;

      case 'USER_RESUME':
        // Small penalty for user resume
        penalties.push({
          type: 'USER_RESUME',
          amount: Math.floor(session.baseScore * 0.05),
          description: 'Session resumed by user',
        });
        break;

      case 'STREAK_SAVE':
        // Moderate penalty for streak save
        penalties.push({
          type: 'STREAK_SAVE',
          amount: Math.floor(session.baseScore * 0.15),
          description: 'Streak protection used',
        });
        penalties.push({
          type: 'PARTIAL_CREDIT_ONLY',
          amount: Math.floor(session.baseScore * 0.1),
          description: 'Partial credit only',
        });
        break;

      case 'PARTIAL_CREDIT':
        // Significant penalty for partial credit
        penalties.push({
          type: 'PARTIAL_CREDIT',
          amount: Math.floor(session.baseScore * 0.25),
          description: 'Partial completion credit',
        });
        penalties.push({
          type: 'REDUCED_REWARDS',
          amount: 0,
          description: 'Reduced rewards applied',
        });
        break;

      case 'FULL_RESET':
        // Full reset loses all progress
        penalties.push({
          type: 'FULL_RESET',
          amount: session.baseScore, // Lose all score
          description: 'Session reset - all progress lost',
        });
        break;
    }

    // Additional penalties based on recovery count
    const recoveryCount = session.recoveryAttempts;
    if (recoveryCount > 0) {
      penalties.push({
        type: 'RECOVERY_STREAK_PENALTY',
        amount: Math.floor(session.baseScore * 0.05 * recoveryCount),
        description: `Multiple recoveries (${recoveryCount + 1})`,
      });
    }

    return penalties;
  }

  // ============================================================================
  // Streak Protection
  // ============================================================================

  canProtectStreak(session: SessionState): {
    canProtect: boolean;
    reason?: string;
    protectionType?: 'STREAK_FREEZE' | 'GRACE_PERIOD' | 'NONE';
  } {
    if (!this.config.streakProtectionEnabled) {
      return { canProtect: false, reason: 'Streak protection disabled' };
    }

    // Check completion percentage
    if (session.completionPercentage >= 50) {
      return { canProtect: true, protectionType: 'STREAK_FREEZE' };
    }

    // Check effective time
    const minTime = session.config.duration * 1000 * this.config.partialCreditThreshold;
    if (session.effectiveTime >= minTime) {
      return { canProtect: true, protectionType: 'GRACE_PERIOD' };
    }

    return { canProtect: false, reason: 'Insufficient session completion' };
  }

  protectStreak(session: SessionState): boolean {
    const protection = this.canProtectStreak(session);

    if (!protection.canProtect) {
      debug.warn('Cannot protect streak for session %s: %s', session.id, protection.reason);
      return false;
    }

    // Record the protection
    debug.info('Streak protected for session %s (type: %s)',
      session.id, protection.protectionType);

    return true;
  }

  // ============================================================================
  // Partial Credit
  // ============================================================================

  calculatePartialCredit(session: SessionState): {
    eligible: boolean;
    completionPercentage: number;
    scoreMultiplier: number;
    reason?: string;
  } {
    const completionRatio = session.completionPercentage / 100;

    if (completionRatio >= 0.5) {
      return {
        eligible: true,
        completionPercentage: session.completionPercentage,
        scoreMultiplier: 0.5,
      };
    }

    if (completionRatio >= this.config.partialCreditThreshold) {
      return {
        eligible: true,
        completionPercentage: 50, // Boost to 50%
        scoreMultiplier: 0.3,
      };
    }

    return {
      eligible: false,
      completionPercentage: session.completionPercentage,
      scoreMultiplier: 0,
      reason: 'Insufficient session completion for credit',
    };
  }

  // ============================================================================
  // Recovery History
  // ============================================================================

  private recordRecovery(sessionId: string, recovery: RecoveryRecord): void {
    const history = this.recoveryHistory.get(sessionId) || [];
    history.push(recovery);
    this.recoveryHistory.set(sessionId, history);
  }

  getRecoveryHistory(sessionId: string): RecoveryRecord[] {
    return this.recoveryHistory.get(sessionId) || [];
  }

  getRecoveryCount(sessionId: string): number {
    return this.getRecoveryHistory(sessionId).length;
  }

  getSuccessfulRecoveries(sessionId: string): RecoveryRecord[] {
    return this.getRecoveryHistory(sessionId).filter(r => r.success);
  }

  clearHistory(sessionId?: string): void {
    if (sessionId) {
      this.recoveryHistory.delete(sessionId);
      this.clearPendingRecovery(sessionId);
    } else {
      // Clear all pending timeouts
      for (const timeoutId of this.pendingRecoveries.values()) {
        clearTimeout(timeoutId);
      }
      this.pendingRecoveries.clear();
      this.recoveryHistory.clear();
    }
  }

  // ============================================================================
  // Interruption Recovery
  // ============================================================================

  handleInterruption(
    session: SessionState,
    interruption: InterruptionRecord,
    onRecover: () => void
  ): {
    autoRecoverScheduled: boolean;
    canAutoRecover: boolean;
  } {
    // Determine if auto-recovery is possible
    const canAutoRecover = this.canAutoRecover(session, interruption);

    let autoRecoverScheduled = false;
    if (canAutoRecover) {
      autoRecoverScheduled = this.scheduleAutoRecovery(session, onRecover);
    }

    return { autoRecoverScheduled, canAutoRecover };
  }

  private canAutoRecover(
    session: SessionState,
    interruption: InterruptionRecord
  ): boolean {
    // Minor interruptions can auto-recover
    if (interruption.severity === 'MINOR') {
      return true;
    }

    // Moderate interruptions can auto-recover if we're within limits
    if (interruption.severity === 'MODERATE') {
      return this.getRecoveryCount(session.id) < this.config.maxRecoveriesPerSession;
    }

    // Major and critical require manual intervention
    return false;
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  updateConfig(config: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info('RecoveryService config updated');
  }

  getConfig(): RecoveryConfig {
    return { ...this.config };
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  destroy(): void {
    this.clearHistory();
    debug.info('RecoveryService destroyed');
  }
}