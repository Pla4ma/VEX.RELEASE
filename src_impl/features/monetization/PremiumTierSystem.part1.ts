import { eventBus } from "../../events";


export const FREE_TIER: TierDefinition = {
  id: 'FREE',
  name: 'Free',
  description: 'Focus on what matters with essential features',
  monthlyPrice: null,
  yearlyPrice: null,
  trialDays: 0,
  features: {
    // Study Plans - 1 active only
    maxActiveStudyPlans: 1,
    advancedStudyAI: false,
    studyAnalytics: false,
    priorityAIGeneration: false,

    // Boss Battles - Basic only
    bossBounties: false,
    squadBosses: false,
    bossPhaseEffects: true, // Visual only, no gameplay advantage
    primeTimeWindows: true, // Visible but no bonus (or reduced)

    // Streaks - Standard
    streakInsuranceMonthly: 0,
    advancedStreakAnalytics: false,

    // AI Coach - Basic only
    personalitySelection: false,
    advancedInterventions: false,

    // Social
    maxSquads: 3,
    squadAnalytics: false,

    // Cosmetics - Earned only
    exclusiveCosmetics: false,
    premiumAvatarFrames: false,
    bossThemes: false,

    // General
    earlyAccess: false,
    betaFeatures: false,
    premiumSupport: false,
  },
  highlightedFeatures: ['Unlimited focus sessions', '1 active study plan', 'Basic boss battles', 'Standard streaks', 'Up to 3 squads'],
};

export const PREMIUM_TIER: TierDefinition = {
  id: 'PREMIUM',
  name: 'Premium',
  description: 'Supercharge your focus with unlimited everything',
  monthlyPrice: 9.99,
  yearlyPrice: 59.99,
  trialDays: 7,
  features: {
    // Study Plans - Unlimited
    maxActiveStudyPlans: Infinity,
    advancedStudyAI: true,
    studyAnalytics: true,
    priorityAIGeneration: true,

    // Boss Battles - Advanced
    bossBounties: true,
    squadBosses: true,
    bossPhaseEffects: true,
    primeTimeWindows: true,

    // Streaks - Protected
    streakInsuranceMonthly: 1,
    advancedStreakAnalytics: true,

    // AI Coach - Personal
    personalitySelection: true,
    advancedInterventions: true,

    // Social - Unlimited
    maxSquads: Infinity,
    squadAnalytics: true,

    // Cosmetics - Exclusive
    exclusiveCosmetics: true,
    premiumAvatarFrames: true,
    bossThemes: true,

    // General - VIP
    earlyAccess: true,
    betaFeatures: true,
    premiumSupport: true,
  },
  highlightedFeatures: ['Unlimited study plans', 'Advanced AI study assistant', 'Boss bounties & squad battles', 'Monthly streak insurance', 'Choose your coach personality', 'Exclusive cosmetics & themes', 'Priority AI generation', 'Early access to new features'],
};

export const TIER_DEFINITIONS: Record<SubscriptionTier, TierDefinition> = {
  FREE: FREE_TIER,
  PREMIUM: PREMIUM_TIER,
};

export const FEATURE_GATES: FeatureGate[] = [
  {
    feature: 'maxActiveStudyPlans',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'STUDY_PLAN_LIMIT',
    fallbackMessage: 'Free users can have 1 active study plan. Upgrade for unlimited.',
  },
  {
    feature: 'advancedStudyAI',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'ADVANCED_AI',
    fallbackMessage: 'Advanced AI features require Premium.',
  },
  {
    feature: 'studyAnalytics',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'ANALYTICS_REQUEST',
    fallbackMessage: 'Detailed analytics are a Premium feature.',
  },
  {
    feature: 'bossBounties',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'BOSS_BOUNTY',
    fallbackMessage: 'Boss bounties are available with Premium.',
  },
  {
    feature: 'squadBosses',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'BOSS_BOUNTY',
    fallbackMessage: 'Squad boss battles require Premium.',
  },
  {
    feature: 'streakInsuranceMonthly',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'STREAK_INSURANCE',
    fallbackMessage: 'Monthly streak insurance is included with Premium.',
  },
  {
    feature: 'personalitySelection',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'PERSONALITY_SELECT',
    fallbackMessage: 'Choose your coach personality with Premium.',
  },
  {
    feature: 'maxSquads',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'SQUAD_LIMIT',
    fallbackMessage: 'Free users can join up to 3 squads. Upgrade for unlimited.',
  },
  {
    feature: 'exclusiveCosmetics',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'EXCLUSIVE_COSMETIC',
    fallbackMessage: 'This cosmetic is exclusive to Premium members.',
  },
  {
    feature: 'betaFeatures',
    tier: 'PREMIUM',
    requiresPremium: true,
    paywallContext: 'BETA_FEATURE',
    fallbackMessage: 'Beta features are available to Premium users.',
  },
];