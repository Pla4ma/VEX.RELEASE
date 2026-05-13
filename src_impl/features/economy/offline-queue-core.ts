/**
 * Economy Offline Queue - Core Class
 */

import { z } from 'zod';
import { getMMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { parseJsonWithSchema, stringifyJsonSafe } from '../../persistence/safe-json';
import { createDebugger } from '../../utils/debug';
import { v4 } from '../../utils/uuid';
import {
  QueueEntrySchema,
  toError,
  type QueueEntry,
  type QueueEntryStatus,
} from './offline-queue-schemas';

const debug = createDebugger('economy:offline-queue');
const QUEUE_STORAGE_KEY = 'economy:offlineQueue';
type QInput = Omit<QueueEntry, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'retryCount'>;

export class OfflineQueue {
  private _entries: Map<string, QueueEntry> = new Map();
  private _processing: boolean = false;
  private storage = getMMKVStorageAdapter();

  get entries(): Map<string, QueueEntry> { return this._entries; }
  get processing(): boolean { return this._processing; }
  set processing(value: boolean) { this._processing = value; }

  constructor() {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const data = await this.storage.getItem(QUEUE_STORAGE_KEY);
      if (data) {
        const entries = parseJsonWithSchema(data, z.array(QueueEntrySchema), {
          feature: 'economy',
          key: QUEUE_STORAGE_KEY,
        }) ?? [];
        entries.forEach((entry) => this._entries.set(entry.id, entry));
      }
    } catch (error) {
      debug.error('Failed to load offline queue:', toError(error));
    }
  }

  async saveToStorage(): Promise<void> {
    try {
      const data = Array.from(this._entries.values());
      const encoded = stringifyJsonSafe(data, {
        feature: 'economy',
        key: QUEUE_STORAGE_KEY,
      });
      if (encoded) { await this.storage.setItem(QUEUE_STORAGE_KEY, encoded); }
    } catch (error) {
      debug.error('Failed to save offline queue:', toError(error));
    }
  }

  enqueue(entry: QInput): QueueEntry {
    if (entry.dedupeKey) {
      const existing = this.findByDedupeKey(entry.dedupeKey);
      if (existing && existing.status === 'PENDING') {
        if (
          entry.payload.timestamp &&
          existing.payload.timestamp &&
          entry.payload.timestamp > existing.payload.timestamp
        ) {
          const updated: QueueEntry = {
            ...existing, payload: entry.payload, updatedAt: Date.now(),
          };
          this._entries.set(updated.id, updated);
          this.saveToStorage();
          return updated;
        }
        return existing;
      }
    }
    const now = Date.now();
    const newEntry: QueueEntry = {
      ...entry, id: v4(), status: 'PENDING',
      createdAt: now, updatedAt: now, retryCount: 0,
    };
    this._entries.set(newEntry.id, newEntry);
    this.saveToStorage();
    return newEntry;
  }

  private findByDedupeKey(dedupeKey: string): QueueEntry | undefined {
    return Array.from(this._entries.values()).find((e) => e.dedupeKey === dedupeKey);
  }

  dequeue(entryId: string): QueueEntry | null {
    const entry = this._entries.get(entryId);
    if (!entry) return null;
    this._entries.delete(entryId);
    this.saveToStorage();
    return entry;
  }

  updateStatus(
    entryId: string,
    status: QueueEntryStatus,
    error?: string,
  ): QueueEntry | null {
    const entry = this._entries.get(entryId);
    if (!entry) return null;
    const updated: QueueEntry = {
      ...entry, status, updatedAt: Date.now(),
      lastError: error ?? entry.lastError,
      retryCount: status === 'FAILED' ? entry.retryCount + 1 : entry.retryCount,
    };
    if (status === 'FAILED' && updated.retryCount < updated.maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, updated.retryCount), 30000);
      updated.nextRetryAt = Date.now() + delay;
      updated.status = 'PENDING';
    }
    this._entries.set(entryId, updated);
    this.saveToStorage();
    return updated;
  }

  getPending(): QueueEntry[] {
    return Array.from(this._entries.values())
      .filter((e) => e.status === 'PENDING' && (!e.nextRetryAt || e.nextRetryAt <= Date.now()))
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.createdAt - b.createdAt;
      });
  }

  getByUser(userId: string): QueueEntry[] {
    return Array.from(this._entries.values())
      .filter((e) => e.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getFailed(): QueueEntry[] {
    return Array.from(this._entries.values())
      .filter((e) => e.status === 'FAILED')
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getAll(): QueueEntry[] { return Array.from(this._entries.values()); }

  clear(): void { this._entries.clear(); this.saveToStorage(); }

  clearCompleted(): void {
    for (const [id, entry] of this._entries) {
      if (entry.status === 'COMPLETED') this._entries.delete(id);
    }
    this.saveToStorage();
  }

  getStats(): { total: number; pending: number; processing: number; completed: number; failed: number; byType: Record<string, number> } {
    const entriesList = Array.from(this._entries.values());
    const byType: Record<string, number> = {};
    for (const entry of entriesList) {
      byType[entry.type] = (byType[entry.type] ?? 0) + 1;
    }
    return {
      total: entriesList.length,
      pending: entriesList.filter((e) => e.status === 'PENDING').length,
      processing: entriesList.filter((e) => e.status === 'PROCESSING').length,
      completed: entriesList.filter((e) => e.status === 'COMPLETED').length,
      failed: entriesList.filter((e) => e.status === 'FAILED').length,
      byType,
    };
  }
}

export const offlineQueue = new OfflineQueue();
