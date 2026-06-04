/**
 * AI Quota Service
 *
 * Determines how many AI coach requests a user can make
 * per hour/day based on their tier (free vs paid).
 */

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
import { useMonetizationStore } from '../monetization/store';

/**
 * Resolve the user's tier by checking RevenueCat entitlements.
 * Falls back to 'free' on any error — safe default.
 *
 * Uses Zustand's synchronous getState() which is safe to call
 * outside React component tree (P0-2 fix).
 */
export async function resolveUserTier(userId: string): Promise<UserTier> {
  try {
    const { isPremium, activeEntitlements } =
      useMonetizationStore.getState();

    if (isPremium) {
      return 'paid';
    }

    // Also check for VIP entitlement directly (defense in depth)
    const hasVip = activeEntitlements.some(
      (ent) =>
        ent.isActive &&
        (ent.identifier === 'vip' || ent.identifier === 'premium'),
    );

    if (hasVip) {
      return 'paid';
    }
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'ai-quota',
      operation: 'resolve-tier',
      type: 'logic',
    });
  }

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
    };
  }

  const hourlyUsed = await getHourlyUsage(userId, category);
  const dailyUsed = await getDailyUsage(userId, category);

  const hourlyRemaining = Math.max(0, limits.hourly - hourlyUsed);
  const dailyRemaining = Math.max(0, limits.daily - dailyUsed);

  const allowed = hourlyRemaining > 0 && dailyRemaining > 0;
  const window = !allowed && hourlyRemaining === 0 ? 'hourly' : 'daily';

  return QuotaCheckResultSchema.parse({
    allowed,
    category,
    tier: resolvedTier,
    window,
    used: window === 'hourly' ? hourlyUsed : dailyUsed,
    limit: window === 'hourly' ? limits.hourly : limits.daily,
    remaining: window === 'hourly' ? hourlyRemaining : dailyRemaining,
    resetAt:
      window === 'hourly'
        ? Date.now() + HOURLY_WINDOW_MS
        : Date.now() + DAILY_WINDOW_MS,
  });
}

export async function recordAIUsage(
  userId: string,
  category: AIRequestCategory,
): Promise<void> {
  try {
    await recordUsage(userId, category);
    await syncQuotaToSupabase(userId, category);
  } catch (error) {
    captureSilentFailure(error, {
      feature: 'ai-quota',
      operation: 'record-usage',
      type: 'network',
    });
  }
}
