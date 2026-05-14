/**
 * Economy Offline Queue
 * Queue for economy operations when offline
 *
 * Features:
 * - Deduplication (same operation not queued twice)
 * - Priority ordering (spends before earns to prevent negative balance)
 * - Conflict resolution (merge similar operations)
 * - Retry with exponential backoff
 * - Persistence to storage
 */

import { z } from 'zod';
import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { parseJsonWithSchema, stringifyJsonSafe } from '../../persistence/safe-json';
import { createDebugger } from '../../utils/debug';
import { v4 } from '../../utils/uuid';

const debug = createDebugger('economy:offline-queue');

// ============================================================================
// Queue Entry Schema
// ============================================================================

export const QueueEntryStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CONFLICT']);

export const QueueEntryTypeSchema = z.enum(['EARN_CURRENCY', 'SPEND_CURRENCY', 'CONVERT_CURRENCY', 'PURCHASE_ITEM', 'REFUND_PURCHASE']);

export const QueueEntrySchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    type: QueueEntryTypeSchema,

    // Operation data
    payload: z.record(z.unknown()),

    // Queue metadata
    status: QueueEntryStatusSchema,
    priority: z.number().int().min(1).max(10).default(5),
    createdAt: z.number().int(),
    updatedAt: z.number().int(),

    // Retry metadata
    retryCount: z.number().int().min(0).default(0),
    maxRetries: z.number().int().min(1).default(3),
    nextRetryAt: z.number().int().nullable(),
    lastError: z.string().max(500).nullable(),

    // Deduplication key
    dedupeKey: z.string().nullable(),

    // Dependencies (other entries that must complete first)
    dependencies: z.array(z.string().uuid()).default([]),
  })
  .strict();

export type QueueEntryStatus = z.infer<typeof QueueEntryStatusSchema>;
export type QueueEntryType = z.infer<typeof QueueEntryTypeSchema>;
export type QueueEntry = z.infer<typeof QueueEntrySchema>;

// ============================================================================
// Storage Key
// ============================================================================

const QUEUE_STORAGE_KEY = 'economy:offlineQueue';

function readStringPayload(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  return typeof value === 'string' ? value : null;
}

