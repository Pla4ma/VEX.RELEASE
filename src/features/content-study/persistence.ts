
import type {
  PersistedDraft,
  PersistedStudySession,
  LocalCacheEntry,
  SyncQueueItem,
  StudyContent,
  StudyGeneration,
} from './types';
import { CONTENT_STUDY_CONSTANTS } from './types';
import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';

const getStorage = () => getDefaultStorageAdapter();

const STORAGE_KEYS = {
  DRAFTS: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:drafts`,
  SESSIONS: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:sessions`,
  CACHE: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:cache`,
  SYNC_QUEUE: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:sync-queue`,
  METRICS: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`,
  LAST_SYNC: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:last-sync`,
  OFFLINE_MODE: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:offline-mode`,
} as const;

export { STORAGE_KEYS, getStorage };

export { DraftManager } from './persistence/DraftManager';
export { StudySessionManager } from './persistence/StudySessionManager';
export { CacheManager } from './persistence/CacheManager';
export { SyncQueueManager } from './persistence/SyncQueueManager';
export { OfflineManager } from './persistence/OfflineManager';
export {
  getStorageUsage,
  clearAllContentStudyData,
} from './persistence/storage-utils';

import { DraftManager } from './persistence/DraftManager';
import { StudySessionManager } from './persistence/StudySessionManager';
import { CacheManager } from './persistence/CacheManager';
import { SyncQueueManager } from './persistence/SyncQueueManager';
import { OfflineManager } from './persistence/OfflineManager';

export const draftManager = DraftManager.getInstance();
export const studySessionManager = StudySessionManager.getInstance();
export const cacheManager = CacheManager.getInstance();
export const syncQueueManager = SyncQueueManager.getInstance();
export const offlineManager = OfflineManager.getInstance();
