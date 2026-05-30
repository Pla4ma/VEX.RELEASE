import type { ProgressionError } from "./types";

export function createProgressionError(
  code: ProgressionError["code"],
  message: string,
  retryable: boolean,
  context?: Record<string, unknown>,
): ProgressionError {
  return { code, message, retryable, context };
}
