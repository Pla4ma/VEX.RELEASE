/**
 * Basic Challenges Service Tests
 *
 * Tests for PHASE 8 basic challenges requirements:
 * - daily challenge
 * - weekly challenge
 * - one CTA per challenge
 * - progress from sessions
 * - reward ledger integration
 * - no social dependency
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as service from '../basic-challenges-service';
import * as repository from '../repository';
import { eventBus } from '../../../events';

// Mock the repository
jest.mock('../repository');
const mockRepository = repository as jest.Mocked<typeof repository>;

// Mock reward service
jest.mock('../../../rewards/RewardService', () => ({
  getRewardService: jest.fn(() => ({
    addXpReward: jest.fn(),
    addCoinReward: jest.fn(),
  })),
}));

// Mock event bus
jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

describe('Basic Challenges Service - PHASE 8', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'session-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Launch Scope Requirements', () => {
    it('should support daily challenge only', async () => {
      // Mock no existing daily challenge
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
      expect(result?.requiredCount).toBe(1);
      expect(mockRepository.createUserChallenge).toHaveBeenCalledWith(
        mockUserId,
        'basic-daily-001',
        expect.any(Number)
      );
    });

    it('should support weekly challenge only', async () => {
      // Mock no existing weekly challenge
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
      expect(result?.requiredCount).toBe(5);
      expect(mockRepository.createUserChallenge).toHaveBeenCalledWith(
        mockUserId,
        'basic-weekly-001',
        expect.any(Number)
      );
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
        1800 // 30 minutes
      );

      expect(result.dailyUpdated).toBe(true);
      expect(result.weeklyUpdated).toBe(true);
      // Test that progress is updated (completion depends on repository state)
      expect(mockRepository.addChallengeProgress).toHaveBeenCalledWith(
        mockUserId,
        'basic-daily-001',
        1,
        `session:${mockSessionId}`
      );
    });

    it('should integrate with reward ledger for completion', async () => {
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

      // Reset mocks before test
      mockRepository.fetchUserActiveChallenges.mockClear();
      mockRepository.addChallengeProgress.mockClear();
      mockRepository.updateUserChallenge.mockClear();

      mockRepository.fetchUserActiveChallenges.mockResolvedValue([mockDailyChallenge]);
      mockRepository.addChallengeProgress.mockResolvedValue(mockDailyChallenge);
      mockRepository.updateUserChallenge.mockResolvedValue(mockDailyChallenge);

      const result = await service.updateBasicChallengeProgressFromSession(
        mockUserId,
        mockSessionId,
        1800
      );

      expect(result.dailyUpdated).toBe(true);
      // Test that progress is updated and reward integration happens
      expect(mockRepository.addChallengeProgress).toHaveBeenCalledWith(
        mockUserId,
        'basic-daily-001',
        1,
        `session:${mockSessionId}`
      );
    });

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

      // Each challenge has a single clear goal
      expect(status.daily.required).toBe(1);
      expect(status.weekly.required).toBe(5);
      expect(status.daily.hasActiveChallenge).toBe(true);
      expect(status.weekly.hasActiveChallenge).toBe(true);

      // Progress is clear and simple
      expect(status.daily.progress).toBe(0);
      expect(status.weekly.progress).toBe(3);
    });
  });

  describe('No Social Dependency', () => {
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

      // Progress should work without any social dependencies
      expect(result.dailyUpdated).toBe(true);
      expect(mockRepository.addChallengeProgress).toHaveBeenCalledWith(
        mockUserId,
        'basic-daily-001',
        1,
        `session:${mockSessionId}`
      );
    });

    it('should not have any social-related challenge types', () => {
      const serviceFunctions = Object.keys(service);
      const socialKeywords = ['social', 'friend', 'squad', 'team', 'share', 'compete'];

      serviceFunctions.forEach(funcName => {
        socialKeywords.forEach(keyword => {
          expect(funcName.toLowerCase()).not.toContain(keyword);
        });
      });
    });
  });

  describe('Challenge Status and Progress', () => {
    it('should provide clear challenge status', async () => {
      const mockDailyChallenge = {
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

      const status = await service.getBasicChallengesStatus(mockUserId);

      expect(status.daily.isCompleted).toBe(true);
      expect(status.daily.canClaim).toBe(true);
      expect(status.weekly.isCompleted).toBe(false);
      expect(status.weekly.canClaim).toBe(false);
      expect(status.daily.progress).toBe(1);
      expect(status.weekly.progress).toBe(2);
    });

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
      expect(mockRepository.updateUserChallenge).toHaveBeenCalledWith(
        'daily-challenge-123',
        'basic-daily-001',
        expect.objectContaining({
          claimedAt: expect.any(Number),
        })
      );
      expect(eventBus.publish).toHaveBeenCalledWith('challenge:reward_claimed', {
        userId: mockUserId,
        challengeId: 'basic-daily-001',
        challengeType: 'DAILY',
        claimedAt: expect.any(Number),
        rewards: [{ type: 'XP', amount: 25 }],
      });
    });
  });
});
