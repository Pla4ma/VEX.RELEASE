import type { PaywallContextType } from './PremiumTierSystem';

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

export type { PaywallContextType };

export const PAYWALL_CONTEXTS: Record<PaywallContextType, PaywallContextData> = {
  DEEP_COACH_MEMORY: {
    type: 'DEEP_COACH_MEMORY',
    title: 'Deep Coach Memory',
    headline: 'VEX learns your patterns',
    subtext: 'VEX remembers your best focus times, comeback style, and preferred push intensity — then adapts every session to you.',
    benefit1: '✓ Pattern-based session timing',
    benefit2: '✓ Personal comeback support',
    statText: 'Users with Coach Memory stay consistent 60% longer',
    ctaText: 'Unlock Coach Memory',
    secondaryCtaText: 'Maybe Later',
  },
  ADVANCED_STUDY_OS: {
    type: 'ADVANCED_STUDY_OS',
    title: 'Advanced Study / Deep Work',
    headline: 'Turn sessions into deep progress',
    subtext: 'Content generation, review loops, quizzes, project breakdowns, and smart next actions from your own material.',
    benefit1: '✓ Content-based session generation',
    benefit2: '✓ Review loops and quizzes',
    statText: 'Advanced Study users complete 50% more effective plans',
    ctaText: 'Unlock Study OS',
    secondaryCtaText: 'Maybe Later',
  },
  PROGRESS_INTELLIGENCE: {
    type: 'PROGRESS_INTELLIGENCE',
    title: 'Progress Intelligence',
    headline: 'See the full picture of your rhythm',
    subtext: 'Weekly execution report, best rhythm detection, focus risk insights, and consistency mapping.',
    benefit1: '✓ Weekly execution report',
    benefit2: '✓ Focus risk detection',
    statText: 'Intelligence users improve 45% faster',
    ctaText: 'Unlock Intelligence',
    secondaryCtaText: 'Maybe Later',
  },
  VISUAL_IDENTITY: {
    type: 'VISUAL_IDENTITY',
    title: 'Visual Identity',
    headline: 'Shape your companion and focus world',
    subtext: 'Customize companion forms, boss skins, focus worlds, and session atmospheres without changing core progress.',
    benefit1: '✓ Companion form customization',
    benefit2: '✓ Focus world themes',
    statText: 'Users with custom identity stay engaged longer',
    ctaText: 'Unlock Identity',
    secondaryCtaText: 'Maybe Later',
  },
  PREMIUM_SESSION_MODES: {
    type: 'PREMIUM_SESSION_MODES',
    title: 'Premium Session Modes',
    headline: 'Deeper tools when the loop is working',
    subtext: 'Exam Sprint for test prep, Deep Work for flow, Calm Reset for recovery, Boss Focus for intensity, Comeback Mode for returns, Review Mode for reinforcement.',
    benefit1: '✓ Six premium session modes',
    benefit2: '✓ Mode-specific coaching',
    statText: 'Premium mode users complete 35% more sessions',
    ctaText: 'Unlock Modes',
    secondaryCtaText: 'Maybe Later',
  },
  RECOVERY_PLANNING: {
    type: 'RECOVERY_PLANNING',
    title: 'Recovery Planning',
    headline: 'Return without shame',
    subtext: 'Build a recovery plan that helps you come back without guilt or backlog pressure after missed sessions.',
    benefit1: '✓ Personalized recovery path',
    benefit2: '✓ Backlog-free restart',
    statText: 'Recovery plans reduce dropout by 40%',
    ctaText: 'Unlock Recovery',
    secondaryCtaText: 'Maybe Later',
  },
  STUDY_PLAN_LIMIT: {
    type: 'STUDY_PLAN_LIMIT',
    title: 'Study Plan Limit Reached',
    headline: 'Organize all your projects',
    subtext: 'Free users can have 1 active study plan. Upgrade to create unlimited plans and organize all your subjects.',
    benefit1: '✓ Create unlimited study plans',
    benefit2: '✓ Organize by topic or project',
    statText: 'Premium users complete 78% more study plans',
    ctaText: 'Unlock Plans',
    secondaryCtaText: 'Maybe Later',
  },
};

export function getPaywallContext(type: PaywallContextType): PaywallContextData {
  return PAYWALL_CONTEXTS[type];
}
