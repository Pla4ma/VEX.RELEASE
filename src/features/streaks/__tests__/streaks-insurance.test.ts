/**
 * Streaks Comprehensive Tests — Insurance
 * Split from streaks-comprehensive.test.ts
 */
import { describe, it, expect } from '@jest/globals';

import {
  StreakInsuranceSchema,
  ComebackTokenSchema,
  INSURANCE_PRICING,
  calculateInsuranceCost,
  calculateInsurancePayout,
  calculateComebackTokensEarned,
  calculateTokenRestoreValue,
  canPurchaseInsurance,
  createInsurance,
} from '../streak-insurance';

describe('Streak Insurance', () => {
  describe('calculateInsuranceCost', () => {
    it('calculates cost with base + per-day', () => {
      const cost = calculateInsuranceCost(10);
      expect(cost).toBe(INSURANCE_PRICING.baseCost + 10 * INSURANCE_PRICING.perDayMultiplier);
    });

    it('clamps to min days', () => {
      const cost = calculateInsuranceCost(1);
      const expected = INSURANCE_PRICING.baseCost + INSURANCE_PRICING.minDays * INSURANCE_PRICING.perDayMultiplier;
      expect(cost).toBe(expected);
    });

    it('clamps to max days', () => {
      const cost = calculateInsuranceCost(100);
      const expected = INSURANCE_PRICING.baseCost + INSURANCE_PRICING.maxDays * INSURANCE_PRICING.perDayMultiplier;
      expect(cost).toBe(expected);
    });
  });

  describe('calculateInsurancePayout', () => {
    it('calculates payout with level scaling', () => {
      const payout = calculateInsurancePayout(20, 10);
      expect(payout.restoredDays).toBeGreaterThanOrEqual(3);
      expect(payout.xpBonus).toBe(payout.restoredDays * 10);
    });

    it('ensures minimum 3 restored days', () => {
      const payout = calculateInsurancePayout(1, 0);
      expect(payout.restoredDays).toBeGreaterThanOrEqual(3);
    });

    it('higher level means more restored days', () => {
      const low = calculateInsurancePayout(20, 1);
      const high = calculateInsurancePayout(20, 50);
      expect(high.restoredDays).toBeGreaterThanOrEqual(low.restoredDays);
    });
  });

  describe('calculateComebackTokensEarned', () => {
    it('returns at least 1 token', () => {
      expect(calculateComebackTokensEarned(1)).toBe(1);
    });

    it('scales with broken streak days', () => {
      expect(calculateComebackTokensEarned(30)).toBe(3);
    });

    it('rounds up', () => {
      expect(calculateComebackTokensEarned(11)).toBe(2);
    });
  });

  describe('calculateTokenRestoreValue', () => {
    it('returns count * 5', () => {
      expect(calculateTokenRestoreValue(4)).toBe(20);
    });

    it('returns 0 for 0 tokens', () => {
      expect(calculateTokenRestoreValue(0)).toBe(0);
    });
  });

  describe('canPurchaseInsurance', () => {
    const userId = 'user-1';

    it('allows purchase when all conditions met', () => {
      const result = canPurchaseInsurance(userId, 10, 1000, false);
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeNull();
    });

    it('blocks if already has active insurance', () => {
      const result = canPurchaseInsurance(userId, 10, 1000, true);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Already have');
    });

    it('blocks if streak too low', () => {
      const result = canPurchaseInsurance(userId, 2, 1000, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('minimum');
    });

    it('blocks if insufficient balance', () => {
      const result = canPurchaseInsurance(userId, 10, 1, false);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Not enough');
    });

    it('returns calculated cost even when blocked', () => {
      const result = canPurchaseInsurance(userId, 10, 1, false);
      expect(result.cost).toBeGreaterThan(0);
    });
  });

  describe('createInsurance', () => {
    it('creates insurance with correct fields', () => {
      const ins = createInsurance('user-1', 10, 500);
      expect(ins.userId).toBe('user-1');
      expect(ins.streakDaysProtected).toBe(10);
      expect(ins.cost).toBe(500);
      expect(ins.used).toBe(false);
      expect(ins.expiresAt).toBeGreaterThan(ins.purchasedAt);
    });

    it('expires in 48 hours', () => {
      const ins = createInsurance('user-1', 10, 500);
      const diff = ins.expiresAt - ins.purchasedAt;
      expect(diff).toBe(48 * 60 * 60 * 1000);
    });
  });

  describe('StreakInsuranceSchema', () => {
    it('accepts valid insurance object', () => {
      const result = StreakInsuranceSchema.safeParse({
        id: 'ins-1',
        userId: 'user-1',
        streakDaysProtected: 10,
        cost: 500,
        purchasedAt: Date.now(),
        expiresAt: Date.now() + 86400000,
        used: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('ComebackTokenSchema', () => {
    it('accepts valid token', () => {
      const result = ComebackTokenSchema.safeParse({
        id: 'tok-1',
        userId: 'user-1',
        sourceStreak: 10,
        earnedAt: Date.now(),
        used: false,
        restoreValue: 5,
      });
      expect(result.success).toBe(true);
    });
  });
});

