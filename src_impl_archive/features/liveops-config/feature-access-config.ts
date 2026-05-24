import type { FeatureAccess, FeatureKey, FeatureReleaseState } from './feature-access';

type FeatureCopy = Pick<
  FeatureAccess,
  'lockedDescription' | 'recommendedUnlockMoment' | 'unlockReason'
>;

export { FEATURE_MOTIVATION_PROFILES } from './feature-motivation-config';
export type { MotivationProfileConfig } from './feature-motivation-config';

export const DISABLED_FEATURES: FeatureKey[] = [
  'squads',
  'social_tab',
  'rivals',
  'rankings',
  'wagers',
  'gems_prominent',
  'battle_pass',
  'boss_bounties',
  'economy_advanced',
  'inventory',
  'seasonal_features',
  'shop',
  'streak_insurance',
];

export const FEATURE_RELEASE_STATES: Record<FeatureKey, FeatureReleaseState> = {
  achievements: 'progressive',
  advanced_settings: 'progressive',
  ai_coach_advanced: 'progressive',
  ai_coach_basic: 'core',
  battle_pass: 'disabled_beta',
  boss_bounties: 'disabled_beta',
  boss_tab: 'progressive',
  challenges: 'progressive',
  companion_detail: 'progressive',
  content_study: 'progressive',
  content_study_advanced: 'progressive',
  economy_advanced: 'disabled_beta',
  economy_basic: 'progressive',
  focus_session: 'core',
  focus_tab: 'core',
  gems_prominent: 'disabled_beta',
  home_tab: 'core',
  inventory: 'disabled_beta',
  premium_paywall: 'disabled_beta',
  profile_tab: 'core',
  progress_view: 'core',
  quiz_review_mode: 'progressive',
  rankings: 'disabled_beta',
  rivals: 'disabled_beta',
  seasonal_features: 'disabled_beta',
  shop: 'disabled_beta',
  social_tab: 'disabled_beta',
  squads: 'disabled_beta',
  streak_insurance: 'disabled_beta',
  wagers: 'disabled_beta',
};

export const FEATURE_TEASER_STARTS: Partial<Record<FeatureKey, number>> = {
  companion_detail: 2,
  challenges: 4,
  boss_tab: 5,
  ai_coach_advanced: 6,
  content_study: 8,
  quiz_review_mode: 9,
};

export const FEATURE_PRIORITIES: Partial<Record<FeatureKey, number>> = {
  companion_detail: 1,
  challenges: 2,
  content_study: 3,
  boss_tab: 4,
  ai_coach_advanced: 5,
  economy_basic: 6,
  quiz_review_mode: 7,
};

export const DEFAULT_COPY: FeatureCopy = {
  lockedDescription: 'This layer opens after your focus rhythm is strong enough.',
  recommendedUnlockMoment: 'Keep completing focused sessions',
  unlockReason: 'Unlocks when your consistency proves the habit is real.',
};

export const FEATURE_THRESHOLDS: Record<FeatureKey, number> = {
  achievements: 6,
  advanced_settings: 12,
  ai_coach_advanced: 8,
  ai_coach_basic: 0,
  battle_pass: Number.POSITIVE_INFINITY,
  boss_bounties: Number.POSITIVE_INFINITY,
  boss_tab: 7,
  challenges: 5,
  companion_detail: 3,
  content_study: 12,
  content_study_advanced: 18,
  economy_advanced: Number.POSITIVE_INFINITY,
  economy_basic: 8,
  focus_session: 0,
  focus_tab: 0,
  gems_prominent: Number.POSITIVE_INFINITY,
  home_tab: 0,
  inventory: Number.POSITIVE_INFINITY,
  premium_paywall: Number.POSITIVE_INFINITY,
  profile_tab: 0,
  progress_view: 0,
  quiz_review_mode: 10,
  rankings: Number.POSITIVE_INFINITY,
  rivals: Number.POSITIVE_INFINITY,
  seasonal_features: Number.POSITIVE_INFINITY,
  shop: Number.POSITIVE_INFINITY,
  social_tab: Number.POSITIVE_INFINITY,
  squads: Number.POSITIVE_INFINITY,
  streak_insurance: Number.POSITIVE_INFINITY,
  wagers: Number.POSITIVE_INFINITY,
};

export const FEATURE_COPY: Partial<Record<FeatureKey, FeatureCopy>> = {
  battle_pass: {
    lockedDescription:
      "Season progress is paused for beta while the daily focus loop gets proven.",
    recommendedUnlockMoment: 'Not in beta',
    unlockReason:
      'Returns after the core loop is stable and useful.',
  },
  boss_tab: {
    lockedDescription: 'Bosses stay quiet until focus is the obvious center. When they appear, damage only means minutes focused.',
    recommendedUnlockMoment: 'After session 7, later for calm or study-focused styles',
    unlockReason: 'Unlocks after enough sessions for boss progress to reinforce focus instead of competing with it.',
  },
  challenges: {
    lockedDescription: 'Challenges turn the next focus or study target into one concrete action.',
    recommendedUnlockMoment: 'After session 5',
    unlockReason: 'Unlocks after 5 sessions when patterns are clear.',
  },
  companion_detail: {
    lockedDescription: 'Your companion reflects your real focus journey. A few sessions give it enough history to be meaningful.',
    recommendedUnlockMoment: 'After session 3',
    unlockReason: 'Unlocks after 3 sessions so your companion has real data to work with.',
  },
  economy_basic: {
    lockedDescription: 'Points and progress tracking stay quiet while the focus habit forms.',
    recommendedUnlockMoment: 'After session 8',
    unlockReason: 'Unlocks after 8 sessions when focus is the proven baseline.',
  },
  inventory: {
    lockedDescription: 'Customization stays hidden so focus sessions remain the only thing that matters.',
    recommendedUnlockMoment: 'Not in beta',
    unlockReason: 'Returns after the focus loop proves it can carry extra layers.',
  },
  shop: {
    lockedDescription: 'The shop stays closed so the app proves value before offering extras.',
    recommendedUnlockMoment: 'Not in beta',
    unlockReason: 'Returns after the core focus loop is undeniably working.',
  },
  premium_paywall: {
    lockedDescription:
      'Premium stays hidden until live subscriptions, entitlements, and real premium value are ready.',
    recommendedUnlockMoment: 'Not in beta',
    unlockReason:
      'Appears only after the core loop proves value and RevenueCat is fully configured.',
  },
  streak_insurance: {
    lockedDescription: 'Streak recovery is gentle: comeback sessions, rhythm recovery, and fresh starts.',
    recommendedUnlockMoment: 'Not in beta',
    unlockReason: 'Recovery tools unlock when needed, not before.',
  },
};
