import type { ProgressionError } from './service-enhanced-types';

export function createProgressionError(
  code: ProgressionError['code'],
  message: string,
  retryable: boolean,
  context?: Record<string, unknown>,
): ProgressionError {
  return { code, message, retryable, context };
}
