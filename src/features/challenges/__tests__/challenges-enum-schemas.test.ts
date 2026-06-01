/**
 * Tests for Challenges — Enum Schemas
 */

import { describe, it, expect } from '@jest/globals';

import {
  ChallengeTypeSchema,
  ChallengeStatusSchema,
  ChallengeCategorySchema,
  ChallengeDifficultySchema as MainDifficultySchema,
  DailyChallengeTriggerTypeSchema,
} from '../schemas';

describe('Enum Schemas', () => {
  it('ChallengeTypeSchema accepts valid types', () => {
    expect(ChallengeTypeSchema.parse('DAILY')).toBe('DAILY');
    expect(ChallengeTypeSchema.parse('WEEKLY')).toBe('WEEKLY');
    expect(ChallengeTypeSchema.parse('EVENT')).toBe('EVENT');
  });

  it('ChallengeTypeSchema rejects invalid type', () => {
    expect(() => ChallengeTypeSchema.parse('HOURLY')).toThrow();
  });

  it('ChallengeStatusSchema accepts all statuses', () => {
    const statuses = ['ACTIVE', 'COMPLETED', 'CLAIMED', 'EXPIRED', 'REROLLED', 'ABANDONED'];
    for (const s of statuses) {
      expect(ChallengeStatusSchema.parse(s)).toBe(s);
    }
  });

  it('ChallengeStatusSchema rejects invalid status', () => {
    expect(() => ChallengeStatusSchema.parse('PENDING')).toThrow();
  });

  it('ChallengeCategorySchema accepts all categories', () => {
    const cats = [
      'SESSIONS', 'MINUTES', 'STREAK', 'BOSS_DAMAGE', 'SQUAD_ACTIVITY',
      'SHOP_PURCHASE', 'LEVEL_UP', 'ACHIEVEMENT', 'SOCIAL',
    ];
    for (const c of cats) {
      expect(ChallengeCategorySchema.parse(c)).toBe(c);
    }
  });

  it('ChallengeCategorySchema rejects unknown category', () => {
    expect(() => ChallengeCategorySchema.parse('MYSTERY')).toThrow();
  });

  it('ChallengeDifficultySchema accepts all difficulties', () => {
    for (const d of ['EASY', 'MEDIUM', 'HARD', 'EXPERT']) {
      expect(MainDifficultySchema.parse(d)).toBe(d);
    }
  });

  it('ChallengeDifficultySchema rejects invalid difficulty', () => {
    expect(() => MainDifficultySchema.parse('IMPOSSIBLE')).toThrow();
  });

  it('DailyChallengeTriggerTypeSchema accepts valid triggers', () => {
    const triggers = ['SESSION_COMPLETED', 'MOOD_LOGGED', 'STREAK_CHECKED', 'PURITY_RECORDED', 'STREAK_UPDATED'];
    for (const t of triggers) {
      expect(DailyChallengeTriggerTypeSchema.parse(t)).toBe(t);
    }
  });

  it('DailyChallengeTriggerTypeSchema rejects unknown trigger', () => {
    expect(() => DailyChallengeTriggerTypeSchema.parse('UNKNOWN')).toThrow();
  });
});
