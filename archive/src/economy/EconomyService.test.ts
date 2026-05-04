/**
 * EconomyService Tests
 *
 * Phase 19.2 - Test coin earn/spend, gem earn/spend, balance validation.
 *
 * Tests:
 * - Coin earn/spend operations
 * - Gem earn/spend operations
 * - Balance validation
 * - Atomic transactions
 * - Duplicate claim prevention
 */

import { EconomyService, WalletSchema, TransactionSchema, type Wallet, type Transaction } from './EconomyService';

describe('EconomyService', () => {
  let service: EconomyService;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    service = new EconomyService(mockUserId);
    // Reset state
    service.setUserId(mockUserId);
  });

  afterEach(() => {
    // Cleanup
    service.setUserId('');
  });

  describe('Wallet Management', () => {
    it('should initialize with zero balances', () => {
      const wallet = service.getWallet();

      expect(wallet.coins).toBe(0);
      expect(wallet.gems).toBe(0);
      expect(Object.keys(wallet.seasonal)).toHaveLength(0);
    });

    it('should set user ID correctly', () => {
      const newService = new EconomyService();
      newService.setUserId('new-user-456');

      expect(newService.getUserId()).toBe('new-user-456');
    });

    it('should clear state when switching users', () => {
      service.addCoins(100, 'TEST');
      service.setUserId('different-user');

      const wallet = service.getWallet();
      expect(wallet.coins).toBe(0);
    });

    it('should track total earned coins', () => {
      service.addCoins(100, 'EARN');
      service.addCoins(50, 'EARN');

      const wallet = service.getWallet();
      expect(wallet.totalEarned.coins).toBe(150);
    });

    it('should track total earned gems', () => {
      service.addGems(10, 'EARN');
      service.addGems(5, 'EARN');

      const wallet = service.getWallet();
      expect(wallet.totalEarned.gems).toBe(15);
    });

    it('should track total spent coins', () => {
      service.addCoins(200, 'EARN');
      service.spendCoins(50, 'PURCHASE');
      service.spendCoins(30, 'PURCHASE');

      const wallet = service.getWallet();
      expect(wallet.totalSpent.coins).toBe(80);
    });

    it('should track total spent gems', () => {
      service.addGems(20, 'EARN');
      service.spendGems(5, 'PURCHASE');
      service.spendGems(3, 'PURCHASE');

      const wallet = service.getWallet();
      expect(wallet.totalSpent.gems).toBe(8);
    });

    it('should update lastUpdated timestamp on transactions', () => {
      const before = Date.now();
      service.addCoins(100, 'TEST');
      const after = Date.now();

      const wallet = service.getWallet();
      expect(wallet.lastUpdated).toBeGreaterThanOrEqual(before);
      expect(wallet.lastUpdated).toBeLessThanOrEqual(after);
    });
  });

  describe('Coin Operations', () => {
    it('should add coins to wallet', () => {
      service.addCoins(100, 'SESSION_REWARD');

      const wallet = service.getWallet();
      expect(wallet.coins).toBe(100);
    });

    it('should accumulate coins on multiple adds', () => {
      service.addCoins(100, 'EARN');
      service.addCoins(50, 'EARN');
      service.addCoins(25, 'EARN');

      const wallet = service.getWallet();
      expect(wallet.coins).toBe(175);
    });

    it('should spend coins from wallet', () => {
      service.addCoins(200, 'EARN');
      const success = service.spendCoins(50, 'PURCHASE');

      expect(success).toBe(true);
      const wallet = service.getWallet();
      expect(wallet.coins).toBe(150);
    });

    it('should reject spending more than balance', () => {
      service.addCoins(50, 'EARN');
      const success = service.spendCoins(100, 'PURCHASE');

      expect(success).toBe(false);
      const wallet = service.getWallet();
      expect(wallet.coins).toBe(50); // Balance unchanged
    });

    it('should reject spending zero or negative coins', () => {
      service.addCoins(100, 'EARN');
      const successZero = service.spendCoins(0, 'PURCHASE');
      const successNegative = service.spendCoins(-10, 'PURCHASE');

      expect(successZero).toBe(false);
      expect(successNegative).toBe(false);
    });

    it('should reject adding zero or negative coins', () => {
      const before = service.getWallet().coins;

      service.addCoins(0, 'TEST');
      service.addCoins(-10, 'TEST');

      const after = service.getWallet().coins;
      expect(after).toBe(before);
    });
  });

  describe('Gem Operations', () => {
    it('should add gems to wallet', () => {
      service.addGems(10, 'PURCHASE');

      const wallet = service.getWallet();
      expect(wallet.gems).toBe(10);
    });

    it('should accumulate gems on multiple adds', () => {
      service.addGems(10, 'EARN');
      service.addGems(5, 'EARN');
      service.addGems(20, 'EARN');

      const wallet = service.getWallet();
      expect(wallet.gems).toBe(35);
    });

    it('should spend gems from wallet', () => {
      service.addGems(50, 'EARN');
      const success = service.spendGems(10, 'PURCHASE');

      expect(success).toBe(true);
      const wallet = service.getWallet();
      expect(wallet.gems).toBe(40);
    });

    it('should reject spending more gems than balance', () => {
      service.addGems(5, 'EARN');
      const success = service.spendGems(10, 'PURCHASE');

      expect(success).toBe(false);
      const wallet = service.getWallet();
      expect(wallet.gems).toBe(5); // Balance unchanged
    });

    it('should reject spending zero or negative gems', () => {
      service.addGems(20, 'EARN');
      const successZero = service.spendGems(0, 'PURCHASE');
      const successNegative = service.spendGems(-5, 'PURCHASE');

      expect(successZero).toBe(false);
      expect(successNegative).toBe(false);
    });
  });

  describe('Balance Validation', () => {
    it('should validate sufficient coin balance', () => {
      service.addCoins(100, 'EARN');

      expect(service.hasSufficientBalance('COINS', 50)).toBe(true);
      expect(service.hasSufficientBalance('COINS', 100)).toBe(true);
      expect(service.hasSufficientBalance('COINS', 101)).toBe(false);
    });

    it('should validate sufficient gem balance', () => {
      service.addGems(20, 'EARN');

      expect(service.hasSufficientBalance('GEMS', 10)).toBe(true);
      expect(service.hasSufficientBalance('GEMS', 20)).toBe(true);
      expect(service.hasSufficientBalance('GEMS', 21)).toBe(false);
    });

    it('should get correct balance for currency type', () => {
      service.addCoins(100, 'EARN');
      service.addGems(20, 'EARN');

      expect(service.getBalance('COINS')).toBe(100);
      expect(service.getBalance('GEMS')).toBe(20);
    });

    it('should return zero for unknown currency type', () => {
      expect(service.getBalance('UNKNOWN' as any)).toBe(0);
    });

    it('should handle zero balance checks', () => {
      expect(service.hasSufficientBalance('COINS', 0)).toBe(true);
      expect(service.hasSufficientBalance('COINS', 1)).toBe(false);
    });
  });

  describe('Transaction Records', () => {
    it('should record coin earn transactions', () => {
      service.addCoins(100, 'SESSION_COMPLETE');

      const transactions = service.getTransactions();
      const coinTransactions = transactions.filter(t => t.currency === 'COINS');

      expect(coinTransactions).toHaveLength(1);
      expect(coinTransactions[0].type).toBe('EARN');
      expect(coinTransactions[0].amount).toBe(100);
    });

    it('should record coin spend transactions', () => {
      service.addCoins(200, 'EARN');
      service.spendCoins(50, 'SHOP_PURCHASE');

      const transactions = service.getTransactions();
      const spendTransactions = transactions.filter(t => t.type === 'SPEND');

      expect(spendTransactions).toHaveLength(1);
      expect(spendTransactions[0].currency).toBe('COINS');
      expect(spendTransactions[0].amount).toBe(50);
    });

    it('should include transaction metadata', () => {
      service.addCoins(100, 'SESSION_COMPLETE', { sessionId: 'sess-123' });

      const transactions = service.getTransactions();
      expect(transactions[0].metadata).toBeDefined();
      expect(transactions[0].metadata?.sessionId).toBe('sess-123');
    });

    it('should include balance after in transaction', () => {
      service.addCoins(100, 'EARN');
      service.addCoins(50, 'EARN');

      const transactions = service.getTransactions();
      expect(transactions[0].balanceAfter).toBe(100);
      expect(transactions[1].balanceAfter).toBe(150);
    });

    it('should assign unique transaction IDs', () => {
      service.addCoins(100, 'EARN');
      service.addCoins(50, 'EARN');
      service.addGems(10, 'EARN');

      const transactions = service.getTransactions();
      const ids = transactions.map(t => t.id);
      const uniqueIds = [...new Set(ids)];

      expect(uniqueIds).toHaveLength(transactions.length);
    });

    it('should record transaction timestamp', () => {
      const before = Date.now();
      service.addCoins(100, 'EARN');
      const after = Date.now();

      const transactions = service.getTransactions();
      expect(transactions[0].createdAt).toBeGreaterThanOrEqual(before);
      expect(transactions[0].createdAt).toBeLessThanOrEqual(after);
    });
  });

  describe('Duplicate Claim Prevention', () => {
    it('should prevent duplicate coin claims with same claim ID', () => {
      const claimId = 'reward-123';

      const firstResult = service.addCoins(100, 'REWARD', { claimId });
      const secondResult = service.addCoins(100, 'REWARD', { claimId });

      expect(firstResult).toBe(true);
      expect(secondResult).toBe(false);
      expect(service.getWallet().coins).toBe(100);
    });

    it('should prevent duplicate gem claims with same claim ID', () => {
      const claimId = 'gem-reward-456';

      const firstResult = service.addGems(10, 'REWARD', { claimId });
      const secondResult = service.addGems(10, 'REWARD', { claimId });

      expect(firstResult).toBe(true);
      expect(secondResult).toBe(false);
      expect(service.getWallet().gems).toBe(10);
    });

    it('should allow different claims with different IDs', () => {
      const result1 = service.addCoins(100, 'REWARD', { claimId: 'reward-1' });
      const result2 = service.addCoins(100, 'REWARD', { claimId: 'reward-2' });

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(service.getWallet().coins).toBe(200);
    });

    it('should track processed claim IDs', () => {
      service.addCoins(100, 'REWARD', { claimId: 'claim-1' });
      service.addGems(10, 'REWARD', { claimId: 'claim-2' });

      const processedIds = service.getProcessedClaimIds();
      expect(processedIds).toContain('claim-1');
      expect(processedIds).toContain('claim-2');
    });
  });

  describe('Atomic Transactions', () => {
    it('should complete coin add atomically', () => {
      const initial = service.getWallet().coins;

      // Simulate multiple concurrent adds
      const results = [
        service.addCoins(100, 'EARN'),
        service.addCoins(50, 'EARN'),
        service.addCoins(25, 'EARN'),
      ];

      expect(results.every(r => r === true)).toBe(true);
      expect(service.getWallet().coins).toBe(initial + 175);
    });

    it('should complete coin spend atomically', () => {
      service.addCoins(200, 'EARN');

      const result1 = service.spendCoins(50, 'PURCHASE');
      const result2 = service.spendCoins(30, 'PURCHASE');
      const result3 = service.spendCoins(1000, 'PURCHASE'); // Should fail

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(false);
      expect(service.getWallet().coins).toBe(120);
    });

    it('should maintain consistent state after failed spend', () => {
      service.addCoins(100, 'EARN');
      service.addGems(20, 'EARN');

      const beforeCoins = service.getWallet().coins;
      const beforeGems = service.getWallet().gems;

      service.spendCoins(1000, 'PURCHASE'); // Should fail
      service.spendGems(1000, 'PURCHASE'); // Should fail

      expect(service.getWallet().coins).toBe(beforeCoins);
      expect(service.getWallet().gems).toBe(beforeGems);
    });
  });

  describe('Seasonal Currency', () => {
    it('should add seasonal currency', () => {
      service.addSeasonalCurrency('WINTER_2024', 100, 'EVENT');

      const wallet = service.getWallet();
      expect(wallet.seasonal.WINTER_2024).toBe(100);
    });

    it('should accumulate seasonal currency', () => {
      service.addSeasonalCurrency('WINTER_2024', 50, 'EVENT');
      service.addSeasonalCurrency('WINTER_2024', 30, 'EVENT');

      const wallet = service.getWallet();
      expect(wallet.seasonal.WINTER_2024).toBe(80);
    });

    it('should handle multiple seasonal currencies', () => {
      service.addSeasonalCurrency('WINTER_2024', 100, 'EVENT');
      service.addSeasonalCurrency('SPRING_2025', 50, 'EVENT');

      const wallet = service.getWallet();
      expect(wallet.seasonal.WINTER_2024).toBe(100);
      expect(wallet.seasonal.SPRING_2025).toBe(50);
    });

    it('should spend seasonal currency', () => {
      service.addSeasonalCurrency('WINTER_2024', 100, 'EARN');
      const success = service.spendSeasonalCurrency('WINTER_2024', 30, 'PURCHASE');

      expect(success).toBe(true);
      expect(service.getWallet().seasonal.WINTER_2024).toBe(70);
    });

    it('should reject spending more seasonal currency than balance', () => {
      service.addSeasonalCurrency('WINTER_2024', 20, 'EARN');
      const success = service.spendSeasonalCurrency('WINTER_2024', 50, 'PURCHASE');

      expect(success).toBe(false);
      expect(service.getWallet().seasonal.WINTER_2024).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large coin amounts', () => {
      service.addCoins(1000000, 'EARN');
      expect(service.getWallet().coins).toBe(1000000);

      service.spendCoins(500000, 'PURCHASE');
      expect(service.getWallet().coins).toBe(500000);
    });

    it('should handle very large gem amounts', () => {
      service.addGems(999999, 'EARN');
      expect(service.getWallet().gems).toBe(999999);
    });

    it('should handle rapid successive transactions', () => {
      for (let i = 0; i < 100; i++) {
        service.addCoins(1, 'EARN');
      }

      expect(service.getWallet().coins).toBe(100);
      expect(service.getTransactions()).toHaveLength(100);
    });

    it('should maintain valid wallet schema after operations', () => {
      service.addCoins(100, 'EARN');
      service.addGems(20, 'EARN');
      service.spendCoins(30, 'PURCHASE');
      service.addSeasonalCurrency('EVENT', 50, 'EARN');

      const wallet = service.getWallet();
      const parseResult = WalletSchema.safeParse(wallet);

      expect(parseResult.success).toBe(true);
    });

    it('should handle currency conversion', () => {
      service.addCoins(1000, 'EARN');

      const result = service.convertCurrency('COINS', 'GEMS', 500, 0.1);

      expect(result).toBe(true);
      expect(service.getWallet().coins).toBe(500);
      expect(service.getWallet().gems).toBe(50);
    });

    it('should reject conversion without sufficient balance', () => {
      service.addCoins(100, 'EARN');

      const result = service.convertCurrency('COINS', 'GEMS', 200, 0.1);

      expect(result).toBe(false);
      expect(service.getWallet().coins).toBe(100);
      expect(service.getWallet().gems).toBe(0);
    });
  });
});
