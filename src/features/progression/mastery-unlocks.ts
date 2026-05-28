import type { MasteryTrack, UnifiedMasteryState } from "./mastery-types";

export interface MasteryUnlock {
  id: string;
  name: string;
  description: string;
  requiredTrack: MasteryTrack;
  requiredLevel: number;
  unlocked: boolean;
}

export const MASTERY_UNLOCKS: MasteryUnlock[] = [
  {
    id: "mode_sprint",
    name: "Sprint Mode",
    description: "Fast-paced 25-minute sessions",
    requiredTrack: "DURATION",
    requiredLevel: 5,
    unlocked: false,
  },
  {
    id: "boss_tier2",
    name: "Tier 2 Bosses",
    description: "Face stronger opponents",
    requiredTrack: "DURATION",
    requiredLevel: 10,
    unlocked: false,
  },
  {
    id: "mode_deep_work",
    name: "Deep Work Mode",
    description: "Extended 90-minute sessions",
    requiredTrack: "DURATION",
    requiredLevel: 20,
    unlocked: false,
  },
  {
    id: "perfect_session_bonus",
    name: "Perfect Session Bonus",
    description: "Extra rewards for 95%+ purity",
    requiredTrack: "PURITY",
    requiredLevel: 5,
    unlocked: false,
  },
  {
    id: "critical_hits",
    name: "Critical Hit System",
    description: "Land critical strikes on bosses",
    requiredTrack: "PURITY",
    requiredLevel: 15,
    unlocked: false,
  },
  {
    id: "nightmare_bosses",
    name: "Nightmare Difficulty",
    description: "Ultimate challenge mode",
    requiredTrack: "PURITY",
    requiredLevel: 30,
    unlocked: false,
  },
  {
    id: "squad_access",
    name: "Squads",
    description: "Join or create focus squads",
    requiredTrack: "CONSISTENCY",
    requiredLevel: 10,
    unlocked: false,
  },
  {
    id: "daily_dungeons",
    name: "Daily Dungeons",
    description: "Special daily challenges",
    requiredTrack: "CONSISTENCY",
    requiredLevel: 15,
    unlocked: false,
  },
  {
    id: "streak_insurance",
    name: "Streak Insurance",
    description: "Protect your streak with coins",
    requiredTrack: "CONSISTENCY",
    requiredLevel: 20,
    unlocked: false,
  },
  {
    id: "comeback_tokens",
    name: "Comeback Tokens",
    description: "Earn tokens from broken streaks",
    requiredTrack: "COMEBACK",
    requiredLevel: 5,
    unlocked: false,
  },
  {
    id: "rivals",
    name: "Rival System",
    description: "Compete with matched opponents",
    requiredTrack: "COMEBACK",
    requiredLevel: 15,
    unlocked: false,
  },
  {
    id: "phoenix_mode",
    name: "Phoenix Mode",
    description: "2x XP for 7 days after comeback",
    requiredTrack: "COMEBACK",
    requiredLevel: 25,
    unlocked: false,
  },
  {
    id: "boss_crafting",
    name: "Boss Essence Crafting",
    description: "Craft items from defeated bosses",
    requiredTrack: "BOSS",
    requiredLevel: 10,
    unlocked: false,
  },
  {
    id: "squad_raids",
    name: "Squad Raids",
    description: "Coordinated boss battles",
    requiredTrack: "BOSS",
    requiredLevel: 20,
    unlocked: false,
  },
  {
    id: "transcendence",
    name: "Transcendence",
    description: "Prestige and start anew stronger",
    requiredTrack: "BOSS",
    requiredLevel: 40,
    unlocked: false,
  },
];

export function checkUnlocks(
  state: UnifiedMasteryState,
  existingUnlocks: string[],
): { newlyUnlocked: MasteryUnlock[]; allUnlocks: string[] } {
  const newlyUnlocked: MasteryUnlock[] = [];
  const allUnlocks = [...existingUnlocks];
  for (const unlock of MASTERY_UNLOCKS) {
    const trackLevel = state.tracks[unlock.requiredTrack].level;
    const alreadyUnlocked = existingUnlocks.includes(unlock.id);
    if (trackLevel >= unlock.requiredLevel && !alreadyUnlocked) {
      newlyUnlocked.push({ ...unlock, unlocked: true });
      allUnlocks.push(unlock.id);
    }
  }
  return { newlyUnlocked, allUnlocks };
}
