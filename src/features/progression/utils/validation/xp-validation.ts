import { createDebugger } from '../../../../utils/debug';
import { eventBus } from '../../../../events/EventBus';
import {
  XPTransactionSchema,
  type XPTransaction,
  type ValidationResult,
  MAX_XP_PER_SESSION,
  MAX_XP_PER_HOUR,
} from './types';
import { validateSourceSpecific } from './source-validators';

const debug = createDebugger('progression:validation');

export function validateXPTransaction(
  transaction: XPTransaction,
  userHistory: {
    recentTransactions: XPTransaction[];
    currentLevel: number;
    currentXP: number;
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  },
): ValidationResult<XPTransaction> {
  const result: ValidationResult<XPTransaction> = {
    valid: true,
    violations: [],
    warnings: [],
    riskScore: 0,
  };

  // Schema validation
  const schemaResult = XPTransactionSchema.safeParse(transaction);
  if (!schemaResult.success) {
    result.valid = false;
    result.violations.push({
      type: 'POLICY',
      field: 'transaction',
      message: 'Invalid transaction structure',
      severity: 'HIGH',
      details: { errors: schemaResult.error.errors },
    });
    result.riskScore = 100;
    return result;
  }
  result.data = schemaResult.data;

  // Per-session cap
  if (transaction.amount > MAX_XP_PER_SESSION) {
    result.violations.push({
      type: 'IMPOSSIBLE',
      field: 'amount',
      message: `XP amount ${transaction.amount} exceeds maximum ${MAX_XP_PER_SESSION}`,
      severity: 'CRITICAL',
      details: { amount: transaction.amount, max: MAX_XP_PER_SESSION },
    });
    result.riskScore += 40;
  }

  // Hourly rate limit
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentXP = userHistory.recentTransactions
    .filter((t) => t.timestamp > oneHourAgo)
    .reduce((sum, t) => sum + t.amount, 0);

  if (recentXP + transaction.amount > MAX_XP_PER_HOUR) {
    result.violations.push({
      type: 'RATE_LIMIT',
      field: 'amount',
      message: `Hourly XP cap exceeded: ${recentXP + transaction.amount}/${MAX_XP_PER_HOUR}`,
      severity: 'HIGH',
      details: {
        recentXP,
        newAmount: transaction.amount,
        limit: MAX_XP_PER_HOUR,
      },
    });
    result.riskScore += 35;
  }

  // Source-specific checks
  validateSourceSpecific(transaction, userHistory, result);

  // Timestamp drift
  const timeDrift = Date.now() - transaction.timestamp;
  if (timeDrift < 0 || timeDrift > 24 * 60 * 60 * 1000) {
    result.violations.push({
      type: 'SUSPICIOUS',
      field: 'timestamp',
      message: 'Transaction timestamp is suspicious (future or very old)',
      severity: 'MEDIUM',
      details: { timestamp: transaction.timestamp, drift: timeDrift },
    });
    result.riskScore += 20;
  }

  // Duplicate detection
  const isDuplicate = userHistory.recentTransactions.some(
    (t) =>
      t.sourceId === transaction.sourceId && t.source === transaction.source,
  );
  if (isDuplicate) {
    result.violations.push({
      type: 'POLICY',
      field: 'sourceId',
      message: 'Duplicate transaction detected',
      severity: 'MEDIUM',
      details: { sourceId: transaction.sourceId },
    });
    result.riskScore += 15;
  }

  // Final verdict
  if (result.riskScore > 50) {
    result.valid = false;
  }

  // Telemetry
  if (result.violations.length > 0) {
    eventBus.publish('analytics:track', {
      event: 'progression_xp_validation_alert',
      properties: {
        userId: transaction.userId,
        riskScore: result.riskScore,
        violationCount: result.violations.length,
        severity: result.violations[0]?.severity,
      },
    });
  }

  debug.info('XP transaction validated', {
    valid: result.valid,
    riskScore: result.riskScore,
    violations: result.violations.length,
  });

  return result;
}
