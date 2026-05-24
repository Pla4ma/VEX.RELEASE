import { z } from 'zod';

export const TierIdSchema = z.enum(['free', 'premium']);
export type TierId = z.infer<typeof TierIdSchema>;

export interface TierDefinition {
  id: TierId;
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  trialDays: number;
  features: Record<string, boolean>;
  featureStrings: string[];
  highlightedFeatures: string[];
}

export const TIERS: Record<TierId, TierDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'Focus on what matters with essential features',
    monthlyPrice: null,
    yearlyPrice: null,
    trialDays: 0,
    features: {
      deepCoachMemory: false,
      advancedStudyOS: false,
      progressIntelligence: false,
      visualIdentity: false,
      premiumSessionModes: false,
      recoveryPlanning: false,
      advancedStudyAI: false,
      studyAnalytics: false,
      priorityAIGeneration: false,
      advancedStreakAnalytics: false,
      advancedInterventions: false,
      premiumSupport: false,
    },
    featureStrings: [
      'Unlimited focus sessions',
      'Basic Coach Presence',
      'Basic progress, streak, and XP',
      'Basic companion',
      'Subtle boss momentum',
      'Simple Study / Deep Work entry',
      '1 active study plan',
    ],
    highlightedFeatures: [
      'Unlimited focus sessions',
      '1 active study plan',
      'Basic Coach Presence',
      'Basic progress, streak, and XP',
      'Basic companion',
      'Subtle boss momentum',
      'Simple Study / Deep Work entry',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'A deeper personal execution system — not locked game features',
    monthlyPrice: 9.99,
    yearlyPrice: 59.99,
    trialDays: 7,
    features: {
      deepCoachMemory: true,
      advancedStudyOS: true,
      progressIntelligence: true,
      visualIdentity: true,
      premiumSessionModes: true,
      recoveryPlanning: true,
      advancedStudyAI: true,
      studyAnalytics: true,
      priorityAIGeneration: true,
      advancedStreakAnalytics: true,
      advancedInterventions: true,
      premiumSupport: true,
    },
    featureStrings: [
      'Deep Coach Memory',
      'Advanced Study / Deep Work OS',
      'Progress Intelligence',
      'Visual Identity',
      'Premium Session Modes',
      'Recovery Planning',
      'Unlimited study plans',
    ],
    highlightedFeatures: [
      'Deep Coach Memory',
      'Advanced Study / Deep Work OS',
      'Progress Intelligence',
      'Visual Identity',
      'Premium Session Modes',
      'Recovery Planning',
    ],
  },
};

export type TierFeatureKey = keyof typeof TIERS.free.features;

export const FREE_FEATURE_STRS = [
  'Start and complete focus sessions',
  'Basic streak and progress tracking',
  'Basic Coach Presence — daily reflection',
  'Basic companion visual',
  'Basic Study / Deep Work entry',
  'Subtle boss momentum visual',
];

export const PREMIUM_FEATURE_STRS = [
  'Deep Coach Memory — remembers patterns, best focus times, comeback style, preferred push style',
  'Advanced Study / Deep Work OS — content generation, review loops, quizzes, project breakdowns, smart next actions',
  'Personal Progress Intelligence — weekly execution report, best rhythm, risk/recovery insights, consistency map',
  'Visual Identity — companion forms, boss skins, focus worlds, premium session atmospheres',
  'Premium Session Modes — Exam Sprint, Deep Work, Calm Reset, Boss Focus, Comeback Mode, Review Mode',
];

export function getMaxActiveStudyPlans(tierId: TierId): number {
  return tierId === 'free' ? 1 : Infinity;
}

export function hasFeature(tierId: TierId, feature: TierFeatureKey): boolean {
  return TIERS[tierId].features[feature] === true;
}
