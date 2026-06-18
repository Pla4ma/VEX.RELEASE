import { z } from 'zod';
import { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import { captureSilentFailure } from '../../utils/silent-failure';
import { v4 } from '../../utils/uuid';
import { getConnectionState, subscribeToConnectionChanges } from '../repository/base';

const OFFLINE_QUEUE_STORAGE_KEY = 'offline_queue_v1';
const MAX_OFFLINE_QUEUE_SIZE = 100;
const offlineQueueStorage = new MMKVStorageAdapter('offline-queue');

export const OfflineQueueEntrySchema = z
  .object({
    id: z.string().uuid(),
    operation: z.enum(['CREATE', 'UPDATE', 'DELETE', 'XP_ADD', 'REWARD_CLAIM', 'STREAK_RECORD', 'SESSION_COMPLETE', 'MEMORY_CREATE']),
    feature: z.enum(['progression', 'streaks', 'rewards', 'boss', 'sessions', 'focus-memory']),
    payload: z.record(z.unknown()),
    idempotencyKey: z.string(),
    createdAt: z.number(),
    retryCount: z.number().default(0),
    maxRetries: z.number().default(3),
    priority: z.enum(['high', 'normal', 'low', 'critical']).default('normal'),
    dependsOn: z.string().uuid().optional(),
    error: z.string().optional(),
  })
  .strict();

export type OfflineQueueEntry = z.infer<typeof OfflineQueueEntrySchema>;
export type OfflineQueueEntryInput = Omit<OfflineQueueEntry, 'id' | 'createdAt' | 'retryCount' | 'maxRetries' | 'priority'> & { retryCount?: number; maxRetries?: number; priority?: 'high' | 'normal' | 'low' | 'critical' };

const queue: OfflineQueueEntry[] = [];
const processingSet = new Set<string>();
const listeners: Set<(queue: OfflineQueueEntry[]) => void> = new Set();
const processors: Map<string, QueueProcessor> = new Map();
export function persistQueue(): void {
  try {
    offlineQueueStorage.setItemSync(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    captureSilentFailure(error, { feature: 'lib', operation: 'offline-queue-persist', type: 'data' });
  }
}
export function loadQueue(): void {
  const stored = offlineQueueStorage.getItemSync(OFFLINE_QUEUE_STORAGE_KEY);
  queue.length = 0;
  processingSet.clear();
  if (!stored) { notifyListeners(); return; }
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {throw new Error('Offline queue storage is not an array');}
    for (const candidate of parsed) {
      const result = OfflineQueueEntrySchema.safeParse(candidate);
      if (result.success) {queue.push(result.data);}
      else {captureSilentFailure(result.error, { feature: 'lib', operation: 'offline-queue-load-entry', type: 'data' });}
    }
  } catch (error) {
    captureSilentFailure(error, { feature: 'lib', operation: 'offline-queue-load', type: 'data' });
  }
  notifyListeners();
}
let queueInitialized = false;
function ensureInitialized(): void {
  if (queueInitialized) return;
  queueInitialized = true;
  loadQueue();
}
export function enqueue(entry: OfflineQueueEntryInput): OfflineQueueEntry {
  ensureInitialized();
  if (queue.length >= MAX_OFFLINE_QUEUE_SIZE) {
    captureSilentFailure(new Error(`Offline queue full (${queue.length}/${MAX_OFFLINE_QUEUE_SIZE})`), { feature: 'lib', operation: 'offline-queue-overflow', type: 'data' });
    // Evict oldest low-priority entry
    const evictIndex = queue.findIndex((e) => e.priority === 'low');
    const removeIndex = evictIndex >= 0 ? evictIndex : queue.length - 1;
    const [evicted] = queue.splice(removeIndex, 1);
    if (evicted) {
      captureSilentFailure(new Error(`Evicted queue entry ${evicted.id} (${evicted.operation})`), { feature: 'lib', operation: 'offline-queue-evict', type: 'data' });
    }
  }
  const fullEntry: OfflineQueueEntry = { ...entry, retryCount: entry.retryCount ?? 0, maxRetries: entry.maxRetries ?? 3, priority: entry.priority ?? 'normal', id: v4(), createdAt: Date.now() };
  const existingIndex = queue.findIndex((e) => e.idempotencyKey === entry.idempotencyKey);
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
export function getQueue(): readonly OfflineQueueEntry[] { return Object.freeze([...queue]); }
export function getQueueLength(): number { return queue.length; }
export function clearQueue(): void {
  queue.length = 0; processingSet.clear(); notifyListeners();
  offlineQueueStorage.removeItemSync(OFFLINE_QUEUE_STORAGE_KEY);
}
export function updateEntry(entryId: string, updates: Partial<OfflineQueueEntry>): void {
  const index = queue.findIndex((e) => e.id === entryId);
  if (index === -1) {return;}
  queue[index] = { ...queue[index]!, ...updates };
  notifyListeners(); persistQueue();
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
  if (entry.dependsOn && queue.find((e) => e.id === entry.dependsOn)) {throw new Error(`Dependency not yet processed: ${entry.dependsOn}`);}
  if (!markProcessing(entry.id)) {throw new Error(`Entry ${entry.id} is already being processed`);}
  try {
    await processor(entry);
    dequeue(entry.id);
  } catch (error) {
    unmarkProcessing(entry.id);
    updateEntry(entry.id, { retryCount: entry.retryCount + 1, error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}
let autoProcessInterval: ReturnType<typeof setInterval> | null = null;
let isAutoProcessingEnabled = false;
export function startAutoProcessing(intervalMs: number = 5000): void {
  if (isAutoProcessingEnabled) {return;}
  isAutoProcessingEnabled = true;
  if (getConnectionState() === 'online') {processQueue();}
  subscribeToConnectionChanges((state) => {
    if (state === 'online') {processQueue();}
  });
  autoProcessInterval = setInterval(() => {
    if (getConnectionState() === 'online' && queue.length > 0) {processQueue();}
  }, intervalMs);
}
export function stopAutoProcessing(): void {
  isAutoProcessingEnabled = false;
  if (autoProcessInterval) {clearInterval(autoProcessInterval);}
  autoProcessInterval = null;
}
async function processQueue(): Promise<void> {
  pruneExpiredEntries();
  for (const entry of queue.filter((e) => !isProcessing(e.id))) {
    try {
      await processEntry(entry);
    } catch (error) {
      captureSilentFailure(error, { feature: 'lib', operation: 'network-fallback', type: 'network' });
    }
  }
}
export interface ConflictResolution {
  strategy: 'client-wins' | 'server-wins' | 'merge' | 'manual';
  resolvedData?: Record<string, unknown>;
}
export function resolveConflict(
  serverData: Record<string, unknown>,
  clientData: Record<string, unknown>,
  strategy: ConflictResolution['strategy'],
): Record<string, unknown> {
  switch (strategy) {
    case 'client-wins':
      return { ...serverData, ...clientData, _resolvedAt: Date.now() };
    case 'server-wins':
      return { ...serverData, _resolvedAt: Date.now() };
    case 'merge':
      return { ...serverData, ...clientData, _resolvedAt: Date.now() };
    default:
      throw new Error('Manual conflict resolution required');
  }
}
export const OFFLINE_QUEUE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export function pruneExpiredEntries(): void {
  const cutoff = Date.now() - OFFLINE_QUEUE_TTL_MS;
  const before = queue.length;
  for (let i = queue.length - 1; i >= 0; i -= 1) {
    if ((queue[i]?.createdAt ?? 0) < cutoff) {queue.splice(i, 1);}
  }
  if (queue.length < before) {
    notifyListeners();
    persistQueue();
  }
}
