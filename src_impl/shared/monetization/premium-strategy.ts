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
  freeVsProMatrix: Array<{ free: string; pro: string }>;
}

const FREE_FEATURES = [
  'Start and complete focus sessions',
  'Basic streak and progress tracking',
  'Basic Coach Presence (daily reflection)',
  'Basic companion visual',
  'Basic Study / Deep Work entry',
  'Subtle boss momentum visual (if part of your identity)',
];

const PREMIUM_FEATURES = [
  'Deep Coach Memory — remembers patterns, best focus times, comeback style',
  'Advanced Study / Deep Work OS — content generation, review loops, smart actions',
  'Personal Progress Intelligence — weekly execution report, rhythm insights',
  'Visual Identity — companion forms, focus worlds, premium atmospheres',
  'Premium Session Modes — Exam Sprint, Deep Work, Calm Reset, Boss Focus',
];

const FREE_VS_PRO_MATRIX: Array<{ free: string; pro: string }> = [
  { free: 'Start and complete sessions', pro: 'Premium session modes (Exam Sprint, Deep Work, Calm Reset)' },
  { free: 'Basic streak and progress', pro: 'Weekly execution report with rhythm and consistency map' },
  { free: 'Daily Coach Presence reflection', pro: 'Deep Coach Memory — remembers your patterns and best times' },
  { free: 'Basic Study / Deep Work entry', pro: 'Content generation, review loops, quizzes, project breakdowns' },
  { free: 'Subtle momentum visual', pro: 'Full visual identity — companion forms, focus worlds, atmospheres' },
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
      paywallBody: 'Premium appears when live billing and real premium value are ready. Keep building your rhythm.',
      paywallHeadline: 'Premium is not available yet',
      premiumFeatures: PREMIUM_FEATURES,
      triggerMoment: 'hidden_billing_unavailable',
      freeVsProMatrix: FREE_VS_PRO_MATRIX,
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
    paywallBody: 'VEX Pro turns your sessions into a full execution system. Deep Coach Memory remembers your patterns. Study OS builds from your content. Weekly intelligence maps your rhythm.',
    paywallHeadline: 'Turn your sessions into a full execution system',
    premiumFeatures: PREMIUM_FEATURES,
    triggerMoment,
    freeVsProMatrix: FREE_VS_PRO_MATRIX,
  };
}
