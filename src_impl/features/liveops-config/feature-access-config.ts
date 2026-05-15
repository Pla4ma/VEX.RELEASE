import type { FeatureAccess, FeatureKey } from './feature-access';

type FeatureCopy = Pick<
  FeatureAccess,
  'lockedDescription' | 'recommendedUnlockMoment' | 'unlockReason'
>;

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
  'shop',
  'streak_insurance',
];

export const DEFAULT_COPY: FeatureCopy = {
  lockedDescription:
    'This layer opens after the core session loop has enough signal.',
  recommendedUnlockMoment: 'Keep completing focused sessions',
  unlockReason: 'Unlocks when it has enough context to matter.',
};

export const FEATURE_THRESHOLDS: Record<FeatureKey, number> = {
  achievements: 6,
  advanced_settings: 12,
  ai_coach_advanced: 8,
  ai_coach_basic: 0,
  battle_pass: Number.POSITIVE_INFINITY,
  boss_bounties: Number.POSITIVE_INFINITY,
  boss_tab: 7,
  challenges: 1,
  companion_detail: 3,
  content_study: 12,
  content_study_advanced: 18,
  economy_advanced: Number.POSITIVE_INFINITY,
  economy_basic: 5,
  focus_session: 0,
  focus_tab: 0,
  gems_prominent: Number.POSITIVE_INFINITY,
  home_tab: 0,
  inventory: Number.POSITIVE_INFINITY,
  premium_paywall: 3,
  profile_tab: 0,
  progress_view: 0,
  quiz_review_mode: 10,
  rankings: Number.POSITIVE_INFINITY,
  rivals: Number.POSITIVE_INFINITY,
  seasonal_features: 15,
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
    lockedDescription:
      'Boss fights work best once sessions already feel normal. Build the habit first, then add the fight.',
    recommendedUnlockMoment: 'After session 7',
    unlockReason: 'Unlocks after 7 sessions as a concrete midgame target.',
  },
  challenges: {
    lockedDescription:
      'Daily challenges need one completed session so the app can point you at the next useful push.',
    recommendedUnlockMoment: 'After your first session',
    unlockReason: 'Unlocks after 1 session.',
  },
  companion_detail: {
    lockedDescription:
      'Companion detail opens once there is enough history for it to reflect your real work.',
    recommendedUnlockMoment: 'After session 3',
    unlockReason: 'Unlocks after 3 sessions.',
  },
  economy_basic: {
    lockedDescription:
      'XP and progress come first. Currency stays quiet during beta.',
    recommendedUnlockMoment: 'After session 5',
    unlockReason: 'Unlocks after 5 sessions.',
  },
  inventory: {
    lockedDescription:
      'Inventory is paused for beta so focus sessions stay simple.',
    recommendedUnlockMoment: 'Not in beta',
    unlockReason: 'Returns after rewards prove they help the focus loop.',
  },
  shop: {
    lockedDescription:
      'The shop is paused for beta so the app proves value before monetization.',
    recommendedUnlockMoment: 'Not in beta',
    unlockReason: 'Returns after the core focus loop is working.',
  },
  streak_insurance: {
    lockedDescription:
      'Streak recovery is gentle in beta: comeback sessions, rhythm recovery, and restart support.',
    recommendedUnlockMoment: 'Not in beta',
    unlockReason: 'Insurance-style recovery is paused until tested.',
  },
};
