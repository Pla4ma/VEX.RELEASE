import { offlineSyncService } from './offline-sync-service';
import * as Sentry from '@sentry/react-native';
import { fetchRepairableCompletions } from './completion-ledger-repository';
import { syncCompletionLedger } from './offline-ledger-service';
import { CompletionRepairInputSchema, type CompletionRepairInput } from './completion-repair.schemas';

const repairs = new Map<string, Promise<void>>();

export async function repairPendingCompletion(input: CompletionRepairInput): Promise<void> {
  const parsed = CompletionRepairInputSchema.parse(input);
  const key = `${parsed.userId}:${parsed.sessionId ?? 'pending'}`;
  const existing = repairs.get(key);
  if (existing) { return existing; }
  const operation = repairOwnedCompletions(parsed);
  repairs.set(key, operation);
  try { await operation; }
  finally { repairs.delete(key); }
}

async function repairOwnedCompletions(input: CompletionRepairInput): Promise<void> {
  try {
    const result = await offlineSyncService.forceRetryAll(input.userId);
    const ledgers = await fetchRepairableCompletions(input.userId, input.sessionId);
    if (input.sessionId && ledgers.length === 0) { throw new Error('Your completion receipt is still syncing. Try again.'); }
    for (const ledger of ledgers) {
      if (ledger.userId !== input.userId) { throw new Error('Completion belongs to another account'); }
      if (ledger.degradedSystems.length > 0 || ledger.offlineSyncStatus !== 'synced') {
        await syncCompletionLedger(ledger);
      }
      const status = await offlineSyncService.getSyncStatus(ledger.sessionId);
      if (status.isQueued) { throw new Error('Your completion is still syncing. Try again.'); }
    }
    if (result.failed > 0) { throw new Error(`Completion repair failed for ${result.failed} queued item(s)`); }
  } catch (error: unknown) {
    Sentry.captureException(error, { tags: { feature: 'completion-repair', operation: 'repair-owned' } });
    throw error;
  }
}
