import { z } from 'zod';
import { captureSilentFailure } from '../../utils/silent-failure';
import { createDebugger } from '../../utils/debug';
import { CompletionLedgerSchema } from './schemas';
import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';

const debug = createDebugger('session-completion:offline-sync-storage');
const STORAGE_KEY = 'vex_session_completion_fallback';
const MAX_FALLBACK_ENTRIES = 100;

const storage = new MMKVStorageAdapter('session-completion-offline');

export const SessionCompletionOfflineEntrySchema = z.object({
  id: z.string().uuid(),
  operation: z.literal('SESSION_COMPLETE'),
  feature: z.literal('sessions'),
  payload: CompletionLedgerSchema,
  idempotencyKey: z.string(),
  createdAt: z.number(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(10),
  priority: z.enum(['high', 'critical']).default('critical'),
  dependsOn: z.string().uuid().optional(),
  error: z.string().optional(),
}).strict();

export type SessionCompletionOfflineEntry = z.infer<typeof SessionCompletionOfflineEntrySchema>;

interface FallbackStorage {
  entries: SessionCompletionOfflineEntry[];
  lastSyncAt: number;
}

const FallbackStorageSchema = z.object({
  entries: z.array(SessionCompletionOfflineEntrySchema),
  lastSyncAt: z.number().default(0),
}).strict();

class FallbackStorageManager {
  private storage: FallbackStorage = { entries: [], lastSyncAt: 0 };

  constructor() {
    this.loadFromStorage();
  }

  reload(): void {
    this.loadFromStorage();
  }

  addEntry(entry: SessionCompletionOfflineEntry): void {
    if (this.storage.entries.length >= MAX_FALLBACK_ENTRIES) {
      this.storage.entries = this.storage.entries.slice(-MAX_FALLBACK_ENTRIES + 1);
    }
    const existingIndex = this.storage.entries.findIndex((item) => item.payload.sessionId === entry.payload.sessionId);
    if (existingIndex >= 0) {
      this.storage.entries[existingIndex] = entry;
    } else {
      this.storage.entries.push(entry);
    }
    this.saveToStorage();
  }

  getEntries(): SessionCompletionOfflineEntry[] {
    return [...this.storage.entries];
  }

  removeEntry(sessionId: string): boolean {
    const index = this.storage.entries.findIndex((entry) => entry.payload.sessionId === sessionId);
    if (index < 0) {return false;}
    this.storage.entries.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  clear(): void {
    this.storage = { entries: [], lastSyncAt: 0 };
    this.saveToStorage();
  }

  updateLastSyncAt(): void {
    this.storage.lastSyncAt = Date.now();
    this.saveToStorage();
  }

  getLastSyncAt(): number {
    return this.storage.lastSyncAt;
  }

  private loadFromStorage(): void {
    try {
      const stored = storage.getItemSync(STORAGE_KEY);
      this.storage = stored ? FallbackStorageSchema.parse(JSON.parse(stored)) : { entries: [], lastSyncAt: 0 };
    } catch (error) {
      captureSilentFailure(error, { feature: 'session-completion', operation: 'offline-fallback-parse', type: 'data' });
      debug.warn('Failed to load fallback storage:', error);
      this.storage = { entries: [], lastSyncAt: 0 };
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    try {
      storage.setItemSync(STORAGE_KEY, JSON.stringify(this.storage));
    } catch (error) {
      debug.warn('Failed to save fallback storage:', error);
    }
  }
}

export const fallbackStorage = new FallbackStorageManager();
