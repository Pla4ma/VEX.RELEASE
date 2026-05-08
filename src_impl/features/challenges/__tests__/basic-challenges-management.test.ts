import * as service from '../basic-challenges-service';
import * as repository from '../repository';
import { eventBus } from '../../../events';

jest.mock('../repository');
jest.mock('../../../events');

const mockRepository = repository as jest.Mocked<typeof repository>;

describe('Basic Challenges Management', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Challenge Creation', () => {
    it('should support daily challenge only', async () => {
      mockRepository.fetchUserActiveChallenges.mockResolvedValue([]);
      mockRepository.createUserChallenge.mockResolvedValue({
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
      });

      const result = await service.getOrCreateBasicDailyChallenge(mockUserId);

      expect(result).toBeTruthy();
      expect(result?.challengeId).toBe('basic-daily-001');
      expect(mockRepository.createUserChallenge).toHaveBeenCalledWith(
        mockUserId,
        'basic-daily-001',
        expect.any(Number)
      );
    });

    it('should support weekly challenge only', async () => {
      mockRepository.fetchUserActiveChallenges.mockResolvedValue([]);
      mockRepository.createUserChallenge.mockResolvedValue({
        id: 'weekly-challenge-123',
        userId: mockUserId,
        challengeId: 'basic-weekly-001',
        status: 'ACTIVE',
        currentValue: 0,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 604800000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      });

      const result = await service.getOrCreateBasicWeeklyChallenge(mockUserId);

      expect(result).toBeTruthy();
      expect(result?.challengeId).toBe('basic-weekly-001');
      expect(mockRepository.createUserChallenge).toHaveBeenCalledWith(
        mockUserId,
        'basic-weekly-001',
        expect.any(Number)
      );
    });
  });

  describe('Status and CTA', () => {
    it('should provide one clear CTA per challenge', async () => {
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
        currentValue: 3,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 604800000,
        completedAt: null,
        claimedAt: null,
        rerollCount: 0,
      };

      mockRepository.fetchUserActiveChallenges.mockResolvedValue([mockDailyChallenge, mockWeeklyChallenge]);

      const status = await service.getBasicChallengesStatus(mockUserId);

      expect(status.daily.required).toBe(1);
      expect(status.weekly.required).toBe(5);
      expect(status.daily.hasActiveChallenge).toBe(true);
      expect(status.weekly.hasActiveChallenge).toBe(true);
    });
  });

  describe('Claiming Rewards', () => {
    it('should handle reward claiming properly', async () => {
      const mockCompletedChallenge = {
        id: 'daily-challenge-123',
        userId: mockUserId,
        challengeId: 'basic-daily-001',
        status: 'COMPLETED',
        currentValue: 1,
        assignedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        completedAt: Date.now() - 3600000,
        claimedAt: null,
        rerollCount: 0,
      };

      mockRepository.fetchUserActiveChallenges.mockResolvedValue([mockCompletedChallenge]);
      mockRepository.updateUserChallenge.mockResolvedValue({
        ...mockCompletedChallenge,
        claimedAt: Date.now(),
      });

      const result = await service.claimBasicChallengeReward(mockUserId, 'DAILY');

      expect(result.success).toBe(true);
      expect(result.rewards).toEqual([{ type: 'XP', amount: 25 }]);
      expect(eventBus.publish).toHaveBeenCalledWith('challenge:reward_claimed', expect.anything());
    });
  });
});
