import { z } from 'zod';
import { getMMKVStorageAdapter, MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { captureSilentFailure } from '../../utils/silent-failure';
import { v4 } from '../../utils/uuid';
import { getConnectionState, subscribeToConnectionChanges } from '../repository/base';
import { inferQueueUserId } from './queue-identity';
import {
  OFFLINE_QUEUE_TTL_MS,
  pruneQueueEntries,
  resolveConflict,
  type ConflictResolution,
} from './queue-maintenance';
import { createQueueAutoProcessor } from './queue-auto-processing';
import { reserveQueueCapacity } from './queue-capacity';
import { loadQueueEntries, persistQueueEntries } from './queue-storage';
const OFFLINE_QUEUE_STORAGE_KEY = 'offline_queue_v1';
const MAX_OFFLINE_QUEUE_SIZE = 100;
const offlineQueueStorage = typeof getMMKVStorageAdapter === 'function' ? getMMKVStorageAdapter() : new MMKVStorageAdapter('offline-queue');

export const OfflineQueueEntrySchema = z
  .object({
    id: z.string().uuid(),
    operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'XP_ADD', 'REWARD_CLAIM', 'STREAK_RECORD', 'SESSION_COMPLETE', 'MEMORY_CREATE']),
    feature: z.enum(['progression', 'streaks', 'rewards', 'boss', 'sessions', 'focus-memory']),
    payload: z.record(z.string(), z.unknown()),
    idempotencyKey: z.string(),
    userId: z.string().min(1).optional(),
    createdAt: z.number(),
    retryCount: z.number().default(0),
    maxRetries: z.number().default(3),
    priority: z.enum(['high', 'normal', 'low', 'critical']).default('normal'),
    status: z.enum(['queued', 'processing', 'dead_letter']).optional(),
    dependsOn: z.string().uuid().optional(),
    error: z.string().optional(),
    deadLetteredAt: z.number().optional(),
  })
  .strict();
export type OfflineQueueEntry = z.infer<typeof OfflineQueueEntrySchema>;
export type OfflineQueueEntryInput = Omit<
  OfflineQueueEntry,
  'id' | 'createdAt' | 'retryCount' | 'maxRetries' | 'priority' | 'status' | 'deadLetteredAt' | 'userId'
> & {
  retryCount?: number;
  maxRetries?: number;
  priority?: 'high' | 'normal' | 'low' | 'critical';
  status?: 'queued';
  userId?: string;
};

const queue: OfflineQueueEntry[] = [];
const processingSet = new Set<string>();
const listeners: Set<(queue: OfflineQueueEntry[]) => void> = new Set();
const processors: Map<string, QueueProcessor> = new Map();
export function persistQueue(): void {
  persistQueueEntries(queue, offlineQueueStorage, OFFLINE_QUEUE_STORAGE_KEY);
}
export function loadQueue(): void {
  loadQueueEntries(
    queue,
    processingSet,
    offlineQueueStorage,
    OFFLINE_QUEUE_STORAGE_KEY,
    (candidate) => {
      const result = OfflineQueueEntrySchema.safeParse(candidate);
      if (!result.success) {
        captureSilentFailure(result.error, {
          feature: 'lib',
          operation: 'offline-queue-load-entry',
          type: 'data',
        });
        return undefined;
      }
      return result.data;
    },
    notifyListeners,
  );
}
let queueInitialized = false;
function ensureInitialized(): void { if (queueInitialized) return; queueInitialized = true; loadQueue(); }

