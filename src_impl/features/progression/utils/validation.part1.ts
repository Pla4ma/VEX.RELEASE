import { z } from "zod";
import { createDebugger } from "../../../utils/debug";
import { eventBus } from "../../../events";


export const XPSourceSchema = z.enum(['SESSION_COMPLETE', 'SESSION_QUALITY', 'STREAK_BONUS', 'CHALLENGE_COMPLETE', 'BOSS_DAMAGE', 'BOSS_DEFEAT', 'ACHIEVEMENT_UNLOCK', 'DAILY_LOGIN', 'REFERRAL', 'PROMOTION', 'ADMIN_GRANT', 'REFUND']);

export const XPTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.number().int().min(0),
  source: XPSourceSchema,
  sourceId: z.string().optional(), // e.g., sessionId, challengeId
  timestamp: z.number(),
  metadata: z.record(z.unknown()).optional(),
  applied: z.boolean().default(false),
});

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

  // Validate schema
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

  // Check 1: Per-session cap
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

  // Check 2: Hourly rate limit
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const recentXP = userHistory.recentTransactions.filter((t) => t.timestamp > oneHourAgo).reduce((sum, t) => sum + t.amount, 0);

  if (recentXP + transaction.amount > MAX_XP_PER_HOUR) {
    result.violations.push({
      type: 'RATE_LIMIT',
      field: 'amount',
      message: `Hourly XP cap exceeded: ${recentXP + transaction.amount}/${MAX_XP_PER_HOUR}`,
      severity: 'HIGH',
      details: { recentXP, newAmount: transaction.amount, limit: MAX_XP_PER_HOUR },
    });
    result.riskScore += 35;
  }

  // Check 3: Source-specific validation
  validateSourceSpecific(transaction, userHistory, result);

  // Check 4: Timing validation (prevent backdating)
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

  // Check 5: Duplicate detection
  const isDuplicate = userHistory.recentTransactions.some((t) => t.sourceId === transaction.sourceId && t.source === transaction.source);
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

  // Finalize
  if (result.riskScore > 50) {
    result.valid = false;
  }

  // Track analytics
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

export function validateLevelUp(currentLevel: number, currentXP: number, newXP: number, levelCurve: number[]): ValidationResult<{ newLevel: number; levelsGained: number }> {
  const result: ValidationResult<{ newLevel: number; levelsGained: number }> = {
    valid: true,
    violations: [],
    warnings: [],
    riskScore: 0,
  };

  // Sanity checks
  if (currentLevel < 1) {
    result.violations.push({
      type: 'IMPOSSIBLE',
      field: 'currentLevel',
      message: 'Current level cannot be less than 1',
      severity: 'CRITICAL',
    });
    result.valid = false;
    result.riskScore = 100;
    return result;
  }

  if (currentXP < 0 || newXP < 0) {
    result.violations.push({
      type: 'IMPOSSIBLE',
      field: 'xp',
      message: 'XP values cannot be negative',
      severity: 'CRITICAL',
    });
    result.valid = false;
    result.riskScore = 100;
    return result;
  }

  if (newXP < currentXP) {
    result.violations.push({
      type: 'SUSPICIOUS',
      field: 'newXP',
      message: 'New XP is less than current XP (possible rollback attempt)',
      severity: 'HIGH',
    });
    result.riskScore += 40;
  }

  // Calculate expected level
  let level = 1;
  let xpNeeded = 0;

  for (let i = 0; i < levelCurve.length; i++) {
    xpNeeded += levelCurve[i];
    if (newXP >= xpNeeded) {
      level = i + 2;
    } else {
      break;
    }
  }

  const levelsGained = level - currentLevel;

  // Check for massive level jumps
  if (levelsGained > 10) {
    result.violations.push({
      type: 'SUSPICIOUS',
      field: 'levelsGained',
      message: `Large level jump detected: +${levelsGained} levels`,
      severity: 'MEDIUM',
    });
    result.riskScore += 25;
  }

  // Check max level
  const MAX_LEVEL = 100;
  if (level > MAX_LEVEL) {
    result.violations.push({
      type: 'POLICY',
      field: 'newLevel',
      message: `Level ${level} exceeds maximum ${MAX_LEVEL}`,
      severity: 'MEDIUM',
    });
    level = MAX_LEVEL;
  }

  result.data = { newLevel: level, levelsGained };

  if (result.riskScore > 50) {
    result.valid = false;
  }

  return result;
}