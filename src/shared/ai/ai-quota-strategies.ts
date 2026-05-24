import type { TierQuotaConfig, UserTier } from './ai-quota-types';

export const DEFAULT_QUOTA_STRATEGIES: Record<UserTier, TierQuotaConfig> = {
  free: {
    tier: 'free',
    limits: {
      coach_message: { hourly: 3, daily: 10, tokenBudget: 2000 },
      session_summary: { hourly: 2, daily: 5, tokenBudget: 8000 },
      comeback_prompt: { hourly: 1, daily: 3, tokenBudget: 4000 },
      streak_nudge: { hourly: 3, daily: 6, tokenBudget: 1500 },
      weekly_reflection: { hourly: 0, daily: 1, tokenBudget: 16000 },
      content_study_generation: { hourly: 1, daily: 3, tokenBudget: 60000 },
      quiz_generation: { hourly: 2, daily: 5, tokenBudget: 12000 },
    },
  },
  paid: {
    tier: 'paid',
    limits: {
      coach_message: { hourly: 15, daily: 50, tokenBudget: 10000 },
      session_summary: { hourly: 10, daily: 20, tokenBudget: 40000 },
      comeback_prompt: { hourly: 5, daily: 10, tokenBudget: 12000 },
      streak_nudge: { hourly: 10, daily: 20, tokenBudget: 5000 },
      weekly_reflection: { hourly: 2, daily: 4, tokenBudget: 64000 },
      content_study_generation: { hourly: 5, daily: 15, tokenBudget: 300000 },
      quiz_generation: { hourly: 10, daily: 25, tokenBudget: 60000 },
    },
  },
  internal: {
    tier: 'internal',
    limits: {
      coach_message: { hourly: 50, daily: 200, tokenBudget: 50000 },
      session_summary: { hourly: 30, daily: 100, tokenBudget: 200000 },
      comeback_prompt: { hourly: 20, daily: 50, tokenBudget: 60000 },
      streak_nudge: { hourly: 30, daily: 100, tokenBudget: 25000 },
      weekly_reflection: { hourly: 10, daily: 20, tokenBudget: 320000 },
      content_study_generation: { hourly: 20, daily: 50, tokenBudget: 1500000 },
      quiz_generation: { hourly: 30, daily: 100, tokenBudget: 300000 },
    },
  },
};

export const CATEGORY_FEATURE_STAGES: Record<string, string> = {
  coach_message: 'general',
  session_summary: 'general',
  comeback_prompt: 'general',
  streak_nudge: 'general',
  weekly_reflection: 'early_access',
  content_study_generation: 'preview',
  quiz_generation: 'preview',
};

export const HOURLY_WINDOW_MS = 60 * 60 * 1000;
export const DAILY_WINDOW_MS = 24 * 60 * 60 * 1000;
