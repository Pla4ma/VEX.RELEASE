/**
 * Economy Offline Queue - Processing
 *
 * Standalone functions that operate on an OfflineQueue instance.
 * Attached to the class prototype via module augmentation.
 */

import type { QueueEntry } from './offline-queue-schemas';
import { readStringPayload, readNumberPayload } from './offline-queue-schemas';
import { OfflineQueue } from './offline-queue-core';

// Module augmentation: add processQueue and resolveConflicts to OfflineQueue
declare module './offline-queue-core' {
  interface OfflineQueue {
    processQueue<T>(
      processor: (entry: QueueEntry) => Promise<T>,
      options?: {
        batchSize?: number;
        onError?: (entry: QueueEntry, error: unknown) => void;
      },
    ): Promise<{ processed: number; failed: number }>;

    resolveConflicts(): QueueEntry[];
  }
}

async function processQueueImpl<T>(
  this: OfflineQueue,
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
      const unresolvedDeps = entry.dependencies.filter((depId) => {
        const dep = this.entries.get(depId);
        return dep && dep.status !== 'COMPLETED';
      });

      if (unresolvedDeps.length > 0) {
        continue;
      }

      this.entries.set(entry.id, { ...entry, status: 'PROCESSING' });

      try {
        await processor(entry);
        this.updateStatus(entry.id, 'COMPLETED');
        processed++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
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

function resolveConflictsImpl(this: OfflineQueue): QueueEntry[] {
  const conflicts: QueueEntry[] = [];
  const userOps = new Map<string, QueueEntry[]>();

  for (const entry of this.entries.values()) {
    if (entry.status !== 'PENDING') {
      continue;
    }

    const userEntries = userOps.get(entry.userId) ?? [];
    userEntries.push(entry);
    userOps.set(entry.userId, userEntries);
  }

  for (const entries of userOps.values()) {
    const currencyOps = entries.filter(
      (e) => e.type === 'EARN_CURRENCY' || e.type === 'SPEND_CURRENCY',
    );

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
          const earns = ops.filter(
            (o) => o.type === 'EARN_CURRENCY' && o.createdAt > op.createdAt,
          );
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

OfflineQueue.prototype.processQueue = processQueueImpl as OfflineQueue['processQueue'];
OfflineQueue.prototype.resolveConflicts = resolveConflictsImpl as OfflineQueue['resolveConflicts'];
