/**
 * Basic Solo Boss Service Tests
 * 
 * Tests for PHASE 8 basic solo boss requirements:
 * - one active solo boss
 * - deterministic damage from completed sessions
 * - persistent health
 * - defeat reward
 * - timeout consolation
 * - no paid retry
 * - no raids
 * - no squad war dependency
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as service from '../basic-solo-boss-service';
import * as repository from '../repository';
import { eventBus } from '../../../events';

// Mock the repository
jest.mock('../repository');
const mockRepository = repository as jest.Mocked<typeof repository>;

// Mock event bus
jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

describe('Basic Solo Boss Service - PHASE 8', () => {
  const mockUserId = 'user-123';
  const mockSessionId = 'session-123';
  const mockEncounterId = 'encounter-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Launch Scope Requirements', () => {
    it('should support one active solo boss only', async () => {
      // Mock no existing encounter
      mockRepository.fetchActiveEncounter.mockResolvedValue(null);
      mockRepository.fetchBossTemplate.mockResolvedValue({
        id: 'basic-solo-boss-001',
        name: 'Focus Guardian',
        description: 'A guardian that tests your focus consistency',
        avatarUrl: null,
        tier: 1,
        baseHealth: 1000,
        healthScaling: 0.1,
        minLevel: 1,
        previousBossId: null,
        timeLimit: 86400, // 24 hours
        rewardType: 'XP',
        rewardAmount: 50,
        rewardItemId: null,
      });
      mockRepository.createEncounter.mockResolvedValue({
        id: mockEncounterId,
        bossId: 'basic-solo-boss-001',
        userId: mockUserId,
        squadId: null,
        healthRemaining: 1000,
        maxHealth: 1000,
        damageDealt: 0,
        status: 'ACTIVE',
        startedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        defeatedAt: null,
        contributingSessionIds: [],
        createdAt: Date.now(),
      });

      const result = await service.getOrCreateBasicSoloBossEncounter(mockUserId);

      expect(result).toBeTruthy();
      expect(result?.bossName).toBe('Focus Guardian');
      expect(mockRepository.createEncounter).toHaveBeenCalledWith(
        'basic-solo-boss-001',
        mockUserId,
        null,
        1000,
        86400
      );
    });

    it('should calculate deterministic damage from session data', () => {
      const testCases = [
        {
          input: { sessionDurationMinutes: 30, sessionQuality: 80, streakDays: 0 },
          expected: 19, // 30 * 0.8 * 0.8 = 19.2 -> 19
        },
        {
          input: { sessionDurationMinutes: 60, sessionQuality: 100, streakDays: 5 },
          expected: 58, // 60 * 0.8 * 1.0 * 1.2 = 57.6 -> 58
        },
        {
          input: { sessionDurationMinutes: 45, sessionQuality: 60, streakDays: 2 },
          expected: 22, // 45 * 0.8 * 0.6 = 21.6 -> 22
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = service.calculateBasicSoloBossDamage(input);
        expect(result).toBe(expected);
      });
    });

    it('should maintain persistent health across sessions', async () => {
      const mockEncounter = {
        id: mockEncounterId,
        bossId: 'basic-solo-boss-001',
        userId: mockUserId,
        squadId: null,
        healthRemaining: 800,
        maxHealth: 1000,
        damageDealt: 200,
        status: 'ACTIVE',
        startedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        defeatedAt: null,
        contributingSessionIds: ['session-1'],
        createdAt: Date.now(),
      };

      mockRepository.fetchEncounterById.mockResolvedValue(mockEncounter);
      mockRepository.updateEncounterHealth.mockResolvedValue({
        ...mockEncounter,
        healthRemaining: 750,
        damageDealt: 250,
        contributingSessionIds: ['session-1', mockSessionId],
      });

      const result = await service.applyBasicSoloBossDamage(mockEncounterId, mockSessionId, 50);

      expect(result.damageDealt).toBe(50);
      expect(result.healthRemaining).toBe(750);
      expect(result.percentComplete).toBe(25); // 250/1000
      expect(mockRepository.updateEncounterHealth).toHaveBeenCalledWith(
        mockEncounterId,
        750,
        250,
        mockSessionId
      );
    });

    it('should handle defeat rewards properly', async () => {
      const mockEncounter = {
        id: mockEncounterId,
        bossId: 'basic-solo-boss-001',
        userId: mockUserId,
        squadId: null,
        healthRemaining: 50,
        maxHealth: 1000,
        damageDealt: 950,
        status: 'ACTIVE',
        startedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        defeatedAt: null,
        contributingSessionIds: ['session-1'],
        createdAt: Date.now(),
      };

      mockRepository.fetchEncounterById.mockResolvedValue(mockEncounter);
      mockRepository.markEncounterDefeated.mockResolvedValue({
        ...mockEncounter,
        status: 'DEFEATED',
        defeatedAt: Date.now(),
      });
      mockRepository.fetchBossTemplate.mockResolvedValue({
        id: 'basic-solo-boss-001',
        name: 'Focus Guardian',
        description: 'Test boss',
        avatarUrl: null,
        tier: 1,
        baseHealth: 1000,
        healthScaling: 0.1,
        minLevel: 1,
        previousBossId: null,
        timeLimit: 86400,
        rewardType: 'XP',
        rewardAmount: 50,
        rewardItemId: null,
      });
      mockRepository.recordBossDefeat.mockResolvedValue();

      const result = await service.applyBasicSoloBossDamage(mockEncounterId, mockSessionId, 50);

      expect(result.isDefeated).toBe(true);
      expect(result.percentComplete).toBe(100);
      expect(mockRepository.markEncounterDefeated).toHaveBeenCalledWith(mockEncounterId);
      expect(mockRepository.recordBossDefeat).toHaveBeenCalledWith(
        mockUserId,
        'basic-solo-boss-001',
        mockEncounterId,
        950 // Existing damage before final hit
      );
      expect(eventBus.publish).toHaveBeenCalledWith('boss:defeated', {
        userId: mockUserId,
        bossId: 'basic-solo-boss-001',
        damageDealt: 950,
        won: true,
        rewards: {
          xp: 50,
          coins: 0,
          items: [],
        },
        participants: [mockUserId],
      });
    });

    it('should handle timeout with consolation (no fear monetization)', async () => {
      const mockEncounter = {
        id: mockEncounterId,
        bossId: 'basic-solo-boss-001',
        userId: mockUserId,
        squadId: null,
        healthRemaining: 300,
        maxHealth: 1000,
        damageDealt: 700,
        status: 'ACTIVE',
        startedAt: Date.now() - 86400000, // Started 24 hours ago
        expiresAt: Date.now() - 1000, // Expired 1 second ago
        defeatedAt: null,
        contributingSessionIds: ['session-1'],
        createdAt: Date.now() - 86400000,
      };

      mockRepository.fetchActiveEncounter.mockResolvedValue(mockEncounter);
      mockRepository.markEncounterTimeout.mockResolvedValue({
        ...mockEncounter,
        status: 'TIMEOUT',
      });

      await service.handleBasicSoloBossTimeout(mockEncounterId);

      expect(mockRepository.markEncounterTimeout).toHaveBeenCalledWith(mockEncounterId);
      expect(eventBus.publish).toHaveBeenCalledWith('boss:timeout', {
        encounterId: mockEncounterId,
        message: 'The boss has retreated. Try again tomorrow!',
      });
    });
  });

  describe('No Paid Retry Enforcement', () => {
    it('should not have any paid retry mechanisms', () => {
      const serviceFunctions = Object.keys(service);
      const paidRetryKeywords = ['purchase', 'buy', 'pay', 'gem', 'coin', 'retry', 'revive'];
      
      serviceFunctions.forEach(funcName => {
        paidRetryKeywords.forEach(keyword => {
          expect(funcName.toLowerCase()).not.toContain(keyword);
        });
      });
    });

    it('should only allow starting new encounters after timeout/defeat', async () => {
      // Mock active encounter
      mockRepository.fetchActiveEncounter.mockResolvedValue({
        id: mockEncounterId,
        bossId: 'basic-solo-boss-001',
        userId: mockUserId,
        squadId: null,
        healthRemaining: 500,
        maxHealth: 1000,
        damageDealt: 500,
        status: 'ACTIVE',
        startedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        defeatedAt: null,
        contributingSessionIds: [],
        createdAt: Date.now(),
      });

      const status = await service.getBasicSoloBossStatus(mockUserId);

      expect(status.hasActiveEncounter).toBe(true);
      expect(status.canStartNewEncounter).toBe(false);
    });
  });

  describe('No Raids or Squad War Dependency', () => {
    it('should handle solo encounters only', async () => {
      mockRepository.fetchActiveEncounter.mockResolvedValue(null);
      mockRepository.fetchBossTemplate.mockResolvedValue({
        id: 'basic-solo-boss-001',
        name: 'Focus Guardian',
        description: 'Solo boss only',
        avatarUrl: null,
        tier: 1,
        baseHealth: 1000,
        healthScaling: 0.1,
        minLevel: 1,
        previousBossId: null,
        timeLimit: 86400,
        rewardType: 'XP',
        rewardAmount: 50,
        rewardItemId: null,
      });
      mockRepository.createEncounter.mockResolvedValue({
        id: mockEncounterId,
        bossId: 'basic-solo-boss-001',
        userId: mockUserId,
        squadId: null, // Always null for solo boss
        healthRemaining: 1000,
        maxHealth: 1000,
        damageDealt: 0,
        status: 'ACTIVE',
        startedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        defeatedAt: null,
        contributingSessionIds: [],
        createdAt: Date.now(),
      });

      const result = await service.getOrCreateBasicSoloBossEncounter(mockUserId);

      expect(mockRepository.createEncounter).toHaveBeenCalledWith(
        'basic-solo-boss-001',
        mockUserId,
        null, // Squad ID is always null
        1000,
        86400
      );
    });
  });
});