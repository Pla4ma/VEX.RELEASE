import { useEffect } from 'react';

import type { HeadlineReward } from '../../src/features/session-completion/headline-reward.schemas';

type ChestRarity = 'common' | 'rare' | 'epic' | 'legendary';

interface ChestResult {
  rarity: ChestRarity;
  rewards: HeadlineReward[];
  rolledAt: number;
}

let cachedChest: ChestResult | null = null;

export function rollChest(): ChestResult {
  const roll = Math.random();
  let rarity: ChestRarity;
  if (roll < 0.5) rarity = 'common';
  else if (roll < 0.8) rarity = 'rare';
  else if (roll < 0.95) rarity = 'epic';
  else rarity = 'legendary';

  cachedChest = {
    rarity,
    rewards: [],
    rolledAt: Date.now(),
  };
  return cachedChest;
}

export function prepareChest(): void {
  rollChest();
}

export function getCachedChest(): ChestResult | null {
  return cachedChest;
}

export function applyChestRewards(
  creditSessionRewards: (userId: string, rewards: HeadlineReward[]) => Promise<HeadlineReward[]>,
  userId: string,
): Promise<HeadlineReward[]> {
  const chest = cachedChest;
  if (!chest) {
    prepareChest();
  }
  const rewards = cachedChest?.rewards ?? [];
  return creditSessionRewards(userId, rewards);
}

export function useSessionCompleteChest(): {
  prepareChest: () => void;
  rollChest: () => ChestResult;
  getCachedChest: () => ChestResult | null;
} {
  useEffect(() => {
    void prepareChest();
  }, []);

  return { prepareChest, rollChest, getCachedChest };
}
