import { captureSilentFailure } from "../../utils/silent-failure";
import { z } from "zod";


export function truncateString(
  input: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (input.length <= maxLength) {return input;}
  return input.slice(0, maxLength - suffix.length) + suffix;
}

export function formatNumber(
  value: number,
  options: {
    decimals?: number;
    compact?: boolean;
    locale?: string;
  } = {}
): string {
  const { decimals = 0, compact = false, locale = 'en-US' } = options;

  if (compact && Math.abs(value) >= 1000) {
    return Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: decimals,
    }).format(value);
  }

  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function parseNumber(value: unknown): number | null {
  if (typeof value === 'number') {return value;}
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function validateArray<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T,
  options: {
    minLength?: number;
    maxLength?: number;
    unique?: boolean;
    uniqueKey?: keyof T;
  } = {}
): { valid: boolean; data: T[]; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(value)) {
    return { valid: false, data: [], errors: ['Value is not an array'] };
  }

  const validItems: T[] = [];
  const invalidIndices: number[] = [];

  value.forEach((item, index) => {
    if (itemValidator(item)) {
      validItems.push(item);
    } else {
      invalidIndices.push(index);
    }
  });

  if (invalidIndices.length > 0) {
    errors.push(`Invalid items at indices: ${invalidIndices.join(', ')}`);
  }

  // Check length constraints
  if (options.minLength !== undefined && validItems.length < options.minLength) {
    errors.push(`Array must have at least ${options.minLength} items`);
  }
  if (options.maxLength !== undefined && validItems.length > options.maxLength) {
    errors.push(`Array must have at most ${options.maxLength} items`);
  }

  // Check uniqueness
  if (options.unique) {
    if (options.uniqueKey) {
      const seen = new Set<unknown>();
      validItems.forEach((item, index) => {
        const key = item[options.uniqueKey!];
        if (seen.has(key)) {
          errors.push(`Duplicate value at index ${index} for key ${String(options.uniqueKey)}`);
        }
        seen.add(key);
      });
    } else {
      const seen = new Set(validItems);
      if (seen.size !== validItems.length) {
        errors.push('Array contains duplicate values');
      }
    }
  }

  return {
    valid: errors.length === 0,
    data: validItems,
    errors,
  };
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

export function validateDateRange(
  start: Date,
  end: Date,
  options: {
    maxDuration?: number; // milliseconds
    allowSame?: boolean;
  } = {}
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isValidDate(start)) {
    errors.push('Start date is invalid');
  }
  if (!isValidDate(end)) {
    errors.push('End date is invalid');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (end < start) {
    errors.push('End date must be after start date');
  }

  if (!options.allowSame && end.getTime() === start.getTime()) {
    errors.push('Start and end dates must be different');
  }

  if (options.maxDuration) {
    const duration = end.getTime() - start.getTime();
    if (duration > options.maxDuration) {
      errors.push(`Duration exceeds maximum of ${options.maxDuration}ms`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function isValidURL(value: unknown): value is string {
  if (typeof value !== 'string') {return false;}

  try {
    new URL(value);
    return true;
  } catch (error) { captureSilentFailure(error, { feature: 'shared', operation: 'safe-fallback', type: 'data' });
    return false;
  }
}