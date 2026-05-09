/**
 * Comprehensive Streak System Tests
 * 80%+ coverage requirement for 10/10 product
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getOrCreateStreak, getStreakSummary, recordSession, isQualifyingSession, getCalendarDay, checkMilestone, useShield, freezeStreak, restoreStreak, detectComeback, calculateRiskLevel } from '../service';
import { calculateStreakRisk, checkAndSendRiskNotifications } from '../streak-risk-monitor';
import { createRepairQuest, recordRepairQuestSession, getRepairQuestStatus } from '../streak-repair-quest';
import type { Streak, StreakMilestone } from '../schemas';

// ============================================================================
// Mocks
// ============================================================================

const mockRepository = {
  fetchStreak: jest.fn(),
  createStreak: jest.fn(),
  updateStreak: jest.fn(),
  recordShieldEarned: jest.fn(),
  recordShieldUsed: jest.fn(),
  getAvailableShield: jest.fn(),
  fetchActiveRepairQuest: jest.fn(),
  saveRepairQuest: jest.fn(),
  updateRepairQuest: jest.fn(),
  fetchExpiredRepairQuests: jest.fn(),
  fetchUsersWithActiveStreaks: jest.fn(),
};

jest.mock('../repository', () => mockRepository);

// ============================================================================
// Test Data
// ============================================================================

const mockStreak = (overrides: Partial<Streak> = {}): Streak => ({
  id: 'streak-1',
  userId: 'user-1',
  currentDays: 5,
  longestDays: 10,
  lastQualifyingSessionAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
  currentDayCompletedAt: Date.now() - 12 * 60 * 60 * 1000,
  frozenUntil: null,
  shieldsAvailable: 1,
  gracePeriodUsed: false,
  timezone: 'America/New_York',
  createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  updatedAt: Date.now(),
  ...overrides,
});

// ============================================================================
// Core Streak Logic Tests
// ============================================================================

describe('Streak System - Core Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('24-Hour Window (Critical Fix)', () => {
    it('should BREAK streak after 24 hours without qualifying session', async () => {
      const lastSession = Date.now() - 25 * 60 * 60 * 1000; // 25 hours ago
      const streak = mockStreak({
        currentDays: 5,
        lastQualifyingSessionAt: lastSession,
      });

      mockRepository.fetchStreak.mockResolvedValue(streak);
      mockRepository.updateStreak.mockResolvedValue({
        ...streak,
        currentDays: 0,
      });

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        completedAt: Date.now(),
        duration: 600, // 10 min - qualifying
        qualityScore: 80,
      });

      // CRITICAL: Should be BROKEN, not maintained with shield
      expect(result.action).toBe('BROKEN');
      expect(result.newStreak).toBe(1); // Start new streak
    });

    it('should MAINTAIN streak within 24 hours', async () => {
      const lastSession = Date.now() - 20 * 60 * 60 * 1000; // 20 hours ago
      const streak = mockStreak({
        currentDays: 5,
        lastQualifyingSessionAt: lastSession,
      });

      mockRepository.fetchStreak.mockResolvedValue(streak);
      mockRepository.updateStreak.mockResolvedValue({
        ...streak,
        currentDays: 6,
      });

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        completedAt: Date.now(),
        duration: 600,
        qualityScore: 80,
      });

      expect(result.action).toBe('INCREMENTED');
      expect(result.newStreak).toBe(6);
    });
  });

  describe('Qualifying Session (10 min minimum)', () => {
    it('should NOT qualify sessions under 10 minutes', () => {
      expect(isQualifyingSession(9 * 60, 100)).toBe(false);
      expect(isQualifyingSession(5 * 60, 100)).toBe(false);
    });

    it('should qualify sessions at exactly 10 minutes', () => {
      expect(isQualifyingSession(10 * 60, 80)).toBe(true);
    });

    it('should NOT qualify sessions under quality 50', () => {
      expect(isQualifyingSession(15 * 60, 40)).toBe(false);
    });
  });

  describe('Streak Milestones', () => {
    it('should trigger milestone at day 3', () => {
      const milestone = checkMilestone(3);
      expect(milestone).not.toBeNull();
      expect(milestone?.days).toBe(3);
      expect(milestone?.rewardType).toBe('COINS');
    });

    it('should trigger milestone at day 7', () => {
      const milestone = checkMilestone(7);
      expect(milestone).not.toBeNull();
      expect(milestone?.rewardType).toBe('COINS');
    });

    it('should trigger streak shield at day 30', () => {
      const milestone = checkMilestone(30);
      expect(milestone).not.toBeNull();
      expect(milestone?.rewardType).toBe('STREAK_SHIELD');
    });

    it('should NOT trigger milestone at non-milestone days', () => {
      expect(checkMilestone(4)).toBeNull();
      expect(checkMilestone(8)).toBeNull();
    });
  });

  describe('Shield Mechanics', () => {
    it('should consume shield when used to protect streak', async () => {
      const streak = mockStreak({
        currentDays: 5,
        shieldsAvailable: 1,
        lastQualifyingSessionAt: Date.now() - 26 * 60 * 60 * 1000, // Outside 24h window
      });

      mockRepository.fetchStreak.mockResolvedValue(streak);
      mockRepository.getAvailableShield.mockResolvedValue('shield-1');
      mockRepository.updateStreak.mockResolvedValue({
        ...streak,
        currentDays: 6,
        shieldsAvailable: 0,
        gracePeriodUsed: true,
      });

      const result = await recordSession({
        userId: 'user-1',
        sessionId: 'session-1',
        completedAt: Date.now(),
        duration: 600,
        qualityScore: 80,
      });

      expect(result.action).toBe('SHIELD_PROTECTED');
      expect(result.shieldUsed).toBe(true);
    });

    it('should fail to use shield when none available', async () => {
      mockRepository.fetchStreak.mockResolvedValue(mockStreak({ shieldsAvailable: 0 }));

      const result = await useShield({ userId: 'user-1', reason: 'MANUAL' });
      expect(result).toBe(false);
    });
  });
});

// ============================================================================
// Risk Monitor Tests
// ============================================================================

describe('Streak Risk Monitor', () => {
  it('should calculate CRITICAL risk when < 1 hour remaining', () => {
    const streak = mockStreak({
      lastQualifyingSessionAt: Date.now() - 23.5 * 60 * 60 * 1000,
      currentDays: 5,
    });

    const risk = calculateStreakRisk(streak);

    expect(risk.riskLevel).toBe('CRITICAL');
    expect(risk.isAtRisk).toBe(true);
    expect(risk.hoursRemaining).toBeLessThan(1);
    expect(risk.flameHealthPercent).toBeLessThan(5);
  });

  it('should calculate HIGH risk when 2-4 hours remaining', () => {
    const streak = mockStreak({
      lastQualifyingSessionAt: Date.now() - 22 * 60 * 60 * 1000,
      currentDays: 5,
    });

    const risk = calculateStreakRisk(streak);

    expect(risk.riskLevel).toBe('HIGH');
    expect(risk.hoursRemaining).toBeGreaterThan(0);
    expect(risk.hoursRemaining).toBeLessThanOrEqual(4);
  });

  it('should show 100% flame health at start of day', () => {
    const streak = mockStreak({
      lastQualifyingSessionAt: Date.now(),
      currentDays: 5,
    });

    const risk = calculateStreakRisk(streak);

    expect(risk.flameHealthPercent).toBe(100);
    expect(risk.riskLevel).toBe('NONE');
  });
});

// ============================================================================
// Repair Quest Tests
// ============================================================================

describe('Streak Repair Quests', () => {
  it('should create repair quest when streak breaks with 3+ days', async () => {
    mockRepository.fetchActiveRepairQuest.mockResolvedValue(null);
    mockRepository.saveRepairQuest.mockResolvedValue(undefined);

    const quest = await createRepairQuest('user-1', 10);

    expect(quest).not.toBeNull();
    expect(quest?.previousStreak).toBe(10);
    expect(quest?.targetRestoreDays).toBe(8); // 80% of 10
    expect(quest?.sessionsRequired).toBe(3);
  });

  it('should NOT create repair quest for short streaks', async () => {
    const quest = await createRepairQuest('user-1', 2);
    expect(quest).toBeNull();
  });

  it('should complete quest after 3 qualifying sessions', async () => {
    const quest = {
      id: 'quest-1',
      userId: 'user-1',
      previousStreak: 10,
      targetRestoreDays: 8,
      sessionsCompleted: 2,
      sessionsRequired: 3,
      startedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      status: 'ACTIVE',
      sessionIds: ['session-1', 'session-2'],
    };

    mockRepository.fetchActiveRepairQuest.mockResolvedValue(quest);
    mockRepository.updateRepairQuest.mockResolvedValue(undefined);

    const result = await recordRepairQuestSession(
      'user-1',
      'session-3',
      15 * 60, // 15 min
      80,
    );

    expect(result.questCompleted).toBe(true);
    expect(result.streakRestored).toBe(true);
    expect(result.restoredToDays).toBe(8);
  });
});

// ============================================================================
// Calendar Day Tests
// ============================================================================

describe('Calendar Day Calculations', () => {
  it('should identify same calendar day', () => {
    const now = Date.now();
    const sameDay = getCalendarDay(now, 'America/New_York');
    const laterSameDay = getCalendarDay(now + 4 * 60 * 60 * 1000, 'America/New_York'); // 4 hours later

    expect(sameDay).toBe(laterSameDay);
  });

  it('should identify different calendar days', () => {
    const day1 = getCalendarDay(Date.now(), 'America/New_York');
    const day2 = getCalendarDay(Date.now() + 25 * 60 * 60 * 1000, 'America/New_York'); // 25 hours later

    expect(day1).not.toBe(day2);
  });
});

// ============================================================================
// Comeback Detection Tests
// ============================================================================

describe('Comeback Detection', () => {
  it('should detect comeback after 3+ days absence', async () => {
    mockRepository.fetchStreak.mockResolvedValue(
      mockStreak({
        lastQualifyingSessionAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        currentDays: 0,
      }),
    );

    const comeback = await detectComeback('user-1');

    expect(comeback.isComeback).toBe(true);
    expect(comeback.daysAbsent).toBeGreaterThanOrEqual(3);
    expect(comeback.rewardMultiplier).toBeGreaterThan(1);
  });

  it('should give 2x multiplier for 7+ day absence', async () => {
    mockRepository.fetchStreak.mockResolvedValue(
      mockStreak({
        lastQualifyingSessionAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
        currentDays: 0,
      }),
    );

    const comeback = await detectComeback('user-1');

    expect(comeback.rewardMultiplier).toBeGreaterThanOrEqual(2);
  });
});
