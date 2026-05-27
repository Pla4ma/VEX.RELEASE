import { z } from "zod";

export const AIRequestCategorySchema = z.enum([
  "coach_message",
  "session_summary",
  "comeback_prompt",
  "streak_nudge",
  "weekly_reflection",
  "content_study_generation",
  "quiz_generation",
]);

export type AIRequestCategory = z.infer<typeof AIRequestCategorySchema>;

export const UserTierSchema = z.enum(["free", "paid", "internal"]);

export type UserTier = z.infer<typeof UserTierSchema>;

export const FeatureStageSchema = z.enum([
  "alpha",
  "preview",
  "early_access",
  "general",
  "deprecated",
]);

export type FeatureStage = z.infer<typeof FeatureStageSchema>;

export const QuotaWindowSchema = z.enum(["hourly", "daily"]);

export type QuotaWindow = z.infer<typeof QuotaWindowSchema>;

export const QuotaLimitSchema = z.object({
  hourly: z.number().min(0),
  daily: z.number().min(0),
  tokenBudget: z.number().min(0),
});

export type QuotaLimit = z.infer<typeof QuotaLimitSchema>;

export const TierQuotaConfigSchema = z.object({
  tier: UserTierSchema,
  limits: z.record(AIRequestCategorySchema, QuotaLimitSchema),
});

export type TierQuotaConfig = z.infer<typeof TierQuotaConfigSchema>;

export const QuotaCheckResultSchema = z.object({
  allowed: z.boolean(),
  category: AIRequestCategorySchema,
  tier: UserTierSchema,
  window: QuotaWindowSchema,
  used: z.number(),
  limit: z.number(),
  remaining: z.number(),
  resetAt: z.number(),
  retryAfterMs: z.number(),
});

export type QuotaCheckResult = z.infer<typeof QuotaCheckResultSchema>;

export const QuotaUsageRecordSchema = z.object({
  userId: z.string().uuid(),
  category: AIRequestCategorySchema,
  timestamp: z.number(),
  tokenCount: z.number().min(0),
});

export type QuotaUsageRecord = z.infer<typeof QuotaUsageRecordSchema>;

export const QuotaExceededErrorSchema = z.object({
  code: z.literal("QUOTA_EXCEEDED"),
  category: AIRequestCategorySchema,
  tier: UserTierSchema,
  window: QuotaWindowSchema,
  limit: z.number(),
  retryAfterMs: z.number(),
  message: z.string(),
});

export type QuotaExceededError = z.infer<typeof QuotaExceededErrorSchema>;
