import type { FeatureAccess, FeatureKey } from './feature-access';

type FeatureCopy = Pick<FeatureAccess, 'lockedDescription' | 'recommendedUnlockMoment' | 'unlockReason'>;

export const DISABLED_FEATURES: FeatureKey[] = [
  'squads',
  'social_tab',
  'rivals',
  'rankings',
  'wagers',
  'gems_prominent',
];

export const DEFAULT_COPY: FeatureCopy = {
  lockedDescription: 'This layer opens after the core session loop has enough signal.',
  recommendedUnlockMoment: 'Keep completing focused sessions',
  unlockReason: 'Unlocks when it has enough context to matter.',
};

export const FEATURE_THRESHOLDS: Record<FeatureKey, number> = {
  achievements: 0,
  advanced_settings: 10,
  ai_coach_advanced: 10,
  ai_coach_basic: 0,
  battle_pass: 15,
  boss_bounties: 10,
  boss_tab: 7,
  challenges: 1,
  companion_detail: 3,
  content_study: 0,
  content_study_advanced: 10,
  economy_advanced: 10,
  economy_basic: 5,
  focus_session: 0,
  focus_tab: 0,
  gems_prominent: Number.POSITIVE_INFINITY,
  home_tab: 0,
  inventory: 10,
  premium_paywall: 0,
  profile_tab: 0,
  progress_view: 0,
  quiz_review_mode: 10,
  rankings: Number.POSITIVE_INFINITY,
  rivals: Number.POSITIVE_INFINITY,
  seasonal_features: 15,
  shop: 10,
  social_tab: Number.POSITIVE_INFINITY,
  squads: Number.POSITIVE_INFINITY,
  streak_insurance: 3,
  wagers: Number.POSITIVE_INFINITY,
};

export const FEATURE_COPY: Partial<Record<FeatureKey, FeatureCopy>> = {
  battle_pass: {
    lockedDescription: "Battle Pass tracks progress across a full season. It earns its meaning after you've seen what consistent focus feels like.",
    recommendedUnlockMoment: 'After session 15',
    unlockReason: 'Unlocks after 15 sessions, when season progress has context.',
  },
  boss_tab: {
    lockedDescription: 'Boss fights work best once sessions already feel normal. Build the habit first, then add the fight.',
    recommendedUnlockMoment: 'After session 7',
    unlockReason: 'Unlocks after 7 sessions as a concrete midgame target.',
  },
  challenges: {
    lockedDescription: 'Daily challenges need one completed session so the app can point you at the next useful push.',
    recommendedUnlockMoment: 'After your first session',
    unlockReason: 'Unlocks after 1 session.',
  },
  companion_detail: {
    lockedDescription: 'Companion detail opens once there is enough history for it to reflect your real work.',
    recommendedUnlockMoment: 'After session 3',
    unlockReason: 'Unlocks after 3 sessions.',
  },
  economy_basic: {
    lockedDescription: 'Coins start showing once you have enough sessions to understand what they reward.',
    recommendedUnlockMoment: 'After session 5',
    unlockReason: 'Unlocks after 5 sessions.',
  },
  inventory: {
    lockedDescription: 'Inventory matters once there is a shop and earned items to manage.',
    recommendedUnlockMoment: 'After session 10',
    unlockReason: 'Unlocks after 10 sessions alongside the shop.',
  },
  shop: {
    lockedDescription: 'The shop opens after coins have had time to feel earned, not arbitrary.',
    recommendedUnlockMoment: 'After session 10',
    unlockReason: 'Unlocks after 10 sessions.',
  },
  streak_insurance: {
    lockedDescription: 'Streak insurance matters after a streak is real enough to protect.',
    recommendedUnlockMoment: 'After session 3',
    unlockReason: 'Unlocks after 3 sessions.',
  },
};
