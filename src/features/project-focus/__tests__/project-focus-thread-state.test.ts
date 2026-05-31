/**
 * Tests for project-focus feature — thread state refresh and rescue
 */
import {
  createProjectThread,
  refreshProjectThreadState,
  rescueStaleProject,
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

const DAY_MS = 86_400_000;

describe('project-focus — thread state', () => {
  beforeEach(() => mockStore.clear());

  // ──────────────────── refreshProjectThreadState ────────────────────

  describe('refreshProjectThreadState', () => {
    it('returns stale risk high after 6+ days', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-4',
      });
      const refreshed = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      expect(refreshed.staleRisk).toBe('high');
      expect(refreshed.state).toBe('stale');
    });

    it('returns stale risk medium after 3-6 days', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-4b',
      });
      const refreshed = refreshProjectThreadState(thread, 100 + 4 * DAY_MS);
      expect(refreshed.staleRisk).toBe('medium');
      expect(refreshed.state).toBe('stale');
    });

    it('returns stale risk low after 1-3 days', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-4c',
      });
      const refreshed = refreshProjectThreadState(thread, 100 + 2 * DAY_MS);
      expect(refreshed.staleRisk).toBe('low');
    });

    it('does not change state of completed threads', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-4d',
      });
      const completed = {
        ...thread,
        state: 'completed' as const,
      };
      const refreshed = refreshProjectThreadState(completed, 100 + 10 * DAY_MS);
      expect(refreshed.state).toBe('completed');
    });

    it('does not change state of blocked threads', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-4e',
      });
      const blocked = {
        ...thread,
        state: 'blocked' as const,
      };
      const refreshed = refreshProjectThreadState(blocked, 100 + 10 * DAY_MS);
      expect(refreshed.state).toBe('blocked');
    });
  });

  // ──────────────────── rescueStaleProject ────────────────────

  describe('rescueStaleProject', () => {
    it('sets state to rescued with null staleRisk', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Compose',
        nextMove: 'Find motif',
        now: 100,
        projectTitle: 'Music',
        userId: 'user-5',
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const rescued = rescueStaleProject(stale, 100 + 7 * DAY_MS);
      expect(rescued.state).toBe('rescued');
      expect(rescued.staleRisk).toBe('none');
      expect(rescued.rescuedAt).toBe(100 + 7 * DAY_MS);
    });

    it('switches DEEP_WORK to CREATIVE on rescue', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Code',
        nextMove: 'Refactor',
        now: 100,
        projectTitle: 'Engine',
        userId: 'user-5b',
      });
      const deepThread = {
        ...thread,
        bestSessionMode: 'DEEP_WORK' as const,
        state: 'stale' as const,
        staleRisk: 'high' as const,
      };
      const rescued = rescueStaleProject(deepThread, 200);
      expect(rescued.bestSessionMode).toBe('CREATIVE');
    });

    it('preserves non-DEEP_WORK modes on rescue', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Code',
        nextMove: 'Refactor',
        now: 100,
        projectTitle: 'Engine',
        userId: 'user-5c',
      });
      const lightThread = {
        ...thread,
        bestSessionMode: 'LIGHT_FOCUS' as const,
        state: 'stale' as const,
        staleRisk: 'high' as const,
      };
      const rescued = rescueStaleProject(lightThread, 200);
      expect(rescued.bestSessionMode).toBe('LIGHT_FOCUS');
    });
  });
});
