import * as Sentry from "@sentry/react-native";
import { eventBus } from "../../events";
import type { FocusTower } from "./tower-constants";

export function calculateTowerChurnRisk(
  tower: FocusTower,
  daysInactive: number,
): {
  riskLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  daysUntilDecay: number;
  decayWarning: string;
  wouldLose: string;
} {
  const decayStartDays = 3;
  const criticalDecayDays = 7;
  if (daysInactive < decayStartDays) {
    return {
      riskLevel: "NONE",
      daysUntilDecay: decayStartDays - daysInactive,
      decayWarning: "",
      wouldLose: "",
    };
  }
  if (daysInactive < criticalDecayDays) {
    const daysToCritical = criticalDecayDays - daysInactive;
    return {
      riskLevel: daysInactive > 5 ? "MEDIUM" : "LOW",
      daysUntilDecay: daysToCritical,
      decayWarning: `Warning! Your tower weakens in ${daysToCritical} days!`,
      wouldLose: "Recent progress bonus",
    };
  }
  const blocksLost = Math.min(
    Math.floor((daysInactive - criticalDecayDays) / 2),
    Math.floor(tower.totalBlocks * 0.1),
  );
  return {
    riskLevel: "CRITICAL",
    daysUntilDecay: 0,
    decayWarning: `CRITICAL: You've lost ${blocksLost} blocks from inactivity!`,
    wouldLose: `${blocksLost} tower blocks and their bonuses`,
  };
}

export function applyTowerDecay(
  tower: FocusTower,
  daysInactive: number,
): {
  updatedTower: FocusTower;
  blocksLost: number;
  bonusesLost: Partial<FocusTower["totalBonuses"]>;
  canRestore: boolean;
  restoreCost: number;
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
  const blocksLost = Math.min(
    Math.floor((daysInactive - decayStartDays) / 2),
    Math.max(1, Math.floor(tower.totalBlocks * 0.05)),
  );
  const newTotalBlocks = Math.max(0, tower.totalBlocks - blocksLost);
  const newHeight = Math.max(0, tower.totalHeight - blocksLost * 0.8);
  const decayFactor = newTotalBlocks / tower.totalBlocks;
  const bonusesLost: Partial<FocusTower["totalBonuses"]> = {};
  const updatedTower: FocusTower = {
    ...tower,
    totalBlocks: newTotalBlocks,
    totalHeight: newHeight,
    totalBonuses: {
      xpBoostPercent: Math.floor(
        tower.totalBonuses.xpBoostPercent * decayFactor,
      ),
      streakResistanceHours:
        Math.floor(
          tower.totalBonuses.streakResistanceHours * decayFactor * 10,
        ) / 10,
      energyRegenBonus:
        Math.floor(tower.totalBonuses.energyRegenBonus * decayFactor * 10) / 10,
      bossDamageBonus:
        Math.floor(tower.totalBonuses.bossDamageBonus * decayFactor * 10) / 10,
      focusDurationBonus:
        Math.floor(tower.totalBonuses.focusDurationBonus * decayFactor * 10) /
        10,
    },
  };
  const restoreCost = blocksLost * 25;
  eventBus.publish("focus_tower:decay", {
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
  const maxRestorable = Math.min(blocksToRestore, tower.totalBlocks);
  const cost = maxRestorable * 25;
  if (gemsSpent < cost) {
    return {
      success: false,
      updatedTower: tower,
      blocksRestored: 0,
      error: `Need ${cost} gems to restore ${maxRestorable} blocks`,
    };
  }
  const restoredBonuses = {
    xpBoostPercent: Math.floor(
      tower.totalBonuses.xpBoostPercent *
        (maxRestorable / tower.totalBlocks + 1),
    ),
    streakResistanceHours:
      tower.totalBonuses.streakResistanceHours + maxRestorable * 0.5,
    energyRegenBonus: tower.totalBonuses.energyRegenBonus + maxRestorable * 1,
    bossDamageBonus: tower.totalBonuses.bossDamageBonus + maxRestorable * 3,
    focusDurationBonus:
      tower.totalBonuses.focusDurationBonus + maxRestorable * 5,
  };
  const updatedTower: FocusTower = {
    ...tower,
    totalBlocks: tower.totalBlocks + maxRestorable,
    totalHeight: tower.totalHeight + maxRestorable,
    totalBonuses: restoredBonuses,
  };
  eventBus.publish("focus_tower:restored", {
    userId: tower.userId,
    restoredTier: tower.currentTier,
    previousTier: tower.currentTier,
  });
  return { success: true, updatedTower, blocksRestored: maxRestorable };
}

export function trackTowerProgress(tower: FocusTower, source: string): void {
  Sentry.addBreadcrumb({
    category: "focus_tower",
    message: `Tower progress: ${tower.totalBlocks} blocks, tier ${tower.currentTier}`,
    data: {
      userId: tower.userId,
      totalBlocks: tower.totalBlocks,
      currentTier: tower.currentTier,
      totalBonuses: tower.totalBonuses,
      source,
    },
  });
}
