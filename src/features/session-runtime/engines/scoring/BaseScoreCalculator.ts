/**
 * Base Score Calculator
 *
 * Calculates base score from session duration and completion.
 * Pure calculation logic, no side effects.
 */

import type { SessionState } from '../../types';

// ============================================================================
// Scoring Constants
// ============================================================================

export const SCORING_CONSTANTS = {
  BASE_SCORE_PER_MINUTE: 10,
  MIN_COMPLETION_PERCENTAGE: 50, // Must complete 50% to get any score
  MAX_BASE_SCORE: 1000,
  MIN_BASE_SCORE: 0,
} as const;

// ============================================================================
// Base Score Calculation
// ============================================================================

export interface BaseScoreInput {
  durationSeconds: number;
  completionPercentage: number;
  effectiveTimeSeconds: number;
}

export interface BaseScoreResult {
  basePoints: number;
  durationPoints: number;
  completionMultiplier: number;
  meetsMinimumCompletion: boolean;
  capped: boolean;
}

export function calculateBaseScore(input: BaseScoreInput): BaseScoreResult {
  const { completionPercentage, effectiveTimeSeconds } = input;

  // Check minimum completion threshold
  const meetsMinimumCompletion =
    completionPercentage >= SCORING_CONSTANTS.MIN_COMPLETION_PERCENTAGE;

  if (!meetsMinimumCompletion) {
    return {
      basePoints: 0,
      durationPoints: 0,
      completionMultiplier: 0,
      meetsMinimumCompletion: false,
      capped: false,
    };
  }

  // Calculate duration points (based on effective time, not planned)
  const effectiveMinutes = effectiveTimeSeconds / 60;
  const durationPoints = Math.floor(
    effectiveMinutes * SCORING_CONSTANTS.BASE_SCORE_PER_MINUTE,
  );

  // Completion multiplier (100% = 1.0, 50% = 0.5)
  const completionMultiplier = completionPercentage / 100;

  // Calculate base score
  let basePoints = Math.floor(durationPoints * completionMultiplier);

  // Cap at maximum
  const capped = basePoints > SCORING_CONSTANTS.MAX_BASE_SCORE;
  if (capped) {
    basePoints = SCORING_CONSTANTS.MAX_BASE_SCORE;
  }

  return {
    basePoints,
    durationPoints,
    completionMultiplier,
    meetsMinimumCompletion,
    capped,
  };
}

// ============================================================================
// Session Wrapper
// ============================================================================

export function calculateBaseScoreFromSession(
  session: SessionState,
): BaseScoreResult {
  return calculateBaseScore({
    durationSeconds: session.config.duration,
    completionPercentage: session.completionPercentage,
    effectiveTimeSeconds: session.effectiveTime,
  });
}

// ============================================================================
// Validation
// ============================================================================

export function validateScoringInput(input: BaseScoreInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (input.durationSeconds < 0) {
    errors.push('Duration cannot be negative');
  }

  if (input.durationSeconds > 28800) {
    // 8 hours
    errors.push('Duration exceeds maximum (8 hours)');
  }

  if (input.completionPercentage < 0 || input.completionPercentage > 100) {
    errors.push('Completion percentage must be between 0 and 100');
  }

  if (input.effectiveTimeSeconds < 0) {
    errors.push('Effective time cannot be negative');
  }

  if (input.effectiveTimeSeconds > input.durationSeconds * 2) {
    errors.push('Effective time exceeds reasonable bounds');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Export
// ============================================================================

export const BaseScoreCalculator = {
  calculateBaseScore,
  calculateBaseScoreFromSession,
  validateScoringInput,
  constants: SCORING_CONSTANTS,
};

export default BaseScoreCalculator;
