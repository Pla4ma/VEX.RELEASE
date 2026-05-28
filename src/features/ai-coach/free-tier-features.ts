import type { MasteryRank } from "../progression/unified-mastery";
import type { CoachPersona } from "./coach-personas";
import { getUnlockedPersonas } from "./coach-personas";
import type { CoachQuest } from "./coach-quests";
import { generateDailyQuest } from "./coach-quests";

export interface FreeTierFeatures {
  dailyReminders: boolean;
  streakRiskWarnings: boolean;
  sessionStartPrompts: boolean;
  weeklySummary: boolean;
  streakStatus: boolean;
  simpleProgress: boolean;
  dailyTip: boolean;
  modeSuggestions: boolean;
  basicBossStrategies: boolean;
  activeQuests: CoachQuest[];
  questSlots: number;
}

export const COACH_FEATURE_MATRIX = {
  basicReminders: { free: true, premium: true },
  smartTiming: { free: false, premium: true },
  interruptionRecovery: { free: true, premium: true },
  voiceInterventions: { free: false, premium: true },
  weeklySummary: { free: true, premium: true },
  detailedBreakdown: { free: false, premium: true },
  trendAnalysis: { free: false, premium: true },
  predictiveInsights: { free: false, premium: true },
  basicPersona: { free: true, premium: true },
  allPersonas: { free: false, premium: true },
  customPersona: { free: false, premium: true },
  personalityTraining: { free: false, premium: true },
  modeSuggestions: { free: true, premium: true },
  durationOptimization: { free: false, premium: true },
  bossStrategies: { free: true, premium: true },
  advancedTactics: { free: false, premium: true },
  dailyQuest: { free: true, premium: true },
  questSlots: { free: 1, premium: 3 },
  customQuests: { free: false, premium: true },
  questRewards: { free: "standard", premium: "enhanced" },
  textMessages: { free: true, premium: true },
  voiceMessages: { free: false, premium: true },
  videoMessages: { free: false, premium: true },
  liveChat: { free: false, premium: true },
};

export function canUseFeature(
  feature: keyof typeof COACH_FEATURE_MATRIX,
  isPremium: boolean,
): boolean {
  const config = COACH_FEATURE_MATRIX[feature];
  if (typeof config.free === "boolean") {
    return config.free || isPremium;
  }
  if (typeof config.free === "number") {
    return true;
  }
  return isPremium;
}

export const FREE_TIPS: string[] = [
  "Start with a 25-minute session to build momentum",
  "Your phone is the #1 distraction. Put it in another room.",
  "Take 3 deep breaths before starting your session",
  "The first 5 minutes are hardest. Push through!",
  "Use Deep Work mode for complex tasks",
  "A 7-day streak unlocks bonus rewards",
  "Defeating bosses earns coins for upgrades",
  "Your purity score affects damage dealt",
  "Try different session modes to find your style",
  "Consistency beats intensity - show up every day",
  "Use the Pomodoro technique: 25 min work, 5 min break",
  "Clear your workspace before starting",
  "Set one clear goal for each session",
  "Track your energy levels throughout the day",
  "Join a squad for bonus XP and accountability",
  "Don't break the chain - any session counts",
  "Use Light Focus mode on low-energy days",
  "The best time to start was yesterday. The second best is now.",
  "Focus is a muscle - it gets stronger with practice",
  "Celebrate small wins to build momentum",
];

export function getRandomTip(): string {
  return FREE_TIPS[Math.floor(Math.random() * FREE_TIPS.length)]!;
}

export function createInitialFreeTier(): FreeTierFeatures {
  return {
    dailyReminders: true,
    streakRiskWarnings: true,
    sessionStartPrompts: true,
    weeklySummary: true,
    streakStatus: true,
    simpleProgress: true,
    dailyTip: true,
    modeSuggestions: true,
    basicBossStrategies: true,
    activeQuests: [],
    questSlots: 1,
  };
}

export function migrateToFreeTierSystem(
  hadCoachAccess: boolean,
  userLevel: number,
): {
  freeFeatures: FreeTierFeatures;
  unlockedPersonas: CoachPersona[];
  isPremium: boolean;
} {
  const freeFeatures = createInitialFreeTier();
  const isPremium = hadCoachAccess;
  let rank: MasteryRank = "APPRENTICE";
  if (userLevel >= 40) {
    rank = "GRANDMASTER";
  } else if (userLevel >= 30) {
    rank = "MASTER";
  } else if (userLevel >= 20) {
    rank = "EXPERT";
  } else if (userLevel >= 10) {
    rank = "ADEPT";
  }
  const unlockedPersonas = getUnlockedPersonas(isPremium, rank);
  freeFeatures.activeQuests.push(generateDailyQuest(userLevel, 0));
  return { freeFeatures, unlockedPersonas, isPremium };
}
