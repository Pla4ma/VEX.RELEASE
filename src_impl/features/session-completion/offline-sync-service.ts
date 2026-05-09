/**
 * Session Completion Offline Sync Service
 * 
 * Ensures session completion data is never lost by providing robust
 * offline-first synchronization with multiple fallback mechanisms.
 */

import { z } from 'zod';
import { createDebugger } from '../../utils/debug';
import { enqueue, type OfflineQueueEntry, registerProcessor } from '../../lib/offline/queue';
import { getNetInfoAdapter, type NetworkState } from '../../network/NetInfoAdapter';
import {
  CompletionLedgerSchema,
  type CompletionLedger,
  type CompletionSyncStatus,
} from './schemas';
import {
  createCompletionLedger,
  updateCompletionSyncStatus,
  type SessionCompletionRepositoryError,
} from './repository';

const debug = createDebugger('session-completion:offline-sync');

// ============================================================================
// Enhanced Offline Queue Entry Types
// ============================================================================

export const SessionCompletionOfflineEntrySchema = z.object({
  id: z.string().uuid(),
  operation: z.literal('SESSION_COMPLETE'),
  feature: z.literal('sessions'),
  payload: CompletionLedgerSchema,
  idempotencyKey: z.string(),
  createdAt: z.number(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(10), // More retries for session completion
  priority: z.enum(['high', 'critical']).default('critical'),
  dependsOn: z.string().uuid().optional(),
  error: z.string().optional(),
}).strict();

export type SessionCompletionOfflineEntry = z.infer<typeof SessionCompletionOfflineEntrySchema>;

// ============================================================================
// Local Storage Fallback (Production: Use MMKV)
// ============================================================================

const LOCAL_STORAGE_KEY = 'vex_session_completion_fallback';
const MAX_FALLBACK_ENTRIES = 100;

interface FallbackStorage {
  entries: SessionCompletionOfflineEntry[];
  lastSyncAt: number;
}

class FallbackStorageManager {
  private storage: FallbackStorage = {
    entries: [],
    lastSyncAt: 0,
  };

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      // In production, use MMKV for better performance
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.storage = {
          entries: parsed.entries || [],
          lastSyncAt: parsed.lastSyncAt || 0,
        };
      }
    } catch (error) {
      debug.warn('Failed to load fallback storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.storage));
    } catch (error) {
      debug.warn('Failed to save fallback storage:', error);
    }
  }

  addEntry(entry: SessionCompletionOfflineEntry): void {
    // Remove old entries if we're at capacity
    if (this.storage.entries.length >= MAX_FALLBACK_ENTRIES) {
      this.storage.entries = this.storage.entries.slice(-MAX_FALLBACK_ENTRIES + 1);
    }

    // Check for duplicates by session ID
    const existingIndex = this.storage.entries.findIndex(
      e => e.payload.sessionId === entry.payload.sessionId
    );

    if (existingIndex >= 0) {
      // Update existing entry
      this.storage.entries[existingIndex] = entry;
    } else {
      // Add new entry
      this.storage.entries.push(entry);
    }

    this.saveToStorage();
    debug.info('Added entry to fallback storage: %s', entry.payload.sessionId);
  }

  getEntries(): SessionCompletionOfflineEntry[] {
    return [...this.storage.entries];
  }

  removeEntry(sessionId: string): boolean {
    const index = this.storage.entries.findIndex(
      e => e.payload.sessionId === sessionId
    );

    if (index >= 0) {
      this.storage.entries.splice(index, 1);
      this.saveToStorage();
      debug.info('Removed entry from fallback storage: %s', sessionId);
      return true;
    }

    return false;
  }

  clear(): void {
    this.storage.entries = [];
    this.storage.lastSyncAt = 0;
    this.saveToStorage();
    debug.info('Cleared fallback storage');
  }

  updateLastSyncAt(): void {
    this.storage.lastSyncAt = Date.now();
    this.saveToStorage();
  }
}

const fallbackStorage = new FallbackStorageManager();

// ============================================================================
// Session Completion Offline Sync Service
// ============================================================================

