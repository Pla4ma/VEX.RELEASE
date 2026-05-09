/**
 * Shop Economy Tests
 *
 * Phase 4.2 - Shop & Economy Polish
 * Tests for dual currency system (Coins/Gems)
 */

import { COIN_EARN_RATES, GEM_EARN_RATES, GEM_TO_COIN_RATE, getWallet, earnCoins, earnGems, spendCoins, spendGems, convertGemsToCoins, getTransactionHistory, calculateSessionCoins, calculateBossDamageCoins, calculateStreakMilestoneCoins, awardPremiumMonthlyGems, getEconomyAnalytics, checkEconomyBalance, type CurrencyType } from '../ShopEconomy';

// Mock eventBus
jest.mock('../../../events', () => ({
  eventBus: {
    publish: jest.fn(),
    subscribe: jest.fn(),
  },
}));

describe('ShopEconomy', () => {
  const userId = 'test-user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset wallet
    const wallet = getWallet(userId);
    wallet.coins = 0;
    wallet.gems = 0;
    wallet.lifetimeCoins = 0;
    wallet.lifetimeGems = 0;
  });

  describe('COIN_EARN_RATES', () => {
    it('should have base session rewards', () => {
      expect(COIN_EARN_RATES.SESSION_BASE).toBe(10);
      expect(COIN_EARN_RATES.SESSION_MINUTE).toBe(1);
    });

    it('should have quality bonuses', () => {
      expect(COIN_EARN_RATES.QUALITY_BONUS_S).toBe(50);
      expect(COIN_EARN_RATES.QUALITY_BONUS_A).toBe(30);
      expect(COIN_EARN_RATES.QUALITY_BONUS_B).toBe(15);
    });

    it('should have boss rewards', () => {
      expect(COIN_EARN_RATES.BOSS_DAMAGE).toBe(2);
      expect(COIN_EARN_RATES.BOSS_DEFEAT_BONUS).toBe(100);
    });

    it('should have streak milestone rewards', () => {
      expect(COIN_EARN_RATES.STREAK_MILESTONE_3).toBe(50);
      expect(COIN_EARN_RATES.STREAK_MILESTONE_7).toBe(150);
      expect(COIN_EARN_RATES.STREAK_MILESTONE_30).toBe(1000);
      expect(COIN_EARN_RATES.STREAK_MILESTONE_100).toBe(5000);
    });
  });

  describe('GEM_EARN_RATES', () => {
    it('should have monthly premium gems', () => {
      expect(GEM_EARN_RATES.PREMIUM_MONTHLY).toBe(100);
    });

    it('should have limited gem earning opportunities', () => {
      // Gems should be scarce
      expect(Object.keys(GEM_EARN_RATES).length).toBeLessThan(10);
    });
  });

  describe('GEM_TO_COIN_RATE', () => {
    it('should be 100:1 (gems to coins)', () => {
      expect(GEM_TO_COIN_RATE).toBe(100);
    });
  });

  describe('getWallet', () => {
    it('should create new wallet for new user', () => {
      const wallet = getWallet('new-user');

      expect(wallet.userId).toBe('new-user');
      expect(wallet.coins).toBe(0);
      expect(wallet.gems).toBe(0);
      expect(wallet.lifetimeCoins).toBe(0);
      expect(wallet.lifetimeGems).toBe(0);
    });

    it('should return existing wallet for known user', () => {
      // First call creates
      const wallet1 = getWallet(userId);
      wallet1.coins = 100;

      // Second call returns same wallet
      const wallet2 = getWallet(userId);
      expect(wallet2.coins).toBe(100);
    });
  });

  describe('earnCoins', () => {
    it('should add coins to wallet', () => {
      const wallet = earnCoins(userId, 50, 'SESSION_COMPLETE', 'Test session');

      expect(wallet.coins).toBe(50);
      expect(wallet.lifetimeCoins).toBe(50);
    });

    it('should accumulate coins', () => {
      earnCoins(userId, 50, 'SESSION_COMPLETE', 'First');
      const wallet = earnCoins(userId, 30, 'BOSS_DAMAGE', 'Second');

      expect(wallet.coins).toBe(80);
      expect(wallet.lifetimeCoins).toBe(80);
    });

    it('should publish currency:earned event', () => {
      const { eventBus } = require('../../../events');

      earnCoins(userId, 50, 'SESSION_COMPLETE', 'Test');

      expect(eventBus.publish).toHaveBeenCalledWith(
        'currency:earned',
        expect.objectContaining({
          userId,
          currency: 'COINS',
          amount: 50,
          newBalance: 50,
        }),
      );
    });

    it('should record transaction', () => {
      earnCoins(userId, 50, 'SESSION_COMPLETE', 'Test session');

      const transactions = getTransactionHistory(userId);
      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions[0].type).toBe('EARN');
      expect(transactions[0].currency).toBe('COINS');
    });
  });

  describe('earnGems', () => {
    it('should add gems to wallet', () => {
      const wallet = earnGems(userId, 10, 'ACHIEVEMENT_EPIC', 'Epic achievement');

      expect(wallet.gems).toBe(10);
      expect(wallet.lifetimeGems).toBe(10);
    });

    it('should publish currency:earned event', () => {
      const { eventBus } = require('../../../events');

      earnGems(userId, 10, 'ACHIEVEMENT_EPIC', 'Test');

      expect(eventBus.publish).toHaveBeenCalledWith(
        'currency:earned',
        expect.objectContaining({
          currency: 'GEMS',
        }),
      );
    });
  });

  describe('spendCoins', () => {
    beforeEach(() => {
      earnCoins(userId, 1000, 'SESSION_COMPLETE', 'Initial');
    });

    it('should deduct coins when sufficient balance', () => {
      const result = spendCoins(userId, 500, 'SHOP_PURCHASE', 'Buy item');

      expect(result.success).toBe(true);
      expect(result.wallet.coins).toBe(500);
    });

    it('should fail when insufficient balance', () => {
      const result = spendCoins(userId, 2000, 'SHOP_PURCHASE', 'Expensive item');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient coins');
      expect(result.wallet.coins).toBe(1000); // Unchanged
    });

    it('should publish currency:spent event on success', () => {
      const { eventBus } = require('../../../events');

      spendCoins(userId, 500, 'SHOP_PURCHASE', 'Buy item');

      expect(eventBus.publish).toHaveBeenCalledWith(
        'currency:spent',
        expect.objectContaining({
          currency: 'COINS',
          amount: 500,
          newBalance: 500,
        }),
      );
    });

    it('should record transaction', () => {
      spendCoins(userId, 500, 'SHOP_PURCHASE', 'Buy item');

      const transactions = getTransactionHistory(userId, 'COINS');
      const spendTx = transactions.find((t) => t.type === 'SPEND');
      expect(spendTx).toBeDefined();
      expect(spendTx?.amount).toBe(-500);
    });
  });

  describe('spendGems', () => {
    beforeEach(() => {
      earnGems(userId, 100, 'PREMIUM_MONTHLY', 'Monthly');
    });

    it('should deduct gems when sufficient balance', () => {
      const result = spendGems(userId, 25, 'BOSS_BOUNTY_PLACE', 'Place bounty');

      expect(result.success).toBe(true);
      expect(result.wallet.gems).toBe(75);
    });

    it('should fail when insufficient balance', () => {
      const result = spendGems(userId, 200, 'COSMETIC_UNLOCK', 'Expensive cosmetic');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient gems');
    });
  });

  describe('convertGemsToCoins', () => {
    beforeEach(() => {
      earnGems(userId, 10, 'PREMIUM_MONTHLY', 'Monthly');
    });

    it('should convert gems to coins at correct rate', () => {
      const result = convertGemsToCoins(userId, 5);

      expect(result.success).toBe(true);
      expect(result.wallet.gems).toBe(5); // 10 - 5
      expect(result.wallet.coins).toBe(500); // 5 * 100
    });

    it('should fail when insufficient gems', () => {
      const result = convertGemsToCoins(userId, 20);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient gems');
    });

    it('should record both transactions', () => {
      convertGemsToCoins(userId, 5);

      const transactions = getTransactionHistory(userId);
      const conversions = transactions.filter((t) => t.type === 'CONVERT');
      expect(conversions.length).toBe(2); // One for gems, one for coins
    });
  });

  describe('getTransactionHistory', () => {
    beforeEach(() => {
      earnCoins(userId, 100, 'SESSION_COMPLETE', 'Earn');
      spendCoins(userId, 50, 'SHOP_PURCHASE', 'Spend');
      earnGems(userId, 10, 'PREMIUM_MONTHLY', 'Gems');
    });

    it('should return all transactions when no filter', () => {
      const transactions = getTransactionHistory(userId);
      expect(transactions.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter by currency', () => {
      const coinTransactions = getTransactionHistory(userId, 'COINS');
      expect(coinTransactions.every((t) => t.currency === 'COINS')).toBe(true);
    });

    it('should respect limit', () => {
      const transactions = getTransactionHistory(userId, undefined, 2);
      expect(transactions.length).toBe(2);
    });

    it('should be sorted by date descending', () => {
      const transactions = getTransactionHistory(userId);
      for (let i = 1; i < transactions.length; i++) {
        expect(transactions[i - 1].createdAt).toBeGreaterThanOrEqual(transactions[i].createdAt);
      }
    });
  });

  describe('calculateSessionCoins', () => {
    it('should calculate base coins correctly', () => {
      const coins = calculateSessionCoins(15, 'C', 1);
      // Base 10 + 15 minutes * 1 = 25
      expect(coins).toBe(25);
    });

    it('should add quality bonus for S rank', () => {
      const coins = calculateSessionCoins(15, 'S', 1);
      // Base 25 + 50 = 75
      expect(coins).toBe(75);
    });

    it('should add quality bonus for A rank', () => {
      const coins = calculateSessionCoins(15, 'A', 1);
      // Base 25 + 30 = 55
      expect(coins).toBe(55);
    });

    it('should add quality bonus for B rank', () => {
      const coins = calculateSessionCoins(15, 'B', 1);
      // Base 25 + 15 = 40
      expect(coins).toBe(40);
    });

    it('should apply streak multiplier', () => {
      const baseCoins = calculateSessionCoins(15, 'C', 1);
      const doubledCoins = calculateSessionCoins(15, 'C', 2);

      expect(doubledCoins).toBe(baseCoins * 2);
    });
  });

  describe('calculateBossDamageCoins', () => {
    it('should calculate base damage coins', () => {
      const coins = calculateBossDamageCoins(10);
      // 10 damage * 2 = 20
      expect(coins).toBe(20);
    });

    it('should add critical bonus for critical hits', () => {
      const coins = calculateBossDamageCoins(10, true);
      // 20 + 10 = 30
      expect(coins).toBe(30);
    });
  });

  describe('calculateStreakMilestoneCoins', () => {
    it('should return correct coins for 3-day milestone', () => {
      const result = calculateStreakMilestoneCoins(3);
      expect(result.coins).toBe(50);
      expect(result.gems).toBe(0);
    });

    it('should return correct coins for 7-day milestone', () => {
      const result = calculateStreakMilestoneCoins(7);
      expect(result.coins).toBe(150);
      expect(result.gems).toBe(0);
    });

    it('should return gems for 30-day milestone', () => {
      const result = calculateStreakMilestoneCoins(30);
      expect(result.coins).toBe(1000);
      expect(result.gems).toBe(25);
    });

    it('should return gems for 100-day milestone', () => {
      const result = calculateStreakMilestoneCoins(100);
      expect(result.coins).toBe(5000);
      expect(result.gems).toBe(100);
    });

    it('should return zero for non-milestone days', () => {
      const result = calculateStreakMilestoneCoins(5);
      expect(result.coins).toBe(0);
      expect(result.gems).toBe(0);
    });
  });

  describe('awardPremiumMonthlyGems', () => {
    it('should add monthly gems to wallet', () => {
      const wallet = awardPremiumMonthlyGems(userId);

      expect(wallet.gems).toBe(100);
    });

    it('should record transaction', () => {
      awardPremiumMonthlyGems(userId);

      const transactions = getTransactionHistory(userId, 'GEMS');
      const monthlyTx = transactions.find((t) => t.source === 'PREMIUM_BONUS');
      expect(monthlyTx).toBeDefined();
      expect(monthlyTx?.amount).toBe(100);
    });
  });

  describe('getEconomyAnalytics', () => {
    beforeEach(() => {
      earnCoins(userId, 1000, 'SESSION_COMPLETE', 'Earn 1');
      earnCoins(userId, 500, 'BOSS_DAMAGE', 'Earn 2');
      spendCoins(userId, 300, 'SHOP_PURCHASE', 'Spend 1');
      earnGems(userId, 100, 'PREMIUM_MONTHLY', 'Gems');
    });

    it('should calculate total earned', () => {
      const analytics = getEconomyAnalytics(userId);

      expect(analytics.totalCoinsEarned).toBe(1500);
      expect(analytics.totalGemsEarned).toBe(100);
    });

    it('should calculate total spent', () => {
      const analytics = getEconomyAnalytics(userId);

      expect(analytics.totalCoinsSpent).toBe(300);
    });

    it('should calculate net worth', () => {
      const analytics = getEconomyAnalytics(userId);
      // 1500 - 300 = 1200 coins
      // 100 gems * 100 = 10000 coin equivalent
      // Net worth = 11200
      expect(analytics.netWorth).toBe(11200);
    });

    it('should calculate spending categories', () => {
      const analytics = getEconomyAnalytics(userId);

      expect(Object.keys(analytics.spendingCategories)).toContain('SHOP_PURCHASE');
      expect(analytics.spendingCategories.SHOP_PURCHASE).toBe(300);
    });
  });

  describe('checkEconomyBalance', () => {
    it('should identify inflation when spend ratio too low', () => {
      // User earning a lot but not spending
      earnCoins(userId, 10000, 'SESSION_COMPLETE', 'Big earn');
      spendCoins(userId, 100, 'SHOP_PURCHASE', 'Small spend');

      const balance = checkEconomyBalance(userId);

      expect(balance.isBalanced).toBe(false);
      expect(balance.issues.some((i) => i.includes('inflation'))).toBe(true);
    });

    it('should identify deflation when spend ratio too high', () => {
      // User spending almost everything
      earnCoins(userId, 1000, 'SESSION_COMPLETE', 'Earn');
      spendCoins(userId, 950, 'SHOP_PURCHASE', 'Big spend');

      const balance = checkEconomyBalance(userId);

      expect(balance.isBalanced).toBe(false);
      expect(balance.issues.some((i) => i.includes('deflation'))).toBe(true);
    });

    it('should identify gem accumulation', () => {
      earnGems(userId, 100, 'PREMIUM_MONTHLY', 'Monthly');
      earnGems(userId, 50, 'ACHIEVEMENT_LEGENDARY', 'Achievement');
      // Don't spend any gems

      const balance = checkEconomyBalance(userId);

      expect(balance.issues.some((i) => i.includes('gem'))).toBe(true);
    });

    it('should provide recommendations', () => {
      earnCoins(userId, 10000, 'SESSION_COMPLETE', 'Big earn');

      const balance = checkEconomyBalance(userId);

      expect(balance.recommendations.length).toBeGreaterThan(0);
    });
  });
});