export function enqueue(entry: OfflineQueueEntryInput): OfflineQueueEntry {
  ensureInitialized();
  const existingIndex = queue.findIndex((e) => e.idempotencyKey === entry.idempotencyKey);
  reserveQueueCapacity(queue, entry, MAX_OFFLINE_QUEUE_SIZE);
  const fullEntry: OfflineQueueEntry = { ...entry, userId: inferQueueUserId(entry), retryCount: entry.retryCount ?? 0, maxRetries: entry.maxRetries ?? 3, priority: entry.priority ?? 'normal', status: 'queued', id: v4(), createdAt: Date.now() };
  if (existingIndex >= 0) {
    queue[existingIndex] = { ...queue[existingIndex]!, ...fullEntry };
    notifyListeners();
    persistQueue();
    return queue[existingIndex]!;
  }
  const priorityOrder: Record<OfflineQueueEntry['priority'], number> = { critical: 0, high: 1, normal: 2, low: 3 };
  const insertIndex = queue.findIndex((e) => priorityOrder[e.priority] > priorityOrder[entry.priority ?? 'normal']);
  if (insertIndex === -1) {queue.push(fullEntry);}
  else {queue.splice(insertIndex, 0, fullEntry);}
  notifyListeners(); persistQueue(); return fullEntry;
}
export function dequeue(entryId: string): OfflineQueueEntry | undefined {
  const index = queue.findIndex((e) => e.id === entryId);
  if (index === -1) {return undefined;}
  const entry = queue[index];
  queue.splice(index, 1); processingSet.delete(entryId); notifyListeners(); persistQueue();
  return entry;
}
export function getQueue(): readonly OfflineQueueEntry[] { ensureInitialized(); return Object.freeze([...queue]); }
export function getQueueLength(): number { ensureInitialized(); return queue.length; }
export function clearQueue(): void { queue.length = 0; processingSet.clear(); notifyListeners(); if (typeof offlineQueueStorage.removeItemSync === 'function') { offlineQueueStorage.removeItemSync(OFFLINE_QUEUE_STORAGE_KEY); } }
export function updateEntry(entryId: string, updates: Partial<OfflineQueueEntry>): void {
  const index = queue.findIndex((e) => e.id === entryId);
  if (index === -1) {return;}
  queue[index] = { ...queue[index]!, ...updates };
  notifyListeners(); persistQueue();
}
export function retryDeadLetter(entryId: string): OfflineQueueEntry | undefined {
  const entry = queue.find((candidate) => candidate.id === entryId);
  if (!entry || entry.status !== 'dead_letter') {
    return undefined;
  }
  updateEntry(entryId, {
    retryCount: 0,
    status: 'queued',
    error: undefined,
    deadLetteredAt: undefined,
  });
  return queue.find((candidate) => candidate.id === entryId);
}
export function markProcessing(entryId: string): boolean {
  if (processingSet.has(entryId)) {return false;}
  processingSet.add(entryId); return true;
}
export function unmarkProcessing(entryId: string): void { processingSet.delete(entryId); }
export function isProcessing(entryId: string): boolean { return processingSet.has(entryId); }
export function subscribe(callback: (queue: OfflineQueueEntry[]) => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
function notifyListeners(): void { const snapshot = [...queue]; listeners.forEach((cb) => cb(snapshot)); }
export type QueueProcessor = (entry: OfflineQueueEntry) => Promise<void>;
export function registerProcessor(feature: string, operation: string, processor: QueueProcessor): void {
  processors.set(`${feature}:${operation}`, processor);
}
export function unregisterProcessor(feature: string, operation: string): void { processors.delete(`${feature}:${operation}`); }
export async function processEntry(entry: OfflineQueueEntry): Promise<void> {
  const processor = processors.get(`${entry.feature}:${entry.operation}`);
  if (!processor) {throw new Error(`No processor registered for ${entry.feature}:${entry.operation}`);}
  if (entry.status === 'dead_letter') {throw new Error(`Entry ${entry.id} is dead-lettered`);}
  if (entry.dependsOn && queue.find((e) => e.id === entry.dependsOn)) {throw new Error(`Dependency not yet processed: ${entry.dependsOn}`);}
  if (!markProcessing(entry.id)) {throw new Error(`Entry ${entry.id} is already being processed`);}
  updateEntry(entry.id, { status: 'processing' });
  try {
    await processor(entry);
    dequeue(entry.id);
  } catch (error) {
    unmarkProcessing(entry.id);
    const retryCount = entry.retryCount + 1;
    const deadLettered = retryCount >= entry.maxRetries;
    updateEntry(entry.id, {
      retryCount,
      status: deadLettered ? 'dead_letter' : 'queued',
      deadLetteredAt: deadLettered ? Date.now() : undefined,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    unmarkProcessing(entry.id);
  }
}
async function processQueue(): Promise<void> {
  pruneExpiredEntries();
  for (const entry of queue.filter((e) => e.status !== 'dead_letter' && !isProcessing(e.id))) {
    try {
      await processEntry(entry);
    } catch (error) {
      captureSilentFailure(error, { feature: 'lib', operation: 'network-fallback', type: 'network' });
    }
  }
}
const autoProcessor = createQueueAutoProcessor({
  getConnectionState,
  hasEntries: () => getQueueLength() > 0,
  processQueue,
  subscribeToConnectionChanges,
});
export function startAutoProcessing(intervalMs: number = 5000): void {
  autoProcessor.start(intervalMs);
}
export function stopAutoProcessing(): void {
  autoProcessor.stop();
}
export { resolveConflict, OFFLINE_QUEUE_TTL_MS };
export type { ConflictResolution };
export function pruneExpiredEntries(): void {
  pruneQueueEntries(queue, notifyListeners, persistQueue);
}
