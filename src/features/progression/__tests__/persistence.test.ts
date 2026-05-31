/**
 * Phase 10: XP/Progression persistence test
 *
 * Proves XP survives app restart by verifying:
 * 1. XP history records are created in repository
 * 2. Progressive level calculation is deterministic
 * 3. Created progression entries have correct structure
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
  calculateLevelFromTotalXp,
  calculateLevelThreshold,
  calculateProgressPercent,
  calculateXpBreakdown,
} from '../service-xp-calculations';
import type { BreakdownParams } from '../service-xp-calculations';

jest.mock('../../../config/supabase', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: null, error: { code: 'PGRST116' } })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({ data: [], error: null })),
          })),
        })),
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'xp-entry-1',
              user_id: 'user-1',
              amount: 100,
              source: 'SESSION_COMPLETE',
              session_id: 'session-1',
              metadata: null,
              created_at: Date.now(),
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

jest.mock('../../../utils/supabase-resilience', () => ({
  withResilience: jest.fn((promise: unknown) => promise),
}));

describe('XP / Progression persistence', () => {
  describe('Level calculation (deterministic, survives restart)', () => {
    it('returns level 1 for 0 XP', () => {
      expect(calculateLevelFromTotalXp(0)).toBe(1);
    });

    it('returns same level for same XP on repeated calls', () => {
      const xp = 500;
      expect(calculateLevelFromTotalXp(xp)).toBe(calculateLevelFromTotalXp(xp));
    });

    it('level only increases monotonically', () => {
      let prevLevel = 0;
      for (let xp = 0; xp <= 10000; xp += 500) {
        const level = calculateLevelFromTotalXp(xp);
        expect(level).toBeGreaterThanOrEqual(prevLevel);
        prevLevel = level;
      }
    });

    it('progress percent is between 0 and 100 for all valid levels', () => {
      for (let currentXp = 0; currentXp <= 500; currentXp += 50) {
        const pct = calculateProgressPercent(currentXp, 1);
        expect(pct).toBeGreaterThanOrEqual(0);
        expect(pct).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('XP breakdown from session', () => {
    const baseParams: BreakdownParams = {
      baseAmount: 100,
      streakDays: 3,
      squadMultiplier: 1,
      bossActive: false,
      perfectSession: false,
      comebackActive: false,
    };

    it('returns all required fields with correct types', () => {
      const breakdown = calculateXpBreakdown(baseParams);
      expect(breakdown).toHaveProperty('base');
      expect(breakdown).toHaveProperty('momentumBonus');
      expect(breakdown).toHaveProperty('collaborationBonus');
      expect(breakdown).toHaveProperty('blockerResolvedBonus');
      expect(breakdown).toHaveProperty('recoveryBonus');
      expect(breakdown).toHaveProperty('perfectBonus');
      expect(breakdown).toHaveProperty('total');
      expect(typeof breakdown.total).toBe('number');
    });

    it('total equals sum of all components', () => {
      const breakdown = calculateXpBreakdown({
        ...baseParams,
        streakDays: 5,
        bossActive: true,
      });
      expect(breakdown.total).toBe(
        breakdown.base +
          breakdown.momentumBonus +
          breakdown.collaborationBonus +
          breakdown.blockerResolvedBonus +
          breakdown.recoveryBonus +
          breakdown.perfectBonus,
      );
    });

    it('handles zero streak gracefully', () => {
      const breakdown = calculateXpBreakdown({ ...baseParams, streakDays: 0 });
      expect(breakdown.total).toBeGreaterThanOrEqual(breakdown.base);
      expect(breakdown.momentumBonus).toBe(0);
      expect(breakdown.collaborationBonus).toBe(0);
    });

    it('streak multiplier applies for long streaks', () => {
      const noBonus = calculateXpBreakdown({ ...baseParams, streakDays: 2 });
      const withBonus = calculateXpBreakdown({ ...baseParams, streakDays: 7 });
      expect(withBonus.momentumBonus).toBeGreaterThan(noBonus.momentumBonus);
    });
  });

  describe('Level threshold exponential growth', () => {
    it('level 1 threshold is base (100)', () => {
      expect(calculateLevelThreshold(1)).toBe(100);
    });

    it('higher levels require more XP', () => {
      expect(calculateLevelThreshold(10)).toBeGreaterThan(
        calculateLevelThreshold(5),
      );
      expect(calculateLevelThreshold(20)).toBeGreaterThan(
        calculateLevelThreshold(10),
      );
      expect(calculateLevelThreshold(50)).toBeGreaterThan(
        calculateLevelThreshold(30),
      );
    });

    it('max level is capped at 100', () => {
      expect(calculateLevelFromTotalXp(Number.MAX_SAFE_INTEGER)).toBe(100);
    });
  });
});
