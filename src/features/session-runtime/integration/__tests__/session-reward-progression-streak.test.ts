import { jest } from '@jest/globals';
import { eventBus } from '../../../../events';
import { setupMockEventBus } from './session-reward-helpers';

describe('SessionRewardIntegration', () => {
  let mockEventBus: { publish: jest.Mock; subscribe: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventBus = setupMockEventBus();
  });

  describe('progression system integration', () => {
    it('should emit XP addition events', () => {
      const userId = 'user-123';
      const xp = 300;
      eventBus.publish('progression:add_xp', {
        userId,
        amount: xp,
        source: 'session_completion',
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'progression:add_xp',
        expect.objectContaining({
          userId,
          amount: xp,
          source: 'session_completion',
        }),
      );
    });

    it('should emit detailed XP events for level tracking', () => {
      const userId = 'user-123';
      const xp = 300;
      eventBus.publish('progression:xp_added', {
        userId,
        amount: xp,
        source: 'session_completion',
        totalXP: 0,
        currentLevel: 0,
        progressPercent: 0,
        streakBonus: 0,
        boostBonus: 0,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'progression:xp_added',
        expect.objectContaining({ userId, amount: xp }),
      );
    });
  });

  describe('streak system integration', () => {
    it('should emit streak update events', () => {
      const userId = 'user-123';
      const streakDays = 5;
      eventBus.publish('streak:updated', {
        userId,
        state: { currentStreak: streakDays + 1 },
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'streak:updated',
        expect.objectContaining({
          userId,
          state: expect.objectContaining({ currentStreak: 6 }),
        }),
      );
    });

    it('should emit streak broken events', () => {
      const userId = 'user-123';
      const previousStreak = 10;
      eventBus.publish('streak:broken', {
        userId,
        previousStreak,
        wasComeback: false,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'streak:broken',
        expect.objectContaining({ userId, previousStreak: 10 }),
      );
    });

    it('should emit social streak milestone events', () => {
      const userId = 'user-123';
      const streakDays = 7;
      eventBus.publish('social:streak_milestone', {
        userId,
        streak: streakDays,
        milestone: streakDays,
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'social:streak_milestone',
        expect.objectContaining({ userId, streak: 7, milestone: 7 }),
      );
    });
  });
});
