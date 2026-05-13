import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function applyMysteryMultiplier(baseXp: number, multiplier: MysteryMultiplier | null): { finalXp: number; wasMultiplied: boolean; multiplierValue: number } {
  if (!multiplier || !multiplier.triggered) {
    return { finalXp: baseXp, wasMultiplied: false, multiplierValue: 1 };
  }

  const finalXp = Math.floor(baseXp * multiplier.multiplier);

  // Publish celebration event
  eventBus.publish('mystery_multiplier:applied', {
    userId: multiplier.userId,
    baseXp,
    finalXp,
    multiplier: multiplier.multiplier,
    sessionId: multiplier.sessionId,
  } as any);

  return { finalXp, wasMultiplied: true, multiplierValue: multiplier.multiplier };
}

export function getChestDisplay(type: ChestType): {
  name: string;
  color: string;
  icon: string;
  description: string;
  animation: string;
} {
  const config = CHEST_DROP_TABLES[type];
  const icons: Record<string, string> = {
    COMMON: '📦',
    RARE: '💎',
    EPIC: '👑',
    LEGENDARY: '🔥',
    MYTHIC: '🌟',
  };

  return {
    name: config.name,
    color: config.color,
    icon: icons[type],
    description: `${config.guaranteedRewards.length} guaranteed + ${config.bonusRolls} bonus rewards`,
    animation: type === 'MYTHIC' ? 'rainbow-pulse' : type === 'LEGENDARY' ? 'glow-pulse' : 'bounce',
  };
}

export function getMultiplierDisplay(multiplier: number): {
  text: string;
  color: string;
  celebration: string;
} {
  const displays: Record<number, { text: string; color: string; celebration: string }> = {
    2: { text: '2X BONUS!', color: 'theme.colors.primary[500]', celebration: 'Nice!' },
    3: { text: '3X BONUS!', color: 'theme.colors.primary[500]', celebration: 'Great!' },
    5: { text: '5X JACKPOT!', color: 'theme.colors.primary[500]', celebration: 'Amazing!' },
    10: { text: '10X LEGENDARY!', color: 'theme.colors.error.DEFAULT', celebration: 'INCREDIBLE!' },
  };

  return displays[multiplier] || { text: `${multiplier}X`, color: 'theme.colors.primary[500]', celebration: 'Bonus!' };
}

export function formatChestOpeningSequence(
  chestType: ChestType,
  rewards: ChestReward[],
): Array<{
  delay: number;
  reward: ChestReward;
  revealType: 'slide' | 'pop' | 'spin';
}> {
  const revealTypes: Array<'slide' | 'pop' | 'spin'> = ['slide', 'pop', 'spin', 'slide', 'pop'];

  return rewards.map((reward, index) => ({
    delay: index * 800, // 800ms between each reveal
    reward,
    revealType: revealTypes[index % revealTypes.length],
  }));
}

export function trackChestAnalytics(chestType: ChestType, rewards: ChestReward[], source: Chest['source']): void {
  const rarityCounts: Record<string, number> = { COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 };
  rewards.forEach((r) => rarityCounts[r.rarity]++);

  Sentry.addBreadcrumb({
    category: 'chest_analytics',
    message: `${chestType} chest opened from ${source}`,
    data: {
      chestType,
      source,
      totalRewards: rewards.length,
      rarityDistribution: rarityCounts,
    },
  });
}