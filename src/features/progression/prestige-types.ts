import { z } from "zod";
import type { UnifiedMasteryState } from "./unified-mastery";

export const PrestigeBonusSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum([
    "XP_BOOST",
    "COIN_BOOST",
    "DROP_CHANCE",
    "DAMAGE_BOOST",
    "TIME_REDUCTION",
    "SPECIAL",
  ]),
  value: z.number(),
  icon: z.string(),
  rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY"]),
});

export type PrestigeBonus = z.infer<typeof PrestigeBonusSchema>;

export interface PrestigeState {
  prestigeLevel: number;
  totalPrestiges: number;
  firstPrestigeAt: number | null;
  lastPrestigeAt: number | null;
  activeBonuses: string[];
  fastestPrestige: number | null;
  mostXpAtPrestige: number | null;
  nightmareUnlocked: boolean;
  nightmareCompletions: number;
}

export interface PrestigeResult {
  success: boolean;
  newState: UnifiedMasteryState;
  prestigeState: PrestigeState;
  bonusesGained: PrestigeBonus[];
  message: string;
}

export interface NightmareModeConfig {
  unlocked: boolean;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  xpMultiplier: number;
  dropChanceMultiplier: number;
  exclusiveRewards: string[];
}
