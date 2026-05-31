import * as service from '../service';

const mockFetchCoachState = jest.fn();
const mockFetchRecentBehaviorSignals = jest.fn();
const mockUpsertBehaviorProfile = jest.fn();
const mockUpsertCoachState = jest.fn();
const mockAddBehaviorSignal = jest.fn();
const mockFetchDifficultyProfile = jest.fn();
const mockUpsertDifficultyProfile = jest.fn();
const mockFetchCoachHistory = jest.fn();
const mockFetchBehaviorProfile = jest.fn();

jest.mock('../repository', () => ({
  addBehaviorSignal: (...args: unknown[]) => mockAddBehaviorSignal(...args),
  fetchBehaviorProfile: (...args: unknown[]) =>
    mockFetchBehaviorProfile(...args),
  fetchCoachHistory: (...args: unknown[]) => mockFetchCoachHistory(...args),
  fetchCoachState: (...args: unknown[]) => mockFetchCoachState(...args),
  fetchDifficultyProfile: (...args: unknown[]) =>
    mockFetchDifficultyProfile(...args),
  fetchRecentBehaviorSignals: (...args: unknown[]) =>
    mockFetchRecentBehaviorSignals(...args),
  upsertBehaviorProfile: (...args: unknown[]) =>
    mockUpsertBehaviorProfile(...args),
  upsertCoachState: (...args: unknown[]) => mockUpsertCoachState(...args),
  upsertDifficultyProfile: (...args: unknown[]) =>
    mockUpsertDifficultyProfile(...args),
}));

const mockUserId = '11111111-1111-4111-8111-111111111111';

describe('CoachService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchRecentBehaviorSignals.mockResolvedValue([]);
    mockUpsertBehaviorProfile.mockImplementation((profile: unknown) => profile);
    mockUpsertCoachState.mockImplementation((state: unknown) => state);
    mockAddBehaviorSignal.mockImplementation((signal: unknown) => signal);
  });

  it('returns an existing coach state', async () => {
    const existingState = {
      behaviorProfile: null,
      currentState: 'HIGH_CONFIDENCE',
      interventionsToday: 0,
      lastInterventionAt: null,
      muteUntil: null,
      personaId: 'default',
      previousState: null,
      reduceNotifications: false,
      stateEnteredAt: Date.now(),
      userId: mockUserId,
    };
    mockFetchCoachState.mockResolvedValue(existingState);

    await expect(service.getOrCreateCoachState(mockUserId)).resolves.toEqual(
      existingState,
    );
    expect(mockFetchCoachState).toHaveBeenCalledWith(mockUserId);
  });

  it('creates a cold-start state when no state exists', async () => {
    mockFetchCoachState.mockResolvedValue(null);

    const result = await service.getOrCreateCoachState(mockUserId);

    expect(result.userId).toBe(mockUserId);
    expect(result.currentState).toBe('COLD_START');
    expect(mockUpsertCoachState).toHaveBeenCalled();
  });

  it('processes behavior signals through the repository profile pipeline', async () => {
    const result = await service.processBehaviorSignal({
      signalType: 'SESSION_QUALITY_TREND',
      userId: mockUserId,
      value: 0.85,
    });

    expect(result.userId).toBe(mockUserId);
    expect(result.coldStart).toBe(true);
    expect(mockAddBehaviorSignal).toHaveBeenCalled();
    expect(mockUpsertBehaviorProfile).toHaveBeenCalled();
  });

  it('detects streak risk only when inactivity and streak are both meaningful', async () => {
    await expect(service.detectStreakRisk(mockUserId, 30, 5)).resolves.toBe(
      true,
    );
    await expect(service.detectStreakRisk(mockUserId, 10, 5)).resolves.toBe(
      false,
    );
    await expect(service.detectStreakRisk(mockUserId, 30, 0)).resolves.toBe(
      false,
    );
  });

  it('adjusts difficulty to an explicit target', async () => {
    mockFetchDifficultyProfile.mockResolvedValue(null);
    mockUpsertDifficultyProfile.mockImplementation(
      (profile: unknown) => profile,
    );

    const result = await service.adjustDifficulty({
      reason: 'Test adjustment',
      targetDifficulty: 7,
      userId: mockUserId,
    });

    expect(result.recommendedDifficulty).toBe(7);
    expect(result.adjustmentReason).toBe('Test adjustment');
    expect(result.trend).toBe('IMPROVING');
  });

  it('generates performance summaries from coach history', async () => {
    mockFetchCoachState.mockResolvedValue({
      currentState: 'HIGH_CONFIDENCE',
      userId: mockUserId,
    });
    mockFetchCoachHistory.mockResolvedValue({
      lastMessageAt: Date.now(),
      messages: [],
      mutedCategories: [],
      preferredCategories: [],
      responseRate: 0,
      totalMessages: 0,
      userId: mockUserId,
    });

    await expect(
      service.generatePerformanceSummary(mockUserId, 'daily'),
    ).resolves.toMatchObject({ period: 'daily' });
    await expect(
      service.generatePerformanceSummary(mockUserId, 'weekly'),
    ).resolves.toMatchObject({ period: 'weekly' });
  });

  it('suggests challenges only when behavior profile data exists', async () => {
    mockFetchBehaviorProfile.mockResolvedValueOnce({
      coldStart: false,
      confidenceLevel: 'HIGH',
      dataPoints: 50,
      lastUpdated: Date.now(),
      signals: [
        {
          confidence: 0.9,
          expiresAt: Date.now() + 86_400_000,
          id: 'signal-1',
          metadata: {},
          signalType: 'CONSISTENCY_SCORE',
          timestamp: Date.now(),
          userId: mockUserId,
          value: 0.8,
        },
      ],
      userId: mockUserId,
    });
    const suggested = await service.suggestChallenges(mockUserId);

    mockFetchBehaviorProfile.mockResolvedValueOnce(null);
    const empty = await service.suggestChallenges(mockUserId);

    expect(suggested.suggestedChallenges.length).toBeGreaterThan(0);
    expect(empty.suggestedChallenges).toEqual([]);
  });
});
