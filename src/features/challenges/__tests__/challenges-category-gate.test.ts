/**
 * Tests for Challenges — Category Gate + Basic Challenge Types
 */

import { describe, it, expect } from '@jest/globals';

import {
  isEconomyCategory,
  isBehaviorCategory,
  filterBehaviorCategories,
} from '../category-gate';
import { getRequiredCount, CONFIG as BasicConfig } from '../basic-challenge-types';

describe('Category Gate', () => {
  it('isEconomyCategory returns true for SHOP_PURCHASE', () => {
    expect(isEconomyCategory('SHOP_PURCHASE')).toBe(true);
  });

  it('isEconomyCategory returns false for SESSIONS', () => {
    expect(isEconomyCategory('SESSIONS')).toBe(false);
  });

  it('isBehaviorCategory is the inverse of isEconomyCategory', () => {
    expect(isBehaviorCategory('SESSIONS')).toBe(true);
    expect(isBehaviorCategory('SHOP_PURCHASE')).toBe(false);
  });

  it('filterBehaviorCategories removes SHOP_PURCHASE', () => {
    const input: Array<'SESSIONS' | 'SHOP_PURCHASE' | 'STREAK'> = ['SESSIONS', 'SHOP_PURCHASE', 'STREAK'];
    const result = filterBehaviorCategories(input);
    expect(result).toEqual(['SESSIONS', 'STREAK']);
  });

  it('filterBehaviorCategories returns empty when all are economy', () => {
    const result = filterBehaviorCategories(['SHOP_PURCHASE']);
    expect(result).toEqual([]);
  });
});

describe('Basic Challenge Types', () => {
  it('CONFIG has correct daily values', () => {
    expect(BasicConfig.dailyChallengeId).toBe('basic-daily-001');
    expect(BasicConfig.dailyTarget).toBe(1);
    expect(BasicConfig.dailyRewardXp).toBe(25);
  });

  it('CONFIG has correct weekly values', () => {
    expect(BasicConfig.weeklyChallengeId).toBe('basic-weekly-001');
    expect(BasicConfig.weeklyTarget).toBe(5);
    expect(BasicConfig.weeklyRewardXp).toBe(100);
  });

  it('getRequiredCount returns dailyTarget for daily challenge', () => {
    expect(getRequiredCount('basic-daily-001')).toBe(1);
  });

  it('getRequiredCount returns weeklyTarget for weekly challenge', () => {
    expect(getRequiredCount('basic-weekly-001')).toBe(5);
  });

  it('getRequiredCount returns weeklyTarget for unknown challenge', () => {
    expect(getRequiredCount('unknown-id')).toBe(5);
  });
});
