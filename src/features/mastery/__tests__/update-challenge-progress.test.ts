/**
 * Mastery Feature — updateChallengeProgress Tests
 */

import {
  createDefaultState,
  updateChallengeProgress,
  type TechniqueXpGains,
} from '../mastery-helpers';

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

describe('updateChallengeProgress', () => {
  it('updates ACTIVE challenge progress with XP gains', () => {
    const state = createDefaultState('user-1');
    const xpGains: TechniqueXpGains = {
      durationMastery: 5,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    };
    const updated = updateChallengeProgress(state, xpGains);
    const durationChallenge = updated.activeChallenges.find(
      (c) => c.technique === 'durationMastery',
    );
    expect(durationChallenge?.current).toBe(5);
    expect(durationChallenge?.status).toBe('ACTIVE');
  });

  it('completes challenge when target is met', () => {
    const state = createDefaultState('user-1');
    const firstChallenge = state.activeChallenges[0];
    if (!firstChallenge) {throw new Error('No challenge found');}

    const xpGains: TechniqueXpGains = {
      durationMastery: firstChallenge.target + 10,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    };
    const updated = updateChallengeProgress(state, xpGains);
    const target = updated.activeChallenges.find(
      (c) => c.id === firstChallenge.id,
    );
    expect(target?.status).toBe('COMPLETED');
    expect(target?.completedAt).toBeTruthy();
    expect(target?.current).toBe(firstChallenge.target);
  });

  it('does not update COMPLETED or CLAIMED challenges', () => {
    const state = createDefaultState('user-1');
    const completedChallenge = {
      ...state.activeChallenges[0]!,
      status: 'COMPLETED' as const,
      current: state.activeChallenges[0]!.target,
      completedAt: Date.now(),
    };
    const stateWithCompleted = {
      ...state,
      activeChallenges: [
        completedChallenge,
        ...state.activeChallenges.slice(1),
      ],
    };
    const xpGains: TechniqueXpGains = {
      durationMastery: 100,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    };
    const updated = updateChallengeProgress(stateWithCompleted, xpGains);
    expect(updated.activeChallenges[0]!.current).toBe(
      completedChallenge.current,
    );
  });
});
