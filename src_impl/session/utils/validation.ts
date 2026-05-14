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

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

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

export const SessionValidationSchema = z.object({
  name: SessionNameSchema.optional(),
  duration: SessionDurationSchema,
  intervals: IntervalSchema,
  breakDuration: z.number().min(0).max(3600),
  strictMode: z.boolean(),
  dndEnabled: z.boolean(),
  autoStartBreaks: z.boolean(),
  tags: z.array(z.string().max(30)).max(10),
  goal: z.string().max(500).optional(),
});

export type SessionValidationInput = z.infer<typeof SessionValidationSchema>;

// ============================================================================
// Main Validation Function
// ============================================================================

export function validateSessionConfig(
  config: unknown
): ValidationResult<SessionValidationInput> {
  const result: ValidationResult<SessionValidationInput> = {
    success: false,
    errors: [],
    warnings: [],
  };

  try {
    const parsed = SessionValidationSchema.parse(config);
    result.data = parsed;
    result.success = true;

    // Additional logical validations
    const logicalWarnings = performLogicalValidation(parsed);
    result.warnings = logicalWarnings;

    debug.info('Session config validated successfully', { name: parsed.name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.path.reduce<unknown>((obj, key) =>
          obj && typeof obj === 'object' ? (obj as Record<string, unknown>)[key] : undefined,
          config
        ),
      }));
    } else {
      result.errors.push({
        field: 'unknown',
        message: String(error),
        code: 'UNKNOWN_ERROR',
      });
    }

    debug.warn('Session config validation failed', { errors: result.errors });
  }

  return result;
}

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

/**
 * Validate session can be started
 */
export function validateSessionStart(
  config: unknown,
  userState: {
    isAuthenticated: boolean;
    hasActiveSession: boolean;
    networkStatus: 'online' | 'offline';
    dailySessionCount: number;
    maxDailySessions?: number;
  }
): ValidationResult<SessionValidationInput> {
  const result = validateSessionConfig(config);

  if (!result.success) {return result;}

  // Check user state constraints
  if (!userState.isAuthenticated) {
    result.success = false;
    result.errors.push({
      field: 'user',
      message: 'User must be authenticated to start a session',
      code: 'NOT_AUTHENTICATED',
    });
  }

  if (userState.hasActiveSession) {
    result.success = false;
    result.errors.push({
      field: 'session',
      message: 'User already has an active session',
      code: 'ACTIVE_SESSION_EXISTS',
    });
  }

  if (userState.networkStatus === 'offline') {
    result.warnings.push({
      field: 'network',
      message: 'Offline mode: Session will sync when connection restored',
      code: 'OFFLINE_MODE',
    });
  }

  const maxSessions = userState.maxDailySessions || 50;
  if (userState.dailySessionCount >= maxSessions) {
    result.warnings.push({
      field: 'dailyLimit',
      message: `You've reached ${userState.dailySessionCount} sessions today. Consider quality over quantity.`,
      code: 'DAILY_SESSION_LIMIT',
    });
  }

  return result;
}

/**
 * Validate session pause request
 */
export function validateSessionPause(
  sessionState: {
    status: string;
    elapsedTime: number;
    pauseCount: number;
    strictMode: boolean;
  }
): ValidationResult<void> {
  const result: ValidationResult<void> = {
    success: true,
    errors: [],
    warnings: [],
  };

  if (sessionState.status !== 'ACTIVE') {
    result.success = false;
    result.errors.push({
      field: 'status',
      message: `Cannot pause session in ${sessionState.status} state`,
      code: 'INVALID_STATUS_FOR_PAUSE',
    });
  }

  if (sessionState.strictMode) {
    result.warnings.push({
      field: 'strictMode',
      message: 'Strict mode is enabled. Pausing will affect your purity score.',
      code: 'STRICT_MODE_PAUSE',
    });
  }

  if (sessionState.pauseCount >= 5) {
    result.warnings.push({
      field: 'pauseCount',
      message: `You've paused ${sessionState.pauseCount} times. Frequent pauses reduce session quality.`,
      code: 'EXCESSIVE_PAUSES',
    });
  }

  if (sessionState.elapsedTime < 60) {
    result.warnings.push({
      field: 'elapsedTime',
      message: 'Pausing very early in session may indicate focus issues',
      code: 'EARLY_PAUSE',
    });
  }

  return result;
}

/**
 * Validate session completion
 */
