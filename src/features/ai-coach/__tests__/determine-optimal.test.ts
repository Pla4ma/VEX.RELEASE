import { jest, beforeEach } from '@jest/globals';
import {
  determineOptimalState,
  makeProfile,
  mockUserId,
  repository,
} from './helpers';

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
