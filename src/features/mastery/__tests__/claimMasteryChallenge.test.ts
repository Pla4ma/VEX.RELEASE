import { MasteryService } from '../service';
import { loadStoredMasteryState, persistMasteryState } from '../repository';
import { TEST_USER_ID, setupMasteryMocks, makeBaseState } from './testHelpers';

jest.mock('../repository');

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);

describe('Mastery Service > claimMasteryChallenge', () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it('should claim completed challenge and award points', () => {
    const state = makeBaseState({
      totalMasteryPoints: 100,
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 2,
        bossMastery: 2,
      },
      activeChallenges: [
        {
          id: 'challenge-1',
          title: 'Deep Focus',
          description: 'Complete a 60-minute session',
          technique: 'durationMastery',
          target: 100,
          current: 100,
          status: 'COMPLETED',
          completedAt: Date.now(),
          difficulty: 'MEDIUM',
          unit: 'minutes',
          masteryPoints: 10,
        },
      ],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = MasteryService.claimChallenge(TEST_USER_ID, 'challenge-1');
    expect(result).toBe(true);
    expect(persistMasteryState).toHaveBeenCalled();
  });

  it('should return false for incomplete challenge', () => {
    const state = makeBaseState({
      totalMasteryPoints: 100,
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 2,
        bossMastery: 2,
      },
      activeChallenges: [
        {
          id: 'challenge-1',
          title: 'Deep Focus',
          description: 'Complete a 60-minute session',
          technique: 'durationMastery',
          target: 100,
          current: 50,
          status: 'ACTIVE',
          completedAt: null,
          difficulty: 'MEDIUM',
          unit: 'minutes',
          masteryPoints: 10,
        },
      ],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = MasteryService.claimChallenge(TEST_USER_ID, 'challenge-1');
    expect(result).toBe(false);
  });

  it('should return false for non-existent challenge', () => {
    const state = makeBaseState({
      totalMasteryPoints: 100,
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 2,
        bossMastery: 2,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = MasteryService.claimChallenge(TEST_USER_ID, 'non-existent');
    expect(result).toBe(false);
  });
});
