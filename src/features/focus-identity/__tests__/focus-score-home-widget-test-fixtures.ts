import type { FocusScoreDashboardModel } from '../types';

export const sampleFocusScore = {
  currentScore: 720,
  previousScore: 700,
  band: 'Building',
  lastChangeReason: 'Solid session',
  factors: {
    consistency: { score: 70, explanation: 'Consistent' },
    streakStability: { score: 65, explanation: 'Streak is stable' },
    sessionQuality: { score: 80, explanation: 'Good quality' },
    intentionalDifficulty: { score: 55, explanation: 'Moderate challenge' },
    recency: { score: 75, explanation: 'Recent activity' },
  },
  topPositiveFactor: 'sessionQuality' as const,
  topNegativeFactor: 'intentionalDifficulty' as const,
};

export const sampleFocusHistory = [
  { timestamp: '2026-04-01T00:00:00.000Z', score: 700, delta: 0, reason: '' },
  { timestamp: '2026-04-02T00:00:00.000Z', score: 720, delta: 20, reason: 'Solid session' },
];

export function model(overrides: Partial<FocusScoreDashboardModel> = {}): FocusScoreDashboardModel {
  return {
    current: null,
    history: [] as unknown as FocusScoreDashboardModel['history'],
    monthlyInput: null,
    isOffline: false,
    isPending: false,
    isError: false,
    error: null,
    isRefetching: false,
    isOptionalDataSyncing: false,
    optionalDataError: null,
    refetch: jest.fn(),
    ...overrides,
  };
}
