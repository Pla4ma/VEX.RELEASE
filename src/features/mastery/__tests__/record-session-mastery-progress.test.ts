/**
 * Mastery Feature — recordSessionMasteryProgress Tests
 */

import { recordSessionMasteryProgress } from '../service';

// ─── Mocks (needed because service imports mastery-helpers & repository) ───
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

describe('recordSessionMasteryProgress', () => {
  it('completes without throwing for valid input', async () => {
    await expect(
      recordSessionMasteryProgress('user-1', {
        effectiveDuration: 3600000,
        focusQuality: 95,
        purityScore: 90,
        streak: 5,
        hasBossActive: true,
      }),
    ).resolves.toBeUndefined();
  });

  it('handles zero values gracefully', async () => {
    await expect(
      recordSessionMasteryProgress('user-2', {
        effectiveDuration: 0,
        focusQuality: 0,
        purityScore: 0,
        streak: 0,
        hasBossActive: false,
      }),
    ).resolves.toBeUndefined();
  });
});
