import * as Sentry from '@sentry/react-native';
import { enqueue } from '../../lib/offline/queue';
import { saveCompletionOutcome } from './completion-ledger-repository';
import type { CompletionLedger } from './schemas';

export async function retainCompletionOutcome(ledger: CompletionLedger, isOnline: boolean): Promise<CompletionLedger> {
  let retained = ledger;
  if (isOnline && ledger.offlineSyncStatus !== 'pending_sync') {
    try { retained = await saveCompletionOutcome(ledger); }
    catch (error: unknown) {
      Sentry.captureException(error, { tags: { feature: 'session-completion', operation: 'retain-outcome' } });
      retained = { ...ledger, offlineSyncStatus: 'pending_sync' };
    }
  }
  if (retained.degradedSystems.length > 0 || retained.offlineSyncStatus !== 'synced') {
    enqueue({ feature: 'sessions', operation: 'CREATE', payload: { ledger: retained },
      userId: retained.userId, idempotencyKey: retained.idempotencyKey, priority: 'high', maxRetries: 10 });
  }
  return retained;
}
