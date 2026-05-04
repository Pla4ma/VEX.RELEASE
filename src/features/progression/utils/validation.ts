/**
 * Progression Validation Utilities
 *
 * Comprehensive validation for XP, levels, and rewards.
 * Anti-cheat detection and edge case handling.
 *
 * @phase 3 - Deepening: Progression validation
 */

import { z } from 'zod';
import { createDebugger } from '../../../utils/debug';
import { eventBus } from '../../../events';

const debug = createDebugger('progression:validation');

// ============================================================================
// XP Validation Schemas
// ============================================================================

export const XPSourceSchema = z.enum([
  'SESSION_COMPLETE',
  'SESSION_QUALITY',
  'STREAK_BONUS',
  'CHALLENGE_COMPLETE',
  'BOSS_DAMAGE',
  'BOSS_DEFEAT',
  'ACHIEVEMENT_UNLOCK',
  'DAILY_LOGIN',
  'REFERRAL',
  'PROMOTION',
  'ADMIN_GRANT',
  'REFUND',
]);

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

export type XPTransaction = z.infer<typeof XPTransactionSchema>;

// ============================================================================
// Validation Rules
// ============================================================================

const MAX_XP_PER_SESSION = 10000; // Cap for sanity
const MAX_XP_PER_HOUR = 15000; // Rate limiting
const MAX_STREAK_BONUS_MULTIPLIER = 5; // Max 5x streak bonus
const MAX_QUALITY_BONUS = 3; // Max 3x quality bonus

// ============================================================================
// Validation Result Types
// ============================================================================

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  violations: Violation[];
  warnings: Warning[];
  riskScore: number; // 0-100
}

export interface Violation {
  type: 'RATE_LIMIT' | 'IMPOSSIBLE' | 'SUSPICIOUS' | 'POLICY';
  field: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, unknown>;
}

export interface Warning {
  field: string;
  message: string;
  code: string;
}

// ============================================================================
// Core Validation Functions
// ============================================================================

/**
 * Validate XP transaction for anti-cheat
 */
