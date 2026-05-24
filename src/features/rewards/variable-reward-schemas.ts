import { z } from "zod";

export const ChestTypeSchema = z.enum([
  "COMMON",
  "RARE",
  "EPIC",
  "LEGENDARY",
  "MYTHIC",
]);
export const ChestRewardSchema = z.object({
  type: z.enum([
    "COINS",
    "GEMS",
    "XP_BOOST",
    "STREAK_SHIELD",
    "COSMETIC",
    "TITLE",
    "BOSS_RETRY",
    "ENERGY_REFILL",
  ]),
  amount: z.number().int().min(1),
  rarity: z.enum(["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"]),
  dropChance: z.number().min(0).max(1),
});
export const ChestSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: ChestTypeSchema,
  source: z.enum([
    "DAILY_REWARD",
    "BATTLE_PASS",
    "BOSS_DEFEAT",
    "SHOP_PURCHASE",
    "ACHIEVEMENT",
    "EVENT",
  ]),
  opened: z.boolean().default(false),
  rewards: z.array(ChestRewardSchema).nullable(),
  createdAt: z.number(),
  openedAt: z.number().nullable(),
});
export const MysteryMultiplierSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  multiplier: z.number().min(2).max(10),
  chance: z.number().min(0).max(1),
  triggered: z.boolean().default(false),
  sessionId: z.string().uuid().nullable(),
  triggeredAt: z.number().nullable(),
  expiresAt: z.number().nullable(),
});

export type ChestType = z.infer<typeof ChestTypeSchema>;
export type ChestReward = z.infer<typeof ChestRewardSchema>;
export type Chest = z.infer<typeof ChestSchema>;
export type MysteryMultiplier = z.infer<typeof MysteryMultiplierSchema>;
