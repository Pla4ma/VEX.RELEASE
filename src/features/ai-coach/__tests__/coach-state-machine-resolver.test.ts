import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import {
  determineOptimalState,
  resolveCoachState,
  transitionState,
  checkAutoTransitions,
  StateTransitionError,
} from '../service/coach-state-machine';
import type { CoachSignals } from '../service/coach-state-machine';
import type { BehaviorProfile, CoachState } from '../schemas';
import * as repository from '../repository';

jest.mock('../repository');

const mockUserId = '11111111-1111-4111-8111-111111111111';

function makeProfile(overrides: Partial<BehaviorProfile> = {}): BehaviorProfile {
  return {
    userId: mockUserId,
    signals: [],
    lastUpdated: Date.now(),
    confidenceLevel: 'LOW',
    coldStart: true,
    dataPoints: 0,
    ...overrides,
  };
}

function makeCoachState(overrides: Partial<CoachState> = {}): CoachState {
  return {
    userId: mockUserId,
    currentState: 'COLD_START',
    previousState: null,
    stateEnteredAt: Date.now(),
    personaId: '00000000-0000-4000-a000-000000000001',
    behaviorProfile: null,
    lastInterventionAt: null,
    interventionsToday: 0,
    muteUntil: null,
    reduceNotifications: false,
    ...overrides,
  };
}

describe('resolveCoachState — pure resolver', () => {
  const baseSignals: CoachSignals = {
    comebackActive: false,
    streakIsAtRisk: false,
    streakRecentlyBroken: false,
    daysSinceBreak: 0,
    hasUncelebratedMilestone: false,
    sessionOverload: false,
    isMuted: false,
    isColdStart: true,
    profileConfidence: 'LOW',
    dataPoints: 0,
  };

  it('streak risk beats high confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakIsAtRisk: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('STREAK_AT_RISK');
  });

  it('comeback beats premium tease', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      comebackActive: true,
      streakIsAtRisk: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('COMEBACK_MODE');
  });

  it('comeback beats high confidence on established profile', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      comebackActive: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('COMEBACK_MODE');
  });

  it('post-failure support beats generic confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 1,
      streakIsAtRisk: false,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('POST_FAILURE_SUPPORT');
  });

  it('post-failure support only for recent breaks', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 5,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('HIGH_CONFIDENCE');
  });

  it('milestone hype beats high confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      hasUncelebratedMilestone: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('MILESTONE_HYPE');
  });

  it('overload protection beats active study', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      sessionOverload: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('OVERLOAD_PROTECTION');
  });

  it('muted mode beats everything else', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      isMuted: true,
      comebackActive: true,
      streakIsAtRisk: true,
      sessionOverload: true,
      profileConfidence: 'HIGH',
      dataPoints: 50,
    });
    expect(state).toBe('MUTED_MODE');
  });

  it('cold start for new users', () => {
    const state = resolveCoachState(baseSignals);
    expect(state).toBe('COLD_START');
  });

  it('cold start beats low confidence on empty profile', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: true,
      profileConfidence: 'LOW',
      dataPoints: 0,
    });
    expect(state).toBe('COLD_START');
  });

  it('high confidence for established users', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      profileConfidence: 'HIGH',
      dataPoints: 30,
    });
    expect(state).toBe('HIGH_CONFIDENCE');
  });

  it('low confidence for moderate data users', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      profileConfidence: 'LOW',
      dataPoints: 10,
    });
    expect(state).toBe('LOW_CONFIDENCE');
  });

  it('streak recently broken with low confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 2,
      streakIsAtRisk: false,
      profileConfidence: 'LOW',
      dataPoints: 10,
    });
    expect(state).toBe('POST_FAILURE_SUPPORT');
  });

  it('streak broken but overflow old = falls to confidence', () => {
    const state = resolveCoachState({
      ...baseSignals,
      isColdStart: false,
      streakRecentlyBroken: true,
      daysSinceBreak: 4,
      profileConfidence: 'MEDIUM',
      dataPoints: 15,
    });
    expect(state).toBe('MEDIUM' satisfies string ? 'LOW_CONFIDENCE' : 'LOW_CONFIDENCE');
  });
});

