/**
 * Session Validation Utilities
 *
 * Comprehensive validation for session operations.
 * Ensures data integrity and catches edge cases early.
 *
 * @phase 1 - Deepening: Validation layer
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:validation');

// ============================================================================
// Validation Result Types
// ============================================================================
// ============================================================================
// Schemas
// ============================================================================

const SessionDurationSchema = z.number()
  .min(60, 'Session must be at least 1 minute')
  .max(86400, 'Session cannot exceed 24 hours');

const SessionNameSchema = z.string()
  .min(1, 'Session name is required')
  .max(100, 'Session name must be 100 characters or less');

const IntervalSchema = z.number()
  .int()
  .min(1, 'Must have at least 1 interval')
  .max(20, 'Cannot exceed 20 intervals');
// ============================================================================
// Main Validation Function
// ============================================================================
// ============================================================================
// Logical Validation (Business Rules)
// ============================================================================

function performLogicalValidation(
  config: SessionValidationInput
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Warn about very long sessions without breaks
  if (config.duration > 7200 && !config.breakDuration) {
    warnings.push({
      field: 'breakDuration',
      message: 'Sessions over 2 hours should include breaks to maintain focus quality',
      code: 'LONG_SESSION_NO_BREAK',
    });
  }

  // Warn about many intervals with short duration
  const avgIntervalDuration = config.duration / config.intervals;
  if (config.intervals > 4 && avgIntervalDuration < 600) {
    warnings.push({
      field: 'intervals',
      message: `Short intervals (${Math.floor(avgIntervalDuration / 60)}m each) may reduce deep focus quality`,
      code: 'SHORT_INTERVALS',
    });
  }

  // Warn about strict mode without DND
  if (config.strictMode && !config.dndEnabled) {
    warnings.push({
      field: 'dndEnabled',
      message: 'Strict mode works best with Do Not Disturb enabled',
      code: 'STRICT_WITHOUT_DND',
    });
  }

  // Warn about auto-start with short breaks
  if (config.autoStartBreaks && config.breakDuration < 300) {
    warnings.push({
      field: 'breakDuration',
      message: 'Auto-starting with short breaks may not provide adequate recovery',
      code: 'SHORT_AUTO_BREAKS',
    });
  }

  return warnings;
}

// ============================================================================
// Specialized Validators
// ============================================================================
// ============================================================================
// Field-level Validators
// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================
// ============================================================================
// Export
// ============================================================================
export default SessionValidation;

export * from "./validation.types";
export * from "./validation.part1";
export * from "./validation.part2";
