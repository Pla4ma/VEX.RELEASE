import type { PurchasesPackageDisplayInfo } from '../../shared/monetization';
import { launchColors } from '@theme/tokens/launch-colors';


export const VALUE_PROPOSITION = 'Premium is durable personalization — not a game economy. No coins, no gems, no chests.';
export const FREE_BOUNDARY_COPY =
  'Core sessions, basic progress, streak building, basic Coach Presence, and Rescue mode stay free forever.';
export const PREMIUM_BOUNDARY_COPY =
  'Premium adds long memory, advanced focus reports, study import depth, project continuity, calendar intelligence, advanced friction modes, weekly experiments, and private memory console controls.';

const FALLBACK_PRICING = {
  monthly: 'Live pricing unavailable',
  annual: 'Live pricing unavailable',
};

export const PREMIUM_FEATURES = [
  {
    iconName: 'check',
    title: 'Deep Coach Memory',
    description: 'VEX remembers patterns, comeback style, best focus windows, and preferred push style',
  },
  {
    iconName: 'book-open',
    title: 'Advanced Study / Deep Work OS',
    description: 'Turn sessions into review loops, project breakdowns, quizzes, and smart next actions',
  },
  {
    iconName: 'bar-chart-3',
    title: 'Progress Intelligence',
    description: 'See rhythm, focus risk, recovery plans, and consistency forecasts',
  },
  {
    iconName: 'sparkles',
    title: 'Visual Identity',
    description: 'Shape companion forms, focus worlds, session atmospheres, and premium animations',
  },
  {
    iconName: 'zap',
    title: 'Premium Session Modes',
    description: 'Use Exam Sprint, Deep Work, Calm Reset, Boss Focus, Comeback, and Review modes',
  },
];

export type PaywallFeatureHighlight = {
  title: string;
  benefit: string;
  iconName: string;
  gradient: readonly [string, string];
};

export const FEATURE_HIGHLIGHT_MAP: Record<string, PaywallFeatureHighlight> = {
  deep_coach_memory: {
    title: 'Deep Coach Memory',
    benefit: 'VEX remembers patterns, comeback style, best focus windows, and preferred push intensity across all sessions.',
    iconName: 'brain',
    gradient: [launchColors.hex_4f46e5, launchColors.hex_7c3aed],
  },
  progress_intelligence: {
    title: 'Weekly Focus Intelligence',
    benefit: 'See your best rhythm, focus risk, recovery plan, consistency forecast, and calendar-aware planning.',
    iconName: 'bar-chart-3',
    gradient: [launchColors.hex_0f766e, launchColors.hex_0d9488],
  },
  advanced_study_os: {
    title: 'Advanced Study & Deep Work',
    benefit: 'Advanced import, review intelligence, deadline risk, weak-topic plan, and smart next actions from your material.',
    iconName: 'book-open',
    gradient: [launchColors.hex_d97706, launchColors.hex_f59e0b],
  },
  recovery_planning: {
    title: 'Recovery & Continuity',
    benefit: 'Build a recovery plan without shame. Long project memory and context restoration keep flow alive across sessions.',
    iconName: 'shield',
    gradient: [launchColors.hex_059669, launchColors.hex_10b981],
  },
  premium_session_modes: {
    title: 'Advanced Friction Modes',
    benefit: 'Custom modifiers, personal boss depth, advanced run recap — no currency, no gimmicks.',
    iconName: 'zap',
    gradient: [launchColors.hex_4f46e5, launchColors.hex_7c3aed],
  },
  visual_identity: {
    title: 'Memory Console & Identity',
    benefit: 'Editable long memory with source, confidence, and expiry. Shape companion forms and focus worlds.',
    iconName: 'award',
    gradient: [launchColors.hex_0f766e, launchColors.hex_0d9488],
  },
};

export type PaywallPlanSelection = {
  id: 'annual' | 'monthly';
  title: string;
  subtitle: string;
  displayPrice: string;
  badge: string;
  packageInfo: PurchasesPackageDisplayInfo | undefined;
};

export function buildPackageSelection(
  packages: readonly PurchasesPackageDisplayInfo[],
): PaywallPlanSelection[] {
  const annual = packages.find((item) => item.packageType.toUpperCase() === 'ANNUAL');
  const monthly = packages.find((item) => item.packageType.toUpperCase() === 'MONTHLY');

  return [
    {
      id: 'annual',
      title: 'Annual',
      subtitle: 'Best value for committed users',
      displayPrice: annual?.product.priceString ?? FALLBACK_PRICING.annual,
      badge: 'Best value',
      packageInfo: annual,
    },
    {
      id: 'monthly',
      title: 'Monthly',
      subtitle: 'Flexible entry point',
      displayPrice: monthly?.product.priceString ?? FALLBACK_PRICING.monthly,
      badge: 'Most flexible',
      packageInfo: monthly,
    },
  ];
}
