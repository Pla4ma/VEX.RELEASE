import type {
  SessionState,
  RecoveryRecord,
  RecoveryType,
  InterruptionRecord,
} from '../types';
import { v4 as uuidv4 } from '../../../utils/uuid';

export type { RecoveryConfig } from './recovery-analysis-types';

export function evaluateRecovery(
  session: SessionState,
  recoveryType: RecoveryType,
  penalties: RecoveryRecord['penalties'],
  partialCreditThreshold: number,
): boolean {
  const totalPenalty =
    penalties?.reduce(
      (sum: number, p: { amount: number }) => sum + p.amount,
      0,
    ) || 0;
  const maxAcceptablePenalty = session.baseScore * 0.3;
  switch (recoveryType) {
    case 'AUTO_RESUME':
      return totalPenalty < maxAcceptablePenalty * 0.5;
    case 'USER_RESUME':
      return totalPenalty < maxAcceptablePenalty;
    case 'STREAK_SAVE':
      return session.completionPercentage >= partialCreditThreshold * 100;
    case 'PARTIAL_CREDIT':
      return session.effectiveTime > session.config.duration * 1000 * 0.15;
    case 'FULL_RESET':
      return true;
    default:
      return false;
  }
}

export function calculatePenalties(
  session: SessionState,
  recoveryType: RecoveryType,
): RecoveryRecord['penalties'] {
  const penalties: RecoveryRecord['penalties'] = [];
  switch (recoveryType) {
    case 'AUTO_RESUME':
      penalties.push({
        type: 'AUTO_RECOVERY',
        amount: Math.floor(session.baseScore * 0.02),
        description: 'Auto-recovery penalty',
      });
      break;
    case 'USER_RESUME':
      penalties.push({
        type: 'USER_RESUME',
        amount: Math.floor(session.baseScore * 0.05),
        description: 'Session resumed by user',
      });
      break;
    case 'STREAK_SAVE':
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
      penalties.push({
        type: 'FULL_RESET',
        amount: session.baseScore,
        description: 'Session reset - all progress lost',
      });
      break;
  }
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

export function canProtectStreak(
  session: SessionState,
  streakProtectionEnabled: boolean,
  partialCreditThreshold: number,
): {
  canProtect: boolean;
  reason?: string;
  protectionType?: 'STREAK_FREEZE' | 'GRACE_PERIOD' | 'NONE';
} {
  if (!streakProtectionEnabled) {
    return { canProtect: false, reason: 'Streak protection disabled' };
  }
  if (session.completionPercentage >= 50) {
    return { canProtect: true, protectionType: 'STREAK_FREEZE' };
  }
  const minTime = session.config.duration * 1000 * partialCreditThreshold;
  if (session.effectiveTime >= minTime) {
    return { canProtect: true, protectionType: 'GRACE_PERIOD' };
  }
  return { canProtect: false, reason: 'Insufficient session completion' };
}

export function calculatePartialCredit(
  session: SessionState,
  partialCreditThreshold: number,
): {
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
  if (completionRatio >= partialCreditThreshold) {
    return { eligible: true, completionPercentage: 50, scoreMultiplier: 0.3 };
  }
  return {
    eligible: false,
    completionPercentage: session.completionPercentage,
    scoreMultiplier: 0,
    reason: 'Insufficient session completion for credit',
  };
}

export function attemptSessionRecovery(
  session: SessionState,
  recoveryType: RecoveryType,
  partialCreditThreshold: number,
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
  recovery.penalties = calculatePenalties(session, recoveryType);
  recovery.success = evaluateRecovery(
    session,
    recoveryType,
    recovery.penalties,
    partialCreditThreshold,
  );
  if (recovery.success) {
    session.recoveryAttempts++;
    session.lastRecoveryAt = recovery.attemptedAt;
    for (const penalty of recovery.penalties ?? []) {
      session.damagePoints += penalty.amount;
    }
  }
  return recovery;
}
export function canAutoRecoverForInterruption(
  recoveryCount: number,
  maxRecoveries: number,
  interruptionSeverity: InterruptionRecord['severity'],
): boolean {
  if (interruptionSeverity === 'MINOR') {
    return true;
  }
  if (interruptionSeverity === 'MODERATE') {
    return recoveryCount < maxRecoveries;
  }
  return false;
}
