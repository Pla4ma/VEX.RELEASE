import { captureSilentFailure } from '../../../utils/silent-failure';
import type { SyncQueueItem } from '../types';
import { CONTENT_STUDY_CONSTANTS } from '../types';
import { getStorage, STORAGE_KEYS } from '../persistence';

export class SyncQueueManager {
  private static instance: SyncQueueManager;

  static getInstance(): SyncQueueManager {
    if (!SyncQueueManager.instance) {
      SyncQueueManager.instance = new SyncQueueManager();
    }
    return SyncQueueManager.instance;
  }

  static resetForTests(): void {
    SyncQueueManager.instance = new SyncQueueManager();
  }

  async enqueue(
    item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>,
  ): Promise<SyncQueueItem> {
    const queue = await this.getQueue();

    if (queue.length >= CONTENT_STUDY_CONSTANTS.OFFLINE_QUEUE_MAX_SIZE) {
      const nonCriticalIndex = queue.findIndex((i) => i.entity !== 'content');
      if (nonCriticalIndex >= 0) {
        queue.splice(nonCriticalIndex, 1);
      } else {
        throw new Error('Sync queue is full');
      }
    }

    const fullItem: SyncQueueItem = {
      ...item,
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      retryCount: 0,
    };

    queue.push(fullItem);
    await this.saveQueue(queue);
    return fullItem;
  }

  async getQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await getStorage().getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'content-study',
        operation: 'safe-fallback',
        type: 'data',
      });
      return [];
    }
  }

  async saveQueue(queue: SyncQueueItem[]): Promise<void> {
    await getStorage().setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  async dequeue(id: string): Promise<boolean> {
    const queue = await this.getQueue();
    const filtered = queue.filter((item) => item.id !== id);

    if (filtered.length === queue.length) {return false;}

    await this.saveQueue(filtered);
    return true;
  }

  async incrementRetry(
    id: string,
    error?: string,
  ): Promise<SyncQueueItem | null> {
    const queue = await this.getQueue();
    const item = queue.find((i) => i.id === id);

    if (!item) {return null;}

    item.retryCount++;
    item.lastAttempt = Date.now();
    item.error = error;
    await this.saveQueue(queue);
    return item;
  }

  async clearCompleted(): Promise<void> {
    const queue = await this.getQueue();
    const pending = queue.filter(
      (item) => item.retryCount < item.maxRetries && !item.error,
    );
    await this.saveQueue(pending);
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const queue = await this.getQueue();
    return queue.filter((item) => item.retryCount < item.maxRetries);
  }

  async getFailedItems(): Promise<SyncQueueItem[]> {
    const queue = await this.getQueue();
    return queue.filter(
      (item) => item.retryCount >= item.maxRetries || item.error,
    );
  }
}
