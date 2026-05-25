import {
  buildProjectHomeSurface,
  buildProjectSessionBrief,
  completeProjectSession,
  createProjectThread,
  refreshProjectThreadState,
} from '../service';

const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined { return mockStore.get(key); }
    set(key: string, value: string | number | boolean): void { mockStore.set(key, String(value)); }
    delete(key: string): void { mockStore.delete(key); }
    contains(key: string): boolean { return mockStore.has(key); }
    getAllKeys(): string[] { return Array.from(mockStore.keys()); }
  },
}));

describe('project-focus service', () => {
  beforeEach(() => mockStore.clear());

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
  });

  it('starts session from thread', async () => {
    const thread = await createProjectThread({ currentObjective: 'Make demo', nextMove: 'Record clip', now: 10, projectTitle: 'Demo', userId: 'creative-1' });
    const brief = buildProjectSessionBrief(thread, 10);

    expect(brief.title).toContain('Demo');
    expect(brief.successCondition).toBe('Record clip');
  });

  it('completion updates next move and summary', async () => {
    const thread = await createProjectThread({ currentObjective: 'Write', nextMove: 'Open doc', now: 10, projectTitle: 'Essay', userId: 'creative-1' });
    const updated = await completeProjectSession({
      lastSessionSummary: 'Finished intro',
      nextMove: 'Draft body',
      now: 20,
      threadId: thread.id,
      userId: 'creative-1',
    });

    expect(updated.lastSessionSummary).toBe('Finished intro');
    expect(updated.nextMove).toBe('Draft body');
  });

  it('stale project triggers re-entry', async () => {
    const thread = await createProjectThread({ currentObjective: 'Compose', nextMove: 'Find motif', now: 10, projectTitle: 'Track', userId: 'creative-1' });
    const stale = refreshProjectThreadState(thread, 10 + 7 * 86_400_000);

    expect(stale.state).toBe('stale');
    expect(buildProjectHomeSurface({ lane: 'deep_creative', thread: stale }).recoveryPrompt).toContain('Re-enter');
  });

  it('minimal lane hides project surface without supporting behavior', () => {
    expect(buildProjectHomeSurface({ lane: 'minimal_normal', thread: null }).hidden).toBe(true);
  });
});
