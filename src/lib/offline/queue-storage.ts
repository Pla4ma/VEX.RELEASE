import { captureSilentFailure } from '../../utils/silent-failure';
import type { MMKVStorageAdapter } from '../../persistence/MMKVStorageAdapter';
import type { OfflineQueueEntry } from './queue';

export function persistQueueEntries(
  queue: OfflineQueueEntry[],
  storage: MMKVStorageAdapter,
  storageKey: string,
): void {
  try {
    storage.setItemSync(storageKey, JSON.stringify(queue));
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'lib',
      operation: 'offline-queue-persist',
      type: 'data',
    });
  }
}

export function loadQueueEntries(
  queue: OfflineQueueEntry[],
  processingSet: Set<string>,
  storage: MMKVStorageAdapter,
  storageKey: string,
  parseEntry: (candidate: unknown) => OfflineQueueEntry | undefined,
  notify: () => void,
): void {
  const stored = storage.getItemSync(storageKey);
  queue.length = 0;
  processingSet.clear();
  if (!stored) {
    notify();
    return;
  }
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      throw new Error('Offline queue storage is not an array');
    }
    for (const candidate of parsed) {
      const entry = parseEntry(candidate);
      if (entry) {
        queue.push(entry);
      }
    }
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'lib',
      operation: 'offline-queue-load',
      type: 'data',
    });
  }
  notify();
}
