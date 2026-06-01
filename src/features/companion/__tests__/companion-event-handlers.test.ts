/**
 * Companion Feature — Event Handler Tests
 */

jest.mock('../../../events/EventBus', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  },
}));

jest.mock('../../../shared/analytics/analytics-service', () => ({
  capture: jest.fn(),
}));

import {
  handleBossDefeated,
  handleSessionCompleted,
  handleStreakMilestone,
  handleStreakBroken,
  handleUserReturned,
  handleLevelUp,
} from '../companion-event-handlers';

describe('companion-event-handlers', () => {
  const mockTrigger = jest.fn();

  beforeEach(() => {
    mockTrigger.mockClear();
  });

  describe('handleBossDefeated', () => {
    it('triggers BOSS_DEFEATED with boss name dialogue', () => {
      handleBossDefeated(mockTrigger, { bossName: 'Dark Lord', userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('BOSS_DEFEATED', 'u1', expect.arrayContaining(['Dark Lord is down!']));
    });

    it('triggers BOSS_DEFEATED without custom dialogue when no boss name', () => {
      handleBossDefeated(mockTrigger, { userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('BOSS_DEFEATED', 'u1', undefined);
    });
  });

  describe('handleSessionCompleted', () => {
    it('triggers S_GRADE_SESSION for grade S', () => {
      handleSessionCompleted(mockTrigger, { grade: 'S', userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('S_GRADE_SESSION', 'u1');
    });

    it('triggers PERFECT_SESSION for purity >= 95', () => {
      handleSessionCompleted(mockTrigger, { purity: 96, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('PERFECT_SESSION', 'u1');
    });

    it('does not trigger for non-S grade and low purity', () => {
      handleSessionCompleted(mockTrigger, { grade: 'B', purity: 70, userId: 'u1' });
      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe('handleStreakMilestone', () => {
    it('triggers for 7-day streak', () => {
      handleStreakMilestone(mockTrigger, { days: 7, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('STREAK_MILESTONE', 'u1', expect.arrayContaining([expect.stringContaining('week')]));
    });

    it('triggers for 14-day streak', () => {
      handleStreakMilestone(mockTrigger, { days: 14, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('STREAK_MILESTONE', 'u1', expect.arrayContaining([expect.stringContaining('14 days')]));
    });

    it('triggers for 30-day streak', () => {
      handleStreakMilestone(mockTrigger, { days: 30, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('STREAK_MILESTONE', 'u1', expect.arrayContaining([expect.stringContaining('30-day')]));
    });

    it('does not trigger for non-milestone days', () => {
      handleStreakMilestone(mockTrigger, { days: 5, userId: 'u1' });
      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe('handleStreakBroken', () => {
    it('provides custom dialogue for long streaks', () => {
      handleStreakBroken(mockTrigger, { previousStreak: 10, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('STREAK_BROKEN', 'u1', expect.arrayContaining([expect.stringContaining('10-day')]));
    });

    it('uses default dialogue for short streaks', () => {
      handleStreakBroken(mockTrigger, { previousStreak: 3, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('STREAK_BROKEN', 'u1', undefined);
    });
  });

  describe('handleUserReturned', () => {
    it('triggers COMEBACK for 3+ days absent', () => {
      handleUserReturned(mockTrigger, { daysAbsent: 3, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('COMEBACK', 'u1', expect.arrayContaining([expect.stringContaining('came back')]));
    });

    it('uses different dialogue for 7+ days absent', () => {
      handleUserReturned(mockTrigger, { daysAbsent: 10, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('COMEBACK', 'u1', expect.arrayContaining([expect.stringContaining('Been a while')]));
    });

    it('does not trigger for less than 3 days', () => {
      handleUserReturned(mockTrigger, { daysAbsent: 1, userId: 'u1' });
      expect(mockTrigger).not.toHaveBeenCalled();
    });
  });

  describe('handleLevelUp', () => {
    it('triggers LEVEL_UP with level dialogue', () => {
      handleLevelUp(mockTrigger, { newLevel: 5, userId: 'u1' });
      expect(mockTrigger).toHaveBeenCalledWith('LEVEL_UP', 'u1', expect.arrayContaining([expect.stringContaining('Level 5')]));
    });
  });
});
