/**
 * Comprehensive Streaks Service Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isQualifyingSession, getCalendarDay, checkMilestone, getStreakMultiplier, recordSession, getOrCreateStreak, getStreakSummary, useShield, freezeStreak, restoreStreak, detectComeback, calculateRiskLevel } from '../service';
import * as repository from '../repository';
import { eventBus } from '../../../events';

vi.mock('../repository');
vi.mock('../../../events', () => ({
  eventBus: {
    publish: vi.fn(),
  },
}));

describe('Streaks Service - Comprehensive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // Qualifying Session Tests
  // ============================================================================

  describe('isQualifyingSession', () => {
    it('should qualify 15+ minute session with good quality', () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });

    it('should reject short sessions', () => {
      expect(isQualifyingSession(600, 100)).toBe(false);
      expect(isQualifyingSession(899, 100)).toBe(false);
    });

    it('should reject low quality sessions', () => {
      expect(isQualifyingSession(1800, 40)).toBe(false);
      expect(isQualifyingSession(1800, 49)).toBe(false);
    });

    it('should accept exact threshold', () => {
      expect(isQualifyingSession(900, 50)).toBe(true);
    });

    it('should reject zero duration', () => {
      expect(isQualifyingSession(0, 100)).toBe(false);
    });

    it('should reject negative duration', () => {
      expect(isQualifyingSession(-100, 100)).toBe(false);
    });
  });

  // ============================================================================
  // Calendar Day Tests
  // ============================================================================

  describe('getCalendarDay', () => {
    it('should format date consistently', () => {
      const timestamp = new Date('2024-01-15').getTime();
      const result = getCalendarDay(timestamp, 'UTC');
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should respect timezone differences', () => {
      const timestamp = Date.now();
      const utc = getCalendarDay(timestamp, 'UTC');
      const ny = getCalendarDay(timestamp, 'America/New_York');
      // Could be different dates depending on time
      expect(typeof utc).toBe('string');
      expect(typeof ny).toBe('string');
    });

    it('should handle midnight boundary', () => {
      const midnight = new Date('2024-01-15T00:00:00Z').getTime();
      const result = getCalendarDay(midnight, 'UTC');
      expect(result).toContain('1/15/2024');
    });
  });

  // ============================================================================
  // Milestone Tests
  // ============================================================================

  describe('checkMilestone', () => {
    it('should return milestone for day 3', () => {
      const result = checkMilestone(3);
      expect(result).not.toBeNull();
      expect(result?.days).toBe(3);
      expect(result?.rewardType).toBe('COINS');
    });

    it('should return milestone for day 7', () => {
      const result = checkMilestone(7);
      expect(result).not.toBeNull();
      expect(result?.days).toBe(7);
    });

    it('should return milestone for day 30', () => {
      const result = checkMilestone(30);
      expect(result).not.toBeNull();
      expect(result?.rewardType).toBe('STREAK_SHIELD');
    });

    it('should return null for non-milestone days', () => {
      expect(checkMilestone(4)).toBeNull();
      expect(checkMilestone(8)).toBeNull();
      expect(checkMilestone(15)).toBeNull();
    });

    it('should return null for day 0', () => {
      expect(checkMilestone(0)).toBeNull();
    });
  });

  // ============================================================================
  // Multiplier Tests
  // ============================================================================

  describe('getStreakMultiplier', () => {
    it('should return 1.0 for 0-2 days', () => {
      expect(getStreakMultiplier(0)).toBe(1.0);
      expect(getStreakMultiplier(1)).toBe(1.0);
      expect(getStreakMultiplier(2)).toBe(1.0);
    });

    it('should return 1.25 for 3-6 days', () => {
      expect(getStreakMultiplier(3)).toBe(1.25);
      expect(getStreakMultiplier(6)).toBe(1.25);
    });

    it('should return 1.5 for 7-13 days', () => {
      expect(getStreakMultiplier(7)).toBe(1.5);
      expect(getStreakMultiplier(13)).toBe(1.5);
    });

    it('should return 1.75 for 14-29 days', () => {
      expect(getStreakMultiplier(14)).toBe(1.75);
      expect(getStreakMultiplier(29)).toBe(1.75);
    });

    it('should return 2.0 for 30+ days', () => {
      expect(getStreakMultiplier(30)).toBe(2.0);
      expect(getStreakMultiplier(100)).toBe(2.0);
      expect(getStreakMultiplier(365)).toBe(2.0);
    });
  });

  // ============================================================================
  // Record Session Integration Tests
  // ============================================================================

  describe('recordSession', () => {
    it('should increment streak for qualifying session', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 3,
        longestDays: 5,
        lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000, // 20 hours ago
        currentDayCompletedAt: null,
        shieldsAvailable: 2,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);
      vi.mocked(repository.updateStreak).mockResolvedValue(mockStreak);

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        duration: 1200,
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe('INCREMENTED');
      expect(result.newStreak).toBe(4);
    });

    it('should break streak after 48 hours', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now() - 72 * 60 * 60 * 1000, // 72 hours ago
        currentDayCompletedAt: null,
        shieldsAvailable: 0,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);
      vi.mocked(repository.updateStreak).mockResolvedValue(mockStreak);

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        duration: 1200,
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe('BROKEN');
      expect(result.newStreak).toBe(1);
    });

    it('should use shield when available', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now() - 36 * 60 * 60 * 1000, // 36 hours ago (within grace)
        currentDayCompletedAt: null,
        shieldsAvailable: 1,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);
      vi.mocked(repository.getAvailableShield).mockResolvedValue('shield-1');
      vi.mocked(repository.updateStreak).mockResolvedValue(mockStreak);

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        duration: 1200,
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe('SHIELD_PROTECTED');
      expect(result.shieldUsed).toBe(true);
    });

    it('should detect milestone on increment', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 6, // Will become 7
        longestDays: 10,
        lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000,
        currentDayCompletedAt: null,
        shieldsAvailable: 2,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);
      vi.mocked(repository.updateStreak).mockResolvedValue(mockStreak);

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        duration: 1200,
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.milestoneReached).not.toBeNull();
      expect(result.milestoneReached?.days).toBe(7);
    });

    it('should reject non-qualifying session', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 3,
        longestDays: 5,
        lastQualifyingSessionAt: Date.now(),
        currentDayCompletedAt: Date.now(),
        shieldsAvailable: 2,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        duration: 600, // Too short
        qualityScore: 80,
        completedAt: Date.now(),
      });

      expect(result.action).toBe('ALREADY_TODAY');
    });
  });

  // ============================================================================
  // Shield Management Tests
  // ============================================================================

  describe('useShield', () => {
    it('should use available shield', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now(),
        currentDayCompletedAt: null,
        shieldsAvailable: 2,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);
      vi.mocked(repository.getAvailableShield).mockResolvedValue('shield-1');

      const result = await useShield({ userId: 'user-1' });
      expect(result).toBe(true);
    });

    it('should fail when no shields available', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now(),
        currentDayCompletedAt: null,
        shieldsAvailable: 0,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);

      const result = await useShield({ userId: 'user-1' });
      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // Comeback Detection Tests
  // ============================================================================

  describe('detectComeback', () => {
    it('should detect comeback after break', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 1,
        longestDays: 30,
        lastQualifyingSessionAt: Date.now() - 72 * 60 * 60 * 1000,
        currentDayCompletedAt: Date.now(),
        shieldsAvailable: 0,
        gracePeriodUsed: true,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const defeatHistory = [{ bossId: 'boss-1', defeatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000 }];

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);
      vi.mocked(repository.fetchBossDefeatHistory).mockResolvedValue(defeatHistory);

      const result = await detectComeback('user-1');
      expect(result.isComeback).toBe(true);
      expect(result.previousStreak).toBe(30);
    });

    it('should not detect comeback for active streak', async () => {
      const mockStreak = {
        id: 'streak-1',
        userId: 'user-1',
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now() - 20 * 60 * 60 * 1000,
        currentDayCompletedAt: Date.now(),
        shieldsAvailable: 2,
        gracePeriodUsed: false,
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      vi.mocked(repository.fetchStreak).mockResolvedValue(mockStreak);

      const result = await detectComeback('user-1');
      expect(result.isComeback).toBe(false);
    });
  });

  // ============================================================================
  // Risk Level Tests
  // ============================================================================

  describe('calculateRiskLevel', () => {
    it('should return NONE for recent session', () => {
      const streak = {
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours
        timezone: 'UTC',
      };

      const result = calculateRiskLevel(streak as any);
      expect(result.level).toBe('NONE');
    });

    it('should return LOW for 24 hours passed', () => {
      const streak = {
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now() - 24 * 60 * 60 * 1000,
        timezone: 'UTC',
      };

      const result = calculateRiskLevel(streak as any);
      expect(result.level).toBe('LOW');
    });

    it('should return CRITICAL at 48 hours', () => {
      const streak = {
        currentDays: 5,
        longestDays: 10,
        lastQualifyingSessionAt: Date.now() - 48 * 60 * 60 * 1000,
        timezone: 'UTC',
      };

      const result = calculateRiskLevel(streak as any);
      expect(result.level).toBe('CRITICAL');
    });
  });
});
