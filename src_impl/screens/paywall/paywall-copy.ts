import type { PurchasesPackageDisplayInfo } from '../../shared/monetization';

export const VALUE_PROPOSITION = 'Premium adds depth after the core focus loop is useful.';
export const FREE_BOUNDARY_COPY =
  'Core sessions, basic progress, streak building, and earned rewards stay free.';
export const PREMIUM_BOUNDARY_COPY =
  'Premium adds advanced coaching, deeper insights, and continuity tools for users who already rely on VEX.';

const FALLBACK_PRICING = {
  monthly: 'Live pricing unavailable',
  annual: 'Live pricing unavailable',
};

export const PREMIUM_FEATURES = [
  {
    iconName: 'check',
    title: 'Advanced AI Coach',
    description: 'Personalized guidance that adapts to your focus patterns',
  },
  {
    iconName: 'shield',
    title: 'Streak Protection',
    description: 'Safeguard your progress against unexpected interruptions',
  },
  {
    iconName: 'bar-chart-3',
    title: 'Deep Analytics',
    description: 'Insights on when you focus best and how to improve',
  },
  {
    iconName: 'sparkles',
    title: 'Priority Support',
    description: 'Get help faster when you need it most',
  },
  {
    iconName: 'book-open',
    title: 'Exclusive Content',
    description: 'Premium challenges and study materials',
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
    title: 'Best Coach',
    benefit: 'Premium unlocks sharper timing, better nudges, and recommendations that fit your rhythm.',
    iconName: 'brain',
    gradient: ['theme.colors.primary[500]', 'theme.colors.primary[500]'],
  },
  advanced_analytics: {
    title: 'Best Insight',
    benefit: 'Premium helps you see when your focus is strongest and where momentum starts leaking.',
    iconName: 'bar-chart-3',
    gradient: ['theme.colors.primary[500]', 'theme.colors.primary[500]'],
  },
  content_study: {
    title: 'Best Insight',
    benefit: 'Premium expands VEX into a deeper work tool once your focus habit is taking hold.',
    iconName: 'book-open',
    gradient: ['theme.colors.primary[500]', 'theme.colors.primary[500]'],
  },
  streak_freeze: {
    title: 'Best Continuity',
    benefit: "Premium protects momentum so one rough day doesn't erase progress.",
    iconName: 'shield',
    gradient: ['theme.colors.primary[500]', 'theme.colors.primary[500]'],
  },
  xp_boost: {
    title: 'Reward boost',
    benefit: 'Premium makes strong sessions feel more rewarding without blocking the focus session itself.',
    iconName: 'zap',
    gradient: ['theme.colors.primary[500]', 'theme.colors.primary[500]'],
  },
  season_premium_rewards: {
    title: 'Season rewards',
    benefit: 'Premium adds the extra reward track while the free track still keeps seasonal progress useful.',
    iconName: 'award',
    gradient: ['theme.colors.primary[500]', 'theme.colors.primary[500]'],
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
