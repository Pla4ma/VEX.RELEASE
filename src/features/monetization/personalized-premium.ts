import { z } from 'zod';
import { FREE_FEATURE_STRS, PREMIUM_FEATURE_STRS } from './tier-definitions';

const PremiumPersonalizationInputSchema = z.object({
  billingConfigured: z.boolean(),
  completedSessions: z.number().int().min(0),
  primaryGoal: z.enum(['focus', 'study', 'work', 'creative', 'personal', 'learning']),
  motivationStyle: z.enum(['calm', 'friendly', 'coach_led', 'game_like', 'intense', 'study_focused']),
  studyUsageRatio: z.number().min(0).max(1),
  hasTriedAdvancedStudy: z.boolean(),
  hasTriedWeeklyReport: z.boolean(),
  hasTriedVisualIdentity: z.boolean(),
  currentStreakDays: z.number().int().min(0),
  daysSinceOnboarding: z.number().int().min(0),
}).strict();

const PremiumPersonalizationOutputSchema = z.object({
  canShowPaywall: z.boolean(),
  triggerMoment: z.enum([
    'hidden_billing_unavailable',
    'none',
    'session_value',
    'advanced_study',
    'weekly_intelligence',
    'custom_identity',
    'deep_coach_memory',
    'deep_work_plan_personalized',
  ]),
  freeVsProMatrix: z.array(z.object({ free: z.string().min(1), pro: z.string().min(1) }).strict()),
  premiumHeadline: z.string().min(1),
  premiumBody: z.string().min(1),
  freeFeatures: z.array(z.string().min(1)),
  premiumFeatures: z.array(z.string().min(1)),
  noFakeBillingChecklist: z.array(z.string().min(1)),
});

export type PremiumPersonalizationInput = z.infer<typeof PremiumPersonalizationInputSchema>;
export type PremiumPersonalizationOutput = z.infer<typeof PremiumPersonalizationOutputSchema>;

const NO_FAKE_BILLING = [
  'Do not render purchasable plans without RevenueCat packages.',
  'Do not mark premium active without an active entitlement.',
  'Do not paywall the basic focus loop.',
  'Show unavailable or coming-soon state instead of fake premium.',
];

function buildFreeVsProMatrix(input: PremiumPersonalizationInput): Array<{ free: string; pro: string }> {
  const studyLabel = input.primaryGoal === 'study' || input.primaryGoal === 'learning' ? 'Study OS' : 'Deep Work Plan';
  return [
    { free: 'Start and complete sessions', pro: 'Premium session modes (Exam Sprint, Deep Work, Calm Reset, Boss Focus)' },
    { free: 'Basic streak and progress', pro: 'Weekly execution report with rhythm and consistency map' },
    { free: 'Daily Coach Presence reflection', pro: 'Deep Coach Memory — remembers your patterns and best times' },
    { free: `Basic ${studyLabel} entry`, pro: 'Content generation, review loops, quizzes, project breakdowns' },
    { free: 'Subtle momentum visual', pro: 'Full visual identity — companion forms, focus worlds, atmospheres' },
  ];
}

function resolveTriggerMoment(input: PremiumPersonalizationInput): PremiumPersonalizationOutput['triggerMoment'] {
  if (!input.billingConfigured) return 'hidden_billing_unavailable';
  if (input.completedSessions < 5) return 'none';
  if (input.hasTriedAdvancedStudy) return 'advanced_study';
  if (input.hasTriedWeeklyReport) return 'weekly_intelligence';
  if (input.hasTriedVisualIdentity) return 'custom_identity';
  if (input.currentStreakDays >= 10 && input.studyUsageRatio >= 0.3) return 'deep_coach_memory';
  if (input.studyUsageRatio >= 0.5) return 'deep_work_plan_personalized';
  return 'session_value';
}

function getPersonalizedHeadline(input: PremiumPersonalizationInput): string {
  if (!input.billingConfigured) return 'Premium is not available yet';
  if (input.hasTriedAdvancedStudy) return 'Your study system is ready to go deeper';
  if (input.hasTriedWeeklyReport) return 'See the full picture of your rhythm';
  if (input.motivationStyle === 'calm') return 'Let VEX learn what works for you';
  if (input.motivationStyle === 'intense') return 'Turn your momentum into a complete system';
  if (input.motivationStyle === 'study_focused') return 'Turn every study block into deep progress';
  return 'Turn your sessions into a full execution system';
}

function getPersonalizedBody(input: PremiumPersonalizationInput): string {
  if (!input.billingConfigured) {
    return 'Premium appears when live billing and real premium value are ready. Keep building your rhythm.';
  }
  if (input.hasTriedAdvancedStudy) {
    return 'VEX Pro builds from your content — generates review loops, quizzes, and smart next actions from your material. Deep Coach Memory tracks your best times and comeback patterns.';
  }
  if (input.primaryGoal === 'study' || input.primaryGoal === 'learning') {
    return 'Your study rhythm is taking shape. VEX Pro adds content generation, review scheduling, and smart quizzes. The app learns your best study times and builds around them.';
  }
  if (input.motivationStyle === 'calm') {
    return 'VEX Pro quietly optimizes around your patterns — remembers when you focus best, adjusts your start experience, and keeps the system simple but smarter.';
  }
  return 'VEX Pro turns your sessions into a full execution system. Deep Coach Memory remembers your patterns. Study OS builds from your content. Weekly intelligence maps your rhythm.';
}

export function resolvePersonalizedPremium(rawInput: unknown): PremiumPersonalizationOutput {
  const input = PremiumPersonalizationInputSchema.parse(rawInput);
  const triggerMoment = resolveTriggerMoment(input);
  const canShowPaywall = triggerMoment !== 'hidden_billing_unavailable' && triggerMoment !== 'none';

  return PremiumPersonalizationOutputSchema.parse({
    canShowPaywall,
    triggerMoment,
    freeVsProMatrix: buildFreeVsProMatrix(input),
    premiumHeadline: getPersonalizedHeadline(input),
    premiumBody: getPersonalizedBody(input),
    freeFeatures: FREE_FEATURE_STRS,
    premiumFeatures: PREMIUM_FEATURE_STRS,
    noFakeBillingChecklist: NO_FAKE_BILLING,
  });
}
