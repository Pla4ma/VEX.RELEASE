import { z } from 'zod';

export const PrestigeHistoryEntrySchema = z.object({
  prestige: z.number().min(1),
  timestamp: z.number(),
  previousLevel: z.number().min(1),
  gems: z.number().min(0),
  badge: z.string().min(1),
  seasonalBonus: z.number().min(0),
});

export const LevelConfigSchema = z.object({
  baseXP: z.number().default(1000),
  growthFactor: z.number().default(1.5),
  maxLevel: z.number().default(100),
  prestigeEnabled: z.boolean().default(true),
  softCapLevel: z.number().optional(),
  softCapPenalty: z.number().min(0).max(1).default(0.5),
});

export const LevelStateSchema = z.object({
  currentLevel: z.number().min(1).default(1),
  currentXP: z.number().min(0).default(0),
  totalXP: z.number().min(0).default(0),
  prestige: z.number().min(0).default(0),
  xpToNextLevel: z.number().positive(),
  progressPercent: z.number().min(0).max(100),
  prestigeMultiplier: z.number().min(1).default(1),
  lastLevelUpAt: z.number().optional(),
  levelUpHistory: z
    .array(
      z.object({
        level: z.number(),
        achievedAt: z.number(),
        xpAtLevel: z.number(),
      }),
    )
    .default([]),
  prestigeHistory: z.array(PrestigeHistoryEntrySchema).default([]),
});

export const XPSourceSchema = z.enum([
  'SESSION_COMPLETE',
  'STREAK_BONUS',
  'CHALLENGE_BONUS',
  'ACHIEVEMENT_BONUS',
  'SOCIAL_BONUS',
  'EVENT_BONUS',
  'BOOST_BONUS',
  'SEASON_BONUS',
  'AI_COACH_BONUS',
  'COMEBACK_BONUS',
  'DAILY_LOGIN',
]);

export type LevelConfig = z.infer<typeof LevelConfigSchema>;
export type LevelState = z.infer<typeof LevelStateSchema>;
export type PrestigeHistoryEntry = z.infer<typeof PrestigeHistoryEntrySchema>;
export type XPSource = z.infer<typeof XPSourceSchema>;

export interface PrestigeRewardPreview {
  gems: number;
  badge: string;
  seasonalBonus: number;
}

export interface LevelUpEvent {
  userId: string;
  newLevel: number;
  previousLevel: number;
  totalXP: number;
  xpToNextLevel: number;
  prestige: number;
  source: XPSource;
  rewards: string[];
}

export interface XPAddedEvent {
  userId: string;
  amount: number;
  source: XPSource;
  totalXP: number;
  currentLevel: number;
  progressPercent: number;
  streakBonus: number;
  boostBonus: number;
}

export interface PrestigeEvent {
  userId: string;
  prestige: number;
  previousLevel: number;
  resetXP: number;
  multiplier: number;
}

export interface XPBoost {
  multiplier: number;
  expiresAt: number;
}
