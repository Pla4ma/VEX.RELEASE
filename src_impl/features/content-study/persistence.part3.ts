import { captureSilentFailure } from "../../utils/silent-failure";
import type { PersistedDraft, PersistedStudySession, LocalCacheEntry, SyncQueueItem, StudyContent, StudyGeneration } from "./types";
import { CONTENT_STUDY_CONSTANTS } from "./types";
import { getDefaultStorageAdapter } from "../../persistence";


export class OfflineManager {
  private static instance: OfflineManager;
  private isOfflineMode = false;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  static resetForTests(): void {
    OfflineManager.instance = new OfflineManager();
  }

  async setOfflineMode(enabled: boolean): Promise<void> {
    this.isOfflineMode = enabled;
    await getStorage().setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(enabled));
  }

  async isInOfflineMode(): Promise<boolean> {
    try {
      const data = await getStorage().getItem(STORAGE_KEYS.OFFLINE_MODE);
      return data ? JSON.parse(data) : false;
    } catch (error) {
      captureSilentFailure(error, { feature: 'content-study', operation: 'safe-fallback', type: 'data' });
      return false;
    }
  }

  getOfflineModeSync(): boolean {
    return this.isOfflineMode;
  }

  async canPerformAction(action: 'submit' | 'generate' | 'feedback'): Promise<boolean> {
    const offline = await this.isInOfflineMode();

    if (!offline) {
      return true;
    }

    // All actions can be queued when offline
    return true;
  }
}

export async function getStorageUsage(): Promise<{
  drafts: number;
  sessions: number;
  cache: number;
  syncQueue: number;
  total: number;
}> {
  const storage = getStorage();
  const keys = [STORAGE_KEYS.DRAFTS, STORAGE_KEYS.SESSIONS, STORAGE_KEYS.SYNC_QUEUE];

  const allKeys = (await storage.getAllKeys?.()) || [];
  const cacheKeys = allKeys.filter((k) => k.startsWith(STORAGE_KEYS.CACHE));
  const relevantKeys = [...keys, ...cacheKeys];

  const items = await Promise.all(relevantKeys.map(async (k) => [k, await storage.getItem(k)]));

  const sizes = {
    drafts: 0,
    sessions: 0,
    cache: 0,
    syncQueue: 0,
    total: 0,
  };

  items.forEach(([itemKey, value]) => {
    if (!value || !itemKey) {
      return;
    }
    const size = new Blob([value]).size;

    if (itemKey === STORAGE_KEYS.DRAFTS) {
      sizes.drafts = size;
    } else if (itemKey === STORAGE_KEYS.SESSIONS) {
      sizes.sessions = size;
    } else if (itemKey === STORAGE_KEYS.SYNC_QUEUE) {
      sizes.syncQueue = size;
    } else if (itemKey.startsWith(STORAGE_KEYS.CACHE)) {
      sizes.cache += size;
    }

    sizes.total += size;
  });

  return sizes;
}

export async function clearAllContentStudyData(): Promise<void> {
  const storage = getStorage();
  const allKeys = (await storage.getAllKeys?.()) || [];
  const contentStudyKeys = allKeys.filter((k) => k.startsWith(CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY));

  for (const key of contentStudyKeys) {
    await storage.removeItem(key);
  }

  // Clear memory caches - remove direct cache access
  // DraftManager and CacheManager will clear their own caches when needed
}

export const draftManager = DraftManager.getInstance();

export const studySessionManager = StudySessionManager.getInstance();

export const cacheManager = CacheManager.getInstance();

export const syncQueueManager = SyncQueueManager.getInstance();

export const offlineManager = OfflineManager.getInstance();