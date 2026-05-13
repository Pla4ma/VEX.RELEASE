import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function applyTowerDecay(
  tower: FocusTower,
  daysInactive: number,
): {
  updatedTower: FocusTower;
  blocksLost: number;
  bonusesLost: Partial<FocusTower['totalBonuses']>;
  canRestore: boolean;
  restoreCost: number; // Gems to restore
} {
  const decayStartDays = 7;

  if (daysInactive < decayStartDays) {
    return {
      updatedTower: tower,
      blocksLost: 0,
      bonusesLost: {},
      canRestore: false,
      restoreCost: 0,
    };
  }

  // Calculate blocks to lose (1 block per 2 days after threshold)
  const blocksLost = Math.min(
    Math.floor((daysInactive - decayStartDays) / 2),
    Math.max(1, Math.floor(tower.totalBlocks * 0.05)), // Min 1, max 5% per decay cycle
  );

  // Remove last N blocks
  const newTotalBlocks = Math.max(0, tower.totalBlocks - blocksLost);
  const newHeight = Math.max(0, tower.totalHeight - blocksLost * 0.8);

  // Recalculate bonuses (simplified - in real implementation, track block history)
  const decayFactor = newTotalBlocks / tower.totalBlocks;
  const bonusesLost: Partial<FocusTower['totalBonuses']> = {};

  const updatedTower: FocusTower = {
    ...tower,
    totalBlocks: newTotalBlocks,
    totalHeight: newHeight,
    totalBonuses: {
      xpBoostPercent: Math.floor(tower.totalBonuses.xpBoostPercent * decayFactor),
      streakResistanceHours: Math.floor(tower.totalBonuses.streakResistanceHours * decayFactor * 10) / 10,
      energyRegenBonus: Math.floor(tower.totalBonuses.energyRegenBonus * decayFactor * 10) / 10,
      bossDamageBonus: Math.floor(tower.totalBonuses.bossDamageBonus * decayFactor * 10) / 10,
      focusDurationBonus: Math.floor(tower.totalBonuses.focusDurationBonus * decayFactor * 10) / 10,
    },
  };

  const restoreCost = blocksLost * 25; // 25 gems per block to restore

  // Publish event
  eventBus.publish('focus_tower:decay', {
    userId: tower.userId,
    daysInactive,
    decayAmount: blocksLost,
  });

  return {
    updatedTower,
    blocksLost,
    bonusesLost,
    canRestore: true,
    restoreCost,
  };
}

export function restoreTowerBlocks(
  tower: FocusTower,
  blocksToRestore: number,
  gemsSpent: number,
): {
  success: boolean;
  updatedTower: FocusTower;
  blocksRestored: number;
  error?: string;
} {
  const maxRestorable = Math.min(blocksToRestore, tower.totalBlocks); // Can't restore more than current
  const cost = maxRestorable * 25;

  if (gemsSpent < cost) {
    return {
      success: false,
      updatedTower: tower,
      blocksRestored: 0,
      error: `Need ${cost} gems to restore ${maxRestorable} blocks`,
    };
  }

  // In a real implementation, we'd need the block history to restore exact bonuses
  // For now, approximate the restoration
  const restoredBonuses = {
    xpBoostPercent: Math.floor(tower.totalBonuses.xpBoostPercent * (maxRestorable / tower.totalBlocks + 1)),
    streakResistanceHours: tower.totalBonuses.streakResistanceHours + maxRestorable * 0.5,
    energyRegenBonus: tower.totalBonuses.energyRegenBonus + maxRestorable * 1,
    bossDamageBonus: tower.totalBonuses.bossDamageBonus + maxRestorable * 3,
    focusDurationBonus: tower.totalBonuses.focusDurationBonus + maxRestorable * 5,
  };

  const updatedTower: FocusTower = {
    ...tower,
    totalBlocks: tower.totalBlocks + maxRestorable,
    totalHeight: tower.totalHeight + maxRestorable,
    totalBonuses: restoredBonuses,
  };

  (eventBus as any).publish('focus_tower:restored', {
    userId: tower.userId,
    blocksRestored: maxRestorable,
    gemsSpent: cost,
  });

  return {
    success: true,
    updatedTower,
    blocksRestored: maxRestorable,
  };
}

export function getTowerDisplay(tower: FocusTower): {
  height: string;
  tierName: string;
  tierColor: string;
  nextMilestone: number;
  progressToMilestone: number;
  totalBonusesText: string;
} {
  const tierConfig = TIER_CONFIG[tower.currentTier - 1] || TIER_CONFIG[TIER_CONFIG.length - 1];

  // Find next milestone
  const nextMilestone = MILESTONE_BLOCKS.find((m) => m > tower.totalBlocks) || 1000;
  const progressToMilestone = Math.floor(((tower.totalBlocks % nextMilestone) / nextMilestone) * 100);

  // Format bonuses
  const bonuses = [];
  if (tower.totalBonuses.xpBoostPercent > 0) {
    bonuses.push(`+${tower.totalBonuses.xpBoostPercent}% XP`);
  }
  if (tower.totalBonuses.streakResistanceHours > 0) {
    bonuses.push(`+${tower.totalBonuses.streakResistanceHours}h streak buffer`);
  }
  if (tower.totalBonuses.bossDamageBonus > 0) {
    bonuses.push(`+${tower.totalBonuses.bossDamageBonus}% boss damage`);
  }

  return {
    height: `${Math.floor(tower.totalHeight)}m`,
    tierName: tierConfig.name,
    tierColor: tierConfig.color,
    nextMilestone,
    progressToMilestone,
    totalBonusesText: bonuses.join(' • ') || 'Build your tower for bonuses!',
  };
}