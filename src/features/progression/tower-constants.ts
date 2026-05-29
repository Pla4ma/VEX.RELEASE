import { z } from "zod";
import { lightColors } from "@/theme/tokens/colors";

export const TowerBlockSchema = z.object({
  id: z.string().uuid(),
  tier: z.number().int().min(1),
  blockNumber: z.number().int().min(1),
  sessionId: z.string().uuid(),
  earnedAt: z.number(),
  bonusType: z.enum([
    "PROGRESS_ACCELERATION",
    "MOMENTUM_RESISTANCE",
    "ENERGY_REGEN",
    "FOCUS_RESILIENCE",
    "FOCUS_DURATION",
    // Legacy — preserved for DB compatibility
    "XP_BOOST",
    "STREAK_RESISTANCE",
    "BOSS_DAMAGE",
  ]),
  bonusValue: z.number(),
  isSpecial: z.boolean().default(false),
});

export const FocusTowerSchema = z.object({
  userId: z.string().uuid(),
  currentTier: z.number().int().min(1).default(1),
  totalBlocks: z.number().int().min(0).default(0),
  blocksThisTier: z.number().int().min(0).default(0),
  maxBlocksPerTier: z.number().int().default(10),
  totalHeight: z.number().default(0),
  towerName: z.string().default("Focus Tower"),
  lastBlockEarnedAt: z.number().nullable(),
  totalBonuses: z.object({
    progressAcceleration: z.number().default(0),
    momentumResistanceHours: z.number().default(0),
    energyRegenBonus: z.number().default(0),
    focusResilienceBonus: z.number().default(0),
    focusDurationBonus: z.number().default(0),
    // Legacy — preserved for DB compatibility
    xpBoostPercent: z.number().default(0),
    streakResistanceHours: z.number().default(0),
    bossDamageBonus: z.number().default(0),
  }),
  achievementsUnlocked: z.array(z.string()).default([]),
});

export type TowerBlock = z.infer<typeof TowerBlockSchema>;
export type FocusTower = z.infer<typeof FocusTowerSchema>;

export const TIER_CONFIG = [
  {
    tier: 1,
    name: "Foundation",
    maxBlocks: 10,
    bonusType: "PROGRESS_ACCELERATION" as const,
    bonusPerBlock: 2,
    color: lightColors.accent.teal,
  },
  {
    tier: 2,
    name: "Apprentice",
    maxBlocks: 10,
    bonusType: "MOMENTUM_RESISTANCE" as const,
    bonusPerBlock: 0.5,
    color: lightColors.primary[400],
  },
  {
    tier: 3,
    name: "Journeyman",
    maxBlocks: 10,
    bonusType: "ENERGY_REGEN" as const,
    bonusPerBlock: 1,
    color: lightColors.accent.teal,
  },
  {
    tier: 4,
    name: "Expert",
    maxBlocks: 10,
    bonusType: "FOCUS_RESILIENCE" as const,
    bonusPerBlock: 3,
    color: lightColors.primary[600],
  },
  {
    tier: 5,
    name: "Master",
    maxBlocks: 10,
    bonusType: "FOCUS_DURATION" as const,
    bonusPerBlock: 5,
    color: lightColors.accent.purple,
  },
  {
    tier: 6,
    name: "Grandmaster",
    maxBlocks: 10,
    bonusType: "PROGRESS_ACCELERATION" as const,
    bonusPerBlock: 5,
    color: lightColors.accent.orange,
  },
  {
    tier: 7,
    name: "Legend",
    maxBlocks: 20,
    bonusType: "MOMENTUM_RESISTANCE" as const,
    bonusPerBlock: 1,
    color: lightColors.error[500],
  },
  {
    tier: 8,
    name: "Mythic",
    maxBlocks: 50,
    bonusType: "ENERGY_REGEN" as const,
    bonusPerBlock: 2,
    color: lightColors.accent.pink,
  },
];

export const MILESTONE_BLOCKS = [10, 25, 50, 100, 250, 500, 1000];

export function getTierConfig(tier: number): (typeof TIER_CONFIG)[number] {
  return TIER_CONFIG[tier - 1] ?? TIER_CONFIG[0]!;
}
