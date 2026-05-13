import { z } from "zod";
import type { MasteryRank } from "../progression/unified-mastery";


export const CoachPersonaSchema = z.enum([
  'SUPPORTIVE', // Default free - encouraging, gentle
  'ANALYTICAL', // Premium - data-driven insights
  'STRICT', // Unlocked at Adept - tough love
  'ZEN', // Unlocked at Expert - mindfulness focus
  'ENTHUSIASTIC', // Unlocked at Master - high energy
  'DRILL_SERGEANT', // Unlocked at Grandmaster - intense motivation
]);

export const COACH_PERSONAS: Record<CoachPersona, CoachPersonaConfig> = {
  SUPPORTIVE: {
    id: 'SUPPORTIVE',
    name: 'Alex',
    description: 'Your encouraging companion for focus journey',
    unlockRequirement: { type: 'FREE' },
    messageStyle: 'gentle',
    avatarUrl: 'coaches/supportive.png',
    colorTheme: '#4ECDC4',
    freeFeatures: ['Basic reminders', 'Streak warnings', 'Simple tips', 'Session complete summary'],
    premiumFeatures: ['Deep analytics', 'Voice messages', 'Custom schedules'],
  },

  ANALYTICAL: {
    id: 'ANALYTICAL',
    name: 'Sage',
    description: 'Data-driven insights to optimize your focus',
    unlockRequirement: { type: 'PREMIUM' },
    messageStyle: 'analytical',
    avatarUrl: 'coaches/analytical.png',
    colorTheme: '#4169E1',
    freeFeatures: [],
    premiumFeatures: ['Pattern analysis', 'Predictive insights', 'Optimal timing suggestions', 'Performance breakdowns'],
  },

  STRICT: {
    id: 'STRICT',
    name: 'Victor',
    description: 'Tough love accountability partner',
    unlockRequirement: { type: 'MASTERY_RANK', value: 'ADEPT' },
    messageStyle: 'challenging',
    avatarUrl: 'coaches/strict.png',
    colorTheme: '#FF6B35',
    freeFeatures: ['Accountability checks', 'Direct feedback', 'Challenge prompts'],
    premiumFeatures: ['Custom challenge creation', 'Advanced accountability'],
  },

  ZEN: {
    id: 'ZEN',
    name: 'Mira',
    description: 'Mindfulness and flow state guide',
    unlockRequirement: { type: 'MASTERY_RANK', value: 'EXPERT' },
    messageStyle: 'gentle',
    avatarUrl: 'coaches/zen.png',
    colorTheme: '#9B59B6',
    freeFeatures: ['Breathing exercises', 'Mindfulness tips', 'Flow state guidance'],
    premiumFeatures: ['Meditation integration', 'Advanced mindfulness'],
  },

  ENTHUSIASTIC: {
    id: 'ENTHUSIASTIC',
    name: 'Zoe',
    description: 'High-energy motivation machine',
    unlockRequirement: { type: 'MASTERY_RANK', value: 'MASTER' },
    messageStyle: 'energetic',
    avatarUrl: 'coaches/enthusiastic.png',
    colorTheme: '#FFD700',
    freeFeatures: ['Motivation boosts', 'Celebration messages', 'Energy nudges'],
    premiumFeatures: ['Personal hype videos', 'Custom celebrations'],
  },

  DRILL_SERGEANT: {
    id: 'DRILL_SERGEANT',
    name: 'Sergeant Stone',
    description: 'Ultimate discipline enforcer',
    unlockRequirement: { type: 'MASTERY_RANK', value: 'GRANDMASTER' },
    messageStyle: 'challenging',
    avatarUrl: 'coaches/drill.png',
    colorTheme: '#8B0000',
    freeFeatures: ['Discipline drills', 'No-excuses mode', 'Intensity protocols'],
    premiumFeatures: ['Boot camp programs', 'Extreme accountability'],
  },
};

export function generateDailyQuest(userLevel: number, streakDays: number): CoachQuest {
  const questTypes: CoachQuest['requirement']['type'][] = ['SESSION_COUNT', 'PURITY_THRESHOLD', 'STREAK_DAYS', 'BOSS_DEFEAT'];

  const type = questTypes[Math.floor(Math.random() * questTypes.length)];

  const templates: Record<CoachQuest['requirement']['type'], Partial<CoachQuest>> = {
    SESSION_COUNT: {
      title: 'Daily Discipline',
      description: `Complete ${userLevel >= 10 ? 3 : 2} focus sessions today`,
      requirement: { type: 'SESSION_COUNT', value: userLevel >= 10 ? 3 : 2 },
      reward: { coins: 100 + userLevel * 10 },
    },
    PURITY_THRESHOLD: {
      title: 'Crystal Focus',
      description: 'Complete a session with 90%+ purity',
      requirement: { type: 'PURITY_THRESHOLD', value: 90 },
      reward: { coins: 150, xp: 50 },
    },
    STREAK_DAYS: {
      title: 'Streak Guardian',
      description: `Maintain your ${streakDays} day streak`,
      requirement: { type: 'STREAK_DAYS', value: 1 },
      reward: { coins: 50 * Math.min(10, streakDays) },
    },
    BOSS_DEFEAT: {
      title: 'Boss Hunter',
      description: 'Defeat any boss today',
      requirement: { type: 'BOSS_DEFEAT', value: 1 },
      reward: { coins: 200, xp: 100 },
    },
  };

  const template = templates[type];

  return {
    id: `quest_${Date.now()}`,
    title: template.title || '',
    description: template.description || '',
    requirement: template.requirement || { type, value: 1 },
    reward: template.reward || { coins: 100 },
    progress: 0,
    completed: false,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
}

export const COACH_FEATURE_MATRIX = {
  // Session Interventions
  basicReminders: { free: true, premium: true },
  smartTiming: { free: false, premium: true },
  interruptionRecovery: { free: true, premium: true },
  voiceInterventions: { free: false, premium: true },

  // Analytics
  weeklySummary: { free: true, premium: true },
  detailedBreakdown: { free: false, premium: true },
  trendAnalysis: { free: false, premium: true },
  predictiveInsights: { free: false, premium: true },

  // Personalization
  basicPersona: { free: true, premium: true },
  allPersonas: { free: false, premium: true },
  customPersona: { free: false, premium: true },
  personalityTraining: { free: false, premium: true },

  // Recommendations
  modeSuggestions: { free: true, premium: true },
  durationOptimization: { free: false, premium: true },
  bossStrategies: { free: true, premium: true },
  advancedTactics: { free: false, premium: true },

  // Quests
  dailyQuest: { free: true, premium: true },
  questSlots: { free: 1, premium: 3 },
  customQuests: { free: false, premium: true },
  questRewards: { free: 'standard', premium: 'enhanced' },

  // Communication
  textMessages: { free: true, premium: true },
  voiceMessages: { free: false, premium: true },
  videoMessages: { free: false, premium: true },
  liveChat: { free: false, premium: true },
};