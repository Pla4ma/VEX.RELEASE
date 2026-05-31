/**
 * Tests for project-focus feature — thread creation and ensure
 */
import {
  completeProjectSession,
  createProjectThread,
  ensureProjectThread,
} from '../service';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }
    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }
    delete(key: string): void {
      mockStore.delete(key);
    }
    contains(key: string): boolean {
      return mockStore.has(key);
    }
    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

describe('project-focus — thread creation', () => {
  beforeEach(() => mockStore.clear());

  // ──────────────────── Thread creation ────────────────────

  describe('createProjectThread', () => {
    it('creates a thread with correct defaults', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build landing page',
        nextMove: 'Write hero copy',
        now: 100,
        projectTitle: 'Marketing Site',
        userId: 'user-1',
      });

      expect(thread.state).toBe('new');
      expect(thread.bestSessionMode).toBe('CREATIVE');
      expect(thread.blocker).toBeNull();
      expect(thread.handoffNote).toBeNull();
      expect(thread.lastSessionSummary).toBeNull();
      expect(thread.rescuedAt).toBeNull();
      expect(thread.staleRisk).toBe('none');
      expect(thread.openQuestions).toEqual([]);
      expect(thread.projectTitle).toBe('Marketing Site');
      expect(thread.currentObjective).toBe('Build landing page');
      expect(thread.nextMove).toBe('Write hero copy');
      expect(thread.id).toContain('user-1:project:');
    });
  });

  // ──────────────────── ensureProjectThread ────────────────────

  describe('ensureProjectThread', () => {
    it('returns existing non-completed thread', async () => {
      await createProjectThread({
        currentObjective: 'Build API',
        nextMove: 'Design schema',
        now: 100,
        projectTitle: 'Backend',
        userId: 'user-2',
      });
      const thread = await ensureProjectThread({
        projectTitle: 'Backend v2',
        userId: 'user-2',
        now: 200,
      });
      expect(thread.projectTitle).toBe('Backend');
      expect(thread.nextMove).toBe('Design schema');
    });

    it('creates new thread when all are completed', async () => {
      const t = await createProjectThread({
        currentObjective: 'Write',
        nextMove: 'Draft',
        now: 100,
        projectTitle: 'Essay',
        userId: 'user-3',
      });
      // complete it
      await completeProjectSession({
        lastSessionSummary: 'Done',
        nextMove: 'Nothing',
        now: 200,
        threadId: t.id,
        userId: 'user-3',
      });
      // mark completed manually via another path — but completeProjectSession sets
      // state to "active" or "blocked" not "completed". For a thread to be "completed"
      // it would need a different mechanism. Let's test the no-active-thread path by
      // storing a completed thread directly.
      mockStore.set(
        'project-focus:user-3b',
        JSON.stringify([
          {
            id: 't-completed',
            userId: 'user-3b',
            projectTitle: 'Old',
            state: 'completed',
            bestSessionMode: 'CREATIVE',
            blocker: null,
            currentObjective: 'Done',
            handoffNote: null,
            lastSessionSummary: 'Done',
            lastTouched: 100,
            nextMove: 'Nothing',
            openQuestions: [],
            rescuedAt: null,
            staleRisk: 'none',
          },
        ]),
      );
      const newThread = await ensureProjectThread({
        projectTitle: 'New Project',
        userId: 'user-3b',
        now: 500,
      });
      expect(newThread.state).toBe('new');
      expect(newThread.projectTitle).toBe('New Project');
    });
  });
});
