import { z } from "zod";
import type { MasteryRank } from "../progression/unified-mastery";


export function canUseFeature(feature: keyof typeof COACH_FEATURE_MATRIX, isPremium: boolean): boolean {
  const config = COACH_FEATURE_MATRIX[feature];

  if (typeof config.free === 'boolean') {
    return config.free || isPremium;
  }

  if (typeof config.free === 'number') {
    return true; // Quantified features are available, just limited
  }

  return isPremium;
}

export function getUnlockedPersonas(isPremium: boolean, masteryRank: MasteryRank): CoachPersona[] {
  const unlocked: CoachPersona[] = ['SUPPORTIVE'];

  if (isPremium) {
    unlocked.push('ANALYTICAL');
  }

  const rankOrder: MasteryRank[] = ['APPRENTICE', 'ADEPT', 'EXPERT', 'MASTER', 'GRANDMASTER'];
  const userRankIndex = rankOrder.indexOf(masteryRank);

  if (userRankIndex >= 1) {
    unlocked.push('STRICT');
  }
  if (userRankIndex >= 2) {
    unlocked.push('ZEN');
  }
  if (userRankIndex >= 3) {
    unlocked.push('ENTHUSIASTIC');
  }
  if (userRankIndex >= 4) {
    unlocked.push('DRILL_SERGEANT');
  }

  return unlocked;
}

export const FREE_TIPS: string[] = ['Start with a 25-minute session to build momentum', 'Your phone is the #1 distraction. Put it in another room.', 'Take 3 deep breaths before starting your session', 'The first 5 minutes are hardest. Push through!', 'Use Deep Work mode for complex tasks', 'A 7-day streak unlocks bonus rewards', 'Defeating bosses earns coins for upgrades', 'Your purity score affects damage dealt', 'Try different session modes to find your style', 'Consistency beats intensity - show up every day', 'Use the Pomodoro technique: 25 min work, 5 min break', 'Clear your workspace before starting', 'Set one clear goal for each session', 'Track your energy levels throughout the day', 'Join a squad for bonus XP and accountability', "Don't break the chain - any session counts", 'Use Light Focus mode on low-energy days', 'The best time to start was yesterday. The second best is now.', 'Focus is a muscle - it gets stronger with practice', 'Celebrate small wins to build momentum'];

export function getRandomTip(): string {
  return FREE_TIPS[Math.floor(Math.random() * FREE_TIPS.length)];
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

  // If they had premium, keep premium status
  const isPremium = hadCoachAccess;

  // Determine mastery rank based on level (migration approximation)
  let rank: MasteryRank = 'APPRENTICE';
  if (userLevel >= 40) {
    rank = 'GRANDMASTER';
  } else if (userLevel >= 30) {
    rank = 'MASTER';
  } else if (userLevel >= 20) {
    rank = 'EXPERT';
  } else if (userLevel >= 10) {
    rank = 'ADEPT';
  }

  const unlockedPersonas = getUnlockedPersonas(isPremium, rank);

  // Add starter quest
  freeFeatures.activeQuests.push(generateDailyQuest(userLevel, 0));

  return { freeFeatures, unlockedPersonas, isPremium };
}