import { z } from 'zod';
import type {
  AIRequestCategory,
  QuotaCheckResult,
  UserTier,
} from './ai-quota-types';
import { QuotaCheckResultSchema } from './ai-quota-types';
import {
  DEFAULT_QUOTA_STRATEGIES,
  HOURLY_WINDOW_MS,
  DAILY_WINDOW_MS,
} from './ai-quota-strategies';
import {
  getHourlyUsage,
  getDailyUsage,
  recordUsage,
  syncQuotaToSupabase,
} from './ai-quota-repository';
import { captureSilentFailure } from '../../utils/silent-failure';

export async function resolveUserTier(userId: string): Promise<UserTier> {
  // Default to free; paid detection hooks into monetization layer
  // Internal users are identified by a config flag or email domain
  return 'free';
}

export async function checkQuota(
  userId: string,
  category: AIRequestCategory,
  tier?: UserTier,
): Promise<QuotaCheckResult> {
  const resolvedTier = tier ?? (await resolveUserTier(userId));
  const limits = DEFAULT_QUOTA_STRATEGIES[resolvedTier].limits[category];
  if (!limits) {
    return {
      allowed: true,
      category,
      tier: resolvedTier,
      window: 'hourly',
      used: 0,
      limit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      resetAt: Date.now() + HOURLY_WINDOW_MS,
      retryAfterMs: 0,
    };
  }

  const hourly = getHourlyUsage(userId, category);
  if (hourly.count >= limits.hourly) {
    return QuotaCheckResultSchema.parse({
      allowed: false,
      category,
      tier: resolvedTier,
      window: 'hourly',
      used: hourly.count,
      limit: limits.hourly,
      remaining: 0,
      resetAt: Date.now() + HOURLY_WINDOW_MS,
      retryAfterMs: HOURLY_WINDOW_MS,
    });
  }

  const daily = getDailyUsage(userId, category);
  if (daily.count >= limits.daily) {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return QuotaCheckResultSchema.parse({
      allowed: false,
      category,
      tier: resolvedTier,
      window: 'daily',
      used: daily.count,
      limit: limits.daily,
      remaining: 0,
      resetAt: midnight.getTime(),
      retryAfterMs: midnight.getTime() - Date.now(),
    });
  }

  if (daily.tokenCount >= limits.tokenBudget) {
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return QuotaCheckResultSchema.parse({
      allowed: false,
      category,
      tier: resolvedTier,
      window: 'daily',
      used: daily.tokenCount,
      limit: limits.tokenBudget,
      remaining: 0,
      resetAt: midnight.getTime(),
      retryAfterMs: midnight.getTime() - Date.now(),
    });
  }

  return QuotaCheckResultSchema.parse({
    allowed: true,
    category,
    tier: resolvedTier,
    window: 'hourly',
    used: hourly.count,
    limit: limits.hourly,
    remaining: limits.hourly - hourly.count - 1,
    resetAt: Date.now() + HOURLY_WINDOW_MS,
    retryAfterMs: 0,
  });
}

export async function consumeQuota(
  userId: string,
  category: AIRequestCategory,
  tokenCount: number,
): Promise<QuotaCheckResult> {
  const check = await checkQuota(userId, category);
  if (!check.allowed) {
    return check;
  }

  const record = {
    userId,
    category,
    timestamp: Date.now(),
    tokenCount,
  };

  recordUsage(record);
  syncQuotaToSupabase(userId, category, record).catch((err) => {
    captureSilentFailure(err, {
      feature: 'ai-quota',
      operation: 'sync',
      type: 'network',
    });
  });

  return check;
}

export function getRemainingQuota(
  userId: string,
  category: AIRequestCategory,
  tier?: UserTier,
): { hourly: number; daily: number; tokenBudget: number } {
  const resolvedTier = tier ?? 'free';
  const limits = DEFAULT_QUOTA_STRATEGIES[resolvedTier].limits[category];
  if (!limits) {
    return {
      hourly: Number.MAX_SAFE_INTEGER,
      daily: Number.MAX_SAFE_INTEGER,
      tokenBudget: Number.MAX_SAFE_INTEGER,
    };
  }
  const hourly = getHourlyUsage(userId, category);
  const daily = getDailyUsage(userId, category);
  return {
    hourly: Math.max(0, limits.hourly - hourly.count),
    daily: Math.max(0, limits.daily - daily.count),
    tokenBudget: Math.max(0, limits.tokenBudget - daily.tokenCount),
  };
}
