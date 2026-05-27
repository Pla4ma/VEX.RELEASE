import { z } from "zod";
import type { UnifiedMasteryState } from "./unified-mastery";
export const PrestigeBonusSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum([
    "XP_BOOST",
    "COIN_BOOST",
    "DROP_CHANCE",
    "DAMAGE_BOOST",
    "TIME_REDUCTION",
    "SPECIAL",
  ]),
  value: z.number(),
  icon: z.string(),
  rarity: z.enum(["COMMON", "RARE", "EPIC", "LEGENDARY"]),
});
export type PrestigeBonus = z.infer<typeof PrestigeBonusSchema>;
export interface PrestigeState {
  prestigeLevel: number;
  totalPrestiges: number;
  firstPrestigeAt: number | null;
  lastPrestigeAt: number | null;
  activeBonuses: string[];
  fastestPrestige: number | null;
  mostXpAtPrestige: number | null;
  nightmareUnlocked: boolean;
  nightmareCompletions: number;
}
export interface PrestigeResult {
  success: boolean;
  newState: UnifiedMasteryState;
  prestigeState: PrestigeState;
  bonusesGained: PrestigeBonus[];
  message: string;
}
export const PRESTIGE_BONUSES: PrestigeBonus[] = [
  {
    id: "xp_boost_5",
    name: "Wisdom of Experience",
    description: "+5% XP from all sessions",
    type: "XP_BOOST",
    value: 5,
    icon: "🧠",
    rarity: "COMMON",
  },
  {
    id: "coin_boost_10",
    name: "Golden Touch",
    description: "+10% coins from rewards",
    type: "COIN_BOOST",
    value: 10,
    icon: "🪙",
    rarity: "COMMON",
  },
  {
    id: "drop_boost_5",
    name: "Fortune's Favor",
    description: "+5% rare drop chance",
    type: "DROP_CHANCE",
    value: 5,
    icon: "🍀",
    rarity: "COMMON",
  },
  {
    id: "xp_boost_10",
    name: "Master's Insight",
    description: "+10% XP from all sessions",
    type: "XP_BOOST",
    value: 10,
    icon: "👁️",
    rarity: "RARE",
  },
  {
    id: "damage_boost_10",
    name: "Focused Fury",
    description: "+10% damage to bosses",
    type: "DAMAGE_BOOST",
    value: 10,
    icon: "⚔️",
    rarity: "RARE",
  },
  {
    id: "time_reduction_10",
    name: "Flow State",
    description: "-10% time to complete daily challenges",
    type: "TIME_REDUCTION",
    value: 10,
    icon: "⏱️",
    rarity: "RARE",
  },
  {
    id: "xp_boost_15",
    name: "Transcendent Mind",
    description: "+15% XP from all sessions",
    type: "XP_BOOST",
    value: 15,
    icon: "🧘",
    rarity: "EPIC",
  },
  {
    id: "damage_boost_20",
    name: "Unstoppable Force",
    description: "+20% damage to bosses",
    type: "DAMAGE_BOOST",
    value: 20,
    icon: "💥",
    rarity: "EPIC",
  },
  {
    id: "drop_boost_15",
    name: "Treasure Hunter",
    description: "+15% legendary drop chance",
    type: "DROP_CHANCE",
    value: 15,
    icon: "💎",
    rarity: "EPIC",
  },
  {
    id: "xp_boost_25",
    name: "Eternal Student",
    description: "+25% XP from all sessions",
    type: "XP_BOOST",
    value: 25,
    icon: "📚",
    rarity: "LEGENDARY",
  },
  {
    id: "special_nightmare",
    name: "Nightmare Walker",
    description: "Unlock Nightmare difficulty permanently",
    type: "SPECIAL",
    value: 0,
    icon: "👻",
    rarity: "LEGENDARY",
  },
  {
    id: "special_dual_path",
    name: "Path Diverger",
    description: "Progress on two journey paths simultaneously",
    type: "SPECIAL",
    value: 0,
    icon: "🛤️",
    rarity: "LEGENDARY",
  },
];
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
export function calculatePrestigeBonuses(
  prestigeLevel: number,
  _totalXp: number,
): PrestigeBonus[] {
  const bonuses: PrestigeBonus[] = [];
  const availableBonuses = PRESTIGE_BONUSES.filter((b) => {
    if (b.rarity === "COMMON") {
      return prestigeLevel >= 1;
    }
    if (b.rarity === "RARE") {
      return prestigeLevel >= 4;
    }
    if (b.rarity === "EPIC") {
      return prestigeLevel >= 7;
    }
    if (b.rarity === "LEGENDARY") {
      return prestigeLevel >= 10;
    }
    return false;
  });
  const bonusCount = Math.min(3, 1 + Math.floor(prestigeLevel / 3));
  for (let i = 0; i < bonusCount && i < availableBonuses.length; i++) {
    const index = (prestigeLevel * 7 + i * 13) % availableBonuses.length;
    bonuses.push(availableBonuses[index]!);
  }
  return bonuses;
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
        level: 1,
        xp: 0,
        xpToNext: 100,
        totalXp: 0,
        milestonesCompleted: [],
      },
      PURITY: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        totalXp: 0,
        milestonesCompleted: [],
      },
      CONSISTENCY: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        totalXp: 0,
        milestonesCompleted: [],
      },
      COMEBACK: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        totalXp: 0,
        milestonesCompleted: [],
      },
      BOSS: {
        level: 1,
        xp: 0,
        xpToNext: 100,
        totalXp: 0,
        milestonesCompleted: [],
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
export interface NightmareModeConfig {
  unlocked: boolean;
  enemyHealthMultiplier: number;
  enemyDamageMultiplier: number;
  xpMultiplier: number;
  dropChanceMultiplier: number;
  exclusiveRewards: string[];
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
export function applyPrestigeBonuses(
  baseValue: number,
  bonusType: PrestigeBonus["type"],
  prestigeState: PrestigeState,
): number {
  const relevantBonuses = PRESTIGE_BONUSES.filter(
    (b) => prestigeState.activeBonuses.includes(b.id) && b.type === bonusType,
  );
  let multiplier = 1;
  for (const bonus of relevantBonuses) {
    multiplier += bonus.value / 100;
  }
  return Math.floor(baseValue * multiplier);
}
export function getTotalBonusPercent(
  bonusType: PrestigeBonus["type"],
  prestigeState: PrestigeState,
): number {
  return PRESTIGE_BONUSES.filter(
    (b) => prestigeState.activeBonuses.includes(b.id) && b.type === bonusType,
  ).reduce((sum, b) => sum + b.value, 0);
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
