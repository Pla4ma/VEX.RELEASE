import { createDebugger } from '../../../utils/debug';
import { parseSyncQueueJson } from './SessionRepositoryParsers';

const debug = createDebugger('session:repository');

type StorageGetter = (key: string) => Promise<string | null>;
type StorageSetter = (key: string, value: string) => Promise<void>;

export async function addToSyncQueue(
  sessionId: string,
  getString: StorageGetter,
  setString: StorageSetter,
  storageKey: string,
): Promise<void> {
  try {
    const data = await getString(storageKey);
    const queue: string[] = data ? parseSyncQueueJson(data) : [];
    if (!queue.includes(sessionId)) {
      queue.push(sessionId);
      await setString(storageKey, JSON.stringify(queue));
    }
  } catch (error) {
    debug.error(
      'Failed to add to sync queue',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export async function removeFromSyncQueue(
  sessionId: string,
  queue: string[],
  setString: StorageSetter,
  storageKey: string,
): Promise<void> {
  try {
    await setString(
      storageKey,
      JSON.stringify(queue.filter((id) => id !== sessionId)),
    );
  } catch (error) {
    debug.error(
      'Failed to remove from sync queue',
      error instanceof Error ? error : new Error(String(error)),
    );
  }
}

export async function getSyncQueue(
  getString: StorageGetter,
  storageKey: string,
): Promise<string[]> {
  try {
    const data = await getString(storageKey);
    return data ? parseSyncQueueJson(data) : [];
  } catch (error) {
    debug.error(
      'Failed to get sync queue',
      error instanceof Error ? error : new Error(String(error)),
    );
    return [];
  }
}
