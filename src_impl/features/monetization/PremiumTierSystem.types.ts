export interface TierFeatures {
    maxActiveStudyPlans: number;
    advancedStudyAI: boolean;
    studyAnalytics: boolean;
    priorityAIGeneration: boolean;
    bossBounties: boolean;
    squadBosses: boolean;
    bossPhaseEffects: boolean;
    primeTimeWindows: boolean;
    streakInsuranceMonthly: number;
    advancedStreakAnalytics: boolean;
    personalitySelection: boolean;
    advancedInterventions: boolean;
    maxSquads: number;
    squadAnalytics: boolean;
    exclusiveCosmetics: boolean;
    premiumAvatarFrames: boolean;
    bossThemes: boolean;
    earlyAccess: boolean;
    betaFeatures: boolean;
    premiumSupport: boolean;
}

export interface TierDefinition {
    id: SubscriptionTier;
    name: string;
    description: string;
    monthlyPrice: number | null;
    yearlyPrice: number | null;
    trialDays: number;
    features: TierFeatures;
    highlightedFeatures: string[];
}

export interface FeatureGate {
    feature: keyof TierFeatures;
    tier: SubscriptionTier;
    requiresPremium: boolean;
    paywallContext: PaywallContextType;
    fallbackMessage: string;
}

export interface PaywallContextData {
    type: PaywallContextType;
    title: string;
    headline: string;
    subtext: string;
    benefit1: string;
    benefit2: string;
    statText: string;
    ctaText: string;
    secondaryCtaText: string;
}

export interface UserSubscription {
    userId: string;
    tier: SubscriptionTier;
    startedAt: number;
    expiresAt: number | null;
    isTrial: boolean;
    trialEndsAt: number | null;
    autoRenew: boolean;
    platform: 'ios' | 'android' | 'web';
}

export type SubscriptionTier = 'FREE' | 'PREMIUM';
export type PaywallContextType = 'STUDY_PLAN_LIMIT' | 'BOSS_BOUNTY' | 'STREAK_INSURANCE' | 'PERSONALITY_SELECT' | 'ANALYTICS_REQUEST' | 'SQUAD_LIMIT' | 'EXCLUSIVE_COSMETIC' | 'ADVANCED_AI' | 'BETA_FEATURE';
