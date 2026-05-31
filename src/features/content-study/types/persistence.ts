import type { ContentSourceType } from './enums';

// Persistence Types
export interface PersistedStudySession {
  generationId: string;
  contentId: string;
  startTime: number;
  endTime?: number;
  completedTasks: string[];
  quizResults: Record<string, { correct: boolean; timeSpent: number }>;
  totalPauseTime: number;
  interruptions: number;
  finalRating?: number;
  synced: boolean;
}

export interface PersistedDraft {
  id: string;
  userId: string;
  type: 'paste' | 'pdf' | 'youtube';
  activeTab: 'paste' | 'pdf' | 'youtube';
  pastedText: string;
  youtubeUrl: string;
  selectedFile: {
    uri: string;
    name: string;
    size: number;
    type: string;
  } | null;
  createdAt: number;
  updatedAt: number;
  autoSaveVersion: number;
}

export interface LocalCacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
  etag?: string;
  source: 'memory' | 'mmkv' | 'indexedDB';
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: 'content' | 'generation' | 'feedback';
  payload: unknown;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  lastAttempt?: number;
  error?: string;
}

export interface ExtractContentRequest {
  contentId: string;
}
