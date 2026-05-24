import type { PurchasesPackageDisplayInfo } from '../../shared/monetization';
import { launchColors } from '@theme/tokens/launch-colors';


export const VALUE_PROPOSITION = 'Premium adds depth after the core focus loop is useful.';
export const FREE_BOUNDARY_COPY =
  'Core sessions, basic progress, streak building, and basic Coach Presence stay free.';
export const PREMIUM_BOUNDARY_COPY =
  'Premium adds deeper coach memory, progress intelligence, and execution tools for users who already rely on VEX.';

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
  ai_coach_full_access: {
    title: 'Deeper Coach Memory',
    benefit: 'Let VEX learn your rhythm deeply and turn sessions into a full execution system.',
    iconName: 'brain',
    gradient: [launchColors.hex_4f46e5, launchColors.hex_7c3aed],
  },
  advanced_analytics: {
    title: 'Progress Intelligence',
    benefit: 'See your best rhythm, focus risk, recovery plan, and consistency forecast.',
    iconName: 'bar-chart-3',
    gradient: [launchColors.hex_0f766e, launchColors.hex_0d9488],
  },
  content_study: {
    title: 'Advanced Study / Deep Work',
    benefit: 'Break projects, study loops, and review sessions into smart next actions.',
    iconName: 'book-open',
    gradient: [launchColors.hex_d97706, launchColors.hex_f59e0b],
  },
  streak_freeze: {
    title: 'Recovery Planning',
    benefit: 'Build a recovery plan that helps you return without shame or backlog pressure.',
    iconName: 'shield',
    gradient: [launchColors.hex_059669, launchColors.hex_10b981],
  },
  xp_boost: {
    title: 'Premium Session Modes',
    benefit: 'Choose deeper session modes when the basic loop is already working.',
    iconName: 'zap',
    gradient: [launchColors.hex_4f46e5, launchColors.hex_7c3aed],
  },
  season_premium_rewards: {
    title: 'Visual Identity',
    benefit: 'Shape the companion, atmosphere, and focus world without changing core progress.',
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
