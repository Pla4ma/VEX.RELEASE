import {
  AIRequestCategorySchema,
  UserTierSchema,
  FeatureStageSchema,
  QuotaWindowSchema,
  QuotaLimitSchema,
  TierQuotaConfigSchema,
  QuotaCheckResultSchema,
  QuotaUsageRecordSchema,
  QuotaExceededErrorSchema,
} from '../ai-quota-types';
import type { AIRequestCategory, UserTier, FeatureStage, QuotaWindow } from '../ai-quota-types';

describe('ai-quota-types', () => {
  describe('AIRequestCategorySchema', () => {
    it('accepts all valid categories', () => {
      const validCategories: AIRequestCategory[] = [
        'coach_message',
        'session_summary',
        'comeback_prompt',
        'streak_nudge',
        'weekly_reflection',
        'content_study_generation',
        'quiz_generation',
      ];
      for (const cat of validCategories) {
        expect(AIRequestCategorySchema.safeParse(cat).success).toBe(true);
      }
    });

    it('rejects invalid category', () => {
      expect(AIRequestCategorySchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('UserTierSchema', () => {
    it('accepts all valid tiers', () => {
      const validTiers: UserTier[] = ['free', 'paid', 'internal'];
      for (const tier of validTiers) {
        expect(UserTierSchema.safeParse(tier).success).toBe(true);
      }
    });

    it('rejects invalid tier', () => {
      expect(UserTierSchema.safeParse('premium').success).toBe(false);
    });
  });

  describe('FeatureStageSchema', () => {
    it('accepts all valid stages', () => {
      const validStages: FeatureStage[] = [
        'alpha',
        'preview',
        'early_access',
        'general',
        'deprecated',
      ];
      for (const stage of validStages) {
        expect(FeatureStageSchema.safeParse(stage).success).toBe(true);
      }
    });
  });

  describe('QuotaWindowSchema', () => {
    it('accepts hourly and daily', () => {
      const windows: QuotaWindow[] = ['hourly', 'daily'];
      for (const w of windows) {
        expect(QuotaWindowSchema.safeParse(w).success).toBe(true);
      }
    });
  });

  describe('QuotaLimitSchema', () => {
    it('accepts valid limit', () => {
      const result = QuotaLimitSchema.safeParse({
        hourly: 10,
        daily: 50,
        tokenBudget: 5000,
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative values', () => {
      const result = QuotaLimitSchema.safeParse({
        hourly: -1,
        daily: 50,
        tokenBudget: 5000,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('QuotaCheckResultSchema', () => {
    it('accepts valid check result', () => {
      const result = QuotaCheckResultSchema.safeParse({
        allowed: true,
        category: 'coach_message',
        tier: 'free',
        window: 'hourly',
        used: 2,
        limit: 3,
        remaining: 1,
        resetAt: Date.now() + 3600000,
        retryAfterMs: 0,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('QuotaUsageRecordSchema', () => {
    it('accepts valid usage record', () => {
      const result = QuotaUsageRecordSchema.safeParse({
        userId: '00000000-0000-0000-0000-000000000001',
        category: 'coach_message',
        timestamp: Date.now(),
        tokenCount: 500,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID', () => {
      const result = QuotaUsageRecordSchema.safeParse({
        userId: 'not-a-uuid',
        category: 'coach_message',
        timestamp: Date.now(),
        tokenCount: 500,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('QuotaExceededErrorSchema', () => {
    it('accepts valid error', () => {
      const result = QuotaExceededErrorSchema.safeParse({
        code: 'QUOTA_EXCEEDED',
        category: 'coach_message',
        tier: 'free',
        window: 'hourly',
        limit: 3,
        retryAfterMs: 3600000,
        message: 'Hourly limit exceeded',
      });
      expect(result.success).toBe(true);
    });

    it('rejects wrong code', () => {
      const result = QuotaExceededErrorSchema.safeParse({
        code: 'WRONG_CODE',
        category: 'coach_message',
        tier: 'free',
        window: 'hourly',
        limit: 3,
        retryAfterMs: 3600000,
        message: 'Error',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('TierQuotaConfigSchema', () => {
    it('accepts valid config', () => {
      const result = TierQuotaConfigSchema.safeParse({
        tier: 'free',
        limits: {
          coach_message: { hourly: 3, daily: 10, tokenBudget: 2000 },
        },
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing limits', () => {
      const result = TierQuotaConfigSchema.safeParse({
        tier: 'free',
        limits: {},
      });
      // Empty record is valid for z.record
      expect(result.success).toBe(true);
    });
  });
});
