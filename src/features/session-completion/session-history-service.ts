import * as Sentry from '@sentry/react-native';
import { createSessionRecord } from '../session-history/repository';
import type { CompletionLedger } from './schemas';

export async function recordCompletedSession(ledger: CompletionLedger): Promise<void> {
  try {
    await createSessionRecord({
      sessionId: ledger.sessionId,
      userId: ledger.userId,
      status: 'completed',
      duration: ledger.targetDurationSeconds,
      effectiveDuration: ledger.effectiveFocusedSeconds,
      qualityScore: ledger.qualityScore,
      mode: ledger.mode,
      difficulty: null,
      metadata: {},
      startedAt: new Date(ledger.startedAt).toISOString(),
      completedAt: new Date(ledger.completedAt).toISOString(),
      endedAt: new Date(ledger.completedAt).toISOString(),
    });
  } catch (error: unknown) {
    Sentry.captureException(error, { tags: { feature: 'session-history-completion' } });
    throw error;
  }
}
