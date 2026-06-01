/**
 * Integration tests — progression-rewards.ts
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  mockRewards,
  fireEvent,
} from './integration-setup';
import { initializeProgressionRewardsIntegration } from '../progression-rewards';

describe('integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe('progression-rewards.ts', () => {
    it('subscribes to progression:level_up and progression:xp_added', () => {
      const unsub = initializeProgressionRewardsIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'progression:level_up',
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'progression:xp_added',
        expect.any(Function),
      );
      unsub();
    });

    it('creates reward on level up event with rewards', () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent('progression:level_up', {
        userId: 'u1',
        newLevel: 5,
        rewards: ['COINS'],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({
              userId: 'u1',
              type: 'XP',
              amount: 250,
              triggerType: 'LEVEL_UP',
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('does NOT create reward when rewards array is empty', () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent('progression:level_up', {
        userId: 'u1',
        newLevel: 3,
        rewards: [],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it('does NOT create reward when rewards is missing', () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent('progression:level_up', { userId: 'u1', newLevel: 3 });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).not.toHaveBeenCalled();
          unsub();
          resolve();
        }, 10);
      });
    });

    it('applies 2x multiplier for XP_BOOST reward type', () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent('progression:level_up', {
        userId: 'u1',
        newLevel: 4,
        rewards: ['XP_BOOST'],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 400 }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('applies base reward for GEMS type', () => {
      const unsub = initializeProgressionRewardsIntegration();
      fireEvent('progression:level_up', {
        userId: 'u1',
        newLevel: 3,
        rewards: ['GEMS'],
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockRewards.createReward).toHaveBeenCalledWith(
            expect.objectContaining({ amount: 150 }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('unsubscribes cleanly', () => {
      const unsub = initializeProgressionRewardsIntegration();
      const countBefore = mockActiveSubscribers.length;
      unsub();
      expect(mockActiveSubscribers.length).toBeLessThan(countBefore);
    });
  });
});
