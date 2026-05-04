import { parsePersistedOnboardingState } from '../persistence';

jest.mock('../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

describe('parsePersistedOnboardingState', () => {
  it('keeps valid onboarding profiles', () => {
    const result = parsePersistedOnboardingState({
      drafts: {},
      profiles: {
        'user-1': {
          completedAt: 123,
          element: 'LUMINA',
          goal: 'build_consistency',
          personaId: 'mentor',
          squadId: null,
          starterPresetId: 'quick',
        },
      },
    });

    expect(result.profiles['user-1']?.completedAt).toBe(123);
  });

  it('falls back safely for corrupt persisted state', () => {
    const result = parsePersistedOnboardingState({
      drafts: {},
      profiles: {
        'user-1': {
          completedAt: 'bad',
          goal: 'build_consistency',
        },
      },
    });

    expect(result).toEqual({ drafts: {}, profiles: {} });
  });

  it('falls back safely for missing persisted state', () => {
    expect(parsePersistedOnboardingState(undefined)).toEqual({
      drafts: {},
      profiles: {},
    });
  });
});
