import { z } from "zod";
import { createDebugger } from "../../utils/debug";


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