/**
 * Tests for project-focus feature — session briefs and completion
 */
import {
  buildProjectResumeBrief,
  buildProjectSessionBrief,
  completeProjectSession,
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

describe('project-focus — session', () => {
  beforeEach(() => mockStore.clear());

  // ──────────────────── buildProjectSessionBrief ────────────────────

  describe('buildProjectSessionBrief', () => {
    it('creates normal resume brief', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Write tests',
        now: 100,
        projectTitle: 'VEX',
        userId: 'user-6',
      });
      const brief = buildProjectSessionBrief(thread, 100);
      expect(brief.durationSeconds).toBe(25 * 60);
      expect(brief.title).toContain('Resume');
      expect(brief.title).toContain('VEX');
      expect(brief.successCondition).toBe('Write tests');
    });

    it('creates rescued session brief with 10-minute duration', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Compose',
        nextMove: 'Find motif',
        now: 100,
        projectTitle: 'Track',
        userId: 'user-6b',
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const rescued = rescueStaleProject(stale, 100 + 7 * DAY_MS);
      const brief = buildProjectSessionBrief(rescued, 200);
      expect(brief.durationSeconds).toBe(10 * 60);
      expect(brief.title).toContain('Recover');
    });

    it('creates high-stale-risk session brief with 15-minute duration', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-6c',
      });
      const stale = refreshProjectThreadState(thread, 100 + 7 * DAY_MS);
      const brief = buildProjectSessionBrief(stale, 100 + 7 * DAY_MS);
      expect(brief.durationSeconds).toBe(15 * 60);
    });

    it('uses lastSessionSummary as warmup when available', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-6d',
      });
      const completed = await completeProjectSession({
        lastSessionSummary: 'Finished auth module',
        nextMove: 'Add tests',
        now: 200,
        threadId: thread.id,
        userId: 'user-6d',
      });
      const brief = buildProjectSessionBrief(completed, 300);
      expect(brief.warmup).toContain('Finished auth module');
    });
  });

  // ──────────────────── buildProjectResumeBrief ────────────────────

  describe('buildProjectResumeBrief', () => {
    it('returns same structure as buildProjectSessionBrief', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Design',
        nextMove: 'Sketch wireframes',
        now: 100,
        projectTitle: 'UI',
        userId: 'user-7',
      });
      const brief = buildProjectResumeBrief(thread, 100);
      expect(brief.title).toContain('Resume');
      expect(brief.successCondition).toBe('Sketch wireframes');
    });
  });

  // ──────────────────── completeProjectSession ────────────────────

  describe('completeProjectSession', () => {
    it('throws when thread not found', async () => {
      await expect(
        completeProjectSession({
          lastSessionSummary: 'Done',
          nextMove: 'Continue',
          now: 200,
          threadId: 'nonexistent',
          userId: 'user-8',
        }),
      ).rejects.toThrow('Project thread could not be found.');
    });

    it('sets state to blocked when blocker is provided', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Build',
        nextMove: 'Code',
        now: 100,
        projectTitle: 'App',
        userId: 'user-8b',
      });
      const updated = await completeProjectSession({
        lastSessionSummary: 'Hit an issue',
        nextMove: 'Wait for API key',
        blocker: 'Need API access from admin',
        now: 200,
        threadId: thread.id,
        userId: 'user-8b',
      });
      expect(updated.state).toBe('blocked');
      expect(updated.blocker).toBe('Need API access from admin');
    });

    it('appends open questions', async () => {
      const thread = await createProjectThread({
        currentObjective: 'Research',
        nextMove: 'Read papers',
        now: 100,
        projectTitle: 'Thesis',
        userId: 'user-8c',
      });
      const updated = await completeProjectSession({
        lastSessionSummary: 'Read 3 papers',
        nextMove: 'Summarize',
        openQuestion: 'Which methodology is best?',
        now: 200,
        threadId: thread.id,
        userId: 'user-8c',
      });
      expect(updated.openQuestions).toContain('Which methodology is best?');
    });
  });
});
