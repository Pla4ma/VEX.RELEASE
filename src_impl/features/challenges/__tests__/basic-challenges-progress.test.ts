import * as service from '../basic-challenges-service';
import * as repository from '../repository';
import { eventBus } from '../../../events';

jest.mock('../repository');
jest.mock('../../../events');
jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: () => ({
    addXpReward: jest.fn().mockResolvedValue(undefined),
    addCoinReward: jest.fn().mockResolvedValue(undefined),
  }),
}));

const mockRepository = repository as jest.Mocked<typeof repository>;

describe('Basic Challenges Progress', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'session-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update progress from sessions', async () => {
    const mockDailyChallenge = {
      id: 'daily-challenge-123',
      userId: mockUserId,
      challengeId: 'basic-daily-001',
      status: 'ACTIVE',
      currentValue: 0,
      assignedAt: Date.now(),
      expiresAt: Date.now() + 86400000,
      completedAt: null,
      claimedAt: null,
      rerollCount: 0,
    };

    const mockWeeklyChallenge = {
      id: 'weekly-challenge-123',
      userId: mockUserId,
      challengeId: 'basic-weekly-001',
      status: 'ACTIVE',
      currentValue: 2,
      assignedAt: Date.now(),
      expiresAt: Date.now() + 604800000,
      completedAt: null,
      claimedAt: null,
      rerollCount: 0,
    };

    mockRepository.fetchUserActiveChallenges.mockResolvedValue([mockDailyChallenge, mockWeeklyChallenge]);
    mockRepository.addChallengeProgress.mockResolvedValue(mockDailyChallenge);
    mockRepository.updateUserChallenge.mockResolvedValue(mockDailyChallenge);

    const result = await service.updateBasicChallengeProgressFromSession(
      mockUserId,
      mockSessionId,
      1800
    );

    expect(result.dailyUpdated).toBe(true);
    expect(result.weeklyUpdated).toBe(true);
    expect(mockRepository.addChallengeProgress).toHaveBeenCalledWith(
      mockUserId,
      'basic-daily-001',
      1,
      `session:${mockSessionId}`
    );
  });

  describe('Social and Completion', () => {
    it('should handle challenges without any social features', async () => {
      const mockDailyChallenge = {
        id: 'daily-challenge-123',
        userId: mockUserId,
        challengeId: 'basic-daily-001',
        status: 'ACTIVE',
        currentValue: 0,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      };

      mockRepository.fetchUserActiveChallenges.mockResolvedValue([mockDailyChallenge]);
      mockRepository.addChallengeProgress.mockResolvedValue(mockDailyChallenge);

      const result = await service.updateBasicChallengeProgressFromSession(
        mockUserId,
        mockSessionId,
        1800
      );

      expect(result.dailyUpdated).toBe(true);
    });
  });
});
