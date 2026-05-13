import { eventBus } from "../../events";


export function hasFeatureAccess(userTier: SubscriptionTier, feature: keyof TierFeatures): boolean {
  const tierDef = TIER_DEFINITIONS[userTier];
  const featureValue = tierDef.features[feature];

  // Numeric features (maxActiveStudyPlans, maxSquads, streakInsuranceMonthly)
  if (typeof featureValue === 'number') {
    return featureValue > 0;
  }

  // Boolean features
  return featureValue === true;
}

export function canCreateStudyPlan(userTier: SubscriptionTier, currentPlanCount: number): boolean {
  const maxPlans = TIER_DEFINITIONS[userTier].features.maxActiveStudyPlans;
  return currentPlanCount < maxPlans;
}

export function canJoinSquad(userTier: SubscriptionTier, currentSquadCount: number): boolean {
  const maxSquads = TIER_DEFINITIONS[userTier].features.maxSquads;
  return currentSquadCount < maxSquads;
}

export function getRemainingStudyPlanSlots(userTier: SubscriptionTier, currentPlanCount: number): number {
  const maxPlans = TIER_DEFINITIONS[userTier].features.maxActiveStudyPlans;
  if (maxPlans === Infinity) {
    return Infinity;
  }
  return Math.max(0, maxPlans - currentPlanCount);
}

export function getFeatureGate(feature: keyof TierFeatures): FeatureGate | null {
  return FEATURE_GATES.find((g) => g.feature === feature) || null;
}

export function shouldShowPaywall(userTier: SubscriptionTier, feature: keyof TierFeatures): { show: boolean; context: PaywallContextType | null } {
  if (userTier === 'PREMIUM') {
    return { show: false, context: null };
  }

  const hasAccess = hasFeatureAccess(userTier, feature);
  if (hasAccess) {
    return { show: false, context: null };
  }

  const gate = getFeatureGate(feature);
  return {
    show: true,
    context: gate?.paywallContext || null,
  };
}

export const PAYWALL_CONTEXTS: Record<PaywallContextType, PaywallContextData> = {
  STUDY_PLAN_LIMIT: {
    type: 'STUDY_PLAN_LIMIT',
    title: 'Study Plan Limit Reached',
    headline: 'Study 3x Faster with Unlimited Plans',
    subtext: 'Free users can have 1 active study plan. Upgrade to create unlimited plans and organize all your subjects.',
    benefit1: '✓ Create unlimited study plans',
    benefit2: '✓ AI generates plans for any topic',
    statText: 'Premium users complete 78% more study plans',
    ctaText: 'Start Free Trial',
    secondaryCtaText: 'Maybe Later',
  },
  BOSS_BOUNTY: {
    type: 'BOSS_BOUNTY',
    title: 'Boss Bounties',
    headline: 'Deal Double Damage with Boss Bounties',
    subtext: "Place bounties on bosses to earn 2x loot and show them who's boss. Squad members can stack bounties for massive bonuses.",
    benefit1: '✓ 2x loot drop chance on bounty hits',
    benefit2: '✓ Stack up to 4 bounties (8x loot!)',
    statText: 'Bounty hunters defeat bosses 40% faster',
    ctaText: 'Unlock Bounties',
    secondaryCtaText: 'Continue Free',
  },
  STREAK_INSURANCE: {
    type: 'STREAK_INSURANCE',
    title: 'Streak Protected',
    headline: 'Your Streak is Safe',
    subtext: 'Premium includes monthly streak insurance. Use it when life gets busy and maintain your momentum.',
    benefit1: '✓ 1 free streak insurance per month',
    benefit2: '✓ Additional insurance earnable anytime',
    statText: 'Protected streaks lead to 3x longer streaks on average',
    ctaText: 'Protect My Streak',
    secondaryCtaText: "I'll Risk It",
  },
  PERSONALITY_SELECT: {
    type: 'PERSONALITY_SELECT',
    title: 'Choose Your Coach',
    headline: 'Find the Perfect Coach for You',
    subtext: 'Premium unlocks all 4 coach personalities. Switch between Mentor, Trainer, Peer, and Professor anytime.',
    benefit1: '✓ 4 unique coach personalities',
    benefit2: '✓ Switch personalities anytime',
    statText: 'Users with preferred coach are 65% more engaged',
    ctaText: 'Choose My Coach',
    secondaryCtaText: 'Keep Default',
  },
  ANALYTICS_REQUEST: {
    type: 'ANALYTICS_REQUEST',
    title: 'Study Analytics',
    headline: 'Understand Your Learning Patterns',
    subtext: 'Premium unlocks detailed study analytics. See your progress over time, identify weak areas, and optimize your study sessions.',
    benefit1: '✓ Detailed progress breakdowns',
    benefit2: '✓ Study habit insights',
    statText: 'Analytics users improve 45% faster',
    ctaText: 'See My Analytics',
    secondaryCtaText: 'Skip for Now',
  },
  SQUAD_LIMIT: {
    type: 'SQUAD_LIMIT',
    title: 'Squad Limit Reached',
    headline: 'Join Unlimited Squads',
    subtext: "You've reached the 3 squad limit for free users. Upgrade to join as many squads as you want for maximum accountability.",
    benefit1: '✓ Join unlimited squads',
    benefit2: '✓ Squad analytics & insights',
    statText: 'Users in 4+ squads have 2x better retention',
    ctaText: 'Join More Squads',
    secondaryCtaText: 'Stay at 3',
  },
  EXCLUSIVE_COSMETIC: {
    type: 'EXCLUSIVE_COSMETIC',
    title: 'Exclusive Cosmetic',
    headline: 'Stand Out with Premium Cosmetics',
    subtext: 'This cosmetic is exclusive to Premium members. Unlock unique avatar frames, boss themes, and visual effects.',
    benefit1: '✓ Exclusive cosmetics not available in shop',
    benefit2: '✓ New cosmetics added monthly',
    statText: 'Premium members show off their style daily',
    ctaText: 'Get Premium',
    secondaryCtaText: 'Browse Free Items',
  },
  ADVANCED_AI: {
    type: 'ADVANCED_AI',
    title: 'Advanced AI',
    headline: 'Supercharge Your Study Plans',
    subtext: 'Premium unlocks advanced AI features: priority generation, deeper topic analysis, and personalized study strategies.',
    benefit1: '✓ Priority AI generation (faster)',
    benefit2: '✓ Advanced topic analysis',
    statText: 'Advanced AI creates 50% more effective plans',
    ctaText: 'Unlock Advanced AI',
    secondaryCtaText: 'Continue with Basic',
  },
  BETA_FEATURE: {
    type: 'BETA_FEATURE',
    title: 'Beta Feature',
    headline: 'Early Access to New Features',
    subtext: 'Premium members get early access to beta features. Try new functionality before everyone else and shape the future of the app.',
    benefit1: '✓ Access beta features first',
    benefit2: '✓ Provide feedback to shape development',
    statText: 'Beta users love shaping the future',
    ctaText: 'Join Premium Beta',
    secondaryCtaText: 'Wait for Release',
  },
};

export function getPaywallContext(type: PaywallContextType): PaywallContextData {
  return PAYWALL_CONTEXTS[type];
}

export function setUserSubscription(subscription: UserSubscription): void {
  subscriptionStore.set(subscription.userId, subscription);

  eventBus.publish('subscription:changed', {
    userId: subscription.userId,
    tier: subscription.tier,
    isTrial: subscription.isTrial,
  });
}