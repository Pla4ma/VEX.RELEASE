/**
 * Session Completion Parameter Parsers
 *
 * Handles parsing and validation of navigation parameters for the session completion flow.
 */

import {
  SessionCompletionNavigationParamsSchema,
  SessionCompletionRecoveryParamsSchema,
  type SessionCompletionNavigationParams,
} from './schemas';

export type ParsedSessionCompletionParams = {
  params: SessionCompletionNavigationParams | null;
  recoverySessionId: string | null;
  warningMessage: string | null;
};

export function parseSessionCompletionParams(
  params: unknown,
): ParsedSessionCompletionParams {
  const parsed = SessionCompletionNavigationParamsSchema.safeParse(params);
  if (parsed.success) {
    return { params: parsed.data, recoverySessionId: null, warningMessage: null };
  }

  const recovery = SessionCompletionRecoveryParamsSchema.safeParse(params);
  if (recovery.success) {
    return {
      params: null,
      recoverySessionId: recovery.data.sessionId,
      warningMessage: 'VEX needs to rebuild this session summary.',
    };
  }

  return {
    params: null,
    recoverySessionId: null,
    warningMessage: 'Session summary is unavailable. Use this safe exit.',
  };
}