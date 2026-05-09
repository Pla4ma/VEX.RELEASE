/**
 * Persistence Tests
 * Test coverage for persistence layer
 */

import { DraftManager, StudySessionManager, CacheManager, SyncQueueManager, OfflineManager, getStorageUsage, clearAllContentStudyData } from '../persistence';
import type { PersistedDraft, PersistedStudySession, SyncQueueItem } from '../types';

// Mock the storage adapter
const mockStorage = {
  data: new Map<string, string>(),
  async setItem(key: string, value: string) {
    this.data.set(key, value);
  },
  async getItem(key: string): Promise<string | null> {
    return this.data.get(key) || null;
  },
  async removeItem(key: string) {
    this.data.delete(key);
  },
  async getAllKeys(): Promise<string[]> {
    return Array.from(this.data.keys());
  },
  clear() {
    this.data.clear();
  },
};

jest.mock('../../../persistence', () => ({
  getDefaultStorageAdapter: () => mockStorage,
}));

describe('DraftManager', () => {
  let draftManager: DraftManager;

  beforeEach(() => {
    mockStorage.clear();
    DraftManager.resetForTests();
    draftManager = DraftManager.getInstance();
  });

  it('should save a draft', async () => {
    const draft = await draftManager.saveDraft({
      type: 'PASTE',
      content: 'Test content',
    });

    expect(draft.id).toBeDefined();
    expect(draft.type).toBe('PASTE');
    expect(draft.content).toBe('Test content');
    expect(draft.autoSaveVersion).toBe(1);
  });

  it('should update a draft', async () => {
    const draft = await draftManager.saveDraft({
      type: 'PASTE',
      content: 'Original content',
    });

    const updated = await draftManager.updateDraft(draft.id, {
      content: 'Updated content',
    });

    expect(updated).not.toBeNull();
    expect(updated?.content).toBe('Updated content');
    expect(updated?.autoSaveVersion).toBe(2);
  });

  it('should get a draft by id', async () => {
    const draft = await draftManager.saveDraft({
      type: 'YOUTUBE',
      content: 'https://youtube.com/watch?v=123',
    });

    const retrieved = await draftManager.getDraft(draft.id);

    expect(retrieved).toEqual(draft);
  });

  it('should return null for non-existent draft', async () => {
    const retrieved = await draftManager.getDraft('non-existent-id');
    expect(retrieved).toBeNull();
  });

  it('should get all drafts', async () => {
    await draftManager.saveDraft({ type: 'PASTE', content: 'Draft 1' });
    await draftManager.saveDraft({ type: 'PDF', content: 'Draft 2' });

    const drafts = await draftManager.getAllDrafts();

    expect(drafts).toHaveLength(2);
  });

  it('should filter drafts by type', async () => {
    await draftManager.saveDraft({ type: 'PASTE', content: 'Draft 1' });
    await draftManager.saveDraft({ type: 'PASTE', content: 'Draft 2' });
    await draftManager.saveDraft({ type: 'YOUTUBE', content: 'Draft 3' });

    const pasteDrafts = await draftManager.getDraftsByType('PASTE');

    expect(pasteDrafts).toHaveLength(2);
  });

  it('should delete a draft', async () => {
    const draft = await draftManager.saveDraft({
      type: 'PASTE',
      content: 'Draft to delete',
    });

    const deleted = await draftManager.deleteDraft(draft.id);
    const retrieved = await draftManager.getDraft(draft.id);

    expect(deleted).toBe(true);
    expect(retrieved).toBeNull();
  });

  it('should auto-save draft', async () => {
    const draft = await draftManager.autoSave('PASTE', 'Auto-saved content');

    expect(draft.content).toBe('Auto-saved content');
  });

  it('should update existing draft on auto-save', async () => {
    const draft = await draftManager.saveDraft({
      type: 'PASTE',
      content: 'Original',
    });

    const autoSaved = await draftManager.autoSave('PASTE', 'Updated content', draft.id);

    expect(autoSaved.id).toBe(draft.id);
    expect(autoSaved.autoSaveVersion).toBe(2);
  });

  it('should filter expired drafts', async () => {
    // Create a draft with old timestamp
    const oldDraft: PersistedDraft = {
      id: 'old-draft',
      type: 'PASTE',
      content: 'Old content',
      createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days old
      updatedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      autoSaveVersion: 1,
    };

    await mockStorage.setItem('content-study:drafts', JSON.stringify([oldDraft]));

    const drafts = await draftManager.getAllDrafts();

    expect(drafts).toHaveLength(0);
  });
});

