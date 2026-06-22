import { z } from 'zod';
import {
  isNonEmptyString, isPositiveInteger, isNonNegativeNumber,
  isValidEmail, isValidUUID, isPlainObject,
  isValidDate, isValidURL, isValidImageURL,
} from './type-guards';
import {
  clamp, clamp01, sanitizeString, truncateString, formatNumber, parseNumber,
} from './format-utils';
import {
  validateArray, validateDateRange, validatePassword,
  type PasswordValidationResult,
} from './advanced-validation';

export {
  isNonEmptyString, isPositiveInteger, isNonNegativeNumber,
  isValidEmail, isValidUUID, isPlainObject,
  isValidDate, isValidURL, isValidImageURL,
  clamp, clamp01, sanitizeString, truncateString, formatNumber, parseNumber,
  validateArray, validateDateRange, validatePassword,
  type PasswordValidationResult,
};

export interface RangeValidationResult {
  valid: boolean;
  clamped: number;
  violations: string[];
}

export function validateRange(
  value: number,
  min: number,
  max: number,
  options: { inclusive?: boolean; integer?: boolean; name?: string } = {},
): RangeValidationResult {
  const { inclusive = true, integer = false, name = 'value' } = options;
  const violations: string[] = [];
  if (isNaN(value)) {
    return { valid: false, clamped: min, violations: [`${name} is not a valid number`] };
  }
  let clamped = value;
  if (inclusive) {
    if (value < min) { violations.push(`${name} must be at least ${min}`); clamped = min; }
    if (value > max) { violations.push(`${name} must be at most ${max}`); clamped = max; }
  } else {
    if (value <= min) { violations.push(`${name} must be greater than ${min}`); clamped = min + (max - min) * 0.001; }
    if (value >= max) { violations.push(`${name} must be less than ${max}`); clamped = max - (max - min) * 0.001; }
  }
  if (integer && !Number.isInteger(value)) {
    violations.push(`${name} must be a whole number`);
    clamped = Math.round(clamped);
  }
  return { valid: violations.length === 0, clamped, violations };
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
  fieldErrors: Record<string, string[]>;
}

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, errors: [], fieldErrors: {} };
  }
  const fieldErrors: Record<string, string[]> = {};
  const errors: string[] = [];
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    const message = err.message;
    if (path) {
      fieldErrors[path] = fieldErrors[path] || [];
      fieldErrors[path].push(message);
    }
    errors.push(path ? `${path}: ${message}` : message);
  });
  return { success: false, errors, fieldErrors };
}

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): ValidationResult<T> => validateSchema(schema, data);
}

export {
  isNonEmptyString, isPositiveInteger, isNonNegativeNumber,
  isValidEmail, isValidUUID, isPlainObject,
  validateRange, clamp, clamp01,
  validateSchema, createValidator,
  sanitizeString, truncateString, formatNumber, parseNumber,
  validateArray, isValidDate, validateDateRange,
  isValidURL, isValidImageURL, validatePassword,
};
