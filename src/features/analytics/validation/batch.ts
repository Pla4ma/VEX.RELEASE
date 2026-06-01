import * as Sentry from '@sentry/react-native';
import type { ValidationError, ValidationResult } from './types';

export async function batchValidate<T>(
  items: T[],
  validator: (item: T) => ValidationResult | Promise<ValidationResult>,
  options: {
    continueOnError?: boolean;
    maxErrors?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {},
): Promise<{
  results: Array<{ item: T; result: ValidationResult }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    errors: number;
    warnings: number;
  };
}> {
  const { continueOnError = true, maxErrors = 10, onProgress } = options;
  const results: Array<{ item: T; result: ValidationResult }> = [];
  let errorCount = 0;
  let warningCount = 0;
  let validCount = 0;

  for (let i = 0; i < items.length; i++) {
    try {
      const result = await validator(items[i]!);
      results.push({ item: items[i]!, result });

      if (result.valid) {
        validCount++;
      } else {
        errorCount += result.errors.length;
      }
      warningCount += result.warnings.length;
      onProgress?.(i + 1, items.length);

      if (!continueOnError && errorCount >= maxErrors) {
        Sentry.addBreadcrumb({
          category: 'validation',
          message: `Batch validation stopped early after ${errorCount} errors`,
          level: 'warning',
        });
        break;
      }
    } catch (error) {
      results.push({
        item: items[i]!,
        result: {
          valid: false,
          errors: [
            {
              field: 'unknown',
              code: 'VALIDATION_EXCEPTION',
              message: error instanceof Error ? error.message : 'Unknown error',
              severity: 'error',
            },
          ],
          warnings: [],
        },
      });
      errorCount++;
    }
  }

  return {
    results,
    summary: {
      total: items.length,
      valid: validCount,
      invalid: items.length - validCount,
      errors: errorCount,
      warnings: warningCount,
    },
  };
}

export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map((e) => {
      let msg = `[${e.severity.toUpperCase()}] ${e.field}: ${e.message}`;
      if (e.recoveryHint) {
        msg += ` (Hint: ${e.recoveryHint})`;
      }
      return msg;
    })
    .join('\n');
}