describe('StudySessionManager', () => {
  let sessionManager: StudySessionManager;

  beforeEach(() => {
    mockStorage.clear();
    StudySessionManager.resetForTests();
    sessionManager = StudySessionManager.getInstance();
  });

  it('should save a session', async () => {
    const session: PersistedStudySession = {
      generationId: 'gen-123',
      startTime: Date.now(),
      completedTasks: [],
      quizAnswers: {},
      synced: false,
    };

    await sessionManager.saveSession(session);
    const sessions = await sessionManager.getAllSessions();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].generationId).toBe('gen-123');
  });

  it('should get active session for generation', async () => {
    const session: PersistedStudySession = {
      generationId: 'gen-123',
      startTime: Date.now(),
      completedTasks: [],
      quizAnswers: {},
      synced: false,
    };

    await sessionManager.saveSession(session);
    const active = await sessionManager.getActiveSession('gen-123');

    expect(active).not.toBeNull();
    expect(active?.generationId).toBe('gen-123');
  });

  it('should complete a session', async () => {
    const session: PersistedStudySession = {
      generationId: 'gen-123',
      startTime: Date.now(),
      completedTasks: [],
      quizAnswers: {},
      synced: false,
    };

    await sessionManager.saveSession(session);
    const completed = await sessionManager.completeSession('gen-123', {
      completedTasks: ['task-1'],
    });

    expect(completed).toBe(true);

    const sessions = await sessionManager.getAllSessions();
    expect(sessions[0].endTime).toBeDefined();
    expect(sessions[0].synced).toBe(false);
  });

  it('should get unsynced sessions', async () => {
    const syncedSession: PersistedStudySession = {
      generationId: 'gen-1',
      startTime: Date.now(),
      endTime: Date.now(),
      completedTasks: [],
      quizAnswers: {},
      synced: true,
    };

    const unsyncedSession: PersistedStudySession = {
      generationId: 'gen-2',
      startTime: Date.now(),
      endTime: Date.now(),
      completedTasks: [],
      quizAnswers: {},
      synced: false,
    };

    await sessionManager.saveSession(syncedSession);
    await sessionManager.saveSession(unsyncedSession);

    const unsynced = await sessionManager.getUnsyncedSessions();

    expect(unsynced).toHaveLength(1);
    expect(unsynced[0].generationId).toBe('gen-2');
  });

  it('should mark sessions as synced', async () => {
    const session: PersistedStudySession = {
      generationId: 'gen-123',
      startTime: Date.now(),
      endTime: Date.now(),
      completedTasks: [],
      quizAnswers: {},
      synced: false,
    };

    await sessionManager.saveSession(session);
    await sessionManager.markSessionsSynced(['gen-123']);

    const sessions = await sessionManager.getAllSessions();
    expect(sessions[0].synced).toBe(true);
  });
});

describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    mockStorage.clear();
    CacheManager.resetForTests();
    cacheManager = CacheManager.getInstance();
  });

  it('should cache and retrieve data', async () => {
    const data = { id: 'test', value: 'test data' };

    await cacheManager.set('test-key', data);
    const retrieved = await cacheManager.get('test-key');

    expect(retrieved).toEqual(data);
  });

  it('should return null for expired cache', async () => {
    const data = { id: 'test', value: 'test data' };

    await cacheManager.set('expired-key', data, { ttlMs: -1 }); // Already expired
    const retrieved = await cacheManager.get('expired-key');

    expect(retrieved).toBeNull();
  });

  it('should return null for non-existent key', async () => {
    const retrieved = await cacheManager.get('non-existent');
    expect(retrieved).toBeNull();
  });

  it('should delete cached data', async () => {
    const data = { id: 'test', value: 'test data' };

    await cacheManager.set('delete-key', data);
    await cacheManager.delete('delete-key');
    const retrieved = await cacheManager.get('delete-key');

    expect(retrieved).toBeNull();
  });

  it('should cache content', async () => {
    const content = {
      id: 'content-123',
      source_type: 'PASTE',
      extracted_text: 'Test content',
    };

    await cacheManager.cacheContent(content as any);
    const retrieved = await cacheManager.getContentWithCache('content-123');

    expect(retrieved).toEqual(content);
  });

  it('should cache generation', async () => {
    const generation = {
      id: 'gen-123',
      study_plan: { summary: { title: 'Test' } },
    };

    await cacheManager.cacheGeneration(generation as any);
    const retrieved = await cacheManager.getGenerationWithCache('gen-123');

    expect(retrieved).toEqual(generation);
  });
});

