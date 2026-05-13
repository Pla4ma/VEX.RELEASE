import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";


export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

export function isValidEmail(value: unknown): value is string {
  if (typeof value !== 'string') {return false;}
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isValidUUID(value: unknown): value is string {
  if (typeof value !== 'string') {return false;}
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateRange(
  value: number,
  min: number,
  max: number,
  options: {
    inclusive?: boolean;
    integer?: boolean;
    name?: string;
  } = {}
): RangeValidationResult {
  const { inclusive = true, integer = false, name = 'value' } = options;
  const violations: string[] = [];

  if (isNaN(value)) {
    return {
      valid: false,
      clamped: min,
      violations: [`${name} is not a valid number`],
    };
  }

  let clamped = value;

  // Check bounds
  if (inclusive) {
    if (value < min) {
      violations.push(`${name} must be at least ${min}`);
      clamped = min;
    }
    if (value > max) {
      violations.push(`${name} must be at most ${max}`);
      clamped = max;
    }
  } else {
    if (value <= min) {
      violations.push(`${name} must be greater than ${min}`);
      clamped = min + (max - min) * 0.001;
    }
    if (value >= max) {
      violations.push(`${name} must be less than ${max}`);
      clamped = max - (max - min) * 0.001;
    }
  }

  // Check integer
  if (integer && !Number.isInteger(value)) {
    violations.push(`${name} must be a whole number`);
    clamped = Math.round(clamped);
  }

  return {
    valid: violations.length === 0,
    clamped,
    violations,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: [],
      fieldErrors: {},
    };
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

  return {
    success: false,
    errors,
    fieldErrors,
  };
}

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): ValidationResult<T> => validateSchema(schema, data);
}

export function sanitizeString(
  input: string,
  options: {
    maxLength?: number;
    trim?: boolean;
    lowercase?: boolean;
    removeSpecialChars?: boolean;
  } = {}
): string {
  let result = input;

  if (options.trim !== false) {
    result = result.trim();
  }

  if (options.lowercase) {
    result = result.toLowerCase();
  }

  if (options.removeSpecialChars) {
    result = result.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  if (options.maxLength && result.length > options.maxLength) {
    result = result.slice(0, options.maxLength);
  }

  return result;
}