import {
  buildProjectMemoryCandidate,
  buildProjectSessionBrief,
  completeProjectSession,
  createProjectThread,
  ensureProjectThread,
  rescueStaleProject,
  refreshProjectThreadState,
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

describe('project-focus service — thread lifecycle', () => {
  beforeEach(() => mockStore.clear());

  // PHASE 5.1: Project Mode creates ProjectThread
  it('creates project thread', async () => {
    const thread = await createProjectThread({
      currentObjective: 'Draft launch page',
      nextMove: 'Write section outline',
      now: 10,
      projectTitle: 'Launch',
      userId: 'creative-1',
    });

    expect(thread.state).toBe('new');
    expect(thread.nextMove).toBe('Write section outline');
    expect(thread.handoffNote).toBeNull();
    expect(thread.rescuedAt).toBeNull();
  });

  // PHASE 5.2: completion stores handoff
  it('completion stores handoff note', async () => {
    const thread = await createProjectThread({
      currentObjective: 'Write',
      nextMove: 'Open doc',
      now: 10,
      projectTitle: 'Essay',
      userId: 'creative-1',
    });
    const updated = await completeProjectSession({
      handoffNote: 'Remember to check references',
      lastSessionSummary: 'Finished intro',
      nextMove: 'Draft body',
      now: 20,
      threadId: thread.id,
      userId: 'creative-1',
    });

    expect(updated.lastSessionSummary).toBe('Finished intro');
    expect(updated.nextMove).toBe('Draft body');
    expect(updated.handoffNote).toBe('Remember to check references');
  });

  // PHASE 5.3: next session shows next move
  it('next session picks up correct next move', async () => {
    const thread = await createProjectThread({
      currentObjective: 'Make demo',
      nextMove: 'Record clip',
      now: 10,
      projectTitle: 'Demo',
      userId: 'creative-1',
    });
    const brief = buildProjectSessionBrief(thread, 10);

    expect(brief.title).toContain('Demo');
    expect(brief.successCondition).toBe('Record clip');
  });

  // PHASE 5.4: lost-the-thread rescue creates tiny session
  it('lost-the-thread rescue creates recovery session', async () => {
    const thread = await createProjectThread({
      currentObjective: 'Compose',
      nextMove: 'Find motif',
      now: 10,
      projectTitle: 'Track',
      userId: 'creative-1',
    });
    const stale = refreshProjectThreadState(thread, 10 + 7 * 86_400_000);
    expect(stale.state).toBe('stale');

    const rescued = rescueStaleProject(stale, 10 + 7 * 86_400_000);
    expect(rescued.state).toBe('rescued');
    expect(rescued.bestSessionMode).toBe('CREATIVE');
    expect(rescued.rescuedAt).not.toBeNull();

    const brief = buildProjectSessionBrief(rescued);
    expect(brief.durationSeconds).toBe(10 * 60);
    expect(brief.title).toContain('Recover');
  });

  // PHASE 5.5: missing project fallback safe
  it('ensureProjectThread creates lightweight thread when none exists', async () => {
    const thread = await ensureProjectThread({
      projectTitle: 'Quick Sketch',
      userId: 'creative-1',
      now: 10,
    });

    expect(thread.projectTitle).toBe('Quick Sketch');
    expect(thread.state).toBe('new');
    expect(thread.nextMove).toBeTruthy();
  });

  it('ensureProjectThread returns existing active thread', async () => {
    await createProjectThread({
      currentObjective: 'Build',
      nextMove: 'Design API',
      now: 10,
      projectTitle: 'App',
      userId: 'creative-1',
    });
    const thread = await ensureProjectThread({
      projectTitle: 'Other',
      userId: 'creative-1',
      now: 20,
    });

    expect(thread.projectTitle).toBe('App');
    expect(thread.nextMove).toBe('Design API');
  });

  // PHASE 5.6: memory candidate includes handoff
  it('buildProjectMemoryCandidate includes handoff and next move', async () => {
    const thread = await createProjectThread({
      currentObjective: 'Write docs',
      nextMove: 'Review',
      now: 10,
      projectTitle: 'Docs',
      userId: 'creative-1',
    });
    const updated = await completeProjectSession({
      handoffNote: 'Section 3 needs diagrams',
      lastSessionSummary: 'Sections 1-2 done',
      nextMove: 'Start section 3',
      now: 20,
      threadId: thread.id,
      userId: 'creative-1',
    });

    const candidate = buildProjectMemoryCandidate(updated);
    expect(candidate.type).toBe('project_handoff');
    expect(candidate.content).toContain('Section 3 needs diagrams');
    expect(candidate.content).toContain('Sections 1-2 done');
    expect(candidate.metadata.projectTitle).toBe('Docs');
  });
});
