import { z } from "zod";
import type { UnifiedMasteryState } from "./unified-mastery";


export function calculatePrestigeBonuses(prestigeLevel: number, _totalXp: number): PrestigeBonus[] {
  const bonuses: PrestigeBonus[] = [];

  // Always get one bonus per prestige
  const availableBonuses = PRESTIGE_BONUSES.filter((b) => {
    if (b.rarity === 'COMMON') {
      return prestigeLevel >= 1;
    }
    if (b.rarity === 'RARE') {
      return prestigeLevel >= 4;
    }
    if (b.rarity === 'EPIC') {
      return prestigeLevel >= 7;
    }
    if (b.rarity === 'LEGENDARY') {
      return prestigeLevel >= 10;
    }
    return false;
  });

  // Select based on prestige level and total XP
  const bonusCount = Math.min(3, 1 + Math.floor(prestigeLevel / 3));

  for (let i = 0; i < bonusCount && i < availableBonuses.length; i++) {
    // Deterministic selection based on prestige level
    const index = (prestigeLevel * 7 + i * 13) % availableBonuses.length;
    bonuses.push(availableBonuses[index]);
  }

  return bonuses;
}

export function executePrestige(masteryState: UnifiedMasteryState, prestigeState: PrestigeState): PrestigeResult {
  const check = canPrestige(masteryState, prestigeState);

  if (!check.canPrestige) {
    return {
      success: false,
      newState: masteryState,
      prestigeState,
      bonusesGained: [],
      message: check.reason || 'Cannot prestige',
    };
  }

  // Calculate total XP before reset
  const totalXp = Object.values(masteryState.tracks).reduce((sum, t) => sum + t.totalXp, 0);

  // Calculate days to reach 50
  const daysToReach50 = prestigeState.firstPrestigeAt ? (Date.now() - prestigeState.firstPrestigeAt) / (1000 * 60 * 60 * 24) : (Date.now() - masteryState.createdAt) / (1000 * 60 * 60 * 24);

  // Generate bonuses
  const newPrestigeLevel = prestigeState.prestigeLevel + 1;
  const bonusesGained = calculatePrestigeBonuses(newPrestigeLevel, totalXp);

  // Reset mastery state
  const newMasteryState: UnifiedMasteryState = {
    ...masteryState,
    tracks: {
      DURATION: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [] },
      PURITY: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [] },
      CONSISTENCY: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [] },
      COMEBACK: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [] },
      BOSS: { level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [] },
    },
    overallLevel: 1,
    overallRank: 'APPRENTICE',
    prestigeLevel: newPrestigeLevel,
    prestigeBonuses: [...masteryState.prestigeBonuses, ...bonusesGained.map((b) => b.id)],
    lastUpdated: Date.now(),
  };

  // Update prestige state
  const newPrestigeState: PrestigeState = {
    prestigeLevel: newPrestigeLevel,
    totalPrestiges: prestigeState.totalPrestiges + 1,
    firstPrestigeAt: prestigeState.firstPrestigeAt || Date.now(),
    lastPrestigeAt: Date.now(),
    activeBonuses: [...prestigeState.activeBonuses, ...bonusesGained.map((b) => b.id)],
    fastestPrestige: prestigeState.fastestPrestige ? Math.min(prestigeState.fastestPrestige, daysToReach50) : daysToReach50,
    mostXpAtPrestige: prestigeState.mostXpAtPrestige ? Math.max(prestigeState.mostXpAtPrestige, totalXp) : totalXp,
    nightmareUnlocked: newPrestigeLevel >= 3 || prestigeState.nightmareUnlocked,
    nightmareCompletions: prestigeState.nightmareCompletions,
  };

  return {
    success: true,
    newState: newMasteryState,
    prestigeState: newPrestigeState,
    bonusesGained,
    message: `TRANSCENDENCE ACHIEVED! You are now Prestige ${newPrestigeLevel}. All tracks reset with permanent bonuses.`,
  };
}

export function getNightmareConfig(prestigeState: PrestigeState): NightmareModeConfig {
  const baseMultiplier = 1 + prestigeState.prestigeLevel * 0.1;

  return {
    unlocked: prestigeState.nightmareUnlocked || prestigeState.prestigeLevel >= 3,
    enemyHealthMultiplier: 2 * baseMultiplier,
    enemyDamageMultiplier: 1.5 * baseMultiplier,
    xpMultiplier: 2 * baseMultiplier,
    dropChanceMultiplier: 1.5 * baseMultiplier,
    exclusiveRewards: ['nightmare_cosmetics', 'prestige_titles', 'legendary_crafting_materials'],
  };
}

export function applyPrestigeBonuses(baseValue: number, bonusType: PrestigeBonus['type'], prestigeState: PrestigeState): number {
  const relevantBonuses = PRESTIGE_BONUSES.filter((b) => prestigeState.activeBonuses.includes(b.id) && b.type === bonusType);

  let multiplier = 1;
  for (const bonus of relevantBonuses) {
    multiplier += bonus.value / 100;
  }

  return Math.floor(baseValue * multiplier);
}

export function getTotalBonusPercent(bonusType: PrestigeBonus['type'], prestigeState: PrestigeState): number {
  return PRESTIGE_BONUSES.filter((b) => prestigeState.activeBonuses.includes(b.id) && b.type === bonusType).reduce((sum, b) => sum + b.value, 0);
}

export function createInitialPrestigeState(): PrestigeState {
  return {
    prestigeLevel: 0,
    totalPrestiges: 0,
    firstPrestigeAt: null,
    lastPrestigeAt: null,
    activeBonuses: [],
    fastestPrestige: null,
    mostXpAtPrestige: null,
    nightmareUnlocked: false,
    nightmareCompletions: 0,
  };
}

export function migrateToPrestigeSystem(oldLevel: number, _oldMaxLevelEver: number): { prestigeState: PrestigeState; startingBonuses: PrestigeBonus[] } {
  // If user was at max level before, give them prestige credit
  const prestigeLevel = oldLevel >= 50 ? 1 : 0;
  const bonuses: PrestigeBonus[] = [];

  if (prestigeLevel > 0) {
    bonuses.push(...calculatePrestigeBonuses(1, 0));
  }

  const prestigeState: PrestigeState = {
    prestigeLevel,
    totalPrestiges: prestigeLevel,
    firstPrestigeAt: prestigeLevel > 0 ? Date.now() : null,
    lastPrestigeAt: prestigeLevel > 0 ? Date.now() : null,
    activeBonuses: bonuses.map((b) => b.id),
    fastestPrestige: null,
    mostXpAtPrestige: null,
    nightmareUnlocked: prestigeLevel >= 3,
    nightmareCompletions: 0,
  };

  return { prestigeState, startingBonuses: bonuses };
}