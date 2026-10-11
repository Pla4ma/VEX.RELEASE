import {
  getCompletionLedgerBySessionId,
  SessionCompletionRepositoryError,
} from './repository';
import {
  SessionCompletionNavigationParamsSchema,
  type SessionCompletionNavigationParams,
} from './schemas';
import { buildSessionSummaryFromCompletionLedger } from './session-summary-builder';

export class CompletionRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompletionRecoveryError';
  }
}

export async function recoverSessionCompletion(
  sessionId: string,
  userId: string,
): Promise<SessionCompletionNavigationParams> {
  const ledger = await getCompletionLedgerBySessionId(sessionId);
  if (!ledger) {
    throw new CompletionRecoveryError('Completion record not found');
  }
  if (ledger.userId !== userId) {
    throw new CompletionRecoveryError('Completion record belongs to another user');
  }
  return SessionCompletionNavigationParamsSchema.parse({
    sessionId: ledger.sessionId,
    summary: buildSessionSummaryFromCompletionLedger(ledger),
  });
}

export function isCompletionRecoveryError(
  error: unknown,
): error is CompletionRecoveryError | SessionCompletionRepositoryError {
  return error instanceof CompletionRecoveryError || error instanceof SessionCompletionRepositoryError;
}
