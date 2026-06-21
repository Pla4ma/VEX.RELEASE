import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as service from '../service';
import * as repository from '../repository';
import type { DailyChallengeContext, DailyChallengeTriggerType } from '../service';

jest.mock('../repository');
jest.mock('../queries', () => ({
  getActiveChallenges: jest.fn().mockResolvedValue([]),
}));
jest.mock('../../../events/EventBus', () => ({
  eventBus: { publish: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
}));
jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({
    grantReward: jest.fn().mockResolvedValue(undefined),
  })),
}));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const mockedRepository = jest.mocked(repository);

describe('Challenges Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assignChallenge', () => {
    it('should assign a challenge with valid input', async () => {
      mockedRepository.createUserChallenge.mockResolvedValue({
        id: 'uc-1', userId: 'user-1', challengeId: 'c-1',
        status: 'ACTIVE', currentValue: 0,
      } as unknown);
      const result = await service.assignChallenge({
        userId: 'user-1', seasonId: 's-1', challengeType: 'DAILY', challengeId: 'c-1',
      });
      expect(result).toBeDefined();
      expect(mockedRepository.createUserChallenge).toHaveBeenCalled();
    });

    it('should throw when challengeId is missing', async () => {
      await expect(
        service.assignChallenge({
          userId: 'user-1', seasonId: 's-1', challengeType: 'DAILY',
        }),
      ).rejects.toThrow();
    });
  });

  describe('checkChallengeProgress', () => {
    it('should check progress for active challenges', async () => {
      mockedRepository.fetchUserActiveChallenges.mockResolvedValue([]);
      const result = await service.checkChallengeProgress(
        'user-1',
        'SESSION_COMPLETED' as DailyChallengeTriggerType,
        {} as DailyChallengeContext,
      );
      expect(result).toBeDefined();
      expect(result.updated).toEqual([]);
      expect(result.completed).toEqual([]);
    });
  });
});
