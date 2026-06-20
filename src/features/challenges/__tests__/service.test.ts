import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as service from '../service';
import * as repository from '../repository';
import * as queries from '../queries';
import { eventBus } from '../../../events/EventBus';
jest.mock('../repository');
jest.mock('../queries', () => ({
  getCompletedChallenges: jest.fn(),
}));
jest.mock('../../../events/EventBus', () => ({ eventBus: { publish: jest.fn() } }));
jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({
    grantReward: jest.fn().mockResolvedValue(undefined),
  })),
}));
const mockedRepository = jest.mocked(repository);
const mockedQueries = jest.mocked(queries);
const mockedEventBus = jest.mocked(eventBus);
describe('Challenges Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('assignChallenge', () => {
    it('should assign a challenge to a user', async () => {
      const mockChallenge = {
        id: 'challenge-1',
        userId: 'user-1',
        challengeId: 'template-1',
        status: 'ACTIVE',
        createdAt: Date.now(),
      };
      mockedRepository.createUserChallenge.mockResolvedValue(
        mockChallenge as unknown,
      );
      const result = await service.assignChallenge({
        userId: 'user-1',
        seasonId: 'season-1',
        challengeType: 'DAILY',
        challengeId: 'template-1',
      });
      expect(result).toBeDefined();
      expect(mockedRepository.createUserChallenge).toHaveBeenCalled();
    });
    it('should throw error for invalid user', async () => {
      await expect(
        service.assignChallenge({
          userId: '',
          seasonId: 'season-1',
          challengeType: 'DAILY',
        }),
      ).rejects.toThrow();
    });
  });
  describe('updateChallengeProgress', () => {
    it('should update progress and complete challenge', async () => {
      const mockUserChallenge = {
        id: 'uc-1',
        userId: 'user-1',
        challengeId: 'c-1',
        currentValue: 0,
        targetValue: 100,
        status: 'ACTIVE',
      };
      const mockChallenge = {
        id: 'c-1',
        targetValue: 100,
        rewardType: 'COINS',
        rewardAmount: 50,
      };
      mockedRepository.fetchUserChallenge.mockResolvedValue(
        mockUserChallenge as unknown,
      );
      mockedRepository.fetchChallengeById.mockResolvedValue(
        mockChallenge as unknown,
      );
      mockedRepository.addChallengeProgress.mockResolvedValue({
        ...mockUserChallenge,
        currentValue: 100,
        status: 'COMPLETED',
      } as unknown);
      const result = await service.updateChallengeProgress({
        userId: 'user-1',
        challengeId: 'c-1',
        delta: 100,
        source: 'test',
      });
      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
      expect(mockedEventBus.publish).toHaveBeenCalledWith(
        'challenge:progress',
        expect.any(Object),
      );
    });
    it('should handle partial progress', async () => {
      const mockUserChallenge = {
        id: 'uc-1',
        userId: 'user-1',
        challengeId: 'c-1',
        currentValue: 50,
        targetValue: 100,
        status: 'ACTIVE',
      };
      const mockChallenge = { id: 'c-1', targetValue: 100 };
      mockedRepository.fetchUserChallenge.mockResolvedValue(
        mockUserChallenge as unknown,
      );
      mockedRepository.fetchChallengeById.mockResolvedValue(
        mockChallenge as unknown,
      );
      mockedRepository.addChallengeProgress.mockResolvedValue({
        ...mockUserChallenge,
        currentValue: 75,
        status: 'ACTIVE',
      } as unknown);
      const result = await service.updateChallengeProgress({
        userId: 'user-1',
        challengeId: 'c-1',
        delta: 25,
        source: 'test',
      });
      expect(result).toBeNull();
    });
  });

  describe('checkChallengeProgress', () => {
    it('should check progress for active challenges', async () => {
      mockedRepository.fetchUserChallenge.mockResolvedValue({
        id: 'uc-1',
        userId: 'user-1',
        challengeId: 'c-1',
        status: 'ACTIVE',
        currentValue: 50,
        targetValue: 100,
      } as unknown);
      mockedRepository.fetchChallengeById.mockResolvedValue({
        id: 'c-1',
        targetValue: 100,
        rewardType: 'COINS',
        rewardAmount: 50,
      } as unknown);
      mockedRepository.addChallengeProgress.mockResolvedValue({
        id: 'uc-1',
        userId: 'user-1',
        challengeId: 'c-1',
        currentValue: 60,
        status: 'ACTIVE',
      } as unknown);
      const result = await service.updateChallengeProgress({
        userId: 'user-1',
        challengeId: 'c-1',
        delta: 10,
        source: 'test',
      });
      expect(result).toBeDefined();
    });
  });
  describe('claimChallengeReward', () => {
    it('should claim reward for completed challenge', async () => {
      const mockDetail = {
        challenge: {
          id: 'c-1',
          rewardType: 'COINS',
          rewardAmount: 100,
        },
        userChallenge: {
          id: 'uc-1',
          userId: 'user-1',
          challengeId: 'c-1',
          status: 'COMPLETED',
          claimedAt: null,
        },
        xpReward: 50,
        coinReward: 100,
        requiredCount: 1,
      };
      mockedQueries.getCompletedChallenges.mockResolvedValue([mockDetail] as unknown);
      mockedRepository.updateUserChallenge.mockResolvedValue({} as unknown);
      const result = await service.claimChallengeReward({
        userId: 'user-1',
        challengeId: 'c-1',
      });
      expect(result.success).toBe(true);
      expect(result.rewards.length).toBeGreaterThanOrEqual(1);
    });
    it('should fail for uncompleted challenge', async () => {
      const mockUserChallenge = {
        id: 'uc-1',
        userId: 'user-1',
        challengeId: 'c-1',
        status: 'ACTIVE',
        claimedAt: null,
      };
      mockedQueries.getCompletedChallenges.mockResolvedValue([] as unknown);
      const result = await service.claimChallengeReward({
        userId: 'user-1',
        challengeId: 'c-1',
      });
      expect(result.success).toBe(false);
      expect(result.error).toContain('not completed');
    });
  });
});