function readNumberPayload(payload: Record<string, unknown>, key: string): number | null {
  const value = payload[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

// ============================================================================
// Queue Management
// ============================================================================

class OfflineQueue {
  private entries: Map<string, QueueEntry> = new Map();
  private processing: boolean = false;
  private storage = getMMKVStorageAdapter();

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const data = await this.storage.getItem(QUEUE_STORAGE_KEY);
      if (data) {
        const entries =
          parseJsonWithSchema(data, z.array(QueueEntrySchema), {
            feature: 'economy',
            key: QUEUE_STORAGE_KEY,
          }) ?? [];
        entries.forEach((entry) => this.entries.set(entry.id, entry));
      }
    } catch (error) {
      debug.error('Failed to load offline queue:', toError(error));
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      const data = Array.from(this.entries.values());
      const encoded = stringifyJsonSafe(data, {
        feature: 'economy',
        key: QUEUE_STORAGE_KEY,
      });
      if (encoded) {
        await this.storage.setItem(QUEUE_STORAGE_KEY, encoded);
      }
    } catch (error) {
      debug.error('Failed to save offline queue:', toError(error));
    }
  }

  // ============================================================================
  // Entry Management
  // ============================================================================

  enqueue(entry: Omit<QueueEntry, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount'>): QueueEntry {
    // Check for duplicate
    if (entry.dedupeKey) {
      const existing = this.findByDedupeKey(entry.dedupeKey);
      if (existing && existing.status === 'PENDING') {
        // Update existing entry if it's newer
        if (entry.payload.timestamp && existing.payload.timestamp && entry.payload.timestamp > existing.payload.timestamp) {
          const updated: QueueEntry = {
            ...existing,
            payload: entry.payload,
            updatedAt: Date.now(),
          };
          this.entries.set(updated.id, updated);
          this.saveToStorage();
          return updated;
        }
        return existing;
      }
    }

    const now = Date.now();
    const newEntry: QueueEntry = {
      ...entry,
      id: v4(),
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
    };

    this.entries.set(newEntry.id, newEntry);
    this.saveToStorage();

    return newEntry;
  }

  private findByDedupeKey(dedupeKey: string): QueueEntry | undefined {
    return Array.from(this.entries.values()).find((e) => e.dedupeKey === dedupeKey);
  }

  dequeue(entryId: string): QueueEntry | null {
    const entry = this.entries.get(entryId);
    if (!entry) {
      return null;
    }

    this.entries.delete(entryId);
    this.saveToStorage();
    return entry;
  }

  updateStatus(entryId: string, status: QueueEntryStatus, error?: string): QueueEntry | null {
    const entry = this.entries.get(entryId);
    if (!entry) {
      return null;
    }

    const updated: QueueEntry = {
      ...entry,
      status,
      updatedAt: Date.now(),
      lastError: error ?? entry.lastError,
      retryCount: status === 'FAILED' ? entry.retryCount + 1 : entry.retryCount,
    };

    // Calculate next retry time with exponential backoff
    if (status === 'FAILED' && updated.retryCount < updated.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, updated.retryCount), 30000); // Max 30s
      updated.nextRetryAt = Date.now() + delay;
      updated.status = 'PENDING'; // Reset to pending for retry
    }

    this.entries.set(entryId, updated);
    this.saveToStorage();
    return updated;
  }

  // ============================================================================
  // Query Methods
  // ============================================================================

  getPending(): QueueEntry[] {
    return Array.from(this.entries.values())
      .filter((e) => e.status === 'PENDING' && (!e.nextRetryAt || e.nextRetryAt <= Date.now()))
      .sort((a, b) => {
        // Higher priority first, then older first
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.createdAt - b.createdAt;
      });
  }

  getByUser(userId: string): QueueEntry[] {
    return Array.from(this.entries.values())
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getFailed(): QueueEntry[] {
    return Array.from(this.entries.values())
      .filter((e) => e.status === 'FAILED')
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getAll(): QueueEntry[] {
    return Array.from(this.entries.values());
  }

  clear(): void {
    this.entries.clear();
    this.saveToStorage();
  }

  clearCompleted(): void {
    for (const [id, entry] of this.entries) {
      if (entry.status === 'COMPLETED') {
        this.entries.delete(id);
      }
    }
    this.saveToStorage();
  }

  // ============================================================================
  // Processing
  // ============================================================================

  async processQueue<T>(
    processor: (entry: QueueEntry) => Promise<T>,
    options: {
      batchSize?: number;
      onError?: (entry: QueueEntry, error: unknown) => void;
    } = {},
  ): Promise<{ processed: number; failed: number }> {
    if (this.processing) {
      return { processed: 0, failed: 0 };
    }

    this.processing = true;
    const { batchSize = 10 } = options;
    let processed = 0;
    let failed = 0;

    try {
      const pending = this.getPending().slice(0, batchSize);

      for (const entry of pending) {
        // Check dependencies
        const unresolvedDeps = entry.dependencies.filter((depId) => {
          const dep = this.entries.get(depId);
          return dep && dep.status !== 'COMPLETED';
        });

        if (unresolvedDeps.length > 0) {
          continue; // Skip until dependencies resolve
        }

        this.entries.set(entry.id, { ...entry, status: 'PROCESSING' });

        try {
          await processor(entry);
          this.updateStatus(entry.id, 'COMPLETED');
          processed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.updateStatus(entry.id, 'FAILED', errorMessage);
          failed++;
          options.onError?.(entry, error);
        }
      }
    } finally {
      this.processing = false;
      this.saveToStorage();
    }

    return { processed, failed };
  }

  // ============================================================================
  // Conflict Resolution
  // ============================================================================

  resolveConflicts(): QueueEntry[] {
    const conflicts: QueueEntry[] = [];
    const userOps = new Map<string, QueueEntry[]>();

    // Group by user
    for (const entry of this.entries.values()) {
      if (entry.status !== 'PENDING') {
        continue;
      }

      const userEntries = userOps.get(entry.userId) ?? [];
      userEntries.push(entry);
      userOps.set(entry.userId, userEntries);
    }

    // Detect conflicts (same currency operations)
    for (const entries of userOps.values()) {
      const currencyOps = entries.filter((e) => e.type === 'EARN_CURRENCY' || e.type === 'SPEND_CURRENCY');

      // Group by currency
      const byCurrency = new Map<string, QueueEntry[]>();
      for (const entry of currencyOps) {
        const currency = readStringPayload(entry.payload, 'currency');
        if (!currency) {
          continue;
        }
        const list = byCurrency.get(currency) ?? [];
        list.push(entry);
        byCurrency.set(currency, list);
      }

      // Check for potential negative balance
      for (const ops of byCurrency.values()) {
        let balance = 0;
        for (const op of ops.sort((a, b) => a.createdAt - b.createdAt)) {
          const amount = readNumberPayload(op.payload, 'amount');
          if (amount === null) {
            continue;
          }
          if (op.type === 'EARN_CURRENCY') {
            balance += amount;
          } else {
            balance -= amount;
          }

          if (balance < 0) {
            // Reorder: move spends after earns
            const earns = ops.filter((o) => o.type === 'EARN_CURRENCY' && o.createdAt > op.createdAt);
            if (earns.length > 0) {
              op.dependencies = earns.map((e) => e.id);
              this.entries.set(op.id, op);
              conflicts.push(op);
            }
          }
        }
      }
    }

    if (conflicts.length > 0) {
      this.saveToStorage();
    }

    return conflicts;
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  getStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    byType: Record<string, number>;
  } {
    const entries = Array.from(this.entries.values());
    const byType: Record<string, number> = {};

    for (const entry of entries) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1;
    }

    return {
      total: entries.length,
      pending: entries.filter((e) => e.status === 'PENDING').length,
      processing: entries.filter((e) => e.status === 'PROCESSING').length,
      completed: entries.filter((e) => e.status === 'COMPLETED').length,
      failed: entries.filter((e) => e.status === 'FAILED').length,
      byType,
    };
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const offlineQueue = new OfflineQueue();

// ============================================================================
// Helper Functions
// ============================================================================

export function createEarnEntry(userId: string, currency: string, amount: number, source: string, metadata?: Record<string, unknown>): Omit<QueueEntry, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount'> {
  return {
    userId,
    type: 'EARN_CURRENCY',
    payload: { currency, amount, source, metadata, timestamp: Date.now() },
    priority: 3,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:earn:${source}:${metadata?.transactionId ?? ''}`,
    dependencies: [],
  };
}

export function createSpendEntry(userId: string, currency: string, amount: number, description: string, metadata?: Record<string, unknown>): Omit<QueueEntry, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount'> {
  return {
    userId,
    type: 'SPEND_CURRENCY',
    payload: { currency, amount, description, metadata, timestamp: Date.now() },
    priority: 5,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:spend:${metadata?.purchaseId ?? Date.now()}`,
    dependencies: [],
  };
}

export function createConvertEntry(userId: string, fromCurrency: string, toCurrency: string, fromAmount: number, toAmount: number): Omit<QueueEntry, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount'> {
  return {
    userId,
    type: 'CONVERT_CURRENCY',
    payload: { fromCurrency, toCurrency, fromAmount, toAmount, timestamp: Date.now() },
    priority: 4,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:convert:${fromCurrency}:${toCurrency}:${Date.now()}`,
    dependencies: [],
  };
}

export function createPurchaseEntry(userId: string, itemDefinitionId: string, price: { currency: string; amount: number }, shopItemId?: string): Omit<QueueEntry, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount'> {
  return {
    userId,
    type: 'PURCHASE_ITEM',
    payload: { itemDefinitionId, price, shopItemId, timestamp: Date.now() },
    priority: 6,
    maxRetries: 3,
    nextRetryAt: null,
    lastError: null,
    dedupeKey: `${userId}:purchase:${shopItemId ?? itemDefinitionId}`,
    dependencies: [],
  };
}
