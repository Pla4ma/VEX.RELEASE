import { getStorage, STORAGE_KEYS } from '../persistence';
import { CONTENT_STUDY_CONSTANTS } from '../types';

export async function getStorageUsage(): Promise<{
  drafts: number;
  sessions: number;
  cache: number;
  syncQueue: number;
  total: number;
}> {
  const storage = getStorage();
  const keys = [
    STORAGE_KEYS.DRAFTS,
    STORAGE_KEYS.SESSIONS,
    STORAGE_KEYS.SYNC_QUEUE,
  ];
  const allKeys = (await storage.getAllKeys?.()) || [];
  const cacheKeys = allKeys.filter((k) => k.startsWith(STORAGE_KEYS.CACHE));
  const relevantKeys = [...keys, ...cacheKeys];

  const items = await Promise.all(
    relevantKeys.map(async (k) => [k, await storage.getItem(k)] as const),
  );

  const sizes = { drafts: 0, sessions: 0, cache: 0, syncQueue: 0, total: 0 };

  items.forEach(([itemKey, value]) => {
    if (!value || !itemKey) {return;}

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
  const contentStudyKeys = allKeys.filter((k) =>
    k.startsWith(CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY),
  );

  await Promise.all(contentStudyKeys.map((key) => storage.removeItem(key)));
}
