export type UserExperienceStage =
  | 'NEW_USER'
  | 'ACTIVATING'
  | 'ENGAGED'
  | 'POWER_USER';

export type ProductTier = 'CORE' | 'SECONDARY' | 'EXPANSION';

export type FeatureKey =
  | 'focus_session'
  | 'progress_view'
  | 'ai_coach_basic'
  | 'ai_coach_advanced'
  | 'economy_basic'
  | 'economy_advanced'
  | 'home_tab'
  | 'focus_tab'
  | 'social_tab'
  | 'profile_tab'
  | 'boss_tab'
  | 'boss_bounties'
  | 'squads'
  | 'rivals'
  | 'battle_pass'
  | 'achievements'
  | 'challenges'
  | 'rankings'
  | 'shop'
  | 'inventory'
  | 'wagers'
  | 'streak_insurance'
  | 'gems_prominent'
  | 'content_study'
  | 'content_study_advanced'
  | 'quiz_review_mode'
  | 'companion_detail'
  | 'seasonal_features'
  | 'premium_paywall'
  | 'advanced_settings';

export interface FeatureAccess {
  isUnlocked: boolean;
  isVisible: boolean;
  lockedDescription: string;
  recommendedUnlockMoment: string;
  unlockReason: string;
}

export type FeatureAccessMap = Record<FeatureKey, FeatureAccess>;

export interface FeatureAccessInputs {
  totalCompletedSessions: number;
}

export function getStage(totalCompletedSessions: number): UserExperienceStage {
  if (totalCompletedSessions <= 0) {
    return 'NEW_USER';
  }
  if (totalCompletedSessions < 3) {
    return 'ACTIVATING';
  }
  if (totalCompletedSessions < 10) {
    return 'ENGAGED';
  }
  return 'POWER_USER';
}

export function getProductTier(stage: UserExperienceStage): ProductTier {
  if (stage === 'NEW_USER' || stage === 'ACTIVATING') {
    return 'CORE';
  }
  if (stage === 'ENGAGED') {
    return 'SECONDARY';
  }
  return 'EXPANSION';
}

const LOCKED_COPY = {
  lockedDescription: 'Keep building your core focus loop before this layer opens.',
  recommendedUnlockMoment: 'Complete three focused sessions',
  unlockReason: 'Unlocks after your focus habit has a signal.',
};

const CORE_FEATURES: FeatureKey[] = [
  'focus_session',
  'progress_view',
  'ai_coach_basic',
  'home_tab',
  'focus_tab',
  'profile_tab',
  'achievements',
  'content_study',
  'premium_paywall',
];

const SECONDARY_FEATURES: FeatureKey[] = [
  'economy_basic',
  'boss_tab',
  'squads',
  'social_tab',
  'inventory',
  'shop',
  'streak_insurance',
  'companion_detail',
  'challenges',
];

const EXPANSION_FEATURES: FeatureKey[] = [
  'ai_coach_advanced',
  'economy_advanced',
  'boss_bounties',
  'battle_pass',
  'content_study_advanced',
  'quiz_review_mode',
  'seasonal_features',
  'advanced_settings',
];

const DISABLED_FEATURES: FeatureKey[] = [
  'rivals',
  'rankings',
  'wagers',
  'gems_prominent',
];

export function buildFeatureAccess(inputs: FeatureAccessInputs): {
  features: FeatureAccessMap;
  productTier: ProductTier;
  stage: UserExperienceStage;
} {
  const stage = getStage(inputs.totalCompletedSessions);
  const productTier = getProductTier(stage);
  const unlocked = new Set<FeatureKey>(CORE_FEATURES);

  if (productTier !== 'CORE') {
    SECONDARY_FEATURES.forEach((feature) => unlocked.add(feature));
  }
  if (productTier === 'EXPANSION') {
    EXPANSION_FEATURES.forEach((feature) => unlocked.add(feature));
  }

  const accessFor = (feature: FeatureKey): FeatureAccess => ({
    ...LOCKED_COPY,
    isUnlocked: unlocked.has(feature),
    isVisible: !DISABLED_FEATURES.includes(feature),
  });

  const features: FeatureAccessMap = {
    achievements: accessFor('achievements'),
    advanced_settings: accessFor('advanced_settings'),
    ai_coach_advanced: accessFor('ai_coach_advanced'),
    ai_coach_basic: accessFor('ai_coach_basic'),
    battle_pass: accessFor('battle_pass'),
    boss_bounties: accessFor('boss_bounties'),
    boss_tab: accessFor('boss_tab'),
    challenges: accessFor('challenges'),
    companion_detail: accessFor('companion_detail'),
    content_study: accessFor('content_study'),
    content_study_advanced: accessFor('content_study_advanced'),
    economy_advanced: accessFor('economy_advanced'),
    economy_basic: accessFor('economy_basic'),
    focus_session: accessFor('focus_session'),
    focus_tab: accessFor('focus_tab'),
    gems_prominent: accessFor('gems_prominent'),
    home_tab: accessFor('home_tab'),
    inventory: accessFor('inventory'),
    premium_paywall: accessFor('premium_paywall'),
    profile_tab: accessFor('profile_tab'),
    progress_view: accessFor('progress_view'),
    quiz_review_mode: accessFor('quiz_review_mode'),
    rankings: accessFor('rankings'),
    rivals: accessFor('rivals'),
    seasonal_features: accessFor('seasonal_features'),
    shop: accessFor('shop'),
    social_tab: accessFor('social_tab'),
    squads: accessFor('squads'),
    streak_insurance: accessFor('streak_insurance'),
    wagers: accessFor('wagers'),
  };

  return { features, productTier, stage };
}
