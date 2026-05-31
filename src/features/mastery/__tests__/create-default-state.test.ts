/**
 * Mastery Feature — createDefaultState Tests
 */

import { createDefaultState } from '../mastery-helpers';

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

describe('createDefaultState', () => {
  it('returns default state with zero techniques and APPRENTICE rank', () => {
    const state = createDefaultState('user-1');
    expect(state.userId).toBe('user-1');
    expect(state.rank).toBe('APPRENTICE');
    expect(state.totalMasteryPoints).toBe(0);
    expect(state.techniques).toEqual({
      durationMastery: 0,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    });
    expect(state.activeChallenges).toHaveLength(3);
    expect(state.unlockedFeatures).toEqual([]);
  });
});
