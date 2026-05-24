/**
 * Boss Service Tests
 */

import {
  calculateScaledHealth,
  calculateDamage,
} from '../service';

describe('BossService', () => {
  describe('calculateScaledHealth', () => {
    it('should return base health for level 1, solo', () => {
      const result = calculateScaledHealth(1000, 0.1, 1, 1);
      expect(result).toBe(1000);
    });

    it('should scale health with user level', () => {
      const base = calculateScaledHealth(1000, 0.1, 1, 1);
      const scaled = calculateScaledHealth(1000, 0.1, 10, 1);
      expect(scaled).toBeGreaterThan(base);
    });

    it('should scale health with squad size', () => {
      const solo = calculateScaledHealth(1000, 0.1, 5, 1);
      const squad = calculateScaledHealth(1000, 0.1, 5, 3);
      expect(squad).toBeGreaterThan(solo);
    });

    it('should calculate correct scaling', () => {
      // baseHealth * (1 + (level-1)*0.1) * (1 + (squadSize-1)*0.2)
      // 1000 * (1 + 9*0.1) * (1 + 2*0.2) = 1000 * 1.9 * 1.4 = 2660
      const result = calculateScaledHealth(1000, 0.1, 10, 3);
      expect(result).toBe(2660);
    });
  });

  describe('calculateDamage', () => {
    it('should calculate base damage from duration', () => {
      // 60 seconds = 1 damage
      const result = calculateDamage({
        sessionDuration: 60,
        sessionQuality: 100,
        streakDays: 0,
        squadMultiplier: 1,
        equippedItemIds: [],
      });
      expect(result).toBeGreaterThanOrEqual(1);
    });

    it('should apply quality multiplier', () => {
      const lowQuality = calculateDamage({
        sessionDuration: 60,
        sessionQuality: 0,
        streakDays: 0,
        squadMultiplier: 1,
        equippedItemIds: [],
      });
      const highQuality = calculateDamage({
        sessionDuration: 60,
        sessionQuality: 100,
        streakDays: 0,
        squadMultiplier: 1,
        equippedItemIds: [],
      });
      expect(highQuality).toBeGreaterThan(lowQuality);
    });

    it('should apply streak bonus for 7+ days', () => {
      const noStreak = calculateDamage({
        sessionDuration: 60,
        sessionQuality: 100,
        streakDays: 5,
        squadMultiplier: 1,
        equippedItemIds: [],
      });
      const weekStreak = calculateDamage({
        sessionDuration: 60,
        sessionQuality: 100,
        streakDays: 7,
        squadMultiplier: 1,
        equippedItemIds: [],
      });
      expect(weekStreak).toBeGreaterThan(noStreak);
    });

  });
});
