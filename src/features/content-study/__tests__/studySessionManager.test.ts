import { StudySessionManager } from '../persistence';
import type { PersistedStudySession } from '../types';
import { mockStorage } from './persistence.test.helpers';

jest.mock('../../../persistence', () => ({
  getDefaultStorageAdapter: () => mockStorage,
}));

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
