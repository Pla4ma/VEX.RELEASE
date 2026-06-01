import { MasteryService } from '../service';
import { loadStoredMasteryState, persistMasteryState } from '../repository';
import {
  TEST_USER_ID,
  setupMasteryMocks,
  makeBaseState,
  MASTERY_RANK_THRESHOLDS,
} from './testHelpers';

jest.mock('../repository');

const mockedLoadStoredMasteryState = jest.mocked(loadStoredMasteryState);

describe('Mastery Service > recordSessionMastery', () => {
  beforeEach(() => {
    setupMasteryMocks();
  });

  it('should award XP for duration mastery', () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const result = MasteryService.applySessionXp(TEST_USER_ID, {
      durationMastery: 2,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    });
    expect(result.pointsGained).toBeGreaterThan(0);
    expect(result.updatedState.techniques.durationMastery).toBeGreaterThan(0);
    expect(persistMasteryState).toHaveBeenCalled();
  });

  it('should award bonus XP for purity mastery', () => {
    const state = makeBaseState({
      techniques: {
        durationMastery: 5,
        purityMastery: 5,
        consistencyMastery: 5,
        comebackMastery: 0,
        bossMastery: 0,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(state);
    const result = MasteryService.applySessionXp(TEST_USER_ID, {
      durationMastery: 0,
      purityMastery: 3,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    });
    expect(result.updatedState.techniques.purityMastery).toBeGreaterThan(5);
  });

  it('should award comeback mastery', () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const result = MasteryService.applySessionXp(TEST_USER_ID, {
      durationMastery: 0,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 2,
      bossMastery: 0,
    });
    expect(result.updatedState.techniques.comebackMastery).toBeGreaterThan(0);
  });

  it('should award boss mastery', () => {
    mockedLoadStoredMasteryState.mockReturnValue(makeBaseState());
    const result = MasteryService.applySessionXp(TEST_USER_ID, {
      durationMastery: 0,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 3,
    });
    expect(result.updatedState.techniques.bossMastery).toBeGreaterThan(0);
  });

  it('should rank up when threshold crossed', () => {
    const nearRankUpState = makeBaseState({
      totalMasteryPoints: MASTERY_RANK_THRESHOLDS.ADEPT - 5,
      techniques: {
        durationMastery: 8,
        purityMastery: 8,
        consistencyMastery: 8,
        comebackMastery: 3,
        bossMastery: 3,
      },
    });
    mockedLoadStoredMasteryState.mockReturnValue(nearRankUpState);
    const result = MasteryService.applySessionXp(TEST_USER_ID, {
      durationMastery: 10,
      purityMastery: 0,
      consistencyMastery: 0,
      comebackMastery: 0,
      bossMastery: 0,
    });
    expect(result.rankChanged).toBe(true);
    expect(result.newRank).toBe('ADEPT');
  });

  it('should cap technique values at 25', () => {
    const nearCapState = makeBaseState({
      totalMasteryPoints: 2000,
      rank: 'EXPERT',
      techniques: {
        durationMastery: 24,
        purityMastery: 24,
        consistencyMastery: 24,
        comebackMastery: 20,
        bossMastery: 20,
      },
      unlockedFeatures: ['advanced_analytics'],
    });
    mockedLoadStoredMasteryState.mockReturnValue(nearCapState);
    const result = MasteryService.applySessionXp(TEST_USER_ID, {
      durationMastery: 5,
      purityMastery: 5,
      consistencyMastery: 5,
      comebackMastery: 5,
      bossMastery: 5,
    });
    expect(result.updatedState.techniques.durationMastery).toBe(25);
    expect(result.updatedState.techniques.purityMastery).toBe(25);
    expect(result.updatedState.techniques.bossMastery).toBe(25);
  });
});
