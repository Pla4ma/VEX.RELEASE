import type { AchievementRarity } from "../types";
import { lightColors } from "@/theme/tokens/colors";

export const RARITY_CONFIG: Record<
  AchievementRarity,
  { points: number; color: string }
> = {
  COMMON: { points: 10, color: lightColors.text.disabled },
  UNCOMMON: { points: 25, color: lightColors.success[500] },
  RARE: { points: 50, color: lightColors.accent.blue },
  EPIC: { points: 100, color: lightColors.accent.purple },
  LEGENDARY: { points: 250, color: lightColors.accent.orange },
};
