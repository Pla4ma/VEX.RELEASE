import { z } from 'zod';

export const SeasonSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().nullable(),
  theme: z.string().nullable(),
  startAt: z.number().int(),
  endAt: z.number().int(),
  tierCount: z.number().int().positive(),
  xpPerTier: z.number().int().positive(),
  premiumPriceGems: z.number().int().nonnegative(),
  isActive: z.boolean(),
  createdAt: z.number().int(),
}).strict();

export const UserSeasonProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  seasonId: z.string().uuid(),
  currentTier: z.number().int().nonnegative(),
  tierXp: z.number().int().nonnegative(),
  totalSeasonXp: z.number().int().nonnegative(),
  isPremium: z.boolean(),
  premiumPurchasedAt: z.number().int().nullable(),
  claimedTiers: z.array(z.string()),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
}).strict();

export const SeasonRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  theme: z.string().nullable(),
  start_at: z.string(),
  end_at: z.string(),
  tier_count: z.number(),
  xp_per_tier: z.number(),
  premium_price_gems: z.number(),
  is_active: z.boolean().nullable(),
  created_at: z.string().nullable(),
}).passthrough();

export const UserSeasonProgressRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  season_id: z.string().uuid(),
  current_tier: z.number().nullable(),
  tier_xp: z.number().nullable(),
  total_season_xp: z.number().nullable(),
  is_premium: z.boolean().nullable(),
  premium_purchased_at: z.string().nullable(),
  claimed_tiers: z.array(z.string()).nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
}).passthrough();

export type Season = z.infer<typeof SeasonSchema>;
export type UserSeasonProgress = z.infer<typeof UserSeasonProgressSchema>;
export type SeasonRow = z.infer<typeof SeasonRowSchema>;
export type UserSeasonProgressRow = z.infer<typeof UserSeasonProgressRowSchema>;
