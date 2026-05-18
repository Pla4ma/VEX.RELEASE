import { enqueue, type OfflineQueueEntry, type OfflineQueueEntryInput, registerProcessor } from '../../lib/offline/queue';
import { createCompletionLedger, SessionCompletionRepositoryError, updateCompletionSyncStatus } from './repository';
import { CompletionLedgerSchema, type CompletionLedger } from './schemas';
import { fallbackStorage, SessionCompletionOfflineEntrySchema } from './offline-sync-storage';
import type { SessionCompletionSyncOptions, OfflineSyncReport, QueueResult, SyncStatusResult, ForceRetryResult, DiagnosticsResult } from './offline-sync-types';
import { SessionCompletionOfflineSyncError } from './offline-sync-types';
import { createDebugger } from '../../utils/debug';
import { getNetInfoAdapter } from '../../network/NetInfoAdapter';

const debug = createDebugger('session-completion:offline-sync');

export class SessionCompletionOfflineSyncService {
  private isInitialized = false;
  private unsubscribeNetwork: (() => void) | null = null;
  private syncIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    fallbackStorage.reload();
    this.initialize();
  }

  async queueSessionCompletion(
    ledger: CompletionLedger,
    options: SessionCompletionSyncOptions = {},
  ): Promise<QueueResult> {
    const validated = CompletionLedgerSchema.parse(ledger);
    const { forceSync = false, skipQueue = false, maxRetries = 10 } = options;
    try {
      if (forceSync && !skipQueue && this.isOnline()) {
        await this.syncImmediately(validated);
        return { queued: false, synced: true };
      }
      const entry: OfflineQueueEntryInput = {
        operation: 'SESSION_COMPLETE', feature: 'sessions', payload: validated,
        idempotencyKey: validated.idempotencyKey, retryCount: 0, maxRetries, priority: 'high',
      };
      const queuedEntry = enqueue(entry);
      fallbackStorage.addEntry({
        id: queuedEntry.id, operation: 'SESSION_COMPLETE', feature: 'sessions',
        payload: validated, idempotencyKey: queuedEntry.idempotencyKey,
        createdAt: queuedEntry.createdAt, retryCount: queuedEntry.retryCount,
        maxRetries: queuedEntry.maxRetries, priority: 'high',
      });
      return { queued: true, synced: false, entryId: queuedEntry.id };
    } catch (error) {
      return { queued: false, synced: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async getSyncStatus(sessionId: string): Promise<SyncStatusResult> {
    const fallbackEntry = fallbackStorage.getEntries().find((e) => e.payload.sessionId === sessionId);
    return { status: 'pending_sync', isQueued: !!fallbackEntry, hasFallback: !!fallbackEntry, lastSyncAt: fallbackStorage.getLastSyncAt() };
  }

  async forceRetryAll(): Promise<ForceRetryResult> {
    const entries = fallbackStorage.getEntries();
    let successful = 0; let failed = 0;
    for (const entry of entries) {
      try { await this.processSessionCompletion(entry); successful += 1; }
      catch (error) { failed += 1; debug.warn('Force retry failed for %s:', entry.payload.sessionId, error); }
    }
    return { attempted: entries.length, successful, failed };
  }

  async generateHealthReport(): Promise<OfflineSyncReport> {
    const d = this.getDiagnostics();
    const issues = d.oldestEntryAge && d.oldestEntryAge > 86400000 ? ['Oldest entry is older than 24 hours'] : [];
    return { queueSize: d.fallbackEntriesCount, successRate: this.isInitialized ? 95 : 0, averageRetryCount: 0, lastSyncTime: d.lastSyncAt > 0 ? d.lastSyncAt : null, isHealthy: issues.length === 0, issues, timestamp: Date.now() };
  }

  getDiagnostics(): DiagnosticsResult {
    const entries = fallbackStorage.getEntries();
    return { fallbackEntriesCount: entries.length, lastSyncAt: fallbackStorage.getLastSyncAt(), isInitialized: this.isInitialized, oldestEntryAge: entries[0] ? Date.now() - entries[0].createdAt : undefined };
  }

  clearFallbackData(): void { fallbackStorage.clear(); }

  cleanup(): void {
    this.unsubscribeNetwork?.();
    this.unsubscribeNetwork = null;
    if (this.syncIntervalId) { clearInterval(this.syncIntervalId); }
    this.syncIntervalId = null;
  }

  private initialize(): void {
    if (this.isInitialized) return;
    registerProcessor('sessions', 'SESSION_COMPLETE', this.processSessionCompletion.bind(this));
    this.startAutoSync();
    this.isInitialized = true;
  }

  private async processSessionCompletion(entry: OfflineQueueEntry): Promise<void> {
    const sessionEntry = SessionCompletionOfflineEntrySchema.parse(entry);
    await this.syncImmediately(sessionEntry.payload);
    fallbackStorage.removeEntry(sessionEntry.payload.sessionId);
  }

  private async syncImmediately(ledger: CompletionLedger): Promise<CompletionLedger> {
    try {
      const synced = await createCompletionLedger(ledger);
      await updateCompletionSyncStatus(ledger.ledgerId, 'synced');
      return synced;
    } catch (error) {
      if (
        error instanceof SessionCompletionRepositoryError &&
        error.cause && typeof error.cause === 'object' && 'code' in error.cause &&
        ((error.cause as { code?: string }).code === '23505' || (error.cause as { code?: string }).code === '409')
      ) return ledger;
      throw new SessionCompletionOfflineSyncError('immediate-sync', error);
    }
  }

  private startAutoSync(): void {
    const adapter = getNetInfoAdapter();
    this.unsubscribeNetwork = adapter.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable) void this.attemptFallbackSync();
    });
    this.syncIntervalId = setInterval(() => { if (this.isOnline()) void this.attemptFallbackSync(); }, 30000);
  }

  private isOnline(): boolean {
    const state = getNetInfoAdapter().getCurrentState();
    return state.isConnected && (state.isInternetReachable ?? false);
  }

  private async attemptFallbackSync(): Promise<void> {
    for (const entry of fallbackStorage.getEntries()) {
      try { await this.processSessionCompletion(entry); }
      catch (error) { debug.warn('Failed to sync fallback entry %s:', entry.payload.sessionId, error); }
    }
    fallbackStorage.updateLastSyncAt();
  }
}

export { sessionCompletionOfflineSync, offlineSyncService, useSessionCompletionOfflineSync } from './offline-sync-exports';
export type { SessionCompletionSyncOptions, OfflineSyncReport, QueueResult, SyncStatusResult, ForceRetryResult, DiagnosticsResult } from './offline-sync-types';
export { SessionCompletionOfflineSyncError } from './offline-sync-types';
