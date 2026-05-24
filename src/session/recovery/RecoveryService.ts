import type {
  SessionState,
  RecoveryRecord,
  RecoveryType,
  InterruptionRecord,
} from "../types";
import { v4 as uuidv4 } from "../../utils/uuid";
import { createDebugger } from "../../utils/debug";
const debug = createDebugger("session:recovery");
interface RecoveryConfig {
  autoRecoveryEnabled: boolean;
  autoRecoveryDelay: number;
  streakProtectionEnabled: boolean;
  partialCreditThreshold: number;
  maxRecoveriesPerSession: number;
}
export class RecoveryService {
  private config: RecoveryConfig;
  private recoveryHistory: Map<string, RecoveryRecord[]> = new Map();
  private pendingRecoveries: Map<string, ReturnType<typeof setTimeout>> =
    new Map();
  constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = {
      autoRecoveryEnabled: true,
      autoRecoveryDelay: 5000,
      streakProtectionEnabled: true,
      partialCreditThreshold: 0.25,
      maxRecoveriesPerSession: 3,
      ...config,
    };
    debug.info("RecoveryService initialized");
  }
  scheduleAutoRecovery(session: SessionState, onRecover: () => void): boolean {
    if (!this.config.autoRecoveryEnabled) {
      return false;
    }
    if (
      this.getRecoveryCount(session.id) >= this.config.maxRecoveriesPerSession
    ) {
      debug.warn("Max recoveries reached for session %s", session.id);
      return false;
    }
    this.clearPendingRecovery(session.id);
    const timeoutId = setTimeout(() => {
      this.pendingRecoveries.delete(session.id);
      onRecover();
    }, this.config.autoRecoveryDelay);
    this.pendingRecoveries.set(session.id, timeoutId);
    debug.info(
      "Auto-recovery scheduled for session %s in %dms",
      session.id,
      this.config.autoRecoveryDelay,
    );
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
      debug.debug("Pending recovery cleared for session %s", sessionId);
      return true;
    }
    return false;
  }
  attemptRecovery(
    session: SessionState,
    recoveryType: RecoveryType,
    recoveredTime: number = 0,
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
    recovery.penalties = this.calculatePenalties(session, recoveryType);
    recovery.success = this.evaluateRecovery(
      session,
      recoveryType,
      recovery.penalties,
    );
    if (recovery.success) {
      session.recoveryAttempts++;
      session.lastRecoveryAt = recovery.attemptedAt;
      for (const penalty of recovery.penalties ?? []) {
        session.damagePoints += penalty.amount;
      }
    }
    this.recordRecovery(session.id, recovery);
    debug.info(
      "Recovery attempted: %s (type: %s, success: %s)",
      session.id,
      recoveryType,
      recovery.successful,
    );
    return recovery;
  }
  private evaluateRecovery(
    session: SessionState,
    recoveryType: RecoveryType,
    penalties: RecoveryRecord["penalties"],
  ): boolean {
    const totalPenalty =
      penalties?.reduce(
        (sum: number, p: { amount: number }) => sum + p.amount,
        0,
      ) || 0;
    const maxAcceptablePenalty = session.baseScore * 0.3;
    switch (recoveryType) {
      case "AUTO_RESUME":
        return totalPenalty < maxAcceptablePenalty * 0.5;
      case "USER_RESUME":
        return totalPenalty < maxAcceptablePenalty;
      case "STREAK_SAVE":
        return (
          session.completionPercentage >=
          this.config.partialCreditThreshold * 100
        );
      case "PARTIAL_CREDIT":
        return session.effectiveTime > session.config.duration * 1000 * 0.15;
      case "FULL_RESET":
        return true;
      default:
        return false;
    }
  }
  private calculatePenalties(
    session: SessionState,
    recoveryType: RecoveryType,
  ): RecoveryRecord["penalties"] {
    const penalties: RecoveryRecord["penalties"] = [];
    switch (recoveryType) {
      case "AUTO_RESUME":
        penalties.push({
          type: "AUTO_RECOVERY",
          amount: Math.floor(session.baseScore * 0.02),
          description: "Auto-recovery penalty",
        });
        break;
      case "USER_RESUME":
        penalties.push({
          type: "USER_RESUME",
          amount: Math.floor(session.baseScore * 0.05),
          description: "Session resumed by user",
        });
        break;
      case "STREAK_SAVE":
        penalties.push({
          type: "STREAK_SAVE",
          amount: Math.floor(session.baseScore * 0.15),
          description: "Streak protection used",
        });
        penalties.push({
          type: "PARTIAL_CREDIT_ONLY",
          amount: Math.floor(session.baseScore * 0.1),
          description: "Partial credit only",
        });
        break;
      case "PARTIAL_CREDIT":
        penalties.push({
          type: "PARTIAL_CREDIT",
          amount: Math.floor(session.baseScore * 0.25),
          description: "Partial completion credit",
        });
        penalties.push({
          type: "REDUCED_REWARDS",
          amount: 0,
          description: "Reduced rewards applied",
        });
        break;
      case "FULL_RESET":
        penalties.push({
          type: "FULL_RESET",
          amount: session.baseScore,
          description: "Session reset - all progress lost",
        });
        break;
    }
    const recoveryCount = session.recoveryAttempts;
    if (recoveryCount > 0) {
      penalties.push({
        type: "RECOVERY_STREAK_PENALTY",
        amount: Math.floor(session.baseScore * 0.05 * recoveryCount),
        description: `Multiple recoveries (${recoveryCount + 1})`,
      });
    }
    return penalties;
  }
  canProtectStreak(session: SessionState): {
    canProtect: boolean;
    reason?: string;
    protectionType?: "STREAK_FREEZE" | "GRACE_PERIOD" | "NONE";
  } {
    if (!this.config.streakProtectionEnabled) {
      return { canProtect: false, reason: "Streak protection disabled" };
    }
    if (session.completionPercentage >= 50) {
      return { canProtect: true, protectionType: "STREAK_FREEZE" };
    }
    const minTime =
      session.config.duration * 1000 * this.config.partialCreditThreshold;
    if (session.effectiveTime >= minTime) {
      return { canProtect: true, protectionType: "GRACE_PERIOD" };
    }
    return { canProtect: false, reason: "Insufficient session completion" };
  }
  protectStreak(session: SessionState): boolean {
    const protection = this.canProtectStreak(session);
    if (!protection.canProtect) {
      debug.warn(
        "Cannot protect streak for session %s: %s",
        session.id,
        protection.reason,
      );
      return false;
    }
    debug.info(
      "Streak protected for session %s (type: %s)",
      session.id,
      protection.protectionType,
    );
    return true;
  }
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
      return { eligible: true, completionPercentage: 50, scoreMultiplier: 0.3 };
    }
    return {
      eligible: false,
      completionPercentage: session.completionPercentage,
      scoreMultiplier: 0,
      reason: "Insufficient session completion for credit",
    };
  }
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
    return this.getRecoveryHistory(sessionId).filter((r) => r.success);
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
  handleInterruption(
    session: SessionState,
    interruption: InterruptionRecord,
    onRecover: () => void,
  ): { autoRecoverScheduled: boolean; canAutoRecover: boolean } {
    const canAutoRecover = this.canAutoRecover(session, interruption);
    let autoRecoverScheduled = false;
    if (canAutoRecover) {
      autoRecoverScheduled = this.scheduleAutoRecovery(session, onRecover);
    }
    return { autoRecoverScheduled, canAutoRecover };
  }
  private canAutoRecover(
    session: SessionState,
    interruption: InterruptionRecord,
  ): boolean {
    if (interruption.severity === "MINOR") {
      return true;
    }
    if (interruption.severity === "MODERATE") {
      return (
        this.getRecoveryCount(session.id) < this.config.maxRecoveriesPerSession
      );
    }
    return false;
  }
  updateConfig(config: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...config };
    debug.info("RecoveryService config updated");
  }
  getConfig(): RecoveryConfig {
    return { ...this.config };
  }
  destroy(): void {
    this.clearHistory();
    debug.info("RecoveryService destroyed");
  }
}
export function createRecoveryService(
  config?: Partial<RecoveryConfig>,
): RecoveryService {
  return new RecoveryService(config);
}
let serviceInstance: RecoveryService | null = null;
export function getRecoveryService(
  config?: Partial<RecoveryConfig>,
): RecoveryService {
  if (!serviceInstance) {
    serviceInstance = new RecoveryService(config);
  }
  return serviceInstance;
}
