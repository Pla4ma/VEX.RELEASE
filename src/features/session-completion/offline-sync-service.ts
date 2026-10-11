import {
  getQueue,
  registerProcessor,
  unregisterProcessor,
  type OfflineQueueEntry,
} from '../../lib/offline/queue';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
} from './schemas';
import {
  fallbackStorage,
  SessionCompletionOfflineEntrySchema,
} from './offline-sync-storage';
import type {
  SessionCompletionSyncOptions,
  OfflineSyncReport,
  QueueResult,
  SyncStatusResult,
  ForceRetryResult,
  DiagnosticsResult,
} from './offline-sync-types';
import { createDebugger } from '../../utils/debug';
import { getNetInfoAdapter } from '../../network/NetInfoAdapter';
import { registerSessionCompletionProcessors } from './offline-sync-processors';
import { syncCompletionLedger } from './offline-ledger-service';
import {
  buildOfflineSyncDiagnostics,
  buildOfflineSyncReport,
} from './offline-sync-health';
import {
  buildCompletionSyncStatus,
  queueCompletion,
  retryAllCompletions,
  summarizeQueueDiagnostics,
} from './offline-sync-operations';
const debug = createDebugger('session-completion:offline-sync');
export class SessionCompletionOfflineSyncService {
  private isInitialized = false;
  private unsubscribeNetwork: (() => void) | null = null;
  private syncIntervalId: ReturnType<typeof setInterval> | null = null;
  private successCount = 0;
  private failureCount = 0;
  private totalRetryCount = 0;
  constructor() {
    fallbackStorage.reload();
    this.initialize();
  }

  queueSessionCompletion(
    ledger: CompletionLedger,
    options: SessionCompletionSyncOptions = {},
  ): Promise<QueueResult> {
    const validated = CompletionLedgerSchema.parse(ledger);
    return queueCompletion(
      validated,
      options,
      this.isOnline(),
      (currentLedger) => this.syncImmediately(currentLedger),
    );
  }

  async getSyncStatus(sessionId: string): Promise<SyncStatusResult> {
    return buildCompletionSyncStatus(
      sessionId,
      fallbackStorage.getEntries(),
      getQueue(),
      fallbackStorage.getLastSyncAt(),
    );
  }
  async forceRetryAll(userId?: string): Promise<ForceRetryResult> {
    return retryAllCompletions(
      getQueue().filter((entry) => !userId || entry.userId === userId ||
        CompletionLedgerSchema.safeParse(entry.payload.ledger).data?.userId === userId),
      fallbackStorage.getEntries().filter((entry) => !userId || entry.payload.userId === userId),
      (entry) => this.processSessionCompletion(entry),
      (retryCount) => this.recordFailure(retryCount),
      (sessionId, error) => {
        debug.warn('Force retry failed for %s:', sessionId, error);
      },
    );
  }
  async generateHealthReport(): Promise<OfflineSyncReport> {
    return buildOfflineSyncReport(
      this.getDiagnostics(),
      this.successCount,
      this.failureCount,
      this.totalRetryCount,
    );
  }

  getDiagnostics(): DiagnosticsResult {
    const fallbackDiagnostics = buildOfflineSyncDiagnostics(
      fallbackStorage.getEntries(),
      fallbackStorage.getLastSyncAt(),
      this.isInitialized,
    );
    const canonicalQueueLength = getQueue().filter(
      (entry) => entry.feature === 'sessions' && entry.operation === 'CREATE',
    ).length;
    return summarizeQueueDiagnostics(fallbackDiagnostics, canonicalQueueLength);
  }

  clearFallbackData(): void { fallbackStorage.clear(); }

  cleanup(): void {
    this.unsubscribeNetwork?.();
    this.unsubscribeNetwork = null;
    if (this.syncIntervalId) {clearInterval(this.syncIntervalId);}
    this.syncIntervalId = null;
    unregisterProcessor('sessions', 'CREATE');
  }

  destroy(): void {
    this.cleanup();
    this.isInitialized = false;
  }

  private initialize(): void {
    if (this.isInitialized) {return;}
    registerSessionCompletionProcessors(this.processSessionCompletion.bind(this));
    registerProcessor(
      'sessions',
      'CREATE',
      this.processCanonicalSessionCompletion.bind(this),
    );
    this.startAutoSync();
    this.isInitialized = true;
  }

  private async processSessionCompletion(entry: OfflineQueueEntry): Promise<void> {
    const sessionEntry = SessionCompletionOfflineEntrySchema.parse(entry);
    this.totalRetryCount += sessionEntry.retryCount;
    await this.syncImmediately(sessionEntry.payload);
    fallbackStorage.removeEntry(sessionEntry.payload.sessionId);
    this.successCount += 1;
  }
  private async processCanonicalSessionCompletion(
    entry: OfflineQueueEntry,
  ): Promise<void> {
    const ledger = CompletionLedgerSchema.parse(entry.payload.ledger);
    await this.syncImmediately(ledger);
  }

  private recordFailure(retryCount: number): void {
    this.failureCount += 1;
    this.totalRetryCount += retryCount;
  }

  private async syncImmediately(ledger: CompletionLedger): Promise<CompletionLedger> {
    return syncCompletionLedger(ledger);
  }

  private startAutoSync(): void {
    const adapter = getNetInfoAdapter();
    this.unsubscribeNetwork = adapter.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable) {this.attemptFallbackSync();}
    });
    this.syncIntervalId = setInterval(() => {
      if (this.isOnline()) {this.attemptFallbackSync();}
    }, 30000);
  }

  private isOnline(): boolean {
    const state = getNetInfoAdapter().getCurrentState();
    return state.isConnected && (state.isInternetReachable ?? false);
  }

  private async attemptFallbackSync(): Promise<void> {
    for (const entry of fallbackStorage.getEntries()) {
      try {
        await this.processSessionCompletion(entry);
      } catch (error) {
        this.recordFailure(entry.retryCount);
        debug.warn('Failed to sync fallback entry %s:', entry.payload.sessionId, error);
      }
    }
    fallbackStorage.updateLastSyncAt();
  }
}

export const sessionCompletionOfflineSync = new SessionCompletionOfflineSyncService();
export const offlineSyncService = sessionCompletionOfflineSync;
export type { SessionCompletionSyncOptions, OfflineSyncReport, QueueResult, SyncStatusResult, ForceRetryResult, DiagnosticsResult } from './offline-sync-types';
export { SessionCompletionOfflineSyncError } from './offline-sync-types';
