/**
 * Integration tests — economy-feed.ts
 */

import {
  mockActiveSubscribers,
  mockEventBus,
  fireEvent,
} from './integration-setup';
import { initializeEconomyFeedIntegration } from '../economy-feed';

describe('integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActiveSubscribers.length = 0;
  });

  describe('economy-feed.ts', () => {
    it('subscribes to economy:transaction, economy:purchase, events:reward_earned', () => {
      const unsub = initializeEconomyFeedIntegration();
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'economy:transaction',
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'economy:purchase',
        expect.any(Function),
      );
      expect(mockEventBus.eventBus.subscribe).toHaveBeenCalledWith(
        'events:reward_earned',
        expect.any(Function),
      );
      unsub();
    });

    it('ignores economy:transaction with null event', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:transaction', null);
      expect(mockEventBus.eventBus.publish).not.toHaveBeenCalled();
      unsub();
    });

    it('ignores economy:transaction with empty userId', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:transaction', {
        userId: '',
        currency: 'COINS',
        type: 'earn',
        amount: 10,
        source: 'test',
      });
      expect(mockEventBus.eventBus.publish).not.toHaveBeenCalled();
      unsub();
    });

    it('publishes challenge progress on positive transaction', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:transaction', {
        userId: 'u1',
        currency: 'COINS',
        type: 'earn',
        amount: 50,
        source: 'session',
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            'seasons:challenge_progress',
            expect.objectContaining({
              userId: 'u1',
              challengeId: 'currency_earned',
              progress: 50,
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('publishes social activity for large transactions (>= 1000)', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:transaction', {
        userId: 'u1',
        currency: 'COINS',
        type: 'earn',
        amount: 1500,
        source: 'bonus',
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            'social:activity',
            expect.objectContaining({
              userId: 'u1',
              activityType: 'BIG_EARN',
              visibility: 'FRIENDS',
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('publishes BIG_SPEND for large negative transactions', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:transaction', {
        userId: 'u1',
        currency: 'COINS',
        type: 'spend',
        amount: -2000,
        source: 'shop',
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            'social:activity',
            expect.objectContaining({
              userId: 'u1',
              activityType: 'BIG_SPEND',
            }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('publishes progression:add_xp for positive XP transaction', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:transaction', {
        userId: 'u1',
        currency: 'XP',
        type: 'earn',
        amount: 25,
        source: 'session',
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(mockEventBus.eventBus.publish).toHaveBeenCalledWith(
            'progression:add_xp',
            expect.objectContaining({ userId: 'u1', amount: 25 }),
          );
          unsub();
          resolve();
        }, 10);
      });
    });

    it('does NOT publish progression:add_xp for non-XP currency', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:transaction', {
        userId: 'u1',
        currency: 'COINS',
        type: 'earn',
        amount: 25,
        source: 'session',
      });
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const xpCalls = mockEventBus.eventBus.publish.mock.calls.filter(
            (c: unknown[]) => c[0] === 'progression:add_xp',
          );
          expect(xpCalls).toHaveLength(0);
          unsub();
          resolve();
        }, 10);
      });
    });

    it('ignores economy:purchase with null or missing userId', () => {
      const unsub = initializeEconomyFeedIntegration();
      fireEvent('economy:purchase', null);
      expect(mockEventBus.eventBus.publish).not.toHaveBeenCalled();
      unsub();
    });
  });
});
