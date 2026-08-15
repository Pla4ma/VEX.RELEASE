/**
 * Shared storage keys for content-study persistence.
 *
 * Extracted from the persistence barrel to break require cycles between the
 * persistence entry point and the per-resource manager files
 * (DraftManager, CacheManager, etc.).
 */

import { CONTENT_STUDY_CONSTANTS } from '../types';
import { getDefaultStorageAdapter } from '../../../persistence/MMKVStorageAdapter';

const getStorage = (): ReturnType<typeof getDefaultStorageAdapter> =>
  getDefaultStorageAdapter();

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
