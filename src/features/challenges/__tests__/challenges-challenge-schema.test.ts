/**
 * Tests for Challenges — ChallengeSchema
 */

import { describe, it, expect } from '@jest/globals';

import { ChallengeSchema } from '../schemas';

describe('Core Schemas', () => {
  describe('ChallengeSchema', () => {
    it('parses a valid challenge with camelCase', () => {
      const challenge = ChallengeSchema.parse({
        id: 'c-1',
        seasonId: 's-1',
        type: 'DAILY',
        category: 'SESSIONS',
        title: 'Test',
        targetValue: 3,
        targetType: 'SESSIONS',
        rewardType: 'XP',
        rewardAmount: 50,
      });
      expect(challenge.id).toBe('c-1');
      expect(challenge.seasonId).toBe('s-1');
      expect(challenge.targetValue).toBe(3);
    });

    it('normalises snake_case keys from Supabase', () => {
      const challenge = ChallengeSchema.parse({
        id: 'c-2',
        season_id: 's-2',
        type: 'WEEKLY',
        category: 'MINUTES',
        title: 'Weekly',
        target_value: 120,
        target_type: 'MINUTES',
        reward_type: 'XP',
        reward_amount: 200,
        is_active: true,
        xp_bonus: 10,
        created_at: 1000,
      });
      expect(challenge.seasonId).toBe('s-2');
      expect(challenge.targetValue).toBe(120);
      expect(challenge.rewardType).toBe('XP');
      expect(challenge.isActive).toBe(true);
      expect(challenge.xpBonus).toBe(10);
      expect(challenge.createdAt).toBe(1000);
    });

    it('applies defaults for missing optional fields', () => {
      const challenge = ChallengeSchema.parse({
        id: 'c-3',
        seasonId: 's-3',
        type: 'EVENT',
        category: 'STREAK',
        title: 'Event',
        targetValue: 7,
        targetType: 'DAYS',
      });
      expect(challenge.description).toBe('');
      expect(challenge.iconUrl).toBeNull();
      expect(challenge.rewardType).toBe('XP');
      expect(challenge.rewardAmount).toBe(0);
      expect(challenge.isActive).toBe(true);
      expect(challenge.difficulty).toBe('MEDIUM');
      expect(challenge.xpBonus).toBe(0);
    });

    it('rejects empty id', () => {
      expect(() =>
        ChallengeSchema.parse({ id: '', seasonId: 's', type: 'DAILY', category: 'SESSIONS', title: 'T', targetValue: 1, targetType: 'T' }),
      ).toThrow();
    });

    it('rejects negative targetValue', () => {
      expect(() =>
        ChallengeSchema.parse({ id: 'c', seasonId: 's', type: 'DAILY', category: 'SESSIONS', title: 'T', targetValue: -1, targetType: 'T' }),
      ).toThrow();
    });
  });
});