export function validateXPTransaction(
  transaction: XPTransaction,
  userHistory: {
    recentTransactions: XPTransaction[];
    currentLevel: number;
    currentXP: number;
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  }
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
  const recentXP = userHistory.recentTransactions
    .filter(t => t.timestamp > oneHourAgo)
    .reduce((sum, t) => sum + t.amount, 0);

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
  const isDuplicate = userHistory.recentTransactions.some(
    t => t.sourceId === transaction.sourceId && t.source === transaction.source
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

/**
 * Validate level up calculation
 */
export function validateLevelUp(
  currentLevel: number,
  currentXP: number,
  newXP: number,
  levelCurve: number[]
): ValidationResult<{ newLevel: number; levelsGained: number }> {
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

// ============================================================================
// Source-Specific Validation
// ============================================================================

function validateSourceSpecific(
  transaction: XPTransaction,
  userHistory: {
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  },
  result: ValidationResult<XPTransaction>
): void {
  switch (transaction.source) {
    case 'SESSION_COMPLETE':
      validateSessionXP(transaction, userHistory, result);
      break;
    case 'STREAK_BONUS':
      validateStreakBonus(transaction, result);
      break;
    case 'SESSION_QUALITY':
      validateQualityBonus(transaction, result);
      break;
    case 'BOSS_DAMAGE':
      validateBossDamageXP(transaction, result);
      break;
  }
}

function validateSessionXP(
  transaction: XPTransaction,
  userHistory: { sessionHistory: { duration: number; xp: number; timestamp: number }[] },
  result: ValidationResult<XPTransaction>
): void {
  // Find matching session
  const session = userHistory.sessionHistory.find(
    s => Math.abs(s.timestamp - transaction.timestamp) < 60000
  );

  if (!session) {
    result.warnings.push({
      field: 'sourceId',
      message: 'No matching session found for session XP',
      code: 'ORPHAN_SESSION_XP',
    });
    return;
  }

  // Check XP per minute ratio
  const xpPerMinute = transaction.amount / (session.duration / 60000);
  const maxXPPerMinute = 100; // 100 XP per minute max

  if (xpPerMinute > maxXPPerMinute) {
    result.violations.push({
      type: 'SUSPICIOUS',
      field: 'amount',
      message: `XP per minute ratio too high: ${xpPerMinute.toFixed(1)} XP/min`,
      severity: 'HIGH',
      details: { xpPerMinute, maxAllowed: maxXPPerMinute, duration: session.duration },
    });
    result.riskScore += 30;
  }

  // Check for very short sessions with high XP
  if (session.duration < 60000 && transaction.amount > 100) {
    result.violations.push({
      type: 'SUSPICIOUS',
      field: 'amount',
      message: 'High XP for very short session',
      severity: 'MEDIUM',
      details: { duration: session.duration, xp: transaction.amount },
    });
    result.riskScore += 15;
  }
}

function validateStreakBonus(
  transaction: XPTransaction,
  result: ValidationResult<XPTransaction>
): void {
  // Extract multiplier from metadata
  const multiplier = transaction.metadata?.multiplier as number | undefined;

  if (multiplier && multiplier > MAX_STREAK_BONUS_MULTIPLIER) {
    result.violations.push({
      type: 'POLICY',
      field: 'metadata.multiplier',
      message: `Streak multiplier ${multiplier} exceeds maximum ${MAX_STREAK_BONUS_MULTIPLIER}`,
      severity: 'MEDIUM',
      details: { multiplier, max: MAX_STREAK_BONUS_MULTIPLIER },
    });
    result.riskScore += 20;
  }
}

function validateQualityBonus(
  transaction: XPTransaction,
  result: ValidationResult<XPTransaction>
): void {
  const multiplier = transaction.metadata?.qualityMultiplier as number | undefined;

  if (multiplier && multiplier > MAX_QUALITY_BONUS) {
    result.violations.push({
      type: 'POLICY',
      field: 'metadata.qualityMultiplier',
      message: `Quality multiplier ${multiplier} exceeds maximum ${MAX_QUALITY_BONUS}`,
      severity: 'MEDIUM',
      details: { multiplier, max: MAX_QUALITY_BONUS },
    });
    result.riskScore += 20;
  }
}

function validateBossDamageXP(
  transaction: XPTransaction,
  result: ValidationResult<XPTransaction>
): void {
  const damage = transaction.metadata?.damage as number | undefined;

  if (damage) {
    // Typical ratio: 1 XP per 10 damage
    const expectedXP = damage / 10;
    const ratio = transaction.amount / expectedXP;

    if (ratio > 3) {
      result.violations.push({
        type: 'SUSPICIOUS',
        field: 'amount',
        message: `Boss XP ratio suspicious: ${ratio.toFixed(1)}x expected`,
        severity: 'HIGH',
        details: { damage, expectedXP, actualXP: transaction.amount, ratio },
      });
      result.riskScore += 25;
    }
  }
}

// ============================================================================
// Prestige Validation
// ============================================================================

export function validatePrestige(
  currentLevel: number,
  currentPrestige: number,
  minLevelForPrestige: number = 100
): ValidationResult<{ canPrestige: boolean; prestigeLevel: number }> {
  const result: ValidationResult<{ canPrestige: boolean; prestigeLevel: number }> = {
    valid: true,
    violations: [],
    warnings: [],
    riskScore: 0,
  };

  if (currentLevel < minLevelForPrestige) {
    result.valid = false;
    result.violations.push({
      type: 'POLICY',
      field: 'currentLevel',
      message: `Must be level ${minLevelForPrestige} to prestige (currently ${currentLevel})`,
      severity: 'MEDIUM',
    });
    result.data = { canPrestige: false, prestigeLevel: currentPrestige };
    return result;
  }

  const MAX_PRESTIGE = 10;
  if (currentPrestige >= MAX_PRESTIGE) {
    result.valid = false;
    result.violations.push({
      type: 'POLICY',
      field: 'currentPrestige',
      message: `Maximum prestige level (${MAX_PRESTIGE}) already reached`,
      severity: 'MEDIUM',
    });
    result.data = { canPrestige: false, prestigeLevel: currentPrestige };
    return result;
  }

  result.data = {
    canPrestige: true,
    prestigeLevel: currentPrestige + 1,
  };

  return result;
}

// ============================================================================
// Batch Validation
// ============================================================================

export function validateXPBatch(
  transactions: XPTransaction[],
  userHistory: {
    recentTransactions: XPTransaction[];
    currentLevel: number;
    currentXP: number;
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  }
): ValidationResult<{ valid: XPTransaction[]; rejected: XPTransaction[] }> {
  const result: ValidationResult<{ valid: XPTransaction[]; rejected: XPTransaction[] }> = {
    valid: true,
    violations: [],
    warnings: [],
    riskScore: 0,
    data: { valid: [], rejected: [] },
  };

  let totalRiskScore = 0;

  for (const transaction of transactions) {
    const validation = validateXPTransaction(transaction, userHistory);

    if (validation.valid && validation.riskScore < 30) {
      result.data!.valid.push(transaction);
    } else {
      result.data!.rejected.push(transaction);
    }

    totalRiskScore += validation.riskScore;
  }

  // Average risk score
  result.riskScore = transactions.length > 0 ? totalRiskScore / transactions.length : 0;

  // Batch-level checks
  const totalXP = result.data!.valid.reduce((sum, t) => sum + t.amount, 0);
  if (totalXP > MAX_XP_PER_HOUR * 2) {
    result.violations.push({
      type: 'RATE_LIMIT',
      field: 'batch',
      message: `Batch total XP ${totalXP} exceeds safe threshold`,
      severity: 'HIGH',
      details: { totalXP, threshold: MAX_XP_PER_HOUR * 2 },
    });
    result.riskScore = Math.min(100, result.riskScore + 20);
  }

  if (result.riskScore > 50) {
    result.valid = false;
  }

  return result;
}

// ============================================================================
// Export
// ============================================================================

export const ProgressionValidation = {
  validateXPTransaction,
  validateLevelUp,
  validatePrestige,
  validateXPBatch,
};

export default ProgressionValidation;
