import { loadStoredMasteryState, persistMasteryState } from '../repository';
import { MASTERY_RANK_THRESHOLDS } from '../types';

export const TEST_USER_ID = 'test-user-123';

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);
const mockedPersistMasteryState = jest.mocked(persistMasteryState);

export function setupMasteryMocks(): void {
  jest.clearAllMocks();
  mockedLoadStoredMasteryState.mockReturnValue(null);
  // persistMasteryState returns the state it receives (with updatedAt bump)
  mockedPersistMasteryState.mockImplementation(
    (state) => ({ ...state, updatedAt: Date.now() }),
  );
}

export function makeBaseState(
  overrides: Partial<{
    totalMasteryPoints: number;
    rank: string;
    techniques: {
      durationMastery: number;
      purityMastery: number;
      consistencyMastery: number;
      comebackMastery: number;
      bossMastery: number;
    };
    activeChallenges: unknown[];
    unlockedFeatures: string[];
    updatedAt: number;
  }> = {},
) {
  return {
    userId: TEST_USER_ID,
    totalMasteryPoints: 0,
    rank: 'APPRENTICE',
    techniques: {
      durationMastery: 0,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    },
    activeChallenges: [],
    unlockedFeatures: [],
    updatedAt: Date.now(),
    ...overrides,
  };
}

export { MASTERY_RANK_THRESHOLDS };
