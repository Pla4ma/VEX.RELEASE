export { STORAGE_KEYS, getStorage } from "./persistence/storage-config";

export { DraftManager } from "./persistence/DraftManager";
export { StudySessionManager } from "./persistence/StudySessionManager";
export { CacheManager } from "./persistence/CacheManager";
export { SyncQueueManager } from "./persistence/SyncQueueManager";
export { OfflineManager } from "./persistence/OfflineManager";
export {
  getStorageUsage,
  clearAllContentStudyData,
} from "./persistence/storage-utils";

import { DraftManager } from "./persistence/DraftManager";
import { StudySessionManager } from "./persistence/StudySessionManager";
import { CacheManager } from "./persistence/CacheManager";
import { SyncQueueManager } from "./persistence/SyncQueueManager";
import { OfflineManager } from "./persistence/OfflineManager";

export const draftManager = DraftManager.getInstance();
export const studySessionManager = StudySessionManager.getInstance();
export const cacheManager = CacheManager.getInstance();
export const syncQueueManager = SyncQueueManager.getInstance();
export const offlineManager = OfflineManager.getInstance();
