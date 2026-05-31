/**
 * Tests for Challenges — Helpers (CONFIG, rewardBundleFor, inferTriggerDelta)
 */

import { describe, it, expect } from '@jest/globals';

import { CONFIG, rewardBundleFor, inferTriggerDelta } from '../helpers';
import { ChallengeSchema } from '../schemas';

function makeChallenge(overrides: Record<string, unknown> = {}) {
  return ChallengeSchema.parse({
    id: 'c-1',
    seasonId: 'season-1',
    type: 'DAILY',
    category: 'SESSIONS',
    title: 'Test Challenge',
    description: 'Do the thing',
    targetValue: 5,
    targetType: 'SESSIONS',
    rewardType: 'XP',
    rewardAmount: 100,
    ...overrides,
  });
}

describe('Helpers', () => {
  describe('CONFIG', () => {
    it('has correct default values', () => {
      expect(CONFIG.FREE_REROLLS_PER_DAY).toBe(1);
      expect(CONFIG.PAID_REROLL_COST).toBe(10);
      expect(CONFIG.MAX_REROLLS_PER_DAY).toBe(10);
      expect(CONFIG.DAILY_CHALLENGE_EXPIRY_HOURS).toBe(24);
    });
  });

  describe('rewardBundleFor', () => {
    it('returns 50 coins for rewardAmount < 250', () => {
      const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 100 }));
      expect(bundle.xpReward).toBe(100);
      expect(bundle.coinReward).toBe(50);
    });

    it('returns 100 coins for rewardAmount 250-499', () => {
      const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 300 }));
      expect(bundle.xpReward).toBe(300);
      expect(bundle.coinReward).toBe(100);
    });

    it('returns 250 coins for rewardAmount >= 500', () => {
      const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 600 }));
      expect(bundle.xpReward).toBe(600);
      expect(bundle.coinReward).toBe(250);
    });

    it('returns 250 coins for rewardAmount exactly 500', () => {
      const bundle = rewardBundleFor(makeChallenge({ rewardAmount: 500 }));
      expect(bundle.coinReward).toBe(250);
    });
  });

  describe('inferTriggerDelta', () => {
    it('returns minutesCompleted for MINUTES + SESSION_COMPLETED', () => {
      const challenge = makeChallenge({ category: 'MINUTES' });
      expect(inferTriggerDelta(challenge, 'SESSION_COMPLETED', { minutesCompleted: 30 })).toBe(30);
    });

    it('returns sessionCount for SESSIONS + SESSION_COMPLETED', () => {
      const challenge = makeChallenge({ category: 'SESSIONS' });
      expect(inferTriggerDelta(challenge, 'SESSION_COMPLETED', { sessionCount: 2 })).toBe(2);
    });

    it('defaults to 1 for SESSIONS + SESSION_COMPLETED when no sessionCount', () => {
      const challenge = makeChallenge({ category: 'SESSIONS' });
      expect(inferTriggerDelta(challenge, 'SESSION_COMPLETED', {})).toBe(1);
    });

    it('returns 1 for SOCIAL + MOOD_LOGGED when moodLogged is true', () => {
      const challenge = makeChallenge({ category: 'SOCIAL' });
      expect(inferTriggerDelta(challenge, 'MOOD_LOGGED', { moodLogged: true })).toBe(1);
    });

    it('returns 0 for SOCIAL + MOOD_LOGGED when moodLogged is false', () => {
      const challenge = makeChallenge({ category: 'SOCIAL' });
      expect(inferTriggerDelta(challenge, 'MOOD_LOGGED', { moodLogged: false })).toBe(0);
    });

    it('returns 1 for STREAK + STREAK_CHECKED when streakChecked is true', () => {
      const challenge = makeChallenge({ category: 'STREAK' });
      expect(inferTriggerDelta(challenge, 'STREAK_CHECKED', { streakChecked: true })).toBe(1);
    });

    it('returns 1 for BOSS_DAMAGE + PURITY_RECORDED when purity >= 80', () => {
      const challenge = makeChallenge({ category: 'BOSS_DAMAGE' });
      expect(inferTriggerDelta(challenge, 'PURITY_RECORDED', { purity: 90 })).toBe(1);
    });

    it('returns 0 for BOSS_DAMAGE + PURITY_RECORDED when purity < 80', () => {
      const challenge = makeChallenge({ category: 'BOSS_DAMAGE' });
      expect(inferTriggerDelta(challenge, 'PURITY_RECORDED', { purity: 50 })).toBe(0);
    });

    it('returns targetValue for ACHIEVEMENT + STREAK_UPDATED when streakDays >= target', () => {
      const challenge = makeChallenge({ category: 'ACHIEVEMENT', targetValue: 7 });
      expect(inferTriggerDelta(challenge, 'STREAK_UPDATED', { streakDays: 10 })).toBe(7);
    });

    it('returns 0 for ACHIEVEMENT + STREAK_UPDATED when streakDays < target', () => {
      const challenge = makeChallenge({ category: 'ACHIEVEMENT', targetValue: 7 });
      expect(inferTriggerDelta(challenge, 'STREAK_UPDATED', { streakDays: 3 })).toBe(0);
    });

    it('returns 0 for unmatched category/trigger combo', () => {
      const challenge = makeChallenge({ category: 'SESSIONS' });
      expect(inferTriggerDelta(challenge, 'MOOD_LOGGED', {})).toBe(0);
    });
  });
});
