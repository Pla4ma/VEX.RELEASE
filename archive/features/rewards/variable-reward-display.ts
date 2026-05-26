import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import {
  CHEST_DROP_TABLES,
  CHEST_ICONS,
  MULTIPLIER_DISPLAYS,
} from "./chest-config";
import type { Chest, ChestReward, ChestType } from "./variable-reward-system";

export function getChestDisplay(
  type: ChestType,
): { name: string; color: string; icon: string; description: string; animation: string } {
  const config = CHEST_DROP_TABLES[type];
  const animation = type === "MYTHIC" ? "rainbow-pulse" : type === "LEGENDARY" ? "glow-pulse" : "bounce";
  return {
    name: config?.name ?? type,
    color: config?.color ?? "neutral",
    icon: CHEST_ICONS[type] ?? "box",
    description: config ? `${config.guaranteedRewards.length} guaranteed + ${config.bonusRolls} bonus rewards` : "",
    animation,
  };
}

export function getMultiplierDisplay(
  multiplier: number,
): { text: string; color: string; celebration: string } {
  return MULTIPLIER_DISPLAYS[multiplier] ?? {
    text: `${multiplier}X`,
    color: "neutral",
    celebration: "Bonus!",
  };
}

export function formatChestOpeningSequence(
  _chestType: ChestType,
  rewards: ChestReward[],
): Array<{ delay: number; reward: ChestReward; revealType: "slide" | "pop" | "spin" }> {
  const revealTypes: Array<"slide" | "pop" | "spin"> = ["slide", "pop", "spin", "slide", "pop"];
  return rewards.map((reward, index) => ({
    delay: index * 800,
    reward,
    revealType: revealTypes[index % revealTypes.length] ?? "slide",
  }));
}

export function trackChestAnalytics(
  chestType: ChestType,
  rewards: ChestReward[],
  source: Chest["source"],
): void {
  const rarityCounts: Record<string, number> = {
    COMMON: 0,
    UNCOMMON: 0,
    RARE: 0,
    EPIC: 0,
    LEGENDARY: 0,
  };
  rewards.forEach((reward) => {
    const count = rarityCounts[reward.rarity];
    if (count !== undefined) rarityCounts[reward.rarity] = count + 1;
  });
  eventBus.publish("chest:analytics_recorded", { chestType, source, totalRewards: rewards.length });
  Sentry.addBreadcrumb({
    category: "chest_analytics",
    message: `${chestType} chest opened from ${source}`,
    data: { chestType, source, totalRewards: rewards.length, rarityDistribution: rarityCounts },
  });
}
