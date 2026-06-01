import { getDefaultStorageAdapter } from "../../../persistence";
import { CONTENT_STUDY_CONSTANTS } from "../types";

export const getStorage = () => getDefaultStorageAdapter();

export const STORAGE_KEYS = {
  DRAFTS: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:drafts`,
  SESSIONS: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:sessions`,
  CACHE: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:cache`,
  SYNC_QUEUE: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:sync-queue`,
  METRICS: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:metrics`,
  LAST_SYNC: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:last-sync`,
  OFFLINE_MODE: `${CONTENT_STUDY_CONSTANTS.LOCAL_STORAGE_KEY}:offline-mode`,
} as const;
