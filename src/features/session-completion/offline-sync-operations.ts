import {
  enqueue,
  isProcessing,
  processEntry,
  retryDeadLetter,
  type OfflineQueueEntry,
  type OfflineQueueEntryInput,
} from '../../lib/offline/queue';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
} from './schemas';
import type { SessionCompletionOfflineEntry } from './offline-sync-storage';
import * as Sentry from '@sentry/react-native';
import type {
  DiagnosticsResult,
  ForceRetryResult,
  QueueResult,
  SessionCompletionSyncOptions,
  SyncStatusResult,
} from './offline-sync-types';

export async function queueCompletion(
  ledger: CompletionLedger,
  options: SessionCompletionSyncOptions,
  isOnline: boolean,
  syncImmediately: (ledger: CompletionLedger) => Promise<CompletionLedger>,
): Promise<QueueResult> {
  const { forceSync = false, skipQueue = false, maxRetries = 10 } = options;
  try {
    if (forceSync && !skipQueue && isOnline) {
      await syncImmediately(ledger);
      return { queued: false, synced: true };
    }
    const entry: OfflineQueueEntryInput = {
      operation: 'CREATE',
      feature: 'sessions',
      payload: { ledger },
      idempotencyKey: ledger.idempotencyKey,
      retryCount: 0,
      maxRetries,
      priority: 'high',
    };
    const queuedEntry = enqueue(entry);
    return { queued: true, synced: false, entryId: queuedEntry.id };
  } catch (error) {
    return {
      queued: false,
      synced: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}


export function buildCompletionSyncStatus(
  sessionId: string,
  fallbackEntries: readonly SessionCompletionOfflineEntry[],
  queueEntries: readonly OfflineQueueEntry[],
  lastSyncAt: number,
): SyncStatusResult {
  const fallbackEntry = fallbackEntries.find(
    (entry) => entry.payload.sessionId === sessionId,
  );
  const canonicalEntry = queueEntries.find((entry) => {
    if (entry.feature !== 'sessions' || entry.operation !== 'CREATE') {
      return false;
    }
    const parsed = CompletionLedgerSchema.safeParse(entry.payload.ledger);
    return parsed.success && parsed.data.sessionId === sessionId;
  });
  return {
    status: canonicalEntry?.status === 'dead_letter'
      ? 'failed_sync'
      : fallbackEntry || canonicalEntry ? 'pending_sync' : 'synced',
    isQueued: Boolean(fallbackEntry ?? canonicalEntry),
    hasFallback: Boolean(fallbackEntry),
    lastSyncAt,
  };
}

export async function retryCompletionEntries(
  entries: readonly SessionCompletionOfflineEntry[],
  processEntry: (entry: SessionCompletionOfflineEntry) => Promise<void>,
  recordFailure: (retryCount: number) => void,
  reportFailure: (sessionId: string, error: unknown) => void,
): Promise<ForceRetryResult> {
  let successful = 0;
  let failed = 0;
  for (const entry of entries) {
    try {
      await processEntry(entry);
      successful += 1;
    } catch (error) {
      recordFailure(entry.retryCount);
      reportFailure(entry.payload.sessionId, error);
      failed += 1;
    }
  }
  return { attempted: entries.length, successful, failed };
}

export async function retryCanonicalCompletions(
  entries: readonly OfflineQueueEntry[],
  reportFailure: (sessionId: string, error: unknown) => void,
): Promise<ForceRetryResult> {
  let attempted = 0;
  let successful = 0;
  let failed = 0;
  for (const entry of entries) {
    if (entry.feature !== 'sessions' || entry.operation !== 'CREATE' || isProcessing(entry.id)) {
      continue;
    }
    const ledger = CompletionLedgerSchema.safeParse(entry.payload.ledger);
    if (!ledger.success) { continue; }
    attempted += 1;
    try {
      const candidate = entry.status === 'dead_letter' ? retryDeadLetter(entry.id) : entry;
      if (!candidate) { throw new Error('Queued completion is no longer available'); }
      await processEntry(candidate);
      successful += 1;
    } catch (error: unknown) {
      Sentry.captureException(error, { tags: { feature: 'completion-repair' } });
      reportFailure(ledger.data.sessionId, error);
      failed += 1;
    }
  }
  return { attempted, successful, failed };
}

export async function retryAllCompletions(
  canonicalEntries: readonly OfflineQueueEntry[],
  fallbackEntries: readonly SessionCompletionOfflineEntry[],
  processFallback: (entry: SessionCompletionOfflineEntry) => Promise<void>,
  recordFailure: (retryCount: number) => void,
  reportFailure: (sessionId: string, error: unknown) => void,
): Promise<ForceRetryResult> {
  const canonical = await retryCanonicalCompletions(canonicalEntries, reportFailure);
  const fallback = await retryCompletionEntries(fallbackEntries, processFallback, recordFailure, reportFailure);
  return {
    attempted: canonical.attempted + fallback.attempted,
    successful: canonical.successful + fallback.successful,
    failed: canonical.failed + fallback.failed,
  };
}

export function summarizeQueueDiagnostics(
  diagnostics: DiagnosticsResult,
  queueLength: number,
): DiagnosticsResult {
  return {
    ...diagnostics,
    fallbackEntriesCount: diagnostics.fallbackEntriesCount + queueLength,
  };
}
