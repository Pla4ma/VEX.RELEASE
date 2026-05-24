import { getDailyProgress } from '../service-enhanced-daily';
import { fetchXpHistory } from '../repository';
import { fetchXpStats } from '../repository/enhanced';

jest.mock('../repository', () => ({
  fetchXpHistory: jest.fn(),
}));

jest.mock('../repository/enhanced', () => ({
  fetchXpStats: jest.fn(),
}));

const mockFetchXpHistory = jest.mocked(fetchXpHistory);
const mockFetchXpStats = jest.mocked(fetchXpStats);

describe('getDailyProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('counts unique completed sessions instead of XP source names', async () => {
    mockFetchXpHistory.mockResolvedValue([
      {
        amount: 120,
        createdAt: Date.now(),
        id: '11111111-1111-4111-8111-111111111111',
        metadata: null,
        sessionId: '22222222-2222-4222-8222-222222222222',
        source: 'SESSION_COMPLETE',
      },
      {
        amount: 40,
        createdAt: Date.now(),
        id: '33333333-3333-4333-8333-333333333333',
        metadata: null,
        sessionId: '22222222-2222-4222-8222-222222222222',
        source: 'SESSION_COMPLETE',
      },
      {
        amount: 30,
        createdAt: Date.now(),
        id: '44444444-4444-4444-8444-444444444444',
        metadata: null,
        sessionId: null,
        source: 'STREAK_BONUS',
      },
    ]);

    const progress = await getDailyProgress(
      '55555555-5555-4555-8555-555555555555',
    );

    expect(progress.xpEarned).toBe(190);
    expect(progress.sessionsCompleted).toBe(1);
    expect(progress.dailyGoalMet).toBe(true);
    expect(progress.goalProgressPercent).toBe(100);
  });

  it('falls back to zero progress when history and stats are unavailable', async () => {
    mockFetchXpHistory.mockRejectedValue(new Error('bad storage'));
    mockFetchXpStats.mockResolvedValue({ data: null, error: null });

    const progress = await getDailyProgress(
      '55555555-5555-4555-8555-555555555555',
    );

    expect(progress.xpEarned).toBe(0);
    expect(progress.sessionsCompleted).toBe(0);
    expect(progress.streakDay).toBe(false);
  });
});

