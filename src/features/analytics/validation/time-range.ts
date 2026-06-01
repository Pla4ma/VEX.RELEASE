import type { ValidationError, ValidationResult } from './types';

export function validateTimeRange(
  startDate: number,
  endDate: number,
  maxRangeDays: number = 365,
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  if (!Number.isFinite(startDate) || startDate < 0) {
    errors.push({
      field: 'startDate',
      code: 'INVALID_TIMESTAMP',
      message: 'Start date must be a valid timestamp',
      severity: 'error',
      recoveryHint: 'Use Date.now() or new Date().getTime()',
      value: startDate,
    });
  }

  if (!Number.isFinite(endDate) || endDate < 0) {
    errors.push({
      field: 'endDate',
      code: 'INVALID_TIMESTAMP',
      message: 'End date must be a valid timestamp',
      severity: 'error',
      recoveryHint: 'Use Date.now() or new Date().getTime()',
      value: endDate,
    });
  }

  if (startDate >= endDate) {
    errors.push({
      field: 'dateRange',
      code: 'INVERTED_RANGE',
      message: 'Start date must be before end date',
      severity: 'error',
      recoveryHint: 'Swap start and end dates',
    });
  }

  const now = Date.now();

  if (endDate > now + 60000) {
    warnings.push({
      field: 'endDate',
      code: 'FUTURE_DATE',
      message: 'End date is in the future',
      severity: 'warning',
      recoveryHint: 'Use current time or past dates for historical data',
      value: endDate,
    });
  }

  const rangeDays = (endDate - startDate) / (24 * 60 * 60 * 1000);
  if (rangeDays > maxRangeDays) {
    errors.push({
      field: 'dateRange',
      code: 'RANGE_TOO_LARGE',
      message: `Date range exceeds maximum of ${maxRangeDays} days`,
      severity: 'error',
      recoveryHint: `Reduce range to ${maxRangeDays} days or less`,
      value: rangeDays,
    });
  }

  const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
  if (startDate < oneYearAgo && rangeDays > 30) {
    warnings.push({
      field: 'startDate',
      code: 'VERY_OLD_DATA',
      message: 'Querying data older than 1 year may be slow',
      severity: 'warning',
      recoveryHint: 'Consider using aggregated stats for historical data',
      value: startDate,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sanitized:
      errors.length === 0 ? { startDate, endDate, rangeDays } : undefined,
  };
}
