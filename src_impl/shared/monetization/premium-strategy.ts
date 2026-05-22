export type PremiumHighIntentAction =
  | 'deep_coach_memory'
  | 'advanced_study'
  | 'weekly_intelligence'
  | 'visual_identity'
  | 'premium_mode';

export interface PremiumStrategyInput {
  billingConfigured: boolean;
  completedSessions: number;
  highIntentAction?: PremiumHighIntentAction;
}

export interface PremiumStrategy {
  canShowPaywall: boolean;
  entitlementArchitecture: string[];
  freeFeatures: string[];
  noFakeBillingChecklist: string[];
  paywallBody: string;
  paywallHeadline: string;
  premiumFeatures: string[];
  triggerMoment: 'hidden_billing_unavailable' | 'none' | 'after_value' | PremiumHighIntentAction;
}

const FREE_FEATURES = [
  'start_sessions',
  'complete_sessions',
  'basic_streak_progress',
  'basic_coach_presence',
  'basic_companion_visual',
  'basic_study_deep_work_entry',
  'basic_boss_momentum_visual',
];

const PREMIUM_FEATURES = [
  'deep_coach_memory',
  'advanced_study_deep_work_os',
  'personal_progress_intelligence',
  'visual_identity_depth',
  'premium_session_modes',
];

const ENTITLEMENT_ARCHITECTURE = [
  'RevenueCat is the only billing source.',
  'shared/monetization owns entitlement checks.',
  'FeatureAvailability gates premium entry points.',
  'Free session start, completion, progress, and basic CoachPresence stay free.',
];

const NO_FAKE_BILLING = [
  'Do not render purchasable plans without RevenueCat packages.',
  'Do not mark premium active without an active entitlement.',
  'Do not paywall the basic focus loop.',
  'Show unavailable or coming-soon state instead of fake premium.',
];

export function resolvePremiumStrategy(input: PremiumStrategyInput): PremiumStrategy {
  if (!input.billingConfigured) {
    return {
      canShowPaywall: false,
      entitlementArchitecture: ENTITLEMENT_ARCHITECTURE,
      freeFeatures: FREE_FEATURES,
      noFakeBillingChecklist: NO_FAKE_BILLING,
      paywallBody: 'Premium appears when live billing and real premium value are ready.',
      paywallHeadline: 'Premium is not available yet',
      premiumFeatures: PREMIUM_FEATURES,
      triggerMoment: 'hidden_billing_unavailable',
    };
  }

  const hasValue = input.completedSessions >= 5;
  const triggerMoment = input.highIntentAction ?? (hasValue ? 'after_value' : 'none');
  const canShowPaywall = triggerMoment !== 'none';

  return {
    canShowPaywall,
    entitlementArchitecture: ENTITLEMENT_ARCHITECTURE,
    freeFeatures: FREE_FEATURES,
    noFakeBillingChecklist: NO_FAKE_BILLING,
    paywallBody:
      'Unlock deeper coach memory, progress intelligence, and study or deep-work planning once the free loop has proven useful.',
    paywallHeadline: 'Turn your sessions into a full execution system',
    premiumFeatures: PREMIUM_FEATURES,
    triggerMoment,
  };
}
