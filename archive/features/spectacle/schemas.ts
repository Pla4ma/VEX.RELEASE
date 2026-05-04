/**
 * Spectacle Schemas
 *
 * Zod schemas for validating spectacle payloads.
 * All types are inferred from these schemas.
 */

import { z } from 'zod';
import {
  SpectacleType,
  LootRarity,
  HapticPattern,
  AnimationIntensity,
} from './types';

/**
 * Loot rarity enum schema
 */
export const LootRaritySchema = z.nativeEnum(LootRarity);

/**
 * Spectacle type enum schema
 */
export const SpectacleTypeSchema = z.nativeEnum(SpectacleType);

/**
 * Haptic pattern enum schema
 */
export const HapticPatternSchema = z.nativeEnum(HapticPattern);

/**
 * Animation intensity enum schema
 */
export const AnimationIntensitySchema = z.nativeEnum(AnimationIntensity);

/**
 * Base contributor schema
 */
export const ContributorSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string().min(1).max(100),
  avatarUrl: z.string().url().optional(),
});

/**
 * Base reward item schema
 */
export const RewardItemSchema = z.object({
  type: z.string().min(1),
  amount: z.number().int().min(0),
  rarity: LootRaritySchema.default(LootRarity.COMMON),
  itemId: z.string().optional(),
  name: z.string().optional(),
  icon: z.string().optional(),
});

/**
 * Base spectacle payload schema
 */
export const SpectaclePayloadSchema = z.object({
  userId: z.string().uuid(),
  timestamp: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Boss defeated payload schema
 */
export const BossDefeatedPayloadSchema = SpectaclePayloadSchema.extend({
  bossId: z.string().min(1),
  bossName: z.string().min(1).max(100),
  encounterId: z.string().uuid(),
  damageDealt: z.number().int().min(0),
  contributors: z.array(
    ContributorSchema.extend({
      damageContribution: z.number().int().min(0),
    })
  ),
  rewards: z.array(RewardItemSchema),
});

/**
 * Streak milestone payload schema
 */
export const StreakMilestonePayloadSchema = SpectaclePayloadSchema.extend({
  streakDays: z.number().int().min(0),
  previousStreakDays: z.number().int().min(0),
  milestone: z.union([z.literal(3), z.literal(7), z.literal(14), z.literal(30), z.literal(60), z.literal(100)]),
  rewards: z.array(
    z.object({
      type: z.string().min(1),
      amount: z.number().int().min(0).optional(),
      itemId: z.string().optional(),
    })
  ),
});

/**
 * Level up payload schema
 */
export const LevelUpPayloadSchema = SpectaclePayloadSchema.extend({
  oldLevel: z.number().int().min(1),
  newLevel: z.number().int().min(1),
  levelsGained: z.number().int().min(1),
  tierName: z.string().optional(),
  unlocks: z.array(z.string()).optional(),
});

/**
 * Loot drop payload schema
 */
export const LootDropPayloadSchema = SpectaclePayloadSchema.extend({
  rarity: LootRaritySchema,
  items: z.array(
    z.object({
      type: z.string().min(1),
      amount: z.number().int().min(0),
      itemId: z.string().optional(),
      name: z.string().min(1),
      icon: z.string().min(1),
    })
  ),
  source: z.enum(['SESSION_COMPLETE', 'BOSS_DEFEAT', 'MILESTONE', 'CHEST']),
});

/**
 * Perfect session payload schema
 */
export const PerfectSessionPayloadSchema = SpectaclePayloadSchema.extend({
  sessionId: z.string().uuid(),
  duration: z.number().int().min(1),
  score: z.number().min(95).max(100),
  bonusXp: z.number().int().min(0),
  bonusCoins: z.number().int().min(0),
  gemChance: z.boolean(),
});

/**
 * First session payload schema
 */
export const FirstSessionPayloadSchema = SpectaclePayloadSchema.extend({
  sessionId: z.string().uuid(),
  bossName: z.string().min(1),
  damageDealt: z.number().int().min(0),
  bossHealthRemaining: z.number().int().min(0),
});

/**
 * Prestige payload schema
 */
export const PrestigePayloadSchema = SpectaclePayloadSchema.extend({
  prestigeLevel: z.number().int().min(1),
  previousMaxLevel: z.number().int().min(1),
  rewards: z.array(
    z.object({
      type: z.string().min(1),
      amount: z.number().int().min(0),
    })
  ),
});

/**
 * Squad war victory payload schema
 */
export const SquadWarVictoryPayloadSchema = SpectaclePayloadSchema.extend({
  squadId: z.string().uuid(),
  squadName: z.string().min(1).max(100),
  opponentSquadId: z.string().uuid(),
  opponentSquadName: z.string().min(1).max(100),
  contributors: z.array(
    ContributorSchema.extend({
      contributionScore: z.number().int().min(0),
    })
  ),
  rewards: z.array(
    z.object({
      type: z.string().min(1),
      amount: z.number().int().min(0),
    })
  ),
});

/**
 * Rival beaten payload schema
 */
export const RivalBeatenPayloadSchema = SpectaclePayloadSchema.extend({
  rivalId: z.string().uuid(),
  rivalName: z.string().min(1).max(100),
  duelId: z.string().uuid(),
  score: z.number().int().min(0),
  rivalScore: z.number().int().min(0),
  rewards: z.array(
    z.object({
      type: z.string().min(1),
      amount: z.number().int().min(0),
    })
  ),
});

/**
 * Season completed payload schema
 */
export const SeasonCompletedPayloadSchema = SpectaclePayloadSchema.extend({
  seasonId: z.string().uuid(),
  seasonName: z.string().min(1).max(100),
  finalRank: z.number().int().min(1),
  finalTier: z.number().int().min(1),
  rewards: z.array(RewardItemSchema),
});

/**
 * Monthly report payload schema
 */
export const MonthlyReportPayloadSchema = SpectaclePayloadSchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  startingScore: z.number().int().min(300).max(850),
  endingScore: z.number().int().min(300).max(850),
  change: z.number().int(),
  sessionsCompleted: z.number().int().min(0),
  grade: z.enum(['A+', 'A', 'B+', 'B', 'C', 'D']),
  highlight: z.string().min(1).max(200),
});

