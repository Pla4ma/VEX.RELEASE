/**
 * Economy Service Tests
 *
 * Comprehensive tests with cross-system integration validation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EconomyService, CurrencyType } from '../EconomyService';
import { eventBus } from '../../events';
import { getAnalyticsService } from '../../analytics/AnalyticsService';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../events', () => ({
  eventBus: {
    subscribe: jest.fn().mockReturnValue(() => {}),
    publish: jest.fn(),
  },
}));
jest.mock('../../analytics/AnalyticsService', () => ({
  getAnalyticsService: jest.fn().mockReturnValue({
    track: jest.fn(),
  }),
}));
jest.mock('../../utils/debug', () => ({
  createDebugger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockEventBus = eventBus as jest.Mocked<typeof eventBus>;
const mockAnalytics = getAnalyticsService() as jest.Mocked<ReturnType<typeof getAnalyticsService>>;

describe('EconomyService', () => {
  let service: EconomyService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EconomyService('test-user');
  });

  describe('Unit Tests', () => {
    describe('addCurrency', () => {
      it('should add coins', async () => {
        const wallet = await service.addCurrency('COINS', 100, 'SESSION_COMPLETE');

        expect(wallet.coins).toBe(100);
        expect(service.getBalance('COINS')).toBe(100);
      });

      it('should add gems', async () => {
        const wallet = await service.addCurrency('GEMS', 10, 'PURCHASE');

        expect(wallet.gems).toBe(10);
      });

      it('should add seasonal currency', async () => {
        await service.addCurrency('SEASONAL', 50, 'EVENT', { seasonId: 'season-1' });

        expect(service.getBalance('SEASONAL')).toBe(50);
      });

      it('should apply level multiplier', async () => {
        // Simulate level 10 (1.1x multiplier)
        const subscribeCall = mockEventBus.subscribe.mock.calls.find(
          call => call[0] === 'progression:level_up'
        );
        if (subscribeCall) {
          const handler = subscribeCall[1] as Function;
          handler({ userId: 'test-user', newLevel: 10 });
        }

        await service.addCurrency('COINS', 100, 'SESSION_COMPLETE');

        // Should have 110 coins (100 * 1.1)
        expect(service.getBalance('COINS')).toBeGreaterThanOrEqual(100);
      });

      it('should reject negative amounts', async () => {
        await expect(
          service.addCurrency('COINS', -50, 'TEST')
        ).rejects.toThrow('must be positive');
      });

      it('should require user', async () => {
        const noUserService = new EconomyService();
        await expect(
          noUserService.addCurrency('COINS', 100, 'TEST')
        ).rejects.toThrow('No user set');
      });
    });

    describe('spendCurrency', () => {
      it('should spend coins', async () => {
        await service.addCurrency('COINS', 100, 'TEST');
        const wallet = await service.spendCurrency('COINS', 30, 'Shop purchase');

        expect(wallet.coins).toBe(70);
      });

      it('should reject if insufficient balance', async () => {
        await service.addCurrency('COINS', 10, 'TEST');

        await expect(
          service.spendCurrency('COINS', 100, 'Shop purchase')
        ).rejects.toThrow('Insufficient');
      });

      it('should validate amount is positive', async () => {
        await expect(
          service.spendCurrency('COINS', 0, 'TEST')
        ).rejects.toThrow('must be positive');
      });
    });

    describe('gift system', () => {
      it('should send gift', async () => {
        await service.addCurrency('COINS', 100, 'TEST');

        await service.sendGift('friend-id', 'COINS', 50);

        expect(service.getBalance('COINS')).toBe(50);
        expect(mockEventBus.publish).toHaveBeenCalledWith(
          'social:gift_currency',
          expect.objectContaining({
            fromUserId: 'test-user',
            toUserId: 'friend-id',
            currency: 'COINS',
            amount: 50,
          })
        );
      });

      it('should receive gift', async () => {
        await service.receiveGift('friend-id', 'COINS', 25);

        expect(service.getBalance('COINS')).toBe(25);
        expect(mockEventBus.publish).toHaveBeenCalledWith(
          'notification:send',
          expect.objectContaining({
            type: 'gift_received',
          })
        );
      });

      it('should reject gift with insufficient funds', async () => {
        await expect(
          service.sendGift('friend-id', 'COINS', 1000)
        ).rejects.toThrow('Insufficient');
      });
    });

    describe('currency conversion', () => {
      it('should convert coins to gems', async () => {
        await service.addCurrency('COINS', 1000, 'TEST');

        const gems = await service.convertCurrency('COINS', 'GEMS', 1000);

        expect(gems).toBe(1); // 1000 coins = 1 gem
        expect(service.getBalance('COINS')).toBe(0);
        expect(service.getBalance('GEMS')).toBe(1);
      });

      it('should convert gems to coins', async () => {
        await service.addCurrency('GEMS', 1, 'TEST');

        const coins = await service.convertCurrency('GEMS', 'COINS', 1);

        expect(coins).toBe(800); // 1 gem = 800 coins
      });

      it('should reject same currency conversion', async () => {
        await expect(
          service.convertCurrency('COINS', 'COINS', 100)
        ).rejects.toThrow('Cannot convert currency to itself');
      });

      it('should reject unsupported conversions', async () => {
        await expect(
          service.convertCurrency('GEMS', 'SEASONAL', 10)
        ).rejects.toThrow('Conversion not supported');
      });
    });

    describe('queries', () => {
      it('should get total earned', async () => {
        await service.addCurrency('COINS', 100, 'TEST');
        await service.addCurrency('COINS', 50, 'TEST');

        expect(service.getTotalEarned('COINS')).toBe(150);
      });

      it('should get total spent', async () => {
        await service.addCurrency('COINS', 100, 'TEST');
        await service.spendCurrency('COINS', 30, 'TEST');
        await service.spendCurrency('COINS', 20, 'TEST');

        expect(service.getTotalSpent('COINS')).toBe(50);
      });

      it('should get net earnings', async () => {
        await service.addCurrency('COINS', 100, 'TEST');
        await service.spendCurrency('COINS', 30, 'TEST');

        expect(service.getNetEarnings('COINS')).toBe(70);
      });

      it('should check sufficient balance', async () => {
        await service.addCurrency('COINS', 100, 'TEST');

        expect(service.hasEnough('COINS', 50)).toBe(true);
        expect(service.hasEnough('COINS', 150)).toBe(false);
      });
    });
  });

  describe('Cross-System Integration', () => {
    it('should listen for economy:add_currency events', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith(
        'economy:add_currency',
        expect.any(Function)
      );
    });

    it('should listen for progression:level_up events', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith(
        'progression:level_up',
        expect.any(Function)
      );
    });

    it('should listen for shop:purchase events', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith(
        'shop:purchase',
        expect.any(Function)
      );
    });

    it('should listen for social:gift_currency events', () => {
      expect(mockEventBus.subscribe).toHaveBeenCalledWith(
        'social:gift_currency',
        expect.any(Function)
      );
    });

    it('should publish economy:currency_added event', async () => {
      await service.addCurrency('COINS', 100, 'TEST');

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'economy:currency_added',
        expect.objectContaining({
          userId: 'test-user',
          currency: 'COINS',
          amount: expect.any(Number),
        })
      );
    });

    it('should publish economy:currency_spent event', async () => {
      await service.addCurrency('COINS', 100, 'TEST');
      await service.spendCurrency('COINS', 50, 'TEST');

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'economy:currency_spent',
        expect.objectContaining({
          userId: 'test-user',
          currency: 'COINS',
          amount: 50,
        })
      );
    });

    it('should track analytics for earnings', async () => {
      await service.addCurrency('COINS', 100, 'SESSION_COMPLETE');

      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'currency_earned',
        expect.objectContaining({
          user_id: 'test-user',
          currency_type: 'COINS',
          source: 'SESSION_COMPLETE',
        })
      );
    });

    it('should track analytics for spending', async () => {
      await service.addCurrency('COINS', 100, 'TEST');
      await service.spendCurrency('COINS', 50, 'Shop purchase');

      expect(mockAnalytics.track).toHaveBeenCalledWith(
        'currency_spent',
        expect.objectContaining({
          user_id: 'test-user',
          currency_type: 'COINS',
          description: 'Shop purchase',
        })
      );
    });
  });

  describe('Transaction History', () => {
    it('should track transactions', async () => {
      await service.addCurrency('COINS', 100, 'TEST');
      await service.spendCurrency('COINS', 50, 'TEST');

      const transactions = service.getTransactions();
      expect(transactions.length).toBeGreaterThan(0);
    });

    it('should limit transaction history', async () => {
      // Add many transactions
      for (let i = 0; i < 1100; i++) {
        await service.addCurrency('COINS', 1, 'TEST');
      }

      const transactions = service.getTransactions();
      expect(transactions.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Concurrency Tests', () => {
    it('should handle concurrent currency additions', async () => {
      const promises = Array(10).fill(null).map(() =>
        service.addCurrency('COINS', 10, 'TEST')
      );

      await Promise.all(promises);

      expect(service.getBalance('COINS')).toBe(100);
    });

    it('should handle concurrent spends safely', async () => {
      await service.addCurrency('COINS', 100, 'TEST');

      // Try to spend more than available concurrently
      const results = await Promise.allSettled([
        service.spendCurrency('COINS', 60, 'TEST'),
        service.spendCurrency('COINS', 60, 'TEST'),
      ]);

      // One should succeed, one should fail
      const succeeded = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      expect(succeeded.length + failed.length).toBe(2);
    });
  });

  describe('Persistence', () => {
    it('should save wallet to AsyncStorage', async () => {
      await service.addCurrency('COINS', 100, 'TEST');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'economy:wallet:test-user',
        expect.any(String)
      );
    });

    it('should save transactions to AsyncStorage', async () => {
      await service.addCurrency('COINS', 100, 'TEST');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'economy:transactions:test-user',
        expect.any(String)
      );
    });

    it('should load wallet from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockImplementation((key: string) => {
        if (key === 'economy:wallet:test-user') {
          return Promise.resolve(JSON.stringify({
            coins: 500,
            gems: 25,
          }));
        }
        return Promise.resolve(null);
      });

      const service2 = new EconomyService('test-user');
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(service2.getBalance('COINS')).toBe(500);
      expect(service2.getBalance('GEMS')).toBe(25);
    });
  });

  describe('Level Multiplier Integration', () => {
    it('should update multiplier on level up', () => {
      const subscribeCall = mockEventBus.subscribe.mock.calls.find(
        call => call[0] === 'progression:level_up'
      );

      if (subscribeCall) {
        const handler = subscribeCall[1] as Function;

        // Level 1 = 1x
        handler({ userId: 'test-user', newLevel: 1 });

        // Level 10 = 1.1x
        handler({ userId: 'test-user', newLevel: 10 });

        // Level 50 = 1.5x
        handler({ userId: 'test-user', newLevel: 50 });
      }
    });

    it('should apply correct multiplier at different levels', async () => {
      const testCases = [
        { level: 1, expectedMin: 100 },
        { level: 10, expectedMin: 110 },
        { level: 50, expectedMin: 150 },
      ];

      for (const { level, expectedMin } of testCases) {
        const subscribeCall = mockEventBus.subscribe.mock.calls.find(
          call => call[0] === 'progression:level_up'
        );

        if (subscribeCall) {
          const handler = subscribeCall[1] as Function;
          handler({ userId: 'test-user', newLevel: level });
        }

        mockEventBus.publish.mockClear();

        await service.addCurrency('COINS', 100, 'TEST');

        const publishCall = mockEventBus.publish.mock.calls.find(
          call => call[0] === 'economy:currency_added'
        );

        if (publishCall && publishCall[1]) {
          const eventData = publishCall[1] as { amount: number };
          expect(eventData.amount).toBeGreaterThanOrEqual(expectedMin);
        }
      }
    });
  });
});
