import { resolveUserBehaviorSignals } from '../index';

jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getMMKVStorageAdapter: () => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  }),
}));

describe('resolveUserBehaviorSignals', () => {
  const makeInput = (overrides: Record<string, unknown> = {}) => ({
    recentSignals: [],
    recentSessions: {
      completedSessions: 0,
      studySessions: 0,
      totalSessions: 0,
      preferredMode: null,
      bestTimeOfDay: null,
    },
    firstWeekExperience: { stage: 'DAY_1_RETURN', isDayZero: false },
    ...overrides,
  });

  it('returns zeroed summary for day zero', () => {
    const result = resolveUserBehaviorSignals(
      makeInput({
        firstWeekExperience: { stage: 'DAY_0_NOT_STARTED', isDayZero: true },
      }) as any,
    );
    expect(result.bossEngagement).toBe('none');
    expect(result.premiumFeatureAttempts).toHaveLength(0);
    expect(result.coachInteractions).toBe(0);
  });
  it('calculates studyUsageRatio from sessions', () => {
    const result = resolveUserBehaviorSignals(
      makeInput({
        recentSessions: {
          completedSessions: 4,
          studySessions: 2,
          totalSessions: 4,
          preferredMode: null,
          bestTimeOfDay: null,
        },
      }) as any,
    );
    expect(result.studyUsageRatio).toBe(0.5);
  });
  it('detects boss engagement at medium level', () => {
    const signals = [
      {
        userId: '00000000-0000-0000-0000-000000000001',
        surfaceKey: 'boss_cta',
        signalType: 'boss_cta_clicked',
        source: 'boss_tab',
        timestamp: Date.now(),
      },
      {
        userId: '00000000-0000-0000-0000-000000000001',
        surfaceKey: 'boss_route',
        signalType: 'boss_route_opened',
        source: 'boss_tab',
        timestamp: Date.now(),
      },
    ];
    const result = resolveUserBehaviorSignals(
      makeInput({ recentSignals: signals }) as any,
    );
    expect(result.bossEngagement).toBe('medium');
  });
});
