import type { UnifiedMasteryState } from "./unified-mastery";
import type { PrestigeState, PrestigeResult, NightmareModeConfig, PrestigeBonus } from "./prestige-types";
import { calculatePrestigeBonuses } from "./prestige-bonuses";

export function canPrestige(
  masteryState: UnifiedMasteryState,
  prestigeState: PrestigeState,
): { canPrestige: boolean; reason: string | null; recommended: boolean } {
  const allMaxed = Object.values(masteryState.tracks).every(
    (track) => track.level >= 50,
  );
  if (!allMaxed) {
    const maxedTracks = Object.entries(masteryState.tracks)
      .filter(([_, t]) => t.level >= 50)
      .map(([name]) => name);
    return {
      canPrestige: false,
      reason: `Max all 5 tracks first. Maxed: ${maxedTracks.join(", ") || "none"}`,
      recommended: false,
    };
  }
  if (prestigeState.prestigeLevel >= 5) {
    const daysSinceLastPrestige = prestigeState.lastPrestigeAt
      ? (Date.now() - prestigeState.lastPrestigeAt) / (1000 * 60 * 60 * 24)
      : Infinity;
    if (daysSinceLastPrestige < 7) {
      return {
        canPrestige: false,
        reason: `Wait ${Math.ceil(7 - daysSinceLastPrestige)} more days between high-level prestiges`,
        recommended: false,
      };
    }
  }
  return { canPrestige: true, reason: null, recommended: true };
}

export function executePrestige(
  masteryState: UnifiedMasteryState,
  prestigeState: PrestigeState,
): PrestigeResult {
  const check = canPrestige(masteryState, prestigeState);
  if (!check.canPrestige) {
    return {
      success: false,
      newState: masteryState,
      prestigeState,
      bonusesGained: [],
      message: check.reason || "Cannot prestige",
    };
  }
  const totalXp = Object.values(masteryState.tracks).reduce(
    (sum, t) => sum + t.totalXp,
    0,
  );
  const daysToReach50 = prestigeState.firstPrestigeAt
    ? (Date.now() - prestigeState.firstPrestigeAt) / (1000 * 60 * 60 * 24)
    : (Date.now() - masteryState.createdAt) / (1000 * 60 * 60 * 24);
  const newPrestigeLevel = prestigeState.prestigeLevel + 1;
  const bonusesGained = calculatePrestigeBonuses(newPrestigeLevel, totalXp);

  const newMasteryState: UnifiedMasteryState = {
    ...masteryState,
    tracks: {
      DURATION: {
        level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [],
      },
      PURITY: {
        level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [],
      },
      CONSISTENCY: {
        level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [],
      },
      COMEBACK: {
        level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [],
      },
      BOSS: {
        level: 1, xp: 0, xpToNext: 100, totalXp: 0, milestonesCompleted: [],
      },
    },
    overallLevel: 1,
    overallRank: "APPRENTICE",
    prestigeLevel: newPrestigeLevel,
    prestigeBonuses: [
      ...masteryState.prestigeBonuses,
      ...bonusesGained.map((b) => b.id),
    ],
    lastUpdated: Date.now(),
  };

  const newPrestigeState: PrestigeState = {
    prestigeLevel: newPrestigeLevel,
    totalPrestiges: prestigeState.totalPrestiges + 1,
    firstPrestigeAt: prestigeState.firstPrestigeAt || Date.now(),
    lastPrestigeAt: Date.now(),
    activeBonuses: [
      ...prestigeState.activeBonuses,
      ...bonusesGained.map((b) => b.id),
    ],
    fastestPrestige: prestigeState.fastestPrestige
      ? Math.min(prestigeState.fastestPrestige, daysToReach50)
      : daysToReach50,
    mostXpAtPrestige: prestigeState.mostXpAtPrestige
      ? Math.max(prestigeState.mostXpAtPrestige, totalXp)
      : totalXp,
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

export function getNightmareConfig(
  prestigeState: PrestigeState,
): NightmareModeConfig {
  const baseMultiplier = 1 + prestigeState.prestigeLevel * 0.1;
  return {
    unlocked:
      prestigeState.nightmareUnlocked || prestigeState.prestigeLevel >= 3,
    enemyHealthMultiplier: 2 * baseMultiplier,
    enemyDamageMultiplier: 1.5 * baseMultiplier,
    xpMultiplier: 2 * baseMultiplier,
    dropChanceMultiplier: 1.5 * baseMultiplier,
    exclusiveRewards: [
      "nightmare_cosmetics",
      "prestige_titles",
      "legendary_crafting_materials",
    ],
  };
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

export function migrateToPrestigeSystem(
  oldLevel: number,
  _oldMaxLevelEver: number,
): { prestigeState: PrestigeState; startingBonuses: PrestigeBonus[] } {
  const prestigeLevel = oldLevel >= 50 ? 1 : 0;
  const bonuses = prestigeLevel > 0 ? calculatePrestigeBonuses(1, 0) : [];
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
