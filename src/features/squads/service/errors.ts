/**
 * Squads Service Errors
 */

import type { SquadError } from '../schemas';

export function createError(
  code: SquadError['code'],
  message: string,
  context: Record<string, unknown> = {}
): Error {
  const error = new Error(message) as Error & { code: string; context: Record<string, unknown> };
  error.code = code;
  error.context = context;
  return error;
}
