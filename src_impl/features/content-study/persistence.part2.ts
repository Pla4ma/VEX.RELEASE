import { captureSilentFailure } from "../../utils/silent-failure";
import type { PersistedDraft, PersistedStudySession, LocalCacheEntry, SyncQueueItem, StudyContent, StudyGeneration } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import { getDefaultStorageAdapter } from "../../persistence";


export class CacheManager {
  private static instance: CacheManager;
  private memoryCache: Map<string, LocalCacheEntry<unknown>> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  static resetForTests(): void {
    CacheManager.instance = new CacheManager();
  }

  async get<T>(key: string): Promise<T | null> {
    // Check memory first
    const memoryEntry = this.memoryCache.get(key) as LocalCacheEntry<T> | undefined;
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data;
    }

    // Check persistent storage
    try {
      const data = await getStorage().getItem(`${STORAGE_KEYS.CACHE}:${key}`);
      if (!data) {
        return null;
      }

      const entry: LocalCacheEntry<T> = JSON.parse(data);

      if (entry.expiresAt < Date.now()) {
        await this.delete(key);
        return null;
      }

      // Populate memory cache
      this.memoryCache.set(key, entry);
      return entry.data;
    } catch (error) {
      captureSilentFailure(error, { feature: 'content-study', operation: 'safe-fallback', type: 'data' });
      return null;
    }
  }

  async set<T>(
    key: string,
    data: T,
    options: {
      ttlMs?: number;
      etag?: string;
    } = {},
  ): Promise<void> {
    const now = Date.now();
    const entry: LocalCacheEntry<T> = {
      data,
      cachedAt: now,
      expiresAt: now + (options.ttlMs || 5 * 60 * 1000), // Default 5 min
      etag: options.etag,
      source: 'localStorage',
    };

    this.memoryCache.set(key, entry);
    await getStorage().setItem(`${STORAGE_KEYS.CACHE}:${key}`, JSON.stringify(entry));
  }

  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    await getStorage().removeItem(`${STORAGE_KEYS.CACHE}:${key}`);
  }

  async clear(): Promise<void> {
    const storage = getStorage();
    const allKeys = (await storage.getAllKeys?.()) || [];
    const cacheKeys = allKeys.filter((k) => k.startsWith(STORAGE_KEYS.CACHE));
    for (const key of cacheKeys) {
      await storage.removeItem(key);
    }
    this.memoryCache.clear();
  }

  async getContentWithCache(contentId: string): Promise<StudyContent | null> {
    const cacheKey = `content:${contentId}`;
    return this.get<StudyContent>(cacheKey);
  }

  async cacheContent(content: StudyContent, ttlMs?: number): Promise<void> {
    const cacheKey = `content:${content.id}`;
    await this.set(cacheKey, content, { ttlMs });
  }

  async getGenerationWithCache(generationId: string): Promise<StudyGeneration | null> {
    const cacheKey = `generation:${generationId}`;
    return this.get<StudyGeneration>(cacheKey);
  }

  async cacheGeneration(generation: StudyGeneration, ttlMs?: number): Promise<void> {
    const cacheKey = `generation:${generation.id}`;
    await this.set(cacheKey, generation, { ttlMs });
  }
}

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

  async enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>): Promise<SyncQueueItem> {
    const queue = await this.getQueue();

    if (queue.length >= CONTENT_STUDY_CONSTANTS.OFFLINE_QUEUE_MAX_SIZE) {
      // Remove oldest non-critical items
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
      captureSilentFailure(error, { feature: 'content-study', operation: 'safe-fallback', type: 'data' });
      return [];
    }
  }

  async saveQueue(queue: SyncQueueItem[]): Promise<void> {
    await getStorage().setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  async dequeue(id: string): Promise<boolean> {
    const queue = await this.getQueue();
    const filtered = queue.filter((item) => item.id !== id);

    if (filtered.length === queue.length) {
      return false;
    }

    await this.saveQueue(filtered);
    return true;
  }

  async incrementRetry(id: string, error?: string): Promise<SyncQueueItem | null> {
    const queue = await this.getQueue();
    const item = queue.find((i) => i.id === id);

    if (!item) {
      return null;
    }

    item.retryCount++;
    item.lastAttempt = Date.now();
    item.error = error;

    await this.saveQueue(queue);
    return item;
  }

  async clearCompleted(): Promise<void> {
    const queue = await this.getQueue();
    const pending = queue.filter((item) => item.retryCount < item.maxRetries && !item.error);
    await this.saveQueue(pending);
  }

  async getPendingItems(): Promise<SyncQueueItem[]> {
    const queue = await this.getQueue();
    return queue.filter((item) => item.retryCount < item.maxRetries);
  }

  async getFailedItems(): Promise<SyncQueueItem[]> {
    const queue = await this.getQueue();
    return queue.filter((item) => item.retryCount >= item.maxRetries || item.error);
  }
}