export class SessionCompletionOfflineSyncError extends Error {
  constructor(
    public operation: string,
    public cause: unknown,
  ) {
    super(
      `Session completion offline sync failed during ${operation}: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    );
    this.name = 'SessionCompletionOfflineSyncError';
  }
}

export interface SessionCompletionSyncOptions {
  /** Force immediate sync attempt */
  forceSync?: boolean;
  /** Skip offline queue and try direct */
  skipQueue?: boolean;
  /** Custom retry count override */
  maxRetries?: number;
}

export class SessionCompletionOfflineSyncService {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.isInitialized) return;

    // Register the session completion processor
    registerProcessor('sessions', 'SESSION_COMPLETE', this.processSessionCompletion.bind(this));

    // Start auto-processing
    this.startAutoSync();

    this.isInitialized = true;
    debug.info('Session completion offline sync service initialized');
  }

  /**
   * Queue session completion for sync with offline support
   */
  async queueSessionCompletion(
    ledger: CompletionLedger,
    options: SessionCompletionSyncOptions = {}
  ): Promise<{
    queued: boolean;
    synced: boolean;
    entryId?: string;
    error?: Error;
  }> {
    const validated = CompletionLedgerSchema.parse(ledger);
    const { forceSync = false, skipQueue = false, maxRetries = 10 } = options;

    debug.info('Queueing session completion: %s', validated.sessionId);

    try {
      // Try immediate sync if online and not skipping queue
      if (forceSync && !skipQueue) {
        const adapter = getNetInfoAdapter();
        const state = adapter.getCurrentState();
        const isOnline = state.isConnected && (state.isInternetReachable ?? false);
        
        if (isOnline) {
          try {
            await this.syncImmediately(validated);
            return { queued: false, synced: true };
          } catch (error) {
            debug.warn('Immediate sync failed, falling back to queue:', error);
            // Continue with queue fallback
          }
        }
      }

      // Create offline queue entry
      const entry: SessionCompletionOfflineEntry = {
        id: '', // Will be set by enqueue
        operation: 'SESSION_COMPLETE',
        feature: 'sessions',
        payload: validated,
        idempotencyKey: validated.idempotencyKey,
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries,
        priority: 'critical',
      };

      // Add to offline queue
      const queuedEntry = enqueue(entry);

      // Add to fallback storage for extra safety
      fallbackStorage.addEntry(queuedEntry);

      debug.info('Session completion queued: %s', validated.sessionId);
      return { queued: true, synced: false, entryId: queuedEntry.id };

    } catch (error) {
      debug.error('Failed to queue session completion:', error);
      return {
        queued: false,
        synced: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Process session completion from offline queue
   */
  private async processSessionCompletion(entry: OfflineQueueEntry): Promise<void> {
    const sessionEntry = SessionCompletionOfflineEntrySchema.parse(entry);
    const { payload } = sessionEntry;

    debug.info('Processing session completion: %s', payload.sessionId);

    try {
      // Try to sync to server
      await this.syncImmediately(payload);

      // Remove from fallback storage on successful sync
      fallbackStorage.removeEntry(payload.sessionId);

      debug.info('Session completion synced successfully: %s', payload.sessionId);

    } catch (error) {
      debug.error('Failed to sync session completion:', error);
      throw error;
    }
  }

  /**
   * Immediate sync to server
   */
  private async syncImmediately(ledger: CompletionLedger): Promise<CompletionLedger> {
    debug.info('Attempting immediate sync: %s', ledger.sessionId);

    try {
      // Create completion ledger on server
      const synced = await createCompletionLedger(ledger);

      // Update sync status
      await updateCompletionSyncStatus(ledger.ledgerId, 'synced');

      debug.info('Immediate sync successful: %s', ledger.sessionId);
      return synced;

    } catch (error) {
      // Check if it's a duplicate (already exists)
      if (error instanceof SessionCompletionRepositoryError) {
        if (error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
          const cause = error.cause as { code?: string };
          if (cause.code === '23505' || cause.code === '409') {
            debug.info('Session completion already exists, treating as success: %s', ledger.sessionId);
            return ledger;
          }
        }
      }

      throw new SessionCompletionOfflineSyncError('immediate-sync', error);
    }
  }

  /**
   * Start automatic sync monitoring
   */
  private startAutoSync(): void {
    const adapter = getNetInfoAdapter();

    // Monitor network changes and sync when online
    const unsubscribe = adapter.subscribe((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.attemptFallbackSync();
      }
    });

    // Periodic sync check
    const intervalId = setInterval(() => {
      const state = adapter.getCurrentState();
      const isOnline = state.isConnected && (state.isInternetReachable ?? false);
      if (isOnline) {
        this.attemptFallbackSync();
      }
    }, 30000); // Check every 30 seconds

    // Cleanup on service destruction
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }

  /**
   * Attempt to sync fallback storage entries
   */
  private async attemptFallbackSync(): Promise<void> {
    const entries = fallbackStorage.getEntries();
    if (entries.length === 0) return;

    debug.info('Attempting fallback sync for %d entries', entries.length);

    for (const entry of entries) {
      try {
        await this.processSessionCompletion(entry);
      } catch (error) {
        debug.warn('Failed to sync fallback entry %s:', entry.payload.sessionId, error);
        // Continue with other entries
      }
    }

    fallbackStorage.updateLastSyncAt();
  }

  /**
   * Get sync status for a session
   */
  async getSyncStatus(sessionId: string): Promise<{
    status: CompletionSyncStatus;
    isQueued: boolean;
    hasFallback: boolean;
    lastSyncAt?: number;
  }> {
    // Check if in fallback storage
    const fallbackEntry = fallbackStorage.getEntries().find(
      e => e.payload.sessionId === sessionId
    );

    // Check ledger status from repository
    try {
      const ledger = await createCompletionLedger({
        sessionId,
        // Minimal ledger for status check
        completedAt: Date.now(),
        idempotencyKey: `status-check-${sessionId}`,
        ledgerId: '',
        userId: '',
        offlineSyncStatus: 'pending',
      } as CompletionLedger);

      return {
        status: ledger.offlineSyncStatus,
        isQueued: false,
        hasFallback: !!fallbackEntry,
        lastSyncAt: fallbackStorage['storage'].lastSyncAt,
      };
    } catch (error) {
      // If ledger doesn't exist, check fallback
      return {
        status: 'pending',
        isQueued: !!fallbackEntry,
        hasFallback: !!fallbackEntry,
        lastSyncAt: fallbackStorage['storage'].lastSyncAt,
      };
    }
  }

  /**
   * Force retry all pending session completions
   */
  async forceRetryAll(): Promise<{
    attempted: number;
    successful: number;
    failed: number;
  }> {
    const entries = fallbackStorage.getEntries();
    let successful = 0;
    let failed = 0;

    debug.info('Force retrying %d session completions', entries.length);

    for (const entry of entries) {
      try {
        await this.processSessionCompletion(entry);
        successful++;
      } catch (error) {
        failed++;
        debug.warn('Force retry failed for %s:', entry.payload.sessionId, error);
      }
    }

    return {
      attempted: entries.length,
      successful,
      failed,
    };
  }

  /**
   * Clear all fallback data (use with caution)
   */
  clearFallbackData(): void {
    fallbackStorage.clear();
    debug.warn('Cleared all fallback session completion data');
  }

  /**
   * Get diagnostics information
   */
  getDiagnostics(): {
    fallbackEntriesCount: number;
    lastSyncAt: number;
    isInitialized: boolean;
    oldestEntryAge?: number;
  } {
    const entries = fallbackStorage.getEntries();
    const oldestEntry = entries[0];

    return {
      fallbackEntriesCount: entries.length,
      lastSyncAt: fallbackStorage['storage'].lastSyncAt,
      isInitialized: this.isInitialized,
      oldestEntryAge: oldestEntry ? Date.now() - oldestEntry.createdAt : undefined,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const sessionCompletionOfflineSync = new SessionCompletionOfflineSyncService();

// ============================================================================
// React Hook
// ============================================================================

export function useSessionCompletionOfflineSync() {
  const adapter = getNetInfoAdapter();
  const state = adapter.getCurrentState();
  const isOnline = state.isConnected && (state.isInternetReachable ?? false);

  return {
    isOnline,
    queueSessionCompletion: sessionCompletionOfflineSync.queueSessionCompletion.bind(
      sessionCompletionOfflineSync
    ),
    getSyncStatus: sessionCompletionOfflineSync.getSyncStatus.bind(
      sessionCompletionOfflineSync
    ),
    forceRetryAll: sessionCompletionOfflineSync.forceRetryAll.bind(
      sessionCompletionOfflineSync
    ),
    getDiagnostics: sessionCompletionOfflineSync.getDiagnostics.bind(
      sessionCompletionOfflineSync
    ),
  };
}