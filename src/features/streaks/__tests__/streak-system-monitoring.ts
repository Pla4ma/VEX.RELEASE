import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  getCalendarDay,
  detectComeback,
} from '../service';
import { calculateStreakRisk } from '../streak-risk-monitor';
import {
  createRepairQuest,
  recordRepairQuestSession,
} from '../streak-repair-quest';
import { mockRepository, mockStreak } from '../streak-system-helpers';

describe('Streak Risk Monitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

describe('Streak Repair Quests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create repair quest when streak breaks with 3+ days', async () => {
    mockRepository.fetchActiveRepairQuest.mockResolvedValue(null);
    mockRepository.saveRepairQuest.mockResolvedValue(undefined);
    const quest = await createRepairQuest('user-1', 10);
    expect(quest).not.toBeNull();
    expect(quest?.previousStreak).toBe(10);
    expect(quest?.targetRestoreDays).toBe(8);
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
      15 * 60,
      80,
    );
    expect(result.questCompleted).toBe(true);
    expect(result.streakRestored).toBe(true);
    expect(result.restoredToDays).toBe(8);
  });
});

describe('Calendar Day Calculations', () => {
  it('should identify same calendar day', () => {
    const now = Date.now();
    const sameDay = getCalendarDay(now, 'America/New_York');
    const laterSameDay = getCalendarDay(
      now + 4 * 60 * 60 * 1000,
      'America/New_York',
    );
    expect(sameDay).toBe(laterSameDay);
  });

  it('should identify different calendar days', () => {
    const day1 = getCalendarDay(Date.now(), 'America/New_York');
    const day2 = getCalendarDay(
      Date.now() + 25 * 60 * 60 * 1000,
      'America/New_York',
    );
    expect(day1).not.toBe(day2);
  });
});

describe('Comeback Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
