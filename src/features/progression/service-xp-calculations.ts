import { XpBreakdownSchema, type XpBreakdown } from "./schemas";
import { getProgressionServiceConfig } from "./service-config";

export interface BreakdownParams {
  baseAmount: number;
  streakDays: number;
  squadMultiplier: number;
  bossActive: boolean;
  perfectSession: boolean;
  comebackActive: boolean;
}

export function calculateLevelThreshold(level: number): number {
  if (level <= 1) {
    return 100;
  }
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

export function calculateTotalXpToLevel(targetLevel: number): number {
  let total = 0;
  for (let level = 1; level < targetLevel; level++) {
    total += calculateLevelThreshold(level);
  }
  return total;
}

export function calculateLevelFromTotalXp(totalXp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let remainingXp = totalXp;
  const { maxLevel } = getProgressionServiceConfig();

  while (remainingXp >= xpNeeded && level < maxLevel) {
    remainingXp -= xpNeeded;
    level++;
    xpNeeded = calculateLevelThreshold(level);
  }

  return level;
}

export function calculateProgressPercent(
  currentXp: number,
  currentLevel: number,
): number {
  const threshold = calculateLevelThreshold(currentLevel);
  return Math.min(100, Math.floor((currentXp / threshold) * 100));
}

export function calculateXpBreakdown(params: BreakdownParams): XpBreakdown {
  const base = params.baseAmount;
  let streakMultiplier = 1;
  if (params.streakDays >= 30) {
    streakMultiplier = 2;
  } else if (params.streakDays >= 14) {
    streakMultiplier = 1.75;
  } else if (params.streakDays >= 7) {
    streakMultiplier = 1.5;
  } else if (params.streakDays >= 3) {
    streakMultiplier = 1.25;
  }

  const streakBonus = Math.floor(base * (streakMultiplier - 1));
  const squadBonus =
    params.squadMultiplier > 1
      ? Math.floor(base * (params.squadMultiplier - 1))
      : 0;
  const bossBonus = params.bossActive ? Math.floor(base * 0.2) : 0;
  const perfectBonus = params.perfectSession ? Math.floor(base * 0.15) : 0;
  const comebackBonus = params.comebackActive ? Math.floor(base * 0.1) : 0;
  const total =
    base + streakBonus + squadBonus + bossBonus + perfectBonus + comebackBonus;

  return XpBreakdownSchema.parse({
    base,
    streakBonus,
    squadBonus,
    bossBonus,
    perfectBonus,
    comebackBonus,
    total,
  });
}