describe('determineOptimalState — integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns STREAK_AT_RISK when signals indicate risk, not HIGH_CONFIDENCE', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(null);
    (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);

    const atRiskSignal = {
      id: 'a1b2c3d4-e5f6-4789-a123-4567890abcde',
      userId: mockUserId,
      signalType: 'STREAK_MAINTENANCE_RATE' as const,
      value: 0.3,
      confidence: 0.85,
      timestamp: Date.now(),
      metadata: {},
      expiresAt: Date.now() + 86400000,
    };
    const profile = makeProfile({
      coldStart: false,
      confidenceLevel: 'HIGH',
      dataPoints: 50,
      signals: [atRiskSignal],
    });

    const state = await determineOptimalState(mockUserId, profile);
    expect(state).toBe('STREAK_AT_RISK');
    expect(state).not.toBe('HIGH_CONFIDENCE');
  });

  it('returns HIGH_CONFIDENCE for healthy profile with no risk signals', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(null);
    (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);

    const healthySignal = {
      id: 'b2c3d4e5-f6a7-4890-b234-567890abcdef',
      userId: mockUserId,
      signalType: 'STREAK_MAINTENANCE_RATE' as const,
      value: 0.85,
      confidence: 0.9,
      timestamp: Date.now(),
      metadata: {},
      expiresAt: Date.now() + 86400000,
    };
    const profile = makeProfile({
      coldStart: false,
      confidenceLevel: 'HIGH',
      dataPoints: 50,
      signals: [healthySignal],
    });

    const state = await determineOptimalState(mockUserId, profile);
    expect(state).toBe('HIGH_CONFIDENCE');
  });

  it('returns COMEBACK_MODE when comeback is active', async () => {
    (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue({
      id: 'comeback-1',
      userId: mockUserId,
      status: 'ACTIVE',
    });

    const profile = makeProfile({
      coldStart: false,
      confidenceLevel: 'HIGH',
      dataPoints: 50,
    });

    const state = await determineOptimalState(mockUserId, profile);
    expect(state).toBe('COMEBACK_MODE');
  });

  it('returns COLD_START for null profile', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(null);
    (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);

    const state = await determineOptimalState(mockUserId, null);
    expect(state).toBe('COLD_START');
  });

  it('returns LOW_CONFIDENCE for 5-19 data points', async () => {
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(null);
    (repository.fetchActiveComebackPlan as jest.Mock).mockResolvedValue(null);

    const profile = makeProfile({
      coldStart: false,
      confidenceLevel: 'LOW',
      dataPoints: 10,
      signals: [],
    });

    const state = await determineOptimalState(mockUserId, profile);
    expect(state).toBe('LOW_CONFIDENCE');
  });
});

describe('transitionState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('transitions from COLD_START to LOW_CONFIDENCE', async () => {
    const currentState = makeCoachState();
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
    (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

    const newState = await transitionState(mockUserId, 'LOW_CONFIDENCE');
    expect(newState.currentState).toBe('LOW_CONFIDENCE');
    expect(newState.previousState).toBe('COLD_START');
  });

  it('throws on invalid transition', async () => {
    const currentState = makeCoachState({ currentState: 'HIGH_CONFIDENCE' });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);

    await expect(transitionState(mockUserId, 'COLD_START')).rejects.toThrow(
      StateTransitionError,
    );
  });

  it('allows forced transitions bypassing validation', async () => {
    const currentState = makeCoachState({ currentState: 'HIGH_CONFIDENCE' });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(currentState);
    (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);

    const newState = await transitionState(mockUserId, 'COLD_START', {}, true);
    expect(newState.currentState).toBe('COLD_START');
  });
});

describe('checkAutoTransitions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('auto-transitions after max duration exceeded', async () => {
    const oldState = makeCoachState({
      currentState: 'STREAK_AT_RISK',
      stateEnteredAt: Date.now() - 49 * 60 * 60 * 1000,
    });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(oldState);
    (repository.upsertCoachState as jest.Mock).mockImplementation((s) => s);
    (repository.fetchBehaviorProfile as jest.Mock).mockResolvedValue(
      makeProfile({ coldStart: false, dataPoints: 25, confidenceLevel: 'HIGH' }),
    );

    const result = await checkAutoTransitions(mockUserId);
    expect(result).not.toBeNull();
    expect(result?.currentState).not.toBe('STREAK_AT_RISK');
  });

  it('does not auto-transition within duration', async () => {
    const state = makeCoachState({
      currentState: 'STREAK_AT_RISK',
      stateEnteredAt: Date.now() - 24 * 60 * 60 * 1000,
    });
    (repository.fetchCoachState as jest.Mock).mockResolvedValue(state);

    const result = await checkAutoTransitions(mockUserId);
    expect(result).toBeNull();
  });
});
