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
// ============================================================================
// Core Validation Functions
// ============================================================================
// ============================================================================
// Source-Specific Validation
// ============================================================================

function validateSourceSpecific(
  transaction: XPTransaction,
  userHistory: {
    sessionHistory: { duration: number; xp: number; timestamp: number }[];
  },
  result: ValidationResult<XPTransaction>,
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

function validateSessionXP(transaction: XPTransaction, userHistory: { sessionHistory: { duration: number; xp: number; timestamp: number }[] }, result: ValidationResult<XPTransaction>): void {
  // Find matching session
  const session = userHistory.sessionHistory.find((s) => Math.abs(s.timestamp - transaction.timestamp) < 60000);

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

function validateStreakBonus(transaction: XPTransaction, result: ValidationResult<XPTransaction>): void {
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

function validateQualityBonus(transaction: XPTransaction, result: ValidationResult<XPTransaction>): void {
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

function validateBossDamageXP(transaction: XPTransaction, result: ValidationResult<XPTransaction>): void {
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
// ============================================================================
// Batch Validation
// ============================================================================
// ============================================================================
// Export
// ============================================================================
export default ProgressionValidation;

export * from "./validation.types";
export * from "./validation.part1";
export * from "./validation.part2";
