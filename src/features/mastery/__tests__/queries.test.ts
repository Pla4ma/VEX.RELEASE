import { MasteryService } from '../service';
import { loadStoredMasteryState } from '../repository';
import {
  TEST_USER_ID,
  setupMasteryMocks,
  makeBaseState,
  MASTERY_RANK_THRESHOLDS,
} from './testHelpers';

jest.mock('../repository');

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);

describe('Mastery Service > getActiveChallenges', () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it('should return state with active and completed challenges', () => {
    const state = makeBaseState({
      totalMasteryPoints: 500,
      rank: 'ADEPT',
      techniques: {
        durationMastery: 10,
        purityMastery: 8,
        consistencyMastery: 12,
        comebackMastery: 5,
        bossMastery: 5,
      },
      activeChallenges: [
        { id: 'c1', title: 'Challenge 1', status: 'ACTIVE', technique: 'durationMastery', difficulty: 'MEDIUM', target: 10, current: 5, unit: 'sessions', masteryPoints: 5, description: 'desc', completedAt: null },
        { id: 'c2', title: 'Challenge 2', status: 'ACTIVE', technique: 'purityMastery', difficulty: 'EASY', target: 5, current: 3, unit: 'sessions', masteryPoints: 3, description: 'desc', completedAt: null },
        { id: 'c3', title: 'Challenge 3', status: 'COMPLETED', technique: 'consistencyMastery', difficulty: 'HARD', target: 20, current: 20, unit: 'days', masteryPoints: 10, description: 'desc', completedAt: Date.now() },
      ],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = MasteryService.getOrCreateMasteryState(TEST_USER_ID);
    const activeChallenges = result.activeChallenges.filter(
      (c) => c.status === 'ACTIVE',
    );
    expect(activeChallenges.length).toBe(2);
    expect(activeChallenges.every((c) => c.status === 'ACTIVE')).toBe(true);
  });
});

describe('Mastery Service > getTechniqueStats', () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it('should return technique levels in state', () => {
    const state = makeBaseState({
      totalMasteryPoints: 1000,
      rank: 'EXPERT',
      techniques: {
        durationMastery: 15,
        purityMastery: 12,
        consistencyMastery: 18,
        comebackMastery: 8,
        bossMastery: 10,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = MasteryService.getOrCreateMasteryState(TEST_USER_ID);
    expect(result.techniques.durationMastery).toBe(15);
    expect(result.techniques.consistencyMastery).toBe(18);
    expect(result.rank).toBe('EXPERT');
  });
});

describe('Mastery Service > getUnlockedFeatures', () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it('should return unlocked features from stored state', () => {
    const state = makeBaseState({
      totalMasteryPoints: MASTERY_RANK_THRESHOLDS.EXPERT,
      rank: 'EXPERT',
      techniques: {
        durationMastery: 15,
        purityMastery: 15,
        consistencyMastery: 15,
        comebackMastery: 10,
        bossMastery: 10,
      },
      unlockedFeatures: ['advanced_analytics', 'custom_themes'],
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = MasteryService.getOrCreateMasteryState(TEST_USER_ID);
    expect(result.unlockedFeatures).toContain('advanced_analytics');
    expect(result.unlockedFeatures).toContain('custom_themes');
  });

  it('should return empty features for default state', () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const result = MasteryService.getOrCreateMasteryState(TEST_USER_ID);
    expect(result.unlockedFeatures).toEqual([]);
  });
});
