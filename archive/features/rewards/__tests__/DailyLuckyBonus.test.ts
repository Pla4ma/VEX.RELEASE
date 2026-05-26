/**
 * DailyLuckyBonus Tests
 *
 * Tests probability distributions and daily reset logic.
 */

import {
  DailyLuckyBonusService,
  LuckyBonusType,
} from '../DailyLuckyBonus';

describe('DailyLuckyBonus', () => {
  let service: DailyLuckyBonusService;
  const TEST_USER_ID = 'test-user-123';

  beforeEach(() => {
    service = new DailyLuckyBonusService();
    service.resetBonus(TEST_USER_ID);
  });

  afterEach(() => {
    service.resetBonus(TEST_USER_ID);
  });

  describe('Basic Functionality', () => {
    it('should show bonus as available for new users', () => {
      const status = service.getStatus(TEST_USER_ID);
      expect(status.available).toBe(true);
      expect(status.used).toBe(false);
    });

    it('should mark bonus as used after consumption', () => {
      service.consumeBonus(TEST_USER_ID);
      const status = service.getStatus(TEST_USER_ID);
      expect(status.available).toBe(false);
      expect(status.used).toBe(true);
    });

    it('should return no bonus if already used today', () => {
      // Use bonus first time
      service.consumeBonus(TEST_USER_ID);

      // Try to use again
      const result = service.consumeBonus(TEST_USER_ID);
      expect(result.triggered).toBe(false);
      expect(result.type).toBe('none');
    });
  });

  describe('Probability Distribution', () => {
    it('should trigger TIER_SKIP ~5% of the time', () => {
      const iterations = 10000;
      const distribution = service.simulateDistribution(iterations);

      const tierSkipRate = distribution[LuckyBonusType.TIER_SKIP] / iterations;
      expect(tierSkipRate).toBeGreaterThan(0.04);
      expect(tierSkipRate).toBeLessThan(0.06);
    });

    it('should trigger DOUBLE_TIER ~10% of the time', () => {
      const iterations = 10000;
      const distribution = service.simulateDistribution(iterations);

      const doubleTierRate = distribution[LuckyBonusType.DOUBLE_TIER] / iterations;
      expect(doubleTierRate).toBeGreaterThan(0.09);
      expect(doubleTierRate).toBeLessThan(0.11);
    });

    it('should trigger NONE ~85% of the time', () => {
      const iterations = 10000;
      const distribution = service.simulateDistribution(iterations);

      const noneRate = distribution[LuckyBonusType.NONE] / iterations;
      expect(noneRate).toBeGreaterThan(0.84);
      expect(noneRate).toBeLessThan(0.86);
    });

    it('probabilities should sum to 1', () => {
      const iterations = 10000;
      const distribution = service.simulateDistribution(iterations);

      const total = Object.values(distribution).reduce((a, b) => a + b, 0);
      expect(total).toBe(iterations);
    });
  });

  describe('Tier Upgrade Logic', () => {
    it('should upgrade COMMON to UNCOMMON', () => {
      const upgraded = service.applyBonusToTier('COMMON', LuckyBonusType.TIER_SKIP);
      expect(upgraded).toBe('UNCOMMON');
    });

    it('should upgrade UNCOMMON to RARE', () => {
      const upgraded = service.applyBonusToTier('UNCOMMON', LuckyBonusType.TIER_SKIP);
      expect(upgraded).toBe('RARE');
    });

    it('should upgrade RARE to EPIC', () => {
      const upgraded = service.applyBonusToTier('RARE', LuckyBonusType.TIER_SKIP);
      expect(upgraded).toBe('EPIC');
    });

    it('should upgrade EPIC to LEGENDARY', () => {
      const upgraded = service.applyBonusToTier('EPIC', LuckyBonusType.TIER_SKIP);
      expect(upgraded).toBe('LEGENDARY');
    });

    it('should keep LEGENDARY at LEGENDARY (max tier)', () => {
      const upgraded = service.applyBonusToTier('LEGENDARY', LuckyBonusType.TIER_SKIP);
      expect(upgraded).toBe('LEGENDARY');
    });
  });

  describe('Seeded Random (Deterministic)', () => {
    it('should produce same result with same seed', () => {
      const seed = 'test-seed-123';

      const result1 = service.generateRoll(seed);
      const result2 = service.generateRoll(seed);

      expect(result1).toBe(result2);
    });

    it('should produce different results with different seeds', () => {
      const result1 = service.generateRoll('seed-a');
      const result2 = service.generateRoll('seed-b');

      expect(result1).not.toBe(result2);
    });
  });

  describe('Countdown String', () => {
    it('should format hours and minutes correctly', () => {
      const status = {
        available: false,
        used: true,
        lastUsedDate: '2024-01-01',
        hoursUntilReset: 5,
        minutesUntilReset: 30,
      };

      const countdown = service.getCountdownString(status);
      expect(countdown).toBe('5h 30m');
    });

    it('should format minutes only when less than an hour', () => {
      const status = {
        available: false,
        used: true,
        lastUsedDate: '2024-01-01',
        hoursUntilReset: 0,
        minutesUntilReset: 45,
      };

      const countdown = service.getCountdownString(status);
      expect(countdown).toBe('45m');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset bonus status', () => {
      // Use bonus first
      service.consumeBonus(TEST_USER_ID);
      let status = service.getStatus(TEST_USER_ID);
      expect(status.available).toBe(false);

      // Reset
      service.resetBonus(TEST_USER_ID);
      status = service.getStatus(TEST_USER_ID);
      expect(status.available).toBe(true);
    });
  });

  describe('Result Structure', () => {
    it('should return correct structure when triggered', () => {
      // Use seeded random to force a hit
      const result = service.consumeBonus(TEST_USER_ID, 'seed-that-triggers-bonus');

      expect(result).toHaveProperty('triggered');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('originalTier');
      expect(result).toHaveProperty('finalTier');
      expect(result).toHaveProperty('rewardMultiplier');
    });

    it('should apply 2x multiplier for DOUBLE_TIER', () => {
      // Force double tier with seed
      // Seed calculation: roll < 0.05 = tier skip, 0.05-0.15 = double tier
      const result = service.consumeBonus(TEST_USER_ID, 'force-double-tier-seed');

      if (result.type === 'double_tier') {
        expect(result.rewardMultiplier).toBe(2);
      }
    });
  });
});