/**
 * Wager won payload schema
 */
export const WagerWonPayloadSchema = SpectaclePayloadSchema.extend({
  amount: z.number().int().min(1),
  wagerId: z.string().uuid(),
});

/**
 * Animation config schema
 */
export const AnimationConfigSchema = z.object({
  intensity: AnimationIntensitySchema,
  duration: z.number().int().min(100).max(30000),
  delay: z.number().int().min(0).optional(),
  staggerDelay: z.number().int().min(0).optional(),
});

/**
 * Trigger options schema
 */
export const TriggerSpectacleOptionsSchema = z.object({
  skipAnimation: z.boolean().optional(),
  skipHaptic: z.boolean().optional(),
  customDuration: z.number().int().min(100).optional(),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

/**
 * Spectacle event schema
 */
export const SpectacleEventSchema = z.object({
  type: SpectacleTypeSchema,
  payload: z.union([
    BossDefeatedPayloadSchema,
    StreakMilestonePayloadSchema,
    LevelUpPayloadSchema,
    LootDropPayloadSchema,
    PerfectSessionPayloadSchema,
    FirstSessionPayloadSchema,
    PrestigePayloadSchema,
    SquadWarVictoryPayloadSchema,
    RivalBeatenPayloadSchema,
    SeasonCompletedPayloadSchema,
    MonthlyReportPayloadSchema,
    WagerWonPayloadSchema,
  ]),
  animation: AnimationConfigSchema,
  haptic: HapticPatternSchema,
  autoDismiss: z.boolean().optional(),
  dismissDelay: z.number().int().min(100).optional(),
});

// Export inferred types from schemas
export type BossDefeatedPayloadInput = z.infer<typeof BossDefeatedPayloadSchema>;
export type StreakMilestonePayloadInput = z.infer<typeof StreakMilestonePayloadSchema>;
export type LevelUpPayloadInput = z.infer<typeof LevelUpPayloadSchema>;
export type LootDropPayloadInput = z.infer<typeof LootDropPayloadSchema>;
export type PerfectSessionPayloadInput = z.infer<typeof PerfectSessionPayloadSchema>;
export type FirstSessionPayloadInput = z.infer<typeof FirstSessionPayloadSchema>;
export type PrestigePayloadInput = z.infer<typeof PrestigePayloadSchema>;
export type SquadWarVictoryPayloadInput = z.infer<typeof SquadWarVictoryPayloadSchema>;
export type RivalBeatenPayloadInput = z.infer<typeof RivalBeatenPayloadSchema>;
export type SeasonCompletedPayloadInput = z.infer<typeof SeasonCompletedPayloadSchema>;
export type MonthlyReportPayloadInput = z.infer<typeof MonthlyReportPayloadSchema>;
export type WagerWonPayloadInput = z.infer<typeof WagerWonPayloadSchema>;
export type TriggerSpectacleOptionsInput = z.infer<typeof TriggerSpectacleOptionsSchema>;