export function validateSessionCompletion(
  sessionState: {
    elapsedTime: number;
    duration: number;
    completionPercentage: number;
    interruptions: number;
    anticheatFlags: number;
  }
): ValidationResult<{ canComplete: boolean; recommendedAction: 'complete' | 'abandon' | 'review' }> {
  const result: ValidationResult<{ canComplete: boolean; recommendedAction: 'complete' | 'abandon' | 'review' }> = {
    success: true,
    errors: [],
    warnings: [],
    data: { canComplete: true, recommendedAction: 'complete' },
  };

  const { elapsedTime, duration, completionPercentage, interruptions, anticheatFlags } = sessionState;

  // Check minimum completion threshold
  if (completionPercentage < 5) {
    result.data = { canComplete: false, recommendedAction: 'abandon' };
    result.warnings.push({
      field: 'completionPercentage',
      message: 'Session completed too quickly. Consider abandoning instead.',
      code: 'MINIMAL_COMPLETION',
    });
  }

  // Check for excessive interruptions
  if (interruptions > 10) {
    result.data!.recommendedAction = 'review';
    result.warnings.push({
      field: 'interruptions',
      message: `High interruption count (${interruptions}) may affect session quality scoring.`,
      code: 'HIGH_INTERRUPTIONS',
    });
  }

  // Check for anti-cheat flags
  if (anticheatFlags > 0) {
    result.data!.recommendedAction = 'review';
    result.warnings.push({
      field: 'anticheat',
      message: `${anticheatFlags} integrity concerns detected. Session may be flagged for review.`,
      code: 'ANTICHEAT_FLAGS',
    });
  }

  // Check for very long sessions (potential挂机)
  if (elapsedTime > duration * 2) {
    result.data!.recommendedAction = 'review';
    result.warnings.push({
      field: 'elapsedTime',
      message: 'Session duration significantly exceeds expected time. Please verify session integrity.',
      code: 'EXCESSIVE_DURATION',
    });
  }

  return result;
}

// ============================================================================
// Field-level Validators
// ============================================================================

export const FieldValidators = {
  duration: (value: number): ValidationError | null => {
    if (value < 60) {
      return {
        field: 'duration',
        message: 'Session must be at least 1 minute',
        code: 'DURATION_TOO_SHORT',
        value,
      };
    }
    if (value > 86400) {
      return {
        field: 'duration',
        message: 'Session cannot exceed 24 hours',
        code: 'DURATION_TOO_LONG',
        value,
      };
    }
    return null;
  },

  name: (value: string): ValidationError | null => {
    if (!value || value.trim().length === 0) {
      return {
        field: 'name',
        message: 'Session name is required',
        code: 'NAME_REQUIRED',
        value,
      };
    }
    if (value.length > 100) {
      return {
        field: 'name',
        message: 'Session name must be 100 characters or less',
        code: 'NAME_TOO_LONG',
        value,
      };
    }
    return null;
  },

  intervals: (value: number, duration: number): ValidationError | null => {
    if (value < 1) {
      return {
        field: 'intervals',
        message: 'Must have at least 1 interval',
        code: 'INTERVALS_TOO_FEW',
        value,
      };
    }
    if (value > 20) {
      return {
        field: 'intervals',
        message: 'Cannot exceed 20 intervals',
        code: 'INTERVALS_TOO_MANY',
        value,
      };
    }
    if (duration / value < 60) {
      return {
        field: 'intervals',
        message: 'Each interval must be at least 1 minute',
        code: 'INTERVALS_TOO_SHORT',
        value,
      };
    }
    return null;
  },
};

// ============================================================================
// Utility Functions
// ============================================================================

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(e => `${e.field}: ${e.message}`).join('; ');
}

export function hasErrors(result: ValidationResult<unknown>): boolean {
  return !result.success || result.errors.length > 0;
}

export function hasWarnings(result: ValidationResult<unknown>): boolean {
  return result.warnings.length > 0;
}

export function getFirstError(result: ValidationResult<unknown>): ValidationError | null {
  return result.errors[0] || null;
}

// ============================================================================
// Export
// ============================================================================

export const SessionValidation = {
  validateConfig: validateSessionConfig,
  validateStart: validateSessionStart,
  validatePause: validateSessionPause,
  validateCompletion: validateSessionCompletion,
  FieldValidators,
  formatErrors: formatValidationErrors,
  hasErrors,
  hasWarnings,
  getFirstError,
};

export default SessionValidation;
