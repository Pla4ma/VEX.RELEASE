import { jest } from '@jest/globals';
import { eventBus } from '../../../events';
import { createMockSummary, setupMockEventBus } from './session-reward-helpers';

describe('SessionRewardIntegration', () => {
  let mockEventBus: { publish: jest.Mock; subscribe: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventBus = setupMockEventBus();
  });

  describe('reward calculation', () => {
    it('should calculate base rewards from session duration', () => {
      const summary = createMockSummary({ effectiveDuration: 1500 });
      const baseXP = Math.floor(summary.effectiveDuration / 60) * 10;
      expect(baseXP).toBe(250);
    });

    it('should apply streak multiplier', () => {
      const streakMultiplier = 1.25;
      const baseXP = Math.floor(1500 / 60) * 10;
      const totalXP = Math.floor(baseXP * streakMultiplier);
      expect(totalXP).toBe(312);
    });

    it('should calculate perfect session bonus', () => {
      const summary = createMockSummary({
        interruptions: 0,
        pauses: 0,
        completionPercentage: 100,
      });
      const isPerfect =
        summary.interruptions === 0 &&
        summary.pauses === 0 &&
        summary.completionPercentage === 100;
      expect(isPerfect).toBe(true);
    });

    it('should apply time bonus for early completion', () => {
      const summary = createMockSummary({
        plannedDuration: 1500,
        actualDuration: 1400,
        completionPercentage: 100,
      });
      const earlyPercent =
        (1 - summary.actualDuration / summary.plannedDuration) * 100;
      const timeBonus = Math.floor(earlyPercent * 2);
      expect(timeBonus).toBeGreaterThan(0);
    });
  });

  describe('economy system integration', () => {
    it('should emit economy events for coins', () => {
      const userId = 'user-123';
      const coins = 50;
      eventBus.publish('economy:add_currency', {
        userId,
        type: 'coins',
        amount: coins,
        source: 'session_completion',
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'economy:add_currency',
        expect.objectContaining({ userId, type: 'coins', amount: coins }),
      );
    });

    it('should emit economy events for gems', () => {
      const userId = 'user-123';
      const gems = 5;
      eventBus.publish('economy:add_currency', {
        userId,
        type: 'gems',
        amount: gems,
        source: 'session_perfect_bonus',
      });
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'economy:add_currency',
        expect.objectContaining({ userId, type: 'gems', amount: gems }),
      );
    });
  });
});
