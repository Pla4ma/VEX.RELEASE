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

export const PAYWALL_CONTEXTS: Record<PaywallContextType, PaywallContextData> =
  {
    DEEP_COACH_MEMORY: {
      type: 'DEEP_COACH_MEMORY',
      title: 'Personalized Session Intelligence',
      headline: 'Your VEX remembers what works',
      subtext:
        'VEX tracks your best focus times, comeback patterns, and preferred session rhythm — then adapts every session to you.',
      benefit1: '✓ Pattern-based session timing',
      benefit2: '✓ Personal comeback support',
      statText: 'Users with personalized intelligence stay consistent 60% longer',
      ctaText: 'Get Personalized Intelligence',
      secondaryCtaText: 'Maybe Later',
    },
    ADVANCED_STUDY_OS: {
      type: 'ADVANCED_STUDY_OS',
      title: 'Deeper Study Intelligence',
      headline: 'Your material shapes your sessions',
      subtext:
        'Content generation, review loops, quizzes, project breakdowns, and smart next actions from your own material.',
      benefit1: '✓ Content-based session generation',
      benefit2: '✓ Review loops and quizzes',
      statText: 'Study Intelligence users complete 50% more effective plans',
      ctaText: 'Get Study Intelligence',
      secondaryCtaText: 'Maybe Later',
    },
    PROGRESS_INTELLIGENCE: {
      type: 'PROGRESS_INTELLIGENCE',
      title: 'Weekly Progress Intelligence',
      headline: 'See the full picture of your rhythm',
      subtext:
        'Weekly execution report, best rhythm detection, focus risk insights, and consistency mapping.',
      benefit1: '✓ Weekly execution report',
      benefit2: '✓ Focus risk detection',
      statText: 'Intelligence users improve 45% faster',
      ctaText: 'Get Weekly Intelligence',
      secondaryCtaText: 'Maybe Later',
    },
    VISUAL_IDENTITY: {
      type: 'VISUAL_IDENTITY',
      title: 'Memory Console & Identity',
      headline: 'Control what VEX remembers',
      subtext:
        'View, edit, and manage your memory with source, confidence, and expiry. Shape companion forms and focus worlds to match your lane.',
      benefit1: '✓ Editable long memory with source tracking',
      benefit2: '✓ Lane-matched focus world themes',
      statText: 'Memory Console users stay consistent longer',
      ctaText: 'Get Memory Console',
      secondaryCtaText: 'Maybe Later',
    },
    PREMIUM_SESSION_MODES: {
      type: 'PREMIUM_SESSION_MODES',
      title: 'Advanced Session Depth',
      headline: 'Lane-matched session depth',
      subtext:
        'Study: Exam Sprint and Review Mode. Run: Boss Focus and Comeback. Project: Deep Work and Calm Reset. Clean: Quiet Focus and Weekly Planning.',
      benefit1: '✓ Lane-specific session depth',
      benefit2: '✓ Mode-matched coaching per lane',
      statText: 'Advanced mode users complete 35% more sessions',
      ctaText: 'Get Advanced Modes',
      secondaryCtaText: 'Maybe Later',
    },
    RECOVERY_PLANNING: {
      type: 'RECOVERY_PLANNING',
      title: 'Recovery Planning',
      headline: 'Return without shame',
      subtext:
        'Build a recovery plan that helps you come back without guilt or backlog pressure after missed sessions.',
      benefit1: '✓ Personalized recovery path',
      benefit2: '✓ Backlog-free restart',
      statText: 'Recovery plans reduce dropout by 40%',
      ctaText: 'Get Recovery Planning',
      secondaryCtaText: 'Maybe Later',
    },
    STUDY_PLAN_LIMIT: {
      type: 'STUDY_PLAN_LIMIT',
      title: 'Study Plan Limit Reached',
      headline: 'Organize all your projects',
      subtext:
        'Free users can have 1 active study plan. Upgrade to create unlimited plans and organize all your subjects.',
      benefit1: '✓ Create unlimited study plans',
      benefit2: '✓ Organize by topic or project',
      statText: 'Premium users complete 78% more study plans',
      ctaText: 'Get Unlimited Plans',
      secondaryCtaText: 'Maybe Later',
    },
  };

export function getPaywallContext(
  type: PaywallContextType,
): PaywallContextData {
  return PAYWALL_CONTEXTS[type];
}
