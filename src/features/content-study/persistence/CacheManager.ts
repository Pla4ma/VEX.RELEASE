import { captureSilentFailure } from '../../../utils/silent-failure';
import type { LocalCacheEntry, StudyContent, StudyGeneration } from '../types';
import { getStorage, STORAGE_KEYS } from '../persistence';

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
    const memoryEntry = this.memoryCache.get(key) as
      | LocalCacheEntry<T>
      | undefined;
    if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
      return memoryEntry.data;
    }

    try {
      const data = await getStorage().getItem(`${STORAGE_KEYS.CACHE}:${key}`);
      if (!data) {return null;}

      const entry: LocalCacheEntry<T> = JSON.parse(data);
      if (entry.expiresAt < Date.now()) {
        await this.delete(key);
        return null;
      }

      this.memoryCache.set(key, entry);
      return entry.data;
    } catch (error) {
      captureSilentFailure(error, {
        feature: 'content-study',
        operation: 'safe-fallback',
        type: 'data',
      });
      return null;
    }
  }

  async set<T>(
    key: string,
    data: T,
    options: { ttlMs?: number; etag?: string } = {},
  ): Promise<void> {
    const now = Date.now();
    const entry: LocalCacheEntry<T> = {
      data,
      cachedAt: now,
      expiresAt: now + (options.ttlMs || 5 * 60 * 1000),
      etag: options.etag,
      source: 'mmkv',
    };

    this.memoryCache.set(key, entry);
    await getStorage().setItem(
      `${STORAGE_KEYS.CACHE}:${key}`,
      JSON.stringify(entry),
    );
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

  async getGenerationWithCache(
    generationId: string,
  ): Promise<StudyGeneration | null> {
    const cacheKey = `generation:${generationId}`;
    return this.get<StudyGeneration>(cacheKey);
  }

  async cacheGeneration(
    generation: StudyGeneration,
    ttlMs?: number,
  ): Promise<void> {
    const cacheKey = `generation:${generation.id}`;
    await this.set(cacheKey, generation, { ttlMs });
  }
}
