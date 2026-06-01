import type { ValidationError, ValidationResult } from "./validation-types";
import { FieldValidators } from "./field-validators";
import {
  validateSessionStart,
  validateSessionPause,
  validateSessionCompletion,
} from "./session-lifecycle-validators";

export type { SessionValidationInput } from "./session-config-validator";
export { SessionValidationSchema, validateSessionConfig } from "./session-config-validator";

export type {
  ValidationError,
  ValidationWarning,
  ValidationResult,
} from "./validation-types";
export { FieldValidators } from "./field-validators";
export {
  validateSessionStart,
  validateSessionPause,
  validateSessionCompletion,
} from "./session-lifecycle-validators";

import { validateSessionConfig } from "./session-config-validator";

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map((e) => `${e.field}: ${e.message}`).join("; ");
}

export function hasErrors(result: ValidationResult<unknown>): boolean {
  return !result.success || result.errors.length > 0;
}

export function hasWarnings(result: ValidationResult<unknown>): boolean {
  return result.warnings.length > 0;
}

export function getFirstError(
  result: ValidationResult<unknown>,
): ValidationError | null {
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

export default SessionValidation;
