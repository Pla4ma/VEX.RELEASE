/**
 * Mastery Feature — resolveRank Tests
 */

import { resolveRank } from '../mastery-helpers';

// ─── Mocks (needed because mastery-helpers imports challenge-generator & repository) ───
jest.mock('../repository', () => ({
  loadStoredMasteryState: jest.fn().mockReturnValue(null),
  loadMasteryState: jest.fn().mockResolvedValue(null),
  persistMasteryState: jest.fn((state: Record<string, unknown>) => ({ ...state, updatedAt: Date.now() })),
}));

jest.mock('../../../persistence/MMKVStorageAdapter', () => ({
  getDefaultStorageAdapter: () => ({
    getJSONSync: jest.fn().mockReturnValue(null),
    setJSONSync: jest.fn(),
  }),
}));

jest.mock('../../../persistence/MMKVStorage', () => ({
  getMMKVStorage: () => ({
    initialize: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

jest.mock('../../../utils/silent-failure', () => ({
  captureSilentFailure: jest.fn(),
}));

jest.mock('../challenge-generator', () => ({
  generateMasteryChallenges: jest.fn().mockReturnValue([
    {
      id: 'test-challenge-1',
      technique: 'durationMastery',
      title: 'Test Challenge',
      description: 'A test challenge',
      difficulty: 'EASY',
      target: 10,
      current: 0,
      unit: 'sessions',
      masteryPoints: 3,
      status: 'ACTIVE',
      completedAt: null,
    },
    {
      id: 'test-challenge-2',
      technique: 'purityMastery',
      title: 'Test Challenge 2',
      description: 'Another test challenge',
      difficulty: 'MEDIUM',
      target: 5,
      current: 0,
      unit: 'sessions',
      masteryPoints: 5,
      status: 'ACTIVE',
      completedAt: null,
    },
    {
      id: 'test-challenge-3',
      technique: 'consistencyMastery',
      title: 'Test Challenge 3',
      description: 'Third test challenge',
      difficulty: 'EASY',
      target: 3,
      current: 0,
      unit: 'days',
      masteryPoints: 3,
      status: 'ACTIVE',
      completedAt: null,
    },
  ]),
}));

describe('resolveRank', () => {
  it.each([
    [0, 'APPRENTICE'],
    [5, 'APPRENTICE'],
    [10, 'ADEPT'],
    [24, 'ADEPT'],
    [25, 'EXPERT'],
    [49, 'EXPERT'],
    [50, 'MASTER'],
    [99, 'MASTER'],
    [100, 'GRANDMASTER'],
    [500, 'GRANDMASTER'],
  ] as const)('resolveRank(%i) returns %s', (points, expected) => {
    expect(resolveRank(points)).toBe(expected);
  });
});
