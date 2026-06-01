import {
  buildProjectHomeSurface,
  createProjectThread,
  refreshProjectThreadState,
  shouldShowProjectSurface,
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

describe('project-focus service — lane visibility', () => {
  beforeEach(() => mockStore.clear());

  // PHASE 5.7: Clean/Study lanes do not see project clutter
  it('deep_creative lane shows project surface', () => {
    expect(shouldShowProjectSurface('deep_creative')).toBe(true);
  });

  it('student lane hides project surface', () => {
    expect(shouldShowProjectSurface('student')).toBe(false);
  });

  it('game_like lane hides project surface', () => {
    expect(shouldShowProjectSurface('game_like')).toBe(false);
  });

  it('minimal_normal lane hides project surface', () => {
    expect(shouldShowProjectSurface('minimal_normal')).toBe(false);
  });

  it('non-deep_creative home surface is hidden', () => {
    expect(
      buildProjectHomeSurface({ lane: 'student', thread: null }).hidden,
    ).toBe(true);
    expect(
      buildProjectHomeSurface({ lane: 'game_like', thread: null }).hidden,
    ).toBe(true);
  });

  // legacy: stale recovery prompt
  it('stale project triggers re-entry', async () => {
    const thread = await createProjectThread({
      currentObjective: 'Compose',
      nextMove: 'Find motif',
      now: 10,
      projectTitle: 'Track',
      userId: 'creative-1',
    });
    const stale = refreshProjectThreadState(thread, 10 + 7 * 86_400_000);

    expect(stale.state).toBe('stale');
    expect(
      buildProjectHomeSurface({ lane: 'deep_creative', thread: stale })
        .recoveryPrompt,
    ).toContain('Re-enter');
  });
});
