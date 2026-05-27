export type PremiumHighIntentAction =
  | 'deep_coach_memory'
  | 'advanced_study'
  | 'weekly_intelligence'
  | 'memory_console'
  | 'calendar_intelligence';

export interface PremiumStrategyInput {
  billingConfigured: boolean;
  completedSessions: number;
  highIntentAction?: PremiumHighIntentAction;
  paywallDismissals?: number;
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
  'Basic rhythm and progress tracking',
  'Basic Coach Presence (daily reflection)',
  'Basic lane personalization',
  'Basic Study / Deep Work entry',
  'Rescue mode',
];

const PREMIUM_FEATURES = [
  'Deep Coach Memory — learns your patterns from real session evidence (not fabricated)',
  'Advanced Study / Deep Work OS — content generation, review loops, smart actions',
  'Personal Progress Intelligence — weekly execution insights built from your rhythm',
  'Memory Console — view, edit, and manage memory observations with source and confidence',
  'Calendar Intelligence — focus windows, quiet planning, deadline-aware scheduling',
];

const FREE_VS_PRO_MATRIX: Array<{ free: string; pro: string }> = [
  { free: 'Start and complete sessions', pro: 'Deeper personalization from real session evidence' },
  { free: 'Basic rhythm and progress', pro: 'Weekly execution insights with rhythm and consistency map' },
  { free: 'Daily Coach Presence reflection', pro: 'Coach Memory learns from your patterns (evidence-backed)' },
  { free: 'Basic Study / Deep Work entry', pro: 'Imports, review loops, quizzes, and project breakdowns' },
  { free: 'Rescue mode', pro: 'Personalized recovery timing and weekly planning' },
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
  'Do not sell streak saves, coins, gems, shop power, or paid failure recovery.',
  'Show unavailable or coming-soon state instead of fake premium.',
];

function hiddenStrategy(triggerMoment: PremiumStrategy['triggerMoment'], headline: string): PremiumStrategy {
  return {
    canShowPaywall: false,
    entitlementArchitecture: ENTITLEMENT_ARCHITECTURE,
    freeFeatures: FREE_FEATURES,
    noFakeBillingChecklist: NO_FAKE_BILLING,
    paywallBody: 'Premium appears after VEX proves useful and live billing is healthy.',
    paywallHeadline: headline,
    premiumFeatures: PREMIUM_FEATURES,
    triggerMoment,
    freeVsProMatrix: FREE_VS_PRO_MATRIX,
  };
}

export function resolvePremiumStrategy(input: PremiumStrategyInput): PremiumStrategy {
  if (!input.billingConfigured) {
    return hiddenStrategy('hidden_billing_unavailable', 'Premium is not available yet');
  }
  if ((input.paywallDismissals ?? 0) >= 2) {
    return hiddenStrategy('none', 'Premium waits until there is real value');
  }
  // No paywall before soft-tease threshold (session 5), even with highIntentAction
  if (input.completedSessions < 5) {
    return hiddenStrategy('none', 'Premium waits until there is real value');
  }

  const hasValue = input.completedSessions >= 40;
  const triggerMoment = input.highIntentAction ?? (hasValue ? 'after_value' : 'none');
  const canShowPaywall = triggerMoment !== 'none';

  return {
    canShowPaywall,
    entitlementArchitecture: ENTITLEMENT_ARCHITECTURE,
    freeFeatures: FREE_FEATURES,
    noFakeBillingChecklist: NO_FAKE_BILLING,
    paywallBody: 'VEX Pro adds deeper memory, Study OS depth, weekly intelligence, calendar planning, and quiet recovery automation.',
    paywallHeadline: 'Turn your rhythm into a personal execution system',
    premiumFeatures: PREMIUM_FEATURES,
    triggerMoment,
    freeVsProMatrix: FREE_VS_PRO_MATRIX,
  };
}
