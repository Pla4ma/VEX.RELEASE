import { launchColors } from "@theme/tokens/launch-colors";
/**
 * Colors below are documented game-mechanic config data — not UI styling.
 * Mapped to theme.colors.accent.* and theme.colors.semantic.* where applicable.
 */
export type ChestTier = "WOOD" | "SILVER" | "GOLD" | "LEGENDARY";

export interface TierConfig {
  colors: readonly string[];
  emoji: string;
  label: string;
  glow: string;
}

export const TIER_CONFIG: Record<ChestTier, TierConfig> = {
  WOOD: {
    colors: [launchColors.hex_8b4513, launchColors.hex_654321] as const,
    emoji: "📦",
    label: "Wood Chest",
    glow: launchColors.hex_8b4513,
  },
  SILVER: {
    colors: [launchColors.hex_c0c0c0, launchColors.hex_808080] as const,
    emoji: "🥈",
    label: "Silver Chest",
    glow: launchColors.hex_c0c0c0,
  },
  GOLD: {
    colors: [launchColors.hex_ffd700, launchColors.hex_ffa000] as const,
    emoji: "🏆",
    label: "Gold Chest",
    glow: launchColors.hex_ffd700,
  },
  LEGENDARY: {
    colors: [
      launchColors.hex_ffd700,
      launchColors.hex_ff6b35,
      launchColors.hex_8b5cf6,
    ] as const,
    emoji: "👑",
    label: "Legendary Chest",
    glow: launchColors.hex_ff6b35,
  },
};