describe('SyncQueueManager', () => {
  let syncQueueManager: SyncQueueManager;

  beforeEach(() => {
    mockStorage.clear();
    SyncQueueManager.resetForTests();
    syncQueueManager = SyncQueueManager.getInstance();
  });

  it('should enqueue items', async () => {
    const item = await syncQueueManager.enqueue({
      entity: 'content',
      action: 'create',
      payload: { text: 'Test' },
      maxRetries: 3,
    });

    expect(item.id).toBeDefined();
    expect(item.retryCount).toBe(0);
    expect(item.createdAt).toBeDefined();
  });

  it('should dequeue items', async () => {
    const item = await syncQueueManager.enqueue({
      entity: 'content',
      action: 'create',
      payload: { text: 'Test' },
      maxRetries: 3,
    });

    const dequeued = await syncQueueManager.dequeue(item.id);
    const queue = await syncQueueManager.getQueue();

    expect(dequeued).toBe(true);
    expect(queue).toHaveLength(0);
  });

  it('should increment retry count', async () => {
    const item = await syncQueueManager.enqueue({
      entity: 'content',
      action: 'create',
      payload: { text: 'Test' },
      maxRetries: 3,
    });

    const updated = await syncQueueManager.incrementRetry(item.id, 'Network error');

    expect(updated).not.toBeNull();
    expect(updated?.retryCount).toBe(1);
    expect(updated?.error).toBe('Network error');
    expect(updated?.lastAttempt).toBeDefined();
  });

  it('should get pending items', async () => {
    const pendingItem: SyncQueueItem = {
      id: 'pending-1',
      entity: 'content',
      action: 'create',
      payload: {},
      maxRetries: 3,
      retryCount: 0,
      createdAt: Date.now(),
    };

    const failedItem: SyncQueueItem = {
      id: 'failed-1',
      entity: 'content',
      action: 'create',
      payload: {},
      maxRetries: 3,
      retryCount: 5, // Exceeded max
      createdAt: Date.now(),
    };

    await syncQueueManager.saveQueue([pendingItem, failedItem]);

    const pending = await syncQueueManager.getPendingItems();

    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe('pending-1');
  });

  it('should get failed items', async () => {
    const failedItem: SyncQueueItem = {
      id: 'failed-1',
      entity: 'content',
      action: 'create',
      payload: {},
      maxRetries: 3,
      retryCount: 5,
      error: 'Max retries exceeded',
      createdAt: Date.now(),
    };

    await syncQueueManager.saveQueue([failedItem]);

    const failed = await syncQueueManager.getFailedItems();

    expect(failed).toHaveLength(1);
    expect(failed[0].id).toBe('failed-1');
  });

  it('should limit queue size', async () => {
    // Fill queue to max
    for (let i = 0; i < 50; i++) {
      await syncQueueManager.enqueue({
        entity: 'feedback',
        action: 'submit',
        payload: {},
        maxRetries: 3,
      });
    }

    // Try to add one more - should remove oldest non-critical
    const item = await syncQueueManager.enqueue({
      entity: 'content',
      action: 'create',
      payload: {},
      maxRetries: 3,
    });

    const queue = await syncQueueManager.getQueue();
    expect(queue.length).toBeLessThanOrEqual(50);
  });
});

describe('OfflineManager', () => {
  let offlineManager: OfflineManager;

  beforeEach(() => {
    mockStorage.clear();
    OfflineManager.resetForTests();
    offlineManager = OfflineManager.getInstance();
  });

  it('should set offline mode', async () => {
    await offlineManager.setOfflineMode(true);
    const isOffline = await offlineManager.isInOfflineMode();

    expect(isOffline).toBe(true);
  });

  it('should allow actions when offline', async () => {
    await offlineManager.setOfflineMode(true);

    const canSubmit = await offlineManager.canPerformAction('submit');
    const canGenerate = await offlineManager.canPerformAction('generate');

    expect(canSubmit).toBe(true);
    expect(canGenerate).toBe(true);
  });

  it('should return false for sync offline mode by default', async () => {
    const isOffline = await offlineManager.isInOfflineMode();
    expect(isOffline).toBe(false);
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    mockStorage.clear();
  });

  it('should calculate storage usage', async () => {
    await mockStorage.setItem('content-study:drafts', JSON.stringify([{ id: '1' }]));
    await mockStorage.setItem('content-study:sessions', JSON.stringify([{ id: '2' }]));

    const usage = await getStorageUsage();

    expect(usage.drafts).toBeGreaterThan(0);
    expect(usage.sessions).toBeGreaterThan(0);
    expect(usage.total).toBeGreaterThan(0);
  });

  it('should clear all content study data', async () => {
    await mockStorage.setItem('content-study:drafts', 'data');
    await mockStorage.setItem('content-study:sessions', 'data');
    await mockStorage.setItem('other-key', 'should remain');

    await clearAllContentStudyData();

    const drafts = await mockStorage.getItem('content-study:drafts');
    const other = await mockStorage.getItem('other-key');

    expect(drafts).toBeNull();
    expect(other).toBe('should remain');
  });
});
